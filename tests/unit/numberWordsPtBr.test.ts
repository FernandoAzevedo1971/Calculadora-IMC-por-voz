import { describe, expect, it } from 'vitest';
import { wordsToNumberPtBr } from '@/lib/numberWordsPtBr';

describe('wordsToNumberPtBr', () => {
  it.each([
    ['zero', 0],
    ['um', 1],
    ['quinze', 15],
    ['vinte', 20],
    ['vinte e cinco', 25],
    ['setenta e cinco', 75],
    ['cento e vinte', 120],
    ['duzentos e cinquenta', 250],
    ['mil', 1000],
    ['mil e quinhentos', 1500],
    ['um e meio', 1.5],
    ['setenta e cinco vírgula três', 75.3],
    ['vinte e três vírgula sessenta e seis', 23.66],
    ['cento e setenta e oito', 178]
  ])('"%s" → %s', (input, expected) => {
    expect(wordsToNumberPtBr(input)).toBeCloseTo(expected, 5);
  });

  it('returns null for empty/garbage', () => {
    expect(wordsToNumberPtBr('')).toBeNull();
    expect(wordsToNumberPtBr('xyzabc nada aqui')).toBeNull();
  });
});
