import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { toast } from "sonner";
import { triggerNavigation } from "@/lib/navigation";

// Generic API response type
export interface ApiResponse<T = unknown> {
  code: number;
  msg?: string;
  data?: T;
}

// Create axios instance
const instance = axios.create({
  baseURL: "/api",
  timeout: 10000,
});

// Request interceptor
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.authentication = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - return response.data instead of whole response
instance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const res = response.data;
    // Mini program backend response format: { code: 1, msg: 'success', data: ... }
    if (res.code === 1 || res.code === 200) {
      // Return response.data, so caller can directly use res.code and res.data
      // Use type assertion to satisfy axios interceptor type requirements
      return res as unknown as AxiosResponse<ApiResponse>;
    }
    const errorMsg: string = res.msg || "Operation failed";
    return Promise.reject(new Error(errorMsg));
  },
  (error: AxiosError) => {
    // Handle 401 unauthorized errors
    if (error.response?.status === 401) {
      const token = localStorage.getItem("token");
      if (token) {
        // Clear locally stored token
        localStorage.removeItem("token");
        localStorage.removeItem("userId");

        // Show warning toast
        toast.error("Please sign in first");

        // Use React Router to navigate to login page (replace current history to avoid returning to authenticated page)
        const currentPath = window.location.pathname;
        if (currentPath !== "/login") {
          setTimeout(() => {
            triggerNavigation("/login", true);
          }, 500);
        }

        const errorMessage = "Session expired, please sign in again";
        return Promise.reject(new Error(errorMessage));
      }

      const errorMessage = "Please sign in first";
      return Promise.reject(new Error(errorMessage));
    }
    
    const errorMessage =
      (error.response?.data as { msg?: string })?.msg || error.message || "Network error";
    return Promise.reject(new Error(errorMessage));
  }
);

export default instance;
