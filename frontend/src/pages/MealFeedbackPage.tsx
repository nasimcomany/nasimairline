import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import EmiratesHeader from '../components/Layout/EmiratesHeader';
import {
  StarIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/solid';
import api from '../services/api';

interface FeedbackData {
  flight_number: string;
  origin_city: string;
  destination_city: string;
  first_name: string;
  last_name: string;
  food_quality: number | null;
  food_temperature: number | null;
  food_taste: number | null;
  food_presentation: number | null;
  portion_size: number | null;
  variety: number | null;
  packaging: number | null;
  service_quality: number | null;
  comments: string;
}

const MealFeedbackPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, fontClass, language } = useLanguage();
  
  // Captcha state
  const [captchaValue, setCaptchaValue] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const [captchaError, setCaptchaError] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<FeedbackData>({
    flight_number: '',
    origin_city: '',
    destination_city: '',
    first_name: '',
    last_name: '',
    food_quality: null,
    food_temperature: null,
    food_taste: null,
    food_presentation: null,
    portion_size: null,
    variety: null,
    packaging: null,
    service_quality: null,
    comments: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  // Generate captcha on mount
  React.useEffect(() => {
    generateCaptcha();
  }, []);
  
  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const answer = num1 + num2;
    setCaptchaValue(`? = ${num1} + ${num2}`);
    // Store answer in a way that can be verified
    (window as any).__captchaAnswer = answer;
    setCaptchaInput('');
    setCaptchaError(false);
  };
  
  const verifyCaptcha = () => {
    const userAnswer = parseInt(captchaInput);
    const correctAnswer = (window as any).__captchaAnswer;
    
    if (userAnswer === correctAnswer) {
      setIsCaptchaVerified(true);
      setCaptchaError(false);
    } else {
      setCaptchaError(true);
      generateCaptcha();
    }
  };
  
  const handleRatingChange = (field: keyof FeedbackData, value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleInputChange = (field: keyof FeedbackData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isCaptchaVerified) {
      alert(language === 'fa' ? 'لطفا ابتدا کپچا را تایید کنید' : 'Please verify captcha first');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      const response = await api.post(
        '/customer-service/meal-feedback/',
        formData
      );
      
      if (response.status === 201) {
        setIsSubmitted(true);
        // Scroll to top to show success message
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      setSubmitError(
        language === 'fa'
          ? 'خطا در ارسال بازخورد. لطفا دوباره تلاش کنید.'
          : 'Error submitting feedback. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const RatingStars: React.FC<{
    value: number | null;
    onChange: (value: number) => void;
    label: string;
  }> = ({ value, onChange, label }) => {
    const [hoverValue, setHoverValue] = useState<number | null>(null);
    
    return (
      <div className="mb-4">
        <label className="block text-gray-800 text-xs font-bold mb-2" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
          {label}
        </label>
        <div className="flex gap-1" dir="ltr">
          {[5, 4, 3, 2, 1].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              onMouseEnter={() => setHoverValue(star)}
              onMouseLeave={() => setHoverValue(null)}
              className="transition-transform hover:scale-110 focus:outline-none"
            >
              <StarIcon
                className={`w-7 h-7 ${
                  (hoverValue !== null && star <= hoverValue) || (hoverValue === null && value !== null && star <= value)
                    ? 'text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
        <div className="mt-1 text-xs text-gray-600" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
          {value !== null && (
            <>
              {value === 5 && (language === 'fa' ? 'عالی' : 'Excellent')}
              {value === 4 && (language === 'fa' ? 'خوب' : 'Good')}
              {value === 3 && (language === 'fa' ? 'متوسط' : 'Average')}
              {value === 2 && (language === 'fa' ? 'ضعیف' : 'Poor')}
              {value === 1 && (language === 'fa' ? 'بسیار ضعیف' : 'Very Poor')}
            </>
          )}
        </div>
      </div>
    );
  };
  
  if (isSubmitted) {
  return (
    <>
      <EmiratesHeader />
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 py-8 px-4">
        <div className="max-w-xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1
              className="text-2xl font-bold text-gray-900 mb-3"
              style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}
            >
              {language === 'fa' ? '✅ بازخورد شما ثبت شد' : '✅ Thank You!'}
            </h1>
            <p
              className="text-sm text-gray-600 mb-6"
              style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}
            >
              {language === 'fa'
                ? 'از اینکه وقت گذاشتید سپاسگزاریم. نظرات شما به ما کمک می‌کند تا کیفیت خدمات خود را بهبود بخشیم.'
                : 'Thank you for your feedback. Your input helps us improve our service quality.'}
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all text-sm"
              style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}
            >
              {language === 'fa' ? 'بازگشت به صفحه اصلی' : 'Back to Home'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
  }
  
  return (
    <>
      <EmiratesHeader />
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-block bg-white rounded-xl shadow-lg px-6 py-3 mb-4">
              <h1
                className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
                style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}
              >
                {language === 'fa' ? '🍽️ نظرسنجی غذای پرواز' : '🍽️ Flight Meal Feedback'}
              </h1>
            </div>
            <p
              className="text-sm text-white max-w-xl mx-auto"
              style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}
            >
              {language === 'fa'
                ? 'نظر شما برای ما ارزشمند است. لطفاً کیفیت غذای پرواز را ارزیابی کنید.'
                : 'Your opinion is valuable to us. Please evaluate the flight meal quality.'}
            </p>
          </div>
          
          {/* Captcha Section */}
          {!isCaptchaVerified && (
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
              <h2
                className="text-xl font-bold text-gray-900 mb-4 text-center"
                style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}
              >
                {language === 'fa' ? '🔐 تایید امنیتی' : '🔐 Security Verification'}
              </h2>
              <div className="max-w-sm mx-auto">
                <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg p-4 mb-3 text-center">
                  <p className="text-xs text-gray-700 mb-2" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
                    {language === 'fa' ? 'حاصل این عمل را وارد کنید:' : 'Solve this:'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{captchaValue}</p>
                </div>
                <input
                  type="number"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && verifyCaptcha()}
                  placeholder={language === 'fa' ? 'جواب' : 'Answer'}
                  className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none mb-3 text-center text-lg"
                  style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}
                />
                {captchaError && (
                  <p className="text-red-600 text-xs mb-3 text-center" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
                    {language === 'fa' ? '❌ پاسخ اشتباه است' : '❌ Wrong answer'}
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={verifyCaptcha}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 rounded-lg font-bold hover:from-blue-700 hover:to-indigo-700 transition-all text-sm"
                    style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}
                  >
                    {language === 'fa' ? 'تایید' : 'Verify'}
                  </button>
                  <button
                    type="button"
                    onClick={generateCaptcha}
                    className="px-4 py-2.5 border-2 border-gray-300 rounded-lg font-bold hover:bg-gray-50 transition-all text-sm"
                    style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}
                  >
                    🔄
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Main Form */}
          {isCaptchaVerified && (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-6">
              {/* Flight Information */}
              <div className="mb-6">
                <h2
                  className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-200"
                  style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}
                >
                  {language === 'fa' ? '✈️ اطلاعات پرواز' : '✈️ Flight Information'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-xs font-bold mb-1.5" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
                      {language === 'fa' ? 'شماره پرواز' : 'Flight Number'}
                    </label>
                    <input
                      type="text"
                      value={formData.flight_number}
                      onChange={(e) => handleInputChange('flight_number', e.target.value)}
                      placeholder={language === 'fa' ? 'مثال: NSN6650' : 'e.g., NSN6650'}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
                      style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-xs font-bold mb-1.5" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
                      {language === 'fa' ? 'شهر مبدا' : 'Origin City'}
                    </label>
                    <input
                      type="text"
                      value={formData.origin_city}
                      onChange={(e) => handleInputChange('origin_city', e.target.value)}
                      placeholder={language === 'fa' ? 'مثال: تهران' : 'e.g., Tehran'}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
                      style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-xs font-bold mb-1.5" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
                      {language === 'fa' ? 'شهر مقصد' : 'Destination City'}
                    </label>
                    <input
                      type="text"
                      value={formData.destination_city}
                      onChange={(e) => handleInputChange('destination_city', e.target.value)}
                      placeholder={language === 'fa' ? 'مثال: مشهد' : 'e.g., Mashhad'}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
                      style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}
                    />
                  </div>
                </div>
              </div>
              
              {/* Passenger Information */}
              <div className="mb-6">
                <h2
                  className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-200"
                  style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}
                >
                  {language === 'fa' ? '👤 اطلاعات مسافر' : '👤 Passenger Information'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-xs font-bold mb-1.5" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
                      {language === 'fa' ? 'نام' : 'First Name'}
                    </label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
                      style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-xs font-bold mb-1.5" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
                      {language === 'fa' ? 'نام خانوادگی' : 'Last Name'}
                    </label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
                      style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}
                    />
                  </div>
                </div>
              </div>
              
              {/* Meal Quality Ratings */}
              <div className="mb-6">
                <h2
                  className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-200"
                  style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}
                >
                  {language === 'fa' ? '⭐ ارزیابی کیفیت غذا' : '⭐ Meal Quality Rating'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <RatingStars
                    value={formData.food_quality}
                    onChange={(v) => handleRatingChange('food_quality', v)}
                    label={language === 'fa' ? 'کیفیت کلی غذا' : 'Overall Food Quality'}
                  />
                  <RatingStars
                    value={formData.food_temperature}
                    onChange={(v) => handleRatingChange('food_temperature', v)}
                    label={language === 'fa' ? 'دمای غذا' : 'Food Temperature'}
                  />
                  <RatingStars
                    value={formData.food_taste}
                    onChange={(v) => handleRatingChange('food_taste', v)}
                    label={language === 'fa' ? 'طعم و مزه' : 'Taste'}
                  />
                  <RatingStars
                    value={formData.food_presentation}
                    onChange={(v) => handleRatingChange('food_presentation', v)}
                    label={language === 'fa' ? 'نحوه ارائه' : 'Presentation'}
                  />
                  <RatingStars
                    value={formData.portion_size}
                    onChange={(v) => handleRatingChange('portion_size', v)}
                    label={language === 'fa' ? 'اندازه پرس' : 'Portion Size'}
                  />
                  <RatingStars
                    value={formData.variety}
                    onChange={(v) => handleRatingChange('variety', v)}
                    label={language === 'fa' ? 'تنوع غذایی' : 'Variety'}
                  />
                  <RatingStars
                    value={formData.packaging}
                    onChange={(v) => handleRatingChange('packaging', v)}
                    label={language === 'fa' ? 'بسته‌بندی' : 'Packaging'}
                  />
                  <RatingStars
                    value={formData.service_quality}
                    onChange={(v) => handleRatingChange('service_quality', v)}
                    label={language === 'fa' ? 'کیفیت سرویس' : 'Service Quality'}
                  />
                </div>
              </div>
              
              {/* Comments */}
              <div className="mb-6">
                <h2
                  className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-200"
                  style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}
                >
                  {language === 'fa' ? '💬 نظرات و پیشنهادات' : '💬 Comments & Suggestions'}
                </h2>
                <textarea
                  value={formData.comments}
                  onChange={(e) => handleInputChange('comments', e.target.value)}
                  rows={4}
                  placeholder={language === 'fa' ? 'نظرات یا پیشنهادات خود را بنویسید...' : 'Your comments or suggestions...'}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none text-sm"
                  style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}
                />
              </div>
              
              {/* Submit Error */}
              {submitError && (
                <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 rounded-lg">
                  <p className="text-red-600 text-center text-sm" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
                    {submitError}
                  </p>
                </div>
              )}
              
              {/* Submit Button */}
              <div className="text-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg text-sm font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}
                >
                  {isSubmitting
                    ? (language === 'fa' ? '⏳ در حال ارسال...' : '⏳ Submitting...')
                    : (language === 'fa' ? '✅ ارسال بازخورد' : '✅ Submit Feedback')}
                </button>
                <p className="mt-3 text-xs text-gray-600" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
                  {language === 'fa'
                    ? '* تمام فیلدها اختیاری هستند'
                    : '* All fields are optional'}
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default MealFeedbackPage;
