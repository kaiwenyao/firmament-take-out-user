import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockState = vi.hoisted(() => {
  const fakeInstance: any = {
    interceptors: {
      request: {
        use: (fn: any) => {
          mockState.requestHandler = fn;
        },
      },
      response: {
        use: (ok: any, err: any) => {
          mockState.responseResolveHandler = ok;
          mockState.responseRejectHandler = err;
        },
      },
    },
  };

  return {
    create: vi.fn(() => fakeInstance),
    requestHandler: undefined as ((c: any) => any) | undefined,
    responseResolveHandler: undefined as ((r: any) => any) | undefined,
    responseRejectHandler: undefined as ((e: any) => any) | undefined,
  };
});

const mockToast = vi.hoisted(() => ({
  error: vi.fn(),
  success: vi.fn(),
}));

const mockNavigation = vi.hoisted(() => ({
  triggerNavigation: vi.fn(),
}));

vi.mock("axios", () => ({
  default: { create: mockState.create },
}));

vi.mock("sonner", () => ({
  toast: mockToast,
}));

vi.mock("@/lib/navigation", () => ({
  triggerNavigation: mockNavigation.triggerNavigation,
}));

import instance from "./request";

beforeEach(() => {
  mockToast.error.mockClear();
  mockToast.success.mockClear();
  mockNavigation.triggerNavigation.mockClear();
  localStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
  localStorage.clear();
});

const getRequestHandler = () => {
  expect(mockState.requestHandler).toBeDefined();
  return mockState.requestHandler!;
};
const getResolve = () => {
  expect(mockState.responseResolveHandler).toBeDefined();
  return mockState.responseResolveHandler!;
};
const getReject = () => {
  expect(mockState.responseRejectHandler).toBeDefined();
  return mockState.responseRejectHandler!;
};

describe("request instance setup", () => {
  it("evaluates the module and creates the axios instance with /api baseURL", () => {
    expect(instance).toBeDefined();
    expect(mockState.create).toHaveBeenCalledWith(
      expect.objectContaining({ baseURL: "/api", timeout: 10000 })
    );
  });

  it("attaches the token from localStorage to the request authentication header", async () => {
    localStorage.setItem("token", "secret-token");
    const config = await getRequestHandler()({ headers: {} });
    expect(config.headers.authentication).toBe("secret-token");
  });

  it("leaves headers unchanged when no token is stored", async () => {
    const config = await getRequestHandler()({ headers: {} });
    expect(config.headers.authentication).toBeUndefined();
  });
});

describe("request response interceptor (success)", () => {
  it("unwraps data when code === 1", () => {
    const result = getResolve()({ data: { code: 1, data: { id: 42 } } });
    expect(result).toEqual({ code: 1, data: { id: 42 } });
  });

  it("unwraps data when code === 200", () => {
    const result = getResolve()({ data: { code: 200, data: { id: 7 } } });
    expect(result).toEqual({ code: 200, data: { id: 7 } });
  });

  it("rejects with the backend msg when code is neither 1 nor 200", () => {
    const result = getResolve()({ data: { code: 0, msg: "Taken" } });
    return expect(result).rejects.toThrow("Taken");
  });

  it("rejects with a generic message when msg is missing", () => {
    const result = getResolve()({ data: { code: 400 } });
    return expect(result).rejects.toThrow("Operation failed");
  });
});

describe("request response interceptor (error)", () => {
  it("handles a non-401 error using its response msg", () => {
    const err = { response: { status: 500, data: { msg: "Server exploded" } } };
    return expect(getReject()(err)).rejects.toThrow("Server exploded");
  });

  it("falls back to error.message when no response msg is available", () => {
    const err = { response: { status: 500, data: {} }, message: "Network error" };
    return expect(getReject()(err)).rejects.toThrow("Network error");
  });

  it("falls back to 'Network error' when nothing is available", () => {
    const err = { response: { status: 500 } };
    return expect(getReject()(err)).rejects.toThrow("Network error");
  });

  it("rejects with 'Please sign in first' on 401 when no token is stored", async () => {
    const err = { response: { status: 401 } };
    await expect(getReject()(err)).rejects.toThrow("Please sign in first");
    expect(mockToast.error).not.toHaveBeenCalled();
  });

  it("clears credentials and redirects to login on 401 with a token", async () => {
    vi.useFakeTimers();
    localStorage.setItem("token", "tok");
    localStorage.setItem("userId", "1");

    const err = { response: { status: 401 } };
    await expect(getReject()(err)).rejects.toThrow(
      "Session expired, please sign in again"
    );

    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("userId")).toBeNull();
    expect(mockToast.error).toHaveBeenCalledWith("Please sign in first");

    vi.advanceTimersByTime(500);
    expect(mockNavigation.triggerNavigation).toHaveBeenCalledWith("/login", true);
  });

  it("does not schedule a redirect when already on /login", async () => {
    vi.useFakeTimers();
    localStorage.setItem("token", "tok");
    window.history.pushState({}, "", "/login");

    const err = { response: { status: 401 } };
    await expect(getReject()(err)).rejects.toThrow(
      "Session expired, please sign in again"
    );

    vi.advanceTimersByTime(500);
    expect(mockNavigation.triggerNavigation).not.toHaveBeenCalled();

    window.history.pushState({}, "", "/");
  });
});
