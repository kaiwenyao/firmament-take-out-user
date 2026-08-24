import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
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

import HistoryOrder from "./index";

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

beforeEach(() => {
  mockNavigate.mockClear();
  mockGet.mockReset();
  mockPost.mockReset();
  mockDelete.mockReset();
  mockToastError.mockClear();
  mockToastSuccess.mockClear();
});

describe("HistoryOrder page", () => {
  it("shows an empty state when there are no orders", async () => {
    mockGet.mockResolvedValue({ code: 1, msg: "success", data: { records: [], total: 0 } });
    render(<HistoryOrder />);
    await waitFor(() => expect(screen.getByText(/No orders yet/)).toBeInTheDocument());
    expect(mockGet).toHaveBeenCalledWith("/order/historyOrders", {
      params: { page: 1, pageSize: 10 },
    });
  });

  it("renders the order list", async () => {
    mockGet.mockResolvedValue({
      code: 1,
      msg: "success",
      data: { records: [makeOrder("O1", 5)], total: 1 },
    });
    render(<HistoryOrder />);
    await waitFor(() => expect(screen.getByText(/Order #: O1/)).toBeInTheDocument());
    expect(screen.getByText("Completed")).toBeInTheDocument();
  });

  it("shows the payment button for pending orders (status 1)", async () => {
    mockGet.mockResolvedValue({
      code: 1,
      msg: "success",
      data: { records: [makeOrder("O1", 1)], total: 1 },
    });
    const user = userEvent.setup();
    render(<HistoryOrder />);
    await waitFor(() => expect(screen.getByRole("button", { name: /pay now/i })).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /pay now/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/pay?orderNumber=O1");
  });

  it("reorders a completed order (status 5)", async () => {
    mockGet.mockResolvedValue({
      code: 1,
      msg: "success",
      data: { records: [makeOrder("O1", 5)], total: 1 },
    });
    mockDelete.mockResolvedValue({ code: 1 });
    mockPost.mockResolvedValue({ code: 1 });
    const user = userEvent.setup();
    render(<HistoryOrder />);
    await waitFor(() => expect(screen.getByRole("button", { name: /reorder/i })).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /reorder/i }));
    await waitFor(() => expect(mockDelete).toHaveBeenCalledWith("/shoppingCart/clean"));
    expect(mockPost).toHaveBeenCalledWith("/order/repetition/number/O1");
    expect(mockToastSuccess).toHaveBeenCalledWith("Added to cart");
    expect(mockNavigate).toHaveBeenCalledWith("/home");
  });

  it("sends a rush order for status 2", async () => {
    mockGet.mockResolvedValue({
      code: 1,
      msg: "success",
      data: { records: [makeOrder("O1", 2)], total: 1 },
    });
    const user = userEvent.setup();
    render(<HistoryOrder />);
    await waitFor(() => expect(screen.getByRole("button", { name: /rush order/i })).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /rush order/i }));
    await waitFor(() => expect(mockGet).toHaveBeenCalledWith("/order/reminder/number/O1"));
    expect(mockToastSuccess).toHaveBeenCalledWith("Rush order sent");
  });

  it("shows an error toast when loading orders fails", async () => {
    mockGet.mockRejectedValue(new Error("failed"));
    render(<HistoryOrder />);
    await waitFor(() => expect(mockToastError).toHaveBeenCalledWith("failed"));
  });

  it("navigates to order detail when View Details is clicked", async () => {
    mockGet.mockResolvedValue({
      code: 1,
      msg: "success",
      data: { records: [makeOrder("O1", 3)], total: 1 },
    });
    const user = userEvent.setup();
    render(<HistoryOrder />);
    await waitFor(() => expect(screen.getByRole("button", { name: /view details/i })).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /view details/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/order/detail/O1");
  });

  it("renders all order statuses", async () => {
    const statuses = [1, 2, 3, 4, 5, 6, 7];
    mockGet.mockResolvedValue({
      code: 1,
      msg: "success",
      data: { records: statuses.map((s) => makeOrder(`O${s}`, s)), total: 7 },
    });
    render(<HistoryOrder />);
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
    mockGet.mockResolvedValue({
      code: 1,
      msg: "success",
      data: { records: [makeOrder("O1", 5)], total: 1 },
    });
    mockDelete.mockResolvedValue({ code: 1 });
    mockPost.mockRejectedValue(new Error("fail"));
    const user = userEvent.setup();
    render(<HistoryOrder />);
    await waitFor(() => expect(screen.getByRole("button", { name: /reorder/i })).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /reorder/i }));
    await waitFor(() => expect(mockToastError).toHaveBeenCalledWith("fail"));
  });

  it("shows an error when sending a rush order fails", async () => {
    mockGet.mockImplementation((url: string) => {
      if (url === "/order/historyOrders")
        return Promise.resolve({ code: 1, msg: "success", data: { records: [makeOrder("O1", 2)], total: 1 } });
      return Promise.reject(new Error("rush failed"));
    });
    const user = userEvent.setup();
    render(<HistoryOrder />);
    await waitFor(() => expect(screen.getByRole("button", { name: /rush order/i })).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /rush order/i }));
    await waitFor(() => expect(mockToastError).toHaveBeenCalledWith("rush failed"));
  });

  it("navigates back on the navbar back button", async () => {
    mockGet.mockResolvedValue({
      code: 1,
      msg: "success",
      data: { records: [makeOrder("O1", 3)], total: 1 },
    });
    render(<HistoryOrder />);
    await waitFor(() => expect(screen.getByText(/Order #: O1/)).toBeInTheDocument());
    fireEvent.click(document.querySelector(".adm-nav-bar-back"));
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});
