
import { test, expect } from '@playwright/test';
import { E2E_USER } from './config';

/**
 * E2E POS - Pago diferido (pago dividido).
 * Flujo: login → crear orden → /orders → seleccionar orden y "Pagar" → vista POS con flag de pago →
 * dividir pago en dos métodos, distribuir el monto, procesar → orden queda Pagada.
 * Requiere backend API con usuario, productos, categorías.
 */
test.describe('POS - Pago diferido (dividido)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.getByRole('button', { name: /iniciar sesión/i })).toBeVisible({ timeout: 10_000 });
    await page.getByLabel(/email/i).fill(E2E_USER.email);
    await page.getByLabel(/contraseña/i).fill(E2E_USER.password);
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
    await expect(page).toHaveURL(/\/(dashboard|pos)/, { timeout: 20_000 });
  });

  test('usuario crea orden, va a pagar desde órdenes y aplica pago dividido (distribuir monto, orden queda Pagada)', async ({ page }) => {
    test.setTimeout(60_000);

    await page.goto('/pos');
    await expect(page).toHaveURL(/\/pos/);

    await page.getByRole('button', { name: /para llevar/i }).click();
    await page.getByLabel(/nombre del cliente/i).fill('Cliente E2E Pago Diferido');

    await expect(page.getByText(/cargando productos/i)).not.toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('button', { name: /agregar/i }).first()).toBeVisible({ timeout: 10_000 });

    const filterContainer = page.getByRole('button', { name: /^todas$/i }).locator('..');
    const categoryButtons = filterContainer.getByRole('button');
    const categoryCount = await categoryButtons.count();
    let added = 0;
    const minProducts = 2;

    for (let i = 1; i < categoryCount && added < minProducts; i++) {
      const btnText = await categoryButtons.nth(i).textContent();
      if (btnText?.trim().toLowerCase().includes('mostrar más')) continue;
      await categoryButtons.nth(i).click();
      await page.waitForTimeout(300);
      const addButtons = page.getByRole('button', { name: /agregar/i });
      if ((await addButtons.count()) === 0) continue;
      await addButtons.first().click();
      const addToCartBtn = page.getByRole('button', { name: /agregar al carrito/i });
      await expect(addToCartBtn).toBeVisible({ timeout: 10_000 });
      await addToCartBtn.click();
      await expect(page.locator('div.fixed.inset-0').filter({ has: addToCartBtn })).not.toBeVisible({ timeout: 5_000 });
      added++;
    }

    if (added < minProducts) {
      await page.getByRole('button', { name: /^todas$/i }).click();
      await page.waitForTimeout(300);
      for (let j = added; j < minProducts; j++) {
        const addBtn = page.getByRole('button', { name: /agregar/i }).first();
        if (!(await addBtn.isVisible().catch(() => false))) break;
        await addBtn.click();
        const addToCartBtn = page.getByRole('button', { name: /agregar al carrito/i });
        await expect(addToCartBtn).toBeVisible({ timeout: 10_000 });
        await addToCartBtn.click();
        await page.waitForTimeout(300);
      }
    }

    // Guardar orden → redirección a /orders
    await page.getByRole('button', { name: /guardar orden/i }).click();
    await expect(page).toHaveURL(/\/orders/, { timeout: 15_000 });

    // Desde órdenes: seleccionar la orden y abrir vista de pago (Pagar)
    await expect(page.getByRole('button', { name: /pagar/i }).first()).toBeVisible({ timeout: 10_000 });
    await page.getByRole('button', { name: /pagar/i }).first().click();
    await expect(page).toHaveURL(/\/pos.*mode=pay/, { timeout: 10_000 });

    // Obtener el total de la orden (para distribuir entre dos métodos)
    const totalText = await page.getByTestId('payment-total').textContent();
    const total = parseFloat((totalText || '0').replace(/[$,]/g, '').trim()) || 0;
    const amount1 = Math.floor(total * 50) / 100;
    const amount2 = Math.round((total - amount1) * 100) / 100;

    // Método 1: Efectivo (botón horizontal, no select)
    await page.getByRole('button', { name: /^efectivo$/i }).first().click();
    await page.getByTestId('payment-amount-1').fill(amount1.toFixed(2));

    // Activar pago dividido
    await page.getByTestId('payment-split-toggle').click({ force: true });
    await page.waitForTimeout(300);

    // Método 2: Tarjeta — segundo botón "Tarjeta" en la página (el de la fila "Segundo método de pago")
    await page.getByRole('button', { name: /^tarjeta$/i }).nth(1).click();
    await page.getByTestId('payment-amount-2').fill(amount2.toFixed(2));

    // Procesar pago
    await page.getByTestId('pay-order').click();
    await expect(page).toHaveURL(/\/orders/, { timeout: 15_000 });

    // La orden queda Pagada
    await expect(page.getByText(/pagada/i).first()).toBeVisible({ timeout: 10_000 });
  });
});
