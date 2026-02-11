import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import EmiratesHeader from '../components/Layout/EmiratesHeader';
import AuthModal from '../components/Auth/AuthModal';
import customerService, { MembershipStatus } from '../services/customerService';
import { 
  StarIcon, 
  GiftIcon,
  TrophyIcon,
  CheckCircleIcon,
  SparklesIcon,
  HeartIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ShieldCheckIcon,
  TruckIcon,
  WifiIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  FireIcon,
  CalendarIcon,
  TicketIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';

interface RootState {
  auth: {
    user: {
      id: number;
      email: string;
      membership_level: string;
      loyalty_points: number;
    } | null;
    isAuthenticated: boolean;
  };
}

const MembershipPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [membershipStatus, setMembershipStatus] = useState<MembershipStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    const fetchMembershipStatus = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await customerService.getMembershipStatus();
        setMembershipStatus(data);
      } catch (err: any) {
        console.error('Error fetching membership status:', err);
        setError(err.response?.data?.error || 'خطا در دریافت اطلاعات عضویت');
      } finally {
        setLoading(false);
      }
    };

    fetchMembershipStatus();
  }, [isAuthenticated]);

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'BRONZE':
        return StarIcon;
      case 'SILVER':
        return GiftIcon;
      case 'GOLD':
        return TrophyIcon;
      case 'PLATINUM':
        return SparklesIcon;
      default:
        return StarIcon;
    }
  };

  const getTierGradient = (tier: string) => {
    switch (tier) {
      case 'BRONZE':
        return 'from-amber-600 to-amber-700';
      case 'SILVER':
        return 'from-gray-400 to-gray-500';
      case 'GOLD':
        return 'from-yellow-500 to-yellow-600';
      case 'PLATINUM':
        return 'from-purple-600 to-indigo-600';
      default:
        return 'from-blue-500 to-blue-600';
    }
  };

  const getTierDescription = (tier: string) => {
    switch (tier) {
      case 'BRONZE':
        return 'شروع سفر با نسیم ایر';
      case 'SILVER':
        return 'مسافر منظم';
      case 'GOLD':
        return 'مسافر VIP';
      case 'PLATINUM':
        return 'مسافر ممتاز';
      default:
        return '';
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fa-IR').format(num);
  };

  const getProgressLabel = (key: string) => {
    switch (key) {
      case 'total_bookings':
        return 'تعداد کل رزرو';
      case 'monthly_bookings':
        return 'رزرو در ماه';
      case 'weekly_bookings':
        return 'رزرو در هفته';
      case 'membership_days':
        return 'روزهای عضویت';
      case 'active_months':
        return 'ماه‌های فعال';
      case 'completed_flights':
        return 'پروازهای انجام شده';
      default:
        return key;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600">
        <EmiratesHeader />
        <section className="relative z-10 min-h-[70vh] flex items-center justify-center px-4 py-12">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-white rounded-2xl p-6 shadow-2xl">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-4 mb-4">
                <UserGroupIcon className="h-12 w-12 text-white mx-auto" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2" style={{
                fontFamily: 'DigiHamisheBold, Arial, sans-serif'
              }}>
                باشگاه مشتریان نسیم ایر
              </h2>
              <p className="text-gray-600 mb-4 text-sm" style={{
                fontFamily: 'DigiHamisheBold, Arial, sans-serif'
              }}>
                برای مشاهده وضعیت عضویت وارد شوید
              </p>
              <button
                onClick={() => {
                  setAuthModalMode('login');
                  setIsAuthModalOpen(true);
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-all text-sm"
                style={{
                  fontFamily: 'DigiHamisheBold, Arial, sans-serif'
                }}
              >
                ورود به حساب کاربری
              </button>
            </div>
          </div>
        </section>

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          initialMode={authModalMode}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600">
        <EmiratesHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-lg" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
              در حال بارگذاری...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !membershipStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600">
        <EmiratesHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="bg-white rounded-xl p-6 max-w-md mx-4">
            <p className="text-red-600 text-center" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
              {error || 'خطا در دریافت اطلاعات'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const TierIcon = getTierIcon(membershipStatus.current_tier);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600">
      <EmiratesHeader />

      {/* Hero Section with Current Tier */}
      <section className="relative z-10 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Current Tier Banner */}
          <div className={`bg-gradient-to-r ${getTierGradient(membershipStatus.current_tier)} rounded-2xl p-8 mb-6 shadow-2xl`}>
            <div className="flex flex-col items-center justify-center text-center">
              <div className="bg-white/20 backdrop-blur-md rounded-full p-4 mb-4">
                <TierIcon className="h-16 w-16 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2" style={{
                fontFamily: 'DigiHamisheBold, Arial, sans-serif',
              }}>
                عضو {membershipStatus.current_tier_display}
              </h2>
              <p className="text-white/90 text-base mb-4">
                {getTierDescription(membershipStatus.current_tier)}
              </p>
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <CalendarIcon className="h-5 w-5" />
                <span style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                  عضویت از {formatNumber(membershipStatus.membership_duration_days)} روز پیش
                </span>
              </div>
            </div>
          </div>

          {/* Activity Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-5 shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-blue-100 rounded-lg p-2">
                  <TicketIcon className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-gray-700 text-sm" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                  کل رزروها
                </span>
              </div>
              <div className="text-gray-900 font-bold text-2xl" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                {formatNumber(membershipStatus.total_bookings)}
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-5 shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-green-100 rounded-lg p-2">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-gray-700 text-sm" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                  پروازهای انجام شده
                </span>
              </div>
              <div className="text-gray-900 font-bold text-2xl" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                {formatNumber(membershipStatus.total_completed_flights)}
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-5 shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-purple-100 rounded-lg p-2">
                  <CalendarIcon className="h-6 w-6 text-purple-600" />
                </div>
                <span className="text-gray-700 text-sm" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                  رزرو این ماه
                </span>
              </div>
              <div className="text-gray-900 font-bold text-2xl" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                {formatNumber(membershipStatus.bookings_last_30_days)}
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-5 shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-orange-100 rounded-lg p-2">
                  <FireIcon className="h-6 w-6 text-orange-600" />
                </div>
                <span className="text-gray-700 text-sm" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                  ماه‌های فعال
                </span>
              </div>
              <div className="text-gray-900 font-bold text-2xl" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                {formatNumber(membershipStatus.active_months_count)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Next Tier Progress */}
      {membershipStatus.next_tier && membershipStatus.progress_to_next_tier && (
        <section className="relative z-10 px-4 pb-6">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-3">
                  <ArrowTrendingUpIcon className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                    پیشرفت به سطح {membershipStatus.next_tier_display}
                  </h3>
                  <p className="text-gray-600 text-sm" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                    شما در مسیر ارتقا به سطح بعدی هستید
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                {Object.entries(membershipStatus.progress_to_next_tier).map(([key, value]) => {
                  const progress = value as { current: number; required: number; percentage: number };
                  const isComplete = progress.percentage >= 100;
                  
                  return (
                    <div key={key} className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 border-2 border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {isComplete ? (
                            <CheckCircleIconSolid className="h-6 w-6 text-green-500" />
                          ) : (
                            <div className="h-6 w-6 rounded-full border-2 border-gray-300"></div>
                          )}
                          <span className="text-gray-900 font-bold text-base" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                            {getProgressLabel(key)}
                          </span>
                        </div>
                        <div className="text-left">
                          <span className="text-blue-600 font-bold text-lg" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                            {formatNumber(progress.current)}
                          </span>
                          <span className="text-gray-400 mx-1">/</span>
                          <span className="text-gray-700 font-semibold" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                            {formatNumber(progress.required)}
                          </span>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-3 rounded-full transition-all duration-700 ${
                            isComplete 
                              ? 'bg-gradient-to-r from-green-400 to-green-500' 
                              : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                          }`}
                          style={{
                            width: `${Math.min(progress.percentage, 100)}%`
                          }}
                        ></div>
                      </div>
                      
                      <div className="mt-2 text-left">
                        <span className={`text-sm font-semibold ${isComplete ? 'text-green-600' : 'text-blue-600'}`} style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                          {progress.percentage}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Benefits Section */}
      <section className="relative z-10 px-4 pb-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <h2 
              className="text-gray-900 mb-6 text-center font-bold text-2xl"
              style={{
                fontFamily: 'DigiHamisheBold, Arial, sans-serif',
              }}
            >
              مزایای عضویت در باشگاه مشتریان
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { icon: CurrencyDollarIcon, title: 'تخفیف‌های ویژه', desc: 'تخفیف انحصاری اعضا' },
                { icon: ClockIcon, title: 'اولویت رزرو', desc: 'رزرو سریع‌تر' },
                { icon: ShieldCheckIcon, title: 'بیمه رایگان', desc: 'پوشش کامل' },
                { icon: TruckIcon, title: 'بار اضافی', desc: 'بار رایگان بیشتر' },
                { icon: WifiIcon, title: 'اینترنت', desc: 'WiFi رایگان' },
                { icon: HeartIcon, title: 'خدمات VIP', desc: 'پشتیبانی اختصاصی' }
              ].map((benefit, index) => (
                <div key={index} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-blue-100 hover:shadow-lg transition-all">
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full p-3">
                      <benefit.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-gray-900 font-bold text-sm mb-1" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                        {benefit.title}
                      </h3>
                      <p className="text-gray-600 text-xs" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                        {benefit.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MembershipPage;
