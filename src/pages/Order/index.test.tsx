import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mocks = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockGet: vi.fn(),
  mockPost: vi.fn(),
  mockToastError: vi.fn(),
  mockToastSuccess: vi.fn(),
}));
const { mockNavigate, mockGet, mockPost, mockToastError, mockToastSuccess } = mocks;

vi.mock("react-router-dom", () => ({
  useNavigate: () => mocks.mockNavigate,
}));

vi.mock("@/api/request", () => ({
  default: {
    get: (...a: unknown[]) => mocks.mockGet(...a),
    post: (...a: unknown[]) => mocks.mockPost(...a),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    error: (...a: unknown[]) => mocks.mockToastError(...a),
    success: (...a: unknown[]) => mocks.mockToastSuccess(...a),
  },
}));

import Order from "./index";

const cartItem = {
  id: "c1",
  name: "Burger",
  image: "",
  dishId: "d1",
  setmealId: "",
  dishFlavor: "",
  number: 2,
  amount: 15,
};

const address = {
  id: "a1",
  userId: "u1",
  consignee: "Bob",
  phone: "13812345678",
  sex: "1",
  provinceCode: "",
  provinceName: "Beijing",
  cityCode: "",
  cityName: "Beijing",
  districtCode: "",
  districtName: "Dongcheng",
  detail: "No.1",
  label: "",
  isDefault: 1,
};

// Default API wiring: cart has one item, default address, shop open.
function setupHappy() {
  mockGet.mockImplementation((url: string) => {
    if (url === "/shoppingCart/list") {
      return Promise.resolve({ code: 1, msg: "success", data: [cartItem] });
    }
    if (url === "/addressBook/default") {
      return Promise.resolve({ code: 1, msg: "success", data: address });
    }
    if (url === "/shop/status") {
      return Promise.resolve({ code: 1, msg: "success", data: 1 });
    }
    if (url === "/addressBook/list") {
      return Promise.resolve({ code: 1, msg: "success", data: [address] });
    }
    return Promise.resolve({ code: 1, msg: "success", data: null });
  });
}

beforeEach(() => {
  mockNavigate.mockClear();
  mockGet.mockReset();
  mockPost.mockReset();
  mockToastError.mockClear();
  mockToastSuccess.mockClear();
});

describe("Order page", () => {
  it("renders cart items and the default address", async () => {
    setupHappy();
    render(<Order />);
    await waitFor(() => expect(screen.getByText("Burger")).toBeInTheDocument());
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText(/¥30.00/)).toBeInTheDocument(); // 15 * 2
    expect(mockGet).toHaveBeenCalledWith("/shoppingCart/list");
    expect(mockGet).toHaveBeenCalledWith("/addressBook/default");
    expect(mockGet).toHaveBeenCalledWith("/shop/status");
  });

  it("adds an item to the cart", async () => {
    setupHappy();
    mockPost.mockResolvedValue({ code: 1, msg: "success" });
    const user = userEvent.setup();
    render(<Order />);
    await waitFor(() => expect(screen.getByText("Burger")).toBeInTheDocument());
    const addButtons = screen.getAllByRole("button", { name: "+" });
    await user.click(addButtons[0]);
    await waitFor(() => expect(mockPost).toHaveBeenCalledWith("/shoppingCart/add", { dishId: "d1", setmealId: undefined, dishFlavor: "" }));
    expect(mockToastSuccess).toHaveBeenCalledWith("Added");
  });

  it("disables add buttons when the store is closed", async () => {
    setupHappy();
    mockGet.mockImplementation((url: string) => {
      if (url === "/shop/status") return Promise.resolve({ code: 1, msg: "success", data: 0 });
      if (url === "/shoppingCart/list") return Promise.resolve({ code: 1, msg: "success", data: [cartItem] });
      if (url === "/addressBook/default") return Promise.resolve({ code: 1, msg: "success", data: address });
      return Promise.resolve({ code: 1, msg: "success", data: null });
    });
    render(<Order />);
    await waitFor(() => expect(screen.getByText("Burger")).toBeInTheDocument());
    const addButtons = screen.getAllByRole("button", { name: "+" });
    addButtons.forEach((btn) => expect(btn).toBeDisabled());
    expect(screen.getByRole("button", { name: /place order/i })).toBeDisabled();
  });

  it("opens the address popup and selects an address", async () => {
    setupHappy();
    const user = userEvent.setup();
    render(<Order />);
    await waitFor(() => expect(screen.getByText("Burger")).toBeInTheDocument());
    await user.click(screen.getByText("Delivery Address"));
    // popup loads the address list
    await waitFor(() => expect(mockGet).toHaveBeenCalledWith("/addressBook/list"));
  });

  it("disables place order when the cart is empty", async () => {
    mockGet.mockImplementation((url: string) => {
      if (url === "/shoppingCart/list") return Promise.resolve({ code: 1, msg: "success", data: [] });
      if (url === "/addressBook/default") return Promise.resolve({ code: 1, msg: "success", data: address });
      if (url === "/shop/status") return Promise.resolve({ code: 1, msg: "success", data: 1 });
      return Promise.resolve({ code: 1, msg: "success", data: null });
    });
    render(<Order />);
    await waitFor(() => expect(screen.getByText("Total")).toBeInTheDocument());
    expect(screen.getByRole("button", { name: /place order/i })).toBeDisabled();
  });

  it("submits the order and navigates to pay", async () => {
    setupHappy();
    mockPost.mockResolvedValue({ code: 1, msg: "success", data: { orderNumber: "ORD" } });
    const user = userEvent.setup();
    render(<Order />);
    await waitFor(() => expect(screen.getByText("Burger")).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /place order/i }));
    await waitFor(() =>
      expect(mockPost).toHaveBeenCalledWith(
        "/order/submit",
        expect.objectContaining({ addressBookId: "a1", amount: 30, payMethod: 1 })
      )
    );
    expect(mockNavigate).toHaveBeenCalledWith("/pay?orderNumber=ORD");
  });

  it("decreases an item quantity in the cart", async () => {
    setupHappy();
    mockPost.mockResolvedValue({ code: 1, msg: "success" });
    const user = userEvent.setup();
    render(<Order />);
    await waitFor(() => expect(screen.getByText("Burger")).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: "-" }));
    await waitFor(() =>
      expect(mockPost).toHaveBeenCalledWith("/shoppingCart/sub", { dishId: "d1", dishFlavor: "" })
    );
    expect(mockToastSuccess).toHaveBeenCalledWith("Removed");
  });

  it("adds a set meal to the cart", async () => {
    mockGet.mockImplementation((url: string) => {
      if (url === "/shoppingCart/list")
        return Promise.resolve({ code: 1, msg: "success", data: [{ id: "c2", name: "Family Meal", setmealId: "s1", dishId: "", number: 1, amount: 50, dishFlavor: "Medium" }] });
      if (url === "/addressBook/default") return Promise.resolve({ code: 1, msg: "success", data: address });
      if (url === "/shop/status") return Promise.resolve({ code: 1, msg: "success", data: 1 });
      return Promise.resolve({ code: 1, msg: "success", data: null });
    });
    mockPost.mockResolvedValue({ code: 1, msg: "success" });
    const user = userEvent.setup();
    render(<Order />);
    await waitFor(() => expect(screen.getByText("Family Meal")).toBeInTheDocument());
    await user.click(screen.getAllByRole("button", { name: "+" })[0]);
    await waitFor(() =>
      expect(mockPost).toHaveBeenCalledWith(
        "/shoppingCart/add",
        expect.objectContaining({ setmealId: "s1", dishFlavor: "Medium" })
      )
    );
  });

  it("shows an error when submitting without a selected address", async () => {
    mockGet.mockImplementation((url: string) => {
      if (url === "/shoppingCart/list")
        return Promise.resolve({ code: 1, msg: "success", data: [cartItem] });
      if (url === "/addressBook/default") return Promise.resolve({ code: 1, msg: "success", data: null });
      if (url === "/shop/status") return Promise.resolve({ code: 1, msg: "success", data: 1 });
      return Promise.resolve({ code: 1, msg: "success", data: null });
    });
    const user = userEvent.setup();
    render(<Order />);
    await waitFor(() => expect(screen.getByText("Select delivery address")).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /place order/i }));
    await waitFor(() =>
      expect(mockToastError).toHaveBeenCalledWith("Please select a delivery address")
    );
    expect(mockPost).not.toHaveBeenCalled();
  });

  it("shows an error when the order submission fails", async () => {
    setupHappy();
    mockPost.mockRejectedValue(new Error("boom"));
    const user = userEvent.setup();
    render(<Order />);
    await waitFor(() => expect(screen.getByText("Burger")).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /place order/i }));
    await waitFor(() => expect(mockToastError).toHaveBeenCalledWith("boom"));
  });

  it("shows the order msg when the submission returns a non-success code", async () => {
    setupHappy();
    mockPost.mockResolvedValue({ code: 0, msg: "Out of stock" });
    const user = userEvent.setup();
    render(<Order />);
    await waitFor(() => expect(screen.getByText("Burger")).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /place order/i }));
    await waitFor(() => expect(mockToastError).toHaveBeenCalledWith("Out of stock"));
  });

  it("selects an address from the popup", async () => {
    setupHappy();
    mockGet.mockImplementation((url: string) => {
      if (url === "/shoppingCart/list")
        return Promise.resolve({ code: 1, msg: "success", data: [cartItem] });
      if (url === "/addressBook/default")
        return Promise.resolve({ code: 1, msg: "success", data: address });
      if (url === "/shop/status") return Promise.resolve({ code: 1, msg: "success", data: 1 });
      if (url === "/addressBook/list")
        return Promise.resolve({
          code: 1,
          msg: "success",
          data: [
            address,
            { ...address, id: "a2", consignee: "Alice", isDefault: 0 },
          ],
        });
      return Promise.resolve({ code: 1, msg: "success", data: null });
    });
    const user = userEvent.setup();
    render(<Order />);
    await waitFor(() => expect(screen.getByText("Burger")).toBeInTheDocument());
    await user.click(screen.getByText("Delivery Address"));
    await waitFor(() => expect(screen.getByText("Alice")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Alice"));
    await waitFor(() => expect(mockGet).toHaveBeenCalledWith("/addressBook/list"));
  });

  it("navigates to add address from the popup", async () => {
    setupHappy();
    const user = userEvent.setup();
    render(<Order />);
    await waitFor(() => expect(screen.getByText("Burger")).toBeInTheDocument());
    await user.click(screen.getByText("Delivery Address"));
    await waitFor(() => expect(screen.getByText("Select Delivery Address")).toBeInTheDocument());
    fireEvent.click(screen.getAllByRole("button", { name: /add address/i })[0]);
    expect(mockNavigate).toHaveBeenCalledWith("/address/add");
  });

  it("navigates back on the navbar back button", async () => {
    setupHappy();
    render(<Order />);
    await waitFor(() => expect(screen.getByText("Burger")).toBeInTheDocument());
    fireEvent.click(document.querySelector(".adm-nav-bar-back"));
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});
