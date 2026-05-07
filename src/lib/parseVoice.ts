import { wordsToNumberPtBr } from './numberWordsPtBr';
import { HEIGHT_MAX, HEIGHT_MIN, WEIGHT_MAX, WEIGHT_MIN } from './bmi';

export interface ParsedVoice {
  weightKg?: number;
  heightM?: number;
  command?: VoiceCommand;
  raw: string;
}

export type VoiceCommand =
  | 'calculate'
  | 'clear'
  | 'repeat'
  | 'history'
  | 'darkMode'
  | 'lightMode'
  | 'switchProfile';

const COMMANDS: Array<{ re: RegExp; cmd: VoiceCommand }> = [
  { re: /\b(calcular|calcula)\b/i, cmd: 'calculate' },
  { re: /\b(limpar|apagar|resetar)\b/i, cmd: 'clear' },
  { re: /\b(repetir|repete)\b/i, cmd: 'repeat' },
  { re: /\b(historico)\b/i, cmd: 'history' },
  { re: /\b(modo escuro|tema escuro|escuro)\b/i, cmd: 'darkMode' },
  { re: /\b(modo claro|tema claro|claro)\b/i, cmd: 'lightMode' },
  { re: /\b(trocar perfil|mudar perfil)\b/i, cmd: 'switchProfile' }
];

const stripDiacritics = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '');

const WEIGHT_KEYWORDS = new Set([
  'peso', 'quilos', 'quilo', 'kg', 'kilos', 'kilo'
]);

const HEIGHT_KEYWORDS = new Set([
  'altura', 'metros', 'metro', 'm', 'cm', 'centimetros', 'centimetro', 'estatura'
]);

const NUMBER_WORDS = new Set([
  'zero','um','uma','dois','duas','tres','quatro','cinco','seis','meia','sete','oito','nove',
  'dez','onze','doze','treze','catorze','quatorze','quinze','dezesseis','dezessete','dezoito','dezenove',
  'vinte','trinta','quarenta','cinquenta','sessenta','setenta','oitenta','noventa',
  'cem','cento','duzentos','duzentas','trezentos','trezentas','quatrocentos','quatrocentas',
  'quinhentos','quinhentas','seiscentos','seiscentas','setecentos','setecentas',
  'oitocentos','oitocentas','novecentos','novecentas',
  'mil','milhao','milhoes','meio'
]);

const CONNECTORS = new Set(['e', 'virgula', 'ponto']);

/**
 * Try to convert a Portuguese expression to a number. Accepts digits,
 * comma decimals, and number words. Returns null when nothing usable.
 */
export function parseNumberPtBr(input: string): number | null {
  if (!input) return null;
  const cleaned = stripDiacritics(input).toLowerCase().trim();
  if (!cleaned) return null;
  const numMatch = cleaned.match(/(\d+(?:[.,]\d+)?)/);
  if (numMatch) return Number(numMatch[1].replace(',', '.'));
  return wordsToNumberPtBr(cleaned);
}

export function normalizeWeight(value: number): number | null {
  if (!Number.isFinite(value)) return null;
  if (value >= WEIGHT_MIN && value <= WEIGHT_MAX) return round1(value);
  return null;
}

/**
 * Heuristic: 0.5–2.5 → already meters; 50–250 → centimeters; otherwise null.
 */
export function normalizeHeight(value: number): number | null {
  if (!Number.isFinite(value)) return null;
  if (value >= HEIGHT_MIN && value <= HEIGHT_MAX) return round2(value);
  if (value >= 50 && value <= 250) return round2(value / 100);
  return null;
}

function round1(n: number) { return Math.round(n * 10) / 10; }
function round2(n: number) { return Math.round(n * 100) / 100; }

function detectCommand(text: string): VoiceCommand | undefined {
  for (const { re, cmd } of COMMANDS) if (re.test(text)) return cmd;
  return undefined;
}

type Target = 'weight' | 'height' | null;

/**
 * Parse a transcript that may contain weight, height and/or a command.
 * Walks tokens left-to-right. Keywords like "peso"/"altura"/"kg"/"metros"
 * switch the current target slot. Number tokens (digit literals or word
 * numbers) are accumulated into a phrase and flushed on every keyword,
 * digit literal, or unrecognized word.
 */
export function parseVoice(transcript: string): ParsedVoice {
  const raw = transcript ?? '';
  const text = stripDiacritics(raw).toLowerCase().replace(/[^\d.,a-z\s]/g, ' ');
  const command = detectCommand(text);
  const result: ParsedVoice = { raw, command };

  const tokens = text.match(/\d+(?:[.,]\d+)?|[a-z]+/g) ?? [];

  let target: Target = null;
  let phrase: string[] = [];

  const tryAssign = (value: number): boolean => {
    if (target === 'weight' && result.weightKg == null) {
      const w = normalizeWeight(value);
      if (w != null) { result.weightKg = w; return true; }
    }
    if (target === 'height' && result.heightM == null) {
      const h = normalizeHeight(value);
      if (h != null) { result.heightM = h; return true; }
    }
    if (result.weightKg == null) {
      const w = normalizeWeight(value);
      if (w != null) { result.weightKg = w; return true; }
    }
    if (result.heightM == null) {
      const h = normalizeHeight(value);
      if (h != null) { result.heightM = h; return true; }
    }
    return false;
  };

  const flush = () => {
    if (phrase.length === 0) return;
    const value = parseNumberPtBr(phrase.join(' '));
    phrase = [];
    if (value == null) return;
    tryAssign(value);
  };

  for (const tok of tokens) {
    if (WEIGHT_KEYWORDS.has(tok)) { flush(); target = 'weight'; continue; }
    if (HEIGHT_KEYWORDS.has(tok)) { flush(); target = 'height'; continue; }

    const isDigit = /^\d+(?:[.,]\d+)?$/.test(tok);
    if (isDigit) {
      flush();
      phrase = [tok];
      flush();
      continue;
    }
    if (NUMBER_WORDS.has(tok) || CONNECTORS.has(tok)) {
      phrase.push(tok);
      continue;
    }
    flush();
  }
  flush();

  return result;
}
