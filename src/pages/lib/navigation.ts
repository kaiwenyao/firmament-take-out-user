/**
 * 全局导航助手
 * 用于在非 React 组件（如 axios 拦截器）中触发导航
 */

import router from "@/router";

/**
 * 触发导航
 * @param path 导航路径
 * @param replace 是否替换当前历史记录（默认为 false）
 */
export const triggerNavigation = (path: string, replace = false) => {
  // 使用 router.navigate 直接导航，避免全页面刷新
  router.navigate(path, { replace });
};
