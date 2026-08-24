import { describe, expect, it } from "vitest";
import { getErrorMessage } from "./error";

describe("getErrorMessage", () => {
  it("returns the string error directly", () => {
    expect(getErrorMessage("server says no")).toBe("server says no");
  });

  it("returns the message of an Error instance", () => {
    expect(getErrorMessage(new Error("boom"))).toBe("boom");
  });

  it("returns the message field of an arbitrary object when it is a string", () => {
    expect(getErrorMessage({ message: "object msg" })).toBe("object msg");
  });

  it("ignores a non-string message field on an object", () => {
    expect(getErrorMessage({ message: 42 })).toBe("Operation failed");
  });

  it("falls back to the default message for unknown error shapes", () => {
    expect(getErrorMessage(undefined)).toBe("Operation failed");
    expect(getErrorMessage(null)).toBe("Operation failed");
    expect(getErrorMessage(123)).toBe("Operation failed");
    expect(getErrorMessage({})).toBe("Operation failed");
  });

  it("uses the provided fallback message", () => {
    expect(getErrorMessage(undefined, "Custom fallback")).toBe("Custom fallback");
    expect(getErrorMessage(null, "Custom fallback")).toBe("Custom fallback");
  });
});
