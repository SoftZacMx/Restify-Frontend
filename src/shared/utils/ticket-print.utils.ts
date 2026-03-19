/**
 * Utilidades para imprimir tickets (58mm, letra grande para legibilidad)
 * Guía: prompts/tickets-frontend-guide.md
 * Diseño ticket de venta: RESTIFY / DELIYUNOS, contacto, TICKET DE VENTA #id, consumo, totales, pago, gracias.
 */

import type { KitchenTicketResponse, SaleTicketResponse } from '@/domain/types/ticket.types';

/** Ancho papel térmico en mm */
const TICKET_WIDTH_MM = 58;

/** Formato moneda ticket: MX$0.00 */
function ticketCurrency(amount: number): string {
  return `MX$${amount.toFixed(2)}`;
}

const BASE_STYLES = `
  @page { size: ${TICKET_WIDTH_MM}mm auto; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; width: ${TICKET_WIDTH_MM}mm; overflow-wrap: break-word; word-break: break-word; }
  body { padding: 2mm 1.5mm; font-family: Arial, sans-serif; font-size: 7pt; }
  .ticket { width: 100%; max-width: ${TICKET_WIDTH_MM}mm; overflow: hidden; }
  .rule { border: none; border-top: 1px solid #000; margin: 3px 0; }
  .head { font-size: 8pt; font-weight: bold; text-align: center; line-height: 1.3; margin-bottom: 1px; }
  .head-sub { font-size: 7pt; text-align: center; margin: 1px 0; }
  .label { font-size: 6pt; font-weight: bold; text-transform: uppercase; color: #333; margin-bottom: 1px; }
  .row { font-size: 7pt; line-height: 1.3; margin: 2px 0; display: flex; justify-content: space-between; align-items: baseline; gap: 4px; }
  .row-desc { flex: 1; min-width: 0; overflow-wrap: break-word; word-break: break-word; }
  .row-amt { flex-shrink: 0; text-align: right; font-variant-numeric: tabular-nums; }
  .line { font-size: 7pt; line-height: 1.3; margin: 2px 0; }
  .extra-row { font-size: 6pt; line-height: 1.3; margin: 1px 0 1px 6px; display: flex; justify-content: space-between; align-items: baseline; gap: 4px; }
  .extra-desc { flex: 1; min-width: 0; overflow-wrap: break-word; }
  .extra-amt { flex-shrink: 0; text-align: right; font-variant-numeric: tabular-nums; }
  .note-line { font-size: 6pt; line-height: 1.3; margin: 1px 0 1px 6px; font-style: italic; }
  .item-block { margin-bottom: 4px; padding-bottom: 3px; border-bottom: 1px dashed #000; }
  .item-block:last-of-type { border-bottom: none; }
  .totals-section .row { margin: 2px 0; }
  .total-final { font-size: 8pt; font-weight: bold; margin-top: 3px; padding-top: 2px; border-top: 2px solid #000; }
  .foot { text-align: center; margin-top: 4px; padding-top: 3px; border-top: 1px solid #000; font-size: 7pt; }
  .bold { font-weight: bold; }
  @media print {
    html, body { width: ${TICKET_WIDTH_MM}mm; }
    .ticket { width: 100% !important; max-width: ${TICKET_WIDTH_MM}mm !important; }
  }
`;

/** Estilos específicos del ticket de venta (diseño RESTIFY / DELIYUNOS) */
const SALE_TICKET_STYLES = `
  .ticket-sale .brand-main { font-family: Georgia, 'Times New Roman', serif; font-size: 9pt; font-weight: bold; font-style: italic; text-align: center; letter-spacing: 0.02em; margin-bottom: 1px; }
  .ticket-sale .brand-branch { font-size: 10pt; font-weight: bold; text-align: center; font-family: Arial, sans-serif; margin-bottom: 3px; }
  .ticket-sale .company-contact { font-size: 6pt; text-align: left; color: #333; line-height: 1.3; margin-bottom: 2px; }
  .ticket-sale .ticket-title { font-size: 7pt; font-weight: bold; text-align: center; text-transform: uppercase; margin: 2px 0 1px; }
  .ticket-sale .ticket-id { font-size: 8pt; font-weight: bold; text-align: center; margin: 1px 0; }
  .ticket-sale .ticket-datetime { font-size: 6pt; text-align: center; margin: 1px 0; }
  .ticket-sale .ticket-table { font-size: 7pt; font-weight: bold; text-align: center; margin: 1px 0 3px; }
  .ticket-sale .consumo-header { font-size: 6pt; font-weight: bold; text-transform: uppercase; margin: 3px 0 2px; }
  .ticket-sale .item-platillo { display: flex; justify-content: space-between; align-items: baseline; font-size: 7pt; font-weight: bold; text-transform: uppercase; margin-bottom: 1px; }
  .ticket-sale .item-name { font-size: 7pt; margin: 1px 0; overflow-wrap: break-word; }
  .ticket-sale .item-qty { font-size: 6pt; margin-bottom: 2px; }
  .ticket-sale .dash { border: none; border-top: 1px dashed #000; margin: 2px 0; }
  .ticket-sale .totals-line { display: flex; justify-content: space-between; font-size: 7pt; margin: 2px 0; }
  .ticket-sale .totals-total { display: flex; justify-content: space-between; font-size: 9pt; font-weight: bold; text-transform: uppercase; margin-top: 3px; padding-top: 2px; border-top: 2px solid #000; }
  .ticket-sale .pago-estado { font-size: 7pt; font-weight: bold; margin: 2px 0; }
  .ticket-sale .foot-thanks { font-family: Georgia, 'Times New Roman', serif; font-size: 7pt; font-style: italic; text-align: center; margin: 3px 0 2px; }
  .ticket-sale .foot-web { font-size: 6pt; color: #888; text-align: center; }
`;

/** Estilos ticket cocina (mismo diseño que venta: brand, rules, ítems con PLATILLO) */
const KITCHEN_TICKET_STYLES = `
  .ticket-kitchen .brand-main { font-family: Georgia, 'Times New Roman', serif; font-size: 9pt; font-weight: bold; font-style: italic; text-align: center; letter-spacing: 0.02em; margin-bottom: 1px; }
  .ticket-kitchen .brand-branch { font-size: 10pt; font-weight: bold; text-align: center; font-family: Arial, sans-serif; margin-bottom: 3px; }
  .ticket-kitchen .ticket-title { font-size: 7pt; font-weight: bold; text-align: center; text-transform: uppercase; margin: 2px 0 1px; }
  .ticket-kitchen .ticket-id { font-size: 8pt; font-weight: bold; text-align: center; margin: 1px 0; }
  .ticket-kitchen .ticket-table { font-size: 7pt; font-weight: bold; text-align: center; margin: 1px 0 3px; }
  .ticket-kitchen .pedido-header { font-size: 6pt; font-weight: bold; text-transform: uppercase; margin: 3px 0 2px; }
  .ticket-kitchen .item-platillo { font-size: 7pt; font-weight: bold; text-transform: uppercase; margin-bottom: 1px; }
  .ticket-kitchen .item-name { font-size: 7pt; margin: 1px 0; overflow-wrap: break-word; }
  .ticket-kitchen .item-qty { font-size: 6pt; margin-bottom: 2px; }
  .ticket-kitchen .item-extras { font-size: 6pt; margin: 1px 0 1px 6px; }
  .ticket-kitchen .note-line { font-size: 6pt; font-style: italic; margin: 1px 0 1px 6px; }
  .ticket-kitchen .item-block { margin-bottom: 4px; padding-bottom: 3px; border-bottom: 1px dashed #000; }
  .ticket-kitchen .item-block:last-of-type { border-bottom: none; }
`;

function escapeHtml(text: string): string {
  const el = document.createElement('div');
  el.textContent = text;
  return el.innerHTML;
}

/**
 * Ticket cocina — Mismo diseño que ticket de venta: RESTIFY / COCINA, Orden #id, Mesa, pedido (PLATILLO, nombre, x 1, extras, nota).
 * Solo usa campos que ya devuelve el API: orderId, tableName, items.
 */
export function buildKitchenTicketHtml(data: KitchenTicketResponse): string {
  const tableText =
    data.tableName != null && data.tableName.trim() !== ''
      ? `Mesa ${data.tableName}`
      : 'Sin mesa';
  const orderShortId = data.orderId.slice(-8).toUpperCase();

  let itemsHtml = '';
  for (const item of data.items) {
    itemsHtml += '<div class="item-block">';
    itemsHtml += '<div class="item-platillo">PLATILLO</div>';
    itemsHtml += `<div class="item-name">${escapeHtml(item.name)}</div>`;
    itemsHtml += `<div class="item-qty">x ${item.quantity}</div>`;
    if (item.extras?.length) {
      for (const ex of item.extras) {
        itemsHtml += `<div class="item-extras">• ${escapeHtml(ex.name)} × ${ex.quantity}</div>`;
      }
    }
    if (item.note?.trim()) {
      itemsHtml += `<div class="note-line">Nota: ${escapeHtml(item.note.trim())}</div>`;
    }
    itemsHtml += '</div>';
  }

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${BASE_STYLES}${KITCHEN_TICKET_STYLES}</style></head><body>
<div class="ticket ticket-kitchen">
  <div class="brand-main">RESTIFY</div>
  <div class="brand-branch">COCINA</div>
  <hr class="rule" />
  <div class="ticket-title">Orden #${orderShortId}</div>
  <div class="ticket-table">${escapeHtml(tableText)}</div>
  <hr class="rule" />
  <div class="pedido-header">Pedido (producto y cantidad)</div>
  ${itemsHtml}
</div>
</body></html>`;
}

/**
 * Ticket de venta (cliente) — Diseño: RESTIFY / DELIYUNOS, contacto, TICKET DE VENTA #id, consumo, totales, pago, gracias.
 */
export function buildSaleTicketHtml(data: SaleTicketResponse): string {
  const companyFull = data.companyName?.trim() || 'Restify';
  const parts = companyFull.split(/\s+/);
  const brandMain = parts[0] ?? 'Restify';
  const brandBranch = data.companyBranch?.trim() || (parts.length > 1 ? parts.slice(1).join(' ') : '');
  const tableText =
    data.tableName != null && data.tableName.trim() !== ''
      ? `Mesa ${data.tableName}`
      : 'Sin mesa';
  const orderShortId = data.orderId.slice(-8).toUpperCase();
  const dateFormatted = new Date(data.date).toLocaleString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const contactLines: string[] = [];
  if (data.companyRfc?.trim()) contactLines.push(`RFC: ${escapeHtml(data.companyRfc.trim())}`);
  if (data.companyAddress?.trim()) contactLines.push(escapeHtml(data.companyAddress.trim()));
  if (data.companyPhone?.trim()) contactLines.push(`Tel: ${escapeHtml(data.companyPhone.trim())}`);
  const contactHtml =
    contactLines.length > 0
      ? `<div class="company-contact">${contactLines.join('<br/>')}</div>`
      : '';

  let itemsHtml = '';
  for (const item of data.items) {
    itemsHtml += '<div class="item-block">';
    itemsHtml += `<div class="item-platillo"><span>PLATILLO</span><span>${ticketCurrency(item.lineTotal)}</span></div>`;
    itemsHtml += `<div class="item-name">${escapeHtml(item.name)}</div>`;
    itemsHtml += `<div class="item-qty">x ${item.quantity}</div>`;
    if (item.extras?.length) {
      for (const ex of item.extras) {
        const extraCost = ex.price * ex.quantity;
        itemsHtml += `<div class="extra-row"><span class="extra-desc">• ${escapeHtml(ex.name)} × ${ex.quantity}</span><span class="extra-amt">${ticketCurrency(extraCost)}</span></div>`;
      }
    }
    if (item.note?.trim()) {
      itemsHtml += `<div class="note-line">Nota: ${escapeHtml(item.note.trim())}</div>`;
    }
    itemsHtml += '</div>';
  }

  const ivaPercent = data.subtotal > 0 ? Math.round((data.iva / data.subtotal) * 100) : 0;
  const deliveredText = data.delivered ? 'Entregado' : 'Pendiente';
  const website = data.companyWebsite?.trim() || 'restify.com';

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${BASE_STYLES}${SALE_TICKET_STYLES}</style></head><body>
<div class="ticket ticket-sale">
  <div class="brand-main">${escapeHtml(brandMain)}</div>
  ${brandBranch ? `<div class="brand-branch">${escapeHtml(brandBranch)}</div>` : ''}
  ${contactHtml}
  <hr class="rule" />
  <div class="ticket-title">TICKET DE VENTA</div>
  <div class="ticket-id">#${orderShortId}</div>
  <div class="ticket-datetime">${escapeHtml(dateFormatted)}</div>
  <div class="ticket-table">${escapeHtml(tableText)}</div>
  <hr class="rule" />
  <div class="consumo-header">Consumo (producto y costo por línea)</div>
  ${itemsHtml}
  <hr class="rule" />
  <div class="totals-line"><span>SUBTOTAL</span><span>${ticketCurrency(data.subtotal)}</span></div>
  <div class="totals-line"><span>IVA ${ivaPercent}%</span><span>${ticketCurrency(data.iva)}</span></div>
  ${data.tip > 0 ? `<div class="totals-line"><span>PROPINA</span><span>${ticketCurrency(data.tip)}</span></div>` : ''}
  <div class="totals-total"><span>TOTAL</span><span>${ticketCurrency(data.total)}</span></div>
  <hr class="rule" />
  <div class="pago-estado">PAGO: ${escapeHtml(data.paymentMethod)}</div>
  <div class="pago-estado">ESTADO: ${escapeHtml(deliveredText)}</div>
  <hr class="rule" />
  <div class="foot-thanks">¡Gracias por su compra!</div>
  <div class="foot-web">Visite ${escapeHtml(website)}</div>
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
