import { describe, it, expect } from 'vitest';
import { cn } from '../utils';

describe('cn', () => {
  it('merges simple class names', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2');
  });

  it('resolves Tailwind conflicts by keeping the last value', () => {
    expect(cn('px-4', 'px-8')).toBe('px-8');
  });

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible');
  });

  it('handles undefined and null inputs', () => {
    expect(cn('base', undefined, null, 'extra')).toBe('base extra');
  });

  it('handles empty call', () => {
    expect(cn()).toBe('');
  });

  it('merges complex Tailwind conflicts', () => {
    const result = cn(
      'text-sm font-medium text-gray-500',
      'text-lg text-blue-500'
    );
    expect(result).toContain('text-lg');
    expect(result).toContain('text-blue-500');
    expect(result).toContain('font-medium');
    expect(result).not.toContain('text-sm');
    expect(result).not.toContain('text-gray-500');
  });
});
