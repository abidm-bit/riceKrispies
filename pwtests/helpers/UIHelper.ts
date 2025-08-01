import { Page, Locator, expect } from '@playwright/test';

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
successLoginMessage: Locator;
keyDiv: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Form inputs
    this.emailInput = page.locator('[data-testid="email-input"]');
    this.passwordInput = page.locator('[data-testid="password-input"]');
    
    // Buttons
    this.submitButton = page.locator('[data-testid="submit-button"]');
    this.loginButton = page.locator('[data-testid="login-button"]');
    this.signupButton = page.locator('[data-testid="signup-button"]');
    this.logoutButton = page.locator('[data-testid="logout-button"]');
    this.fetchKeyButton = page.locator('[data-testid="fetch-key-button"]');
    
    // Messages and text
    this.messageDiv = page.locator('[data-testid="message-div"]');
    this.switchToLoginLink = page.locator('[data-testid="switch-to-login"]');
    this.switchToSignupLink = page.locator('[data-testid="switch-to-signup"]');
    this.pageTitle = page.locator('h1');
    this.successLoginMessage = page.locator('[data-testid="success-login-message"]');
    this.keyDiv = page.locator('[data-testid="key-div"]');
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

  async isSuccessLoginMessageVisible(): Promise<boolean> {
    try {
      await this.successLoginMessage.waitFor({ timeout: 5000 });
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

  // Network Response Assertion Methods

  /**
   * Generic function to validate network response status and body
   */
  assertNetworkResponse(actualStatus: number, actualBody: any, expectedStatus: number, expectedMessage?: string) {
    expect(actualStatus).toBe(expectedStatus);
    
    if (expectedMessage) {
      if (typeof actualBody === 'string') {
        expect(actualBody).toContain(expectedMessage);
      } else if (typeof actualBody === 'object') {
        const bodyString = JSON.stringify(actualBody);
        expect(bodyString).toContain(expectedMessage);
      }
    }
  }

  /**
   * Assert successful login network response (200 with userId and jwtToken)
   */
  assertLoginSuccess(status: number, body: any) {
    expect(status).toBe(200);
    expect(body).toHaveProperty('userId');
    expect(body).toHaveProperty('jwtToken');
  }

  /**
   * Assert wrong credentials network response (400)
   */
  assertWrongCredentials(status: number, body: any) {
    this.assertNetworkResponse(status, body, 400, 'wrong credentials');
  }

  /**
   * Assert invalid registration network response (400)
   */
  assertInvalidRegistration(status: number, body: any) {
    this.assertNetworkResponse(status, body, 400, 'invalid registration');
  }

  /**
   * Assert successful registration network response (201)
   */
  assertSuccessfulRegistration(status: number, body: any) {
    this.assertNetworkResponse(status, body, 201, 'Account created');
  }

  /**
   * Assert duplicate email registration network response (409)
   */
  assertDuplicateEmail(status: number, body: any) {
    this.assertNetworkResponse(status, body, 409, 'bad request');
  }

  /**
   * Assert rate limit exceeded network response (429)
   */
  assertRateLimitExceeded(status: number, body: any) {
    this.assertNetworkResponse(status, body, 429, 'rate limit exceeded');
  }

  /**
   * Assert internal server error network response (500)
   */
  assertInternalServerError(status: number, body: any) {
    this.assertNetworkResponse(status, body, 500, 'internal server error');
  }

  /**
   * Assert successful fetch key network response (200)
   */
  assertFetchKeySuccess(status: number, body: any) {
    expect(status).toBe(200);
  }
} 