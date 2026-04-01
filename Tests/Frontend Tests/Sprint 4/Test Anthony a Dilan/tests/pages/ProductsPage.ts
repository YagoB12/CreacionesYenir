import { Page, expect } from '@playwright/test';

export class ProductsPage {
  constructor(private page: Page) {}

  async goToProducts() {
    await this.page.getByText('Productos').click();
  }

  async goToPage(pageNumber: number) {
    await this.page.getByRole('button', { name: `${pageNumber}` }).click();
  }

  async assertPageChanged(pageNumber: number) {
    await expect(
      this.page.getByText(new RegExp(`Página ${pageNumber}`))
    ).toBeVisible();
  }
}