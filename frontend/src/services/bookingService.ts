import api from './api';

export interface InitiatePaymentRequest {
  flight_data: any;
  passengers: any[];
  contact_info: {
    phone: string;
    email: string;
  };
  total_amount: number;
  cabin_class?: string;
}

export interface InitiatePaymentResponse {
  success: boolean;
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
   * Create booking/payment intent immediately on pay click
   */
  async initiatePayment(data: InitiatePaymentRequest): Promise<InitiatePaymentResponse> {
    const response = await api.post('/bookings/bookings/initiate-payment/', data);
    return response.data;
  }

  /**
   * Mark pending payment as completed after gateway verification
   */
  async confirmPayment(paymentId: number, gatewayTransactionId?: string) {
    const response = await api.post(`/payments/payments/${paymentId}/process_payment/`, {
      gateway_transaction_id: gatewayTransactionId,
    });
    return response.data;
  }
}

const bookingServiceInstance = new BookingService();
export default bookingServiceInstance;
