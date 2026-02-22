/**
 * Survey Form Service - فرم نظرسنجی
 */
import api from './api';

export interface SurveyFormData {
  full_name: string;
  seat_number?: string;
  age?: string;
  education?: string;
  flight_number: string;
  contact_number: string;
  email?: string;
  flight_route?: string;
  ticketing_website?: string;
  trips_with_nasim?: string;
  annual_flights?: string;
  travel_purpose?: string;
  nasim_choice_reason?: string;
  station_staff_rating?: string;
  cabin_hygiene_rating?: string;
  seat_comfort_rating?: string;
  cabin_temp_rating?: string;
  attendants_service_rating?: string;
  attendants_appearance_rating?: string;
  sound_system_rating?: string;
  catering_quality_rating?: string;
  pilot_communication_rating?: string;
  on_time_rating?: string;
  vs_domestic_rating?: string;
  recommend_nasim?: string;
  suggestions?: string;
  language?: 'fa' | 'en' | 'ar';
}

export const surveyService = {
  submitSurvey: async (data: SurveyFormData) => {
    const response = await api.post('/support/surveys/submit/', data, { timeout: 30000 });
    return response.data;
  },
};
