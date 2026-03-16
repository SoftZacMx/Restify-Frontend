import { test, expect } from '@playwright/test';

/** Parsea texto de moneda (ej. "$245.00") a número para comparar totales. */
function parseCurrency(text: string): number {
  return parseFloat(text.replace(/[$,]/g, '').trim()) || 0;
}

/**
 * E2E POS - Flujo "Para Comer Aquí" (local).
 * Requiere backend API con: usuario, productos, categorías, al menos una mesa disponible.
 * Agrega un producto por categoría, al menos 2 con extras; guarda orden; paga desde /orders.
 * Valida que los totales mostrados coincidan (suma de ítems = total) antes de guardar y en la vista de pago.
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

    // Esperar diálogo de mesas y seleccionar la primera mesa disponible (LIBRE)
    await expect(page.getByRole('heading', { name: /seleccionar mesa/i })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/cargando mesas/i)).not.toBeVisible({ timeout: 10_000 });
    const tableDialog = page.locator('div.fixed.inset-0').filter({ has: page.getByRole('heading', { name: /seleccionar mesa/i }) });
    const firstFreeTable = tableDialog.getByRole('button', { name: /libre/i }).first();
    await expect(firstFreeTable).toBeVisible({ timeout: 5_000 });
    await firstFreeTable.click();
    await expect(tableDialog).not.toBeVisible({ timeout: 5_000 });

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
      const categoryBtn = categoryButtons.nth(i);
      const btnText = await categoryBtn.textContent();
      if (btnText?.trim().toLowerCase().includes('mostrar más')) continue;
      await categoryBtn.click();
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

    // Validar totales antes de guardar: suma de totales por ítem = total del carrito
    await expect(page.getByTestId('cart-total')).toBeVisible({ timeout: 5_000 });
    const itemTotalEls = page.getByTestId('cart-item-total-value');
    const itemCount = await itemTotalEls.count();
    let sum = 0;
    for (let i = 0; i < itemCount; i++) {
      const text = await itemTotalEls.nth(i).textContent();
      sum += parseCurrency(text ?? '');
    }
    const cartTotalText = await page.getByTestId('cart-total').textContent();
    const cartTotal = parseCurrency(cartTotalText ?? '');
    expect(Math.abs(sum - cartTotal)).toBeLessThan(0.02); // tolerancia por redondeos

    // Guardar orden
    await page.getByRole('button', { name: /guardar orden/i }).click();
    await expect(page).toHaveURL(/\/orders/, { timeout: 15_000 });

    // En /orders: Pagar primera orden pendiente
    await expect(page.getByRole('button', { name: /pagar/i }).first()).toBeVisible({ timeout: 10_000 });
    await page.getByRole('button', { name: /pagar/i }).first().click();

    await expect(page).toHaveURL(/\/pos.*mode=pay/, { timeout: 10_000 });

    // Validar totales en vista de pago: suma de ítems = order-total = payment-total
    const orderTotalEl = page.getByTestId('order-total');
    await expect(orderTotalEl).toBeVisible({ timeout: 5_000 });
    const orderItemTotalEls = page.getByTestId('order-item-total');
    let orderItemsSum = 0;
    const orderItemCount = await orderItemTotalEls.count();
    for (let i = 0; i < orderItemCount; i++) {
      const text = await orderItemTotalEls.nth(i).textContent();
      orderItemsSum += parseCurrency(text ?? '');
    }
    const orderTotalValue = parseCurrency((await orderTotalEl.textContent()) ?? '');
    expect(Math.abs(orderItemsSum - orderTotalValue)).toBeLessThan(0.02);
    const paymentTotalValue = parseCurrency((await page.getByTestId('payment-total').textContent()) ?? '');
    expect(Math.abs(orderTotalValue - paymentTotalValue)).toBeLessThan(0.02);

    // Método de pago: Efectivo — clic en la fila (SelectItem), no en el span, para evitar "outside viewport"
    await page.getByLabel(/primer método de pago/i).click();
    const selectContent = page.locator('[data-select-content]');
    const efectivoOption = selectContent.locator('div.cursor-pointer').filter({ hasText: 'Efectivo' }).first();
    await expect(efectivoOption).toBeVisible({ timeout: 5_000 });
    await efectivoOption.click();

    const amountInput = page.getByLabel(/monto/i).first();
    await amountInput.waitFor({ state: 'visible', timeout: 5_000 }).catch(() => {});
    if (await amountInput.isVisible().catch(() => false)) {
      await amountInput.fill('500');
    }

    await page.getByTestId('pay-order').click();

    await expect(page).toHaveURL(/\/orders/, { timeout: 15_000 });
  });
});
