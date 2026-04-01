import { Page } from '@playwright/test';

export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('http://localhost:5173/home');
  }

  async loginAnthony() {
    await this.page.getByRole('link', { name: 'Iniciar Sesión' }).click();
    await this.page.getByRole('textbox', { name: 'ejemplo@email.com' })
      .fill('anthony.sanchezmendieta@ucr.ac.cr');
    await this.page.getByRole('textbox', { name: '••••••••' })
      .fill('Password123');
    await this.page.getByRole('button', { name: 'Iniciar sesión' }).click();
    await this.page.getByRole('button', { name: 'Aceptar' }).click();
  }

  async loginDilan() {
    await this.page.getByRole('link', { name: 'Iniciar Sesión' }).click();
    await this.page.getByRole('textbox', { name: 'ejemplo@email.com' })
      .fill('dilan@gmail.com');
    await this.page.getByRole('textbox', { name: '••••••••' })
      .fill('23251316Dilan');
    await this.page.getByRole('button', { name: 'Iniciar sesión' }).click();
    await this.page.getByRole('button', { name: 'Aceptar' }).click();
  }
}