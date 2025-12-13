import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import EmiratesHeader from '../components/Layout/EmiratesHeader';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../services/api';
import {
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  TagIcon,
  ArrowLeftIcon,
  EyeIcon,
  ShareIcon
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
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
}

const ArticleDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
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
      // Try to fetch by slug first, if fails try by ID
      let response;
      try {
        response = await api.get(`/blog/articles/?slug=${slug}`);
        if (response.data.results && response.data.results.length > 0) {
          const articleId = response.data.results[0].id;
          response = await api.get(`/blog/articles/${articleId}/`);
        } else if (response.data.length > 0) {
          const articleId = response.data[0].id;
          response = await api.get(`/blog/articles/${articleId}/`);
        } else {
          // If slug doesn't work, try as ID
          response = await api.get(`/blog/articles/${slug}/`);
        }
      } catch {
        // If slug fails, try as ID
        response = await api.get(`/blog/articles/${slug}/`);
      }
      
      setArticle(response.data);
      fetchRelatedArticles(response.data.category.id);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching article:', err);
      setError(err.response?.data?.detail || 'خطا در دریافت مقاله');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedArticles = async (categoryId: number) => {
    try {
      const response = await api.get(`/blog/articles/?category=${categoryId}&page_size=3`);
      if (response.data.results) {
        setRelatedArticles(response.data.results.filter((a: Article) => a.id !== article?.id).slice(0, 3));
      } else {
        setRelatedArticles(response.data.filter((a: Article) => a.id !== article?.id).slice(0, 3));
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
      <div className="min-h-screen bg-gray-50">
        <EmiratesHeader />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
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
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50">
        <EmiratesHeader />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p
              className={`text-red-600 ${fontClass}`}
              style={{
                fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif"
              }}
            >
              {error || (language === 'fa' ? 'مقاله یافت نشد' : language === 'ar' ? 'لم يتم العثور على المقال' : 'Article not found')}
            </p>
            <Link
              to="/magazine"
              className={`mt-4 inline-block text-blue-600 hover:text-blue-800 ${fontClass}`}
              style={{
                fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif"
              }}
            >
              {language === 'fa' ? 'بازگشت به مجله' : language === 'ar' ? 'العودة إلى المجلة' : 'Back to Magazine'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EmiratesHeader />
      
      {/* Article Header */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            to="/magazine"
            className={`inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 ${fontClass}`}
            style={{
              fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif",
              direction: language === 'en' ? 'ltr' : 'rtl'
            }}
          >
            <ArrowLeftIcon className="w-5 h-5" style={{ transform: language === 'en' ? 'none' : 'scaleX(-1)' }} />
            <span>{language === 'fa' ? 'بازگشت به مجله' : language === 'ar' ? 'العودة إلى المجلة' : 'Back to Magazine'}</span>
          </Link>

          <div className="flex items-center gap-2 mb-4">
            <TagIcon className="w-5 h-5 text-gray-500" />
            <span className={`text-gray-600 ${fontClass}`} style={{ fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif" }}>
              {article.category.name}
            </span>
          </div>

          <h1
            className={`text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 ${fontClass}`}
            style={{
              fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif",
              direction: language === 'en' ? 'ltr' : 'rtl'
            }}
          >
            {article.title}
          </h1>

          <p
            className={`text-xl text-gray-600 mb-6 ${fontClass}`}
            style={{
              fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif",
              direction: language === 'en' ? 'ltr' : 'rtl'
            }}
          >
            {article.excerpt}
          </p>

          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <UserIcon className="w-5 h-5" />
              <span className={fontClass} style={{ fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif" }}>
                {article.author.first_name && article.author.last_name
                  ? `${article.author.first_name} ${article.author.last_name}`
                  : article.author.username}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDaysIcon className="w-5 h-5" />
              <span className={fontClass} style={{ fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif" }}>
                {formatDate(article.published_at)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ClockIcon className="w-5 h-5" />
              <span className={fontClass} style={{ fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif" }}>
                {article.reading_time} {language === 'fa' ? 'دقیقه' : language === 'ar' ? 'دقيقة' : 'min'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <EyeIcon className="w-5 h-5" />
              <span className={fontClass} style={{ fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif" }}>
                {article.view_count} {language === 'fa' ? 'بازدید' : language === 'ar' ? 'مشاهدة' : 'views'}
              </span>
            </div>
            <button
              onClick={shareArticle}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ShareIcon className="w-5 h-5" />
              <span className={fontClass} style={{ fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif" }}>
                {language === 'fa' ? 'اشتراک‌گذاری' : language === 'ar' ? 'مشاركة' : 'Share'}
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Featured Image */}
      {article.featured_image && (
        <section className="bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <img
              src={article.featured_image}
              alt={article.title}
              className="w-full h-auto rounded-xl shadow-lg"
              onError={(e) => {
                (e.target as HTMLImageElement).src = getDefaultImage();
              }}
            />
          </div>
        </section>
      )}

      {/* Article Content */}
      <section className="bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div
            className={`prose prose-lg max-w-none ${fontClass}`}
            style={{
              fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif",
              direction: language === 'en' ? 'ltr' : 'rtl'
            }}
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>
      </section>

      {/* Tags */}
      {article.tags && article.tags.length > 0 && (
        <section className="bg-white border-t border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`text-gray-700 font-semibold ${fontClass}`}
                style={{
                  fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif"
                }}
              >
                {language === 'fa' ? 'برچسب‌ها:' : language === 'ar' ? 'العلامات:' : 'Tags:'}
              </span>
              {article.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2
              className={`text-2xl sm:text-3xl font-bold mb-8 text-gray-900 ${fontClass}`}
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
                  key={relatedArticle.id}
                  to={`/magazine/${relatedArticle.slug || relatedArticle.id}`}
                  className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={relatedArticle.featured_image || getDefaultImage()}
                      alt={relatedArticle.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getDefaultImage();
                      }}
                    />
                  </div>
                  <div className="p-6">
                    <h3
                      className={`text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 ${fontClass}`}
                      style={{
                        fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif",
                        direction: language === 'en' ? 'ltr' : 'rtl'
                      }}
                    >
                      {relatedArticle.title}
                    </h3>
                    <p
                      className={`text-gray-600 text-sm line-clamp-2 ${fontClass}`}
                      style={{
                        fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif",
                        direction: language === 'en' ? 'ltr' : 'rtl'
                      }}
                    >
                      {relatedArticle.excerpt}
                    </p>
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

export default ArticleDetailPage;

