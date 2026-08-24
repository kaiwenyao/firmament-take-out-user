import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("react-router-dom", () => ({
  RouterProvider: () => <div data-testid="provider" />,
}));

vi.mock("@/components/ui/sonner", () => ({
  Toaster: () => <div data-testid="toaster" />,
}));

vi.mock("./router", () => ({ default: {} }));

import App from "./App";

describe("App", () => {
  it("renders the RouterProvider and the Toaster", () => {
    render(<App />);
    expect(screen.getByTestId("provider")).toBeInTheDocument();
    expect(screen.getByTestId("toaster")).toBeInTheDocument();
  });
});
