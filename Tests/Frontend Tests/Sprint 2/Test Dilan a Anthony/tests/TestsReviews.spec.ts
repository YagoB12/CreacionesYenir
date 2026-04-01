import { test, expect } from '@playwright/test';

test.describe.serial('Tests reviews', () => {

    test('Create', async ({ page }) => {
        await page.goto('http://localhost:5173/home');
        await page.getByRole('img', { name: 'Camiseta básica' }).click();
        await page.getByText('Inicia sesión para poder').click();
        await expect(page.getByText('Inicia sesión para poder')).toBeVisible();
        await page.getByRole('link', { name: 'Iniciar Sesión' }).click();
        await page.locator('input[type="email"]').click();
        await page.locator('input[type="email"]').fill('cristian@gmail.com');
        await page.locator('input[type="password"]').click();
        await page.locator('input[type="password"]').fill('23251316Dilan');
        await page.getByRole('button', { name: 'Iniciar sesión' }).click();
        await page.getByRole('button', { name: 'Aceptar' }).click();
        await page.getByRole('img', { name: 'Camiseta básica' }).click();
        await page.getByText('★').nth(3).click();
        await page.getByRole('textbox', { name: 'Escribe tu reseña...' }).click();
        await page.getByRole('textbox', { name: 'Escribe tu reseña...' }).fill('Muy buen producto');
        await page.getByRole('button', { name: 'Publicar reseña' }).click();
        await page.getByRole('button', { name: 'Aceptar' }).click();
        await expect(page.getByText('Cristian').nth(4)).toBeVisible();
        await expect(page.getByText('★★★★☆')).toBeVisible();
        await expect(page.getByText('Muy buen producto')).toBeVisible();
        await page.getByRole('button', { name: 'Eliminar' }).nth(2).click();
        await page.getByRole('button', { name: 'Sí' }).click();
        await page.getByRole('button', { name: 'Aceptar' }).click();
    });

    test('Update', async ({ page }) => {
        await page.goto('http://localhost:5173/home');
        await page.getByRole('link', { name: 'Iniciar Sesión' }).click();
        await page.locator('input[type="email"]').click();
        await page.locator('input[type="email"]').fill('cristian@gmail.com');
        await page.locator('input[type="password"]').click();
        await page.locator('input[type="password"]').fill('23251316Dilan');
        await page.getByRole('button', { name: 'Iniciar sesión' }).click();
        await page.getByRole('button', { name: 'Aceptar' }).click();
        await page.getByRole('img', { name: 'Camiseta básica' }).click();
        await page.getByText('★').nth(3).click();
        await page.getByRole('textbox', { name: 'Escribe tu reseña...' }).click();
        await page.getByRole('textbox', { name: 'Escribe tu reseña...' }).fill('Buen producto');
        await page.getByRole('button', { name: 'Publicar reseña' }).click();
        await page.getByRole('button', { name: 'Aceptar' }).click();
        await page.getByRole('button', { name: 'Editar' }).nth(2).click();
        await page.locator('.review-header > .review-stars > span:nth-child(3)').click();
        await page.getByText('Buen producto').click();
        await page.getByText('Buen producto').fill('Buen producto prueba editar');
        await page.getByRole('button', { name: 'Guardar' }).click();
        await page.getByRole('button', { name: 'Aceptar' }).click();
        await page.getByText('★★★☆☆').nth(1).click();
        await expect(page.getByText('Buen producto prueba editar')).toBeVisible();
        await page.getByRole('button', { name: 'Eliminar' }).nth(2).click();
        await page.getByRole('button', { name: 'Sí' }).click();
        await page.getByRole('button', { name: 'Aceptar' }).click();
    });

    test('List', async ({ page }) => {
        await page.goto('http://localhost:5173/home');
        await page.getByRole('img', { name: 'Camiseta básica' }).click();
        await expect(page.getByText('Cristian').first()).toBeVisible();
        await expect(page.getByText('Cristian').nth(1)).toBeVisible();
        await expect(page.getByText('★★★★★')).toBeVisible();
        await expect(page.getByText('Reseña de prueba')).toBeVisible();
        await expect(page.getByText('★★★☆☆')).toBeVisible();
        await expect(page.getByText('Muy buena camisa')).toBeVisible();
    });

    test('List admin', async ({ page }) => {
        await page.goto('http://localhost:5173/home');
        await page.getByRole('link', { name: 'Iniciar Sesión' }).click();
        await page.locator('input[type="email"]').click();
        await page.locator('input[type="email"]').fill('dilan@gmail.com');
        await page.locator('input[type="password"]').click();
        await page.locator('input[type="password"]').fill('23251316Dilan');
        await page.getByRole('button', { name: 'Iniciar sesión' }).click();
        await page.getByRole('button', { name: 'Aceptar' }).click();
        await page.getByText('Reseñas').click();
        await expect(page.getByRole('cell', { name: '1', exact: true })).toBeVisible();
        await expect(page.getByRole('cell', { name: '2', exact: true })).toBeVisible();
        await expect(page.getByRole('cell', { name: 'Camiseta básica' }).first()).toBeVisible();
        await expect(page.getByRole('cell', { name: 'Camiseta básica' }).nth(1)).toBeVisible();
        await expect(page.getByRole('cell', { name: 'Cristian' }).first()).toBeVisible();
        await expect(page.getByRole('cell', { name: 'Cristian' }).nth(1)).toBeVisible();
        await expect(page.getByRole('cell', { name: '5' })).toBeVisible();
        await expect(page.getByRole('cell', { name: '3', exact: true })).toBeVisible();
        await expect(page.getByRole('cell', { name: 'Reseña de prueba' })).toBeVisible();
        await expect(page.getByRole('cell', { name: 'Muy buena camisa' })).toBeVisible();
        await expect(page.getByRole('row', { name: '1 Camiseta básica Cristian 5' }).getByRole('button')).toBeVisible();
        await expect(page.getByRole('row', { name: '2 Camiseta básica Cristian 3' }).getByRole('button')).toBeVisible();

    });

    test('Delete', async ({ page }) => {
        await page.goto('http://localhost:5173/home');
        await page.getByRole('link', { name: 'Iniciar Sesión' }).click();
        await page.locator('input[type="email"]').click();
        await page.locator('input[type="email"]').fill('cristian@gmail.com');
        await page.locator('input[type="password"]').click();
        await page.locator('input[type="password"]').fill('23251316Dilan');
        await page.getByRole('button', { name: 'Iniciar sesión' }).click();
        await page.getByRole('button', { name: 'Aceptar' }).click();
        await page.getByRole('img', { name: 'Camiseta básica' }).click();
        await page.getByRole('textbox', { name: 'Escribe tu reseña...' }).click();
        await page.getByRole('textbox', { name: 'Escribe tu reseña...' }).fill('No me gusto el producto');
        await page.getByText('★').nth(1).click();
        await page.getByRole('button', { name: 'Publicar reseña' }).click();
        await page.getByRole('button', { name: 'Aceptar' }).click();
        await page.getByRole('button', { name: 'Eliminar' }).nth(2).click();
        await page.getByRole('button', { name: 'Sí' }).click();
        await expect(page.getByText('Reseña eliminada correctamente')).toBeVisible();
        await page.getByRole('button', { name: 'Aceptar' }).click();
        await page.getByText('★').nth(1).click();
        await page.getByRole('textbox', { name: 'Escribe tu reseña...' }).click();
        await page.getByRole('textbox', { name: 'Escribe tu reseña...' }).fill('No me gusto el producto');
        await page.getByRole('button', { name: 'Publicar reseña' }).click();
        await page.getByRole('button', { name: 'Aceptar' }).click();
        await page.getByRole('button', { name: 'C Cristian' }).click();
        await page.getByRole('button', { name: 'Cerrar Sesión' }).click();
        await page.locator('input[type="email"]').click();
        await page.locator('input[type="email"]').fill('dilan@gmail.com');
        await page.locator('input[type="password"]').click();
        await page.locator('input[type="password"]').fill('23251316Dilan');
        await page.getByRole('button', { name: 'Iniciar sesión' }).click();
        await page.getByRole('button', { name: 'Aceptar' }).click();
        await page.getByText('Reseñas').click();
        await page.getByRole('row', { name: '3 Camiseta básica Cristian 2' }).getByRole('button').click();
        await expect(page.getByText('¿Seguro que deseas eliminar')).toBeVisible();
        await page.getByRole('button', { name: 'Sí' }).click();
        await expect(page.getByText('Reseña eliminada correctamente')).toBeVisible();
        await page.getByRole('button', { name: 'Aceptar' }).click();
    });

});