import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import EmiratesHeader from '../components/Layout/EmiratesHeader';
import AuthModal from '../components/Auth/AuthModal';
import customerService, { CustomerTierInfo } from '../services/customerService';
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
  XCircleIcon
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
  const [tierInfo, setTierInfo] = useState<CustomerTierInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [currentBackgroundIndex, setCurrentBackgroundIndex] = useState(0);

  const backgroundImages = [
    '/images/tstnasim.jpg',
    '/images/tstnasim2.jpg',
    '/images/tstnasim3.jpg',
    '/images/tstnasim4.jpg',
    '/images/tstnasim5.jpg'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBackgroundIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchTierInfo = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await customerService.getMyTier();
        setTierInfo(data);
      } catch (err: any) {
        console.error('Error fetching tier info:', err);
        setError(err.response?.data?.error || 'خطا در دریافت اطلاعات');
      } finally {
        setLoading(false);
      }
    };

    fetchTierInfo();
  }, [isAuthenticated]);

  const membershipTiers = [
    {
      id: 'BRONZE',
      name: 'برنزی',
      description: 'شروع سفر',
      icon: StarIcon,
      gradient: 'from-blue-400 to-blue-500',
      color: 'blue',
      price: 'رایگان',
      points: '0',
      features: [
        'رزرو آنلاین',
        'اطلاع‌رسانی',
        'تخفیف ۵٪'
      ],
      isCurrent: tierInfo?.current_tier === 'BRONZE'
    },
    {
      id: 'SILVER',
      name: 'نقره‌ای',
      description: 'مسافر منظم',
      icon: GiftIcon,
      gradient: 'from-blue-500 to-blue-600',
      color: 'blue',
      price: '۱۰۰۰',
      points: '1000',
      features: [
        'تخفیف ۱۰٪',
        'اولویت رزرو',
        'بار اضافی'
      ],
      isCurrent: tierInfo?.current_tier === 'SILVER'
    },
    {
      id: 'GOLD',
      name: 'طلایی',
      description: 'VIP',
      icon: TrophyIcon,
      gradient: 'from-blue-600 to-indigo-600',
      color: 'indigo',
      price: '۵۰۰۰',
      points: '5000',
      features: [
        'تخفیف ۲۰٪',
        'لانژ VIP',
        'خدمات شخصی'
      ],
      isCurrent: tierInfo?.current_tier === 'GOLD'
    }
  ];

  const benefits = [
    {
      icon: CurrencyDollarIcon,
      title: 'تخفیف‌های ویژه',
      description: 'تخفیف‌های انحصاری برای اعضا'
    },
    {
      icon: ClockIcon,
      title: 'اولویت رزرو',
      description: 'رزرو زودهنگام و اولویت در پروازها'
    },
    {
      icon: ShieldCheckIcon,
      title: 'بیمه رایگان',
      description: 'بیمه مسافرتی رایگان برای اعضا'
    },
    {
      icon: TruckIcon,
      title: 'بار اضافی',
      description: 'بار اضافی رایگان یا با تخفیف'
    },
    {
      icon: WifiIcon,
      title: 'اینترنت رایگان',
      description: 'دسترسی رایگان به اینترنت در پرواز'
    },
    {
      icon: HeartIcon,
      title: 'خدمات شخصی',
      description: 'خدمات اختصاصی و پشتیبانی VIP'
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fa-IR').format(amount) + ' تومان';
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fa-IR').format(num);
  };

  const getTierDisplayName = (tier: string) => {
    const tierMap: { [key: string]: string } = {
      'BRONZE': 'برنزی',
      'SILVER': 'نقره‌ای',
      'GOLD': 'طلایی'
    };
    return tierMap[tier] || tier;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600">
        <EmiratesHeader />
        {/* Hero Section */}
        <section className="relative z-10 min-h-[70vh] flex items-center justify-center px-4 py-12">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-white rounded-2xl p-6 shadow-2xl">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-4 mb-4">
                <UserGroupIcon className="h-12 w-12 text-white mx-auto" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2" style={{
                fontFamily: 'DigiHamisheBold, Arial, sans-serif'
              }}>
                وضعیت عضویت
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

        {/* Auth Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          initialMode={authModalMode}
        />
      </div>
    );
  }

  const currentTier = membershipTiers.find(t => t.id === tierInfo?.current_tier) || membershipTiers[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600">
      <EmiratesHeader />

      {/* Hero Section */}
      <section className="relative z-10 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Current Tier Banner - Compact and Prominent */}
          {!loading && tierInfo && (
            <div className={`bg-gradient-to-r ${currentTier.gradient} rounded-xl p-6 mb-6 shadow-xl`}>
              <div className="flex items-center justify-center gap-4 text-center">
                <div className="bg-white/20 backdrop-blur-md rounded-full p-3">
                  <currentTier.icon className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white" style={{
                    fontFamily: 'DigiHamisheBold, Arial, sans-serif',
                  }}>
                    عضو {getTierDisplayName(tierInfo.current_tier)}
                  </h2>
                  <p className="text-white/90 text-sm">
                    {currentTier.description}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Stats Cards - Compact */}
          {!loading && tierInfo && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              <div className="bg-white rounded-lg p-4 shadow-lg">
                <div className="flex items-center gap-2 mb-1">
                  <CurrencyDollarIcon className="h-5 w-5 text-blue-600" />
                  <span className="text-gray-700 text-xs" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>مبلغ خرید</span>
                </div>
                <div className="text-gray-900 font-bold text-lg" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                  {formatCurrency(tierInfo.metrics.total_purchase_amount)}
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-lg">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700 text-xs" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>رزروها</span>
                </div>
                <div className="text-gray-900 font-bold text-lg" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                  {formatNumber(tierInfo.metrics.total_bookings_count)}
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-lg">
                <div className="flex items-center gap-2 mb-1">
                  <StarIcon className="h-5 w-5 text-blue-600" />
                  <span className="text-gray-700 text-xs" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>امتیاز</span>
                </div>
                <div className="text-gray-900 font-bold text-lg" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                  {formatNumber(user?.loyalty_points || 0)}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Next Tier Progress - Minimal */}
      {!loading && tierInfo && tierInfo.next_tier && tierInfo.next_tier_requirements.length > 0 && (
        <section className="relative z-10 px-4 pb-6">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-xl p-4 shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <ArrowTrendingUpIcon className="h-5 w-5 text-blue-600" />
                <h3 className="text-base font-bold text-gray-900" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                  ارتقا به {tierInfo.next_tier_display}
                </h3>
              </div>
              
              <div className="space-y-2">
                {tierInfo.next_tier_requirements.map((req, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-900 text-xs font-medium" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>{req.criteria_type}</span>
                      <div className="flex items-center gap-1">
                        {req.met ? (
                          <CheckCircleIconSolid className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircleIcon className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                      <span className="text-gray-600">
                        {req.criteria_type.includes('مبلغ') 
                          ? formatCurrency(req.current_value)
                          : formatNumber(req.current_value)}
                      </span>
                      <span className="text-gray-400">/</span>
                      <span className="text-gray-900 font-semibold">
                        {req.criteria_type.includes('مبلغ') 
                          ? formatCurrency(req.required_value)
                          : formatNumber(req.required_value)}
                      </span>
                    </div>
                    
                    {/* Progress Bar - Minimal */}
                    <div className="mt-1.5 w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                          req.met ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{
                          width: `${Math.min((req.current_value / req.required_value) * 100, 100)}%`
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Membership Tiers Section - Minimal Cards */}
      <section className="relative z-10 px-4 pb-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {membershipTiers.map((tier) => (
              <div 
                key={tier.id} 
                className={`bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 ${
                  tier.isCurrent ? 'ring-2 ring-blue-400' : ''
                }`}
              >
                {/* Header */}
                <div className={`bg-gradient-to-r ${tier.gradient} p-4 flex items-center justify-center relative`}>
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-2.5">
                    <tier.icon className="h-8 w-8 text-white" />
                  </div>
                  {tier.isCurrent && (
                    <div className="absolute top-2 right-2 bg-white text-blue-600 text-xs font-bold px-2 py-0.5 rounded-full shadow-lg" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                      فعلی
                    </div>
                  )}
                </div>
                
                {/* Content */}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-1 text-center" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                    {tier.name}
                  </h3>
                  
                  <p className="text-gray-600 text-xs mb-3 text-center" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                    {tier.description}
                  </p>
                  
                  {/* Price */}
                  <div className="text-center mb-3 pb-3 border-b border-gray-200">
                    <div className="text-gray-900 font-bold text-lg" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                      {tier.price}
                    </div>
                    <div className="text-gray-500 text-xs" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                      {tier.points} امتیاز
                    </div>
                  </div>
                  
                  {/* Features - Minimal */}
                  <div className="space-y-1.5 mb-3">
                    {tier.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <CheckCircleIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700 text-xs" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <button 
                    disabled={tier.isCurrent}
                    className={`w-full font-bold py-2 px-4 rounded-lg transition-all text-xs ${
                      tier.isCurrent
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md'
                    }`}
                    style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}
                  >
                    {tier.isCurrent ? 'عضویت فعلی' : 'ارتقاء'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section - Minimal */}
      <section className="relative z-10 px-4 pb-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-xl p-4 shadow-lg">
            <h2 
              className="text-gray-900 mb-3 text-center font-bold text-base"
              style={{
                fontFamily: 'DigiHamisheBold, Arial, sans-serif',
              }}
            >
              مزایای عضویت
            </h2>

            {/* Benefits Grid - Compact */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {benefits.map((benefit, index) => (
                <div key={index} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-100 hover:shadow-md transition-all">
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="bg-blue-100 rounded-full p-2">
                      <benefit.icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="text-gray-900 font-bold text-xs" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600 text-xs leading-tight" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                      {benefit.description}
                    </p>
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
