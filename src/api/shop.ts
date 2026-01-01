import request from "./request";
import type { ApiResponse } from "./request";

/**
 * 获取店铺信息
 * @returns 店铺信息
 */
export const getShopInfoAPI = async (): Promise<ApiResponse<number>> => {
  return request.get("/shop/status");
};
