import { Page, Locator } from '@playwright/test';

export class UIHelper {
page: Page;
emailInput: Locator;
passwordInput: Locator;
submitButton: Locator;
loginButton: Locator;
signupButton: Locator;
logoutButton: Locator;
fetchKeyButton: Locator;
messageDiv: Locator;
switchToLoginLink: Locator;  
switchToSignupLink: Locator;
pageTitle: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Form inputs
    this.emailInput = page.locator('input[name="email"]');
    this.passwordInput = page.locator('input[name="password"]');
    
    // Buttons
    this.submitButton = page.locator('button[type="submit"]');
    this.loginButton = page.locator('.form-switch button').first();
    this.signupButton = page.locator('.form-switch button').last();
    this.logoutButton = page.locator('button:has-text("Logout")');
    this.fetchKeyButton = page.locator('button:has-text("Fetch Key")');
    
    // Messages and text
    this.messageDiv = page.locator('.message');
    this.switchToLoginLink = page.locator('.switch-link:has-text("Login now")');
    this.switchToSignupLink = page.locator('.switch-link:has-text("Signup now")');
    this.pageTitle = page.locator('h1');
  }

  async navigateToApp(baseUrl: string = 'http://localhost:5173') {
    await this.page.goto(baseUrl);
  }

  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  async clickSubmit() {
    await this.submitButton.click();
  }

  async switchToLogin() {
    await this.loginButton.click();
  }

  async switchToSignup() {
    await this.signupButton.click();
  }

  async clickLogout() {
    await this.logoutButton.click();
  }

  async clickFetchKey() {
    await this.fetchKeyButton.click();
  }

  async performLogin(email: string, password: string) {
    await this.switchToLogin();
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickSubmit();
  }

  async performSignup(email: string, password: string) {
    await this.switchToSignup();
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickSubmit();
  }

  async getMessageText(): Promise<string> {
    return await this.messageDiv.textContent() || '';
  }

  async isLoggedIn(): Promise<boolean> {
    try {
      await this.fetchKeyButton.waitFor({ timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  async waitForMessage(expectedText?: string, timeout: number = 5000) {
    if (expectedText) {
      await this.page.waitForFunction(
        (text) => {
          const messageElement = document.querySelector('.message');
          return messageElement && messageElement.textContent?.includes(text);
        },
        expectedText,
        { timeout }
      );
    } else {
      // Wait for message element to be visible and have content
      await this.page.waitForFunction(
        () => {
          const messageElement = document.querySelector('.message');
          return messageElement && 
                 messageElement.textContent && 
                 messageElement.textContent.trim().length > 0 &&
                 getComputedStyle(messageElement).display !== 'none';
        },
        { timeout }
      );
    }
  }

  async clearForm() {
    await this.emailInput.fill('');
    await this.passwordInput.fill('');
  }

  // Helper methods for validation
  async isSubmitButtonDisabled(): Promise<boolean> {
    return await this.submitButton.isDisabled();
  }

  async getSubmitButtonText(): Promise<string> {
    return await this.submitButton.textContent() || '';
  }

  async isEmailFieldFocused(): Promise<boolean> {
    return await this.emailInput.evaluate(el => el === document.activeElement);
  }

  async isPasswordFieldFocused(): Promise<boolean> {
    return await this.passwordInput.evaluate(el => el === document.activeElement);
  }

  // Advanced interactions
  async loginAndWaitForSuccess(email: string, password: string) {
    await this.performLogin(email, password);
    await this.waitForMessage('Login successful');
  }

  async signupAndWaitForSuccess(email: string, password: string) {
    await this.performSignup(email, password);
    await this.waitForMessage('Account created successfully');
  }

  async fetchKeyAndGetValue(): Promise<string> {
    await this.clickFetchKey();
    await this.waitForMessage();
    const message = await this.getMessageText();
    const keyMatch = message.match(/Key fetched: (.+)/);
    return keyMatch ? keyMatch[1] : '';
  }

  // Helper method to submit form bypassing HTML5 validation
  async submitFormWithoutValidation() {
    await this.page.evaluate(() => {
      const form = document.querySelector('form');
      if (form) {
        // Temporarily remove required attributes
        const inputs = form.querySelectorAll('input[required]');
        inputs.forEach(input => input.removeAttribute('required'));
        
        // Submit the form
        form.requestSubmit();
        
        // Restore required attributes
        inputs.forEach(input => input.setAttribute('required', ''));
      }
    });
  }
} 