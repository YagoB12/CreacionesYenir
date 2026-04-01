import { Page } from '@playwright/test';

export class CartPage {
  constructor(private page: Page) {}

  async addProductsToCart() {
    await this.page
      .locator('div:nth-child(2) > .catalog-row > div:nth-child(2) > .card-product > div:nth-child(2) > .btn')
      .click();
    await this.page.getByRole('button', { name: 'Aceptar' }).click();

    await this.page
      .locator('div:nth-child(2) > .catalog-row > div:nth-child(3) > .card-product > div:nth-child(2) > .btn')
      .click();
    await this.page.getByRole('button', { name: 'Aceptar' }).click();

    await this.page.getByRole('button', { name: '🛒 Agregar al carrito' }).nth(2).click();
    await this.page.getByRole('button', { name: 'Aceptar' }).click();

    await this.page.getByRole('button', { name: '🛒 Agregar al carrito' }).nth(1).click();
    await this.page.getByRole('button', { name: 'Aceptar' }).click();
  }

  async goBackFromCart() {
    await this.page.locator('div').nth(2).click();
    await this.page.locator('#navbarMain').getByRole('link').click();
    await this.page.getByRole('link', { name: 'Regresar' }).click();
  }
}