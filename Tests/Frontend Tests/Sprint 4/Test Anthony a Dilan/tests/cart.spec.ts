import { test } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { CartPage } from './pages/CartPage';

test('Agregar al carrito y regresar', async ({ page }) => {
  const login = new LoginPage(page);
  const cart = new CartPage(page);

  await login.goto();
  await login.loginAnthony();
  await cart.addProductsToCart();
  await cart.goBackFromCart();
});