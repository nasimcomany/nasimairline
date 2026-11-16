/**
 * Fast, reliable math captcha helpers.
 * Addition only (never negative). Accepts Persian/Arabic digits.
 */

export type MathCaptchaChallenge = {
  num1: number;
  num2: number;
  operator: '+';
  answer: number;
};

const PERSIAN_ARABIC_DIGITS: Record<string, string> = {
  '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
  '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
  '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
  '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
};

/** Convert Persian/Arabic digits to ASCII and strip spaces */
export function normalizeDigits(input: string): string {
  return String(input ?? '')
    .trim()
    .replace(/[۰-۹٠-٩]/g, (ch) => PERSIAN_ARABIC_DIGITS[ch] ?? ch)
    .replace(/\s+/g, '');
}

/** Parse user captcha input (supports Persian digits). Returns null if invalid. */
export function parseCaptchaAnswer(input: string): number | null {
  const normalized = normalizeDigits(input);
  if (!/^\d{1,3}$/.test(normalized)) return null;
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

/**
 * Small addition only — instant to solve, never negative, no RTL ambiguity.
 */
export function generateMathCaptcha(): MathCaptchaChallenge {
  const num1 = 1 + Math.floor(Math.random() * 9); // 1..9
  const num2 = 1 + Math.floor(Math.random() * 9); // 1..9
  return { num1, num2, operator: '+', answer: num1 + num2 };
}

export function checkMathCaptcha(input: string, expected: number): boolean {
  const parsed = parseCaptchaAnswer(input);
  return parsed !== null && parsed === expected;
}

/** Always LTR so RTL pages never reverse the expression visually */
export function captchaPrompt(c: MathCaptchaChallenge): string {
  return `${c.num1} ${c.operator} ${c.num2} = ?`;
}
