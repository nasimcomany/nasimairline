/**
 * Cabin Safety Report Service - گزارش اجباری ایمنی کابین
 */
import api from './api';

export interface CabinSafetyFormData {
  reporter_name: string;
  reporter_family: string;
  protect_personal_info?: boolean;
  occurrence_day?: string;
  occurrence_month?: string;
  occurrence_year?: string;
  time_utc?: string;
  time_local?: string;
  time_of_day?: string;
  route_from?: string;
  route_to?: string;
  ac_type?: string;
  ac_registration?: string;
  crew_count?: string;
  pax_count?: string;
  flight_number?: string;
  flight_phase?: string[];
  occurrence_type_37?: string[];
  occurrence_type_b?: string[];
  occurrence_type_c?: string[];
  occurrence_type_d?: string[];
  occurrence_type_e?: string[];
  description?: string;
  other_info_suggestions?: string;
}

export const cabinSafetyService = {
  submitReport: async (data: CabinSafetyFormData) => {
    const response = await api.post('/support/cabin-safety/submit/', data, { timeout: 30000 });
    return response.data;
  },
};
