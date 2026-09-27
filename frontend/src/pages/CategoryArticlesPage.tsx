import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import EmiratesHeader from '../components/Layout/EmiratesHeader';
import SeoHead from '../components/SEO/SeoHead';
import AirplanePagination from '../components/Magazine/AirplanePagination';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../services/api';
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
  category?: { id: number; name: string; slug: string };
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
}

const CategoryArticlesPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { fontClass, language } = useLanguage();
  const [category, setCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const listRef = useRef<HTMLElement>(null);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
    setSearchInput('');
    setSearchQuery('');
  }, [slug]);

  useEffect(() => {
    if (!slug) return;
    api.get(`/blog/categories/${slug}/`).then((catRes) => {
      setCategory(catRes.data);
      setError(null);
    }).catch((err: any) => {
      setError(err.response?.data?.detail || 'دسته‌بندی پیدا نشد');
      setCategory(null);
    });
    api.get('/blog/categories/').then((allCats) => {
      setCategories(allCats.data.results || allCats.data || []);
    }).catch(console.error);
  }, [slug]);

  useEffect(() => {
    if (!slug) return;
    const load = async () => {
      try {
        setLoading(true);
        const params: Record<string, string | number> = {
          page,
          page_size: PAGE_SIZE,
        };
        if (searchQuery.trim()) {
          params.search = searchQuery.trim();
        }
        const artRes = await api.get(`/blog/categories/${slug}/articles/`, { params });
        setArticles(artRes.data.results || artRes.data || []);
        setTotalCount(
          typeof artRes.data.count === 'number'
            ? artRes.data.count
            : (artRes.data.results || artRes.data || []).length
        );
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'دسته‌بندی پیدا نشد');
        setArticles([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug, page, searchQuery]);

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

  const pageTitle =
    category?.meta_title ||
    (category
      ? language === 'en'
        ? `${category.name} | Nasim Magazine`
        : `${category.name} | مجله نسیم`
      : 'مجله نسیم');

  return (
    <div className="min-h-screen bg-[#eef3f9]" style={{ direction: dir }}>
      <SeoHead
        title={pageTitle}
        description={category?.meta_description || category?.description || ''}
        keywords={category?.meta_keywords}
        canonical={typeof window !== 'undefined' ? window.location.href : undefined}
      />
      <EmiratesHeader />

      <section
        className="relative overflow-hidden text-white"
        style={{
          background: 'linear-gradient(135deg, #071530 0%, #0b1f4d 50%, #1d4ed8 100%)',
          paddingTop: 'clamp(2.5rem, 6vw, 4rem)',
          paddingBottom: 'clamp(2rem, 5vw, 3rem)',
        }}
      >
        <div className="relative max-w-5xl mx-auto px-4 text-center">
          <p className={`text-sky-200 text-sm mb-2 ${fontClass}`} style={{ fontFamily: font }}>
            <Link to="/magazine" className="hover:underline">
              {language === 'fa' ? 'مجله نسیم' : 'Nasim Magazine'}
            </Link>
          </p>
          <h1 className={`text-3xl sm:text-5xl font-bold mb-6 ${fontClass}`} style={{ fontFamily: font }}>
            {category?.name || (language === 'fa' ? 'دسته‌بندی' : 'Category')}
          </h1>
          {category?.description ? (
            <p className={`text-blue-100 max-w-2xl mx-auto mb-8 ${fontClass}`} style={{ fontFamily: font }}>
              {category.description}
            </p>
          ) : null}

          <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto relative mb-10">
            <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute top-1/2 -translate-y-1/2 right-4" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={language === 'fa' ? 'جستجو در این دسته...' : 'Search in category...'}
              className={`w-full rounded-full bg-white text-slate-800 py-3.5 pr-12 pl-5 shadow-lg outline-none ${fontClass}`}
              style={{ fontFamily: font }}
            />
          </form>

          <div className="flex flex-wrap justify-center gap-5 sm:gap-7">
            <Link to="/magazine" className="flex flex-col items-center gap-2">
              <span className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center bg-white/10 border-2 border-white/30">
                <NewspaperIcon className="w-7 h-7 text-white" />
              </span>
              <span className={`text-xs text-white ${fontClass}`} style={{ fontFamily: font }}>
                {language === 'fa' ? 'همه نوشته‌ها' : 'All'}
              </span>
            </Link>
            {categories.map((cat) => (
              <Link key={cat.id} to={`/magazine/category/${cat.slug}`} className="flex flex-col items-center gap-2">
                <span
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 flex items-center justify-center bg-white/10 ${
                    cat.slug === slug ? 'border-amber-300 ring-2 ring-amber-200/40' : 'border-white/30'
                  }`}
                >
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                  ) : (
                    <PaperAirplaneIcon className="w-7 h-7 text-white rotate-[-45deg]" />
                  )}
                </span>
                <span className={`text-xs text-white ${fontClass}`} style={{ fontFamily: font }}>
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section ref={listRef} className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {loading ? (
          <p className={`text-center text-slate-500 ${fontClass}`} style={{ fontFamily: font }}>
            {language === 'fa' ? 'در حال بارگذاری...' : 'Loading...'}
          </p>
        ) : error ? (
          <p className={`text-center text-red-600 ${fontClass}`} style={{ fontFamily: font }}>{error}</p>
        ) : articles.length === 0 ? (
          <p className={`text-center text-slate-500 ${fontClass}`} style={{ fontFamily: font }}>
            {language === 'fa' ? 'هنوز مقاله‌ای در این دسته نیست.' : 'No articles in this category yet.'}
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
                    {article.featured_image ? (
                      <img
                        src={article.featured_image}
                        alt={article.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-[#0b1f4d] to-[#1d4ed8] flex items-center justify-center">
                        <PaperAirplaneIcon className="w-16 h-16 text-white/50 rotate-[-40deg]" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#071530]/95 via-[#0b1f4d]/45 to-transparent" />
                    <div className="absolute top-4 right-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium bg-white/95 text-[#0b1f4d] shadow ${fontClass}`} style={{ fontFamily: font }}>
                        {category?.name}
                      </span>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 text-white">
                      <h2 className={`text-xl sm:text-2xl font-bold leading-snug mb-3 line-clamp-3 ${fontClass}`} style={{ fontFamily: font }}>
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
                        <span className="inline-flex items-center gap-1 text-sky-200">
                          {language === 'fa' ? 'ادامه مطلب' : 'Read'}
                          <ArrowLeftIcon className="w-3.5 h-3.5" />
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
      </section>
    </div>
  );
};

export default CategoryArticlesPage;
