import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mocks = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockGet: vi.fn(),
  mockPost: vi.fn(),
  mockPut: vi.fn(),
  mockToastError: vi.fn(),
  mockToastSuccess: vi.fn(),
  params: {} as Record<string, string>,
}));
const { mockNavigate, mockGet, mockPost, mockPut, mockToastError, mockToastSuccess } = mocks;

vi.mock("react-router-dom", () => ({
  useNavigate: () => mocks.mockNavigate,
  useParams: () => mocks.params,
}));

vi.mock("@/api/request", () => ({
  default: {
    get: (...a: unknown[]) => mocks.mockGet(...a),
    post: (...a: unknown[]) => mocks.mockPost(...a),
    put: (...a: unknown[]) => mocks.mockPut(...a),
    delete: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    error: (...a: unknown[]) => mocks.mockToastError(...a),
    success: (...a: unknown[]) => mocks.mockToastSuccess(...a),
  },
}));

import AddOrEditAddress from "./index";

const existingAddress = {
  id: "a1",
  userId: "u1",
  consignee: "Bob",
  phone: "13812345678",
  sex: "1",
  provinceCode: "11",
  provinceName: "Beijing",
  cityCode: "1101",
  cityName: "Beijing",
  districtCode: "110101",
  districtName: "Dongcheng",
  detail: "No.1 Street",
  label: "Home",
  isDefault: 1,
};

const fill = async () => {
  const user = userEvent.setup();
  await user.type(screen.getByPlaceholderText("Enter recipient name"), "Carol");
  await user.type(screen.getByPlaceholderText("Enter phone number"), "13712345678");
  await user.type(screen.getByPlaceholderText("Enter address details"), "No.9 Avenue");
  return user;
};

beforeEach(() => {
  mocks.params = {};
  mockNavigate.mockClear();
  mockGet.mockReset();
  mockPost.mockReset();
  mockPut.mockReset();
  mockToastError.mockClear();
  mockToastSuccess.mockClear();
});

describe("AddOrEditAddress page", () => {
  it("renders Add mode title when there is no id", () => {
    render(<AddOrEditAddress />);
    expect(screen.getByText("Add Address")).toBeInTheDocument();
    expect(screen.getByText("Save")).toBeInTheDocument();
  });

  it("renders Edit mode title when an id exists", async () => {
    mocks.params = { id: "a1" };
    mockGet.mockResolvedValue({ code: 1, msg: "success", data: existingAddress });
    render(<AddOrEditAddress />);
    await waitFor(() => expect(screen.getByText("Edit Address")).toBeInTheDocument());
  });

  it("loads and populates address details in edit mode", async () => {
    mocks.params = { id: "a1" };
    mockGet.mockResolvedValue({ code: 1, msg: "success", data: existingAddress });
    render(<AddOrEditAddress />);
    await waitFor(() => expect(screen.getByDisplayValue("Bob")).toBeInTheDocument());
    expect(mockGet).toHaveBeenCalledWith("/addressBook/a1");
  });

  it("shows an error and navigates back when the address is not found", async () => {
    mocks.params = { id: "a1" };
    mockGet.mockResolvedValue({ code: 0, msg: "Address not found", data: null });
    render(<AddOrEditAddress />);
    await waitFor(() => expect(mockToastError).toHaveBeenCalledWith("Address not found"));
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it("adds a new address in add mode", async () => {
    mockPost.mockResolvedValue({ code: 1, msg: "success" });
    render(<AddOrEditAddress />);
    const user = await fill();
    await user.click(screen.getByRole("button", { name: /save/i }));
    await waitFor(() => {
      const call = mockPost.mock.calls[0];
      expect(call[0]).toBe("/addressBook");
      const payload = call[1] as Record<string, unknown>;
      expect(payload.consignee).toBe("Carol");
      expect(payload.phone).toBe("13712345678");
      expect(payload.detail).toBe("No.9 Avenue");
    });
    expect(mockToastSuccess).toHaveBeenCalledWith("Added successfully");
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it("updates an existing address in edit mode", async () => {
    mocks.params = { id: "a1" };
    mockGet.mockResolvedValue({ code: 1, msg: "success", data: existingAddress });
    mockPut.mockResolvedValue({ code: 1, msg: "success" });
    const user = userEvent.setup();
    render(<AddOrEditAddress />);
    await waitFor(() => expect(screen.getByDisplayValue("Bob")).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /save/i }));
    await waitFor(() => {
      const call = mockPut.mock.calls[0];
      expect(call[0]).toBe("/addressBook");
      const payload = call[1] as Record<string, unknown>;
      expect(payload.id).toBe("a1");
      expect(payload.consignee).toBe("Bob");
    });
    expect(mockToastSuccess).toHaveBeenCalledWith("Updated successfully");
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it("shows a validation error when required fields are empty", async () => {
    render(<AddOrEditAddress />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /save/i }));
    await waitFor(() => expect(mockToastError).toHaveBeenCalled());
    expect(mockPost).not.toHaveBeenCalled();
  });
});
