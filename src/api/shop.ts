import request from "./request";
import type { ApiResponse } from "./request";

/**
 * Get shop info
 * @returns Shop info
 */
export const getShopInfoAPI = async (): Promise<ApiResponse<number>> => {
  return request.get("/shop/status");
};
