import { describe, expect, it } from 'vitest';
import { normalizeHeight, normalizeWeight, parseNumberPtBr, parseVoice } from '@/lib/parseVoice';

describe('parseNumberPtBr', () => {
  it('handles digits and commas', () => {
    expect(parseNumberPtBr('75')).toBe(75);
    expect(parseNumberPtBr('1,78')).toBe(1.78);
    expect(parseNumberPtBr('peso 80 quilos')).toBe(80);
  });
  it('falls back to words when no digits', () => {
    expect(parseNumberPtBr('setenta e cinco')).toBe(75);
  });
});

describe('normalizeWeight / normalizeHeight', () => {
  it('weight passes through plausible kg', () => {
    expect(normalizeWeight(75)).toBe(75);
    expect(normalizeWeight(15)).toBeNull();
    expect(normalizeWeight(400)).toBeNull();
  });
  it('height accepts both meters and cm', () => {
    expect(normalizeHeight(1.78)).toBe(1.78);
    expect(normalizeHeight(178)).toBe(1.78);
    expect(normalizeHeight(40)).toBeNull();
  });
});

describe('parseVoice', () => {
  it('extracts weight and height from a digit utterance', () => {
    const r = parseVoice('peso 75 kg altura 1,78 metros');
    expect(r.weightKg).toBe(75);
    expect(r.heightM).toBe(1.78);
  });

  it('extracts when only numbers are given (heuristic order)', () => {
    const r = parseVoice('75 178');
    expect(r.weightKg).toBe(75);
    expect(r.heightM).toBe(1.78);
  });

  it('handles word numbers in pt-BR', () => {
    const r = parseVoice('peso setenta e cinco quilos altura cento e setenta e oito centímetros');
    expect(r.weightKg).toBe(75);
    expect(r.heightM).toBe(1.78);
  });

  it('detects commands', () => {
    expect(parseVoice('calcular agora').command).toBe('calculate');
    expect(parseVoice('limpar tudo').command).toBe('clear');
    expect(parseVoice('modo escuro por favor').command).toBe('darkMode');
  });

  it('keeps raw transcript', () => {
    const r = parseVoice('  oi mundo  ');
    expect(r.raw).toBe('  oi mundo  ');
    expect(r.weightKg).toBeUndefined();
    expect(r.heightM).toBeUndefined();
  });
});

describe('parseVoice — "N metro(s) e M" height pattern', () => {
  it('"um metro e 62" → 1.62m', () => {
    expect(parseVoice('um metro e 62').heightM).toBe(1.62);
  });

  it('"um metro e oitenta" → 1.80m', () => {
    expect(parseVoice('um metro e oitenta').heightM).toBe(1.80);
  });

  it('"um metro e setenta e oito" → 1.78m', () => {
    expect(parseVoice('um metro e setenta e oito').heightM).toBe(1.78);
  });

  it('"dois metros" alone finalizes to 2.0m', () => {
    expect(parseVoice('dois metros').heightM).toBe(2.0);
  });

  it('"1 metro e 78" (digit form) → 1.78m', () => {
    expect(parseVoice('1 metro e 78').heightM).toBe(1.78);
  });

  it('height-first utterance with meter pattern', () => {
    const r = parseVoice('altura um metro e 62 peso setenta e cinco quilos');
    expect(r.weightKg).toBe(75);
    expect(r.heightM).toBe(1.62);
  });

  it('weight-first utterance with meter pattern', () => {
    const r = parseVoice('peso setenta e cinco quilos um metro e setenta e oito');
    expect(r.weightKg).toBe(75);
    expect(r.heightM).toBe(1.78);
  });

  it('height-first no label keyword: "um metro e setenta e oito setenta e cinco quilos"', () => {
    const r = parseVoice('um metro e setenta e oito setenta e cinco quilos');
    expect(r.heightM).toBe(1.78);
    expect(r.weightKg).toBe(75);
  });

  it('weight words + "um metro" without keyword between: "setenta e cinco um metro e setenta e oito"', () => {
    const r = parseVoice('setenta e cinco um metro e setenta e oito');
    expect(r.weightKg).toBe(75);
    expect(r.heightM).toBe(1.78);
  });

  it('accumulated transcript: finals joined with space', () => {
    // Simulates two separate final results joined in sr.transcript
    const r = parseVoice('um metro e setenta e oito setenta e cinco quilos');
    expect(r.heightM).toBe(1.78);
    expect(r.weightKg).toBe(75);
  });

  it('"um metro e oitenta e cinco setenta quilos" — height 1.85, weight 70', () => {
    const r = parseVoice('um metro e oitenta e cinco setenta quilos');
    expect(r.heightM).toBe(1.85);
    expect(r.weightKg).toBe(70);
  });
});
