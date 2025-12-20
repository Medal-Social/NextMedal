import { describe, expect, it } from 'vitest';
import { cn } from './utils';

describe('cn utility', () => {
  it('should handle strings', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2');
  });

  it('should handle conditionals', () => {
    expect(cn('class1', true && 'class2', false && 'class3')).toBe('class1 class2');
  });

  it('should handle objects', () => {
    expect(cn({ class1: true, class2: false, class3: true })).toBe('class1 class3');
  });

  it('should handle arrays', () => {
    expect(cn(['class1', 'class2'])).toBe('class1 class2');
  });

  it('should handle nested arrays', () => {
    expect(cn(['class1', ['class2', 'class3']])).toBe('class1 class2 class3');
  });

  it('should merge tailwind classes', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('should handle mixed types', () => {
    expect(cn('class1', { class2: true }, ['class3'])).toBe('class1 class2 class3');
  });

  it('should handle undefined and null', () => {
    expect(cn('class1', undefined, null, 'class2')).toBe('class1 class2');
  });
});
