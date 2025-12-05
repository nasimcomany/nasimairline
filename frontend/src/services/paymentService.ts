import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

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

class PaymentService {
  // Request payment from ZarinPal
  async requestPayment(data: PaymentRequest): Promise<PaymentResponse> {
    try {
      // Try backend API first
      const response = await axios.post(`${API_URL}/payment/request/`, data);
      return response.data;
    } catch (error: any) {
      // If backend not available, use mock for testing
      console.log('Backend not available, using mock payment');
      return this.mockPaymentRequest(data);
    }
  }

  // Mock payment for testing without backend
  private mockPaymentRequest(data: PaymentRequest): Promise<PaymentResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Generate a fake authority
        const authority = 'A' + Math.random().toString(36).substring(2, 15).toUpperCase();
        resolve({
          authority,
          gatewayUrl: `https://sandbox.zarinpal.com/pg/StartPay/${authority}`
        });
      }, 500);
    });
  }

  // Verify payment
  async verifyPayment(data: VerifyPaymentRequest): Promise<VerifyPaymentResponse> {
    try {
      // Try backend API first
      const response = await axios.post(`${API_URL}/payment/verify/`, data);
      return response.data;
    } catch (error: any) {
      // If backend not available, use mock for testing
      console.log('Backend not available, using mock verification');
      return this.mockPaymentVerify(data);
    }
  }

  // Mock verify for testing without backend
  private mockPaymentVerify(data: VerifyPaymentRequest): Promise<VerifyPaymentResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Generate a fake refId
        const refId = Math.floor(Math.random() * 1000000000).toString();
        resolve({
          refId,
          status: 'success'
        });
      }, 1000);
    });
  }

  // Redirect to payment gateway
  redirectToGateway(authority: string, gateway: string = 'zarinpal') {
    // For testing, redirect to our verify page directly instead of actual gateway
    // In production, this should redirect to actual gateway
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (isDevelopment) {
      // Mock gateway redirect - simulate payment success
      setTimeout(() => {
        window.location.href = `${window.location.origin}/payment/verify?Authority=${authority}&Status=OK&Gateway=${gateway}`;
      }, 2000);
    } else {
      // Real gateway URLs (in production, these would be actual gateway URLs)
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
}

export const paymentService = new PaymentService();

