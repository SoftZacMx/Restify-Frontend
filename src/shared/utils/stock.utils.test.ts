import { describe, it, expect } from 'vitest';
import {
  UNIT_OPTIONS,
  MOVEMENT_REASON_OPTIONS,
  getMovementReasonDescription,
  MOVEMENT_TYPE_OPTIONS,
  getMovementTypeOption,
  getUnitName,
  formatUnit,
  formatStockQuantity,
  formatAverageCost,
  getStockHealth,
  toStockTableItem,
  formatStockForTable,
  getCompatibleUnits,
} from './stock.utils';
import type { StockSummaryResponse, StockMovementType, UnitOfMeasure } from '@/domain/types';

const stockItem = (partial: Partial<StockSummaryResponse> = {}): StockSummaryResponse => ({
  productId: 'p-1',
  name: 'Harina',
  description: 'Bolsa 1kg',
  unitOfMeasure: 'KG',
  stockActual: '5',
  averageCost: '25.5',
  minStockAlert: '10',
  trackStock: true,
  isLowStock: false,
  ...partial,
});

describe('UNIT_OPTIONS', () => {
  it('covers every UnitOfMeasure with a name', () => {
    expect(UNIT_OPTIONS.map((o) => o.value).sort()).toEqual(
      ['G', 'KG', 'L', 'ML', 'OTHER', 'PCS'].sort()
    );
  });

  it('maps the expected Spanish names', () => {
    expect(UNIT_OPTIONS.find((o) => o.value === 'KG')?.name).toBe('Kilogramos');
    expect(UNIT_OPTIONS.find((o) => o.value === 'PCS')?.name).toBe('Piezas');
    expect(UNIT_OPTIONS.find((o) => o.value === 'OTHER')?.name).toBe('Otro');
  });
});

describe('MOVEMENT_REASON_OPTIONS', () => {
  it('includes waste and automatic reasons', () => {
    const values = MOVEMENT_REASON_OPTIONS.map((o) => o.value);
    expect(values).toContain('EXPIRED');
    expect(values).toContain('BROKEN');
    expect(values).toContain('THEFT');
    expect(values).toContain('OTHER');
    expect(values).toContain('order cancelled');
    expect(values).toContain('order edited');
    expect(values).toContain('expense deleted');
  });

  it('has Spanish descriptions', () => {
    expect(getMovementReasonDescription('EXPIRED')).toBe('Vencido');
    expect(getMovementReasonDescription('THEFT')).toBe('Robo / faltante');
    expect(getMovementReasonDescription('order cancelled')).toBe('Orden cancelada');
  });
});

describe('getMovementReasonDescription', () => {
  it('returns the value as-is for unknown reasons (manual adjustments)', () => {
    expect(getMovementReasonDescription('Ajuste por inventario')).toBe('Ajuste por inventario');
  });

  it('returns empty string for nullish input', () => {
    expect(getMovementReasonDescription(null)).toBe('');
    expect(getMovementReasonDescription(undefined)).toBe('');
  });
});

describe('MOVEMENT_TYPE_OPTIONS / getMovementTypeOption', () => {
  const types: StockMovementType[] = ['PURCHASE', 'SALE', 'WASTE', 'ADJUSTMENT', 'SALE_REVERSAL'];

  it('provides an option for every movement type', () => {
    expect(MOVEMENT_TYPE_OPTIONS.map((o) => o.value).sort()).toEqual([...types].sort());
  });

  it('returns the full option for a known type', () => {
    const sale = getMovementTypeOption('SALE');
    expect(sale.description).toBe('Venta');
    expect(sale.descriptionPlural).toBe('Ventas');
    expect(sale.badgeClassName).toContain('blue');
  });

  it('describes purchase and reversal types', () => {
    expect(getMovementTypeOption('PURCHASE').description).toBe('Compra');
    expect(getMovementTypeOption('PURCHASE').descriptionPlural).toBe('Compras');
    expect(getMovementTypeOption('SALE_REVERSAL').description).toBe('Reversa');
    expect(getMovementTypeOption('SALE_REVERSAL').descriptionPlural).toBe('Reversas');
  });
});

describe('getUnitName / formatUnit', () => {
  it('returns the long Spanish name', () => {
    expect(getUnitName('KG')).toBe('Kilogramos');
    expect(getUnitName('ML')).toBe('Mililitros');
    expect(getUnitName('OTHER')).toBe('Otro');
  });

  it('returns empty string for nullish units', () => {
    expect(getUnitName(null)).toBe('');
    expect(getUnitName(undefined)).toBe('');
  });

  it('returns the short label for quantities', () => {
    expect(formatUnit('KG')).toBe('kg');
    expect(formatUnit('PCS')).toBe('pcs');
    expect(formatUnit(null)).toBe('');
  });
});

describe('formatStockQuantity', () => {
  it('formats amount with its short unit', () => {
    expect(formatStockQuantity(12.5, 'KG')).toBe('12.5 kg');
    expect(formatStockQuantity(3, 'PCS')).toBe('3 pcs');
  });

  it('formats without unit when unit is null', () => {
    expect(formatStockQuantity(5, null)).toBe('5');
  });

  it('formats thousands with es-MX separators', () => {
    expect(formatStockQuantity(1234.5, 'KG')).toBe('1,234.5 kg');
  });
});

describe('formatAverageCost', () => {
  it('formats as MXN currency with 2-4 fraction digits', () => {
    expect(formatAverageCost(5)).toBe('$5.00');
    expect(formatAverageCost(5.6789)).toBe('$5.6789');
  });
});

describe('getStockHealth', () => {
  it('is critical when isLowStock is true regardless of min', () => {
    expect(getStockHealth(0, null, true)).toBe('critical');
    expect(getStockHealth(100, 10, true)).toBe('critical');
  });

  it('is warning when stock is within 1.5x of the configured minimum', () => {
    expect(getStockHealth(10, 10, false)).toBe('warning');
    expect(getStockHealth(15, 10, false)).toBe('warning');
  });

  it('is healthy otherwise', () => {
    expect(getStockHealth(16, 10, false)).toBe('healthy');
  });

  it('is healthy when no minimum is configured', () => {
    expect(getStockHealth(0, null, false)).toBe('healthy');
  });
});

describe('toStockTableItem / formatStockForTable', () => {
  it('converts string decimals to numbers and derives health', () => {
    const result = toStockTableItem(stockItem());
    expect(result.productId).toBe('p-1');
    expect(result.stockActual).toBe(5);
    expect(result.averageCost).toBe(25.5);
    expect(result.minStockAlert).toBe(10);
    expect(result.health).toBe('warning');
  });

  it('handles null minStockAlert and low stock flag', () => {
    const result = toStockTableItem(stockItem({ minStockAlert: null, isLowStock: true }));
    expect(result.minStockAlert).toBeNull();
    expect(result.health).toBe('critical');
  });

  it('maps an array of responses', () => {
    const results = formatStockForTable([stockItem(), stockItem({ productId: 'p-2' })]);
    expect(results).toHaveLength(2);
    expect(results[1].productId).toBe('p-2');
  });
});

describe('getCompatibleUnits', () => {
  it('returns [] for null unit', () => {
    expect(getCompatibleUnits(null)).toEqual([]);
  });

  it('pairs weight units', () => {
    expect(getCompatibleUnits('KG')).toEqual(['KG', 'G']);
    expect(getCompatibleUnits('G')).toEqual(['KG', 'G']);
  });

  it('pairs volume units', () => {
    expect(getCompatibleUnits('L')).toEqual(['L', 'ML']);
    expect(getCompatibleUnits('ML')).toEqual(['L', 'ML']);
  });

  it('returns only the own unit for count/other units', () => {
    expect(getCompatibleUnits('PCS')).toEqual(['PCS']);
    expect(getCompatibleUnits('OTHER')).toEqual(['OTHER']);
  });

  it('exhausts the UnitOfMeasure union', () => {
    const units: UnitOfMeasure[] = ['KG', 'G', 'L', 'ML', 'PCS', 'OTHER'];
    for (const u of units) {
      expect(getCompatibleUnits(u).length).toBeGreaterThan(0);
    }
  });
});
