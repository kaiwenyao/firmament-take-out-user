import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mocks = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockSearchParams: new URLSearchParams(),
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => mocks.mockNavigate,
  useSearchParams: () => [mocks.mockSearchParams],
}));

import Success from "./index";

beforeEach(() => {
  mocks.mockNavigate.mockClear();
  mocks.mockSearchParams = new URLSearchParams();
});

describe("Success page", () => {
  it("renders the success result and navigation buttons", () => {
    render(<Success />);
    expect(screen.getAllByText("Payment Successful").length).toBeGreaterThan(0);
    expect(screen.getByText("Back to Home")).toBeInTheDocument();
  });

  it("disables View Order when there is no orderNumber", () => {
    render(<Success />);
    const viewBtn = screen.getByRole("button", { name: /view order/i });
    expect(viewBtn).toBeDisabled();
  });

  it("shows the order number when present", () => {
    mocks.mockSearchParams = new URLSearchParams({ orderNumber: "SO-001" });
    render(<Success />);
    expect(screen.getByText(/Order #: SO-001/)).toBeInTheDocument();
  });

  it("navigates home when Back to Home is clicked", async () => {
    const user = userEvent.setup();
    render(<Success />);
    await user.click(screen.getByRole("button", { name: /back to home/i }));
    expect(mocks.mockNavigate).toHaveBeenCalledWith("/home");
  });

  it("navigates to the order detail when View Order is clicked", async () => {
    mocks.mockSearchParams = new URLSearchParams({ orderNumber: "SO-002" });
    const user = userEvent.setup();
    render(<Success />);
    await user.click(screen.getByRole("button", { name: /view order/i }));
    expect(mocks.mockNavigate).toHaveBeenCalledWith("/order/detail/SO-002");
  });
});
