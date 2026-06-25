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

const LABEL_RE = /\b(?:S\s*\/?\s*N|SN|SER(?:IAL)?(?:\s*(?:NO|NUM(?:BER)?|#))?|MODEL\s*S\/?N)\b[:#\s]*([A-Z0-9][A-Z0-9\-\/]{4,24})/gi;
const TOKEN_RE = /[A-Z0-9][A-Z0-9\-\/]{5,24}/g;

function scoreToken(t: string): number {
  const hasDigit = /\d/.test(t);
  const hasAlpha = /[A-Z]/.test(t);
  let s = t.length;
  if (hasDigit && hasAlpha) s += 8; // mixed alphanumerics are most plate-like
  else if (hasDigit) s += 3;
  // Penalize obvious dictionary-ish or all-letters
  if (!hasDigit) s -= 4;
  if (t.length >= 8 && t.length <= 16) s += 4;
  // Penalize tokens with too many separators
  const seps = (t.match(/[-\/]/g) || []).length;
  if (seps > 3) s -= 3;
  return s;
}

export function parseSerialCandidates(rawText: string): OcrCandidate[] {
  const text = rawText.toUpperCase();
  const found = new Map<string, OcrCandidate>();

  // 1) Strong matches: labeled "S/N: XYZ"
  let m: RegExpExecArray | null;
  LABEL_RE.lastIndex = 0;
  while ((m = LABEL_RE.exec(text)) !== null) {
    const v = m[1].replace(/^[-\/]+|[-\/]+$/g, "");
    if (v.length < 5) continue;
    const prev = found.get(v);
    const score = 100 + scoreToken(v);
    if (!prev || prev.score < score) {
      found.set(v, { value: v, score, reason: "labeled" });
    }
  }

  // 2) Generic alphanumeric tokens
  const tokens = text.match(TOKEN_RE) || [];
  for (const raw of tokens) {
    const v = raw.replace(/^[-\/]+|[-\/]+$/g, "");
    if (v.length < 6) continue;
    if (found.has(v)) continue;
    const score = scoreToken(v);
    if (score < 8) continue;
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
