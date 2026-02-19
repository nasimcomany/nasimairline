/**
 * فرم گزارش اجباری ایمنی کابین - نسخه فارسی
 */
import React, { useState } from 'react';
import { cabinSafetyService, CabinSafetyFormData } from '../../services/cabinSafetyService';
import { useLanguage } from '../../contexts/LanguageContext';

const FLIGHT_PHASE_OPTIONS = [
  { id: 'towing', label: 'یدک‌کشی' },
  { id: 'pushback', label: 'پوش‌بک' },
  { id: 'taxi_out', label: 'تاکسی به بیرون' },
  { id: 'take_off', label: 'برخاست' },
  { id: 'initial_climb', label: 'صعود اولیه' },
  { id: 'climb', label: 'صعود' },
  { id: 'cruise', label: 'کروز' },
  { id: 'descent', label: 'نزول' },
  { id: 'holding', label: 'هولدینگ' },
  { id: 'approach', label: 'رویکرد' },
  { id: 'landing', label: 'فرود' },
  { id: 'taxi_in', label: 'تاکسی به داخل' },
  { id: 'parked', label: 'پارک شده' },
];

const TIME_OF_DAY_OPTIONS = [
  { id: 'daylight', label: 'روز' },
  { id: 'dawn', label: 'سپیده‌دم' },
  { id: 'night', label: 'شب' },
  { id: 'dusk', label: 'غروب' },
];

const OCCURRENCE_37 = [
  { id: 'A1', label: 'اقدام تجاوزکارانه در کابین' },
  { id: 'A2', label: 'نقض رویه امنیتی' },
  { id: 'D1', label: 'ناتوانی خدمه در انجام وظایف اضطراری' },
  { id: 'D2', label: 'آماده‌سازی کابین برای فرود اضطراری' },
];

const OCCURRENCE_B = [
  { id: 'B1', label: 'سیگار کشیدن در کابین مسافر/توالت‌ها' },
  { id: 'B2', label: 'مسافر(ان) مختل‌کننده نظم' },
  { id: 'B3', label: 'فوت خدمه/مسافر' },
  { id: 'B4', label: 'تولد در حین پرواز' },
  { id: 'B5', label: 'مسافر مصدوم یا بیمار' },
  { id: 'B6', label: 'شناسایی مسافر مست' },
  { id: 'B7', label: 'بار دستی بیش از حد در کابین مسافر' },
];

const OCCURRENCE_C = [
  { id: 'C1', label: 'خدمه مصدوم/بیمار' },
  { id: 'C2', label: 'نقض رویه‌های عملیاتی استاندارد (CCM) مربوط به ایمنی کابین' },
  { id: 'C3', label: 'رویدادی که استانداردهای ایمنی به خطر افتاده باشد' },
  { id: 'C4', label: 'قطع حریم استریل کابین خلبان' },
  { id: 'C5', label: 'باز شدن ناخواسته سرسره‌های اضطراری' },
  { id: 'C6', label: 'گزارش خستگی/اضافه‌کاری خدمه کابین' },
  { id: 'C7', label: 'کمبود CRM بین اعضای خدمه' },
];

const OCCURRENCE_D = [
  { id: 'D3', label: 'کاهش فشار هواپیما' },
  { id: 'D4', label: 'تجهیزات اضطراری غیرعملیاتی/ناموجود' },
  { id: 'D5', label: 'فرود اضطراری' },
  { id: 'D6', label: 'تخلیه/پیاده شدن سریع از هواپیما' },
  { id: 'D7', label: 'وجود آتش/دود/گاز در کابین' },
  { id: 'D8', label: 'مواد/ماده خطرناک در کابین مسافر' },
  { id: 'D9', label: 'تلاطم قابل توجه' },
];

const OCCURRENCE_E = [
  { id: 'E1', label: 'نقص سیستم ارتباطی (مثلاً PA/زنگ احضار)' },
  { id: 'E2', label: 'خطر در کابین یا گالی که باعث آسیب به خدمه/مسافر شود' },
  { id: 'E3', label: 'صندلی‌های تاشو خراب/غیرقابل استفاده' },
  { id: 'E4', label: 'جوندگان (موش/موش صحرایی) در کابین' },
  { id: 'E5', label: 'مشکل سیستم‌های آب' },
  { id: 'E6', label: 'مشکل تجهیزات کابین' },
  { id: 'E7', label: 'مشکل مبلمان/تجهیزات داخلی' },
];

interface CabinSafetyFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CabinSafetyForm: React.FC<CabinSafetyFormProps> = ({ onSuccess, onCancel }) => {
  const { fontClass, language } = useLanguage();
  const dir = 'rtl';
  const fontStyle = { fontFamily: 'DigiHamisheBold, Arial, sans-serif' };
  const inputClass = `w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-900/30 focus:border-blue-900 ${fontClass}`;
  const labelClass = `block text-sm font-medium text-gray-700 mb-1.5 ${fontClass}`;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<CabinSafetyFormData>({
    reporter_name: '',
    reporter_family: '',
    protect_personal_info: false,
    occurrence_day: '',
    occurrence_month: '',
    occurrence_year: '',
    time_utc: '',
    time_local: '',
    time_of_day: '',
    route_from: '',
    route_to: '',
    ac_type: '',
    ac_registration: '',
    crew_count: '',
    pax_count: '',
    flight_number: '',
    flight_phase: [],
    occurrence_type_37: [],
    occurrence_type_b: [],
    occurrence_type_c: [],
    occurrence_type_d: [],
    occurrence_type_e: [],
    description: '',
    other_info_suggestions: '',
  });

  const toggleArray = (key: keyof CabinSafetyFormData, value: string) => {
    const arr = (formData[key] as string[]) || [];
    const next = arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value];
    setFormData((prev) => ({ ...prev, [key]: next }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!formData.reporter_name?.trim() || !formData.reporter_family?.trim()) {
      setError('نام و نام خانوادگی الزامی است.');
      return;
    }
    try {
      setLoading(true);
      await cabinSafetyService.submitReport(formData);
      setSuccess(true);
      setFormData({
        reporter_name: '',
        reporter_family: '',
        protect_personal_info: false,
        occurrence_day: '',
        occurrence_month: '',
        occurrence_year: '',
        time_utc: '',
        time_local: '',
        time_of_day: '',
        route_from: '',
        route_to: '',
        ac_type: '',
        ac_registration: '',
        crew_count: '',
        pax_count: '',
        flight_number: '',
        flight_phase: [],
        occurrence_type_37: [],
        occurrence_type_b: [],
        occurrence_type_c: [],
        occurrence_type_d: [],
        occurrence_type_e: [],
        description: '',
        other_info_suggestions: '',
      });
      setTimeout(() => {
        setSuccess(false);
        onSuccess?.();
      }, 2500);
    } catch (err: any) {
      setError(err.response?.data?.error || 'خطا در ثبت گزارش. لطفاً دوباره تلاش کنید.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="py-8 text-center" style={{ ...fontStyle, direction: dir }}>
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-green-800 mb-2" style={fontStyle}>گزارش با موفقیت ثبت شد</h3>
        <p className="text-gray-600 text-sm">اطلاعات در پنل ادمین ذخیره و ایمیل ارسال شد.</p>
      </div>
    );
  }

  const CheckboxGroup = ({
    title,
    options,
    selectedKey,
  }: {
    title: string;
    options: { id: string; label: string }[];
    selectedKey: keyof CabinSafetyFormData;
  }) => (
    <div className="mb-4">
      <h4 className="text-sm font-semibold text-blue-900 mb-2" style={fontStyle}>{title}</h4>
      <div className="flex flex-wrap gap-2" style={{ direction: dir }}>
        {options.map((opt) => {
          const arr = (formData[selectedKey] as string[]) || [];
          const checked = arr.includes(opt.id);
          return (
            <label key={opt.id} className="flex items-center gap-2 cursor-pointer bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-100">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggleArray(selectedKey, opt.id)}
                className="w-4 h-4 text-blue-900 border-gray-300 rounded focus:ring-blue-900"
              />
              <span className="text-sm" style={fontStyle}>{opt.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5" style={{ direction: dir }}>
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} className="mr-auto text-red-600 hover:text-red-800">×</button>
        </div>
      )}

      {/* اطلاعات گزارش‌دهنده */}
      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-3" style={fontStyle}>اطلاعات گزارش‌دهنده</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>۲۷. نام *</label>
            <input
              type="text"
              value={formData.reporter_name}
              onChange={(e) => setFormData((p) => ({ ...p, reporter_name: e.target.value }))}
              className={inputClass}
              placeholder="نام"
              required
            />
          </div>
          <div>
            <label className={labelClass}>۲۸. نام خانوادگی *</label>
            <input
              type="text"
              value={formData.reporter_family}
              onChange={(e) => setFormData((p) => ({ ...p, reporter_family: e.target.value }))}
              className={inputClass}
              placeholder="نام خانوادگی"
              required
            />
          </div>
        </div>
        <label className="flex items-center gap-2 mt-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.protect_personal_info}
            onChange={(e) => setFormData((p) => ({ ...p, protect_personal_info: e.target.checked }))}
            className="w-4 h-4 text-blue-900 border-gray-300 rounded"
          />
          <span className="text-sm text-gray-700" style={fontStyle}>لطفاً برای محافظت بیشتر از اطلاعات شخصی خود انتخاب کنید.</span>
        </label>
      </div>

      {/* تاریخ و زمان */}
      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-3" style={fontStyle}>۲۹. تاریخ رویداد</h4>
        <div className="flex gap-2">
          <input type="text" value={formData.occurrence_day} onChange={(e) => setFormData((p) => ({ ...p, occurrence_day: e.target.value }))} className={`${inputClass} w-16`} placeholder="روز" maxLength={2} />
          <input type="text" value={formData.occurrence_month} onChange={(e) => setFormData((p) => ({ ...p, occurrence_month: e.target.value }))} className={`${inputClass} w-16`} placeholder="ماه" maxLength={2} />
          <input type="text" value={formData.occurrence_year} onChange={(e) => setFormData((p) => ({ ...p, occurrence_year: e.target.value }))} className={`${inputClass} w-20`} placeholder="سال" maxLength={4} />
        </div>
        <h4 className="text-sm font-semibold text-blue-900 mt-4 mb-2" style={fontStyle}>۳۰. زمان</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>UTC</label>
            <input type="text" value={formData.time_utc} onChange={(e) => setFormData((p) => ({ ...p, time_utc: e.target.value }))} className={inputClass} placeholder="ساعت UTC" />
          </div>
          <div>
            <label className={labelClass}>محلی</label>
            <input type="text" value={formData.time_local} onChange={(e) => setFormData((p) => ({ ...p, time_local: e.target.value }))} className={inputClass} placeholder="زمان محلی" />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {TIME_OF_DAY_OPTIONS.map((opt) => (
            <label key={opt.id} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="time_of_day" checked={formData.time_of_day === opt.id} onChange={() => setFormData((p) => ({ ...p, time_of_day: opt.id }))} className="w-4 h-4 text-blue-900" />
              <span className="text-sm" style={fontStyle}>{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* جزئیات پرواز */}
      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-3" style={fontStyle}>جزئیات پرواز</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>۳۱. مسیر - مبدا</label>
            <input type="text" value={formData.route_from} onChange={(e) => setFormData((p) => ({ ...p, route_from: e.target.value }))} className={inputClass} placeholder="از" />
          </div>
          <div>
            <label className={labelClass}>۳۱. مسیر - مقصد</label>
            <input type="text" value={formData.route_to} onChange={(e) => setFormData((p) => ({ ...p, route_to: e.target.value }))} className={inputClass} placeholder="به" />
          </div>
          <div>
            <label className={labelClass}>۳۲. نوع هواپیما</label>
            <input type="text" value={formData.ac_type} onChange={(e) => setFormData((p) => ({ ...p, ac_type: e.target.value }))} className={inputClass} placeholder="A/C Type" />
          </div>
          <div>
            <label className={labelClass}>۳۳. ثبت هواپیما</label>
            <input type="text" value={formData.ac_registration} onChange={(e) => setFormData((p) => ({ ...p, ac_registration: e.target.value }))} className={inputClass} placeholder="A/C Registration" />
          </div>
          <div>
            <label className={labelClass}>۳۴. تعداد خدمه</label>
            <input type="text" value={formData.crew_count} onChange={(e) => setFormData((p) => ({ ...p, crew_count: e.target.value }))} className={inputClass} placeholder="Crew" />
          </div>
          <div>
            <label className={labelClass}>۳۴. تعداد مسافر</label>
            <input type="text" value={formData.pax_count} onChange={(e) => setFormData((p) => ({ ...p, pax_count: e.target.value }))} className={inputClass} placeholder="PAX" />
          </div>
          <div>
            <label className={labelClass}>۳۵. شماره پرواز</label>
            <input type="text" value={formData.flight_number} onChange={(e) => setFormData((p) => ({ ...p, flight_number: e.target.value }))} className={inputClass} placeholder="Flight Number" />
          </div>
        </div>
        <CheckboxGroup title="۳۶. فاز پرواز" options={FLIGHT_PHASE_OPTIONS} selectedKey="flight_phase" />
      </div>

      {/* نوع رویداد */}
      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-3" style={fontStyle}>۳۷. نوع رویداد</h4>
        <CheckboxGroup title="الف. امنیت و اورژانس" options={OCCURRENCE_37} selectedKey="occurrence_type_37" />
        <CheckboxGroup title="ب. رفتار مسافر" options={OCCURRENCE_B} selectedKey="occurrence_type_b" />
        <CheckboxGroup title="ج. اقدامات خدمه" options={OCCURRENCE_C} selectedKey="occurrence_type_c" />
        <CheckboxGroup title="د. رویدادهای عمومی" options={OCCURRENCE_D} selectedKey="occurrence_type_d" />
        <CheckboxGroup title="هـ. مشکلات فنی" options={OCCURRENCE_E} selectedKey="occurrence_type_e" />
      </div>

      {/* توضیحات */}
      <div>
        <label className={labelClass}>۳۸. توضیح رویداد</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
          className={`${inputClass} min-h-[100px]`}
          placeholder="توضیح کامل رویداد..."
          rows={4}
        />
        <label className={`${labelClass} mt-4`}>۳۹. اطلاعات دیگر و پیشنهاد اقدام پیشگیرانه</label>
        <textarea
          value={formData.other_info_suggestions}
          onChange={(e) => setFormData((p) => ({ ...p, other_info_suggestions: e.target.value }))}
          className={`${inputClass} min-h-[100px]`}
          placeholder="اطلاعات تکمیلی و پیشنهادات..."
          rows={4}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-3 bg-blue-900 hover:bg-blue-800 disabled:bg-blue-900/70 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              در حال ارسال...
            </>
          ) : (
            'ارسال'
          )}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors" style={fontStyle}>
            انصراف
          </button>
        )}
      </div>
    </form>
  );
};

export default CabinSafetyForm;
