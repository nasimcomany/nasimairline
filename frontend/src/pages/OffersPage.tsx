import React from 'react';
import GlassmorphismHeader from '../components/Layout/GlassmorphismHeader';
import { 
  GiftIcon, 
  UserGroupIcon, 
  CalendarDaysIcon,
  StarIcon,
  FireIcon,
  SparklesIcon,
  HeartIcon,
  ClockIcon,
  CurrencyDollarIcon,
  TagIcon
} from '@heroicons/react/24/outline';

const OffersPage: React.FC = () => {
  const offers = [
    {
      id: 1,
      title: 'تخفیف ۵۰٪',
      description: 'برای سفرهای داخلی با بهترین قیمت',
      icon: FireIcon,
      gradient: 'from-red-500 to-red-700',
      discount: '50%',
      originalPrice: '$200',
      newPrice: '$100',
      validUntil: 'تا پایان ماه',
      features: ['پرواز داخلی', 'قیمت مناسب', 'تخفیف ویژه']
    },
    {
      id: 2,
      title: 'پکیج خانوادگی',
      description: 'سفر برای ۴ نفر با صرفه‌جویی فوق‌العاده',
      icon: UserGroupIcon,
      gradient: 'from-pink-500 to-pink-700',
      discount: '30%',
      originalPrice: '$800',
      newPrice: '$560',
      validUntil: 'تا ۱۵ روز',
      features: ['۴ نفر', 'صرفه‌جویی', 'پکیج کامل']
    },
    {
      id: 3,
      title: 'پرواز زودهنگام',
      description: 'رزرو تا ۳ ماه قبل و دریافت تخفیف',
      icon: CalendarDaysIcon,
      gradient: 'from-blue-500 to-blue-700',
      discount: '25%',
      originalPrice: '$400',
      newPrice: '$300',
      validUntil: 'تا ۳ ماه',
      features: ['رزرو زودهنگام', 'تخفیف ویژه', 'برنامه‌ریزی']
    },
    {
      id: 4,
      title: 'پیشنهاد آخر هفته',
      description: 'سفرهای آخر هفته با قیمت ویژه',
      icon: SparklesIcon,
      gradient: 'from-purple-500 to-purple-700',
      discount: '40%',
      originalPrice: '$300',
      newPrice: '$180',
      validUntil: 'فقط آخر هفته',
      features: ['آخر هفته', 'قیمت ویژه', 'سریع']
    },
    {
      id: 5,
      title: 'پیشنهاد دانشجویی',
      description: 'تخفیف ویژه برای دانشجویان',
      icon: StarIcon,
      gradient: 'from-green-500 to-green-700',
      discount: '35%',
      originalPrice: '$250',
      newPrice: '$162',
      validUntil: 'همیشه',
      features: ['دانشجویی', 'تخفیف دائمی', 'کارت دانشجویی']
    },
    {
      id: 6,
      title: 'پیشنهاد عاشقانه',
      description: 'سفرهای دونفره با تخفیف ویژه',
      icon: HeartIcon,
      gradient: 'from-rose-500 to-rose-700',
      discount: '20%',
      originalPrice: '$500',
      newPrice: '$400',
      validUntil: 'تا ۱۰ روز',
      features: ['دونفره', 'رمانتیک', 'تخفیف ویژه']
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
              پیشنهادات ویژه
            </h1>
            <p className="text-blue-200 text-xs persian-font-vazir">
              تخفیف‌ها و پیشنهادات جذاب نسیم ایر
            </p>
          </div>

          {/* Offers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {offers.map((offer) => (
              <div key={offer.id} className="group bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden border border-white/20 shadow-xl hover:bg-white/20 transition-all duration-300 hover:scale-105">
                {/* Discount Badge */}
                <div className="absolute top-2 right-2 z-10">
                  <div className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-2 py-1 rounded-full persian-font-vazir">
                    {offer.discount} تخفیف
                  </div>
                </div>

                {/* Icon Header */}
                <div className={`h-20 bg-gradient-to-r ${offer.gradient} flex items-center justify-center relative`}>
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                    <offer.icon className="h-8 w-8 text-white" />
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-2 persian-font-vazir">
                    {offer.title}
                  </h3>
                  
                  <p className="text-white/70 text-sm mb-3 persian-font-vazir">
                    {offer.description}
                  </p>
                  
                  {/* Price */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-white/50 text-sm line-through persian-font-vazir">
                      {offer.originalPrice}
                    </span>
                    <span className="text-white font-bold text-lg persian-font-vazir">
                      {offer.newPrice}
                    </span>
                  </div>
                  
                  {/* Features */}
                  <div className="space-y-1 mb-3">
                    {offer.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                        <span className="text-white/60 text-xs persian-font-vazir">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Valid Until */}
                  <div className="flex items-center gap-1 mb-3">
                    <ClockIcon className="h-3 w-3 text-yellow-400" />
                    <span className="text-yellow-400 text-xs persian-font-vazir">
                      {offer.validUntil}
                    </span>
                  </div>
                  
                  <button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium py-2 px-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl persian-font-vazir text-xs">
                    استفاده از پیشنهاد
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

export default OffersPage;
