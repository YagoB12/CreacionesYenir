import { test, expect } from '@playwright/test';

test('TC-ORD-001 - Listar pedidos del usuario', async ({ page }) => {
  await page.goto('http://localhost:5173/login');
  await page.waitForSelector('input[type="email"]');
  await page.locator('input[type="email"]').fill('dilan@gmail.com');
  await page.locator('input[type="password"]').fill('123456789Bb');
  await page.locator('button[type="submit"]').click();
  await page.getByText('Bienvenido').waitFor();
  await page.getByRole('button', { name: 'Aceptar' }).click();
  await page.waitForURL('**/home');
  await page.goto('http://localhost:5173/orders');
  await expect( page.getByRole('heading', { name: 'Mis Pedidos' }) ).toBeVisible();

});