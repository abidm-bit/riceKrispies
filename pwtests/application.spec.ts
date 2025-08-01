import { test, expect } from '@playwright/test';
import { UIHelper } from './helpers/UIHelper';
import { APIHelper } from './helpers/APIHelper';

// Test data fixture for existing users
let existingUsers = [
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
  },
  { email: 'testuser15@example.com', password: 'Test123!@#' },
  { email: 'testuser1@example.com', password: 'Test123!@#' },
];

// Test data fixture for new users (for signup tests)
// once signed up, the email & password should be added to the existing users list for login tests
const newUsers = [
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
 
];

// Helper function to get a random user from existing users
function getRandomExistingUser() {
  return existingUsers[Math.floor(Math.random() * existingUsers.length)];
}

// Helper function to get a random new user for signup
function getRandomNewUser() {
  return newUsers[Math.floor(Math.random() * newUsers.length)];
}

// Helper function to add a newly registered user to existing users list and remove from newUsers
function addUserToExistingUsers(email: string, password: string) {
  existingUsers.push({ email, password });
  
  // Remove the user from newUsers to prevent duplicate registrations
  const userIndex = newUsers.findIndex(user => user.email === email);
  if (userIndex !== -1) {
    newUsers.splice(userIndex, 1);
    console.log(`Added new user ${email} to existing users list and removed from newUsers. Remaining new users: ${newUsers.length}`);
  } else {
    console.log(`Added new user ${email} to existing users list. Total users: ${existingUsers.length}`);
  }
}

test.describe('Application Tests', () => {
  let uiHelper: UIHelper;

  test.beforeEach(async ({ page }) => {
    uiHelper = new UIHelper(page);
    await uiHelper.navigateToApp();
  });



  test('should switch between login and signup forms @smoke @regression', async () => {
    await expect(uiHelper.loginButton).toHaveClass(/active/);
    await uiHelper.switchToSignup();
    await expect(uiHelper.signupButton).toHaveClass(/active/);
    await expect(uiHelper.submitButton).toHaveText('Sign up');
    await uiHelper.switchToLogin();
    await expect(uiHelper.loginButton).toHaveClass(/active/);
    await expect(uiHelper.submitButton).toHaveText('Login');
  });

  test('password is required @regression', async () => {
    await uiHelper.fillEmail('test@example.com');
    await uiHelper.submitFormWithoutValidation();
    await uiHelper.waitForMessage('Please fill in all fields');
    await expect(uiHelper.messageDiv).toBeVisible();
    await expect(uiHelper.messageDiv).toContainText('Please fill in all fields');
  });

  test('email is required @regression', async () => {
    await uiHelper.fillPassword('testpassword123');
    await uiHelper.submitFormWithoutValidation();
    await uiHelper.waitForMessage('Please fill in all fields');
    await expect(uiHelper.messageDiv).toBeVisible();
    await expect(uiHelper.messageDiv).toContainText('Please fill in all fields');
  });

  test('password must be at least 8 characters @regression', async () => {
    await uiHelper.switchToSignup();
    await uiHelper.fillEmail('test@example.com');
    await uiHelper.fillPassword('weak');
    await uiHelper.clickSubmit();
    await uiHelper.waitForMessage('Password must be at least 8 characters');
    await expect(uiHelper.messageDiv).toContainText('Password must be at least 8 characters');
  });

  test.skip('register with an existing email @regression', async () => {
    const randomUser = getRandomExistingUser();
    await uiHelper.switchToSignup();
    await uiHelper.fillEmail(randomUser.email);
    await uiHelper.fillPassword(randomUser.password);
    await uiHelper.clickSubmit();
    await expect(uiHelper.messageDiv).toContainText('bad request');
  });
  
  test.skip('register with a new email @smoke @regression', async () => {   
    const randomUser = getRandomNewUser();
    await uiHelper.switchToSignup();
    await uiHelper.fillEmail(randomUser.email);
    await uiHelper.fillPassword(randomUser.password);
    await uiHelper.clickSubmit();
    await expect(uiHelper.messageDiv).toHaveText('Account created successfully! You can now login.');
    addUserToExistingUsers(randomUser.email, randomUser.password);
  });
  
  test('login with valid credentials @smoke @regression', async () => {
    const randomUser = getRandomExistingUser();
    await uiHelper.switchToLogin();
    await uiHelper.fillEmail(randomUser.email);
    await uiHelper.fillPassword(randomUser.password);
    await uiHelper.clickSubmit();
    await expect(uiHelper.keyDiv).toContainText('Login successful!');   
    await expect(uiHelper.successLoginMessage).toBeVisible();
    await uiHelper.successLoginMessage.waitFor({ state: 'visible' });
    await expect(uiHelper.fetchKeyButton).toBeVisible();
    uiHelper.assertLoginSuccess(200, { userId: randomUser.email, jwtToken: expect.any(String)});
  });

  test('login with wrong password @regression', async () => {
    const randomUser = getRandomExistingUser();
    await uiHelper.switchToLogin();
    await uiHelper.fillEmail(randomUser.email);
    await uiHelper.fillPassword('invalidpassword');
    await uiHelper.clickSubmit();
    await expect(uiHelper.messageDiv).toContainText('wrong credentials');
    uiHelper.assertWrongCredentials(400, { message: 'wrong credentials' });
  });

  test('login with wrong email @regression', async () => {
    const randomUser = getRandomExistingUser();
    await uiHelper.switchToLogin();
    await uiHelper.fillEmail('invalidemail@example.com');
    await uiHelper.fillPassword(randomUser.password);
    await uiHelper.clickSubmit();
    await expect(uiHelper.messageDiv).toContainText('wrong credentials');
    uiHelper.assertWrongCredentials(400, { message: 'wrong credentials' });
  });

  test('login & fetch key @smoke @regression', async () => {
   const randomUser = getRandomExistingUser();
   await uiHelper.switchToLogin();
   await uiHelper.fillEmail(randomUser.email);
   await uiHelper.fillPassword(randomUser.password);
   await uiHelper.clickSubmit();
   await expect(uiHelper.keyDiv).toContainText('Login successful!');   
   await expect(uiHelper.successLoginMessage).toBeVisible();
   await uiHelper.fetchKeyButton.click();

   await expect(uiHelper.keyDiv).toBeVisible();
   await expect(uiHelper.keyDiv).toContainText('Key fetched');
   uiHelper.assertFetchKeySuccess(200, { key: expect.any(String) });
  });


});



test.describe('API Tests', () => {
  let apiHelper: APIHelper;

  test.beforeEach(async ({ request }) => {
    apiHelper = new APIHelper(request);
  });



  test.skip('expect rate limit exceeded for the login endpoint', async () => {
    const randomUser = getRandomExistingUser();
    const responses = await apiHelper.makeMultipleLoginRequests(randomUser.email, randomUser.password, 51);
    expect(responses[responses.length - 1].status()).toBe(429);
  });

 test.skip('full workflow @smoke @regression', async () => {
// register
// login
// fetch key

 });

}); 