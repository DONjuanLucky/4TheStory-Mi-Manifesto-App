
import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock ResizeObserver
class ResizeObserver {
  callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }

  observe(target: Element) {
    // Simulate resize immediately
    this.callback([{
      target,
      contentRect: {
        width: 800,
        height: 600,
        top: 0,
        left: 0,
        bottom: 600,
        right: 800,
        x: 0,
        y: 0,
        toJSON: () => {}
      },
      borderBoxSize: [],
      contentBoxSize: [],
      devicePixelContentBoxSize: []
    }] as ResizeObserverEntry[], this);
  }
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserver;

// Mock window.scrollTo
window.scrollTo = vi.fn();

// Mock HTMLElement.prototype.scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();

// Mock offsetHeight and offsetWidth for JSDOM
Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { configurable: true, value: 600 });
Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, value: 800 });

// Mock getBoundingClientRect
HTMLElement.prototype.getBoundingClientRect = function () {
  return {
    width: 800,
    height: 600,
    top: 0,
    left: 0,
    bottom: 600,
    right: 800,
    x: 0,
    y: 0,
    toJSON: () => {}
  };
};
