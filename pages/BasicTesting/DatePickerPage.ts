import { Page, Locator, expect } from '@playwright/test';

/**
 * DatePickerPage - Page Object Model for the Date Picker page
 * 
 * This class encapsulates all locators and actions related to the Date Picker page.
 * Covers all 8 automation challenges:
 * 1. Single Date Selection
 * 2. Calendar Navigation
 * 3. Date Range Selection
 * 4. Date and Time Combination
 * 5. Keyboard Navigation
 * 6. Range Validation
 * 7. Time Input Updates
 * 8. Edge Cases
 */
export class DatePickerPage {
    // Page instance
    readonly page: Page;

    // =========================================
    // LOCATORS - Single Date Picker
    // =========================================

    /** Single date picker trigger button */
    readonly singleDateButton: Locator;

    /** Submit date button for single date */
    readonly submitDateButton: Locator;

    // =========================================
    // LOCATORS - Date Range Picker
    // =========================================

    /** Date range picker trigger button */
    readonly dateRangeButton: Locator;

    /** Submit date range button */
    readonly submitDateRangeButton: Locator;

    // =========================================
    // LOCATORS - Date and Time Picker
    // =========================================

    /** Date and time picker trigger button */
    readonly dateTimeButton: Locator;

    /** Time input field */
    readonly timeInput: Locator;

    /** Submit date and time button */
    readonly submitDateTimeButton: Locator;

    // =========================================
    // LOCATORS - Calendar Navigation
    // =========================================

    /** Previous month button */
    readonly prevMonthButton: Locator;

    /** Next month button */
    readonly nextMonthButton: Locator;

    /** Calendar grid */
    readonly calendarGrid: Locator;

    /** Calendar popover */
    readonly calendarPopover: Locator;

    // =========================================
    // LOCATORS - Navigation & Toast
    // =========================================

    /** Navigation locators */
    readonly datePickerNav: Locator;

    /** Toast notification */
    readonly toastNotification: Locator;

    /**
     * Constructor - Initialize all locators
     * @param page - Playwright Page instance
     */
    constructor(page: Page) {
        this.page = page;

        // Single Date Picker
        this.singleDateButton = page.getByRole('button', { name: /single date/i });
        this.submitDateButton = page.getByTestId('date-submit-button');

        // Date Range Picker
        this.dateRangeButton = page.getByRole('button', { name: /date range/i });
        this.submitDateRangeButton = page.getByTestId('date-range-submit-button');

        // Date and Time Picker
        this.dateTimeButton = page.getByRole('button', { name: /date and time/i });
        this.timeInput = page.locator('#time');
        this.submitDateTimeButton = page.getByTestId('date-time-submit-button');

        // Calendar Navigation
        this.prevMonthButton = page.getByRole('button', { name: /previous month/i }).first();
        this.nextMonthButton = page.getByRole('button', { name: /next month/i }).first();
        this.calendarGrid = page.getByRole('grid').first();
        this.calendarPopover = page.getByRole('dialog').first();

        // Navigation
        this.datePickerNav = page.getByRole('link', { name: /date picker/i });

        // Toast notification - uses li[role="status"] in this app
        this.toastNotification = page.locator('li[role="status"], [data-sonner-toast]').first();
    }

    // =========================================
    // PAGE ACTIONS - Navigation
    // =========================================

    /**
     * Navigate to the Date Picker page via sidebar (required for SPA routing)
     */
    async navigate(): Promise<void> {
        await this.page.goto('/');
        await this.page.waitForLoadState('networkidle');
        await this.datePickerNav.click();
        await this.page.waitForLoadState('networkidle');
    }

    /**
     * Wait for the page to be fully loaded
     */
    async waitForPageLoad(): Promise<void> {
        await this.page.waitForLoadState('networkidle');
    }

    /**
     * Verify the Date Picker page is displayed
     */
    async verifyPageLoaded(): Promise<void> {
        await expect(this.singleDateButton).toBeVisible();
        await expect(this.dateRangeButton).toBeVisible();
        await expect(this.dateTimeButton).toBeVisible();
    }

    // =========================================
    // PAGE ACTIONS - Single Date Selection
    // =========================================

    /**
     * Open the single date picker calendar
     */
    async openSingleDatePicker(): Promise<void> {
        await this.singleDateButton.click();
        await this.calendarPopover.waitFor({ state: 'visible', timeout: 3000 });
    }

    /**
     * Select a specific day from the open calendar
     * @param day - Day number to select (1-31)
     */
    async selectDay(day: number): Promise<void> {
        const dayButton = this.page.getByRole('gridcell', { name: new RegExp(`^${day}$`) }).first();
        await dayButton.click();
    }

    /**
     * Select a single date and submit
     * @param day - Day number to select
     */
    async selectSingleDate(day: number): Promise<void> {
        await this.openSingleDatePicker();
        await this.selectDay(day);
        await this.submitDateButton.click();
    }

    /**
     * Get the selected date text from single date picker button
     * @returns Selected date text
     */
    async getSelectedSingleDate(): Promise<string> {
        const text = await this.singleDateButton.textContent();
        return text?.trim() || '';
    }

    /**
     * Navigate to previous month in the calendar
     */
    async goToPreviousMonth(): Promise<void> {
        await this.prevMonthButton.waitFor({ state: 'visible', timeout: 5000 });
        await this.prevMonthButton.click();
        await this.page.waitForTimeout(500);
    }

    /**
     * Navigate to next month in the calendar
     */
    async goToNextMonth(): Promise<void> {
        await this.nextMonthButton.waitFor({ state: 'visible', timeout: 5000 });
        await this.nextMonthButton.click();
        await this.page.waitForTimeout(500);
    }

    /**
     * Get the current month/year displayed in calendar header
     * @returns Month and year text (e.g., "January 2026")
     */
    async getCurrentCalendarMonth(): Promise<string> {
        const header = this.page.locator('[class*="caption"], [class*="month-caption"]').first();
        const text = await header.textContent();
        return text?.trim() || '';
    }

    /**
     * Navigate to a specific month by clicking prev/next buttons
     * @param direction - 'prev' or 'next'
     * @param times - Number of times to click
     */
    async navigateCalendarMonths(direction: 'prev' | 'next', times: number = 1): Promise<void> {
        for (let i = 0; i < times; i++) {
            if (direction === 'prev') {
                await this.goToPreviousMonth();
            } else {
                await this.goToNextMonth();
            }
        }
    }

    // =========================================
    // PAGE ACTIONS - Date Range Selection
    // =========================================

    /**
     * Open the date range picker calendar
     */
    async openDateRangePicker(): Promise<void> {
        await this.dateRangeButton.click();
        await this.calendarPopover.waitFor({ state: 'visible', timeout: 3000 });
    }

    /**
     * Select a date range (start and end dates)
     * @param startDay - Start day number
     * @param endDay - End day number
     */
    async selectDateRange(startDay: number, endDay: number): Promise<void> {
        await this.openDateRangePicker();

        // Select start date
        await this.selectDay(startDay);
        await this.page.waitForTimeout(300);

        // Select end date
        await this.selectDay(endDay);
        await this.page.waitForTimeout(300);

        // Submit the range
        await this.submitDateRangeButton.click();
    }

    /**
     * Get the selected date range text from the button
     * @returns Selected date range text
     */
    async getSelectedDateRange(): Promise<string> {
        const text = await this.dateRangeButton.textContent();
        return text?.trim() || '';
    }

    // =========================================
    // PAGE ACTIONS - Date and Time
    // =========================================

    /**
     * Open the date and time picker calendar
     */
    async openDateTimePicker(): Promise<void> {
        await this.dateTimeButton.click();
        await this.calendarPopover.waitFor({ state: 'visible', timeout: 3000 });
    }

    /**
     * Set the time value in the time input
     * @param time - Time string (e.g., "2:30 PM")
     */
    async setTime(time: string): Promise<void> {
        await this.timeInput.click();
        await this.timeInput.clear();
        await this.timeInput.fill(time);
    }

    /**
     * Get the current time value from the time input
     * @returns Current time value
     */
    async getTimeValue(): Promise<string> {
        const value = await this.timeInput.inputValue();
        return value || '';
    }

    /**
     * Select a date and set time, then submit
     * @param day - Day number to select
     * @param time - Time string to set
     */
    async selectDateAndTime(day: number, time: string): Promise<void> {
        await this.openDateTimePicker();
        await this.selectDay(day);
        await this.page.waitForTimeout(300);

        // Close calendar if open by clicking elsewhere or pressing escape
        await this.page.keyboard.press('Escape');
        await this.page.waitForTimeout(200);

        await this.setTime(time);
        await this.submitDateTimeButton.click();
    }

    /**
     * Get the selected date from date-time picker button
     * @returns Selected date text
     */
    async getSelectedDateTime(): Promise<string> {
        const text = await this.dateTimeButton.textContent();
        return text?.trim() || '';
    }

    // =========================================
    // PAGE ACTIONS - Keyboard Navigation
    // =========================================

    /**
     * Press a keyboard key
     * @param key - Key to press (e.g., 'ArrowLeft', 'ArrowRight', 'Enter', 'Escape')
     */
    async pressKey(key: string): Promise<void> {
        await this.page.keyboard.press(key);
        await this.page.waitForTimeout(100);
    }

    /**
     * Navigate calendar using arrow keys
     * @param direction - 'left', 'right', 'up', 'down'
     */
    async navigateWithArrowKey(direction: 'left' | 'right' | 'up' | 'down'): Promise<void> {
        const keyMap = {
            'left': 'ArrowLeft',
            'right': 'ArrowRight',
            'up': 'ArrowUp',
            'down': 'ArrowDown'
        };
        await this.pressKey(keyMap[direction]);
    }

    /**
     * Get the currently focused day in the calendar
     * @returns Focused day number or null
     */
    async getFocusedDay(): Promise<number | null> {
        try {
            const focusedElement = this.page.locator('button[role="gridcell"]:focus');
            const text = await focusedElement.textContent();
            return text ? parseInt(text.trim(), 10) : null;
        } catch {
            return null;
        }
    }

    // =========================================
    // PAGE ACTIONS - Range Validation
    // =========================================

    /**
     * Check if a specific day is disabled/outside valid range
     * @param day - Day number to check
     * @returns True if the day is disabled
     */
    async isDayDisabled(day: number): Promise<boolean> {
        const dayButton = this.page.getByRole('gridcell', { name: new RegExp(`^${day}$`) }).first();
        const isDisabled = await dayButton.isDisabled();
        const ariaDisabled = await dayButton.getAttribute('aria-disabled');
        const hasDisabledClass = await dayButton.evaluate(el =>
            el.classList.contains('disabled') ||
            el.classList.contains('day-disabled') ||
            el.classList.contains('day-outside')
        );
        return isDisabled || ariaDisabled === 'true' || hasDisabledClass;
    }

    /**
     * Attempt to click a disabled day and verify it doesn't get selected
     * @param day - Day number to attempt clicking
     * @returns True if click was blocked (day is disabled)
     */
    async attemptClickDisabledDay(day: number): Promise<boolean> {
        const beforeDate = await this.getSelectedSingleDate();

        try {
            const dayButton = this.page.getByRole('gridcell', { name: new RegExp(`^${day}$`) }).first();
            await dayButton.click({ timeout: 1000 });
        } catch {
            return true; // Click was blocked
        }

        const afterDate = await this.getSelectedSingleDate();
        return beforeDate === afterDate;
    }

    // =========================================
    // PAGE ACTIONS - Toast Verification
    // =========================================

    /**
     * Get the toast notification message
     * @returns Toast message text
     */
    async getToastMessage(): Promise<string> {
        try {
            await this.toastNotification.waitFor({ state: 'visible', timeout: 3000 });
            const text = await this.toastNotification.textContent();
            return text?.trim() || '';
        } catch {
            return '';
        }
    }

    /**
     * Wait for toast to disappear
     */
    async waitForToastToDisappear(): Promise<void> {
        try {
            await this.toastNotification.waitFor({ state: 'hidden', timeout: 5000 });
        } catch {
            // Toast may have already disappeared
        }
    }

    /**
     * Verify toast contains expected text
     * @param expectedText - Text expected to be in toast
     * @returns True if toast contains text
     */
    async verifyToastContains(expectedText: string): Promise<boolean> {
        const toastText = await this.getToastMessage();
        return toastText.toLowerCase().includes(expectedText.toLowerCase());
    }

    // =========================================
    // PAGE ACTIONS - Edge Cases
    // =========================================

    /**
     * Navigate to the first day of next month
     */
    async navigateToFirstDayNextMonth(): Promise<void> {
        await this.goToNextMonth();
        await this.selectDay(1);
    }

    /**
     * Navigate to the last day of previous month
     */
    async navigateToLastDayPreviousMonth(): Promise<void> {
        await this.goToPreviousMonth();
        // Select the last visible day (usually 28, 29, 30, or 31)
        const lastDayLocator = this.page.locator('button[role="gridcell"]:not([disabled])').last();
        await lastDayLocator.click();
    }

    /**
     * Check if calendar is visible/open
     * @returns True if calendar popover is visible
     */
    async isCalendarOpen(): Promise<boolean> {
        try {
            return await this.calendarPopover.isVisible();
        } catch {
            return false;
        }
    }

    /**
     * Close calendar by pressing Escape
     */
    async closeCalendar(): Promise<void> {
        await this.pressKey('Escape');
        await this.page.waitForTimeout(200);
    }
}