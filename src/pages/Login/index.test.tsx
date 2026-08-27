import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mocks = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockPost: vi.fn(),
  mockToastError: vi.fn(),
  mockToastSuccess: vi.fn(),
}));
const { mockNavigate, mockPost, mockToastError, mockToastSuccess } = mocks;

vi.mock("react-router-dom", () => ({
  useNavigate: () => mocks.mockNavigate,
}));

vi.mock("@/api/request", () => ({
  default: {
    post: (...a: unknown[]) => mocks.mockPost(...a),
    get: vi.fn(),
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

import Login from "./index";

beforeEach(() => {
  mockNavigate.mockClear();
  mockPost.mockReset();
  mockToastError.mockClear();
  mockToastSuccess.mockClear();
  localStorage.clear();
});

const fill = async (phone: string, password: string) => {
  const user = userEvent.setup();
  const phoneInput = screen.getByPlaceholderText("Enter your phone number");
  const passwordInput = screen.getByPlaceholderText("Enter your password");
  // The form is prefilled with default credentials, so clear before typing.
  await user.clear(phoneInput);
  await user.clear(passwordInput);
  await user.type(phoneInput, phone);
  await user.type(passwordInput, password);
  return user;
};

describe("Login page", () => {
  it("renders the sign-in form", () => {
    render(<Login />);
    expect(screen.getByPlaceholderText("Enter your phone number")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your password")).toBeInTheDocument();
  });

  it("renders the GitHub link", () => {
    render(<Login />);
    const link = screen.getByText("View on GitHub").closest("a");
    expect(link).toHaveAttribute(
      "href",
      "https://github.com/kaiwenyao/firmament-take-out-user"
    );
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("prefills default credentials so users can sign in directly", () => {
    render(<Login />);
    expect(screen.getByPlaceholderText("Enter your phone number")).toHaveValue("13333333333");
    expect(screen.getByPlaceholderText("Enter your password")).toHaveValue("123456");
  });

  it("redirects to home when a token already exists", async () => {
    localStorage.setItem("token", "existing");
    render(<Login />);
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith("/home", { replace: true })
    );
  });

  it("browses as guest", async () => {
    const user = userEvent.setup();
    render(<Login />);
    await user.click(screen.getByRole("button", { name: /browse as guest/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/home");
  });

  it("logs in successfully and stores credentials", async () => {
    mockPost.mockResolvedValue({
      code: 1,
      msg: "success",
      data: { id: "42", token: "tok" },
    });
    render(<Login />);
    const user = await fill("13812345678", "123456");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith("/user/phoneLogin", {
        phone: "13812345678",
        password: "123456",
      });
      expect(localStorage.getItem("token")).toBe("tok");
      expect(localStorage.getItem("userId")).toBe("42");
      expect(mockToastSuccess).toHaveBeenCalledWith("Login successful");
      expect(mockNavigate).toHaveBeenCalledWith("/home", { replace: true });
    });
  });

  it("shows an error when login response code is not 1", async () => {
    mockPost.mockResolvedValue({ code: 0, msg: "Bad credentials", data: null });
    render(<Login />);
    const user = await fill("13812345678", "123456");
    await user.click(screen.getByRole("button", { name: /sign in/i }));
    await waitFor(() =>
      expect(mockToastError).toHaveBeenCalledWith("Bad credentials")
    );
  });

  it("shows an error when login rejects with an Error", async () => {
    mockPost.mockRejectedValue(new Error("Server down"));
    render(<Login />);
    const user = await fill("13812345678", "123456");
    await user.click(screen.getByRole("button", { name: /sign in/i }));
    await waitFor(() => expect(mockToastError).toHaveBeenCalledWith("Server down"));
  });

  it("shows a generic error for an unknown error shape", async () => {
    mockPost.mockRejectedValue({ weird: true });
    render(<Login />);
    const user = await fill("13812345678", "123456");
    await user.click(screen.getByRole("button", { name: /sign in/i }));
    await waitFor(() => expect(mockToastError).toHaveBeenCalledWith("Login failed"));
  });

  it("toggles password visibility with the eye icon", async () => {
    render(<Login />);
    const passwordInput = screen.getByPlaceholderText("Enter your password");
    expect(passwordInput).toHaveAttribute("type", "password");
    fireEvent.click(document.querySelector(".antd-mobile-icon")!.parentElement as HTMLElement);
    expect(passwordInput).toHaveAttribute("type", "text");
    fireEvent.click(document.querySelector(".antd-mobile-icon")!.parentElement as HTMLElement);
    expect(passwordInput).toHaveAttribute("type", "password");
  });
});
