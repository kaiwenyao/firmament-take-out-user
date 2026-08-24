import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("./request", () => ({
  default: {
    post: vi.fn(),
    put: vi.fn(),
    get: vi.fn(),
  },
}));

import request from "./request";
import {
  submitOrderAPI,
  paymentOrderAPI,
  getOrderPageAPI,
  repetitionOrderAPI,
  reminderOrderAPI,
  getOrderDetailAPI,
  cancelOrderAPI,
} from "./order";

const mockPost = vi.mocked(request.post);
const mockPut = vi.mocked(request.put);
const mockGet = vi.mocked(request.get);

afterEach(() => {
  vi.clearAllMocks();
});

describe("order API", () => {
  it("submitOrderAPI posts the order", async () => {
    const params = {
      addressBookId: "addr-1",
      payMethod: 1,
      deliveryStatus: 1,
      tablewareStatus: 1,
      tablewareNumber: 0,
      packAmount: 0,
      amount: 12.5,
    };
    mockPost.mockResolvedValue({ code: 1, msg: "success" });

    await submitOrderAPI(params);

    expect(mockPost).toHaveBeenCalledWith("/order/submit", params);
  });

  it("paymentOrderAPI PUTs the payment", async () => {
    const params = { orderNumber: "n1", payMethod: 1 };
    mockPut.mockResolvedValue({ code: 1, msg: "success" });

    await paymentOrderAPI(params);

    expect(mockPut).toHaveBeenCalledWith("/order/payment", params);
  });

  it("getOrderPageAPI GETs the order page with params", async () => {
    const params = { page: 1, pageSize: 10 };
    mockGet.mockResolvedValue({ code: 1, msg: "success", data: { records: [], total: 0 } });

    await getOrderPageAPI(params);

    expect(mockGet).toHaveBeenCalledWith("/order/historyOrders", { params });
  });

  it("repetitionOrderAPI POSTs the reorder endpoint", async () => {
    mockPost.mockResolvedValue({ code: 1, msg: "success" });

    await repetitionOrderAPI("ord-1");

    expect(mockPost).toHaveBeenCalledWith("/order/repetition/number/ord-1");
  });

  it("reminderOrderAPI GETs the reminder endpoint", async () => {
    mockGet.mockResolvedValue({ code: 1, msg: "success" });

    await reminderOrderAPI("ord-2");

    expect(mockGet).toHaveBeenCalledWith("/order/reminder/number/ord-2");
  });

  it("getOrderDetailAPI GETs the order detail", async () => {
    mockGet.mockResolvedValue({ code: 1, msg: "success", data: null });

    await getOrderDetailAPI("ord-3");

    expect(mockGet).toHaveBeenCalledWith("/order/orderDetail/number/ord-3");
  });

  it("cancelOrderAPI PUTs the cancel endpoint", async () => {
    mockPut.mockResolvedValue({ code: 1, msg: "success" });

    await cancelOrderAPI("ord-4");

    expect(mockPut).toHaveBeenCalledWith("/order/cancel/number/ord-4");
  });
});
