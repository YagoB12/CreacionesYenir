import { test, expect } from '@playwright/test';

test('Cambio de rol a admin', async ({ page }) => {
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
  await page.getByText('Usuarios').click();
  await page.getByRole('button', { name: 'Editar' }).nth(5).click();
  await page.getByRole('button', { name: 'Cliente' }).click();
  await page.getByRole('button', { name: 'Sí' }).click();
  await expect(page.locator('#swal2-html-container')).toContainText('Rol actualizado correctamente');
  await expect(page.locator('#swal2-title')).toContainText('Listo');
  await page.getByRole('button', { name: 'Aceptar' }).click();
});

test('Cambio de rol a cliente', async ({ page }) => {
  await page.goto('http://localhost:5173/login');
  await page.locator('div').filter({ hasText: /^Correo$/ }).click();
  await page.locator('input[type="email"]').fill('ldiegobonillaib@gmail.com');
  await page.locator('input[type="password"]').click();
  await page.locator('input[type="password"]').press('CapsLock');
  await page.locator('input[type="password"]').fill('D');
  await page.locator('input[type="password"]').press('CapsLock');
  await page.locator('input[type="password"]').fill('Diego12345');
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await page.getByRole('button', { name: 'Aceptar' }).click();
  await page.getByText('Usuarios').click();
  await page.getByRole('button', { name: 'Editar' }).nth(1).click();
  await page.getByRole('button', { name: 'Cliente' }).click();
  await page.getByRole('button', { name: 'Sí' }).click();
  await page.getByRole('button', { name: 'Aceptar' }).click();
});