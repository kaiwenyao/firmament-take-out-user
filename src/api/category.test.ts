import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("./request", () => ({
  default: {
    get: vi.fn(),
  },
}));

import request from "./request";
import { getCategoryListAPI } from "./category";

const mockGet = vi.mocked(request.get);

afterEach(() => {
  vi.clearAllMocks();
});

describe("category API", () => {
  it("GETs the category list with the query params", async () => {
    const params = { type: 1 };
    const resp = { code: 1, msg: "success", data: [] };
    mockGet.mockResolvedValue(resp);

    const result = await getCategoryListAPI(params);

    expect(mockGet).toHaveBeenCalledWith("/category/list", { params });
    expect(result).toEqual(resp);
  });

  it("GETs the category list without params when none are given", async () => {
    mockGet.mockResolvedValue({ code: 1, msg: "success", data: [] });

    await getCategoryListAPI();

    expect(mockGet).toHaveBeenCalledWith("/category/list", { params: undefined });
  });
});
