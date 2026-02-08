import { test, expect } from '@playwright/test';

/**
 * E2E POS - Flujo "Para Llevar".
 * Requiere backend API con: usuario, productos, categorías.
 * Agrega un producto por categoría, al menos 2 con extras; guarda orden; paga desde /orders.
 */
test.describe('POS - Para Llevar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.getByRole('button', { name: /iniciar sesión/i })).toBeVisible({ timeout: 10_000 });
    await page.getByLabel(/email/i).fill('admin@restify.com');
    await page.getByLabel(/contraseña/i).fill('Restify123!');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
    await expect(page).toHaveURL(/\/(dashboard|pos)/, { timeout: 20_000 });
  });

  test('usuario puede crear orden Para Llevar, guardar y procesar pago', async ({ page }) => {
    test.setTimeout(60_000);

    await page.goto('/pos');
    await expect(page).toHaveURL(/\/pos/);

    // Tipo de orden: Para Llevar
    await page.getByRole('button', { name: /para llevar/i }).click();

    // Nombre del cliente
    await page.getByLabel(/nombre del cliente/i).fill('Cliente E2E Takeout');

    // Esperar a que carguen productos (desaparece "Cargando productos...")
    await expect(page.getByText(/cargando productos/i)).not.toBeVisible({ timeout: 15_000 });
    // Si no hay productos, el test fallará al intentar agregar
    await expect(page.getByRole('button', { name: /agregar/i }).first()).toBeVisible({ timeout: 10_000 });

    // Categorías: obtener botones del filtro (Todas + categorías)
    const filterContainer = page.getByRole('button', { name: /^todas$/i }).locator('..');
    const categoryButtons = filterContainer.getByRole('button');
    const categoryCount = await categoryButtons.count();
    // categoryCount >= 1 (al menos "Todas"); categorías reales desde índice 1
    let extrasAdded = 0;
    const minExtras = 2;

    for (let i = 1; i < categoryCount; i++) {
      await categoryButtons.nth(i).click();
      await page.waitForTimeout(300);

      const addButtons = page.getByRole('button', { name: /agregar/i });
      const addCount = await addButtons.count();
      if (addCount === 0) continue;

      await addButtons.first().click();
      const addToCartBtn = page.getByRole('button', { name: /agregar al carrito/i });
      await expect(addToCartBtn).toBeVisible({ timeout: 10_000 });

      const dialog = page.locator('div.fixed.inset-0').filter({ has: addToCartBtn });
      const verExtras = dialog.getByRole('button', { name: /ver extras disponibles/i });
      const hasExtras = await verExtras.isVisible().catch(() => false);
      if (extrasAdded < minExtras && hasExtras) {
        await verExtras.click();
        await page.waitForTimeout(200);
        const switchInDialog = dialog.getByRole('switch').first();
        if (await switchInDialog.isVisible().catch(() => false)) {
          await switchInDialog.click();
          extrasAdded++;
        }
      }

      await addToCartBtn.click();
      await expect(dialog).not.toBeVisible({ timeout: 5_000 });
    }

    // Si no hay categorías además de "Todas", agregar al menos un producto desde "Todas"
    if (categoryCount <= 1) {
      await page.getByRole('button', { name: /^todas$/i }).click();
      await page.waitForTimeout(300);
      const addBtn = page.getByRole('button', { name: /agregar/i }).first();
      if (await addBtn.isVisible().catch(() => false)) {
        await addBtn.click();
        const addToCartBtn = page.getByRole('button', { name: /agregar al carrito/i });
        await expect(addToCartBtn).toBeVisible({ timeout: 10_000 });
        const dialog = page.locator('div.fixed.inset-0').filter({ has: addToCartBtn });
        const verExtras = dialog.getByRole('button', { name: /ver extras disponibles/i });
        if (extrasAdded < minExtras && (await verExtras.isVisible().catch(() => false))) {
          await verExtras.click();
          const sw = dialog.getByRole('switch').first();
          if (await sw.isVisible().catch(() => false)) await sw.click();
          extrasAdded++;
        }
        await addToCartBtn.click();
      }
    }

    // Guardar orden
    await page.getByRole('button', { name: /guardar orden/i }).click();
    await expect(page).toHaveURL(/\/orders/, { timeout: 15_000 });

    // En /orders: hacer clic en "Pagar" de la primera orden pendiente
    await expect(page.getByRole('button', { name: /pagar/i }).first()).toBeVisible({ timeout: 10_000 });
    await page.getByRole('button', { name: /pagar/i }).first().click();

    await expect(page).toHaveURL(/\/pos.*mode=pay/, { timeout: 10_000 });

    // Método de pago: Efectivo (Select custom: trigger por label, opción por texto en dropdown)
    await page.getByLabel(/primer método de pago/i).click();
    await expect(page.locator('div.absolute.z-50').getByText('Efectivo')).toBeVisible({ timeout: 5_000 });
    await page.locator('div.absolute.z-50').getByText('Efectivo').click();

    // Monto efectivo: valor alto para cubrir el total
    const amountInput = page.getByLabel(/monto/i).first();
    await amountInput.waitFor({ state: 'visible', timeout: 5_000 }).catch(() => {});
    if (await amountInput.isVisible().catch(() => false)) {
      await amountInput.fill('500');
    }

    // Procesar pago
    await page.getByTestId('pay-order').click();

    // Éxito: redirección a /orders
    await expect(page).toHaveURL(/\/orders/, { timeout: 15_000 });
  });
});
