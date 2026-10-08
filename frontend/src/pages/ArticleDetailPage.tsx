import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import EmiratesHeader from '../components/Layout/EmiratesHeader';
import SeoHead from '../components/SEO/SeoHead';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../services/api';
import {
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  EyeIcon,
  ShareIcon,
  TicketIcon,
} from '@heroicons/react/24/outline';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface Article {
  id?: number;
  uuid?: string;
  title: string;
  excerpt: string;
  content: string;
  author?: { username?: string; first_name?: string; last_name?: string };
  author_name?: string;
  category: { id: number; name: string; slug: string };
  tags: Array<{ id: number; name: string; slug: string }>;
  featured_image?: string;
  published_at: string;
  updated_at?: string;
  reading_time: number;
  view_count: number;
  slug: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  og_title?: string;
  og_description?: string;
  og_image_url?: string;
  canonical_url?: string;
  seo_data?: {
    robots_index?: boolean;
    structured_data?: any;
    schema_markup?: any;
  };
}

function slugifyHeading(text: string, index: number) {
  const base = text
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u0600-\u06FF-]/g, '')
    .slice(0, 60);
  return `h-${index}-${base || 'section'}`;
}

function enrichContentWithIds(html: string): { html: string; toc: TocItem[] } {
  if (!html) return { html: '', toc: [] };
  const toc: TocItem[] = [];
  let i = 0;
  const enriched = html.replace(/<h([2-4])([^>]*)>([\s\S]*?)<\/h\1>/gi, (_m, level, attrs, inner) => {
    const text = String(inner).replace(/<[^>]+>/g, '').trim();
    const id = slugifyHeading(text, i++);
    toc.push({ id, text, level: Number(level) });
    if (/\sid=/.test(attrs)) {
      return `<h${level}${attrs}>${inner}</h${level}>`;
    }
    return `<h${level}${attrs} id="${id}">${inner}</h${level}>`;
  });
  return { html: enriched, toc };
}

const ArticleDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { fontClass, language } = useLanguage();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeToc, setActiveToc] = useState<string>('');

  useEffect(() => {
    if (!slug) return;
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/blog/articles/${slug}/`);
        setArticle(res.data);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'خطا در دریافت مقاله');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  const { html: contentHtml, toc } = useMemo(
    () => enrichContentWithIds(article?.content || ''),
    [article?.content]
  );

  useEffect(() => {
    if (!toc.length) return;
    const onScroll = () => {
      let current = toc[0]?.id || '';
      for (const item of toc) {
        const el = document.getElementById(item.id);
        if (el && el.getBoundingClientRect().top <= 140) current = item.id;
      }
      setActiveToc(current);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [toc]);

  const dir = language === 'en' ? 'ltr' : 'rtl';
  const font =
    language === 'fa'
      ? 'DigiHamishe, DigiHamisheBold, sans-serif'
      : language === 'en'
      ? 'Inter, sans-serif'
      : "'Noto Sans Arabic', sans-serif";

  const authorName =
    article?.author_name ||
    [article?.author?.first_name, article?.author?.last_name].filter(Boolean).join(' ') ||
    article?.author?.username ||
    'Nasim Air';

  const formatDate = (value?: string) => {
    if (!value) return '';
    const d = new Date(value);
    return new Intl.DateTimeFormat(language === 'en' ? 'en-US' : language === 'ar' ? 'ar-SA' : 'fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(d);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <EmiratesHeader />
        <div className="flex justify-center py-24 text-slate-500" style={{ fontFamily: font }}>
          {language === 'fa' ? 'در حال بارگذاری...' : 'Loading...'}
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <EmiratesHeader />
        <div className="text-center py-24">
          <p className="text-red-600 mb-4" style={{ fontFamily: font }}>{error || 'Not found'}</p>
          <button
            onClick={() => navigate('/magazine')}
            className="text-[#1e3a8a] underline"
            style={{ fontFamily: font }}
          >
            {language === 'fa' ? 'بازگشت به مجله' : 'Back to magazine'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]" style={{ direction: dir }}>
      <SeoHead
        title={article.meta_title || article.og_title || article.title}
        description={article.meta_description || article.og_description || article.excerpt}
        keywords={article.meta_keywords}
        canonical={article.canonical_url || (typeof window !== 'undefined' ? window.location.href : undefined)}
        image={article.og_image_url || article.featured_image}
        type="article"
        noindex={article.seo_data?.robots_index === false}
        jsonLd={
          article.seo_data?.structured_data ||
          article.seo_data?.schema_markup || {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: article.title,
            description: article.meta_description || article.excerpt,
            image: article.og_image_url || article.featured_image,
            datePublished: article.published_at,
            author: { '@type': 'Person', name: authorName },
          }
        }
      />
      <EmiratesHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Breadcrumb */}
        <nav className={`text-sm text-slate-500 mb-6 flex flex-wrap items-center gap-2 ${fontClass}`} style={{ fontFamily: font }}>
          <Link to="/" className="hover:text-[#1e3a8a]">{language === 'fa' ? 'خانه' : 'Home'}</Link>
          <span>/</span>
          <Link to="/magazine" className="hover:text-[#1e3a8a]">{language === 'fa' ? 'مجله' : 'Magazine'}</Link>
          <span>/</span>
          <Link to={`/magazine/category/${article.category.slug}`} className="hover:text-[#1e3a8a]">
            {article.category.name}
          </Link>
          <span>/</span>
          <span className="text-slate-700 line-clamp-1">{article.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Sidebar — left in LTR visual = end in RTL grid */}
          <aside className="lg:col-span-4 xl:col-span-3 order-2 lg:order-1">
            <div className="lg:sticky lg:top-24 space-y-5">
              {toc.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <h3
                    className={`text-base font-bold text-[#0b1f4d] mb-4 ${fontClass}`}
                    style={{ fontFamily: font }}
                  >
                    {language === 'fa' ? 'فهرست مطالب' : 'Table of contents'}
                  </h3>
                  <ol className="space-y-2">
                    {toc.map((item, idx) => (
                      <li key={item.id}>
                        <a
                          href={`#${item.id}`}
                          onClick={(e) => {
                            e.preventDefault();
                            document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            setActiveToc(item.id);
                          }}
                          className={`flex gap-3 text-sm leading-snug rounded-lg px-2 py-1.5 transition ${
                            activeToc === item.id
                              ? 'text-[#1e3a8a] font-semibold bg-blue-50 border-r-2 border-[#1e3a8a]'
                              : 'text-slate-600 hover:text-[#1e3a8a] hover:bg-slate-50'
                          }`}
                          style={{ fontFamily: font, paddingInlineStart: item.level > 2 ? 12 : 0 }}
                        >
                          <span className="text-slate-400 tabular-nums shrink-0">
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          <span>{item.text}</span>
                        </a>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-[#0b1f4d] to-[#1e3a8a] text-white p-5 shadow-md">
                <h4 className={`font-bold text-lg mb-2 ${fontClass}`} style={{ fontFamily: font }}>
                  {language === 'fa' ? 'سفر بعدی‌تان را رزرو کنید' : 'Book your next flight'}
                </h4>
                <p className={`text-sm text-blue-100 mb-4 leading-relaxed ${fontClass}`} style={{ fontFamily: font }}>
                  {language === 'fa'
                    ? 'از مجله به پرواز — بلیط هواپیمایی نسیم را آنلاین تهیه کنید.'
                    : 'From magazine to runway — book Nasim Air tickets online.'}
                </p>
                <Link
                  to="/tickets"
                  className="inline-flex items-center justify-center gap-2 w-full bg-white text-[#0b1f4d] font-semibold rounded-xl py-2.5 hover:bg-blue-50 transition"
                  style={{ fontFamily: font }}
                >
                  <TicketIcon className="w-5 h-5" />
                  {language === 'fa' ? 'مشاهده پروازها' : 'View flights'}
                </Link>
              </div>
            </div>
          </aside>

          {/* Main article */}
          <article className="lg:col-span-8 xl:col-span-9 order-1 lg:order-2">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 sm:p-8 lg:p-10">
                <h1
                  className={`text-2xl sm:text-4xl font-bold text-[#0b1f4d] mb-4 leading-tight ${fontClass}`}
                  style={{ fontFamily: font }}
                >
                  {article.title}
                </h1>

                <div
                  className={`flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500 mb-4 ${fontClass}`}
                  style={{ fontFamily: font }}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <UserIcon className="w-4 h-4" />
                    {authorName}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDaysIcon className="w-4 h-4" />
                    {formatDate(article.published_at)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <ClockIcon className="w-4 h-4" />
                    {article.reading_time || 1} {language === 'fa' ? 'دقیقه مطالعه' : 'min read'}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <EyeIcon className="w-4 h-4" />
                    {article.view_count || 0}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({ title: article.title, url: window.location.href });
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 text-[#1e3a8a] hover:underline"
                  >
                    <ShareIcon className="w-4 h-4" />
                    {language === 'fa' ? 'اشتراک' : 'Share'}
                  </button>
                </div>

                {(article.tags?.length > 0 || article.category) && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    <Link
                      to={`/magazine/category/${article.category.slug}`}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-[#1e3a8a]"
                      style={{ fontFamily: font }}
                    >
                      {article.category.name}
                    </Link>
                    {article.tags?.map((tag) => (
                      <span
                        key={tag.id}
                        className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700"
                        style={{ fontFamily: font }}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}

                {(article.featured_image || article.slug) && (
                  <div className="rounded-xl overflow-hidden mb-8 border border-slate-100">
                    <img
                      src={article.featured_image || `/images/magazine/${article.slug}.png`}
                      alt={article.title}
                      className="w-full max-h-[420px] object-cover"
                      onError={(e) => {
                        const el = e.currentTarget;
                        const fb = `/images/magazine/${article.slug}.png`;
                        if (!el.src.includes('/images/magazine/')) {
                          el.src = fb;
                          return;
                        }
                        el.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {article.excerpt && (
                  <p
                    className={`text-lg text-slate-600 mb-8 leading-relaxed border-r-4 border-[#1e3a8a] pr-4 ${fontClass}`}
                    style={{ fontFamily: font }}
                  >
                    {article.excerpt}
                  </p>
                )}

                <div
                  className="nasim-article-body"
                  style={{ fontFamily: font, direction: dir }}
                  dangerouslySetInnerHTML={{ __html: contentHtml }}
                />
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetailPage;
