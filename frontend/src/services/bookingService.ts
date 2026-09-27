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
  /** Prevents duplicate holds on double-click */
  idempotency_key?: string;
}

export interface InitiatePaymentResponse {
  success: boolean;
  replay?: boolean;
  booking: {
    id: number;
    uuid: string;
    booking_reference: string;
    status: string;
    hold_expires_at?: string | null;
  };
  payment: {
    id: number;
    uuid: string;
    transaction_id: string;
    status: string;
  };
  /** local = our gateways; nira_redirect = airline/Nira payment UI */
  payment_mode?: 'local' | 'nira_redirect';
  payment_url?: string | null;
  nira_reserve_supported?: boolean;
  message?: string;
  error?: string;
  code?: string;
}

class BookingService {
  /**
   * Soft-hold seats (revalidate Nira Availability) + create payment intent
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
