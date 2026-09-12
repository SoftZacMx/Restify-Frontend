import { describe, it, expect } from 'vitest';
import {
  buildKitchenTicketHtml,
  buildSaleTicketHtml,
  buildSaleTicketWithQrHtml,
  generateQrDataUrl,
} from './ticket-print.utils';
import { mergeTicketPrintConfig } from './ticket-print-config';
import type { KitchenTicketResponse, SaleTicketResponse } from '@/domain/types/ticket.types';

const kitchenData: KitchenTicketResponse = {
  orderId: 'ORD-123456789',
  origin: 'local',
  tableName: 'Mesa 1',
  items: [
    { name: 'Tacos', quantity: 2, extras: [{ name: 'Cebolla', quantity: 1 }], note: 'Sin picante' },
  ],
};

const saleData: SaleTicketResponse = {
  companyName: 'DELIYUNOS S.A.',
  companyBranch: null,
  companyRfc: 'DEL123456789',
  companyAddress: 'Av. Principal 123',
  companyPhone: '5512345678',
  orderId: 'ORD-123456789',
  date: '2025-01-01T12:00:00.000Z',
  origin: 'local',
  tableName: 'Mesa 1',
  client: null,
  note: null,
  items: [{ name: 'Tacos', quantity: 2, price: 50, lineTotal: 100, extras: [], note: null }],
  subtotal: 100,
  iva: 16,
  tip: 10,
  total: 126,
  paymentMethod: 'Efectivo',
  delivered: true,
};

describe('buildKitchenTicketHtml', () => {
  it('renders a full kitchen ticket with defaults', () => {
    const html = buildKitchenTicketHtml(kitchenData);
    expect(html).toContain('RESTIFY');
    expect(html).toContain('OPERACIONES');
    expect(html).toContain('Orden #23456789');
    expect(html).toContain('Ubicación Mesa 1');
    expect(html).toContain('Pedido (producto y cantidad)');
    expect(html).toContain('Tacos');
    expect(html).toContain('Cantidad: 2');
    expect(html).toContain('• Cebolla × 1');
    expect(html).toContain('Nota: Sin picante');
  });

  it('uses the last 8 chars of the order id, uppercased', () => {
    const html = buildKitchenTicketHtml(kitchenData);
    expect(html).toContain('Orden #23456789');
    expect(html).not.toContain('ORD-123');
  });

  it('respects showItemQuantity = false', () => {
    const config = mergeTicketPrintConfig({ kitchen: { showItemQuantity: false } });
    const html = buildKitchenTicketHtml(kitchenData, config);
    expect(html).not.toContain('Cantidad:');
  });

  it('escapes item names and notes', () => {
    const data = {
      ...kitchenData,
      items: [{ name: '<b>Nombre</b>', quantity: 1, extras: [], note: '<i>Nota</i>' }],
    };
    const html = buildKitchenTicketHtml(data);
    expect(html).toContain('&lt;b&gt;Nombre&lt;/b&gt;');
    expect(html).toContain('&lt;i&gt;Nota&lt;/i&gt;');
  });

  it('omits brand, title and table blocks when disabled', () => {
    const config = mergeTicketPrintConfig({
      kitchen: { showBrandBranch: false, showOrderId: false, showTableLine: false, showPedidoHeader: false },
    });
    const html = buildKitchenTicketHtml(kitchenData, config);
    expect(html).not.toContain('OPERACIONES');
    expect(html).not.toContain('Orden #');
    expect(html).not.toContain('Ubicación');
    expect(html).not.toContain('Pedido (producto');
  });

  it('uses data.printConfig when no explicit config is passed', () => {
    const config = mergeTicketPrintConfig({ kitchen: { showItemNote: false } });
    const data = { ...kitchenData, printConfig: config };
    const html = buildKitchenTicketHtml(data);
    expect(html).not.toContain('Nota:');
  });

  it('prefers the explicit config over data.printConfig', () => {
    const explicit = mergeTicketPrintConfig({ kitchen: { showItemNote: true } });
    const fromData = mergeTicketPrintConfig({ kitchen: { showItemNote: false } });
    const data = { ...kitchenData, printConfig: fromData };
    const html = buildKitchenTicketHtml(data, explicit);
    expect(html).toContain('Nota: Sin picante');
  });
});

describe('table location line', () => {
  it('renders Sin ubicación for local origin without a table', () => {
    const html = buildKitchenTicketHtml({ ...kitchenData, tableName: null });
    expect(html).toContain('Sin ubicación');
  });

  it('renders Para llevar for takeout origins', () => {
    const html = buildKitchenTicketHtml({ ...kitchenData, origin: 'uber' });
    expect(html).toContain('Para llevar');
    expect(html).not.toContain('Ubicación');
  });
});

describe('buildSaleTicketHtml', () => {
  it('renders a full sale ticket', () => {
    const html = buildSaleTicketHtml(saleData);
    expect(html).toContain('DELIYUNOS');
    expect(html).toContain('S.A.');
    expect(html).toContain('RFC: DEL123456789');
    expect(html).toContain('Av. Principal 123');
    expect(html).toContain('Tel: 5512345678');
    expect(html).toContain('TICKET DE VENTA');
    expect(html).toContain('#23456789');
    expect(html).toContain('Ubicación Mesa 1');
    expect(html).toContain('Consumo (producto y costo por línea)');
    expect(html).toContain('MX$100.00');
    expect(html).toContain('IVA 16%');
    expect(html).toContain('PROPINA');
    expect(html).toContain('MX$10.00');
    expect(html).toContain('TOTAL');
    expect(html).toContain('MX$126.00');
    expect(html).toContain('PAGO: Efectivo');
    expect(html).toContain('ESTADO: Entregado');
    expect(html).toContain('Restify');
  });

  it('falls back to Restify when companyName is missing', () => {
    const html = buildSaleTicketHtml({ ...saleData, companyName: undefined });
    expect(html).toContain('<div class="brand-main">Restify</div>');
  });

  it('computes the IVA percentage from subtotal', () => {
    const html = buildSaleTicketHtml({ ...saleData, subtotal: 200, iva: 32 });
    expect(html).toContain('IVA 16%');
  });

  it('does not show IVA percentage when subtotal is 0', () => {
    const html = buildSaleTicketHtml({ ...saleData, subtotal: 0, iva: 0 });
    expect(html).toContain('IVA 0%');
  });

  it('omits the tip block when tip is 0', () => {
    const html = buildSaleTicketHtml({ ...saleData, tip: 0 });
    expect(html).not.toContain('PROPINA');
  });

  it('marks a non-delivered order as Pendiente', () => {
    const html = buildSaleTicketHtml({ ...saleData, delivered: false });
    expect(html).toContain('ESTADO: Pendiente');
  });

  it('respects showTotal = false from data.printConfig', () => {
    const config = mergeTicketPrintConfig({ sale: { showTotal: false } });
    const html = buildSaleTicketHtml({ ...saleData, printConfig: config });
    expect(html).not.toContain('<div class="totals-total">');
  });

  it('escapes item names', () => {
    const data = {
      ...saleData,
      items: [{ name: '<b>Nombre</b>', quantity: 1, price: 10, lineTotal: 10, extras: [], note: null }],
    };
    const html = buildSaleTicketHtml(data);
    expect(html).toContain('&lt;b&gt;Nombre&lt;/b&gt;');
  });

  it('renders contact lines only when showContact is enabled', () => {
    const config = mergeTicketPrintConfig({ sale: { showContact: false } });
    const html = buildSaleTicketHtml(saleData, config);
    expect(html).not.toContain('RFC:');
    expect(html).not.toContain('Tel:');
  });
});

describe('buildSaleTicketWithQrHtml', () => {
  it('appends the QR section to the sale ticket', async () => {
    const html = await buildSaleTicketWithQrHtml(saleData, 'data:image/png;base64,AAAA');
    expect(html).toContain('ESCANEA PARA PAGAR');
    expect(html).toContain('src="data:image/png;base64,AAAA"');
    expect(html).toContain('Mercado Pago');
    expect(html).toContain('TICKET DE VENTA');
    expect(html).toContain('</body></html>');
  });
});

describe('generateQrDataUrl', () => {
  it('generates a base64 PNG data URL', async () => {
    const url = await generateQrDataUrl('https://restify.example/pay/123');
    expect(typeof url).toBe('string');
    expect(url.startsWith('data:image/png;base64,')).toBe(true);
  });
});
