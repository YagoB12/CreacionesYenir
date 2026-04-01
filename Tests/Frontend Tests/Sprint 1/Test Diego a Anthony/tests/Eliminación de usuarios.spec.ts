import { test, expect } from '@playwright/test';

test('Eliminación de usuario', async ({ page }) => {
  await page.goto('http://localhost:5173/login');
  await page.locator('input[type="email"]').click();
  await page.locator('input[type="email"]').fill('ldiegobonillaib');
  await page.locator('input[type="email"]').press('Alt+ControlOrMeta+q');
  await page.locator('input[type="email"]').fill('ldiegobonillaib@gmail.com');
  await page.locator('input[type="password"]').click();
  await page.locator('input[type="password"]').press('CapsLock');
  await page.locator('input[type="password"]').fill('D');
  await page.locator('input[type="password"]').press('CapsLock');
  await page.locator('input[type="password"]').fill('Diego12345');
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await page.getByRole('button', { name: 'Aceptar' }).click();
  await page.getByRole('listitem').filter({ hasText: 'Usuarios' }).click();
  await page.locator('tr:nth-child(7) > td:nth-child(7) > .actions-vertical > button:nth-child(3)').click();
  await expect(page.locator('#swal2-html-container')).toContainText('¿Seguro que quieres eliminar a Juan Carlos Perez?');
  await expect(page.locator('#swal2-title')).toContainText('¿Eliminar usuario?');
  await page.getByRole('button', { name: 'Sí' }).click();
  await page.getByRole('button', { name: 'Aceptar' }).click();
});