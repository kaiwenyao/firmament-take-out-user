import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// Unmount rendered trees after each test to avoid DOM leakage between tests.
afterEach(() => {
  cleanup();
});

// jsdom does not implement matchMedia; antd-mobile (used by many components)
// relies on it. Provide a stub so components render in tests.
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// jsdom does not implement scrollTo, used by antd-mobile internals.
window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;

// jsdom does not implement scrollIntoView, used by antd-mobile dialogs/scroll.
window.HTMLElement.prototype.scrollIntoView = vi.fn();

// antd-mobile components use ResizeObserver.
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = window.ResizeObserver || ResizeObserverMock;

// antd-mobile InfiniteScroll uses IntersectionObserver.
class IntersectionObserverMock {
  root: Element | null = null;
  rootMargin = "";
  thresholds: ReadonlyArray<number> = [];
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}
window.IntersectionObserver =
  window.IntersectionObserver ||
  (IntersectionObserverMock as unknown as typeof IntersectionObserver);
