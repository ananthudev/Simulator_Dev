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

      // Increase delay to ensure DOM is fully ready before populating forms
      setTimeout(() => {
        console.log(
          "[OpenMission] DOM reset complete, now populating forms..."
        );

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
      }, 1000); // Increase from 500ms to 1000ms for a more reliable DOM reset
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
  console.log("[OpenMission] Resetting current mission state...");

  // 1. Reset global data
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
  window.thrustTimeData = {}; // Ensure thrust time data is cleared

  // Clear any cached element references
  window._cachedFormElements = {};

  // Ensure counters are reset
  window.stageCounter = 0;
  window.motorCounters = {};

  // Reset any other form-specific state
  if (window.formState) window.formState = {};

  // 2. Clear static form fields (example for mission form)
  const missionForm = document.getElementById("mission-form");
  if (missionForm) missionForm.reset();
  const enviroForm = document.getElementById("enviro-form");
  if (enviroForm) enviroForm.reset();
  const vehicleForm = document.getElementById("vehicle-form");
  if (vehicleForm) vehicleForm.reset();
  // Reset other static forms
  const sequenceForm = document.getElementById("sequence-form");
  if (sequenceForm) sequenceForm.reset();
  const steeringForm = document.getElementById("steering-form");
  if (steeringForm) steeringForm.reset();
  const stoppingForm = document.getElementById("stopping-form");
  if (stoppingForm) stoppingForm.reset();

  // 3. Clear dynamic UI elements
  // Example: Clear stages from sidebar
  const vehicleStagesList = document.getElementById("vehicle-stages");
  if (vehicleStagesList) vehicleStagesList.innerHTML = "";

  // IMPROVED FORM REMOVAL: Use a more robust process with verification
  console.log("[OpenMission] Starting dynamic form removal process...");

  // Log all current forms before removal
  console.log("[OpenMission] Current forms before removal:");
  const allForms = document.querySelectorAll('[id$="-form"]');
  allForms.forEach((form) => console.log(`- ${form.id}`));

  // Get a reference to the forms container
  const formsContainer = document.getElementById("forms-container");
  if (formsContainer) {
    try {
      // STEP 1: Try the conventional approach first - select and remove forms by type
      const stageForms = document.querySelectorAll(
        '[id^="stage"][id$="-form"]'
      );
      console.log(
        `[OpenMission] Found ${stageForms.length} stage forms to remove`
      );
      stageForms.forEach((form) => {
        try {
          if (form && form.parentNode) {
            console.log(`[OpenMission] Removing stage form: ${form.id}`);
            form.parentNode.removeChild(form);
          }
        } catch (e) {
          console.error(
            `[OpenMission] Error removing stage form ${form.id}:`,
            e
          );
        }
      });

      // STEP 2: If that failed, try a more aggressive approach - clear entire container
      // First check if all forms were successfully removed
      const remainingForms = formsContainer.querySelectorAll(
        '[id^="stage"][id$="-form"]'
      );
      if (remainingForms.length > 0) {
        console.warn(
          `[OpenMission] ${remainingForms.length} stage forms remain after attempted removal. Using container reset approach.`
        );
        try {
          // Save the original container
          const originalHTML = formsContainer.innerHTML;

          // Clear all dynamic content
          formsContainer.innerHTML = "";

          // Re-insert only the static forms that should always be present
          // This approach ensures we don't lose any static forms while clearing dynamic ones
          const staticForms = [
            "mission-form",
            "enviro-form",
            "vehicle-form",
            "sequence-form",
            "steering-form",
            "stopping-form",
            "objective-function-form",
            "constraints-form",
            "mode-form",
            "design-variables-form",
          ];

          const tempContainer = document.createElement("div");
          tempContainer.innerHTML = originalHTML;

          staticForms.forEach((formId) => {
            const staticForm = tempContainer.querySelector(`#${formId}`);
            if (staticForm) {
              formsContainer.appendChild(staticForm);
            }
          });

          console.log(
            "[OpenMission] Container reset complete. Re-inserted static forms."
          );
        } catch (e) {
          console.error("[OpenMission] Error during container reset:", e);
        }
      }
    } catch (e) {
      console.error("[OpenMission] Error during form removal process:", e);
    }

    // Verify all dynamic forms were removed
    const finalCheck = formsContainer.querySelectorAll(
      '[id^="stage"][id$="-form"]'
    );
    console.log(
      `[OpenMission] Final check: ${finalCheck.length} stage forms remain after cleanup`
    );

    if (finalCheck.length > 0) {
      console.warn(
        "[OpenMission] Some forms still remain. Forcing container reset..."
      );
      // As a last resort, if we still have forms, try one more approach
      try {
        // Create a new div to replace the forms container
        const newFormsContainer = document.createElement("div");
        newFormsContainer.id = "forms-container";
        newFormsContainer.className = formsContainer.className;

        // Replace the old container with the new one
        if (formsContainer.parentNode) {
          formsContainer.parentNode.replaceChild(
            newFormsContainer,
            formsContainer
          );
          console.log("[OpenMission] Forms container completely replaced");

          // Re-add the static forms that should always be present
          const staticForms = document.querySelectorAll(
            '[id$="-form"]:not([id^="stage"])'
          );
          staticForms.forEach((form) => {
            if (!form.id.includes("motor") && !form.id.includes("nozzle")) {
              newFormsContainer.appendChild(form);
            }
          });
        }
      } catch (e) {
        console.error("[OpenMission] Error during container replacement:", e);
      }
    }
  } else {
    console.error(
      "[OpenMission] Could not find forms container! Form removal failed."
    );
  }

  // Clear any stage tabs in the sidebar
  const stageTabs = document.querySelectorAll(".stage-tab");
  console.log(`[OpenMission] Removing ${stageTabs.length} stage tabs`);
  stageTabs.forEach((tab) => {
    if (tab.parentNode) {
      tab.parentNode.removeChild(tab);
    }
  });

  // 4. Hide all forms and show welcome, then navigate (example)
  if (window.uiNav) {
    // Assuming uiNav is globally accessible from ui-navigation.js
    window.uiNav.hideAllForms();
  }

  // Clear any displayed filenames for CSV uploads
  const csvFilenames = document.querySelectorAll(".filename");
  csvFilenames.forEach((fn) => (fn.value = "No file chosen"));
  const clearCsvButtons = document.querySelectorAll(".clear-upload");
  clearCsvButtons.forEach((btn) => (btn.style.display = "none"));

  // Force garbage collection if available (browser debugging only)
  if (window.gc) window.gc();

  console.log("[OpenMission] Mission state reset complete.");
}

function populateForms(loadedData) {
  console.log(
    "[OpenMission] Starting populateForms with loadedData:",
    JSON.stringify(loadedData, null, 2)
  );
  window.finalMissionData = loadedData; // Make loaded data globally accessible

  if (!loadedData.mission) {
    console.error("Mission data is missing!");
    Swal.fire(
      "Error",
      "Cannot populate forms: Mission section is missing in the loaded file.",
      "error"
    );
    return;
  }

  // Already implemented sections
  populateMissionDetails(loadedData.mission);
  populateEnvironment({
    planet_name: loadedData.mission?.planet_name,
    EARTH: loadedData.EARTH,
    Wind: loadedData.Wind,
  });

  // Find vehicle and mission data
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
    vehicleType = loadedData[missionKey].vehicle_type;
    if (
      loadedData[missionKey].vehicle &&
      loadedData[missionKey].vehicle.length > 0
    ) {
      vehicleName = loadedData[missionKey].vehicle[0];
      vehicleData = loadedData[vehicleName];
      if (vehicleData) {
        initialConditionName = vehicleData.Initial_condition;
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

    // Populate stages including motors and nozzles
    populateStagesAndMotors(loadedData, vehicleName, vehicleData);

    // Populate event sequence
    const sequenceKey = vehicleName + "_Sequence";
    if (loadedData[sequenceKey]) {
      populateEventSequence(loadedData, vehicleName);
    }

    // Populate steering components
    populateSteering(loadedData, vehicleName);
  } else {
    console.warn(
      "[OpenMission] Could not find all necessary vehicle data to populate vehicle form."
    );
  }

  // Populate optimization data if in optimization mode
  if (
    loadedData.mission.MODE?.toLowerCase() === "optimization" &&
    loadedData.optimization
  ) {
    populateOptimization(loadedData);
  }

  // Populate stopping condition
  if (loadedData.stopping_condition) {
    populateStoppingCondition(loadedData);
  }

  console.log("[OpenMission] Form population process completed.");
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
      `[OpenMission] Motor form stage${stageUINumber}-motor${motorUINumber}-form not found.`
    );
    return;
  }

  // Populate propulsion type - Fix selector to find the correct element
  const propulsionTypeSelect = form.querySelector("select.input-field");
  if (propulsionTypeSelect && motorData.type_of_prop) {
    propulsionTypeSelect.value = motorData.type_of_prop; // e.g., "solid", "liquid"
    console.log(
      `[OpenMission] Set propulsion type to ${motorData.type_of_prop} for motor ${motorUINumber}`
    );

    // Trigger change event to ensure UI updates correctly
    propulsionTypeSelect.dispatchEvent(new Event("change", { bubbles: true }));
  } else {
    console.warn(
      `[OpenMission] Could not find propulsion type select for motor ${motorUINumber} in stage ${stageUINumber}, or no type_of_prop in data`
    );
  }

  // Populate propulsion mass
  const propulsionMassInput = form.querySelector(
    'input[placeholder="Enter Propulsion Mass"]'
  );
  if (propulsionMassInput && motorData.prop_mass !== undefined)
    propulsionMassInput.value = motorData.prop_mass;

  // Populate nozzle diameter
  const nozzleDiameterInput = form.querySelector(
    'input[placeholder="Enter Nozzle Diameter"]'
  );
  if (nozzleDiameterInput && motorData.nozzledia !== undefined)
    nozzleDiameterInput.value = motorData.nozzledia;

  // Handle thrust time CSV file (displaying filename if there's thrust data)
  // From ui-navigation.js: <input type="text" id="thrust-filename-${stageId}-${motorCount}" class="filename" readonly placeholder="No file chosen" />
  // where stageId is "stage1", "stage2", etc. and motorCount is just the number (1, 2, etc.)
  const stageId = `stage${stageUINumber}`;

  // Log all filename input elements in this form for debugging
  console.log(
    `[OpenMission] Searching for thrust filename input in motor ${motorUINumber} form...`
  );
  const allFilenameInputs = form.querySelectorAll(".filename");
  console.log(
    `[OpenMission] Found ${allFilenameInputs.length} elements with class 'filename'`,
    Array.from(allFilenameInputs).map((el) => ({
      id: el.id,
      placeholder: el.placeholder,
    }))
  );

  // Try multiple selector patterns
  let thrustFilenameInput = null;

  // Pattern 1: From ui-navigation.js
  thrustFilenameInput = form.querySelector(
    `#thrust-filename-${stageId}-${motorUINumber}`
  );

  // Pattern 2: Using data from addMotorAndNozzle in ui-navigation.js
  if (!thrustFilenameInput) {
    thrustFilenameInput = form.querySelector(
      `#thrust-filename-stage${stageUINumber}-motor${motorUINumber}`
    );
  }

  // Pattern 3: The most generic - any input with class 'filename'
  if (!thrustFilenameInput && allFilenameInputs.length > 0) {
    thrustFilenameInput = allFilenameInputs[0];
    console.log(
      `[OpenMission] Using fallback: found generic filename input with id: ${thrustFilenameInput.id}`
    );
  }

  if (
    thrustFilenameInput &&
    motorData.thr_time &&
    Array.isArray(motorData.thr_time)
  ) {
    // Get a meaningful name for the file
    const motorName = motorData.name || `S${stageUINumber}_M${motorUINumber}`;
    const fileName = `${motorName}_thrust.csv`;

    console.log(
      `[OpenMission] Setting thrust filename for motor ${motorUINumber} to: ${fileName}`
    );

    // Set the filename in the input field
    thrustFilenameInput.value = fileName;

    // Store the thrust time data in window for later use
    if (!window.thrustTimeData) {
      window.thrustTimeData = {};
    }

    const thrustTimeKey = `stage${stageUINumber}_motor${motorUINumber}`;
    window.thrustTimeData[thrustTimeKey] = motorData.thr_time;

    console.log(
      `[OpenMission] Stored thrust time data for ${thrustTimeKey} with ${motorData.thr_time.length} rows`
    );

    // Show clear button if it exists
    const clearBtn = form.querySelector(".clear-thrust-btn, .clear-upload");
    if (clearBtn) clearBtn.style.display = "block";
  } else if (motorData.thr_time) {
    console.warn(
      `[OpenMission] Found thrust time data for motor ${motorUINumber} in stage ${stageUINumber}, but could not find the filename input element`
    );
  } else {
    console.warn(
      `[OpenMission] No thrust time data found for motor ${motorUINumber} in stage ${stageUINumber}`
    );
  }

  // After populating motor data, ensure we have a nozzle form and populate it
  console.log(`[OpenMission] Checking for nozzles to populate...`);

  // First check if nozzle forms are auto-created with motor, or if we need to create them
  setTimeout(() => {
    // Different approaches to finding the nozzle reference
    let nozzleRef = null;

    // Approach 1: Direct reference in motor data
    if (motorData.nozzle) {
      nozzleRef = motorData.nozzle;
      console.log(
        `[OpenMission] Found direct nozzle reference in motor data:`,
        nozzleRef
      );
    }
    // Approach 2: Try derived naming conventions if not explicitly referenced
    else if (motorData.no_of_nozzles > 0) {
      // Try different naming patterns
      const possibleNozzleNames = [
        `S${stageUINumber}_MOTOR${motorUINumber}_NOZ1`, // Common naming convention
        `S${stageUINumber}_M${motorUINumber}_NOZ1`, // Alternative
        `Stage${stageUINumber}_Motor${motorUINumber}_Nozzle1`, // More verbose
        `Stage_${stageUINumber}_Motor_${motorUINumber}_Nozzle_1`, // Underscore version
      ];

      for (const name of possibleNozzleNames) {
        if (window.finalMissionData[name]) {
          nozzleRef = name;
          console.log(`[OpenMission] Found nozzle data with key: ${nozzleRef}`);
          break;
        }
      }
    }

    if (nozzleRef && window.finalMissionData[nozzleRef]) {
      // Check if nozzle form already exists (it should, since addMotorAndNozzle creates both)
      const nozzleFormId = `stage${stageUINumber}-motor${motorUINumber}-nozzle1-form`;
      const nozzleForm = document.getElementById(nozzleFormId);

      if (nozzleForm) {
        console.log(
          `[OpenMission] Nozzle form ${nozzleFormId} exists, populating it`
        );
        const nozzleData = window.finalMissionData[nozzleRef];
        populateNozzleFormFields(
          nozzleForm,
          nozzleData,
          stageUINumber,
          motorUINumber,
          1
        );
      } else {
        console.error(
          `[OpenMission] Nozzle form ${nozzleFormId} not found. This is unexpected since addMotorAndNozzle should create both forms.`
        );
      }
    } else {
      console.warn(
        `[OpenMission] No nozzle data found for motor ${motorUINumber} in stage ${stageUINumber}`
      );
    }
  }, 500); // Delay to ensure motor form is fully initialized

  console.log(
    `[OpenMission] Populated motor ${motorUINumber} for stage ${stageUINumber} form.`
  );
}

function populateDynamicNozzleForm(
  nozzleData,
  stageUINumber,
  motorUINumber,
  filePaths
) {
  const formId = `stage${stageUINumber}-motor${motorUINumber}-nozzle1-form`;
  const form = document.getElementById(formId);

  if (!form || !nozzleData) {
    console.error(`[OpenMission] Nozzle form/data for ${formId} not found.`);
    return;
  }

  console.log(
    `[OpenMission] Beginning nozzle population for ${formId} with data:`,
    nozzleData
  );

  // Use the improved populateNozzleFormFields function
  populateNozzleFormFields(form, nozzleData, stageUINumber, motorUINumber, 1);
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

  // Reset cached elements to avoid stale references
  window._cachedFormElements = {};

  // ADDITIONAL SAFETY CHECK: Make sure no old stage forms remain
  const existingForms = document.querySelectorAll('[id^="stage"][id$="-form"]');
  if (existingForms.length > 0) {
    console.warn(
      `[OpenMission] Found ${existingForms.length} existing stage forms before population. Attempting final cleanup.`
    );

    // Try one more time to remove them
    try {
      existingForms.forEach((form) => {
        if (form && form.parentNode) {
          console.log(`[OpenMission] Final cleanup: removing form ${form.id}`);
          form.parentNode.removeChild(form);
        }
      });

      // Reset stage counter to ensure proper numbering
      window.stageCounter = 0;
      window.motorCounters = {};

      console.log("[OpenMission] Final cleanup complete");
    } catch (e) {
      console.error("[OpenMission] Error during final cleanup:", e);
    }
  }

  // Wait a moment to ensure UI is ready after reset
  await new Promise((resolve) => setTimeout(resolve, 750));

  const stagesInFile = vehicleData.stage; // Array of stage names, e.g., ["Stage_1", "Stage_2"]

  // Debug current state
  console.log("[OpenMission] Current forms in DOM before adding stages:");
  document
    .querySelectorAll('[id^="stage"][id$="-form"]')
    .forEach((form) => console.log(`- ${form.id}`));

  // Track completed stages/motors for notification
  const completedElements = {
    stages: 0,
    motors: 0,
    nozzles: 0,
  };

  // Process stages sequentially to ensure proper creation order
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

    // Check if this stage form already exists (in case cleanup failed)
    const existingStageForm = document.getElementById(
      `stage${stageUINumber}-form`
    );
    if (existingStageForm) {
      console.warn(
        `[OpenMission] Stage ${stageUINumber} form already exists. Removing it first.`
      );
      if (existingStageForm.parentNode) {
        existingStageForm.parentNode.removeChild(existingStageForm);
      }

      // Also remove any associated motor and nozzle forms
      document
        .querySelectorAll(`[id^="stage${stageUINumber}-motor"][id$="-form"]`)
        .forEach((form) => {
          if (form.parentNode) {
            console.log(
              `[OpenMission] Removing existing motor form: ${form.id}`
            );
            form.parentNode.removeChild(form);
          }
        });
    }

    // Click to create the stage UI elements
    console.log(
      `[OpenMission] Clicking "Add Stage" button to create stage ${stageUINumber}`
    );
    addStageBtn.click();

    // Wait for the stage form to be available
    try {
      const stageForm = await waitForElement(
        `#stage${stageUINumber}-form`,
        3000
      );

      console.log(
        `[OpenMission] Stage ${stageUINumber} form created successfully`
      );
      completedElements.stages++;

      // Wait for handlers to attach
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Populate the stage form
      populateDynamicStageForm(stageDataObject, stageUINumber, loadedData);

      // Log before handling motors
      console.log(
        `[OpenMission] Stage ${stageUINumber} populated, now handling motors...`
      );
      console.log(
        `[OpenMission] This stage has ${
          stageDataObject.motor ? stageDataObject.motor.length : 0
        } motors defined`
      );

      // Process motors for this stage
      if (stageDataObject.motor && Array.isArray(stageDataObject.motor)) {
        // Make sure motorCounters is initialized for this stage
        if (!window.motorCounters) window.motorCounters = {};
        window.motorCounters[`stage${stageUINumber}`] = 0;

        // Process motors sequentially for better reliability
        for (let j = 0; j < stageDataObject.motor.length; j++) {
          const motorNameKey = stageDataObject.motor[j]; // e.g., "S1_MOTOR1"
          const motorData = loadedData[motorNameKey];
          const motorUINumber = j + 1;

          if (!motorData) {
            console.warn(
              `[OpenMission] Data for motor '${motorNameKey}' not found. Skipping.`
            );
            continue;
          }

          // Process this motor - create form and populate it
          await processMotor(
            motorData,
            motorNameKey,
            stageUINumber,
            motorUINumber
          );
          completedElements.motors++;

          // Slight delay between motors to prevent UI conflicts
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
      } else {
        console.log(
          `[OpenMission] No motors defined for stage ${stageUINumber}`
        );
      }
    } catch (error) {
      console.error(
        `[OpenMission] Error processing stage ${stageUINumber}: ${error.message}`
      );
    }

    // Slight delay between stages to prevent UI conflicts
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log(`[OpenMission] Stages and motors population summary:
  - Stages populated: ${completedElements.stages}
  - Motors populated: ${completedElements.motors}
  - Nozzles populated: ${completedElements.nozzles}
  `);

  console.log("[OpenMission] populateStagesAndMotors finished.");

  // Helper function to process a motor - create form, populate, handle nozzles
  async function processMotor(
    motorData,
    motorNameKey,
    stageUINumber,
    motorUINumber
  ) {
    console.log(
      `[OpenMission] Processing motor ${motorUINumber} (${motorNameKey}) for stage ${stageUINumber}`
    );

    // Check if this motor form already exists
    const existingMotorForm = document.getElementById(
      `stage${stageUINumber}-motor${motorUINumber}-form`
    );

    if (existingMotorForm) {
      console.log(
        `[OpenMission] Motor ${motorUINumber} form already exists for Stage ${stageUINumber}. Removing it.`
      );
      if (existingMotorForm.parentNode) {
        existingMotorForm.parentNode.removeChild(existingMotorForm);
      }

      // Also remove any associated nozzle forms
      document
        .querySelectorAll(
          `[id^="stage${stageUINumber}-motor${motorUINumber}-nozzle"][id$="-form"]`
        )
        .forEach((form) => {
          if (form.parentNode) {
            console.log(
              `[OpenMission] Removing existing nozzle form: ${form.id}`
            );
            form.parentNode.removeChild(form);
          }
        });
    }

    // Use the new forceAddMotorAndNozzle function to create both motor and nozzle forms
    console.log(
      `[OpenMission] Creating motor ${motorUINumber} for stage ${stageUINumber} using forceAddMotorAndNozzle`
    );
    const result = await forceAddMotorAndNozzle(stageUINumber, motorUINumber);

    if (result.success) {
      // We've successfully created both motor and nozzle forms
      console.log(`[OpenMission] Successfully created motor and nozzle forms`);

      // Wait a moment for any event handlers to attach
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Populate motor data
      console.log(
        `[OpenMission] Populating motor ${motorUINumber} data for stage ${stageUINumber}`
      );
      populateDynamicMotorForm(motorData, stageUINumber, motorUINumber);

      // Now populate the nozzle
      await handleNozzles(motorData, stageUINumber, motorUINumber);

      return;
    }

    // If the new approach failed, fall back to the old approach
    console.log(
      `[OpenMission] Falling back to standard approach for creating motor form`
    );

    // Find the Add Motor button for this stage
    console.log(
      `[OpenMission] Looking for Add Motor button for Stage ${stageUINumber}`
    );
    const addMotorBtnSelectors = [
      `#stage${stageUINumber}-form .add-motor-btn`,
      `#stage${stageUINumber}-add-motor-btn`,
      `.stage-form[id="stage${stageUINumber}-form"] .add-motor-btn`,
    ];

    let addMotorBtn = null;
    for (const selector of addMotorBtnSelectors) {
      addMotorBtn = document.querySelector(selector);
      if (addMotorBtn) {
        console.log(
          `[OpenMission] Found Add Motor button with selector: ${selector}`
        );
        break;
      }
    }

    if (!addMotorBtn) {
      console.error(
        `[OpenMission] Add Motor button not found for Stage ${stageUINumber}. Cannot add motor.`
      );
      return;
    }

    // Now we know the motor form either doesn't exist or has been removed
    console.log(
      `[OpenMission] Clicking Add Motor button for Stage ${stageUINumber} to create Motor ${motorUINumber}`
    );

    // Click the button to create the motor form
    addMotorBtn.click();

    // Wait for the motor form to be created
    try {
      const motorForm = await waitForElement(
        `#stage${stageUINumber}-motor${motorUINumber}-form`,
        3000
      );
      console.log(
        `[OpenMission] Motor ${motorUINumber} form created for Stage ${stageUINumber}`
      );

      // Wait a moment for any event handlers to attach
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Populate motor data
      console.log(
        `[OpenMission] Populating motor ${motorUINumber} data for stage ${stageUINumber}`
      );
      populateDynamicMotorForm(motorData, stageUINumber, motorUINumber);

      // After populating motor data, check if we have nozzles to populate
      await handleNozzles(motorData, stageUINumber, motorUINumber);
    } catch (error) {
      console.error(
        `[OpenMission] Timeout or error waiting for motor ${motorUINumber} form: ${error.message}`
      );
    }
  }

  // Helper function to handle nozzle creation and population
  async function handleNozzles(motorData, stageUINumber, motorUINumber) {
    console.log(
      `[OpenMission] Processing nozzles for motor ${motorUINumber}, stage ${stageUINumber}`
    );

    // Determine nozzle data source
    let nozzleRef = null;

    // Option 1: Directly referenced nozzle(s)
    if (motorData.nozzle) {
      nozzleRef = motorData.nozzle;
      console.log(`[OpenMission] Found direct nozzle reference:`, nozzleRef);
    }
    // Option 2: Try standard naming patterns if motor indicates nozzles exist
    else if (motorData.no_of_nozzles && motorData.no_of_nozzles > 0) {
      // Try various naming patterns
      const possibleNozzlePatterns = [
        `S${stageUINumber}_MOTOR${motorUINumber}_NOZ1`,
        `S${stageUINumber}_M${motorUINumber}_NOZ1`,
        `${motorData.name}_NOZ1`,
        `${motorData.name ? motorData.name.replace("MOTOR", "NOZ") : ""}`,
        `Stage_${stageUINumber}_Motor_${motorUINumber}_Nozzle_1`,
      ];

      for (const pattern of possibleNozzlePatterns) {
        if (window.finalMissionData[pattern]) {
          nozzleRef = pattern;
          console.log(
            `[OpenMission] Found nozzle with key pattern: ${pattern}`
          );
          break;
        }
      }

      if (!nozzleRef) {
        // If still not found, scan for any keys that might match
        const possibleKeys = Object.keys(window.finalMissionData).filter(
          (key) =>
            (key.includes(`S${stageUINumber}`) ||
              key.includes(`Stage${stageUINumber}`) ||
              key.includes(`Stage_${stageUINumber}`)) &&
            (key.includes(`MOTOR${motorUINumber}`) ||
              key.includes(`M${motorUINumber}`) ||
              key.includes(`Motor${motorUINumber}`) ||
              key.includes(`Motor_${motorUINumber}`)) &&
            (key.includes("NOZ") || key.includes("Nozzle"))
        );

        if (possibleKeys.length > 0) {
          nozzleRef = possibleKeys[0];
          console.log(
            `[OpenMission] Found possible nozzle key by scanning: ${nozzleRef}`
          );
        }
      }
    }

    if (!nozzleRef) {
      console.warn(
        `[OpenMission] No nozzle data found for motor ${motorUINumber}, stage ${stageUINumber}`
      );
      return;
    }

    // Since addMotorAndNozzle creates both motor and nozzle forms together,
    // the nozzle form should already exist. Let's check for it.
    const nozzleFormId = `stage${stageUINumber}-motor${motorUINumber}-nozzle1-form`;
    let nozzleForm = document.getElementById(nozzleFormId);

    if (nozzleForm) {
      // Form exists, populate it
      console.log(`[OpenMission] Found existing nozzle form: ${nozzleFormId}`);

      // Get the nozzle data
      const nozzleData = window.finalMissionData[nozzleRef];
      if (nozzleData) {
        console.log(
          `[OpenMission] Populating nozzle form with data from ${nozzleRef}`
        );
        populateNozzleFormFields(
          nozzleForm,
          nozzleData,
          stageUINumber,
          motorUINumber,
          1
        );
        completedElements.nozzles++;
      } else {
        console.error(
          `[OpenMission] No data found for nozzle key: ${nozzleRef}`
        );
      }
    } else {
      console.error(
        `[OpenMission] Expected nozzle form ${nozzleFormId} not found. This shouldn't happen since addMotorAndNozzle creates both forms.`
      );

      // Debug: List all forms to see what's actually in the DOM
      const allNozzleForms = document.querySelectorAll(
        '[id*="nozzle"][id$="-form"]'
      );
      console.log(`[OpenMission] All nozzle forms in DOM:`);
      allNozzleForms.forEach((form) => console.log(`- ${form.id}`));
    }
  }
}

// Add a new function to more directly handle clicking the Add Motor button
async function forceAddMotor(stageNumber) {
  console.log(`[OpenMission] Force adding motor for stage ${stageNumber}`);

  // First try the standard button
  const addMotorBtn = document.querySelector(
    `#stage${stageNumber}-form .add-motor-btn`
  );

  if (addMotorBtn) {
    console.log(
      `[OpenMission] Found add motor button for stage ${stageNumber}, clicking it directly`
    );
    // Use a more direct approach to trigger the click
    try {
      // Try programmatic click first
      addMotorBtn.click();

      // Wait a bit for the click to take effect
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Check if the motor form was created
      if (document.querySelector(`#stage${stageNumber}-motor1-form`)) {
        console.log(`[OpenMission] Motor form created successfully via click`);
        return true;
      }

      // If programmatic click didn't work, try dispatchEvent
      console.log(
        `[OpenMission] Trying event dispatch for click on add motor button`
      );
      addMotorBtn.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          view: window,
        })
      );

      // Wait again
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Check again
      if (document.querySelector(`#stage${stageNumber}-motor1-form`)) {
        console.log(
          `[OpenMission] Motor form created successfully via event dispatch`
        );
        return true;
      }
    } catch (error) {
      console.error(
        `[OpenMission] Error trying to click add motor button: ${error.message}`
      );
    }
  }

  // If the button wasn't found or clicking didn't work, try to find the function that adds motors
  console.log(
    `[OpenMission] Standard click methods failed, looking for addMotorAndNozzle function`
  );

  // Check if the addMotorAndNozzle function is available
  if (typeof window.addMotorAndNozzle === "function") {
    try {
      console.log(
        `[OpenMission] Calling addMotorAndNozzle directly for stage ${stageNumber}`
      );
      window.addMotorAndNozzle(stageNumber);

      // Wait for the function to complete
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (document.querySelector(`#stage${stageNumber}-motor1-form`)) {
        console.log(
          `[OpenMission] Motor form created successfully via direct function call`
        );
        return true;
      }
    } catch (error) {
      console.error(
        `[OpenMission] Error calling addMotorAndNozzle directly: ${error.message}`
      );
    }
  }

  console.log(
    `[OpenMission] Failed to add motor for stage ${stageNumber} using all methods`
  );
  return false;
}

// Helper function to wait for an element to appear in the DOM
async function waitForElement(selector, timeout = 2000) {
  console.log(`[OpenMission] Waiting for element: ${selector}`);
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const element = document.querySelector(selector);
    if (element) {
      console.log(`[OpenMission] Element found: ${selector}`);
      return element;
    }
    await new Promise((resolve) => setTimeout(resolve, 50)); // Poll every 50ms
  }
  throw new Error(`Timeout waiting for element: ${selector}`);
}

// Function to populate motors data for a given stage
function populateMotorsData(vehicleData, stageUINumber, stageNameKey) {
  if (!vehicleData || !stageNameKey) return;

  const stageData = window.finalMissionData[stageNameKey];
  if (!stageData || !stageData.motor || !Array.isArray(stageData.motor)) {
    console.warn(`No motors found for stage: ${stageNameKey}`);
    return;
  }

  const motors = stageData.motor;
  for (let i = 0; i < motors.length; i++) {
    const motorNameKey = motors[i];
    const motorData = window.finalMissionData[motorNameKey];
    const motorUINumber = i + 1;

    if (!motorData) {
      console.warn(`Data for motor '${motorNameKey}' not found. Skipping.`);
      continue;
    }

    // Ensure motor form exists first by triggering Add Motor button
    const addMotorBtn = document.querySelector(
      `#stage${stageUINumber}-form .add-motor-btn`
    );
    if (!addMotorBtn) {
      console.warn(`Add Motor button not found for Stage ${stageUINumber}`);
      continue;
    }

    // Click to create form if it doesn't exist
    const motorForm = document.getElementById(
      `stage${stageUINumber}-motor${motorUINumber}-form`
    );
    if (!motorForm) {
      addMotorBtn.click();

      // Wait for form to be created
      setTimeout(() => {
        populateMotorFields(
          motorData,
          stageUINumber,
          motorUINumber,
          motorNameKey
        );
      }, 200);
    } else {
      populateMotorFields(
        motorData,
        stageUINumber,
        motorUINumber,
        motorNameKey
      );
    }
  }
}

// Function to populate individual motor fields
function populateMotorFields(
  motorData,
  stageUINumber,
  motorUINumber,
  motorNameKey
) {
  const form = document.getElementById(
    `stage${stageUINumber}-motor${motorUINumber}-form`
  );
  if (!form) {
    console.error(
      `Motor form for stage${stageUINumber}-motor${motorUINumber} not found.`
    );
    return;
  }

  // DEBUG SECTION: Inspect the form structure to find the thrust filename input
  console.log(
    `[OpenMission] Debug: Inspecting form for stage${stageUINumber}-motor${motorUINumber}`
  );

  // Check for upload-data sections
  const uploadDataSections = form.querySelectorAll(".upload-data");
  console.log(
    `[OpenMission] Debug: Found ${uploadDataSections.length} upload-data sections`
  );

  if (uploadDataSections.length > 0) {
    // Look at each upload-data section
    uploadDataSections.forEach((section, idx) => {
      console.log(
        `[OpenMission] Debug: Upload section ${idx} HTML structure:`,
        section.outerHTML
      );

      // Try to find input elements inside
      const inputs = section.querySelectorAll("input");
      console.log(
        `[OpenMission] Debug: Found ${inputs.length} input elements in section ${idx}`
      );

      inputs.forEach((input) => {
        console.log(
          `[OpenMission] Debug: Input element - id: ${input.id}, class: ${input.className}, type: ${input.type}`
        );
      });
    });
  }

  // END DEBUG SECTION

  // Improved propulsion type selector - try multiple strategies
  let propulsionTypeSelect = null;

  // Strategy 1: Try to find by looking for label text containing "Types of Propulsion"
  const propulsionLabels = Array.from(
    form.querySelectorAll(".form-group label.label")
  ).filter(
    (label) =>
      label.textContent.includes("Types of Propulsion") ||
      label.textContent.includes("Propulsion Type")
  );

  if (propulsionLabels.length > 0) {
    // Found a label, get its parent and then find the select inside it
    const formGroup = propulsionLabels[0].closest(".form-group");
    if (formGroup) {
      propulsionTypeSelect = formGroup.querySelector("select");
    }
  }

  // Strategy 2: If strategy 1 fails, try a more general approach - find any select with solid/liquid options
  if (!propulsionTypeSelect) {
    const allSelects = form.querySelectorAll("select");
    propulsionTypeSelect = Array.from(allSelects).find((select) => {
      const options = Array.from(select.options);
      return options.some(
        (option) => option.value === "solid" || option.value === "liquid"
      );
    });
  }

  // Now populate the select if found
  if (propulsionTypeSelect && motorData.type_of_prop) {
    propulsionTypeSelect.value = motorData.type_of_prop; // e.g., "solid", "liquid"
    console.log(
      `[OpenMission] Set propulsion type to ${motorData.type_of_prop} for motor ${motorUINumber} of stage ${stageUINumber}`
    );
  } else {
    console.warn(
      `[OpenMission] Could not find propulsion type select for motor ${motorUINumber} in stage ${stageUINumber}, or no type_of_prop in data`
    );
  }

  // Populate propulsion mass
  const propulsionMassInput = form.querySelector(
    'input[placeholder="Enter Propulsion Mass"]'
  );
  if (propulsionMassInput && motorData.prop_mass !== undefined) {
    propulsionMassInput.value = motorData.prop_mass;
  }

  // Populate nozzle diameter
  const nozzleDiameterInput = form.querySelector(
    'input[placeholder="Enter Nozzle Diameter"]'
  );
  if (nozzleDiameterInput && motorData.nozzledia !== undefined) {
    nozzleDiameterInput.value = motorData.nozzledia;
  }

  // IMPROVED THRUST TIME FILE HANDLING
  // Check if we have thrust time data to display
  if (motorData.thr_time && Array.isArray(motorData.thr_time)) {
    console.log(
      `[OpenMission] Found thrust time data array with ${motorData.thr_time.length} entries for motor ${motorUINumber}`
    );

    // Create a meaningful filename
    const motorName = motorData.name || `S${stageUINumber}_M${motorUINumber}`;
    const fileName = `${motorName}_thrust.csv`;

    // Try multiple ways to find the filename input
    let thrustFilenameInput = null;

    // Try many different possible patterns for the selector
    const possibleSelectors = [
      // From direct inspection of ui-navigation.js
      `#thrust-filename-stage${stageUINumber}-${motorUINumber}`,
      // Alternate format
      `input#thrust-filename-stage${stageUINumber}-${motorUINumber}`,
      // Trying with explicit motor in the name
      `#thrust-filename-stage${stageUINumber}-motor${motorUINumber}`,
      // Looking for any filename input in an upload-data section
      ".upload-data input.filename",
      // Any input with "filename" class
      ".filename",
      // Any input with "thrust" and "filename" in the ID
      `input[id*="thrust"][id*="filename"]`,
    ];

    // Try each selector in order
    for (const selector of possibleSelectors) {
      console.log(`[OpenMission] Trying selector: ${selector}`);
      const candidate = form.querySelector(selector);
      if (candidate) {
        thrustFilenameInput = candidate;
        console.log(
          `[OpenMission] Found input with selector '${selector}', id: ${candidate.id}`
        );
        break; // Found a match, exit the loop
      }
    }

    // If still not found, try one more approach - look for any readonly input in upload-data
    if (!thrustFilenameInput) {
      const uploadDataSection = form.querySelector(".upload-data");
      if (uploadDataSection) {
        const readonlyInputs =
          uploadDataSection.querySelectorAll("input[readonly]");
        if (readonlyInputs.length > 0) {
          thrustFilenameInput = readonlyInputs[0];
          console.log(
            `[OpenMission] Found readonly input in upload-data section, using this: ${
              thrustFilenameInput.id || "no-id"
            }`
          );
        }
      }
    }

    // Set the filename if we found an input element
    if (thrustFilenameInput) {
      console.log(`[OpenMission] Setting filename to: ${fileName}`);
      thrustFilenameInput.value = fileName;

      // Store the thrust time data for later use
      if (!window.thrustTimeData) {
        window.thrustTimeData = {};
      }

      const thrustTimeKey = `stage${stageUINumber}_motor${motorUINumber}`;
      window.thrustTimeData[thrustTimeKey] = motorData.thr_time;

      console.log(
        `[OpenMission] Stored thrust time data with ${motorData.thr_time.length} rows`
      );
    } else {
      console.error(
        `[OpenMission] Could not find any suitable input for thrust filename. All inputs:`,
        Array.from(form.querySelectorAll("input")).map((el) => ({
          id: el.id || "no-id",
          class: el.className,
          type: el.type,
          readOnly: el.readOnly,
        }))
      );
    }
  }

  // After populating, populate associated nozzle(s)
  if (motorData.nozzle) {
    console.log(
      `[OpenMission] Motor has nozzle reference: ${motorData.nozzle}`
    );
    // Nozzle population is now handled in populateDynamicMotorForm
  } else if (motorData.no_of_nozzles > 0) {
    console.log(`[OpenMission] Motor has ${motorData.no_of_nozzles} nozzles`);
    // Nozzle population is now handled in populateDynamicMotorForm
  }

  console.log(
    `[OpenMission] Populated motor ${motorUINumber} for stage ${stageUINumber}`
  );
}

// Function to populate nozzle data
function populateNozzleData(nozzleKey, stageUINumber, motorUINumber) {
  // Handle both array of nozzles or single nozzle key
  if (!nozzleKey) {
    console.error("[OpenMission] No nozzle key provided for population");
    return;
  }

  // Debug log - what data are we working with?
  console.log(
    `[OpenMission] Attempting to populate nozzle for stage ${stageUINumber}, motor ${motorUINumber}`
  );
  console.log(
    `[OpenMission] Nozzle key provided:`,
    typeof nozzleKey === "object" ? "Array of keys" : nozzleKey
  );

  const nozzleKeys = Array.isArray(nozzleKey) ? nozzleKey : [nozzleKey];

  for (let i = 0; i < nozzleKeys.length; i++) {
    const nozzleName = nozzleKeys[i];
    const nozzleData = window.finalMissionData[nozzleName];
    const nozzleUINumber = i + 1; // UI is 1-indexed

    // Debug what nozzle we're trying to populate
    console.log(
      `[OpenMission] Processing nozzle ${nozzleUINumber} (${nozzleName})`
    );

    if (!nozzleData) {
      console.warn(
        `[OpenMission] Nozzle data for '${nozzleName}' not found in finalMissionData. Available keys:`,
        Object.keys(window.finalMissionData).filter(
          (k) => k.includes("NOZ") || k.includes("Noz")
        )
      );
      continue;
    }

    // Debug the nozzle data we found
    console.log(
      `[OpenMission] Found nozzle data:`,
      JSON.stringify(nozzleData, null, 2)
    );

    // Try to find the nozzle form using multiple possible ID patterns
    let form = null;
    const possibleFormIds = [
      `stage${stageUINumber}-motor${motorUINumber}-nozzle${nozzleUINumber}-form`,
      `stage${stageUINumber}-motor${motorUINumber}-nozzle-form`,
      `motor${motorUINumber}-nozzle${nozzleUINumber}-form`,
    ];

    for (const formId of possibleFormIds) {
      form = document.getElementById(formId);
      if (form) {
        console.log(`[OpenMission] Found nozzle form with ID: ${formId}`);
        break;
      }
    }

    if (!form) {
      console.error(
        `[OpenMission] Could not find nozzle form for stage ${stageUINumber}, motor ${motorUINumber}, nozzle ${nozzleUINumber}`
      );
      console.log(`[OpenMission] Tried these form IDs:`, possibleFormIds);

      // Check if we need to create the nozzle form first
      const addNozzleBtn = document.querySelector(
        `#stage${stageUINumber}-motor${motorUINumber}-add-nozzle-btn`
      );
      if (addNozzleBtn) {
        console.log(
          `[OpenMission] Found Add Nozzle button, attempting to create nozzle form`
        );
        addNozzleBtn.click();

        // Wait a moment for the form to be created
        setTimeout(() => {
          // Try to find the form again
          for (const formId of possibleFormIds) {
            form = document.getElementById(formId);
            if (form) {
              console.log(
                `[OpenMission] Successfully created nozzle form with ID: ${formId}`
              );
              // Now populate it
              populateNozzleFormFields(
                form,
                nozzleData,
                stageUINumber,
                motorUINumber,
                nozzleUINumber
              );
              break;
            }
          }

          if (!form) {
            console.error(
              `[OpenMission] Failed to create nozzle form even after clicking Add Nozzle button`
            );
          }
        }, 500);
      } else {
        console.error(
          `[OpenMission] No Add Nozzle button found for stage ${stageUINumber}, motor ${motorUINumber}`
        );
      }

      continue;
    }

    // If we found the form, populate its fields
    populateNozzleFormFields(
      form,
      nozzleData,
      stageUINumber,
      motorUINumber,
      nozzleUINumber
    );
  }
}

// Helper function to populate nozzle form fields
function populateNozzleFormFields(
  form,
  nozzleData,
  stageUINumber,
  motorUINumber,
  nozzleUINumber
) {
  console.log(
    `[OpenMission] Populating nozzle form fields for stage ${stageUINumber}, motor ${motorUINumber}, nozzle ${nozzleUINumber}`
  );

  // Debug: Log the nozzle data structure
  console.log(
    `[OpenMission] Nozzle data structure:`,
    JSON.stringify(nozzleData, null, 2)
  );

  // Log all input fields in the form to aid debugging
  console.log(`[OpenMission] Form contains these inputs:`);
  const inputs = form.querySelectorAll("input");
  inputs.forEach((input) => {
    console.log(
      `- ${input.id || "no-id"}: placeholder="${
        input.placeholder || "no-placeholder"
      }", type=${input.type}, value="${input.value}"`
    );
  });

  // Helper function to find and set a field value
  const setFieldValue = (fieldSelectors, dataKeys, motorFallbackKeys = []) => {
    console.log(
      `[OpenMission] Trying to set field with selectors:`,
      fieldSelectors
    );
    console.log(`[OpenMission] Looking for data with keys:`, dataKeys);

    // Try each selector
    let input = null;
    for (const selector of fieldSelectors) {
      input = form.querySelector(selector);
      if (input) {
        console.log(`[OpenMission] Found input with selector: ${selector}`);
        break;
      }
    }

    if (!input) {
      console.warn(
        `[OpenMission] Could not find input using selectors: ${fieldSelectors.join(
          ", "
        )}`
      );
      return false;
    }

    // Try each data key from nozzle data first
    for (const key of dataKeys) {
      // Handle nested properties with dot notation
      const parts = key.split(".");
      let value = nozzleData;
      let found = true;

      for (const part of parts) {
        if (value && value[part] !== undefined) {
          value = value[part];
        } else {
          found = false;
          break;
        }
      }

      if (found && value !== undefined) {
        console.log(
          `[OpenMission] SUCCESS: Setting ${
            input.id || input.placeholder
          } to "${value}" using nozzle data key "${key}"`
        );
        input.value = value;
        return true;
      }
    }

    // If not found in nozzle data, try motor fallback keys
    if (motorFallbackKeys.length > 0) {
      console.log(
        `[OpenMission] Not found in nozzle data, trying motor fallback keys:`,
        motorFallbackKeys
      );

      // Try to get motor data from global mission data
      const motorFormId = `stage${stageUINumber}-motor${motorUINumber}-form`;
      const motorForm = document.getElementById(motorFormId);

      // Approach 1: Try to get value from motor form input
      if (motorForm) {
        console.log(
          `[OpenMission] Found motor form, trying to inherit from motor input field`
        );
        const motorNozzleDiameterInput = motorForm.querySelector(
          'input[placeholder="Enter Nozzle Diameter"]'
        );
        if (motorNozzleDiameterInput && motorNozzleDiameterInput.value) {
          console.log(
            `[OpenMission] SUCCESS: Inheriting nozzle diameter "${motorNozzleDiameterInput.value}" from motor form input`
          );
          input.value = motorNozzleDiameterInput.value;
          return true;
        }
      }

      // Approach 2: Try to get from motor data in global mission data
      console.log(
        `[OpenMission] Trying to find motor data to inherit nozzle diameter`
      );

      // Try to find motor data by scanning through global mission data
      if (window.finalMissionData) {
        const motorKeys = Object.keys(window.finalMissionData).filter(
          (key) =>
            (key.includes(`S${stageUINumber}`) ||
              key.includes(`Stage${stageUINumber}`) ||
              key.includes(`Stage_${stageUINumber}`)) &&
            (key.includes(`MOTOR${motorUINumber}`) ||
              key.includes(`M${motorUINumber}`) ||
              key.includes(`Motor${motorUINumber}`) ||
              key.includes(`Motor_${motorUINumber}`)) &&
            !key.includes("NOZ") &&
            !key.includes("Nozzle")
        );

        console.log(`[OpenMission] Found potential motor keys:`, motorKeys);

        for (const motorKey of motorKeys) {
          const motorData = window.finalMissionData[motorKey];
          if (motorData) {
            console.log(
              `[OpenMission] Checking motor data for ${motorKey}:`,
              motorData
            );

            for (const fallbackKey of motorFallbackKeys) {
              if (motorData[fallbackKey] !== undefined) {
                console.log(
                  `[OpenMission] SUCCESS: Setting ${
                    input.id || input.placeholder
                  } to "${
                    motorData[fallbackKey]
                  }" using motor data key "${fallbackKey}" from ${motorKey}`
                );
                input.value = motorData[fallbackKey];
                return true;
              }
            }
          }
        }
      }
    }

    console.warn(
      `[OpenMission] No matching data found for field with keys: ${dataKeys.join(
        ", "
      )} or motor fallback keys: ${motorFallbackKeys.join(", ")}`
    );
    return false;
  };

  // Try to populate each field with multiple possible selectors and keys
  console.log(`[OpenMission] === Starting field population ===`);

  // Nozzle diameter (inherited from motor) - FIXED TO INCLUDE MOTOR INHERITANCE
  console.log(`[OpenMission] Setting nozzle diameter...`);
  setFieldValue(
    [
      'input[placeholder="Enter nozzle diameter"]',
      "#nozzle-diameter",
      'input[id*="diameter"]',
    ],
    ["diameter", "nozzledia", "nozzle_diameter", "nozzle_dia"],
    ["nozzledia", "nozzle_diameter", "diameter"] // Motor fallback keys
  );

  // Eta Thrust
  console.log(`[OpenMission] Setting ETA thrust...`);
  setFieldValue(
    [
      'input[placeholder="Enter ETA thrust"]',
      "#eta-thrust",
      'input[id*="eta-thrust"]',
    ],
    ["eta_thrust", "eta", "ETA", "Orientation.eta"],
    [] // No motor fallback for this field
  );

  // Zeta Thrust
  console.log(`[OpenMission] Setting Zeta thrust...`);
  setFieldValue(
    [
      'input[placeholder="Enter Zeta thrust"]',
      "#zeta-thrust",
      'input[id*="zeta-thrust"]',
    ],
    ["zeta_thrust", "zeta", "ZETA", "Orientation.zeta"],
    [] // No motor fallback for this field
  );

  // Location - Radial Distance
  console.log(`[OpenMission] Setting radial distance...`);
  setFieldValue(
    [
      'input[placeholder="Enter radial distance"]',
      "#radial-distance",
      'input[id*="radial"]',
    ],
    [
      "Location.Radial_dist",
      "location_radial_distance",
      "radial_distance",
      "Radial_dist",
    ],
    [] // No motor fallback for this field
  );

  // Location - Phi
  console.log(`[OpenMission] Setting Phi value...`);
  setFieldValue(
    ['input[placeholder="Enter Phi value"]', "#phi-value", 'input[id*="phi"]'],
    ["Location.Phi", "location_phi", "phi", "PHI"],
    [] // No motor fallback for this field
  );

  // Miss Alignment - Sigma thrust
  console.log(`[OpenMission] Setting sigma thrust...`);
  setFieldValue(
    [
      'input[placeholder="Enter sigma thrust"]',
      "#sigma-thrust",
      'input[id*="sigma"]',
    ],
    [
      "mis_alignment.sigma_thrust",
      "miss_align_sigma",
      "sigma_thrust",
      "sigma",
      "misalignment.sigma",
    ],
    [] // No motor fallback for this field
  );

  // Miss Alignment - Thau/Tau thrust
  console.log(`[OpenMission] Setting thau/tau thrust...`);
  setFieldValue(
    [
      'input[placeholder="Enter thau thrust"]',
      'input[placeholder="Enter tau thrust"]',
      "#thau-thrust",
      "#tau-thrust",
    ],
    [
      "mis_alignment.tau_thrust",
      "mis_alignment.thau_thrust",
      "miss_align_thau",
      "miss_align_tau",
      "tau_thrust",
      "thau",
      "tau",
      "misalignment.tau",
      "misalignment.thau",
    ],
    [] // No motor fallback for this field
  );

  // Miss Alignment - Epsilon thrust
  console.log(`[OpenMission] Setting epsilon thrust...`);
  setFieldValue(
    [
      'input[placeholder="Enter epsilon thrust"]',
      "#epsilon-thrust",
      'input[id*="epsilon"]',
    ],
    [
      "mis_alignment.epsilon_thrust",
      "miss_align_epsilon",
      "epsilon_thrust",
      "epsilon",
      "misalignment.epsilon",
    ],
    [] // No motor fallback for this field
  );

  // Orientation - MU
  console.log(`[OpenMission] Setting MU value...`);
  setFieldValue(
    ['input[placeholder="Enter MU value"]', "#mu-value", 'input[id*="mu"]'],
    ["Orientation.mu", "orientation_mu", "mu", "MU"],
    [] // No motor fallback for this field
  );

  // Orientation - LAMDA (note the typo in the HTML)
  console.log(`[OpenMission] Setting LAMDA/LAMBDA value...`);
  setFieldValue(
    [
      'input[placeholder="Enter LAMDA value"]',
      'input[placeholder="Enter LAMBDA value"]',
      "#lambda-value",
      "#lamda-value",
    ],
    [
      "Orientation.lamda",
      "Orientation.lambda",
      "orientation_lambda",
      "lambda",
      "lamda",
      "LAMDA",
      "LAMBDA",
    ],
    [] // No motor fallback for this field
  );

  // Orientation - KAPPA
  console.log(`[OpenMission] Setting KAPPA value...`);
  setFieldValue(
    [
      'input[placeholder="Enter KAPPA value"]',
      "#kappa-value",
      'input[id*="kappa"]',
    ],
    ["Orientation.kappa", "orientation_kappa", "kappa", "KAPPA"],
    [] // No motor fallback for this field
  );

  // Throat Location - X
  console.log(`[OpenMission] Setting throat location X...`);
  setFieldValue(
    ['input[placeholder="Enter X value"]', "#throat-x", 'input[id*="x-value"]'],
    ["Throat_location.x", "throat_location_x", "x", "X"],
    [] // No motor fallback for this field
  );

  // Throat Location - Y
  console.log(`[OpenMission] Setting throat location Y...`);
  setFieldValue(
    ['input[placeholder="Enter Y value"]', "#throat-y", 'input[id*="y-value"]'],
    ["Throat_location.y", "throat_location_y", "y", "Y"],
    [] // No motor fallback for this field
  );

  // Throat Location - Z
  console.log(`[OpenMission] Setting throat location Z...`);
  setFieldValue(
    ['input[placeholder="Enter Z value"]', "#throat-z", 'input[id*="z-value"]'],
    ["Throat_location.z", "throat_location_z", "z", "Z"],
    [] // No motor fallback for this field
  );

  console.log(
    `[OpenMission] === Completed populating nozzle form for stage ${stageUINumber}, motor ${motorUINumber}, nozzle ${nozzleUINumber} ===`
  );
}

// Function to populate event sequence data
function populateEventSequence(loadedData, vehicleName) {
  const sequenceKey = vehicleName + "_Sequence";
  if (!loadedData[sequenceKey] || !Array.isArray(loadedData[sequenceKey])) {
    console.warn(
      `Event sequence data for '${sequenceKey}' not found or invalid.`
    );
    return;
  }

  const eventSequence = loadedData[sequenceKey];
  const eventSequenceContainer = document.getElementById(
    "event-sequence-container"
  );
  if (!eventSequenceContainer) {
    console.error("Event sequence container not found in the DOM.");
    return;
  }

  // Clear existing events first
  window.eventSequence = [];

  // Empty the event preview area
  const eventPreviewArea = document.getElementById("event-sequence-preview");
  if (eventPreviewArea) {
    eventPreviewArea.innerHTML = "";
  }

  // Register events in the global eventSequence array and update UI
  eventSequence.forEach((event) => {
    // Add to global event registry
    window.eventSequence.push({
      id: event.identity,
      trigger: event.trigger,
      value: event.value,
      reference: event.reference,
      comment: event.comment,
    });

    // Update UI preview
    if (eventPreviewArea) {
      const eventDiv = document.createElement("div");
      eventDiv.className = "event-item";
      eventDiv.innerHTML = `
        <span class="event-id">${event.identity}</span>
        <span class="event-trigger">${event.trigger}</span>
        <span class="event-value">${event.value}</span>
        <span class="event-reference">${event.reference || "none"}</span>
      `;
      eventPreviewArea.appendChild(eventDiv);
    }

    // Register in the global flag registry for dropdown selections
    if (window.flagRegistry) {
      // Determine event type from the id prefix
      let eventType = "event"; // Default
      if (event.identity.includes("_INI") || event.identity.includes("_SEP")) {
        eventType = "stage";
      } else if (
        event.identity.includes("_IGN") ||
        event.identity.includes("_Burnout") ||
        event.identity.includes("_CUTOFF")
      ) {
        eventType = "motor";
      } else if (event.identity.includes("HSS")) {
        eventType = "heatshield";
      } else if (event.identity.includes("STEER")) {
        eventType = "steering";
      }

      // Add to the appropriate registry
      if (window.flagRegistry[eventType]) {
        window.flagRegistry[eventType][event.identity] = event.identity;
      }
    }
  });

  console.log(
    `[OpenMission] Populated ${eventSequence.length} events in the sequence.`
  );
}

// Function to populate steering components data
function populateSteering(loadedData, vehicleName) {
  const steeringKey = vehicleName + "_Steering";
  if (
    !loadedData[steeringKey] ||
    !Array.isArray(loadedData[steeringKey].steering)
  ) {
    console.warn(`Steering data for '${steeringKey}' not found or invalid.`);
    return;
  }

  const steeringComponents = loadedData[steeringKey].steering;

  // Clear existing steering components first
  if (window.steeringState) {
    window.steeringState.activeComponents = [];
  }

  // Clear the steering components container
  const steeringComponentsContainer = document.getElementById(
    "steering-components-container"
  );
  if (steeringComponentsContainer) {
    steeringComponentsContainer.innerHTML = "";
  }

  // Add each steering component
  steeringComponents.forEach((componentKey) => {
    const componentData = loadedData[componentKey];
    if (!componentData) {
      console.warn(`Data for steering component '${componentKey}' not found.`);
      return;
    }

    // Add new steering component through UI
    const addSteeringComponentBtn = document.getElementById(
      "add-steering-component-btn"
    );
    if (addSteeringComponentBtn) {
      addSteeringComponentBtn.click();

      // Wait for the component to be created, then populate it
      setTimeout(() => {
        const componentIndex =
          window.steeringState?.activeComponents?.length - 1 || 0;
        populateSteeringComponent(componentData, componentKey, componentIndex);
      }, 200);
    }
  });

  console.log(
    `[OpenMission] Added ${steeringComponents.length} steering components.`
  );
}

function populateSteeringComponent(
  componentData,
  componentKey,
  componentIndex
) {
  if (
    !componentData ||
    !componentData.start ||
    !componentData.stop ||
    !componentData.steering
  ) {
    console.warn(`Steering component data invalid for ${componentKey}`);
    return;
  }

  // Get the tabs for this component
  const startTab = document.getElementById(
    `steering-component-${componentIndex}-start-tab`
  );
  const stopTab = document.getElementById(
    `steering-component-${componentIndex}-stop-tab`
  );
  const steeringTab = document.getElementById(
    `steering-component-${componentIndex}-steering-tab`
  );

  if (!startTab || !stopTab || !steeringTab) {
    console.warn(`Tabs for steering component ${componentIndex} not found`);
    return;
  }

  // 1. Populate Start tab
  startTab.click(); // Show start tab
  setTimeout(() => {
    const startForm = document.getElementById(
      `steering-component-${componentIndex}-start-form`
    );
    if (startForm) {
      const startIdInput = startForm.querySelector(
        'input[placeholder="Enter start Identity"]'
      );
      if (startIdInput) startIdInput.value = componentData.start.identity;

      const startTriggerSelect = startForm.querySelector(
        'select[id$="-start-trigger"]'
      );
      if (startTriggerSelect)
        startTriggerSelect.value = componentData.start.trigger;

      const startValueInput = startForm.querySelector(
        'input[placeholder="Enter start value"]'
      );
      if (startValueInput) startValueInput.value = componentData.start.value;

      const startReferenceSelect = startForm.querySelector(
        'select[id$="-start-reference"]'
      );
      if (startReferenceSelect && componentData.start.reference !== "none") {
        startReferenceSelect.value = componentData.start.reference;
      }
    }

    // 2. Populate Stop tab
    stopTab.click(); // Show stop tab
    setTimeout(() => {
      const stopForm = document.getElementById(
        `steering-component-${componentIndex}-stop-form`
      );
      if (stopForm) {
        const stopIdInput = stopForm.querySelector(
          'input[placeholder="Enter stop Identity"]'
        );
        if (stopIdInput) stopIdInput.value = componentData.stop.identity;

        const stopTriggerSelect = stopForm.querySelector(
          'select[id$="-stop-trigger"]'
        );
        if (stopTriggerSelect)
          stopTriggerSelect.value = componentData.stop.trigger;

        const stopValueInput = stopForm.querySelector(
          'input[placeholder="Enter stop value"]'
        );
        if (stopValueInput) stopValueInput.value = componentData.stop.value;

        const stopReferenceSelect = stopForm.querySelector(
          'select[id$="-stop-reference"]'
        );
        if (stopReferenceSelect && componentData.stop.reference !== "none") {
          stopReferenceSelect.value = componentData.stop.reference;
        }
      }

      // 3. Populate Steering tab
      steeringTab.click(); // Show steering tab
      setTimeout(() => {
        const steeringForm = document.getElementById(
          `steering-component-${componentIndex}-steering-form`
        );
        if (steeringForm) {
          const steeringTypeSelect = steeringForm.querySelector(
            'select[id$="-steering-type"]'
          );
          if (steeringTypeSelect) {
            steeringTypeSelect.value = componentData.steering.type;
            // Trigger change event to show relevant fields
            steeringTypeSelect.dispatchEvent(
              new Event("change", { bubbles: true })
            );

            // Wait for fields to update based on type
            setTimeout(() => {
              // Handle different types of steering
              switch (componentData.steering.type) {
                case "CONST_BODYRATE":
                  const axisSelect = steeringForm.querySelector(
                    'select[id$="-axis-select"]'
                  );
                  if (axisSelect)
                    axisSelect.value = componentData.steering.axis;

                  const rateValueInput = steeringForm.querySelector(
                    'input[id$="-rate-value"]'
                  );
                  if (rateValueInput)
                    rateValueInput.value = componentData.steering.value;
                  break;

                case "PROFILE":
                  const modeSelect = steeringForm.querySelector(
                    'select[id$="-mode-select"]'
                  );
                  if (modeSelect)
                    modeSelect.value = componentData.steering.mode;

                  const quantitySelect = steeringForm.querySelector(
                    'select[id$="-quantity-select"]'
                  );
                  if (quantitySelect)
                    quantitySelect.value = componentData.steering.quantity;

                  const indVarSelect = steeringForm.querySelector(
                    'select[id$="-indvar-select"]'
                  );
                  if (indVarSelect)
                    indVarSelect.value = componentData.steering.ind_variable;

                  // Handle profile data as CSV
                  if (
                    componentData.steering.value &&
                    Array.isArray(componentData.steering.value)
                  ) {
                    const profileCsvFilename = steeringForm.querySelector(
                      `#profile-csv-filename-${componentIndex}`
                    );
                    if (profileCsvFilename) {
                      profileCsvFilename.value = `${componentKey}_profile.csv`;

                      // Show clear button if it exists
                      const clearProfileBtn =
                        steeringForm.querySelector(".clear-profile-btn");
                      if (clearProfileBtn)
                        clearProfileBtn.style.display = "block";
                    }
                  }
                  break;

                case "ZERO_RATE":
                  // No additional fields for ZERO_RATE
                  break;

                // Add other steering types as needed
              }
            }, 200);
          }
        }
      }, 200);
    }, 200);
  }, 200);

  console.log(
    `[OpenMission] Populated steering component ${componentIndex} (${componentKey})`
  );
}

// Function to populate stopping condition data
function populateStoppingCondition(loadedData) {
  if (!loadedData.stopping_condition) return;

  const stoppingData = loadedData.stopping_condition;
  const stoppingForm = document.getElementById("stopping-condition-form");
  if (!stoppingForm) {
    console.warn("Stopping condition form not found.");
    return;
  }

  // Set stopping condition type
  const typeSelect = document.getElementById("stopping-condition-type");
  if (typeSelect && stoppingData.type) {
    typeSelect.value = stoppingData.type;
    typeSelect.dispatchEvent(new Event("change", { bubbles: true }));

    // Wait for type-specific fields
    setTimeout(() => {
      switch (stoppingData.type) {
        case "time":
          const timeInput = document.getElementById("max-time");
          if (timeInput && stoppingData.max_time !== undefined) {
            timeInput.value = stoppingData.max_time;
          }
          break;

        case "altitude":
          const altTypeSelect = document.getElementById(
            "altitude-condition-type"
          );
          if (altTypeSelect && stoppingData.condition) {
            altTypeSelect.value = stoppingData.condition;
          }

          const altValueInput = document.getElementById("altitude-value");
          if (altValueInput && stoppingData.value !== undefined) {
            altValueInput.value = stoppingData.value;
          }
          break;

        case "velocity":
          const velTypeSelect = document.getElementById(
            "velocity-condition-type"
          );
          if (velTypeSelect && stoppingData.condition) {
            velTypeSelect.value = stoppingData.condition;
          }

          const velValueInput = document.getElementById("velocity-value");
          if (velValueInput && stoppingData.value !== undefined) {
            velValueInput.value = stoppingData.value;
          }
          break;

        case "custom":
          const customEventSelect = document.getElementById(
            "custom-event-select"
          );
          if (customEventSelect && stoppingData.event) {
            customEventSelect.value = stoppingData.event;
          }
          break;
      }
    }, 200);
  }

  console.log(
    `[OpenMission] Populated stopping condition (${stoppingData.type})`
  );
}

// Functions for optimization data population

// Main function to handle all optimization data
function populateOptimization(loadedData) {
  if (
    !loadedData.optimization ||
    loadedData.mission.MODE?.toLowerCase() !== "optimization"
  ) {
    console.log(
      "No optimization data or not in optimization mode. Skipping optimization population."
    );
    return;
  }

  // Show the optimization section in UI
  const optimizationSection = document.getElementById("optimization-section");
  if (optimizationSection) {
    optimizationSection.classList.remove("hidden");
  }

  // Populate objective function
  populateObjectiveFunction(loadedData.optimization.objective_function);

  // Populate constraints
  populateConstraints(loadedData.optimization.constraints);

  // Populate mode settings
  populateOptimizationMode(loadedData.optimization.mode_settings);

  // Populate design variables
  populateDesignVariables(loadedData.optimization.design_variables);

  console.log("[OpenMission] Optimization data populated successfully.");
}

// Populate objective function section
function populateObjectiveFunction(objectiveData) {
  if (!objectiveData) return;

  const objFunctionContainer = document.getElementById(
    "objective-function-container"
  );
  if (!objFunctionContainer) {
    console.warn("Objective function container not found.");
    return;
  }

  // Find the objective function type selection and set it
  const objTypeSelect = document.getElementById("objective-type-select");
  if (objTypeSelect && objectiveData.type) {
    objTypeSelect.value = objectiveData.type;
    objTypeSelect.dispatchEvent(new Event("change", { bubbles: true }));

    // Wait for type-specific fields to be created
    setTimeout(() => {
      switch (objectiveData.type) {
        case "minimum":
        case "maximum":
          const quantitySelect = document.getElementById("obj-quantity-select");
          if (quantitySelect && objectiveData.quantity) {
            quantitySelect.value = objectiveData.quantity;
          }
          break;

        case "target":
          const targetQuantitySelect = document.getElementById(
            "target-quantity-select"
          );
          if (targetQuantitySelect && objectiveData.quantity) {
            targetQuantitySelect.value = objectiveData.quantity;
          }

          const targetValueInput =
            document.getElementById("target-value-input");
          if (targetValueInput && objectiveData.target_value !== undefined) {
            targetValueInput.value = objectiveData.target_value;
          }
          break;

        case "weighted_sum":
          // Populate each term in the weighted sum
          if (objectiveData.terms && Array.isArray(objectiveData.terms)) {
            objectiveData.terms.forEach((term, index) => {
              // Click add term button for each term except the first (which is created by default)
              if (index > 0) {
                const addTermBtn = document.getElementById(
                  "add-weighted-term-btn"
                );
                if (addTermBtn) {
                  addTermBtn.click();
                }
              }

              // Wait for term to be created
              setTimeout(() => {
                const weightInput = document.getElementById(
                  `weight-${index + 1}`
                );
                if (weightInput && term.weight !== undefined) {
                  weightInput.value = term.weight;
                }

                const quantitySelect = document.getElementById(
                  `quantity-${index + 1}`
                );
                if (quantitySelect && term.quantity) {
                  quantitySelect.value = term.quantity;
                }
              }, 200);
            });
          }
          break;
      }
    }, 200);
  }

  console.log(
    `[OpenMission] Populated objective function (${objectiveData.type})`
  );
}

// Populate constraints section
function populateConstraints(constraintsData) {
  if (!constraintsData || !Array.isArray(constraintsData)) return;

  const constraintsContainer = document.getElementById("constraints-container");
  if (!constraintsContainer) {
    console.warn("Constraints container not found.");
    return;
  }

  // Remove any default constraints first
  const existingConstraints =
    constraintsContainer.querySelectorAll(".constraint-item");
  existingConstraints.forEach((item) => item.remove());

  // Add each constraint
  constraintsData.forEach((constraint, index) => {
    const addConstraintBtn = document.getElementById("add-constraint-btn");
    if (addConstraintBtn) {
      addConstraintBtn.click();

      setTimeout(() => {
        const constraintType = document.getElementById(
          `constraint-type-${index}`
        );
        if (constraintType && constraint.type) {
          constraintType.value = constraint.type;
          constraintType.dispatchEvent(new Event("change", { bubbles: true }));

          setTimeout(() => {
            const quantitySelect = document.getElementById(
              `constraint-quantity-${index}`
            );
            if (quantitySelect && constraint.quantity) {
              quantitySelect.value = constraint.quantity;
            }

            // Handle different constraint types
            switch (constraint.type) {
              case "upper_bound":
              case "lower_bound":
                const boundValueInput = document.getElementById(
                  `bound-value-${index}`
                );
                if (boundValueInput && constraint.bound_value !== undefined) {
                  boundValueInput.value = constraint.bound_value;
                }
                break;

              case "range":
                const lowerBoundInput = document.getElementById(
                  `lower-bound-${index}`
                );
                if (lowerBoundInput && constraint.lower_bound !== undefined) {
                  lowerBoundInput.value = constraint.lower_bound;
                }

                const upperBoundInput = document.getElementById(
                  `upper-bound-${index}`
                );
                if (upperBoundInput && constraint.upper_bound !== undefined) {
                  upperBoundInput.value = constraint.upper_bound;
                }
                break;
            }
          }, 200);
        }
      }, 200);
    }
  });

  console.log(`[OpenMission] Populated ${constraintsData.length} constraints.`);
}

// Populate optimization mode settings
function populateOptimizationMode(modeData) {
  if (!modeData) return;

  const modeContainer = document.getElementById("optimization-mode-container");
  if (!modeContainer) {
    console.warn("Optimization mode container not found.");
    return;
  }

  // Find mode type select and set it
  const modeTypeSelect = document.getElementById("optimization-mode-select");
  if (modeTypeSelect && modeData.type) {
    modeTypeSelect.value = modeData.type;
    modeTypeSelect.dispatchEvent(new Event("change", { bubbles: true }));

    // Wait for type-specific fields to be created
    setTimeout(() => {
      switch (modeData.type) {
        case "gradient":
          const maxIterInput = document.getElementById("max-iterations");
          if (maxIterInput && modeData.max_iterations !== undefined) {
            maxIterInput.value = modeData.max_iterations;
          }

          const convergenceTolInput = document.getElementById(
            "convergence-tolerance"
          );
          if (
            convergenceTolInput &&
            modeData.convergence_tolerance !== undefined
          ) {
            convergenceTolInput.value = modeData.convergence_tolerance;
          }
          break;

        case "genetic":
          const populationSizeInput =
            document.getElementById("population-size");
          if (populationSizeInput && modeData.population_size !== undefined) {
            populationSizeInput.value = modeData.population_size;
          }

          const generationsInput = document.getElementById("generations");
          if (generationsInput && modeData.generations !== undefined) {
            generationsInput.value = modeData.generations;
          }

          const mutationRateInput = document.getElementById("mutation-rate");
          if (mutationRateInput && modeData.mutation_rate !== undefined) {
            mutationRateInput.value = modeData.mutation_rate;
          }
          break;

        // Add other optimization modes as needed
      }
    }, 200);
  }

  console.log(
    `[OpenMission] Populated optimization mode settings (${modeData.type})`
  );
}

// Populate design variables
function populateDesignVariables(designVarsData) {
  if (!designVarsData || !Array.isArray(designVarsData)) return;

  const designVarsContainer = document.getElementById(
    "design-variables-container"
  );
  if (!designVarsContainer) {
    console.warn("Design variables container not found.");
    return;
  }

  // Remove any default design variables first
  const existingVars = designVarsContainer.querySelectorAll(".design-var-item");
  existingVars.forEach((item) => item.remove());

  // Add each design variable
  designVarsData.forEach((designVar, index) => {
    const addDesignVarBtn = document.getElementById("add-design-var-btn");
    if (addDesignVarBtn) {
      addDesignVarBtn.click();

      setTimeout(() => {
        const nameInput = document.getElementById(`design-var-name-${index}`);
        if (nameInput && designVar.name) {
          nameInput.value = designVar.name;
        }

        const typeSelect = document.getElementById(`design-var-type-${index}`);
        if (typeSelect && designVar.type) {
          typeSelect.value = designVar.type;
          typeSelect.dispatchEvent(new Event("change", { bubbles: true }));

          // Wait for type-specific fields
          setTimeout(() => {
            const initialValueInput = document.getElementById(
              `initial-value-${index}`
            );
            if (initialValueInput && designVar.initial_value !== undefined) {
              initialValueInput.value = designVar.initial_value;
            }

            const lowerBoundInput = document.getElementById(
              `design-var-lower-${index}`
            );
            if (lowerBoundInput && designVar.lower_bound !== undefined) {
              lowerBoundInput.value = designVar.lower_bound;
            }

            const upperBoundInput = document.getElementById(
              `design-var-upper-${index}`
            );
            if (upperBoundInput && designVar.upper_bound !== undefined) {
              upperBoundInput.value = designVar.upper_bound;
            }

            // For steering variables, populate additional fields
            if (designVar.type === "steering") {
              const componentSelect = document.getElementById(
                `steering-component-${index}`
              );
              if (componentSelect && designVar.component) {
                componentSelect.value = designVar.component;
              }

              const parameterSelect = document.getElementById(
                `steering-parameter-${index}`
              );
              if (parameterSelect && designVar.parameter) {
                parameterSelect.value = designVar.parameter;
              }
            }
          }, 200);
        }
      }, 200);
    }
  });

  console.log(
    `[OpenMission] Populated ${designVarsData.length} design variables.`
  );
}

// Make sure this file is loaded after ui-navigation.js and missionDataHandler.js
// ... (rest of the file)

// Utility function to convert thrust time array data to CSV string
function convertThrustTimeToCSV(thrustTimeArray) {
  if (!thrustTimeArray || !Array.isArray(thrustTimeArray)) {
    console.error("[OpenMission] Invalid thrust time data for CSV conversion");
    return null;
  }

  // Assuming format is [[time, thrust, propellant_mass], [...], ...]
  let csvContent = "Time,Thrust,Propellant_Mass\n";

  thrustTimeArray.forEach((row) => {
    if (Array.isArray(row) && row.length >= 3) {
      csvContent += `${row[0]},${row[1]},${row[2]}\n`;
    }
  });

  return csvContent;
}

// Function to get a downloadable CSV blob from thrust time data
function getThrustTimeCSVBlob(stageNum, motorNum) {
  const thrustTimeKey = `stage${stageNum}_motor${motorNum}`;

  if (!window.thrustTimeData || !window.thrustTimeData[thrustTimeKey]) {
    console.error(
      `[OpenMission] No thrust time data available for ${thrustTimeKey}`
    );
    return null;
  }

  const csvContent = convertThrustTimeToCSV(
    window.thrustTimeData[thrustTimeKey]
  );
  if (!csvContent) return null;

  return new Blob([csvContent], { type: "text/csv" });
}

// Add an event listener to hook into any existing download handlers
document.addEventListener("DOMContentLoaded", () => {
  // Listen for custom events that might be triggered when user wants to download thrust data
  document.addEventListener("download-thrust-data", (event) => {
    const { stageNum, motorNum } = event.detail;
    if (stageNum && motorNum) {
      const blob = getThrustTimeCSVBlob(stageNum, motorNum);
      if (blob) {
        // Use the native download mechanism
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        const filename = `stage${stageNum}_motor${motorNum}_thrust.csv`;

        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();

        // Cleanup
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 0);
      }
    }
  });
});

// Add an event listener to integrate with form submission
document.addEventListener("DOMContentLoaded", () => {
  // Watch for form submissions and integrate our stored thrust time data
  document.addEventListener("submit", (event) => {
    // Only process if we have stored thrust time data
    if (!window.thrustTimeData) return;

    const form = event.target;

    // Check if it's a motor form
    if (form.id && form.id.match(/stage\d+-motor\d+-form/)) {
      const matches = form.id.match(/stage(\d+)-motor(\d+)-form/);
      if (matches && matches.length >= 3) {
        const stageNum = matches[1];
        const motorNum = matches[2];
        const thrustTimeKey = `stage${stageNum}_motor${motorNum}`;

        // Check if we have stored data for this motor
        if (window.thrustTimeData[thrustTimeKey]) {
          console.log(
            `[OpenMission] Adding stored thrust time data to form submission for ${thrustTimeKey}`
          );

          // Create a string representation of the thrust time data
          const thrustTimeString = JSON.stringify(
            window.thrustTimeData[thrustTimeKey]
          );

          // Create or update a hidden field to store this data
          let hiddenField = form.querySelector(
            'input[name="thrust_time_data"]'
          );
          if (!hiddenField) {
            hiddenField = document.createElement("input");
            hiddenField.type = "hidden";
            hiddenField.name = "thrust_time_data";
            form.appendChild(hiddenField);
          }

          hiddenField.value = thrustTimeString;
        }
      }
    }
  });

  // Also listen for custom events from the application when it needs thrust time data
  document.addEventListener("get-thrust-time-data", (event) => {
    const { stageNum, motorNum, callback } = event.detail;
    if (stageNum && motorNum && typeof callback === "function") {
      const thrustTimeKey = `stage${stageNum}_motor${motorNum}`;
      if (window.thrustTimeData && window.thrustTimeData[thrustTimeKey]) {
        callback(window.thrustTimeData[thrustTimeKey]);
      } else {
        callback(null);
      }
    }
  });

  console.log("[OpenMission] Thrust time data handlers initialized");
});

// Helper function to force the creation of a motor and nozzle using the global addMotorAndNozzle function
async function forceAddMotorAndNozzle(stageNumber, motorNumber) {
  console.log(
    `[OpenMission] Force adding motor and nozzle for stage ${stageNumber}, motor ${motorNumber}`
  );

  // Check if the function is available
  if (typeof window.addMotorAndNozzle !== "function") {
    console.error(
      `[OpenMission] addMotorAndNozzle function is not available globally`
    );
    return { success: false };
  }

  try {
    // Call the global function from ui-navigation.js
    const result = window.addMotorAndNozzle(`stage${stageNumber}`);

    if (result) {
      console.log(
        `[OpenMission] Successfully created motor and nozzle forms:`,
        result
      );

      // Wait a bit for the DOM to update
      await new Promise((resolve) => setTimeout(resolve, 500));

      return {
        success: true,
        motorForm: result.motorForm,
        nozzleForm: result.nozzleForm,
        motorCount: result.motorCount,
      };
    } else {
      console.error(`[OpenMission] addMotorAndNozzle returned no result`);
      return { success: false };
    }
  } catch (error) {
    console.error(
      `[OpenMission] Error in forceAddMotorAndNozzle: ${error.message}`
    );
    return { success: false };
  }
}

// Add a new function to more directly handle clicking the Add Motor button
