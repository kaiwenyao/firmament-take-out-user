import request from "./request";
import type { ApiResponse } from "./request";

// 用户登录请求参数
export interface UserLoginDTO {
  phone: string;
  password: string;
}

// 用户登录响应数据
export interface UserLoginVO {
  id: string; // ID为string类型
  token: string;
}

// 用户信息
export interface UserInfo {
  id: string; // ID为string类型
  phone: string;
  name?: string;
  avatar?: string;
  idNumber?: string;
}

/**
 * 用户登录（手机号+密码）
 * @param params 登录参数
 * @returns 登录响应数据
 */
export const userLoginAPI = async (
  params: UserLoginDTO
): Promise<ApiResponse<UserLoginVO>> => {
  return request.post("/user/phoneLogin", params);
};

/**
 * 获取当前登录用户信息
 * @returns 用户信息
 */
export const getUserInfoAPI = async (): Promise<ApiResponse<UserInfo>> => {
  return request.get("/user/info");
};
