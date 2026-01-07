import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import EmiratesHeader from '../components/Layout/EmiratesHeader';
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
      name: 'عضو برنزی',
      description: 'مزایای پایه برای شروع سفر',
      icon: StarIcon,
      gradient: 'from-amber-500 to-amber-700',
      price: 'رایگان',
      points: '0 امتیاز',
      features: [
        'رزرو آنلاین',
        'اطلاع‌رسانی پرواز',
        'پشتیبانی پایه',
        'تخفیف ۵٪'
      ],
      benefits: ['رایگان', 'شروع آسان', 'مزایای پایه'],
      isCurrent: tierInfo?.current_tier === 'BRONZE'
    },
    {
      id: 'SILVER',
      name: 'عضو نقره‌ای',
      description: 'مزایای ویژه برای مسافران منظم',
      icon: GiftIcon,
      gradient: 'from-gray-400 to-gray-600',
      price: '۱۰۰۰ امتیاز',
      points: '1000 امتیاز',
      features: [
        'همه مزایای برنزی',
        'تخفیف ۱۰٪',
        'اولویت رزرو',
        'بار اضافی رایگان',
        'لانژ دسترسی'
      ],
      benefits: ['مزایای ویژه', 'تخفیف بیشتر', 'اولویت'],
      isCurrent: tierInfo?.current_tier === 'SILVER'
    },
    {
      id: 'GOLD',
      name: 'عضو طلایی',
      description: 'مزایای ممتاز برای مسافران VIP',
      icon: TrophyIcon,
      gradient: 'from-yellow-400 to-yellow-600',
      price: '۵۰۰۰ امتیاز',
      points: '5000 امتیاز',
      features: [
        'همه مزایای نقره‌ای',
        'تخفیف ۲۰٪',
        'لانژ اختصاصی',
        'خدمات شخصی',
        'ارتقاء رایگان',
        'اینترنت رایگان'
      ],
      benefits: ['VIP', 'مزایای کامل', 'خدمات شخصی'],
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white">
        <EmiratesHeader />
        <div className="pt-32 pb-16">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <div className="bg-gray-100 rounded-xl p-8 border border-gray-200 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 persian-font-vazir">لطفاً ابتدا وارد شوید</h2>
              <p className="text-gray-600 mb-6 persian-font-vazir">برای مشاهده وضعیت عضویت، ابتدا وارد حساب کاربری خود شوید</p>
              <button
                onClick={() => navigate('/login')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl persian-font-vazir"
              >
                ورود به حساب کاربری
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentTier = membershipTiers.find(t => t.id === tierInfo?.current_tier) || membershipTiers[0];

  return (
    <div className="min-h-screen bg-white">
      <EmiratesHeader />

      {/* Main content */}
      <div className="pt-8 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header with current tier badge */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 persian-font-vazir">
              برنامه عضویت نسیم ایر
            </h1>
            <p className="text-gray-600 text-sm mb-4 persian-font-vazir">
              مزایای عضویت در باشگاه نسیم ایر
            </p>
            
            {/* Current Tier Badge */}
            {loading ? (
              <div className="inline-block bg-gray-100 rounded-full px-6 py-3 border border-gray-200">
                <div className="animate-pulse text-gray-600 persian-font-vazir">در حال بارگذاری...</div>
              </div>
            ) : tierInfo && (
              <div className={`inline-block bg-gradient-to-r ${currentTier.gradient} rounded-full px-6 py-3 shadow-lg`}>
                <div className="flex items-center gap-2">
                  <currentTier.icon className="h-6 w-6 text-white" />
                  <span className="text-white font-bold persian-font-vazir">
                    شما عضو {currentTier.name} هستید
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Stats Cards */}
          {!loading && tierInfo && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <CurrencyDollarIcon className="h-6 w-6 text-yellow-500" />
                  <span className="text-gray-600 text-sm persian-font-vazir">مبلغ کل خرید</span>
                </div>
                <div className="text-gray-900 font-bold text-xl persian-font-vazir">
                  {formatCurrency(tierInfo.metrics.total_purchase_amount)}
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircleIcon className="h-6 w-6 text-green-500" />
                  <span className="text-gray-600 text-sm persian-font-vazir">تعداد رزروها</span>
                </div>
                <div className="text-gray-900 font-bold text-xl persian-font-vazir">
                  {formatNumber(tierInfo.metrics.total_bookings_count)}
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <StarIcon className="h-6 w-6 text-blue-500" />
                  <span className="text-gray-600 text-sm persian-font-vazir">امتیاز وفاداری</span>
                </div>
                <div className="text-gray-900 font-bold text-xl persian-font-vazir">
                  {formatNumber(user?.loyalty_points || 0)}
                </div>
              </div>
            </div>
          )}

          {/* Next Tier Progress */}
          {!loading && tierInfo && tierInfo.next_tier && tierInfo.next_tier_requirements.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <ArrowTrendingUpIcon className="h-6 w-6 text-yellow-500" />
                <h3 className="text-xl font-bold text-gray-900 persian-font-vazir">
                  شرایط ارتقا به {tierInfo.next_tier_display}
                </h3>
              </div>
              
              <div className="space-y-3">
                {tierInfo.next_tier_requirements.map((req, idx) => (
                  <div key={idx} className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-900 font-medium persian-font-vazir">{req.criteria_type}</span>
                      <div className="flex items-center gap-2">
                        {req.met ? (
                          <CheckCircleIconSolid className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircleIcon className="h-5 w-5 text-red-500" />
                        )}
                        <span className={`text-sm font-bold ${req.met ? 'text-green-600' : 'text-red-600'} persian-font-vazir`}>
                          {req.met ? '✓ محقق شده' : '✗ محقق نشده'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm persian-font-vazir">
                      <span className="text-gray-600">مقدار فعلی:</span>
                      <span className="text-gray-900 font-semibold">
                        {req.criteria_type.includes('مبلغ') 
                          ? formatCurrency(req.current_value)
                          : formatNumber(req.current_value)}
                      </span>
                      <span className="text-gray-400">|</span>
                      <span className="text-gray-600">مقدار مورد نیاز:</span>
                      <span className="text-gray-900 font-semibold">
                        {req.criteria_type.includes('مبلغ') 
                          ? formatCurrency(req.required_value)
                          : formatNumber(req.required_value)}
                      </span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          req.met ? 'bg-green-500' : 'bg-yellow-400'
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
          )}

          {/* Membership Tiers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {membershipTiers.map((tier) => (
              <div 
                key={tier.id} 
                className={`group bg-white rounded-xl overflow-hidden border-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ${
                  tier.isCurrent ? 'border-yellow-400 ring-2 ring-yellow-200' : 'border-gray-200'
                }`}
              >
                {/* Header */}
                <div className={`h-24 bg-gradient-to-r ${tier.gradient} flex items-center justify-center relative`}>
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                    <tier.icon className="h-10 w-10 text-white" />
                  </div>
                  {tier.isCurrent && (
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-xs font-bold px-3 py-1 rounded-full persian-font-vazir shadow-lg">
                      عضویت فعلی
                    </div>
                  )}
                  {tier.id === 'SILVER' && !tier.isCurrent && (
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full persian-font-vazir">
                      محبوب
                    </div>
                  )}
                </div>
                
                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 persian-font-vazir">
                    {tier.name}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 persian-font-vazir">
                    {tier.description}
                  </p>
                  
                  {/* Price */}
                  <div className="text-center mb-4 pb-4 border-b border-gray-200">
                    <div className="text-gray-900 font-bold text-2xl persian-font-vazir">
                      {tier.price}
                    </div>
                    <div className="text-gray-500 text-xs persian-font-vazir mt-1">
                      {tier.points}
                    </div>
                  </div>
                  
                  {/* Features */}
                  <div className="space-y-2 mb-4">
                    {tier.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700 text-sm persian-font-vazir">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Benefits */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {tier.benefits.map((benefit, idx) => (
                      <span key={idx} className="bg-gray-100 rounded-full px-3 py-1 text-gray-700 text-xs persian-font-vazir border border-gray-200">
                        {benefit}
                      </span>
                    ))}
                  </div>
                  
                  <button 
                    disabled={tier.isCurrent}
                    className={`w-full font-medium py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg persian-font-vazir ${
                      tier.isCurrent
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : tier.id === 'BRONZE' 
                        ? 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white' 
                        : tier.id === 'SILVER'
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
                        : 'bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white'
                    }`}
                  >
                    {tier.isCurrent ? 'عضویت فعلی' : tier.id === 'BRONZE' ? 'عضویت رایگان' : 'ارتقاء عضویت'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Benefits Section */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 persian-font-vazir">
              مزایای عضویت
            </h2>
            <p className="text-gray-600 text-sm persian-font-vazir">
              چرا باید عضو باشگاه نسیم ایر شوید؟
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:bg-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-blue-100 rounded-full p-3">
                    <benefit.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-gray-900 font-semibold persian-font-vazir">
                    {benefit.title}
                  </h3>
                </div>
                <p className="text-gray-600 text-sm persian-font-vazir">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipPage;
