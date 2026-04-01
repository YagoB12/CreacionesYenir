import { test } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

test('Paginación de productos', async ({ page }) => {
  const login = new LoginPage(page);

  await login.goto();
  await login.loginDilan();

  await page.getByText('Productos').click();
  await page.getByRole('button', { name: '2' }).click();
  await page.getByRole('button', { name: '3' }).click();
  await page.getByRole('button', { name: '4' }).click();
  await page.getByRole('button', { name: '5' }).click();
  await page.getByRole('button', { name: '6' }).click();
});