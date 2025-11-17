import React from 'react';
import GlassmorphismHeader from '../components/Layout/GlassmorphismHeader';
import { 
  NewspaperIcon, 
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  TagIcon,
  ArrowRightIcon,
  SparklesIcon,
  GiftIcon,
  StarIcon,
  GlobeAltIcon,
  FireIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

const NewsPage: React.FC = () => {
  const newsItems = [
    {
      id: 1,
      title: 'افتتاح مسیر جدید',
      description: 'راه‌اندازی پروازهای جدید به شهرهای مختلف با بهترین قیمت و کیفیت',
      content: 'نسیم ایر با افتخار اعلام می‌کند که مسیرهای جدیدی به شهرهای محبوب اضافه شده است.',
      author: 'تیم تحریریه',
      date: '۲ روز پیش',
      category: 'مسیرهای جدید',
      icon: GlobeAltIcon,
      gradient: 'from-blue-500 to-blue-700',
      image: '/images/airport-plane-photo_991869-62.jpg',
      readTime: '۳ دقیقه'
    },
    {
      id: 2,
      title: 'خدمات جدید',
      description: 'ارائه خدمات ویژه و لوکس به مسافران با بالاترین استانداردها',
      content: 'خدمات جدیدی برای راحتی بیشتر مسافران راه‌اندازی شده است.',
      author: 'مدیریت خدمات',
      date: '۱ هفته پیش',
      category: 'خدمات',
      icon: SparklesIcon,
      gradient: 'from-green-500 to-green-700',
      image: '/images/airplane-clouds-night_864588-19786.jpg',
      readTime: '۴ دقیقه'
    },
    {
      id: 3,
      title: 'تخفیف‌های ویژه',
      description: 'فرصت‌های طلایی برای سفر با تخفیف‌های فوق‌العاده',
      content: 'تخفیف‌های ویژه برای تمام مسیرها در دسترس است.',
      author: 'تیم بازاریابی',
      date: '۲ هفته پیش',
      category: 'تخفیف',
      icon: GiftIcon,
      gradient: 'from-purple-500 to-purple-700',
      image: '/images/skyward-soar-airplane-flying-blue-sky-clouds_391229-21566.jpg',
      readTime: '۲ دقیقه'
    },
    {
      id: 4,
      title: 'ناوگان جدید',
      description: 'اضافه شدن هواپیماهای مدرن و پیشرفته به ناوگان',
      content: 'هواپیماهای جدید با تکنولوژی پیشرفته به ناوگان اضافه شدند.',
      author: 'تیم فنی',
      date: '۳ هفته پیش',
      category: 'ناوگان',
      icon: StarIcon,
      gradient: 'from-orange-500 to-orange-700',
      image: '/images/sheremetyevo-airport-view-in-rainy-evening-moscow-free-video.jpg',
      readTime: '۵ دقیقه'
    },
    {
      id: 5,
      title: 'پروازهای بین‌المللی',
      description: 'راه‌اندازی پروازهای جدید به مقاصد بین‌المللی',
      content: 'مسیرهای جدید به شهرهای محبوب اروپا و آسیا اضافه شد.',
      author: 'تیم بین‌الملل',
      date: '۱ ماه پیش',
      category: 'بین‌الملل',
      icon: GlobeAltIcon,
      gradient: 'from-indigo-500 to-indigo-700',
      image: '/images/360_F_600352190_78zb8hHbSeQdHtfGQliVRtHXEEXcvtHf.jpg',
      readTime: '۶ دقیقه'
    },
    {
      id: 6,
      title: 'برنامه وفاداری',
      description: 'برنامه جدید وفاداری با مزایای ویژه برای مسافران',
      content: 'برنامه وفاداری جدید با امتیازات و مزایای ویژه راه‌اندازی شد.',
      author: 'تیم وفاداری',
      date: '۱ ماه پیش',
      category: 'وفاداری',
      icon: HeartIcon,
      gradient: 'from-pink-500 to-pink-700',
      image: '/images/1697200583302.jpg',
      readTime: '۳ دقیقه'
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
              اخبار هواپیمایی
            </h1>
            <p className="text-blue-200 text-xs persian-font-vazir">
              آخرین اخبار و رویدادهای نسیم ایر
            </p>
          </div>

          {/* News Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {newsItems.map((news) => (
              <div key={news.id} className="group bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden border border-white/20 shadow-xl hover:bg-white/20 transition-all duration-300 hover:scale-105">
                {/* Image */}
                <div className="relative h-32 overflow-hidden">
                  <img 
                    src={news.image} 
                    alt={news.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-300"></div>
                  
                  {/* Category Badge */}
                  <div className="absolute top-2 right-2">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1">
                      <span className="text-white text-xs font-medium persian-font-vazir">{news.category}</span>
                    </div>
                  </div>
                  
                  {/* Icon */}
                  <div className="absolute bottom-2 right-2">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-1.5">
                      <news.icon className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-2 persian-font-vazir">
                    {news.title}
                  </h3>
                  
                  <p className="text-white/70 text-sm mb-3 persian-font-vazir">
                    {news.description}
                  </p>
                  
                  {/* Meta Info */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-3 w-3 text-white/60" />
                      <span className="text-white/60 text-xs persian-font-vazir">{news.author}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ClockIcon className="h-3 w-3 text-white/60" />
                      <span className="text-white/60 text-xs persian-font-vazir">{news.readTime}</span>
                    </div>
                  </div>
                  
                  {/* Date */}
                  <div className="flex items-center gap-1 mb-3">
                    <CalendarDaysIcon className="h-3 w-3 text-yellow-400" />
                    <span className="text-yellow-400 text-xs persian-font-vazir">
                      {news.date}
                    </span>
                  </div>
                  
                  <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-2 px-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl persian-font-vazir text-xs flex items-center justify-center gap-1">
                    مطالعه بیشتر
                    <ArrowRightIcon className="h-3 w-3" />
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

export default NewsPage;
