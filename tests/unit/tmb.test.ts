import { describe, expect, it } from 'vitest';
import { ageFromBirthDate, calcCalories, calcTmb } from '@/lib/tmb';

describe('calcTmb (Mifflin-St Jeor)', () => {
  it('male reference', () => {
    // 75kg, 1.78m, 30y, M → 10*75 + 6.25*178 - 5*30 + 5 = 1717.5
    expect(calcTmb({ weightKg: 75, heightM: 1.78, ageYears: 30, sex: 'M' })).toBeCloseTo(1717.5, 1);
  });
  it('female reference', () => {
    // 60kg, 1.65m, 28y, F → 10*60 + 6.25*165 - 5*28 - 161 = 1330.25
    expect(calcTmb({ weightKg: 60, heightM: 1.65, ageYears: 28, sex: 'F' })).toBeCloseTo(1330.25, 1);
  });
});

describe('calcCalories', () => {
  it('multiplies by activity factor', () => {
    expect(calcCalories(1700, 'sedentary')).toBeCloseTo(2040, 1);
    expect(calcCalories(1700, 'moderate')).toBeCloseTo(2635, 1);
  });
});

describe('ageFromBirthDate', () => {
  it('computes age relative to a fixed now', () => {
    const now = new Date('2026-05-07T00:00:00Z');
    expect(ageFromBirthDate('1990-01-15', now)).toBe(36);
    expect(ageFromBirthDate('1990-12-31', now)).toBe(35);
  });
});
