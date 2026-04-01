import { test, expect } from '@playwright/test';

test('Test de listado de pagos de administrador con filtros', async ({ page }) => {
  await page.goto('http://localhost:5173/home');
  await page.getByRole('link', { name: 'Iniciar Sesión' }).click();
  await page.locator('input[type="email"]').click();
  await page.locator('input[type="email"]').fill('ldiegobonillaib@gmail.com');
  await page.locator('input[type="password"]').click();
  await page.locator('input[type="password"]').press('CapsLock');
  await page.locator('input[type="password"]').fill('D');
  await page.locator('input[type="password"]').press('CapsLock');
  await page.locator('input[type="password"]').fill('Diego12345');
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await page.getByRole('button', { name: 'Aceptar' }).click();
  await page.getByRole('listitem').filter({ hasText: 'Pagos' }).click();
  await expect(page.locator('div').filter({ hasText: 'Administración de' }).nth(4)).toBeVisible();
  await expect(page.getByRole('heading')).toContainText('Administración de Pagos');
  await page.getByRole('combobox').selectOption('1');
  await page.getByRole('combobox').selectOption('2');
  await expect(page.getByText('Administración de PagosClienteEstadoTodosPendienteConfirmadoRechazadoFecha✕')).toBeVisible();
  await page.getByRole('combobox').selectOption('3');
  await expect(page.getByText('Administración de PagosClienteEstadoTodosPendienteConfirmadoRechazadoFecha✕')).toBeVisible();
});