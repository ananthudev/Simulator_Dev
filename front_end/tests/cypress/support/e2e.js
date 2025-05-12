// ***********************************************************
// This is a support file that contains common commands
// for testing the ASTRA GUI application
// ***********************************************************

// Import Cypress commands
import "./commands";

// Suppress uncaught exception errors that might happen in the application
Cypress.on("uncaught:exception", (err, runnable) => {
  // Returning false prevents Cypress from failing the test when
  // uncaught exceptions occur in the application code
  return false;
});

// Print test title to console for better debugging
beforeEach(() => {
  const testTitle = Cypress.currentTest.title;
  cy.task("log", `Running Test: ${testTitle}`);
});

// Hide fetch/XHR requests from command log to reduce noise
const app = window.top;
if (
  app &&
  !app.document.head.querySelector("[data-hide-command-log-request]")
) {
  const style = app.document.createElement("style");
  style.setAttribute("data-hide-command-log-request", "");
  style.innerHTML =
    ".command-name-request, .command-name-xhr { display: none }";
  app.document.head.appendChild(style);
}
