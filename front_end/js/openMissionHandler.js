// Handles the 'Open Mission' functionality

document.addEventListener("DOMContentLoaded", () => {
  const openMissionButton = document.getElementById("open-mission-btn");
  if (openMissionButton) {
    openMissionButton.addEventListener("click", handleOpenMission);
  }
});

function handleOpenMission() {
  // Create a temporary file input element
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".json";
  fileInput.style.display = "none";

  fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
      readFileAndProcess(file);
    }
    document.body.removeChild(fileInput); // Clean up the input element
  });

  document.body.appendChild(fileInput);
  fileInput.click();
}

function readFileAndProcess(file) {
  Swal.fire({
    title: "Processing Mission File",
    text: "Reading and parsing your mission data. Please wait...",
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const fileContent = e.target.result;
      const loadedMissionData = JSON.parse(fileContent);
      console.log(
        "[OpenMission] Raw loadedMissionData after parse:",
        JSON.stringify(loadedMissionData, null, 2)
      ); // Log raw parsed data

      // Basic validation
      if (
        !loadedMissionData ||
        typeof loadedMissionData.mission === "undefined"
      ) {
        Swal.fire(
          "Error",
          "Invalid mission file format. Missing 'mission' section.",
          "error"
        );
        return;
      }

      console.log("Mission data loaded and parsed:", loadedMissionData);

      // Reset current mission state (UI and global data)
      resetCurrentMissionState();

      // Populate forms with loadedMissionData
      populateForms(loadedMissionData);

      // Navigate to mission details form after successful load
      const missionFormElement = document.getElementById("mission-form");
      if (
        window.uiNav &&
        typeof window.uiNav.showForm === "function" &&
        missionFormElement
      ) {
        window.uiNav.showForm(missionFormElement);
        console.log("[OpenMission] Navigated to Mission Details form.");
      } else {
        console.warn(
          "[OpenMission] Could not navigate to Mission Details form. uiNav.showForm not available or form not found."
        );
      }

      Swal.fire(
        "Success!",
        "Mission data loaded and forms populated successfully!",
        "success"
      );
    } catch (error) {
      console.error("Error processing mission file:", error);
      Swal.fire(
        "Error",
        `Failed to process mission file: ${error.message}`,
        "error"
      );
    }
  };

  reader.onerror = (error) => {
    console.error("Error reading file:", error);
    Swal.fire("Error", "Failed to read the selected file.", "error");
  };

  reader.readAsText(file); // Read the file as text
}

function resetCurrentMissionState() {
  console.log("Resetting current mission state...");
  // This function will be responsible for clearing all forms,
  // dynamic UI elements, and global data variables.
  // For now, it's a placeholder.

  // 1. Reset global data (examples)
  window.finalMissionData = {};
  window.flagRegistry = {
    event: {},
    motor: {},
    stage: {},
    steering: {},
    heatshield: {},
  };
  window.eventSequence = [];
  if (window.steeringState) {
    window.steeringState.activeComponents = [];
    // Potentially more resets needed for steeringState internals
  }
  // ... reset other global states from optimization.js, etc.

  // 2. Clear static form fields (example for mission form)
  const missionForm = document.getElementById("mission-form");
  if (missionForm) missionForm.reset();
  const enviroForm = document.getElementById("enviro-form");
  if (enviroForm) enviroForm.reset();
  // ... reset other forms ...

  // 3. Clear dynamic UI elements
  // Example: Clear stages from sidebar
  const vehicleStagesList = document.getElementById("vehicle-stages");
  if (vehicleStagesList) vehicleStagesList.innerHTML = "";
  // ... clear motor lists, event lists, active steering components UI, optimization UI elements ...

  // 4. Hide all forms and show welcome, then navigate (example)
  if (window.uiNav) {
    // Assuming uiNav is globally accessible from ui-navigation.js
    window.uiNav.hideAllForms();
    // const welcomeContainer = document.querySelector(".welcome-container"); // Do not show welcome message during file load reset
    // if (welcomeContainer) welcomeContainer.style.display = "block"; // Do not show welcome message
    // window.uiNav.showForm('mission-form'); // Or navigate to the first form
  }

  // Clear any displayed filenames for CSV uploads
  const csvFilenames = document.querySelectorAll(".filename");
  csvFilenames.forEach((fn) => (fn.value = "No file chosen"));
  const clearCsvButtons = document.querySelectorAll(".clear-upload");
  clearCsvButtons.forEach((btn) => (btn.style.display = "none"));

  console.log("Mission state reset complete.");
}

function populateForms(loadedData) {
  console.log(
    "[OpenMission] Starting populateForms with loadedData:",
    JSON.stringify(loadedData, null, 2)
  );
  window.finalMissionData = loadedData; // Make loaded data globally accessible for population helpers

  if (!loadedData.mission) {
    console.error("Mission data is missing!");
    Swal.fire(
      "Error",
      "Cannot populate forms: Mission section is missing in the loaded file.",
      "error"
    );
    return;
  }

  populateMissionDetails(loadedData.mission);

  // Construct an environment object from the loadedData
  const environmentObject = {
    planet_name: loadedData.mission?.planet_name, // Get planet name from mission
    EARTH: loadedData.EARTH, // Pass EARTH object directly
    Wind: loadedData.Wind, // Pass Wind array directly
    // Add other relevant top-level environment keys if necessary
  };

  // Call other population functions based on the structure of loadedData
  // These will be implemented progressively.
  populateEnvironment(environmentObject); // Pass the constructed object

  // New way to get vehicle information
  let missionKey = null;
  let vehicleType = null;
  let vehicleName = null;
  let vehicleData = null;
  let initialConditionName = null;
  let initialConditionData = null;

  // Find the main mission key (e.g., SSPO)
  for (const key in loadedData) {
    if (
      loadedData.hasOwnProperty(key) &&
      typeof loadedData[key] === "object" &&
      loadedData[key] !== null &&
      loadedData[key].vehicle &&
      Array.isArray(loadedData[key].vehicle)
    ) {
      missionKey = key;
      break;
    }
  }

  if (missionKey && loadedData[missionKey]) {
    vehicleType = loadedData[missionKey].vehicle_type; // e.g., ASCEND
    if (
      loadedData[missionKey].vehicle &&
      loadedData[missionKey].vehicle.length > 0
    ) {
      vehicleName = loadedData[missionKey].vehicle[0]; // e.g., TestVehicle
      vehicleData = loadedData[vehicleName]; // The actual TestVehicle object
      if (vehicleData) {
        initialConditionName = vehicleData.Initial_condition; // e.g., Location_1
        if (
          loadedData.Initial_States &&
          loadedData.Initial_States[initialConditionName]
        ) {
          initialConditionData =
            loadedData.Initial_States[initialConditionName];
        }
      }
    }
  }

  if (vehicleData && vehicleType && initialConditionData) {
    populateVehicle(
      vehicleData,
      vehicleName,
      vehicleType,
      initialConditionData
    );
    populateStagesAndMotors(loadedData, vehicleName, vehicleData);
  } else {
    console.warn(
      "[OpenMission] Could not find all necessary vehicle and initial condition data to populate vehicle form.",
      {
        missionKey,
        vehicleType,
        vehicleName,
        vehicleData,
        initialConditionName,
        initialConditionData,
      }
    );
  }

  const sequenceKey = vehicleName + "_Sequence";
  if (loadedData[sequenceKey]) {
    // populateSequence(loadedData[sequenceKey]);
  }

  // Steering data might be structured under multiple keys or a main steering object
  // populateSteering(loadedData, vehicleName);

  if (loadedData.stopping_condition) {
    // populateStoppingCondition(loadedData.stopping_condition);
  }

  if (loadedData.mission.MODE === "optimization") {
    if (loadedData.optimization) {
      // populateOptimizationObjectiveFunction(loadedData.optimization.objective_function);
      // populateOptimizationConstraints(loadedData.optimization.constraints);
      // populateOptimizationModeSettings(loadedData.optimization.mode_settings);
      // populateOptimizationDesignVariables(loadedData.optimization.design_variables);
    } else {
      console.warn(
        "Optimization mode selected, but no optimization data found in file."
      );
    }
  }

  // After all forms are populated, refresh any dependent dropdowns
  // This might involve calling a global update function if available, e.g., from formHandler.js
  // refreshAllDynamicDropdowns();

  console.log("Form population process initiated.");
}

function populateMissionDetails(missionData) {
  console.log("Populating Mission Details:", missionData);
  const missionNameInput = document.getElementById("mission-name");
  const modesSelect = document.getElementById("modes");
  const trackingToggle = document.getElementById("tracking");
  const frameModelSelect = document.getElementById("frame-model");
  const outputFrameSelect = document.getElementById("output-frame");
  const missionDateInput = document.getElementById("mission-date");
  const missionTimeInput = document.getElementById("mission-time");

  if (missionNameInput) missionNameInput.value = missionData.mission_name || "";
  if (trackingToggle)
    trackingToggle.checked = missionData.tracking_option === "ON";
  if (frameModelSelect)
    frameModelSelect.value = missionData.frame_model || "POST";
  if (outputFrameSelect)
    outputFrameSelect.value = missionData.output_frame || "POST";
  if (missionDateInput) missionDateInput.value = missionData.UTC?.Date || "";
  if (missionTimeInput) missionTimeInput.value = missionData.UTC?.Time || "";

  if (modesSelect) {
    modesSelect.value = missionData.MODE?.toLowerCase() || "simulation"; // Default to simulation if not specified
    // IMPORTANT: Trigger change event to update UI (e.g., sidebar for optimization)
    const event = new Event("change", { bubbles: true });
    modesSelect.dispatchEvent(event);
    console.log(`Mode set to: ${modesSelect.value}. Change event dispatched.`);
  }
}

function populateEnvironment(environmentData) {
  console.log(
    "[OpenMission] Populating Environment with data:",
    JSON.stringify(environmentData, null, 2)
  );

  const planetsSelect = document.getElementById("planets");
  const atmosModelSelect = document.getElementById("atmos-model");
  const atmosCsvFilenameInput = document.getElementById("csv-filename");
  const atmosCsvClearBtn = document.getElementById("clear-csv-btn");
  const windCsvFilenameInput = document.getElementById("wind-data-filename");
  const windCsvClearBtn = document.getElementById("clear-wind-btn");
  const orderInput = document.getElementById("order");
  const degreeInput = document.getElementById("degree");
  const coreSelect = document.getElementById("core");

  if (!environmentData) {
    console.warn(
      "[OpenMission] Environment data is undefined. Skipping population."
    );
    // Reset fields to default just in case
    if (planetsSelect) planetsSelect.value = "Environment"; // Default option value
    if (atmosModelSelect) atmosModelSelect.value = "Environment"; // Default option value
    if (atmosCsvFilenameInput) atmosCsvFilenameInput.value = "No file chosen";
    if (atmosCsvClearBtn) atmosCsvClearBtn.style.display = "none";
    if (windCsvFilenameInput) windCsvFilenameInput.value = "No file chosen";
    if (windCsvClearBtn) windCsvClearBtn.style.display = "none";
    if (orderInput) orderInput.value = "";
    if (degreeInput) degreeInput.value = "";
    if (coreSelect) coreSelect.value = "choose_core"; // Default option value
    return;
  }

  // Planet - taken from missionData.planet_name passed in environmentObject
  const planetValue = environmentData.planet_name?.toLowerCase() || "earth"; // Default to earth if not specified
  console.log(`[OpenMission] Setting Planet to: ${planetValue}`);
  if (planetsSelect) {
    // Ensure the select element ID is correct. If it's "planets", this is fine.
    // The value in your JSON is "EARTH" for planet_name.
    // The select options should have "earth", "mars", etc. as values.
    planetsSelect.value = planetValue;
    // Trigger change event if needed for dynamic updates based on planet selection
    const event = new Event("change", { bubbles: true });
    planetsSelect.dispatchEvent(event);
  }

  // Atmospheric Model - from EARTH object
  const earthData = environmentData.EARTH;
  if (atmosModelSelect && atmosCsvFilenameInput && atmosCsvClearBtn) {
    if (earthData && earthData.atmos_model) {
      console.log(
        `[OpenMission] Setting Atmos Model to: ${earthData.atmos_model}`
      );
      atmosModelSelect.value = earthData.atmos_model; // e.g., "atmos_76"
      atmosCsvFilenameInput.value = "No file chosen";
      atmosCsvClearBtn.style.display = "none";
      // Hide CSV upload section for atmos model if a standard model is chosen
      const atmosCsvSection = document.getElementById("atmos-csv-section"); // Assuming this ID exists
      if (atmosCsvSection) atmosCsvSection.classList.add("hidden");
    } else if (
      earthData &&
      earthData.atmos_data &&
      earthData.atmos_data.filename
    ) {
      // Hypothetical if you support CSV for atmosphere
      console.log(
        `[OpenMission] Setting Atmos CSV to: ${earthData.atmos_data.filename}`
      );
      atmosModelSelect.value = "USER"; // Or whatever value signifies CSV
      atmosCsvFilenameInput.value = earthData.atmos_data.filename;
      atmosCsvClearBtn.style.display = "block";
      const atmosCsvSection = document.getElementById("atmos-csv-section");
      if (atmosCsvSection) atmosCsvSection.classList.remove("hidden");
    } else {
      console.log(
        "[OpenMission] No specific Atmos model or CSV. Resetting Atmos fields."
      );
      atmosModelSelect.value = "atmos_76"; // Default if nothing
      atmosCsvFilenameInput.value = "No file chosen";
      atmosCsvClearBtn.style.display = "none";
      const atmosCsvSection = document.getElementById("atmos-csv-section");
      if (atmosCsvSection) atmosCsvSection.classList.add("hidden");
    }
    // Trigger change to show/hide CSV upload section
    const event = new Event("change", { bubbles: true });
    atmosModelSelect.dispatchEvent(event);
  } else {
    console.warn(
      "[OpenMission] Atmospheric model or CSV input elements not found."
    );
  }

  // Wind Data - from Wind array
  // Assuming wind data is always a CSV or an array that implies a CSV was used.
  // The UI seems to only have a "wind-data-filename" input.
  // If the "Wind" array exists and is not empty (beyond headers), we can assume a file was used conceptually.
  // For populating, we'd typically just note that wind data is present.
  // If you have a mechanism to store/re-upload this, it would go here.
  // For now, let's just check if wind data is present.
  const windData = environmentData.Wind;
  if (windCsvFilenameInput && windCsvClearBtn) {
    if (windData && Array.isArray(windData) && windData.length > 2) {
      // Has headers + at least one data row
      console.log(`[OpenMission] Wind data is present (simulated from array).`);
      // Since we don't have the original filename from the "Wind" array,
      // we can't populate windCsvFilenameInput.value directly from `environmentData.Wind`
      // unless you store the filename somewhere or adopt a convention.
      // For now, let's indicate that custom wind data is active.
      windCsvFilenameInput.value = "Custom Wind Data Loaded"; // Placeholder text
      windCsvClearBtn.style.display = "block";
      // Show the wind data upload section
      const windDataSection = document.getElementById(
        "wind-data-upload-section"
      ); // Make sure this ID is correct
      if (windDataSection) windDataSection.classList.remove("hidden");
    } else {
      console.log("[OpenMission] No Wind data. Resetting Wind fields.");
      windCsvFilenameInput.value = "No file chosen";
      windCsvClearBtn.style.display = "none";
      const windDataSection = document.getElementById(
        "wind-data-upload-section"
      );
      if (windDataSection) windDataSection.classList.add("hidden");
    }
  } else {
    console.warn("[OpenMission] Wind CSV input elements not found.");
  }

  // Gravity Parameters - from EARTH.Gravity_param
  const gravityParams = earthData?.Gravity_param;
  const orderValue = gravityParams?.order?.toString() || ""; // Ensure it's a string for input value
  const degreeValue = gravityParams?.degree?.toString() || ""; // Ensure it's a string
  console.log(
    `[OpenMission] Setting Gravity Order to: ${orderValue}, Degree to: ${degreeValue}`
  );
  if (orderInput) orderInput.value = orderValue;
  if (degreeInput) degreeInput.value = degreeValue;

  // COE Info (Component of Earth) - from EARTH.coe_info
  const coeComponent = earthData?.coe_info?.component || "MSL"; // Default to MSL
  console.log(`[OpenMission] Setting COE Info (core) to: ${coeComponent}`);
  if (coreSelect) coreSelect.value = coeComponent; // e.g., "MSL"

  console.log("[OpenMission] populateEnvironment finished.");
}

function populateVehicle(
  vehicleData,
  vehicleNameString,
  vehicleTypeString,
  initialConditionData
) {
  console.log(
    "[OpenMission] Populating Vehicle with data:",
    JSON.stringify(
      {
        vehicleData,
        vehicleNameString,
        vehicleTypeString,
        initialConditionData,
      },
      null,
      2
    )
  );

  const vehicleTypeSelect = document.getElementById("vehicle-type");
  const vehicleNameInput = document.getElementById("vehicle-name");
  const payloadMassInput = document.getElementById("payload-mass");
  const plfMassInput = document.getElementById("plf-mass");
  const plfSepValueInput = document.getElementById("plf-sep-value");
  const plfTimeRadio = document.getElementById("plf-time");
  const plfAltitudeRadio = document.getElementById("plf-altitude");
  const integrationMethodSelect = document.getElementById("integration-method");
  const timeStepInput = document.getElementById("time-step");
  const effectiveAltitudeInput = document.getElementById("effective-alt");

  // General vehicle data
  if (vehicleNameInput && vehicleNameString)
    vehicleNameInput.value = vehicleNameString;

  const payloadObjectName = vehicleData.payload;
  if (
    payloadObjectName &&
    window.finalMissionData[payloadObjectName] &&
    payloadMassInput
  ) {
    payloadMassInput.value =
      window.finalMissionData[payloadObjectName].mass || "";
  }

  const plfObjectName = vehicleData.plf;
  if (plfObjectName && window.finalMissionData[plfObjectName]) {
    const plfObject = window.finalMissionData[plfObjectName];
    if (plfMassInput) {
      plfMassInput.value = plfObject.mass || "";
    }

    // Populate PLF Separation Type and Value (if fields exist in HTML)
    if (plfSepValueInput && plfTimeRadio && plfAltitudeRadio) {
      // Check if these inputs are still in HTML
      if (plfObject.separation_type) {
        if (plfObject.separation_type.toLowerCase() === "time") {
          plfTimeRadio.checked = true;
        } else if (plfObject.separation_type.toLowerCase() === "altitude") {
          plfAltitudeRadio.checked = true;
        }
        // Consider dispatching change event for radio group if its visibility/behavior depends on it
        // plfTimeRadio.dispatchEvent(new Event('change', {bubbles: true}));

        if (plfObject.separation_value !== undefined) {
          plfSepValueInput.value = plfObject.separation_value;
        }
      } else {
        // Default if not in JSON
        plfTimeRadio.checked = true;
        plfAltitudeRadio.checked = false;
        plfSepValueInput.value = "";
      }
    }
  }

  if (integrationMethodSelect)
    integrationMethodSelect.value = vehicleData.integration_method || "RK4";
  if (timeStepInput) timeStepInput.value = vehicleData.time_step || "0.1";
  if (effectiveAltitudeInput)
    effectiveAltitudeInput.value = vehicleData.effective_altitude || "";

  // Set vehicle type and trigger change to show relevant sections
  if (vehicleTypeSelect && vehicleTypeString) {
    vehicleTypeSelect.value = vehicleTypeString.toLowerCase(); // e.g., "ascend"
    const event = new Event("change", { bubbles: true });
    vehicleTypeSelect.dispatchEvent(event);
    console.log(
      `[OpenMission] Vehicle type set to: ${vehicleTypeSelect.value}. Change event dispatched.`
    );
  }

  const initialConditionType = initialConditionData.type;

  setTimeout(() => {
    if (vehicleTypeString === "ASCEND" || vehicleTypeString === "PROJECTILE") {
      const stateRadioAscendProj = document.getElementById("state-data");
      const launchRadioAscendProj = document.getElementById("launch-point");

      if (initialConditionType === "Launch_Point" && launchRadioAscendProj) {
        if (!launchRadioAscendProj.checked) {
          launchRadioAscendProj.checked = true;
          launchRadioAscendProj.dispatchEvent(
            new Event("change", { bubbles: true })
          );
        }
        setTimeout(() => {
          const lpFieldsContainerId =
            vehicleTypeString === "ASCEND"
              ? "launch-fields-ascend"
              : "launch-fields-projectile";
          const lpForm = document.getElementById(lpFieldsContainerId);
          if (lpForm) {
            console.log(
              `[OpenMission] Populating launch point fields in ${lpFieldsContainerId}`
            );
            const ids = [
              "lat",
              "long",
              "azimuth",
              "msl",
              "lp-height",
              "launch-angle",
              "roll",
              "pitch",
              "yaw",
            ];
            const jsonKeys = [
              "latitude",
              "longitude",
              "azimuth",
              "above_MSL",
              "lp_height",
              "launch_set_angle",
              "roll",
              "pitch",
              "yaw",
            ];
            ids.forEach((id, index) => {
              const input = document.getElementById(id);
              const jsonValue = initialConditionData[jsonKeys[index]];
              if (input)
                input.value =
                  jsonValue !== undefined
                    ? jsonValue
                    : id === "launch-angle" ||
                      id === "roll" ||
                      id === "pitch" ||
                      id === "yaw"
                    ? "0"
                    : "";
              else
                console.warn(
                  `Input not found for ID: ${id} in ${lpFieldsContainerId}`
                );
            });
          } else {
            console.warn(
              `[OpenMission] Launch Point form container (${lpFieldsContainerId}) not found.`
            );
          }
        }, 150);
      } else if (
        initialConditionType === "State_Vector" &&
        stateRadioAscendProj
      ) {
        // Ensure correct type check from JSON
        if (!stateRadioAscendProj.checked) {
          stateRadioAscendProj.checked = true;
          stateRadioAscendProj.dispatchEvent(
            new Event("change", { bubbles: true })
          );
        }
        setTimeout(() => {
          const svForm = document.getElementById("state-fields");
          if (svForm) {
            console.log(
              "[OpenMission] Populating State Vector fields for ASCEND/PROJECTILE."
            );
            const ids = ["X", "Y", "Z", "U", "V", "W", "q0", "q1", "q2", "q3"];
            ids.forEach((id) => {
              const input = document.getElementById(id);
              if (input)
                input.value =
                  initialConditionData[id] !== undefined
                    ? initialConditionData[id]
                    : "";
              else
                console.warn(`Input not found for ID: ${id} in state-fields`);
            });
          } else {
            console.warn(
              "[OpenMission] State Vector form container (state-fields) not found."
            );
          }
        }, 150);
      }
    } else if (vehicleTypeString === "ORBITAL") {
      const stateOrbitalRadio = document.getElementById("state-orbital");
      const tleOrbitalRadio = document.getElementById("tle-orbital");
      const elementsOrbitalRadio = document.getElementById("elements-orbital");

      if (initialConditionType === "State_Vector" && stateOrbitalRadio) {
        // Ensure correct type check from JSON
        if (!stateOrbitalRadio.checked) {
          stateOrbitalRadio.checked = true;
          stateOrbitalRadio.dispatchEvent(
            new Event("change", { bubbles: true })
          );
        }
        setTimeout(() => {
          const svOrbitalForm = document.getElementById("state-fields-orbital");
          if (svOrbitalForm) {
            console.log(
              "[OpenMission] Populating State Vector fields for ORBITAL."
            );
            const ids = [
              "X-orbital",
              "Y-orbital",
              "Z-orbital",
              "U-orbital",
              "V-orbital",
              "W-orbital",
              "q0-orbital",
              "q1-orbital",
              "q2-orbital",
              "q3-orbital",
            ];
            const jsonKeys = [
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
            ]; // Assuming JSON keys are without "-orbital"
            ids.forEach((id, index) => {
              const input = document.getElementById(id);
              if (input)
                input.value =
                  initialConditionData[jsonKeys[index]] !== undefined
                    ? initialConditionData[jsonKeys[index]]
                    : "";
              else
                console.warn(
                  `Input not found for ID: ${id} in state-fields-orbital`
                );
            });
          } else {
            console.warn(
              "[OpenMission] Orbital State Vector form container (state-fields-orbital) not found."
            );
          }
        }, 150);
      } else if (initialConditionType === "TLE" && tleOrbitalRadio) {
        // Ensure correct type check from JSON
        if (!tleOrbitalRadio.checked) {
          tleOrbitalRadio.checked = true;
          tleOrbitalRadio.dispatchEvent(new Event("change", { bubbles: true }));
        }
        setTimeout(() => {
          const tleForm = document.getElementById("tle-fields");
          if (tleForm) {
            console.log("[OpenMission] Populating TLE fields for ORBITAL.");
            const ids = [
              "line1",
              "line2",
              "start-time",
              "stop-time",
              "step-time",
            ];
            const jsonKeys = [
              "line1",
              "line2",
              "start_time",
              "stop_time",
              "step_time",
            ]; // JSON uses snake_case for time fields
            ids.forEach((id, index) => {
              const input = document.getElementById(id);
              if (input)
                input.value =
                  initialConditionData[jsonKeys[index]] !== undefined
                    ? initialConditionData[jsonKeys[index]]
                    : "";
              else console.warn(`Input not found for ID: ${id} in tle-fields`);
            });
          } else {
            console.warn(
              "[OpenMission] TLE form container (tle-fields) not found."
            );
          }
        }, 150);
      } else if (initialConditionType === "Elements" && elementsOrbitalRadio) {
        // Ensure correct type check from JSON
        if (!elementsOrbitalRadio.checked) {
          elementsOrbitalRadio.checked = true;
          elementsOrbitalRadio.dispatchEvent(
            new Event("change", { bubbles: true })
          );
        }
        setTimeout(() => {
          const elemForm = document.getElementById("elements-fields");
          if (elemForm) {
            console.log(
              "[OpenMission] Populating Orbital Elements fields for ORBITAL."
            );
            const ids = [
              "semi-major-axis",
              "eccentricity",
              "inclination",
              "argument-perigee",
              "raan",
              "true-anomaly",
            ];
            const jsonKeys = [
              "semi_major_axis",
              "eccentricity",
              "inclination",
              "argument_perigee",
              "raan",
              "true_anomaly",
            ]; // JSON uses snake_case
            ids.forEach((id, index) => {
              const input = document.getElementById(id);
              if (input)
                input.value =
                  initialConditionData[jsonKeys[index]] !== undefined
                    ? initialConditionData[jsonKeys[index]]
                    : "";
              else
                console.warn(
                  `Input not found for ID: ${id} in elements-fields`
                );
            });
          } else {
            console.warn(
              "[OpenMission] Orbital Elements form container (elements-fields) not found."
            );
          }
        }, 150);
      }
    }
  }, 100);

  console.log("[OpenMission] populateVehicle finished.");
}

// --- Helper functions for populating dynamically created forms (Stages, Motors, Nozzles) ---
function populateDynamicStageForm(stageData, stageUINumber, filePaths) {
  const form = document.getElementById(`stage${stageUINumber}-form`);
  if (!form) {
    console.error(
      `Stage form stage${stageUINumber}-form not found for population.`
    );
    return;
  }

  const structuralMassInput = form.querySelector(
    `#structural-mass-${stageUINumber}`
  );
  if (structuralMassInput && stageData.str_mass !== undefined)
    structuralMassInput.value = stageData.str_mass;

  const refAreaInput = form.querySelector(`#reference-area-${stageUINumber}`);
  if (refAreaInput && stageData.ref_area !== undefined)
    refAreaInput.value = stageData.ref_area;

  const burnTimeInput = form.querySelector(`#burn-time-${stageUINumber}`);
  if (burnTimeInput && stageData.burntime !== undefined)
    burnTimeInput.value = stageData.burntime;

  const dcissToggle = form.querySelector(`#dciss-toggle-stage${stageUINumber}`);
  if (dcissToggle && stageData.DCISS !== undefined)
    dcissToggle.checked = stageData.DCISS === "ON";

  const coastingToggle = form.querySelector(
    `#coasting-toggle-stage${stageUINumber}`
  );
  if (coastingToggle && stageData.coasting !== undefined)
    coastingToggle.checked = stageData.coasting === "ON";

  const aeroFilenameInput = form.querySelector(
    `#aero-filename-stage${stageUINumber}`
  );
  if (
    aeroFilenameInput &&
    stageData.aero_data &&
    stageData.aero_data.length > 0
  ) {
    const aeroDataKey = stageData.aero_data[0];
    if (filePaths && typeof filePaths[aeroDataKey] === "string") {
      aeroFilenameInput.value = filePaths[aeroDataKey];
    } else if (typeof aeroDataKey === "string") {
      aeroFilenameInput.value = aeroDataKey + ".csv";
    }
  }

  const burnTimeIdInput = form.querySelector(`#burn-time-id-${stageUINumber}`);
  if (burnTimeIdInput && stageData.ini_flag)
    burnTimeIdInput.value = stageData.ini_flag;

  const separationFlagInput = form.querySelector(
    `#separation-flag-stage${stageUINumber}`
  );
  if (separationFlagInput && stageData.sep_flag)
    separationFlagInput.value = stageData.sep_flag;

  if (burnTimeInput)
    burnTimeInput.dispatchEvent(new Event("input", { bubbles: true }));

  console.log(`Populated stage ${stageUINumber} form.`);
}

function populateDynamicMotorForm(
  motorData,
  stageUINumber,
  motorUINumber,
  filePaths
) {
  const form = document.getElementById(
    `stage${stageUINumber}-motor${motorUINumber}-form`
  );
  if (!form) {
    console.error(
      `Motor form stage${stageUINumber}-motor${motorUINumber}-form not found.`
    );
    return;
  }

  const propulsionTypeSelect = form.querySelector("select");
  if (propulsionTypeSelect && motorData.propulsion_type)
    propulsionTypeSelect.value = motorData.propulsion_type;

  const propulsionMassInput = form.querySelector(
    'input[placeholder="Enter Propulsion Mass"]'
  );
  if (propulsionMassInput && motorData.propulsion_mass !== undefined)
    propulsionMassInput.value = motorData.propulsion_mass;

  const nozzleDiameterInput = form.querySelector(
    'input[placeholder="Enter Nozzle Diameter"]'
  );
  if (nozzleDiameterInput && motorData.nozzle_diameter !== undefined)
    nozzleDiameterInput.value = motorData.nozzle_diameter;

  const thrustFilenameInput = form.querySelector(
    `#thrust-filename-stage${stageUINumber}-motor${motorUINumber}`
  );
  if (thrustFilenameInput && motorData.thrust_file_name) {
    thrustFilenameInput.value = motorData.thrust_file_name;
  }

  console.log(
    `Populated motor ${motorUINumber} for stage ${stageUINumber} form.`
  );
}

function populateDynamicNozzleForm(
  nozzleData,
  stageUINumber,
  motorUINumber,
  filePaths
) {
  const form = document.getElementById(
    `stage${stageUINumber}-motor${motorUINumber}-nozzle1-form`
  );
  if (!form || !nozzleData) {
    console.error(
      `Nozzle form/data for stage${stageUINumber}-motor${motorUINumber}-nozzle1 not found.`
    );
    return;
  }

  const etaThrustInput = form.querySelector(
    'input[placeholder="Enter ETA thrust"]'
  );
  if (etaThrustInput && nozzleData.eta_thrust !== undefined)
    etaThrustInput.value = nozzleData.eta_thrust;
  const zetaThrustInput = form.querySelector(
    'input[placeholder="Enter Zeta thrust"]'
  );
  if (zetaThrustInput && nozzleData.zeta_thrust !== undefined)
    zetaThrustInput.value = nozzleData.zeta_thrust;

  const radialDistanceInput = form.querySelector(
    'input[placeholder="Enter radial distance"]'
  );
  if (radialDistanceInput && nozzleData.location_radial_distance !== undefined)
    radialDistanceInput.value = nozzleData.location_radial_distance;
  const phiInput = form.querySelector('input[placeholder="Enter Phi value"]');
  if (phiInput && nozzleData.location_phi !== undefined)
    phiInput.value = nozzleData.location_phi;

  const sigmaThrustInput = form.querySelector(
    'input[placeholder="Enter sigma thrust"]'
  );
  if (sigmaThrustInput && nozzleData.miss_align_sigma !== undefined)
    sigmaThrustInput.value = nozzleData.miss_align_sigma;
  const thauThrustInput = form.querySelector(
    'input[placeholder="Enter thau thrust"]'
  );
  if (thauThrustInput && nozzleData.miss_align_thau !== undefined)
    thauThrustInput.value = nozzleData.miss_align_thau;
  const epsilonThrustInput = form.querySelector(
    'input[placeholder="Enter epsilon thrust"]'
  );
  if (epsilonThrustInput && nozzleData.miss_align_epsilon !== undefined)
    epsilonThrustInput.value = nozzleData.miss_align_epsilon;

  const muInput = form.querySelector('input[placeholder="Enter MU value"]');
  if (muInput && nozzleData.orientation_mu !== undefined)
    muInput.value = nozzleData.orientation_mu;
  const lambdaInput = form.querySelector(
    'input[placeholder="Enter LAMDA value"]'
  );
  if (lambdaInput && nozzleData.orientation_lambda !== undefined)
    lambdaInput.value = nozzleData.orientation_lambda;
  const kappaInput = form.querySelector(
    'input[placeholder="Enter KAPPA value"]'
  );
  if (kappaInput && nozzleData.orientation_kappa !== undefined)
    kappaInput.value = nozzleData.orientation_kappa;

  const xInput = form.querySelector('input[placeholder="Enter X value"]');
  if (xInput && nozzleData.throat_location_x !== undefined)
    xInput.value = nozzleData.throat_location_x;
  const yInput = form.querySelector('input[placeholder="Enter Y value"]');
  if (yInput && nozzleData.throat_location_y !== undefined)
    yInput.value = nozzleData.throat_location_y;
  const zInput = form.querySelector('input[placeholder="Enter Z value"]');
  if (zInput && nozzleData.throat_location_z !== undefined)
    zInput.value = nozzleData.throat_location_z;

  console.log(
    `Populated nozzle 1 for motor ${motorUINumber}, stage ${stageUINumber} form.`
  );
}

// Placeholder for other main population functions
// function populateVehicle(vehicleData, missionMode) { console.log('Populating Vehicle', vehicleData, missionMode); /* ... */ }

// Placeholder for optimization population functions
// function populateOptimizationObjectiveFunction(objFuncData) { console.log('Populating Objective Function', objFuncData); /* ... */ }
// function populateOptimizationConstraints(constraintsData) { console.log('Populating Constraints', constraintsData); /* ... */ }
// function populateOptimizationModeSettings(modeSettingsData) { console.log('Populating Optimization Mode', modeSettingsData); /* ... */ }
// function populateOptimizationDesignVariables(designVarsData) { console.log('Populating Design Variables', designVarsData); /* ... */ }

// --- Helper functions for populating dynamically created forms (Stages, Motors, Nozzles) ---
async function populateStagesAndMotors(
  loadedData,
  vehicleNameKey,
  vehicleData
) {
  console.log(
    "[OpenMission] Starting populateStagesAndMotors for vehicle:",
    vehicleNameKey,
    "with data:",
    // JSON.stringify(vehicleData, null, 2) // Avoid stringifying large objects in logs
    { stages: vehicleData.stage ? vehicleData.stage.length : 0 }
  );
  if (!vehicleData || !vehicleData.stage || !Array.isArray(vehicleData.stage)) {
    console.warn(
      "[OpenMission] No stages found for vehicle or vehicleData is invalid:",
      vehicleNameKey
    );
    return;
  }

  const addStageBtn = document.getElementById("add-stage-btn");
  if (!addStageBtn) {
    console.error(
      '[OpenMission] "Add Stage" button not found. Cannot create stages.'
    );
    return;
  }

  const stagesInFile = vehicleData.stage; // Array of stage names, e.g., ["Stage_1", "Stage_2"]

  for (let i = 0; i < stagesInFile.length; i++) {
    const stageNameKey = stagesInFile[i]; // e.g., "Stage_1"
    const stageDataObject = loadedData[stageNameKey];
    const stageUINumber = i + 1; // UI stage number is 1-indexed

    if (!stageDataObject) {
      console.warn(
        `[OpenMission] Data for stage '${stageNameKey}' not found in loadedData. Skipping.`
      );
      continue;
    }

    console.log(
      `[OpenMission] Processing Stage ${stageUINumber} ('${stageNameKey}')`
    );

    // Simulate click to create the stage UI elements
    addStageBtn.click();

    // Wait for the stage form to be available
    await waitForElement(`#stage${stageUINumber}-form`, 3000);

    // Populate the newly created stage form
    // Ensure populateDynamicStageForm is globally available from missionDataHandler.js
    if (typeof populateDynamicStageForm === "function") {
      populateDynamicStageForm(stageDataObject, stageUINumber, loadedData); // loadedData is filePaths
    } else {
      console.error(
        "[OpenMission] populateDynamicStageForm is not defined globally."
      );
    }

    // Now handle motors for this stage
    if (stageDataObject.motor && Array.isArray(stageDataObject.motor)) {
      const motorsInStage = stageDataObject.motor;
      const addMotorBtnForStage = document.querySelector(
        `#stage${stageUINumber}-form .add-motor-btn`
      );

      if (!addMotorBtnForStage) {
        console.warn(
          `[OpenMission] "Add Motor" button not found for Stage ${stageUINumber}. Cannot add motors.`
        );
        continue;
      }

      for (let j = 0; j < motorsInStage.length; j++) {
        const motorNameKey = motorsInStage[j];
        const motorDataObject = loadedData[motorNameKey];
        const motorUINumber = j + 1;

        if (!motorDataObject) {
          console.warn(
            `[OpenMission] Data for motor '${motorNameKey}' not found in loadedData. Skipping.`
          );
          continue;
        }
        console.log(
          `[OpenMission] Processing Motor ${motorUINumber} ('${motorNameKey}') for Stage ${stageUINumber}`
        );

        addMotorBtnForStage.click();
        await waitForElement(
          `#stage${stageUINumber}-motor${motorUINumber}-form`,
          3000
        );

        if (typeof populateDynamicMotorForm === "function") {
          populateDynamicMotorForm(
            motorDataObject,
            stageUINumber,
            motorUINumber,
            loadedData // loadedData is filePaths
          );
        } else {
          console.error(
            "[OpenMission] populateDynamicMotorForm is not defined globally."
          );
        }

        let nozzleNameKey = motorDataObject.nozzle;
        if (Array.isArray(nozzleNameKey) && nozzleNameKey.length > 0)
          nozzleNameKey = nozzleNameKey[0];

        if (!nozzleNameKey && motorDataObject.no_of_nozzles > 0) {
          // Check if nozzles are expected
          // Try to construct the nozzle name based on convention if not directly provided
          // Example: S1_MOTOR1_NOZ1 or Stage_1_Motor_1_Nozzle_1
          // This part needs to be robust and match the actual naming convention in the JSON
          nozzleNameKey = `${motorNameKey}_NOZ1`; // Adjust if convention is different
          if (!loadedData[nozzleNameKey]) {
            // Fallback to another common convention if the first isn't found
            nozzleNameKey = `${stageNameKey}_${motorNameKey}_Nozzle_1`; // Or similar, based on actual data structure
          }
        }

        const nozzleDataObject = loadedData[nozzleNameKey];
        if (nozzleDataObject) {
          console.log(
            `[OpenMission] Processing Nozzle ('${nozzleNameKey}') for Motor ${motorUINumber}, Stage ${stageUINumber}`
          );
          // No need to click for nozzle form, it's created with motor
          // await waitForElement(`#stage${stageUINumber}-motor${motorUINumber}-nozzle1-form`, 3000);
          if (typeof populateDynamicNozzleForm === "function") {
            populateDynamicNozzleForm(
              nozzleDataObject,
              stageUINumber,
              motorUINumber,
              loadedData // loadedData is filePaths
            );
          } else {
            console.error(
              "[OpenMission] populateDynamicNozzleForm is not defined globally."
            );
          }
        } else if (motorDataObject.no_of_nozzles > 0) {
          // Only warn if nozzles were expected
          console.warn(
            `[OpenMission] Data for nozzle '${nozzleNameKey}' (derived or direct) not found for Motor ${motorNameKey}. Skipping nozzle.`
          );
        }
      }
    }
  }
  console.log("[OpenMission] populateStagesAndMotors finished.");
}

// Helper function to wait for an element to appear in the DOM
async function waitForElement(selector, timeout = 2000) {
  const startTime = Date.now();
  while (true) {
    const element = document.querySelector(selector);
    if (element) return element;
    if (Date.now() - startTime > timeout)
      throw new Error(`Timeout waiting for element: ${selector}`);
    await new Promise((resolve) => setTimeout(resolve, 50)); // Poll every 50ms
  }
}

// Make sure this file is loaded after ui-navigation.js and missionDataHandler.js
// ... (rest of the file)
