import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PaymentService } from './payment.service';
import { paymentRepository } from '@/infrastructure/api/repositories/payment.repository';
import type { ApiResponse } from '@/domain/types';
import type {
  SplitPaymentPart,
  PaymentResponse,
  SplitPaymentResponse,
  QrMpPaymentResponse,
  RefundResponse,
} from '@/domain/types/payment.types';

vi.mock('@/infrastructure/api/repositories/payment.repository', () => ({
  paymentRepository: {
    payWithQrMp: vi.fn(),
    getQrMpPaymentStatus: vi.fn(),
    payWithSplit: vi.fn(),
    listPayments: vi.fn(),
    getPaymentById: vi.fn(),
    createRefund: vi.fn(),
  },
}));

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';
const INVALID_UUID = 'not-a-uuid';
const service = new PaymentService();

const apiResponse = <T>(data: T): ApiResponse<T> => ({
  success: true,
  data,
  timestamp: '2025-01-01T00:00:00.000Z',
});

describe('validatePaymentData', () => {
  it('accepts a valid UUID and positive amount', () => {
    expect(service.validatePaymentData(VALID_UUID, 100)).toEqual({ isValid: true, errors: {} });
  });

  it('rejects an empty orderId', () => {
    const result = service.validatePaymentData('', 100);
    expect(result.isValid).toBe(false);
    expect(result.errors.orderId).toBe('El ID de la orden es requerido');
  });

  it('rejects an invalid UUID', () => {
    const result = service.validatePaymentData(INVALID_UUID, 100);
    expect(result.isValid).toBe(false);
    expect(result.errors.orderId).toContain('UUID válido');
  });

  it('rejects a non-v4 UUID', () => {
    expect(service.validatePaymentData('550e8400-e29b-31d4-a716-446655440000', 100).isValid).toBe(false);
  });

  it('rejects amount <= 0', () => {
    const result = service.validatePaymentData(VALID_UUID, 0);
    expect(result.isValid).toBe(false);
    expect(result.errors.amount).toContain('mayor a 0');
  });

  it('rejects amount with more than 2 decimals', () => {
    const result = service.validatePaymentData(VALID_UUID, 10.999);
    expect(result.isValid).toBe(false);
    expect(result.errors.amount).toContain('máximo 2 decimales');
  });
});

describe('validateSplitPaymentData', () => {
  const base: SplitPaymentPart = { amount: 50, paymentMethod: 'CASH' };
  const second: SplitPaymentPart = { amount: 50, paymentMethod: 'CARD_PHYSICAL' };

  it('accepts when sum <= orderTotal (within tolerance)', () => {
    expect(service.validateSplitPaymentData(VALID_UUID, base, second, 100).isValid).toBe(true);
    expect(service.validateSplitPaymentData(VALID_UUID, base, second, 100.005).isValid).toBe(true);
  });

  it('rejects when sum exceeds orderTotal', () => {
    const result = service.validateSplitPaymentData(VALID_UUID, base, second, 99);
    expect(result.isValid).toBe(false);
    expect(result.errors.splitPayment).toContain('$100.00');
    expect(result.errors.splitPayment).toContain('$99.00');
  });
});

describe('payment methods (with mocked repository)', () => {
  const repo = vi.mocked(paymentRepository);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('payWithQrMp calls repository and returns the payment data', async () => {
    repo.payWithQrMp.mockResolvedValue(apiResponse({ paymentId: 'qr-1' } as QrMpPaymentResponse));
    const result = await service.payWithQrMp(VALID_UUID, 'user-1');
    expect(repo.payWithQrMp).toHaveBeenCalledWith({ orderId: VALID_UUID, userId: 'user-1' });
    expect(result).toEqual({ paymentId: 'qr-1' });
  });

  it('payWithQrMp throws validation error for invalid orderId', async () => {
    await expect(service.payWithQrMp(INVALID_UUID, 'user-1')).rejects.toThrow('UUID válido');
    expect(repo.payWithQrMp).not.toHaveBeenCalled();
  });

  it('payWithSplit sends both payment parts', async () => {
    repo.payWithSplit.mockResolvedValue(apiResponse({ order: {}, payments: [] } as unknown as SplitPaymentResponse));
    await service.payWithSplit(
      VALID_UUID,
      { amount: 60, paymentMethod: 'CASH' },
      { amount: 40, paymentMethod: 'CARD_PHYSICAL' },
      100
    );
    expect(repo.payWithSplit).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: VALID_UUID,
        firstPayment: { amount: 60, paymentMethod: 'CASH' },
        secondPayment: { amount: 40, paymentMethod: 'CARD_PHYSICAL' },
      })
    );
  });

  it('listPayments throws when response is not successful', async () => {
    repo.listPayments.mockResolvedValue({
      success: false,
      data: null,
      timestamp: '',
    } as unknown as ApiResponse<PaymentResponse[]>);
    await expect(service.listPayments()).rejects.toThrow('No se pudieron obtener los pagos');
  });
});

describe('createRefund', () => {
  const repo = vi.mocked(paymentRepository);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws on invalid paymentId', async () => {
    await expect(service.createRefund(INVALID_UUID, 100)).rejects.toThrow('UUID válido');
  });

  it('throws on amount <= 0', async () => {
    await expect(service.createRefund(VALID_UUID, 0)).rejects.toThrow('mayor a 0');
  });

  it('calls repository with valid data', async () => {
    repo.createRefund.mockResolvedValue(apiResponse({ id: 'ref-1' } as RefundResponse));
    const result = await service.createRefund(VALID_UUID, 50, 'No le gustó');
    expect(repo.createRefund).toHaveBeenCalledWith(
      expect.objectContaining({ paymentId: VALID_UUID, amount: 50, reason: 'No le gustó' })
    );
    expect(result.id).toBe('ref-1');
  });
});
