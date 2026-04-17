/**
 * Global navigation helper
 * Used to trigger navigation from non-React components (e.g., axios interceptors)
 */

import router from "@/router";

/**
 * Trigger navigation
 * @param path Navigation path
 * @param replace Whether to replace the current history entry (default: false)
 */
export const triggerNavigation = (path: string, replace = false) => {
  // Use router.navigate for direct navigation, avoiding full page refresh
  router.navigate(path, { replace });
};
