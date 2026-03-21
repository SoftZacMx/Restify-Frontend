/**
 * Tipos para el módulo de configuración de la compañía
 */

import type { ResolvedTicketPrintConfig } from '@/shared/utils/ticket-print-config';

export interface CompanyResponse {
  id: string;
  name: string;
  state: string;
  city: string;
  street: string;
  exteriorNumber: string;
  phone: string;
  rfc: string | null;
  logoUrl: string | null;
  startOperations: string | null;
  endOperations: string | null;
  /** Config de tickets (fusionada con defaults en API) */
  ticketConfig?: ResolvedTicketPrintConfig;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertCompanyRequest {
  name: string;
  state: string;
  city: string;
  street: string;
  exteriorNumber: string;
  phone: string;
  rfc?: string | null;
  logoUrl?: string | null;
  startOperations?: string | null;
  endOperations?: string | null;
  ticketConfig?: ResolvedTicketPrintConfig | null;
}
