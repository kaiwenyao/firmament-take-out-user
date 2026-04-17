import request from "./request";
import type { ApiResponse } from "./request";

// Shopping cart item data type definition
export interface ShoppingCartItem {
  id: string; // ID is string type
  name: string;
  image: string;
  dishId: string; // ID is string type
  setmealId: string; // ID is string type
  dishFlavor: string;
  number: number;
  amount: number;
}

// Shopping cart add/reduce parameters
export interface ShoppingCartParams {
  dishId?: string; // ID is string type
  setmealId?: string; // ID is string type
  dishFlavor?: string;
}

/**
 * Shopping cart - add dish implementation
 * @param params Add parameters
 * @returns Operation result
 */
export const addShoppingCartAPI = async (
  params: ShoppingCartParams
): Promise<ApiResponse> => {
  return request.post("/shoppingCart/add", params);
};

/**
 * Shopping cart - reduce dish
 * @param params Reduce parameters
 * @returns Operation result
 */
export const subShoppingCartAPI = async (
  params: ShoppingCartParams
): Promise<ApiResponse> => {
  return request.post("/shoppingCart/sub", params);
};

/**
 * Get shopping cart list
 * @returns Shopping cart list
 */
export const getShoppingCartAPI = async (): Promise<ApiResponse<ShoppingCartItem[]>> => {
  return request.get("/shoppingCart/list");
};

/**
 * Clear shopping cart
 * @returns Operation result
 */
export const delShoppingCartAPI = async (): Promise<ApiResponse> => {
  return request.delete("/shoppingCart/clean");
};
