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

      // Display the loaded filename
      displayLoadedFilename(file.name);

      // Increase delay to ensure DOM is fully ready before populating forms
      setTimeout(() => {
        console.log(
          "[OpenMission] DOM reset complete, now populating forms..."
        );

        // Populate forms with loadedMissionData
        populateForms(loadedMissionData);
      }, 750); // Increased delay
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

function displayLoadedFilename(filename) {
  const filenameContainer = document.getElementById("loaded-mission-filename");
  const filenameText = document.getElementById("filename-text");
  const clearButton = document.getElementById("clear-mission-btn");

  if (filenameContainer && filenameText && clearButton) {
    // Set the filename text
    filenameText.textContent = filename;
    filenameText.title = filename; // Show full filename on hover

    // Show the filename container
    filenameContainer.style.display = "flex";

    // Set up clear button functionality if not already set
    if (!clearButton.hasAttribute("data-listener-added")) {
      clearButton.addEventListener("click", clearLoadedFilename);
      clearButton.setAttribute("data-listener-added", "true");
    }
  }
}

function clearLoadedFilename() {
  const filenameContainer = document.getElementById("loaded-mission-filename");
  const filenameText = document.getElementById("filename-text");

  if (filenameContainer && filenameText) {
    // Clear the filename text
    filenameText.textContent = "";
    filenameText.title = "";

    // Hide the filename container
    filenameContainer.style.display = "none";

    // Reset current mission state
    resetCurrentMissionState();

    // Show confirmation
    Swal.fire({
      title: "Mission Cleared",
      text: "The loaded mission has been cleared. You can now create a new mission or load a different one.",
      icon: "info",
      timer: 2000,
      showConfirmButton: false,
    }).then(() => {
      // Reload the page to fully reset all dynamic UI elements without breaking existing functionality
      window.location.reload();
    });
  }
}

function resetCurrentMissionState() {
  console.log("[OpenMission] Resetting current mission state...");

  // Hide filename display (unless called from clearLoadedFilename to avoid recursion)
  const caller = resetCurrentMissionState.caller;
  if (!caller || caller.name !== "clearLoadedFilename") {
    const filenameContainer = document.getElementById(
      "loaded-mission-filename"
    );
    if (filenameContainer) {
      filenameContainer.style.display = "none";
    }
  }

  // Clear all form fields
  const forms = document.querySelectorAll(
    "#mission-form, #environment-form, #vehicle-form"
  );
  forms.forEach((form) => {
    if (form) {
      form.reset();
    }
  });

  // Clear dynamic vehicle stages
  const stagesContainer = document.getElementById("stages-container");
  if (stagesContainer) {
    stagesContainer.innerHTML = "";
  }

  // Clear sidebar stage list
  const vehicleStagesList = document.getElementById("vehicle-stages");
  if (vehicleStagesList) {
    vehicleStagesList.innerHTML = "";
  }

  // Clear event sequence
  const eventSequenceContainer = document.getElementById(
    "eventSequenceContainer"
  );
  if (eventSequenceContainer) {
    eventSequenceContainer.innerHTML = "";
  }

  // Reset stage counter in openMission and UI navigation
  if (window.stageCount !== undefined) {
    window.stageCount = 0;
  }
  if (window.uiNav && typeof window.uiNav.resetStageCounter === "function") {
    window.uiNav.resetStageCounter();
  }

  // Clear steering components properly
  const activeComponentsList = document.getElementById(
    "steering-config-content"
  );
  const configPlaceholder = document.getElementById(
    "steering-config-placeholder"
  );
  const currentConfigTitleSpan = document.querySelector(
    "#current-config-title span"
  );

  if (activeComponentsList) activeComponentsList.classList.add("hidden");
  if (configPlaceholder) configPlaceholder.classList.remove("hidden");
  if (currentConfigTitleSpan) currentConfigTitleSpan.textContent = "";

  // Reset component counters
  const componentTypes = [
    "verticalAscend",
    "pitchHold",
    "constantPitch",
    "gravityTurn",
    "profile",
    "coasting",
  ];
  componentTypes.forEach((type) => {
    if (typeof updateComponentCounter === "function") {
      updateComponentCounter(type);
    }
  });

  // Clear steering sequence dropdown
  const sequenceSelect = document.getElementById("sequence");
  if (sequenceSelect) {
    sequenceSelect.value = "";
  }

  // Clear optimization forms
  const optimizationForms = document.querySelectorAll(
    "#objective-function-form, #constraints-form, #optimization-mode-form"
  );
  optimizationForms.forEach((form) => {
    if (form) {
      form.reset();
    }
  });

  // Clear optimization containers
  const optimizationContainers = ["constraints-container"];
  optimizationContainers.forEach((id) => {
    const container = document.getElementById(id);
    if (container) {
      container.innerHTML = "";
    }
  });

  // Clear stopping condition form
  const stoppingConditionForm = document.getElementById(
    "stopping-condition-form"
  );
  if (stoppingConditionForm) {
    stoppingConditionForm.reset();
  }

  // Reset global variables
  if (window.constraintCount !== undefined) {
    window.constraintCount = 0;
  }

  console.log("[OpenMission] Mission state reset complete");
}

function populateForms(loadedData) {
  console.log(
    "[OpenMission] Starting sequential form population with loadedData:",
    JSON.stringify(loadedData, null, 2)
  );
  window.finalMissionData = loadedData; // Make loaded data globally accessible

  // Show loading screen with progress tracking
  showSequentialLoadingScreen();

  // Sequential loading with proper order and timing
  sequentialFormPopulation(loadedData);
}

// Function to show the sequential loading screen
function showSequentialLoadingScreen() {
  const loadingHTML = `
    <div id="sequential-loading-overlay" style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    ">
      <div style="
        background: #2c3e50;
        padding: 40px;
        border-radius: 10px;
        color: white;
        text-align: center;
        min-width: 400px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      ">
        <h2 style="margin-bottom: 30px; color: #3498db;">Loading Mission Data</h2>
        <div id="loading-progress-container" style="text-align: left;">
          <div class="loading-step" data-step="flags">
            <span class="step-icon">⏳</span>
            <span class="step-text">Initializing Event Flags...</span>
          </div>
          <div class="loading-step" data-step="mission">
            <span class="step-icon">⏳</span>
            <span class="step-text">Loading Mission Details...</span>
          </div>
          <div class="loading-step" data-step="environment">
            <span class="step-icon">⏳</span>
            <span class="step-text">Loading Environment Configuration...</span>
          </div>
          <div class="loading-step" data-step="vehicle">
            <span class="step-icon">⏳</span>
            <span class="step-text">Loading Vehicle Configuration...</span>
          </div>
          <div class="loading-step" data-step="stages">
            <span class="step-icon">⏳</span>
            <span class="step-text">Loading Stages and Motors...</span>
          </div>
          <div class="loading-step" data-step="sequence">
            <span class="step-icon">⏳</span>
            <span class="step-text">Loading Event Sequence...</span>
          </div>
          <div class="loading-step" data-step="steering">
            <span class="step-icon">⏳</span>
            <span class="step-text">Loading Steering Components...</span>
          </div>
          <div class="loading-step" data-step="optimization" style="display: none;">
            <span class="step-icon">⏳</span>
            <span class="step-text">Loading Optimization Configuration...</span>
          </div>
          <div class="loading-step" data-step="stopping">
            <span class="step-icon">⏳</span>
            <span class="step-text">Loading Stopping Conditions...</span>
          </div>
          <div class="loading-step" data-step="finalization">
            <span class="step-icon">⏳</span>
            <span class="step-text">Finalizing Configuration...</span>
          </div>
        </div>
        <div style="margin-top: 20px; font-size: 14px; color: #bdc3c7;">
          Please wait while your mission data is being loaded...
        </div>
      </div>
    </div>
    <style>
      .loading-step {
        display: flex;
        align-items: center;
        margin: 10px 0;
        padding: 8px;
        border-radius: 5px;
        transition: background-color 0.3s;
      }
      .loading-step.active {
        background-color: rgba(52, 152, 219, 0.2);
        border-left: 3px solid #3498db;
      }
      .loading-step.completed {
        background-color: rgba(46, 204, 113, 0.2);
        border-left: 3px solid #2ecc71;
      }
      .step-icon {
        margin-right: 10px;
        font-size: 16px;
        min-width: 20px;
      }
      .step-text {
        font-size: 14px;
      }
    </style>
  `;

  // Add to body
  document.body.insertAdjacentHTML("beforeend", loadingHTML);
}

// Function to update loading step status
function updateLoadingStep(stepName, status) {
  const step = document.querySelector(`[data-step="${stepName}"]`);
  if (!step) return;

  const icon = step.querySelector(".step-icon");
  const text = step.querySelector(".step-text");

  step.classList.remove("active", "completed");

  switch (status) {
    case "loading":
      step.classList.add("active");
      icon.textContent = "⏳";
      break;
    case "completed":
      step.classList.add("completed");
      icon.textContent = "✅";
      break;
    case "error":
      icon.textContent = "❌";
      step.style.borderLeft = "3px solid #e74c3c";
      step.style.backgroundColor = "rgba(231, 76, 60, 0.2)";
      break;
  }
}

// Function to hide loading screen
function hideSequentialLoadingScreen() {
  const overlay = document.getElementById("sequential-loading-overlay");
  if (overlay) {
    overlay.remove();
  }
}

// Main sequential form population function
async function sequentialFormPopulation(loadedData) {
  try {
    // Step 1: Initialize Event Flags
    updateLoadingStep("flags", "loading");
    await initializeEventFlags(loadedData);
    updateLoadingStep("flags", "completed");
    await delay(300);

    // Step 2: Mission Details
    updateLoadingStep("mission", "loading");
    await populateMissionDetailsSequential(loadedData.mission);
    updateLoadingStep("mission", "completed");
    await delay(300);

    // Step 3: Environment
    updateLoadingStep("environment", "loading");
    await populateEnvironmentSequential(loadedData);
    updateLoadingStep("environment", "completed");
    await delay(300);

    // Step 4: Vehicle Configuration
    updateLoadingStep("vehicle", "loading");
    const vehicleData = await populateVehicleSequential(loadedData);
    updateLoadingStep("vehicle", "completed");
    await delay(300);

    // Step 5: Stages and Motors
    if (vehicleData.success) {
      updateLoadingStep("stages", "loading");
      await populateStagesAndMotorsSequential(
        loadedData,
        vehicleData.vehicleName,
        vehicleData.vehicleData
      );
      updateLoadingStep("stages", "completed");
      await delay(500);
    } else {
      updateLoadingStep("stages", "completed"); // Skip if no vehicle data
      await delay(300);
    }

    // Step 6: Event Sequence
    updateLoadingStep("sequence", "loading");
    if (vehicleData.success) {
      await populateEventSequenceSequential(
        loadedData,
        vehicleData.vehicleName
      );
    }
    updateLoadingStep("sequence", "completed");
    await delay(300);

    // Step 7: Steering Components
    updateLoadingStep("steering", "loading");
    if (vehicleData.success) {
      await populateSteeringSequential(loadedData, vehicleData.vehicleName);
    }
    updateLoadingStep("steering", "completed");
    await delay(500);

    // Step 8: Optimization (if applicable)
    const isOptimizationMode =
      loadedData.mission.MODE?.toLowerCase() === "optimization";
    if (isOptimizationMode) {
      document.querySelector('[data-step="optimization"]').style.display =
        "flex";
      updateLoadingStep("optimization", "loading");
      await populateOptimizationSequential(loadedData);
      updateLoadingStep("optimization", "completed");
      await delay(500);
    }

    // Step 9: Stopping Conditions
    updateLoadingStep("stopping", "loading");
    await populateStoppingConditionsSequential(loadedData);
    updateLoadingStep("stopping", "completed");
    await delay(300);

    // Step 10: Finalization
    updateLoadingStep("finalization", "loading");
    await finalizationSequential();
    updateLoadingStep("finalization", "completed");
    await delay(500);

    // Hide loading screen and show success
    hideSequentialLoadingScreen();

    // Navigate to mission details form after successful load
    const missionFormElement = document.getElementById("mission-form");
    if (
      window.uiNav &&
      typeof window.uiNav.showForm === "function" &&
      missionFormElement
    ) {
      window.uiNav.showForm(missionFormElement);
      console.log("[OpenMission] Navigated to Mission Details form.");
    }

    Swal.fire(
      "Success!",
      "Mission data loaded and forms populated successfully!",
      "success"
    );

    console.log(
      "[OpenMission] Sequential form population completed successfully."
    );
  } catch (error) {
    console.error("[OpenMission] Error during sequential population:", error);
    updateLoadingStep("finalization", "error");

    setTimeout(() => {
      hideSequentialLoadingScreen();
      Swal.fire("Error", `Failed to populate forms: ${error.message}`, "error");
    }, 1000);
  }
}

// Helper function for delays
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Sequential population helper functions
async function initializeEventFlags(loadedData) {
  // Seed eventSequence from JSON based on loaded vehicle key
  const missionVehicles = loadedData.mission && loadedData.mission.vehicle;
  if (Array.isArray(missionVehicles) && missionVehicles.length > 0) {
    const vehicleName = missionVehicles[0];
    const seqKey = `${vehicleName}_Sequence`;
    if (Array.isArray(loadedData[seqKey])) {
      window.eventSequence = loadedData[seqKey].map((evt) => ({
        flag: evt.identity,
        triggerType: mapTriggerType(evt.trigger),
        triggerValue: evt.value,
        referenceFlag: evt.reference || "none",
        comment: evt.comment || "",
      }));
      console.log(
        "[OpenMission] Seeded window.eventSequence from JSON:",
        window.eventSequence
      );

      // Update dropdowns immediately with seeded flags
      if (typeof updateReferenceFlagDropdown === "function") {
        updateReferenceFlagDropdown();
      }
      if (typeof populateStoppingFlagDropdown === "function") {
        populateStoppingFlagDropdown();
      }
    } else {
      console.warn(`[OpenMission] No sequence array found under key ${seqKey}`);
    }
  } else {
    console.warn(
      "[OpenMission] No mission.vehicle array found in loadedData.mission"
    );
  }
}

async function populateMissionDetailsSequential(missionData) {
  return new Promise((resolve) => {
    populateMissionDetails(missionData);
    resolve();
  });
}

async function populateEnvironmentSequential(environmentData) {
  return new Promise((resolve) => {
    populateEnvironment(environmentData);
    resolve();
  });
}

async function populateVehicleSequential(loadedData) {
  return new Promise((resolve) => {
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
      resolve({
        success: true,
        vehicleName,
        vehicleData,
        vehicleType,
        initialConditionData,
      });
    } else {
      console.warn(
        "[OpenMission] Could not find all necessary vehicle data to populate vehicle form."
      );
      resolve({ success: false });
    }
  });
}

async function populateStagesAndMotorsSequential(
  loadedData,
  vehicleName,
  vehicleData
) {
  return new Promise((resolve) => {
    if (vehicleData && vehicleName) {
      // Use the existing populateStagesAndMotors function but wait for completion
      populateStagesAndMotors(loadedData, vehicleName, vehicleData)
        .then(() => resolve())
        .catch((error) => {
          console.error("Error in populateStagesAndMotors:", error);
          resolve(); // Continue even if there's an error
        });
    } else {
      resolve();
    }
  });
}

async function populateEventSequenceSequential(loadedData, vehicleName) {
  return new Promise((resolve) => {
    const sequenceKey = vehicleName + "_Sequence";
    if (loadedData[sequenceKey]) {
      populateEventSequence(loadedData, vehicleName);
    }
    resolve();
  });
}

async function populateSteeringSequential(loadedData, vehicleName) {
  return new Promise((resolve) => {
    populateSteering(loadedData, vehicleName);
    // Add extra delay to ensure steering components are fully loaded
    setTimeout(() => {
      resolve();
    }, 1000);
  });
}

async function populateOptimizationSequential(loadedData) {
  return new Promise((resolve) => {
    if (loadedData.optimization) {
      // Populate optimization data but NOT design variables yet
      populateOptimizationWithoutDesignVariables(loadedData);
      // Add delay to ensure optimization forms are populated and steering components are loaded
      setTimeout(() => {
        // Explicitly refresh design variable segment dropdowns after all steering is loaded
        if (
          typeof window.optimizationHandler
            ?.refreshAllDesignVariableSegmentDropdowns === "function"
        ) {
          window.optimizationHandler.refreshAllDesignVariableSegmentDropdowns();
          console.log(
            "[OpenMission] Triggered refresh of design variable segment dropdowns."
          );
        }

        // Now populate design variables after steering components are fully loaded
        if (loadedData.design_variables) {
          setTimeout(() => {
            populateDesignVariables(loadedData);
            console.log("[OpenMission] Design variables population completed");
            resolve();
          }, 500);
        } else {
          resolve();
        }
      }, 1500); // Increased delay to 1.5 seconds to allow steering components to be fully loaded
    } else {
      resolve();
    }
  });
}

async function populateStoppingConditionsSequential(loadedData) {
  return new Promise((resolve) => {
    const mode = loadedData.mission.MODE?.toLowerCase() || "simulation";
    if (mode === "simulation" && loadedData.stopping_criteria) {
      populateSimulationStopping(loadedData.stopping_criteria);
    }
    if (mode === "optimization" && loadedData.stopping_criteria) {
      // For optimization mode, create a compatible structure for populateStoppingCondition
      const stoppingConditionData = {
        stopping_condition: loadedData.stopping_criteria,
      };
      populateStoppingCondition(stoppingConditionData);
    }
    resolve();
  });
}

async function finalizationSequential() {
  return new Promise((resolve) => {
    // Final refresh of flag dropdowns
    if (typeof updateReferenceFlagDropdown === "function") {
      updateReferenceFlagDropdown();
    }
    if (typeof populateStoppingFlagDropdown === "function") {
      populateStoppingFlagDropdown();
    }

    // Final refresh of design variable dropdowns
    if (
      typeof window.optimizationHandler
        ?.refreshAllDesignVariableSegmentDropdowns === "function"
    ) {
      window.optimizationHandler.refreshAllDesignVariableSegmentDropdowns();
    }

    resolve();
  });
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

// Function to populate simulation-mode stopping condition fields
function populateSimulationStopping(stoppingData) {
  if (!stoppingData) return;
  // Store stopping condition data globally so navigation restore logic can use it
  window.stoppingConditionData = {
    flagValue: stoppingData.flag_name,
    timeValue: stoppingData.value,
    altitudeValue: stoppingData.value,
    condition: stoppingData.condition,
    type: stoppingData.type,
  };
  const typeValue = stoppingData.type.toLowerCase();
  const radio = document.querySelector(
    `input[name="stopping-criteria"][value="${typeValue}"]`
  );
  if (radio) {
    radio.checked = true;
    radio.dispatchEvent(new Event("change", { bubbles: true }));
    console.log(`[OpenMission] Selected stopping criteria radio: ${typeValue}`);
    setTimeout(() => {
      if (typeValue === "flag") {
        const flagSelect = document.getElementById("flag-name");
        if (flagSelect) {
          if (
            ![...flagSelect.options].some(
              (opt) => opt.value === stoppingData.flag_name
            )
          ) {
            const newOpt = document.createElement("option");
            newOpt.value = stoppingData.flag_name;
            newOpt.textContent = stoppingData.flag_name;
            flagSelect.appendChild(newOpt);
          }
          flagSelect.value = stoppingData.flag_name;
          console.log(
            `[OpenMission] Set stopping flag: ${stoppingData.flag_name}`
          );
        }
        const valueInput = document.getElementById("flag-value");
        if (valueInput) {
          valueInput.value = stoppingData.value;
          console.log(`[OpenMission] Set flag value: ${stoppingData.value}`);
        }
        const condSelect = document.getElementById("flag-condition");
        if (condSelect) {
          condSelect.value = stoppingData.condition.toLowerCase();
          console.log(
            `[OpenMission] Set flag condition: ${stoppingData.condition.toLowerCase()}`
          );
        }
      } else if (typeValue === "time") {
        const timeVal = document.getElementById("time-value");
        if (timeVal) timeVal.value = stoppingData.value;
        const timeCond = document.getElementById("time-condition");
        if (timeCond) timeCond.value = stoppingData.condition.toLowerCase();
      } else if (typeValue === "altitude") {
        const altVal = document.getElementById("altitude-value");
        if (altVal) altVal.value = stoppingData.value;
        const altCond = document.getElementById("altitude-condition");
        if (altCond) altCond.value = stoppingData.condition.toLowerCase();
      }
    }, 100);
  } else {
    console.warn(
      `[OpenMission] Stopping criteria radio not found for type: ${typeValue}`
    );
  }
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
  // PLF separation fields removed - duplicate of sequence functionality
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

    // PLF separation population removed - handled by sequence functionality
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

  // Clear existing events first
  if (window.eventSequence) {
    window.eventSequence = [];
  } else {
    window.eventSequence = [];
  }

  // Clear the event list in the UI
  const eventList = document.getElementById("event-list");
  if (eventList) {
    eventList.innerHTML = "";
  }

  // Convert each event from JSON format to the format expected by addEventToSequence
  eventSequence.forEach((event) => {
    // Map JSON format to the expected format
    const eventData = {
      flag: event.identity,
      triggerType: mapTriggerType(event.trigger),
      triggerValue: event.value,
      referenceFlag: event.reference || "none",
      comment: event.comment || "",
    };

    // Use the existing addEventToSequence function to add the event
    addEventToSequence(eventData);

    // Register in the global flag registry for dropdown selections
    if (window.flagRegistry) {
      // Determine event type from the identity prefix
      let eventType = "stages"; // Default
      if (event.identity.includes("_INI") || event.identity.includes("_SEP")) {
        eventType = "stages";
      } else if (
        event.identity.includes("_IGN") ||
        event.identity.includes("_Burnout") ||
        event.identity.includes("_CUTOFF")
      ) {
        eventType = "motors";
      } else if (event.identity.includes("HSS")) {
        eventType = "heatShieldFlags";
      } else if (event.identity.includes("STEER")) {
        eventType = "steering";
      }

      // Add to the appropriate registry if it exists
      if (window.flagRegistry[eventType]) {
        if (Array.isArray(window.flagRegistry[eventType])) {
          // For arrays (like motors, heatShieldFlags)
          if (!window.flagRegistry[eventType].includes(event.identity)) {
            window.flagRegistry[eventType].push(event.identity);
          }
        } else if (typeof window.flagRegistry[eventType] === "object") {
          // For objects (like stages)
          window.flagRegistry[eventType][event.identity] = event.identity;
        }
      }
    }
  });

  console.log(
    `[OpenMission] Populated ${eventSequence.length} events in the sequence.`
  );

  // Update dropdowns and other dependent components
  updateReferenceFlagDropdown();
  populateStoppingFlagDropdown();

  // Dispatch sequence updated event to notify other components
  document.dispatchEvent(new CustomEvent("sequenceUpdated"));
}

// Helper function to map trigger types from JSON format to UI format
function mapTriggerType(trigger) {
  switch (trigger) {
    case "MISSION_TIME":
      return "mission-time";
    case "PHASE_TIME":
      return "phase-time";
    case "ALTITUDE":
      return "altitude";
    default:
      console.warn(
        `Unknown trigger type: ${trigger}, defaulting to mission-time`
      );
      return "mission-time";
  }
}

// Function to populate steering components data
function populateSteering(loadedData, vehicleName) {
  console.log(
    `[OpenMission] Starting steering population for vehicle: ${vehicleName}`
  );

  const steeringKey = vehicleName + "_Steering";
  const steeringMainData = loadedData[steeringKey];

  if (!steeringMainData) {
    console.warn(`Steering data for '${steeringKey}' not found.`);
    return;
  }

  // 1. Set the steering sequence first
  if (steeringMainData.Steering_Sequence) {
    const sequenceSelect = document.getElementById("sequence");
    if (sequenceSelect) {
      sequenceSelect.value = steeringMainData.Steering_Sequence;
      console.log(
        `[OpenMission] Set steering sequence to: ${steeringMainData.Steering_Sequence}`
      );
    }
  }

  // 2. Get the list of steering components to load
  const steeringComponents = steeringMainData.steering;
  if (!Array.isArray(steeringComponents)) {
    console.warn(
      `Steering components list not found or invalid in '${steeringKey}'.`
    );
    return;
  }

  console.log(
    `[OpenMission] Found ${steeringComponents.length} steering components to populate:`,
    steeringComponents
  );

  // 3. Clear existing components properly - remove all at once
  const activeComponentsList = document.getElementById(
    "active-components-list"
  );
  if (activeComponentsList) {
    // Clear the UI list
    activeComponentsList.innerHTML = "";

    // Clear the state
    if (window.steeringState) {
      window.steeringState.activeComponents = {};
      window.steeringState.selectedComponentId = null;

      // Hide configuration panel
      const configContentArea = document.getElementById(
        "steering-config-content"
      );
      const configPlaceholder = document.getElementById(
        "steering-config-placeholder"
      );
      const currentConfigTitleSpan = document.querySelector(
        "#current-config-title span"
      );

      if (configContentArea) configContentArea.classList.add("hidden");
      if (configPlaceholder) configPlaceholder.classList.remove("hidden");
      if (currentConfigTitleSpan) currentConfigTitleSpan.textContent = "";
    }

    // Reset component counters
    const componentTypes = [
      "verticalAscend",
      "pitchHold",
      "constantPitch",
      "gravityTurn",
      "profile",
      "coasting",
    ];
    componentTypes.forEach((type) => {
      if (typeof updateComponentCounter === "function") {
        updateComponentCounter(type);
      }
    });

    console.log(`[OpenMission] Cleared all existing steering components`);
  }

  // 4. Process each steering component with proper delays
  let componentIndex = 0;
  const processNextComponent = () => {
    if (componentIndex >= steeringComponents.length) {
      console.log(
        `[OpenMission] Completed steering population for all ${steeringComponents.length} components.`
      );
      return;
    }

    const componentKey = steeringComponents[componentIndex];
    const componentData = loadedData[componentKey];

    if (!componentData) {
      console.warn(
        `Data for steering component '${componentKey}' not found in loaded data.`
      );
      componentIndex++;
      setTimeout(processNextComponent, 100);
      return;
    }

    console.log(
      `[OpenMission] Processing component ${componentIndex + 1}/${
        steeringComponents.length
      }: ${componentKey}`
    );
    populateSteeringComponent(componentData, componentKey, () => {
      componentIndex++;
      setTimeout(processNextComponent, 500); // Wait between components
    });
  };

  // Start processing the first component
  setTimeout(processNextComponent, 300);
}

function populateSteeringComponent(componentData, componentKey, callback) {
  console.log(
    `[OpenMission] Populating steering component: ${componentKey}`,
    componentData
  );

  if (
    !componentData ||
    !componentData.start ||
    !componentData.stop ||
    !componentData.steering
  ) {
    console.warn(`Invalid steering component data for ${componentKey}`);
    if (callback) callback();
    return;
  }

  // 1. Determine the component type from the key name
  const componentType = deriveSteeringComponentType(componentKey);
  if (!componentType) {
    console.warn(`Could not determine component type for ${componentKey}`);
    if (callback) callback();
    return;
  }

  // 2. Add the component using the steering module's function
  if (typeof addSteeringComponent === "function") {
    console.log(
      `[OpenMission] Adding steering component of type: ${componentType.type}`
    );
    addSteeringComponent(componentType.type, componentType.displayName);

    // 3. Wait for component to be created and DOM to update
    setTimeout(() => {
      // Get the most recently added component ID
      const componentIds = Object.keys(window.steeringState.activeComponents);
      const latestComponentId = componentIds[componentIds.length - 1];

      if (
        latestComponentId &&
        window.steeringState.activeComponents[latestComponentId]
      ) {
        console.log(
          `[OpenMission] Found component ${latestComponentId}, populating data from ${componentKey}`
        );

        // Populate the component data first
        populateSteeringComponentData(
          latestComponentId,
          componentData,
          componentKey,
          callback
        );
      } else {
        console.error(`Could not find component after adding: ${componentKey}`);
        if (callback) callback();
      }
    }, 300);
  } else {
    console.error("addSteeringComponent function not available");
    if (callback) callback();
  }
}

function deriveSteeringComponentType(componentKey) {
  // Map component keys to their types and display names
  const typeMapping = {
    Vertical_Ascend: { type: "verticalAscend", displayName: "Vertical Ascend" },
    Pitch_Hold: { type: "pitchHold", displayName: "Pitch Hold" },
    Constant_Pitch: {
      type: "constantPitch",
      displayName: "Constant Pitch Rate",
    },
    Gravity_Turn: { type: "gravityTurn", displayName: "Gravity Turn" },
    Profile: { type: "profile", displayName: "Profile" },
    Coasting: { type: "coasting", displayName: "Coasting" },
  };

  // Extract the base type from the component key (remove _1, _2, etc.)
  const baseKey = componentKey.replace(/_\d+$/, "");

  return typeMapping[baseKey] || null;
}

function populateSteeringComponentData(
  componentId,
  componentData,
  componentKey,
  callback
) {
  console.log(
    `[OpenMission] Populating data for component ${componentId}:`,
    componentData
  );

  const component = window.steeringState.activeComponents[componentId];
  if (!component) {
    console.error(`Component ${componentId} not found in active components`);
    if (callback) callback();
    return;
  }

  // 1. Populate Start Configuration
  if (componentData.start) {
    component.config.start_identity = componentData.start.identity || "";
    component.config.start_trigger_type = mapTriggerTypeToUI(
      componentData.start.trigger
    );
    // Ensure trigger value is properly converted to string for UI display
    component.config.start_trigger_value =
      componentData.start.value !== null &&
      componentData.start.value !== undefined
        ? String(componentData.start.value)
        : "";
    component.config.start_reference = componentData.start.reference || "none";
    component.config.start_comment =
      cleanComment(componentData.start.comment) || "";

    console.log(
      `[OpenMission] Start config - trigger: ${component.config.start_trigger_type}, value: ${component.config.start_trigger_value}, reference: ${component.config.start_reference}`
    );
  }

  // 2. Populate Stop Configuration
  if (componentData.stop) {
    component.config.stop_identity = componentData.stop.identity || "";
    component.config.stop_trigger_type = mapTriggerTypeToUI(
      componentData.stop.trigger
    );
    // Ensure trigger value is properly converted to string for UI display
    component.config.stop_trigger_value =
      componentData.stop.value !== null &&
      componentData.stop.value !== undefined
        ? String(componentData.stop.value)
        : "";
    component.config.stop_reference = componentData.stop.reference || "none";
    component.config.stop_comment =
      cleanComment(componentData.stop.comment) || "";

    console.log(
      `[OpenMission] Stop config - trigger: ${component.config.stop_trigger_type}, value: ${component.config.stop_trigger_value}, reference: ${component.config.stop_reference}`
    );
  }

  // 3. Populate Steering Configuration
  if (componentData.steering) {
    component.config.steering_type = mapSteeringTypeToUI(
      componentData.steering.type
    );
    component.config.steering_comment =
      cleanComment(componentData.steering.comment) || "";

    // Handle steering parameters based on type
    const params = parseSteeringParams(componentData.steering);
    component.config.steering_params = params;

    // For profile type, also set the CSV data directly in the config
    if (
      component.config.steering_type === "profile" &&
      params.profile_csv_filename
    ) {
      component.config.profile_csv_filename = params.profile_csv_filename;
      component.config.profile_csv_data = params.profile_data;
      console.log(
        `[OpenMission] Set profile CSV data for component ${componentId}: ${params.profile_csv_filename}`
      );
    }

    console.log(
      `[OpenMission] Steering config - type: ${component.config.steering_type}, params:`,
      component.config.steering_params
    );
  }

  // 4. Mark as saved and not dirty
  component.config.isSaved = true;
  component.config.isDirty = false;

  // 5. Select the component and populate the UI fields
  if (typeof selectSteeringComponent === "function") {
    selectSteeringComponent(componentId);

    // 6. Wait for UI to update, then populate fields
    setTimeout(() => {
      populateSteeringUIFields(componentId, componentData);

      // 7. Call callback after a short delay
      setTimeout(() => {
        if (callback) callback();
      }, 200);
    }, 400);
  } else {
    if (callback) callback();
  }

  console.log(
    `[OpenMission] Successfully configured component ${componentId} with data from ${componentKey}`
  );
}

function populateSteeringUIFields(componentId, componentData) {
  console.log(
    `[OpenMission] Populating UI fields for component ${componentId}`
  );

  const component = window.steeringState.activeComponents[componentId];
  if (!component) {
    console.error(`Component ${componentId} not found for UI population`);
    return;
  }

  // First, update reference dropdowns to ensure options are available
  if (typeof updateSteeringReferenceDropdowns === "function") {
    updateSteeringReferenceDropdowns();
  }

  // Helper function to set field value safely with better selector handling
  const setFieldValue = (selector, value, addOptionIfMissing = false) => {
    // Try multiple selector approaches for better compatibility
    const selectors = [
      selector,
      `#steering-config-content ${selector}`,
      `.steering-configuration ${selector}`,
    ];

    let field = null;
    for (const sel of selectors) {
      field = document.querySelector(sel);
      if (field) break;
    }

    if (field) {
      const displayValue =
        value === null || value === undefined ? "" : String(value);

      // For select fields, check if option exists and add if missing
      if (field.tagName === "SELECT" && displayValue && addOptionIfMissing) {
        const optionExists = Array.from(field.options).some(
          (option) => option.value === displayValue
        );

        if (!optionExists) {
          console.log(
            `[OpenMission] Adding missing option "${displayValue}" to ${selector}`
          );
          const newOption = document.createElement("option");
          newOption.value = displayValue;
          newOption.textContent = displayValue;
          field.appendChild(newOption);
        }
      }

      field.value = displayValue;

      // Trigger change event for dropdowns
      if (field.tagName === "SELECT") {
        field.dispatchEvent(new Event("change", { bubbles: true }));
      }

      console.log(`[OpenMission] Set ${selector} = "${displayValue}"`);
      return true;
    } else {
      console.warn(
        `[OpenMission] Field not found with any selector for: ${selector}`
      );
      return false;
    }
  };

  // Use a small delay to ensure reference dropdowns are fully populated
  setTimeout(() => {
    // 1. Populate Start Tab Fields
    console.log(`[OpenMission] Populating start tab fields`);
    setFieldValue(
      '[data-field="start_identity"]',
      component.config.start_identity
    );
    setFieldValue(
      '[data-field="start_trigger_type"]',
      component.config.start_trigger_type
    );
    setFieldValue(
      '[data-field="start_trigger_value"]',
      component.config.start_trigger_value
    );
    setFieldValue(
      '[data-field="start_reference"]',
      component.config.start_reference,
      true // Add option if missing
    );
    setFieldValue(
      '[data-field="start_comment"]',
      component.config.start_comment
    );

    // 2. Populate Stop Tab Fields
    console.log(`[OpenMission] Populating stop tab fields`);
    setFieldValue(
      '[data-field="stop_identity"]',
      component.config.stop_identity
    );
    setFieldValue(
      '[data-field="stop_trigger_type"]',
      component.config.stop_trigger_type
    );
    setFieldValue(
      '[data-field="stop_trigger_value"]',
      component.config.stop_trigger_value
    );
    setFieldValue(
      '[data-field="stop_reference"]',
      component.config.stop_reference,
      true // Add option if missing
    );
    setFieldValue('[data-field="stop_comment"]', component.config.stop_comment);

    // 3. Populate Steering Tab Fields
    console.log(`[OpenMission] Populating steering tab fields`);
    const steeringTypeSet = setFieldValue(
      '[data-field="steering_type"]',
      component.config.steering_type
    );
    setFieldValue(
      '[data-field="steering_comment"]',
      component.config.steering_comment
    );

    // 4. Wait for dynamic steering fields to be generated, then populate them
    if (steeringTypeSet && component.config.steering_type) {
      setTimeout(() => {
        populateSteeringParameters(
          component.config.steering_type,
          component.config.steering_params
        );
      }, 300);
    }
  }, 100); // Small delay to ensure dropdown population is complete
}

function populateSteeringParameters(steeringType, params) {
  console.log(
    `[OpenMission] Populating steering parameters for type ${steeringType}:`,
    params
  );

  if (!params || Object.keys(params).length === 0) {
    console.log(`[OpenMission] No parameters to populate for ${steeringType}`);
    return;
  }

  // Helper function to set parameter field value
  const setParamValue = (paramName, value) => {
    const field = document.querySelector(`[data-param="${paramName}"]`);
    if (field) {
      field.value = value || "";
      if (field.tagName === "SELECT") {
        field.dispatchEvent(new Event("change", { bubbles: true }));
      }
      console.log(`[OpenMission] Set parameter ${paramName} = "${value}"`);
      return true;
    } else {
      console.warn(`[OpenMission] Parameter field not found: ${paramName}`);
      return false;
    }
  };

  // Populate parameters based on steering type
  switch (steeringType) {
    case "constantBodyRate":
      setParamValue("axis", params.axis);
      setParamValue("value", params.value);
      break;

    case "clg":
      setParamValue("algorithm", params.algorithm);
      if (params.algorithm) {
        // Wait for CLG sub-fields to be generated
        setTimeout(() => {
          setParamValue("max_qaoa", params.max_qaoa);
          setParamValue("alpha_time", params.alpha_time);
          setParamValue("pitch_gain", params.pitch_gain);
          setParamValue("yaw_gain", params.yaw_gain);
        }, 200);
      }
      break;

    case "profile":
      setParamValue("mode", params.mode);
      setParamValue("quantity", params.quantity);
      setParamValue("independentVar", params.independentVar);

      // The CSV file UI state is handled by populateAndValidatePanel in steering-module.js
      // We just need to ensure the component's config has the CSV data, which is done in populateSteeringComponentData
      console.log(
        `[OpenMission] Profile steering parameters set. CSV handling delegated to steering-module.js`
      );
      break;

    case "zeroRate":
      // No additional parameters for zero rate
      console.log(`[OpenMission] Zero rate type has no additional parameters`);
      break;

    default:
      console.warn(
        `[OpenMission] Unknown steering type for parameter population: ${steeringType}`
      );
  }
}

function mapTriggerTypeToUI(jsonTrigger) {
  // Map JSON trigger types to UI dropdown values - these should match the HTML option values
  const triggerMapping = {
    MISSION_TIME: "MISSION_TIME",
    PHASE_TIME: "PHASE_TIME",
    PROFILE_TIME: "PROFILE_TIME",
    ALTITUDE: "altitude",
  };

  const result = triggerMapping[jsonTrigger] || jsonTrigger || "";
  console.log(`[OpenMission] Mapped trigger ${jsonTrigger} -> ${result}`);
  return result;
}

function mapSteeringTypeToUI(jsonSteeringType) {
  // Map JSON steering types to UI dropdown values
  const steeringMapping = {
    ZERO_RATE: "zeroRate",
    CONST_BODYRATE: "constantBodyRate",
    CLG: "clg",
    PROFILE: "profile",
  };

  const result =
    steeringMapping[jsonSteeringType] || jsonSteeringType?.toLowerCase() || "";
  console.log(
    `[OpenMission] Mapped steering type ${jsonSteeringType} -> ${result}`
  );
  return result;
}

function parseSteeringParams(steeringData) {
  const params = {};

  switch (steeringData.type) {
    case "ZERO_RATE":
      // Zero rate has no additional parameters
      break;

    case "CONST_BODYRATE":
      if (steeringData.axis) {
        params.axis = steeringData.axis.toLowerCase(); // Convert to lowercase to match dropdown
      }
      if (steeringData.value !== undefined) {
        params.value = steeringData.value;
      }
      break;

    case "CLG":
      // Handle CLG parameters if present
      if (steeringData.algorithm) {
        params.algorithm = steeringData.algorithm;
      }
      if (steeringData.max_qaoa !== undefined) {
        params.max_qaoa = steeringData.max_qaoa;
      }
      if (steeringData.alpha_time !== undefined) {
        params.alpha_time = steeringData.alpha_time;
      }
      if (steeringData.pitch_gain !== undefined) {
        params.pitch_gain = steeringData.pitch_gain;
      }
      if (steeringData.yaw_gain !== undefined) {
        params.yaw_gain = steeringData.yaw_gain;
      }
      break;

    case "PROFILE":
      if (steeringData.mode) {
        params.mode = steeringData.mode.toLowerCase(); // Convert to lowercase to match dropdown
      }
      if (steeringData.quantity) {
        // Map quantity to UI dropdown values
        const quantityMapping = {
          EULER_RATE: "EULER_RATE",
          BODY_RATE: "BODY_RATE",
          QUATERNION: "QUATERNION",
          EULER_ANGLE: "EULER_ANGLE",
          BODY_ANGLE: "BODY_ANGLE",
        };
        params.quantity =
          quantityMapping[steeringData.quantity] ||
          steeringData.quantity.toLowerCase();
      }
      if (steeringData.ind_variable) {
        params.independentVar = mapIndependentVariable(
          steeringData.ind_variable
        );
      }

      // Handle profile data based on mode
      let csvContent = "";
      let profileData = null;

      if (steeringData.mode && steeringData.mode.toLowerCase() === "step") {
        // Handle step mode: separate arrays for Time, Roll, Yaw, Pitch
        console.log(`[OpenMission] Processing step mode profile data`);

        if (steeringData.Time && Array.isArray(steeringData.Time)) {
          // Build CSV content from separate arrays
          const timeArray = steeringData.Time;
          const rollArray = steeringData.Roll || [];
          const yawArray = steeringData.Yaw || [];
          const pitchArray = steeringData.Pitch || [];

          // Create header row
          const headers = ["Time", "ROLL", "YAW", "PITCH"];
          const csvRows = [headers];

          // Create data rows (Time array length determines number of rows)
          // Note: Pitch array is usually one element shorter than Time array
          for (let i = 0; i < timeArray.length; i++) {
            const row = [
              timeArray[i],
              rollArray[i] !== undefined ? rollArray[i] : 0,
              yawArray[i] !== undefined ? yawArray[i] : 0,
              pitchArray[i] !== undefined
                ? pitchArray[i]
                : pitchArray[i - 1] !== undefined
                ? pitchArray[i - 1]
                : 0,
            ];
            csvRows.push(row);
          }

          profileData = csvRows;
          csvContent = convertProfileArrayToCSV(csvRows);
          console.log(`[OpenMission] Step mode CSV content created:`, csvRows);
        }
      } else {
        // Handle normal mode: 2D array structure in "value" field
        console.log(`[OpenMission] Processing normal mode profile data`);

        if (steeringData.value && Array.isArray(steeringData.value)) {
          profileData = steeringData.value;
          csvContent = convertProfileArrayToCSV(steeringData.value);
          console.log(
            `[OpenMission] Normal mode CSV content created from value array`
          );
        }
      }

      // Create CSV blob if we have profile data
      if (profileData && csvContent) {
        params.profile_data = profileData;
        const csvBlob = new Blob([csvContent], { type: "text/csv" });

        // Create a filename based on the component and mode
        const mode = steeringData.mode || "normal";
        params.profile_csv_filename = `profile_${mode}_data.csv`;

        // Store the blob as a File-like object for later use
        params.profile_csv = csvBlob;

        console.log(
          `[OpenMission] Profile CSV blob created: ${params.profile_csv_filename}`
        );
      } else {
        console.warn(
          `[OpenMission] No valid profile data found for CSV creation`
        );
      }
      break;
  }

  console.log(
    `[OpenMission] Parsed steering params for ${steeringData.type}:`,
    params
  );
  return params;
}

function mapIndependentVariable(jsonIndVar) {
  // Map JSON independent variable types to UI dropdown values - these should match the HTML option values
  const indVarMapping = {
    PHASE_TIME: "PHASE_TIME",
    PROFILE_TIME: "PROFILE_TIME",
    MISSION_TIME: "MISSION_TIME",
  };

  return indVarMapping[jsonIndVar] || jsonIndVar || "";
}

function convertProfileArrayToCSV(profileArray) {
  if (!Array.isArray(profileArray) || profileArray.length === 0) {
    return "";
  }

  // Convert array to CSV string
  return profileArray
    .map((row) => {
      if (Array.isArray(row)) {
        return row.join(",");
      }
      return String(row);
    })
    .join("\n");
}

function cleanComment(comment) {
  if (!comment) return "";

  // Remove the JSON formatting artifacts from comments
  return comment
    .replace(/^\s*"comment"\s*:\s*"/, "") // Remove opening JSON
    .replace(/"\s*$/, "") // Remove closing quote
    .replace(/\\"/g, '"') // Unescape quotes
    .trim();
}

// Function to populate stopping condition data for optimization mode
function populateStoppingCondition(loadedData) {
  if (!loadedData.stopping_condition) return;

  const stoppingData = loadedData.stopping_condition;
  console.log(
    "[OpenMission] Populating optimization stopping condition:",
    stoppingData
  );

  // Store stopping condition data globally so navigation restore logic can use it
  window.stoppingConditionData = {
    flagValue: stoppingData.flag_name,
    timeValue: stoppingData.value,
    altitudeValue: stoppingData.value,
    condition: stoppingData.condition,
    type: stoppingData.type,
  };

  // Convert optimization format to simulation format and populate the simulation form
  const typeValue = stoppingData.type.toLowerCase();
  const radio = document.querySelector(
    `input[name="stopping-criteria"][value="${typeValue}"]`
  );

  if (radio) {
    radio.checked = true;
    radio.dispatchEvent(new Event("change", { bubbles: true }));
    console.log(`[OpenMission] Selected stopping criteria radio: ${typeValue}`);

    setTimeout(() => {
      if (typeValue === "flag") {
        const flagSelect = document.getElementById("flag-name");
        if (flagSelect) {
          // Ensure the flag exists in the dropdown
          if (
            ![...flagSelect.options].some(
              (opt) => opt.value === stoppingData.flag_name
            )
          ) {
            const newOpt = document.createElement("option");
            newOpt.value = stoppingData.flag_name;
            newOpt.textContent = stoppingData.flag_name;
            flagSelect.appendChild(newOpt);
          }
          flagSelect.value = stoppingData.flag_name;
          console.log(
            `[OpenMission] Set stopping flag: ${stoppingData.flag_name}`
          );
        }

        const valueInput = document.getElementById("flag-value");
        if (valueInput) {
          valueInput.value = stoppingData.value;
          console.log(`[OpenMission] Set flag value: ${stoppingData.value}`);
        }

        const condSelect = document.getElementById("flag-condition");
        if (condSelect) {
          condSelect.value = stoppingData.condition.toLowerCase();
          console.log(
            `[OpenMission] Set flag condition: ${stoppingData.condition.toLowerCase()}`
          );
        }
      } else if (typeValue === "time") {
        const timeVal = document.getElementById("time-value");
        if (timeVal) timeVal.value = stoppingData.value;
        const timeCond = document.getElementById("time-condition");
        if (timeCond) timeCond.value = stoppingData.condition.toLowerCase();
      } else if (typeValue === "altitude") {
        const altVal = document.getElementById("altitude-value");
        if (altVal) altVal.value = stoppingData.value;
        const altCond = document.getElementById("altitude-condition");
        if (altCond) altCond.value = stoppingData.condition.toLowerCase();
      }
    }, 100);
  } else {
    console.warn(
      `[OpenMission] Stopping criteria radio not found for type: ${typeValue}`
    );
  }

  console.log(
    `[OpenMission] Populated stopping condition (${stoppingData.type})`
  );
}

// Functions for optimization data population

// Main function to handle all optimization data
function populateOptimization(loadedData) {
  if (
    !loadedData ||
    loadedData.mission?.MODE?.toLowerCase() !== "optimization"
  ) {
    console.log(
      "[OpenMission] No optimization data or not in optimization mode. Skipping optimization population."
    );
    return;
  }

  console.log("[OpenMission] Starting optimization data population");

  // Show the optimization section in UI by updating sidebar
  const modesSelect = document.getElementById("modes");
  if (modesSelect) {
    modesSelect.value = "optimization";
    modesSelect.dispatchEvent(new Event("change", { bubbles: true }));
  }

  // Extract optimization-related data from the loaded JSON
  // The structure is different from what the existing functions expect
  // First extract objective and constraints from the optimization array
  if (loadedData.optimization && Array.isArray(loadedData.optimization)) {
    // Find objectives (entries with type: "OBJECTIVE")
    const objectives = loadedData.optimization.filter(
      (item) => item.type === "OBJECTIVE"
    );

    // Find constraints (entries without type: "OBJECTIVE")
    const constraints = loadedData.optimization.filter(
      (item) => item.type !== "OBJECTIVE"
    );

    console.log(
      `[OpenMission] Found ${objectives.length} objectives and ${constraints.length} constraints`
    );

    // Populate objective function with objectives
    if (objectives.length > 0) {
      populateObjectiveFunctionFromArray(objectives);
    }

    // Populate constraints with constraints array and tolerances
    if (constraints.length > 0) {
      populateConstraintsFromArray(
        constraints,
        loadedData.constraint_tolerence
      );
    }
  }

  // Populate mode settings with mode, map, population, optimizer, etc.
  populateOptimizationModeSettings(loadedData);

  // Populate design variables
  if (loadedData.design_variables) {
    populateDesignVariables(loadedData);
  }

  console.log("[OpenMission] Optimization data population completed");
}

// New function that populates optimization data without design variables
function populateOptimizationWithoutDesignVariables(loadedData) {
  if (
    !loadedData ||
    loadedData.mission?.MODE?.toLowerCase() !== "optimization"
  ) {
    console.log(
      "[OpenMission] No optimization data or not in optimization mode. Skipping optimization population."
    );
    return;
  }

  console.log(
    "[OpenMission] Starting optimization data population (without design variables)"
  );

  // Show the optimization section in UI by updating sidebar
  const modesSelect = document.getElementById("modes");
  if (modesSelect) {
    modesSelect.value = "optimization";
    modesSelect.dispatchEvent(new Event("change", { bubbles: true }));
  }

  // Extract optimization-related data from the loaded JSON
  // The structure is different from what the existing functions expect
  // First extract objective and constraints from the optimization array
  if (loadedData.optimization && Array.isArray(loadedData.optimization)) {
    // Find objectives (entries with type: "OBJECTIVE")
    const objectives = loadedData.optimization.filter(
      (item) => item.type === "OBJECTIVE"
    );

    // Find constraints (entries without type: "OBJECTIVE")
    const constraints = loadedData.optimization.filter(
      (item) => item.type !== "OBJECTIVE"
    );

    console.log(
      `[OpenMission] Found ${objectives.length} objectives and ${constraints.length} constraints`
    );

    // Populate objective function with objectives
    if (objectives.length > 0) {
      populateObjectiveFunctionFromArray(objectives);
    }

    // Populate constraints with constraints array and tolerances
    if (constraints.length > 0) {
      populateConstraintsFromArray(
        constraints,
        loadedData.constraint_tolerence
      );
    }
  }

  // Populate mode settings with mode, map, population, optimizer, etc.
  populateOptimizationModeSettings(loadedData);

  // NOTE: Design variables are NOT populated here - they will be populated later
  // after steering components are fully loaded

  console.log(
    "[OpenMission] Optimization data population completed (design variables will be populated later)"
  );
}

// Populate objective function from array format
function populateObjectiveFunctionFromArray(objectivesArray) {
  if (
    !objectivesArray ||
    !Array.isArray(objectivesArray) ||
    objectivesArray.length === 0
  ) {
    console.warn("[OpenMission] No objective function data to populate");
    return;
  }

  console.log(
    "[OpenMission] Populating objective function from array:",
    objectivesArray
  );

  // Get the objective function container
  const objFunctionContainer = document.getElementById(
    "objective-function-container"
  );
  if (!objFunctionContainer) {
    console.warn("[OpenMission] Objective function container not found");
    return;
  }

  // Debug: List all forms available before we start
  const existingFormsBefore = document.querySelectorAll(
    '.objective-form, [id^="objective-form"], .optimization-instance'
  );
  console.log(
    `[OpenMission] Found ${existingFormsBefore.length} objective forms before population:`,
    Array.from(existingFormsBefore).map((f) => ({
      id: f.id,
      class: f.className,
    }))
  );

  // Debug: Directly query for specific form elements that should exist by default
  for (let i = 1; i <= 2; i++) {
    // Try both ID patterns
    const formById = document.getElementById(`objective-form-${i}`);
    const nameSelectById = document.getElementById(`objective-name-${i}`);
    const flagSelectById = document.getElementById(`objective-flag-${i}`);
    const factorSelectById = document.getElementById(`objective-factor-${i}`);

    console.log(`[OpenMission] Direct element check for form ${i}:`, {
      formFound: !!formById,
      nameSelectFound: !!nameSelectById,
      flagSelectFound: !!flagSelectById,
      factorSelectFound: !!factorSelectById,
    });
  }

  // Since there should already be 2 forms present, let's try to populate them directly
  // without adding or removing forms

  // Get the maximum number of objectives to populate (up to 2)
  const maxObjectives = Math.min(objectivesArray.length, 2);

  // For each objective, try to populate the corresponding form
  for (let i = 0; i < maxObjectives; i++) {
    const objective = objectivesArray[i];
    const formIndex = i + 1; // Form indices are 1-based in the HTML

    console.log(
      `[OpenMission] Attempting to populate objective ${formIndex} with:`,
      objective
    );

    // Try to find the form by direct ID first, then by class/position
    let form = document.getElementById(`objective-form-${formIndex}`);

    // If not found by ID, try finding by class
    if (!form) {
      const allForms = document.querySelectorAll(
        ".objective-form, .optimization-instance"
      );
      if (allForms.length > i) {
        form = allForms[i];
        console.log(`[OpenMission] Form found by class selector at index ${i}`);
      }
    }

    if (!form) {
      console.warn(
        `[OpenMission] Could not find objective form ${formIndex} to populate`
      );
      continue;
    }

    console.log(`[OpenMission] Found form for objective ${formIndex}:`, {
      id: form.id,
      class: form.className,
    });

    // Now try to find the name select element in this form
    let nameSelect = document.getElementById(`objective-name-${formIndex}`);
    if (!nameSelect) {
      nameSelect = form.querySelector(".objective-name-select");
    }
    if (!nameSelect) {
      nameSelect = form.querySelector('select[id^="objective-name"]');
    }

    if (nameSelect && objective.name) {
      console.log(`[OpenMission] Found name select:`, {
        id: nameSelect.id,
        options: nameSelect.options.length,
      });

      // Check if the option exists, if not add it
      if (
        ![...nameSelect.options].some((opt) => opt.value === objective.name)
      ) {
        const newOpt = document.createElement("option");
        newOpt.value = objective.name;
        newOpt.textContent = objective.name;
        nameSelect.appendChild(newOpt);
        console.log(`[OpenMission] Added option for ${objective.name}`);
      }

      // Set the value and trigger change
      nameSelect.value = objective.name;
      nameSelect.dispatchEvent(new Event("change", { bubbles: true }));
      console.log(`[OpenMission] Set name select to ${objective.name}`);
    } else {
      console.warn(
        `[OpenMission] Could not find name select for objective ${formIndex}`
      );
    }

    // Find and set the flag select
    let flagSelect = document.getElementById(`objective-flag-${formIndex}`);
    if (!flagSelect) {
      flagSelect = form.querySelector(".objective-flag-select");
    }
    if (!flagSelect) {
      flagSelect = form.querySelector('select[id^="objective-flag"]');
    }

    if (flagSelect && objective.flag) {
      console.log(`[OpenMission] Found flag select:`, {
        id: flagSelect.id,
        options: flagSelect.options.length,
      });

      // Ensure flag option exists
      if (
        ![...flagSelect.options].some((opt) => opt.value === objective.flag)
      ) {
        const newOpt = document.createElement("option");
        newOpt.value = objective.flag;
        newOpt.textContent = objective.flag;
        flagSelect.appendChild(newOpt);
        console.log(`[OpenMission] Added flag option for ${objective.flag}`);
      }

      // Set value and trigger change
      flagSelect.value = objective.flag;
      flagSelect.dispatchEvent(new Event("change", { bubbles: true }));
      console.log(`[OpenMission] Set flag select to ${objective.flag}`);
    } else {
      console.warn(
        `[OpenMission] Could not find flag select for objective ${formIndex}`
      );
    }

    // Find and set the factor select
    let factorSelect = document.getElementById(`objective-factor-${formIndex}`);
    if (!factorSelect) {
      factorSelect = form.querySelector(".objective-factor-select");
    }
    if (!factorSelect) {
      factorSelect = form.querySelector('select[id^="objective-factor"]');
    }

    if (factorSelect && objective.factor !== undefined) {
      console.log(`[OpenMission] Found factor select:`, {
        id: factorSelect.id,
        options: factorSelect.options.length,
      });

      // Convert the factor to the expected value in the dropdown
      // According to HTML, +1 is "Minimize", -1 is "Maximize"
      const factorValue = objective.factor > 0 ? "+1" : "-1";

      // Set the value and trigger change
      factorSelect.value = factorValue;
      factorSelect.dispatchEvent(new Event("change", { bubbles: true }));
      console.log(
        `[OpenMission] Set factor select to ${factorValue} (${
          objective.factor > 0 ? "Minimize" : "Maximize"
        })`
      );
    } else {
      console.warn(
        `[OpenMission] Could not find factor select for objective ${formIndex}`
      );
    }

    // Final log of form state after population
    console.log(`[OpenMission] Objective ${formIndex} population complete`);
  }

  // Debug: Check forms after population
  const existingFormsAfter = document.querySelectorAll(
    '.objective-form, [id^="objective-form"], .optimization-instance'
  );
  console.log(
    `[OpenMission] Found ${existingFormsAfter.length} objective forms after population`
  );
}

// Populate constraints from array format
function populateConstraintsFromArray(constraintsArray, tolerancesArray) {
  if (
    !constraintsArray ||
    !Array.isArray(constraintsArray) ||
    constraintsArray.length === 0
  ) {
    console.warn("[OpenMission] No constraints data to populate");
    return;
  }

  console.log(
    "[OpenMission] Populating constraints from array:",
    constraintsArray
  );

  // Find the constraints container and add button
  const constraintsContainer = document.getElementById("constraints-container");
  const addConstraintBtn = document.getElementById("add-constraint-btn");

  if (!constraintsContainer || !addConstraintBtn) {
    console.warn("[OpenMission] Constraints container or add button not found");
    return;
  }

  // Clear existing constraints first
  const existingConstraints =
    constraintsContainer.querySelectorAll(".constraint-item");
  existingConstraints.forEach((item) => {
    if (item.parentNode) {
      item.parentNode.removeChild(item);
    }
  });

  // Add each constraint
  constraintsArray.forEach((constraint, index) => {
    console.log(`[OpenMission] Adding constraint ${index + 1}:`, constraint);

    // Click to add a new constraint instance
    addConstraintBtn.click();

    // Wait for the constraint to be created and populated
    setTimeout(() => {
      // Find the constraint instance (might have different selectors depending on implementation)
      const instances = constraintsContainer.querySelectorAll(
        ".constraint-item, .optimization-instance"
      );
      const instance = instances[index];

      if (!instance) {
        console.warn(
          `[OpenMission] Constraint instance ${index + 1} not found`
        );
        return;
      }

      // Set constraint name
      const nameSelect = instance.querySelector(".constraint-name");
      if (nameSelect && constraint.name) {
        // Ensure the option exists in the dropdown
        if (
          ![...nameSelect.options].some((opt) => opt.value === constraint.name)
        ) {
          const newOpt = document.createElement("option");
          newOpt.value = constraint.name;
          newOpt.textContent = constraint.name;
          nameSelect.appendChild(newOpt);
        }
        nameSelect.value = constraint.name;
        nameSelect.dispatchEvent(new Event("change", { bubbles: true }));
      }

      // Set constraint type (EQUALITY/INEQUALITY)
      const typeSelect = instance.querySelector(".constraint-type");
      if (typeSelect && constraint.type) {
        typeSelect.value = constraint.type;
        typeSelect.dispatchEvent(new Event("change", { bubbles: true }));
      }

      // Set condition (LESS_THAN/GREATER_THAN) for INEQUALITY types
      const conditionSelect = instance.querySelector(".constraint-condition");
      if (conditionSelect && constraint.condition) {
        conditionSelect.value = constraint.condition;
      }

      // Set value
      const valueInput = instance.querySelector(".constraint-value");
      if (valueInput && constraint.value !== undefined) {
        valueInput.value = constraint.value;
      }

      // Set flag
      const flagSelect = instance.querySelector(".constraint-flag");
      if (flagSelect && constraint.flag) {
        // Ensure the option exists
        if (
          ![...flagSelect.options].some((opt) => opt.value === constraint.flag)
        ) {
          const newOpt = document.createElement("option");
          newOpt.value = constraint.flag;
          newOpt.textContent = constraint.flag;
          flagSelect.appendChild(newOpt);
        }
        flagSelect.value = constraint.flag;
      }

      // Set enabled state
      const enableToggle = instance.querySelector(".constraint-enable");
      if (enableToggle && constraint.enable !== undefined) {
        enableToggle.checked = constraint.enable;
      }

      // Set tolerance if available in the tolerances array
      if (tolerancesArray && tolerancesArray[index] !== undefined) {
        const toleranceInput = instance.querySelector(".constraint-tolerance");
        if (toleranceInput) {
          toleranceInput.value = tolerancesArray[index];
          console.log(
            `[OpenMission] Set constraint tolerance to: ${tolerancesArray[index]}`
          );
        }
      }

      // If this is the last constraint, renumber all constraints
      if (index === constraintsArray.length - 1) {
        setTimeout(() => {
          if (
            typeof window.optimizationHandler?.renumberConstraints ===
            "function"
          ) {
            window.optimizationHandler.renumberConstraints();
            console.log("[OpenMission] Constraints renumbered to start from 1");
          }
        }, 100);
      }
    }, 300);
  });
}

// Populate optimization mode settings
function populateOptimizationModeSettings(loadedData) {
  console.log("[OpenMission] Populating optimization mode settings");

  // Get the mode form and key elements
  const modeForm = document.getElementById("mode-form");
  const normalRadio = document.getElementById("mode-normal");
  const archipelagoRadio = document.getElementById("mode-archipelago");

  if (!modeForm || !normalRadio || !archipelagoRadio) {
    console.warn("[OpenMission] Mode form elements not found");
    return;
  }

  // Set mode (normal or archipelago)
  const modeValue = loadedData.mode?.toLowerCase() || "normal";
  if (modeValue === "normal") {
    normalRadio.checked = true;
  } else if (modeValue === "archipelago") {
    archipelagoRadio.checked = true;
  }

  // Trigger change event to show the correct fields
  const activeRadio = modeValue === "normal" ? normalRadio : archipelagoRadio;
  activeRadio.dispatchEvent(new Event("change", { bubbles: true }));

  // Wait for the mode-specific fields to appear
  setTimeout(() => {
    if (modeValue === "normal") {
      populateNormalModeSettings(loadedData);
    } else {
      populateArchipelagoModeSettings(loadedData);
    }
  }, 300);
}

// Helper for normal mode settings
function populateNormalModeSettings(loadedData) {
  console.log("[OpenMission] Populating normal mode settings");

  // Set algorithm
  const algorithmSelect = document.getElementById("normal-algorithm");
  if (algorithmSelect && loadedData.optimizer) {
    algorithmSelect.value = loadedData.optimizer;
    algorithmSelect.dispatchEvent(new Event("change", { bubbles: true }));

    // Wait for algorithm-specific parameters to appear
    setTimeout(() => {
      // Set algorithm specific parameters if they exist
      if (loadedData[loadedData.optimizer]) {
        const algorithmParams = loadedData[loadedData.optimizer];
        const paramsContainer = document.getElementById(
          "normal-algorithm-params"
        );

        if (paramsContainer) {
          // Find all parameter inputs in the container
          const inputs = paramsContainer.querySelectorAll("input, select");
          inputs.forEach((input) => {
            // Use dataset.parameter which is set by displayAlgorithmParameters
            const paramName = input.dataset.parameter;
            if (paramName && algorithmParams[paramName] !== undefined) {
              if (input.type === "checkbox") {
                input.checked = Boolean(algorithmParams[paramName]);
              } else {
                input.value = algorithmParams[paramName];
              }
              console.log(
                `[OpenMission] Set algorithm parameter ${paramName} to: ${algorithmParams[paramName]}`
              );
            }
          });
        }
      }
    }, 300);
  }

  // Set map bounds
  if (
    loadedData.map &&
    Array.isArray(loadedData.map) &&
    loadedData.map.length >= 2
  ) {
    const lowerBoundInput = document.getElementById("normal-lower-bound");
    const upperBoundInput = document.getElementById("normal-upper-bound");

    if (lowerBoundInput) lowerBoundInput.value = loadedData.map[0];
    if (upperBoundInput) upperBoundInput.value = loadedData.map[1];
  }

  // Set population
  const populationInput = document.getElementById("normal-population");
  if (populationInput && loadedData.population !== undefined) {
    populationInput.value = loadedData.population;
  }

  // Set population toggle
  const setPopulationToggle = document.getElementById("normal-set-population");
  if (setPopulationToggle && loadedData.initial_population) {
    const setPopValue =
      loadedData.initial_population[0]?.set_population === "YES";
    setPopulationToggle.checked = setPopValue;
  }

  // Set problem strategy
  const strategySelect = document.getElementById("normal-problem-strategy");
  if (strategySelect && loadedData.problem_strategy) {
    strategySelect.value = loadedData.problem_strategy;
  }

  // Handle initial population CSV if present
  if (
    loadedData.initial_population &&
    loadedData.initial_population[0]?.population
  ) {
    const popDataKey = loadedData.initial_population[0].population;
    const popData = loadedData[popDataKey];

    if (popData) {
      const csvFilenameInput = document.getElementById("normal-csv-filename");
      const csvClearBtn = document.getElementById("normal-csv-clear-btn");

      if (csvFilenameInput) {
        csvFilenameInput.value = `${popDataKey}.csv`;
        console.log(
          `[OpenMission] Set initial population CSV: ${popDataKey}.csv`
        );
      }

      if (csvClearBtn) {
        csvClearBtn.style.display = "block";
      }

      // Store the data for later use
      if (!window.initialPopulationData) {
        window.initialPopulationData = {};
      }
      window.initialPopulationData[popDataKey] = popData;
    }
  }
}

// Helper for archipelago mode settings
function populateArchipelagoModeSettings(loadedData) {
  console.log("[OpenMission] Populating archipelago mode settings");

  // Set topology
  const topologySelect = document.getElementById("archipelago-topology");
  if (topologySelect && loadedData.topology) {
    topologySelect.value = loadedData.topology;
  }

  // Set migration type and handling
  const migrationType = document.getElementById("archipelago-migration-type");
  if (migrationType && loadedData.migration_type) {
    migrationType.value = loadedData.migration_type;
  }

  const migrationHandling = document.getElementById(
    "archipelago-migration-handling"
  );
  if (migrationHandling && loadedData.migration_handling) {
    migrationHandling.value = loadedData.migration_handling;
  }

  // Set map bounds
  if (
    loadedData.map &&
    Array.isArray(loadedData.map) &&
    loadedData.map.length >= 2
  ) {
    const lowerBoundInput = document.getElementById("archipelago-lower-bound");
    const upperBoundInput = document.getElementById("archipelago-upper-bound");

    if (lowerBoundInput) lowerBoundInput.value = loadedData.map[0];
    if (upperBoundInput) upperBoundInput.value = loadedData.map[1];
  }

  // Set population
  const populationInput = document.getElementById("archipelago-population");
  if (populationInput && loadedData.population !== undefined) {
    populationInput.value = loadedData.population;
  }

  // Add algorithm tags from archipelago algorithms
  if (
    loadedData.archipelago &&
    loadedData.archipelago.algorithms &&
    Array.isArray(loadedData.archipelago.algorithms) &&
    loadedData.archipelago.algorithms.length > 0
  ) {
    const algoContainer = document.getElementById(
      "selected-algorithms-container"
    );

    if (algoContainer) {
      // Clear existing algorithm tags
      const existingTags = algoContainer.querySelectorAll(".algorithm-tag");
      existingTags.forEach((tag) => {
        if (tag.parentNode) {
          tag.parentNode.removeChild(tag);
        }
      });

      // Add each algorithm
      loadedData.archipelago.algorithms.forEach((algoName) => {
        // Use a more robust approach to create the algorithm tag
        let tag;

        if (
          window.optimizationHandler &&
          typeof window.optimizationHandler.createAlgorithmTag === "function"
        ) {
          tag = window.optimizationHandler.createAlgorithmTag(algoName);
        } else {
          // Fallback: create the tag manually using the same pattern as in optimization.js
          const tagId = `algo-${algoName.toLowerCase()}-${Date.now()}`;
          tag = document.createElement("div");
          tag.className = "algorithm-tag";
          tag.id = tagId;
          tag.dataset.algorithm = algoName;
          tag.innerHTML = `
            <span class="algorithm-name">${algoName}</span>
            <span class="remove-algorithm">&times;</span>
          `;

          // Add click handler to open the parameters modal
          tag.addEventListener("click", (event) => {
            // Don't trigger if the remove button was clicked
            if (event.target.classList.contains("remove-algorithm")) {
              return;
            }
            if (
              window.optimizationHandler &&
              window.optimizationHandler.openAlgorithmParamsModal
            ) {
              window.optimizationHandler.openAlgorithmParamsModal(
                algoName,
                tag.id
              );
            }
          });

          // Add remove functionality
          const removeButton = tag.querySelector(".remove-algorithm");
          if (removeButton) {
            removeButton.addEventListener("click", (event) => {
              event.stopPropagation();
              tag.remove();

              // Clear parameters from store
              if (window.optimizationHandler.clearArchipelagoAlgorithmParams) {
                window.optimizationHandler.clearArchipelagoAlgorithmParams(
                  tag.id
                );
              }

              // Update counter
              if (window.optimizationHandler.updateAlgorithmsCounter) {
                window.optimizationHandler.updateAlgorithmsCounter();
              }
            });
          }
        }

        if (tag) {
          // Add tag to container (position before the counter)
          const counter = document.getElementById("algorithms-counter");
          if (counter) {
            algoContainer.insertBefore(tag, counter);
          } else {
            algoContainer.appendChild(tag);
          }

          // Store algorithm parameters if they exist
          if (loadedData[algoName]) {
            // Initialize parameter store if it doesn't exist
            if (!window.optimizationHandler) {
              window.optimizationHandler = {};
            }
            if (!window.optimizationHandler.archipelagoParamsStore) {
              window.optimizationHandler.archipelagoParamsStore = {};
            }
            if (!window.optimizationHandler.storeArchipelagoAlgorithmParams) {
              window.optimizationHandler.storeArchipelagoAlgorithmParams =
                function (tagId, params) {
                  window.optimizationHandler.archipelagoParamsStore[tagId] =
                    params;
                  console.log(`Stored parameters for ${tagId}:`, params);
                };
            }
            if (!window.optimizationHandler.getArchipelagoAlgorithmParams) {
              window.optimizationHandler.getArchipelagoAlgorithmParams =
                function (tagId) {
                  return (
                    window.optimizationHandler.archipelagoParamsStore[tagId] ||
                    {}
                  );
                };
            }
            if (!window.optimizationHandler.clearArchipelagoAlgorithmParams) {
              window.optimizationHandler.clearArchipelagoAlgorithmParams =
                function (tagId) {
                  if (window.optimizationHandler.archipelagoParamsStore) {
                    delete window.optimizationHandler.archipelagoParamsStore[
                      tagId
                    ];
                    console.log(`Cleared parameters for ${tagId}`);
                  }
                };
            }

            window.optimizationHandler.storeArchipelagoAlgorithmParams(
              tag.id,
              loadedData[algoName]
            );
            console.log(
              `[OpenMission] Stored parameters for ${algoName} (${tag.id}):`,
              loadedData[algoName]
            );
          }
        }
      });

      // Update the counter if available
      if (
        window.optimizationHandler &&
        window.optimizationHandler.updateAlgorithmsCounter
      ) {
        window.optimizationHandler.updateAlgorithmsCounter();
      }
    }
  }

  // Handle initial population CSV if present
  if (
    loadedData.initial_population &&
    loadedData.initial_population[0]?.population
  ) {
    const popDataKey = loadedData.initial_population[0].population;
    const popData = loadedData[popDataKey];

    if (popData) {
      const csvFilenameInput = document.getElementById(
        "archipelago-csv-filename"
      );
      const csvClearBtn = document.getElementById("archipelago-csv-clear-btn");

      if (csvFilenameInput) {
        csvFilenameInput.value = `${popDataKey}.csv`;
        console.log(
          `[OpenMission] Set archipelago initial population CSV: ${popDataKey}.csv`
        );
      }

      if (csvClearBtn) {
        csvClearBtn.style.display = "block";
      }

      // Store the data for later use
      if (!window.initialPopulationData) {
        window.initialPopulationData = {};
      }
      window.initialPopulationData[popDataKey] = popData;
    }
  }
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

// Function to populate design variables from loaded JSON data
function populateDesignVariables(loadedData) {
  console.log("[OpenMission] Starting design variables population");

  // Extract design variables data from the JSON structure
  const designVariablesKey = loadedData.design_variables;
  if (!designVariablesKey) {
    console.warn("[OpenMission] No design_variables key found in data");
    return;
  }

  const designVariableNames = loadedData[designVariablesKey];
  if (!designVariableNames || !Array.isArray(designVariableNames)) {
    console.warn(
      `[OpenMission] No design variable names found for key: ${designVariablesKey}`
    );
    return;
  }

  console.log(
    `[OpenMission] Found ${designVariableNames.length} design variables to populate:`,
    designVariableNames
  );

  // Get the design variables container
  const designVariablesContainer = document.getElementById(
    "design-variables-container"
  );
  if (!designVariablesContainer) {
    console.error("[OpenMission] Design variables container not found");
    return;
  }

  // Clear existing design variables
  designVariablesContainer.innerHTML = "";

  // Navigate to design variables form first to ensure it's active
  const designVariablesBtn = document.getElementById("design-variables-btn");
  if (designVariablesBtn) {
    designVariablesBtn.click();
  }

  // Process each design variable sequentially with delays
  let currentIndex = 0;

  function processNextDesignVariable() {
    if (currentIndex >= designVariableNames.length) {
      console.log("[OpenMission] Design variables population completed");

      // Renumber all design variables to start from 1
      setTimeout(() => {
        if (
          typeof window.optimizationHandler?.renumberDesignVariables ===
          "function"
        ) {
          window.optimizationHandler.renumberDesignVariables();
          console.log(
            "[OpenMission] Design variables renumbered to start from 1"
          );
        }
      }, 200);
      return;
    }

    const dvName = designVariableNames[currentIndex];
    const dvData = loadedData[dvName];

    if (!dvData || !Array.isArray(dvData) || dvData.length === 0) {
      console.warn(
        `[OpenMission] No data found for design variable: ${dvName}`
      );
      currentIndex++;
      setTimeout(processNextDesignVariable, 100);
      return;
    }

    // Log the data structure for debugging
    console.log(`[OpenMission] Raw data for ${dvName}:`, dvData[0]);

    console.log(
      `[OpenMission] Processing design variable ${currentIndex + 1}/${
        designVariableNames.length
      }: ${dvName}`,
      dvData[0]
    );

    // Add a new design variable instance
    const addDesignVariableBtn = document.getElementById(
      "add-design-variable-btn"
    );
    if (addDesignVariableBtn) {
      addDesignVariableBtn.click();

      // Wait for the new instance to be created, then populate it
      setTimeout(() => {
        populateDesignVariableInstance(currentIndex, dvName, dvData[0]);
        currentIndex++;
        setTimeout(processNextDesignVariable, 1000); // Increased delay to 1 second between each instance
      }, 500); // Increased delay for instance creation
    } else {
      console.error("[OpenMission] Add design variable button not found");
      return;
    }
  }

  // Start processing design variables after a short delay
  setTimeout(() => {
    console.log(
      "[OpenMission] Starting design variable processing after steering components are loaded"
    );
    processNextDesignVariable();
  }, 1000); // Increased delay to allow steering components to be fully loaded
}

// Function to populate a single design variable instance with data
function populateDesignVariableInstance(index, dvName, dvData) {
  console.log(
    `[OpenMission] Populating design variable instance ${index}:`,
    dvName,
    dvData
  );

  // Find the design variable instance that was just created
  const designVariablesContainer = document.getElementById(
    "design-variables-container"
  );
  const instances = designVariablesContainer.querySelectorAll(
    ".optimization-instance:not(.hidden-template)"
  );

  if (index >= instances.length) {
    console.error(`[OpenMission] Design variable instance ${index} not found`);
    return;
  }

  const instance = instances[index];

  // Set the name field
  const nameInput = instance.querySelector(".dv-name");
  if (nameInput) {
    nameInput.value = dvName;
    nameInput.disabled = false; // Enable it since we have data
  }

  // Set the category
  const categorySelect = instance.querySelector(".dv-category");
  if (categorySelect && dvData.category) {
    console.log(
      `[OpenMission] Setting category for ${dvName}: ${dvData.category}`
    );
    categorySelect.value = dvData.category;
    categorySelect.dispatchEvent(new Event("change", { bubbles: true }));

    // Wait for category change to create dynamic fields, then populate them
    setTimeout(() => {
      populateDesignVariableCategoryFields(instance, dvData);
    }, 200);
  } else {
    console.warn(
      `[OpenMission] Category select not found or no category data for ${dvName}. Category value:`,
      dvData.category
    );
    console.warn(`[OpenMission] Full dvData:`, dvData);
  }
}

// Function to populate category-specific fields
function populateDesignVariableCategoryFields(instance, dvData) {
  const category = dvData.category;
  console.log(
    `[OpenMission] Populating category fields for ${category}:`,
    dvData
  );

  // Find the category-specific fields container
  const categoryFields = instance.querySelector(
    `.dv-category-fields[data-category="${category}"]`
  );
  if (!categoryFields) {
    console.warn(
      `[OpenMission] Category fields container not found for ${category}`
    );
    return;
  }

  // Handle different categories
  switch (category) {
    case "STEERING":
      populateSteeringFields(categoryFields, dvData);
      break;
    case "PROPULSION":
      populatePropulsionFields(categoryFields, dvData);
      break;
    case "PAYLOAD":
      populatePayloadFields(categoryFields, dvData);
      break;
    case "AZIMUTH":
      populateAzimuthFields(categoryFields, dvData);
      break;
    case "SEQUENCE":
      populateSequenceFields(categoryFields, dvData);
      break;
    case "CUT_OFF":
      populateCutOffFields(categoryFields, dvData);
      break;
    default:
      console.warn(`[OpenMission] Unknown category: ${category}`);
  }
}

// Function to populate steering-specific fields
function populateSteeringFields(categoryFields, dvData) {
  console.log("[OpenMission] Populating steering fields:", dvData);

  // Set segment
  const segmentSelect = categoryFields.querySelector(".dv-segment");
  if (segmentSelect && dvData.segment) {
    // Force update the segment dropdown first to ensure all options are available
    if (
      typeof window.optimizationHandler
        ?.refreshAllDesignVariableSegmentDropdowns === "function"
    ) {
      window.optimizationHandler.refreshAllDesignVariableSegmentDropdowns();
      console.log(
        "[OpenMission] Refreshed segment dropdowns before population"
      );
    }

    // Wait for the option to exist before setting the value
    const targetSegment = dvData.segment;
    let attempts = 0;
    const maxAttempts = 50; // Increased to 50 * 100ms = 5 seconds

    const checkAndSetSegment = () => {
      // Refresh dropdowns on each attempt to catch newly added components
      if (attempts % 5 === 0 && attempts > 0) {
        if (
          typeof window.optimizationHandler
            ?.refreshAllDesignVariableSegmentDropdowns === "function"
        ) {
          window.optimizationHandler.refreshAllDesignVariableSegmentDropdowns();
          console.log(
            `[OpenMission] Refreshed segment dropdowns on attempt ${attempts}`
          );
        }
      }

      const optionExists = Array.from(segmentSelect.options).some(
        (option) => option.value === targetSegment
      );

      if (optionExists) {
        segmentSelect.value = targetSegment;
        segmentSelect.dispatchEvent(new Event("change", { bubbles: true }));
        console.log(
          `[OpenMission] Successfully set segment to: ${targetSegment}`
        );

        // Wait for segment change, then set segment type
        setTimeout(() => {
          const segmentTypeSelect =
            categoryFields.querySelector(".dv-segment-type");
          if (segmentTypeSelect && dvData.segment_type) {
            // Wait for segment type options to be populated
            const waitForSegmentTypeOptions = () => {
              if (segmentTypeSelect.options.length > 1) {
                // More than just placeholder
                segmentTypeSelect.value = dvData.segment_type;
                segmentTypeSelect.dispatchEvent(
                  new Event("change", { bubbles: true })
                );

                // Wait for segment type change to create type-specific fields
                setTimeout(() => {
                  // Check if we have segment_type data before calling populateSteeringTypeFields
                  if (dvData.segment_type) {
                    populateSteeringTypeFields(categoryFields, dvData);
                  } else {
                    console.warn(
                      `[OpenMission] No segment_type found in dvData for ${dvData.segment}:`,
                      dvData
                    );
                  }
                }, 300);
              } else {
                setTimeout(waitForSegmentTypeOptions, 100);
              }
            };
            waitForSegmentTypeOptions();
          }
        }, 300);
      } else if (attempts < maxAttempts) {
        attempts++;
        setTimeout(checkAndSetSegment, 100); // Wait 100ms and try again
      } else {
        console.warn(
          `[OpenMission] Timeout: Option "${targetSegment}" not found in segment dropdown after ${maxAttempts} attempts.`
        );
        console.warn(
          `[OpenMission] Available segment options:`,
          Array.from(segmentSelect.options).map((opt) => opt.value)
        );

        // Add the missing option manually if it doesn't exist
        const newOption = document.createElement("option");
        newOption.value = targetSegment;
        newOption.textContent = targetSegment;
        segmentSelect.appendChild(newOption);

        segmentSelect.value = targetSegment;
        segmentSelect.dispatchEvent(new Event("change", { bubbles: true }));
        console.log(
          `[OpenMission] Added and set missing segment option: ${targetSegment}`
        );

        // Proceed with setting segment type
        setTimeout(() => {
          const segmentTypeSelect =
            categoryFields.querySelector(".dv-segment-type");
          if (segmentTypeSelect && dvData.segment_type) {
            segmentTypeSelect.value = dvData.segment_type;
            segmentTypeSelect.dispatchEvent(
              new Event("change", { bubbles: true })
            );

            // Wait for segment type change to create type-specific fields
            setTimeout(() => {
              // Check if we have segment_type data before calling populateSteeringTypeFields
              if (dvData.segment_type) {
                populateSteeringTypeFields(categoryFields, dvData);
              } else {
                console.warn(
                  `[OpenMission] No segment_type found in dvData for ${dvData.segment}:`,
                  dvData
                );
              }
            }, 300);
          }
        }, 300);
      }
    };

    checkAndSetSegment();
  }

  // The original setTimeout block for segment type is now inside the checkAndSetSegment function
  // and is only triggered after the segment is successfully set or on timeout.
  // Keeping the original structure commented out for reference if needed.
  /*
  // Wait for segment change, then set segment type
  setTimeout(() => {
    const segmentTypeSelect = categoryFields.querySelector(".dv-segment-type");
    if (segmentTypeSelect && dvData.segment_type) {
      segmentTypeSelect.value = dvData.segment_type;
      segmentTypeSelect.dispatchEvent(new Event("change", { bubbles: true }));

      // Wait for segment type change to create type-specific fields
      setTimeout(() => {
        populateSteeringTypeFields(categoryFields, dvData);
      }, 200);
    }
  }, 200);
  */
}

// Function to populate steering type-specific fields
function populateSteeringTypeFields(categoryFields, dvData) {
  if (!dvData.type || !Array.isArray(dvData.type) || dvData.type.length === 0) {
    console.warn("[OpenMission] No type data found for steering variable");
    return;
  }

  const typeData = dvData.type[0];
  console.log("[OpenMission] Populating steering type fields:", typeData);

  // Find the type-specific fields container for the segment type
  const segmentType = dvData.segment_type;
  console.log(
    `[OpenMission] Looking for type fields with segment type: ${segmentType}`
  );

  const typeFields = categoryFields.querySelector(
    `.dv-steering-type-fields[data-segment-type="${segmentType}"]`
  );

  if (!typeFields) {
    console.warn(
      `[OpenMission] Type fields container not found for segment type: ${segmentType}`
    );
    // List all available type fields for debugging
    const availableTypeFields = categoryFields.querySelectorAll(
      ".dv-steering-type-fields"
    );
    console.warn(
      `[OpenMission] Available type fields:`,
      Array.from(availableTypeFields).map((field) => field.dataset.segmentType)
    );
    return;
  }

  console.log(
    `[OpenMission] Found type fields container for segment type: ${segmentType}`
  );

  // Make sure the type fields are visible
  typeFields.classList.remove("hidden");

  // Set control variables
  if (typeData.control_variable && Array.isArray(typeData.control_variable)) {
    // Check if this is CONST_BODYRATE with checkboxes
    if (segmentType === "CONST_BODYRATE") {
      console.log(
        `[OpenMission] Setting control variable checkboxes for CONST_BODYRATE:`,
        typeData.control_variable
      );
      // Handle checkboxes for CONST_BODYRATE
      typeData.control_variable.forEach((variable) => {
        const checkbox = typeFields.querySelector(
          `.dv-control-variable-cb[value="${variable}"]`
        );
        if (checkbox) {
          checkbox.checked = true;
          checkbox.dispatchEvent(new Event("change", { bubbles: true }));
          console.log(
            `[OpenMission] Checked control variable checkbox: ${variable}`
          );
        } else {
          console.warn(
            `[OpenMission] Control variable checkbox not found: ${variable}`
          );
        }
      });
    } else {
      // Handle dropdown/select for other segment types
      const controlVarSelect = typeFields.querySelector(".dv-control-variable");
      if (controlVarSelect) {
        if (controlVarSelect.tagName === "SELECT") {
          // For dropdowns, set the value directly
          controlVarSelect.value = typeData.control_variable[0];
          controlVarSelect.dispatchEvent(
            new Event("change", { bubbles: true })
          );
          console.log(
            `[OpenMission] Set control variable dropdown: ${typeData.control_variable[0]}`
          );
        } else {
          // For text inputs, join the array
          controlVarSelect.value = typeData.control_variable.join(", ");
          console.log(
            `[OpenMission] Set control variable input: ${typeData.control_variable.join(
              ", "
            )}`
          );
        }
      }
    }
  }

  // Set axis selection for per-axis types
  if (typeData.axis && Array.isArray(typeData.axis)) {
    // For per-axis types like CONST_BODYRATE and PROFILE, handle axis selection
    typeData.axis.forEach((axis) => {
      const axisCheckbox = typeFields.querySelector(
        `.dv-axis-select-cb[value="${axis}"]`
      );
      if (axisCheckbox) {
        axisCheckbox.checked = true;
        axisCheckbox.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });
  }

  // Set bounds with proper per-axis handling
  if (typeData.upper_bound && Array.isArray(typeData.upper_bound)) {
    console.log(
      `[OpenMission] Setting upper bounds for ${segmentType}:`,
      typeData.upper_bound
    );
    if (
      segmentType === "PROFILE" ||
      segmentType === "CONST_BODYRATE" ||
      segmentType === "CLG"
    ) {
      // Handle per-axis bounds
      typeData.axis?.forEach((axis, index) => {
        const upperBoundInput = typeFields.querySelector(
          `.dv-upper-bound[data-axis="${axis}"]`
        );
        if (upperBoundInput && typeData.upper_bound[index] !== undefined) {
          const boundValue = Array.isArray(typeData.upper_bound[index])
            ? typeData.upper_bound[index].join(", ")
            : typeData.upper_bound[index];
          upperBoundInput.value = boundValue;
          console.log(`[OpenMission] Set ${axis} upper bound: ${boundValue}`);
        }
      });
    } else {
      // Handle regular bounds
      const upperBoundInput = typeFields.querySelector(".dv-upper-bound");
      if (upperBoundInput) {
        const boundsString = typeData.upper_bound
          .map((arr) => (Array.isArray(arr) ? arr.join(", ") : arr))
          .join("; ");
        upperBoundInput.value = boundsString;
        console.log(`[OpenMission] Set regular upper bound: ${boundsString}`);
      }
    }
  }

  if (typeData.lower_bound && Array.isArray(typeData.lower_bound)) {
    console.log(
      `[OpenMission] Setting lower bounds for ${segmentType}:`,
      typeData.lower_bound
    );
    if (
      segmentType === "PROFILE" ||
      segmentType === "CONST_BODYRATE" ||
      segmentType === "CLG"
    ) {
      // Handle per-axis bounds
      typeData.axis?.forEach((axis, index) => {
        const lowerBoundInput = typeFields.querySelector(
          `.dv-lower-bound[data-axis="${axis}"]`
        );
        if (lowerBoundInput && typeData.lower_bound[index] !== undefined) {
          const boundValue = Array.isArray(typeData.lower_bound[index])
            ? typeData.lower_bound[index].join(", ")
            : typeData.lower_bound[index];
          lowerBoundInput.value = boundValue;
          console.log(`[OpenMission] Set ${axis} lower bound: ${boundValue}`);
        }
      });
    } else {
      // Handle regular bounds
      const lowerBoundInput = typeFields.querySelector(".dv-lower-bound");
      if (lowerBoundInput) {
        const boundsString = typeData.lower_bound
          .map((arr) => (Array.isArray(arr) ? arr.join(", ") : arr))
          .join("; ");
        lowerBoundInput.value = boundsString;
        console.log(`[OpenMission] Set regular lower bound: ${boundsString}`);
      }
    }
  }

  // For PROFILE type, set independent variable and vector
  if (dvData.segment_type === "PROFILE") {
    console.log(`[OpenMission] Setting PROFILE specific fields:`, typeData);

    if (typeData.ind_variable) {
      const indVarSelect = typeFields.querySelector(".dv-ind-variable");
      if (indVarSelect) {
        indVarSelect.value = typeData.ind_variable;
        indVarSelect.dispatchEvent(new Event("change", { bubbles: true }));
        console.log(
          `[OpenMission] Set independent variable: ${typeData.ind_variable}`
        );
      } else {
        console.warn(`[OpenMission] Independent variable select not found`);
      }
    }

    if (typeData.ind_vector && Array.isArray(typeData.ind_vector)) {
      const indVectorInput = typeFields.querySelector(".dv-ind-vector");
      if (indVectorInput) {
        indVectorInput.value = typeData.ind_vector.join(", ");
        console.log(
          `[OpenMission] Set independent vector: ${typeData.ind_vector.join(
            ", "
          )}`
        );
      } else {
        console.warn(`[OpenMission] Independent vector input not found`);
      }
    }
  }
}

// Function to populate propulsion-specific fields
function populatePropulsionFields(categoryFields, dvData) {
  console.log("[OpenMission] Populating propulsion fields:", dvData);

  // Set segment
  const segmentSelect = categoryFields.querySelector(".dv-segment");
  if (segmentSelect && dvData.segment) {
    segmentSelect.value = dvData.segment;
  }

  // Set type fields
  if (dvData.type && Array.isArray(dvData.type) && dvData.type.length > 0) {
    const typeData = dvData.type[0];

    if (typeData.control_variable && Array.isArray(typeData.control_variable)) {
      const controlVarInput = categoryFields.querySelector(
        ".dv-control-variable"
      );
      if (controlVarInput) {
        controlVarInput.value = typeData.control_variable.join(", ");
      }
    }

    // Set bounds
    setBounds(categoryFields, typeData);
  }
}

// Function to populate payload-specific fields
function populatePayloadFields(categoryFields, dvData) {
  console.log("[OpenMission] Populating payload fields:", dvData);

  if (dvData.type && Array.isArray(dvData.type) && dvData.type.length > 0) {
    const typeData = dvData.type[0];

    if (typeData.control_variable && Array.isArray(typeData.control_variable)) {
      const controlVarInput = categoryFields.querySelector(
        ".dv-control-variable"
      );
      if (controlVarInput) {
        controlVarInput.value = typeData.control_variable.join(", ");
      }
    }

    // Set bounds
    setBounds(categoryFields, typeData);
  }
}

// Function to populate azimuth-specific fields
function populateAzimuthFields(categoryFields, dvData) {
  console.log("[OpenMission] Populating azimuth fields:", dvData);

  if (dvData.type && Array.isArray(dvData.type) && dvData.type.length > 0) {
    const typeData = dvData.type[0];

    if (typeData.control_variable && Array.isArray(typeData.control_variable)) {
      const controlVarInput = categoryFields.querySelector(
        ".dv-control-variable"
      );
      if (controlVarInput) {
        controlVarInput.value = typeData.control_variable.join(", ");
      }
    }

    // Set bounds
    setBounds(categoryFields, typeData);
  }
}

// Function to populate sequence-specific fields
function populateSequenceFields(categoryFields, dvData) {
  console.log("[OpenMission] Populating sequence fields:", dvData);

  // Set flag if present
  if (dvData.flag) {
    const flagSelect = categoryFields.querySelector(".dv-flag");
    if (flagSelect) {
      flagSelect.value = dvData.flag;
    }
  }

  if (dvData.type && Array.isArray(dvData.type) && dvData.type.length > 0) {
    const typeData = dvData.type[0];

    if (typeData.control_variable && Array.isArray(typeData.control_variable)) {
      const controlVarInput = categoryFields.querySelector(
        ".dv-control-variable"
      );
      if (controlVarInput) {
        controlVarInput.value = typeData.control_variable.join(", ");
      }
    }

    // Set bounds
    setBounds(categoryFields, typeData);
  }
}

// Function to populate cut-off specific fields
function populateCutOffFields(categoryFields, dvData) {
  console.log("[OpenMission] Populating cut-off fields:", dvData);

  // Set flag if present
  if (dvData.flag) {
    const flagSelect = categoryFields.querySelector(".dv-flag");
    if (flagSelect) {
      flagSelect.value = dvData.flag;
    }
  }

  if (dvData.type && Array.isArray(dvData.type) && dvData.type.length > 0) {
    const typeData = dvData.type[0];

    if (typeData.control_variable && Array.isArray(typeData.control_variable)) {
      const controlVarInput = categoryFields.querySelector(
        ".dv-control-variable"
      );
      if (controlVarInput) {
        controlVarInput.value = typeData.control_variable.join(", ");
      }
    }

    // Set bounds
    setBounds(categoryFields, typeData);
  }
}

// Helper function to set bounds
function setBounds(categoryFields, typeData) {
  if (typeData.upper_bound && Array.isArray(typeData.upper_bound)) {
    const upperBoundInput = categoryFields.querySelector(".dv-upper-bound");
    if (upperBoundInput) {
      const boundsString = typeData.upper_bound
        .map((arr) => (Array.isArray(arr) ? arr.join(", ") : arr))
        .join("; ");
      upperBoundInput.value = boundsString;
    }
  }

  if (typeData.lower_bound && Array.isArray(typeData.lower_bound)) {
    const lowerBoundInput = categoryFields.querySelector(".dv-lower-bound");
    if (lowerBoundInput) {
      const boundsString = typeData.lower_bound
        .map((arr) => (Array.isArray(arr) ? arr.join(", ") : arr))
        .join("; ");
      lowerBoundInput.value = boundsString;
    }
  }
}

// Format mappings for loading files
// Update from camelCase to consistent UPPERCASE_WITH_UNDERSCORES
const formatMappings = {
  EULER_RATE: "EULER_RATE",
  BODY_RATE: "BODY_RATE",
  QUATERNION: "QUATERNION",
  EULER_ANGLE: "EULER_ANGLE",
  BODY_ANGLE: "BODY_ANGLE",
  // Other mappings as needed...
};
