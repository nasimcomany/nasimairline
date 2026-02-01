/**
 * Gallery Service - API calls for gallery and hero slider
 */
import api from './api';

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

const galleryService = {
  getHeroSliders,
};

export default galleryService;
