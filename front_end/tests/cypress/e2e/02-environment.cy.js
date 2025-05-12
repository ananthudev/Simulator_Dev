/// <reference types="cypress" />

describe("Environment Form", () => {
  beforeEach(() => {
    // Visit the mission page before each test
    cy.visit("/front_end/mission.html");

    // Ensure the page loads completely
    cy.get("#welcome-message").should("be.visible");

    // First fill out and save mission details to enable environment form
    cy.fillMissionForm({
      name: "Test Mission for Environment",
      mode: "simulation",
    }).click();

    cy.acceptSweetAlert();

    // Navigate to the environment form
    cy.navigateTo("environment");
  });

  it("should save valid environment details", () => {
    // Arrange - prepare test data
    const envData = {
      planet: "earth",
      atmosModel: "atmos_76",
      order: "20",
      degree: "20",
      core: "RE",
    };

    // Act - fill and submit the form
    cy.fillEnvironmentForm(envData).click();

    // Assert - verify the data was saved correctly
    cy.acceptSweetAlert(); // Handle success alert

    // Verify data in finalMissionData
    cy.getFinalMissionData().then((data) => {
      expect(data.Environment.planet).to.equal(envData.planet);
      expect(data.Environment.atmosModel).to.equal(envData.atmosModel);
      expect(data.Environment.order).to.equal(envData.order);
      expect(data.Environment.degree).to.equal(envData.degree);
      expect(data.Environment.core).to.equal(envData.core);
    });
  });

  it("should allow selection of different planets", () => {
    // Test each available planet option
    const planets = ["earth", "mars", "moon"];

    planets.forEach((planet) => {
      cy.get("#planets").select(planet);
      cy.get("#planets").should("have.value", planet);
    });
  });

  it("should upload atmospheric model CSV", () => {
    // Skip actual file upload for now - would need fixture file
    // This is a placeholder for when we have sample CSV files
    /* Example for when we implement this:
    cy.fixture('test-atmos-data.csv', 'base64').then(fileContent => {
      cy.get('#csv-upload').attachFile({
        fileContent,
        fileName: 'test-atmos-data.csv',
        mimeType: 'text/csv'
      })
      
      cy.get('#csv-filename').should('have.value', 'test-atmos-data.csv')
    })
    */
  });

  it("should upload wind data CSV", () => {
    // Skip actual file upload for now - would need fixture file
    // Similar to above test
  });

  it("should clear form fields when clear button is clicked", () => {
    // Arrange - fill the form first
    cy.fillEnvironmentForm({
      planet: "mars",
      atmosModel: "NRLMSISE-00",
      order: "25",
      degree: "25",
      core: "MSL",
    });

    // Act - click the clear button
    cy.get("#enviro-form .clear-btn").click();

    // Assert - verify fields are cleared or reset to defaults
    cy.get("#planets").should("have.value", "Environment");
    cy.get("#atmos-model").should("have.value", "Environment");
    cy.get("#order").should("have.value", "");
    cy.get("#degree").should("have.value", "");
    cy.get("#core").should("have.value", "choose_core");
  });

  it("should validate numeric inputs for gravity parameters", () => {
    // Enter non-numeric value
    cy.get("#order").clear().type("invalid");

    // Submit the form
    cy.get('#enviro-form button[type="submit"]').click();

    // Check for validation error
    cy.checkValidationError("#order");
  });
});
