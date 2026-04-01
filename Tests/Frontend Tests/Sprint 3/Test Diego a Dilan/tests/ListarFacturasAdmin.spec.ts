import { test, expect } from '@playwright/test';

test('Test de listado de facturas de administrador', async ({ page }) => {
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
  await page.getByRole('listitem').filter({ hasText: 'Facturas' }).click();
  await page.getByRole('button', { name: 'Ver solo pendientes' }).click();
  await expect(page.getByText('Administración de FacturasTotal: 8Ver todas#N° FacturaClienteDirecciónFecha')).toBeVisible();
  await expect(page.getByRole('heading')).toContainText('Administración de Facturas');
});