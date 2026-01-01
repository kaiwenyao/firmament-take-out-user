import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

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
