import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export interface PaymentRequest {
  amount: number;
  description: string;
  email: string;
  mobile: string;
  callbackUrl: string;
}

export interface PaymentResponse {
  authority: string;
  gatewayUrl: string;
}

export interface VerifyPaymentRequest {
  authority: string;
  amount: number;
}

export interface VerifyPaymentResponse {
  refId: string;
  status: 'success' | 'failed';
}

class PaymentService {
  // Request payment from ZarinPal
  async requestPayment(data: PaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await axios.post(`${API_URL}/payment/request/`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'خطا در ارتباط با درگاه پرداخت');
    }
  }

  // Verify payment
  async verifyPayment(data: VerifyPaymentRequest): Promise<VerifyPaymentResponse> {
    try {
      const response = await axios.post(`${API_URL}/payment/verify/`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'خطا در تایید پرداخت');
    }
  }

  // Redirect to ZarinPal gateway
  redirectToGateway(authority: string) {
    // ZarinPal sandbox for testing
    const gatewayUrl = `https://sandbox.zarinpal.com/pg/StartPay/${authority}`;
    window.location.href = gatewayUrl;
  }
}

export const paymentService = new PaymentService();

