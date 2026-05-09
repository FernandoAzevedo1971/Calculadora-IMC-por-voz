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

// "altura"/"estatura" precede the number — flush first, then switch target
const HEIGHT_LABEL_KEYWORDS = new Set(['altura', 'estatura']);

// "metro"/"metros"/"m" follow the integer part of a meter value:
// "um metro e 62" → pendingMeterValue=1 then +0.62 → 1.62m
const HEIGHT_METER_UNIT_KEYWORDS = new Set(['metro', 'metros', 'm']);

// "cm"/"centimetros" follow a centimeter value; normalizeHeight converts /100
const HEIGHT_CM_UNIT_KEYWORDS = new Set(['cm', 'centimetro', 'centimetros']);

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

// Words that can only START an independent number phrase (tens, teens, hundreds, thousands).
// When one of these appears while a pending meter value is waiting for its cm fraction,
// the current phrase is flushed first — preventing "setenta e oito setenta e cinco"
// from being parsed as a single run-on number.
const PHRASE_STARTERS = new Set([
  'dez','onze','doze','treze','catorze','quatorze','quinze',
  'dezesseis','dezessete','dezoito','dezenove',
  'vinte','trinta','quarenta','cinquenta','sessenta','setenta','oitenta','noventa',
  'cem','cento','duzentos','duzentas','trezentos','trezentas','quatrocentos','quatrocentas',
  'quinhentos','quinhentas','seiscentos','seiscentas','setecentos','setecentas',
  'oitocentos','oitocentas','novecentos','novecentas','mil'
]);

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
 *
 * Handles "N metro(s) e M" patterns: "um metro e 62" → 1.62m.
 * When a METER_UNIT keyword is encountered after an integer height of 1 or 2,
 * that value is held as pendingMeterValue so the following number adds cm/100.
 */
export function parseVoice(transcript: string): ParsedVoice {
  const raw = transcript ?? '';
  const text = stripDiacritics(raw).toLowerCase().replace(/[^\d.,a-z\s]/g, ' ');
  const command = detectCommand(text);
  const result: ParsedVoice = { raw, command };

  const tokens = text.match(/\d+(?:[.,]\d+)?|[a-z]+/g) ?? [];

  let target: Target = null;
  let phrase: string[] = [];
  // Holds the integer meter part while waiting for the cm fraction ("um metro e 62")
  let pendingMeterValue: number | null = null;
  // True when the last height assignment was a whole integer 1 or 2 (candidate for pending)
  let lastAssignedWasWholeMeters = false;

  const finalizePendingMeter = () => {
    if (pendingMeterValue !== null) {
      if (result.heightM == null) result.heightM = round2(pendingMeterValue);
      pendingMeterValue = null;
      lastAssignedWasWholeMeters = false;
    }
  };

  const tryAssign = (value: number): boolean => {
    // If accumulating "N metro(s) e [cm]", consume the cm part first
    if (pendingMeterValue !== null) {
      if (value === 0.5) {
        // "um metro e meio" → 1.5m
        result.heightM = round2(pendingMeterValue + 0.5);
        pendingMeterValue = null;
        lastAssignedWasWholeMeters = false;
        return true;
      }
      if (value >= 0 && value <= 99 && Number.isInteger(value)) {
        result.heightM = round2(pendingMeterValue + value / 100);
        pendingMeterValue = null;
        lastAssignedWasWholeMeters = false;
        return true;
      }
      // Value outside cm range — finalize pending and fall through
      finalizePendingMeter();
    }

    if (target === 'weight' && result.weightKg == null) {
      const w = normalizeWeight(value);
      if (w != null) { result.weightKg = w; lastAssignedWasWholeMeters = false; return true; }
    }
    if (target === 'height' && result.heightM == null) {
      const h = normalizeHeight(value);
      if (h != null) {
        lastAssignedWasWholeMeters = Number.isInteger(value) && value >= 1 && value <= 2;
        result.heightM = h;
        return true;
      }
    }
    // Heuristic: no explicit target — try weight first, then height
    if (result.weightKg == null) {
      const w = normalizeWeight(value);
      if (w != null) { result.weightKg = w; lastAssignedWasWholeMeters = false; return true; }
    }
    if (result.heightM == null) {
      const h = normalizeHeight(value);
      if (h != null) {
        lastAssignedWasWholeMeters = Number.isInteger(value) && value >= 1 && value <= 2;
        result.heightM = h;
        return true;
      }
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
    if (WEIGHT_KEYWORDS.has(tok)) {
      flush();
      finalizePendingMeter();
      target = 'weight';
      lastAssignedWasWholeMeters = false;
      continue;
    }

    if (HEIGHT_LABEL_KEYWORDS.has(tok)) {
      flush();
      finalizePendingMeter();
      target = 'height';
      lastAssignedWasWholeMeters = false;
      continue;
    }

    if (HEIGHT_METER_UNIT_KEYWORDS.has(tok)) {
      // If phrase ends with "um"/"dois" and that word is NOT immediately preceded
      // by a connector (meaning it's isolated, not part of e.g. "vinte e dois"),
      // the preceding words are the weight and the last word starts the height meter.
      // e.g. "setenta e cinco um metro" → flush "setenta e cinco" as weight, then "um" as height.
      if (phrase.length > 1) {
        const last = phrase[phrase.length - 1];
        const beforeLast = phrase[phrase.length - 2];
        const lastIsMeter = last === 'um' || last === 'uma' || last === 'dois' || last === 'duas';
        const lastIsAttached = CONNECTORS.has(beforeLast);
        if (lastIsMeter && !lastIsAttached) {
          phrase = phrase.slice(0, -1);
          flush();
          finalizePendingMeter();
          phrase = [last];
        }
      }
      // Set target BEFORE flush so the preceding number is assigned as height
      target = 'height';
      flush();
      // If we just assigned a whole-meter integer (1 or 2), convert to pending
      // so the next number provides the centimeter fraction
      if (lastAssignedWasWholeMeters && result.heightM != null && result.heightM <= 2) {
        pendingMeterValue = result.heightM;
        result.heightM = undefined;
        lastAssignedWasWholeMeters = false;
      }
      continue;
    }

    if (HEIGHT_CM_UNIT_KEYWORDS.has(tok)) {
      finalizePendingMeter();
      target = 'height';
      flush();
      continue;
    }

    const isDigit = /^\d+(?:[.,]\d+)?$/.test(tok);
    if (isDigit) {
      flush();
      phrase = [tok];
      flush();
      continue;
    }
    if (NUMBER_WORDS.has(tok) || CONNECTORS.has(tok)) {
      // While waiting for the cm-fraction of "N metro e X", a PHRASE_STARTER word
      // signals that a new independent number is beginning — flush the current
      // phrase first to avoid bleeding across number boundaries.
      if (pendingMeterValue !== null && phrase.length > 0 && PHRASE_STARTERS.has(tok)) {
        flush();
      }
      phrase.push(tok);
      continue;
    }
    flush();
  }

  flush();
  finalizePendingMeter();

  return result;
}
