export type BmiClassKey =
  | 'underweight'
  | 'normal'
  | 'overweight'
  | 'obesity1'
  | 'obesity2'
  | 'obesity3';

export interface BmiClass {
  key: BmiClassKey;
  label: string;
  shortLabel: string;
  min: number;
  max: number;
  color: string;
  textColor: string;
}

export const BMI_CLASSES: BmiClass[] = [
  { key: 'underweight', label: 'Abaixo do peso',     shortLabel: 'Abaixo', min: 0,    max: 18.5, color: '#3b82f6', textColor: '#fff' },
  { key: 'normal',      label: 'Peso normal',        shortLabel: 'Normal', min: 18.5, max: 25,   color: '#22c55e', textColor: '#fff' },
  { key: 'overweight',  label: 'Sobrepeso',          shortLabel: 'Sobrep.', min: 25,  max: 30,   color: '#eab308', textColor: '#000' },
  { key: 'obesity1',    label: 'Obesidade grau I',   shortLabel: 'Ob. I',  min: 30,  max: 35,   color: '#f97316', textColor: '#fff' },
  { key: 'obesity2',    label: 'Obesidade grau II',  shortLabel: 'Ob. II', min: 35,  max: 40,   color: '#ef4444', textColor: '#fff' },
  { key: 'obesity3',    label: 'Obesidade grau III', shortLabel: 'Ob. III', min: 40, max: Infinity, color: '#7f1d1d', textColor: '#fff' }
];

export function calcBmi(weightKg: number, heightM: number): number {
  if (!Number.isFinite(weightKg) || !Number.isFinite(heightM) || heightM <= 0) return NaN;
  return weightKg / (heightM * heightM);
}

export function classifyBmi(bmi: number): BmiClass {
  if (!Number.isFinite(bmi)) return BMI_CLASSES[1];
  return (
    BMI_CLASSES.find((c) => bmi >= c.min && bmi < c.max) ?? BMI_CLASSES[BMI_CLASSES.length - 1]
  );
}

export interface ValidationResult {
  ok: boolean;
  reason?: string;
}

export const WEIGHT_MIN = 20;
export const WEIGHT_MAX = 300;
export const HEIGHT_MIN = 0.5;
export const HEIGHT_MAX = 2.5;

export function validate(weightKg: number, heightM: number): ValidationResult {
  if (!Number.isFinite(weightKg) || weightKg < WEIGHT_MIN || weightKg > WEIGHT_MAX) {
    return { ok: false, reason: `Peso fora da faixa (${WEIGHT_MIN}–${WEIGHT_MAX} kg).` };
  }
  if (!Number.isFinite(heightM) || heightM < HEIGHT_MIN || heightM > HEIGHT_MAX) {
    return { ok: false, reason: `Altura fora da faixa (${HEIGHT_MIN}–${HEIGHT_MAX} m).` };
  }
  return { ok: true };
}

export function healthyWeightRange(heightM: number): [number, number] {
  return [18.5 * heightM * heightM, 24.9 * heightM * heightM];
}

export type Sex = 'M' | 'F' | 'O';

export function idealWeightDevine(heightM: number, sex: Sex): number {
  const inches = heightM * 39.3700787;
  const base = sex === 'F' ? 45.5 : 50;
  return base + 2.3 * (inches - 60);
}
