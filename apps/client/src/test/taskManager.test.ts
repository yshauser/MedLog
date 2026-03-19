import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { calculateRemainingDays } from '../services/TaskManager';

describe('calculateRemainingDays', () => {
  const FIXED_TODAY = new Date(2025, 2, 18); // March 18 2025

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_TODAY);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns 0 for today\'s date', () => {
    expect(calculateRemainingDays('18/03/2025')).toBe(0);
  });

  it('returns positive days for a future end date', () => {
    expect(calculateRemainingDays('25/03/2025')).toBe(7);
  });

  it('returns 0 for a past end date (clamped to 0)', () => {
    expect(calculateRemainingDays('10/03/2025')).toBe(0);
  });

  it('returns 0 for empty string', () => {
    expect(calculateRemainingDays('')).toBe(0);
  });

  it('correctly handles end-of-month boundary', () => {
    expect(calculateRemainingDays('31/03/2025')).toBe(13);
  });

  it('correctly handles year boundary', () => {
    expect(calculateRemainingDays('01/01/2026')).toBe(289);
  });
});
