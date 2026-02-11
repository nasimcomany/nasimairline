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

// New Membership System Interface
export interface MembershipStatus {
  user_uuid: string;
  user_email: string;
  user_name: string;
  current_tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  current_tier_display: string;
  total_bookings: number;
  total_completed_flights: number;
  bookings_last_7_days: number;
  bookings_last_30_days: number;
  active_months_count: number;
  membership_duration_days: number;
  next_tier: string | null;
  next_tier_display: string | null;
  progress_to_next_tier: {
    [key: string]: {
      current: number;
      required: number;
      percentage: number;
    };
  } | null;
  current_tier_config: any | null;
  last_upgrade: any | null;
}

class CustomerService {
  /**
   * Get current user's tier information (Old system - based on purchase amount)
   */
  async getMyTier(): Promise<CustomerTierInfo> {
    const response = await api.get('/customer-service/tier/my_tier/');
    return response.data;
  }

  /**
   * Get current user's membership status (New system - based on activity)
   */
  async getMembershipStatus(): Promise<MembershipStatus> {
    const response = await api.get('/accounts/membership/my-status/');
    return response.data;
  }

  /**
   * Check if user can be upgraded
   */
  async checkMembershipUpgrade() {
    const response = await api.post('/accounts/membership/check-upgrade/');
    return response.data;
  }

  /**
   * Get all membership tiers configuration
   */
  async getMembershipTiers() {
    const response = await api.get('/accounts/membership/tiers/');
    return response.data;
  }

  /**
   * Get user's membership upgrade history
   */
  async getMembershipUpgradeHistory() {
    const response = await api.get('/accounts/membership/upgrade-history/');
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

