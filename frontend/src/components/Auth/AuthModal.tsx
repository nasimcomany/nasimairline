import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
  }, [isOpen, mode]);

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate captcha
    if (parseInt(loginForm.captcha) !== captcha.answer) {
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate captcha
    if (parseInt(registerForm.captcha) !== captcha.answer) {
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

    try {
      const registerData: any = {
        email: `${registerForm.nationalId}@nasimair.com`,
        password: registerForm.password,
        password_confirm: registerForm.confirmPassword,
        first_name: registerForm.nationalId,
        last_name: registerForm.nationality,
        phone_number: '',
        date_of_birth: registerForm.birthDate,
        nationality: registerForm.nationality
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
          email: registerForm.nationalId,
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
    </div>
  );
};

export default AuthModal;

