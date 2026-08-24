import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "./input";

describe("Input", () => {
  it("renders an input with default classes", () => {
    render(<Input placeholder="Name" />);
    const input = screen.getByPlaceholderText("Name");
    expect(input.tagName).toBe("INPUT");
    expect(input.className).toContain("h-9");
  });

  it("applies the given type", () => {
    render(<Input type="password" placeholder="Pass" />);
    expect(screen.getByPlaceholderText("Pass")).toHaveAttribute("type", "password");
  });

  it("merges custom className", () => {
    render(<Input className="my-input" />);
    expect(screen.getByRole("textbox").className).toContain("my-input");
  });

  it("forwards onChange and value", async () => {
    const onChange = vi.fn();
    render(<Input placeholder="Type here" onChange={onChange} />);
    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText("Type here"), "abc");
    expect(onChange).toHaveBeenCalled();
  });
});
