/**
 * Error handling utility functions
 */

/**
 * Extract error message from an error object
 * @param error Error object
 * @param fallbackMessage Default error message
 * @returns Error message string
 */
export function getErrorMessage(error: unknown, fallbackMessage = "Operation failed"): string {
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
