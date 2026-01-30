import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import EmiratesHeader from '../components/Layout/EmiratesHeader';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { 
  UserIcon, 
  TicketIcon, 
  CreditCardIcon,
  BellIcon,
  StarIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const DashboardPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { t, fontClass, language } = useLanguage();
  const navigate = useNavigate();

  const getMembershipBadge = (level: string) => {
    const badges = {
      bronze: 'bg-gradient-to-r from-amber-400 to-amber-600 text-white',
      silver: 'bg-gradient-to-r from-gray-400 to-gray-600 text-white',
      gold: 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white',
      platinum: 'bg-gradient-to-r from-purple-400 to-purple-600 text-white'
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

  const fontStyle = {
    fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif"
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <EmiratesHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg">
              <SparklesIcon className="h-6 w-6 text-white" />
            </div>
            <h1 className={`text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent ${fontClass}`} style={fontStyle}>
              {language === 'fa' ? 'داشبورد کاربری' : language === 'ar' ? 'لوحة التحكم' : 'User Dashboard'}
            </h1>
          </div>
          <p className={`text-lg text-gray-600 ${fontClass} mt-2`} style={fontStyle}>
            {language === 'fa' 
              ? `خوش آمدید، ${user?.first_name} ${user?.last_name}` 
              : language === 'ar' 
              ? `مرحباً، ${user?.first_name} ${user?.last_name}` 
              : `Welcome back, ${user?.first_name} ${user?.last_name}`}
          </p>
        </div>

        {/* User Info Card - Premium Design */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-10 relative overflow-hidden">
          {/* Decorative gradient background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-transparent rounded-full blur-3xl opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-50 to-transparent rounded-full blur-3xl opacity-50"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar Section */}
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300">
                  <UserIcon className="h-12 w-12 text-white" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1.5 shadow-md">
                  <div className="w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
              </div>

              {/* User Details */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h2 className={`text-2xl font-bold text-gray-900 ${fontClass}`} style={fontStyle}>
                    {user?.first_name} {user?.last_name}
                  </h2>
                  <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold shadow-md ${getMembershipBadge(user?.membership_level?.toLowerCase() || 'bronze')} ${fontClass}`} style={fontStyle}>
                    {getMembershipName(user?.membership_level?.toLowerCase() || 'bronze')}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <p className={`${fontClass}`} style={fontStyle}>{user?.email}</p>
                  </div>
                  {user?.phone_number && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <p className={`${fontClass}`} style={fontStyle}>{user?.phone_number}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Loyalty Points Section */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 min-w-[180px]">
                <div className="flex items-center gap-2 mb-2">
                  <StarIcon className="h-6 w-6 text-yellow-500" />
                  <span className={`text-sm font-medium text-gray-600 ${fontClass}`} style={fontStyle}>
                    {language === 'fa' ? 'امتیاز وفاداری' : language === 'ar' ? 'نقاط الولاء' : 'Loyalty Points'}
                  </span>
                </div>
                <p className={`text-3xl font-bold text-gray-900 ${fontClass}`} style={fontStyle}>
                  {user?.loyalty_points?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions - Premium Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div 
            className="group bg-white rounded-2xl shadow-lg border border-gray-100 p-8 cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
            onClick={() => navigate('/flights/search')}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-16 h-16 rounded-xl flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300">
                <TicketIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className={`text-xl font-bold text-gray-900 mb-2 ${fontClass}`} style={fontStyle}>
                {language === 'fa' ? 'رزرو بلیط' : language === 'ar' ? 'حجز التذاكر' : 'Book Flight'}
              </h3>
              <p className={`text-gray-600 text-sm leading-relaxed ${fontClass}`} style={fontStyle}>
                {language === 'fa' ? 'جستجو و رزرو پرواز به مقاصد مختلف' : language === 'ar' ? 'البحث وحجز الرحلة إلى وجهات مختلفة' : 'Search and book flights to various destinations'}
              </p>
            </div>
          </div>

          <div 
            className="group bg-white rounded-2xl shadow-lg border border-gray-100 p-8 cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
            onClick={() => navigate('/payments')}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-50 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="bg-gradient-to-br from-green-500 to-green-600 w-16 h-16 rounded-xl flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300">
                <CreditCardIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className={`text-xl font-bold text-gray-900 mb-2 ${fontClass}`} style={fontStyle}>
                {language === 'fa' ? 'پرداخت‌ها' : language === 'ar' ? 'المدفوعات' : 'Payments'}
              </h3>
              <p className={`text-gray-600 text-sm leading-relaxed ${fontClass}`} style={fontStyle}>
                {language === 'fa' ? 'مشاهده تاریخچه پرداخت‌ها و تراکنش‌ها' : language === 'ar' ? 'عرض سجل المدفوعات والمعاملات' : 'View payment history and transactions'}
              </p>
            </div>
          </div>

          <div 
            className="group bg-white rounded-2xl shadow-lg border border-gray-100 p-8 cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
            onClick={() => navigate('/notifications')}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-50 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 w-16 h-16 rounded-xl flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300">
                <BellIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className={`text-xl font-bold text-gray-900 mb-2 ${fontClass}`} style={fontStyle}>
                {language === 'fa' ? 'اعلان‌ها' : language === 'ar' ? 'الإشعارات' : 'Notifications'}
              </h3>
              <p className={`text-gray-600 text-sm leading-relaxed ${fontClass}`} style={fontStyle}>
                {language === 'fa' ? 'پیام‌ها و اطلاع‌رسانی‌های مهم' : language === 'ar' ? 'الرسائل والإشعارات المهمة' : 'Important messages and notifications'}
              </p>
            </div>
          </div>
        </div>

        {/* Recent Bookings - Premium Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-indigo-50 to-transparent rounded-full blur-3xl opacity-30"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-2xl font-bold text-gray-900 ${fontClass}`} style={fontStyle}>
                {language === 'fa' ? 'رزروهای اخیر' : language === 'ar' ? 'الحجوزات الأخيرة' : 'Recent Bookings'}
              </h2>
            </div>
            
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <TicketIcon className="h-12 w-12 text-gray-400" />
              </div>
              <p className={`text-gray-500 text-lg mb-2 ${fontClass}`} style={fontStyle}>
                {language === 'fa' ? 'هنوز رزروی انجام نداده‌اید' : language === 'ar' ? 'لم تقم بأي حجز بعد' : 'No bookings yet'}
              </p>
              <p className={`text-gray-400 text-sm mb-8 ${fontClass}`} style={fontStyle}>
                {language === 'fa' ? 'شروع کنید و اولین سفر خود را رزرو کنید' : language === 'ar' ? 'ابدأ واحجز رحلتك الأولى' : 'Get started and book your first trip'}
              </p>
              <button 
                onClick={() => navigate('/flights/search')}
                className="bg-gradient-to-r from-blue-600 via-blue-600 to-blue-700 hover:from-blue-700 hover:via-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold"
                style={fontStyle}
              >
                {language === 'fa' ? 'جستجوی پرواز' : language === 'ar' ? 'البحث عن رحلة' : 'Search Flights'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
