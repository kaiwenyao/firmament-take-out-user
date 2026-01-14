import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { unstableSetRender } from "antd-mobile";
import "./index.css";
import App from "./App.tsx";

// React 19 兼容配置：为 antd-mobile 设置自定义渲染方法
// 由于 React 19 调整了 react-dom 的导出方式，需要使用 unstableSetRender 来适配
unstableSetRender((node, container) => {
  // 使用类型断言来扩展 container 类型，添加 _reactRoot 属性
  const containerWithRoot = container as HTMLElement & { _reactRoot?: ReturnType<typeof createRoot> };
  containerWithRoot._reactRoot ||= createRoot(container);
  const root = containerWithRoot._reactRoot;
  root.render(node);
  return async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
    root.unmount();
  };
});

// 捕获并忽略浏览器自动填充覆盖层导致的错误
window.addEventListener('error', (event) => {
  if (
    event.message?.includes('insertBefore') ||
    event.message?.includes('bootstrap-autofill-overlay') ||
    event.filename?.includes('bootstrap-autofill-overlay')
  ) {
    // 记录被抑制的错误，便于调试和监控
    console.info('[Suppressed Error]', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
});

// 捕获未处理的 Promise 拒绝
window.addEventListener('unhandledrejection', (event) => {
  if (
    event.reason?.message?.includes('insertBefore') ||
    event.reason?.message?.includes('bootstrap-autofill-overlay') ||
    event.reason?.stack?.includes('bootstrap-autofill-overlay')
  ) {
    // 记录被抑制的 Promise 拒绝，便于调试和监控
    console.info('[Suppressed Promise Rejection]', {
      reason: event.reason?.message,
      stack: event.reason?.stack,
    });
    event.preventDefault();
    return false;
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
