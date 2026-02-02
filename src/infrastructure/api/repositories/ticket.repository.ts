import apiClient from '../client';
import type { ApiResponse } from '@/domain/types';
import type { KitchenTicketResponse, SaleTicketResponse } from '@/domain/types/ticket.types';

/**
 * Repository para tickets de impresión (guía tickets-frontend-guide)
 * GET /api/orders/:order_id/ticket/kitchen-ticket
 * GET /api/orders/:order_id/ticket/sale-ticket
 */
export class TicketRepository {
  async getKitchenTicket(orderId: string): Promise<ApiResponse<KitchenTicketResponse>> {
    const response = await apiClient.get(`/api/orders/${orderId}/ticket/kitchen-ticket`);
    const data = response.data as ApiResponse<KitchenTicketResponse>;
    return data;
  }

  async getSaleTicket(orderId: string): Promise<ApiResponse<SaleTicketResponse>> {
    const response = await apiClient.get(`/api/orders/${orderId}/ticket/sale-ticket`);
    const data = response.data as ApiResponse<SaleTicketResponse>;
    return data;
  }
}

export const ticketRepository = new TicketRepository();
