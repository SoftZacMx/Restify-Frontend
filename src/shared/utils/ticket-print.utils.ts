/**
 * Utilidades para imprimir tickets (58mm, letra grande para legibilidad)
 * Guía: prompts/tickets-frontend-guide.md
 */

import type { KitchenTicketResponse, SaleTicketResponse } from '@/domain/types/ticket.types';
import { formatCurrency } from './order.utils';

/** Ancho papel térmico en mm */
const TICKET_WIDTH_MM = 58;

/**
 * Prioridad claridad: etiquetas explícitas (Platillo, Extras, Nota), costo al lado de cada cosa.
 * - Labels claros: "Platillo:", "Extras:", "Nota:", "Subtotal:", "Total:", etc.
 * - Cada línea con costo muestra el monto alineado a la derecha.
 * - Bloques separados por regla para distinguir un producto de otro.
 */
const BASE_STYLES = `
  * { box-sizing: border-box; }
  body { margin: 0; padding: 10px 8px; font-family: Arial, sans-serif; }
  .ticket { width: ${TICKET_WIDTH_MM}mm; max-width: ${TICKET_WIDTH_MM}mm; }
  .rule { border: none; border-top: 1px solid #000; margin: 10px 0 8px 0; }
  .head { font-size: 16pt; font-weight: bold; text-align: center; line-height: 1.4; margin-bottom: 4px; }
  .head-sub { font-size: 14pt; text-align: center; margin: 2px 0; }
  .label { font-size: 11pt; font-weight: bold; text-transform: uppercase; color: #333; margin-bottom: 2px; }
  .row { font-size: 15pt; line-height: 1.5; margin: 4px 0; display: flex; justify-content: space-between; align-items: baseline; gap: 6px; }
  .row-desc { flex: 1; min-width: 0; word-break: break-word; }
  .row-amt { flex-shrink: 0; text-align: right; font-variant-numeric: tabular-nums; }
  .line { font-size: 15pt; line-height: 1.5; margin: 4px 0; }
  .extra-row { font-size: 14pt; line-height: 1.45; margin: 3px 0 3px 12px; display: flex; justify-content: space-between; align-items: baseline; gap: 6px; }
  .extra-desc { flex: 1; min-width: 0; }
  .extra-amt { flex-shrink: 0; text-align: right; font-variant-numeric: tabular-nums; }
  .note-line { font-size: 14pt; line-height: 1.45; margin: 3px 0 3px 12px; font-style: italic; }
  .item-block { margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px dashed #000; }
  .item-block:last-of-type { border-bottom: none; }
  .totals-section .row { margin: 6px 0; }
  .total-final { font-size: 17pt; font-weight: bold; margin-top: 8px; padding-top: 6px; border-top: 2px solid #000; }
  .foot { text-align: center; margin-top: 14px; padding-top: 8px; border-top: 1px solid #000; font-size: 14pt; }
  .bold { font-weight: bold; }
  @media print { body { padding: 8px; } .ticket { width: ${TICKET_WIDTH_MM}mm !important; max-width: ${TICKET_WIDTH_MM}mm !important; } }
`;

function escapeHtml(text: string): string {
  const el = document.createElement('div');
  el.textContent = text;
  return el.innerHTML;
}

/**
 * Ticket cocina: claridad — etiquetas explícitas Platillo, Extras, Nota por cada ítem.
 */
export function buildKitchenTicketHtml(data: KitchenTicketResponse): string {
  const tableText = data.tableNumber != null ? `Mesa ${data.tableNumber}` : 'Sin mesa';
  const orderShortId = data.orderId.slice(-8).toUpperCase();

  let itemsHtml = '';
  for (const item of data.items) {
    itemsHtml += '<div class="item-block">';
    itemsHtml += '<div class="label">Platillo</div>';
    itemsHtml += `<div class="line bold">${escapeHtml(item.name)} × ${item.quantity}</div>`;
    if (item.extras?.length) {
      itemsHtml += '<div class="label" style="margin-top:6px;">Extras</div>';
      for (const ex of item.extras) {
        itemsHtml += `<div class="extra-row"><span class="extra-desc">• ${escapeHtml(ex.name)} × ${ex.quantity}</span></div>`;
      }
    }
    if (item.note) {
      itemsHtml += '<div class="label" style="margin-top:6px;">Nota</div>';
      itemsHtml += `<div class="note-line">${escapeHtml(item.note)}</div>`;
    }
    itemsHtml += '</div>';
  }

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${BASE_STYLES}</style></head><body>
<div class="ticket">
  <div class="head">COCINA — Orden #${orderShortId}</div>
  <div class="head-sub">${escapeHtml(tableText)}</div>
  <hr class="rule" />
  <div class="label">Pedido</div>
  ${itemsHtml}
</div>
</body></html>`;
}

/**
 * Ticket cliente: claridad — Platillo/Extras/Nota con costo al lado de cada cosa; totales etiquetados.
 */
export function buildSaleTicketHtml(data: SaleTicketResponse): string {
  const companyName = data.companyName?.trim() || 'Restify';
  const tableText = data.tableNumber != null ? `Mesa ${data.tableNumber}` : 'Sin mesa';
  const orderShortId = data.orderId.slice(-8).toUpperCase();
  const dateFormatted = new Date(data.date).toLocaleString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  let itemsHtml = '';
  for (const item of data.items) {
    itemsHtml += '<div class="item-block">';
    itemsHtml += '<div class="label">Platillo</div>';
    itemsHtml += `<div class="row"><span class="row-desc">${escapeHtml(item.name)} × ${item.quantity}</span><span class="row-amt">${formatCurrency(item.lineTotal)}</span></div>`;
    if (item.extras?.length) {
      itemsHtml += '<div class="label" style="margin-top:6px;">Extras (costo de cada uno)</div>';
      for (const ex of item.extras) {
        const extraCost = ex.price * ex.quantity;
        itemsHtml += `<div class="extra-row"><span class="extra-desc">• ${escapeHtml(ex.name)} × ${ex.quantity}</span><span class="extra-amt">${formatCurrency(extraCost)}</span></div>`;
      }
    }
    if (item.note) {
      itemsHtml += '<div class="label" style="margin-top:6px;">Nota</div>';
      itemsHtml += `<div class="note-line">${escapeHtml(item.note)}</div>`;
    }
    itemsHtml += '</div>';
  }

  const clientLine = data.client ? `<div class="line"><span class="label">Cliente</span> ${escapeHtml(data.client)}</div>` : '';
  const noteOrder = data.note ? `<div class="line"><span class="label">Nota de la orden</span> ${escapeHtml(data.note)}</div>` : '';
  const deliveredText = data.delivered ? 'Entregado' : 'Pendiente';

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${BASE_STYLES}</style></head><body>
<div class="ticket">
  <div class="head">${escapeHtml(companyName)}</div>
  <div class="head-sub">TICKET DE VENTA #${orderShortId}</div>
  <div class="head-sub">${escapeHtml(dateFormatted)}</div>
  <div class="head-sub">${escapeHtml(tableText)}</div>
  ${clientLine}
  ${noteOrder}
  <hr class="rule" />
  <div class="label">Consumo (producto y costo por línea)</div>
  ${itemsHtml}
  <hr class="rule" />
  <div class="label">Totales</div>
  <div class="totals-section">
    <div class="row"><span class="row-desc">Subtotal</span><span class="row-amt">${formatCurrency(data.subtotal)}</span></div>
    <div class="row"><span class="row-desc">IVA</span><span class="row-amt">${formatCurrency(data.iva)}</span></div>
    ${data.tip > 0 ? `<div class="row"><span class="row-desc">Propina</span><span class="row-amt">${formatCurrency(data.tip)}</span></div>` : ''}
    <div class="row total-final"><span class="row-desc">Total</span><span class="row-amt">${formatCurrency(data.total)}</span></div>
  </div>
  <hr class="rule" />
  <div class="line"><span class="label">Pago</span> ${escapeHtml(data.paymentMethod)}</div>
  <div class="line"><span class="label">Estado</span> ${escapeHtml(deliveredText)}</div>
  <div class="foot">Gracias por su compra</div>
</div>
</body></html>`;
}

/**
 * Abre el HTML del ticket en un iframe y dispara la impresión (58mm)
 */
export function printTicketHtml(html: string): void {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    document.body.removeChild(iframe);
    return;
  }
  doc.open();
  doc.write(html);
  doc.close();

  iframe.contentWindow?.focus();
  iframe.contentWindow?.print();
  // Quitar el iframe después de un momento (el diálogo de impresión puede estar abierto)
  setTimeout(() => {
    if (document.body.contains(iframe)) {
      document.body.removeChild(iframe);
    }
  }, 1000);
}
