import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:5173/login');
  await page.locator('input[type="email"]').click();
  await page.locator('input[type="email"]').fill('dilan@gmail.com');
  await page.locator('input[type="password"]').click();
  await page.locator('input[type="password"]').fill('23251316Dilan');
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page.getByRole('heading', { name: 'Bienvenido' })).toBeVisible();
  await expect(page.getByText('Inicio de sesión correcto')).toBeVisible();
  await page.getByRole('button', { name: 'Aceptar' }).click();
  await expect(page.getByText('Usuarios')).toBeVisible();
  await expect(page.getByText('Productos')).toBeVisible();
  await expect(page.getByText('Inventario')).toBeVisible();
  await expect(page.getByText('Reseñas')).toBeVisible();
});