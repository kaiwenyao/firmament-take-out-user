import request from "./request";
import type { ApiResponse } from "./request";

// Set meal data type definition
export interface Setmeal {
  id: string; // ID is string type
  categoryId: string; // ID is string type
  name: string;
  price: number;
  status: number; // 0: Disabled, 1: Enabled
  description: string;
  image: string;
  createTime?: string;
  updateTime?: string;
  createUser?: string; // ID is string type
  updateUser?: string; // ID is string type
  setmealNumber?: number; // Quantity in cart
}

// Set meal dish items
export interface DishItem {
  id: string;
  name: string;
  copies: number;
  image: string;
  description: string;
}

/**
 * Query set meal list by category ID
 * @param params Query parameters
 * @returns Set meal list
 */
export const getSetmealListByCategoryIdAPI = async (
  params?: { categoryId?: string }
): Promise<ApiResponse<Setmeal[]>> => {
  return request.get("/setmeal/list", { params });
};

/**
 * Query dish list by set meal ID
 * @param id Set meal ID
 * @returns Dish list
 */
export const getSetmealDishListAPI = async (
  id: string
): Promise<ApiResponse<DishItem[]>> => {
  return request.get(`/setmeal/dish/${id}`);
};
