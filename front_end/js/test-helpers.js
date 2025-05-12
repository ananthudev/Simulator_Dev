// Test Helper Functions
function fillTestMissionData() {
  const data = window.TestData.mission;
  document.getElementById("mission-name").value = data.name;
  document.getElementById("modes").value = data.mode;
  document.getElementById("tracking").checked = data.tracking;
  document.getElementById("mission-date").value = data.date;
  document.getElementById("mission-time").value = data.time;
  // Trigger save implicitly by moving to next step in runAllTests or user action
}

function fillTestEnvironmentData() {
  const data = window.TestData.environment;

  // Planet selection
  document.getElementById("planets").value = data.planet;
  document.getElementById("planets").dispatchEvent(new Event("change"));

  // Atmospheric model selection
  document.getElementById("atmos-model").value = data.atmosphere.model;
  document.getElementById("atmos-model").dispatchEvent(new Event("change"));

  // Gravity parameters
  document.getElementById("order").value = data.gravity.order.toString();
  document.getElementById("degree").value = data.gravity.degree.toString();

  // Core info model
  const coreSelect = document.getElementById("core");
  if (coreSelect.querySelector(`option[value="${data.coe_info}"]`)) {
    coreSelect.value = data.coe_info;
  } else if (coreSelect.querySelector('option[value="RE"]')) {
    coreSelect.value = "RE"; // Fallback option
  }
  coreSelect.dispatchEvent(new Event("change"));
  // Trigger save implicitly
}

function fillTestVehicleData(vehicleType = "ascend") {
  const data = window.TestData.vehicle;

  // Basic vehicle data
  document.getElementById("vehicle-name").value = data.name;
  document.getElementById("vehicle-type").value = vehicleType;
  document.getElementById("integration-method").value = data.integration_method;
  document.getElementById("time-step").value = data.time_step.toString();
  document.getElementById("effective-alt").value =
    data.effective_altitude.toString();

  // DCISS toggle
  if (document.getElementById("vehicle-dciss")) {
    document.getElementById("vehicle-dciss").checked = data.dciss;
  }

  // Payload and PLF
  const payloadNameInput = document.getElementById("payload-name");
  if (payloadNameInput) payloadNameInput.value = data.payload.name;
  document.getElementById("payload-mass").value = data.payload.mass.toString();
  document.getElementById("plf-mass").value = data.plf.mass.toString();
  document.getElementById("plf-sep-value").value =
    data.plf.separation.value.toString();

  // Set separation type
  const plfTimeRadio = document.getElementById("plf-time");
  const plfAltitudeRadio = document.getElementById("plf-altitude");
  if (plfTimeRadio && plfAltitudeRadio) {
    if (data.plf.separation.type === "time") {
      plfTimeRadio.checked = true;
    } else {
      plfAltitudeRadio.checked = true;
    }
  }

  // Trigger vehicle type change event to show relevant fields
  const event = new Event("change");
  document.getElementById("vehicle-type").dispatchEvent(event);

  // Wait for dynamic fields to load
  setTimeout(() => {
    if (vehicleType === "ascend") {
      const ascendData = data.initial_conditions.ascend;

      // Select data method (launch point or states)
      const dataMethodRadios = document.querySelectorAll(
        'input[name="data-method"]'
      );
      if (dataMethodRadios.length > 0) {
        const selectedRadio = Array.from(dataMethodRadios).find(
          (radio) => radio.value === ascendData.data_method
        );
        if (selectedRadio) {
          selectedRadio.checked = true;
          selectedRadio.dispatchEvent(new Event("change"));
        }
      }

      // Fill launch point data (wait a bit more for fields to show)
      if (ascendData.data_method === "launch") {
        setTimeout(() => {
          const lp = ascendData.launch_point;
          document.getElementById("lat").value = lp.latitude.toString();
          document.getElementById("long").value = lp.longitude.toString();
          document.getElementById("azimuth").value = lp.azimuth.toString();
          document.getElementById("msl").value = lp.msl.toString();
          document.getElementById("lp-height").value = lp.lp_height.toString();
          document.getElementById("launch-angle").value =
            lp.launch_angle.toString();
          document.getElementById("roll").value = lp.roll.toString();
          document.getElementById("pitch").value = lp.pitch.toString();
          document.getElementById("yaw").value = lp.yaw.toString();
          // Trigger save implicitly
        }, 150);
      } else if (ascendData.data_method === "states") {
        // Fill states data if that method was selected
        setTimeout(() => {
          const s = ascendData.states;
          document.getElementById("X").value = s.X.toString();
          document.getElementById("Y").value = s.Y.toString();
          document.getElementById("Z").value = s.Z.toString();
          document.getElementById("U").value = s.U.toString();
          document.getElementById("V").value = s.V.toString();
          document.getElementById("W").value = s.W.toString();
          document.getElementById("q0").value = s.q0.toString();
          document.getElementById("q1").value = s.q1.toString();
          document.getElementById("q2").value = s.q2.toString();
          document.getElementById("q3").value = s.q3.toString();
        }, 150);
      }
    } else if (vehicleType === "projectile") {
      const projectileData = data.initial_conditions.projectile;

      // Select launch point data
      const launchRadio = document.querySelector(
        'input[name="data-method"][value="launch"]'
      );
      if (launchRadio) {
        launchRadio.checked = true;
        launchRadio.dispatchEvent(new Event("change"));
      }

      // Fill PROJECTILE launch point data
      setTimeout(() => {
        const lp = projectileData.launch_point;
        document.getElementById("lat-proj").value = lp.latitude.toString();
        document.getElementById("long-proj").value = lp.longitude.toString();
        document.getElementById("msl-proj").value = lp.msl.toString();
        document.getElementById("azimuth-proj").value = lp.azimuth.toString();
        document.getElementById("elevation").value = lp.elevation.toString();
        document.getElementById("launch-angle-proj").value =
          lp.launch_angle.toString();
        document.getElementById("initial-velocity").value =
          lp.initial_velocity.toString();
        // Trigger save implicitly
      }, 150);
    } else if (vehicleType === "orbital") {
      const orbitalData = data.initial_conditions.orbital;

      // Select orbital method (state, tle, elements)
      const methodRadios = document.querySelectorAll(
        'input[name="orbital-method"]'
      );
      if (methodRadios.length > 0) {
        const selectedRadio = Array.from(methodRadios).find(
          (radio) => radio.value === orbitalData.data_method
        );
        if (selectedRadio) {
          selectedRadio.checked = true;
          selectedRadio.dispatchEvent(new Event("change"));
        }
      }

      // Fill data based on selected method
      setTimeout(() => {
        if (orbitalData.data_method === "state") {
          const s = orbitalData.state;
          document.getElementById("X-orbital").value = s.X.toString();
          document.getElementById("Y-orbital").value = s.Y.toString();
          document.getElementById("Z-orbital").value = s.Z.toString();
          document.getElementById("U-orbital").value = s.U.toString();
          document.getElementById("V-orbital").value = s.V.toString();
          document.getElementById("W-orbital").value = s.W.toString();
          document.getElementById("q0-orbital").value = s.q0.toString();
          document.getElementById("q1-orbital").value = s.q1.toString();
          document.getElementById("q2-orbital").value = s.q2.toString();
          document.getElementById("q3-orbital").value = s.q3.toString();
        } else if (orbitalData.data_method === "tle") {
          const tle = orbitalData.tle;
          document.getElementById("line1").value = tle.line1;
          document.getElementById("line2").value = tle.line2;
          document.getElementById("start-time").value =
            tle.start_time.toString();
          document.getElementById("stop-time").value = tle.stop_time.toString();
          document.getElementById("step-time").value = tle.step_time.toString();
        } else if (orbitalData.data_method === "elements") {
          const elem = orbitalData.elements;
          document.getElementById("semi-major-axis").value =
            elem.semi_major_axis.toString();
          document.getElementById("eccentricity").value =
            elem.eccentricity.toString();
          document.getElementById("inclination").value =
            elem.inclination.toString();
          document.getElementById("argument-perigee").value =
            elem.argument_perigee.toString();
          document.getElementById("raan").value = elem.raan.toString();
          document.getElementById("true-anomaly").value =
            elem.true_anomaly.toString();
        }
      }, 150);
    }
  }, 100); // Initial timeout after vehicle type change
}

// Updated Helper Function for Stages
function fillTestStageData(stageNumber) {
  const stageId = `stage${stageNumber}`;
  const stageForm = document.getElementById(`${stageId}-form`);
  if (!stageForm) {
    console.error(`Stage form ${stageId}-form not found!`);
    return;
  }
  console.log(`Filling data for Stage ${stageNumber}`);

  // Get data from TestData
  const stageData = window.TestData.stage[stageId];
  if (!stageData) {
    console.error(`No test data found for ${stageId}`);
    return;
  }

  const structuralMassInput = stageForm.querySelector(
    'input[placeholder="Enter Structural Mass"]'
  );
  const refAreaInput = stageForm.querySelector(
    'input[placeholder="Enter Reference Area"]'
  );
  const burnTimeInput = stageForm.querySelector(
    'input[placeholder="Enter Burn Time"]'
  );

  if (structuralMassInput)
    structuralMassInput.value = stageData.structural_mass.toString();
  if (refAreaInput) refAreaInput.value = stageData.reference_area.toString();
  if (burnTimeInput) burnTimeInput.value = stageData.burn_time.toString();

  // Trigger input events for potential real-time validation/updates
  [structuralMassInput, refAreaInput, burnTimeInput].forEach((input) => {
    if (input) input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

// Updated Helper Function for Motors
function fillTestMotorData(stageNumber, motorNumber) {
  const stageId = `stage${stageNumber}`;
  const motorId = `motor${stageNumber}_${motorNumber}`;
  const motorForm = document.getElementById(
    `${stageId}-motor${motorNumber}-form`
  );
  if (!motorForm) {
    console.error(`Motor form ${stageId}-motor${motorNumber}-form not found!`);
    return;
  }
  console.log(`Filling data for Motor ${stageNumber}_${motorNumber}`);

  // Get data from TestData
  const motorData = window.TestData.motor[motorId];
  if (!motorData) {
    console.error(`No test data found for ${motorId}, using default data`);
    // Use default data if specific motor not found
    const defaultMotorData = {
      propulsion_type: "Solid",
      nozzle_diameter: 0.5 + motorNumber * 0.1,
      propulsion_mass: 5000 + motorNumber * 50,
    };
    fillMotorWithData(motorForm, defaultMotorData);
    return;
  }

  fillMotorWithData(motorForm, motorData);
}

// Helper function to fill motor form with given data
function fillMotorWithData(motorForm, motorData) {
  // Find the propulsion type select (which could have different selectors in different forms)
  let propulsionTypeSelect = motorForm.querySelector("select.input-field"); // Try generic selector

  // If not found, try more specific selectors
  if (!propulsionTypeSelect || !propulsionTypeSelect.options) {
    const selects = motorForm.querySelectorAll("select");
    for (const select of selects) {
      // Find the select that has propulsion type options
      if (
        select.options &&
        Array.from(select.options).some((opt) =>
          ["Solid", "Liquid", "Hybrid"].includes(opt.value)
        )
      ) {
        propulsionTypeSelect = select;
        break;
      }
    }
  }

  const nozzleDiameterInput = motorForm.querySelector(
    'input[placeholder="Enter Nozzle Diameter"]'
  );
  const propulsionMassInput = motorForm.querySelector(
    'input[placeholder="Enter Propulsion Mass"]'
  );

  // Set the propulsion type if found
  if (propulsionTypeSelect && propulsionTypeSelect.options) {
    // Check if the expected propulsion type exists as an option
    const typeExists = Array.from(propulsionTypeSelect.options).some(
      (option) =>
        option.value.toLowerCase() === motorData.propulsion_type.toLowerCase()
    );

    if (typeExists) {
      propulsionTypeSelect.value = motorData.propulsion_type;
    } else {
      // Find the first available type to select as fallback
      if (propulsionTypeSelect.options.length > 0) {
        for (const option of propulsionTypeSelect.options) {
          if (option.value && option.value !== "") {
            propulsionTypeSelect.value = option.value;
            console.warn(
              `Propulsion type "${motorData.propulsion_type}" not found, using "${option.value}" instead`
            );
            break;
          }
        }
      }
    }

    propulsionTypeSelect.dispatchEvent(new Event("change", { bubbles: true }));
  }

  if (nozzleDiameterInput)
    nozzleDiameterInput.value = motorData.nozzle_diameter.toString();
  if (propulsionMassInput)
    propulsionMassInput.value = motorData.propulsion_mass.toString();

  // Trigger input events
  [propulsionTypeSelect, nozzleDiameterInput, propulsionMassInput].forEach(
    (input) => {
      if (input) input.dispatchEvent(new Event("input", { bubbles: true }));
    }
  );
}

// Functions to find active forms remain unchanged
function findActiveStageForm() {
  const stageForms = document.querySelectorAll(
    'form[id^="stage"]:not([id*="-motor"])[id$="-form"]'
  );
  for (const form of stageForms) {
    // Check if the form is visible (not hidden by class or style)
    if (
      form.offsetParent !== null &&
      !form.classList.contains("hidden-form") &&
      form.style.display !== "none"
    ) {
      return form;
    }
  }
  console.log("No active stage form found.");
  return null;
}

function fillCurrentStageData() {
  const activeStageForm = findActiveStageForm();
  if (!activeStageForm) {
    console.error("Could not find the currently active stage form to fill.");
    alert("Please navigate to the stage tab you want to fill.");
    return;
  }

  // Extract stage number (e.g., from "stage1-form" get "1")
  const stageMatch = activeStageForm.id.match(/^stage(\d+)-form$/);
  if (!stageMatch || !stageMatch[1]) {
    console.error(
      "Could not determine stage number from form ID:",
      activeStageForm.id
    );
    return;
  }

  const stageNumber = parseInt(stageMatch[1], 10);
  fillTestStageData(stageNumber);
}

function findActiveMotorForm() {
  const motorForms = document.querySelectorAll(
    'form[id^="stage"][id*="-motor"][id$="-form"]'
  );
  for (const form of motorForms) {
    if (
      form.offsetParent !== null &&
      !form.classList.contains("hidden-form") &&
      form.style.display !== "none"
    ) {
      return form;
    }
  }
  console.log("No active motor form found.");
  return null;
}

function fillCurrentMotorData() {
  const activeMotorForm = findActiveMotorForm();
  if (!activeMotorForm) {
    console.error("Could not find the currently active motor form to fill.");
    alert("Please navigate to the motor tab you want to fill.");
    return;
  }

  // Extract stage and motor number (e.g., from "stage1-motor2-form" get stage=1, motor=2)
  const motorMatch = activeMotorForm.id.match(/^stage(\d+)-motor(\d+)-form$/);
  if (!motorMatch || !motorMatch[1] || !motorMatch[2]) {
    console.error(
      "Could not determine stage/motor numbers from form ID:",
      activeMotorForm.id
    );
    return;
  }

  const stageNumber = parseInt(motorMatch[1], 10);
  const motorNumber = parseInt(motorMatch[2], 10);
  fillTestMotorData(stageNumber, motorNumber);
}

// Main test runner - consolidating all tests
function runAllTests() {
  console.log("Running all tests in sequence...");

  // Clear status indicator if it exists
  const statusIndicator = document.querySelector(".test-status-indicator");
  if (statusIndicator) {
    statusIndicator.innerHTML = "";
    statusIndicator.style.display = "block";
  }

  const runStep = (description, func, time = 1000) => {
    return new Promise((resolve) => {
      console.log(`Step: ${description}`);
      // Update status indicator if it exists
      if (statusIndicator) {
        const stepElement = document.createElement("div");
        stepElement.className = "test-step pending";
        stepElement.innerHTML = `<span class="step-description">${description}</span> <span class="step-status">⏳</span>`;
        statusIndicator.appendChild(stepElement);
      }

      setTimeout(() => {
        try {
          func();
          console.log(`✓ Completed: ${description}`);
          // Update step status to completed if indicator exists
          if (statusIndicator) {
            const stepElement =
              statusIndicator.querySelector(`.test-step.pending`);
            if (stepElement) {
              stepElement.className = "test-step completed";
              stepElement.querySelector(".step-status").textContent = "✓";
            }
          }
        } catch (error) {
          console.error(`✗ Error in step "${description}":`, error);
          // Update step status to error if indicator exists
          if (statusIndicator) {
            const stepElement =
              statusIndicator.querySelector(`.test-step.pending`);
            if (stepElement) {
              stepElement.className = "test-step error";
              stepElement.querySelector(".step-status").textContent = "✗";
              stepElement.title = error.message;
            }
          }
        }
        resolve();
      }, time);
    });
  };

  // Sequence the steps with Promises
  runStep("Fill Mission Details", () => {
    document.getElementById("details-btn").click();
    fillTestMissionData();
    document.getElementById("save-mission").click();
  })
    .then(() =>
      runStep("Fill Environment Details", () => {
        document.getElementById("enviro-btn").click();
        fillTestEnvironmentData();
        const submitButton = document.querySelector(
          "#enviro-form button[type='submit']"
        );
        if (submitButton) submitButton.click();
      })
    )
    .then(() =>
      runStep("Fill Vehicle Details", () => {
        document.getElementById("vehicle-btn").click();
        fillTestVehicleData();
        const submitButton = document.querySelector(
          "#vehicle-form button[type='submit']"
        );
        if (submitButton) submitButton.click();
      })
    )
    .then(() => {
      console.log("✓ All automated tests completed!");
      // Update final status if indicator exists
      if (statusIndicator) {
        const finalStatus = document.createElement("div");
        finalStatus.className = "test-final-status";
        finalStatus.textContent = "✓ All automated tests completed!";
        statusIndicator.appendChild(finalStatus);
      }
    });
}

// File upload simulation functions remain unchanged
function simulateFileUpload(
  inputElement,
  fileName,
  mimeType = "text/csv",
  content = ""
) {
  // Create a File object with the provided content
  const file = new File([content], fileName, { type: mimeType });

  // Create a FileList-like object
  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(file);

  // Set the files property on the file input
  inputElement.files = dataTransfer.files;

  // Dispatch change event
  inputElement.dispatchEvent(new Event("change", { bubbles: true }));

  return file;
}

// Aero and Thrust data upload functions updated to use TestData if available
function fillTestAeroData(stageNumber) {
  const stageId = `stage${stageNumber}`;
  const aeroInput = document.querySelector(
    `#${stageId}-form input[type="file"][accept=".csv"]`
  );
  if (!aeroInput) {
    console.error(`Aero data upload input not found for ${stageId}`);
    return;
  }

  // Use test data if available or provide a simple test CSV
  const stageData = window.TestData.stage[stageId];
  const csvContent =
    stageData && stageData.aero_data
      ? stageData.aero_data
      : "Mach,Altitude,Cd\n0,0,0.5\n1,10000,0.6\n2,20000,0.4\n";

  const fileName = `${stageId}_aero_data.csv`;
  simulateFileUpload(aeroInput, fileName, "text/csv", csvContent);
  console.log(`Aero data file uploaded for ${stageId}: ${fileName}`);
}

function fillTestThrustData(stageNumber, motorNumber) {
  const motorId = `motor${stageNumber}_${motorNumber}`;
  const motorForm = document.querySelector(
    `#stage${stageNumber}-motor${motorNumber}-form`
  );
  if (!motorForm) {
    console.error(`Motor form not found for ${motorId}`);
    return;
  }

  const thrustInput = motorForm.querySelector(
    `input[type="file"][accept=".csv"]`
  );
  if (!thrustInput) {
    console.error(`Thrust data upload input not found for ${motorId}`);
    return;
  }

  // Use test data if available or provide a simple test CSV
  const motorData = window.TestData.motor[motorId];
  const csvContent =
    motorData && motorData.thrust_data
      ? motorData.thrust_data
      : "Time,Thrust\n0,100000\n10,95000\n20,90000\n30,85000\n40,0\n";

  const fileName = `${motorId}_thrust_data.csv`;
  simulateFileUpload(thrustInput, fileName, "text/csv", csvContent);
  console.log(`Thrust data file uploaded for ${motorId}: ${fileName}`);
}

// New function to fill sequence data using TestData
function fillTestSequenceData() {
  if (!window.TestData.sequence || window.TestData.sequence.length === 0) {
    console.error("No sequence test data available");
    return;
  }

  // First make sure we're on the sequence form
  document.getElementById("sequence-btn").click();

  // Filter out sequence events with '_CUTOFF' in their identity as requested
  const filteredSequenceData = window.TestData.sequence.filter(
    (eventData) => !eventData.identity.includes("_CUTOFF")
  );

  // Add each filtered sequence event from test data
  filteredSequenceData.forEach((eventData, index) => {
    console.log(`Adding sequence event ${index + 1}:`, eventData.identity);

    // Wait for the form to be fully visible
    setTimeout(() => {
      // Determine event type based on identity (this is a simplification, may need adjustment)
      let eventType = "stage-start"; // Default
      if (eventData.identity.includes("_IGN")) {
        eventType = "motor-ignition";
      } else if (
        eventData.identity.includes("_TERM")
        // Removed _CUTOFF check here as we filtered it out above
      ) {
        eventType = "motor-termination";
      } else if (eventData.identity.includes("_SEP")) {
        eventType = "stage-separation";
      } else if (eventData.identity.includes("HSS")) {
        eventType = "heat-shield-separation";
      }

      // Click the appropriate tab
      const tabButton = document.querySelector(
        `.sequence-tab[data-tab="${eventType}"]`
      );
      if (tabButton) {
        tabButton.click();
      }

      // Fill the form fields
      setTimeout(() => {
        const eventFlagSelect = document.getElementById("event-flag");
        const triggerTypeSelect = document.getElementById("trigger-type");
        const triggerValueInput = document.getElementById("trigger-value");
        const dependentEventSelect = document.getElementById("dependent-event");
        const eventCommentInput = document.getElementById("event-comment");

        // Set hidden event type
        document.getElementById("event-type").value = eventType;

        // Check if the event flag exists in the dropdown, if not we may need to add it
        const flagExists = Array.from(eventFlagSelect.options).some(
          (option) => option.value === eventData.identity
        );
        if (!flagExists && eventFlagSelect.options.length > 0) {
          const newOption = new Option(eventData.identity, eventData.identity);
          eventFlagSelect.add(newOption);
        }
        eventFlagSelect.value = eventData.identity;

        // Set trigger type
        let triggerTypeValue = "mission-time"; // Default
        if (eventData.trigger === "MISSION_TIME")
          triggerTypeValue = "mission-time";
        else if (eventData.trigger === "PHASE_TIME")
          triggerTypeValue = "phase-time";
        else if (eventData.trigger === "ALTITUDE")
          triggerTypeValue = "altitude";

        triggerTypeSelect.value = triggerTypeValue;

        // Set reference flag
        if (eventData.reference && eventData.reference !== "none") {
          const refExists = Array.from(dependentEventSelect.options).some(
            (option) => option.value === eventData.reference
          );
          if (!refExists && dependentEventSelect.options.length > 0) {
            const newOption = new Option(
              eventData.reference,
              eventData.reference
            );
            dependentEventSelect.add(newOption);
          }
          dependentEventSelect.value = eventData.reference;
        } else {
          dependentEventSelect.value = "none";
        }

        // Set comment
        eventCommentInput.value = eventData.comment || "";

        // Click add event button
        document.getElementById("add-event-btn").click();
      }, 200);
    }, 500 + index * 1000); // Stagger each event addition
  });
}

// New function to fill stopping condition data using TestData
function fillTestStoppingConditionData() {
  const data = window.TestData.stopping;
  if (!data) {
    console.error("No stopping condition test data available");
    return;
  }

  // First make sure we're on the stopping condition form
  document.getElementById("stopping-btn").click();

  // Wait for the form to be visible
  setTimeout(() => {
    // Set the criteria radio button
    const radioCriteria = document.querySelector(
      `input[name="stopping-criteria"][value="${data.criteria}"]`
    );
    if (radioCriteria) {
      radioCriteria.checked = true;
      radioCriteria.dispatchEvent(new Event("change"));
    }

    // Fill the appropriate fields based on criteria
    if (data.criteria === "flag") {
      const flagSelect = document.getElementById("flag-name");
      const flagCondition = document.getElementById("flag-condition");
      const flagValue = document.getElementById("flag-value");

      // Make sure the flag exists in the dropdown
      const flagData = data.flag;
      const flagExists = Array.from(flagSelect.options).some(
        (option) => option.value === flagData.name
      );
      if (!flagExists && flagSelect.options.length > 0) {
        const newOption = new Option(flagData.name, flagData.name);
        flagSelect.add(newOption);
      }
      flagSelect.value = flagData.name;
      flagCondition.value = flagData.condition;
      flagValue.value = flagData.value.toString();
    } else if (data.criteria === "time") {
      const timeValue = document.getElementById("time-value");
      const timeCondition = document.getElementById("time-condition");

      const timeData = data.time;
      timeValue.value = timeData.value.toString();
      timeCondition.value = timeData.condition;
    } else if (data.criteria === "altitude") {
      const altitudeValue = document.getElementById("altitude-value");
      const altitudeCondition = document.getElementById("altitude-condition");

      const altitudeData = data.altitude;
      altitudeValue.value = altitudeData.value.toString();
      altitudeCondition.value = altitudeData.condition;
    }

    // Submit the form
    const submitButton = document.querySelector(
      "#stopping-form button[type='submit']"
    );
    if (submitButton) {
      setTimeout(() => submitButton.click(), 200);
    }
  }, 500);
}

// Add new function to fill steering data
function fillTestSteeringData() {
  const steeringData = window.TestData.steering;
  if (!steeringData) {
    console.error("No steering test data available");
    return;
  }

  // Navigate to the steering form
  document.getElementById("steering-btn").click();

  // Wait for the form to be visible
  setTimeout(() => {
    console.log("Filling steering data...");

    // Set sequence
    const sequenceSelect = document.getElementById("sequence");
    if (sequenceSelect) {
      sequenceSelect.value = steeringData.sequence;
      sequenceSelect.dispatchEvent(new Event("change"));
    }

    // Add and configure each steering component
    const components = steeringData.components;
    if (components && components.length > 0) {
      addSteeringComponents(components);
    }

    // Save the entire steering configuration
    setTimeout(() => {
      const saveConfigButton = document.getElementById("saveConfig");
      if (saveConfigButton) {
        saveConfigButton.click();
        console.log("Steering configuration saved");
      }
    }, 1000 * components.length + 1000); // Wait for all components to be added and configured
  }, 500);
}

// Helper function to add steering components sequentially
function addSteeringComponents(components) {
  if (!components || components.length === 0) return;

  let index = 0;

  function addNextComponent() {
    if (index >= components.length) return;

    const component = components[index];
    console.log(`Adding steering component: ${component.name}`);

    // Find and click the add button for this component type
    const addButton = document.querySelector(
      `.add-component-btn[data-type="${component.type}"]`
    );

    if (addButton) {
      addButton.click();

      // Wait for the component to be added to the active list
      setTimeout(() => {
        // Find and click the new component in the active list
        const activeComponents = document.querySelectorAll(
          "#active-components-list li"
        );
        if (activeComponents && activeComponents.length > 0) {
          // Click the most recently added component (should be the last one)
          const lastComponent = activeComponents[activeComponents.length - 1];
          if (lastComponent) {
            lastComponent.click();

            // Wait for the configuration panel to load
            setTimeout(() => {
              configureSteeringComponent(component);

              // Move to the next component
              index++;
              if (index < components.length) {
                setTimeout(addNextComponent, 1000);
              }
            }, 500);
          }
        }
      }, 500);
    } else {
      console.error(
        `Add button for component type "${component.type}" not found`
      );
      index++;
      if (index < components.length) {
        setTimeout(addNextComponent, 500);
      }
    }
  }

  // Start adding components
  addNextComponent();
}

// Helper function to configure a steering component
function configureSteeringComponent(component) {
  // Config tabs
  const startTab = document.querySelector('.config-tab[data-tab="start"]');
  const stopTab = document.querySelector('.config-tab[data-tab="stop"]');
  const steeringTab = document.querySelector(
    '.config-tab[data-tab="steering"]'
  );

  // Configure Start tab
  if (startTab) {
    startTab.click();
    setTimeout(() => {
      fillSteeringForm("start", component.start);

      // Save the start configuration
      const saveStartBtn = document.getElementById("save-start-config");
      if (saveStartBtn) saveStartBtn.click();

      // Move to Stop tab
      setTimeout(() => {
        if (stopTab) {
          stopTab.click();
          setTimeout(() => {
            fillSteeringForm("stop", component.stop);

            // Save the stop configuration
            const saveStopBtn = document.getElementById("save-stop-config");
            if (saveStopBtn) saveStopBtn.click();

            // Move to Steering tab
            setTimeout(() => {
              if (steeringTab) {
                steeringTab.click();
                setTimeout(() => {
                  fillSteeringParams(component.parameters);

                  // Save the steering configuration
                  const saveSteeringBtn = document.getElementById(
                    "save-steering-config"
                  );
                  if (saveSteeringBtn) saveSteeringBtn.click();
                }, 300);
              }
            }, 300);
          }, 300);
        }
      }, 300);
    }, 300);
  }
}

// Helper function to fill steering start/stop form fields
function fillSteeringForm(section, data) {
  if (!data) return;

  const fields = document.querySelectorAll(
    `#config-tab-${section} [data-field^="${section}_"]`
  );

  fields.forEach((field) => {
    const fieldName = field
      .getAttribute("data-field")
      .replace(`${section}_`, "");
    if (data[fieldName] !== undefined) {
      if (field.tagName === "SELECT") {
        const value = data[fieldName];
        // Check if the value exists in the options
        const exists = Array.from(field.options).some(
          (opt) => opt.value === value
        );

        if (exists) {
          field.value = value;
          field.dispatchEvent(new Event("change"));
        } else if (field.options.length > 0) {
          // Use the first non-empty option as fallback
          for (const option of field.options) {
            if (option.value && option.value !== "") {
              field.value = option.value;
              field.dispatchEvent(new Event("change"));
              break;
            }
          }
        }
      } else {
        field.value = data[fieldName];
        field.dispatchEvent(new Event("input"));
      }
    }
  });
}

// Helper function to fill steering parameters based on steering type
function fillSteeringParams(params) {
  if (!params) return;

  // Select the steering type
  const steeringTypeSelect = document.querySelector(
    'select[data-field="steering_type"]'
  );
  if (steeringTypeSelect && params.steering_type) {
    steeringTypeSelect.value = params.steering_type;
    steeringTypeSelect.dispatchEvent(new Event("change"));

    // Wait for dynamic fields to appear
    setTimeout(() => {
      // Find the correct steering params section
      const paramsSection = document.querySelector(
        `.steering-params[data-steering-type="${params.steering_type}"]`
      );

      if (paramsSection) {
        // Handle special cases based on steering type
        switch (params.steering_type) {
          case "constantBodyRate":
            // Fill axis and value fields
            if (params.axis) {
              const axisSelect = paramsSection.querySelector(
                '[data-param="axis"]'
              );
              if (axisSelect) {
                axisSelect.value = params.axis;
                axisSelect.dispatchEvent(new Event("change"));
              }
            }

            if (params.value !== undefined) {
              const valueInput = paramsSection.querySelector(
                '[data-param="value"]'
              );
              if (valueInput) {
                valueInput.value = params.value;
                valueInput.dispatchEvent(new Event("input"));
              }
            }
            break;

          case "clg":
            // Select algorithm first
            if (params.algorithm) {
              const algorithmSelect = paramsSection.querySelector(
                '[data-param="algorithm"]'
              );
              if (algorithmSelect) {
                algorithmSelect.value = params.algorithm;
                algorithmSelect.dispatchEvent(new Event("change"));

                // Wait for sub-fields to appear
                setTimeout(() => {
                  const subFields = document.querySelector(
                    `.steering-params-clg-sub[data-clg-algorithm="${params.algorithm}"]`
                  );

                  if (subFields) {
                    // Fill AOA fields
                    if (params.algorithm === "aoa") {
                      if (params.max_qaoa !== undefined) {
                        const maxQaoaInput = subFields.querySelector(
                          '[data-param="max_qaoa"]'
                        );
                        if (maxQaoaInput) {
                          maxQaoaInput.value = params.max_qaoa;
                          maxQaoaInput.dispatchEvent(new Event("input"));
                        }
                      }

                      if (params.alpha_time !== undefined) {
                        const alphaTimeInput = subFields.querySelector(
                          '[data-param="alpha_time"]'
                        );
                        if (alphaTimeInput) {
                          alphaTimeInput.value = params.alpha_time;
                          alphaTimeInput.dispatchEvent(new Event("input"));
                        }
                      }
                    }
                    // Fill FPA fields
                    else if (params.algorithm === "fpa") {
                      if (params.pitch_gain !== undefined) {
                        const pitchGainInput = subFields.querySelector(
                          '[data-param="pitch_gain"]'
                        );
                        if (pitchGainInput) {
                          pitchGainInput.value = params.pitch_gain;
                          pitchGainInput.dispatchEvent(new Event("input"));
                        }
                      }

                      if (params.yaw_gain !== undefined) {
                        const yawGainInput = subFields.querySelector(
                          '[data-param="yaw_gain"]'
                        );
                        if (yawGainInput) {
                          yawGainInput.value = params.yaw_gain;
                          yawGainInput.dispatchEvent(new Event("input"));
                        }
                      }
                    }
                  }
                }, 300);
              }
            }
            break;

          case "profile":
            // Fill mode, quantity, and independent var
            if (params.mode) {
              const modeSelect = paramsSection.querySelector(
                '[data-param="mode"]'
              );
              if (modeSelect) {
                modeSelect.value = params.mode;
                modeSelect.dispatchEvent(new Event("change"));
              }
            }

            if (params.quantity) {
              const quantitySelect = paramsSection.querySelector(
                '[data-param="quantity"]'
              );
              if (quantitySelect) {
                quantitySelect.value = params.quantity;
                quantitySelect.dispatchEvent(new Event("change"));
              }
            }

            if (params.independentVar) {
              const indVarSelect = paramsSection.querySelector(
                '[data-param="independentVar"]'
              );
              if (indVarSelect) {
                indVarSelect.value = params.independentVar;
                indVarSelect.dispatchEvent(new Event("change"));
              }
            }

            // Handle profile CSV data
            if (params.profile_csv) {
              // Update the filename display
              const filenameInput = document.getElementById(
                "profile-csv-filename"
              );
              if (filenameInput) {
                filenameInput.value =
                  params.profile_csv_filename || "profile_data.csv";
                filenameInput.dispatchEvent(new Event("input"));

                // Create a simulated file upload
                const fileInput = document.getElementById("profile-csv-upload");
                if (fileInput) {
                  simulateFileUpload(
                    fileInput,
                    params.profile_csv_filename || "profile_data.csv",
                    "text/csv",
                    params.profile_csv
                  );
                }
              }
            }
            break;
        }
      }

      // Fill the comment field (common for all types)
      if (params.comment) {
        const commentInput = document.querySelector(
          '[data-field="steering_comment"]'
        );
        if (commentInput) {
          commentInput.value = params.comment;
          commentInput.dispatchEvent(new Event("input"));
        }
      }
    }, 300);
  }
}

// Function to fill objective function data
function fillTestObjectiveFunction() {
  // Check if we're in optimization mode
  ensureOptimizationMode(() => {
    const objData = window.TestData.optimization.objective;
    if (!objData || objData.length === 0) {
      console.error("No objective function test data available");
      return;
    }

    // Navigate to the objective function form
    const objNavLink = document.querySelector(
      'a[href="#objective-function-form"]'
    );
    if (objNavLink) {
      objNavLink.click();
    } else {
      document.getElementById("objective-function-form").style.display =
        "block";
    }

    // Wait for the form to be visible
    setTimeout(() => {
      console.log("Filling objective function data...");

      // Add objective functions
      for (let i = 0; i < Math.min(objData.length, 2); i++) {
        // Max 2 objective functions
        // Click add objective button if needed
        if (
          i > 0 ||
          document.querySelectorAll(
            "#objective-function-container .optimization-instance"
          ).length === 0
        ) {
          const addObjBtn = document.getElementById("add-objective-btn");
          if (addObjBtn) {
            addObjBtn.click();

            // Wait for the new objective form to appear
            setTimeout(() => {
              fillObjectiveInstance(i, objData[i]);
            }, 300);
          }
        } else {
          fillObjectiveInstance(i, objData[i]);
        }
      }

      // Save the objective functions
      setTimeout(() => {
        const saveBtn = document.querySelector(
          '#objective-function-form button[type="submit"]'
        );
        if (saveBtn) {
          saveBtn.click();
          console.log("Objective functions saved");
        }
      }, 1000);
    }, 500);
  });
}

// Helper function to fill a single objective function instance
function fillObjectiveInstance(index, data) {
  // Find the objective function instance
  const instances = document.querySelectorAll(
    "#objective-function-container .optimization-instance"
  );
  if (instances.length <= index) {
    console.error(`Objective function instance ${index} not found`);
    return;
  }

  const instance = instances[index];

  // Fill the fields
  const nameInput = instance.querySelector(
    '.input-field[name="objective-name"]'
  );
  const valueInput = instance.querySelector(
    '.input-field[name="objective-value"]'
  );
  const weightInput = instance.querySelector(
    '.input-field[name="objective-weight"]'
  );
  const typeSelect = instance.querySelector(
    '.input-field[name="objective-type"]'
  );

  if (nameInput && data.name) {
    nameInput.value = data.name;
    nameInput.dispatchEvent(new Event("input"));
  }

  if (valueInput && data.value !== undefined) {
    valueInput.value = data.value;
    valueInput.dispatchEvent(new Event("input"));
  }

  if (weightInput && data.weight !== undefined) {
    weightInput.value = data.weight;
    weightInput.dispatchEvent(new Event("input"));
  }

  if (typeSelect && data.type) {
    typeSelect.value = data.type;
    typeSelect.dispatchEvent(new Event("change"));
  }
}

// Function to fill constraints data
function fillTestConstraints() {
  // Check if we're in optimization mode
  ensureOptimizationMode(() => {
    const constraintData = window.TestData.optimization.constraints;
    if (!constraintData || constraintData.length === 0) {
      console.error("No constraint test data available");
      return;
    }

    // Navigate to the constraints form
    const constraintsNavLink = document.querySelector(
      'a[href="#constraints-form"]'
    );
    if (constraintsNavLink) {
      constraintsNavLink.click();
    } else {
      document.getElementById("constraints-form").style.display = "block";
    }

    // Wait for the form to be visible
    setTimeout(() => {
      console.log("Filling constraints data...");

      // Add constraints
      for (let i = 0; i < Math.min(constraintData.length, 10); i++) {
        // Max 10 constraints
        // Click add constraint button if needed
        if (
          i > 0 ||
          document.querySelectorAll(
            "#constraints-container .optimization-instance"
          ).length === 0
        ) {
          const addConstraintBtn =
            document.getElementById("add-constraint-btn");
          if (addConstraintBtn) {
            addConstraintBtn.click();

            // Wait for the new constraint form to appear
            setTimeout(() => {
              fillConstraintInstance(i, constraintData[i]);
            }, 300);
          }
        } else {
          fillConstraintInstance(i, constraintData[i]);
        }
      }

      // Save the constraints
      setTimeout(() => {
        const saveBtn = document.querySelector(
          '#constraints-form button[type="submit"]'
        );
        if (saveBtn) {
          saveBtn.click();
          console.log("Constraints saved");
        }
      }, 1000);
    }, 500);
  });
}

// Helper function to fill a single constraint instance
function fillConstraintInstance(index, data) {
  // Find the constraint instance
  const instances = document.querySelectorAll(
    "#constraints-container .optimization-instance"
  );
  if (instances.length <= index) {
    console.error(`Constraint instance ${index} not found`);
    return;
  }

  const instance = instances[index];

  // Fill the fields
  const nameSelect = instance.querySelector(".constraint-name");
  const valueInput = instance.querySelector(".constraint-value");
  const typeSelect = instance.querySelector(".constraint-type");
  const conditionSelect = instance.querySelector(".constraint-condition");
  const flagSelect = instance.querySelector(".constraint-flag");
  const enableToggle = instance.querySelector(".constraint-enable");
  const factorInput = instance.querySelector(".constraint-factor");
  const toleranceInput = instance.querySelector(".constraint-tolerance");

  if (nameSelect && data.name) {
    // Check if the name exists in the dropdown options
    const nameExists = Array.from(nameSelect.options).some(
      (opt) => opt.value === data.name
    );
    if (!nameExists && nameSelect.options.length > 0) {
      // Add the option if it doesn't exist
      const newOption = new Option(data.name, data.name);
      nameSelect.add(newOption);
    }

    nameSelect.value = data.name;
    nameSelect.dispatchEvent(new Event("change"));
  }

  if (valueInput && data.value !== undefined) {
    valueInput.value = data.value;
    valueInput.dispatchEvent(new Event("input"));
  }

  if (typeSelect && data.type) {
    typeSelect.value = data.type;
    typeSelect.dispatchEvent(new Event("change"));
  }

  if (conditionSelect && data.condition) {
    conditionSelect.value = data.condition;
    conditionSelect.dispatchEvent(new Event("change"));
  }

  if (flagSelect && data.flag) {
    // Check if the flag exists in the dropdown options
    const flagExists = Array.from(flagSelect.options).some(
      (opt) => opt.value === data.flag
    );
    if (!flagExists && flagSelect.options.length > 0) {
      // Add the option if it doesn't exist
      const newOption = new Option(data.flag, data.flag);
      flagSelect.add(newOption);
    }

    flagSelect.value = data.flag;
    flagSelect.dispatchEvent(new Event("change"));
  }

  if (enableToggle && data.enable !== undefined) {
    enableToggle.checked = data.enable;
    enableToggle.dispatchEvent(new Event("change"));
  }

  if (factorInput && data.factor !== undefined) {
    factorInput.value = data.factor;
    factorInput.dispatchEvent(new Event("input"));
  }

  if (toleranceInput && data.tolerance !== undefined) {
    toleranceInput.value = data.tolerance;
    toleranceInput.dispatchEvent(new Event("input"));
  }
}

// Function to fill optimization mode data
function fillTestOptimizationMode() {
  // Check if we're in optimization mode
  ensureOptimizationMode(() => {
    const modeData = window.TestData.optimization.mode;
    if (!modeData) {
      console.error("No optimization mode test data available");
      return;
    }

    // Navigate to the mode form
    const modeNavLink = document.querySelector('a[href="#mode-form"]');
    if (modeNavLink) {
      modeNavLink.click();
    } else {
      document.getElementById("mode-form").style.display = "block";
    }

    // Wait for the form to be visible
    setTimeout(() => {
      console.log("Filling optimization mode data...");

      // Select the mode type (normal or archipelago)
      const modeRadios = document.querySelectorAll(
        'input[name="optimization-mode"]'
      );
      if (modeRadios.length > 0) {
        const selectedRadio = Array.from(modeRadios).find(
          (radio) => radio.value === modeData.type
        );
        if (selectedRadio) {
          selectedRadio.checked = true;
          selectedRadio.dispatchEvent(new Event("change"));
        }
      }

      // Wait for the appropriate mode fields to show
      setTimeout(() => {
        if (modeData.type === "normal") {
          fillNormalModeFields(modeData.normal);
        } else if (modeData.type === "archipelago") {
          fillArchipelagoModeFields(modeData.archipelago);
        }

        // Save the mode configuration
        setTimeout(() => {
          const saveBtn = document.querySelector(
            '#mode-form button[type="submit"]'
          );
          if (saveBtn) {
            saveBtn.click();
            console.log("Optimization mode saved");
          }
        }, 1500);
      }, 500);
    }, 500);
  });
}

// Helper function to fill normal mode fields
function fillNormalModeFields(data) {
  // Algorithm
  const algorithmSelect = document.getElementById("normal-algorithm");
  if (algorithmSelect && data.algorithm) {
    algorithmSelect.value = data.algorithm;
    algorithmSelect.dispatchEvent(new Event("change"));
  }

  // Map bounds
  const lowerBoundInput = document.getElementById("normal-lower-bound");
  const upperBoundInput = document.getElementById("normal-upper-bound");

  if (lowerBoundInput && data.map && data.map.lower !== undefined) {
    lowerBoundInput.value = data.map.lower;
    lowerBoundInput.dispatchEvent(new Event("input"));
  }

  if (upperBoundInput && data.map && data.map.upper !== undefined) {
    upperBoundInput.value = data.map.upper;
    upperBoundInput.dispatchEvent(new Event("input"));
  }

  // Population
  const populationInput = document.getElementById("normal-population");
  if (populationInput && data.population !== undefined) {
    populationInput.value = data.population;
    populationInput.dispatchEvent(new Event("input"));
  }

  // Set population toggle
  const setPopulationToggle = document.getElementById("normal-set-population");
  if (setPopulationToggle && data.set_population !== undefined) {
    setPopulationToggle.checked = data.set_population;
    setPopulationToggle.dispatchEvent(new Event("change"));
  }

  // Problem strategy
  const strategySelect = document.getElementById("normal-problem-strategy");
  if (strategySelect && data.problem_strategy) {
    // Find the closest matching option
    const options = Array.from(strategySelect.options);
    for (const option of options) {
      if (
        option.value &&
        option.value.toLowerCase().includes(data.problem_strategy.toLowerCase())
      ) {
        strategySelect.value = option.value;
        strategySelect.dispatchEvent(new Event("change"));
        break;
      }
    }
  }

  // Algorithm parameters (if modal dialog is used for them)
  // This would be implementation-specific and may need to be adapted
  if (data.algorithm_params && data.algorithm_params[data.algorithm]) {
    console.log(
      `Algorithm parameters for ${data.algorithm} available, but implementation depends on UI design`
    );
  }
}

// Helper function to fill archipelago mode fields
function fillArchipelagoModeFields(data) {
  // Add algorithms
  if (data.algorithms && data.algorithms.length > 0) {
    // Wait for algorithms container to be ready
    setTimeout(() => {
      for (let i = 0; i < Math.min(data.algorithms.length, 3); i++) {
        // Max 3 algorithms
        addArchipelagoAlgorithm(data.algorithms[i]);
      }
    }, 300);
  }

  // Topology
  const topologySelect = document.getElementById("archipelago-topology");
  if (topologySelect && data.topology) {
    topologySelect.value = data.topology;
    topologySelect.dispatchEvent(new Event("change"));
  }

  // Migration type
  const migrationTypeSelect = document.getElementById(
    "archipelago-migration-type"
  );
  if (migrationTypeSelect && data.migration_type) {
    migrationTypeSelect.value = data.migration_type;
    migrationTypeSelect.dispatchEvent(new Event("change"));
  }

  // Migration handling
  const migrationHandlingSelect = document.getElementById(
    "archipelago-migration-handling"
  );
  if (migrationHandlingSelect && data.migration_handling) {
    migrationHandlingSelect.value = data.migration_handling;
    migrationHandlingSelect.dispatchEvent(new Event("change"));
  }

  // Map bounds
  const lowerBoundInput = document.getElementById("archipelago-lower-bound");
  const upperBoundInput = document.getElementById("archipelago-upper-bound");

  if (lowerBoundInput && data.map && data.map.lower !== undefined) {
    lowerBoundInput.value = data.map.lower;
    lowerBoundInput.dispatchEvent(new Event("input"));
  }

  if (upperBoundInput && data.map && data.map.upper !== undefined) {
    upperBoundInput.value = data.map.upper;
    upperBoundInput.dispatchEvent(new Event("input"));
  }

  // Population
  const populationInput = document.getElementById("archipelago-population");
  if (populationInput && data.population !== undefined) {
    populationInput.value = data.population;
    populationInput.dispatchEvent(new Event("input"));
  }

  // Set population toggle
  const setPopulationToggle = document.getElementById(
    "archipelago-set-population"
  );
  if (setPopulationToggle && data.set_population !== undefined) {
    setPopulationToggle.checked = data.set_population;
    setPopulationToggle.dispatchEvent(new Event("change"));
  }
}

// Helper function to add an algorithm to the archipelago
function addArchipelagoAlgorithm(algorithmName) {
  // Select the algorithm
  const algorithmSelect = document.getElementById("archipelago-algorithm");
  if (algorithmSelect) {
    algorithmSelect.value = algorithmName;
    algorithmSelect.dispatchEvent(new Event("change"));

    // Click the add button
    const addButton = document.getElementById("add-algorithm-btn");
    if (addButton) {
      addButton.click();
    }
  }
}

// Function to fill design variables data
function fillTestDesignVariables() {
  // Check if we're in optimization mode
  ensureOptimizationMode(() => {
    const dvData = window.TestData.optimization.design_variables;
    if (!dvData || dvData.length === 0) {
      console.error("No design variables test data available");
      return;
    }

    // Navigate to the design variables form
    const dvNavLink = document.querySelector(
      'a[href="#design-variables-form"]'
    );
    if (dvNavLink) {
      dvNavLink.click();
    } else {
      document.getElementById("design-variables-form").style.display = "block";
    }

    // Wait for the form to be visible
    setTimeout(() => {
      console.log("Filling design variables data...");

      // Add design variables
      for (let i = 0; i < Math.min(dvData.length, 10); i++) {
        // Max 10 design variables
        // Click add design variable button if needed
        if (
          i > 0 ||
          document.querySelectorAll(
            "#design-variables-container .optimization-instance"
          ).length === 0
        ) {
          const addDvBtn = document.getElementById("add-design-variable-btn");
          if (addDvBtn) {
            addDvBtn.click();

            // Wait for the new design variable form to appear
            setTimeout(() => {
              fillDesignVariableInstance(i, dvData[i]);
            }, 300);
          }
        } else {
          fillDesignVariableInstance(i, dvData[i]);
        }
      }

      // Save the design variables
      setTimeout(() => {
        const saveBtn = document.getElementById("save-design-variables-btn");
        if (saveBtn) {
          saveBtn.click();
          console.log("Design variables saved");
        }
      }, 1000 + dvData.length * 300);
    }, 500);
  });
}

// Helper function to fill a single design variable instance
function fillDesignVariableInstance(index, data) {
  // Find the design variable instance
  const instances = document.querySelectorAll(
    "#design-variables-container .optimization-instance"
  );
  if (instances.length <= index) {
    console.error(`Design variable instance ${index} not found`);
    return;
  }

  const instance = instances[index];

  // Fill the category and name
  const categorySelect = instance.querySelector(".dv-category");
  const nameInput = instance.querySelector(".dv-name");

  if (categorySelect && data.category) {
    categorySelect.value = data.category;
    categorySelect.dispatchEvent(new Event("change"));

    // Wait for dynamic fields to appear based on category
    setTimeout(() => {
      fillDesignVariableCategoryFields(instance, data);
    }, 300);
  }

  if (nameInput && data.name) {
    nameInput.value = data.name;
    nameInput.dispatchEvent(new Event("input"));
  }
}

// Helper function to fill category-specific fields for a design variable
function fillDesignVariableCategoryFields(instance, data) {
  // Find the active category fields
  const categoryFields = instance.querySelector(
    `.dv-category-fields[data-category="${data.category}"]:not(.hidden)`
  );
  if (!categoryFields) {
    console.error(`Category fields for ${data.category} not found`);
    return;
  }

  // Fill the fields based on category
  switch (data.category) {
    case "CUT_OFF":
      fillCutoffFields(categoryFields, data);
      break;
    case "PAYLOAD":
      fillPayloadFields(categoryFields, data);
      break;
    case "AZIMUTH":
      fillAzimuthFields(categoryFields, data);
      break;
    case "SEQUENCE":
      fillSequenceFields(categoryFields, data);
      break;
    case "PROPULSION":
      fillPropulsionFields(categoryFields, data);
      break;
    case "STEERING":
      fillSteeringVariableFields(categoryFields, data);
      break;
  }
}

// Helper functions for filling specific design variable category fields
function fillCutoffFields(container, data) {
  const flagSelect = container.querySelector(".dv-flag");
  const controlVarInput = container.querySelector(".dv-control-variable");
  const lowerBoundInput = container.querySelector(".dv-lower-bound");
  const upperBoundInput = container.querySelector(".dv-upper-bound");

  if (flagSelect && data.flag) {
    // Check if the flag exists in the options
    const flagExists = Array.from(flagSelect.options).some(
      (opt) => opt.value === data.flag
    );
    if (!flagExists && flagSelect.options.length > 0) {
      // Add the option if it doesn't exist
      const newOption = new Option(data.flag, data.flag);
      flagSelect.add(newOption);
    }

    flagSelect.value = data.flag;
    flagSelect.dispatchEvent(new Event("change"));
  }

  if (controlVarInput && data.control_variable) {
    controlVarInput.value = data.control_variable;
    controlVarInput.dispatchEvent(new Event("input"));
  }

  if (lowerBoundInput && data.lower_bound !== undefined) {
    lowerBoundInput.value = data.lower_bound;
    lowerBoundInput.dispatchEvent(new Event("input"));
  }

  if (upperBoundInput && data.upper_bound !== undefined) {
    upperBoundInput.value = data.upper_bound;
    upperBoundInput.dispatchEvent(new Event("input"));
  }
}

// For brevity, these functions follow the same pattern as fillCutoffFields
// Just adapting to the specific fields of each category
function fillPayloadFields(container, data) {
  const controlVarInput = container.querySelector(".dv-control-variable");
  const lowerBoundInput = container.querySelector(".dv-lower-bound");
  const upperBoundInput = container.querySelector(".dv-upper-bound");

  if (controlVarInput && data.control_variable) {
    controlVarInput.value = data.control_variable;
    controlVarInput.dispatchEvent(new Event("input"));
  }

  if (lowerBoundInput && data.lower_bound !== undefined) {
    lowerBoundInput.value = data.lower_bound;
    lowerBoundInput.dispatchEvent(new Event("input"));
  }

  if (upperBoundInput && data.upper_bound !== undefined) {
    upperBoundInput.value = data.upper_bound;
    upperBoundInput.dispatchEvent(new Event("input"));
  }
}

function fillAzimuthFields(container, data) {
  // Similar to fillPayloadFields
  const controlVarInput = container.querySelector(".dv-control-variable");
  const lowerBoundInput = container.querySelector(".dv-lower-bound");
  const upperBoundInput = container.querySelector(".dv-upper-bound");

  if (controlVarInput && data.control_variable) {
    controlVarInput.value = data.control_variable;
    controlVarInput.dispatchEvent(new Event("input"));
  }

  if (lowerBoundInput && data.lower_bound !== undefined) {
    lowerBoundInput.value = data.lower_bound;
    lowerBoundInput.dispatchEvent(new Event("input"));
  }

  if (upperBoundInput && data.upper_bound !== undefined) {
    upperBoundInput.value = data.upper_bound;
    upperBoundInput.dispatchEvent(new Event("input"));
  }
}

function fillSequenceFields(container, data) {
  const flagSelect = container.querySelector(".dv-flag");
  const controlVarInput = container.querySelector(".dv-control-variable");
  const lowerBoundInput = container.querySelector(".dv-lower-bound");
  const upperBoundInput = container.querySelector(".dv-upper-bound");

  if (flagSelect && data.flag) {
    // Similar to fillCutoffFields flag handling
    const flagExists = Array.from(flagSelect.options).some(
      (opt) => opt.value === data.flag
    );
    if (!flagExists && flagSelect.options.length > 0) {
      const newOption = new Option(data.flag, data.flag);
      flagSelect.add(newOption);
    }

    flagSelect.value = data.flag;
    flagSelect.dispatchEvent(new Event("change"));
  }

  if (controlVarInput && data.control_variable) {
    controlVarInput.value = data.control_variable;
    controlVarInput.dispatchEvent(new Event("input"));
  }

  if (lowerBoundInput && data.lower_bound !== undefined) {
    lowerBoundInput.value = data.lower_bound;
    lowerBoundInput.dispatchEvent(new Event("input"));
  }

  if (upperBoundInput && data.upper_bound !== undefined) {
    upperBoundInput.value = data.upper_bound;
    upperBoundInput.dispatchEvent(new Event("input"));
  }
}

function fillPropulsionFields(container, data) {
  const segmentSelect = container.querySelector(".dv-segment");
  const controlVarInput = container.querySelector(".dv-control-variable");
  const lowerBoundInput = container.querySelector(".dv-lower-bound");
  const upperBoundInput = container.querySelector(".dv-upper-bound");

  if (segmentSelect && data.segment) {
    // Check if the segment exists in the options
    const segmentExists = Array.from(segmentSelect.options).some(
      (opt) => opt.value === data.segment
    );
    if (!segmentExists && segmentSelect.options.length > 0) {
      const newOption = new Option(data.segment, data.segment);
      segmentSelect.add(newOption);
    }

    segmentSelect.value = data.segment;
    segmentSelect.dispatchEvent(new Event("change"));
  }

  if (controlVarInput && data.control_variable) {
    controlVarInput.value = data.control_variable;
    controlVarInput.dispatchEvent(new Event("input"));
  }

  if (lowerBoundInput && data.lower_bound !== undefined) {
    lowerBoundInput.value = data.lower_bound;
    lowerBoundInput.dispatchEvent(new Event("input"));
  }

  if (upperBoundInput && data.upper_bound !== undefined) {
    upperBoundInput.value = data.upper_bound;
    upperBoundInput.dispatchEvent(new Event("input"));
  }
}

function fillSteeringVariableFields(container, data) {
  const segmentSelect = container.querySelector(".dv-segment");
  const segmentTypeSelect = container.querySelector(".dv-segment-type");

  if (segmentSelect && data.segment) {
    // Check if the segment exists in the options
    const segmentExists = Array.from(segmentSelect.options).some(
      (opt) => opt.value === data.segment
    );
    if (!segmentExists && segmentSelect.options.length > 0) {
      const newOption = new Option(data.segment, data.segment);
      segmentSelect.add(newOption);
    }

    segmentSelect.value = data.segment;
    segmentSelect.dispatchEvent(new Event("change"));
  }

  if (segmentTypeSelect && data.segment_type) {
    segmentTypeSelect.value = data.segment_type;
    segmentTypeSelect.dispatchEvent(new Event("change"));

    // Wait for segment type fields to appear
    setTimeout(() => {
      const segmentTypeFields = container.querySelector(
        `.dv-steering-type-fields[data-segment-type="${data.segment_type}"]:not(.hidden)`
      );

      if (segmentTypeFields) {
        // Fill specific fields based on segment type
        const controlVarInput = segmentTypeFields.querySelector(
          ".dv-control-variable"
        );
        const axisInput = segmentTypeFields.querySelector(".dv-axis");
        const lowerBoundInput =
          segmentTypeFields.querySelector(".dv-lower-bound");
        const upperBoundInput =
          segmentTypeFields.querySelector(".dv-upper-bound");

        if (controlVarInput && data.control_variable) {
          controlVarInput.value = data.control_variable;
          controlVarInput.dispatchEvent(new Event("input"));
        }

        if (axisInput && data.axis) {
          if (axisInput.tagName === "SELECT") {
            axisInput.value = data.axis;
            axisInput.dispatchEvent(new Event("change"));
          } else {
            axisInput.value = data.axis;
            axisInput.dispatchEvent(new Event("input"));
          }
        }

        if (lowerBoundInput && data.lower_bound !== undefined) {
          lowerBoundInput.value = data.lower_bound;
          lowerBoundInput.dispatchEvent(new Event("input"));
        }

        if (upperBoundInput && data.upper_bound !== undefined) {
          upperBoundInput.value = data.upper_bound;
          upperBoundInput.dispatchEvent(new Event("input"));
        }
      }
    }, 300);
  }
}

// Utility function to ensure we're in optimization mode
function ensureOptimizationMode(callback) {
  // Check if we're already in optimization mode
  const optimizationNav = document.querySelector(
    '.sidebar .menu-tree li a[href="#objective-function-form"]'
  );

  if (optimizationNav) {
    // Already in optimization mode, proceed
    callback();
  } else {
    // Need to switch to optimization mode
    console.log("Switching to optimization mode...");

    // Go to mission details
    document.getElementById("details-btn").click();

    // Wait for the form to load
    setTimeout(() => {
      // Set mode to optimization
      const modeSelect = document.getElementById("modes");
      if (modeSelect) {
        modeSelect.value = "optimization";
        modeSelect.dispatchEvent(new Event("change"));

        // Save the mission details
        const saveBtn = document.getElementById("save-mission");
        if (saveBtn) {
          saveBtn.click();

          // Wait for the sidebar to update
          setTimeout(() => {
            callback();
          }, 500);
        }
      } else {
        console.error(
          "Could not find modes select to switch to optimization mode"
        );
      }
    }, 300);
  }
}

// Make all test helper functions available globally
window.TestHelpers = {
  fillTestMissionData,
  fillTestEnvironmentData,
  fillTestVehicleData,
  fillTestStageData,
  fillTestMotorData,
  findActiveStageForm,
  fillCurrentStageData,
  findActiveMotorForm,
  fillCurrentMotorData,
  runAllTests,
  simulateFileUpload,
  fillTestAeroData,
  fillTestThrustData,
  fillTestSequenceData,
  fillTestStoppingConditionData,
  fillTestSteeringData,
  fillTestObjectiveFunction,
  fillTestConstraints,
  fillTestOptimizationMode,
  fillTestDesignVariables,
};
