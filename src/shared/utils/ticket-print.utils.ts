/**
 * Utilidades para imprimir tickets térmicos.
 * Estilos y bloques visibles según ResolvedTicketPrintConfig (API / empresa).
 */

import type { KitchenTicketResponse, SaleTicketResponse } from '@/domain/types/ticket.types';
import type { ResolvedTicketPrintConfig } from '@/shared/utils/ticket-print-config';
import { mergeTicketPrintConfig } from '@/shared/utils/ticket-print-config';

function ticketCurrency(amount: number): string {
  return `MX$${amount.toFixed(2)}`;
}

function buildBaseStyles(c: ResolvedTicketPrintConfig): string {
  const w = c.layout.paperWidthMm;
  const pt = c.layout.baseFontPt;
  const pv = c.layout.bodyPaddingVerticalMm;
  const ph = c.layout.bodyPaddingHorizontalMm;
  const mb = c.layout.itemBlockMarginBottomPx;
  const pb = c.layout.itemBlockPaddingBottomPx;
  return `
  @page { size: ${w}mm auto; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; width: ${w}mm; min-height: auto; height: auto; overflow-wrap: break-word; word-break: break-word; }
  body { padding: ${pv}mm ${ph}mm; font-family: Arial, sans-serif; font-size: ${pt}pt; }
  .ticket { width: 100%; max-width: ${w}mm; overflow-x: hidden; }
  .rule { border: none; border-top: 1px solid #000; margin: 3px 0; }
  .head { font-size: ${pt}pt; font-weight: bold; text-align: center; line-height: 1.3; margin-bottom: 1px; }
  .head-sub { font-size: ${pt}pt; text-align: center; margin: 1px 0; }
  .label { font-size: ${pt}pt; font-weight: bold; text-transform: uppercase; color: #333; margin-bottom: 1px; }
  .row { font-size: ${pt}pt; line-height: 1.3; margin: 2px 0; display: flex; justify-content: space-between; align-items: baseline; gap: 4px; }
  .row-desc { flex: 1; min-width: 0; overflow-wrap: break-word; word-break: break-word; }
  .row-amt { flex-shrink: 0; text-align: right; font-variant-numeric: tabular-nums; }
  .line { font-size: ${pt}pt; line-height: 1.3; margin: 2px 0; }
  .note-line { font-size: ${pt}pt; line-height: 1.3; margin: 2px 0 0 0; font-style: italic; text-align: left; }
  .item-block { margin-bottom: ${mb}px; padding-bottom: ${pb}px; border-bottom: 1px dashed #000; text-align: left; }
  .item-name { font-size: ${pt}pt; font-weight: bold; text-align: left; margin: 0 0 2px 0; overflow-wrap: break-word; }
  .item-qty { font-size: ${pt}pt; text-align: left; margin: 0 0 2px 0; }
  .item-extras { font-size: ${pt}pt; line-height: 1.35; text-align: left; margin: 1px 0; overflow-wrap: break-word; }
  .item-line-price { font-size: ${pt}pt; font-weight: bold; text-align: left; margin: 2px 0 0 0; font-variant-numeric: tabular-nums; }
  .item-block:last-of-type { border-bottom: none; }
  .totals-section .row { margin: 2px 0; }
  .total-final { font-size: ${pt}pt; font-weight: bold; margin-top: 2px; padding-top: 1px; border-top: 2px solid #000; }
  .foot { text-align: center; margin-top: 2px; padding-top: 2px; border-top: 1px solid #000; font-size: ${pt}pt; }
  .bold { font-weight: bold; }
  @media print {
    html, body { width: ${w}mm; }
    .ticket { width: 100% !important; max-width: ${w}mm !important; }
  }
`;
}

function buildSaleTicketStyles(c: ResolvedTicketPrintConfig): string {
  const pt = c.layout.baseFontPt;
  const center = c.sale.centerTotalsBlock;
  const footerAlign = center ? 'center' : 'left';
  const totalsJustify = center ? 'center' : 'space-between';
  return `
  .ticket-sale .brand-main { font-family: Georgia, 'Times New Roman', serif; font-size: ${pt}pt; font-weight: bold; font-style: italic; text-align: center; letter-spacing: 0.02em; margin-bottom: 1px; }
  .ticket-sale .brand-branch { font-size: ${pt}pt; font-weight: bold; text-align: center; font-family: Arial, sans-serif; margin-bottom: 3px; }
  .ticket-sale .company-contact { font-size: ${pt}pt; text-align: left; color: #333; line-height: 1.3; margin-bottom: 2px; }
  .ticket-sale .ticket-title { font-size: ${pt}pt; font-weight: bold; text-align: center; text-transform: uppercase; margin: 2px 0 1px; }
  .ticket-sale .ticket-id { font-size: ${pt}pt; font-weight: bold; text-align: center; margin: 1px 0; }
  .ticket-sale .ticket-datetime { font-size: ${pt}pt; text-align: center; margin: 1px 0; }
  .ticket-sale .ticket-table { font-size: ${pt}pt; font-weight: bold; text-align: center; margin: 1px 0 3px; }
  .ticket-sale .consumo-header { font-size: ${pt}pt; font-weight: bold; text-transform: uppercase; margin: 3px 0 2px; }
  .ticket-sale .dash { border: none; border-top: 1px dashed #000; margin: 2px 0; }
  .ticket-sale .ticket-sale-footer { text-align: ${footerAlign}; }
  .ticket-sale .ticket-sale-footer .totals-line { display: flex; justify-content: ${totalsJustify}; align-items: baseline; gap: 8px; flex-wrap: wrap; font-size: ${pt}pt; margin: 2px 0; }
  .ticket-sale .ticket-sale-footer .totals-total { display: flex; justify-content: ${totalsJustify}; align-items: baseline; gap: 10px; flex-wrap: wrap; font-size: ${pt}pt; font-weight: bold; text-transform: uppercase; margin-top: 2px; padding-top: 1px; border-top: 2px solid #000; }
  .ticket-sale .ticket-sale-footer .pago-estado { font-size: ${pt}pt; font-weight: bold; margin: 2px 0; text-align: ${footerAlign}; }
  .ticket-sale .ticket-sale-footer .foot-brand { font-family: Georgia, 'Times New Roman', serif; font-size: ${pt}pt; font-weight: bold; text-align: ${footerAlign}; margin: 3px 0 2px; }
`;
}

function buildKitchenTicketStyles(c: ResolvedTicketPrintConfig): string {
  const pt = c.layout.baseFontPt;
  return `
  .ticket-kitchen .brand-main { font-family: Georgia, 'Times New Roman', serif; font-size: ${pt}pt; font-weight: bold; font-style: italic; text-align: center; letter-spacing: 0.02em; margin-bottom: 1px; }
  .ticket-kitchen .brand-branch { font-size: ${pt}pt; font-weight: bold; text-align: center; font-family: Arial, sans-serif; margin-bottom: 3px; }
  .ticket-kitchen .ticket-title { font-size: ${pt}pt; font-weight: bold; text-align: center; text-transform: uppercase; margin: 2px 0 1px; }
  .ticket-kitchen .ticket-id { font-size: ${pt}pt; font-weight: bold; text-align: center; margin: 1px 0; }
  .ticket-kitchen .ticket-table { font-size: ${pt}pt; font-weight: bold; text-align: center; margin: 1px 0 3px; }
  .ticket-kitchen .pedido-header { font-size: ${pt}pt; font-weight: bold; text-transform: uppercase; margin: 3px 0 2px; }
  .ticket-kitchen .item-block { margin-bottom: ${c.layout.itemBlockMarginBottomPx}px; padding-bottom: ${c.layout.itemBlockPaddingBottomPx}px; border-bottom: 1px dashed #000; }
  .ticket-kitchen .item-block:last-of-type { border-bottom: none; }
`;
}

function escapeHtml(text: string): string {
  const el = document.createElement('div');
  el.textContent = text;
  return el.innerHTML;
}

function buildTableLocationLine(tableName: string | null | undefined, origin?: string | null): string {
  const raw = origin === undefined || origin === null ? '' : String(origin).trim();
  const isLocal = raw === '' || raw.toLowerCase() === 'local';
  if (!isLocal) {
    return 'Para llevar';
  }
  if (tableName != null && tableName.trim() !== '') {
    return `Mesa ${tableName.trim()}`;
  }
  return 'Sin mesa';
}

function resolveConfig(
  explicit?: ResolvedTicketPrintConfig,
  fromResponse?: ResolvedTicketPrintConfig
): ResolvedTicketPrintConfig {
  if (explicit) return explicit;
  if (fromResponse) return fromResponse;
  return mergeTicketPrintConfig(undefined);
}

/**
 * Ticket cocina
 */
export function buildKitchenTicketHtml(
  data: KitchenTicketResponse,
  config?: ResolvedTicketPrintConfig
): string {
  const cfg = resolveConfig(config, data.printConfig);
  const k = cfg.kitchen;
  const tableText = buildTableLocationLine(data.tableName, data.origin);
  const orderShortId = data.orderId.slice(-8).toUpperCase();

  let itemsHtml = '';
  for (const item of data.items) {
    itemsHtml += '<div class="item-block">';
    itemsHtml += `<div class="item-name">${escapeHtml(item.name)}</div>`;
    if (k.showItemQuantity) {
      itemsHtml += `<div class="item-qty">Cantidad: ${item.quantity}</div>`;
    }
    if (k.showItemExtras && item.extras?.length) {
      for (const ex of item.extras) {
        itemsHtml += `<div class="item-extras">• ${escapeHtml(ex.name)} × ${ex.quantity}</div>`;
      }
    }
    if (k.showItemNote && item.note?.trim()) {
      itemsHtml += `<div class="note-line">Nota: ${escapeHtml(item.note.trim())}</div>`;
    }
    itemsHtml += '</div>';
  }

  const brandBranchHtml = k.showBrandBranch
    ? '<div class="brand-branch">COCINA</div>'
    : '';
  const orderTitleHtml = k.showOrderId
    ? `<div class="ticket-title">Orden #${orderShortId}</div>`
    : '';
  const tableHtml = k.showTableLine ? `<div class="ticket-table">${escapeHtml(tableText)}</div>` : '';
  const pedidoHtml = k.showPedidoHeader
    ? '<div class="pedido-header">Pedido (producto y cantidad)</div>'
    : '';

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${buildBaseStyles(cfg)}${buildKitchenTicketStyles(cfg)}</style></head><body>
<div class="ticket ticket-kitchen">
  <div class="brand-main">RESTIFY</div>
  ${brandBranchHtml}
  <hr class="rule" />
  ${orderTitleHtml}
  ${tableHtml}
  <hr class="rule" />
  ${pedidoHtml}
  ${itemsHtml}
</div>
</body></html>`;
}

/**
 * Ticket de venta (cliente)
 */
export function buildSaleTicketHtml(data: SaleTicketResponse, config?: ResolvedTicketPrintConfig): string {
  const cfg = resolveConfig(config, data.printConfig);
  const s = cfg.sale;
  const companyFull = data.companyName?.trim() || 'Restify';
  const parts = companyFull.split(/\s+/);
  const brandMain = parts[0] ?? 'Restify';
  const brandBranch = data.companyBranch?.trim() || (parts.length > 1 ? parts.slice(1).join(' ') : '');
  const tableText = buildTableLocationLine(data.tableName, data.origin);
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
  if (s.showContact) {
    if (s.showContactRfc && data.companyRfc?.trim()) {
      contactLines.push(`RFC: ${escapeHtml(data.companyRfc.trim())}`);
    }
    if (s.showContactAddress && data.companyAddress?.trim()) {
      contactLines.push(escapeHtml(data.companyAddress.trim()));
    }
    if (s.showContactPhone && data.companyPhone?.trim()) {
      contactLines.push(`Tel: ${escapeHtml(data.companyPhone.trim())}`);
    }
  }
  const contactHtml =
    contactLines.length > 0
      ? `<div class="company-contact">${contactLines.join('<br/>')}</div>`
      : '';

  let itemsHtml = '';
  for (const item of data.items) {
    itemsHtml += '<div class="item-block">';
    itemsHtml += `<div class="item-name">${escapeHtml(item.name)}</div>`;
    if (s.showItemQuantity) {
      itemsHtml += `<div class="item-qty">Cantidad: ${item.quantity}</div>`;
    }
    if (s.showItemExtras && item.extras?.length) {
      for (const ex of item.extras) {
        itemsHtml += `<div class="item-extras">• ${escapeHtml(ex.name)} × ${ex.quantity}</div>`;
      }
    }
    if (s.showLinePrice) {
      itemsHtml += `<div class="item-line-price">${ticketCurrency(item.lineTotal)}</div>`;
    }
    if (s.showItemNote && item.note?.trim()) {
      itemsHtml += `<div class="note-line">Nota: ${escapeHtml(item.note.trim())}</div>`;
    }
    itemsHtml += '</div>';
  }

  const ivaPercent = data.subtotal > 0 ? Math.round((data.iva / data.subtotal) * 100) : 0;
  const deliveredText = data.delivered ? 'Entregado' : 'Pendiente';

  const brandBranchBlock =
    s.showBrandBranch && brandBranch ? `<div class="brand-branch">${escapeHtml(brandBranch)}</div>` : '';

  const titleBlock = s.showTicketTitle ? '<div class="ticket-title">TICKET DE VENTA</div>' : '';
  const idBlock = s.showOrderId ? `<div class="ticket-id">#${orderShortId}</div>` : '';
  const dateBlock = s.showDateTime ? `<div class="ticket-datetime">${escapeHtml(dateFormatted)}</div>` : '';
  const tableBlock = s.showTableLine ? `<div class="ticket-table">${escapeHtml(tableText)}</div>` : '';
  const consumoBlock = s.showConsumoHeader
    ? '<div class="consumo-header">Consumo (producto y costo por línea)</div>'
    : '';

  const subtotalBlock = s.showSubtotal
    ? `<div class="totals-line"><span>SUBTOTAL</span><span>${ticketCurrency(data.subtotal)}</span></div>`
    : '';
  const ivaBlock = s.showIva
    ? `<div class="totals-line"><span>IVA ${ivaPercent}%</span><span>${ticketCurrency(data.iva)}</span></div>`
    : '';
  const tipBlock =
    s.showTip && data.tip > 0
      ? `<div class="totals-line"><span>PROPINA</span><span>${ticketCurrency(data.tip)}</span></div>`
      : '';
  const totalBlock = s.showTotal
    ? `<div class="totals-total"><span>TOTAL</span><span>${ticketCurrency(data.total)}</span></div>`
    : '';

  const pagoBlock = s.showPaymentMethod
    ? `<div class="pago-estado">PAGO: ${escapeHtml(data.paymentMethod)}</div>`
    : '';
  const estadoBlock = s.showDeliveredStatus
    ? `<div class="pago-estado">ESTADO: ${escapeHtml(deliveredText)}</div>`
    : '';

  const footerBlock =
    s.showFooter && s.footerText.trim() !== ''
      ? `<div class="foot-brand">${escapeHtml(s.footerText.trim())}</div>`
      : '';

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${buildBaseStyles(cfg)}${buildSaleTicketStyles(cfg)}</style></head><body>
<div class="ticket ticket-sale">
  <div class="brand-main">${escapeHtml(brandMain)}</div>
  ${brandBranchBlock}
  ${contactHtml}
  <hr class="rule" />
  ${titleBlock}
  ${idBlock}
  ${dateBlock}
  ${tableBlock}
  <hr class="rule" />
  ${consumoBlock}
  ${itemsHtml}
  <hr class="rule" />
  <div class="ticket-sale-footer">
  ${subtotalBlock}
  ${ivaBlock}
  ${tipBlock}
  ${totalBlock}
  <hr class="rule" />
  ${pagoBlock}
  ${estadoBlock}
  <hr class="rule" />
  ${footerBlock}
  </div>
</div>
</body></html>`;
}

/**
 * Genera un QR como data URL (base64 PNG) para insertar en HTML de impresión
 */
export async function generateQrDataUrl(url: string): Promise<string> {
  const QRCode = await import('qrcode');
  return QRCode.toDataURL(url, { width: 200, margin: 1 });
}

/**
 * Ticket de venta con QR de pago (Mercado Pago)
 * Reutiliza el ticket de venta normal y agrega el QR al final
 */
export async function buildSaleTicketWithQrHtml(
  data: SaleTicketResponse,
  qrDataUrl: string,
  config?: ResolvedTicketPrintConfig
): Promise<string> {
  const baseHtml = buildSaleTicketHtml(data, config);

  const qrSection = `
  <div style="text-align: center; margin-top: 6px; padding-top: 4px; border-top: 1px dashed #000;">
    <div style="font-weight: bold; font-size: 9pt; margin-bottom: 4px;">ESCANEA PARA PAGAR</div>
    <img src="${qrDataUrl}" style="width: 45mm; height: 45mm;" />
    <div style="font-size: 7pt; margin-top: 3px; color: #666;">Mercado Pago</div>
  </div>`;

  // Insertar antes del cierre de </div></body>
  return baseHtml.replace('</div>\n</body>', `${qrSection}\n</div>\n</body>`);
}

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

  // Esperar a que las imágenes carguen antes de imprimir (ej: QR base64)
  const images = doc.querySelectorAll('img');
  const imagePromises = Array.from(images).map(
    (img) =>
      new Promise<void>((resolve) => {
        if (img.complete) {
          resolve();
        } else {
          img.onload = () => resolve();
          img.onerror = () => resolve();
        }
      })
  );

  Promise.all(imagePromises).then(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 1000);
  });
}
