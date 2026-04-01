import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:5173/login');
  await page.locator('input[type="email"]').fill('dilan@gmail.com');
  await page.locator('input[type="password"]').fill('23251316Dilan');
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await page.getByRole('button', { name: 'Aceptar' }).click();
  await page.getByText('Usuarios').click();
  await expect(page.getByRole('heading', { name: 'Administración de Usuarios' })).toBeVisible();
  await expect(page.getByRole('cell', { name: '1', exact: true })).toBeVisible();
  await expect(page.getByRole('cell', { name: '2', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Ver dirección' }).nth(1).click();
  await expect(page.getByRole('heading', { name: 'Dirección del usuario' })).toBeVisible({ timeout: 10000 });
  await expect(page.getByText(/Provincia:/)).toBeVisible({ timeout: 10000 });
  await expect(page.getByText('Provincia: Limón')).toBeVisible();
  await expect(page.getByText('Cantón: Pococí')).toBeVisible();
  await expect(page.getByText('Distrito: Rita')).toBeVisible();
  await expect(page.getByText('Dirección exacta: Casa amarilla')).toBeVisible();
  await page.getByRole('button', { name: 'Cerrar' }).click();
});