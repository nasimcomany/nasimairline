import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import EmiratesHeader from '../components/Layout/EmiratesHeader';
import SeoHead from '../components/SEO/SeoHead';
import AirplanePagination from '../components/Magazine/AirplanePagination';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../services/api';
import { magazinePublicCover, toSameOriginMediaUrl } from '../utils/mediaUrl';
import {
  MagnifyingGlassIcon,
  PaperAirplaneIcon,
  NewspaperIcon,
  ClockIcon,
  EyeIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';

const PAGE_SIZE = 9;

interface Article {
  id?: number;
  title: string;
  excerpt: string;
  slug: string;
  featured_image?: string;
  published_at: string;
  reading_time: number;
  view_count: number;
  is_featured?: boolean;
  category?: { id: number; name: string; slug: string; image?: string };
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  article_count?: number;
}

const MagazinePage: React.FC = () => {
  const { fontClass, language } = useLanguage();
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const listRef = useRef<HTMLElement>(null);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  useEffect(() => {
    api.get('/blog/categories/').then((catRes) => {
      setCategories(catRes.data.results || catRes.data || []);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const params: Record<string, string | number> = {
          page,
          page_size: PAGE_SIZE,
          ordering: '-published_at',
        };
        if (searchQuery.trim()) {
          params.search = searchQuery.trim();
        }
        const artRes = await api.get('/blog/articles/', { params });
        setArticles(artRes.data.results || artRes.data || []);
        setTotalCount(
          typeof artRes.data.count === 'number'
            ? artRes.data.count
            : (artRes.data.results || artRes.data || []).length
        );
      } catch (e) {
        console.error(e);
        setArticles([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page, searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearchQuery(searchInput);
  };

  const handlePageChange = (next: number) => {
    setPage(next);
    listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const dir = language === 'en' ? 'ltr' : 'rtl';
  const font =
    language === 'fa'
      ? 'DigiHamishe, DigiHamisheBold, sans-serif'
      : language === 'ar'
      ? "'Noto Sans Arabic', sans-serif"
      : 'Inter, sans-serif';

  return (
    <div className="min-h-screen bg-[#eef3f9]" style={{ direction: dir }}>
      <SeoHead
        title={language === 'fa' ? 'مجله هواپیمایی نسیم' : 'Nasim Air Magazine'}
        description={
          language === 'fa'
            ? 'مقالات سفر، مقصدها و راهنمای پرواز با هواپیمایی نسیم'
            : 'Travel stories, destinations and flight guides from Nasim Air'
        }
        canonical={typeof window !== 'undefined' ? `${window.location.origin}/magazine` : undefined}
      />
      <EmiratesHeader />

      <section
        className="relative overflow-hidden text-white"
        style={{
          background:
            'linear-gradient(135deg, #071530 0%, #0b1f4d 40%, #1e3a8a 75%, #2563eb 100%)',
          paddingTop: 'clamp(2.5rem, 6vw, 4.5rem)',
          paddingBottom: 'clamp(2.25rem, 5vw, 3.75rem)',
        }}
      >
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 15% 25%, rgba(147,197,253,0.55) 0%, transparent 42%), radial-gradient(circle at 85% 70%, rgba(96,165,250,0.35) 0%, transparent 40%)',
          }}
        />
        <div className="relative max-w-5xl mx-auto px-4 text-center">
          <p className={`text-sky-200/90 text-sm sm:text-base mb-2 ${fontClass}`} style={{ fontFamily: font }}>
            {language === 'fa' ? 'مجله هواپیمایی نسیم' : 'Nasim Air Magazine'}
          </p>
          <h1
            className={`text-3xl sm:text-5xl font-bold mb-6 ${fontClass}`}
            style={{ fontFamily: font, lineHeight: 1.25 }}
          >
            {language === 'fa' ? 'آسمان، مقصد و داستان سفر' : 'Sky, destinations & travel stories'}
          </h1>

          <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto relative mb-10">
            <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute top-1/2 -translate-y-1/2 right-4" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={language === 'fa' ? 'جستجو در مجله...' : 'Search magazine...'}
              className={`w-full rounded-full bg-white text-slate-800 py-3.5 pr-12 pl-5 shadow-xl outline-none focus:ring-2 focus:ring-sky-300 ${fontClass}`}
              style={{ fontFamily: font }}
            />
          </form>

          <div className="flex flex-wrap justify-center gap-5 sm:gap-8">
            <button type="button" className="flex flex-col items-center gap-2">
              <span className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center bg-white/10 border-2 border-amber-300 ring-2 ring-amber-200/40 backdrop-blur-sm">
                <NewspaperIcon className="w-7 h-7 text-white" />
              </span>
              <span className={`text-xs sm:text-sm text-white ${fontClass}`} style={{ fontFamily: font }}>
                {language === 'fa' ? 'همه نوشته‌ها' : 'All posts'}
              </span>
            </button>
            {categories.map((cat) => (
              <Link key={cat.id} to={`/magazine/category/${cat.slug}`} className="flex flex-col items-center gap-2 group">
                <span className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 flex items-center justify-center bg-white/10 border-white/25 group-hover:border-sky-200">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                  ) : (
                    <PaperAirplaneIcon className="w-7 h-7 text-white rotate-[-45deg]" />
                  )}
                </span>
                <span className={`text-xs sm:text-sm text-white ${fontClass}`} style={{ fontFamily: font }}>
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section ref={listRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {loading ? (
          <p className={`text-center text-slate-500 ${fontClass}`} style={{ fontFamily: font }}>
            {language === 'fa' ? 'در حال بارگذاری...' : 'Loading...'}
          </p>
        ) : articles.length === 0 ? (
          <p className={`text-center text-slate-500 ${fontClass}`} style={{ fontFamily: font }}>
            {language === 'fa' ? 'مقاله‌ای پیدا نشد.' : 'No articles found.'}
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
              {articles.map((article) => (
                <Link
                  key={article.slug}
                  to={`/magazine/${article.slug}`}
                  className="group relative overflow-hidden rounded-3xl bg-white shadow-[0_18px_50px_rgba(15,23,42,0.12)] hover:shadow-[0_24px_60px_rgba(15,23,42,0.18)] transition-all duration-300 hover:-translate-y-1.5"
                >
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <img
                      src={toSameOriginMediaUrl(article.featured_image) || magazinePublicCover(article.slug)}
                      alt={article.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => {
                        const el = e.currentTarget;
                        const fallback = magazinePublicCover(article.slug);
                        if (el.src.endsWith(fallback) || el.dataset.fallback === '1') {
                          el.onerror = null;
                          el.style.display = 'none';
                          const sib = el.nextElementSibling as HTMLElement | null;
                          if (sib?.dataset.placeholder) sib.style.display = 'flex';
                          return;
                        }
                        el.dataset.fallback = '1';
                        el.src = fallback;
                      }}
                    />
                    <div
                      data-placeholder="1"
                      className="absolute inset-0 bg-gradient-to-br from-[#0b1f4d] to-[#1d4ed8] items-center justify-center"
                      style={{ display: 'none' }}
                    >
                      <PaperAirplaneIcon className="w-16 h-16 text-white/50 rotate-[-40deg]" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#071530]/95 via-[#0b1f4d]/45 to-transparent" />

                    <div className="absolute top-4 right-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium bg-white/95 text-[#0b1f4d] shadow ${fontClass}`}
                        style={{ fontFamily: font }}
                      >
                        {article.category?.name || (language === 'fa' ? 'مجله نسیم' : 'Nasim Magazine')}
                      </span>
                    </div>

                    <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 text-white">
                      <h2
                        className={`text-xl sm:text-2xl font-bold leading-snug mb-3 line-clamp-3 ${fontClass}`}
                        style={{ fontFamily: font }}
                      >
                        {article.title}
                      </h2>
                      {article.excerpt ? (
                        <p className={`text-sm text-white/80 line-clamp-2 mb-4 ${fontClass}`} style={{ fontFamily: font }}>
                          {article.excerpt}
                        </p>
                      ) : null}
                      <div className={`flex items-center justify-between text-xs text-white/75 ${fontClass}`} style={{ fontFamily: font }}>
                        <span className="inline-flex items-center gap-3">
                          <span className="inline-flex items-center gap-1">
                            <ClockIcon className="w-3.5 h-3.5" />
                            {article.reading_time || 1} {language === 'fa' ? 'دقیقه' : 'min'}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <EyeIcon className="w-3.5 h-3.5" />
                            {article.view_count || 0}
                          </span>
                        </span>
                        <span className="inline-flex items-center gap-1 text-sky-200 group-hover:text-white transition-colors">
                          {language === 'fa' ? 'ادامه مطلب' : 'Read'}
                          <ArrowLeftIcon className="w-3.5 h-3.5" style={{ transform: language === 'en' ? 'scaleX(-1)' : undefined }} />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <AirplanePagination
              page={page}
              totalPages={totalPages}
              onChange={handlePageChange}
              language={language}
              fontFamily={font}
              alwaysShow
            />
          </>
        )}

        {categories.length > 0 && (
          <div className="mt-16">
            <h3 className={`text-xl sm:text-2xl font-bold text-[#0b1f4d] mb-6 ${fontClass}`} style={{ fontFamily: font }}>
              {language === 'fa' ? 'دسته‌بندی‌های مجله' : 'Magazine categories'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/magazine/category/${cat.slug}`}
                  className="group relative overflow-hidden rounded-3xl min-h-[180px] shadow-lg"
                >
                  {cat.image ? (
                    <img
                      src={toSameOriginMediaUrl(cat.image)}
                      alt={cat.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0b1f4d] to-[#1e40af]" />
                  <div className="absolute inset-0 bg-gradient-to-l from-[#071530]/90 via-[#0b1f4d]/70 to-[#0b1f4d]/40" />
                  <div className="relative z-10 p-6 sm:p-8 text-white h-full flex flex-col justify-end">
                    <h4 className={`text-xl font-bold mb-2 ${fontClass}`} style={{ fontFamily: font }}>
                      {cat.name}
                    </h4>
                    <p className={`text-sm text-white/85 line-clamp-2 ${fontClass}`} style={{ fontFamily: font }}>
                      {cat.description || (language === 'fa' ? 'مشاهده مقالات این دسته' : 'View articles')}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default MagazinePage;
