import React, { useState } from 'react';
import GlassmorphismHeader from '../components/Layout/GlassmorphismHeader';
import { 
  PhoneIcon, 
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  UserGroupIcon,
  QuestionMarkCircleIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  MapPinIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

const SupportPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('general');

  const supportMethods = [
    {
      id: 1,
      title: 'تماس تلفنی',
      description: '۲۴ ساعته در خدمت شما',
      contact: '۰۲۱-۱۲۳۴۵۶۷۸',
      icon: PhoneIcon,
      gradient: 'from-blue-500 to-blue-700',
      availability: '۲۴/۷',
      responseTime: 'فوری'
    },
    {
      id: 2,
      title: 'ایمیل',
      description: 'پاسخ در کمتر از ۲ ساعت',
      contact: 'support@nasimair.com',
      icon: EnvelopeIcon,
      gradient: 'from-green-500 to-green-700',
      availability: '۲۴/۷',
      responseTime: 'کمتر از ۲ ساعت'
    },
    {
      id: 3,
      title: 'چت آنلاین',
      description: 'پشتیبانی فوری و آنلاین',
      contact: 'آنلاین',
      icon: ChatBubbleLeftRightIcon,
      gradient: 'from-purple-500 to-purple-700',
      availability: '۲۴/۷',
      responseTime: 'فوری'
    }
  ];

  const faqCategories = [
    { id: 'general', name: 'عمومی', icon: QuestionMarkCircleIcon },
    { id: 'booking', name: 'رزرو', icon: DocumentTextIcon },
    { id: 'flight', name: 'پرواز', icon: GlobeAltIcon },
    { id: 'payment', name: 'پرداخت', icon: CheckCircleIcon }
  ];

  const faqs = {
    general: [
      { question: 'چگونه می‌توانم بلیط خود را لغو کنم؟', answer: 'می‌توانید از طریق پنل کاربری یا تماس با پشتیبانی بلیط خود را لغو کنید.' },
      { question: 'آیا امکان تغییر تاریخ پرواز وجود دارد؟', answer: 'بله، با توجه به شرایط بلیط می‌توانید تاریخ پرواز را تغییر دهید.' }
    ],
    booking: [
      { question: 'چگونه بلیط رزرو کنم؟', answer: 'از طریق فرم جستجو در صفحه اصلی می‌توانید بلیط مورد نظر خود را رزرو کنید.' },
      { question: 'آیا امکان رزرو گروهی وجود دارد؟', answer: 'بله، برای رزرو گروهی با پشتیبانی تماس بگیرید.' }
    ],
    flight: [
      { question: 'چه مدارکی برای پرواز نیاز دارم؟', answer: 'کارت ملی یا پاسپورت معتبر برای پروازهای داخلی و بین‌المللی.' },
      { question: 'آیا امکان انتخاب صندلی وجود دارد؟', answer: 'بله، در زمان رزرو می‌توانید صندلی مورد نظر خود را انتخاب کنید.' }
    ],
    payment: [
      { question: 'چه روش‌های پرداختی پشتیبانی می‌شود؟', answer: 'کارت‌های بانکی، پرداخت آنلاین و پرداخت در فرودگاه.' },
      { question: 'آیا پرداخت امن است؟', answer: 'بله، تمام پرداخت‌ها با بالاترین استانداردهای امنیتی انجام می‌شود.' }
    ]
  };

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
              پشتیبانی مشتریان
            </h1>
            <p className="text-blue-200 text-xs persian-font-vazir">
              راه‌های ارتباط با تیم پشتیبانی نسیم ایر
            </p>
          </div>

          {/* Support Methods */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {supportMethods.map((method) => (
              <div key={method.id} className="group bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden border border-white/20 shadow-xl hover:bg-white/20 transition-all duration-300 hover:scale-105">
                {/* Header */}
                <div className={`h-20 bg-gradient-to-r ${method.gradient} flex items-center justify-center`}>
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                    <method.icon className="h-8 w-8 text-white" />
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-2 persian-font-vazir">
                    {method.title}
                  </h3>
                  
                  <p className="text-white/70 text-sm mb-3 persian-font-vazir">
                    {method.description}
                  </p>
                  
                  {/* Contact Info */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 mb-3">
                    <div className="text-white font-bold text-lg persian-font-vazir">
                      {method.contact}
                    </div>
                  </div>
                  
                  {/* Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-white/60 text-xs persian-font-vazir">دسترسی:</span>
                      <span className="text-green-400 text-xs persian-font-vazir">{method.availability}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60 text-xs persian-font-vazir">زمان پاسخ:</span>
                      <span className="text-blue-400 text-xs persian-font-vazir">{method.responseTime}</span>
                    </div>
                  </div>
                  
                  <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-2 px-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl persian-font-vazir text-xs">
                    تماس بگیرید
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-white mb-2 persian-font-vazir">
              سوالات متداول
            </h2>
            <p className="text-blue-200 text-sm persian-font-vazir">
              پاسخ سوالات رایج شما
            </p>
          </div>

          {/* FAQ Categories */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {faqCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 persian-font-vazir ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                <category.icon className="h-4 w-4" />
                {category.name}
              </button>
            ))}
          </div>

          {/* FAQ Items */}
          <div className="space-y-4">
            {faqs[selectedCategory as keyof typeof faqs].map((faq, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 shadow-xl">
                <div className="flex items-start gap-3">
                  <QuestionMarkCircleIcon className="h-5 w-5 text-blue-400 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-2 persian-font-vazir">
                      {faq.question}
                    </h3>
                    <p className="text-white/70 text-sm persian-font-vazir">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
