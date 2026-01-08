# Cucumber BDD Tests

BDD tests using Gherkin syntax and Cucumber.js with Playwright.

## Project Structure

```
features/
├── *.feature              # Gherkin feature files
├── step-definitions/      # Step definitions
├── support/               # World class and hooks
├── pages/                 # Page Object Model
└── tsconfig.json
```

## Running Tests

```bash
# Recommended: auto-start server and run tests
npm run test:cucumber:ci

# Manual: start server first, then run tests
npm run dev
npm run test:cucumber

# Run specific tags
npm run test:cucumber:tags "@Login"

# Open HTML report
npm run test:cucumber:report
```

## Reports

After running tests:
- `cucumber-report/cucumber-report.html` - HTML report
- `cucumber-report/cucumber-report.json` - JSON report

## Handling UI Changes

This project uses **Page Object Pattern**. When a UI element changes (ID, class, text), update only the corresponding Page Object file.

**Example:** Button text changes from "Register Now" to "Sign Up"

1. Update `features/pages/RegistrationPage.ts`:
```typescript
// Before:
await this.page.getByRole("button", { name: "Register Now" }).click();

// After:
await this.page.getByRole("button", { name: "Sign Up" }).click();
```

2. Update the feature file step if text changed:
```gherkin
# Before:
And I click on the "Register Now" button

# After:
And I click on the "Sign Up" button
```

**Best selectors for stability:**
- `data-testid` - most stable
- `getByRole` - semantic, good stability
- `getByPlaceholder` - good for inputs
- CSS/XPath - avoid when possible
