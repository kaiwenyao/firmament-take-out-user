/**
 * 格式化工具函数
 */

/**
 * 脱敏手机号，隐藏中间4位
 * @param phone 手机号
 * @returns 脱敏后的手机号，如：138****5678
 */
export function maskPhone(phone: string): string {
  if (!phone || phone.length !== 11) {
    return phone;
  }
  return phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2");
}

/**
 * 脱敏身份证号，只显示前6位和后4位
 * @param idNumber 身份证号
 * @returns 脱敏后的身份证号
 */
export function maskIdNumber(idNumber: string): string {
  if (!idNumber || idNumber.length < 10) {
    return idNumber;
  }
  const visibleStart = idNumber.slice(0, 6);
  const visibleEnd = idNumber.slice(-4);
  const maskedMiddle = "*".repeat(idNumber.length - 10);
  return `${visibleStart}${maskedMiddle}${visibleEnd}`;
}
