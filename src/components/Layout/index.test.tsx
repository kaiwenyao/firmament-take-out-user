import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Layout from "./index";

// TabBar is rendered by Layout; mock it out to keep this test focused on Layout.
vi.mock("../TabBar", () => ({
  default: () => <div data-testid="tab-bar">TabBar</div>,
}));

const renderAt = (path: string) => {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="home" element={<div>Home Content</div>} />
          <Route path="order" element={<div>Order Content</div>} />
          <Route path="my" element={<div>My Content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
};

beforeEach(() => {
  localStorage.clear();
});

describe("Layout", () => {
  it("redirects to login when no token and not on /home", () => {
    renderAt("/order");
    // Navigate to /login via the effect; the login route is not defined here,
    // so we assert the TabBar is not rendered (Layout returns null).
    expect(screen.queryByTestId("tab-bar")).not.toBeInTheDocument();
  });

  it("renders children and TabBar when a token exists", () => {
    localStorage.setItem("token", "tok");
    renderAt("/order");
    expect(screen.getByText("Order Content")).toBeInTheDocument();
    expect(screen.getByTestId("tab-bar")).toBeInTheDocument();
  });

  it("renders without auth on the /home page", () => {
    renderAt("/home");
    expect(screen.getByText("Home Content")).toBeInTheDocument();
    expect(screen.getByTestId("tab-bar")).toBeInTheDocument();
  });
});
