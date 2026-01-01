import request from "./request";
import type { ApiResponse } from "./request";

// 分类数据类型定义
export interface Category {
  id: string; // ID为string类型
  type: number;
  name: string;
  sort: number;
  status: number;
  createTime: string;
  updateTime: string;
}

/**
 * 菜品和套餐的分类
 * @param params 查询参数
 * @returns 分类列表
 */
export const getCategoryListAPI = async (
  params?: { type?: number }
): Promise<ApiResponse<Category[]>> => {
  return request.get("/category/list", { params });
};
