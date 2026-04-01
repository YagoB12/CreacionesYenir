import { test, expect } from '@playwright/test';

test('Mostrar los productos del carrito de compras', async ({ page }) => {
  await page.goto('http://localhost:5173/login');
  await page.locator('input[type="email"]').click();
  await page.locator('input[type="email"]').fill('juan@test.com');
  await page.locator('input[type="password"]').click();
  await page.locator('input[type="password"]').press('CapsLock');
  await page.locator('input[type="password"]').fill('P');
  await page.locator('input[type="password"]').press('CapsLock');
  await page.locator('input[type="password"]').fill('Password123');
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await page.getByRole('button', { name: 'Aceptar' }).click();
  await page.getByRole('button', { name: '🛒 Agregar al carrito' }).nth(1).click();
  await page.getByRole('button', { name: 'Aceptar' }).click();
  await page.locator('#navbarMain svg').click();
  await expect(page.locator('#root')).toContainText('₡ 678 500 CRC');
});