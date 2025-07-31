import { APIRequestContext, APIResponse, expect, Page } from '@playwright/test';

export class APIHelper {
  private request: APIRequestContext;
  private baseUrl: string;

  constructor(request: APIRequestContext, baseUrl: string = 'http://localhost:8080') {
    this.request = request;
    this.baseUrl = baseUrl;
  }

  /**
   * Generic function to expect a specific response code and message content
   * @param response - The API response to validate
   * @param expectedStatus - Expected HTTP status code
   * @param expectedMessage - Expected message content in response body
   */
  async expectResponse(response: APIResponse, expectedStatus: number, expectedMessage: string) {
    expect(response.status()).toBe(expectedStatus);
    const responseText = await response.text();
    expect(responseText).toContain(expectedMessage);
  }

  /**
   * Test invalid registration response (400 BAD_REQUEST)
   */
  async expectInvalidRegistration(response: APIResponse) {
    await this.expectResponse(response, 400, 'invalid registration');
  }

  /**
   * Test wrong credentials response (400 BAD_REQUEST)
   */
  async expectWrongCredentials(response: APIResponse) {
    await this.expectResponse(response, 400, 'wrong credentials');
  }

  /**
   * Test rate limit exceeded response (429 TOO_MANY_REQUESTS)
   */
  async expectRateLimitExceeded(response: APIResponse) {
    await this.expectResponse(response, 429, 'rate limit exceeded');
  }

  /**
   * Test duplicate email registration response (409 CONFLICT)
   */
  async expectDuplicateEmail(response: APIResponse) {
    await this.expectResponse(response, 409, 'bad request');
  }

  /**
   * Test internal server error response (500 INTERNAL_SERVER_ERROR)
   */
  async expectInternalServerError(response: APIResponse) {
    await this.expectResponse(response, 500, 'internal server error');
  }

  /**
   * Test successful registration response (201 CREATED)
   */
  async expectSuccessfulRegistration(response: APIResponse) {
    await this.expectResponse(response, 201, 'Account created');
  }

  /**
   * Test successful login response (200 OK)
   */
  async expectSuccessfulLogin(response: APIResponse) {
    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('userId');
    expect(responseBody).toHaveProperty('token');
  }

  // Network Intercept Methods

  /**
   * Intercept registration requests to return invalid registration response (400)
   */
  async interceptInvalidRegistration(page: Page) {
    await page.route(`${this.baseUrl}/users/register/`, (route) => {
      route.fulfill({
        status: 400,
        contentType: 'text/plain',
        body: 'invalid registration'
      });
    });
  }

  /**
   * Intercept login requests to return wrong credentials response (400)
   */
  async interceptWrongCredentials(page: Page) {
    await page.route(`${this.baseUrl}/users/login/`, (route) => {
      route.fulfill({
        status: 400,
        contentType: 'text/plain',
        body: 'wrong credentials'
      });
    });
  }

  /**
   * Intercept requests to return rate limit exceeded response (429)
   * Can be used for any endpoint
   */
  async interceptRateLimitExceeded(page: Page, endpoint: 'login' | 'register' | 'fetchKey') {
    const endpoints = {
      login: `${this.baseUrl}/users/login/`,
      register: `${this.baseUrl}/users/register/`,
      fetchKey: `${this.baseUrl}/keys/fetch/`
    };
    
    await page.route(endpoints[endpoint], (route) => {
      route.fulfill({
        status: 429,
        contentType: 'text/plain',
        body: 'rate limit exceeded'
      });
    });
  }

  /**
   * Intercept registration requests to return duplicate email response (409)
   */
  async interceptDuplicateEmail(page: Page) {
    await page.route(`${this.baseUrl}/users/register/`, (route) => {
      route.fulfill({
        status: 409,
        contentType: 'text/plain',
        body: 'bad request'
      });
    });
  }

  /**
   * Intercept requests to return internal server error response (500)
   * Can be used for any endpoint
   */
  async interceptInternalServerError(page: Page, endpoint: 'login' | 'register' | 'fetchKey') {
    const endpoints = {
      login: `${this.baseUrl}/users/login/`,
      register: `${this.baseUrl}/users/register/`,
      fetchKey: `${this.baseUrl}/keys/fetch/`
    };
    
    await page.route(endpoints[endpoint], (route) => {
      route.fulfill({
        status: 500,
        contentType: 'text/plain',
        body: 'internal server error'
      });
    });
  }

  /**
   * Intercept registration requests to return successful registration response (201)
   */
  async interceptSuccessfulRegistration(page: Page) {
    await page.route(`${this.baseUrl}/users/register/`, (route) => {
      route.fulfill({
        status: 201,
        contentType: 'text/plain',
        body: 'Account created'
      });
    });
  }

  /**
   * Intercept login requests to return successful login response (200)
   */
  async interceptSuccessfulLogin(page: Page, mockUserId: number = 1, mockToken: string = 'mock-jwt-token') {
    await page.route(`${this.baseUrl}/users/login/`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          userId: mockUserId,
          token: mockToken
        })
      });
    });
  }

  /**
   * Intercept fetch key requests to return successful response (200)
   */
  async interceptSuccessfulFetchKey(page: Page) {
    await page.route(`${this.baseUrl}/keys/fetch/`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
        })
      });
    });
  }

  /**
   * Clear all route intercepts for a page
   */
  async clearAllIntercepts(page: Page) {
    await page.unroute(`${this.baseUrl}/users/register/`);
    await page.unroute(`${this.baseUrl}/users/login/`);
    await page.unroute(`${this.baseUrl}/keys/fetch/`);
  }

  /**
   * Helper method to make registration request
   */
  async registerUser(email: string, password: string): Promise<APIResponse> {
    return await this.request.post(`${this.baseUrl}/users/register/`, {
      data: {
        email: email,
        password: password
      }
    });
  }

  /**
   * Helper method to make login request
   */
  async loginUser(email: string, password: string): Promise<APIResponse> {
    return await this.request.post(`${this.baseUrl}/users/login/`, {
      data: {
        email: email,
        password: password
      }
    });
  }

  /**
   * Helper method to make multiple login requests to trigger rate limiting
   */
  async makeMultipleLoginRequests(email: string, password: string, count: number): Promise<APIResponse[]> {
    const responses: APIResponse[] = [];
    for (let i = 0; i < count; i++) {
      const response = await this.loginUser(email, password);
      responses.push(response);
    }
    return responses;
  }
/**
 * Helper method to make multiple registration requests to trigger rate limiting
 */
  async makeMultipleRegistrationRequests(email: string, password: string, count: number): Promise<APIResponse[]> {
    const responses: APIResponse[] = [];
    for (let i = 0; i < count; i++) {
      const response = await this.registerUser(email, password);
      responses.push(response);
    }
    return responses;
  }

  /**
   * Helper method to make fetch key request (requires authentication)
   */
  async fetchKey(token: string): Promise<APIResponse> {
    return await this.request.get(`${this.baseUrl}/keys/fetch/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  /**
   * Helper method to make multiple fetch key requests to trigger rate limiting
   */
  async makeMultipleFetchKeyRequests(token: string, count: number): Promise<APIResponse[]> {
    const responses: APIResponse[] = [];
    for (let i = 0; i < count; i++) {
      const response = await this.fetchKey(token);
      responses.push(response);
    }
    return responses;
  }
} 