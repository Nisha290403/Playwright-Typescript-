# AI Fix Notes

Session: seq-1777372728023-9n8pw9w1e
Repository: Nisha290403/Playwright-Typescript-

- [1] (high) package.json: Playwright version is pinned with a caret (^1.40.0) but lockfile resolves to 1.57.0. This mismatch can cause non-reproducible installs and unexpected CI/local behavior. Align the manifest with the resolved version or regenerate the lockfile after intentional upgrades.
- [2] (high) pages/BasicTesting/DatePickerPage.ts: Date picker tests are often brittle when selectors depend on visible text, month names, or dynamically changing DOM structures. Use stable locators (data-testid, role-based selectors) and avoid index-based selectors where possible.
- [3] (high) pages/BasicTesting/FileUploadPage.ts: This file imports Node path utilities for file uploads. Ensure all uploaded file paths are restricted to a controlled test fixture directory and not derived from untrusted input, to avoid path traversal or accidental exposure of local files.
- [4] (high) pages/LoginPage.ts: Login page object should not contain any credential storage, default values, or test-data coupling. Keep the POM limited to UI interactions; move all scenario data and assertions into test/data layers.
- [5] (high) pages/RegisterPage.ts: Page Object classes should avoid mixing locators, navigation, assertions, and business rules too tightly. If this page object contains assertion-heavy methods or validation logic, split responsibilities into page actions and assertion helpers to preserve separation of concerns.

