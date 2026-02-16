import React from 'react';
import GlassmorphismHeader from '../components/Layout/GlassmorphismHeader';
import { 
  PaperAirplaneIcon, 
  BuildingOfficeIcon, 
  GiftIcon,
  ShieldCheckIcon,
  ClockIcon,
  UserGroupIcon,
  HeartIcon,
  StarIcon,
  GlobeAltIcon,
  CurrencyDollarIcon,
  TruckIcon,
  WifiIcon
} from '@heroicons/react/24/outline';

const ServicesPage: React.FC = () => {
  const services = [
    {
      id: 1,
      title: 'پروازهای داخلی',
      description: 'پرواز به تمام شهرهای ایران با بهترین قیمت و کیفیت',
      icon: PaperAirplaneIcon,
      gradient: 'from-blue-500 to-blue-700',
      features: ['پرواز روزانه', 'قیمت مناسب', 'امنیت بالا']
    },
    {
      id: 2,
      title: 'پروازهای خارجی',
      description: 'پرواز به مقاصد بین‌المللی محبوب در سراسر جهان',
      icon: GlobeAltIcon,
      gradient: 'from-green-500 to-green-700',
      features: ['مقاصد متنوع', 'پرواز مستقیم', 'خدمات بین‌المللی']
    },
    {
      id: 3,
      title: 'خدمات VIP',
      description: 'خدمات ویژه و لوکس برای مسافران ممتاز',
      icon: StarIcon,
      gradient: 'from-purple-500 to-purple-700',
      features: ['لانژ اختصاصی', 'خدمات شخصی', 'راحتی بیشتر']
    },
    {
      id: 4,
      title: 'رزرو هتل',
      description: 'رزرو هتل در تمام مقاصد با بهترین قیمت',
      icon: BuildingOfficeIcon,
      gradient: 'from-orange-500 to-orange-700',
      features: ['هتل‌های لوکس', 'قیمت رقابتی', 'رزرو آسان']
    },
    {
      id: 5,
      title: 'پکیج‌های سفر',
      description: 'پکیج‌های کامل سفر با تخفیف‌های ویژه',
      icon: GiftIcon,
      gradient: 'from-pink-500 to-pink-700',
      features: ['تخفیف ویژه', 'پکیج کامل', 'صرفه‌جویی']
    },
    {
      id: 6,
      title: 'بیمه مسافرتی',
      description: 'بیمه کامل برای امنیت سفر شما',
      icon: ShieldCheckIcon,
      gradient: 'from-red-500 to-red-700',
      features: ['پوشش کامل', 'پرداخت سریع', 'پشتیبانی 24/7']
    },
    {
      id: 7,
      title: 'بار اضافی',
      description: 'خدمات بار اضافی با قیمت مناسب',
      icon: TruckIcon,
      gradient: 'from-indigo-500 to-indigo-700',
      features: ['ظرفیت بیشتر', 'قیمت مناسب', 'امنیت بار']
    },
    {
      id: 8,
      title: 'اینترنت رایگان',
      description: 'دسترسی به اینترنت رایگان در تمام پروازها',
      icon: WifiIcon,
      gradient: 'from-teal-500 to-teal-700',
      features: ['سرعت بالا', 'رایگان', 'بدون محدودیت']
    },
    {
      id: 9,
      title: 'پشتیبانی 24/7',
      description: 'پشتیبانی آنلاین در تمام ساعات شبانه‌روز',
      icon: ClockIcon,
      gradient: 'from-yellow-500 to-yellow-700',
      features: ['همیشه در دسترس', 'پاسخ سریع', 'حل مشکل']
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
              خدمات ما
            </h1>
            <p className="text-blue-200 text-xs persian-font-vazir">
              خدمات متنوع و باکیفیت هواپیمایی نسیم
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => (
              <div key={service.id} className="group bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden border border-white/20 shadow-xl hover:bg-white/20 transition-all duration-300 hover:scale-105">
                {/* Icon Header */}
                <div className={`h-20 bg-gradient-to-r ${service.gradient} flex items-center justify-center`}>
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                    <service.icon className="h-8 w-8 text-white" />
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-2 persian-font-vazir">
                    {service.title}
                  </h3>
                  
                  <p className="text-white/70 text-sm mb-3 persian-font-vazir">
                    {service.description}
                  </p>
                  
                  {/* Features */}
                  <div className="space-y-1 mb-3">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                        <span className="text-white/60 text-xs persian-font-vazir">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-2 px-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl persian-font-vazir text-xs">
                    اطلاعات بیشتر
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
