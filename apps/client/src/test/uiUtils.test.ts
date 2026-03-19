import { describe, it, expect } from 'vitest';
import { timeAndDateFormatter } from '../services/uiUtils';

describe('timeAndDateFormatter', () => {
  describe('formatHourInput', () => {
    it('returns digits as-is when 2 or fewer', () => {
      expect(timeAndDateFormatter.formatHourInput('9')).toBe('9');
      expect(timeAndDateFormatter.formatHourInput('12')).toBe('12');
    });

    it('formats 4 digits as HH:mm', () => {
      expect(timeAndDateFormatter.formatHourInput('1430')).toBe('14:30');
    });

    it('strips non-digit characters before formatting', () => {
      expect(timeAndDateFormatter.formatHourInput('14:30')).toBe('14:30');
      expect(timeAndDateFormatter.formatHourInput('ab12cd')).toBe('12');
    });
  });

  describe('validateHourFormat', () => {
    it('validates correct times', () => {
      expect(timeAndDateFormatter.validateHourFormat('00:00')).toBe(true);
      expect(timeAndDateFormatter.validateHourFormat('23:59')).toBe(true);
      expect(timeAndDateFormatter.validateHourFormat('08:30')).toBe(true);
    });

    it('rejects invalid hours', () => {
      expect(timeAndDateFormatter.validateHourFormat('24:00')).toBe(false);
      expect(timeAndDateFormatter.validateHourFormat('12:60')).toBe(false);
    });
  });

  describe('formatDateForUI', () => {
    it('returns empty string for empty input', () => {
      expect(timeAndDateFormatter.formatDateForUI('')).toBe('');
    });

    it('formats a DD/MM/YYYY date correctly', () => {
      expect(timeAndDateFormatter.formatDateForUI('05/03/2025')).toBe('05/03/2025');
    });

    it('formats a JS Date string correctly', () => {
      const d = new Date(2025, 2, 5); // March 5 2025
      expect(timeAndDateFormatter.formatDateForUI(d.toString())).toBe('05/03/2025');
    });

    it('returns empty string for invalid date', () => {
      expect(timeAndDateFormatter.formatDateForUI('not-a-date')).toBe('');
    });
  });

  describe('formatDateForCalc', () => {
    it('returns empty string for empty input', () => {
      expect(timeAndDateFormatter.formatDateForCalc('')).toBe('');
    });

    it('converts DD/MM/YYYY to a JS Date string', () => {
      const result = timeAndDateFormatter.formatDateForCalc('05/03/2025');
      const parsed = new Date(result);
      expect(parsed.getFullYear()).toBe(2025);
      expect(parsed.getMonth()).toBe(2); // March = 2
      expect(parsed.getDate()).toBe(5);
    });

    it('returns empty string for an invalid date', () => {
      expect(timeAndDateFormatter.formatDateForCalc('not-a-date')).toBe('');
    });
  });

  describe('sanitizedBirthDate', () => {
    it('replaces dots with slashes', () => {
      expect(timeAndDateFormatter.sanitizedBirthDate('01.01.2020')).toBe('01/01/2020');
    });

    it('returns empty string for empty input', () => {
      expect(timeAndDateFormatter.sanitizedBirthDate('')).toBe('');
    });

    it('leaves slashes unchanged', () => {
      expect(timeAndDateFormatter.sanitizedBirthDate('01/01/2020')).toBe('01/01/2020');
    });
  });

  describe('dateToString', () => {
    it('returns empty string for null', () => {
      expect(timeAndDateFormatter.dateToString(null)).toBe('');
    });

    it('formats a Date object to DD/MM/YY', () => {
      const result = timeAndDateFormatter.dateToString(new Date(2025, 2, 5));
      // format is DD/MM/YY (last 2 digits of year)
      expect(result).toBe('05/03/25');
    });
  });
});
