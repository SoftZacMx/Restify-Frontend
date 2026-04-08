import { test, expect } from '@playwright/test';
import { E2E_USER } from './config';

/**
 * E2E POS - Flujo crear orden → editar (agregar/quitar productos) → guardar → pagar.
 * Requiere backend API con usuario, productos, categorías.
 */
test.describe('POS - Crear, Editar y Pagar', () => {
  test.describe.configure({ timeout: 90_000 });

  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.getByRole('button', { name: /iniciar sesión/i })).toBeVisible({ timeout: 10_000 });
    await page.getByLabel(/email/i).fill(E2E_USER.email);
    await page.getByLabel(/contraseña/i).fill(E2E_USER.password);
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
    await expect(page).toHaveURL(/\/(dashboard|pos)/, { timeout: 20_000 });
  });

  test('usuario puede crear orden, editar (agregar y quitar productos) y luego pagar', async ({ page }) => {
    // --- CREAR ORDEN (Para Llevar, 2 productos mínimos) ---
    await page.goto('/pos');
    await expect(page).toHaveURL(/\/pos/);

    await page.getByRole('button', { name: /para llevar/i }).click();
    await page.getByLabel(/nombre del cliente/i).fill('Cliente E2E Editar');

    await expect(page.getByText(/cargando productos/i)).not.toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('button', { name: /agregar/i }).first()).toBeVisible({ timeout: 10_000 });

    const filterContainer = page.getByRole('button', { name: /^todas$/i }).locator('..');
    const categoryButtons = filterContainer.getByRole('button');
    const categoryCount = await categoryButtons.count();
    let added = 0;
    const minProducts = 2;

    for (let i = 1; i < categoryCount && added < minProducts; i++) {
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

    await page.getByRole('button', { name: /guardar orden/i }).click();
    await expect(page).toHaveURL(/\/orders/, { timeout: 15_000 });

    // --- ABRIR ORDEN PARA EDITAR (tres puntos → Ver/Editar en POS) ---
    await expect(page.getByRole('button', { name: /pagar/i }).first()).toBeVisible({ timeout: 10_000 });
    const firstPendingCard = page.getByRole('button', { name: /pagar/i }).first().locator('..').locator('..');
    // Botón de tres puntos (Más acciones) en la misma tarjeta que "Pagar"
    await firstPendingCard.locator('button[title="Más acciones"]').click();
    await expect(page.getByText('Ver/Editar en POS')).toBeVisible({ timeout: 5_000 });
    await page.getByText('Ver/Editar en POS').click();

    await expect(page).toHaveURL(/\/pos.*mode=edit|orderId=/, { timeout: 10_000 });

    // --- EDITAR: quitar un producto del carrito ---
    const cartCard = page.getByRole('heading', { name: /carrito/i }).locator('..').locator('..').locator('..');
    const removeButtons = cartCard.getByRole('button');
    const removeCount = await removeButtons.count();
    if (removeCount > 0) {
      await removeButtons.first().click();
      await page.waitForTimeout(300);
    }

    // --- EDITAR: agregar un producto más ---
    await page.getByRole('button', { name: /^todas$/i }).click();
    await page.waitForTimeout(300);
    const addButtons = page.getByRole('button', { name: /agregar/i });
    if ((await addButtons.count()) > 0) {
      await addButtons.first().click();
      const addToCartBtn = page.getByRole('button', { name: /agregar al carrito/i });
      await expect(addToCartBtn).toBeVisible({ timeout: 10_000 });
      await addToCartBtn.click();
      await page.waitForTimeout(200);
    }

    // --- GUARDAR CAMBIOS ---
    await page.getByRole('button', { name: /guardar cambios/i }).click();
    await expect(page).toHaveURL(/\/orders/, { timeout: 15_000 });

    // --- PAGAR ---
    await expect(page.getByRole('button', { name: /pagar/i }).first()).toBeVisible({ timeout: 10_000 });
    await page.getByRole('button', { name: /pagar/i }).first().click();

    await expect(page).toHaveURL(/\/pos.*mode=pay/, { timeout: 10_000 });

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
