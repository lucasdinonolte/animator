import { describe, expect, it } from 'vitest';
import { sequentialTransition } from '../src/index.js';

describe('sequentialTransition', () => {
  it('should handle numbers', () => {
    const t = sequentialTransition(
      {
        from: 0,
        duration: 1,
      },
      {
        to: 1,
      },
      {
        to: 2,
      },
    );

    expect(t(0)).toBe(0);
    expect(t(0.5)).toBe(0.5);
    expect(t(1)).toBe(1);
    expect(t(2)).toBe(2);
  });

  it('should handle objects correctly', () => {
    const t = sequentialTransition(
      {
        from: { x: 0, y: 0 },
        duration: 1,
      },
      {
        to: { x: 1 },
      },
      {
        to: { x: 2 },
      },
    );

    expect(t(0)).toStrictEqual({ x: 0, y: 0 });
    expect(t(0.5)).toStrictEqual({ x: 0.5, y: 0 });
    expect(t(1)).toStrictEqual({ x: 1, y: 0 });
    expect(t(2)).toStrictEqual({ x: 2, y: 0 });
  });

  it('should handle arrays correctly', () => {
    const t = sequentialTransition(
      {
        from: [0, 0, 0],
        duration: 1,
      },
      {
        to: [1, 1, 1],
      },
      {
        to: [2, 2, 2],
      },
    );

    expect(t(0)).toStrictEqual([0, 0, 0]);
    expect(t(0.5)).toStrictEqual([0.5, 0.5, 0.5]);
    expect(t(1)).toStrictEqual([1, 1, 1]);
    expect(t(2)).toStrictEqual([2, 2, 2]);
  });
});
