import { describe, it, expect } from 'vitest';
import {
  mergeTicketPrintConfig,
  DEFAULT_TICKET_PRINT_CONFIG,
} from './ticket-print-config';

describe('mergeTicketPrintConfig', () => {
  it('returns the default config when stored is undefined', () => {
    expect(mergeTicketPrintConfig(undefined)).toEqual(DEFAULT_TICKET_PRINT_CONFIG);
  });

  it('returns the default config when stored is not an object', () => {
    expect(mergeTicketPrintConfig('invalid')).toEqual(DEFAULT_TICKET_PRINT_CONFIG);
    expect(mergeTicketPrintConfig(null)).toEqual(DEFAULT_TICKET_PRINT_CONFIG);
  });

  it('returns a deep copy, not a reference to the defaults', () => {
    const merged = mergeTicketPrintConfig(undefined);
    merged.sale.footerText = 'modified';
    expect(DEFAULT_TICKET_PRINT_CONFIG.sale.footerText).toBe('Restify');
  });

  it('applies stored values on top of defaults', () => {
    const merged = mergeTicketPrintConfig({
      layout: { baseFontPt: 16 },
      sale: { showIva: false, footerText: 'Mi Negocio' },
    });
    expect(merged.layout.baseFontPt).toBe(16);
    expect(merged.sale.showIva).toBe(false);
    expect(merged.sale.footerText).toBe('Mi Negocio');
    expect(merged.layout.paperWidthMm).toBe(DEFAULT_TICKET_PRINT_CONFIG.layout.paperWidthMm);
    expect(merged.kitchen.showPedidoHeader).toBe(true);
  });

  it('keeps schemaVersion fixed at 1 even if stored provides a different value', () => {
    const merged = mergeTicketPrintConfig({ schemaVersion: 99 });
    expect(merged.schemaVersion).toBe(1);
  });

  it('falls back to the default footerText when stored footerText is empty or not a string', () => {
    expect(mergeTicketPrintConfig({ sale: { footerText: '' } }).sale.footerText).toBe('Restify');
    expect(mergeTicketPrintConfig({ sale: { footerText: '   ' } }).sale.footerText).toBe('Restify');
    expect(mergeTicketPrintConfig({ sale: { footerText: 42 } }).sale.footerText).toBe('Restify');
  });

  it('ignores unknown keys in stored config', () => {
    const merged = mergeTicketPrintConfig({ bogus: { a: 1 }, layout: { nonsense: true } });
    expect(merged).toEqual(DEFAULT_TICKET_PRINT_CONFIG);
  });
});
