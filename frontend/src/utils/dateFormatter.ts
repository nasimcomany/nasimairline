import { toJalaali, toGregorian } from 'jalaali-js';

/**
 * Converts a Date object to Persian (Jalali) date string
 * @param date - JavaScript Date object
 * @returns Formatted Persian date string (e.g., "۱۴۰۳/۱۱/۱۳")
 */
export const toPersianDate = (date: Date): string => {
  const jalaali = toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate());
  const year = jalaali.jy.toString();
  const month = jalaali.jm.toString().padStart(2, '0');
  const day = jalaali.jd.toString().padStart(2, '0');
  
  // Convert to Persian digits
  return `${toPersianDigits(year)}/${toPersianDigits(month)}/${toPersianDigits(day)}`;
};

/**
 * Converts a Date object to English date string
 * @param date - JavaScript Date object
 * @returns Formatted English date string (e.g., "2024/01/15")
 */
export const toEnglishDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}/${month}/${day}`;
};

/**
 * Formats a date based on the selected language
 * @param date - JavaScript Date object
 * @param language - Language code ('fa', 'en', 'ar')
 * @returns Formatted date string based on language
 */
export const formatDateByLanguage = (date: Date, language: string): string => {
  if (language === 'fa') {
    return toPersianDate(date);
  }
  return toEnglishDate(date);
};

/**
 * Converts English digits to Persian digits
 * @param str - String containing English digits
 * @returns String with Persian digits
 */
const toPersianDigits = (str: string): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return str.replace(/\d/g, (digit) => persianDigits[parseInt(digit)]);
};

/**
 * Local calendar date as YYYY-MM-DD (never use toISOString — UTC can shift the day).
 */
export const toLocalDateISO = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Gets the current date formatted based on language
 * @param language - Language code ('fa', 'en', 'ar')
 * @returns Formatted current date string
 */
export const getCurrentDateFormatted = (language: string): string => {
  const today = new Date();
  return formatDateByLanguage(today, language);
};
