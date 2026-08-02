import { describe, it, expect } from 'vitest';
import { branchFormSchema } from './branch.schema';

const validBranch = {
  name: 'Sucursal Centro',
  state: 'CDMX',
  city: 'Ciudad de México',
  street: 'Av. Insurgentes',
  exteriorNumber: '123-A',
  phone: '5512345678',
  rfc: '',
  logoUrl: '',
  startOperations: '',
  endOperations: '',
};

describe('branchFormSchema', () => {
  it('accepts a valid branch with optional fields empty', () => {
    expect(branchFormSchema.safeParse(validBranch).success).toBe(true);
  });

  it('accepts a fully populated branch', () => {
    const result = branchFormSchema.safeParse({
      ...validBranch,
      rfc: 'DEL123456789',
      logoUrl: 'https://example.com/logo.png',
      startOperations: '08:30',
      endOperations: '22:00',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty required fields', () => {
    for (const field of ['name', 'state', 'city', 'street', 'exteriorNumber', 'phone']) {
      expect(branchFormSchema.safeParse({ ...validBranch, [field]: '' }).success).toBe(false);
    }
  });

  it('trims whitespace from name', () => {
    const result = branchFormSchema.safeParse({ ...validBranch, name: '  Sucursal Norte  ' });
    expect(result.success).toBe(true);
    expect(result.data?.name).toBe('Sucursal Norte');
  });

  it('enforces field length limits', () => {
    expect(branchFormSchema.safeParse({ ...validBranch, name: 'a'.repeat(201) }).success).toBe(false);
    expect(branchFormSchema.safeParse({ ...validBranch, state: 'a'.repeat(101) }).success).toBe(false);
    expect(branchFormSchema.safeParse({ ...validBranch, street: 'a'.repeat(201) }).success).toBe(false);
    expect(branchFormSchema.safeParse({ ...validBranch, exteriorNumber: 'a'.repeat(11) }).success).toBe(false);
    expect(branchFormSchema.safeParse({ ...validBranch, rfc: 'A'.repeat(21) }).success).toBe(false);
    expect(branchFormSchema.safeParse({ ...validBranch, logoUrl: `https://x.com/${'a'.repeat(500)}` }).success).toBe(false);
  });

  describe('exteriorNumber', () => {
    it('accepts letters, numbers, spaces and hyphens', () => {
      expect(branchFormSchema.safeParse({ ...validBranch, exteriorNumber: '12 B' }).success).toBe(true);
    });

    it('rejects special characters', () => {
      expect(branchFormSchema.safeParse({ ...validBranch, exteriorNumber: '123@' }).success).toBe(false);
    });
  });

  describe('phone', () => {
    it('requires exactly 10 digits', () => {
      expect(branchFormSchema.safeParse({ ...validBranch, phone: '551234567' }).success).toBe(false);
      expect(branchFormSchema.safeParse({ ...validBranch, phone: '55123456789' }).success).toBe(false);
    });

    it('rejects non-digit characters', () => {
      expect(branchFormSchema.safeParse({ ...validBranch, phone: '55-1234-5678' }).success).toBe(false);
    });
  });

  describe('rfc', () => {
    it('accepts uppercase alphanumeric values', () => {
      expect(branchFormSchema.safeParse({ ...validBranch, rfc: 'DEL123456789' }).success).toBe(true);
    });

    it('rejects lowercase or special characters', () => {
      expect(branchFormSchema.safeParse({ ...validBranch, rfc: 'del123' }).success).toBe(false);
      expect(branchFormSchema.safeParse({ ...validBranch, rfc: 'DEL-123' }).success).toBe(false);
    });
  });

  describe('logoUrl', () => {
    it('rejects invalid URLs', () => {
      expect(branchFormSchema.safeParse({ ...validBranch, logoUrl: 'not-a-url' }).success).toBe(false);
    });
  });

  describe('operating hours', () => {
    it('accepts valid 24h times or empty string', () => {
      expect(branchFormSchema.safeParse({ ...validBranch, startOperations: '09:05' }).success).toBe(true);
      expect(branchFormSchema.safeParse({ ...validBranch, endOperations: '23:59' }).success).toBe(true);
    });

    it('rejects malformed times', () => {
      expect(branchFormSchema.safeParse({ ...validBranch, startOperations: '9:05' }).success).toBe(false);
      expect(branchFormSchema.safeParse({ ...validBranch, startOperations: '25:00' }).success).toBe(false);
      expect(branchFormSchema.safeParse({ ...validBranch, startOperations: '12:60' }).success).toBe(false);
    });
  });
});
