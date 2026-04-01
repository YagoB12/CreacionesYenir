import { test, expect } from '@playwright/test';

test.describe.serial('Tests Payments', () => {

    test('UploadProof', async ({ page }) => {
        await page.goto('http://localhost:5173/login');
        await page.locator('input[type="email"]').click();
        await page.locator('input[type="email"]').fill('cristian@gmail.com');
        await page.locator('input[type="password"]').click();
        await page.locator('input[type="password"]').fill('23251316Dilan');
        await page.getByRole('button', { name: 'Iniciar sesión' }).click();
        await page.getByRole('button', { name: 'Aceptar' }).click();
        await page.getByRole('link', { name: 'Ver Catálogo' }).click();
        await page.getByRole('button', { name: '🛒 Agregar al carrito' }).nth(2).click();
        await page.getByRole('button', { name: 'Aceptar' }).click();
        await page.locator('#navbarMain path').click();
        await page.getByRole('button', { name: 'Finalizar compra' }).click();
        await expect(page.getByRole('heading', { name: 'Finalizar Compra' })).toBeVisible();
        await expect(page.getByText('Datos para transferencia:')).toBeVisible();
        await expect(page.getByText('Banco PopularCuenta: 123-456-')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Choose File' })).toBeVisible();
        await expect(page.getByText('- Realiza la transferencia')).toBeVisible();
        await page.getByRole('button', { name: 'Choose File' }).click();
        await page.getByRole('button', { name: 'Choose File' }).setInputFiles('image.png');
        await page.getByRole('button', { name: 'Confirmar compra' }).click();
        await page.getByRole('button', { name: 'Sí' }).click();
        await expect(page.getByRole('heading', { name: 'Factura generada con éxito' })).toBeVisible();
        await expect(page.getByText('Tu pago ha sido recibido y')).toBeVisible();
        await page.getByRole('button', { name: 'Aceptar' }).click();
    });


    test('ListBillsPendings', async ({ page }) => {
        await page.goto('http://localhost:5173/login');
        await page.locator('input[type="email"]').click();
        await page.locator('input[type="email"]').fill('dilan@gmail.com');
        await page.locator('input[type="password"]').click();
        await page.locator('input[type="password"]').fill('23251316Dilan');
        await page.getByRole('button', { name: 'Iniciar sesión' }).click();
        await page.getByRole('button', { name: 'Aceptar' }).click();
        await page.getByText('Facturas').click();
        await expect(page.getByRole('heading', { name: 'Administración de Facturas' })).toBeVisible();
        await expect(page.getByRole('cell', { name: 'Cristian Flores Martínez' }).first()).toBeVisible();
        await expect(page.getByRole('cell', { name: 'Limón Pococí Rita' }).first()).toBeVisible();
        await expect(page.getByRole('cell', { name: '$ 2.000,00' })).toBeVisible();
        await expect(page.getByText('Pendiente de verificación')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Ver solo pendientes' })).toBeVisible();
    });


    test('ChangeStatusPayment', async ({ page }) => {
        await page.goto('http://localhost:5173/login');
        await page.locator('input[type="email"]').click();
        await page.locator('input[type="email"]').fill('dilan@gmail.com');
        await page.locator('input[type="password"]').click();
        await page.locator('input[type="password"]').fill('23251316Dilan');
        await page.getByRole('button', { name: 'Iniciar sesión' }).click();
        await page.getByRole('button', { name: 'Aceptar' }).click();
        await page.getByRole('listitem').filter({ hasText: 'Pagos' }).click();
        await expect(page.getByRole('heading', { name: 'Administración de Pagos' })).toBeVisible();
        await expect(page.getByRole('cell', { name: 'Cristian Flores Martínez' }).first()).toBeVisible();
        await expect(page.getByRole('table').getByText('Pendiente')).toBeVisible();
        await page.getByRole('button', { name: 'Ver detalles' }).first().click();
        await expect(page.getByRole('heading', { name: 'Comprobante:' })).toBeVisible();
        await expect(page.getByRole('img', { name: 'Comprobante' })).toBeVisible();
        await expect(page.getByText('Cliente: Cristian Flores Mart')).toBeVisible();
        await page.getByRole('button', { name: 'Aprobar' }).click();
        await page.getByRole('button', { name: 'Sí' }).click();
        await expect(page.getByRole('heading', { name: 'Pago aprobado' })).toBeVisible();
        await expect(page.getByText('Operación realizada')).toBeVisible();
        await page.getByRole('button', { name: 'Aceptar' }).click();
        await expect(page.getByText('Confirmado').nth(1)).toBeVisible();
    });
});