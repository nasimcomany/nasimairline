/**
 * Gallery Service - API calls for gallery, hero slider, and homepage sections
 */
import api from './api';

export interface HomePageSectionItem {
  id: number;
  uuid?: string;
  section_type: 'SPECIAL_SERVICE' | 'EXPERIENCE' | 'SURVEY' | 'FAQ' | 'POPULAR_ROUTES' | string;
  title_fa: string;
  title_ar: string;
  title_en: string;
  description_fa?: string;
  description_ar?: string;
  description_en?: string;
  image_url: string | null;
  link_url: string;
  order: number;
  is_active: boolean;
}

export interface HomePageSectionConfig {
  id: number;
  uuid: string;
  section_type: string;
  title1_fa: string;
  title1_ar: string;
  title1_en: string;
  title2_fa: string;
  title2_ar: string;
  title2_en: string;
  title3_fa: string;
  title3_ar: string;
  title3_en: string;
}

export interface HeroSlider {
  id: number;
  uuid: string;
  title: string;
  image: string;
  image_url: string;
  alt_text?: string;
  order: number;
  is_active: boolean;
  link_url?: string;
  created_by?: number;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Get active hero slider images for homepage
 */
export const getHeroSliders = async (): Promise<HeroSlider[]> => {
  try {
    const response = await api.get<HeroSlider[]>('/gallery/hero-sliders/active/');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching hero sliders:', error);
    return [];
  }
};

/**
 * Get homepage section items grouped by section
 */
export const getHomePageSectionItems = async (): Promise<{
  special_services: HomePageSectionItem[];
  experience: HomePageSectionItem[];
  survey: HomePageSectionItem[];
  faq: HomePageSectionItem[];
  popular_routes: HomePageSectionItem[];
}> => {
  try {
    const response = await api.get<{
      special_services: HomePageSectionItem[];
      experience: HomePageSectionItem[];
      survey?: HomePageSectionItem[];
      faq?: HomePageSectionItem[];
      popular_routes?: HomePageSectionItem[];
    }>('/gallery/homepage-section-items/all/');
    return {
      special_services: response.data.special_services || [],
      experience: response.data.experience || [],
      survey: response.data.survey || [],
      faq: response.data.faq || [],
      popular_routes: response.data.popular_routes || [],
    };
  } catch (error) {
    console.error('Error fetching homepage section items:', error);
    return {
      special_services: [],
      experience: [],
      survey: [],
      faq: [],
      popular_routes: [],
    };
  }
};

/**
 * Get homepage section configs (titles)
 */
export const getHomePageSectionConfigs = async (): Promise<Record<string, HomePageSectionConfig>> => {
  try {
    const response = await api.get<Record<string, HomePageSectionConfig>>(
      '/gallery/homepage-section-configs/all/'
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching homepage section configs:', error);
    return {};
  }
};

const galleryService = {
  getHeroSliders,
  getHomePageSectionItems,
  getHomePageSectionConfigs,
};

export default galleryService;
