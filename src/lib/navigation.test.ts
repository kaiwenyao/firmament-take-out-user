import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
}));

vi.mock("@/router", () => ({
  default: {
    navigate: (...args: unknown[]) => mocks.mockNavigate(...args),
  },
}));

import { triggerNavigation } from "./navigation";

beforeEach(() => {
  mocks.mockNavigate.mockClear();
});

describe("triggerNavigation", () => {
  it("navigates to the given path without replace by default", () => {
    triggerNavigation("/login");
    expect(mocks.mockNavigate).toHaveBeenCalledWith("/login", { replace: false });
  });

  it("navigates with replace when requested", () => {
    triggerNavigation("/login", true);
    expect(mocks.mockNavigate).toHaveBeenCalledWith("/login", { replace: true });
  });
});
