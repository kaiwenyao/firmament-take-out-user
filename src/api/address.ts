import request from "./request";
import type { ApiResponse } from "./request";

// 地址数据类型定义
export interface Address {
  id: string;
  userId: string;
  consignee: string;
  phone: string;
  sex: string;
  provinceCode: string;
  provinceName: string;
  cityCode: string;
  cityName: string;
  districtCode: string;
  districtName: string;
  detail: string;
  label: string;
  isDefault: number;
}

// 获取完整地址字符串
export const getFullAddress = (address: Address): string => {
  return `${address.provinceName || ""}${address.cityName || ""}${address.districtName || ""}${address.detail || ""}`;
};

/**
 * 获取地址列表
 * @returns 地址列表
 */
export const getAddressListAPI = async (): Promise<ApiResponse<Address[]>> => {
  return request.get("/addressBook/list");
};

/**
 * 根据ID获取地址详情
 * @param id 地址ID
 * @returns 地址详情
 */
export const getAddressByIdAPI = async (id: string): Promise<ApiResponse<Address>> => {
  return request.get(`/addressBook/${id}`);
};

/**
 * 新增地址
 * @param params 地址参数
 * @returns 操作结果
 */
export const addAddressAPI = async (params: Partial<Address>): Promise<ApiResponse> => {
  return request.post("/addressBook", params);
};

/**
 * 修改地址
 * @param params 地址参数
 * @returns 操作结果
 */
export const updateAddressAPI = async (params: Partial<Address>): Promise<ApiResponse> => {
  return request.put("/addressBook", params);
};

/**
 * 删除地址
 * @param id 地址ID
 * @returns 操作结果
 */
export const deleteAddressAPI = async (id: string): Promise<ApiResponse> => {
  return request.delete("/addressBook", { params: { id } });
};

/**
 * 获取默认地址
 * @returns 默认地址
 */
export const getDefaultAddressAPI = async (): Promise<ApiResponse<Address>> => {
  return request.get("/addressBook/default");
};

/**
 * 设置默认地址
 * @param id 地址ID
 * @returns 操作结果
 */
export const setDefaultAddressAPI = async (id: string): Promise<ApiResponse> => {
  return request.put("/addressBook/default", { id });
};
