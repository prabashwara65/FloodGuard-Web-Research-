// src/setupTests.js
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Clean up after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
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

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
  removeItem: vi.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
  removeItem: vi.fn(),
};
global.sessionStorage = sessionStorageMock;

// Suppress React 18 act warnings in tests
const originalError = console.error;
console.error = (...args) => {
  if (args[0]?.includes && (args[0].includes('Warning: An update to %s inside a test was not wrapped in act') ||
      args[0].includes('Warning: ReactDOM.render is no longer supported'))) {
    return;
  }
  originalError.call(console, ...args);
};

// Suppress React Router warnings
const originalWarn = console.warn;
console.warn = (...args) => {
  if (args[0]?.includes && args[0].includes('React Router Future Flag Warning')) {
    return;
  }
  originalWarn.call(console, ...args);
};