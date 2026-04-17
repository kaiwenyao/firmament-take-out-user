import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { unstableSetRender } from "antd-mobile";
import "./index.css";
import App from "./App.tsx";

// React 19 compatibility: set custom render method for antd-mobile
// Since React 19 adjusted react-dom exports, need to use unstableSetRender for compatibility
unstableSetRender((node, container) => {
  // Use type assertion to extend container type, add _reactRoot property
  const containerWithRoot = container as HTMLElement & { _reactRoot?: ReturnType<typeof createRoot> };
  containerWithRoot._reactRoot ||= createRoot(container);
  const root = containerWithRoot._reactRoot;
  root.render(node);
  return async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
    root.unmount();
  };
});

// Capture and ignore errors caused by browser autofill overlay
window.addEventListener('error', (event) => {
  if (
    event.message?.includes('insertBefore') ||
    event.message?.includes('bootstrap-autofill-overlay') ||
    event.filename?.includes('bootstrap-autofill-overlay')
  ) {
    // Log suppressed errors for debugging and monitoring
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

// Capture unhandled Promise rejections
window.addEventListener('unhandledrejection', (event) => {
  if (
    event.reason?.message?.includes('insertBefore') ||
    event.reason?.message?.includes('bootstrap-autofill-overlay') ||
    event.reason?.stack?.includes('bootstrap-autofill-overlay')
  ) {
    // Log suppressed Promise rejections for debugging and monitoring
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
