import { test, expect } from '@playwright/test';

test(' Mostrar producto y agregar al carrito', async ({ page }) => {
  await page.goto('http://localhost:5173/login');
  await page.locator('input[type="email"]').click();
  await page.locator('input[type="email"]').fill('ldieegobonilla901@gmail.com');
  await page.getByText('CorreoContraseñaVerIniciar').click();
  await page.locator('input[type="password"]').click();
  await page.locator('input[type="password"]').press('CapsLock');
  await page.locator('input[type="password"]').fill('D');
  await page.locator('input[type="password"]').press('CapsLock');
  await page.locator('input[type="password"]').fill('Diego12345');
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await page.getByRole('button', { name: 'Aceptar' }).click();
  await page.getByRole('listitem').filter({ hasText: 'Catalogos' }).click();
  await page.getByRole('img', { name: 'Camisa' }).first().click();
  await page.getByRole('button', { name: '+' }).click();
  await page.getByRole('button', { name: '🛒 Agregar al carrito' }).click();
  await page.getByRole('button', { name: 'Aceptar' }).click();
});