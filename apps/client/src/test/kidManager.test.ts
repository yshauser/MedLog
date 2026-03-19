import { describe, it, expect } from 'vitest';
import { calculateAge, updateDateYearTo4digits } from '../services/kidManager';

describe('calculateAge', () => {
  it('returns age in months for a child under 2', () => {
    const today = new Date();
    const tenMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 10, today.getDate());
    const birthDate = `${String(tenMonthsAgo.getDate()).padStart(2, '0')}/${String(tenMonthsAgo.getMonth() + 1).padStart(2, '0')}/${tenMonthsAgo.getFullYear()}`;
    const age = calculateAge(birthDate);
    expect(age).toBe(10);
  });

  it('returns age in years for a child of 5', () => {
    const today = new Date();
    const fiveYearsAgo = new Date(today.getFullYear() - 5, today.getMonth(), today.getDate());
    const birthDate = `${String(fiveYearsAgo.getDate()).padStart(2, '0')}/${String(fiveYearsAgo.getMonth() + 1).padStart(2, '0')}/${fiveYearsAgo.getFullYear()}`;
    const age = calculateAge(birthDate);
    expect(age).toBe(5);
  });

  it('returns rounded-up age when birthday is within 3 months ahead', () => {
    const today = new Date();
    // A child who just turned 4 today should be 4
    const fourYearsAgo = new Date(today.getFullYear() - 4, today.getMonth(), today.getDate());
    const birthDate = `${String(fourYearsAgo.getDate()).padStart(2, '0')}/${String(fourYearsAgo.getMonth() + 1).padStart(2, '0')}/${fourYearsAgo.getFullYear()}`;
    const age = calculateAge(birthDate);
    expect(age).toBe(4);
  });

  it('handles dot-separated birth dates after sanitization', () => {
    const today = new Date();
    const sevenYearsAgo = new Date(today.getFullYear() - 7, today.getMonth(), today.getDate());
    const birthDate = `${String(sevenYearsAgo.getDate()).padStart(2, '0')}.${String(sevenYearsAgo.getMonth() + 1).padStart(2, '0')}.${sevenYearsAgo.getFullYear()}`;
    const age = calculateAge(birthDate);
    expect(age).toBe(7);
  });
});

describe('updateDateYearTo4digits', () => {
  it('returns 4-digit year unchanged', () => {
    expect(updateDateYearTo4digits('15/06/2020')).toBe('15/06/2020');
  });

  it('converts 2-digit year in the past to 20xx', () => {
    const result = updateDateYearTo4digits('15/06/10');
    expect(result).toBe('15/06/2010');
  });

  it('converts 2-digit year that would be in the future to 19xx', () => {
    const today = new Date();
    const currentYearLast2 = today.getFullYear() % 100;
    // Use a year that is clearly > current 2-digit year → should become 19xx
    const futureYear = String(currentYearLast2 + 5).padStart(2, '0');
    const result = updateDateYearTo4digits(`01/01/${futureYear}`);
    expect(result).toBe(`01/01/19${futureYear}`);
  });

  it('throws on missing date parts', () => {
    expect(() => updateDateYearTo4digits('')).toThrow();
  });

  it('throws on invalid year length', () => {
    expect(() => updateDateYearTo4digits('01/01/2')).toThrow();
  });
});
