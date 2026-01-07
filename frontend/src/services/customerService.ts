/**
 * Customer Service API
 */
import api from './api';

export interface CustomerTierInfo {
  current_tier: 'GOLD' | 'SILVER' | 'BRONZE';
  current_tier_display: string;
  metrics: {
    total_purchase_amount: number;
    total_bookings_count: number;
    monthly_purchase_amount: number;
    days_since_registration: number;
    days_since_last_purchase: number;
  };
  next_tier: 'GOLD' | 'SILVER' | 'BRONZE' | null;
  next_tier_display: string | null;
  next_tier_requirements: Array<{
    criteria_type: string;
    operator: string;
    required_value: number;
    current_value: number;
    met: boolean;
  }>;
}

class CustomerService {
  /**
   * Get current user's tier information
   */
  async getMyTier(): Promise<CustomerTierInfo> {
    const response = await api.get('/customer-service/tier/my_tier/');
    return response.data;
  }

  /**
   * Get chat sessions for current user
   */
  async getChatSessions() {
    const response = await api.get('/customer-service/chat/sessions/');
    return response.data;
  }

  /**
   * Create a new chat session
   */
  async createChatSession(data: {
    guest_name?: string;
    guest_email?: string;
  }) {
    const response = await api.post('/customer-service/chat/sessions/', data);
    return response.data;
  }

  /**
   * Get messages for a chat session
   */
  async getChatMessages(sessionId: string) {
    const response = await api.get(`/customer-service/chat/sessions/${sessionId}/messages/`);
    return response.data;
  }

  /**
   * Send a message in a chat session
   */
  async sendChatMessage(sessionId: string, message: string) {
    const response = await api.post(`/customer-service/chat/sessions/${sessionId}/send_message/`, {
      message,
    });
    return response.data;
  }
}

export default new CustomerService();

