import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mocks = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockGet: vi.fn(),
  mockPut: vi.fn(),
  mockToastError: vi.fn(),
  mockToastSuccess: vi.fn(),
  params: {} as Record<string, string>,
}));
const { mockNavigate, mockGet, mockPut, mockToastError, mockToastSuccess } = mocks;

vi.mock("react-router-dom", () => ({
  useNavigate: () => mocks.mockNavigate,
  useParams: () => mocks.params,
}));

vi.mock("@/api/request", () => ({
  default: {
    get: (...a: unknown[]) => mocks.mockGet(...a),
    post: vi.fn(),
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

import OrderDetail from "./index";

const sampleOrder = {
  id: "1",
  number: "ORD1",
  status: 2,
  userId: "u1",
  addressBookId: "a1",
  orderTime: "2024-01-01 10:00",
  checkoutTime: "2024-01-01 10:01",
  payMethod: 1,
  amount: 36.5,
  phone: "13812345678",
  address: "Somewhere",
  userName: "Bob",
  consignee: "Bob",
  orderDetailList: [
    { id: "d1", name: "Burger", image: "", orderId: "o1", dishId: "x", setmealId: "", dishFlavor: "spicy", number: 2, amount: 18 },
  ],
};

beforeEach(() => {
  mocks.params = { orderNumber: "ORD1" };
  mockNavigate.mockClear();
  mockGet.mockReset();
  mockPut.mockReset();
  mockToastError.mockClear();
  mockToastSuccess.mockClear();
});

describe("OrderDetail page", () => {
  it("shows a loading/empty state before data is loaded", () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    render(<OrderDetail />);
    expect(screen.getByText("Order Details")).toBeInTheDocument();
  });

  it("renders order details once loaded", async () => {
    mockGet.mockResolvedValue({ code: 1, msg: "success", data: sampleOrder });
    render(<OrderDetail />);
    await waitFor(() => {
      expect(screen.getByText("Burger")).toBeInTheDocument();
    });
    expect(screen.getByText("ORD1")).toBeInTheDocument();
    expect(screen.getByText(/¥36.50/)).toBeInTheDocument();
    // status 2 -> Rush Order button
    expect(screen.getByRole("button", { name: /rush order/i })).toBeInTheDocument();
    expect(mockGet).toHaveBeenCalledWith("/order/orderDetail/number/ORD1");
  });

  it("shows empty state when the order is null", async () => {
    mockGet.mockResolvedValue({ code: 1, msg: "success", data: null });
    render(<OrderDetail />);
    await waitFor(() => expect(screen.getByText("No data")).toBeInTheDocument());
  });

  it("shows an error toast when loading fails", async () => {
    mockGet.mockRejectedValue(new Error("boom"));
    render(<OrderDetail />);
    await waitFor(() => expect(mockToastError).toHaveBeenCalledWith("boom"));
  });

  it("shows the payment bar and cancel button for status 1", async () => {
    mockGet.mockResolvedValue({
      code: 1,
      msg: "success",
      data: { ...sampleOrder, status: 1 },
    });
    render(<OrderDetail />);
    await waitFor(() => expect(screen.getByRole("button", { name: /pay now/i })).toBeInTheDocument());
    expect(screen.getByRole("button", { name: /cancel order/i })).toBeInTheDocument();
  });

  it("sends a reminder when Rush Order is clicked", async () => {
    mockGet.mockResolvedValue({ code: 1, msg: "success", data: sampleOrder });
    const user = userEvent.setup();
    render(<OrderDetail />);
    await waitFor(() => expect(screen.getByRole("button", { name: /rush order/i })).toBeInTheDocument());
    mockGet.mockClear();
    await user.click(screen.getByRole("button", { name: /rush order/i }));
    await waitFor(() => expect(mockGet).toHaveBeenCalledWith("/order/reminder/number/ORD1"));
    expect(mockToastSuccess).toHaveBeenCalledWith("Rush order sent");
  });

  it("cancels an order", async () => {
    mockGet.mockResolvedValue({ code: 1, msg: "success", data: sampleOrder });
    mockPut.mockResolvedValue({ code: 1, msg: "success" });
    const user = userEvent.setup();
    render(<OrderDetail />);
    await waitFor(() => expect(screen.getByRole("button", { name: /cancel order/i })).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /cancel order/i }));
    await waitFor(() => expect(mockPut).toHaveBeenCalledWith("/order/cancel/number/ORD1"));
    expect(mockToastSuccess).toHaveBeenCalledWith("Order cancelled");
    // refetches the order after cancel
    expect(mockGet).toHaveBeenCalledWith("/order/orderDetail/number/ORD1");
  });

  it("shows an error when cancelling fails", async () => {
    mockGet.mockResolvedValue({ code: 1, msg: "success", data: sampleOrder });
    mockPut.mockRejectedValue(new Error("cancel failed"));
    const user = userEvent.setup();
    render(<OrderDetail />);
    await waitFor(() => expect(screen.getByRole("button", { name: /cancel order/i })).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /cancel order/i }));
    await waitFor(() => expect(mockToastError).toHaveBeenCalledWith("cancel failed"));
  });

  it("shows an error when the rush order fails", async () => {
    mockGet.mockResolvedValue({ code: 1, msg: "success", data: sampleOrder });
    const user = userEvent.setup();
    render(<OrderDetail />);
    await waitFor(() => expect(screen.getByRole("button", { name: /rush order/i })).toBeInTheDocument());
    mockGet.mockImplementation((url: string) =>
      url === "/order/reminder/number/ORD1"
        ? Promise.reject(new Error("rush fail"))
        : Promise.resolve({ code: 1, msg: "success", data: sampleOrder })
    );
    await user.click(screen.getByRole("button", { name: /rush order/i }));
    await waitFor(() => expect(mockToastError).toHaveBeenCalledWith("rush fail"));
  });

  it("navigates to payment from the status 1 pay button", async () => {
    mockGet.mockResolvedValue({
      code: 1,
      msg: "success",
      data: { ...sampleOrder, status: 1 },
    });
    const user = userEvent.setup();
    render(<OrderDetail />);
    await waitFor(() => expect(screen.getByRole("button", { name: /pay now/i })).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /pay now/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/pay?orderNumber=ORD1");
  });

  it("renders a completed order with no action buttons", async () => {
    mockGet.mockResolvedValue({
      code: 1,
      msg: "success",
      data: { ...sampleOrder, status: 5 },
    });
    render(<OrderDetail />);
    await waitFor(() => expect(screen.getByText("Completed")).toBeInTheDocument());
    expect(screen.queryByRole("button", { name: /rush order/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /cancel order/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /pay now/i })).not.toBeInTheDocument();
  });

  it("shows Unknown for an unrecognized order status", async () => {
    mockGet.mockResolvedValue({
      code: 1,
      msg: "success",
      data: { ...sampleOrder, status: 99 },
    });
    render(<OrderDetail />);
    await waitFor(() => expect(screen.getByText("Unknown")).toBeInTheDocument());
    expect(screen.queryByRole("button", { name: /rush order/i })).not.toBeInTheDocument();
  });
});
