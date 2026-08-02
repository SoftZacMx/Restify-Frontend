import { describe, it, expect } from 'vitest';
import {
  calculatePasswordStrength,
  getPasswordStrengthPercentage,
  getPasswordStrengthLabel,
  getPasswordStrengthColor,
  getPasswordStrengthTextColor,
} from './password.utils';

describe('calculatePasswordStrength', () => {
  it('returns weak for empty or very short passwords', () => {
    expect(calculatePasswordStrength('')).toBe('weak');
    expect(calculatePasswordStrength('a')).toBe('weak');
    expect(calculatePasswordStrength('abcdefgh')).toBe('weak');
  });

  it('returns medium when only some criteria are met', () => {
    expect(calculatePasswordStrength('abcdefgh1')).toBe('medium');
    expect(calculatePasswordStrength('Abcd1234')).toBe('medium');
  });

  it('returns strong when length and all character classes are present', () => {
    expect(calculatePasswordStrength('Abcdefgh1!')).toBe('strong');
    expect(calculatePasswordStrength('Abcdefghij1!')).toBe('strong');
  });
});

describe('getPasswordStrengthPercentage', () => {
  it('maps strength to 33/66/100', () => {
    expect(getPasswordStrengthPercentage('')).toBe(33);
    expect(getPasswordStrengthPercentage('abcdefgh1')).toBe(66);
    expect(getPasswordStrengthPercentage('Abcdefgh1!')).toBe(100);
  });
});

describe('getPasswordStrengthLabel', () => {
  it('returns the Spanish label', () => {
    expect(getPasswordStrengthLabel('')).toBe('Débil');
    expect(getPasswordStrengthLabel('abcdefgh1')).toBe('Media');
    expect(getPasswordStrengthLabel('Abcdefgh1!')).toBe('Fuerte');
  });
});

describe('getPasswordStrengthColor', () => {
  it('returns the matching bar color', () => {
    expect(getPasswordStrengthColor('')).toBe('bg-red-500');
    expect(getPasswordStrengthColor('abcdefgh1')).toBe('bg-yellow-500');
    expect(getPasswordStrengthColor('Abcdefgh1!')).toBe('bg-green-500');
  });
});

describe('getPasswordStrengthTextColor', () => {
  it('returns the matching text color', () => {
    expect(getPasswordStrengthTextColor('')).toBe('text-red-500');
    expect(getPasswordStrengthTextColor('abcdefgh1')).toBe('text-yellow-500');
    expect(getPasswordStrengthTextColor('Abcdefgh1!')).toBe('text-green-500');
  });
});
