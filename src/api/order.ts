import request from "./request";
import type { ApiResponse } from "./request";

// Order detail data type definition
export interface OrderDetail {
  id: string; // ID is string type
  name: string;
  image: string;
  orderId: string; // ID is string type
  dishId: string; // ID is string type
  setmealId: string; // ID is string type
  dishFlavor: string;
  number: number;
  amount: number;
}

// Order data type definition
export interface Order {
  id: string; // ID is string type
  number: string;
  status: number;
  userId: string; // ID is string type
  addressBookId: string; // Address ID is string type
  orderTime: string;
  checkoutTime: string;
  payMethod: number;
  amount: number;
  phone: string;
  address: string;
  userName: string;
  consignee: string;
  orderDetailList: OrderDetail[];
}

// Submit order parameters
export interface SubmitOrderParams {
  addressBookId: string; // Address ID is string type
  payMethod: number;
  estimatedDeliveryTime?: string;
  deliveryStatus?: number;
  tablewareNumber?: number;
  tablewareStatus?: number;
  packAmount?: number;
  amount: number;
}

// Payment order parameters
export interface PaymentOrderParams {
  orderNumber: string;
  payMethod: number;
}

// Order page query parameters
export interface OrderPageQuery {
  page: number;
  pageSize: number;
}

// Order page response data
export interface OrderPageResponse {
  records: Order[];
  total: number;
}

/**
 * Submit order
 * @param params Order parameters
 * @returns Operation result
 */
export const submitOrderAPI = async (
  params: SubmitOrderParams
): Promise<ApiResponse> => {
  return request.post("/order/submit", params);
};

/**
 * Payment order
 * @param params Payment parameters
 * @returns Operation result
 */
export const paymentOrderAPI = async (
  params: PaymentOrderParams
): Promise<ApiResponse> => {
  return request.put("/order/payment", params);
};

/**
 * Get order page list
 * @param params Query parameters
 * @returns Order page data
 */
export const getOrderPageAPI = async (
  params: OrderPageQuery
): Promise<ApiResponse<OrderPageResponse>> => {
  return request.get("/order/historyOrders", { params });
};

/**
 * Order again
 * @param orderNumber Order number
 * @returns Operation result
 */
export const repetitionOrderAPI = async (orderNumber: string): Promise<ApiResponse> => {
  return request.post(`/order/repetition/number/${orderNumber}`);
};

/**
 * Rush order
 * @param orderNumber Order number
 * @returns Operation result
 */
export const reminderOrderAPI = async (orderNumber: string): Promise<ApiResponse> => {
  return request.get(`/order/reminder/number/${orderNumber}`);
};

/**
 * Get order details
 * @param orderNumber Order number
 * @returns Order details
 */
export const getOrderDetailAPI = async (orderNumber: string): Promise<ApiResponse<Order>> => {
  return request.get(`/order/orderDetail/number/${orderNumber}`);
};

/**
 * Cancel order
 * @param orderNumber Order number
 * @returns Operation result
 */
export const cancelOrderAPI = async (orderNumber: string): Promise<ApiResponse> => {
  return request.put(`/order/cancel/number/${orderNumber}`);
};
