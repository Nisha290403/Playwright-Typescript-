import { Page, Locator, expect } from '@playwright/test';
import * as path from 'path';

/**
 * FileUploadPage - Page Object Model for the File Upload page
 * 
 * This class encapsulates all locators and actions related to the File Upload page.
 * Following POM best practices for maintainability and reusability.
 * 
 * Automation Challenges:
 * 1. Single File Upload - Select a single file and verify file information
 * 2. Multiple File Upload - Select multiple files and verify all appear in list
 * 3. Drag and Drop Upload - Drag files onto drop area and verify
 */
export class FileUploadPage {
    // Page instance
    readonly page: Page;

    // =========================================
    // LOCATORS - File Upload Inputs
    // =========================================

    /** Single file upload input */
    readonly singleFileInput: Locator;

    /** Multiple files upload input */
    readonly multipleFilesInput: Locator;

    /** Drag and drop area */
    readonly dragDropArea: Locator;

    // =========================================
    // LOCATORS - File Info Display
    // =========================================

    /** Single file info display container */
    readonly singleFileInfo: Locator;

    /** Single file name display */
    readonly singleFileName: Locator;

    /** Single file size display */
    readonly singleFileSize: Locator;

    /** Multiple files list container */
    readonly multipleFilesList: Locator;

    /** Individual file items in multiple files list */
    readonly multipleFileItems: Locator;

    /** Drag and drop file info */
    readonly dragDropFileInfo: Locator;

    /** Drag and drop file list */
    readonly dragDropFileList: Locator;

    // =========================================
    // LOCATORS - Navigation
    // =========================================

    /** Navigation locators */
    readonly basicTestingNav: Locator;
    readonly fileUploadNav: Locator;

    // =========================================
    // LOCATORS - Toast & Messages
    // =========================================

    /** Toast notification */
    readonly toastNotification: Locator;

    /** Success message */
    readonly successMessage: Locator;

    /**
     * Constructor - Initialize all locators
     * @param page - Playwright Page instance
     */
    constructor(page: Page) {
        this.page = page;

        // File Upload Inputs
        this.singleFileInput = page.locator('#single-file');
        this.multipleFilesInput = page.locator('#multiple-files');
        this.dragDropArea = page.locator('[data-testid="drag-drop-area"], .dropzone, [class*="drop"]').first();

        // File Info Display - Single
        this.singleFileInfo = page.locator('[data-testid="single-file-info"], #single-file-info, [class*="single-file"]').first();
        this.singleFileName = page.locator('[data-testid="single-file-name"], #single-file-name');
        this.singleFileSize = page.locator('[data-testid="single-file-size"], #single-file-size');

        // File Info Display - Multiple
        this.multipleFilesList = page.locator('[data-testid="multiple-files-list"], #multiple-files-list, [class*="file-list"]').first();
        this.multipleFileItems = page.locator('[data-testid="file-item"], .file-item, [class*="file-item"]');

        // File Info Display - Drag and Drop
        this.dragDropFileInfo = page.locator('[data-testid="drop-file-info"], #drop-file-info').first();
        this.dragDropFileList = page.locator('[data-testid="drop-file-list"], #drop-file-list').first();

        // Navigation
        this.basicTestingNav = page.locator('text=Basic Testing').first();
        this.fileUploadNav = page.locator('a[href="/file-upload"]');

        // Toast notification (common patterns for toast libraries)
        this.toastNotification = page.locator('[role="status"], [data-sonner-toast], .toast, [class*="toast"]').first();

        // Success message
        this.successMessage = page.locator('[class*="success"], .success-message, [data-testid="success"]').first();
    }

    // =========================================
    // PAGE ACTIONS - Navigation
    // =========================================

    /**
     * Navigate to the File Upload page via sidebar (required for SPA routing)
     * Direct URL navigation may return 404 on Azure Static Web Apps
     */
    async navigate(): Promise<void> {
        await this.page.goto('/');
        await this.page.waitForLoadState('networkidle');
        await this.fileUploadNav.click();
        await this.page.waitForLoadState('networkidle');
    }

    /**
     * Wait for the page to be fully loaded
     */
    async waitForPageLoad(): Promise<void> {
        await this.page.waitForLoadState('networkidle');
    }

    /**
     * Verify the File Upload page is displayed
     */
    async verifyPageLoaded(): Promise<void> {
        await expect(this.singleFileInput).toBeVisible();
        await expect(this.multipleFilesInput).toBeVisible();
    }

    // =========================================
    // PAGE ACTIONS - Single File Upload
    // =========================================

    /**
     * Upload a single file
     * @param filePath - Path to the file to upload
     */
    async uploadSingleFile(filePath: string): Promise<void> {
        const safeFilePath = this.getSafeTestFilePath(filePath);
        await this.singleFileInput.setInputFiles(safeFilePath);
        await this.page.waitForTimeout(500);
    }

    /**
     * Get the uploaded single file name
     * @returns The file name displayed after upload
     */
    async getSingleFileName(): Promise<string> {
        try {
            // Try to get from specific element first
            const fileName = await this.singleFileName.textContent();
            if (fileName) return fileName.trim();
        } catch {
            // Fallback to getting from info container
        }

        try {
            const fileInfo = await this.singleFileInfo.textContent();
            return fileInfo?.trim() || '';
        } catch {
            return '';
        }
    }

    /**
     * Get the uploaded single file size
     * @returns The file size displayed after upload
     */
    async getSingleFileSize(): Promise<string> {
        try {
            const fileSize = await this.singleFileSize.textContent();
            return fileSize?.trim() || '';
        } catch {
            return '';
        }
    }

    /**
     * Verify single file upload was successful
     * @param expectedFileName - Expected file name
     */
    async verifySingleFileUploaded(expectedFileName: string): Promise<void> {
        // Wait for file info to appear
        await this.page.waitForTimeout(500);

        // Get the displayed file info
        const displayedPage = await this.page.content();
        const fileInfoVisible = displayedPage.includes(expectedFileName);

        expect(fileInfoVisible).toBe(true);
    }

    /**
     * Clear single file upload
     */
    async clearSingleFile(): Promise<void> {
        await this.singleFileInput.setInputFiles([]);
    }

    // =========================================
    // PAGE ACTIONS - Multiple Files Upload
    // =========================================

    /**
     * Upload multiple files
     * @param filePaths - Array of file paths to upload
     */
    async uploadMultipleFiles(filePaths: string[]): Promise<void> {
        const safeFilePaths = filePaths.map(filePath => this.getSafeTestFilePath(filePath));
        await this.multipleFilesInput.setInputFiles(safeFilePaths);
        await this.page.waitForTimeout(500);
    }

    /**
     * Get the count of uploaded files in multiple files list
     * @returns Number of files displayed in the list
     */
    async getMultipleFilesCount(): Promise<number> {
        return await this.multipleFileItems.count();
    }

    /**
     * Get all file names from multiple files list
     * @returns Array of file names
     */
    async getMultipleFileNames(): Promise<string[]> {
        const count = await this.multipleFileItems.count();
        const fileNames: string[] = [];

        for (let i = 0; i < count; i++) {
            const text = await this.multipleFileItems.nth(i).textContent();
            if (text) fileNames.push(text.trim());
        }

        return fileNames;
    }

    /**
     * Verify multiple files were uploaded successfully
     * @param expectedFileNames - Array of expected file names
     */
    async verifyMultipleFilesUploaded(expectedFileNames: string[]): Promise<void> {
        await this.page.waitForTimeout(500);

        const pageContent = await this.page.content();

        for (const fileName of expectedFileNames) {
            const fileVisible = pageContent.includes(fileName);
            expect(fileVisible).toBe(true);
        }
    }

    /**
     * Clear multiple files upload
     */
    async clearMultipleFiles(): Promise<void> {
        await this.multipleFilesInput.setInputFiles([]);
    }

    // =========================================
    // PAGE ACTIONS - Drag and Drop Upload
    // =========================================

    /**
     * Upload file via drag and drop simulation
     * Note: Playwright's setInputFiles can work with file inputs inside drop zones
     * @param filePaths - Array of file paths to drag and drop
     */
    async dragAndDropFiles(filePaths: string[]): Promise<void> {
        const safeFilePaths = filePaths.map(filePath => this.getSafeTestFilePath(filePath));

        // Find the hidden file input within the drop zone if it exists
        const dropZoneInput = this.dragDropArea.locator('input[type="file"]');
        const inputExists = await dropZoneInput.count() > 0;

        if (inputExists) {
            await dropZoneInput.setInputFiles(safeFilePaths);
        } else {
            // Simulate drag and drop using dataTransfer
            const dataTransfer = await this.page.evaluateHandle(async (paths) => {
                const dt = new DataTransfer();
                for (const path of paths) {
                    // Create a mock file
                    const response = await fetch(path);
                    const blob = await response.blob();
                    const file = new File([blob], path.split('/').pop() || 'file', { type: blob.type });
                    dt.items.add(file);
                }
                return dt;
            }, safeFilePaths);

            await this.dragDropArea.dispatchEvent('drop', { dataTransfer });
        }

        await this.page.waitForTimeout(500);
    }

    /**
     * Get file names from drag and drop area
     * @returns Array of file names in the drop zone
     */
    async getDragDropFileNames(): Promise<string[]> {
        const fileList = await this.dragDropFileList.textContent();
        if (!fileList) return [];

        return fileList.split('\n').map(name => name.trim()).filter(name => name.length > 0);
    }

    /**
     * Verify drag and drop files were uploaded
     * @param expectedFileNames - Array of expected file names
     */
    async verifyDragDropFilesUploaded(expectedFileNames: string[]): Promise<void> {
        await this.page.waitForTimeout(500);

        const pageContent = await this.page.content();

        for (const fileName of expectedFileNames) {
            const fileVisible = pageContent.includes(fileName);
            expect(fileVisible).toBe(true);
        }
    }

    // =========================================
    // PAGE ACTIONS - Toast & Notifications
    // =========================================

    /**
     * Get the toast notification message
     * @returns Toast message text
     */
    async getToastMessage(): Promise<string> {
        try {
            await this.toastNotification.waitFor({ state: 'visible', timeout: 2000 });
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

    // =========================================
    // PAGE ACTIONS - Utility Methods
    // =========================================

    /**
     * Create a test file in the temp directory for upload testing
     * @param fileName - Name of the test file
     * @param content - Content to write to the file
     * @returns Path to the created file
     */
    getTestFilePath(fileName: string): string {
        return this.getSafeTestFilePath(fileName);
    }

    private getSafeTestFilePath(fileName: string): string {
        const testDataDir = path.resolve(process.cwd(), 'test-data');
        const resolvedPath = path.resolve(testDataDir, path.basename(fileName));

        if (!resolvedPath.startsWith(testDataDir + path.sep) && resolvedPath !== testDataDir) {
            throw new Error('Invalid test file path');
        }

        return resolvedPath;
    }

    /**
     * Check if file input has error validation
     * @returns True if there's a validation error displayed
     */
    async hasValidationError(): Promise<boolean> {
        const errorElement = this.page.locator('[class*="error"], .error-message, [data-testid="error"]').first();
        return await errorElement.isVisible().catch(() => false);
    }

    /**
     * Get validation error message if present
     * @returns Error message text
     */
    async getValidationErrorMessage(): Promise<string> {
        const errorElement = this.page.locator('[class*="error"], .error-message, [data-testid="error"]').first();
        try {
            const text = await errorElement.textContent();
            return text?.trim() || '';
        } catch {
            return '';
        }
    }
}