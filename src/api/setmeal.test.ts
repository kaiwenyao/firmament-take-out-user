import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("./request", () => ({
  default: {
    get: vi.fn(),
  },
}));

import request from "./request";
import { getSetmealListByCategoryIdAPI, getSetmealDishListAPI } from "./setmeal";

const mockGet = vi.mocked(request.get);

afterEach(() => {
  vi.clearAllMocks();
});

describe("setmeal API", () => {
  it("getSetmealListByCategoryIdAPI GETs the set meal list with params", async () => {
    const params = { categoryId: "cat-2" };
    const resp = { code: 1, msg: "success", data: [] };
    mockGet.mockResolvedValue(resp);

    const result = await getSetmealListByCategoryIdAPI(params);

    expect(mockGet).toHaveBeenCalledWith("/setmeal/list", { params });
    expect(result).toEqual(resp);
  });

  it("getSetmealDishListAPI GETs the dish list for a set meal id", async () => {
    const resp = { code: 1, msg: "success", data: [] };
    mockGet.mockResolvedValue(resp);

    const result = await getSetmealDishListAPI("meal-9");

    expect(mockGet).toHaveBeenCalledWith("/setmeal/dish/meal-9");
    expect(result).toEqual(resp);
  });
});
