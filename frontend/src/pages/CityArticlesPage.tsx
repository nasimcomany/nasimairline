import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import EmiratesHeader from '../components/Layout/EmiratesHeader';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../services/api';
import {
  MapPinIcon,
  BuildingOffice2Icon,
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  EyeIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon
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
}

interface Article {
  uuid: string;
  title: string;
  slug: string;
  excerpt: string;
  author_name: string;
  city_name: string;
  city_slug: string;
  city_province: string;
  featured_image_url?: string;
  published_at: string;
  reading_time: number;
  view_count: number;
  is_featured: boolean;
}

const CityArticlesPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { t, fontClass, language } = useLanguage();
  const [city, setCity] = useState<City | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (slug) {
      fetchCity();
      fetchArticles();
    }
  }, [slug, currentPage]);

  const fetchCity = async () => {
    try {
      const response = await api.get(`/blog/iran-cities/${slug}/`);
      setCity(response.data);
    } catch (err: any) {
      console.error('Error fetching city:', err);
      setError(err.response?.data?.detail || 'خطا در دریافت اطلاعات شهر');
    }
  };

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/blog/iran-cities/${slug}/articles/`, {
        params: {
          page: currentPage,
          page_size: 12,
        }
      });
      
      if (response.data.results) {
        setArticles(response.data.results);
        setTotalPages(Math.ceil(response.data.count / 12));
      } else {
        setArticles(response.data);
      }
      setError(null);
    } catch (err: any) {
      console.error('Error fetching articles:', err);
      setError(err.response?.data?.detail || 'خطا در دریافت مقالات');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (language === 'fa') {
      return new Intl.DateTimeFormat('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    } else if (language === 'ar') {
      return new Intl.DateTimeFormat('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    } else {
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
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

  if (error && !city) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <EmiratesHeader />
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <EmiratesHeader />
      
      {/* City Header */}
      {city && (
        <section className="relative bg-gradient-to-r from-green-900 via-green-800 to-emerald-900 text-white py-20 sm:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => navigate('/iranology')}
              className={`mb-6 flex items-center gap-2 text-green-200 hover:text-white transition-colors ${fontClass}`}
              style={{
                fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif",
                direction: language === 'en' ? 'ltr' : 'rtl'
              }}
            >
              {language === 'en' ? <ArrowLeftIcon className="w-5 h-5" /> : <ArrowRightIcon className="w-5 h-5" />}
              {language === 'fa' ? 'بازگشت به لیست شهرها' : language === 'ar' ? 'العودة إلى قائمة المدن' : 'Back to Cities'}
            </button>
            
            <div className="flex flex-col md:flex-row gap-8 items-center">
              {city.featured_image_url && (
                <div className="w-full md:w-64 h-48 rounded-xl overflow-hidden shadow-2xl">
                  <img
                    src={city.featured_image_url}
                    alt={city.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <BuildingOffice2Icon className="w-5 h-5 text-green-300" />
                  <span className="text-green-200">{city.province}</span>
                </div>
                <h1
                  className={`text-4xl sm:text-5xl font-bold mb-4 ${fontClass}`}
                  style={{
                    fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif",
                    direction: language === 'en' ? 'ltr' : 'rtl'
                  }}
                >
                  {city.name}
                </h1>
                {city.description && (
                  <p
                    className={`text-lg text-green-100 mb-4 ${fontClass}`}
                    style={{
                      fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif",
                      direction: language === 'en' ? 'ltr' : 'rtl'
                    }}
                  >
                    {city.description}
                  </p>
                )}
                <div className="flex items-center gap-6 text-green-200">
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="w-5 h-5" />
                    <span>
                      {city.article_count} {language === 'fa' ? 'مقاله' : language === 'ar' ? 'مقالة' : 'articles'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <EyeIcon className="w-5 h-5" />
                    <span>{city.view_count} {language === 'fa' ? 'بازدید' : language === 'ar' ? 'زيارة' : 'views'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Articles Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            className={`text-3xl font-bold mb-8 text-gray-900 ${fontClass}`}
            style={{
              fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif",
              direction: language === 'en' ? 'ltr' : 'rtl'
            }}
          >
            {language === 'fa' ? 'مقالات' : language === 'ar' ? 'مقالات' : 'Articles'}
          </h2>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
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
          ) : articles.length === 0 ? (
            <div className="text-center py-20">
              <MapPinIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p
                className={`text-gray-600 ${fontClass}`}
                style={{
                  fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif"
                }}
              >
                {language === 'fa' ? 'مقاله‌ای یافت نشد' : language === 'ar' ? 'لم يتم العثور على مقالات' : 'No articles found'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((article, index) => (
                  <Link
                    key={article.uuid}
                    to={`/iranology/${article.city_slug}/${article.slug}`}
                    className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={article.featured_image_url || getDefaultImage(index)}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = getDefaultImage(index);
                        }}
                      />
                      {article.is_featured && (
                        <div className="absolute top-4 left-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          {language === 'fa' ? 'ویژه' : language === 'ar' ? 'مميز' : 'Featured'}
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3
                        className={`text-xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors line-clamp-2 ${fontClass}`}
                        style={{
                          fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif",
                          direction: language === 'en' ? 'ltr' : 'rtl'
                        }}
                      >
                        {article.title}
                      </h3>
                      <p
                        className={`text-gray-600 mb-4 line-clamp-3 ${fontClass}`}
                        style={{
                          fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif",
                          direction: language === 'en' ? 'ltr' : 'rtl'
                        }}
                      >
                        {article.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-2">
                          <UserIcon className="w-4 h-4" />
                          <span>{article.author_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <EyeIcon className="w-4 h-4" />
                          <span>{article.view_count}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <CalendarDaysIcon className="w-4 h-4" />
                          <span>{formatDate(article.published_at)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ClockIcon className="w-4 h-4" />
                          <span>{article.reading_time} {language === 'fa' ? 'دقیقه' : language === 'ar' ? 'دقيقة' : 'min'}</span>
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

export default CityArticlesPage;






