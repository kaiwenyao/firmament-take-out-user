import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("./request", () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

import request from "./request";
import { userLoginAPI, getUserInfoAPI } from "./auth";

const mockPost = vi.mocked(request.post);
const mockGet = vi.mocked(request.get);

afterEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe("auth API", () => {
  it("userLoginAPI posts login credentials", async () => {
    const params = { phone: "13812345678", password: "123456" };
    const resp = { code: 1, msg: "success", data: { id: "1", token: "tok" } };
    mockPost.mockResolvedValue(resp);

    const result = await userLoginAPI(params);

    expect(mockPost).toHaveBeenCalledWith("/user/phoneLogin", params);
    expect(result).toEqual(resp);
  });

  it("getUserInfoAPI GETs the current user info", async () => {
    const resp = { code: 1, msg: "success", data: { id: "1", phone: "138" } };
    mockGet.mockResolvedValue(resp);

    const result = await getUserInfoAPI();

    expect(mockGet).toHaveBeenCalledWith("/user/info");
    expect(result).toEqual(resp);
  });
});
