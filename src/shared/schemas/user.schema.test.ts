import { describe, it, expect } from 'vitest';
import { userFormSchema } from './user.schema';

const validUser = {
  name: 'Juan',
  last_name: 'Pérez',
  second_last_name: 'García',
  email: 'juan@restify.com',
  phone: '5512345678',
  password: 'secret',
  rol: 'WAITER',
  status: true,
  branchIds: ['branch-1'],
};

describe('userFormSchema', () => {
  it('accepts a valid user', () => {
    const result = userFormSchema.safeParse(validUser);
    expect(result.success).toBe(true);
  });

  it('accepts optional fields (second_last_name, phone, branchIds)', () => {
    const result = userFormSchema.safeParse({
      ...validUser,
      second_last_name: '',
      phone: '',
      branchIds: [],
    });
    expect(result.success).toBe(true);
  });

  it('accepts every valid rol', () => {
    for (const rol of ['WAITER', 'CHEF', 'MANAGER', 'ADMIN']) {
      const result = userFormSchema.safeParse({ ...validUser, rol });
      expect(result.success).toBe(true);
    }
  });

  it('rejects an unknown rol', () => {
    const result = userFormSchema.safeParse({ ...validUser, rol: 'OWNER' });
    expect(result.success).toBe(false);
  });

  it('rejects empty name and last_name', () => {
    expect(userFormSchema.safeParse({ ...validUser, name: '' }).success).toBe(false);
    expect(userFormSchema.safeParse({ ...validUser, last_name: '' }).success).toBe(false);
  });

  it('rejects name and last_name longer than 100 chars', () => {
    const long = 'a'.repeat(101);
    expect(userFormSchema.safeParse({ ...validUser, name: long }).success).toBe(false);
    expect(userFormSchema.safeParse({ ...validUser, last_name: long }).success).toBe(false);
    expect(userFormSchema.safeParse({ ...validUser, second_last_name: long }).success).toBe(false);
  });

  it('rejects an invalid email format', () => {
    const result = userFormSchema.safeParse({ ...validUser, email: 'not-an-email' });
    expect(result.success).toBe(false);
  });

  it('rejects a phone that does not have 10 digits', () => {
    expect(userFormSchema.safeParse({ ...validUser, phone: '123' }).success).toBe(false);
    expect(userFormSchema.safeParse({ ...validUser, phone: '55123456789' }).success).toBe(false);
  });

  it('accepts a phone with formatting characters that total 10 digits', () => {
    const result = userFormSchema.safeParse({ ...validUser, phone: '(55) 1234-5678' });
    expect(result.success).toBe(true);
  });
});
