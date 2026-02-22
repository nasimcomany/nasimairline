/**
 * Complaint Form Service - فرم انتقادات و پیشنهادات
 */
import api from './api';

export interface ComplaintFormData {
  complaint_type: string;
  complaint_subject: string;
  first_name: string;
  last_name: string;
  national_id?: string;
  mobile: string;
  email: string;
  origin?: string;
  destination?: string;
  flight_date?: string;
  ticket_number?: string;
  flight_number?: string;
  description?: string;
  language?: 'fa' | 'en' | 'ar';
}

export const complaintService = {
  submitComplaint: async (data: ComplaintFormData) => {
    const response = await api.post('/support/complaints/submit/', data, { timeout: 30000 });
    return response.data;
  },
};
