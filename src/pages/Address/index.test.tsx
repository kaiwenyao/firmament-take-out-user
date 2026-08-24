import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mocks = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockGet: vi.fn(),
  mockDelete: vi.fn(),
  mockPut: vi.fn(),
  mockToastError: vi.fn(),
  mockToastSuccess: vi.fn(),
}));
const { mockNavigate, mockGet, mockDelete, mockPut, mockToastError, mockToastSuccess } = mocks;

vi.mock("react-router-dom", () => ({
  useNavigate: () => mocks.mockNavigate,
}));

vi.mock("@/api/request", () => ({
  default: {
    get: (...a: unknown[]) => mocks.mockGet(...a),
    post: vi.fn(),
    put: (...a: unknown[]) => mocks.mockPut(...a),
    delete: (...a: unknown[]) => mocks.mockDelete(...a),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    error: (...a: unknown[]) => mocks.mockToastError(...a),
    success: (...a: unknown[]) => mocks.mockToastSuccess(...a),
  },
}));

import AddressPage from "./index";

const addressList = [
  {
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
  },
  {
    id: "a2",
    userId: "u1",
    consignee: "Alice",
    phone: "13912345678",
    sex: "1",
    provinceCode: "11",
    provinceName: "Beijing",
    cityCode: "1101",
    cityName: "Beijing",
    districtCode: "110101",
    districtName: "Dongcheng",
    detail: "No.2 Street",
    label: "Office",
    isDefault: 0,
  },
];

beforeEach(() => {
  mockNavigate.mockClear();
  mockGet.mockReset();
  mockDelete.mockReset();
  mockPut.mockReset();
  mockToastError.mockClear();
  mockToastSuccess.mockClear();
});

describe("Address page", () => {
  it("shows an empty state when there are no addresses", async () => {
    mockGet.mockResolvedValue({ code: 1, msg: "success", data: [] });
    render(<AddressPage />);
    await waitFor(() => expect(screen.getByText(/No addresses yet/)).toBeInTheDocument());
    expect(mockGet).toHaveBeenCalledWith("/addressBook/list");
  });

  it("renders the address list", async () => {
    mockGet.mockResolvedValue({ code: 1, msg: "success", data: addressList });
    render(<AddressPage />);
    await waitFor(() => expect(screen.getByText("Bob")).toBeInTheDocument());
    expect(screen.getByText("Alice")).toBeInTheDocument();
    // Default badge only for the default address
    expect(screen.getAllByText("Default").length).toBe(1);
  });

  it("shows an error toast when loading fails", async () => {
    mockGet.mockRejectedValue(new Error("failed"));
    render(<AddressPage />);
    await waitFor(() => expect(mockToastError).toHaveBeenCalledWith("failed"));
  });

  it("navigates to edit when Edit is clicked", async () => {
    mockGet.mockResolvedValue({ code: 1, msg: "success", data: addressList });
    const user = userEvent.setup();
    render(<AddressPage />);
    await waitFor(() => expect(screen.getByText("Bob")).toBeInTheDocument());
    await user.click(screen.getAllByRole("button", { name: /edit/i })[0]);
    expect(mockNavigate).toHaveBeenCalledWith("/address/edit/a1");
  });

  it("navigates to add when Add Address is clicked", async () => {
    mockGet.mockResolvedValue({ code: 1, msg: "success", data: [] });
    const user = userEvent.setup();
    render(<AddressPage />);
    await waitFor(() => expect(screen.getByText(/No addresses yet/)).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /add address/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/address/add");
  });

  it("deletes an address after confirming the dialog", async () => {
    mockGet.mockResolvedValue({ code: 1, msg: "success", data: addressList });
    mockDelete.mockResolvedValue({ code: 1, msg: "success" });
    const user = userEvent.setup();
    render(<AddressPage />);
    await waitFor(() => expect(screen.getByText("Bob")).toBeInTheDocument());
    await user.click(screen.getAllByRole("button", { name: /delete/i })[0]);
    // confirm the delete dialog via its rendered action button
    await waitFor(() =>
      expect(document.querySelector(".adm-dialog-button")).toBeTruthy()
    );
    const dialogButtons = Array.from(
      document.querySelectorAll(".adm-dialog-button")
    );
    fireEvent.click(dialogButtons[dialogButtons.length - 1]);
    await waitFor(() => expect(mockDelete).toHaveBeenCalledWith("/addressBook", { params: { id: "a1" } }));
    expect(mockToastSuccess).toHaveBeenCalledWith("Deleted successfully");
  });

  it("sets a default address", async () => {
    mockGet.mockResolvedValue({ code: 1, msg: "success", data: addressList });
    mockPut.mockResolvedValue({ code: 1, msg: "success" });
    const user = userEvent.setup();
    render(<AddressPage />);
    await waitFor(() => expect(screen.getByText("Alice")).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /set as default/i }));
    await waitFor(() => expect(mockPut).toHaveBeenCalledWith("/addressBook/default", { id: "a2" }));
    expect(mockToastSuccess).toHaveBeenCalledWith("Updated successfully");
  });

  it("shows an error when deleting an address fails", async () => {
    mockGet.mockResolvedValue({ code: 1, msg: "success", data: addressList });
    mockDelete.mockRejectedValue(new Error("delete fail"));
    const user = userEvent.setup();
    render(<AddressPage />);
    await waitFor(() => expect(screen.getByText("Bob")).toBeInTheDocument());
    await user.click(screen.getAllByRole("button", { name: /delete/i })[0]);
    await waitFor(() => expect(document.querySelector(".adm-dialog-button")).toBeTruthy());
    const dialogButtons = Array.from(document.querySelectorAll(".adm-dialog-button"));
    fireEvent.click(dialogButtons[dialogButtons.length - 1]);
    await waitFor(() => expect(mockToastError).toHaveBeenCalledWith("delete fail"));
  });

  it("shows an error when setting default fails", async () => {
    mockGet.mockResolvedValue({ code: 1, msg: "success", data: addressList });
    mockPut.mockRejectedValue(new Error("default fail"));
    const user = userEvent.setup();
    render(<AddressPage />);
    await waitFor(() => expect(screen.getByText("Alice")).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /set as default/i }));
    await waitFor(() => expect(mockToastError).toHaveBeenCalledWith("default fail"));
  });

  it("cancels the delete dialog without deleting", async () => {
    mockGet.mockResolvedValue({ code: 1, msg: "success", data: addressList });
    mockDelete.mockResolvedValue({ code: 1, msg: "success" });
    const user = userEvent.setup();
    render(<AddressPage />);
    await waitFor(() => expect(screen.getByText("Bob")).toBeInTheDocument());
    await user.click(screen.getAllByRole("button", { name: /delete/i })[0]);
    await waitFor(() => expect(document.querySelector(".adm-dialog-button")).toBeTruthy());
    const dialogButtons = Array.from(document.querySelectorAll(".adm-dialog-button"));
    fireEvent.click(dialogButtons[0]);
    expect(mockDelete).not.toHaveBeenCalled();
    expect(mockToastError).not.toHaveBeenCalled();
  });

  it("does not render the list when the list API returns no data", async () => {
    mockGet.mockResolvedValue({ code: 1, msg: "success", data: null });
    render(<AddressPage />);
    await waitFor(() => expect(screen.getByText("No addresses yet, add one now")).toBeInTheDocument());
  });
});
