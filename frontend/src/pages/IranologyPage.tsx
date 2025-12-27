import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import EmiratesHeader from '../components/Layout/EmiratesHeader';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../services/api';
import {
  MapPinIcon,
  MagnifyingGlassIcon,
  BuildingOffice2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface City {
  uuid: string;
  name: string;
  name_en?: string;
  slug: string;
  province: string;
  province_en?: string;
  description?: string;
  featured_image?: string;
  featured_image_url?: string;
  article_count: number;
  view_count: number;
  is_active: boolean;
}

interface Province {
  province: string;
  province_en?: string;
  city_count: number;
}

const IranologyPage: React.FC = () => {
  const { t, fontClass, language } = useLanguage();
  const navigate = useNavigate();
  const [cities, setCities] = useState<City[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchCities();
    fetchProvinces();
  }, [currentPage, selectedProvince, searchQuery]);

  const fetchCities = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        page_size: 24,
      };
      
      if (selectedProvince) {
        params.province = selectedProvince;
      }
      
      if (searchQuery) {
        params.search = searchQuery;
      }

      const response = await api.get('/blog/iran-cities/', { params });
      
      if (response.data.results) {
        setCities(response.data.results);
        setTotalPages(Math.ceil(response.data.count / 24));
      } else {
        setCities(response.data);
      }
      setError(null);
    } catch (err: any) {
      console.error('Error fetching cities:', err);
      setError(err.response?.data?.detail || 'خطا در دریافت شهرها');
    } finally {
      setLoading(false);
    }
  };

  const fetchProvinces = async () => {
    try {
      const response = await api.get('/blog/iran-cities/provinces/');
      if (response.data) {
        setProvinces(response.data);
      }
    } catch (err) {
      console.error('Error fetching provinces:', err);
    }
  };

  const getDefaultImage = (index: number) => {
    const defaultImages = [
      '/images/airport-plane-photo_991869-62.jpg',
      '/images/airplane-clouds-night_864588-19786.jpg',
      '/images/skyward-soar-airplane-flying-blue-sky-clouds_391229-21566.jpg',
    ];
    return defaultImages[index % defaultImages.length];
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <EmiratesHeader />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <MapPinIcon className="w-16 h-16 sm:w-20 sm:h-20 text-blue-300" />
            </div>
            <h1
              className={`text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 ${fontClass}`}
              style={{
                fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif",
                direction: language === 'en' ? 'ltr' : 'rtl'
              }}
            >
              {language === 'fa' ? 'ایران‌شناسی' : language === 'ar' ? 'الإيرانولوجيا' : 'Iranology'}
            </h1>
            <p
              className={`text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto ${fontClass}`}
              style={{
                fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif",
                direction: language === 'en' ? 'ltr' : 'rtl'
              }}
            >
              {language === 'fa' 
                ? 'آشنایی با شهرهای زیبای ایران و فرهنگ و تاریخ غنی آن‌ها' 
                : language === 'ar' 
                ? 'التعرف على المدن الجميلة في إيران وثقافتها وتاريخها الغني' 
                : 'Discover the beautiful cities of Iran and their rich culture and history'}
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md w-full">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" style={{ [language === 'en' ? 'left' : 'right']: '0.75rem' }} />
              <input
                type="text"
                placeholder={language === 'fa' ? 'جستجوی شهرها...' : language === 'ar' ? 'البحث عن المدن...' : 'Search cities...'}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                 className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${fontClass}`}
                style={{
                  fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif",
                  direction: language === 'en' ? 'ltr' : 'rtl',
                  paddingLeft: language === 'en' ? '2.5rem' : '1rem',
                  paddingRight: language === 'en' ? '1rem' : '2.5rem'
                }}
              />
            </div>

            {/* Province Filter */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setSelectedProvince(null);
                  setCurrentPage(1);
                }}
                 className={`px-4 py-2 rounded-lg transition-all ${
                   selectedProvince === null
                     ? 'bg-blue-600 text-white'
                     : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                 } ${fontClass}`}
                style={{
                  fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif"
                }}
              >
                {language === 'fa' ? 'همه استان‌ها' : language === 'ar' ? 'جميع المحافظات' : 'All Provinces'}
              </button>
              {provinces.map((province, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedProvince(province.province);
                    setCurrentPage(1);
                  }}
                   className={`px-4 py-2 rounded-lg transition-all ${
                     selectedProvince === province.province
                       ? 'bg-blue-600 text-white'
                       : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                   } ${fontClass}`}
                  style={{
                    fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif"
                  }}
                >
                  {province.province} ({province.city_count})
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Cities Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-20">
               <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p
                className={`mt-4 text-gray-600 ${fontClass}`}
                style={{
                  fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif"
                }}
              >
                {language === 'fa' ? 'در حال بارگذاری...' : language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p
                className={`text-red-600 ${fontClass}`}
                style={{
                  fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif"
                }}
              >
                {error}
              </p>
            </div>
          ) : cities.length === 0 ? (
            <div className="text-center py-20">
              <MapPinIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p
                className={`text-gray-600 ${fontClass}`}
                style={{
                  fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif"
                }}
              >
                {language === 'fa' ? 'شهری یافت نشد' : language === 'ar' ? 'لم يتم العثور على مدينة' : 'No cities found'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {cities.map((city, index) => (
                  <Link
                    key={city.uuid}
                    to={`/iranology/${city.slug}`}
                    className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={city.featured_image_url || getDefaultImage(index)}
                        alt={city.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = getDefaultImage(index);
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <div className="flex items-center gap-2 mb-1">
                          <BuildingOffice2Icon className="w-4 h-4" />
                          <span className="text-sm">{city.province}</span>
                        </div>
                        <h3
                          className={`text-xl font-bold ${fontClass}`}
                          style={{
                            fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif",
                            direction: language === 'en' ? 'ltr' : 'rtl'
                          }}
                        >
                          {city.name}
                        </h3>
                      </div>
                    </div>
                    <div className="p-4">
                      {city.description && (
                        <p
                          className={`text-gray-600 mb-4 line-clamp-2 text-sm ${fontClass}`}
                          style={{
                            fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif",
                            direction: language === 'en' ? 'ltr' : 'rtl'
                          }}
                        >
                          {city.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <MapPinIcon className="w-4 h-4" />
                          <span>
                            {city.article_count} {language === 'fa' ? 'مقاله' : language === 'ar' ? 'مقالة' : 'articles'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <EyeIcon className="w-4 h-4" />
                          <span>{city.view_count}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-12">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeftIcon className="w-5 h-5" style={{ transform: language === 'en' ? 'none' : 'scaleX(-1)' }} />
                  </button>
                  <span
                    className={`px-4 py-2 ${fontClass}`}
                    style={{
                      fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif"
                    }}
                  >
                    {language === 'fa' ? `صفحه ${currentPage} از ${totalPages}` : language === 'ar' ? `صفحة ${currentPage} من ${totalPages}` : `Page ${currentPage} of ${totalPages}`}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRightIcon className="w-5 h-5" style={{ transform: language === 'en' ? 'none' : 'scaleX(-1)' }} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default IranologyPage;
