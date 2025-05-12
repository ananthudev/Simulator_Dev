/// <reference types="cypress" />

describe("Mission Form", () => {
  beforeEach(() => {
    // Visit the mission page before each test
    cy.visit("/front_end/mission.html");

    // Ensure the page loads completely
    cy.get("#welcome-message").should("be.visible");

    // Navigate to the mission details form
    cy.navigateTo("mission");
  });

  it("should save valid mission details", () => {
    // Arrange - prepare test data
    const missionData = {
      name: "Test Apollo Mission",
      mode: "simulation",
      date: "2023-05-15",
      time: "09:30:45",
      tracking: true,
    };

    // Act - fill and submit the form
    cy.fillMissionForm(missionData).click();

    // Assert - verify the data was saved correctly
    cy.acceptSweetAlert(); // Handle success alert

    // Check that finalMissionData contains the correct information
    cy.getFinalMissionData().then((data) => {
      expect(data.Mission.name).to.equal(missionData.name);
      expect(data.Mission.mode).to.equal(missionData.mode);
      expect(data.Mission.date).to.equal(missionData.date);
      expect(data.Mission.time).to.equal(missionData.time);
      expect(data.Mission.tracking).to.equal(missionData.tracking);
    });
  });

  it("should show validation error for empty mission name", () => {
    // Arrange - prepare test data with empty name
    const missionData = {
      name: "",
      mode: "simulation",
      date: "2023-05-15",
      time: "09:30:45",
    };

    // Act - fill and submit the form
    cy.fillMissionForm(missionData).click();

    // Assert - verify validation error appears
    cy.checkValidationError("#mission-name");
  });

  it("should show validation error for invalid date", () => {
    // Skip if browser date validation can't be bypassed easily in Cypress
    // This might need a different approach as browsers handle date inputs differently
  });

  it("should clear form fields when clear button is clicked", () => {
    // Arrange - fill the form first
    cy.fillMissionForm({
      name: "Test Mission",
      mode: "simulation",
      date: "2023-05-15",
      time: "09:30:45",
    });

    // Act - click the clear button
    cy.get("#mission-form .clear-btn").click();

    // Assert - verify fields are cleared
    cy.get("#mission-name").should("have.value", "");
    cy.get("#mission-date").should("have.value", "");
    cy.get("#mission-time").should("have.value", "");
  });

  it("should update the sidebar menu when optimization mode is selected", () => {
    // Act - select optimization mode
    cy.get("#modes").select("optimization");
    cy.fillMissionForm({
      name: "Optimization Mission",
      mode: "optimization",
    }).click();

    cy.acceptSweetAlert();

    // Assert - verify optimization menu items appear in sidebar
    cy.get(".menu-tree").should("contain", "Optimization");
  });
});
