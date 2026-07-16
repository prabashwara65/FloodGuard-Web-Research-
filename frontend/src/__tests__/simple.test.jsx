// src/__tests__/simple.test.jsx
import { describe, test, expect } from 'vitest';

describe('Simple Test', () => {
  test('should pass', () => {
    expect(true).toBe(true);
  });

  test('should handle basic math', () => {
    expect(1 + 1).toBe(2);
  });
});

