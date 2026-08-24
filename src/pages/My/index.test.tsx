import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mocks = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockGet: vi.fn(),
  mockPost: vi.fn(),
  mockDelete: vi.fn(),
  mockToastError: vi.fn(),
  mockToastSuccess: vi.fn(),
}));
const { mockNavigate, mockGet, mockPost, mockDelete, mockToastError, mockToastSuccess } = mocks;

vi.mock("react-router-dom", () => ({
  useNavigate: () => mocks.mockNavigate,
}));

vi.mock("@/api/request", () => ({
  default: {
    get: (...a: unknown[]) => mocks.mockGet(...a),
    post: (...a: unknown[]) => mocks.mockPost(...a),
    put: vi.fn(),
    delete: (...a: unknown[]) => mocks.mockDelete(...a),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    error: (...a: unknown[]) => mocks.mockToastError(...a),
    success: (...a: unknown[]) => mocks.mockToastSuccess(...a),
  },
}));

import My from "./index";

const makeOrder = (number: string, status: number, amount = 10) => ({
  id: number,
  number,
  status,
  userId: "u1",
  addressBookId: "a1",
  orderTime: "2024-01-01 10:00",
  checkoutTime: "",
  payMethod: 1,
  amount,
  phone: "138",
  address: "addr",
  userName: "Bob",
  consignee: "Bob",
  orderDetailList: [],
});

const mockOrderPage = (records: unknown[]) =>
  mockGet.mockResolvedValue({
    code: 1,
    msg: "success",
    data: { records, total: records.length },
  });

beforeEach(() => {
  mockNavigate.mockClear();
  mockGet.mockReset();
  mockPost.mockReset();
  mockDelete.mockReset();
  mockToastError.mockClear();
  mockToastSuccess.mockClear();
  localStorage.clear();
});

describe("My page", () => {
  it("redirects to login when there is no token", async () => {
    render(<My />);
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/login", { replace: true }));
  });

  it("renders user info and orders when logged in", async () => {
    localStorage.setItem("token", "tok");
    mockGet.mockImplementation((url: string) => {
      if (url === "/user/info") {
        return Promise.resolve({ code: 1, msg: "success", data: { id: "1", phone: "13812345678", name: "Bob" } });
      }
      return Promise.resolve({ code: 1, msg: "success", data: { records: [makeOrder("O1", 5)], total: 1 } });
    });
    render(<My />);
    await waitFor(() => expect(screen.getByText("Bob")).toBeInTheDocument());
    // phone masked
    expect(screen.getByText("138****5678")).toBeInTheDocument();
    expect(screen.getByText(/Order #: O1/)).toBeInTheDocument();
  });

  it("shows empty order state", async () => {
    localStorage.setItem("token", "tok");
    mockGet.mockImplementation((url: string) => {
      if (url === "/user/info") return Promise.resolve({ code: 1, msg: "success", data: { id: "1", phone: "138" } });
      return Promise.resolve({ code: 1, msg: "success", data: { records: [], total: 0 } });
    });
    render(<My />);
    await waitFor(() => expect(screen.getByText(/No orders yet/)).toBeInTheDocument());
  });

  it("logs out and navigates to login", async () => {
    localStorage.setItem("token", "tok");
    mockOrderPage([]);
    const user = userEvent.setup();
    render(<My />);
    await waitFor(() => expect(screen.getByText("Sign Out")).toBeInTheDocument());
    await user.click(screen.getByText("Sign Out"));
    expect(localStorage.getItem("token")).toBeNull();
    expect(mockToastSuccess).toHaveBeenCalledWith("Signed out");
    expect(mockNavigate).toHaveBeenCalledWith("/login", { replace: true });
  });

  it("navigates to manage addresses", async () => {
    localStorage.setItem("token", "tok");
    mockOrderPage([]);
    const user = userEvent.setup();
    render(<My />);
    await waitFor(() => expect(screen.getByText("Manage Addresses")).toBeInTheDocument());
    await user.click(screen.getByText("Manage Addresses"));
    expect(mockNavigate).toHaveBeenCalledWith("/address");
  });

  it("pays a pending order", async () => {
    localStorage.setItem("token", "tok");
    mockOrderPage([makeOrder("O1", 1)]);
    const user = userEvent.setup();
    render(<My />);
    await waitFor(() => expect(screen.getByRole("button", { name: /pay now/i })).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /pay now/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/pay?orderNumber=O1");
  });

  it("reorders a completed order", async () => {
    localStorage.setItem("token", "tok");
    mockOrderPage([makeOrder("O1", 5)]);
    mockDelete.mockResolvedValue({ code: 1 });
    mockPost.mockResolvedValue({ code: 1 });
    const user = userEvent.setup();
    render(<My />);
    await waitFor(() => expect(screen.getByRole("button", { name: /reorder/i })).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /reorder/i }));
    await waitFor(() => expect(mockDelete).toHaveBeenCalledWith("/shoppingCart/clean"));
    expect(mockPost).toHaveBeenCalledWith("/order/repetition/number/O1");
    expect(mockNavigate).toHaveBeenCalledWith("/home");
  });

  it("sends a rush order", async () => {
    localStorage.setItem("token", "tok");
    mockOrderPage([makeOrder("O1", 2)]);
    const user = userEvent.setup();
    render(<My />);
    await waitFor(() => expect(screen.getByRole("button", { name: /rush order/i })).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /rush order/i }));
    await waitFor(() => expect(mockGet).toHaveBeenCalledWith("/order/reminder/number/O1"));
    expect(mockToastSuccess).toHaveBeenCalledWith("Rush order sent");
  });

  it("navigates to order history", async () => {
    localStorage.setItem("token", "tok");
    mockOrderPage([]);
    const user = userEvent.setup();
    render(<My />);
    await waitFor(() => expect(screen.getByText("Order History")).toBeInTheDocument());
    await user.click(screen.getByText("Order History"));
    expect(mockNavigate).toHaveBeenCalledWith("/history-order");
  });

  it("shows an error when loading user info fails", async () => {
    localStorage.setItem("token", "tok");
    mockGet.mockImplementation((url: string) => {
      if (url === "/user/info") return Promise.resolve({ code: 0, msg: "Not authorized" });
      return Promise.resolve({ code: 1, msg: "success", data: { records: [], total: 0 } });
    });
    render(<My />);
    await waitFor(() => expect(mockToastError).toHaveBeenCalledWith("Not authorized"));
    expect(screen.getByText("User")).toBeInTheDocument();
  });

  it("renders all order status texts", async () => {
    localStorage.setItem("token", "tok");
    const statuses = [1, 2, 3, 4, 5, 6, 7];
    mockOrderPage(statuses.map((s) => makeOrder(`O${s}`, s)));
    render(<My />);
    await waitFor(() => expect(screen.getByText(/Order #: O1/)).toBeInTheDocument());
    expect(screen.getByText("Pending Payment")).toBeInTheDocument();
    expect(screen.getByText("Awaiting Acceptance")).toBeInTheDocument();
    expect(screen.getByText("Accepted")).toBeInTheDocument();
    expect(screen.getByText("In Delivery")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
    expect(screen.getByText("Cancelled")).toBeInTheDocument();
    expect(screen.getByText("Refunded")).toBeInTheDocument();
  });

  it("shows an error when reordering fails", async () => {
    localStorage.setItem("token", "tok");
    mockOrderPage([makeOrder("O1", 5)]);
    mockDelete.mockResolvedValue({ code: 1 });
    mockPost.mockRejectedValue(new Error("fail"));
    const user = userEvent.setup();
    render(<My />);
    await waitFor(() => expect(screen.getByRole("button", { name: /reorder/i })).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /reorder/i }));
    await waitFor(() => expect(mockToastError).toHaveBeenCalledWith("fail"));
  });

  it("shows an error when sending a rush order fails", async () => {
    localStorage.setItem("token", "tok");
    mockOrderPage([makeOrder("O1", 2)]);
    mockGet.mockImplementation((url: string) => {
      if (url === "/user/info") return Promise.resolve({ code: 1, msg: "success", data: { id: "1" } });
      if (url === "/order/historyOrders") return Promise.resolve({ code: 1, msg: "success", data: { records: [makeOrder("O1", 2)], total: 1 } });
      return Promise.reject(new Error("rush failed"));
    });
    const user = userEvent.setup();
    render(<My />);
    await waitFor(() => expect(screen.getByRole("button", { name: /rush order/i })).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /rush order/i }));
    await waitFor(() => expect(mockToastError).toHaveBeenCalledWith("rush failed"));
  });

  it("navigates to order detail when a card is clicked", async () => {
    localStorage.setItem("token", "tok");
    mockOrderPage([makeOrder("O1", 3)]);
    const user = userEvent.setup();
    render(<My />);
    await waitFor(() => expect(screen.getByText(/Order #: O1/)).toBeInTheDocument());
    await user.click(screen.getByText(/Order #: O1/));
    expect(mockNavigate).toHaveBeenCalledWith("/order/detail/O1");
  });
});
