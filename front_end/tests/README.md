# ASTRA GUI Testing Infrastructure

This directory contains a comprehensive testing infrastructure for the ASTRA GUI application. It is designed to be completely isolated from the production code, allowing for non-intrusive testing of the application's functionality.

## Test Stack Overview

- [**Cypress**](https://www.cypress.io/) - End-to-end testing framework
- [**Express**](https://expressjs.com/) - For the mock API server
- [**Node.js**](https://nodejs.org/) - Runtime environment for tests and mock server
- [**http-server**](https://github.com/http-party/http-server) - Simple HTTP server for serving the application during tests

## Directory Structure

- `cypress/` - Contains Cypress test configuration and tests
  - `e2e/` - End-to-end test files
  - `fixtures/` - Test data used in tests
  - `support/` - Custom commands and utilities
  - `videos/` - (Generated) Test run recordings
  - `screenshots/` - (Generated) Screenshots of failed tests
- `mock-server/` - Simple server for API testing
  - `server.js` - Mock server implementation
  - `package.json` - Mock server dependencies

## Test Files Overview

- **Basic Tests**

  - `01-mission.cy.js` - Tests for the mission form
  - `02-environment.cy.js` - Tests for the environment form
  - `03-end-to-end.cy.js` - Full end-to-end tests
  - `04-api-tests.cy.js` - API interaction tests

- **Realistic Mission Tests**
  - `05-simulation-mode.cy.js` - Tests using real simulation data from testcase.jsonc
  - `06-optimization-mode.cy.js` - Tests using real optimization data from testcase.jsonc

## Running the Tests

### Option 1: Using the batch file (Windows only)

We've created a convenient batch file to simplify running the tests:

1. From the `tests` directory, run: `run-tests.bat`
2. Choose one of the provided options:
   - Run all tests (headless mode)
   - Open Cypress test runner (interactive mode)
   - Start HTTP server only
   - Run API tests (requires mock server)

### Option 2: Using npm scripts

1. **Install dependencies** (first time only):

   ```
   cd front_end/tests
   npm install
   ```

2. **Run tests in headless mode** (for CI/automated testing):

   ```
   npm test
   ```

3. **Open the Cypress test runner** (for interactive testing):

   ```
   npm run test:open
   ```

4. **Run just the Simulation Mode tests**:

   ```
   npm run cypress:run -- --spec "cypress/e2e/05-simulation-mode.cy.js"
   ```

5. **Run just the Optimization Mode tests**:
   ```
   npm run cypress:run -- --spec "cypress/e2e/06-optimization-mode.cy.js"
   ```

## Adding New Tests

1. Place test data in the `cypress/fixtures/` directory
2. Create new test files in the `cypress/e2e/` directory
3. Use the custom commands defined in `cypress/support/commands.js`

## Fixtures Usage

- `simulation-mission.json` - Contains realistic mission data for simulation mode tests
- `optimization-mission.json` - Contains realistic mission data for optimization mode tests, including objective functions, constraints, and design variables

## Custom Commands

This test suite includes many custom commands to simplify test writing. Some key commands:

- Form filling: `fillMissionForm()`, `fillEnvironmentForm()`, etc.
- Navigation: `navigateTo()`
- Component addition: `addStage()`, `addMotor()`, etc.
- Optimization-specific: `addObjectiveFunction()`, `addConstraint()`, etc.

Check `cypress/support/commands.js` for the full list of available commands and their documentation.

## Troubleshooting

- If tests fail with DOM element not found errors, you may need to adjust selectors or add `{ timeout: 10000 }` to give more time for elements to appear.
- If you encounter path resolution issues, check the `cypress.config.js` file to ensure paths are correctly configured.

## Mock Server

For API tests, a mock server is included. Start it separately with:

```
cd mock-server
npm install
npm start
```

## Special Note on Test Stability

These tests were designed to work with real mission data from the ASTRA GUI application. The testcase.jsonc file was used as a basis for creating the test fixtures in order to ensure that the tests are as close to real-world usage as possible.

When modifying the application, be sure to update the test fixtures if necessary to keep the tests passing.

## Test Coverage

The test suite covers the following areas:

1. **Form Validation** - Tests for proper validation of all form inputs
2. **User Interactions** - Tests for UI elements responding correctly to user input
3. **Mission Workflow** - End-to-end tests for the complete mission creation flow
4. **API Interactions** - Tests for backend API communication
5. **Edge Cases** - Tests for handling of unexpected inputs and conditions

## Extending the Test Suite

### Adding New E2E Tests

1. Create a new `.cy.js` file in `cypress/e2e/`
2. Use existing custom commands in `cypress/support/commands.js` to simplify test writing
3. Use the fixture data in `cypress/fixtures/` for consistent test data

### Adding Custom Commands

If you need new reusable test functionality:

1. Add new commands to `cypress/support/commands.js`
2. Document the command with JSDoc comments
3. Follow the existing patterns for consistent implementation

### Adding Mock API Endpoints

If your tests need additional API endpoints:

1. Add new routes to `mock-server/server.js`
2. Follow RESTful practices for consistent API design
3. Update `mock-server/README.md` to document new endpoints

## CI/CD Integration

This test suite is designed to work with CI/CD pipelines. For example, to integrate with GitLab CI:

```yaml
# Example .gitlab-ci.yml section for testing
test:
  stage: test
  script:
    - cd front_end/tests/mock-server
    - npm install
    - node server.js &
    - cd ../
    - npm install
    - npm test
```

## Resources

- [Cypress Documentation](https://docs.cypress.io/)
- [Express Documentation](https://expressjs.com/en/4x/api.html)
- [ASTRA GUI Documentation](link-to-your-documentation)
