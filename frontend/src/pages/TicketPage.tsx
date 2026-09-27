/**
 * فرم انتقادات و پیشنهادات - شکایات
 * Luxury minimal design with blue-900
 */
import React, { useState, useEffect } from 'react';
import EmiratesHeader from '../components/Layout/EmiratesHeader';
import { useLanguage } from '../contexts/LanguageContext';
import { complaintService, ComplaintFormData } from '../services/complaintService';

// Complaint type options (نوع شکایت)
const COMPLAINT_TYPES = [
  'آسیب دیدگی جامه دان',
  'مفقودی جامه دان',
  'نارضایتی از عدم اطلاع رسانی تغییرات پرواز',
  'نارضایتی از تاخیر پرواز',
  'نارضایتی از لغو پرواز',
  'مغایرت صندلی',
  'صندلی معیوب',
  'شکایت رفتاری',
  'کترینگ',
  'عدم ارائه سرویس های رزرو',
  'عدم واریز وجه استرداد',
  'اشیاء جامانده در پرواز',
  'عدم پذیرایی در فرودگاه به هنگام تاخیر پرواز',
  'دریافت بلیط بدون نرخ',
  'خطاهای سایت',
];

// Subject options per type - { value, label, disabled (red/non-selectable) }
const SUBJECT_OPTIONS: Record<string, Array<{ value: string; label: string; disabled: boolean }>> = {
  'شکایت رفتاری': [
    { value: 'پرسنل فروش', label: '۱ - پرسنل فروش', disabled: true },
    { value: 'پرسنل ایستگاه', label: '۲ - پرسنل ایستگاه', disabled: false },
    { value: 'کرو پروازی', label: '۳ - کرو پروازی', disabled: false },
  ],
  'کترینگ': [
    { value: 'کیفیت', label: '۱ - کیفیت', disabled: false },
    { value: 'بسته بندی', label: '۲ - بسته بندی', disabled: false },
    { value: 'نحوه پذیرایی', label: '۳ - نحوه پذیرایی', disabled: false },
    { value: 'کمیت', label: '۴ - کمیت', disabled: false },
    { value: 'تنوع', label: '۵ - تنوع', disabled: false },
  ],
  'مغایرت صندلی': [
    { value: 'حیوان خانگی', label: '۱ - حیوان خانگی', disabled: true },
    { value: 'ویلچر', label: '۲ - ویلچر', disabled: false },
    { value: 'صندلی', label: '۳ - صندلی', disabled: false },
    { value: 'بار', label: '۴ - بار', disabled: true },
  ],
  'صندلی معیوب': [
    { value: 'حیوان خانگی', label: '۱ - حیوان خانگی', disabled: true },
    { value: 'ویلچر', label: '۲ - ویلچر', disabled: false },
    { value: 'صندلی', label: '۳ - صندلی', disabled: false },
    { value: 'بار', label: '۴ - بار', disabled: true },
  ],
  'خطاهای سایت': [
    { value: 'بخش فروش بلیط', label: '۱ - بخش فروش بلیط', disabled: false },
    { value: 'باشگاه مشتریان', label: '۲ - باشگاه مشتریان', disabled: false },
    { value: 'سایر', label: '۳ - سایر', disabled: false },
  ],
};

const TicketPage: React.FC = () => {
  const { language, fontClass } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [complaintType, setComplaintType] = useState('');
  const [complaintSubject, setComplaintSubject] = useState('');
  const [selectedSubjectLabel, setSelectedSubjectLabel] = useState('');

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    national_id: '',
    mobile: '',
    email: '',
    origin: '',
    destination: '',
    flight_date: '',
    ticket_number: '',
    flight_number: '',
    description: '',
  });

  const fontStyle = {
    fontFamily: language === 'fa' ? 'DigiHamishe, DigiHamisheBold, sans-serif' : language === 'en' ? 'Inter, sans-serif' : "'Noto Sans Arabic', sans-serif",
  };

  const dir = language === 'en' ? 'ltr' : 'rtl';

  // Reset subject when type changes
  useEffect(() => {
    setComplaintSubject('');
    setSelectedSubjectLabel('');
  }, [complaintType]);

  const subjects = complaintType ? (SUBJECT_OPTIONS[complaintType] || []) : [];
  const hasSubjects = subjects.length > 0;

  // Auto-build complaint_subject field for API
  const buildComplaintSubject = () => {
    if (!complaintType) return '';
    if (!hasSubjects) return complaintType;
    if (!selectedSubjectLabel) return complaintType;
    return `${complaintType} - ${selectedSubjectLabel}`;
  };

  const handleSubjectClick = (type: string, opt: { value: string; label: string; disabled: boolean }) => {
    if (opt.disabled) return;
    setComplaintType(type);
    setComplaintSubject(opt.value);
    setSelectedSubjectLabel(opt.label);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!complaintType) {
      setError('لطفاً نوع شکایت را انتخاب کنید.');
      return;
    }

    if (hasSubjects && !complaintSubject) {
      setError('لطفاً موضوع شکایت را انتخاب کنید.');
      return;
    }

    if (!formData.first_name || !formData.last_name || !formData.mobile || !formData.email) {
      setError('لطفاً تمام فیلدهای ضروری را پر کنید.');
      return;
    }

    try {
      setLoading(true);
      const payload: ComplaintFormData = {
        complaint_type: complaintType,
        complaint_subject: buildComplaintSubject(),
        first_name: formData.first_name,
        last_name: formData.last_name,
        national_id: formData.national_id,
        mobile: formData.mobile,
        email: formData.email,
        origin: formData.origin,
        destination: formData.destination,
        flight_date: formData.flight_date,
        ticket_number: formData.ticket_number,
        flight_number: formData.flight_number,
        description: formData.description,
        language,
      };
      await complaintService.submitComplaint(payload);
      setSuccess(true);
      setComplaintType('');
      setComplaintSubject('');
      setSelectedSubjectLabel('');
      setFormData({ first_name: '', last_name: '', national_id: '', mobile: '', email: '', origin: '', destination: '', flight_date: '', ticket_number: '', flight_number: '', description: '' });
    } catch (err: any) {
      const serverError = err.response?.data?.error;
      const statusMsg = err.response?.status ? ` (کد ${err.response.status})` : '';
      const networkMsg = !err.response && err.message ? ` - ${err.message}` : '';
      setError(serverError || `خطا در ثبت شکایت. لطفاً دوباره تلاش کنید.${statusMsg}${networkMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-900/30 focus:border-blue-900 transition-all bg-white ${fontClass}`;
  const labelClass = `block text-sm font-medium text-gray-700 mb-1.5 ${fontClass}`;

  if (success) {
    return (
      <div className="min-h-screen bg-blue-900">
        <EmiratesHeader />
        <div className="max-w-2xl mx-auto px-4 py-24 text-center" style={{ ...fontStyle, direction: dir }}>
          <div className="bg-white rounded-2xl shadow-xl p-12">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-blue-900/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-blue-900 mb-2" style={fontStyle}>
              شکایت شما با موفقیت ثبت شد
            </h2>
            <p className="text-gray-600 mb-8 text-sm">
              در اسرع وقت به شکایت شما رسیدگی خواهد شد.
            </p>
            <button
              onClick={() => setSuccess(false)}
              className="px-6 py-3 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-medium transition-colors"
            >
              ثبت شکایت جدید
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-900">
      <EmiratesHeader />

      {/* Hero */}
      <section className="relative py-10 sm:py-12 text-center">
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <h1 className="text-white text-2xl sm:text-4xl font-bold mb-2" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: dir }}>
            فرم ثبت شکایات
          </h1>
          <p className="text-white/80 text-sm sm:text-base" style={fontStyle}>
            شکایات و تجربیات خود را با ما به اشتراک بگذارید
          </p>
        </div>
      </section>

      {/* Form - یک کارت واحد */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 pb-24">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header اطلاعات شکایت */}
          <div className="bg-blue-900/90 px-6 sm:px-8 py-4">
            <h2 className="text-white text-lg font-semibold" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: dir }}>
              اطلاعات شکایت
            </h2>
          </div>

          <div className="p-6 sm:p-8 space-y-6" style={{ direction: dir }}>
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
                <span>{error}</span>
                <button type="button" onClick={() => setError(null)} className="mr-auto">×</button>
              </div>
            )}

            {/* ۱ و ۲ - نوع و موضوع شکایت (داخل بخش اطلاعات شکایت) */}
            <div className="space-y-4">
              <div className="text-blue-900 font-medium text-sm" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
                ۱ - نوع شکایت و ۲ - موضوع شکایت
              </div>
              <div className="overflow-x-auto overflow-y-auto max-h-[320px] rounded-xl border border-gray-200">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-right py-3 px-4 font-medium text-gray-700 min-w-[180px]">نوع شکایت</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700 min-w-[200px]">موضوع شکایت</th>
                    </tr>
                  </thead>
                  <tbody>
                    {COMPLAINT_TYPES.map((type) => {
                      const rowSubjects = SUBJECT_OPTIONS[type] || [];
                      return (
                        <tr key={type} className="border-t border-gray-100 hover:bg-gray-50/50">
                          <td className="py-2 px-4 align-top">
                            <button
                              type="button"
                              onClick={() => setComplaintType(type)}
                              className={`w-full px-3 py-2 rounded-lg text-right text-sm transition-all ${fontClass} ${
                                complaintType === type
                                  ? 'bg-blue-900 text-white'
                                  : 'bg-white hover:bg-blue-50 border border-gray-200 text-gray-700'
                              }`}
                            >
                              {type}
                            </button>
                          </td>
                          <td className="py-2 px-4 align-top">
                            {rowSubjects.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5">
                                {rowSubjects.map((opt) => (
                                  <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => handleSubjectClick(type, opt)}
                                    disabled={opt.disabled}
                                    className={`px-2.5 py-1 rounded text-xs transition-all ${fontClass} ${
                                      opt.disabled
                                        ? 'bg-red-50 text-red-400 cursor-not-allowed line-through'
                                        : complaintType === type && complaintSubject === opt.value
                                        ? 'bg-blue-900 text-white'
                                        : 'bg-white hover:bg-blue-50 border border-gray-200 text-gray-700'
                                    }`}
                                  >
                                    {opt.label}
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>۱ - نوع شکایت (انتخاب شده)</label>
                  <input type="text" value={complaintType} readOnly placeholder="از جدول انتخاب کنید" className={`${inputClass} bg-gray-50 cursor-default`} dir={dir} />
                </div>
                <div>
                  <label className={labelClass}>۲ - موضوع شکایت (انتخاب شده)</label>
                  <input type="text" value={selectedSubjectLabel || complaintType || ''} readOnly placeholder="از جدول انتخاب کنید" className={`${inputClass} bg-gray-50 cursor-default`} dir={dir} />
                </div>
              </div>
            </div>

            {/* ۳ - اطلاعات شخصی */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-blue-900 font-semibold mb-4 text-sm" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
                ۳ - اطلاعات شخصی
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass} style={{ direction: dir }}>نام:</label>
                  <input type="text" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} className={inputClass} required dir={dir} />
                </div>
                <div>
                  <label className={labelClass} style={{ direction: dir }}>نام خانوادگی:</label>
                  <input type="text" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} className={inputClass} required dir={dir} />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass} style={{ direction: dir }}>کدملی:</label>
                  <input type="text" value={formData.national_id} onChange={(e) => setFormData({ ...formData, national_id: e.target.value })} className={inputClass} dir={dir} />
                </div>
                <div>
                  <label className={labelClass} style={{ direction: dir }}>شماره تلفن همراه مسافر:</label>
                  <input type="tel" value={formData.mobile} onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} className={inputClass} required dir={dir} />
                </div>
                <div>
                  <label className={labelClass} style={{ direction: dir }}>آدرس ایمیل:</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={inputClass} required dir={dir} />
                </div>
              </div>
            </div>

            {/* ۴ - اطلاعات پرواز */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-blue-900 font-semibold mb-4 text-sm" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
                ۴ - اطلاعات پرواز
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass} style={{ direction: dir }}>مبدا:</label>
                  <input type="text" value={formData.origin} onChange={(e) => setFormData({ ...formData, origin: e.target.value })} className={inputClass} dir={dir} />
                </div>
                <div>
                  <label className={labelClass} style={{ direction: dir }}>مقصد:</label>
                  <input type="text" value={formData.destination} onChange={(e) => setFormData({ ...formData, destination: e.target.value })} className={inputClass} dir={dir} />
                </div>
                <div>
                  <label className={labelClass} style={{ direction: dir }}>تاریخ:</label>
                  <input type="text" value={formData.flight_date} onChange={(e) => setFormData({ ...formData, flight_date: e.target.value })} className={inputClass} dir={dir} placeholder="۱۴۰۴/۱۰/۱۵" />
                </div>
                <div>
                  <label className={labelClass} style={{ direction: dir }}>شماره بلیت:</label>
                  <input type="text" value={formData.ticket_number} onChange={(e) => setFormData({ ...formData, ticket_number: e.target.value })} className={inputClass} dir={dir} />
                </div>
                <div>
                  <label className={labelClass} style={{ direction: dir }}>شماره پرواز:</label>
                  <input type="text" value={formData.flight_number} onChange={(e) => setFormData({ ...formData, flight_number: e.target.value })} className={inputClass} dir={dir} />
                </div>
              </div>
            </div>

            {/* ۵ - توضیحات */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-blue-900 font-semibold mb-4 text-sm" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
                ۵ - توضیحات
              </h3>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className={`${inputClass} resize-none`}
                dir={dir}
                placeholder="توضیحات تکمیلی..."
              />
            </div>

            {/* Submit */}
            <div className="pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-blue-900 hover:bg-blue-800 disabled:bg-blue-900/70 text-white rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: dir }}
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
            </div>
          </div>
        </form>
      </section>
    </div>
  );
};

export default TicketPage;
