import { test, expect } from '@playwright/test';

test.describe.serial('Tests inventory', () => {
    test('Update material', async ({ page }) => {
        await page.goto('http://localhost:5173/home');
        await page.getByRole('link', { name: 'Iniciar Sesión' }).click();
        await page.locator('input[type="email"]').click();
        await page.locator('input[type="email"]').fill('dilan@gmail.com');
        await page.locator('input[type="password"]').click();
        await page.locator('input[type="password"]').fill('23251316Dilan');
        await page.getByRole('button', { name: 'Iniciar sesión' }).click();
        await page.getByRole('button', { name: 'Aceptar' }).click();
        await page.getByText('Inventario').click();
        await page.getByRole('button', { name: 'Editar' }).click();
        await page.locator('form').getByRole('textbox').filter({ hasText: /^$/ }).click();
        await page.locator('form').getByRole('textbox').filter({ hasText: /^$/ }).fill('Boton rojo');
        await page.locator('textarea').click();
        await page.locator('textarea').fill('botón rojo para camisa');
        await page.getByRole('spinbutton').click();
        await page.getByRole('spinbutton').fill('020');
        await page.getByRole('button', { name: 'Guardar' }).click();
        await page.getByRole('button', { name: 'Sí' }).click();
        await page.getByRole('button', { name: 'Aceptar' }).click();
        await expect(page.getByRole('cell', { name: 'Boton rojo' })).toBeVisible();
        await expect(page.getByRole('cell', { name: 'botón rojo para camisa' })).toBeVisible();
        await expect(page.getByRole('cell', { name: '20' })).toBeVisible();
        await page.getByRole('button', { name: 'Editar' }).click();
        await page.locator('form').getByRole('textbox').filter({ hasText: /^$/ }).click();
        await page.locator('form').getByRole('textbox').filter({ hasText: /^$/ }).fill('Boton');
        await page.locator('textarea').click();
        await page.locator('textarea').fill('botón de prueba');
        await page.getByRole('spinbutton').click();
        await page.getByRole('spinbutton').fill('05');
        await page.getByRole('button', { name: 'Guardar' }).click();
        await page.getByRole('button', { name: 'Sí' }).click();
        await page.getByRole('button', { name: 'Aceptar' }).click();
    });

    test('Delete material', async ({ page }) => {
        await page.goto('http://localhost:5173/home');
        await page.getByRole('link', { name: 'Iniciar Sesión' }).click();
        await page.locator('input[type="email"]').click();
        await page.locator('input[type="email"]').fill('dilan@gmail.com');
        await page.locator('input[type="password"]').click();
        await page.locator('input[type="password"]').fill('23251316Dilan');
        await page.getByRole('button', { name: 'Iniciar sesión' }).click();
        await page.getByRole('button', { name: 'Aceptar' }).click();
        await page.getByText('Inventario').click();
        await page.getByRole('button', { name: 'Agregar Inventario' }).click();
        await page.locator('input[name="name"]').click();
        await page.locator('input[name="name"]').fill('Boton azul');
        await page.getByRole('spinbutton').click();
        await page.getByRole('spinbutton').fill('050');
        await page.locator('textarea[name="description"]').click();
        await page.locator('textarea[name="description"]').fill('Botón azul para pantalón');
        await page.getByRole('button', { name: 'Guardar' }).click();
        await page.getByRole('button', { name: 'Sí' }).click();
        await page.getByRole('button', { name: 'Aceptar' }).click();
        await page.getByRole('button', { name: 'Eliminar' }).nth(1).click();
        await expect(page.getByRole('heading', { name: '¿Eliminar material?' })).toBeVisible();
        await expect(page.getByText('¿Seguro que deseas eliminar "')).toBeVisible();
        await page.getByRole('button', { name: 'Sí' }).click();
        await expect(page.getByRole('heading', { name: 'Eliminado' })).toBeVisible();
        await expect(page.getByText('Se eliminó correctamente el')).toBeVisible();
        await page.getByRole('button', { name: 'Aceptar' }).click();
    });

});