import { test, expect } from '@playwright/test';

test('Eliminar productos del carrito de compras', async ({ page }) => {
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
  await page.locator('#navbarMain path').click();
  await page.getByText('Quitar').nth(2).click();
  await page.getByRole('button', { name: 'Sí' }).click();
});