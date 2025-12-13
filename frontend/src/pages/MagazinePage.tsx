import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import EmiratesHeader from '../components/Layout/EmiratesHeader';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../services/api';
import {
  NewspaperIcon,
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  TagIcon,
  ArrowRightIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface Article {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  author: {
    id: number;
    username: string;
    first_name?: string;
    last_name?: string;
  };
  category: {
    id: number;
    name: string;
    slug: string;
  };
  tags: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  featured_image?: string;
  published_at: string;
  reading_time: number;
  view_count: number;
  is_featured: boolean;
  slug: string;
}

const MagazinePage: React.FC = () => {
  const { t, fontClass, language } = useLanguage();
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<Array<{ id: number; name: string; slug: string }>>([]);

  useEffect(() => {
    fetchArticles();
    fetchFeaturedArticles();
    fetchCategories();
  }, [currentPage, selectedCategory, searchQuery]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        page_size: 12,
      };
      
      if (selectedCategory) {
        params.category = selectedCategory;
      }
      
      if (searchQuery) {
        params.search = searchQuery;
      }

      const response = await api.get('/blog/articles/', { params });
      
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

  const fetchFeaturedArticles = async () => {
    try {
      const response = await api.get('/blog/articles/featured/');
      if (response.data.results) {
        setFeaturedArticles(response.data.results.slice(0, 3));
      } else {
        setFeaturedArticles(response.data.slice(0, 3));
      }
    } catch (err) {
      console.error('Error fetching featured articles:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/blog/categories/');
      if (response.data.results) {
        setCategories(response.data.results);
      } else {
        setCategories(response.data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
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
      '/images/sheremetyevo-airport-view-in-rainy-evening-moscow-free-video.jpg',
      '/images/360_F_600352190_78zb8hHbSeQdHtfGQliVRtHXEEXcvtHf.jpg',
      '/images/1697200583302.jpg'
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
              <NewspaperIcon className="w-16 h-16 sm:w-20 sm:h-20 text-blue-300" />
            </div>
            <h1
              className={`text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 ${fontClass}`}
              style={{
                fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif",
                direction: language === 'en' ? 'ltr' : 'rtl'
              }}
            >
              {language === 'fa' ? 'مجله نسیم ایر' : language === 'ar' ? 'مجلة نسيم إير' : 'Nasim Air Magazine'}
            </h1>
            <p
              className={`text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto ${fontClass}`}
              style={{
                fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif",
                direction: language === 'en' ? 'ltr' : 'rtl'
              }}
            >
              {language === 'fa' 
                ? 'مقالات، اخبار و داستان‌های سفر از سراسر جهان' 
                : language === 'ar' 
                ? 'مقالات وأخبار وقصص السفر من جميع أنحاء العالم' 
                : 'Articles, news and travel stories from around the world'}
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
                placeholder={language === 'fa' ? 'جستجوی مقالات...' : language === 'ar' ? 'البحث عن المقالات...' : 'Search articles...'}
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

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedCategory === null
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } ${fontClass}`}
                style={{
                  fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif"
                }}
              >
                {language === 'fa' ? 'همه' : language === 'ar' ? 'الكل' : 'All'}
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.id.toString());
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    selectedCategory === category.id.toString()
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } ${fontClass}`}
                  style={{
                    fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif"
                  }}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      {featuredArticles.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2
              className={`text-2xl sm:text-3xl font-bold mb-8 text-gray-900 ${fontClass}`}
              style={{
                fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif",
                direction: language === 'en' ? 'ltr' : 'rtl'
              }}
            >
              {language === 'fa' ? 'مقالات ویژه' : language === 'ar' ? 'مقالات مميزة' : 'Featured Articles'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredArticles.map((article, index) => (
                <Link
                  key={article.id}
                  to={`/magazine/${article.slug || article.id}`}
                  className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={article.featured_image || getDefaultImage(index)}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getDefaultImage(index);
                      }}
                    />
                    <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {language === 'fa' ? 'ویژه' : language === 'ar' ? 'مميز' : 'Featured'}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      <TagIcon className="w-4 h-4" />
                      <span>{article.category.name}</span>
                    </div>
                    <h3
                      className={`text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2 ${fontClass}`}
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
          </div>
        </section>
      )}

      {/* All Articles */}
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
          ) : articles.length === 0 ? (
            <div className="text-center py-20">
              <NewspaperIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
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
                    key={article.id}
                    to={`/magazine/${article.slug || article.id}`}
                    className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={article.featured_image || getDefaultImage(index)}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = getDefaultImage(index);
                        }}
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <TagIcon className="w-4 h-4" />
                        <span>{article.category.name}</span>
                      </div>
                      <h3
                        className={`text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2 ${fontClass}`}
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
                          <span>
                            {article.author.first_name && article.author.last_name
                              ? `${article.author.first_name} ${article.author.last_name}`
                              : article.author.username}
                          </span>
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

export default MagazinePage;

