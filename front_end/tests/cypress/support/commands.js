// ***********************************************
// Custom commands for ASTRA GUI testing
// ***********************************************

// -- FORM FILLING COMMANDS --

/**
 * Fill out the mission form with provided data
 * @example cy.fillMissionForm({ name: 'Test Mission', mode: 'simulation', date: '2023-12-31', time: '12:00:00', tracking: true })
 */
Cypress.Commands.add("fillMissionForm", (data) => {
  const defaults = {
    name: "Test Mission",
    mode: "simulation",
    date: "2023-12-31",
    time: "12:00:00",
    tracking: true,
  };

  const formData = { ...defaults, ...data };

  cy.get("#mission-name").clear().type(formData.name);
  cy.get("#modes").select(formData.mode);

  if (formData.tracking) {
    cy.get("#tracking").check({ force: true });
  } else {
    cy.get("#tracking").uncheck({ force: true });
  }

  cy.get("#mission-date").clear().type(formData.date);
  cy.get("#mission-time").clear().type(formData.time);

  return cy.get("#save-mission");
});

/**
 * Fill out the environment form with provided data
 * @example cy.fillEnvironmentForm({ planet: 'earth', atmosModel: 'atmos_76', order: '20', degree: '20', core: 'RE' })
 */
Cypress.Commands.add("fillEnvironmentForm", (data) => {
  const defaults = {
    planet: "earth",
    atmosModel: "atmos_76",
    order: "20",
    degree: "20",
    core: "RE",
  };

  const formData = { ...defaults, ...data };

  cy.get("#planets").select(formData.planet);
  cy.get("#atmos-model").select(formData.atmosModel);
  cy.get("#order").clear().type(formData.order);
  cy.get("#degree").clear().type(formData.degree);
  cy.get("#core").select(formData.core);

  return cy.get('#enviro-form button[type="submit"]');
});

/**
 * Fill out the vehicle form with provided data
 * @example cy.fillVehicleForm({ name: 'Test Vehicle', type: 'ascend', ... })
 */
Cypress.Commands.add("fillVehicleForm", (data) => {
  const defaults = {
    name: "Test Vehicle",
    type: "ascend",
    payloadName: "Test Payload",
    payloadMass: "500",
    plfMass: "200",
    integrationMethod: "RK4",
    timeStep: "0.1",
    effectiveAlt: "100000",
    dataMethod: "launch",
    dciss: false,
  };

  const formData = { ...defaults, ...data };

  cy.get("#vehicle-name").clear().type(formData.name);
  cy.get("#vehicle-type").select(formData.type);
  cy.get("#payload-name").clear().type(formData.payloadName);
  cy.get("#payload-mass").clear().type(formData.payloadMass);
  cy.get("#plf-mass").clear().type(formData.plfMass);
  cy.get("#integration-method").select(formData.integrationMethod);
  cy.get("#time-step").clear().type(formData.timeStep);
  cy.get("#effective-alt").clear().type(formData.effectiveAlt);

  // Handle DCISS toggle
  if (formData.dciss) {
    cy.get("#vehicle-dciss").check({ force: true });
  } else {
    cy.get("#vehicle-dciss").uncheck({ force: true });
  }

  // Wait for vehicle type to take effect before selecting data method
  cy.wait(500);

  // Handle data method selection and related fields
  if (formData.type === "ascend" || formData.type === "projectile") {
    cy.get(`input[name="data-method"][value="${formData.dataMethod}"]`).check({
      force: true,
    });

    if (formData.dataMethod === "launch") {
      if (formData.type === "ascend") {
        // Fill ascend launch fields
        if (formData.latitude) cy.get("#lat").clear().type(formData.latitude);
        if (formData.longitude)
          cy.get("#long").clear().type(formData.longitude);
        if (formData.azimuth) cy.get("#azimuth").clear().type(formData.azimuth);
        if (formData.msl) cy.get("#msl").clear().type(formData.msl);
        if (formData.lpHeight)
          cy.get("#lp-height").clear().type(formData.lpHeight);
        if (formData.launchAngle)
          cy.get("#launch-angle").clear().type(formData.launchAngle);
        if (formData.roll) cy.get("#roll").clear().type(formData.roll);
        if (formData.pitch) cy.get("#pitch").clear().type(formData.pitch);
        if (formData.yaw) cy.get("#yaw").clear().type(formData.yaw);
      } else {
        // Fill projectile launch fields
        if (formData.latitude)
          cy.get("#lat-proj").clear().type(formData.latitude);
        if (formData.longitude)
          cy.get("#long-proj").clear().type(formData.longitude);
        if (formData.msl) cy.get("#msl-proj").clear().type(formData.msl);
        if (formData.azimuth)
          cy.get("#azimuth-proj").clear().type(formData.azimuth);
        if (formData.elevation)
          cy.get("#elevation").clear().type(formData.elevation);
        if (formData.launchAngle)
          cy.get("#launch-angle-proj").clear().type(formData.launchAngle);
        if (formData.initialVelocity)
          cy.get("#initial-velocity").clear().type(formData.initialVelocity);
      }
    } else if (formData.dataMethod === "states") {
      // Fill state fields
      if (formData.X) cy.get("#X").clear().type(formData.X);
      if (formData.Y) cy.get("#Y").clear().type(formData.Y);
      if (formData.Z) cy.get("#Z").clear().type(formData.Z);
      if (formData.U) cy.get("#U").clear().type(formData.U);
      if (formData.V) cy.get("#V").clear().type(formData.V);
      if (formData.W) cy.get("#W").clear().type(formData.W);
      if (formData.q0) cy.get("#q0").clear().type(formData.q0);
      if (formData.q1) cy.get("#q1").clear().type(formData.q1);
      if (formData.q2) cy.get("#q2").clear().type(formData.q2);
      if (formData.q3) cy.get("#q3").clear().type(formData.q3);
    }
  } else if (formData.type === "orbital") {
    cy.get(
      `input[name="orbital-method"][value="${
        formData.orbitalMethod || "state"
      }"]`
    ).check({ force: true });

    // Fill orbital fields based on method
    // Implementation depends on which orbital fields need to be filled
  }

  return cy.get('#vehicle-form button[type="submit"]');
});

/**
 * Add a stage with provided data
 * @example cy.addStage({ structuralMass: '1000', referenceArea: '10', burnTime: '120', dciss: true, coasting: false })
 */
Cypress.Commands.add("addStage", (stageNum, data) => {
  const defaults = {
    structuralMass: "1000",
    referenceArea: "10",
    burnTime: "120",
    dciss: false,
    coasting: false,
  };

  const stageData = { ...defaults, ...data };

  // Create stage using the new Vehicle Configuration approach if this is a new stage
  if (!Cypress.$(`#stage${stageNum}-form`).length) {
    // Navigate to Vehicle Configuration
    cy.get("#vehicle-stage-config-btn").click();

    // Enter the stage number (this will create stages up to that number)
    cy.get("#number-of-stages").clear().type(stageNum.toString());

    // Click Add Stages button
    cy.get("#add-stages-btn").click();

    // Handle the confirmation dialog if it appears
    cy.get("button").contains("OK").click();

    // Wait for form to appear
    cy.get(`#stage${stageNum}-form`).should("exist");

    // Navigate to the stage form we just created
    cy.get(`#stage${stageNum}-btn`).click();
  }

  // Fill stage form
  cy.get(`#stage${stageNum}-form input[placeholder="Enter Structural Mass"]`)
    .clear()
    .type(stageData.structuralMass);
  cy.get(`#stage${stageNum}-form input[placeholder="Enter Reference Area"]`)
    .clear()
    .type(stageData.referenceArea);
  cy.get(`#stage${stageNum}-form input[placeholder="Enter Burn Time"]`)
    .clear()
    .type(stageData.burnTime);

  // Handle toggles
  if (stageData.dciss) {
    cy.get(`#dciss-toggle-stage${stageNum}`).check({ force: true });
  } else {
    cy.get(`#dciss-toggle-stage${stageNum}`).uncheck({ force: true });
  }

  if (stageData.coasting) {
    cy.get(`#coasting-toggle-stage${stageNum}`).check({ force: true });
  } else {
    cy.get(`#coasting-toggle-stage${stageNum}`).uncheck({ force: true });
  }

  return cy.get(`#stage${stageNum}-form .save-stage-btn`);
});

/**
 * Add a motor to a stage with provided data
 * @example cy.addMotor(1, 1, { structuralMass: '500', propulsionType: 'Solid', propulsionMass: '5000', nozzleDiameter: '1.5' })
 */
Cypress.Commands.add("addMotor", (stageNum, motorNum, data) => {
  const defaults = {
    structuralMass: "500",
    propulsionType: "Solid",
    propulsionMass: "5000",
    nozzleDiameter: "1.5",
  };

  const motorData = { ...defaults, ...data };

  // Click add motor button if this is a new motor
  if (!Cypress.$(`#stage${stageNum}-motor${motorNum}-form`).length) {
    cy.get(`#add-motor-stage${stageNum}-btn`).click();
    // Wait for form to appear
    cy.get(`#stage${stageNum}-motor${motorNum}-form`).should("exist");
  }

  // Fill motor form
  cy.get(
    `#stage${stageNum}-motor${motorNum}-form input[placeholder="Enter Structural Mass"]`
  )
    .clear()
    .type(motorData.structuralMass);
  cy.get(`#stage${stageNum}-motor${motorNum}-form select.input-field`).select(
    motorData.propulsionType
  );
  cy.get(
    `#stage${stageNum}-motor${motorNum}-form input[placeholder="Enter Propulsion Mass"]`
  )
    .clear()
    .type(motorData.propulsionMass);
  cy.get(
    `#stage${stageNum}-motor${motorNum}-form input[placeholder="Enter Nozzle Diameter"]`
  )
    .clear()
    .type(motorData.nozzleDiameter);

  return cy.get(`#stage${stageNum}-motor${motorNum}-form .save-motor-btn`);
});

/**
 * Add an event to the sequence
 * @example cy.addSequenceEvent({ type: 'stage-start', flag: 'ST_1_INI', triggerType: 'mission-time', triggerValue: '0', reference: 'none' })
 */
Cypress.Commands.add("addSequenceEvent", (data) => {
  // Click the appropriate tab
  cy.get(`.sequence-tab[data-tab="${data.type}"]`).click();

  // Select the event flag
  cy.get("#event-flag").select(data.flag);

  // Set trigger type and value
  cy.get("#trigger-type").select(data.triggerType);
  cy.get("#trigger-value").clear().type(data.triggerValue);

  // Set reference flag
  cy.get("#dependent-event").select(data.reference || "none");

  // Add comment if provided
  if (data.comment) {
    cy.get("#event-comment").clear().type(data.comment);
  }

  // Click add event
  return cy.get("#add-event-btn");
});

/**
 * Add a steering component and configure it
 * @example cy.addSteeringComponent('verticalAscend', { startTriggerType: 'time', startTriggerValue: '0', stopTriggerType: 'time', stopTriggerValue: '30' })
 */
Cypress.Commands.add("addSteeringComponent", (type, config) => {
  // Click the component add button
  cy.get(`.add-component-btn[data-type="${type}"]`).click();

  // Select the newly added component from the active list
  cy.get("#active-components-list li").last().click();

  // Configure start conditions
  cy.get('.config-tab[data-tab="start"]').click();

  if (config.startTriggerType) {
    cy.get('[data-field="start_trigger_type"]').select(config.startTriggerType);
  }

  if (config.startTriggerValue) {
    cy.get('[data-field="start_trigger_value"]')
      .clear()
      .type(config.startTriggerValue);
  }

  if (config.startReference) {
    cy.get('[data-field="start_reference"]').select(config.startReference);
  }

  if (config.startComment) {
    cy.get('[data-field="start_comment"]').clear().type(config.startComment);
  }

  // Save start configuration
  cy.get("#save-start-config").click();

  // Configure stop conditions
  cy.get('.config-tab[data-tab="stop"]').click();

  if (config.stopTriggerType) {
    cy.get('[data-field="stop_trigger_type"]').select(config.stopTriggerType);
  }

  if (config.stopTriggerValue) {
    cy.get('[data-field="stop_trigger_value"]')
      .clear()
      .type(config.stopTriggerValue);
  }

  if (config.stopReference) {
    cy.get('[data-field="stop_reference"]').select(config.stopReference);
  }

  if (config.stopComment) {
    cy.get('[data-field="stop_comment"]').clear().type(config.stopComment);
  }

  // Save stop configuration
  cy.get("#save-stop-config").click();

  // Configure steering parameters if provided
  if (config.steeringType) {
    cy.get('.config-tab[data-tab="steering"]').click();
    cy.get('[data-field="steering_type"]').select(config.steeringType);

    // Handle specific steering type parameters
    if (
      config.steeringType === "constantBodyRate" &&
      config.axis &&
      config.value
    ) {
      cy.get('[data-field="axis"]').select(config.axis);
      cy.get('[data-field="rate_value"]').clear().type(config.value);
    }

    // Save steering configuration
    cy.get("#save-steering-config").click();
  }

  return cy.get("#active-components-list li").last();
});

/**
 * Configure a stopping condition
 * @example cy.configureStoppingCondition({ type: 'time', value: '200', condition: 'gt' })
 */
Cypress.Commands.add("configureStoppingCondition", (data) => {
  // Select the stopping condition type
  cy.get(`[name="stopping-criteria"][value="${data.type}"]`).check({
    force: true,
  });

  // Fill in the appropriate fields based on type
  switch (data.type) {
    case "flag":
      cy.get("#flag-name").select(data.flag);
      cy.get("#flag-value").clear().type(data.value);
      cy.get("#flag-condition").select(data.condition);
      break;
    case "time":
      cy.get("#time-value").clear().type(data.value);
      cy.get("#time-condition").select(data.condition);
      break;
    case "altitude":
      cy.get("#altitude-value").clear().type(data.value);
      cy.get("#altitude-condition").select(data.condition);
      break;
  }

  return cy.get('#stopping-form button[type="submit"]');
});

/**
 * Add an objective function for optimization
 * @example cy.addObjectiveFunction({ name: 'PAYLOAD_MASS', flag: 'ST_2_SEP', factor: -1 })
 */
Cypress.Commands.add("addObjectiveFunction", (data) => {
  // Click add objective button if needed
  cy.get("#add-objective-btn").click();

  // Get the last (newest) optimization instance
  cy.get(".optimization-instance")
    .last()
    .within(() => {
      cy.get("select.objective-name").select(data.name);
      cy.get("select.objective-flag").select(data.flag);
      cy.get("input.objective-factor").clear().type(data.factor);
    });

  return cy.get("#objective-function-form .next-btn");
});

/**
 * Add a constraint for optimization
 * @example cy.addConstraint({ name: 'APOGEE', value: '500.1', type: 'INEQUALITY', condition: 'LESS_THAN', flag: 'ST_2_SEP', tolerance: 0.1 })
 */
Cypress.Commands.add("addConstraint", (data) => {
  // Click add constraint button if needed
  cy.get("#add-constraint-btn").click();

  // Get the last (newest) optimization instance
  cy.get(".optimization-instance")
    .last()
    .within(() => {
      cy.get("select.constraint-name").select(data.name);
      cy.get("input.constraint-value").clear().type(data.value);
      cy.get("select.constraint-type").select(data.type);
      cy.get("select.constraint-condition").select(data.condition);
      cy.get("select.constraint-flag").select(data.flag);
      cy.get("input.constraint-tolerance").clear().type(data.tolerance);
    });

  return cy.get("#constraints-form .next-btn");
});

/**
 * Configure optimization mode settings
 * @example cy.configureOptimizationMode({ type: 'normal', algorithm: 'NLOPT', lowerBound: 0, upperBound: 1, population: 1, problemStrategy: 'ignore_o' })
 */
Cypress.Commands.add("configureOptimizationMode", (data) => {
  // Select mode type
  cy.get(`#mode-${data.type}`).check({ force: true });

  if (data.type === "normal") {
    // Configure normal mode settings
    cy.get("#normal-algorithm").select(data.algorithm);
    cy.get("#normal-lower-bound").clear().type(data.lowerBound);
    cy.get("#normal-upper-bound").clear().type(data.upperBound);
    cy.get("#normal-population").clear().type(data.population);
    cy.get("#normal-problem-strategy").select(data.problemStrategy);
  } else if (data.type === "archipelago") {
    // Configure archipelago mode settings
    // Implement based on interface needs
  }

  return cy.get("#mode-form .next-btn");
});

/**
 * Add a design variable for optimization
 * @example cy.addDesignVariable({ category: 'STEERING', name: 'optimz_pitchrate', segment: 'cnst_pitchrate', ... })
 */
Cypress.Commands.add("addDesignVariable", (data) => {
  // Click add design variable button if needed
  cy.get("#add-design-variable-btn").click();

  // Get the last (newest) optimization instance
  cy.get(".optimization-instance")
    .last()
    .within(() => {
      cy.get("select.dv-category").select(data.category);
      cy.get("input.dv-name").clear().type(data.name);

      // Wait for category-specific fields to appear
      cy.wait(500);

      // Fill category-specific fields based on category type
      if (data.category === "STEERING") {
        cy.get("select.dv-segment").select(data.segment);
        cy.get("select.dv-segment-type").select(data.segmentType);

        // Wait for segment type fields to appear
        cy.wait(500);

        cy.get("input.dv-control-variable")
          .clear()
          .type(data.controlVariable.join(", "));

        if (data.axis) {
          cy.get("select.dv-axis").select(data.axis[0]);
        }

        // Upper and lower bounds
        cy.get("input.dv-upper-bound")
          .clear()
          .type(data.upperBound[0].join(", "));
        cy.get("input.dv-lower-bound")
          .clear()
          .type(data.lowerBound[0].join(", "));
      } else if (data.category === "PAYLOAD" || data.category === "AZIMUTH") {
        cy.get("input.dv-control-variable")
          .clear()
          .type(data.controlVariable.join(", "));
        cy.get("input.dv-upper-bound")
          .clear()
          .type(data.upperBound[0].join(", "));
        cy.get("input.dv-lower-bound")
          .clear()
          .type(data.lowerBound[0].join(", "));
      }
    });

  return cy.get("#save-design-variables-btn");
});

// -- UTILITY COMMANDS --

/**
 * Navigate to a specific form by clicking its menu item
 * @example cy.navigateTo('mission')
 */
Cypress.Commands.add("navigateTo", (formName) => {
  const formMap = {
    mission: "#details-btn",
    environment: "#enviro-btn",
    vehicle: "#vehicle-btn",
    sequence: "#sequence-btn",
    steering: "#steering-btn",
    stopping: "#stopping-btn",
    optimization: "#optimization-btn",
    "objective-function": "#objective-function-btn",
    constraints: "#constraints-btn",
    "design-variables": "#design-variables-btn",
    mode: "#optimization-mode-btn",
  };

  const selector = formMap[formName];
  if (!selector) {
    throw new Error(`Unknown form name: ${formName}`);
  }

  return cy.get(selector).click();
});

/**
 * Get the final mission data object from the window
 * @example cy.getFinalMissionData().then(data => { ... })
 */
Cypress.Commands.add("getFinalMissionData", () => {
  return cy.window().then((win) => win.finalMissionData);
});

/**
 * Wait for a SweetAlert to appear and click its OK button
 * @example cy.acceptSweetAlert()
 */
Cypress.Commands.add("acceptSweetAlert", () => {
  return cy.get(".swal2-confirm").click();
});

/**
 * Wait for a SweetAlert to appear and click its Cancel button
 * @example cy.cancelSweetAlert()
 */
Cypress.Commands.add("cancelSweetAlert", () => {
  return cy.get(".swal2-cancel").click();
});

/**
 * Verify that a form field has a validation error
 * @example cy.checkValidationError('#mission-name')
 */
Cypress.Commands.add("checkValidationError", (selector) => {
  return cy.get(selector).should("have.class", "error-field");
});

/**
 * Check if a toast notification with specified text appears
 * @example cy.checkToastMessage('success', 'Mission details saved')
 */
Cypress.Commands.add("checkToastMessage", (type, text) => {
  return cy.get(`.swal2-${type}`).should("contain", text);
});

/**
 * Run a complete optimization setup with the provided fixture data
 * @example cy.setupOptimization('optimization-mission')
 */
Cypress.Commands.add("setupOptimization", (fixtureName) => {
  cy.fixture(fixtureName).then((data) => {
    // Set up mission details with optimization mode
    cy.navigateTo("mission");
    cy.fillMissionForm(data.missionDetails).click();
    cy.acceptSweetAlert();

    // Set up all the required components
    // Environment, Vehicle, Stages, Sequence, Steering, Stopping
    // and then the optimization components

    // This is a shorthand utility to quickly set up a complete optimization
    // for testing specific parts of the optimization workflow
  });
});

/**
 * Check optimization results
 * @example cy.checkOptimizationResults(expectedResults)
 */
Cypress.Commands.add("checkOptimizationResults", (expectedResults) => {
  cy.get("#optimization-results").within(() => {
    if (expectedResults.objectiveValue) {
      cy.get(".objective-value").should(
        "contain",
        expectedResults.objectiveValue
      );
    }

    if (expectedResults.iterations) {
      cy.get(".iterations").should("contain", expectedResults.iterations);
    }

    if (expectedResults.constraints) {
      cy.get(".constraints-table").within(() => {
        expectedResults.constraints.forEach((constraint, index) => {
          cy.get(`tr:nth-child(${index + 1})`).within(() => {
            cy.get("td:nth-child(1)").should("contain", constraint.name);
            cy.get("td:nth-child(2)").should("contain", constraint.value);
            cy.get("td:nth-child(3)").should("contain", constraint.status);
          });
        });
      });
    }
  });
});
