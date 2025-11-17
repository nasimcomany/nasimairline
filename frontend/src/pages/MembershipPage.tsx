import React from 'react';
import GlassmorphismHeader from '../components/Layout/GlassmorphismHeader';
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
  WifiIcon
} from '@heroicons/react/24/outline';

const MembershipPage: React.FC = () => {
  const membershipTiers = [
    {
      id: 1,
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
      benefits: ['رایگان', 'شروع آسان', 'مزایای پایه']
    },
    {
      id: 2,
      name: 'عضو نقره‌ای',
      description: 'مزایای ویژه برای مسافران منظم',
      icon: GiftIcon,
      gradient: 'from-gray-500 to-gray-700',
      price: '۱۰۰۰ امتیاز',
      points: '1000 امتیاز',
      features: [
        'همه مزایای برنزی',
        'تخفیف ۱۰٪',
        'اولویت رزرو',
        'بار اضافی رایگان',
        'لانژ دسترسی'
      ],
      benefits: ['مزایای ویژه', 'تخفیف بیشتر', 'اولویت']
    },
    {
      id: 3,
      name: 'عضو طلایی',
      description: 'مزایای ممتاز برای مسافران VIP',
      icon: TrophyIcon,
      gradient: 'from-yellow-500 to-yellow-700',
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
      benefits: ['VIP', 'مزایای کامل', 'خدمات شخصی']
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

  return (
    <div className="min-h-screen relative overflow-hidden">
      <GlassmorphismHeader />

      {/* Background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/images/airport-crew.jpg)'
        }}
      >
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/30"></div>
        
        {/* Runway lights effect */}
        <div className="absolute bottom-0 left-0 right-0 h-32">
          <div className="flex justify-between px-8">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="w-1 h-20 bg-yellow-400/60 blur-sm"></div>
            ))}
          </div>
        </div>
        
        {/* Misty atmosphere */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 pt-32 pb-16">
        <div className="max-w-6xl mx-auto px-6">
          
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-1 persian-font-vazir">
              برنامه عضویت
            </h1>
            <p className="text-blue-200 text-xs persian-font-vazir">
              مزایای عضویت در باشگاه نسیم ایر
            </p>
          </div>

          {/* Membership Tiers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {membershipTiers.map((tier) => (
              <div key={tier.id} className={`group bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden border border-white/20 shadow-xl hover:bg-white/20 transition-all duration-300 hover:scale-105 ${tier.id === 2 ? 'ring-2 ring-blue-400' : ''}`}>
                {/* Header */}
                <div className={`h-20 bg-gradient-to-r ${tier.gradient} flex items-center justify-center relative`}>
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                    <tier.icon className="h-8 w-8 text-white" />
                  </div>
                  {tier.id === 2 && (
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full persian-font-vazir">
                      محبوب
                    </div>
                  )}
                </div>
                
                {/* Content */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-1 persian-font-vazir">
                    {tier.name}
                  </h3>
                  
                  <p className="text-white/70 text-sm mb-3 persian-font-vazir">
                    {tier.description}
                  </p>
                  
                  {/* Price */}
                  <div className="text-center mb-4">
                    <div className="text-white font-bold text-xl persian-font-vazir">
                      {tier.price}
                    </div>
                    <div className="text-white/60 text-xs persian-font-vazir">
                      {tier.points}
                    </div>
                  </div>
                  
                  {/* Features */}
                  <div className="space-y-2 mb-4">
                    {tier.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircleIcon className="h-4 w-4 text-green-400 flex-shrink-0" />
                        <span className="text-white/70 text-xs persian-font-vazir">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Benefits */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {tier.benefits.map((benefit, idx) => (
                      <span key={idx} className="bg-white/20 backdrop-blur-sm rounded-full px-2 py-1 text-white text-xs persian-font-vazir">
                        {benefit}
                      </span>
                    ))}
                  </div>
                  
                  <button className={`w-full font-medium py-2 px-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl persian-font-vazir text-xs ${
                    tier.id === 1 
                      ? 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white' 
                      : tier.id === 2
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
                      : 'bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white'
                  }`}>
                    {tier.id === 1 ? 'عضویت رایگان' : 'ارتقاء عضویت'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Benefits Section */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-white mb-2 persian-font-vazir">
              مزایای عضویت
            </h2>
            <p className="text-blue-200 text-sm persian-font-vazir">
              چرا باید عضو باشگاه نسیم ایر شوید؟
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 shadow-xl hover:bg-white/20 transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                    <benefit.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-white font-semibold persian-font-vazir">
                    {benefit.title}
                  </h3>
                </div>
                <p className="text-white/70 text-sm persian-font-vazir">
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
