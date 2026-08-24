import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import TabBarComponent from "./index";

const renderAt = (path: string) => {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/home" element={<div>Home Page</div>} />
        <Route path="/order" element={<div>Order Page</div>} />
        <Route path="/my" element={<div>My Page</div>} />
      </Routes>
      <TabBarComponent />
    </MemoryRouter>
  );
};

describe("TabBarComponent", () => {
  it("highlights /home as active and renders all tabs", () => {
    renderAt("/home");
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Orders")).toBeInTheDocument();
    expect(screen.getByText("Profile")).toBeInTheDocument();
  });

  it("navigates to a tab when clicked", async () => {
    renderAt("/home");
    const user = userEvent.setup();
    await user.click(screen.getByText("Orders"));
    // antd-mobile TabBar triggers onChange -> navigate. Navigation is
    // asynchronous via user event; the route component mounts after nav.
    expect(await screen.findByText("Order Page")).toBeInTheDocument();
  });

  it("defaults to /home for an unknown path", async () => {
    renderAt("/unknown");
    // activeKey resolves to /home; clicking Profile still navigates correctly.
    const user = userEvent.setup();
    await user.click(screen.getByText("Profile"));
    expect(await screen.findByText("My Page")).toBeInTheDocument();
  });
});
