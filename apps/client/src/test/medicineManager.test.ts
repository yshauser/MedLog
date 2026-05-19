import { describe, it, expect, beforeEach } from 'vitest';
import { MedicineManager } from '../services/medicineManager';
import { MedicineType } from '../types';
// MedicineType now includes: Suppositories, OralDrops, Inhalers, Ointments

const mockSuspensionMedicine = {
  id: 'acamol-sus',
  name: 'Acamol Suspension',
  hebName: 'אקמול תרחיף',
  type: MedicineType.Suspension,
  concentration: '160mg/5ml',
  targetAudience: 'ילדים',
  activeIngredient: 'paracetamol',
  entries: [
    { w_low: 5, w_high: 9, dos: 5, perDay_low: 3, perDay_high: 4, maxDay: 20, maxDayPerKg: 75 },
    { w_low: 10, w_high: 15, dos: 7.5, perDay_low: 3, perDay_high: 4, maxDay: 30, maxDayPerKg: 75 },
    { w_low: 16, w_high: 22, dos: 10, perDay_low: 3, perDay_high: 4, maxDay: 40, maxDayPerKg: 75 },
  ],
};

const mockCapletMedicine = {
  id: 'acamol-cap',
  name: 'Acamol Caplets',
  hebName: 'אקמול קפליות',
  type: MedicineType.Caplets,
  strength: '500mg',
  targetAudience: 'מבוגרים',
  activeIngredient: 'paracetamol',
  entries: [
    { age_low: 12, dos_low: 1, dos_high: 2, hoursInterval_low: 4, hoursInterval_high: 6, maxDay: 8 },
  ],
};

describe('MedicineManager.calculateDosage', () => {
  beforeEach(() => {
    // Inject mock medicines directly into the private static field
    (MedicineManager as any).medicineGroups = [
      { name: mockSuspensionMedicine.hebName, data: [mockSuspensionMedicine] },
      { name: mockCapletMedicine.hebName, data: [mockCapletMedicine] },
    ];
  });

  describe('suspension medicines (weight-based)', () => {
    it('returns correct dose for a weight in the first range', () => {
      expect(MedicineManager.calculateDosage('אקמול תרחיף', 7, undefined)).toBe('5 מ"ל');
    });

    it('returns correct dose for a weight in the second range', () => {
      expect(MedicineManager.calculateDosage('אקמול תרחיף', 12, undefined)).toBe('7.5 מ"ל');
    });

    it('returns correct dose for a weight in the third range', () => {
      expect(MedicineManager.calculateDosage('אקמול תרחיף', 18, undefined)).toBe('10 מ"ל');
    });

    it('returns mismatch message for weight outside all ranges', () => {
      expect(MedicineManager.calculateDosage('אקמול תרחיף', 50, undefined)).toBe('תרופה לא תואמת גיל/משקל');
    });
  });

  describe('caplet medicines (age-based)', () => {
    it('returns single dose when dos_low equals dos_high', () => {
      expect(MedicineManager.calculateDosage('אקמול קפליות', undefined, 14)).toBe('1-2 קפליות');
    });

    it('returns mismatch message for age below the entry range', () => {
      expect(MedicineManager.calculateDosage('אקמול קפליות', undefined, 10)).toBe('תרופה לא תואמת גיל/משקל');
    });
  });

  describe('unknown medicine', () => {
    it('returns empty string for unknown medicine name', () => {
      expect(MedicineManager.calculateDosage('תרופה לא קיימת', 10, 5)).toBe('');
    });
  });
});

describe('MedicineManager.findMedicineByName', () => {
  beforeEach(() => {
    (MedicineManager as any).medicineGroups = [
      { name: mockSuspensionMedicine.hebName, data: [mockSuspensionMedicine] },
    ];
  });

  it('finds a medicine by its Hebrew name', () => {
    const med = MedicineManager.findMedicineByName('אקמול תרחיף');
    expect(med).toBeDefined();
    expect(med?.id).toBe('acamol-sus');
  });

  it('returns undefined for an unknown name', () => {
    expect(MedicineManager.findMedicineByName('לא קיים')).toBeUndefined();
  });
});

const mockSuppositoriesMedicine = {
  id: 'supp-1',
  name: 'Suppoctal',
  hebName: 'סופוקטל',
  type: MedicineType.Suppositories,
  strength: '125mg',
  targetAudience: 'ילדים',
  activeIngredient: 'paracetamol',
  entries: [
    { age_low: 0, age_high: 2, dos_low: 1, dos_high: 1, hoursInterval_low: 6, hoursInterval_high: 8, maxDay: 4 },
  ],
};

const mockOralDropsMedicine = {
  id: 'drops-1',
  name: 'Acamol Drops',
  hebName: 'אקמול טיפות',
  type: MedicineType.OralDrops,
  strength: '100mg/ml',
  targetAudience: 'ילדים',
  activeIngredient: 'paracetamol',
  entries: [
    { age_low: 0, age_high: 1, dos_low: 2, dos_high: 3, hoursInterval_low: 6, hoursInterval_high: 8, maxDay: 4 },
  ],
};

const mockInhalersMedicine = {
  id: 'inh-1',
  name: 'Ventolin',
  hebName: 'ונטולין',
  type: MedicineType.Inhalers,
  strength: '100mcg',
  targetAudience: 'כולם',
  activeIngredient: 'salbutamol',
  entries: [
    { age_low: 4, age_high: undefined, dos_low: 1, dos_high: 2, hoursInterval_low: 4, hoursInterval_high: 6, maxDay: 8 },
  ],
};

const mockOintmentsMedicine = {
  id: 'oint-1',
  name: 'Fucidin',
  hebName: 'פוסידין',
  type: MedicineType.Ointments,
  strength: '2%',
  targetAudience: 'כולם',
  activeIngredient: 'fusidic acid',
  entries: [
    { age_low: 0, age_high: undefined, dos_low: 1, dos_high: 1, hoursInterval_low: 8, hoursInterval_high: 12, maxDay: 3 },
  ],
};

describe('MedicineManager.calculateDosage - new types', () => {
  beforeEach(() => {
    (MedicineManager as any).medicineGroups = [
      { name: mockSuppositoriesMedicine.hebName, data: [mockSuppositoriesMedicine] },
      { name: mockOralDropsMedicine.hebName, data: [mockOralDropsMedicine] },
      { name: mockInhalersMedicine.hebName, data: [mockInhalersMedicine] },
      { name: mockOintmentsMedicine.hebName, data: [mockOintmentsMedicine] },
    ];
  });

  it('returns correct dose for suppositories', () => {
    expect(MedicineManager.calculateDosage('סופוקטל', undefined, 1)).toBe('1 פתילות');
  });

  it('returns mismatch for suppositories outside range', () => {
    expect(MedicineManager.calculateDosage('סופוקטל', undefined, 5)).toBe('תרופה לא תואמת גיל/משקל');
  });

  it('returns correct dose range for oral drops', () => {
    expect(MedicineManager.calculateDosage('אקמול טיפות', undefined, 0)).toBe('2-3 טיפות');
  });

  it('returns correct dose for inhalers', () => {
    expect(MedicineManager.calculateDosage('ונטולין', undefined, 6)).toBe('1-2 שאיפות');
  });

  it('returns correct dose for ointments', () => {
    expect(MedicineManager.calculateDosage('פוסידין', undefined, 10)).toBe('1 כמות למריחה');
  });
});

describe('MedicineManager.findMedicinesByActiveIngredient', () => {
  beforeEach(() => {
    (MedicineManager as any).medicineGroups = [
      { name: mockSuspensionMedicine.hebName, data: [mockSuspensionMedicine] },
      { name: mockCapletMedicine.hebName, data: [mockCapletMedicine] },
    ];
  });

  it('returns all medicines with the given active ingredient', () => {
    const results = MedicineManager.findMedicinesByActiveIngredient('paracetamol');
    expect(results).toHaveLength(2);
  });

  it('returns empty array for unknown ingredient', () => {
    expect(MedicineManager.findMedicinesByActiveIngredient('ibuprofen')).toHaveLength(0);
  });
});
