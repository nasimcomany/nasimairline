import api from './api';

export interface CreateBookingRequest {
  flight_data: any;
  passengers: any[];
  contact_info: {
    phone: string;
    email: string;
  };
  total_amount: number;
  cabin_class?: string;
  payment_ref_id?: string;
}

export interface CreateBookingResponse {
  booking: {
    id: number;
    uuid: string;
    booking_reference: string;
    status: string;
  };
  payment: {
    id: number;
    uuid: string;
    transaction_id: string;
    status: string;
  };
}

class BookingService {
  /**
   * Create booking and payment after successful payment
   */
  async createBookingAfterPayment(data: CreateBookingRequest): Promise<CreateBookingResponse> {
    const response = await api.post('/bookings/bookings/create_after_payment/', data);
    return response.data;
  }
}

const bookingServiceInstance = new BookingService();
export default bookingServiceInstance;
