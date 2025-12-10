/**
 * E2E Test Configuration for URLs and Endpoints
 * 
 * Centralizes all URL configuration for E2E tests.
 * Uses environment variables with sensible defaults.
 */

export const config = {
  /**
   * Base URL for the API server
   * Override with API_BASE_URL environment variable
   */
  baseUrl: process.env.API_BASE_URL || 'http://localhost:5000',
  
  /**
   * Test user credentials
   * Override with TEST_USER_EMAIL and TEST_USER_PASSWORD environment variables
   */
  testUser: {
    email: process.env.TEST_USER_EMAIL || 'test@example.com',
    password: process.env.TEST_USER_PASSWORD || 'testpassword123',
  },
} as const;

/**
 * Get the base URL for API calls
 */
export function getBaseUrl(): string {
  return config.baseUrl;
}

/**
 * Get test user credentials
 */
export function getTestUser() {
  return config.testUser;
}
