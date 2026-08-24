import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("./request", () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  },
}));

import request from "./request";
import {
  addShoppingCartAPI,
  subShoppingCartAPI,
  getShoppingCartAPI,
  delShoppingCartAPI,
} from "./shoppingCart";

const mockPost = vi.mocked(request.post);
const mockGet = vi.mocked(request.get);
const mockDelete = vi.mocked(request.delete);

afterEach(() => {
  vi.clearAllMocks();
});

describe("shoppingCart API", () => {
  it("addShoppingCartAPI posts the add payload", async () => {
    const params = { dishId: "d1", dishFlavor: "spicy" };
    const resp = { code: 1, msg: "success", data: null };
    mockPost.mockResolvedValue(resp);

    const result = await addShoppingCartAPI(params);

    expect(mockPost).toHaveBeenCalledWith("/shoppingCart/add", params);
    expect(result).toEqual(resp);
  });

  it("subShoppingCartAPI posts the subtract payload", async () => {
    const params = { setmealId: "s1" };
    mockPost.mockResolvedValue({ code: 1, msg: "success" });

    await subShoppingCartAPI(params);

    expect(mockPost).toHaveBeenCalledWith("/shoppingCart/sub", params);
  });

  it("getShoppingCartAPI GETs the cart list", async () => {
    const resp = { code: 1, msg: "success", data: [] };
    mockGet.mockResolvedValue(resp);

    const result = await getShoppingCartAPI();

    expect(mockGet).toHaveBeenCalledWith("/shoppingCart/list");
    expect(result).toEqual(resp);
  });

  it("delShoppingCartAPI DELETEs the cart clean endpoint", async () => {
    mockDelete.mockResolvedValue({ code: 1, msg: "success" });

    await delShoppingCartAPI();

    expect(mockDelete).toHaveBeenCalledWith("/shoppingCart/clean");
  });
});
