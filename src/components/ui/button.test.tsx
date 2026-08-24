import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "./button";

describe("Button", () => {
  it("renders a button with children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument();
  });

  it("renders with default variant/size classes", () => {
    render(<Button>Default</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("bg-primary");
    expect(btn.className).toContain("h-9");
  });

  it("applies variant and size classes", () => {
    render(<Button variant="destructive" size="sm">Danger</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("bg-destructive");
    expect(btn.className).toContain("h-8");
  });

  it("renders as a different element when asChild is set", () => {
    render(
      <Button asChild>
        <a href="/foo">Link Button</a>
      </Button>
    );
    const anchor = screen.getByRole("link", { name: /link button/i });
    expect(anchor.tagName).toBe("A");
    expect(anchor.className).toContain("bg-primary");
  });

  it("forwards extra props like onClick", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Hi</Button>);
    const btn = screen.getByRole("button");
    btn.click();
    expect(onClick).toHaveBeenCalled();
  });

  it("applies disabled and stops interactions", () => {
    const onClick = vi.fn();
    render(<Button disabled onClick={onClick}>Hi</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    btn.click();
    expect(onClick).not.toHaveBeenCalled();
  });
});
