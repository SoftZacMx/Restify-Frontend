import { test, expect } from '@playwright/test';

/**
 * E2E expenses: create expense (merchandise), verify calculations and that it is saved.
 * Requires backend API running (auth + products for merchandise).
 */
test.describe('Expenses', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
    await page.getByLabel(/email/i).fill('admin@restify.com');
    await page.getByLabel(/contraseña/i).fill('Restify123!');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
    await expect(page).toHaveURL(/\/(dashboard|pos)/, { timeout: 15_000 });
  });

  test('user can open expenses page and see header', async ({ page }) => {
    await page.goto('/expenses');

    await expect(page).toHaveURL(/\/expenses/);
    await expect(page.getByRole('heading', { name: /gastos/i })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('button', { name: /nuevo gasto/i })).toBeVisible();
  });

  test('create merchandise expense: calculations and save to backend', async ({ page }) => {
    test.setTimeout(90_000);
    const title = `E2E Gasto Mercancía ${Date.now()}`;

    // 3 productos: cantidad × precio unitario → total por línea; la suma debe coincidir con Subtotal y Total
    const items: { quantity: number; unit: string; unitPrice: number }[] = [
      { quantity: 3, unit: 'Piezas', unitPrice: 100 },   // 300
      { quantity: 2, unit: 'Kilogramos', unitPrice: 50 }, // 100
      { quantity: 1, unit: 'Gramos', unitPrice: 10 },     // 10
    ];
    const expectedTotal = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0); // 410

    await page.goto('/expenses');
    await expect(page).toHaveURL(/\/expenses/);
    await expect(page.getByRole('heading', { name: /gastos/i })).toBeVisible({ timeout: 10_000 });

    await page.getByRole('button', { name: /nuevo gasto/i }).click();

    const form = page.locator('form').filter({ has: page.getByLabel(/título del gasto/i) });
    await expect(form).toBeVisible();
    await expect(page.getByRole('heading', { name: /nuevo gasto/i })).toBeVisible();

    await form.getByLabel(/título del gasto/i).fill(title);
    const typeTrigger = page.getByRole('button', { name: /seleccionar tipo|tipo de gasto/i });
    await typeTrigger.first().click({ timeout: 15_000 });
    await page.locator('[data-select-content]').getByText('Compra de mercancía', { exact: true }).click({ timeout: 10_000 });

    await form.getByLabel(/fecha de compra/i).fill(new Date().toISOString().split('T')[0]);
    await form.getByRole('button', { name: /método de pago|seleccionar método|transferencia|efectivo|tarjeta/i }).click();
    await page.locator('[data-select-content]').getByText('Transferencia', { exact: true }).click({ timeout: 10_000 });

    await expect(form.getByText(/detalle de la compra/i)).toBeVisible({ timeout: 5_000 });

    const detailSection = form.locator('section').filter({ hasText: /detalle de la compra/i });

    const openProductDialogAndSelectFirst = async () => {
      const productDialog = page.locator('div').filter({ has: page.getByRole('heading', { name: /seleccionar producto/i }) }).first();
      await expect(productDialog).toBeVisible({ timeout: 5_000 });
      const firstProduct = productDialog.getByRole('button').filter({ hasText: /activo|inactivo/i }).first();
      await firstProduct.waitFor({ state: 'visible', timeout: 10_000 });
      await firstProduct.click();
      await productDialog.getByRole('button', { name: /añadir seleccionado/i }).click();
      await expect(productDialog).not.toBeVisible({ timeout: 10_000 });
    };

    const fillRow = async (
      row: ReturnType<typeof page.locator>,
      item: { quantity: number; unit: string; unitPrice: number }
    ) => {
      await row.getByPlaceholder('0', { exact: true }).fill(String(item.quantity));
      await row.getByRole('button', { name: /—|ninguna|kilogramos|piezas|gramos|otros/i }).click();
      const unitOption = page.locator('[data-select-content]').getByText(item.unit, { exact: true });
      await unitOption.waitFor({ state: 'visible', timeout: 10_000 });
      await unitOption.evaluate((el: HTMLElement) => el.click());
      await row.getByPlaceholder('$ 0').fill(String(item.unitPrice));
    };

    // 1.º producto: usar la fila que ya existe por defecto ("Seleccionar producto")
    await detailSection.getByRole('button', { name: /seleccionar producto/i }).first().click();
    await openProductDialogAndSelectFirst();
    const firstRow = detailSection.getByPlaceholder('0', { exact: true }).first().locator('..').locator('..');
    await firstRow.getByPlaceholder('0', { exact: true }).waitFor({ state: 'visible', timeout: 15_000 });
    await fillRow(firstRow, items[0]);

    // 2.º y 3.º producto: agregar ítem y rellenar la nueva fila (última)
    for (const item of items.slice(1)) {
      await form.getByRole('button', { name: /agregar ítem/i }).click();
      await openProductDialogAndSelectFirst();
      const amountInput = detailSection.getByPlaceholder('0', { exact: true }).last();
      await amountInput.waitFor({ state: 'visible', timeout: 15_000 });
      const row = amountInput.locator('..').locator('..');
      await fillRow(row, item);
    }

    // Subtotal y Total deben ser la suma de (cantidad × precio) de cada ítem
    const totalRegex = new RegExp(`\\$${expectedTotal}[,.]00`);
    await expect(form.getByTestId('expense-form-subtotal')).toHaveText(totalRegex, { timeout: 5_000 });
    await expect(form.getByTestId('expense-form-total')).toHaveText(totalRegex, { timeout: 5_000 });
    await expect(form.getByTestId('expense-form-total-label')).toHaveText(/total a pagar/i);

    await form.getByRole('button', { name: /guardar gasto/i }).click();

    await expect(form).not.toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/gasto creado exitosamente/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(title)).toBeVisible({ timeout: 10_000 });

    // Persistencia: filtrar por "Compra de mercancía" y comprobar que el gasto aparece con el total correcto
    await page.getByRole('button', { name: /compra de mercancía/i }).click();
    const expenseRow = page.getByRole('row').filter({ has: page.getByText(title) });
    await expect(expenseRow).toBeVisible({ timeout: 5_000 });
    await expect(expenseRow.getByText(/410/)).toBeVisible();
  });

  test('validación: no permite guardar compra de mercancía sin ítems', async ({ page }) => {
    test.setTimeout(45_000);
    await page.goto('/expenses');
    await expect(page).toHaveURL(/\/expenses/);
    await page.getByRole('button', { name: /nuevo gasto/i }).click();

    const form = page.locator('form').filter({ has: page.getByLabel(/título del gasto/i) });
    await form.getByLabel(/título del gasto/i).fill('Gasto sin ítems');
    const typeTrigger = page.getByRole('button', { name: /seleccionar tipo|tipo de gasto/i });
    await typeTrigger.first().click({ timeout: 10_000 });
    await page.locator('[data-select-content]').getByText('Compra de mercancía', { exact: true }).click({ timeout: 10_000 });
    await form.getByLabel(/fecha de compra/i).fill(new Date().toISOString().split('T')[0]);
    await form.getByRole('button', { name: /método de pago|seleccionar método/i }).click();
    await page.locator('[data-select-content]').getByText('Transferencia', { exact: true }).click({ timeout: 10_000 });

    await form.getByRole('button', { name: /guardar gasto/i }).click();

    await expect(form).toBeVisible();
    await expect(page.getByText(/debes agregar al menos un ítem/i)).toBeVisible({ timeout: 5_000 });
  });

  test('validación: título vacío muestra error', async ({ page }) => {
    test.setTimeout(45_000);
    await page.goto('/expenses');
    await expect(page).toHaveURL(/\/expenses/);
    await page.getByRole('button', { name: /nuevo gasto/i }).click();

    const form = page.locator('form').filter({ has: page.getByLabel(/título del gasto/i) });
    await form.getByLabel(/título del gasto/i).fill('');
    const typeTrigger = page.getByRole('button', { name: /seleccionar tipo|tipo de gasto/i });
    await typeTrigger.first().click({ timeout: 10_000 });
    await page.locator('[data-select-content]').getByText('Compra de mercancía', { exact: true }).click({ timeout: 10_000 });
    await form.getByLabel(/fecha de compra/i).fill(new Date().toISOString().split('T')[0]);
    await form.getByRole('button', { name: /método de pago|seleccionar método/i }).click();
    await page.locator('[data-select-content]').getByText('Transferencia', { exact: true }).click({ timeout: 10_000 });

    await form.getByRole('button', { name: /guardar gasto/i }).click();

    await expect(form).toBeVisible();
    await expect(page.getByText(/título del gasto es requerido/i)).toBeVisible({ timeout: 5_000 });
  });

  test('cancelar diálogo de producto no añade fila ni cambia total', async ({ page }) => {
    test.setTimeout(45_000);
    await page.goto('/expenses');
    await expect(page).toHaveURL(/\/expenses/);
    await page.getByRole('button', { name: /nuevo gasto/i }).click();

    const form = page.locator('form').filter({ has: page.getByLabel(/título del gasto/i) });
    const typeTrigger = page.getByRole('button', { name: /seleccionar tipo|tipo de gasto/i });
    await typeTrigger.first().click({ timeout: 10_000 });
    await page.locator('[data-select-content]').getByText('Compra de mercancía', { exact: true }).click({ timeout: 10_000 });
    await expect(form.getByText(/detalle de la compra/i)).toBeVisible({ timeout: 5_000 });

    await form.getByRole('button', { name: /agregar ítem/i }).click();
    const productDialog = page.locator('div').filter({ has: page.getByRole('heading', { name: /seleccionar producto/i }) }).first();
    await expect(productDialog).toBeVisible({ timeout: 5_000 });
    await productDialog.getByRole('button', { name: /cancelar/i }).first().click();
    await expect(productDialog).not.toBeVisible({ timeout: 5_000 });

    const detailSection = form.locator('section').filter({ hasText: /detalle de la compra/i });
    await expect(detailSection.getByPlaceholder('0', { exact: true })).toHaveCount(1);
    await expect(form.getByTestId('expense-form-total')).toHaveText(/\$0[,.]00/);
  });

  test('eliminar un ítem actualiza el total', async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto('/expenses');
    await expect(page).toHaveURL(/\/expenses/);
    await page.getByRole('button', { name: /nuevo gasto/i }).click();

    const form = page.locator('form').filter({ has: page.getByLabel(/título del gasto/i) });
    await form.getByLabel(/título del gasto/i).fill(`E2E Eliminar ítem ${Date.now()}`);
    const typeTrigger = page.getByRole('button', { name: /seleccionar tipo|tipo de gasto/i });
    await typeTrigger.first().click({ timeout: 10_000 });
    await page.locator('[data-select-content]').getByText('Compra de mercancía', { exact: true }).click({ timeout: 10_000 });

    const detailSection = form.locator('section').filter({ hasText: /detalle de la compra/i });
    await detailSection.getByRole('button', { name: /seleccionar producto/i }).first().click();
    const productDialog = page.locator('div').filter({ has: page.getByRole('heading', { name: /seleccionar producto/i }) }).first();
    await expect(productDialog).toBeVisible({ timeout: 5_000 });
    await productDialog.getByRole('button').filter({ hasText: /activo|inactivo/i }).first().click();
    await productDialog.getByRole('button', { name: /añadir seleccionado/i }).click();
    await expect(productDialog).not.toBeVisible({ timeout: 10_000 });

    const firstRow = detailSection.getByPlaceholder('0', { exact: true }).first().locator('..').locator('..');
    await firstRow.getByPlaceholder('0', { exact: true }).fill('3');
    await firstRow.getByRole('button', { name: /—|ninguna|kilogramos|piezas|gramos|otros/i }).click();
    const unitOpt = page.locator('[data-select-content]').getByText('Piezas', { exact: true });
    await unitOpt.waitFor({ state: 'visible', timeout: 10_000 });
    await unitOpt.evaluate((el: HTMLElement) => el.click());
    await firstRow.getByPlaceholder('$ 0').fill('100');

    await form.getByRole('button', { name: /agregar ítem/i }).click();
    await expect(productDialog).toBeVisible({ timeout: 5_000 });
    await productDialog.getByRole('button').filter({ hasText: /activo|inactivo/i }).first().click();
    await productDialog.getByRole('button', { name: /añadir seleccionado/i }).click();
    await expect(productDialog).not.toBeVisible({ timeout: 10_000 });

    const secondRowAmount = detailSection.getByPlaceholder('0', { exact: true }).last();
    await secondRowAmount.fill('2');
    const secondRow = secondRowAmount.locator('..').locator('..');
    await secondRow.getByRole('button', { name: /—|ninguna|kilogramos|piezas|gramos|otros/i }).click();
    await page.locator('[data-select-content]').getByText('Kilogramos', { exact: true }).evaluate((el: HTMLElement) => el.click());
    await secondRow.getByPlaceholder('$ 0').fill('50');

    await expect(form.getByTestId('expense-form-total')).toHaveText(/\$400[,.]00/, { timeout: 5_000 });

    await secondRow.getByRole('button').last().click();
    await expect(form.getByTestId('expense-form-total')).toHaveText(/\$300[,.]00/, { timeout: 5_000 });
  });

  test('cambiar cantidad recalcula subtotal y total', async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto('/expenses');
    await expect(page).toHaveURL(/\/expenses/);
    await page.getByRole('button', { name: /nuevo gasto/i }).click();

    const form = page.locator('form').filter({ has: page.getByLabel(/título del gasto/i) });
    const typeTrigger = page.getByRole('button', { name: /seleccionar tipo|tipo de gasto/i });
    await typeTrigger.first().click({ timeout: 10_000 });
    await page.locator('[data-select-content]').getByText('Compra de mercancía', { exact: true }).click({ timeout: 10_000 });

    const detailSection = form.locator('section').filter({ hasText: /detalle de la compra/i });
    await detailSection.getByRole('button', { name: /seleccionar producto/i }).first().click();
    const productDialog = page.locator('div').filter({ has: page.getByRole('heading', { name: /seleccionar producto/i }) }).first();
    await expect(productDialog).toBeVisible({ timeout: 5_000 });
    await productDialog.getByRole('button').filter({ hasText: /activo|inactivo/i }).first().click();
    await productDialog.getByRole('button', { name: /añadir seleccionado/i }).click();
    await expect(productDialog).not.toBeVisible({ timeout: 10_000 });

    const row = detailSection.getByPlaceholder('0', { exact: true }).first().locator('..').locator('..');
    await row.getByPlaceholder('0', { exact: true }).fill('10');
    await row.getByRole('button', { name: /—|ninguna|kilogramos|piezas|gramos|otros/i }).click();
    await page.locator('[data-select-content]').getByText('Kilogramos', { exact: true }).evaluate((el: HTMLElement) => el.click());
    await row.getByPlaceholder('$ 0').fill('100');

    await expect(form.getByTestId('expense-form-total')).toHaveText(/\$1[,.]000[,.]00/, { timeout: 5_000 });

    await row.getByPlaceholder('0', { exact: true }).clear();
    await row.getByPlaceholder('0', { exact: true }).fill('5');
    await expect(form.getByTestId('expense-form-total')).toHaveText(/\$500[,.]00/, { timeout: 5_000 });
  });

  test('validación: método de pago obligatorio', async ({ page }) => {
    test.setTimeout(45_000);
    await page.goto('/expenses');
    await expect(page).toHaveURL(/\/expenses/);
    await page.getByRole('button', { name: /nuevo gasto/i }).click();

    const form = page.locator('form').filter({ has: page.getByLabel(/título del gasto/i) });
    await form.getByLabel(/título del gasto/i).fill('Gasto sin método de pago');
    const typeTrigger = page.getByRole('button', { name: /seleccionar tipo|tipo de gasto/i });
    await typeTrigger.first().click({ timeout: 10_000 });
    await page.locator('[data-select-content]').getByText('Compra de mercancía', { exact: true }).click({ timeout: 10_000 });
    await form.getByLabel(/fecha de compra/i).fill(new Date().toISOString().split('T')[0]);
    // No elegir método de pago

    await form.getByRole('button', { name: /guardar gasto/i }).click();

    await expect(form).toBeVisible();
    await expect(page.getByText(/método de pago es requerido/i)).toBeVisible({ timeout: 5_000 });
  });


  test('validación: fecha requerida', async ({ page }) => {
    test.setTimeout(45_000);
    await page.goto('/expenses');
    await expect(page).toHaveURL(/\/expenses/);
    await page.getByRole('button', { name: /nuevo gasto/i }).click();

    const form = page.locator('form').filter({ has: page.getByLabel(/título del gasto/i) });
    await form.getByLabel(/título del gasto/i).fill('Gasto sin fecha');
    const typeTrigger = page.getByRole('button', { name: /seleccionar tipo|tipo de gasto/i });
    await typeTrigger.first().click({ timeout: 10_000 });
    await page.locator('[data-select-content]').getByText('Compra de mercancía', { exact: true }).click({ timeout: 10_000 });
    await form.getByRole('button', { name: /método de pago|seleccionar método/i }).click();
    await page.locator('[data-select-content]').getByText('Transferencia', { exact: true }).click({ timeout: 10_000 });
    await form.getByLabel(/fecha de compra/i).clear();

    await form.getByRole('button', { name: /guardar gasto/i }).click();

    await expect(form).toBeVisible();
    await expect(page.getByText(/la fecha es requerida/i)).toBeVisible({ timeout: 5_000 });
  });

  test('cerrar modal Nuevo Gasto y volver a abrirlo deja el formulario vacío', async ({ page }) => {
    test.setTimeout(45_000);
    await page.goto('/expenses');
    await expect(page).toHaveURL(/\/expenses/);
    await page.getByRole('button', { name: /nuevo gasto/i }).click();

    const form = page.locator('form').filter({ has: page.getByLabel(/título del gasto/i) });
    await expect(form).toBeVisible();
    await form.getByLabel(/título del gasto/i).fill('Texto que no debe quedar');
    const typeTrigger = page.getByRole('button', { name: /seleccionar tipo|tipo de gasto/i });
    await typeTrigger.first().click({ timeout: 10_000 });
    await page.locator('[data-select-content]').getByText('Compra de mercancía', { exact: true }).click({ timeout: 10_000 });

    await form.getByRole('button', { name: /cancelar/i }).first().click();
    await expect(form).not.toBeVisible({ timeout: 5_000 });

    await page.getByRole('button', { name: /nuevo gasto/i }).click();
    const formAgain = page.locator('form').filter({ has: page.getByLabel(/título del gasto/i) });
    await expect(formAgain).toBeVisible();
    await expect(formAgain.getByLabel(/título del gasto/i)).toHaveValue('');
    await expect(formAgain.getByRole('button', { name: /seleccionar tipo|tipo de gasto/i })).toBeVisible();
  });
  
});
