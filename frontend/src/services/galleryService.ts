/**
 * Gallery Service - API calls for gallery, hero slider, and homepage sections
 */
import api from './api';

export interface HomePageSectionItem {
  id: number;
  uuid?: string;
  section_type: 'SPECIAL_SERVICE' | 'EXPERIENCE';
  title_fa: string;
  title_ar: string;
  title_en: string;
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
    console.log('Calling API: /gallery/hero-sliders/active/');
    const response = await api.get<HeroSlider[]>('/gallery/hero-sliders/active/');
    console.log('API Response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching hero sliders:', error);
    console.error('Error details:', error.response?.data);
    console.error('Status:', error.response?.status);
    // Return empty array on error to prevent breaking the homepage
    return [];
  }
};

/**
 * Get homepage section items (Special Services + Experience)
 */
export const getHomePageSectionItems = async (): Promise<{
  special_services: HomePageSectionItem[];
  experience: HomePageSectionItem[];
}> => {
  try {
    const response = await api.get<{ special_services: HomePageSectionItem[]; experience: HomePageSectionItem[] }>(
      '/gallery/homepage-section-items/all/'
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching homepage section items:', error);
    return { special_services: [], experience: [] };
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
