/// <reference types="cypress" />

describe("Simulation Mode Mission Creation", () => {
  beforeEach(() => {
    // Visit the mission page before each test
    cy.visit("/front_end/mission.html");

    // Ensure the page loads completely
    cy.get("#welcome-message").should("be.visible");

    // Load the simulation mission test data
    cy.fixture("simulation-mission.json").as("testData");
  });

  it("should create a complete simulation mission from testcase data", () => {
    cy.get("@testData").then((data) => {
      // 1. Mission Details
      cy.navigateTo("mission");
      cy.fillMissionForm(data.missionDetails).click();
      cy.acceptSweetAlert();

      // 2. Environment
      cy.navigateTo("environment");
      cy.fillEnvironmentForm(data.environment).click();
      cy.acceptSweetAlert();

      // 3. Vehicle Configuration
      cy.navigateTo("vehicle");
      cy.fillVehicleForm(data.vehicle).click();
      cy.acceptSweetAlert();

      // 4. Add Stage 1
      cy.addStage(1, {
        structuralMass: data.stages[0].structuralMass,
        referenceArea: data.stages[0].referenceArea,
        burnTime: data.stages[0].burnTime,
        dciss: data.stages[0].dciss,
        coasting: data.stages[0].coasting,
      }).click();
      cy.acceptSweetAlert();

      // 5. Add Motor to Stage 1
      cy.addMotor(1, 1, {
        structuralMass: data.stages[0].motors[0].structuralMass,
        propulsionType: data.stages[0].motors[0].propulsionType,
        propulsionMass: data.stages[0].motors[0].propulsionMass,
        nozzleDiameter: data.stages[0].motors[0].nozzleDiameter,
      }).click();
      cy.acceptSweetAlert();

      // 6. Add Stage 2
      cy.addStage(2, {
        structuralMass: data.stages[1].structuralMass,
        referenceArea: data.stages[1].referenceArea,
        burnTime: data.stages[1].burnTime,
        dciss: data.stages[1].dciss,
        coasting: data.stages[1].coasting,
      }).click();
      cy.acceptSweetAlert();

      // 7. Add Motor to Stage 2
      cy.addMotor(2, 1, {
        structuralMass: data.stages[1].motors[0].structuralMass,
        propulsionType: data.stages[1].motors[0].propulsionType,
        propulsionMass: data.stages[1].motors[0].propulsionMass,
        nozzleDiameter: data.stages[1].motors[0].nozzleDiameter,
      }).click();
      cy.acceptSweetAlert();

      // 8. Set up Sequence
      cy.navigateTo("sequence");

      // Add sequence events
      data.sequence.forEach((event) => {
        cy.addSequenceEvent(event).click();
      });

      // Save sequence
      cy.get("#sequence-form .next-btn").click();
      cy.acceptSweetAlert();

      // 9. Set up Steering
      cy.navigateTo("steering");

      // Select steering sequence
      cy.get("#sequence").select(data.steering.sequence);

      // Add steering components
      for (let i = 0; i < data.steering.components.length; i++) {
        const component = data.steering.components[i];
        cy.addSteeringComponent(component.type, {
          startTriggerType: component.startTriggerType,
          startTriggerValue: component.startTriggerValue,
          startReference: component.startReference,
          startComment: component.startComment,
          stopTriggerType: component.stopTriggerType,
          stopTriggerValue: component.stopTriggerValue,
          stopReference: component.stopReference,
          stopComment: component.stopComment,
          steeringType: component.steeringType,
          // Add specific steering params if present
          ...(component.axis && { axis: component.axis }),
          ...(component.value && { value: component.value }),
        });
      }

      // Save steering configuration
      cy.get("#saveConfig").click();
      cy.acceptSweetAlert();

      // 10. Stopping Condition
      cy.navigateTo("stopping");
      cy.configureStoppingCondition(data.stopping).click();
      cy.acceptSweetAlert();

      // 11. Launch Mission
      cy.get("#launch-btn").click();

      // Verify mission launch (this would depend on your implementation)
      cy.get("body").should("contain", "Mission", { timeout: 10000 }); // Adjust as needed

      // Check the final mission data structure
      cy.getFinalMissionData().then((finalData) => {
        // Verify mission details
        expect(finalData.Mission.name).to.equal(data.missionDetails.name);
        expect(finalData.Mission.mode).to.equal(data.missionDetails.mode);

        // Verify environment details
        expect(finalData.Environment.planet).to.equal(data.environment.planet);
        expect(finalData.Environment.atmosModel).to.equal(
          data.environment.atmosModel
        );

        // Verify vehicle details
        expect(finalData).to.have.property("testcase");
        expect(finalData.testcase).to.have.property("stage_1");
        expect(finalData.testcase).to.have.property("stage_2");

        // Verify sequence
        expect(finalData).to.have.property("Sequence");
      });
    });
  });

  it("should validate inputs for simulation mode mission", () => {
    cy.get("@testData").then((data) => {
      // Test validation for missing mission name
      cy.navigateTo("mission");
      cy.fillMissionForm({
        ...data.missionDetails,
        name: "",
      }).click();
      cy.checkValidationError("#mission-name");

      // Test validation for vehicle form
      cy.fillMissionForm(data.missionDetails).click();
      cy.acceptSweetAlert();

      cy.navigateTo("vehicle");
      cy.fillVehicleForm({
        ...data.vehicle,
        name: "",
      }).click();
      cy.checkValidationError("#vehicle-name");
    });
  });

  it("should allow editing of saved mission data", () => {
    cy.get("@testData").then((data) => {
      // First create a basic mission
      cy.navigateTo("mission");
      cy.fillMissionForm(data.missionDetails).click();
      cy.acceptSweetAlert();

      // Navigate back to mission form and edit the name
      cy.navigateTo("mission");
      cy.fillMissionForm({
        ...data.missionDetails,
        name: "Updated Mission Name",
      }).click();
      cy.acceptSweetAlert();

      // Verify that the name was updated
      cy.getFinalMissionData().then((finalData) => {
        expect(finalData.Mission.name).to.equal("Updated Mission Name");
      });
    });
  });
});
