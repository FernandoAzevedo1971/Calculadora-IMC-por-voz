import { describe, expect, it } from 'vitest';
import { calcBmi, classifyBmi, healthyWeightRange, idealWeightDevine, validate } from '@/lib/bmi';

describe('calcBmi', () => {
  it('computes BMI for typical values', () => {
    expect(calcBmi(75, 1.78)).toBeCloseTo(23.67, 2);
    expect(calcBmi(60, 1.6)).toBeCloseTo(23.44, 2);
  });
  it('returns NaN for invalid input', () => {
    expect(calcBmi(0, 0)).toBeNaN();
    expect(calcBmi(70, 0)).toBeNaN();
    expect(calcBmi(NaN, 1.7)).toBeNaN();
  });
});

describe('classifyBmi', () => {
  it.each([
    [16, 'underweight'],
    [18.4, 'underweight'],
    [18.5, 'normal'],
    [22, 'normal'],
    [24.99, 'normal'],
    [25, 'overweight'],
    [29.9, 'overweight'],
    [30, 'obesity1'],
    [34.9, 'obesity1'],
    [35, 'obesity2'],
    [39.9, 'obesity2'],
    [40, 'obesity3'],
    [55, 'obesity3']
  ])('IMC %s → %s', (bmi, key) => {
    expect(classifyBmi(bmi).key).toBe(key);
  });
});

describe('validate', () => {
  it('accepts plausible values', () => {
    expect(validate(70, 1.7).ok).toBe(true);
  });
  it('rejects out-of-range values', () => {
    expect(validate(5, 1.7).ok).toBe(false);
    expect(validate(70, 0.1).ok).toBe(false);
    expect(validate(70, 5).ok).toBe(false);
  });
});

describe('healthyWeightRange', () => {
  it('returns inclusive bounds for given height', () => {
    const [min, max] = healthyWeightRange(1.78);
    expect(min).toBeCloseTo(58.62, 1);
    expect(max).toBeCloseTo(78.89, 1);
  });
});

describe('idealWeightDevine', () => {
  it('matches Devine formula for men', () => {
    expect(idealWeightDevine(1.78, 'M')).toBeCloseTo(73.18, 1);
  });
  it('matches Devine formula for women', () => {
    expect(idealWeightDevine(1.65, 'F')).toBeCloseTo(56.91, 1);
  });
});
