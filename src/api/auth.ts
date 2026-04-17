import request from "./request";
import type { ApiResponse } from "./request";

// User login request parameters
export interface UserLoginDTO {
  phone: string;
  password: string;
}

// User login response data
export interface UserLoginVO {
  id: string; // ID is string type
  token: string;
}

// User info
export interface UserInfo {
  id: string; // ID is string type
  phone: string;
  name?: string;
  avatar?: string;
  idNumber?: string;
}

/**
 * User login (phone + password)
 * @param params Login parameters
 * @returns Login response data
 */
export const userLoginAPI = async (
  params: UserLoginDTO
): Promise<ApiResponse<UserLoginVO>> => {
  return request.post("/user/phoneLogin", params);
};

/**
 * Get current logged-in user info
 * @returns User info
 */
export const getUserInfoAPI = async (): Promise<ApiResponse<UserInfo>> => {
  return request.get("/user/info");
};
