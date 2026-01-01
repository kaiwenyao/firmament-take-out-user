import request from "./request";
import type { ApiResponse } from "./request";

// 订单详情数据类型定义
export interface OrderDetail {
  id: string; // ID为string类型
  name: string;
  image: string;
  orderId: string; // ID为string类型
  dishId: string; // ID为string类型
  setmealId: string; // ID为string类型
  dishFlavor: string;
  number: number;
  amount: number;
}

// 订单数据类型定义
export interface Order {
  id: string; // ID为string类型
  number: string;
  status: number;
  userId: string; // ID为string类型
  addressBookId: string; // 地址ID为string类型
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

// 提交订单参数
export interface SubmitOrderParams {
  addressBookId: string; // 地址ID为string类型
  payMethod: number;
  estimatedDeliveryTime?: string;
  deliveryStatus?: number;
  tablewareNumber?: number;
  tablewareStatus?: number;
  packAmount?: number;
  amount: number;
}

// 支付订单参数
export interface PaymentOrderParams {
  orderNumber: string;
  payMethod: number;
}

// 订单分页查询参数
export interface OrderPageQuery {
  page: number;
  pageSize: number;
}

// 订单分页响应数据
export interface OrderPageResponse {
  records: Order[];
  total: number;
}

/**
 * 提交订单
 * @param params 订单参数
 * @returns 操作结果
 */
export const submitOrderAPI = async (
  params: SubmitOrderParams
): Promise<ApiResponse> => {
  return request.post("/order/submit", params);
};

/**
 * 支付订单
 * @param params 支付参数
 * @returns 操作结果
 */
export const paymentOrderAPI = async (
  params: PaymentOrderParams
): Promise<ApiResponse> => {
  return request.put("/order/payment", params);
};

/**
 * 获取订单分页列表
 * @param params 查询参数
 * @returns 订单分页数据
 */
export const getOrderPageAPI = async (
  params: OrderPageQuery
): Promise<ApiResponse<OrderPageResponse>> => {
  return request.get("/order/historyOrders", { params });
};

/**
 * 再来一单
 * @param orderNumber 订单号
 * @returns 操作结果
 */
export const repetitionOrderAPI = async (orderNumber: string): Promise<ApiResponse> => {
  return request.post(`/order/repetition/number/${orderNumber}`);
};

/**
 * 催单
 * @param orderNumber 订单号
 * @returns 操作结果
 */
export const reminderOrderAPI = async (orderNumber: string): Promise<ApiResponse> => {
  return request.get(`/order/reminder/number/${orderNumber}`);
};

/**
 * 获取订单详情
 * @param orderNumber 订单号
 * @returns 订单详情
 */
export const getOrderDetailAPI = async (orderNumber: string): Promise<ApiResponse<Order>> => {
  return request.get(`/order/orderDetail/number/${orderNumber}`);
};

/**
 * 取消订单
 * @param orderNumber 订单号
 * @returns 操作结果
 */
export const cancelOrderAPI = async (orderNumber: string): Promise<ApiResponse> => {
  return request.put(`/order/cancel/number/${orderNumber}`);
};
