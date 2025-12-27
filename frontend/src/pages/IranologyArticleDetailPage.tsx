import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import EmiratesHeader from '../components/Layout/EmiratesHeader';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../services/api';
import {
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  MapPinIcon,
  BuildingOffice2Icon,
  ArrowLeftIcon,
  ArrowRightIcon,
  EyeIcon,
  ShareIcon
} from '@heroicons/react/24/outline';

interface Article {
  uuid: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author_name: string;
  city: {
    uuid: string;
    name: string;
    slug: string;
    province: string;
  };
  featured_image_url?: string;
  published_at: string;
  reading_time: number;
  view_count: number;
  is_featured: boolean;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
}

const IranologyArticleDetailPage: React.FC = () => {
  const { city_slug, slug } = useParams<{ city_slug: string; slug: string }>();
  const navigate = useNavigate();
  const { t, fontClass, language } = useLanguage();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);

  useEffect(() => {
    if (slug) {
      fetchArticle();
    }
  }, [slug]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      // Try to fetch by slug
      const response = await api.get(`/blog/iranology-articles/${slug}/`);
      setArticle(response.data);
      fetchRelatedArticles(response.data.city.slug);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching article:', err);
      setError(err.response?.data?.detail || 'خطا در دریافت مقاله');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedArticles = async (citySlug: string) => {
    try {
      const response = await api.get(`/blog/iran-cities/${citySlug}/articles/`, {
        params: {
          page_size: 4,
        }
      });
      if (response.data.results) {
        setRelatedArticles(
          response.data.results
            .filter((a: Article) => a.slug !== article?.slug)
            .slice(0, 3)
        );
      } else {
        setRelatedArticles(
          response.data
            .filter((a: Article) => a.slug !== article?.slug)
            .slice(0, 3)
        );
      }
    } catch (err) {
      console.error('Error fetching related articles:', err);
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

  const getDefaultImage = () => {
    return '/images/airport-plane-photo_991869-62.jpg';
  };

  const shareArticle = () => {
    if (navigator.share) {
      navigator.share({
        title: article?.title,
        text: article?.excerpt,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert(language === 'fa' ? 'لینک کپی شد' : language === 'ar' ? 'تم نسخ الرابط' : 'Link copied');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <EmiratesHeader />
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
      </div>
    );
  }

  if (error || !article) {
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
            {error || (language === 'fa' ? 'مقاله یافت نشد' : language === 'ar' ? 'لم يتم العثور على المقال' : 'Article not found')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <EmiratesHeader />
      
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <button
              onClick={() => navigate('/iranology')}
              className="hover:text-blue-600 transition-colors"
            >
              {language === 'fa' ? 'ایران‌شناسی' : language === 'ar' ? 'الإيرانولوجيا' : 'Iranology'}
            </button>
            <span>/</span>
            <button
              onClick={() => navigate(`/iranology/${article.city.slug}`)}
              className="hover:text-blue-600 transition-colors"
            >
              {article.city.name}
            </button>
            <span>/</span>
            <span className="text-gray-900">{article.title}</span>
          </div>
        </div>
      </div>

      {/* Article Header */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <button
          onClick={() => navigate(`/iranology/${article.city.slug}`)}
          className={`mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors ${fontClass}`}
          style={{
            fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif",
            direction: language === 'en' ? 'ltr' : 'rtl'
          }}
        >
          {language === 'en' ? <ArrowLeftIcon className="w-5 h-5" /> : <ArrowRightIcon className="w-5 h-5" />}
          {language === 'fa' ? 'بازگشت به مقالات' : language === 'ar' ? 'العودة إلى المقالات' : 'Back to Articles'}
        </button>

        {/* Featured Image */}
        {article.featured_image_url && (
          <div className="mb-8 rounded-xl overflow-hidden shadow-lg">
            <img
              src={article.featured_image_url}
              alt={article.title}
              className="w-full h-auto"
              onError={(e) => {
                (e.target as HTMLImageElement).src = getDefaultImage();
              }}
            />
          </div>
        )}

        {/* Article Meta */}
        <div className="mb-6">
          {/* City Info */}
          <div className="flex items-center gap-4 mb-4">
            <Link
              to={`/iranology/${article.city.slug}`}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
            >
              <MapPinIcon className="w-5 h-5" />
              <span className="font-semibold">{article.city.name}</span>
              <BuildingOffice2Icon className="w-4 h-4 text-gray-500" />
              <span className="text-gray-500">{article.city.province}</span>
            </Link>
          </div>

          {/* Title */}
          <h1
            className={`text-4xl sm:text-5xl font-bold text-gray-900 mb-6 ${fontClass}`}
            style={{
              fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif",
              direction: language === 'en' ? 'ltr' : 'rtl'
            }}
          >
            {article.title}
          </h1>

          {/* Article Info */}
          <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6">
            <div className="flex items-center gap-2">
              <UserIcon className="w-5 h-5" />
              <span>{article.author_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDaysIcon className="w-5 h-5" />
              <span>{formatDate(article.published_at)}</span>
            </div>
            <div className="flex items-center gap-2">
              <ClockIcon className="w-5 h-5" />
              <span>
                {article.reading_time} {language === 'fa' ? 'دقیقه مطالعه' : language === 'ar' ? 'دقيقة قراءة' : 'min read'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <EyeIcon className="w-5 h-5" />
              <span>{article.view_count} {language === 'fa' ? 'بازدید' : language === 'ar' ? 'زيارة' : 'views'}</span>
            </div>
            <button
              onClick={shareArticle}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
            >
              <ShareIcon className="w-5 h-5" />
              <span>{language === 'fa' ? 'اشتراک' : language === 'ar' ? 'مشاركة' : 'Share'}</span>
            </button>
          </div>

          {/* Excerpt */}
          {article.excerpt && (
            <p
              className={`text-xl text-gray-600 mb-8 leading-relaxed ${fontClass}`}
              style={{
                fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif",
                direction: language === 'en' ? 'ltr' : 'rtl'
              }}
            >
              {article.excerpt}
            </p>
          )}
        </div>

        {/* Article Content */}
        <div
          className={`prose prose-lg max-w-none ${fontClass}`}
          style={{
            fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif",
            direction: language === 'en' ? 'ltr' : 'rtl'
          }}
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </article>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="bg-gray-50 py-12 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2
              className={`text-3xl font-bold mb-8 text-gray-900 ${fontClass}`}
              style={{
                fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif",
                direction: language === 'en' ? 'ltr' : 'rtl'
              }}
            >
              {language === 'fa' ? 'مقالات مرتبط' : language === 'ar' ? 'مقالات ذات صلة' : 'Related Articles'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((relatedArticle) => (
                <Link
                  key={relatedArticle.uuid}
                  to={`/iranology/${relatedArticle.city.slug}/${relatedArticle.slug}`}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  {relatedArticle.featured_image_url && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={relatedArticle.featured_image_url}
                        alt={relatedArticle.title}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3
                      className={`text-xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors line-clamp-2 ${fontClass}`}
                      style={{
                        fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif",
                        direction: language === 'en' ? 'ltr' : 'rtl'
                      }}
                    >
                      {relatedArticle.title}
                    </h3>
                    <p
                      className={`text-gray-600 mb-4 line-clamp-3 ${fontClass}`}
                      style={{
                        fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif",
                        direction: language === 'en' ? 'ltr' : 'rtl'
                      }}
                    >
                      {relatedArticle.excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <ClockIcon className="w-4 h-4" />
                        <span>{relatedArticle.reading_time} {language === 'fa' ? 'دقیقه' : language === 'ar' ? 'دقيقة' : 'min'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <EyeIcon className="w-4 h-4" />
                        <span>{relatedArticle.view_count}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default IranologyArticleDetailPage;
