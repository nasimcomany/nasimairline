import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import EmiratesHeader from '../components/Layout/EmiratesHeader';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../services/api';
import {
  PhotoIcon,
  EyeIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  TagIcon,
  CalendarDaysIcon,
  UserIcon,
  ArrowDownTrayIcon,
  ShareIcon
} from '@heroicons/react/24/outline';

interface GalleryImage {
  id: number;
  uuid: string;
  title: string;
  slug: string;
  description?: string;
  image_url: string;
  thumbnail_url?: string;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  category_name?: string;
  album?: {
    id: number;
    title: string;
    slug: string;
  };
  album_title?: string;
  author_name?: string;
  author_email?: string;
  media_type: string;
  file_size_mb?: number;
  width?: number;
  height?: number;
  is_featured: boolean;
  is_pinned: boolean;
  view_count: number;
  download_count: number;
  alt_text?: string;
  published_at: string;
  created_at: string;
}

const GalleryPage: React.FC = () => {
  const { t, fontClass, language } = useLanguage();
  const navigate = useNavigate();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [featuredImages, setFeaturedImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<Array<{ id: number; name: string; slug: string }>>([]);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  useEffect(() => {
    fetchImages();
    fetchFeaturedImages();
    fetchCategories();
  }, [currentPage, selectedCategory, searchQuery]);

  const fetchImages = async () => {
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

      const response = await api.get('/gallery/images/', { params });
      
      if (response.data.results) {
        setImages(response.data.results);
        setTotalPages(Math.ceil(response.data.count / 12));
      } else {
        setImages(response.data);
      }
      setError(null);
    } catch (err: any) {
      console.error('Error fetching images:', err);
      setError(err.response?.data?.detail || 'خطا در دریافت تصاویر');
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedImages = async () => {
    try {
      const response = await api.get('/gallery/images/featured/');
      if (response.data.results) {
        setFeaturedImages(response.data.results.slice(0, 6));
      } else {
        setFeaturedImages(response.data.slice(0, 6));
      }
    } catch (err) {
      console.error('Error fetching featured images:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/gallery/categories/');
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

  const openModal = (image: GalleryImage) => {
    setSelectedImage(image);
    // Increment view count
    if (image.slug) {
      api.post(`/gallery/images/${image.slug}/increment_view/`).catch(err => console.error('Error incrementing view:', err));
    }
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const shareImage = () => {
    if (selectedImage) {
      if (navigator.share) {
        navigator.share({
          title: selectedImage.title,
          text: selectedImage.description || selectedImage.title,
          url: window.location.href
        });
      } else {
        navigator.clipboard.writeText(window.location.href);
        alert(language === 'fa' ? 'لینک کپی شد' : language === 'ar' ? 'تم نسخ الرابط' : 'Link copied');
      }
    }
  };

  const downloadImage = async () => {
    if (selectedImage) {
      try {
        // Increment download count
        if (selectedImage.slug) {
          await api.post(`/gallery/images/${selectedImage.slug}/increment_download/`);
        }
        // Download image
        const link = document.createElement('a');
        link.href = selectedImage.image_url;
        link.download = selectedImage.title;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error('Error downloading image:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <EmiratesHeader />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-cyan-900 via-blue-800 to-indigo-900 text-white py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <PhotoIcon className="w-16 h-16 sm:w-20 sm:h-20 text-cyan-300" />
            </div>
            <h1
              className={`text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 ${fontClass}`}
              style={{
                fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif",
                direction: language === 'en' ? 'ltr' : 'rtl'
              }}
            >
              {language === 'fa' ? 'گالری عکس هواپیمایی نسیم' : language === 'ar' ? 'معرض صور نسيم إير' : 'Nasim Air Photo Gallery'}
            </h1>
            <p
              className={`text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto ${fontClass}`}
              style={{
                fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif",
                direction: language === 'en' ? 'ltr' : 'rtl'
              }}
            >
              {language === 'fa' 
                ? 'مجموعه‌ای از تصاویر زیبا و خاطره‌انگیز از هواپیماها، مقاصد و تجربیات سفر' 
                : language === 'ar' 
                ? 'مجموعة من الصور الجميلة والخلابة للطائرات والوجهات وتجارب السفر' 
                : 'A collection of beautiful and memorable images of aircraft, destinations and travel experiences'}
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
                placeholder={language === 'fa' ? 'جستجوی تصاویر...' : language === 'ar' ? 'البحث عن الصور...' : 'Search images...'}
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

      {/* Featured Images */}
      {featuredImages.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2
              className={`text-2xl sm:text-3xl font-bold mb-8 text-gray-900 ${fontClass}`}
              style={{
                fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif",
                direction: language === 'en' ? 'ltr' : 'rtl'
              }}
            >
              {language === 'fa' ? 'تصاویر ویژه' : language === 'ar' ? 'صور مميزة' : 'Featured Images'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredImages.map((image, index) => (
                <div
                  key={image.id}
                  onClick={() => openModal(image)}
                  className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
                >
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={image.image_url || image.thumbnail_url || getDefaultImage(index)}
                      alt={image.alt_text || image.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getDefaultImage(index);
                      }}
                    />
                    <div className="absolute top-4 left-4 bg-cyan-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {language === 'fa' ? 'ویژه' : language === 'ar' ? 'مميز' : 'Featured'}
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <EyeIcon className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      {image.category_name && (
                        <>
                          <TagIcon className="w-4 h-4" />
                          <span>{image.category_name}</span>
                        </>
                      )}
                    </div>
                    <h3
                      className={`text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 ${fontClass}`}
                      style={{
                        fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif",
                        direction: language === 'en' ? 'ltr' : 'rtl'
                      }}
                    >
                      {image.title}
                    </h3>
                    {image.description && (
                      <p
                        className={`text-gray-600 mb-4 line-clamp-2 ${fontClass}`}
                        style={{
                          fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif",
                          direction: language === 'en' ? 'ltr' : 'rtl'
                        }}
                      >
                        {image.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <EyeIcon className="w-4 h-4" />
                        <span>{image.view_count}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarDaysIcon className="w-4 h-4" />
                        <span>{formatDate(image.published_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Images */}
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
          ) : images.length === 0 ? (
            <div className="text-center py-20">
              <PhotoIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p
                className={`text-gray-600 ${fontClass}`}
                style={{
                  fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif"
                }}
              >
                {language === 'fa' ? 'تصویری یافت نشد' : language === 'ar' ? 'لم يتم العثور على صور' : 'No images found'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {images.map((image, index) => (
                  <div
                    key={image.id}
                    onClick={() => openModal(image)}
                    className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
                  >
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={image.image_url || image.thumbnail_url || getDefaultImage(index)}
                        alt={image.alt_text || image.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = getDefaultImage(index);
                        }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <EyeIcon className="w-12 h-12 text-white" />
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        {image.category_name && (
                          <>
                            <TagIcon className="w-4 h-4" />
                            <span>{image.category_name}</span>
                          </>
                        )}
                      </div>
                      <h3
                        className={`text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 ${fontClass}`}
                        style={{
                          fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif",
                          direction: language === 'en' ? 'ltr' : 'rtl'
                        }}
                      >
                        {image.title}
                      </h3>
                      {image.description && (
                        <p
                          className={`text-gray-600 mb-4 line-clamp-2 ${fontClass}`}
                          style={{
                            fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif",
                            direction: language === 'en' ? 'ltr' : 'rtl'
                          }}
                        >
                          {image.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <EyeIcon className="w-4 h-4" />
                          <span>{image.view_count}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ArrowDownTrayIcon className="w-4 h-4" />
                          <span>{image.download_count}</span>
                        </div>
                      </div>
                    </div>
                  </div>
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

      {/* Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            onClick={closeModal}
          ></div>
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all"
              style={{ [language === 'en' ? 'right' : 'left']: '1rem' }}
            >
              <XMarkIcon className="w-6 h-6 text-gray-700" />
            </button>

            {/* Image */}
            <div className="relative">
              <img 
                src={selectedImage.image_url || getDefaultImage(0)}
                alt={selectedImage.alt_text || selectedImage.title}
                className="w-full h-auto"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = getDefaultImage(0);
                }}
              />
            </div>

            {/* Image Info */}
            <div className="p-6">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                {selectedImage.category_name && (
                  <>
                    <TagIcon className="w-4 h-4" />
                    <span>{selectedImage.category_name}</span>
                  </>
                )}
              </div>
              <h2
                className={`text-2xl font-bold text-gray-900 mb-4 ${fontClass}`}
                style={{
                  fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif",
                  direction: language === 'en' ? 'ltr' : 'rtl'
                }}
              >
                {selectedImage.title}
              </h2>
              {selectedImage.description && (
                <p
                  className={`text-gray-600 mb-6 ${fontClass}`}
                  style={{
                    fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif",
                    direction: language === 'en' ? 'ltr' : 'rtl'
                  }}
                >
                  {selectedImage.description}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-6">
                {selectedImage.author_name && (
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-5 h-5" />
                    <span>{selectedImage.author_name}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <CalendarDaysIcon className="w-5 h-5" />
                  <span>{formatDate(selectedImage.published_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <EyeIcon className="w-5 h-5" />
                  <span>{selectedImage.view_count} {language === 'fa' ? 'بازدید' : language === 'ar' ? 'مشاهدة' : 'views'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowDownTrayIcon className="w-5 h-5" />
                  <span>{selectedImage.download_count} {language === 'fa' ? 'دانلود' : language === 'ar' ? 'تحميل' : 'downloads'}</span>
                </div>
                {selectedImage.width && selectedImage.height && (
                  <div className="flex items-center gap-2">
                    <PhotoIcon className="w-5 h-5" />
                    <span>{selectedImage.width} × {selectedImage.height}</span>
                  </div>
                )}
                {selectedImage.file_size_mb && (
                  <div className="flex items-center gap-2">
                    <span>{selectedImage.file_size_mb.toFixed(2)} MB</span>
                  </div>
                )}
              </div>
              <div className="flex gap-4">
                <button
                  onClick={downloadImage}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <ArrowDownTrayIcon className="w-5 h-5" />
                  <span className={fontClass} style={{ fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif" }}>
                    {language === 'fa' ? 'دانلود' : language === 'ar' ? 'تحميل' : 'Download'}
                  </span>
                </button>
                <button
                  onClick={shareImage}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <ShareIcon className="w-5 h-5" />
                  <span className={fontClass} style={{ fontFamily: language === 'fa' ? "'Vazirmatn', sans-serif" : language === 'en' ? 'Arial, sans-serif' : "'Noto Sans Arabic', sans-serif" }}>
                    {language === 'fa' ? 'اشتراک‌گذاری' : language === 'ar' ? 'مشاركة' : 'Share'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryPage;
