import React from 'react';

interface AirplanePaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  language?: string;
  fontFamily?: string;
  alwaysShow?: boolean;
}

/** Minimal side-view plane — Nasim Air brand blue */
const PlaneIcon: React.FC<{ flip?: boolean; className?: string }> = ({ flip, className }) => (
  <svg
    viewBox="0 0 56 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ transform: flip ? 'scaleX(-1)' : undefined }}
    aria-hidden
  >
    <path
      d="M4 15.5h22.5l16.5-8.2c.55-.28 1.15.22.95.8L40.5 15.5H48c1.1 0 1.1 1.6 0 1.6h-7.5l3.45 7.4c.2.58-.4 1.08-.95.8L30.5 17H4c-1.2 0-1.2-1.5 0-1.5z"
      fill="currentColor"
    />
    <path
      d="M18 15.5L12.2 6.8c-.25-.4.05-.95.55-.95h1.7c.2 0 .4.1.5.28L21.5 15.5H18z"
      fill="currentColor"
      opacity="0.85"
    />
    <circle cx="6.5" cy="16.3" r="1.35" fill="currentColor" opacity="0.55" />
  </svg>
);

const planeBtnClass =
  'group flex h-16 w-16 sm:h-[4.5rem] sm:w-[4.5rem] items-center justify-center rounded-full bg-[#0b1f4d] text-white shadow-[0_10px_28px_rgba(11,31,77,0.28)] transition hover:bg-[#1e3a8a] hover:scale-105 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:scale-100 disabled:hover:bg-[#0b1f4d]';

const AirplanePagination: React.FC<AirplanePaginationProps> = ({
  page,
  totalPages,
  onChange,
  language = 'fa',
  fontFamily,
  alwaysShow = true,
}) => {
  if (totalPages < 1) return null;
  if (!alwaysShow && totalPages <= 1) return null;

  const isRtl = language !== 'en';

  const pages: (number | '…')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push('…');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push('…');
    pages.push(totalPages);
  }

  // Same handler as number buttons
  const goToPage = (target: number) => {
    if (target < 1 || target > totalPages || target === page) return;
    onChange(target);
  };

  // In RTL: first DOM child sits on the RIGHT → page-1 (قبلی)
  //          second child sits on the LEFT  → page+1 (بعدی)
  // In LTR: first = left = page-1, second = right = page+1
  const prevBtn = (
    <button
      type="button"
      onClick={() => goToPage(page - 1)}
      disabled={page <= 1}
      className={planeBtnClass}
      aria-label={language === 'fa' ? 'صفحه قبل' : 'Previous page'}
    >
      <PlaneIcon flip={!isRtl} className="h-6 w-11 sm:h-7 sm:w-12" />
    </button>
  );

  const nextBtn = (
    <button
      type="button"
      onClick={() => goToPage(page + 1)}
      disabled={page >= totalPages}
      className={planeBtnClass}
      aria-label={language === 'fa' ? 'صفحه بعد' : 'Next page'}
    >
      <PlaneIcon flip={isRtl} className="h-6 w-11 sm:h-7 sm:w-12" />
    </button>
  );

  return (
    <nav
      dir={isRtl ? 'rtl' : 'ltr'}
      className="mt-14 mb-6 flex flex-col items-center gap-4"
      aria-label={language === 'fa' ? 'صفحه‌بندی مقالات' : 'Article pagination'}
    >
      <div className="flex items-center justify-center gap-4 sm:gap-12">
        {prevBtn}
        {nextBtn}
      </div>

      <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 flex-wrap max-w-full px-2">
        {pages.map((p, idx) =>
          p === '…' ? (
            <span key={`e-${idx}`} className="px-1 text-slate-400 text-sm">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => goToPage(p)}
              className={`min-w-[2.25rem] sm:min-w-[2.75rem] h-9 sm:h-11 rounded-full text-sm font-semibold transition ${
                p === page
                  ? 'bg-[#0b1f4d] text-white shadow-md shadow-blue-900/25 ring-2 ring-sky-300/70 ring-offset-2'
                  : 'bg-white text-[#0b1f4d] border border-slate-200 hover:border-[#1e3a8a]/40 hover:bg-blue-50'
              }`}
              style={{ fontFamily }}
              aria-current={p === page ? 'page' : undefined}
            >
              {p}
            </button>
          )
        )}
      </div>

      <p className="text-sm text-[#0b1f4d]/75 font-medium" style={{ fontFamily }}>
        {language === 'fa'
          ? `صفحه ${page} از ${totalPages}`
          : language === 'ar'
          ? `صفحة ${page} من ${totalPages}`
          : `Page ${page} of ${totalPages}`}
      </p>
    </nav>
  );
};

export default AirplanePagination;
