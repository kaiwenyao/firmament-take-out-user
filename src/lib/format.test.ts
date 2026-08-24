import { describe, expect, it } from "vitest";
import { maskPhone, maskIdNumber } from "./format";

describe("maskPhone", () => {
  it("masks the middle 4 digits of an 11-digit phone", () => {
    expect(maskPhone("13812345678")).toBe("138****5678");
  });

  it("returns the input unchanged when it is not an 11-digit string", () => {
    expect(maskPhone("")).toBe("");
    expect(maskPhone("138")).toBe("138");
    expect(maskPhone("138123456789")).toBe("138123456789");
    expect(maskPhone(undefined as unknown as string)).toBe(undefined);
    expect(maskPhone(null as unknown as string)).toBe(null);
  });
});

describe("maskIdNumber", () => {
  it("masks the middle of a long ID number", () => {
    expect(maskIdNumber("110101199003074233")).toBe("110101********4233");
  });

  it("returns the input unchanged when it is shorter than 10 chars", () => {
    expect(maskIdNumber("")).toBe("");
    expect(maskIdNumber("123456789")).toBe("123456789");
    expect(maskIdNumber(undefined as unknown as string)).toBe(undefined);
  });

  it("masks exactly 10-char inputs with no middle mask", () => {
    expect(maskIdNumber("1234567890")).toBe("1234567890");
  });
});
