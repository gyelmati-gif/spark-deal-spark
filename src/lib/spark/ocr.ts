// Lazy-loaded OCR for serial-number data plates.
// Returns ranked candidate strings most likely to be a serial number.

let workerPromise: Promise<any> | null = null;

async function getWorker() {
  if (!workerPromise) {
    workerPromise = (async () => {
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker("eng");
      // Restrict charset to plate-like glyphs to reduce noise.
      await worker.setParameters({
        tessedit_char_whitelist:
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-/ :.#",
      });
      return worker;
    })();
  }
  return workerPromise;
}

export async function terminateOcr() {
  if (workerPromise) {
    try {
      const w = await workerPromise;
      await w.terminate();
    } catch {}
    workerPromise = null;
  }
}

export interface OcrCandidate {
  value: string;
  score: number;
  reason: string;
}

// Label families. Serial-family labels score highest; model-family lower
// (still surfaced as candidates because OCR sometimes mis-detects which is which).
// Matches with or without spacing/punctuation: "S/N:", "SN#", "SERIAL NO.", "SER#", "SERIAL:", etc.
// Also handles common OCR confusions like "5/N" or "S/M".
const SERIAL_LABEL_RE =
  /(?:\b|^)(?:S\s*[\/\\|]\s*[NM]|5\s*[\/\\|]\s*N|S\s*N|SER(?:IAL)?)\s*(?:NUMBER|NUM|NBR|NO|N|#)?\s*[:#=.\-]?\s*([A-Z0-9][A-Z0-9 \-\/]{3,28}[A-Z0-9])/gi;
const MODEL_LABEL_RE =
  /(?:\b|^)(?:MOD(?:EL)?|M\s*\/?\s*N|TYPE|CAT(?:ALOG)?)\s*(?:NUMBER|NUM|NO|N|#)?\s*[:#=.\-]?\s*([A-Z0-9][A-Z0-9 \-\/]{3,28}[A-Z0-9])/gi;
// Generic plate-like token. Allows internal single spaces so "AB-1234 5678" stays whole;
// we collapse spaces later when normalizing.
const TOKEN_RE = /[A-Z0-9](?:[A-Z0-9\-\/]| (?=[A-Z0-9])){4,28}[A-Z0-9]/g;

// Words that look like alphanumeric tokens but are almost never serials.
const STOPWORDS = new Set([
  "MODEL", "SERIAL", "NUMBER", "TYPE", "VOLTS", "VOLTAGE", "WATTS", "AMPS",
  "HERTZ", "PHASE", "MADE", "ASSEMBLED", "MANUFACTURED", "WARNING", "CAUTION",
  "DANGER", "LISTED", "TESTED", "RATED", "MAX", "MIN", "INPUT", "OUTPUT",
  "REFRIGERANT", "CHARGE", "COMPRESSOR", "MOTOR", "FAN", "HEATER", "COOLING",
  "HEATING", "CAPACITY", "BTU", "BTUH", "SEER", "EER", "HSPF", "AFUE",
  "GALLONS", "GALLON", "TANK", "ENERGY", "FACTOR", "DATE", "YEAR", "MONTH",
  "USA", "CHINA", "MEXICO", "KOREA", "JAPAN", "CANADA",
]);

function normalize(raw: string): string {
  // Collapse internal spaces, strip leading/trailing separators.
  return raw
    .replace(/\s+/g, "")
    .replace(/^[-\/.]+|[-\/.]+$/g, "");
}

function scoreToken(t: string): number {
  if (STOPWORDS.has(t)) return -100;
  const hasDigit = /\d/.test(t);
  const hasAlpha = /[A-Z]/.test(t);
  let s = t.length;
  if (hasDigit && hasAlpha) s += 10; // mixed alphanumerics are most plate-like
  else if (hasDigit) s += 3;
  if (!hasDigit) s -= 6;
  if (!hasAlpha && t.length <= 6) s -= 4; // short pure-number is likely a rating
  if (t.length >= 8 && t.length <= 18) s += 5;
  if (t.length < 6) s -= 4;
  // Penalize tokens dominated by separators
  const seps = (t.match(/[-\/]/g) || []).length;
  if (seps > 3) s -= 3;
  // Penalize runs of repeated characters ("00000000", "AAAAAA")
  if (/(.)\1{4,}/.test(t)) s -= 6;
  // Reward classic prefix patterns: 2-4 letters then digits (very common on plates)
  if (/^[A-Z]{2,4}\d{4,}/.test(t)) s += 4;
  // Penalize date-like all-digit 4-8 strings
  if (/^\d{4,8}$/.test(t) && t.length <= 8) s -= 3;
  return s;
}

function collectLabeled(
  text: string,
  re: RegExp,
  base: number,
  reason: string,
  found: Map<string, OcrCandidate>,
) {
  re.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const v = normalize(m[1]);
    if (v.length < 5) continue;
    if (STOPWORDS.has(v)) continue;
    const score = base + scoreToken(v);
    const prev = found.get(v);
    if (!prev || prev.score < score) {
      found.set(v, { value: v, score, reason });
    }
  }
}

export function parseSerialCandidates(rawText: string): OcrCandidate[] {
  // Normalize common OCR substitutions/punctuation noise before matching.
  const text = rawText
    .toUpperCase()
    .replace(/[“”"`’']/g, "")
    .replace(/[|]/g, "/"); // pipes often misread for slashes
  const found = new Map<string, OcrCandidate>();

  // 1) Strong matches: labeled "SERIAL", "S/N", "SN#", with or without spacing.
  collectLabeled(text, SERIAL_LABEL_RE, 100, "labeled-serial", found);
  // 2) Model-family labels — useful fallback, lower priority than serial.
  collectLabeled(text, MODEL_LABEL_RE, 40, "labeled-model", found);

  // 3) Generic alphanumeric tokens
  const tokens = text.match(TOKEN_RE) || [];
  for (const raw of tokens) {
    const v = normalize(raw);
    if (v.length < 6) continue;
    if (STOPWORDS.has(v)) continue;
    if (found.has(v)) continue;
    const score = scoreToken(v);
    if (score < 10) continue;
    found.set(v, { value: v, score, reason: "token" });
  }

  return Array.from(found.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
}

export async function ocrSerial(file: Blob): Promise<{
  candidates: OcrCandidate[];
  text: string;
}> {
  const worker = await getWorker();
  // tesseract accepts blobs/object URLs/data URLs.
  const url = URL.createObjectURL(file);
  try {
    const { data } = await worker.recognize(url);
    const text = data?.text ?? "";
    return { candidates: parseSerialCandidates(text), text };
  } finally {
    URL.revokeObjectURL(url);
  }
}
