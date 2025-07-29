import { test, expect } from '@playwright/test';
import { UIHelper } from './helpers/UIHelper';

// Test data fixture for existing users
const existingUsers = [
  {
    email: 'abidmres@gmail.com',
    password: 'BlueBird5!'
  },
  {
    email: 'abidm@bxscience.edu',
    password: 'Test123!@#'
  },
  {
    email: 'la@za.rus',
    password: 'Test123!@#'
  }
];

// Test data fixture for new users (for signup tests)
const newUsers = [
  { email: 'testuser1@example.com', password: 'Test123!@#' },
  { email: 'testuser2@example.com', password: 'Test123!@#' },
  { email: 'testuser3@example.com', password: 'Test123!@#' },
  { email: 'testuser4@example.com', password: 'Test123!@#' },
  { email: 'testuser5@example.com', password: 'Test123!@#' },
  { email: 'testuser6@example.com', password: 'Test123!@#' },
  { email: 'testuser7@example.com', password: 'Test123!@#' },
  { email: 'testuser8@example.com', password: 'Test123!@#' },
  { email: 'testuser9@example.com', password: 'Test123!@#' },
  { email: 'testuser10@example.com', password: 'Test123!@#' },
  { email: 'testuser11@example.com', password: 'Test123!@#' },
  { email: 'testuser12@example.com', password: 'Test123!@#' },
  { email: 'testuser13@example.com', password: 'Test123!@#' },
  { email: 'testuser14@example.com', password: 'Test123!@#' },
  { email: 'testuser15@example.com', password: 'Test123!@#' }
];

// Helper function to get a random user from existing users
function getRandomExistingUser() {
  return existingUsers[Math.floor(Math.random() * existingUsers.length)];
}

// Helper function to get a random new user for signup
function getRandomNewUser() {
  return newUsers[Math.floor(Math.random() * newUsers.length)];
}

test.describe('Application Authentication Tests', () => {
  let uiHelper: UIHelper;

  test.beforeEach(async ({ page }) => {
    uiHelper = new UIHelper(page);
    await uiHelper.navigateToApp();
  });



  test('should switch between login and signup forms @smoke', async () => {
    await expect(uiHelper.loginButton).toHaveClass(/active/);
    await uiHelper.switchToSignup();
    await expect(uiHelper.signupButton).toHaveClass(/active/);
    await expect(uiHelper.submitButton).toHaveText('Sign up');
    await uiHelper.switchToLogin();
    await expect(uiHelper.loginButton).toHaveClass(/active/);
    await expect(uiHelper.submitButton).toHaveText('Login');
  });

  test('should show validation message when email is provided but password is missing', async () => {
    await uiHelper.fillEmail('test@example.com');
    await uiHelper.submitFormWithoutValidation();
    await uiHelper.waitForMessage('Please fill in all fields');
    await expect(uiHelper.messageDiv).toBeVisible();
    await expect(uiHelper.messageDiv).toContainText('Please fill in all fields');
  });

  test('should show validation message when password is provided but email is missing', async () => {
    await uiHelper.fillPassword('testpassword123');
    await uiHelper.submitFormWithoutValidation();
    await uiHelper.waitForMessage('Please fill in all fields');
    await expect(uiHelper.messageDiv).toBeVisible();
    await expect(uiHelper.messageDiv).toContainText('Please fill in all fields');
  });

  test('should show password validation message on signup', async () => {
    await uiHelper.switchToSignup();
    await uiHelper.fillEmail('test@example.com');
    await uiHelper.fillPassword('weak');
    await uiHelper.clickSubmit();
    await uiHelper.waitForMessage('Password must be at least 8 characters');
    await expect(uiHelper.messageDiv).toContainText('Password must be at least 8 characters');
  });

  test('should show validation message when email is already in use', async () => {
    const randomUser = getRandomExistingUser();
    await uiHelper.switchToSignup();
    await uiHelper.fillEmail(randomUser.email);
    await uiHelper.fillPassword(randomUser.password);
    await uiHelper.clickSubmit();
    await expect(uiHelper.messageDiv).toContainText('Email already in use');
  });
  
  test('signup should create a new user', async () => {   
    const randomUser = getRandomNewUser();
    await uiHelper.switchToSignup();
    await uiHelper.fillEmail(randomUser.email);
    await uiHelper.fillPassword(randomUser.password);
    await uiHelper.clickSubmit();
    await expect(uiHelper.messageDiv).toContainText('Registration successful');
  });
  
});