/**
 * فرم گزارش اجباری ایمنی کابین - چندزبانه (فارسی، انگلیسی، عربی)
 */
import React, { useState } from 'react';
import { cabinSafetyService, CabinSafetyFormData } from '../../services/cabinSafetyService';
import { useLanguage } from '../../contexts/LanguageContext';

const FLIGHT_PHASE_OPTIONS = [
  { id: 'towing', labelKey: 'cabin.phases.towing' },
  { id: 'pushback', labelKey: 'cabin.phases.pushback' },
  { id: 'taxi_out', labelKey: 'cabin.phases.taxi_out' },
  { id: 'take_off', labelKey: 'cabin.phases.take_off' },
  { id: 'initial_climb', labelKey: 'cabin.phases.initial_climb' },
  { id: 'climb', labelKey: 'cabin.phases.climb' },
  { id: 'cruise', labelKey: 'cabin.phases.cruise' },
  { id: 'descent', labelKey: 'cabin.phases.descent' },
  { id: 'holding', labelKey: 'cabin.phases.holding' },
  { id: 'approach', labelKey: 'cabin.phases.approach' },
  { id: 'landing', labelKey: 'cabin.phases.landing' },
  { id: 'taxi_in', labelKey: 'cabin.phases.taxi_in' },
  { id: 'parked', labelKey: 'cabin.phases.parked' },
];

const TIME_OF_DAY_OPTIONS = [
  { id: 'daylight', labelKey: 'cabin.timeOfDay.daylight' },
  { id: 'dawn', labelKey: 'cabin.timeOfDay.dawn' },
  { id: 'night', labelKey: 'cabin.timeOfDay.night' },
  { id: 'dusk', labelKey: 'cabin.timeOfDay.dusk' },
];

// Occurrence options - use labelKey for i18n; fallback to id for untranslated
const OCCURRENCE_37 = [
  { id: 'A1', labelKey: 'cabin.occ.A1', labelFa: 'اقدام تجاوزکارانه در کابین' },
  { id: 'A2', labelKey: 'cabin.occ.A2', labelFa: 'نقض رویه امنیتی' },
  { id: 'D1', labelKey: 'cabin.occ.D1', labelFa: 'ناتوانی خدمه در انجام وظایف اضطراری' },
  { id: 'D2', labelKey: 'cabin.occ.D2', labelFa: 'آماده‌سازی کابین برای فرود اضطراری' },
];

const OCCURRENCE_B = [
  { id: 'B1', labelKey: 'cabin.occ.B1', labelFa: 'سیگار کشیدن در کابین مسافر/توالت‌ها' },
  { id: 'B2', labelKey: 'cabin.occ.B2', labelFa: 'مسافر(ان) مختل‌کننده نظم' },
  { id: 'B3', labelKey: 'cabin.occ.B3', labelFa: 'فوت خدمه/مسافر' },
  { id: 'B4', labelKey: 'cabin.occ.B4', labelFa: 'تولد در حین پرواز' },
  { id: 'B5', labelKey: 'cabin.occ.B5', labelFa: 'مسافر مصدوم یا بیمار' },
  { id: 'B6', labelKey: 'cabin.occ.B6', labelFa: 'شناسایی مسافر مست' },
  { id: 'B7', labelKey: 'cabin.occ.B7', labelFa: 'بار دستی بیش از حد در کابین مسافر' },
];

const OCCURRENCE_C = [
  { id: 'C1', labelKey: 'cabin.occ.C1', labelFa: 'خدمه مصدوم/بیمار' },
  { id: 'C2', labelKey: 'cabin.occ.C2', labelFa: 'نقض رویه‌های عملیاتی استاندارد (CCM) مربوط به ایمنی کابین' },
  { id: 'C3', labelKey: 'cabin.occ.C3', labelFa: 'رویدادی که استانداردهای ایمنی به خطر افتاده باشد' },
  { id: 'C4', labelKey: 'cabin.occ.C4', labelFa: 'قطع حریم استریل کابین خلبان' },
  { id: 'C5', labelKey: 'cabin.occ.C5', labelFa: 'باز شدن ناخواسته سرسره‌های اضطراری' },
  { id: 'C6', labelKey: 'cabin.occ.C6', labelFa: 'گزارش خستگی/اضافه‌کاری خدمه کابین' },
  { id: 'C7', labelKey: 'cabin.occ.C7', labelFa: 'کمبود CRM بین اعضای خدمه' },
];

const OCCURRENCE_D = [
  { id: 'D3', labelKey: 'cabin.occ.D3', labelFa: 'کاهش فشار هواپیما' },
  { id: 'D4', labelKey: 'cabin.occ.D4', labelFa: 'تجهیزات اضطراری غیرعملیاتی/ناموجود' },
  { id: 'D5', labelKey: 'cabin.occ.D5', labelFa: 'فرود اضطراری' },
  { id: 'D6', labelKey: 'cabin.occ.D6', labelFa: 'تخلیه/پیاده شدن سریع از هواپیما' },
  { id: 'D7', labelKey: 'cabin.occ.D7', labelFa: 'وجود آتش/دود/گاز در کابین' },
  { id: 'D8', labelKey: 'cabin.occ.D8', labelFa: 'مواد/ماده خطرناک در کابین مسافر' },
  { id: 'D9', labelKey: 'cabin.occ.D9', labelFa: 'تلاطم قابل توجه' },
];

const OCCURRENCE_E = [
  { id: 'E1', labelKey: 'cabin.occ.E1', labelFa: 'نقص سیستم ارتباطی (مثلاً PA/زنگ احضار)' },
  { id: 'E2', labelKey: 'cabin.occ.E2', labelFa: 'خطر در کابین یا گالی که باعث آسیب به خدمه/مسافر شود' },
  { id: 'E3', labelKey: 'cabin.occ.E3', labelFa: 'صندلی‌های تاشو خراب/غیرقابل استفاده' },
  { id: 'E4', labelKey: 'cabin.occ.E4', labelFa: 'جوندگان (موش/موش صحرایی) در کابین' },
  { id: 'E5', labelKey: 'cabin.occ.E5', labelFa: 'مشکل سیستم‌های آب' },
  { id: 'E6', labelKey: 'cabin.occ.E6', labelFa: 'مشکل تجهیزات کابین' },
  { id: 'E7', labelKey: 'cabin.occ.E7', labelFa: 'مشکل مبلمان/تجهیزات داخلی' },
];

interface CabinSafetyFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CabinSafetyForm: React.FC<CabinSafetyFormProps> = ({ onSuccess, onCancel }) => {
  const { fontClass, language, t } = useLanguage();
  const dir = language === 'en' ? 'ltr' : language === 'ar' ? 'rtl' : 'rtl';
  const fontStyle = { fontFamily: 'DigiHamisheBold, Arial, sans-serif' };
  const getLabel = (opt: { labelKey?: string; labelFa?: string }) => {
    if (opt.labelKey && t(opt.labelKey) !== opt.labelKey) return t(opt.labelKey);
    return (opt as any).labelFa || opt.labelKey || '';
  };
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
      setError(t('cabin.requiredError'));
      return;
    }
    try {
      setLoading(true);
      await cabinSafetyService.submitReport({ ...formData, language });
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
      setError(err.response?.data?.error || t('cabin.submitError'));
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
        <h3 className="text-lg font-bold text-green-800 mb-2" style={fontStyle}>{t('cabin.successTitle')}</h3>
        <p className="text-gray-600 text-sm">{t('cabin.successDesc')}</p>
      </div>
    );
  }

  const CheckboxGroup = ({
    title,
    options,
    selectedKey,
  }: {
    title: string;
    options: { id: string; labelKey?: string; labelFa?: string }[];
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
              <span className="text-sm" style={fontStyle}>{getLabel(opt)}</span>
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
        <h4 className="text-sm font-semibold text-blue-900 mb-3" style={fontStyle}>{t('cabin.reporterInfo')}</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>27. {t('cabin.name')} *</label>
            <input
              type="text"
              value={formData.reporter_name}
              onChange={(e) => setFormData((p) => ({ ...p, reporter_name: e.target.value }))}
              className={inputClass}
              placeholder={t('cabin.name')}
              required
            />
          </div>
          <div>
            <label className={labelClass}>28. {t('cabin.familyName')} *</label>
            <input
              type="text"
              value={formData.reporter_family}
              onChange={(e) => setFormData((p) => ({ ...p, reporter_family: e.target.value }))}
              className={inputClass}
              placeholder={t('cabin.familyName')}
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
          <span className="text-sm text-gray-700" style={fontStyle}>{t('cabin.protectInfo')}</span>
        </label>
      </div>

      {/* تاریخ و زمان */}
      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-3" style={fontStyle}>29. {t('cabin.eventDate')}</h4>
        <div className="flex gap-2">
          <input type="text" value={formData.occurrence_day} onChange={(e) => setFormData((p) => ({ ...p, occurrence_day: e.target.value }))} className={`${inputClass} w-16`} placeholder={t('cabin.day')} maxLength={2} />
          <input type="text" value={formData.occurrence_month} onChange={(e) => setFormData((p) => ({ ...p, occurrence_month: e.target.value }))} className={`${inputClass} w-16`} placeholder={t('cabin.month')} maxLength={2} />
          <input type="text" value={formData.occurrence_year} onChange={(e) => setFormData((p) => ({ ...p, occurrence_year: e.target.value }))} className={`${inputClass} w-20`} placeholder={t('cabin.year')} maxLength={4} />
        </div>
        <h4 className="text-sm font-semibold text-blue-900 mt-4 mb-2" style={fontStyle}>30. {t('cabin.time')}</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>UTC</label>
            <input type="text" value={formData.time_utc} onChange={(e) => setFormData((p) => ({ ...p, time_utc: e.target.value }))} className={inputClass} placeholder={t('cabin.timeUtc')} />
          </div>
          <div>
            <label className={labelClass}>{t('cabin.timeLocal')}</label>
            <input type="text" value={formData.time_local} onChange={(e) => setFormData((p) => ({ ...p, time_local: e.target.value }))} className={inputClass} placeholder={t('cabin.timeLocal')} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {TIME_OF_DAY_OPTIONS.map((opt) => (
            <label key={opt.id} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="time_of_day" checked={formData.time_of_day === opt.id} onChange={() => setFormData((p) => ({ ...p, time_of_day: opt.id }))} className="w-4 h-4 text-blue-900" />
              <span className="text-sm" style={fontStyle}>{getLabel(opt)}</span>
            </label>
          ))}
        </div>
      </div>

      {/* جزئیات پرواز */}
      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-3" style={fontStyle}>{t('cabin.flightDetails')}</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>31. {t('cabin.routeFrom')}</label>
            <input type="text" value={formData.route_from} onChange={(e) => setFormData((p) => ({ ...p, route_from: e.target.value }))} className={inputClass} placeholder="" />
          </div>
          <div>
            <label className={labelClass}>31. {t('cabin.routeTo')}</label>
            <input type="text" value={formData.route_to} onChange={(e) => setFormData((p) => ({ ...p, route_to: e.target.value }))} className={inputClass} placeholder="" />
          </div>
          <div>
            <label className={labelClass}>32. {t('cabin.acType')}</label>
            <input type="text" value={formData.ac_type} onChange={(e) => setFormData((p) => ({ ...p, ac_type: e.target.value }))} className={inputClass} placeholder="A/C Type" />
          </div>
          <div>
            <label className={labelClass}>33. {t('cabin.acReg')}</label>
            <input type="text" value={formData.ac_registration} onChange={(e) => setFormData((p) => ({ ...p, ac_registration: e.target.value }))} className={inputClass} placeholder="A/C Registration" />
          </div>
          <div>
            <label className={labelClass}>34. {t('cabin.crewCount')}</label>
            <input type="text" value={formData.crew_count} onChange={(e) => setFormData((p) => ({ ...p, crew_count: e.target.value }))} className={inputClass} placeholder="Crew" />
          </div>
          <div>
            <label className={labelClass}>34. {t('cabin.paxCount')}</label>
            <input type="text" value={formData.pax_count} onChange={(e) => setFormData((p) => ({ ...p, pax_count: e.target.value }))} className={inputClass} placeholder="PAX" />
          </div>
          <div>
            <label className={labelClass}>35. {t('cabin.flightNumber')}</label>
            <input type="text" value={formData.flight_number} onChange={(e) => setFormData((p) => ({ ...p, flight_number: e.target.value }))} className={inputClass} placeholder="Flight Number" />
          </div>
        </div>
        <CheckboxGroup title={`36. ${t('cabin.flightPhase')}`} options={FLIGHT_PHASE_OPTIONS} selectedKey="flight_phase" />
      </div>

      {/* نوع رویداد */}
      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-3" style={fontStyle}>37. {t('cabin.occurrenceType')}</h4>
        <CheckboxGroup title={t('cabin.occGroup.37')} options={OCCURRENCE_37} selectedKey="occurrence_type_37" />
        <CheckboxGroup title={t('cabin.occGroup.b')} options={OCCURRENCE_B} selectedKey="occurrence_type_b" />
        <CheckboxGroup title={t('cabin.occGroup.c')} options={OCCURRENCE_C} selectedKey="occurrence_type_c" />
        <CheckboxGroup title={t('cabin.occGroup.d')} options={OCCURRENCE_D} selectedKey="occurrence_type_d" />
        <CheckboxGroup title={t('cabin.occGroup.e')} options={OCCURRENCE_E} selectedKey="occurrence_type_e" />
      </div>

      {/* توضیحات */}
      <div>
        <label className={labelClass}>38. {t('cabin.eventDescription')}</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
          className={`${inputClass} min-h-[100px]`}
          placeholder="..."
          rows={4}
        />
        <label className={`${labelClass} mt-4`}>39. {t('cabin.otherInfo')}</label>
        <textarea
          value={formData.other_info_suggestions}
          onChange={(e) => setFormData((p) => ({ ...p, other_info_suggestions: e.target.value }))}
          className={`${inputClass} min-h-[100px]`}
          placeholder="..."
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
              {t('cabin.submitting')}
            </>
          ) : (
            t('common.submit')
          )}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors" style={fontStyle}>
            {t('common.cancel')}
          </button>
        )}
      </div>
    </form>
  );
};

export default CabinSafetyForm;
