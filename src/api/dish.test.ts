import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("./request", () => ({
  default: {
    get: vi.fn(),
  },
}));

import request from "./request";
import { dishListByCategoryIdAPI } from "./dish";

const mockGet = vi.mocked(request.get);

afterEach(() => {
  vi.clearAllMocks();
});

describe("dish API", () => {
  it("GETs the dish list with the query params", async () => {
    const params = { categoryId: "cat-1" };
    const resp = { code: 1, msg: "success", data: [] };
    mockGet.mockResolvedValue(resp);

    const result = await dishListByCategoryIdAPI(params);

    expect(mockGet).toHaveBeenCalledWith("/dish/list", { params });
    expect(result).toEqual(resp);
  });
});
