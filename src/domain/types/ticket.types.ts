/**
 * Tipos para tickets de impresión (guía tickets-frontend-guide)
 * Kitchen ticket (cocina) y Sale ticket (cliente)
 */

/** Extra en ticket de cocina (solo nombre y cantidad) */
export interface KitchenTicketExtraItem {
  name: string;
  quantity: number;
}

/** Ítem de orden en ticket de cocina */
export interface KitchenTicketOrderItem {
  name: string;
  quantity: number;
  extras: KitchenTicketExtraItem[];
  note?: string | null;
}

/** Respuesta GET /api/orders/:order_id/ticket/kitchen-ticket */
export interface KitchenTicketResponse {
  orderId: string;
  tableName: string | null;
  items: KitchenTicketOrderItem[];
}

/** Extra en ticket de venta (cliente): nombre, cantidad, precio */
export interface SaleTicketExtraItem {
  name: string;
  quantity: number;
  price: number;
}

/** Ítem de orden en ticket de venta (cliente) */
export interface SaleTicketOrderItem {
  name: string;
  quantity: number;
  price: number;
  lineTotal: number;
  extras: SaleTicketExtraItem[];
  note?: string | null;
}

/** Respuesta GET /api/orders/:order_id/ticket/sale-ticket */
export interface SaleTicketResponse {
  companyName?: string;
  /** Nombre de sucursal o marca (ej. DELIYUNOS) — opcional, si no hay se usa solo companyName */
  companyBranch?: string | null;
  companyRfc?: string | null;
  companyAddress?: string | null;
  companyPhone?: string | null;
  companyWebsite?: string | null;
  orderId: string;
  date: string;
  tableName: string | null;
  client: string | null;
  note: string | null;
  items: SaleTicketOrderItem[];
  subtotal: number;
  iva: number;
  tip: number;
  total: number;
  paymentMethod: string;
  delivered: boolean;
}
