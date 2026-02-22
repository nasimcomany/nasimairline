/**
 * فرم گزارش مخاطرات ایمنی (SHOR) - چندزبانه (فارسی، انگلیسی، عربی)
 */
import React, { useState } from 'react';
import { safetyHazardService, SafetyHazardFormData } from '../../services/safetyHazardService';
import { useLanguage } from '../../contexts/LanguageContext';

const TYPE_OF_HAZARD_OPTIONS = [
  { id: 'organizational', labelKey: 'safety.hazardType.organizational' },
  { id: 'technical', labelKey: 'safety.hazardType.technical' },
  { id: 'human', labelKey: 'safety.hazardType.human' },
  { id: 'environmental', labelKey: 'safety.hazardType.environmental' },
  { id: 'others', labelKey: 'safety.hazardType.others' },
];

const DIRECTOR_ACTION_OPTIONS = [
  { id: 'investigation_verification', labelKey: 'safety.action.investigation' },
  { id: 'risk_assessment', labelKey: 'safety.action.riskAssessment' },
  { id: 'report_to_dept', labelKey: 'safety.action.reportToDept' },
  { id: 'contact_reporter', labelKey: 'safety.action.contactReporter' },
  { id: 'no_further_action', labelKey: 'safety.action.noFurther' },
  { id: 'others_action', labelKey: 'safety.hazardType.others' },
];

interface SafetyHazardFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const SafetyHazardForm: React.FC<SafetyHazardFormProps> = ({ onSuccess, onCancel }) => {
  const { fontClass, language, t } = useLanguage();
  const dir = language === 'en' ? 'ltr' : 'rtl';
  const fontStyle = { fontFamily: 'DigiHamisheBold, Arial, sans-serif' };
  const inputClass = `w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-900/30 focus:border-blue-900 ${fontClass}`;
  const labelClass = `block text-sm font-medium text-gray-700 mb-1.5 ${fontClass}`;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<SafetyHazardFormData>({
    reporter_name: '',
    section: '',
    tel: '',
    report_date: '',
    report_number: '',
    ac_registration: '',
    type_of_hazard: [],
    type_of_hazard_others: '',
    spec_time: '',
    spec_date: '',
    spec_location: '',
    hazard_description: '',
    safety_director_decision: '',
    director_actions: {},
    director_name: '',
    sign_and_date: '',
  });

  const toggleHazardType = (id: string) => {
    const arr = formData.type_of_hazard || [];
    const next = arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id];
    setFormData((p) => ({ ...p, type_of_hazard: next }));
  };

  const setDirectorAction = (id: string, value: boolean | string) => {
    const actions = { ...(formData.director_actions || {}), [id]: value };
    setFormData((p) => ({ ...p, director_actions: actions }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!formData.reporter_name?.trim()) {
      setError(t('cabin.requiredError'));
      return;
    }
    try {
      setLoading(true);
      await safetyHazardService.submitReport({ ...formData, language });
      setSuccess(true);
      setFormData({
        reporter_name: '',
        section: '',
        tel: '',
        report_date: '',
        report_number: '',
        ac_registration: '',
        type_of_hazard: [],
        type_of_hazard_others: '',
        spec_time: '',
        spec_date: '',
        spec_location: '',
        hazard_description: '',
        safety_director_decision: '',
        director_actions: {},
        director_name: '',
        sign_and_date: '',
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

  return (
    <form onSubmit={handleSubmit} className="space-y-5" style={{ direction: dir }}>
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} className="mr-auto text-red-600 hover:text-red-800">×</button>
        </div>
      )}

      <p className="text-gray-600 text-sm" style={fontStyle}>{t('safety.fillTable')}</p>

      {/* اطلاعات گزارش‌دهنده */}
      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-3" style={fontStyle}>{t('safety.reporterInfo')}</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={labelClass}>{t('safety.fullName')} *</label>
            <input
              type="text"
              value={formData.reporter_name}
              onChange={(e) => setFormData((p) => ({ ...p, reporter_name: e.target.value }))}
              className={inputClass}
              placeholder={t('safety.fullName')}
              required
            />
          </div>
          <div>
            <label className={labelClass}>{t('safety.section')}</label>
            <input type="text" value={formData.section} onChange={(e) => setFormData((p) => ({ ...p, section: e.target.value }))} className={inputClass} placeholder={t('safety.section')} />
          </div>
          <div>
            <label className={labelClass}>{t('safety.tel')}</label>
            <input type="text" value={formData.tel} onChange={(e) => setFormData((p) => ({ ...p, tel: e.target.value }))} className={inputClass} placeholder={t('safety.tel')} />
          </div>
          <div>
            <label className={labelClass}>{t('safety.reportNo')}</label>
            <input type="text" value={formData.report_number} onChange={(e) => setFormData((p) => ({ ...p, report_number: e.target.value }))} className={inputClass} placeholder="Report No" />
          </div>
          <div>
            <label className={labelClass}>{t('safety.acReg')}</label>
            <input type="text" value={formData.ac_registration} onChange={(e) => setFormData((p) => ({ ...p, ac_registration: e.target.value }))} className={inputClass} placeholder="A/C Reg." />
          </div>
          <div>
            <label className={labelClass}>{t('safety.reportDate')}</label>
            <input type="text" value={formData.report_date} onChange={(e) => setFormData((p) => ({ ...p, report_date: e.target.value }))} className={inputClass} placeholder={t('safety.reportDate')} />
          </div>
        </div>
      </div>

      {/* نوع مخاطره */}
      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2" style={fontStyle}>{t('safety.hazardType')}</h4>
        <div className="flex flex-wrap gap-2">
          {TYPE_OF_HAZARD_OPTIONS.map((opt) => {
            const checked = (formData.type_of_hazard || []).includes(opt.id);
            return (
              <label key={opt.id} className="flex items-center gap-2 cursor-pointer bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-100">
                <input type="checkbox" checked={checked} onChange={() => toggleHazardType(opt.id)} className="w-4 h-4 text-blue-900 border-gray-300 rounded" />
                <span className="text-sm" style={fontStyle}>{t(opt.labelKey)}</span>
              </label>
            );
          })}
        </div>
        {(formData.type_of_hazard || []).includes('others') && (
          <input
            type="text"
            value={formData.type_of_hazard_others}
            onChange={(e) => setFormData((p) => ({ ...p, type_of_hazard_others: e.target.value }))}
            className={`${inputClass} mt-3`}
            placeholder={t('safety.hazardType.others')}
          />
        )}
      </div>

      {/* مشخصات مخاطره */}
      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-3" style={fontStyle}>{t('safety.hazardSpecs')}</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>{t('safety.specTime')}</label>
            <input type="text" value={formData.spec_time} onChange={(e) => setFormData((p) => ({ ...p, spec_time: e.target.value }))} className={inputClass} placeholder={t('safety.specTime')} />
          </div>
          <div>
            <label className={labelClass}>{t('safety.specDate')}</label>
            <input type="text" value={formData.spec_date} onChange={(e) => setFormData((p) => ({ ...p, spec_date: e.target.value }))} className={inputClass} placeholder={t('safety.specDate')} />
          </div>
          <div>
            <label className={labelClass}>{t('safety.specLocation')}</label>
            <input type="text" value={formData.spec_location} onChange={(e) => setFormData((p) => ({ ...p, spec_location: e.target.value }))} className={inputClass} placeholder={t('safety.specLocation')} />
          </div>
        </div>
      </div>

      {/* توضیحات دقیق مخاطره */}
      <div>
        <label className={labelClass}>{t('safety.hazardDesc')}</label>
        <textarea
          value={formData.hazard_description}
          onChange={(e) => setFormData((p) => ({ ...p, hazard_description: e.target.value }))}
          className={`${inputClass} min-h-[120px]`}
          placeholder="..."
          rows={5}
        />
      </div>

      {/* بخش مدیر ایمنی (اختیاری) */}
      <div className="border-t border-gray-200 pt-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-3" style={fontStyle}>{t('safety.directorDecision')}</h4>
        <textarea
          value={formData.safety_director_decision}
          onChange={(e) => setFormData((p) => ({ ...p, safety_director_decision: e.target.value }))}
          className={`${inputClass} min-h-[80px]`}
          placeholder="..."
          rows={3}
        />
        <div className="flex flex-wrap gap-2 mt-3">
          {DIRECTOR_ACTION_OPTIONS.filter((o) => o.id !== 'others_action').map((opt) => {
            const actions = formData.director_actions || {};
            const checked = !!actions[opt.id];
            return (
              <label key={opt.id} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={checked} onChange={(e) => setDirectorAction(opt.id, e.target.checked)} className="w-4 h-4 text-blue-900 border-gray-300 rounded" />
                <span className="text-sm" style={fontStyle}>{t(opt.labelKey)}</span>
              </label>
            );
          })}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={!!(formData.director_actions || {}).others_action}
              onChange={(e) => setDirectorAction('others_action', e.target.checked)}
              className="w-4 h-4 text-blue-900 border-gray-300 rounded"
            />
            <span className="text-sm" style={fontStyle}>{t('safety.hazardType.others')}</span>
          </label>
          {(formData.director_actions || {}).others_action && (
            <input
              type="text"
              value={((formData.director_actions?.others_action_text as string) || '')}
              onChange={(e) => setDirectorAction('others_action_text', e.target.value)}
              className={`${inputClass} w-48`}
              placeholder="..."
            />
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div>
            <label className={labelClass}>{t('safety.directorName')}</label>
            <input type="text" value={formData.director_name} onChange={(e) => setFormData((p) => ({ ...p, director_name: e.target.value }))} className={inputClass} placeholder="" />
          </div>
          <div>
            <label className={labelClass}>{t('safety.signDate')}</label>
            <input type="text" value={formData.sign_and_date} onChange={(e) => setFormData((p) => ({ ...p, sign_and_date: e.target.value }))} className={inputClass} placeholder="" />
          </div>
        </div>
      </div>

      <div className="text-gray-500 text-xs pt-2" style={fontStyle}>
        {t('safety.footer')} Safety@nasimair.com | 734900318
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

export default SafetyHazardForm;
