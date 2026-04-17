/**
 * Formatting utility functions
 */

/**
 * Mask phone number, hiding the middle 4 digits
 * @param phone Phone number
 * @returns Masked phone number, e.g., 138****5678
 */
export function maskPhone(phone: string): string {
  if (!phone || phone.length !== 11) {
    return phone;
  }
  return phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2");
}

/**
 * Mask ID number, showing only the first 6 and last 4 digits
 * @param idNumber ID number
 * @returns Masked ID number
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
