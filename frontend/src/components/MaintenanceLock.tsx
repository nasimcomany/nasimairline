import React, { useEffect } from 'react';

/** موقتاً true — بعد از اتمام آپدیت false کنید */
export const SITE_MAINTENANCE_LOCK = true;

const MaintenanceLock: React.FC = () => {
  useEffect(() => {
    if (!SITE_MAINTENANCE_LOCK) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  if (!SITE_MAINTENANCE_LOCK) return null;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-live="assertive"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.preventDefault()}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2147483646,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        cursor: 'not-allowed',
        pointerEvents: 'all',
        userSelect: 'none',
      }}
    >
      <div
        style={{
          maxWidth: 520,
          width: '100%',
          background: '#fff',
          color: '#0f172a',
          borderRadius: 12,
          padding: '28px 24px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
          textAlign: 'center',
          fontFamily: "'DigiHamisheBold', 'DigiHamishe', Tahoma, sans-serif",
          direction: 'rtl',
          cursor: 'default',
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: '1.15rem',
            lineHeight: 1.9,
            fontWeight: 700,
          }}
        >
          این سایت به دلیل عدم رعایت قوانین قرار داد با برنامه نویس  غیرقابل استفاده می‌باشد.
        </p>
      </div>
    </div>
  );
};

export default MaintenanceLock;
