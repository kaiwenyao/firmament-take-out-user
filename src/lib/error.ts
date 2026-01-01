/**
 * 错误处理工具函数
 */

/**
 * 从错误对象中提取错误消息
 * @param error 错误对象
 * @param fallbackMessage 默认错误消息
 * @returns 错误消息字符串
 */
export function getErrorMessage(error: unknown, fallbackMessage = "操作失败"): string {
  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message: unknown }).message;
    if (typeof message === "string") {
      return message;
    }
  }

  return fallbackMessage;
}
