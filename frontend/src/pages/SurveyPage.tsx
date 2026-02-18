/**
 * فرم نظرسنجی
 * Luxury minimal design with blue-900 - like TicketPage
 */
import React, { useState } from 'react';
import EmiratesHeader from '../components/Layout/EmiratesHeader';
import { useLanguage } from '../contexts/LanguageContext';
import { surveyService, SurveyFormData } from '../services/surveyService';

const RATING_OPTIONS = [
  { value: 'excellent', label: 'عالی' },
  { value: 'good', label: 'خوب' },
  { value: 'average', label: 'متوسط' },
  { value: 'poor', label: 'ضعیف' },
];

const SurveyPage: React.FC = () => {
  const { fontClass } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const dir = 'rtl';
  const fontStyle = { fontFamily: "'Vazirmatn', sans-serif" };

  const [formData, setFormData] = useState<SurveyFormData>({
    full_name: '',
    seat_number: '',
    age: '',
    education: '',
    flight_number: '',
    contact_number: '',
    email: '',
    flight_route: '',
    ticketing_website: '',
    trips_with_nasim: '',
    annual_flights: '',
    travel_purpose: '',
    nasim_choice_reason: '',
    station_staff_rating: '',
    cabin_hygiene_rating: '',
    seat_comfort_rating: '',
    cabin_temp_rating: '',
    attendants_service_rating: '',
    attendants_appearance_rating: '',
    sound_system_rating: '',
    catering_quality_rating: '',
    pilot_communication_rating: '',
    on_time_rating: '',
    vs_domestic_rating: '',
    recommend_nasim: '',
    suggestions: '',
  });

  const inputClass = `w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-900/30 focus:border-blue-900 transition-all bg-white ${fontClass}`;
  const labelClass = `block text-sm font-medium text-gray-700 mb-1.5 ${fontClass}`;

  const RadioGroup = ({ name, options }: { name: keyof SurveyFormData; options: { value: string; label: string }[] }) => (
    <div className="flex flex-wrap gap-3" style={{ direction: dir }}>
      {options.map((opt) => (
        <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={formData[name] === opt.value}
            onChange={() => setFormData({ ...formData, [name]: opt.value })}
            className="w-4 h-4 text-blue-900 border-gray-300 focus:ring-blue-900"
          />
          <span className={fontClass}>{opt.label}</span>
        </label>
      ))}
    </div>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!formData.full_name || !formData.flight_number || !formData.contact_number) {
      setError('لطفاً نام و نام خانوادگی، شماره پرواز و شماره تماس را پر کنید.');
      return;
    }
    try {
      setLoading(true);
      await surveyService.submitSurvey(formData);
      setSuccess(true);
      setFormData({
        full_name: '', seat_number: '', age: '', education: '', flight_number: '', contact_number: '', email: '',
        flight_route: '', ticketing_website: '', trips_with_nasim: '', annual_flights: '', travel_purpose: '',
        nasim_choice_reason: '', station_staff_rating: '', cabin_hygiene_rating: '', seat_comfort_rating: '',
        cabin_temp_rating: '', attendants_service_rating: '', attendants_appearance_rating: '', sound_system_rating: '',
        catering_quality_rating: '', pilot_communication_rating: '', on_time_rating: '', vs_domestic_rating: '',
        recommend_nasim: '', suggestions: '',
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'خطا در ثبت نظرسنجی. لطفاً دوباره تلاش کنید.');
    } finally {
      setLoading(false);
    }
  };

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
            <h2 className="text-xl font-bold text-blue-900 mb-2" style={fontStyle}>نظرسنجی شما با موفقیت ثبت شد</h2>
            <p className="text-gray-600 mb-8 text-sm">با تشکر از همکاری شما.</p>
            <button onClick={() => setSuccess(false)} className="px-6 py-3 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-medium">
              ارسال نظرسنجی جدید
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-900">
      <EmiratesHeader />
      <section className="relative py-10 sm:py-12 text-center">
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <h1 className="text-white text-2xl sm:text-4xl font-bold mb-2" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: dir }}>
            فرم نظرسنجی
          </h1>
          <p className="text-white/80 text-sm sm:text-base" style={fontStyle}>
            نظر شما برای ما ارزشمند است
          </p>
        </div>
      </section>

      <section className="relative z-10 max-w-4xl mx-auto px-4 pb-24">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-blue-900/90 px-6 sm:px-8 py-4">
            <h2 className="text-white text-lg font-semibold" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: dir }}>
              اطلاعات شخصی و پرواز
            </h2>
          </div>

          <div className="p-6 sm:p-8 space-y-6" style={{ direction: dir }}>
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
                <span>{error}</span>
                <button type="button" onClick={() => setError(null)} className="mr-auto">×</button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>نام و نام خانوادگی *</label>
                <input type="text" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} className={inputClass} required dir={dir} />
              </div>
              <div>
                <label className={labelClass}>شماره صندلی</label>
                <input type="text" value={formData.seat_number} onChange={(e) => setFormData({ ...formData, seat_number: e.target.value })} className={inputClass} dir={dir} />
              </div>
              <div>
                <label className={labelClass}>سن</label>
                <input type="text" value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} className={inputClass} dir={dir} />
              </div>
              <div>
                <label className={labelClass}>مدرک تحصیلی</label>
                <input type="text" value={formData.education} onChange={(e) => setFormData({ ...formData, education: e.target.value })} className={inputClass} dir={dir} />
              </div>
              <div>
                <label className={labelClass}>شماره پرواز *</label>
                <input type="text" value={formData.flight_number} onChange={(e) => setFormData({ ...formData, flight_number: e.target.value })} className={inputClass} required dir={dir} />
              </div>
              <div>
                <label className={labelClass}>شماره تماس *</label>
                <input type="tel" value={formData.contact_number} onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })} className={inputClass} required dir={dir} />
              </div>
              <div>
                <label className={labelClass}>ایمیل</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={inputClass} dir={dir} />
              </div>
              <div>
                <label className={labelClass}>مسیر پرواز</label>
                <input type="text" value={formData.flight_route} onChange={(e) => setFormData({ ...formData, flight_route: e.target.value })} className={inputClass} dir={dir} />
              </div>
            </div>
            <div>
              <label className={labelClass}>نام وبسایت تهیه بلیط یا آژانس</label>
              <input type="text" value={formData.ticketing_website} onChange={(e) => setFormData({ ...formData, ticketing_website: e.target.value })} className={inputClass} dir={dir} />
            </div>

            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-blue-900 font-semibold mb-4 text-sm" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                تعداد سفر با نسیم
              </h3>
              <RadioGroup name="trips_with_nasim" options={[
                { value: 'weekly', label: 'هفته‌ای یکبار' },
                { value: 'monthly', label: 'ماهی یکبار' },
                { value: 'few_months', label: 'هر چند ماه' },
                { value: 'yearly', label: 'سالی یکبار' },
              ]} />
            </div>

            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-blue-900 font-semibold mb-4 text-sm" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                تعداد سفرهای هوایی در سال
              </h3>
              <RadioGroup name="annual_flights" options={[
                { value: '0-5', label: '۰-۵' },
                { value: '5-10', label: '۵-۱۰' },
                { value: '10-20', label: '۱۰-۲۰' },
                { value: '20+', label: 'بیشتر از ۲۰' },
              ]} />
            </div>

            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-blue-900 font-semibold mb-4 text-sm" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                هدف از سفر
              </h3>
              <RadioGroup name="travel_purpose" options={[
                { value: 'work', label: 'کار' },
                { value: 'leisure', label: 'تفریح' },
                { value: 'education', label: 'تحصیل' },
                { value: 'other', label: 'سایر' },
              ]} />
            </div>

            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-blue-900 font-semibold mb-4 text-sm" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                دلیل انتخاب نسیم
              </h3>
              <RadioGroup name="nasim_choice_reason" options={[
                { value: 'timing', label: 'زمانبندی مناسب' },
                { value: 'services', label: 'خدمات مناسب' },
                { value: 'cost', label: 'هزینه مناسب' },
                { value: 'recommendation', label: 'پیشنهاد دیگران' },
              ]} />
            </div>

            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-blue-900 font-semibold mb-4 text-sm" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                نحوه برخورد پرسنل ایستگاه و گیت سوار شدن به هواپیما
              </h3>
              <RadioGroup name="station_staff_rating" options={RATING_OPTIONS} />
            </div>

            {[
              { key: 'cabin_hygiene_rating', label: 'آراستگی و بهداشت کابین هواپیما' },
              { key: 'seat_comfort_rating', label: 'راحتی صندلی ها و کابین هواپیما' },
              { key: 'cabin_temp_rating', label: 'دمای کابین روی زمین و در طول زمان پرواز' },
              { key: 'attendants_service_rating', label: 'نحوه برخورد و سرویس دهی مهمانداران' },
              { key: 'attendants_appearance_rating', label: 'راستگی ظاهری و یونیفرم مهمانداران' },
              { key: 'sound_system_rating', label: 'کیفیت سیستم صوتی و شیوایی بیان در اعلان‌های پروازی مهمانداران' },
              { key: 'catering_quality_rating', label: 'کیفیت بسته پذیرایی ارائه شده' },
              { key: 'pilot_communication_rating', label: 'برقراری ارتباط خلبان با مسافرین در طول سفر / هوای نامساعد' },
              { key: 'on_time_rating', label: 'رضایتمندی از انجام به موقع پرواز' },
              { key: 'vs_domestic_rating', label: 'رضایتمندی از نسیم در قیاس با شرکت های داخلی' },
            ].map(({ key, label }) => (
              <div key={key} className="pt-4 border-t border-gray-200">
                <h3 className="text-blue-900 font-semibold mb-3 text-sm" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                  {label}
                </h3>
                <RadioGroup name={key as keyof SurveyFormData} options={RATING_OPTIONS} />
              </div>
            ))}

            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-blue-900 font-semibold mb-4 text-sm" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                پیشنهاد سفر با نسیم به سایرین
              </h3>
              <RadioGroup name="recommend_nasim" options={[
                { value: 'yes', label: 'بله' },
                { value: 'no', label: 'خیر' },
              ]} />
            </div>

            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-blue-900 font-semibold mb-4 text-sm" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                پیشنهادها و انتقادها
              </h3>
              <textarea
                value={formData.suggestions}
                onChange={(e) => setFormData({ ...formData, suggestions: e.target.value })}
                rows={4}
                className={`${inputClass} resize-none`}
                dir={dir}
                placeholder="پیشنهادها و انتقادهای خود را بنویسید..."
              />
            </div>

            <div className="pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-blue-900 hover:bg-blue-800 disabled:bg-blue-900/70 text-white rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: dir }}
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

export default SurveyPage;
