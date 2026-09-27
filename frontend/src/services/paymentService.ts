import axios from 'axios';
import { getApiBaseUrl } from '../utils/apiBase';

const API_URL = getApiBaseUrl();

export interface PaymentRequest {
  amount: number;
  description: string;
  email: string;
  mobile: string;
  callbackUrl: string;
  gateway?: string;
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

const isLocalHost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

class PaymentService {
  async requestPayment(data: PaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await axios.post(`${API_URL}/payment/request/`, data);
      return response.data;
    } catch (error: any) {
      // Mock فقط در محیط توسعه محلی
      if (isLocalHost && process.env.NODE_ENV === 'development') {
        console.warn('Payment backend unavailable — using local mock');
        return this.mockPaymentRequest(data);
      }
      throw error;
    }
  }

  private mockPaymentRequest(data: PaymentRequest): Promise<PaymentResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const authority = 'A' + Math.random().toString(36).substring(2, 15).toUpperCase();
        resolve({
          authority,
          gatewayUrl: `https://sandbox.zarinpal.com/pg/StartPay/${authority}`,
        });
      }, 500);
    });
  }

  async verifyPayment(data: VerifyPaymentRequest): Promise<VerifyPaymentResponse> {
    try {
      const response = await axios.post(`${API_URL}/payment/verify/`, data);
      return response.data;
    } catch (error: any) {
      if (isLocalHost && process.env.NODE_ENV === 'development') {
        console.warn('Payment verify unavailable — using local mock');
        return this.mockPaymentVerify(data);
      }
      throw error;
    }
  }

  private mockPaymentVerify(data: VerifyPaymentRequest): Promise<VerifyPaymentResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const refId = Math.floor(Math.random() * 1000000000).toString();
        resolve({
          refId,
          status: 'success',
        });
      }, 1000);
    });
  }

  async verifyNiraReturn(params: Record<string, string>): Promise<{
    ok: boolean;
    code?: string;
    booking_reference?: string;
    pnr?: string;
    tickets?: string[];
    display_status?: string;
  }> {
    const qs = new URLSearchParams(params).toString();
    const response = await axios.get(`${API_URL}/payments/nira/return/?${qs}`);
    return response.data;
  }

  async getNiraPaymentStatus(ref: string): Promise<{
    ok: boolean;
    confirmed?: boolean;
    booking_reference?: string;
    booking_status?: string;
    pnr?: string;
    tickets?: string[];
    payment_status?: string;
  }> {
    const response = await axios.get(`${API_URL}/payments/nira/status/`, {
      params: { ref },
    });
    return response.data;
  }

  redirectToGateway(authority: string, gateway: string = 'zarinpal') {
    const isDevelopment = process.env.NODE_ENV === 'development' && isLocalHost;

    if (isDevelopment) {
      setTimeout(() => {
        window.location.href = `${window.location.origin}/payment/verify?Authority=${authority}&Status=OK&Gateway=${gateway}`;
      }, 2000);
      return;
    }

    const gatewayUrls: Record<string, string> = {
      zarinpal: `https://sandbox.zarinpal.com/pg/StartPay/${authority}`,
      tejarat: `https://epay.tejaratbank.ir/payment/start/${authority}`,
      mellat: `https://bpm.shaparak.ir/pgwchannel/startpay.mellat?RefId=${authority}`,
      pasargad: `https://pep.shaparak.ir/payment.aspx?n=${authority}`,
      melli: `https://pg.sb24.com/payment/start/${authority}`,
      saderat: `https://sadad.shaparak.ir/VPG/Purchase?Token=${authority}`,
    };

    const gatewayUrl = gatewayUrls[gateway] || gatewayUrls.zarinpal;
    window.location.href = gatewayUrl;
  }
}

export const paymentService = new PaymentService();
export default paymentService;
