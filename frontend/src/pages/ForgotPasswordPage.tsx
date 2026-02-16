import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import EmiratesHeader from '../components/Layout/EmiratesHeader';
import { useLanguage } from '../contexts/LanguageContext';
import { authService } from '../services/authService';
import { EyeIcon, EyeSlashIcon, EnvelopeIcon, KeyIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const ForgotPasswordPage: React.FC = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { t, fontClass, language } = useLanguage();
  const fontStyle = {
    fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif",
  };

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!email.trim()) {
      setError(
        language === 'fa'
          ? 'لطفاً ایمیل خود را وارد کنید'
          : language === 'ar'
          ? 'يرجى إدخال بريدك الإلكتروني'
          : 'Please enter your email'
      );
      return;
    }

    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSuccess(
        language === 'fa'
          ? 'کد تأیید به ایمیل شما ارسال شد'
          : language === 'ar'
          ? 'تم إرسال رمز التحقق إلى بريدك الإلكتروني'
          : 'Verification code sent to your email'
      );
      setStep(2);
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          (language === 'fa'
            ? 'خطا در ارسال کد. لطفاً دوباره تلاش کنید'
            : language === 'ar'
            ? 'خطأ في الإرسال. يرجى المحاولة مرة أخرى'
            : 'Error sending code. Please try again')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 8) {
      setError(
        language === 'fa'
          ? 'رمز عبور باید حداقل ۸ کاراکتر باشد'
          : language === 'ar'
          ? 'يجب أن تكون كلمة المرور 8 أحرف على الأقل'
          : 'Password must be at least 8 characters'
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(
        language === 'fa'
          ? 'رمز عبور و تکرار آن یکسان نیست'
          : language === 'ar'
          ? 'كلمات المرور غير متطابقة'
          : 'Passwords do not match'
      );
      return;
    }

    setLoading(true);
    try {
      await authService.verifyResetCode(email, code, newPassword);
      setSuccess(
        language === 'fa'
          ? 'رمز عبور با موفقیت تغییر کرد. اکنون وارد شوید.'
          : language === 'ar'
          ? 'تم تغيير كلمة المرور بنجاح. يمكنك تسجيل الدخول الآن.'
          : 'Password changed successfully. You can now log in.'
      );
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          (language === 'fa'
            ? 'خطا در تغییر رمز. کد منقضی شده یا نادرست است.'
            : language === 'ar'
            ? 'خطأ. الكود منتهي الصلاحية أو غير صحيح.'
            : 'Error. Code may be expired or incorrect.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <EmiratesHeader />
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl p-8 shadow-2xl border border-gray-200">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4">
                <KeyIcon className="h-7 w-7 text-white" />
              </div>
              <h1 className={`text-2xl font-bold text-gray-900 mb-2 ${fontClass}`} style={fontStyle}>
                {t('forgotPassword.title')}
              </h1>
              <p className={`text-gray-600 text-sm ${fontClass}`} style={fontStyle}>
                {step === 1 ? t('forgotPassword.step1Desc') : t('forgotPassword.step2Desc')}
              </p>
            </div>

            {error && (
              <div className={`mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm ${fontClass}`} style={fontStyle}>
                {error}
              </div>
            )}
            {success && (
              <div className={`mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm flex items-center gap-2 ${fontClass}`} style={fontStyle}>
                <CheckCircleIcon className="h-5 w-5 flex-shrink-0" />
                {success}
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={handleRequestCode} className="space-y-5">
                <div>
                  <label htmlFor="email" className={`flex items-center gap-2 text-gray-700 font-medium mb-2 text-sm ${fontClass}`} style={fontStyle}>
                    <EnvelopeIcon className="h-5 w-5" />
                    {t('auth.email')}
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full rounded-lg p-3 border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${fontClass}`}
                    placeholder={t('auth.emailPlaceholder')}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all ${fontClass}`}
                >
                  {loading ? (language === 'fa' ? 'در حال ارسال...' : language === 'ar' ? 'جاري الإرسال...' : 'Sending...') : t('forgotPassword.sendCode')}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div>
                  <label className={`text-gray-700 font-medium mb-2 block text-sm ${fontClass}`} style={fontStyle}>
                    {t('auth.email')}: {email}
                  </label>
                </div>
                <div>
                  <label className={`text-gray-700 font-medium mb-2 block text-sm ${fontClass}`} style={fontStyle}>
                    {t('forgotPassword.verificationCode')}
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    className={`w-full rounded-lg p-3 border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 text-center text-lg tracking-widest ${fontClass}`}
                    dir="ltr"
                    placeholder="------"
                  />
                </div>
                <div>
                  <label className={`text-gray-700 font-medium mb-2 block text-sm ${fontClass}`} style={fontStyle}>
                    {t('forgotPassword.newPassword')}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={`w-full rounded-lg p-3 pr-10 border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 ${fontClass}`}
                      minLength={8}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className={`text-gray-700 font-medium mb-2 block text-sm ${fontClass}`} style={fontStyle}>
                    {t('forgotPassword.confirmPassword')}
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full rounded-lg p-3 border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 ${fontClass}`}
                    minLength={8}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
                  >
                    {language === 'fa' ? 'بازگشت' : language === 'ar' ? 'رجوع' : 'Back'}
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg shadow-lg disabled:opacity-50"
                  >
                    {loading ? (language === 'fa' ? 'در حال تغییر...' : language === 'ar' ? 'جاري التغيير...' : 'Changing...') : t('forgotPassword.resetPassword')}
                  </button>
                </div>
              </form>
            )}

            <p className="mt-6 text-center text-sm">
              <Link to="/" className="font-medium text-blue-600 hover:text-blue-700">
                {t('forgotPassword.backToLogin')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
