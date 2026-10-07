import { describe, it, expect } from 'vitest';
import { formatDate } from './formatDate';

describe('formatDate utility', () => {
  it('formats a standard date string correctly', () => {
    const result = formatDate('2026-06-06');
    expect(result).toBe('June 6, 2026');
  });
});