/**
 * Authentication Service
 */
import api from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  phone_number?: string; // ✨ اختیاری
  captcha?: string;
  date_of_birth?: string;
  gender?: string;
  nationality?: string;
  passport_number?: string;
  passport_expiry?: string;
  national_id?: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    phone_number?: string;
    membership_level: string;
    loyalty_points: number;
  };
}

export const authService = {
  /**
   * Register new user
   */
  register: async (data: RegisterData): Promise<AuthResponse> => {
    // ✨ حذف فیلدهای captcha و phone_number (اگر خالی هستند)
    const { captcha, phone_number, ...payload } = data;
    
    // ✨ اگر شماره تلفن وجود دارد، اضافه کن
    const finalPayload = phone_number 
      ? { ...payload, phone_number }
      : payload;
    
    const response = await api.post<AuthResponse>('/auth/register/', finalPayload);
    return response.data;
  },

  /**
   * Login user
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login/', credentials);
    return response.data;
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        await api.post('/auth/logout/', { refresh: refreshToken });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  /**
   * Get current user profile
   */
  getProfile: async () => {
    const response = await api.get('/auth/profile/');
    return response.data;
  },

  /**
   * Refresh access token
   */
  refreshToken: async (): Promise<{ access: string }> => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    const response = await api.post('/auth/token/refresh/', {
      refresh: refreshToken,
    });
    return response.data;
  },
};