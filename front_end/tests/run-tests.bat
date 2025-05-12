@echo off
echo Starting ASTRA GUI Tests...
echo.

REM Check if http-server is installed
where http-server >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Installing http-server...
    npm install http-server start-server-and-test --save-dev
)

echo.
echo Choose a test mode:
echo 1. Run all tests (headless mode)
echo 2. Open Cypress test runner (interactive mode)
echo 3. Start HTTP server only
echo 4. Run API tests (requires mock server)
echo 5. Run Simulation Mode tests
echo 6. Run Optimization Mode tests
echo 7. Exit
echo.

set /p choice="Enter your choice (1-7): "

if "%choice%"=="1" (
    echo Running all tests in headless mode...
    start cmd /k "npm run start-server"
    timeout /t 3
    npm run cypress:run
    taskkill /f /im "node.exe" /fi "WINDOWTITLE eq http-server"
) else if "%choice%"=="2" (
    echo Opening Cypress test runner...
    start cmd /k "npm run start-server"
    timeout /t 3
    npm run cypress:open
    echo Note: Remember to close the HTTP server when done.
) else if "%choice%"=="3" (
    echo Starting HTTP server...
    npm run start-server
) else if "%choice%"=="4" (
    echo Running API tests...
    echo First, start the mock server in a new window.
    start cmd /k "cd mock-server && npm start"
    timeout /t 3
    echo Now running API tests...
    npm run cypress:run -- --spec "cypress/e2e/04-api-tests.cy.js"
    echo Note: Remember to close the mock server when done.
) else if "%choice%"=="5" (
    echo Running Simulation Mode tests...
    start cmd /k "npm run start-server"
    timeout /t 3
    npm run cypress:run -- --spec "cypress/e2e/05-simulation-mode.cy.js"
    taskkill /f /im "node.exe" /fi "WINDOWTITLE eq http-server"
) else if "%choice%"=="6" (
    echo Running Optimization Mode tests...
    start cmd /k "npm run start-server"
    timeout /t 3
    npm run cypress:run -- --spec "cypress/e2e/06-optimization-mode.cy.js"
    taskkill /f /im "node.exe" /fi "WINDOWTITLE eq http-server"
) else if "%choice%"=="7" (
    echo Exiting...
    exit /b 0
) else (
    echo Invalid choice. Please run the script again and select a valid option.
)

echo.
echo Tests completed! 