import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("./request", () => ({
  default: {
    get: vi.fn(),
  },
}));

import request from "./request";
import { getShopInfoAPI } from "./shop";

const mockGet = vi.mocked(request.get);

afterEach(() => {
  vi.clearAllMocks();
});

describe("shop API", () => {
  it("GETs the shop status", async () => {
    const resp = { code: 1, msg: "success", data: 1 };
    mockGet.mockResolvedValue(resp);

    const result = await getShopInfoAPI();

    expect(mockGet).toHaveBeenCalledWith("/shop/status");
    expect(result).toEqual(resp);
  });
});
