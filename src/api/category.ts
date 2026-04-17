import request from "./request";
import type { ApiResponse } from "./request";

// Category data type definition
export interface Category {
  id: string; // ID is string type
  type: number;
  name: string;
  sort: number;
  status: number;
  createTime: string;
  updateTime: string;
}

/**
 * Dish and set meal categories
 * @param params Query parameters
 * @returns Category list
 */
export const getCategoryListAPI = async (
  params?: { type?: number }
): Promise<ApiResponse<Category[]>> => {
  return request.get("/category/list", { params });
};
