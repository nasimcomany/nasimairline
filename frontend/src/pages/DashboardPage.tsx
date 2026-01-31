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
      await api.patch('/api/accounts/users/update_profile/', {
        phone_number: phoneNumber.trim()
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
    fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif"
  };

  const canEditPhone = !profileData?.phone_number || profileData.phone_number.trim() === '';

  // Show captcha modal if not verified
  if (!captchaVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white flex items-center justify-center">
        <EmiratesHeader />
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl border-2 border-blue-200 p-8 max-w-md w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-900 to-blue-800 rounded-2xl mb-4">
                <SparklesIcon className="h-8 w-8 text-white" />
              </div>
              <h2 className={`text-2xl font-bold text-blue-900 mb-2 ${fontClass}`} style={fontStyle}>
                {language === 'fa' ? 'تأیید امنیتی' : language === 'ar' ? 'التحقق الأمني' : 'Security Verification'}
              </h2>
              <p className={`text-gray-600 ${fontClass}`} style={fontStyle}>
                {language === 'fa' 
                  ? 'لطفاً کد امنیتی زیر را حل کنید' 
                  : language === 'ar' 
                  ? 'يرجى حل رمز الأمان أدناه' 
                  : 'Please solve the security code below'}
              </p>
            </div>

            {/* Captcha */}
            <div className="mb-6">
              <label className={`block text-sm font-bold text-gray-700 mb-3 ${fontClass}`} style={fontStyle}>
                {language === 'fa' ? 'کد امنیتی' : language === 'ar' ? 'رمز الأمان' : 'Security Code'}
              </label>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-4 text-center">
                  <span className={`text-2xl font-bold text-blue-900 ${fontClass}`} style={{ ...fontStyle, direction: 'ltr' }}>
                    ? = {captcha.num1} {captcha.operator} {captcha.num2}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={generateCaptcha}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
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
                className={`w-full px-4 py-3 border-2 ${captchaError ? 'border-red-300' : 'border-blue-300'} rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900 text-lg font-semibold text-gray-900 ${fontClass}`}
                style={{ ...fontStyle, direction: 'ltr', textAlign: 'right' }}
                placeholder={language === 'fa' ? 'پاسخ را وارد کنید' : language === 'ar' ? 'أدخل الإجابة' : 'Enter the answer'}
                autoFocus
              />
              {captchaError && (
                <p className={`text-red-600 text-sm mt-2 ${fontClass}`} style={fontStyle}>
                  {captchaError}
                </p>
              )}
            </div>

            {/* Verify Button */}
            <button
              onClick={handleCaptchaVerify}
              disabled={!captchaInput.trim()}
              className={`w-full py-3 px-6 bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${fontClass}`}
              style={fontStyle}
            >
              {language === 'fa' ? 'تأیید و ادامه' : language === 'ar' ? 'تأكيد والمتابعة' : 'Verify and Continue'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white">
      <EmiratesHeader />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8" style={{ paddingTop: 'calc(3rem + 80px)' }}>
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-gradient-to-br from-blue-900 to-blue-800 rounded-xl shadow-xl">
              <SparklesIcon className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className={`text-4xl font-bold text-blue-900 ${fontClass}`} style={fontStyle}>
                {language === 'fa' ? 'پروفایل کاربری' : language === 'ar' ? 'الملف الشخصي' : 'User Profile'}
              </h1>
              <p className={`text-blue-700 text-lg mt-1 ${fontClass}`} style={fontStyle}>
                {language === 'fa' 
                  ? `خوش آمدید، ${profileData?.first_name || user?.first_name || ''} ${profileData?.last_name || user?.last_name || ''}` 
                  : language === 'ar' 
                  ? `مرحباً، ${profileData?.first_name || user?.first_name || ''} ${profileData?.last_name || user?.last_name || ''}` 
                  : `Welcome back, ${profileData?.first_name || user?.first_name || ''} ${profileData?.last_name || user?.last_name || ''}`}
              </p>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className={`mb-6 bg-green-50 border-l-4 border-green-500 text-green-800 px-6 py-4 rounded-lg shadow-md ${fontClass}`} style={fontStyle}>
            <div className="flex items-center gap-2">
              <CheckIcon className="h-5 w-5" />
              {success}
            </div>
          </div>
        )}
        {error && (
          <div className={`mb-6 bg-red-50 border-l-4 border-red-500 text-red-800 px-6 py-4 rounded-lg shadow-md ${fontClass}`} style={fontStyle}>
            {error}
          </div>
        )}

        {/* Profile Card - Premium Blue Design */}
        <div className="bg-white rounded-3xl shadow-2xl border-2 border-blue-100 overflow-hidden">
          {/* Header with Blue Gradient */}
          <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 p-8 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-3xl"></div>
            </div>
            
            <div className="relative z-10 flex items-center gap-6">
              <div className="relative">
                <div className="w-32 h-32 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center border-2 border-white/30 shadow-2xl">
                  <UserIcon className="h-20 w-20 text-white" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 shadow-lg border-4 border-white">
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-3">
                  <h2 className={`text-3xl font-bold text-white ${fontClass}`} style={fontStyle}>
                    {profileData?.first_name || user?.first_name || ''} {profileData?.last_name || user?.last_name || ''}
                  </h2>
                  <span className={`inline-flex items-center px-5 py-2 rounded-full text-sm font-bold shadow-lg ${getMembershipBadge((profileData?.membership_level || user?.membership_level || 'bronze').toLowerCase())} ${fontClass}`} style={fontStyle}>
                    {getMembershipName((profileData?.membership_level || user?.membership_level || 'bronze').toLowerCase())}
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  <StarIcon className="h-6 w-6 text-yellow-300" />
                  <span className={`text-white/90 text-lg font-semibold ${fontClass}`} style={fontStyle}>
                    {language === 'fa' ? 'امتیاز وفاداری:' : language === 'ar' ? 'نقاط الولاء:' : 'Loyalty Points:'}
                  </span>
                  <span className={`text-2xl font-bold text-white ${fontClass}`} style={fontStyle}>
                    {(profileData?.loyalty_points || user?.loyalty_points || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-900 rounded-lg">
                    <UserIcon className="h-5 w-5 text-white" />
                  </div>
                  <label className={`text-sm font-bold text-blue-900 uppercase tracking-wide ${fontClass}`} style={fontStyle}>
                    {language === 'fa' ? 'نام' : language === 'ar' ? 'الاسم الأول' : 'First Name'}
                  </label>
                </div>
                <p className={`text-blue-900 text-xl font-semibold ${fontClass}`} style={fontStyle}>
                  {profileData?.first_name || user?.first_name || '-'}
                </p>
              </div>

              {/* Last Name */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-900 rounded-lg">
                    <UserIcon className="h-5 w-5 text-white" />
                  </div>
                  <label className={`text-sm font-bold text-blue-900 uppercase tracking-wide ${fontClass}`} style={fontStyle}>
                    {language === 'fa' ? 'نام خانوادگی' : language === 'ar' ? 'اسم العائلة' : 'Last Name'}
                  </label>
                </div>
                <p className={`text-blue-900 text-xl font-semibold ${fontClass}`} style={fontStyle}>
                  {profileData?.last_name || user?.last_name || '-'}
                </p>
              </div>

              {/* National ID */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-900 rounded-lg">
                    <IdentificationIcon className="h-5 w-5 text-white" />
                  </div>
                  <label className={`text-sm font-bold text-blue-900 uppercase tracking-wide ${fontClass}`} style={fontStyle}>
                    {language === 'fa' ? 'کد ملی' : language === 'ar' ? 'الرقم الوطني' : 'National ID'}
                  </label>
                </div>
                <p className={`text-blue-900 text-xl font-semibold ${fontClass}`} style={fontStyle}>
                  {profileData?.national_id || (user as any)?.national_id || '-'}
                </p>
              </div>

              {/* Email */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-900 rounded-lg">
                    <EnvelopeIcon className="h-5 w-5 text-white" />
                  </div>
                  <label className={`text-sm font-bold text-blue-900 uppercase tracking-wide ${fontClass}`} style={fontStyle}>
                    {language === 'fa' ? 'ایمیل' : language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                  </label>
                </div>
                <p className={`text-blue-900 text-xl font-semibold ${fontClass}`} style={fontStyle}>
                  {profileData?.email || user?.email || '-'}
                </p>
              </div>

              {/* Phone Number - Editable Only Once */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 md:col-span-2">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-900 rounded-lg">
                      <PhoneIcon className="h-5 w-5 text-white" />
                    </div>
                    <label className={`text-sm font-bold text-blue-900 uppercase tracking-wide ${fontClass}`} style={fontStyle}>
                      {language === 'fa' ? 'شماره تلفن' : language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                    </label>
                  </div>
                  {canEditPhone && !isEditingPhone && (
                    <button
                      onClick={() => setIsEditingPhone(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                      style={fontStyle}
                    >
                      <PencilIcon className="h-4 w-4" />
                      <span className={`text-sm font-medium ${fontClass}`}>
                        {language === 'fa' ? 'ویرایش' : language === 'ar' ? 'تعديل' : 'Edit'}
                      </span>
                    </button>
                  )}
                </div>
                
                {isEditingPhone && canEditPhone ? (
                  <div className="space-y-4">
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={handlePhoneChange}
                      className={`w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900 text-blue-900 text-lg font-semibold ${fontClass}`}
                      style={fontStyle}
                      placeholder={language === 'fa' ? '09123456789' : language === 'ar' ? '09123456789' : '09123456789'}
                    />
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleSavePhone}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-900 hover:bg-blue-800 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={fontStyle}
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className={fontClass}>
                              {language === 'fa' ? 'در حال ذخیره...' : language === 'ar' ? 'جاري الحفظ...' : 'Saving...'}
                            </span>
                          </>
                        ) : (
                          <>
                            <CheckIcon className="h-5 w-5" />
                            <span className={`font-semibold ${fontClass}`}>
                              {language === 'fa' ? 'ذخیره' : language === 'ar' ? 'حفظ' : 'Save'}
                            </span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleCancelPhone}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={fontStyle}
                      >
                        <XMarkIcon className="h-5 w-5" />
                        <span className={`font-semibold ${fontClass}`}>
                          {language === 'fa' ? 'انصراف' : language === 'ar' ? 'إلغاء' : 'Cancel'}
                        </span>
                      </button>
                    </div>
                    <p className={`text-xs text-blue-700 ${fontClass}`} style={fontStyle}>
                      {language === 'fa' ? '⚠️ توجه: شماره تلفن فقط یکبار قابل ثبت است و پس از ذخیره دیگر قابل تغییر نیست' : language === 'ar' ? '⚠️ ملاحظة: يمكن إدخال رقم الهاتف مرة واحدة فقط وبعد الحفظ لا يمكن تغييره' : '⚠️ Note: Phone number can only be set once and cannot be changed after saving'}
                    </p>
                  </div>
                ) : (
                  <p className={`text-blue-900 text-xl font-semibold ${fontClass}`} style={fontStyle}>
                    {profileData?.phone_number || user?.phone_number || (language === 'fa' ? 'وارد نشده' : language === 'ar' ? 'غير مدخل' : 'Not set')}
                  </p>
                )}
              </div>

              {/* Date of Birth */}
              {profileData?.date_of_birth && (
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-900 rounded-lg">
                      <CalendarIcon className="h-5 w-5 text-white" />
                    </div>
                    <label className={`text-sm font-bold text-blue-900 uppercase tracking-wide ${fontClass}`} style={fontStyle}>
                      {language === 'fa' ? 'تاریخ تولد' : language === 'ar' ? 'تاريخ الميلاد' : 'Date of Birth'}
                    </label>
                  </div>
                  <p className={`text-blue-900 text-xl font-semibold ${fontClass}`} style={fontStyle}>
                    {formatDate(profileData.date_of_birth)}
                  </p>
                </div>
              )}

              {/* Registration Date */}
              {profileData?.date_joined && (
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-900 rounded-lg">
                      <CalendarIcon className="h-5 w-5 text-white" />
                    </div>
                    <label className={`text-sm font-bold text-blue-900 uppercase tracking-wide ${fontClass}`} style={fontStyle}>
                      {language === 'fa' ? 'تاریخ عضویت' : language === 'ar' ? 'تاريخ العضوية' : 'Registration Date'}
                    </label>
                  </div>
                  <p className={`text-blue-900 text-xl font-semibold ${fontClass}`} style={fontStyle}>
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
