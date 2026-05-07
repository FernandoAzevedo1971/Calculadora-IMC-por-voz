const UNITS: Record<string, number> = {
  zero: 0, um: 1, uma: 1, dois: 2, duas: 2, tres: 3, 'três': 3, quatro: 4, cinco: 5,
  seis: 6, meia: 6, sete: 7, oito: 8, nove: 9
};

const TEENS: Record<string, number> = {
  dez: 10, onze: 11, doze: 12, treze: 13, catorze: 14, quatorze: 14, quinze: 15,
  dezesseis: 16, dezessete: 17, dezoito: 18, dezenove: 19
};

const TENS: Record<string, number> = {
  vinte: 20, trinta: 30, quarenta: 40, cinquenta: 50, 'cinqüenta': 50,
  sessenta: 60, setenta: 70, oitenta: 80, noventa: 90
};

const HUNDREDS: Record<string, number> = {
  cem: 100, cento: 100, duzentos: 200, duzentas: 200, trezentos: 300, trezentas: 300,
  quatrocentos: 400, quatrocentas: 400, quinhentos: 500, quinhentas: 500,
  seiscentos: 600, seiscentas: 600, setecentos: 700, setecentas: 700,
  oitocentos: 800, oitocentas: 800, novecentos: 900, novecentas: 900
};

const SCALES: Record<string, number> = { mil: 1000, milhao: 1_000_000, 'milhão': 1_000_000, milhoes: 1_000_000, 'milhões': 1_000_000 };

const stripDiacritics = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/**
 * Converts a Portuguese number phrase into a number.
 * Returns null if the phrase doesn't yield a valid number.
 * Supports up to thousands; "vírgula" / "ponto" introduce decimals.
 * "meio" after an integer adds 0.5 (e.g. "um metro e meio" → 1.5).
 */
export function wordsToNumberPtBr(input: string): number | null {
  if (!input) return null;
  const norm = stripDiacritics(input).replace(/[.,]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!norm) return null;

  // Split on decimal markers ("virgula" / "ponto") if any
  const decRegex = /\b(virgula|ponto)\b/;
  let intPart = norm;
  let fracPart = '';
  const m = norm.match(decRegex);
  if (m && m.index !== undefined) {
    intPart = norm.slice(0, m.index).trim();
    fracPart = norm.slice(m.index + m[0].length).trim();
  }

  const intVal = parsePtBrInteger(intPart);
  if (intVal === null) return null;

  if (!fracPart) return intVal;

  // Decimal part: parse digit-by-digit OR as a single number
  // Prefer digit-by-digit because "vinte e três vírgula sessenta e seis" → 23.66
  // Try integer first, then prepend zeros if needed
  const fracTokens = fracPart.split(' ').filter(Boolean);
  let fracStr = '';
  // Heuristic: if all tokens are unit/teen and length<=3, parse digit-by-digit
  const allDigits = fracTokens.every((t) => t in UNITS || t in TEENS || t === 'e');
  if (allDigits) {
    for (const t of fracTokens) {
      if (t === 'e') continue;
      if (t in UNITS) fracStr += UNITS[t].toString();
      else if (t in TEENS) fracStr += TEENS[t].toString();
    }
  } else {
    const fracInt = parsePtBrInteger(fracPart);
    if (fracInt === null) return intVal;
    fracStr = String(fracInt);
  }

  if (!fracStr) return intVal;
  return Number(`${intVal}.${fracStr}`);
}

function parsePtBrInteger(text: string): number | null {
  if (!text) return null;
  // pure digits short-circuit
  if (/^\d+$/.test(text)) return Number(text);

  const tokens = text.split(' ').filter((t) => t && t !== 'de');

  let total = 0;
  let current = 0;
  let touched = false;
  let halfBonus = 0;

  for (const tok of tokens) {
    if (tok === 'e') continue;
    if (tok === 'meio' || tok === 'meia') {
      // "um e meio" → +0.5 (only when paired with integer context)
      halfBonus = 0.5;
      touched = true;
      continue;
    }
    if (/^\d+$/.test(tok)) {
      current += Number(tok);
      touched = true;
      continue;
    }
    if (tok in UNITS) { current += UNITS[tok]; touched = true; continue; }
    if (tok in TEENS) { current += TEENS[tok]; touched = true; continue; }
    if (tok in TENS)  { current += TENS[tok];  touched = true; continue; }
    if (tok in HUNDREDS) { current += HUNDREDS[tok]; touched = true; continue; }
    if (tok in SCALES) {
      const scale = SCALES[tok];
      if (current === 0) current = 1;
      total += current * scale;
      current = 0;
      touched = true;
      continue;
    }
    // unknown token — ignore but don't fail outright
  }

  if (!touched) return null;
  const value = total + current + halfBonus;
  return value;
}
