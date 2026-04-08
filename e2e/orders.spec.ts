import { test, expect } from '@playwright/test';
import { E2E_USER } from './config';

/**
 * E2E orders page.
 * Requires backend API and user to be able to log in.
 * Logs in then navigates to /orders and checks the page.
 */
test.describe('Orders', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
    await page.getByLabel(/email/i).fill(E2E_USER.email);
    await page.getByLabel(/contraseña/i).fill(E2E_USER.password);
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
    await expect(page).toHaveURL(/\/(dashboard|pos)/, { timeout: 15_000 });
  });

  test('user can open orders page and see header and actions', async ({ page }) => {
    await page.goto('/orders');

    await expect(page).toHaveURL(/\/orders/);
    await expect(page.getByRole('heading', { name: /órdenes/i })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('button', { name: /nueva orden/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /actualizar/i })).toBeVisible();
  });

  test('orders page shows list or empty state', async ({ page }) => {
    await page.goto('/orders');

    await expect(page).toHaveURL(/\/orders/);
    await expect(
      page.getByText(/no hay órdenes|las órdenes aparecerán aquí|cargando órdenes/i).first()
    ).toBeVisible({ timeout: 15_000 });
  });
});
