import { Page, Locator, expect } from '@playwright/test';

/**
 * LoginPage - Page Object Model for the Login page
 * 
 * This class encapsulates all locators and actions related to the Login page.
 * Following POM best practices for maintainability and reusability.
 */
export class LoginPage {
    // Page instance
    readonly page: Page;

    // =========================================
    // LOCATORS - Using readonly for immutability
    // =========================================

    /** Username input field */
    readonly usernameInput: Locator;

    /** Password input field */
    readonly passwordInput: Locator;

    /** Remember Me checkbox */
    readonly rememberMeCheckbox: Locator;

    /** Login/Submit button */
    readonly loginButton: Locator;

    /** Reset button to clear form */
    readonly resetButton: Locator;

    /** Password visibility toggle button */
    readonly passwordToggle: Locator;

    /** Login navigation link */
    readonly loginNavLink: Locator;

    /** Register link on login page */
    readonly registerLink: Locator;

    /**
     * Constructor - Initialize all locators
     * @param page - Playwright Page instance
     */
    constructor(page: Page) {
        this.page = page;

        // Initialize form field locators
        this.usernameInput = page.locator('#username');
        this.passwordInput = page.locator('#password');
        this.rememberMeCheckbox = page.locator('#remember-me');

        // Initialize button locators - using data-testid for specificity
        this.loginButton = page.locator('[data-testid="login-button"]');
        this.resetButton = page.locator('button:has-text("Reset")');

        // Initialize password toggle locator (eye icon in password field)
        this.passwordToggle = page.locator('#password + button, #password ~ button').first();

        // Navigation links
        this.loginNavLink = page.locator('a[href="/login"]');
        this.registerLink = page.locator('a[href="/register"]');
    }

    // =========================================
    // PAGE ACTIONS - Reusable methods
    // =========================================

    /**
     * Navigate to the Login page via homepage
     * Note: Direct URL navigation causes 404, so we navigate via the homepage button
     */
    async navigate(): Promise<void> {
        await this.page.goto('/');
        await this.page.waitForLoadState('networkidle');
        // Click the Login button in the header (the first one, not the form submit button)
        await this.page.locator('button:has-text("Login")').first().click();
        await this.page.waitForURL('**/login');
        await this.page.waitForLoadState('networkidle');
    }

    /**
     * Navigate directly to the Login page via homepage
     * Note: Uses homepage navigation since direct URL causes 404
     */
    async navigateDirect(): Promise<void> {
        await this.navigate();
    }

    /**
     * Fill the login form with provided credentials
     * @param username - Username value
     * @param password - Password value
     */
    async fillLoginForm(username: string, password: string): Promise<void> {
        await this.usernameInput.fill(username);
        await this.passwordInput.fill(password);
    }

    /**
     * Fill only specific fields (useful for partial form testing)
     * @param fields - Object containing field values to fill
     */
    async fillFields(fields: {
        username?: string;
        password?: string;
    }): Promise<void> {
        if (fields.username !== undefined) {
            await this.usernameInput.fill(fields.username);
        }
        if (fields.password !== undefined) {
            await this.passwordInput.fill(fields.password);
        }
    }

    /**
     * Click the Login/Submit button
     */
    async submitForm(): Promise<void> {
        await this.loginButton.click();
    }

    /**
     * Click the Reset button to clear the form
     */
    async resetForm(): Promise<void> {
        await this.resetButton.click();
    }

    /**
     * Toggle the Remember Me checkbox
     */
    async toggleRememberMe(): Promise<void> {
        await this.rememberMeCheckbox.click();
    }

    /**
     * Toggle password visibility
     */
    async togglePasswordVisibility(): Promise<void> {
        await this.passwordToggle.click();
    }

    /**
     * Get the input type of the password field (text or password)
     * @returns The type attribute value
     */
    async getPasswordInputType(): Promise<string | null> {
        return await this.passwordInput.getAttribute('type');
    }

    /**
     * Perform complete login action
     * @param username - Username value
     * @param password - Password value
     */
    async login(username: string, password: string): Promise<void> {
        await this.fillLoginForm(username, password);
        await this.submitForm();
    }

    /**
     * Get all visible error messages on the page
     * @returns Array of error message texts
     */
    async getErrorMessages(): Promise<string[]> {
        // Wait a moment for error messages to appear
        await this.page.waitForTimeout(500);

        // Look for error messages (typically styled with red/destructive classes)
        const errorElements = this.page.locator('.text-destructive, .text-red-500, [class*="error"], .error-message');
        const count = await errorElements.count();

        const messages: string[] = [];
        for (let i = 0; i < count; i++) {
            const text = await errorElements.nth(i).textContent();
            if (text && text.trim()) {
                messages.push(text.trim());
            }
        }

        return messages;
    }

    /**
     * Get error message for a specific field
     * @param fieldLocator - The field locator to check for associated error
     * @returns Error message text or null
     */
    async getFieldError(fieldLocator: Locator): Promise<string | null> {
        // Look for error message as a sibling or nearby element
        const parent = fieldLocator.locator('..');
        const errorElement = parent.locator('.text-destructive, .text-red-500, [class*="error"]');

        if (await errorElement.count() > 0) {
            return await errorElement.first().textContent();
        }

        return null;
    }

    /**
     * Check if the login was successful (redirect to account page)
     * @returns True if redirected to account page
     */
    async isLoginSuccessful(): Promise<boolean> {
        try {
            await this.page.waitForURL('**/account', { timeout: 5000 });
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Get the current URL
     * @returns Current page URL
     */
    getCurrentUrl(): string {
        return this.page.url();
    }

    /**
     * Check if all form fields are empty
     * @returns True if all fields are empty
     */
    async areAllFieldsEmpty(): Promise<boolean> {
        const usernameValue = await this.usernameInput.inputValue();
        const passwordValue = await this.passwordInput.inputValue();

        return !usernameValue && !passwordValue;
    }

    /**
     * Wait for the page to be fully loaded
     */
    async waitForPageLoad(): Promise<void> {
        await this.page.waitForLoadState('networkidle');
    }

    /**
     * Verify the Login page is displayed
     */
    async verifyPageLoaded(): Promise<void> {
        await expect(this.usernameInput).toBeVisible();
        await expect(this.passwordInput).toBeVisible();
        await expect(this.loginButton).toBeVisible();
    }

    /**
     * Check if Remember Me checkbox is checked
     * @returns True if checkbox is checked
     */
    async isRememberMeChecked(): Promise<boolean> {
        const dataState = await this.rememberMeCheckbox.getAttribute('data-state');
        return dataState === 'checked';
    }

    /**
     * Navigate to Register page from Login page
     */
    async goToRegister(): Promise<void> {
        await this.registerLink.click();
        await this.page.waitForURL('**/register');
    }
}