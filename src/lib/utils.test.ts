import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn (class merge helper)", () => {
  it("merges class names from multiple arguments", () => {
    expect(cn("a", "b", "c")).toBe("a b c");
  });

  it("handles conditional values (falsy values are ignored)", () => {
    const falsy = false;
    expect(cn("a", falsy && "b", undefined, null, "c")).toBe("a c");
  });

  it("handles empty / no arguments", () => {
    expect(cn()).toBe("");
    expect(cn(null, undefined, false, "", 0)).toBe("");
  });

  it("merges tailwind classes, resolving conflicts", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("handles class-variance strings", () => {
    expect(cn("bg-red-500", "hover:bg-red-600")).toBe("bg-red-500 hover:bg-red-600");
  });
});
