/**
 * Safety Hazard Report Service - گزارش مخاطرات ایمنی (SHOR)
 */
import api from './api';

export interface SafetyHazardFormData {
  reporter_name: string;
  section?: string;
  tel?: string;
  report_date?: string;
  report_number?: string;
  ac_registration?: string;
  type_of_hazard?: string[];
  type_of_hazard_others?: string;
  spec_time?: string;
  spec_date?: string;
  spec_location?: string;
  hazard_description?: string;
  safety_director_decision?: string;
  director_actions?: Record<string, boolean | string>;
  director_name?: string;
  sign_and_date?: string;
  language?: 'fa' | 'en' | 'ar';
}

export const safetyHazardService = {
  submitReport: async (data: SafetyHazardFormData) => {
    const response = await api.post('/support/safety-hazard/submit/', data, { timeout: 30000 });
    return response.data;
  },
};
