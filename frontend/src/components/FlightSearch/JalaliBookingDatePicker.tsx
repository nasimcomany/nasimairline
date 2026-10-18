import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { toJalaali, toGregorian, jalaaliMonthLength } from 'jalaali-js';

const PERSIAN_MONTHS = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند',
];

const WEEKDAYS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

type JalaliDay = { year: number; month: number; day: number };

const toJalali = (date: Date): JalaliDay => {
  const j = toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate());
  return { year: j.jy, month: j.jm, day: j.jd };
};

const toDate = (j: JalaliDay): Date => {
  const g = toGregorian(j.year, j.month, j.day);
  return new Date(g.gy, g.gm - 1, g.gd, 12, 0, 0, 0);
};

const formatJalali = (date: Date | null): string => {
  if (!date) return '';
  const j = toJalali(date);
  return `${j.year}/${String(j.month).padStart(2, '0')}/${String(j.day).padStart(2, '0')}`;
};

const sameDay = (a: JalaliDay, b: JalaliDay) =>
  a.year === b.year && a.month === b.month && a.day === b.day;

const isBeforeDay = (a: JalaliDay, b: JalaliDay) => {
  if (a.year !== b.year) return a.year < b.year;
  if (a.month !== b.month) return a.month < b.month;
  return a.day < b.day;
};

/** Saturday-start weekday index (0=شنبه … 6=جمعه) */
const saturdayIndex = (date: Date) => (date.getDay() + 1) % 7;

type Props = {
  value: Date | null;
  onChange: (date: Date | null) => void;
  minDate?: Date | null;
  placeholder?: string;
};

/**
 * Custom Jalali calendar — real Persian month grid (1 → last day).
 * Avoids react-modern-calendar-datepicker (crashes on React 18/19 Strict Mode).
 */
const JalaliBookingDatePicker: React.FC<Props> = ({
  value,
  onChange,
  minDate,
  placeholder = 'انتخاب تاریخ',
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const today = useMemo(() => toJalali(new Date()), []);
  const minJ = useMemo(() => toJalali(minDate || new Date()), [minDate]);
  const selected = value ? toJalali(value) : null;

  const [viewYear, setViewYear] = useState(selected?.year ?? today.year);
  const [viewMonth, setViewMonth] = useState(selected?.month ?? today.month);

  useEffect(() => {
    if (!open) return;
    if (selected) {
      setViewYear(selected.year);
      setViewMonth(selected.month);
    } else {
      setViewYear(minJ.year);
      setViewMonth(minJ.month);
    }
  }, [open, selected?.year, selected?.month, minJ.year, minJ.month]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        const popup = document.getElementById('nasim-jalali-popup');
        if (popup && popup.contains(e.target as Node)) return;
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const years = useMemo(() => {
    const list: number[] = [];
    for (let y = today.year; y <= today.year + 4; y += 1) list.push(y);
    return list;
  }, [today.year]);

  const monthLength = jalaaliMonthLength(viewYear, viewMonth);
  const firstWeekday = saturdayIndex(toDate({ year: viewYear, month: viewMonth, day: 1 }));

  const days: Array<JalaliDay | null> = [];
  for (let i = 0; i < firstWeekday; i += 1) days.push(null);
  for (let d = 1; d <= monthLength; d += 1) {
    days.push({ year: viewYear, month: viewMonth, day: d });
  }

  const shiftMonth = (delta: number) => {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 1) {
      m = 12;
      y -= 1;
    } else if (m > 12) {
      m = 1;
      y += 1;
    }
    if (y < today.year || y > today.year + 4) return;
    setViewYear(y);
    setViewMonth(m);
  };

  const pick = (day: JalaliDay) => {
    if (isBeforeDay(day, minJ)) return;
    onChange(toDate(day));
    setOpen(false);
  };

  const calendar = (
    <div
      id="nasim-jalali-popup"
      className="nasim-jalali-popup"
      role="dialog"
      aria-label="تقویم شمسی"
      style={{
        fontFamily: 'DigiHamisheBold, DigiHamishe, Tahoma, sans-serif',
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 18px 40px rgba(15, 23, 42, 0.18)',
        padding: 12,
        width: 'min(320px, calc(100vw - 1.5rem))',
        direction: 'rtl',
        zIndex: 10060,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <button
          type="button"
          aria-label="ماه قبل"
          onClick={() => shiftMonth(-1)}
          style={navBtn}
        >
          ›
        </button>
        <select
          aria-label="ماه"
          value={viewMonth}
          onChange={(e) => setViewMonth(Number(e.target.value))}
          style={{ ...selectStyle, flex: 1.4 }}
        >
          {PERSIAN_MONTHS.map((name, idx) => (
            <option key={name} value={idx + 1}>{name}</option>
          ))}
        </select>
        <select
          aria-label="سال"
          value={viewYear}
          onChange={(e) => setViewYear(Number(e.target.value))}
          style={{ ...selectStyle, flex: 1 }}
        >
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <button
          type="button"
          aria-label="ماه بعد"
          onClick={() => shiftMonth(1)}
          style={navBtn}
        >
          ‹
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 4,
          marginBottom: 6,
          textAlign: 'center',
          color: '#64748b',
          fontSize: 13,
        }}
      >
        {WEEKDAYS.map((w) => (
          <div key={w}>{w}</div>
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 4,
        }}
      >
        {days.map((day, idx) => {
          if (!day) {
            return <div key={`e-${idx}`} style={{ height: 40 }} />;
          }
          const disabled = isBeforeDay(day, minJ);
          const isSelected = selected ? sameDay(day, selected) : false;
          const isToday = sameDay(day, today);
          return (
            <button
              key={`${day.year}-${day.month}-${day.day}`}
              type="button"
              disabled={disabled}
              onClick={() => pick(day)}
              style={{
                height: 40,
                borderRadius: 10,
                border: isToday && !isSelected ? '1px solid #1e3a8a' : '1px solid transparent',
                background: isSelected ? '#1e3a8a' : '#fff',
                color: disabled ? '#cbd5e1' : isSelected ? '#fff' : '#0f172a',
                fontWeight: isSelected || isToday ? 700 : 500,
                fontSize: 15,
                cursor: disabled ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {day.day}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="nasim-jalali-dp w-full relative" ref={rootRef}>
      <input
        type="text"
        readOnly
        value={formatJalali(value)}
        placeholder={placeholder}
        onMouseDown={(e) => {
          // Prevent focus+click double-toggle (first click was opening then immediately closing)
          e.preventDefault();
          setOpen((v) => !v);
        }}
        className="w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900 bg-white cursor-pointer px-3 py-2.5 text-base"
        style={{
          fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif',
          direction: 'rtl',
          minHeight: 48,
          height: 48,
        }}
      />
      {open &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 10050,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(15, 23, 42, 0.35)',
              padding: 12,
            }}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setOpen(false);
            }}
          >
            {calendar}
          </div>,
          document.body,
        )}
    </div>
  );
};

const selectStyle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 700,
  color: '#1e3a8a',
  background: '#fff',
  border: '1px solid #cbd5e1',
  borderRadius: 8,
  padding: '8px 10px',
  minHeight: 40,
  cursor: 'pointer',
  fontFamily: 'inherit',
};

const navBtn: React.CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: 8,
  border: '1px solid #cbd5e1',
  background: '#fff',
  color: '#1e3a8a',
  fontSize: 20,
  lineHeight: 1,
  cursor: 'pointer',
  flexShrink: 0,
};

export default JalaliBookingDatePicker;
