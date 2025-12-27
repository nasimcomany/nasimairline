import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import EmiratesHeader from '../components/Layout/EmiratesHeader';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../services/api';
import {
  MapPinIcon,
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  EyeIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

interface City {
  uuid: string;
  name: string;
  name_en?: string;
  slug: string;
  province: string;
  province_en?: string;
  description?: string;
  featured_image_url?: string;
  image_alt?: string;
  article_count: number;
  view_count: number;
}

interface Article {
  uuid: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author_name: string;
  city_name: string;
  city_slug: string;
  city_province: string;
  featured_image_url?: string;
  image_alt?: string;
  published_at: string;
  reading_time: number;
  view_count: number;
  is_featured: boolean;
  url: string;
}

const CityArticlePage: React.FC = () => {
  const { citySlug } = useParams<{ citySlug: string }>();
  const { t, fontClass, language } = useLanguage();
  const navigate = useNavigate();
  const [city, setCity] = useState<City | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (citySlug) {
      fetchCity();
      fetchArticles();
    }
  }, [citySlug]);

  const fetchCity = async () => {
    try {
      const response = await api.get(`/blog/iran-cities/${citySlug}/`);
      setCity(response.data);
    } catch (err: any) {
      console.error('Error fetching city:', err);
      setError(err.response?.data?.detail || 'خطا در دریافت اطلاعات شهر');
    }
  };

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/blog/iranology-articles/by_city/?city=${citySlug}`);
      
      if (response.data.results) {
        setArticles(response.data.results);
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

  const handleArticleClick = (articleSlug: string) => {
    navigate(`/iranology/${citySlug}/${articleSlug}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'fa' ? 'fa-IR' : language === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <EmiratesHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <button
          onClick={() => navigate('/iranology')}
          className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span className={fontClass}>
            {language === 'fa' ? 'بازگشت به لیست شهرها' : language === 'ar' ? 'العودة إلى قائمة المدن' : 'Back to Cities'}
          </span>
        </button>

        {/* City Header */}
        {city && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
            {city.featured_image_url && (
              <div className="relative h-64 md:h-96 overflow-hidden">
                <img
                  src={city.featured_image_url}
                  alt={city.image_alt || city.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPinIcon className="h-5 w-5" />
                    <span className="text-sm">{city.province}</span>
                  </div>
                  <h1 className={`text-3xl md:text-5xl font-bold mb-4 ${fontClass}`}>
                    {city.name}
                  </h1>
                  {city.description && (
                    <p className={`text-lg text-white/90 max-w-3xl ${fontClass}`}>
                      {city.description}
                    </p>
                  )}
                </div>
              </div>
            )}
            {!city.featured_image_url && (
              <div className="p-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <MapPinIcon className="h-5 w-5" />
                  <span>{city.province}</span>
                </div>
                <h1 className={`text-3xl md:text-5xl font-bold mb-4 ${fontClass}`}>
                  {city.name}
                </h1>
                {city.description && (
                  <p className={`text-lg text-white/90 max-w-3xl ${fontClass}`}>
                    {city.description}
                  </p>
                )}
              </div>
            )}
            <div className="p-6 bg-gray-50 border-t border-gray-200">
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <EyeIcon className="h-5 w-5 text-gray-400" />
                  <span>{city.view_count} {language === 'fa' ? 'بازدید' : language === 'ar' ? 'زيارة' : 'views'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                  <span>{city.article_count} {language === 'fa' ? 'مقاله' : language === 'ar' ? 'مقالة' : 'articles'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className={`mt-4 text-gray-600 ${fontClass}`}>
              {language === 'fa' ? 'در حال بارگذاری...' : language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Articles List */}
        {!loading && !error && (
          <>
            {articles.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-lg">
                <MapPinIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <p className={`text-gray-600 text-lg ${fontClass}`}>
                  {language === 'fa' ? 'مقاله‌ای برای این شهر یافت نشد' : language === 'ar' ? 'لم يتم العثور على مقالات لهذه المدينة' : 'No articles found for this city'}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <h2 className={`text-2xl font-bold text-gray-900 mb-6 ${fontClass}`}>
                  {language === 'fa' ? 'مقالات مرتبط' : language === 'ar' ? 'المقالات ذات الصلة' : 'Related Articles'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {articles.map((article) => (
                    <div
                      key={article.uuid}
                      onClick={() => handleArticleClick(article.slug)}
                      className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer group border border-gray-200 hover:border-blue-300"
                    >
                      {article.featured_image_url && (
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={article.featured_image_url}
                            alt={article.image_alt || article.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          {article.is_featured && (
                            <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold">
                              {language === 'fa' ? 'ویژه' : language === 'ar' ? 'مميز' : 'Featured'}
                            </div>
                          )}
                        </div>
                      )}
                      <div className="p-5">
                        <h3 className={`text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 ${fontClass}`}>
                          {article.title}
                        </h3>
                        <p className={`text-gray-600 text-sm mb-4 line-clamp-3 ${fontClass}`}>
                          {article.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <UserIcon className="h-4 w-4" />
                              <span>{article.author_name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <CalendarDaysIcon className="h-4 w-4" />
                              <span>{formatDate(article.published_at)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-4 text-gray-500">
                            <div className="flex items-center gap-1">
                              <ClockIcon className="h-4 w-4" />
                              <span>{article.reading_time} {language === 'fa' ? 'دقیقه' : language === 'ar' ? 'دقيقة' : 'min'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <EyeIcon className="h-4 w-4" />
                              <span>{article.view_count}</span>
                            </div>
                          </div>
                          <button className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium group-hover:gap-2 transition-all">
                            <span>{language === 'fa' ? 'مطالعه' : language === 'ar' ? 'قراءة' : 'Read'}</span>
                            <ArrowRightIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CityArticlePage;

