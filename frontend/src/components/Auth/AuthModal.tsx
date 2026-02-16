import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { XMarkIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { loginUser, registerUser } from '../../store/slices/authSlice';
import { AppDispatch } from '../../store';
import CustomSelect from '../CustomSelect/CustomSelect';
import { useLanguage } from '../../contexts/LanguageContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false); // ✨ نمایش مودال شرایط
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  // Login form
  const [loginForm, setLoginForm] = useState({
    nationalId: '',
    password: '',
    captcha: ''
  });

  // Register form
  const [registerForm, setRegisterForm] = useState({
    nationality: 'iranian',
    nationalId: '',
    birthDate: '',
    password: '',
    confirmPassword: '',
    captcha: ''
  });

  // Captcha
  const [captcha, setCaptcha] = useState({ num1: 0, num2: 0, operator: '+', answer: 0 });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Generate new captcha
  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 20) + 1;
    const num2 = Math.floor(Math.random() * 20) + 1;
    const operators = ['+', '-'];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    const answer = operator === '+' ? num1 + num2 : num1 - num2;
    setCaptcha({ num1, num2, operator, answer });
  };

  useEffect(() => {
    if (isOpen) {
      generateCaptcha();
      setError('');
      setSuccess('');
    }
  }, [isOpen]);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const validateNationalId = (nationalId: string): boolean => {
    if (nationalId.length !== 10) return false;
    const check = parseInt(nationalId[9]);
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(nationalId[i]) * (10 - i);
    }
    const remainder = sum % 11;
    return (remainder < 2 && check === remainder) || (remainder >= 2 && check === 11 - remainder);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate captcha
    const captchaAnswer = parseInt(loginForm.captcha.trim());
    if (isNaN(captchaAnswer) || captchaAnswer !== captcha.answer) {
      setError(t('auth.captchaError'));
      generateCaptcha();
      setLoginForm(prev => ({ ...prev, captcha: '' }));
      return;
    }

    // Validate input: must be either national ID (10 digits) or passport number (6-20 alphanumeric)
    const input = loginForm.nationalId.trim();
    
    // Check if it's a national ID (10 digits) or passport number (6-20 alphanumeric)
    const isNationalId = /^\d{10}$/.test(input);
    const isPassportNumber = /^[A-Z0-9]{6,20}$/.test(input);
    
    if (!isNationalId && !isPassportNumber) {
      if (input.length === 10 && !isNationalId) {
        setError(t('auth.invalidNationalId'));
      } else {
        setError(t('auth.nationalIdOrPassportInvalid'));
      }
      return;
    }
    
    // If it's a national ID, validate checksum
    if (isNationalId && !validateNationalId(input)) {
      setError(t('auth.invalidNationalId'));
      return;
    }

    // ✨ نمایش مودال شرایط قبل از لاگین
    setShowTermsModal(true);
  };

  // ✨ لاگین پس از موافقت با شرایط
  const handleAgreeLoginTerms = async () => {
    setShowTermsModal(false);
    setError('');

    const input = loginForm.nationalId.trim();

    try {
      // Construct email: nationalId@nasimair.com or passportNumber@nasimair.com
      await dispatch(loginUser({
        email: `${input}@nasimair.com`,
        password: loginForm.password
      })).unwrap();
      
      setSuccess(t('auth.loginSuccess'));
      setTimeout(() => {
        onClose();
        navigate('/dashboard');
      }, 1000);
    } catch (err: any) {
      setError(err.message || t('auth.loginError'));
      generateCaptcha();
    }
  };

  // ✨ نمایش مودال شرایط قبل از ثبت‌نام
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate captcha
    const captchaAnswer = parseInt(registerForm.captcha.trim());
    if (isNaN(captchaAnswer) || captchaAnswer !== captcha.answer) {
      setError(t('auth.captchaError'));
      generateCaptcha();
      setRegisterForm(prev => ({ ...prev, captcha: '' }));
      return;
    }

    // Validate national ID (only for Iranian nationality)
    if (registerForm.nationality === 'iranian' && !validateNationalId(registerForm.nationalId)) {
      setError(t('auth.invalidNationalId'));
      return;
    }
    
    // Basic validation for passport number (for non-Iranian)
    if (registerForm.nationality !== 'iranian' && registerForm.nationalId.length < 6) {
      setError(t('auth.invalidPassport'));
      return;
    }

    // Validate passwords match
    if (registerForm.password !== registerForm.confirmPassword) {
      setError(t('auth.passwordMismatch'));
      return;
    }

    // Validate password strength
    if (registerForm.password.length < 8) {
      setError(t('auth.passwordMinLength'));
      return;
    }

    // Validate birth date
    const today = new Date();
    const birthDate = new Date(registerForm.birthDate);
    const age = today.getFullYear() - birthDate.getFullYear();
    if (age < 18) {
      setError(t('auth.ageRestriction'));
      return;
    }

    // ✨ نمایش مودال شرایط قبل از ثبت‌نام
    setShowTermsModal(true);
  };

  // ✨ ثبت‌نام پس از موافقت با شرایط
  const handleAgreeTerms = async () => {
    setShowTermsModal(false);
    setError('');

    try {
      const registerData: any = {
        email: `${registerForm.nationalId}@nasimair.com`,
        password: registerForm.password,
        password_confirm: registerForm.confirmPassword,
        first_name: registerForm.nationalId,
        last_name: registerForm.nationality,
        phone_number: '', // ✨ خالی چون در فرم نیست
        date_of_birth: registerForm.birthDate,
        nationality: registerForm.nationality,
        captcha: registerForm.captcha // ✨ ارسال به سرور (در بک‌اند حذف می‌شه)
      };
      
      // اگر ملیت ایرانی بود، national_id بفرست، در غیر این صورت passport_number
      if (registerForm.nationality === 'iranian') {
        registerData.national_id = registerForm.nationalId;
      } else {
        registerData.passport_number = registerForm.nationalId;
      }
      
      await dispatch(registerUser(registerData)).unwrap();

      setSuccess(t('auth.registerSuccess'));
      
      // Auto login after registration
      setTimeout(async () => {
        await dispatch(loginUser({
          email: `${registerForm.nationalId}@nasimair.com`,
          password: registerForm.password
        })).unwrap();
        onClose();
        navigate('/dashboard');
      }, 1500);
    } catch (err: any) {
      setError(err.message || t('auth.registerError'));
      generateCaptcha();
    }
  };

  // ✨ انصراف از ثبت‌نام
  const handleCancelTerms = () => {
    setShowTermsModal(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-10"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-6 rounded-t-2xl">
          <h2 
            className="text-2xl font-bold text-white text-center"
            style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}
          >
            {mode === 'login' ? t('auth.loginTitle') : t('auth.registerTitle')}
          </h2>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
              {success}
            </div>
          )}

          {/* Login Form */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              {/* National ID / Passport Number */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                  {t('auth.nationalId')}
                  <span className="block text-xs font-normal text-gray-500 mt-1" style={{ direction: language === 'en' ? 'ltr' : 'rtl' }}>
                    {t('auth.foreignNationalMessage')}
                  </span>
                </label>
                <input
                  type="text"
                  value={loginForm.nationalId}
                  onChange={(e) => {
                    // Accept both numbers (for national ID) and alphanumeric (for passport)
                    const value = e.target.value.toUpperCase();
                    // Allow numbers, letters, and common passport characters
                    const cleaned = value.replace(/[^A-Z0-9]/g, '');
                    setLoginForm(prev => ({ ...prev, nationalId: cleaned.slice(0, 20) }));
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
                  style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: 'ltr', textAlign: 'right' }}
                  placeholder={t('auth.nationalIdOrPassportPlaceholder')}
                  maxLength={20}
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                  {t('auth.password')}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginForm.password}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
                    style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}
                    placeholder={t('auth.passwordPlaceholder')}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Captcha */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                  {t('auth.captcha')}
                </label>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex-1 bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-center">
                    <span className="text-2xl font-bold text-blue-900" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: 'ltr' }}>
                      ? = {captcha.num1} {captcha.operator} {captcha.num2}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={generateCaptcha}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
                    style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}
                  >
                    {t('auth.captchaChange')}
                  </button>
                </div>
                <input
                  type="text"
                  value={loginForm.captcha}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, captcha: e.target.value.replace(/\D/g, '') }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
                  style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}
                  placeholder={t('auth.captchaPlaceholder')}
                  required
                />
              </div>

              {/* Forgot Password Link */}
              <div className="text-center">
                <Link
                  to="/forgot-password"
                  onClick={onClose}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                  style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}
                >
                  {t('auth.forgotPassword')}
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-3 rounded-lg transition-colors"
                style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}
              >
                {t('auth.loginButton')}
              </button>
            </form>
          )}

          {/* Register Form */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Nationality */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                  {t('auth.nationality')}
                </label>
                <CustomSelect
                  value={registerForm.nationality}
                  onChange={(value) => setRegisterForm(prev => ({ ...prev, nationality: value }))}
                  options={[
                    { value: 'iranian', label: t('nationality.iranian') },
                    { value: 'afghan', label: t('nationality.afghan') },
                    { value: 'iraqi', label: t('nationality.iraqi') },
                    { value: 'other', label: t('nationality.other') }
                  ]}
                  placeholder={t('auth.selectNationality')}
                />
              </div>

              {/* National ID / Passport Number */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                  {registerForm.nationality === 'iranian' 
                    ? t('auth.nationalIdRegister') 
                    : t('auth.passportNumber')}
                </label>
                <input
                  type="text"
                  value={registerForm.nationalId}
                  onChange={(e) => {
                    if (registerForm.nationality === 'iranian') {
                      // فقط اعداد و حداکثر 10 رقم برای کد ملی
                      setRegisterForm(prev => ({ ...prev, nationalId: e.target.value.replace(/\D/g, '').slice(0, 10) }));
                    } else {
                      // برای پاسپورت: حروف و اعداد، حداکثر 20 کاراکتر
                      setRegisterForm(prev => ({ ...prev, nationalId: e.target.value.toUpperCase().slice(0, 20) }));
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
                  style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: registerForm.nationality === 'iranian' ? 'ltr' : 'ltr', textAlign: 'right' }}
                  placeholder={
                    registerForm.nationality === 'iranian' 
                      ? t('auth.nationalIdPlaceholder') 
                      : t('auth.passportPlaceholder')
                  }
                  maxLength={registerForm.nationality === 'iranian' ? 10 : 20}
                  required
                />
              </div>

              {/* Birth Date */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                  {t('auth.birthDate')}
                </label>
                <input
                  type="date"
                  value={registerForm.birthDate}
                  onChange={(e) => setRegisterForm(prev => ({ ...prev, birthDate: e.target.value }))}
                  max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
                  style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                  {t('auth.password')}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
                    style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}
                    placeholder={t('auth.passwordPlaceholder')}
                    minLength={8}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                  {t('auth.confirmPassword')}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={registerForm.confirmPassword}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
                    style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}
                    placeholder={t('auth.confirmPasswordPlaceholder')}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Captcha */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                  {t('auth.captcha')}
                </label>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex-1 bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-center">
                    <span className="text-2xl font-bold text-blue-900" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: 'ltr' }}>
                      ? = {captcha.num1} {captcha.operator} {captcha.num2}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={generateCaptcha}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
                    style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}
                  >
                    {t('auth.captchaChange')}
                  </button>
                </div>
                <input
                  type="text"
                  value={registerForm.captcha}
                  onChange={(e) => setRegisterForm(prev => ({ ...prev, captcha: e.target.value.replace(/\D/g, '') }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
                  style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}
                  placeholder={t('auth.captchaPlaceholder')}
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-3 rounded-lg transition-colors"
                style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}
              >
                {t('auth.registerButton')}
              </button>
            </form>
          )}

          {/* Toggle Mode */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError('');
                setSuccess('');
              }}
              className="text-blue-900 hover:text-blue-800 font-bold text-sm"
              style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}
            >
              {mode === 'login' ? t('auth.noAccount') : t('auth.haveAccount')}
            </button>
          </div>
        </div>
      </div>

      {/* ✨ مودال شرایط برنامه وفاداری */}
      {showTermsModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10000] flex items-center justify-center p-4"
          onClick={handleCancelTerms}
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
                <h2 className="text-xl font-bold text-gray-800" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                  شرایط برنامه وفاداری نسیم ایر
                </h2>
              </div>
              
              <div className="mb-6 max-h-60 overflow-y-auto pr-2">
                <p className="text-sm text-gray-700 leading-relaxed" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                  با ثبت‌نام در برنامه وفاداری «نسیم ایر»، شما موافقت می‌کنید که:
                </p>
                <ul className="mt-3 space-y-2 pr-3 text-sm text-gray-800" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
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
                <p className="mt-4 text-xs text-gray-500 italic" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                  این موارد مطابق با قوانین هواپیمایی جمهوری اسلامی ایران و مقررات بین‌المللی حفظ حریم خصوصی تنظیم شده است.
                </p>
              </div>
              
              <div className="flex justify-between gap-3 pt-4 border-t border-blue-50">
                <button
                  type="button"
                  onClick={handleCancelTerms}
                  className="flex-1 py-2.5 px-4 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200"
                  style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}
                >
                  انصراف
                </button>
                <button
                  type="button"
                  onClick={mode === 'login' ? handleAgreeLoginTerms : handleAgreeTerms}
                  disabled={!!error}
                  className={`flex-1 py-2.5 px-4 rounded-xl font-medium text-white transition-all duration-200 ${
                    error 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 shadow-lg hover:shadow-xl'
                  }`}
                  style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}
                >
                  {error ? 'در حال پردازش...' : 'موافقم و ادامه می‌دهم'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthModal;