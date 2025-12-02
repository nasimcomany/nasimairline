import React, { useState } from 'react';
import EmiratesHeader from '../components/Layout/EmiratesHeader';
import { useLanguage } from '../contexts/LanguageContext';
import { ticketService, CreateTicketData } from '../services/ticketService';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useNavigate } from 'react-router-dom';
import { 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const ComplaintPage: React.FC = () => {
  const { t, fontClass, language } = useLanguage();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<CreateTicketData>({
    title: '',
    description: '',
    category: 'FEEDBACK',
    priority: 'NORMAL',
    source: 'WEB',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Removed authentication check - allow all users to access complaint page

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.title || !formData.description) {
      setError('لطفاً عنوان و توضیحات را وارد کنید');
      return;
    }

    try {
      setLoading(true);
      const ticket = await ticketService.createTicket(formData);
      setSuccess(`شکایت شما با شماره ${ticket.reference} با موفقیت ثبت شد`);
      setFormData({
        title: '',
        description: '',
        category: 'FEEDBACK',
        priority: 'NORMAL',
        source: 'WEB',
      });
    } catch (error: any) {
      setError(error.response?.data?.detail || 'خطا در ثبت شکایت');
      console.error('Error creating complaint:', error);
    } finally {
      setLoading(false);
    }
  };

  // Allow both authenticated and non-authenticated users

  return (
    <div className="min-h-screen bg-white">
      <EmiratesHeader />
      
      {/* Hero Section - Similar to HomePage */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <h1 
            className="text-white mb-6"
            style={{ 
              fontFamily: 'DigiHamisheBold, Arial, sans-serif',
              fontSize: 'clamp(2.5rem, 8vw, 4rem)',
              fontWeight: 'bold',
              lineHeight: '1.2',
              textShadow: '2px 2px 8px rgba(0,0,0,0.5)',
              direction: 'rtl'
            }}
          >
            ثبت شکایت و انتقاد
          </h1>
          <p 
            className="text-white/90 mb-8"
            style={{ 
              fontFamily: 'DigiHamisheBold, Arial, sans-serif',
              fontSize: 'clamp(1.2rem, 3vw, 1.5rem)',
              fontWeight: 'normal',
              lineHeight: '1.6',
              textShadow: '1px 1px 4px rgba(0,0,0,0.5)',
              direction: 'rtl'
            }}
          >
            نظرات، انتقادات و پیشنهادات خود را با ما در میان بگذارید
          </p>
        </div>
      </section>

      {/* Complaint Form Section */}
      <section className="relative z-10 py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
              <p className="text-green-800" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                {success}
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
              <p className="text-red-800" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                {error}
              </p>
            </div>
          )}

          {/* Form Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-6 py-4">
              <h2 
                className="text-white text-2xl font-bold"
                style={{ 
                  fontFamily: 'DigiHamisheBold, Arial, sans-serif',
                  direction: 'rtl'
                }}
              >
                فرم ثبت شکایت
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* User Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 mb-2 text-gray-700" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                    <UserIcon className="w-5 h-5 text-blue-900" />
                    نام و نام خانوادگی
                  </label>
                  <input
                    type="text"
                    value={user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : user?.email || ''}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: 'rtl' }}
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 mb-2 text-gray-700" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                    <EnvelopeIcon className="w-5 h-5 text-blue-900" />
                    ایمیل
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: 'ltr' }}
                  />
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="flex items-center gap-2 mb-2 text-gray-700" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                  <DocumentTextIcon className="w-5 h-5 text-blue-900" />
                  عنوان شکایت <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all"
                  style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: 'rtl' }}
                  placeholder="عنوان شکایت خود را وارد کنید"
                />
              </div>

              {/* Description */}
              <div>
                <label className="flex items-center gap-2 mb-2 text-gray-700" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                  <DocumentTextIcon className="w-5 h-5 text-blue-900" />
                  توضیحات <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all resize-none"
                  style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: 'rtl' }}
                  placeholder="توضیحات کامل شکایت خود را وارد کنید..."
                />
              </div>

              {/* Priority */}
              <div>
                <label className="flex items-center gap-2 mb-2 text-gray-700" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                  <ExclamationTriangleIcon className="w-5 h-5 text-blue-900" />
                  اولویت
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all"
                  style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: 'rtl' }}
                >
                  <option value="LOW">کم</option>
                  <option value="NORMAL">متوسط</option>
                  <option value="HIGH">بالا</option>
                  <option value="URGENT">فوری</option>
                </select>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-900 hover:bg-blue-800 text-white font-semibold px-12 py-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                  style={{ 
                    fontFamily: 'DigiHamisheBold, Arial, sans-serif',
                    direction: 'rtl'
                  }}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      در حال ارسال...
                    </>
                  ) : (
                    <>
                      <PaperAirplaneIcon className="w-5 h-5" />
                      ارسال شکایت
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Info Section */}
          <div className="mt-12 bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h3 
              className="text-gray-900 mb-4 text-xl font-bold"
              style={{ 
                fontFamily: 'DigiHamisheBold, Arial, sans-serif',
                direction: 'rtl'
              }}
            >
              نکات مهم
            </h3>
            <ul className="space-y-2" style={{ direction: 'rtl' }}>
              <li className="flex items-start gap-2 text-gray-700">
                <CheckCircleIcon className="w-5 h-5 text-blue-900 mt-1 flex-shrink-0" />
                <span style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                  شکایات شما در اسرع وقت بررسی و پاسخ داده می‌شوند
                </span>
              </li>
              <li className="flex items-start gap-2 text-gray-700">
                <CheckCircleIcon className="w-5 h-5 text-blue-900 mt-1 flex-shrink-0" />
                <span style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                  شماره پیگیری برای پیگیری وضعیت شکایت به شما ارسال می‌شود
                </span>
              </li>
              <li className="flex items-start gap-2 text-gray-700">
                <CheckCircleIcon className="w-5 h-5 text-blue-900 mt-1 flex-shrink-0" />
                <span style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                  برای پیگیری سریع‌تر می‌توانید با پشتیبانی تماس بگیرید
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ComplaintPage;

