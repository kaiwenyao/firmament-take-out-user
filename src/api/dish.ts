import request from "./request";
import type { ApiResponse } from "./request";

// 菜品口味定义
export interface DishFlavor {
  name: string;
  value: string[];
}

// 菜品数据类型定义
export interface Dish {
  id: string; // ID为string类型
  name: string;
  categoryId: string; // ID为string类型
  price: number;
  code: string;
  image: string;
  description: string;
  status: number;
  sort: number;
  createTime: string;
  updateTime: string;
  createUser: string; // ID为string类型
  updateUser: string; // ID为string类型
  dishFlavor: string;
  flavors?: DishFlavor[];
  copies?: number;
  dishNumber?: number;
  type?: number;
}

/**
 * 查询菜品管理列表
 * @param params 查询参数
 * @returns 菜品列表
 */
export const dishListByCategoryIdAPI = async (
  params?: { categoryId?: string } // ID为string类型
): Promise<ApiResponse<Dish[]>> => {
  return request.get("/dish/list", { params });
};
