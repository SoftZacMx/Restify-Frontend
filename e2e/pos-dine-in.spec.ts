import { test, expect } from '@playwright/test';

/**
 * E2E POS - Flujo "Para Comer Aquí" (local).
 * Requiere backend API con: usuario, productos, categorías, al menos una mesa disponible.
 * Agrega un producto por categoría, al menos 2 con extras; guarda orden; paga desde /orders.
 */
test.describe('POS - Para Comer Aquí', () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
    // Esperar a que el formulario de login esté listo antes de rellenar
    await expect(page.getByRole('button', { name: /iniciar sesión/i })).toBeVisible({ timeout: 10_000 });
    await page.getByLabel(/email/i).fill('admin@restify.com');
    await page.getByLabel(/contraseña/i).fill('Restify123!');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
    // Tras login exitoso la app redirige a /dashboard o /pos (requiere backend en marcha)
    await expect(page).toHaveURL(/\/(dashboard|pos)/, { timeout: 20_000 });
  });

  test('usuario puede crear orden Para Comer Aquí, guardar y procesar pago', async ({ page }) => {
    test.setTimeout(60_000);

    await page.goto('/pos');
    await expect(page).toHaveURL(/\/pos/);

    // Tipo de orden: Para Comer Aquí
    await page.getByRole('button', { name: /para comer aquí/i }).click();

    // Esperar mesas y seleccionar la primera mesa disponible
    await expect(page.getByText(/cargando mesas/i)).not.toBeVisible({ timeout: 10_000 });
    const tableButtons = page.getByRole('button', { name: /mesa \d+/i });
    const tableCount = await tableButtons.count();
    expect(tableCount).toBeGreaterThan(0);
    let tableClicked = false;
    for (let i = 0; i < tableCount; i++) {
      const btn = tableButtons.nth(i);
      const disabled = await btn.getAttribute('disabled');
      if (!disabled) {
        await btn.click();
        tableClicked = true;
        break;
      }
    }
    expect(tableClicked).toBe(true);

    // Esperar productos
    await expect(page.getByText(/cargando productos/i)).not.toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('button', { name: /agregar/i }).first()).toBeVisible({ timeout: 10_000 });

    // Un producto por categoría, al menos 2 con extras
    const filterContainer = page.getByRole('button', { name: /^todas$/i }).locator('..');
    const categoryButtons = filterContainer.getByRole('button');
    const categoryCount = await categoryButtons.count();
    let extrasAdded = 0;
    const minExtras = 2;

    for (let i = 1; i < categoryCount; i++) {
      await categoryButtons.nth(i).click();
      await page.waitForTimeout(300);

      const addButtons = page.getByRole('button', { name: /agregar/i });
      if ((await addButtons.count()) === 0) continue;

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

    // Si solo hay "Todas", agregar al menos un producto
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

    // En /orders: Pagar primera orden pendiente
    await expect(page.getByRole('button', { name: /pagar/i }).first()).toBeVisible({ timeout: 10_000 });
    await page.getByRole('button', { name: /pagar/i }).first().click();

    await expect(page).toHaveURL(/\/pos.*mode=pay/, { timeout: 10_000 });

    // Método de pago: Efectivo (Select custom: trigger por label, opción por texto dentro del dropdown)
    await page.getByLabel(/primer método de pago/i).click();
    await expect(page.locator('div.absolute.z-50').getByText('Efectivo')).toBeVisible({ timeout: 5_000 });
    await page.locator('div.absolute.z-50').getByText('Efectivo').click();

    const amountInput = page.getByLabel(/monto/i).first();
    await amountInput.waitFor({ state: 'visible', timeout: 5_000 }).catch(() => {});
    if (await amountInput.isVisible().catch(() => false)) {
      await amountInput.fill('500');
    }

    await page.getByTestId('pay-order').click();

    await expect(page).toHaveURL(/\/orders/, { timeout: 15_000 });
  });
});
