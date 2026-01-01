import request from "./request";
import type { ApiResponse } from "./request";

// 套餐数据类型定义
export interface Setmeal {
  id: string; // ID为string类型
  categoryId: string; // ID为string类型
  name: string;
  price: number;
  status: number; // 0:停用 1:启用
  description: string;
  image: string;
  createTime?: string;
  updateTime?: string;
  createUser?: string; // ID为string类型
  updateUser?: string; // ID为string类型
  setmealNumber?: number; // 购物车中的数量
}

// 套餐包含的菜品项
export interface DishItem {
  id: string;
  name: string;
  copies: number;
  image: string;
  description: string;
}

/**
 * 根据分类ID查询套餐列表
 * @param params 查询参数
 * @returns 套餐列表
 */
export const getSetmealListByCategoryIdAPI = async (
  params?: { categoryId?: string }
): Promise<ApiResponse<Setmeal[]>> => {
  return request.get("/setmeal/list", { params });
};

/**
 * 根据套餐ID查询包含的菜品列表
 * @param id 套餐ID
 * @returns 菜品列表
 */
export const getSetmealDishListAPI = async (
  id: string
): Promise<ApiResponse<DishItem[]>> => {
  return request.get(`/setmeal/dish/${id}`);
};
