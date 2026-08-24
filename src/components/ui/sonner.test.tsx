import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Toaster } from "./sonner";

describe("Toaster (sonner wrapper)", () => {
  it("renders the Sonner toaster viewport", () => {
    const { container } = render(<Toaster />);
    // Sonner renders a notification viewport region.
    const viewport = container.querySelector('[aria-live="polite"]');
    expect(viewport).toBeTruthy();
  });

  it("passes through props", () => {
    const { container } = render(<Toaster position="top-right" />);
    expect(container.querySelector('[aria-live="polite"]')).toBeTruthy();
  });
});
