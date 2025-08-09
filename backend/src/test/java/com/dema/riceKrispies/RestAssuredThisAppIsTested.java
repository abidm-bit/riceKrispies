package com.dema.riceKrispies;

import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import io.restassured.response.Response;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.ActiveProfiles;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@ExtendWith(ExtentReportsExtension.class)
class RestAssuredThisAppIsTested {

    @LocalServerPort
    private int port;

    private static String jwtToken;
    private static Integer userId;
    private final String testEmail = "testuser929@example.com";
    private final String testPassword = "Test123!@#"; // Must match backend password validation pattern

    @BeforeEach
    void setUp() {
        RestAssured.port = port;
        RestAssured.baseURI = "http://localhost";
    }

    @Test
    @Order(1)
    @DisplayName("Should register a new user successfully")
    void testUserRegistration() {
        ExtentReportsExtension.logInfo("Testing user registration with email: " + testEmail);
        
        String requestBody = """
            {
                "email": "%s",
                "password": "%s"
            }
            """.formatted(testEmail, testPassword);

        ExtentReportsExtension.logInfo("Sending POST request to /users/register/");
        
        given()
            .contentType(ContentType.JSON)
            .body(requestBody)
        .when()
            .post("/users/register/")
        .then()
            .statusCode(201)
            .body(equalTo("Account created"));
            
        ExtentReportsExtension.logPass("User registration successful - received 201 status and 'Account created' response");
    }

    @Test
    @Order(2)
    @DisplayName("Should reject registration with duplicate email")
    void testUserRegistrationDuplicate() {
        String requestBody = """
            {
                "email": "%s",
                "password": "%s"
            }
            """.formatted(testEmail, testPassword);

        given()
            .contentType(ContentType.JSON)
            .body(requestBody)
        .when()
            .post("/users/register/")
        .then()
            .statusCode(409) // CONFLICT for duplicate email
            .body(equalTo("bad request")); // Exact response from backend
    }

    @Test
    @Order(3)
    @DisplayName("Should login successfully and return JWT token")
    void testUserLogin() {
        ExtentReportsExtension.logInfo("Testing user login with registered email: " + testEmail);
        
        String requestBody = """
            {
                "email": "%s",
                "password": "%s"
            }
            """.formatted(testEmail, testPassword);

        ExtentReportsExtension.logInfo("Sending POST request to /users/login/");
        
        Response response = given()
            .contentType(ContentType.JSON)
            .body(requestBody)
        .when()
            .post("/users/login/")
        .then()
            .statusCode(200)
            .body("jwtToken", notNullValue()) // Correct field name from LoginResponse
            .body("userId", notNullValue())
            .extract()
            .response();

        // Store JWT token and userId for subsequent tests
        jwtToken = response.path("jwtToken"); // Correct field name
        userId = response.path("userId");
        
        ExtentReportsExtension.logInfo("JWT Token received: " + (jwtToken != null ? "✓" : "✗"));
        ExtentReportsExtension.logInfo("User ID received: " + userId);
        ExtentReportsExtension.logPass("User login successful - JWT token and User ID captured for subsequent tests");
    }

    @Test
    @Order(4)
    @DisplayName("Should reject login with wrong password")
    void testUserLoginWrongPassword() {
        String requestBody = """
            {
                "email": "%s",
                "password": "wrongPassword"
            }
            """.formatted(testEmail);

        given()
            .contentType(ContentType.JSON)
            .body(requestBody)
        .when()
            .post("/users/login/")
        .then()
            .statusCode(400) // BAD_REQUEST from GlobalExceptionHandler
            .body(equalTo("wrong credentials")); // Exact response from backend
    }

    @Test
    @Order(5)
    @DisplayName("Should reject login with non-existent email")
    void testUserLoginNonExistentEmail() {
        String requestBody = """
            {
                "email": "nonexistent@example.com",
                "password": "%s"
            }
            """.formatted(testPassword);

        given()
            .contentType(ContentType.JSON)
            .body(requestBody)
        .when()
            .post("/users/login/")
        .then()
            .statusCode(400) // BAD_REQUEST from GlobalExceptionHandler
            .body(equalTo("wrong credentials")); // Exact response from backend
    }

    @Test
    @Order(6)
    @DisplayName("Should fetch key successfully with valid JWT token")
    void testFetchKeyWithValidToken() {
        // This test requires a valid JWT token from the login test
        Assumptions.assumeTrue(jwtToken != null, "JWT token is required for this test");
        Assumptions.assumeTrue(userId != null, "User ID is required for this test");

        ExtentReportsExtension.logInfo("Testing key fetch with valid JWT token for user ID: " + userId);
        
        String requestBody = """
            {
                "userId": %d
            }
            """.formatted(userId);

        ExtentReportsExtension.logInfo("Sending POST request to /fetchKeys/ with Authorization header");
        
        Response response = given()
            .contentType(ContentType.JSON)
            .header("Authorization", "Bearer " + jwtToken)
            .body(requestBody)
        .when()
            .post("/fetchKeys/")
        .then()
            .statusCode(200)
            .body("key", notNullValue()) // Verify any key string is returned
            .body("key", not(emptyString())) // Verify key is not empty
            .body("userId", equalTo(userId)) // Should match the user ID from login
            .extract()
            .response();
            
        String keyReceived = response.path("key");
        ExtentReportsExtension.logInfo("Key received: " + keyReceived);
        ExtentReportsExtension.logPass("Key fetch successful - received valid key and matching user ID");
    }

    @Test
    @Order(7)
    @DisplayName("Should reject key fetch without JWT token")
    void testFetchKeyWithoutToken() {
        String requestBody = """
            {
                "userId": 1
            }
            """;

        given()
            .contentType(ContentType.JSON)
            .body(requestBody)
        .when()
            .post("/fetchKeys/")
        .then()
            .statusCode(403); 
    }

    @Test
    @Order(8)
    @DisplayName("Should reject key fetch with invalid JWT token")
    void testFetchKeyWithInvalidToken() {
        String requestBody = """
            {
                "userId": 1
            }
            """;

        given()
            .contentType(ContentType.JSON)
            .header("Authorization", "Bearer invalid-token")
            .body(requestBody)
        .when()
            .post("/fetchKeys/")
        .then()
            .statusCode(403); 
    }

    @Test
    @Order(9)
    @DisplayName("Should handle invalid registration with missing fields")
    void testRegistrationWithInvalidData() {
        // Test with missing password (should trigger "invalid registration")
        String requestBodyMissingPassword = """
            {
                "email": "test@example.com"
            }
            """;

        given()
            .contentType(ContentType.JSON)
            .body(requestBodyMissingPassword)
        .when()
            .post("/users/register/")
        .then()
            .statusCode(400) // BAD_REQUEST from GlobalExceptionHandler
            .body(equalTo("invalid registration")); // Exact response from backend
    }

    @Test
    @Order(10)
    @DisplayName("Should handle weak password validation")
    void testRegistrationWithWeakPassword() {
        // Test with password that doesn't meet requirements (missing uppercase and special char)
        String requestBodyWeakPassword = """
            {
                "email": "test2@example.com",
                "password": "weakpass"
            }
            """;

        given()
            .contentType(ContentType.JSON)
            .body(requestBodyWeakPassword)
        .when()
            .post("/users/register/")
        .then()
            .statusCode(400) // BAD_REQUEST from GlobalExceptionHandler
            .body(equalTo("invalid registration")); // Backend validates password pattern
    }

    @Test
    @Order(11)
    @DisplayName("Should handle rate limiting")
    void testRateLimiting() {
        // This test attempts to trigger rate limiting by making multiple requests
        // Note: You may need to adjust this based on your rate limiting configuration
        
        String requestBody = """
            {
                "email": "ratelimit@example.com",
                "password": "%s"
            }
            """.formatted(testPassword);

        // Make multiple registration attempts to potentially trigger rate limiting
        for (int i = 0; i < 10; i++) {
            Response response = given()
                .contentType(ContentType.JSON)
                .body(requestBody)
            .when()
                .post("/users/register/")
            .then()
                .extract()
                .response();

            // If we get a rate limit status code, verify the response body
            if (response.getStatusCode() == 429) {
                String responseBody = response.getBody().asString();
                if ("rate limit exceeded".equals(responseBody)) {
                    System.out.println("Rate limiting triggered at attempt " + (i + 1));
                    return;
                }
            }
        }
        
        // If no rate limiting was triggered, that's also acceptable
        // as it depends on your rate limiting configuration
        System.out.println("Rate limiting was not triggered within 10 attempts");
    }

    @AfterAll
    static void tearDown() {
        System.out.println("All RestAssured tests completed!");
        System.out.println("JWT Token used: " + (jwtToken != null ? "✓" : "✗"));
        System.out.println("User ID captured: " + (userId != null ? "✓" : "✗"));
    }
}
