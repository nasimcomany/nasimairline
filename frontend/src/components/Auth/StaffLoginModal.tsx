/**
 * ورود پرسنل - فقط برای کاربران دارای دسترسی
 */
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { XMarkIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { loginUser } from '../../store/slices/authSlice';
import { AppDispatch } from '../../store';
import { authService } from '../../services/authService';
import { useLanguage } from '../../contexts/LanguageContext';

interface StaffLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const StaffLoginModal: React.FC<StaffLoginModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { t, language, fontClass } = useLanguage();
  const dir = language === 'en' ? 'ltr' : 'rtl';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('ایمیل/کد ملی و رمز عبور الزامی است.');
      return;
    }
    try {
      setLoading(true);
      const data = await authService.staffLogin({ email: email.trim(), password });
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      localStorage.setItem('user', JSON.stringify(data.user));
      dispatch(loginUser.fulfilled(data, 'staff', { email: email.trim(), password }));
      onClose();
      setEmail('');
      setPassword('');
    } catch (err: any) {
      const msg = err.response?.data?.email?.[0]
        || err.response?.data?.non_field_errors?.[0]
        || err.response?.data?.detail
        || (typeof err.response?.data === 'string' ? err.response?.data : null)
        || 'ورود ناموفق بود. در صورت داشتن دسترسی پرسنل، اطلاعات را بررسی کنید.';
      setError(typeof msg === 'string' ? msg : 'ورود ناموفق بود');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div
        className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
        style={{ direction: dir }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 end-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <XMarkIcon className="w-5 h-5 text-gray-500" />
        </button>

        <h2 className="text-xl font-bold text-blue-900 mb-6" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
          {t('nav.loginStaff') || 'ورود پرسنل'}
        </h2>
        <p className="text-gray-600 text-sm mb-4">
          ورود فقط برای پرسنل دارای دسترسی
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className={`block text-sm font-medium text-gray-700 mb-1.5 ${fontClass}`}>
              ایمیل یا کد ملی
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-900/30 focus:border-blue-900 ${fontClass}`}
              placeholder="example@email.com یا ۱۲۳۴۵۶۷۸۹۰"
              dir={dir}
              autoComplete="username"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium text-gray-700 mb-1.5 ${fontClass}`}>
              رمز عبور
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-900/30 focus:border-blue-900 pr-10 ${fontClass}`}
                placeholder="رمز عبور"
                dir={dir}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-900 hover:bg-blue-800 disabled:bg-blue-900/70 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                در حال ورود...
              </>
            ) : (
              'ورود'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StaffLoginModal;
