import request from "./request";
import type { ApiResponse } from "./request";

// Address data type definition
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

// Get full address string
export const getFullAddress = (address: Address): string => {
  return `${address.provinceName || ""}${address.cityName || ""}${address.districtName || ""}${address.detail || ""}`;
};

/**
 * Get address list
 * @returns Address list
 */
export const getAddressListAPI = async (): Promise<ApiResponse<Address[]>> => {
  return request.get("/addressBook/list");
};

/**
 * Get address details by ID
 * @param id Address ID
 * @returns Address details
 */
export const getAddressByIdAPI = async (id: string): Promise<ApiResponse<Address>> => {
  return request.get(`/addressBook/${id}`);
};

/**
 * Add address
 * @param params Address parameters
 * @returns Operation result
 */
export const addAddressAPI = async (params: Partial<Address>): Promise<ApiResponse> => {
  return request.post("/addressBook", params);
};

/**
 * Update address
 * @param params Address parameters
 * @returns Operation result
 */
export const updateAddressAPI = async (params: Partial<Address>): Promise<ApiResponse> => {
  return request.put("/addressBook", params);
};

/**
 * Delete address
 * @param id Address ID
 * @returns Operation result
 */
export const deleteAddressAPI = async (id: string): Promise<ApiResponse> => {
  return request.delete("/addressBook", { params: { id } });
};

/**
 * Get default address
 * @returns Default address
 */
export const getDefaultAddressAPI = async (): Promise<ApiResponse<Address>> => {
  return request.get("/addressBook/default");
};

/**
 * Set default address
 * @param id Address ID
 * @returns Operation result
 */
export const setDefaultAddressAPI = async (id: string): Promise<ApiResponse> => {
  return request.put("/addressBook/default", { id });
};
