/**
 * Ticket Service for support system
 */
import api from './api';

export interface TicketCategory {
  uuid: string;
  name: string;
  slug: string;
  description?: string;
  is_active: boolean;
  order: number;
}

export interface Ticket {
  uuid: string;
  reference: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  source: string;
  created_at: string;
  updated_at: string;
  user_info?: {
    email: string;
    full_name: string;
    phone?: string;
    membership_level: string;
    loyalty_points: number;
  };
  is_overdue?: boolean;
  message_count?: number;
  unread_message_count?: number;
}

export interface TicketMessage {
  uuid: string;
  message: string;
  message_type: string;
  is_read: boolean;
  is_internal: boolean;
  created_at: string;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  };
}

export interface CreateTicketData {
  title: string;
  description: string;
  category: 'HR' | 'FEEDBACK' | 'MISC' | 'SECURITY' | 'BOOKING' | 'FLIGHT' | 'PAYMENT' | 'OTHER';
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT' | 'CRITICAL';
  source?: 'WEB' | 'MOBILE' | 'PHONE' | 'EMAIL' | 'CHAT';
  related_booking?: number;
  related_flight?: number;
}

export interface SecurityContactInfo {
  phone: string;
  department: string;
  message: string;
}

export const ticketService = {
  /**
   * Get all ticket categories
   */
  getCategories: async (): Promise<TicketCategory[]> => {
    const response = await api.get<any>('/support/categories/');
    // Handle paginated response or direct array
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return response.data.results || [];
  },

  /**
   * Get user's tickets
   */
  getMyTickets: async (): Promise<Ticket[]> => {
    const response = await api.get<any>('/support/tickets/my_tickets/');
    // Handle paginated response or direct array
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return response.data.results || [];
  },

  /**
   * Get ticket by ID
   */
  getTicket: async (id: number): Promise<Ticket> => {
    const response = await api.get<Ticket>(`/support/tickets/${id}/`);
    return response.data;
  },

  /**
   * Create new ticket
   */
  createTicket: async (data: CreateTicketData): Promise<Ticket> => {
    const response = await api.post<Ticket>('/support/tickets/', {
      ...data,
      source: data.source || 'WEB',
      priority: data.priority || 'NORMAL',
    });
    return response.data;
  },

  /**
   * Get messages for a ticket
   */
  getTicketMessages: async (ticketId: number): Promise<TicketMessage[]> => {
    const response = await api.get<any>(`/support/tickets/${ticketId}/messages/`);
    // Handle paginated response or direct array
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return response.data.results || [];
  },

  /**
   * Add message to ticket
   */
  addMessage: async (ticketId: number, message: string): Promise<TicketMessage> => {
    const response = await api.post<TicketMessage>(`/support/tickets/${ticketId}/add_message/`, {
      message,
    });
    return response.data;
  },

  /**
   * Get security contact information
   */
  getSecurityContact: async (): Promise<SecurityContactInfo> => {
    const response = await api.get<SecurityContactInfo>('/support/security/contact/');
    return response.data;
  },
};

