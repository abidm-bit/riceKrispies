import { APIRequestContext, APIResponse, expect } from '@playwright/test';

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
   * Helper method to make fetch key request (requires authentication)
   */
  async fetchKey(token: string): Promise<APIResponse> {
    return await this.request.get(`${this.baseUrl}/keys/fetch/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }
} 