/**
 * Servicio de tickets (cocina y venta/cliente)
 * Obtiene datos del API y dispara impresión 58mm con letra grande (guía tickets-frontend-guide)
 */

import type { KitchenTicketResponse, SaleTicketResponse } from '@/domain/types/ticket.types';
import { ticketRepository } from '@/infrastructure/api/repositories/ticket.repository';
import {
  buildKitchenTicketHtml,
  buildSaleTicketHtml,
  buildSaleTicketWithQrHtml,
  generateQrDataUrl,
  printTicketHtml,
} from '@/shared/utils/ticket-print.utils';

export class TicketService {
  async getKitchenTicket(orderId: string): Promise<KitchenTicketResponse> {
    const response = await ticketRepository.getKitchenTicket(orderId);
    if (!response.success || !response.data) {
      throw new Error('No se pudo obtener el ticket de cocina');
    }
    return response.data;
  }

  async getSaleTicket(orderId: string): Promise<SaleTicketResponse> {
    const response = await ticketRepository.getSaleTicket(orderId);
    if (!response.success || !response.data) {
      throw new Error('No se pudo obtener el ticket de venta');
    }
    return response.data;
  }

  /**
   * Obtiene el ticket de cocina, genera HTML 58mm y dispara impresión
   */
  async printKitchenTicket(orderId: string): Promise<void> {
    const data = await this.getKitchenTicket(orderId);
    const html = buildKitchenTicketHtml(data);
    printTicketHtml(html);
  }

  /**
   * Obtiene el ticket de venta (cliente), genera HTML 58mm y dispara impresión
   */
  async printSaleTicket(orderId: string): Promise<void> {
    const data = await this.getSaleTicket(orderId);
    const html = buildSaleTicketHtml(data);
    printTicketHtml(html);
  }
  /**
   * Obtiene el ticket de venta con QR de pago de Mercado Pago y dispara impresión
   */
  async printSaleTicketWithQr(orderId: string, qrUrl: string): Promise<void> {
    const data = await this.getSaleTicket(orderId);
    const qrDataUrl = await generateQrDataUrl(qrUrl);
    const html = await buildSaleTicketWithQrHtml(data, qrDataUrl);
    printTicketHtml(html);
  }
}

export const ticketService = new TicketService();
