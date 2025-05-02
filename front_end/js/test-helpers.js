// Test Helper Functions
function fillTestMissionData() {
  document.getElementById("mission-name").value = "SSPO";
  document.getElementById("modes").value = "simulation";
  document.getElementById("tracking").checked = true;
  document.getElementById("mission-date").value = "2025-04-19";
  document.getElementById("mission-time").value = "12:45:23";
  // Trigger save implicitly by moving to next step in runAllTests or user action
}

function fillTestEnvironmentData() {
  // Planet selection
  document.getElementById("planets").value = "earth";
  document.getElementById("planets").dispatchEvent(new Event("change"));

  // Atmospheric model selection
  document.getElementById("atmos-model").value = "atmos_76";
  document.getElementById("atmos-model").dispatchEvent(new Event("change"));

  // Gravity parameters
  document.getElementById("order").value = "2";
  document.getElementById("degree").value = "0";

  // Core info model - Corrected value if needed based on dropdown options
  const coreSelect = document.getElementById("core");
  if (coreSelect.querySelector('option[value="PERIGEE_GC_LATITUDE"]')) {
    coreSelect.value = "PERIGEE_GC_LATITUDE"; // Common option
  } else if (coreSelect.querySelector('option[value="RE"]')) {
    coreSelect.value = "RE"; // Another possible option
  }
  coreSelect.dispatchEvent(new Event("change"));
  // Trigger save implicitly
}

function fillTestVehicleData(vehicleType = "ascend") {
  // Basic vehicle data
  document.getElementById("vehicle-name").value = "Garuda";
  document.getElementById("vehicle-type").value = vehicleType;
  document.getElementById("integration-method").value = "RK4";
  document.getElementById("time-step").value = "0.10";
  document.getElementById("effective-alt").value = "100000.0";

  // Payload and PLF
  const payloadNameInput = document.getElementById("payload-name");
  if (payloadNameInput) payloadNameInput.value = "James Webb"; // Set payload name
  document.getElementById("payload-mass").value = "500.0";
  document.getElementById("plf-mass").value = "200.0";
  document.getElementById("plf-sep-value").value = "150.0";
  // Assume time separation is default checked
  const plfTimeRadio = document.getElementById("plf-time");
  if (plfTimeRadio) plfTimeRadio.checked = true;

  // Trigger vehicle type change event to show relevant fields
  const event = new Event("change");
  document.getElementById("vehicle-type").dispatchEvent(event);

  // Wait for dynamic fields to load
  setTimeout(() => {
    if (vehicleType === "ascend") {
      // Select launch point data
      const launchRadio = document.querySelector(
        'input[name="data-method"][value="launch"]'
      );
      if (launchRadio) {
        launchRadio.checked = true;
        launchRadio.dispatchEvent(new Event("change")); // Trigger change to show fields
      }

      // Fill ASCEND launch point data (wait a bit more for fields to show)
      setTimeout(() => {
        document.getElementById("lat").value = "13";
        document.getElementById("long").value = "80.20";
        document.getElementById("azimuth").value = "180.0";
        document.getElementById("msl").value = "0.0";
        document.getElementById("lp-height").value = "30.0";
        document.getElementById("launch-angle").value = "0.0";
        document.getElementById("roll").value = "0.0";
        document.getElementById("pitch").value = "0.0";
        document.getElementById("yaw").value = "0.0";
        // Trigger save implicitly
      }, 150); // Nested timeout
    } else if (vehicleType === "projectile") {
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
        document.getElementById("lat-proj").value = "13";
        document.getElementById("long-proj").value = "80.20";
        document.getElementById("msl-proj").value = "0.0";
        document.getElementById("azimuth-proj").value = "90.0";
        document.getElementById("elevation").value = "45.0";
        document.getElementById("launch-angle-proj").value = "0.0";
        document.getElementById("initial-velocity").value = "600.0";
        // Trigger save implicitly
      }, 150);
    } else if (vehicleType === "orbital") {
      // Select orbital state data
      const stateRadio = document.querySelector(
        'input[name="orbital-method"][value="state"]'
      );
      if (stateRadio) {
        stateRadio.checked = true;
        stateRadio.dispatchEvent(new Event("change"));
      }

      // Fill orbital state data
      setTimeout(() => {
        const orbitalFields = [
          "X",
          "Y",
          "Z",
          "U",
          "V",
          "W",
          "q0",
          "q1",
          "q2",
          "q3",
        ];
        orbitalFields.forEach((field, index) => {
          const element = document.getElementById(field + "-orbital");
          if (element) element.value = ((index + 1) * 1000).toFixed(1);
        });
        // Trigger save implicitly
      }, 150);
    }
  }, 100); // Initial timeout after vehicle type change
}

// --- NEW Helper Functions for Stage and Motor ---

function fillTestStageData(stageNumber) {
  const stageId = `stage${stageNumber}`;
  const stageForm = document.getElementById(`${stageId}-form`);
  if (!stageForm) {
    console.error(`Stage form ${stageId}-form not found!`);
    return;
  }
  console.log(`Filling data for Stage ${stageNumber}`);

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
    structuralMassInput.value = (stageNumber * 1000).toString(); // e.g., 1000 for stage 1
  if (refAreaInput) refAreaInput.value = (stageNumber * 2.5).toString(); // e.g., 2.5 for stage 1
  if (burnTimeInput) burnTimeInput.value = (100 + stageNumber * 20).toString(); // e.g., 120 for stage 1

  // Trigger input events for potential real-time validation/updates
  [structuralMassInput, refAreaInput, burnTimeInput].forEach((input) => {
    if (input) input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

function fillTestMotorData(stageNumber, motorNumber) {
  const stageId = `stage${stageNumber}`;
  const motorForm = document.getElementById(
    `${stageId}-motor${motorNumber}-form`
  );
  if (!motorForm) {
    console.error(`Motor form ${stageId}-motor${motorNumber}-form not found!`);
    return;
  }
  console.log(`Filling data for Motor ${stageNumber}_${motorNumber}`);

  // Use querySelector for potentially dynamic elements within the motor form
  const propulsionTypeSelect = motorForm.querySelector("select.input-field"); // Assuming a select for type
  const nozzleDiameterInput = motorForm.querySelector(
    'input[placeholder="Enter Nozzle Diameter"]'
  );
  // Note: Structural/Propulsion Mass might also be needed depending on form structure
  // const motorStructuralMassInput = motorForm.querySelector(
  //   'input[placeholder="Enter Structural Mass"]'
  // ); // Removed structural mass filling
  const propulsionMassInput = motorForm.querySelector(
    'input[placeholder="Enter Propulsion Mass"]'
  );

  if (propulsionTypeSelect) {
    propulsionTypeSelect.value = "Solid"; // Assuming 'Solid' is a valid option value
    propulsionTypeSelect.dispatchEvent(new Event("change", { bubbles: true }));
  }
  if (nozzleDiameterInput)
    nozzleDiameterInput.value = (0.5 + motorNumber * 0.1).toString(); // e.g., 0.6 for motor 1
  // if (motorStructuralMassInput)
  //   motorStructuralMassInput.value = (50 + motorNumber * 10).toString(); // e.g., 60
  if (propulsionMassInput)
    propulsionMassInput.value = (5000 + motorNumber * 50).toString(); // e.g., 550

  // Trigger input events
  [
    propulsionTypeSelect,
    nozzleDiameterInput,
    // motorStructuralMassInput, // Removed structural mass trigger
    propulsionMassInput,
  ].forEach((input) => {
    if (input) input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

// --- NEW Helper Functions to find current active stage/motor ---

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
  console.log(
    `Found active stage form: ${activeStageForm.id}, Stage Number: ${stageNumber}`
  );

  // Call the original function with the determined stage number
  fillTestStageData(stageNumber);
}

function fillCurrentMotorData() {
  // Find *any* visible motor form first
  const allMotorForms = document.querySelectorAll(
    'form[id^="stage"][id*="-motor"][id$="-form"]'
  );
  let activeMotorForm = null;
  for (const form of allMotorForms) {
    if (
      form.offsetParent !== null &&
      !form.classList.contains("hidden") &&
      !form.classList.contains("hidden-form") &&
      form.style.display !== "none"
    ) {
      activeMotorForm = form;
      break; // Found the visible one
    }
  }

  if (!activeMotorForm) {
    console.error("Could not find an active motor form.");
    alert("Please navigate to the motor tab you want to fill.");
    return;
  }

  // Extract stage and motor number from the found motor form's ID
  const motorMatch = activeMotorForm.id.match(/^stage(\d+)-motor(\d+)-form$/);
  if (!motorMatch || motorMatch.length < 3) {
    console.error(
      "Could not determine stage and motor number from form ID:",
      activeMotorForm.id
    );
    alert("Motor form ID structure is unexpected.");
    return;
  }

  const stageNumber = parseInt(motorMatch[1], 10);
  const motorNumber = parseInt(motorMatch[2], 10);

  if (isNaN(stageNumber) || isNaN(motorNumber)) {
    console.error(
      "Failed to parse stage/motor number from ID:",
      activeMotorForm.id
    );
    return;
  }

  console.log(
    `Found active motor form: ${activeMotorForm.id}, Stage: ${stageNumber}, Motor: ${motorNumber}`
  );

  // Call the original function with determined stage and motor numbers
  fillTestMotorData(stageNumber, motorNumber);
}

// --- Updated runAllTests (Removed Stage/Motor filling) ---
function runAllTests() {
  console.log("Starting automated tests...");
  let delay = 0;

  const runStep = (description, func, time = 1000) => {
    setTimeout(() => {
      console.log(`Running: ${description}...`);
      try {
        func();
      } catch (error) {
        console.error(`Error during ${description}:`, error);
      }
    }, delay);
    delay += time; // Increment delay for the next step
  };

  // Fill Mission
  runStep("Fill Mission Data", fillTestMissionData, 500);

  // Save Mission (Requires user action or a simulated click on #save-mission)
  runStep(
    "Save Mission Data",
    () => document.getElementById("save-mission")?.click(),
    500
  );

  // Fill Environment
  runStep("Fill Environment Data", fillTestEnvironmentData, 500);
  // Save Environment (Requires user action or a simulated click on #enviro-form submit)
  runStep(
    "Save Environment Data",
    () =>
      document
        .getElementById("enviro-form")
        ?.querySelector('button[type="submit"]')
        ?.click(),
    500
  );

  // Fill Vehicle (Ascend example)
  runStep(
    "Fill ASCEND Vehicle Data",
    () => fillTestVehicleData("ascend"),
    1000
  ); // Increased delay for internal timeouts
  // Save Vehicle (Requires user action or a simulated click on #vehicle-form submit)
  runStep(
    "Save Vehicle Data",
    () =>
      document
        .getElementById("vehicle-form")
        ?.querySelector('button[type="submit"]')
        ?.click(),
    1000
  ); // Increased delay

  // Add and Fill Motor 1 for Stage 1
  // REMOVED: runStep("Add and Fill Motor 1_1", () => addAndFillMotor(1, 1), 1500);

  setTimeout(
    () => console.log("Automated tests sequence finished."),
    delay + 500
  );
}

// --- IMPROVED: Enhanced file uploading in test helpers ---
function simulateFileUpload(
  inputElement,
  fileName,
  mimeType = "text/csv",
  content = ""
) {
  if (!inputElement) {
    console.error("Invalid input element for file upload simulation");
    return false;
  }

  try {
    // Create a File object with the given name and content
    const fileContent = content || `Time,Value\n0,0\n1,10\n2,20`;
    const file = new File([fileContent], fileName, { type: mimeType });

    // Create a DataTransfer to simulate the file selection
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);

    // Set the files property of the input element
    inputElement.files = dataTransfer.files;

    // Trigger the change event to simulate user selection
    const event = new Event("change", { bubbles: true });
    inputElement.dispatchEvent(event);

    console.log(
      `Simulated file upload: ${fileName} on element ${
        inputElement.id || "unnamed"
      }`
    );
    return true;
  } catch (error) {
    console.error("Error simulating file upload:", error);
    return false;
  }
}

// Add simulator to the test helpers
function fillTestAeroData(stageNumber) {
  console.log(`Filling aero data for Stage ${stageNumber}`);

  // Find the aero upload input for the specified stage
  const stageId = `stage${stageNumber}`;
  const aeroFileInput = document.getElementById(`aero-upload-${stageId}`);
  if (!aeroFileInput) {
    console.error(`Aero file input not found for stage ${stageNumber}`);
    return false;
  }

  // Simulate an aero file upload with valid CSV content
  const aeroFileName = `aero_data_stage_${stageNumber}.csv`;
  const aeroContent =
    "Mach,Cd,Cl,Cm\n0,0.5,0,0\n1,0.8,0.1,0.01\n2,0.6,0.2,0.02";
  return simulateFileUpload(
    aeroFileInput,
    aeroFileName,
    "text/csv",
    aeroContent
  );
}

function fillTestThrustData(stageNumber, motorNumber) {
  console.log(
    `Filling thrust data for Motor ${motorNumber} in Stage ${stageNumber}`
  );

  // Find the thrust upload input for the specified motor
  const stageId = `stage${stageNumber}`;
  const thrustFileInput = document.getElementById(
    `thrust-upload-${stageId}-${motorNumber}`
  );
  if (!thrustFileInput) {
    console.error(
      `Thrust file input not found for stage ${stageNumber}, motor ${motorNumber}`
    );
    return false;
  }

  // Simulate a thrust file upload with valid CSV content
  const thrustFileName = `thrust_data_s${stageNumber}_m${motorNumber}.csv`;
  const thrustContent =
    "Time,Thrust,PropMass\n0,0,1000\n10,5000,900\n20,4800,800\n30,4600,700\n40,0,600";
  return simulateFileUpload(
    thrustFileInput,
    thrustFileName,
    "text/csv",
    thrustContent
  );
}

// Export functions for use in other modules
window.TestHelpers = {
  fillTestMissionData,
  fillTestEnvironmentData,
  fillTestVehicleData,
  fillTestStageData, // Keep for individual testing
  fillTestMotorData, // Keep for individual testing
  runAllTests,
  fillCurrentStageData, // Export new function
  fillCurrentMotorData, // Export new function
  simulateFileUpload,
  fillTestAeroData,
  fillTestThrustData,
};
