const { defineConfig } = require("cypress");
const path = require("path");

module.exports = defineConfig({
  viewportWidth: 1280,
  viewportHeight: 800,
  screenshotOnRunFailure: true,
  video: true,
  videoCompression: 32,
  e2e: {
    baseUrl: "http://localhost:8080",
    supportFile: "./cypress/support/e2e.js",
    setupNodeEvents(on, config) {
      // Register custom Cypress tasks here
      on("task", {
        // Task to log messages to console during test runs
        log(message) {
          console.log(message);
          return null;
        },
        // Task to read file contents (useful for verifying JSON output)
        readFileMaybe(filename) {
          const fs = require("fs");
          if (fs.existsSync(filename)) {
            return fs.readFileSync(filename, "utf8");
          }
          return null;
        },
      });

      return config;
    },
  },
});
