/// <reference types="cypress" />

describe("Optimization Mode Mission Creation", () => {
  beforeEach(() => {
    // Visit the mission page before each test
    cy.visit("/front_end/mission.html");

    // Ensure the page loads completely
    cy.get("#welcome-message").should("be.visible");

    // Load the optimization mission test data
    cy.fixture("optimization-mission.json").as("testData");
  });

  it("should create a complete optimization mission from testcase data", () => {
    cy.get("@testData").then((data) => {
      // 1. Mission Details
      cy.navigateTo("mission");
      cy.fillMissionForm(data.missionDetails).click();
      cy.acceptSweetAlert();

      // Verify that optimization menu items appear in sidebar
      cy.get(".menu-tree").should("contain", "Optimization");

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

      // 11. Optimization - Objective Function
      // Click on Objective Function menu item
      cy.contains("Objective Function").click();

      // Add the objective function from the test data
      cy.get("#add-objective-btn").click();

      // Fill in the first objective function
      cy.get(".optimization-instance")
        .first()
        .within(() => {
          const objFunction = data.optimization.objectiveFunctions[0];
          cy.get("select.objective-name").select(objFunction.name);
          cy.get("select.objective-flag").select(objFunction.flag);
          cy.get("input.objective-factor").clear().type(objFunction.factor);
        });

      // Save objective functions
      cy.get("#objective-function-form .next-btn").click();
      cy.acceptSweetAlert();

      // 12. Optimization - Constraints
      cy.contains("Constraints").click();

      // Add constraints from test data
      data.optimization.constraints.forEach((constraint, index) => {
        if (index > 0) {
          cy.get("#add-constraint-btn").click();
        }

        // Fill in the constraint data
        cy.get(".optimization-instance")
          .eq(index)
          .within(() => {
            cy.get("select.constraint-name").select(constraint.name);
            cy.get("input.constraint-value").clear().type(constraint.value);
            cy.get("select.constraint-type").select(constraint.type);
            cy.get("select.constraint-condition").select(constraint.condition);
            cy.get("select.constraint-flag").select(constraint.flag);
            cy.get("input.constraint-tolerance")
              .clear()
              .type(constraint.tolerance);
          });
      });

      // Save constraints
      cy.get("#constraints-form .next-btn").click();
      cy.acceptSweetAlert();

      // 13. Optimization - Mode
      cy.contains("Mode").click();

      // Set mode parameters
      cy.get("#mode-normal").check({ force: true });
      cy.get("#normal-algorithm").select(data.optimization.mode.algorithm);
      cy.get("#normal-lower-bound")
        .clear()
        .type(data.optimization.mode.map.lowerBound);
      cy.get("#normal-upper-bound")
        .clear()
        .type(data.optimization.mode.map.upperBound);
      cy.get("#normal-population")
        .clear()
        .type(data.optimization.mode.population);
      cy.get("#normal-problem-strategy").select(
        data.optimization.mode.problemStrategy
      );

      // Save mode
      cy.get("#mode-form .next-btn").click();
      cy.acceptSweetAlert();

      // 14. Optimization - Design Variables
      cy.contains("Design Variables").click();

      // Add design variables from test data
      data.optimization.designVariables.forEach((designVar, index) => {
        if (index > 0) {
          cy.get("#add-design-variable-btn").click();
        }

        // Fill in the design variable data
        cy.get(".optimization-instance")
          .eq(index)
          .within(() => {
            cy.get("select.dv-category").select(designVar.category);
            cy.get("input.dv-name").clear().type(designVar.name);

            // Wait for category-specific fields to appear
            cy.wait(500);

            // Fill in category-specific fields
            if (designVar.category === "STEERING") {
              cy.get("select.dv-segment").select(designVar.segment);
              cy.get("select.dv-segment-type").select(designVar.segmentType);

              // Wait for segment type fields to appear
              cy.wait(500);

              cy.get("input.dv-control-variable")
                .clear()
                .type(designVar.controlVariable.join(", "));
              if (designVar.axis) {
                cy.get("select.dv-axis").select(designVar.axis[0]);
              }

              // Upper and lower bounds
              for (let i = 0; i < designVar.upperBound[0].length; i++) {
                cy.get("input.dv-upper-bound")
                  .clear()
                  .type(designVar.upperBound[0].join(", "));
                cy.get("input.dv-lower-bound")
                  .clear()
                  .type(designVar.lowerBound[0].join(", "));
              }
            } else if (
              designVar.category === "PAYLOAD" ||
              designVar.category === "AZIMUTH"
            ) {
              cy.get("input.dv-control-variable")
                .clear()
                .type(designVar.controlVariable.join(", "));
              cy.get("input.dv-upper-bound")
                .clear()
                .type(designVar.upperBound[0].join(", "));
              cy.get("input.dv-lower-bound")
                .clear()
                .type(designVar.lowerBound[0].join(", "));
            }
          });
      });

      // Save design variables
      cy.get("#save-design-variables-btn").click();
      cy.acceptSweetAlert();

      // 15. Launch Mission
      cy.get("#launch-btn").click();

      // Verify that the mission is ready to launch
      cy.get("body").should("contain", "Mission", { timeout: 10000 }); // Adjust as needed

      // Check the final mission data structure
      cy.getFinalMissionData().then((finalData) => {
        // Verify mission details
        expect(finalData.Mission.name).to.equal(data.missionDetails.name);
        expect(finalData.Mission.mode).to.equal(data.missionDetails.mode);

        // Verify optimization components exist
        expect(finalData).to.have.property("Optimization");
        expect(finalData.Optimization).to.have.property("ObjectiveFunction");
        expect(finalData.Optimization).to.have.property("Constraints");
        expect(finalData.Optimization).to.have.property("Mode");
        expect(finalData.Optimization).to.have.property("DesignVariables");
      });
    });
  });

  it("should validate inputs for optimization mode components", () => {
    cy.get("@testData").then((data) => {
      // First set up a basic mission with optimization mode
      cy.navigateTo("mission");
      cy.fillMissionForm(data.missionDetails).click();
      cy.acceptSweetAlert();

      // Validate objective function form
      cy.contains("Objective Function").click();
      cy.get("#add-objective-btn").click();

      // Try to save without selecting anything
      cy.get("#objective-function-form .next-btn").click();

      // Should show validation errors
      cy.get(".optimization-instance").should("have.class", "error-field");

      // Validate constraints form
      cy.contains("Constraints").click();
      cy.get("#add-constraint-btn").click();

      // Try to save without selecting anything
      cy.get("#constraints-form .next-btn").click();

      // Should show validation errors
      cy.get(".optimization-instance").should("have.class", "error-field");
    });
  });

  it("should allow complex optimization configuration with multiple design variables", () => {
    cy.get("@testData").then((data) => {
      // Set up the mission with basic details
      cy.navigateTo("mission");
      cy.fillMissionForm(data.missionDetails).click();
      cy.acceptSweetAlert();

      // Skip to design variables section
      cy.contains("Design Variables").click();

      // Add multiple design variables
      for (let i = 0; i < 3; i++) {
        if (i > 0) {
          cy.get("#add-design-variable-btn").click();
        }
      }

      // Verify that multiple design variables were added
      cy.get(".optimization-instance").should("have.length", 3);

      // Delete middle design variable
      cy.get(".optimization-instance")
        .eq(1)
        .within(() => {
          cy.get(".delete-instance-btn").click();
        });

      // Verify that one was deleted
      cy.get(".optimization-instance").should("have.length", 2);
    });
  });
});
