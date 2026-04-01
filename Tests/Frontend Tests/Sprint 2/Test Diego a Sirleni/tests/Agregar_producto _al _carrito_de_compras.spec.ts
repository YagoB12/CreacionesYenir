import { test, expect } from '@playwright/test';

test('Agregar producto al carrito de compras', async ({ page }) => {
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
  await page.getByRole('img', { name: 'Camisa' }).nth(1).click();
  await page.getByRole('button', { name: 'Añadir al carrito' }).click();
  await page.getByRole('button', { name: 'Aceptar' }).click();
  await page.getByRole('link', { name: 'Logo' }).click();
  await page.getByRole('button', { name: '🛒 Agregar al carrito' }).nth(4).click();
  await page.getByRole('button', { name: 'Aceptar' }).click();
});