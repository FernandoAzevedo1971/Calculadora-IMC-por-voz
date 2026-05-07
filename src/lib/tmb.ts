import type { Sex } from './bmi';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'intense' | 'athlete';

export const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  intense: 1.725,
  athlete: 1.9
};

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: 'Sedentário',
  light: 'Atividade leve',
  moderate: 'Atividade moderada',
  intense: 'Atividade intensa',
  athlete: 'Atleta'
};

export function calcTmb(params: { weightKg: number; heightM: number; ageYears: number; sex: Sex }): number {
  const { weightKg, heightM, ageYears, sex } = params;
  if (!Number.isFinite(weightKg) || !Number.isFinite(heightM) || !Number.isFinite(ageYears)) return NaN;
  const heightCm = heightM * 100;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
  if (sex === 'M') return base + 5;
  if (sex === 'F') return base - 161;
  return base - 78;
}

export function calcCalories(tmb: number, level: ActivityLevel): number {
  return tmb * ACTIVITY_FACTORS[level];
}

export function ageFromBirthDate(iso: string, now = new Date()): number {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return NaN;
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}
