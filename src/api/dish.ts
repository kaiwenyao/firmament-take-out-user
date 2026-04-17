import request from "./request";
import type { ApiResponse } from "./request";

// Dish flavor definition
export interface DishFlavor {
  name: string;
  value: string[];
}

// Dish data type definition
export interface Dish {
  id: string; // ID is string type
  name: string;
  categoryId: string; // ID is string type
  price: number;
  code: string;
  image: string;
  description: string;
  status: number;
  sort: number;
  createTime: string;
  updateTime: string;
  createUser: string; // ID is string type
  updateUser: string; // ID is string type
  dishFlavor: string;
  flavors?: DishFlavor[];
  copies?: number;
  dishNumber?: number;
  type?: number;
}

/**
 * Query dish list
 * @param params Query parameters
 * @returns Dish list
 */
export const dishListByCategoryIdAPI = async (
  params?: { categoryId?: string } // ID is string type
): Promise<ApiResponse<Dish[]>> => {
  return request.get("/dish/list", { params });
};
