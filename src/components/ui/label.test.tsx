import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Label } from "./label";

describe("Label", () => {
  it("renders a label with the given text", () => {
    render(<Label htmlFor="name">Username</Label>);
    const label = screen.getByText("Username");
    expect(label.tagName).toBe("LABEL");
    expect(label).toHaveAttribute("for", "name");
    expect(label.className).toContain("text-sm");
  });
});
