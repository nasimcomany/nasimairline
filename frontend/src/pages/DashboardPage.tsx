import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setUser } from '../store/slices/authSlice';
import EmiratesHeader from '../components/Layout/EmiratesHeader';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../services/api';
import { authService } from '../services/authService';
import { 
  UserIcon, 
  StarIcon,
  SparklesIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  EnvelopeIcon,
  PhoneIcon,
  IdentificationIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

interface UserProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  national_id?: string;
  date_of_birth?: string;
  gender?: string;
  nationality?: string;
  membership_level: string;
  loyalty_points: number;
  uuid?: string;
  date_joined?: string;
}

const DashboardPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const { t, fontClass, language } = useLanguage();
  
  // Captcha state
  const [captcha, setCaptcha] = useState({ num1: 0, num2: 0, operator: '+', answer: 0 });
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [captchaError, setCaptchaError] = useState('');
  
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [emailValue, setEmailValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');

  // Generate new captcha
  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 20) + 1;
    const num2 = Math.floor(Math.random() * 20) + 1;
    const operators = ['+', '-'];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    const answer = operator === '+' ? num1 + num2 : num1 - num2;
    setCaptcha({ num1, num2, operator, answer });
    setCaptchaInput('');
    setCaptchaError('');
  };

  // Generate captcha on mount - ALWAYS require captcha on page load
  useEffect(() => {
    // Always reset captcha verification on every page load/refresh
    // This ensures users must solve captcha every time they access the dashboard
    generateCaptcha();
    setCaptchaVerified(false);
    setCaptchaInput('');
    setCaptchaError('');
  }, []);

  // Handle captcha verification
  const handleCaptchaVerify = () => {
    const answer = parseInt(captchaInput.trim());
    if (isNaN(answer) || answer !== captcha.answer) {
      setCaptchaError(language === 'fa' ? 'کد امنیتی اشتباه است' : language === 'ar' ? 'رمز الأمان غير صحيح' : 'Security code is incorrect');
      generateCaptcha();
      return;
    }
    setCaptchaVerified(true);
    setCaptchaError('');
  };

  // دریافت اطلاعات کامل پروفایل از API
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      setFetching(true);
      try {
        const profile = await authService.getProfile();
        setProfileData(profile as UserProfile);
        setPhoneNumber(profile.phone_number || '');
        setEmailValue(profile.email || '');
      } catch (err) {
        console.error('Error fetching profile:', err);
        setProfileData(user as UserProfile);
        setPhoneNumber(user.phone_number || '');
      } finally {
        setFetching(false);
      }
    };

    fetchProfile();
  }, [user]);

  useEffect(() => {
    if (profileData?.email) setEmailValue(profileData.email);
  }, [profileData?.email]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(e.target.value);
    setError('');
    setSuccess('');
  };

  const handleSavePhone = async () => {
    if (!phoneNumber.trim()) {
      setError(language === 'fa' ? 'لطفاً شماره تلفن را وارد کنید' : language === 'ar' ? 'يرجى إدخال رقم الهاتف' : 'Please enter phone number');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.patch('/accounts/users/update_profile/', {
        phone_number: phoneNumber.trim(),
      });

      const updatedProfile = await authService.getProfile();
      setProfileData(updatedProfile as UserProfile);
      dispatch(setUser(updatedProfile));
      localStorage.setItem('user', JSON.stringify(updatedProfile));
      
      setSuccess(language === 'fa' ? 'شماره تلفن با موفقیت ذخیره شد' : language === 'ar' ? 'تم حفظ رقم الهاتف بنجاح' : 'Phone number saved successfully');
      setIsEditingPhone(false);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Update error:', err);
      setError(err.response?.data?.detail || err.response?.data?.error || (language === 'fa' ? 'خطا در ذخیره شماره تلفن' : language === 'ar' ? 'خطأ في حفظ رقم الهاتف' : 'Error saving phone number'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPhone = () => {
    setPhoneNumber(profileData?.phone_number || '');
    setIsEditingPhone(false);
    setError('');
    setSuccess('');
  };

  const handleSaveEmail = async () => {
    if (!emailValue.trim()) {
      setError(language === 'fa' ? 'لطفاً ایمیل را وارد کنید' : language === 'ar' ? 'يرجى إدخال البريد' : 'Please enter email');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.patch('/accounts/users/update_profile/', { email: emailValue.trim() });
      const updatedProfile = await authService.getProfile();
      setProfileData(updatedProfile as UserProfile);
      dispatch(setUser(updatedProfile));
      localStorage.setItem('user', JSON.stringify(updatedProfile));
      setSuccess(language === 'fa' ? 'ایمیل با موفقیت ذخیره شد' : language === 'ar' ? 'تم حفظ البريد بنجاح' : 'Email saved successfully');
      setIsEditingEmail(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || (language === 'fa' ? 'خطا در ذخیره ایمیل' : language === 'ar' ? 'خطأ في حفظ البريد' : 'Error saving email'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEmail = () => {
    setEmailValue(profileData?.email || user?.email || '');
    setIsEditingEmail(false);
    setError('');
    setSuccess('');
  };

  const getMembershipBadge = (level: string) => {
    const badges = {
      bronze: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white',
      silver: 'bg-gradient-to-r from-gray-500 to-gray-600 text-white',
      gold: 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white',
      platinum: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
    };
    return badges[level as keyof typeof badges] || badges.bronze;
  };

  const getMembershipName = (level: string) => {
    const names = {
      bronze: language === 'fa' ? 'برنزی' : language === 'ar' ? 'برونزي' : 'Bronze',
      silver: language === 'fa' ? 'نقره‌ای' : language === 'ar' ? 'فضي' : 'Silver',
      gold: language === 'fa' ? 'طلایی' : language === 'ar' ? 'ذهبي' : 'Gold',
      platinum: language === 'fa' ? 'پلاتینیوم' : language === 'ar' ? 'بلاتينيوم' : 'Platinum'
    };
    return names[level as keyof typeof names] || names.bronze;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(language === 'fa' ? 'fa-IR' : language === 'ar' ? 'ar-SA' : 'en-US');
    } catch {
      return dateString;
    }
  };

  const fontStyle = {
    fontFamily: language === 'fa' ? 'DigiHamishe, DigiHamisheBold, sans-serif' : language === 'en' ? 'Inter, sans-serif' : "'Noto Sans Arabic', sans-serif"
  };

  const canEditPhone = true; // شماره تلفن همیشه قابل ویرایش است

  // Show captcha modal if not verified - Compact
  if (!captchaVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 flex items-center justify-center">
        <EmiratesHeader />
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <div 
            className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-5">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl mb-3">
                <SparklesIcon className="h-6 w-6 text-white" />
              </div>
              <h2 className={`text-xl font-bold text-blue-600 mb-1 ${fontClass}`} style={fontStyle}>
                {language === 'fa' ? 'تأیید امنیتی' : language === 'ar' ? 'التحقق' : 'Security'}
              </h2>
              <p className={`text-gray-600 text-sm ${fontClass}`} style={fontStyle}>
                {language === 'fa' 
                  ? 'کد امنیتی را حل کنید' 
                  : language === 'ar' 
                  ? 'حل رمز الأمان' 
                  : 'Solve the code'}
              </p>
            </div>

            {/* Captcha - Compact */}
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-lg p-3 text-center">
                  <span className={`text-xl font-bold text-blue-600 ${fontClass}`} style={{ ...fontStyle, direction: 'ltr' }}>
                    ? = {captcha.num1} {captcha.operator} {captcha.num2}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={generateCaptcha}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium transition-colors"
                  style={fontStyle}
                >
                  {language === 'fa' ? 'تغییر' : language === 'ar' ? 'تغيير' : 'Change'}
                </button>
              </div>
              <input
                type="text"
                value={captchaInput}
                onChange={(e) => {
                  setCaptchaInput(e.target.value.replace(/\D/g, ''));
                  setCaptchaError('');
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleCaptchaVerify();
                  }
                }}
                className={`w-full px-3 py-2 border-2 ${captchaError ? 'border-red-300' : 'border-blue-300'} rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-base font-semibold text-gray-900 ${fontClass}`}
                style={{ ...fontStyle, direction: 'ltr', textAlign: 'right' }}
                placeholder={language === 'fa' ? 'پاسخ' : language === 'ar' ? 'الإجابة' : 'Answer'}
                autoFocus
              />
              {captchaError && (
                <p className={`text-red-600 text-xs mt-1 ${fontClass}`} style={fontStyle}>
                  {captchaError}
                </p>
              )}
            </div>

            {/* Verify Button - Compact */}
            <button
              onClick={handleCaptchaVerify}
              disabled={!captchaInput.trim()}
              className={`w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${fontClass}`}
              style={fontStyle}
            >
              {language === 'fa' ? 'تأیید' : language === 'ar' ? 'تأكيد' : 'Verify'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600">
      <EmiratesHeader />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">
        {/* Header Section - Compact */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white rounded-lg shadow-lg">
              <SparklesIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold text-white ${fontClass}`} style={fontStyle}>
                {language === 'fa' ? 'پروفایل' : language === 'ar' ? 'الملف' : 'Profile'}
              </h1>
              <p className={`text-white/90 text-sm ${fontClass}`} style={fontStyle}>
                {language === 'fa' 
                  ? `${profileData?.first_name || user?.first_name || ''} ${profileData?.last_name || user?.last_name || ''}` 
                  : language === 'ar' 
                  ? `${profileData?.first_name || user?.first_name || ''} ${profileData?.last_name || user?.last_name || ''}` 
                  : `${profileData?.first_name || user?.first_name || ''} ${profileData?.last_name || user?.last_name || ''}`}
              </p>
            </div>
          </div>
        </div>

        {/* ✨ Alert: تکمیل احراز هویت - نمایش وقتی ایمیل یا شماره تلفن خالی است */}
        {(!profileData?.phone_number || !profileData?.phone_number?.trim()) && (
          <div 
            className="mb-4 rounded-xl p-4 border-l-4 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-500 shadow-lg backdrop-blur-sm"
            style={fontStyle}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 p-2 bg-amber-100 rounded-lg">
                <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className={`font-bold text-amber-800 mb-1 ${fontClass}`}>
                  {t('profile.completeVerification')}
                </h3>
                <p className={`text-amber-700 text-sm ${fontClass}`}>
                  {t('profile.completeVerificationDesc')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Success/Error Messages - Compact */}
        {success && (
          <div className={`mb-4 bg-green-50 border-l-4 border-green-500 text-green-800 px-4 py-3 rounded-lg shadow-md text-sm ${fontClass}`} style={fontStyle}>
            <div className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4" />
              {success}
            </div>
          </div>
        )}
        {error && (
          <div className={`mb-4 bg-red-50 border-l-4 border-red-500 text-red-800 px-4 py-3 rounded-lg shadow-md text-sm ${fontClass}`} style={fontStyle}>
            {error}
          </div>
        )}

        {/* Profile Card - Compact Blue Design */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          {/* Header with Blue Gradient - Compact */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 relative">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center border-2 border-white/30 shadow-lg">
                  <UserIcon className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 shadow-md border-2 border-white">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className={`text-xl font-bold text-white ${fontClass}`} style={fontStyle}>
                    {profileData?.first_name || user?.first_name || ''} {profileData?.last_name || user?.last_name || ''}
                  </h2>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow-md ${getMembershipBadge((profileData?.membership_level || user?.membership_level || 'bronze').toLowerCase())} ${fontClass}`} style={fontStyle}>
                    {getMembershipName((profileData?.membership_level || user?.membership_level || 'bronze').toLowerCase())}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <StarIcon className="h-5 w-5 text-yellow-300" />
                  <span className={`text-white/90 text-sm font-semibold ${fontClass}`} style={fontStyle}>
                    {language === 'fa' ? 'امتیاز:' : language === 'ar' ? 'نقاط:' : 'Points:'}
                  </span>
                  <span className={`text-lg font-bold text-white ${fontClass}`} style={fontStyle}>
                    {(profileData?.loyalty_points || user?.loyalty_points || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Information - Compact */}
          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* First Name */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-md">
                    <UserIcon className="h-4 w-4 text-white" />
                  </div>
                  <label className={`text-xs font-bold text-blue-600 uppercase ${fontClass}`} style={fontStyle}>
                    {language === 'fa' ? 'نام' : language === 'ar' ? 'الاسم' : 'First Name'}
                  </label>
                </div>
                <p className={`text-blue-900 text-base font-semibold ${fontClass}`} style={fontStyle}>
                  {profileData?.first_name || user?.first_name || '-'}
                </p>
              </div>

              {/* Last Name */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-md">
                    <UserIcon className="h-4 w-4 text-white" />
                  </div>
                  <label className={`text-xs font-bold text-blue-600 uppercase ${fontClass}`} style={fontStyle}>
                    {language === 'fa' ? 'نام خانوادگی' : language === 'ar' ? 'العائلة' : 'Last Name'}
                  </label>
                </div>
                <p className={`text-blue-900 text-base font-semibold ${fontClass}`} style={fontStyle}>
                  {profileData?.last_name || user?.last_name || '-'}
                </p>
              </div>

              {/* National ID */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-md">
                    <IdentificationIcon className="h-4 w-4 text-white" />
                  </div>
                  <label className={`text-xs font-bold text-blue-600 uppercase ${fontClass}`} style={fontStyle}>
                    {language === 'fa' ? 'کد ملی' : language === 'ar' ? 'الرقم' : 'National ID'}
                  </label>
                </div>
                <p className={`text-blue-900 text-base font-semibold ${fontClass}`} style={fontStyle}>
                  {profileData?.national_id || (user as any)?.national_id || '-'}
                </p>
              </div>

              {/* Email - Editable */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-md">
                      <EnvelopeIcon className="h-4 w-4 text-white" />
                    </div>
                    <label className={`text-xs font-bold text-blue-600 uppercase ${fontClass}`} style={fontStyle}>
                      {language === 'fa' ? 'ایمیل' : language === 'ar' ? 'البريد' : 'Email'}
                    </label>
                  </div>
                  {!isEditingEmail && (
                    <button
                      onClick={() => setIsEditingEmail(true)}
                      className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg shadow-md transition-all text-xs"
                      style={fontStyle}
                    >
                      <PencilIcon className="h-3 w-3" />
                      <span className={`font-medium ${fontClass}`}>{language === 'fa' ? 'ویرایش' : language === 'ar' ? 'تعديل' : 'Edit'}</span>
                    </button>
                  )}
                </div>
                {isEditingEmail ? (
                  <div className="space-y-3">
                    <input
                      type="email"
                      value={emailValue}
                      onChange={(e) => setEmailValue(e.target.value)}
                      className={`w-full px-3 py-2 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-600 text-blue-900 text-sm font-semibold ${fontClass}`}
                      style={fontStyle}
                      dir="ltr"
                    />
                    <div className="flex items-center gap-2">
                      <button onClick={handleSaveEmail} disabled={loading} className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-md disabled:opacity-50 text-sm" style={fontStyle}>
                        {loading ? <><svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>{language === 'fa' ? 'ذخیره...' : language === 'ar' ? 'حفظ...' : 'Saving...'}</> : <><CheckIcon className="h-4 w-4" /><span className={fontClass}>{language === 'fa' ? 'ذخیره' : language === 'ar' ? 'حفظ' : 'Save'}</span></>}
                      </button>
                      <button onClick={handleCancelEmail} disabled={loading} className="flex items-center gap-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50 text-sm" style={fontStyle}>
                        <XMarkIcon className="h-4 w-4" /><span className={fontClass}>{language === 'fa' ? 'انصراف' : language === 'ar' ? 'إلغاء' : 'Cancel'}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className={`text-blue-900 text-base font-semibold ${fontClass}`} style={fontStyle}>
                    {profileData?.email || user?.email || '-'}
                  </p>
                )}
              </div>

              {/* Phone Number - Editable Only Once - Compact */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200 md:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-md">
                      <PhoneIcon className="h-4 w-4 text-white" />
                    </div>
                    <label className={`text-xs font-bold text-blue-600 uppercase ${fontClass}`} style={fontStyle}>
                      {language === 'fa' ? 'تلفن' : language === 'ar' ? 'الهاتف' : 'Phone'}
                    </label>
                  </div>
                  {canEditPhone && !isEditingPhone && (
                    <button
                      onClick={() => setIsEditingPhone(true)}
                      className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg shadow-md transition-all text-xs"
                      style={fontStyle}
                    >
                      <PencilIcon className="h-3 w-3" />
                      <span className={`font-medium ${fontClass}`}>
                        {language === 'fa' ? 'ویرایش' : language === 'ar' ? 'تعديل' : 'Edit'}
                      </span>
                    </button>
                  )}
                </div>
                
                {isEditingPhone && canEditPhone ? (
                  <div className="space-y-3">
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={handlePhoneChange}
                      className={`w-full px-3 py-2 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-blue-900 text-sm font-semibold ${fontClass}`}
                      style={fontStyle}
                      placeholder={language === 'fa' ? '09123456789' : language === 'ar' ? '09123456789' : '09123456789'}
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSavePhone}
                        disabled={loading}
                        className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        style={fontStyle}
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className={fontClass}>
                              {language === 'fa' ? 'ذخیره...' : language === 'ar' ? 'حفظ...' : 'Saving...'}
                            </span>
                          </>
                        ) : (
                          <>
                            <CheckIcon className="h-4 w-4" />
                            <span className={`font-semibold ${fontClass}`}>
                              {language === 'fa' ? 'ذخیره' : language === 'ar' ? 'حفظ' : 'Save'}
                            </span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleCancelPhone}
                        disabled={loading}
                        className="flex items-center gap-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        style={fontStyle}
                      >
                        <XMarkIcon className="h-4 w-4" />
                        <span className={`font-semibold ${fontClass}`}>
                          {language === 'fa' ? 'انصراف' : language === 'ar' ? 'إلغاء' : 'Cancel'}
                        </span>
                      </button>
                    </div>
                    <p className={`text-xs text-blue-600 ${fontClass}`} style={fontStyle}>
                      {language === 'fa' ? 'شماره باید با 09 شروع شود (مثال: 09123456789)' : language === 'ar' ? 'يجب أن يبدأ الرقم بـ 09' : 'Number should start with 09'}
                    </p>
                  </div>
                ) : (
                  <p className={`text-blue-900 text-base font-semibold ${fontClass}`} style={fontStyle}>
                    {profileData?.phone_number || user?.phone_number || (language === 'fa' ? 'وارد نشده' : language === 'ar' ? 'غير مدخل' : 'Not set')}
                  </p>
                )}
              </div>

              {/* Date of Birth - Compact */}
              {profileData?.date_of_birth && (
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-md">
                      <CalendarIcon className="h-4 w-4 text-white" />
                    </div>
                    <label className={`text-xs font-bold text-blue-600 uppercase ${fontClass}`} style={fontStyle}>
                      {language === 'fa' ? 'تولد' : language === 'ar' ? 'الميلاد' : 'Birth'}
                    </label>
                  </div>
                  <p className={`text-blue-900 text-base font-semibold ${fontClass}`} style={fontStyle}>
                    {formatDate(profileData.date_of_birth)}
                  </p>
                </div>
              )}

              {/* Registration Date - Compact */}
              {profileData?.date_joined && (
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-md">
                      <CalendarIcon className="h-4 w-4 text-white" />
                    </div>
                    <label className={`text-xs font-bold text-blue-600 uppercase ${fontClass}`} style={fontStyle}>
                      {language === 'fa' ? 'عضویت' : language === 'ar' ? 'العضوية' : 'Joined'}
                    </label>
                  </div>
                  <p className={`text-blue-900 text-base font-semibold ${fontClass}`} style={fontStyle}>
                    {formatDate(profileData.date_joined)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
