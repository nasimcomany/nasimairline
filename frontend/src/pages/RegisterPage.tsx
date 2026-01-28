import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { registerUser, clearError } from '../store/slices/authSlice';
import { useAppDispatch } from '../store/hooks';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import GlassmorphismHeader from '../components/Layout/GlassmorphismHeader';
import { useLanguage } from '../contexts/LanguageContext';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);
  const [captchaAnswer, setCaptchaAnswer] = useState(''); // ✨ جدید: ذخیره جواب کپچا
  
  const { loading, error } = useSelector((state: RootState) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t, fontClass } = useLanguage();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (error) {
      dispatch(clearError());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert(t('auth.passwordMismatch'));
      return;
    }

    if (!termsChecked) {
      alert('لطفاً شرایط و قوانین را تأیید کنید');
      return;
    }

    // ✨ اعتبارسنجی کپچا قبل از نمایش مودال
    if (!captchaAnswer.trim()) {
      alert('لطفاً کد امنیتی را وارد کنید');
      return;
    }

    setShowTermsModal(true);
  };

  const handleAgreeAirlineTerms = async () => {
    setShowTermsModal(false);
    
    try {
      await dispatch(registerUser({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone_number: formData.phone,
        password: formData.password,
        password_confirm: formData.password,
        captcha: captchaAnswer, // ✨ جدید: ارسال کپچا به سرور
      })).unwrap();
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Registration error details:', error);
      alert(error?.message || 'خطا در ثبت‌نام');
    }
  };

  const handleCancelAirlineTerms = () => {
    setShowTermsModal(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background image */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/images/airport-crew.jpg)'
        }}
      >
        <div className="absolute inset-0 bg-black/30"></div>
        
        <div className="absolute bottom-0 left-0 right-0 h-32">
          <div className="flex justify-between px-8">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="w-1 h-20 bg-yellow-400/60 blur-sm"></div>
            ))}
          </div>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
      </div>

      <GlassmorphismHeader />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 pt-32 pb-8">
        <div className="w-full max-w-md">
          <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/30">
            <div className="text-center mb-6">
              <h1 className={`text-2xl font-bold text-white mb-2 ${fontClass}`}>
                {t('auth.register')}
              </h1>
              <p className={`text-blue-200 text-xs ${fontClass}`}>
                {t('common.or')} {' '}
                <Link to="/login" className="font-medium text-blue-300 hover:text-blue-200 transition-colors">
                  {t('auth.loginExisting')}
                </Link>
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && (
                <div className={`bg-red-500/20 backdrop-blur-sm border border-red-400/50 text-red-200 px-3 py-2 rounded-lg text-xs ${fontClass}`}>
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="firstName" className={`flex items-center gap-1.5 text-white font-medium mb-1 text-xs ${fontClass}`}>
                    {t('auth.firstName')}
                  </label>
                  <div className="mt-1">
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`w-full bg-white/80 backdrop-blur-sm rounded-lg p-2.5 border border-white/50 text-blue-900 placeholder-blue-600/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm ${fontClass}`}
                      placeholder={t('auth.firstName')}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="lastName" className={`flex items-center gap-1.5 text-white font-medium mb-1 text-xs ${fontClass}`}>
                    {t('auth.lastName')}
                  </label>
                  <div className="mt-1">
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`w-full bg-white/80 backdrop-blur-sm rounded-lg p-2.5 border border-white/50 text-blue-900 placeholder-blue-600/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm ${fontClass}`}
                      placeholder={t('auth.lastName')}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="email" className={`flex items-center gap-1.5 text-white font-medium mb-1 text-xs ${fontClass}`}>
                  {t('auth.email')}
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full bg-white/80 backdrop-blur-sm rounded-lg p-2.5 border border-white/50 text-blue-900 placeholder-blue-600/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm ${fontClass}`}
                    placeholder={t('auth.emailPlaceholder')}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className={`flex items-center gap-1.5 text-white font-medium mb-1 text-xs ${fontClass}`}>
                  {t('auth.phone')}
                </label>
                <div className="mt-1">
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full bg-white/80 backdrop-blur-sm rounded-lg p-2.5 border border-white/50 text-blue-900 placeholder-blue-600/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm ${fontClass}`}
                    placeholder={t('auth.phone')}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className={`flex items-center gap-1.5 text-white font-medium mb-1 text-xs ${fontClass}`}>
                  {t('auth.password')}
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full bg-white/80 backdrop-blur-sm rounded-lg p-2.5 pr-10 border border-white/50 text-blue-900 placeholder-blue-600/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm ${fontClass}`}
                    placeholder={t('auth.passwordPlaceholder')}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-4 w-4 text-blue-600" />
                    ) : (
                      <EyeIcon className="h-4 w-4 text-blue-600" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className={`flex items-center gap-1.5 text-white font-medium mb-1 text-xs ${fontClass}`}>
                  {t('auth.confirmPassword')}
                </label>
                <div className="mt-1 relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full bg-white/80 backdrop-blur-sm rounded-lg p-2.5 pr-10 border border-white/50 text-blue-900 placeholder-blue-600/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm ${fontClass}`}
                    placeholder={t('auth.confirmPasswordPlaceholder')}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-4 w-4 text-blue-600" />
                    ) : (
                      <EyeIcon className="h-4 w-4 text-blue-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* ✨ فیلد کپچا - جدید */}
              <div>
                <label htmlFor="captcha" className={`flex items-center gap-1.5 text-white font-medium mb-1 text-xs ${fontClass}`}>
                  کد امنیتی (مثال: ۲ + ۳ = ؟)
                </label>
                <div className="mt-1">
                  <input
                    id="captcha"
                    name="captcha"
                    type="text"
                    required
                    value={captchaAnswer}
                    onChange={(e) => setCaptchaAnswer(e.target.value)}
                    className={`w-full bg-white/80 backdrop-blur-sm rounded-lg p-2.5 border border-white/50 text-blue-900 placeholder-blue-600/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm ${fontClass}`}
                    placeholder="پاسخ را وارد کنید"
                  />
                </div>
              </div>

              {/* ✨ بخش چک‌باکس شرایط اصلی - کنترل‌شده با state */}
              <div className="flex items-start pt-1">
                <input
                  id="agree-terms"
                  name="agree-terms"
                  type="checkbox"
                  checked={termsChecked}
                  onChange={(e) => {
                    setTermsChecked(e.target.checked);
                    if (error) dispatch(clearError());
                  }}
                  className="w-4 h-4 mt-1 text-blue-600 bg-white/80 border-white/50 rounded focus:ring-blue-500/50"
                />
                <label htmlFor="agree-terms" className={`mr-2 block text-xs text-white cursor-pointer ${fontClass}`}>
                  {t('auth.agreeTerms').split(' ').slice(0, -2).join(' ')}{' '}
                  <a href="#" className="text-blue-300 hover:text-blue-200 transition-colors">
                    {t('auth.terms')}
                  </a>{' '}
                  {t('auth.agreeTerms').split(' ').slice(-1).join(' ')}
                </label>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 ${fontClass}`}
                >
                  {loading ? t('auth.creatingAccount') : t('auth.registerButton')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* ✨ مودال شرایط هواپیمایی - در انتهای کامپوننت */}
      {showTermsModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleCancelAirlineTerms}
        >
          <div 
            className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-md p-6 relative border border-white/40"
            onClick={(e) => e.stopPropagation()}
            style={{ 
              background: 'linear-gradient(145deg, rgba(255,255,255,0.92) 0%, rgba(240,248,255,0.85) 100%)',
              boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.35)'
            }}
          >
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-blue-100 rounded-full opacity-70 blur-2xl"></div>
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-sky-100 rounded-full opacity-60 blur-3xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-center mb-5 pb-3 border-b border-blue-100">
                <div className="bg-blue-600 text-white rounded-full p-2 mr-3 shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className={`text-xl font-bold text-gray-800 ${fontClass}`}>
                  شرایط برنامه وفاداری نسیم ایر
                </h2>
              </div>
              
              <div className="mb-6 max-h-60 overflow-y-auto pr-2">
                <p className={`text-sm text-gray-700 leading-relaxed ${fontClass}`}>
                  با ثبت‌نام در برنامه وفاداری «نسیم ایر»، شما موافقت می‌کنید که:
                </p>
                <ul className={`mt-3 space-y-2 pr-3 text-sm text-gray-800 ${fontClass}`}>
                  <li className="flex items-start">
                    <span className="text-blue-600 ml-2 mt-1">•</span>
                    <span>اطلاعات پروازهای شما جهت محاسبه و اهدای امتیاز وفاداری توسط شرکت هواپیمایی نسیم ایر جمع‌آوری گردد.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 ml-2 mt-1">•</span>
                    <span>امتیازات کسب‌شده قابل استفاده برای تخفیف در خرید بلیط‌های آتی، ارتقاء کلاس پرواز و خدمات ویژه باشد.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 ml-2 mt-1">•</span>
                    <span>شرکت نسیم ایر متعهد به رعایت کامل حریم خصوصی شما و عدم اشتراک‌گذاری داده‌ها با سایر جهات بدون رضایت کتبی شماست.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 ml-2 mt-1">•</span>
                    <span>عدم پذیرش این شرایط، امکان عضویت در برنامه وفاداری را منتفی می‌سازد.</span>
                  </li>
                </ul>
                <p className={`mt-4 text-xs text-gray-500 italic ${fontClass}`}>
                  این موارد مطابق با قوانین هواپیمایی جمهوری اسلامی ایران و مقررات بین‌المللی حفظ حریم خصوصی تنظیم شده است.
                </p>
              </div>
              
              <div className="flex justify-between gap-3 pt-4 border-t border-blue-50">
                <button
                  type="button"
                  onClick={handleCancelAirlineTerms}
                  className="flex-1 py-2.5 px-4 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200"
                >
                  انصراف
                </button>
                <button
                  type="button"
                  onClick={handleAgreeAirlineTerms}
                  disabled={loading}
                  className={`flex-1 py-2.5 px-4 rounded-xl font-medium text-white transition-all duration-200 ${
                    loading 
                      ? 'bg-blue-400 cursor-wait' 
                      : 'bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      در حال پردازش...
                    </span>
                  ) : 'موافقم و ادامه می‌دهم'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterPage;