import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mocks = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockGet: vi.fn(),
  mockPut: vi.fn(),
  mockToastError: vi.fn(),
  mockToastSuccess: vi.fn(),
  params: new URLSearchParams(),
}));
const { mockNavigate, mockGet, mockPut, mockToastError, mockToastSuccess } = mocks;

vi.mock("react-router-dom", () => ({
  useNavigate: () => mocks.mockNavigate,
  useSearchParams: () => [mocks.params],
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

import Pay from "./index";

const sampleOrder = {
  id: "1",
  number: "ORD1",
  status: 1,
  userId: "u1",
  addressBookId: "a1",
  orderTime: "2024-01-01",
  checkoutTime: "",
  payMethod: 1,
  amount: 25.5,
  phone: "138",
  address: "addr",
  userName: "Bob",
  consignee: "Bob",
  orderDetailList: [],
};

beforeEach(() => {
  mocks.params = new URLSearchParams({ orderNumber: "ORD1" });
  mockNavigate.mockClear();
  mockGet.mockReset();
  mockPut.mockReset();
  mockToastError.mockClear();
  mockToastSuccess.mockClear();
});

describe("Pay page", () => {
  it("shows an error and navigates back when there is no order number", async () => {
    mocks.params = new URLSearchParams();
    render(<Pay />);
    await waitFor(() => expect(mockToastError).toHaveBeenCalledWith("Order not found"));
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it("navigates back when the order does not exist", async () => {
    mockGet.mockResolvedValue({ code: 0, msg: "Order does not exist", data: null });
    render(<Pay />);
    await waitFor(() => expect(mockToastError).toHaveBeenCalledWith("Order does not exist"));
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it("renders order info and payment method for a pending order", async () => {
    mockGet.mockResolvedValue({ code: 1, msg: "success", data: sampleOrder });
    render(<Pay />);
    await waitFor(() => expect(screen.getAllByText(/WeChat Pay/).length).toBeGreaterThan(0));
    expect(screen.getAllByText(/25.50/).length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: /pay now/i })).toBeInTheDocument();
  });

  it("pays successfully and redirects to the success page", async () => {
    mockGet.mockResolvedValue({ code: 1, msg: "success", data: sampleOrder });
    mockPut.mockResolvedValue({ code: 1, msg: "success", data: {} });
    const user = userEvent.setup();
    render(<Pay />);
    await waitFor(() => expect(screen.getAllByRole("button", { name: /pay now/i }).length).toBeGreaterThan(0));
    await user.click(screen.getAllByRole("button", { name: /pay now/i })[0]);
    await waitFor(() =>
      expect(mockPut).toHaveBeenCalledWith("/order/payment", { orderNumber: "ORD1", payMethod: 1 })
    );
    expect(mockToastSuccess).toHaveBeenCalledWith("Payment successful");
    // After success a 1000ms timer redirects to /success
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/success?orderNumber=ORD1"), {
      timeout: 3000,
    });
  });

  it("shows an error when payment fails", async () => {
    mockGet.mockResolvedValue({ code: 1, msg: "success", data: sampleOrder });
    mockPut.mockResolvedValue({ code: 0, msg: "insufficient balance", data: null });
    const user = userEvent.setup();
    render(<Pay />);
    await waitFor(() => expect(screen.getByRole("button", { name: /pay now/i })).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /pay now/i }));
    await waitFor(() => expect(mockToastError).toHaveBeenCalledWith("insufficient balance"));
  });

  it("shows an error when payment throws", async () => {
    mockGet.mockResolvedValue({ code: 1, msg: "success", data: sampleOrder });
    mockPut.mockRejectedValue(new Error("net down"));
    const user = userEvent.setup();
    render(<Pay />);
    await waitFor(() => expect(screen.getByRole("button", { name: /pay now/i })).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /pay now/i }));
    await waitFor(() => expect(mockToastError).toHaveBeenCalledWith("net down"));
  });

  it("switches the payment method to Alipay and pays with it", async () => {
    mockGet.mockResolvedValue({ code: 1, msg: "success", data: sampleOrder });
    mockPut.mockResolvedValue({ code: 1, msg: "success", data: {} });
    const user = userEvent.setup();
    render(<Pay />);
    await waitFor(() => expect(screen.getByText(/Alipay/)).toBeInTheDocument());
    await user.click(screen.getByText(/Alipay/));
    await user.click(screen.getByRole("button", { name: /pay now/i }));
    await waitFor(() =>
      expect(mockPut).toHaveBeenCalledWith("/order/payment", { orderNumber: "ORD1", payMethod: 2 })
    );
  });

  it("shows the paid state when the order is not pending", async () => {
    mockGet.mockResolvedValue({ code: 1, msg: "success", data: { ...sampleOrder, status: 5 } });
    render(<Pay />);
    await waitFor(() =>
      expect(screen.getByText("Order has been paid or cancelled")).toBeInTheDocument()
    );
    expect(screen.queryByRole("button", { name: /pay now/i })).not.toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
  });
});
