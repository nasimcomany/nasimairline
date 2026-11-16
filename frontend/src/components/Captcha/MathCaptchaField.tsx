import React from 'react';
import { generateMathCaptcha, MathCaptchaChallenge, captchaPrompt, normalizeDigits } from '../../utils/mathCaptcha';

type Props = {
  challenge: MathCaptchaChallenge;
  value: string;
  onChange: (value: string) => void;
  onRefresh: () => void;
  label?: string;
  placeholder?: string;
  changeLabel?: string;
  error?: string;
  inputId?: string;
  className?: string;
  inputClassName?: string;
};

/** Shared math-captcha UI used by auth modal, dashboard, chat, forms */
export const MathCaptchaField: React.FC<Props> = ({
  challenge,
  value,
  onChange,
  onRefresh,
  label = 'کد امنیتی',
  placeholder = 'جواب را وارد کنید',
  changeLabel = 'تغییر',
  error,
  inputId = 'math-captcha',
  className = '',
  inputClassName = '',
}) => (
  <div className={className}>
    <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1.5">
      {label}
    </label>
    <div className="flex items-center gap-2 mb-2">
      <div
        className="flex-1 px-3 py-2.5 rounded-lg bg-slate-100 border border-slate-200 text-center text-lg font-bold text-slate-900 tracking-wide select-none"
        dir="ltr"
        aria-live="polite"
      >
        {captchaPrompt(challenge)}
      </div>
      <button
        type="button"
        onClick={onRefresh}
        className="shrink-0 px-3 py-2.5 text-sm font-semibold text-blue-900 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
      >
        {changeLabel}
      </button>
    </div>
    <input
      id={inputId}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      value={value}
      onChange={(e) => onChange(normalizeDigits(e.target.value).replace(/[^\d]/g, '').slice(0, 3))}
      placeholder={placeholder}
      className={
        inputClassName ||
        `w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900 ${
          error ? 'border-red-400' : 'border-gray-300'
        }`
      }
      dir="ltr"
    />
    {error ? <p className="mt-1 text-sm text-red-600">{error}</p> : null}
  </div>
);

export function useMathCaptcha(initial?: MathCaptchaChallenge) {
  const [challenge, setChallenge] = React.useState<MathCaptchaChallenge>(
    () => initial || generateMathCaptcha(),
  );
  const refresh = React.useCallback(() => {
    setChallenge(generateMathCaptcha());
  }, []);
  return { challenge, setChallenge, refresh };
}

export default MathCaptchaField;
