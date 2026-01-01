import request from "./request";
import type { ApiResponse } from "./request";

// 购物车项数据类型定义
export interface ShoppingCartItem {
  id: string; // ID为string类型
  name: string;
  image: string;
  dishId: string; // ID为string类型
  setmealId: string; // ID为string类型
  dishFlavor: string;
  number: number;
  amount: number;
}

// 购物车添加/减少参数
export interface ShoppingCartParams {
  dishId?: string; // ID为string类型
  setmealId?: string; // ID为string类型
  dishFlavor?: string;
}

/**
 * 购物车----加菜功能实现
 * @param params 添加参数
 * @returns 操作结果
 */
export const addShoppingCartAPI = async (
  params: ShoppingCartParams
): Promise<ApiResponse> => {
  return request.post("/shoppingCart/add", params);
};

/**
 * 购物车减菜
 * @param params 减少参数
 * @returns 操作结果
 */
export const subShoppingCartAPI = async (
  params: ShoppingCartParams
): Promise<ApiResponse> => {
  return request.post("/shoppingCart/sub", params);
};

/**
 * 获取购物车列表
 * @returns 购物车列表
 */
export const getShoppingCartAPI = async (): Promise<ApiResponse<ShoppingCartItem[]>> => {
  return request.get("/shoppingCart/list");
};

/**
 * 清空购物车
 * @returns 操作结果
 */
export const delShoppingCartAPI = async (): Promise<ApiResponse> => {
  return request.delete("/shoppingCart/clean");
};
