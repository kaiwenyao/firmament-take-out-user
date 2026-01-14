import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { toast } from "sonner";
import { triggerNavigation } from "@/lib/navigation";

// 通用 API 响应类型
export interface ApiResponse<T = unknown> {
  code: number;
  msg?: string;
  data?: T;
}

// 创建 axios 实例
const instance = axios.create({
  baseURL: "/api",
  timeout: 10000,
});

// 请求拦截器
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

// 响应拦截器 - 返回 response.data 而不是整个 response
instance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const res = response.data;
    // 小程序后端返回格式：{ code: 1, msg: 'success', data: ... }
    if (res.code === 1 || res.code === 200) {
      // 返回 response.data，这样调用方可以直接使用 res.code 和 res.data
      // 使用类型断言来满足 axios 拦截器的类型要求
      return res as unknown as AxiosResponse<ApiResponse>;
    }
    const errorMsg: string = res.msg || "操作失败";
    return Promise.reject(new Error(errorMsg));
  },
  (error: AxiosError) => {
    // 处理 401 未授权错误
    if (error.response?.status === 401) {
      const token = localStorage.getItem("token");
      if (token) {
        // 清除本地存储的 token
        localStorage.removeItem("token");
        localStorage.removeItem("userId");

        // 显示警告提示
        toast.error("请先登录");

        // 使用 React Router 导航到登录页（替换当前历史记录，避免返回到需要认证的页面）
        const currentPath = window.location.pathname;
        if (currentPath !== "/login") {
          setTimeout(() => {
            triggerNavigation("/login", true);
          }, 500);
        }

        const errorMessage = "登录已过期，请重新登录";
        return Promise.reject(new Error(errorMessage));
      }

      const errorMessage = "请先登录";
      return Promise.reject(new Error(errorMessage));
    }
    
    const errorMessage =
      (error.response?.data as { msg?: string })?.msg || error.message || "网络异常";
    return Promise.reject(new Error(errorMessage));
  }
);

export default instance;
