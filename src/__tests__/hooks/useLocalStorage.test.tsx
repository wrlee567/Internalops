import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

describe('useLocalStorage', () => {
  it('returns the initial value when nothing is in localStorage', async () => {
    const { result } = renderHook(() => useLocalStorage('test-key', ['initial']));

    // Wait for the effect to run (it reads localStorage and sets loaded=true)
    await act(async () => {});

    const [value, , loaded] = result.current;
    expect(value).toEqual(['initial']);
    expect(loaded).toBe(true);
  });

  it('loads a previously stored value from localStorage', async () => {
    window.localStorage.setItem('test-key', JSON.stringify(['stored-value']));

    const { result } = renderHook(() => useLocalStorage('test-key', ['default']));
    await act(async () => {});

    const [value] = result.current;
    expect(value).toEqual(['stored-value']);
  });

  it('saves a new value to localStorage when the setter is called', async () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    await act(async () => {});

    act(() => {
      const [, setter] = result.current;
      setter('updated');
    });

    expect(result.current[0]).toBe('updated');
    expect(JSON.parse(window.localStorage.getItem('test-key')!)).toBe('updated');
  });

  it('supports functional updates (like React setState)', async () => {
    const { result } = renderHook(() => useLocalStorage<number[]>('test-key', [1, 2]));
    await act(async () => {});

    act(() => {
      const [, setter] = result.current;
      setter((prev) => [...prev, 3]);
    });

    expect(result.current[0]).toEqual([1, 2, 3]);
    expect(JSON.parse(window.localStorage.getItem('test-key')!)).toEqual([1, 2, 3]);
  });

  it('resolves to loaded=true after mount', async () => {
    // RTL's renderHook wraps in act(), so effects flush synchronously —
    // we can't catch the false→true transition, but we can assert the final state.
    const { result } = renderHook(() => useLocalStorage('test-key', 'x'));
    await act(async () => {});
    expect(result.current[2]).toBe(true);
  });

  it('gracefully ignores corrupted localStorage data', async () => {
    window.localStorage.setItem('test-key', 'this is not valid JSON {{{');
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useLocalStorage('test-key', 'fallback'));
    await act(async () => {});

    // Falls back to the initial value rather than crashing
    expect(result.current[0]).toBe('fallback');
    expect(result.current[2]).toBe(true);

    consoleSpy.mockRestore();
  });
});
