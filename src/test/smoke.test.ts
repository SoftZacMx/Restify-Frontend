import { describe, it, expect } from 'vitest';

/**
 * Smoke test: verifies the test environment works.
 * - Vitest runs and describe/it/expect are available.
 * - If it fails, the issue is config or dependencies.
 */
describe('Smoke test – test environment', () => {
  it('runs a basic assertion', () => {
    expect(1).toBe(1);
  });

  it('resolves the @/ alias (import from project)', async () => {
    const { cn } = await import('@/shared/lib/utils');
    expect(cn).toBeDefined();
    expect(typeof cn).toBe('function');
    expect(cn('a', 'b')).toBe('a b');
  });
});
