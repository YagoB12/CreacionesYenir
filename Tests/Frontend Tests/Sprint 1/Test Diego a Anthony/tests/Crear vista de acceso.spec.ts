import { test, expect } from '@playwright/test';

test('login exitoso con credenciales válidas', async ({ page }) => {
  await page.goto('http://localhost:5173/login');
  await page.locator('input[type="email"]').click();
  await page.locator('input[type="email"]').fill('ldiegobonillaib@gmail.com');
  await page.locator('input[type="password"]').click();
  await page.locator('input[type="password"]').press('CapsLock');
  await page.locator('input[type="password"]').fill('D');
  await page.locator('input[type="password"]').press('CapsLock');
  await page.locator('input[type="password"]').fill('Diego12345');
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await page.getByRole('button', { name: 'Aceptar' }).click();
});

test('login fallido con credenciales inválidas', async ({ page }) => {
  await page.goto('http://localhost:5173/login');
  await page.locator('input[type="email"]').click();
  await page.locator('input[type="email"]').fill('ldbonialtodano@gmail.com');
  await page.locator('input[type="password"]').click();
  await page.locator('input[type="password"]').fill('diego123456');
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await page.getByRole('button', { name: 'Aceptar' }).click();
  await page.locator('input[type="email"]').click();
  await page.locator('input[type="email"]').dblclick();
  await page.locator('input[type="email"]').fill('');
  await page.locator('input[type="password"]').click();
  await page.locator('input[type="password"]').fill('');
  await page.locator('input[type="email"]').click();
});

