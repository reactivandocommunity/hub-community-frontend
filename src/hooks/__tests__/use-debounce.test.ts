import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../use-debounce';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useDebounce', () => {
  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 500));
    expect(result.current).toBe('hello');
  });

  it('does not update value before the delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'hello', delay: 500 } }
    );

    rerender({ value: 'world', delay: 500 });

    // Advance time but not enough
    act(() => vi.advanceTimersByTime(300));
    expect(result.current).toBe('hello');
  });

  it('updates value after the delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'hello', delay: 500 } }
    );

    rerender({ value: 'world', delay: 500 });

    act(() => vi.advanceTimersByTime(500));
    expect(result.current).toBe('world');
  });

  it('resets timer when value changes rapidly', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'a', delay: 300 } }
    );

    rerender({ value: 'b', delay: 300 });
    act(() => vi.advanceTimersByTime(200));

    rerender({ value: 'c', delay: 300 });
    act(() => vi.advanceTimersByTime(200));

    // 'b' should not have been emitted, still 'a'
    expect(result.current).toBe('a');

    // After full delay from last change, should be 'c'
    act(() => vi.advanceTimersByTime(100));
    expect(result.current).toBe('c');
  });
});
