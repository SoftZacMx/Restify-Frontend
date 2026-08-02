import { describe, it, expect } from 'vitest';
import { tableFormSchema } from './table.schema';

describe('tableFormSchema', () => {
  it('accepts a valid table', () => {
    const result = tableFormSchema.safeParse({
      name: 'Mesa 1',
      status: true,
      availabilityStatus: true,
    });
    expect(result.success).toBe(true);
  });

  it('rejects an empty name', () => {
    const result = tableFormSchema.safeParse({
      name: '',
      status: true,
      availabilityStatus: true,
    });
    expect(result.success).toBe(false);
  });

  it('rejects a name longer than 64 characters', () => {
    const result = tableFormSchema.safeParse({
      name: 'a'.repeat(65),
      status: true,
      availabilityStatus: true,
    });
    expect(result.success).toBe(false);
  });

  it('rejects non-boolean status fields', () => {
    const result = tableFormSchema.safeParse({
      name: 'Mesa 1',
      status: 'true',
      availabilityStatus: true,
    });
    expect(result.success).toBe(false);
  });
});
