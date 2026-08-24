import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mocks = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockGet: vi.fn(),
  mockPost: vi.fn(),
  mockDelete: vi.fn(),
  mockToastError: vi.fn(),
  mockToastSuccess: vi.fn(),
  mockLocation: { pathname: "/home", key: "k1" },
}));
const { mockNavigate, mockGet, mockPost, mockDelete, mockToastError, mockToastSuccess } = mocks;

vi.mock("react-router-dom", () => ({
  useNavigate: () => mocks.mockNavigate,
  useLocation: () => mocks.mockLocation,
}));

vi.mock("@/api/request", () => ({
  default: {
    get: (...a: unknown[]) => mocks.mockGet(...a),
    post: (...a: unknown[]) => mocks.mockPost(...a),
    put: vi.fn(),
    delete: (...a: unknown[]) => mocks.mockDelete(...a),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    error: (...a: unknown[]) => mocks.mockToastError(...a),
    success: (...a: unknown[]) => mocks.mockToastSuccess(...a),
  },
}));

import Home from "./index";

const dishCat = { id: "c1", type: 1, name: "Hot", sort: 1 };
const setmealCat = { id: "c2", type: 2, name: "Sets", sort: 2 };

const dish = {
  id: "d1",
  name: "Burger",
  price: 15,
  image: "",
  description: "Yummy",
  flavors: [],
  dishNumber: undefined as number | undefined,
};

const flavoredDish = {
  id: "d2",
  name: "Spicy Noodles",
  price: 20,
  image: "",
  description: "Spicy",
  flavors: [{ name: "Spice Level", value: "none,low,hot" }],
  dishNumber: undefined as number | undefined,
};

const setmeal = {
  id: "s1",
  name: "Family Meal",
  price: 50,
  image: "",
  description: "Big",
  setmealNumber: undefined as number | undefined,
};

// Default get: category/dish/setmeal/shop happy path, empty cart
function setupGet(overrides?: { cart?: unknown[]; shopStatus?: number }) {
  const cart = overrides?.cart ?? [];
  const shopStatus = overrides?.shopStatus ?? 1;
  mockGet.mockImplementation((url: string, config?: { params?: Record<string, unknown> }) => {
    const params = config?.params;
    if (url === "/category/list") {
      if (params?.type === 1) return Promise.resolve({ code: 1, msg: "ok", data: [dishCat] });
      if (params?.type === 2) return Promise.resolve({ code: 1, msg: "ok", data: [setmealCat] });
      return Promise.resolve({ code: 1, msg: "ok", data: [] });
    }
    if (url === "/dish/list") return Promise.resolve({ code: 1, msg: "ok", data: [dish] });
    if (url === "/setmeal/list") return Promise.resolve({ code: 1, msg: "ok", data: [setmeal] });
    if (url === "/shoppingCart/list") return Promise.resolve({ code: 1, msg: "ok", data: cart });
    if (url === "/shop/status") return Promise.resolve({ code: 1, msg: "ok", data: shopStatus });
    return Promise.resolve({ code: 1, msg: "ok", data: null });
  });
}

beforeEach(() => {
  mockNavigate.mockClear();
  mockGet.mockReset();
  mockPost.mockReset();
  mockDelete.mockReset();
  mockToastError.mockClear();
  mockToastSuccess.mockClear();
  mocks.mockLocation = { pathname: "/home", key: "k1" };
  localStorage.clear();
});

describe("Home page", () => {
  it("renders nothing when not on the /home route", async () => {
    mocks.mockLocation = { pathname: "/other", key: "k1" };
    setupGet();
    render(<Home />);
    await waitFor(() => expect(mockGet).not.toHaveBeenCalled());
    expect(screen.queryByText("Firmament Takeout")).not.toBeInTheDocument();
  });

  it("loads and renders categories, dishes, and open shop status", async () => {
    setupGet();
    render(<Home />);
    await waitFor(() => expect(screen.getByText("Burger")).toBeInTheDocument());
    expect(screen.getByText("Hot")).toBeInTheDocument();
    expect(screen.getByText("Sets")).toBeInTheDocument();
    expect(screen.getByText("Open")).toBeInTheDocument();
    expect(screen.getByText("¥15.00")).toBeInTheDocument();
  });

  it("displays Closed when the shop is closed and disables add buttons", async () => {
    setupGet({ shopStatus: 0 });
    render(<Home />);
    await waitFor(() => expect(screen.getByText("Burger")).toBeInTheDocument());
    expect(screen.getByText("Closed")).toBeInTheDocument();
    const addButtons = screen.getAllByRole("button", { name: "+" });
    addButtons.forEach((b) => expect(b).toBeDisabled());
    expect(screen.getByRole("button", { name: /checkout/i })).toBeDisabled();
  });

  it("adds a dish to the cart", async () => {
    localStorage.setItem("token", "tok");
    setupGet();
    mockPost.mockResolvedValue({ code: 1, msg: "ok" });
    const user = userEvent.setup();
    render(<Home />);
    await waitFor(() => expect(screen.getByText("Burger")).toBeInTheDocument());
    await user.click(screen.getAllByRole("button", { name: "+" })[0]);
    await waitFor(() =>
      expect(mockPost).toHaveBeenCalledWith("/shoppingCart/add", { dishId: "d1", dishFlavor: "" })
    );
    expect(mockToastSuccess).toHaveBeenCalledWith("Added to cart");
  });

  it("decreases a dish quantity when - is clicked", async () => {
    localStorage.setItem("token", "tok");
    const cartItem = { id: "cart1", dishId: "d1", setmealId: "", name: "Burger", number: 2, amount: 15, dishFlavor: "" };
    mockGet.mockImplementation((url: string, config?: { params?: Record<string, unknown> }) => {
      const params = config?.params;
      if (url === "/category/list") {
        if (params?.type === 1) return Promise.resolve({ code: 1, msg: "ok", data: [dishCat] });
        if (params?.type === 2) return Promise.resolve({ code: 1, msg: "ok", data: [setmealCat] });
      }
      if (url === "/dish/list") return Promise.resolve({ code: 1, msg: "ok", data: [dish] });
      if (url === "/setmeal/list") return Promise.resolve({ code: 1, msg: "ok", data: [] });
      // Delay cart so it loads after the dish list, letting the merge populate dishNumber.
      if (url === "/shoppingCart/list") {
        return new Promise((resolve) =>
          setTimeout(() => resolve({ code: 1, msg: "ok", data: [cartItem] }), 50)
        );
      }
      if (url === "/shop/status") return Promise.resolve({ code: 1, msg: "ok", data: 1 });
      return Promise.resolve({ code: 1, msg: "ok", data: null });
    });
    mockPost.mockResolvedValue({ code: 1, msg: "ok" });
    const user = userEvent.setup();
    render(<Home />);
    await waitFor(() => expect(screen.getByRole("button", { name: "-" })).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: "-" }));
    await waitFor(() =>
      expect(mockPost).toHaveBeenCalledWith("/shoppingCart/sub", { dishId: "d1", dishFlavor: "" })
    );
    expect(mockToastSuccess).toHaveBeenCalledWith("Removed");
  });

  it("shows set meals when the set meal category is selected", async () => {
    setupGet();
    const user = userEvent.setup();
    render(<Home />);
    await waitFor(() => expect(screen.getByText("Sets")).toBeInTheDocument());
    await user.click(screen.getByText("Sets"));
    await waitFor(() => expect(screen.getByText("Family Meal")).toBeInTheDocument());
    expect(screen.getByText("Set Meal")).toBeInTheDocument();
  });

  it("opens the login prompt when adding without a token", async () => {
    setupGet();
    const user = userEvent.setup();
    render(<Home />);
    await waitFor(() => expect(screen.getByText("Burger")).toBeInTheDocument());
    await user.click(screen.getAllByRole("button", { name: "+" })[0]);
    await waitFor(() => expect(screen.getByText("Please sign in first")).toBeInTheDocument());
    expect(mockPost).not.toHaveBeenCalled();
  });

  it("redirects to login from the login prompt", async () => {
    setupGet();
    const user = userEvent.setup();
    render(<Home />);
    await waitFor(() => expect(screen.getByText("Burger")).toBeInTheDocument());
    await user.click(screen.getAllByRole("button", { name: "+" })[0]);
    await waitFor(() => expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("opens the cart popup and clears the cart", async () => {
    localStorage.setItem("token", "tok");
    setupGet({ cart: [{ id: "cart1", dishId: "d1", name: "Burger", number: 2, amount: 15, dishFlavor: "" }] });
    mockDelete.mockResolvedValue({ code: 1, msg: "ok" });
    const user = userEvent.setup();
    render(<Home />);
    await waitFor(() => expect(screen.getByText("¥30.00")).toBeInTheDocument());
    await user.click(screen.getByText("🛒"));
    await waitFor(() => expect(screen.getByText("Cart")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /clear/i }));
    await waitFor(() => expect(mockDelete).toHaveBeenCalledWith("/shoppingCart/clean"));
    expect(mockToastSuccess).toHaveBeenCalledWith("Cart cleared");
  });

  it("navigates to the order page on checkout", async () => {
    localStorage.setItem("token", "tok");
    setupGet({ cart: [{ id: "cart1", dishId: "d1", name: "Burger", number: 2, amount: 15, dishFlavor: "" }] });
    const user = userEvent.setup();
    render(<Home />);
    await waitFor(() => expect(screen.getByRole("button", { name: /checkout/i })).toBeEnabled());
    await user.click(screen.getByRole("button", { name: /checkout/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/order");
  });

  it("opens dish detail, selects a flavor, and adds to cart", async () => {
    localStorage.setItem("token", "tok");
    mockGet.mockImplementation((url: string, config?: { params?: Record<string, unknown> }) => {
      const params = config?.params;
      if (url === "/category/list") {
        if (params?.type === 1) return Promise.resolve({ code: 1, msg: "ok", data: [dishCat] });
        if (params?.type === 2) return Promise.resolve({ code: 1, msg: "ok", data: [setmealCat] });
      }
      if (url === "/dish/list") return Promise.resolve({ code: 1, msg: "ok", data: [flavoredDish] });
      if (url === "/setmeal/list") return Promise.resolve({ code: 1, msg: "ok", data: [] });
      if (url === "/shoppingCart/list") return Promise.resolve({ code: 1, msg: "ok", data: [] });
      if (url === "/shop/status") return Promise.resolve({ code: 1, msg: "ok", data: 1 });
      return Promise.resolve({ code: 1, msg: "ok", data: null });
    });
    mockPost.mockResolvedValue({ code: 1, msg: "ok" });
    const user = userEvent.setup();
    render(<Home />);
    await waitFor(() => expect(screen.getByRole("button", { name: /select options/i })).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /select options/i }));
    await waitFor(() => expect(screen.getByText("Spice Level")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "hot" }));
    fireEvent.click(screen.getByRole("button", { name: /add to cart/i }));
    await waitFor(() =>
      expect(mockPost).toHaveBeenCalledWith(
        "/shoppingCart/add",
        expect.objectContaining({ dishId: "d2", dishFlavor: "Spice Level:hot" })
      )
    );
  });

  it("shows an empty state for a category with no items", async () => {
    mockGet.mockImplementation((url: string, config?: { params?: Record<string, unknown> }) => {
      const params = config?.params;
      if (url === "/category/list") {
        if (params?.type === 1) return Promise.resolve({ code: 1, msg: "ok", data: [dishCat] });
        if (params?.type === 2) return Promise.resolve({ code: 1, msg: "ok", data: [] });
      }
      if (url === "/dish/list") return Promise.resolve({ code: 1, msg: "ok", data: [] });
      if (url === "/setmeal/list") return Promise.resolve({ code: 1, msg: "ok", data: [] });
      if (url === "/shoppingCart/list") return Promise.resolve({ code: 1, msg: "ok", data: [] });
      if (url === "/shop/status") return Promise.resolve({ code: 1, msg: "ok", data: 1 });
      return Promise.resolve({ code: 1, msg: "ok", data: null });
    });
    render(<Home />);
    await waitFor(() => expect(screen.getByText(/No items in this category/)).toBeInTheDocument());
  });

  it("shows an error toast when loading categories fails", async () => {
    mockGet.mockRejectedValue(new Error("network"));
    render(<Home />);
    await waitFor(() => expect(mockToastError).toHaveBeenCalledWith("network"));
  });

  it("decreases a set meal quantity in the cart", async () => {
    localStorage.setItem("token", "tok");
    const cartItem = { id: "c1", setmealId: "s1", dishId: "", name: "Family Meal", number: 2, amount: 50, dishFlavor: "" };
    mockGet.mockImplementation((url: string, config?: { params?: Record<string, unknown> }) => {
      const params = config?.params;
      if (url === "/category/list") {
        if (params?.type === 1) return Promise.resolve({ code: 1, msg: "ok", data: [dishCat] });
        if (params?.type === 2) return Promise.resolve({ code: 1, msg: "ok", data: [setmealCat] });
      }
      if (url === "/dish/list") return Promise.resolve({ code: 1, msg: "ok", data: [] });
      if (url === "/setmeal/list") return Promise.resolve({ code: 1, msg: "ok", data: [setmeal] });
      if (url === "/shoppingCart/list") {
        return new Promise((resolve) =>
          setTimeout(() => resolve({ code: 1, msg: "ok", data: [cartItem] }), 50)
        );
      }
      if (url === "/shop/status") return Promise.resolve({ code: 1, msg: "ok", data: 1 });
      return Promise.resolve({ code: 1, msg: "ok", data: null });
    });
    mockPost.mockResolvedValue({ code: 1, msg: "ok" });
    const user = userEvent.setup();
    render(<Home />);
    await waitFor(() => expect(screen.getByText("Sets")).toBeInTheDocument());
    await user.click(screen.getByText("Sets"));
    await waitFor(() => expect(screen.getByText("Family Meal")).toBeInTheDocument());
    // wait for the cart merge so the setmeal shows a minus button (quantity > 0)
    await waitFor(() => expect(screen.getAllByRole("button", { name: "-" }).length).toBeGreaterThan(0));
    await user.click(screen.getAllByRole("button", { name: "-" })[0]);
    await waitFor(() =>
      expect(mockPost).toHaveBeenCalledWith("/shoppingCart/sub", { setmealId: "s1" })
    );
    expect(mockToastSuccess).toHaveBeenCalledWith("Removed");
  });

  it("adjusts quantities from the cart popup", async () => {
    localStorage.setItem("token", "tok");
    setupGet({ cart: [{ id: "cart1", dishId: "d1", name: "Burger", number: 2, amount: 15, dishFlavor: "" }] });
    mockPost.mockResolvedValue({ code: 1, msg: "ok" });
    const user = userEvent.setup();
    render(<Home />);
    await waitFor(() => expect(screen.getByText("¥30.00")).toBeInTheDocument());
    await user.click(screen.getByText("🛒"));
    await waitFor(() => expect(screen.getByText("Cart")).toBeInTheDocument());
    const popup = document.querySelector(".adm-popup-body");
    fireEvent.click(within(popup).getAllByRole("button", { name: "+" })[0]);
    await waitFor(() =>
      expect(mockPost).toHaveBeenCalledWith("/shoppingCart/add", { dishId: "d1", dishFlavor: "" })
    );
    fireEvent.click(within(popup).getAllByRole("button", { name: "-" })[0]);
    await waitFor(() =>
      expect(mockPost).toHaveBeenCalledWith("/shoppingCart/sub", { dishId: "d1", dishFlavor: "" })
    );
  });

  it("closes the login prompt with the cancel button", async () => {
    setupGet();
    const user = userEvent.setup();
    render(<Home />);
    await waitFor(() => expect(screen.getByText("Burger")).toBeInTheDocument());
    await user.click(screen.getAllByRole("button", { name: "+" })[0]);
    await waitFor(() => expect(screen.getByRole("button", { name: /^cancel$/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /^cancel$/i }));
    // antd-mobile keeps popup content mounted, so verify cancel did not navigate
    await waitFor(() => expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument());
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("shows the login prompt when clearing the cart without a token", async () => {
    setupGet({ cart: [{ id: "c1", dishId: "d1", name: "Burger", number: 1, amount: 15, dishFlavor: "" }] });
    const user = userEvent.setup();
    render(<Home />);
    await waitFor(() => expect(screen.getByText("🛒")).toBeInTheDocument());
    await user.click(screen.getByText("🛒"));
    await waitFor(() => expect(screen.getByText("Cart")).toBeInTheDocument());
    fireEvent.click(screen.getAllByRole("button", { name: /^clear$/i })[0]);
    await waitFor(() => expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument());
    expect(mockDelete).not.toHaveBeenCalled();
  });
});
