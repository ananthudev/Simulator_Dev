/// <reference types="cypress" />

describe("End-to-End Mission Creation", () => {
  beforeEach(() => {
    // Visit the mission page before each test
    cy.visit("/front_end/mission.html");

    // Ensure the page loads completely
    cy.get("#welcome-message").should("be.visible");
  });

  it("should create a complete simulation mission", () => {
    // 1. Mission Details
    cy.navigateTo("mission");
    cy.fillMissionForm({
      name: "E2E Test Mission",
      mode: "simulation",
      date: "2023-12-31",
      time: "10:00:00",
      tracking: true,
    }).click();
    cy.acceptSweetAlert();

    // 2. Environment
    cy.navigateTo("environment");
    cy.fillEnvironmentForm({
      planet: "earth",
      atmosModel: "atmos_76",
      order: "20",
      degree: "20",
      core: "RE",
    }).click();
    cy.acceptSweetAlert();

    // 3. Vehicle Configuration
    cy.navigateTo("vehicle");
    cy.fillVehicleForm({
      name: "Test Rocket",
      type: "ascend",
      payloadName: "Test Satellite",
      payloadMass: "500",
      plfMass: "150",
      integrationMethod: "RK4",
      timeStep: "0.1",
      effectiveAlt: "100000",
      dataMethod: "launch",
      latitude: "28.5",
      longitude: "-80.65",
      azimuth: "90",
      msl: "0",
      lpHeight: "50",
      launchAngle: "89",
      roll: "0",
      pitch: "0",
      yaw: "0",
      dciss: false,
    }).click();
    cy.acceptSweetAlert();

    // 4. Add Stage
    cy.addStage(1, {
      structuralMass: "2000",
      referenceArea: "12",
      burnTime: "120",
      dciss: false,
      coasting: false,
    }).click();
    cy.acceptSweetAlert();

    // 5. Add Motor to Stage
    cy.addMotor(1, 1, {
      structuralMass: "500",
      propulsionType: "Solid",
      propulsionMass: "10000",
      nozzleDiameter: "2.5",
    }).click();
    cy.acceptSweetAlert();

    // 6. Sequence
    cy.navigateTo("sequence");

    // Add Stage Start
    cy.addSequenceEvent({
      type: "stage-start",
      flag: "ST_1_INI", // This would need to be an actual flag from your system
      triggerType: "mission-time",
      triggerValue: "0",
      reference: "none",
      comment: "Initial stage start",
    }).click();

    // Add Motor Ignition
    cy.addSequenceEvent({
      type: "motor-ignition",
      flag: "MOT_1_IGN", // This would need to be an actual flag from your system
      triggerType: "mission-time",
      triggerValue: "0.5",
      reference: "ST_1_INI",
      comment: "Motor ignition",
    }).click();

    // Add Motor Termination
    cy.addSequenceEvent({
      type: "motor-termination",
      flag: "MOT_1_TERM", // This would need to be an actual flag from your system
      triggerType: "mission-time",
      triggerValue: "120",
      reference: "MOT_1_IGN",
      comment: "Motor burnout",
    }).click();

    // Add Stage Separation
    cy.addSequenceEvent({
      type: "stage-separation",
      flag: "ST_1_SEP", // This would need to be an actual flag from your system
      triggerType: "mission-time",
      triggerValue: "125",
      reference: "MOT_1_TERM",
      comment: "Stage separation",
    }).click();

    // Save sequence
    cy.get("#sequence-form .next-btn").click();
    cy.acceptSweetAlert();

    // 7. Steering
    cy.navigateTo("steering");

    // Select steering sequence
    cy.get("#sequence").select("123");

    // Add vertical ascend component
    cy.addSteeringComponent("verticalAscend", {
      startTriggerType: "time",
      startTriggerValue: "0",
      stopTriggerType: "time",
      stopTriggerValue: "10",
      startComment: "Start vertical ascent",
      stopComment: "End vertical ascent",
    });

    // Add gravity turn component
    cy.addSteeringComponent("gravityTurn", {
      startTriggerType: "time",
      startTriggerValue: "10",
      stopTriggerType: "time",
      stopTriggerValue: "120",
      startComment: "Start gravity turn",
      stopComment: "End gravity turn",
      steeringType: "clg",
      // Add specific CLG parameters if needed
    });

    // Save steering configuration
    cy.get("#saveConfig").click();
    cy.acceptSweetAlert();

    // 8. Stopping Condition
    cy.navigateTo("stopping");
    cy.configureStoppingCondition({
      type: "time",
      value: "500",
      condition: "eq",
    }).click();
    cy.acceptSweetAlert();

    // 9. Launch Mission
    cy.get("#launch-btn").click();

    // Verify mission launch
    // This would depend on how your application handles mission launching
    // For example, checking for a success message or redirection
    cy.get("body").should("contain", "Mission Launched"); // Adjust the selector and text as needed
  });

  it("should create a basic optimization mission", () => {
    // Similar to the above, but with optimization mode
    // and additional optimization-specific configuration

    // Start with mission details in optimization mode
    cy.navigateTo("mission");
    cy.fillMissionForm({
      name: "E2E Optimization Test",
      mode: "optimization",
      date: "2023-12-31",
      time: "10:00:00",
      tracking: true,
    }).click();
    cy.acceptSweetAlert();

    // The rest of the test would follow a similar pattern,
    // with additional steps for objective functions, constraints, etc.

    // This is a placeholder - implementation would depend on
    // the specific optimization features
  });
});
