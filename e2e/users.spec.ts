import { test, expect } from '@playwright/test';
import { E2E_USER } from './config';

/**
 * E2E usuarios: listado, creación y edición.
 * Requiere backend API en marcha (auth + endpoints de usuarios).
 */
test.describe('Usuarios', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
    await page.getByLabel(/email/i).fill(E2E_USER.email);
    await page.getByLabel(/contraseña/i).fill(E2E_USER.password);
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
    await expect(page).toHaveURL(/\/(dashboard|pos)/, { timeout: 15_000 });
  });

  test('user can open users page and see header and actions', async ({ page }) => {
    await page.goto('/users');

    await expect(page).toHaveURL(/\/users$/);
    await expect(page.getByRole('heading', { name: /usuarios/i })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('button', { name: /nuevo usuario/i })).toBeVisible();
  });

  test('users page shows list or empty state', async ({ page }) => {
    await page.goto('/users');

    await expect(page).toHaveURL(/\/users$/);
    await expect(
      page.getByText(/no se encontraron usuarios|cargando usuarios|nombre completo/i).first()
    ).toBeVisible({ timeout: 15_000 });
  });

  test('user can open create user modal and see form', async ({ page }) => {
    await page.goto('/users');
    await expect(page.getByRole('heading', { name: /usuarios/i })).toBeVisible({ timeout: 10_000 });

    await page.getByRole('button', { name: /nuevo usuario/i }).click();

    await expect(page.getByRole('heading', { name: /crear nuevo usuario/i })).toBeVisible({ timeout: 5_000 });
    await expect(page.getByLabel(/^nombre\s*\*/i)).toBeVisible();
    await expect(page.getByLabel(/^apellido\s*\*/i)).toBeVisible();
    await expect(page.getByLabel(/^email\s*\*/i)).toBeVisible();
    await expect(page.getByLabel(/^contraseña/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /guardar usuario/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /cancelar/i }).last()).toBeVisible();
  });

  test('user can cancel create modal without saving', async ({ page }) => {
    await page.goto('/users');
    await expect(page.getByRole('heading', { name: /usuarios/i })).toBeVisible({ timeout: 10_000 });

    await page.getByRole('button', { name: /nuevo usuario/i }).click();
    await expect(page.getByRole('heading', { name: /crear nuevo usuario/i })).toBeVisible({ timeout: 5_000 });

    await page.getByRole('button', { name: /cancelar/i }).last().click();

    await expect(page.getByRole('heading', { name: /crear nuevo usuario/i })).not.toBeVisible({ timeout: 5_000 });
    await expect(page.getByRole('heading', { name: /usuarios/i })).toBeVisible();
  });

  test('user can create a new user and modal closes', async ({ page }) => {
    test.setTimeout(30_000);

    const unique = Date.now();
    const name = `E2E Usuario ${unique}`;
    const lastName = 'Apellido';
    const email = `e2e-${unique}@test.com`;
    const password = 'SecurePass123!';

    await page.goto('/users');
    await expect(page.getByRole('heading', { name: /usuarios/i })).toBeVisible({ timeout: 10_000 });

    await page.getByRole('button', { name: /nuevo usuario/i }).click();
    await expect(page.getByRole('heading', { name: /crear nuevo usuario/i })).toBeVisible({ timeout: 5_000 });

    await page.getByLabel(/^nombre\s*\*/i).fill(name);
    await page.getByLabel(/^apellido\s*\*/i).fill(lastName);
    await page.getByLabel(/^email\s*\*/i).fill(email);
    await page.locator('#password').fill(password);

    await page.getByRole('button', { name: /guardar usuario/i }).click();

    await expect(page.getByRole('heading', { name: /crear nuevo usuario/i })).not.toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('heading', { name: /usuarios/i })).toBeVisible();
  });

  test('user can open user detail when list has users', async ({ page }) => {
    await page.goto('/users');
    await expect(page.getByRole('heading', { name: /usuarios/i })).toBeVisible({ timeout: 10_000 });

    const userLink = page.locator('main a[href^="/users/"]').first();
    const count = await userLink.count();
    if (count === 0) {
      await expect(page.getByText(/no se encontraron usuarios/i)).toBeVisible({ timeout: 5_000 });
      test.skip();
      return;
    }

    await userLink.click();
    await expect(page).toHaveURL(/\/users\/[^/]+/);
    await expect(page.getByRole('button', { name: /editar usuario/i })).toBeVisible({ timeout: 10_000 });
  });

  test('user can open edit modal and cancel', async ({ page }) => {
    await page.goto('/users');
    await expect(page.getByRole('heading', { name: /usuarios/i })).toBeVisible({ timeout: 10_000 });

    const userLink = page.locator('main a[href^="/users/"]').first();
    const count = await userLink.count();
    if (count === 0) {
      await expect(page.getByText(/no se encontraron usuarios/i)).toBeVisible({ timeout: 5_000 });
      test.skip();
      return;
    }

    await userLink.click();
    await expect(page).toHaveURL(/\/users\/[^/]+/);
    await expect(page.getByRole('button', { name: /editar usuario/i })).toBeVisible({ timeout: 10_000 });

    await page.getByRole('button', { name: /editar usuario/i }).click();
    await expect(page.getByRole('heading', { name: /editar usuario/i })).toBeVisible({ timeout: 5_000 });

    await page.getByRole('button', { name: /cancelar/i }).last().click();

    await expect(page.getByRole('heading', { name: /editar usuario/i })).not.toBeVisible({ timeout: 5_000 });
  });
});
