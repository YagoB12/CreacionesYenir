import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

test('Eliminar pedido', async ({ page }) => {
    const login = new LoginPage(page);

    await page.goto('http://localhost:5173/home');
    await login.loginAnthony();

    await page.getByRole('button', { name: 'A Anthony' }).click();
    await page.getByRole('button', { name: 'Mis Pedidos' }).click();

    await page.getByRole('button', { name: /Pedido #/ }).last().click();

    await page.getByRole('button', { name: 'Eliminar pedido' }).click();
    await page.getByRole('button', { name: 'Sí' }).click();
    await page.getByRole('button', { name: 'Aceptar' }).click();

});