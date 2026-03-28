import { test, expect } from '@playwright/test';

/**
 * E2E login flow.
 * Requires the backend API to be running for login to succeed.
 * If the backend is not available, the test will fail (user remains on login or sees error). rtest
 */
test.describe('Login', () => {
  test('user can open login page and see form', async ({ page }) => {
    await page.goto('/auth/login');

    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/contraseña/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /iniciar sesión/i })).toBeVisible();
  });

  test('user can log in and reach dashboard or POS', async ({ page }) => {
    await page.goto('/auth/login');

    await page.getByLabel(/email/i).fill('admin@restify.com');
    await page.getByLabel(/contraseña/i).fill('Restify123!');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    await expect(page).toHaveURL(/\/(dashboard|pos)/, { timeout: 15_000 });
    await expect(
      page.getByText(/ventas del día|crear\/editar orden|procesar pago|órdenes activas/i).first()
    ).toBeVisible({ timeout: 10_000 });
  });
});
