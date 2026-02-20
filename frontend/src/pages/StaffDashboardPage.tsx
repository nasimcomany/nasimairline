/**
 * داشبورد پرسنل - صفحه شیک با گزینه‌های لوگو
 */
import React, { useState } from 'react';
import EmiratesHeader from '../components/Layout/EmiratesHeader';
import { useLanguage } from '../contexts/LanguageContext';
import { XMarkIcon } from '@heroicons/react/24/outline';
import CabinSafetyForm from '../components/Staff/CabinSafetyForm';
import SafetyHazardForm from '../components/Staff/SafetyHazardForm';

// مسیر لوگوها در frontend/public/images (بدون staff)
// دو لوگوی PDF: یکی مثل AirPocket (CabinSafetyForm)، یکی مثل Auto (SafetyHazardForm)
const STAFF_OPTIONS = [
  { id: 'hozorgheyab', label: 'حضور و غیاب', logo: '/images/حضورغیاب.png', formType: null },
  { id: 'skybag', label: 'SkyBag', logo: '/images/skybag.png', formType: null },
  { id: 'pdf-airpocket', label: 'PDF', logo: '/images/pdf.png', formType: 'cabin' as const },
  { id: 'pdf-auto', label: 'PDF', logo: '/images/pdf.png', formType: 'safety' as const },
  { id: 'auto', label: 'Auto', logo: '/images/auto.png', formType: 'safety' as const },
  { id: 'airpocket', label: 'AirPocket', logo: '/images/airpocket.png', formType: 'cabin' as const },
];

const StaffDashboardPage: React.FC = () => {
  const { fontClass, language } = useLanguage();
  const [openModalKey, setOpenModalKey] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const dir = language === 'en' ? 'ltr' : 'rtl';

  const selectedOption = openModalKey ? STAFF_OPTIONS.find(o => o.id === openModalKey) : null;
  const handleImageError = (id: string) => setFailedImages(prev => new Set(prev).add(id));

  return (
    <div className="min-h-screen bg-white">
      <EmiratesHeader />

      {/* Hero Section - هماهنگ با صفحه اصلی */}
      <section className="relative min-h-[45vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <h1
            className="text-white mb-4"
            style={{
              fontFamily: 'DigiHamisheBold, Arial, sans-serif',
              fontSize: 'clamp(2rem, 6vw, 3.5rem)',
              fontWeight: 'bold',
              lineHeight: '1.2',
              textShadow: '2px 2px 8px rgba(0,0,0,0.5)',
              direction: 'rtl',
            }}
          >
            پنل پرسنل
          </h1>
          <p
            className="text-white/90"
            style={{
              fontFamily: 'DigiHamisheBold, Arial, sans-serif',
              fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
              textShadow: '1px 1px 4px rgba(0,0,0,0.5)',
              direction: 'rtl',
            }}
          >
            یکی از گزینه‌های زیر را انتخاب کنید
          </p>
        </div>
      </section>

      {/* Logo Cards - بخش اصلی */}
      <section className="relative z-10 -mt-16 px-4 pb-20">
        <div className="max-w-6xl mx-auto">
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6"
            style={{ direction: dir }}
          >
            {STAFF_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setOpenModalKey(opt.id)}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100 overflow-hidden transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-900/40 focus:ring-offset-2"
              >
                <div className="aspect-square flex flex-col items-center justify-center p-6">
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center mb-4 rounded-xl bg-gray-50 group-hover:bg-blue-50 transition-colors">
                    {!failedImages.has(opt.id) ? (
                      <img
                        src={opt.logo}
                        alt={opt.label}
                        className="max-w-full max-h-full object-contain"
                        onError={() => handleImageError(opt.id)}
                      />
                    ) : (
                      <div
                        className="w-16 h-16 rounded-lg bg-blue-900/10 flex items-center justify-center text-blue-900/50 text-2xl font-bold"
                        style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}
                      >
                        {opt.label.charAt(0)}
                      </div>
                    )}
                  </div>
                  <span
                    className="text-gray-800 font-semibold text-sm sm:text-base group-hover:text-blue-900 transition-colors"
                    style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}
                  >
                    {opt.label}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Modal - فرم‌ها بعداً اضافه می‌شوند */}
      {selectedOption && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setOpenModalKey(null)}
        >
          <div
            className={`relative bg-white rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-y-auto ${(selectedOption?.formType === 'cabin' || selectedOption?.formType === 'safety') ? 'max-w-4xl' : 'max-w-lg'}`}
            style={{ direction: dir }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gradient-to-r from-blue-900 to-blue-800 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2
                className="text-white text-xl font-bold"
                style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}
              >
                {selectedOption.label}
              </h2>
              <button
                onClick={() => setOpenModalKey(null)}
                className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              {selectedOption?.formType === 'cabin' ? (
                <CabinSafetyForm
                  onSuccess={() => setOpenModalKey(null)}
                  onCancel={() => setOpenModalKey(null)}
                />
              ) : selectedOption?.formType === 'safety' ? (
                <SafetyHazardForm
                  onSuccess={() => setOpenModalKey(null)}
                  onCancel={() => setOpenModalKey(null)}
                />
              ) : (
                <p
                  className="text-gray-600 text-center py-8"
                  style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}
                >
                  فرم به زودی اضافه می‌شود.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDashboardPage;
