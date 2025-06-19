// Global mission data structure
let missionData = {
  mission: {},
  environment: {},
  vehicle: {},
  stages: [],
  sequence: {},
};

// --- IMPROVED: Enhanced error and feedback functions ---
// Improved helper function to show errors consistently
function showError(message, title = "Error") {
  Swal.fire({
    icon: "error",
    title: title,
    html: message,
    toast: false, // Make it a persistent modal
    confirmButtonText: "OK", // Add a button to dismiss
  });
  console.error(message); // Also log to console for debugging
}

// Helper function to show success messages consistently
function showSuccess(message, title = "Success") {
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener("mouseenter", Swal.stopTimer);
      toast.addEventListener("mouseleave", Swal.resumeTimer);
    },
  });

  Toast.fire({
    icon: "success",
    title: message,
  });
  console.log(message); // Also log to console for debugging
}

// Function to show warning messages
function showWarning(message, title = "Warning") {
  Swal.fire({
    icon: "warning",
    title: title,
    html: message,
    confirmButtonText: "OK",
  });
  console.warn(message); // Also log to console for debugging
}

// Helper for handling async operations
function handleAsyncOperation(operation, successMsg, errorMsg) {
  try {
    return operation()
      .then((result) => {
        if (successMsg) showSuccess(successMsg);
        return result;
      })
      .catch((error) => {
        const fullErrorMsg =
          errorMsg + (error.message ? `: ${error.message}` : "");
        showError(fullErrorMsg);
        console.error(error);
        return null; // Return null to indicate failure
      });
  } catch (error) {
    showError(errorMsg + (error.message ? `: ${error.message}` : ""));
    console.error(error);
    return Promise.resolve(null); // Return resolved promise with null for synchronous errors
  }
}
// --- END IMPROVED ---

// Global final mission data structure
let finalMissionData = {
  Software: "ASTRA",
  mission: {
    mission_name: "",
    planet_name: "",
    MODE: "",
    tracking_option: "OFF",
    frame_model: "POST",
    output_frame: "POST",
    UTC: {
      Date: "",
      Time: "",
    },
  },
};

// Flag registry to track all event flags
let flagRegistry = {
  stages: {
    initializationFlags: [], // ST_1_INI, ST_2_INI, etc.
    separationFlags: [], // ST_1_SEP, ST_2_SEP, etc.
  },
  motors: [], // This will be populated with motor flags
  heatShieldFlags: [], // Heat shield separation flags
};

// Global array to store saved stages
let savedStages = [];

// Array to store added events in sequence
window.eventSequence = [];

// Add test function to check finalMissionData
function testFinalMissionData() {
  console.log("Testing finalMissionData accessibility:");
  console.log("finalMissionData object:", finalMissionData);
  console.log("Window finalMissionData:", window.finalMissionData);
}

// Function to validate event dependencies
function validateEventDependencies() {
  console.log("Validating event dependencies for sequence configuration...");
  const errors = [];

  // Check if eventSequence is properly initialized
  if (!window.eventSequence || !Array.isArray(window.eventSequence)) {
    console.error("Event sequence not initialized properly");
    return {
      isValid: false,
      errors: ["Event sequence not initialized properly"],
    };
  }

  // No validation needed if the sequence is empty
  if (window.eventSequence.length === 0) {
    return { isValid: true, errors: [] };
  }

  // Build a set of all defined flags for quick lookup
  const definedFlags = new Set(
    window.eventSequence
      .filter((event) => event && event.flag) // Ensure valid events only
      .map((event) => event.flag)
  );

  // Check for non-existent reference flags (except 'none')
  window.eventSequence.forEach((event) => {
    if (!event || !event.flag) {
      errors.push("Found invalid event entry in sequence");
      return;
    }

    if (
      event.referenceFlag &&
      event.referenceFlag !== "none" &&
      !definedFlags.has(event.referenceFlag)
    ) {
      errors.push(
        `Event ${event.flag} references non-existent flag "${event.referenceFlag}"`
      );
    }

    // Check if an event references itself (direct circular dependency)
    if (event.referenceFlag === event.flag) {
      errors.push(
        `Event ${event.flag} references itself, creating an invalid circular dependency`
      );
    }
  });

  // Check for circular dependencies (more complex cycles)
  const visited = new Set();
  const recursionStack = new Set();

  function detectCycle(flag) {
    // Skip if flag is 'none' or not defined
    if (flag === "none" || !definedFlags.has(flag)) return false;

    // If already fully checked, it's safe
    if (visited.has(flag)) return false;

    // If in current recursion path, we found a cycle
    if (recursionStack.has(flag)) return true;

    // Add to current path
    recursionStack.add(flag);
    visited.add(flag);

    // Find the event with this flag
    const event = window.eventSequence.find((e) => e.flag === flag);
    if (event && event.referenceFlag && event.referenceFlag !== "none") {
      if (detectCycle(event.referenceFlag)) {
        // Track the cycle path for better error reporting
        const cycle = [...recursionStack].filter(
          (f) =>
            f === flag || f === event.referenceFlag || recursionStack.has(f)
        );
        errors.push(
          `Circular dependency detected: ${cycle.join(" → ")} → ${flag}`
        );
        return true;
      }
    }

    // Remove from current path as we backtrack
    recursionStack.delete(flag);
    return false;
  }

  // Check every event for potential cycles
  for (const event of window.eventSequence) {
    if (event && event.flag && !visited.has(event.flag)) {
      detectCycle(event.flag);
    }
  }

  // Return validation result
  const isValid = errors.length === 0;
  console.log(
    `Validation ${isValid ? "passed" : "failed"} with ${errors.length} errors`
  );
  if (!isValid) {
    console.error("Validation errors:", errors);
  }

  return {
    isValid,
    errors,
  };
}

// Function to save sequence configuration
function saveSequenceConfiguration() {
  // Validate that there are events to save
  if (window.eventSequence.length === 0) {
    Swal.fire({
      icon: "error",
      title: "No Events",
      text: "Please add at least one event to the sequence before saving.",
      toast: false,
      confirmButtonText: "OK",
    });
    return false;
  }

  // Validate event dependencies
  const validationResult = validateEventDependencies();
  if (!validationResult.isValid) {
    Swal.fire({
      icon: "error",
      title: "Validation Error",
      html: validationResult.errors.join("<br>"),
      toast: false,
      confirmButtonText: "OK",
    });
    return false;
  }

  // Get vehicle name to create the dynamic key
  const vehicleName =
    document.getElementById("vehicle-name")?.value.trim() || "DefaultVehicle"; // Use default if not found
  const sequenceKey = `${vehicleName}_Sequence`;

  // Map events to the desired structure with renamed keys
  const mappedEvents = window.eventSequence.map((event) => ({
    identity: event.flag,
    trigger: event.triggerType.toUpperCase().replace("-", "_"), // Corrected replacement
    value: parseFloat(event.triggerValue) || 0, // Convert triggerValue to number, default to 0 if NaN
    reference: event.referenceFlag,
    comment: event.comment,
  }));

  // Store the mapped events array directly under the dynamic key
  window.finalMissionData[sequenceKey] = mappedEvents;

  // Log the saved configuration
  console.log(
    `Saved sequence configuration to finalMissionData.${sequenceKey}:`,
    window.finalMissionData[sequenceKey]
  );

  // Show success message
  Swal.fire({
    icon: "success",
    title: "Sequence Saved",
    text: "The sequence configuration has been saved successfully.",
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });

  return true;
}

// Function to load sequence configuration
function loadSequenceConfiguration(config) {
  if (!config || !config.events || !Array.isArray(config.events)) {
    Swal.fire({
      icon: "error",
      title: "Invalid Configuration",
      text: "The sequence configuration is invalid or empty.",
      toast: false,
      confirmButtonText: "OK",
    });
    return false;
  }

  // Clear existing sequence
  window.eventSequence = [];
  const eventList = document.getElementById("event-list");
  if (eventList) {
    eventList.innerHTML = "";
  }

  // Load each event
  config.events.forEach((event) => {
    addEventToSequence(event);
  });

  // Initialize drag and drop tooltip after loading events
  setTimeout(() => {
    initializeEventSequenceDragDrop();
  }, 100);

  // Show success message
  Swal.fire({
    icon: "success",
    title: "Sequence Loaded",
    text: "The sequence configuration has been loaded successfully.",
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });

  return true;
}

// Add event listeners when document is loaded
document.addEventListener("DOMContentLoaded", function () {
  // Ensure finalMissionData is assigned to window
  window.finalMissionData = finalMissionData;
  testFinalMissionData();

  // Mission form save button
  const saveMissionBtn = document.getElementById("save-mission");
  if (saveMissionBtn) {
    saveMissionBtn.addEventListener("click", function (e) {
      e.preventDefault();
      // Use FormValidator class from validation.js
      const validationResult = FormValidator.validateMissionForm();
      if (validationResult.isValid) {
        saveMissionDetails();
        showSuccess("Mission details saved successfully!");
      }
    });
  }

  // Environment form save button
  const enviroForm = document.getElementById("enviro-form");
  if (enviroForm) {
    enviroForm.addEventListener("submit", function (e) {
      e.preventDefault();
      // Use FormValidator class from validation.js
      const validationResult = FormValidator.validateEnvironmentForm();
      if (validationResult.isValid) {
        appendEnviroDetails();
        // Success feedback is now handled within appendEnviroDetails
      }
    });
  }

  // Vehicle form save button
  const vehicleForm = document.getElementById("vehicle-form");
  if (vehicleForm) {
    vehicleForm.addEventListener("submit", function (e) {
      e.preventDefault();
      // Use FormValidator class from validation.js
      const validationResult = FormValidator.validateVehicleForm();
      if (validationResult.isValid) {
        appendVehicleDetails();
        showSuccess("Vehicle details saved successfully!");

        // Update FormStateManager to reflect the successful validation and save
        if (window.formStateManager) {
          window.formStateManager.setFormState("vehicle", {
            isValid: true,
            isDirty: false,
            lastSaved: new Date(),
          });
          window.formStateManager.updateAllIndicators();
          window.formStateManager.updateLaunchButton();
        }

        // Log the current state of finalMissionData
        console.log("Current Mission Data Structure:");
        console.log(JSON.stringify(finalMissionData, null, 2));
      } else {
        // Also trigger revalidation when form submission fails
        if (window.formStateManager) {
          window.formStateManager.revalidateSection("vehicle");
        }
      }
    });
  }

  // --- ADDED: Stopping condition form save button ---
  const stoppingForm = document.getElementById("stopping-form");
  if (stoppingForm) {
    stoppingForm.addEventListener("submit", function (e) {
      e.preventDefault(); // Prevent default submission
      if (saveStoppingConditionToFinalData()) {
        // Success already shown in the save function
      }
    });
  } else {
    console.warn("Stopping condition form (#stopping-form) not found.");
  }
  // --- END ADDED ---

  // Add trigger type change handler
  const triggerType = document.getElementById("trigger-type");
  const triggerValue = document.getElementById("trigger-value");

  if (triggerType && triggerValue) {
    // Update placeholder based on trigger type
    triggerType.addEventListener("change", function () {
      switch (this.value) {
        case "mission-time":
        case "phase-time":
          triggerValue.placeholder = "Enter time in seconds";
          break;
        case "altitude":
          triggerValue.placeholder = "Enter altitude in meters";
          break;
        default:
          triggerValue.placeholder = "Enter value";
      }
      // Clear any previous error styling when trigger type changes
      triggerValue.classList.remove("error-field");
    });

    // Validate trigger value on input
    triggerValue.addEventListener("input", function () {
      const validation = validateTriggerValue(triggerType.value, this.value);
      if (!validation.isValid) {
        this.classList.add("error-field");
        this.title = validation.message;
      } else {
        this.classList.remove("error-field");
        this.title = validation.message;
      }
    });
  }

  // Modify the Add Event button handler
  const addEventBtn = document.getElementById("add-event-btn");
  if (addEventBtn) {
    addEventBtn.addEventListener("click", function (e) {
      e.preventDefault();

      // Get form elements with null checks
      const eventFlagElement = document.getElementById("event-flag");
      const heatShieldFlagElement = document.getElementById("heat-shield-flag");
      const triggerTypeElement = document.getElementById("trigger-type");
      const triggerValueElement = document.getElementById("trigger-value");
      const referenceFlagElement = document.getElementById("dependent-event");
      const commentElement = document.getElementById("event-comment");

      // Get the event flag value based on which input is visible
      const eventFlag = heatShieldFlagElement
        ? heatShieldFlagElement.value
        : eventFlagElement.value;

      // Validate that all required elements exist
      if (
        (!eventFlagElement && !heatShieldFlagElement) ||
        !triggerTypeElement ||
        !triggerValueElement ||
        !referenceFlagElement
      ) {
        Swal.fire({
          icon: "error",
          title: "Form Error",
          text: "Required form elements are missing. Please check the form structure.",
          toast: false,
          confirmButtonText: "OK",
        });
        return;
      }

      const triggerType = triggerTypeElement.value;
      const triggerValue = triggerValueElement.value;
      const referenceFlag = referenceFlagElement.value;
      const comment = commentElement ? commentElement.value : "";

      // Validate required fields
      let errors = [];

      if (!eventFlag) {
        errors.push("Event Flag is required");
        if (eventFlagElement && eventFlagElement.style.display !== "none") {
          eventFlagElement.classList.add("error-field");
        }
      }

      if (!triggerType) {
        errors.push("Trigger Type is required");
        triggerTypeElement.classList.add("error-field");
      }

      if (!triggerValue) {
        errors.push("Trigger Value is required");
        triggerValueElement.classList.add("error-field");
      } else {
        const validation = validateTriggerValue(triggerType, triggerValue);
        if (!validation.isValid) {
          errors.push(validation.message);
          triggerValueElement.classList.add("error-field");
        }
      }

      if (!referenceFlag) {
        errors.push("Reference Flag is required");
        referenceFlagElement.classList.add("error-field");
      }

      if (errors.length > 0) {
        Swal.fire({
          icon: "error",
          title: "Validation Error",
          html: errors.join("<br>"),
          toast: false,
          confirmButtonText: "OK",
        });
        return;
      }

      const eventData = {
        flag: eventFlag,
        triggerType: triggerType,
        triggerValue: triggerValue,
        referenceFlag: referenceFlag || "none",
        comment: comment,
      };

      // Add event to sequence
      addEventToSequence(eventData);

      // Reset form
      resetSequenceForm();

      // After adding an event to the sequence, update the stopping flag dropdown
      populateStoppingFlagDropdown();

      // Show success message
      Swal.fire({
        icon: "success",
        title: "Event Added Successfully",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    });
  }

  // CSV upload button handler - enhanced with better error handling
  const csvUploadBtn = document.getElementById("csv-upload-btn");
  const csvUpload = document.getElementById("csv-upload");
  const csvFilename = document.getElementById("csv-filename");
  const clearCsvBtn = document.getElementById("clear-csv-btn");
  const atmosModel = document.getElementById("atmos-model");

  if (csvUploadBtn && csvUpload && csvFilename) {
    csvUploadBtn.addEventListener("click", function (e) {
      e.preventDefault();
      csvUpload.click();
    });

    csvUpload.addEventListener("change", function () {
      if (this.files.length > 0) {
        const file = this.files[0];

        // Validate file type
        if (!file.name.endsWith(".csv") && !file.type.includes("csv")) {
          showWarning(
            "Please select a CSV file. Other file types are not supported for atmospheric data."
          );
          // Clear the selection
          this.value = "";
          return;
        }

        // Validate file size
        if (file.size > 5 * 1024 * 1024) {
          // 5MB limit
          showWarning(
            "The selected file is too large. Please use a file smaller than 5MB."
          );
          // Clear the selection
          this.value = "";
          return;
        }

        // Valid file, proceed with normal flow
        csvFilename.value = file.name;
        csvFilename.classList.remove("error-field");
        clearCsvBtn.style.display = "block";

        // Preview the file contents (first few lines)
        readFileAsText(file)
          .then((content) => {
            const lines = content.split("\n").slice(0, 5);
            console.log("CSV Preview (first 5 lines):", lines);

            // Simple validation check
            if (lines.length < 2) {
              showWarning(
                "The CSV file appears to be empty or has too few lines. Check that it contains proper data."
              );
            }
          })
          .catch((error) => {
            console.error("Error previewing CSV:", error);
          });

        // Disable atmos model dropdown when file is selected
        if (atmosModel) {
          atmosModel.value = "Environment";
          atmosModel.disabled = true;
        }
      } else {
        csvFilename.value = "No file chosen";
        clearCsvBtn.style.display = "none";
        // Enable atmos model dropdown when no file is selected
        if (atmosModel) {
          atmosModel.disabled = false;
        }
      }
    });

    // Clear CSV file handler with improved feedback
    if (clearCsvBtn) {
      clearCsvBtn.addEventListener("click", function (e) {
        e.preventDefault();
        csvUpload.value = "";
        csvFilename.value = "No file chosen";
        clearCsvBtn.style.display = "none";
        // Enable atmos model dropdown when file is cleared
        if (atmosModel) {
          atmosModel.disabled = false;
        }
        if (window.finalMissionData) {
          window.finalMissionData.atmos = null;
        }
        showSuccess("Atmospheric data file has been cleared");
      });
    }
  }

  // Wind data upload button handler - enhanced with better error handling
  const windDataUploadBtn = document.getElementById("wind-data-upload");
  const windDataInput = document.getElementById("wind-data-input");
  const windDataFilename = document.getElementById("wind-data-filename");
  const clearWindBtn = document.getElementById("clear-wind-btn");

  if (windDataUploadBtn && windDataInput && windDataFilename) {
    windDataUploadBtn.addEventListener("click", function (e) {
      e.preventDefault();
      windDataInput.click();
    });

    windDataInput.addEventListener("change", function () {
      if (this.files.length > 0) {
        const file = this.files[0];

        // Validate file type
        if (!file.name.endsWith(".csv") && !file.type.includes("csv")) {
          showWarning(
            "Please select a CSV file. Other file types are not supported for wind data."
          );
          // Clear the selection
          this.value = "";
          return;
        }

        // Validate file size
        if (file.size > 5 * 1024 * 1024) {
          // 5MB limit
          showWarning(
            "The selected file is too large. Please use a file smaller than 5MB."
          );
          // Clear the selection
          this.value = "";
          return;
        }

        // Valid file, proceed with normal flow
        windDataFilename.value = file.name;
        windDataFilename.classList.remove("error-field");
        clearWindBtn.style.display = "block";

        // Preview the file contents (first few lines)
        readFileAsText(file)
          .then((content) => {
            const lines = content.split("\n").slice(0, 5);
            console.log("Wind Data Preview (first 5 lines):", lines);

            // Simple validation check
            if (lines.length < 2) {
              showWarning(
                "The wind data file appears to be empty or has too few lines. Check that it contains proper data."
              );
            }
          })
          .catch((error) => {
            console.error("Error previewing wind data CSV:", error);
          });

        // Clear any existing wind data when a new file is selected
        if (window.finalMissionData) {
          window.finalMissionData.Wind = null;
        }
      } else {
        windDataFilename.value = "No file chosen";
        clearWindBtn.style.display = "none";
      }
    });

    // Clear wind data file handler
    if (clearWindBtn) {
      clearWindBtn.addEventListener("click", function (e) {
        e.preventDefault();
        windDataInput.value = "";
        windDataFilename.value = "No file chosen";
        clearWindBtn.style.display = "none";
        if (window.finalMissionData) {
          window.finalMissionData.Wind = null;
        }
        showSuccess("Wind data file has been cleared");
      });
    }
  }

  // Atmospheric model dropdown handler
  if (atmosModel) {
    atmosModel.addEventListener("change", function () {
      if (this.value !== "Environment") {
        // Disable CSV upload when a model is selected
        if (csvUpload) {
          csvUpload.value = "";
          csvFilename.value = "No file chosen";
          clearCsvBtn.style.display = "none";
          csvUpload.disabled = true;
          csvUploadBtn.style.opacity = "0.5";
          csvUploadBtn.style.cursor = "not-allowed";
        }
      } else {
        // Enable CSV upload when "Environment" is selected
        if (csvUpload) {
          csvUpload.disabled = false;
          csvUploadBtn.style.opacity = "1";
          csvUploadBtn.style.cursor = "pointer";
        }
      }
    });
  }
});

// Function to save mission details
function saveMissionDetails() {
  const missionName = document.getElementById("mission-name").value;
  const mode = document.getElementById("modes").value;
  const tracking = document.getElementById("tracking").checked;
  const date = document.getElementById("mission-date").value;
  const time = document.getElementById("mission-time").value;

  const missionData = {
    mission: {
      mission_name: missionName,
      planet_name: "", // Placeholder, updated in environment save
      MODE: mode,
      tracking_option: tracking ? "ON" : "OFF",
      frame_model: "POST",
      output_frame: "POST",
      UTC: {
        Date: date,
        Time: time,
      },
    },
  };

  // Add start marker
  window.finalMissionData["_mission_data_start"] =
    "--- Mission Details Start ---";
  // Update final data
  updateFinalData(missionData);
  // Add end marker
  window.finalMissionData["_mission_data_end"] = "--- Mission Details End ---";

  console.log("Mission details saved:", JSON.stringify(missionData, null, 2));
  // Optional: Show success message to user
  Swal.fire({
    title: "Mission Details Saved",
    icon: "success",
    timer: 1500,
    showConfirmButton: false,
  });
}

// Function to parse atmospheric model CSV data
function parseAtmosCSV(csvString) {
  const lines = csvString.trim().split("\n");
  const dataArray = [];
  lines.forEach((line) => {
    const trimmedLine = line.trim();
    if (trimmedLine) {
      const values = trimmedLine.split(",").map((value) => {
        const cleanedValue = value.trim();
        // Attempt to parse as float, keep original string if NaN
        const numValue = parseFloat(cleanedValue);
        return isNaN(numValue) ? cleanedValue : numValue;
      });
      dataArray.push(values);
    }
  });
  return dataArray;
}

// Promise-based file reading helper
function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No file provided"));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target.result);
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
}

// Updated to use promise-based processing
function appendEnviroDetails() {
  const planet = document.getElementById("planets").value;
  const atmosModelSelect = document.getElementById("atmos-model");
  const atmosModelValue = atmosModelSelect.value;
  const csvUploadInput = document.getElementById("csv-upload");
  const order = parseInt(document.getElementById("order").value);
  const degree = parseInt(document.getElementById("degree").value);
  const core = document.getElementById("core").value;

  // Update planet name in mission details if available
  if (window.finalMissionData && window.finalMissionData.mission) {
    window.finalMissionData.mission.planet_name = planet.toUpperCase().trim();
  } else {
    console.warn(
      "Mission details not found when trying to update planet name."
    );
  }

  // Base environment data object (without atmos_model initially)
  const enviroData = {
    [planet.toUpperCase().trim()]: {
      // atmos_model will be added conditionally below if no CSV
      Gravity_param: {
        order: order,
        degree: degree,
      },
      coe_info: {
        component: core,
      },
    },
  };

  // Add start marker
  window.finalMissionData["_environment_data_start"] =
    "--- Environment Details Start ---";

  // Logic branch: CSV uploaded vs. Dropdown selected
  const isCsvUploaded = csvUploadInput.files.length > 0;
  const atmosFile = isCsvUploaded ? csvUploadInput.files[0] : null;

  // Chain of operations using Promises
  Promise.resolve()
    .then(() => {
      // First add the basic environment data
      updateFinalData(enviroData);

      // If no CSV, add atmos_model and return null
      if (!isCsvUploaded) {
        if (atmosModelValue !== "Environment") {
          enviroData[planet.toUpperCase().trim()].atmos_model = atmosModelValue;
          updateFinalData(enviroData);
        }
        return null;
      }

      // If CSV is uploaded, read and parse it
      return readFileAsText(atmosFile)
        .then((csvData) => {
          const atmosArray = parseAtmosCSV(csvData);
          updateFinalData({ atmos: atmosArray }); // Add atmos array to root
          console.log("Atmosphere data from CSV added.");
        })
        .catch((error) => {
          console.error("Failed to read atmosphere CSV file:", error);
          // Show error to user
          showError("Failed to read atmosphere CSV file. Please try again.");
        });
    })
    .then(() => {
      // Handle wind data
      const windFile = document.getElementById("wind-data-input").files[0];
      if (windFile) {
        return readFileAsText(windFile)
          .then((csvData) => {
            const windArray = parseAtmosCSV(csvData); // Use standard CSV parser
            updateFinalData({ Wind: windArray }); // Add wind array to root
            console.log("Wind data added.");
          })
          .catch((error) => {
            console.error("Failed to read wind data file:", error);
            // Add default wind data on error
            const defaultWind = [
              ["Altitude", "Zonal", "Meridonal"],
              ["m", "m/s", "m/s"],
              [0, 0, 0],
              [60000, 0, 0],
              [90000, 0, 0],
              [150000, 0, 0],
              [400000, 0, 0],
            ];
            updateFinalData({ Wind: defaultWind });
            console.log("Using default wind data due to error.");
          });
      } else {
        // If no wind file, add default wind data
        const defaultWind = [
          ["Altitude", "Zonal", "Meridonal"],
          ["m", "m/s", "m/s"],
          [0, 0, 0],
          [60000, 0, 0],
          [90000, 0, 0],
          [150000, 0, 0],
          [400000, 0, 0],
        ];
        updateFinalData({ Wind: defaultWind });
        console.log("Using default wind data (no file provided).");
      }
    })
    .finally(() => {
      // Always add the end marker regardless of success/failure
      window.finalMissionData["_environment_data_end"] =
        "--- Environment Details End ---";

      // Show success message
      const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener("mouseenter", Swal.stopTimer);
          toast.addEventListener("mouseleave", Swal.resumeTimer);
        },
      });

      Toast.fire({
        icon: "success",
        title: "Environment details saved successfully!",
      });

      console.log("Environment details processing completed.");
    });
}

// Function to append vehicle details
function appendVehicleDetails() {
  const vehicleName = document.getElementById("vehicle-name").value.trim();
  const vehicleType = document.getElementById("vehicle-type").value;
  const missionName = window.finalMissionData?.mission?.mission_name;

  // --- Basic Validation ---
  if (!vehicleName) {
    console.error("Vehicle name not found when appending details.");
    Swal.fire({
      icon: "error",
      title: "Vehicle Name Missing",
      text: "Please enter a vehicle name before saving.",
      toast: false,
      confirmButtonText: "OK",
    });
    return; // Exit if no vehicle name
  }
  if (!missionName) {
    console.error("Mission name not found in finalMissionData.");
    Swal.fire({
      icon: "error",
      title: "Mission Name Missing",
      text: "Please save mission details before saving vehicle details.",
      toast: false,
      confirmButtonText: "OK",
    });
    return; // Exit if no mission name
  }
  // --- End Basic Validation ---

  // Define expected non-mission keys to avoid accidental deletion
  const payloadNameInput = document.getElementById("payload-name");
  const payloadName =
    payloadNameInput.value.trim() || payloadNameInput.placeholder || "payload";
  const knownNonMissionKeys = [
    vehicleName, // Current vehicle name
    window.currentEditingVehicleName, // Previous vehicle name (if different)
    payloadName, // Current payload name
    "Heatshield",
    "Location_1",
    "initial_state1", // Standard keys
    // Add payload name associated with old vehicle name if vehicle name changed
    ...(window.currentEditingVehicleName &&
    window.currentEditingVehicleName !== vehicleName &&
    window.finalMissionData[window.currentEditingVehicleName]?.payload
      ? [window.finalMissionData[window.currentEditingVehicleName].payload]
      : []),
    // Add other known keys if necessary
  ].filter(Boolean); // Filter out null/undefined potentially from currentEditingVehicleName

  // --- Cleanup old VEHICLE entry if vehicle name changed ---
  if (
    window.currentEditingVehicleName &&
    window.currentEditingVehicleName !== vehicleName &&
    window.finalMissionData[window.currentEditingVehicleName]
  ) {
    console.log(
      `Vehicle name changed. Removing old vehicle data: ${window.currentEditingVehicleName}`
    );
    // Clean up associated payload first if its name is different and it exists
    const oldPayloadName =
      window.finalMissionData[window.currentEditingVehicleName]?.payload;
    if (
      oldPayloadName &&
      oldPayloadName !== payloadName &&
      window.finalMissionData[oldPayloadName]
    ) {
      console.log(`Removing old payload data: ${oldPayloadName}`);
      delete window.finalMissionData[oldPayloadName];
    }
    // Delete old vehicle data and associated steering/sequence
    delete window.finalMissionData[window.currentEditingVehicleName];
    delete window.finalMissionData[
      `${window.currentEditingVehicleName}_Steering`
    ];
    delete window.finalMissionData[
      `${window.currentEditingVehicleName}_Sequence`
    ];
  }
  // --- End Cleanup old VEHICLE entry ---

  // --- Cleanup old MISSION LINK entry ---
  // Determine which vehicle name to look for in existing mission links
  const vehicleNameToSearch =
    window.currentEditingVehicleName &&
    window.currentEditingVehicleName !== vehicleName
      ? window.currentEditingVehicleName // If vehicle name changed recently, the old mission link points to the OLD vehicle name
      : vehicleName; // Otherwise, the link points to the current vehicle name

  for (const key in window.finalMissionData) {
    // Skip if the key is the new mission name or a known non-mission key
    if (
      key === missionName ||
      knownNonMissionKeys.includes(key) ||
      key.endsWith("_Steering") ||
      key.endsWith("_Sequence") ||
      key.startsWith("_")
    ) {
      continue;
    }

    const entry = window.finalMissionData[key];
    // Check if it looks like a mission link and points to the relevant vehicle
    if (
      entry &&
      typeof entry === "object" &&
      Array.isArray(entry.vehicle) &&
      entry.vehicle.includes(vehicleNameToSearch) // Check if it points to the correct vehicle name
    ) {
      console.log(
        `Found old mission link '${key}' pointing to vehicle '${vehicleNameToSearch}'. Removing it.`
      );
      delete window.finalMissionData[key];
      break; // Assume only one mission link points to a vehicle at a time
    }
  }
  // --- End Cleanup old MISSION LINK entry ---

  // Construct the primary vehicle key
  const vehicleKey = `${vehicleName}`;

  // Initialize the data object to be merged
  let finalUpdateData = {};

  // --- Get integration, payload, and PLF details ---
  const integrationMethod = document.getElementById("integration-method").value;
  const timeStep = parseFloat(document.getElementById("time-step").value) || 0; // Ensure float, default 0
  const effectiveAlt =
    parseFloat(document.getElementById("effective-alt").value) || 0; // Ensure float, default 0
  const payloadMass =
    parseFloat(document.getElementById("payload-mass").value) || 0; // Ensure float, default 0
  const plfMass = parseFloat(document.getElementById("plf-mass").value) || 0; // Ensure float, default 0
  const plfName = document.getElementById("plf-name")?.value || "Heatshield"; // Use readonly field or default
  const vehicleDCISS = document.getElementById("vehicle-dciss")?.checked; // Get vehicle DCISS toggle state (using the correct ID)
  // const plfDCISS = document.getElementById("plf-dciss-toggle")?.checked; // REMOVED: Incorrect assumption of separate toggle
  // --- End Get integration, payload, and PLF details ---

  // --- Build finalUpdateData ---
  finalUpdateData["_vehicle_data_start"] = "--- Vehicle Details Start ---";

  // Basic vehicle structure under vehicleKey
  finalUpdateData[vehicleKey] = {
    no_Stg: window.finalMissionData[vehicleKey]?.no_Stg || 0, // Preserve if exists
    stage: window.finalMissionData[vehicleKey]?.stage || [], // Preserve if exists
    payload: payloadName, // Use payload name string
    plf: plfName, // Use PLF name string (e.g., "Heatshield")
    integration_method: integrationMethod, // Use value from form
    time_step: timeStep, // Use value from form
    effective_altitude: effectiveAlt, // Use value from form
    steering: `${vehicleKey}_Steering`, // Construct steering name
    sequence: `${vehicleKey}_Sequence`, // Construct sequence name
    Initial_condition: "", // Placeholder, set below based on input method
    // REMOVED: DCISS: vehicleDCISS ? "ON" : "OFF", // Add DCISS state
  };

  // --- Add Mission-specific vehicle reference ---
  finalUpdateData[missionName] = {
    vehicle: [vehicleKey], // Array containing the vehicle name key
    vehicle_type: vehicleType.toUpperCase(), // Vehicle type (ASCEND, ORBITAL, etc.) - Convert to uppercase
  };
  // --- End Mission-specific vehicle reference ---

  // Add Payload object (using payloadName as key)
  finalUpdateData[payloadName] = {
    unit: "kg",
    mass: payloadMass, // Use value from form
  };

  // Add Heatshield object (using plfName as key)
  finalUpdateData[plfName] = {
    // Use plfName as key here too
    mass_unit: "kg",
    mass: plfMass, // Use value from form
    ref_area: 0.0,
    sep_flag: "HSS_Flag", // Use the hardcoded flag from HTML readonly input
    descend_drag: null,
    DCISS: vehicleDCISS ? "ON" : "OFF", // Read state from the vehicle DCISS toggle
  };

  // Ensure Initial_States object exists
  if (!finalUpdateData["Initial_States"]) {
    finalUpdateData["Initial_States"] = {};
  }

  // Process Initial Conditions (States, Launch Point, Orbital State)
  const missionUTC = window.finalMissionData?.mission?.UTC || {};
  const dateString = missionUTC.Date || ""; // YYYY-MM-DD
  const timeString = missionUTC.Time || ""; // HH:MM:SS

  let year = "",
    month = "",
    day = "",
    hour = "",
    minute = "",
    second = "";
  if (dateString) {
    const dateParts = dateString.split("-");
    if (dateParts.length === 3) {
      [year, month, day] = dateParts.map((p) => parseInt(p) || "");
    } // Ensure numbers or empty strings
  }
  if (timeString) {
    const timeParts = timeString.split(":");
    if (timeParts.length >= 2) {
      hour = parseInt(timeParts[0]) || "";
      minute = parseInt(timeParts[1]) || "";
      second = timeParts.length === 3 ? parseInt(timeParts[2]) || 0 : 0; // Default seconds to 0
    }
  }

  // Helper to create UTC object
  const createUTC = () => ({
    dd: day,
    mm: month,
    yyyy: year,
    hr: hour,
    min: minute,
    sec: second,
  });

  // Helper to create Quaternion object, checking both state and orbital inputs
  const createQuaternion = (orbital = false) => {
    const q0Id = orbital ? "q0-orbital" : "q0";
    const q1Id = orbital ? "q1-orbital" : "q1";
    const q2Id = orbital ? "q2-orbital" : "q2";
    const q3Id = orbital ? "q3-orbital" : "q3";
    // Ensure elements exist before trying to get value, default to 0 if missing or invalid
    const q0 = parseFloat(document.getElementById(q0Id)?.value) || 0;
    const q1 = parseFloat(document.getElementById(q1Id)?.value) || 0;
    const q2 = parseFloat(document.getElementById(q2Id)?.value) || 0;
    const q3 = parseFloat(document.getElementById(q3Id)?.value) || 0;
    return { q0, q1, q2, q3 };
  };

  if (vehicleType === "ascend" || vehicleType === "projectile") {
    const dataMethod = document.querySelector(
      'input[name="data-method"]:checked'
    )?.value;
    if (dataMethod === "states") {
      // Store state details under top-level key 'initial_state1' within Initial_States
      const initialConditionKey = "initial_state1"; // Define key
      // Create the state vector object
      const stateVectorData = {
        type: "state_vectors",
        X: parseFloat(document.getElementById("X")?.value) || 0,
        Y: parseFloat(document.getElementById("Y")?.value) || 0,
        Z: parseFloat(document.getElementById("Z")?.value) || 0,
        U: parseFloat(document.getElementById("U")?.value) || 0,
        V: parseFloat(document.getElementById("V")?.value) || 0,
        W: parseFloat(document.getElementById("W")?.value) || 0,
        Quaternion: createQuaternion(),
        UTC: createUTC(),
      };
      // Assign it under Initial_States
      finalUpdateData["Initial_States"][initialConditionKey] = stateVectorData;

      // Set the reference in the main vehicle object
      finalUpdateData[vehicleKey].Initial_condition = initialConditionKey;
    } else if (dataMethod === "launch") {
      // Store launch details under top-level key 'Location_1' within Initial_States
      const initialConditionKey = "Location_1"; // Define key
      let launchPointData = {};
      if (vehicleType === "ascend") {
        launchPointData = {
          type: "Launch_Point",
          latitude_unit: "deg",
          latitude: parseFloat(document.getElementById("lat")?.value) || 0,
          longitude_unit: "deg",
          longitude: parseFloat(document.getElementById("long")?.value) || 0,
          azimuth_unit: "deg",
          azimuth: parseFloat(document.getElementById("azimuth")?.value) || 0,
          above_MSL_unit: "m",
          above_MSL: parseFloat(document.getElementById("msl")?.value) || 0,
          height_unit: "m",
          lp_height:
            parseFloat(document.getElementById("lp-height")?.value) || 0,
          launch_set_angle:
            parseFloat(document.getElementById("launch-angle")?.value) || 0,
          roll: parseFloat(document.getElementById("roll")?.value) || 0,
          pitch: parseFloat(document.getElementById("pitch")?.value) || 0,
          yaw: parseFloat(document.getElementById("yaw")?.value) || 0,
        };
      } else {
        // Projectile
        launchPointData = {
          type: "Launch_Point", // Added type for consistency
          latitude: parseFloat(document.getElementById("lat-proj")?.value) || 0,
          longitude:
            parseFloat(document.getElementById("long-proj")?.value) || 0,
          msl: parseFloat(document.getElementById("msl-proj")?.value) || 0,
          azimuth:
            parseFloat(document.getElementById("azimuth-proj")?.value) || 0,
          elevation:
            parseFloat(document.getElementById("elevation")?.value) || 0,
          launch_angle:
            parseFloat(document.getElementById("launch-angle-proj")?.value) ||
            0,
          initial_velocity:
            parseFloat(document.getElementById("initial-velocity")?.value) || 0,
        };
      }
      // Assign it under Initial_States
      finalUpdateData["Initial_States"][initialConditionKey] = launchPointData;

      // Set the reference in the main vehicle object
      finalUpdateData[vehicleKey].Initial_condition = initialConditionKey;
    } else {
      // Handle case where no data method is selected
      console.warn(
        "No data method (States/Launch Point) selected for Ascend/Projectile vehicle."
      );
      finalUpdateData[vehicleKey].Initial_condition = "UNKNOWN"; // Indicate unknown state
    }
  } else if (vehicleType === "orbital") {
    const orbitalMethod = document.querySelector(
      'input[name="orbital-method"]:checked'
    )?.value;
    if (orbitalMethod === "state") {
      // Store orbital state details under top-level key 'initial_state1' within Initial_States
      const initialConditionKey = "initial_state1"; // Define key
      const orbitalStateData = {
        type: "state_vectors",
        X: parseFloat(document.getElementById("X-orbital")?.value) || 0,
        Y: parseFloat(document.getElementById("Y-orbital")?.value) || 0,
        Z: parseFloat(document.getElementById("Z-orbital")?.value) || 0,
        U: parseFloat(document.getElementById("U-orbital")?.value) || 0,
        V: parseFloat(document.getElementById("V-orbital")?.value) || 0,
        W: parseFloat(document.getElementById("W-orbital")?.value) || 0,
        Quaternion: createQuaternion(true), // Use helper with orbital=true
        UTC: createUTC(),
      };
      // Assign it under Initial_States
      finalUpdateData["Initial_States"][initialConditionKey] = orbitalStateData;

      // Set the reference in the main vehicle object
      finalUpdateData[vehicleKey].Initial_condition = initialConditionKey;
    } else if (orbitalMethod === "tle") {
      // Store TLE data under top-level key 'TLE_Data_1' within Initial_States
      const initialConditionKey = "TLE_Data_1"; // Define key
      const tleData = {
        line1: document.getElementById("line1")?.value || "",
        line2: document.getElementById("line2")?.value || "",
        start_time:
          parseFloat(document.getElementById("start-time")?.value) || 0,
        stop_time: parseFloat(document.getElementById("stop-time")?.value) || 0,
        step_time: parseFloat(document.getElementById("step-time")?.value) || 0,
      };
      // Assign it under Initial_States
      finalUpdateData["Initial_States"][initialConditionKey] = tleData;

      // Set the reference in the main vehicle object
      finalUpdateData[vehicleKey].Initial_condition = initialConditionKey;
    } else if (orbitalMethod === "elements") {
      // Store orbital elements under top-level key 'Orbital_Elements_1' within Initial_States
      const initialConditionKey = "Orbital_Elements_1"; // Define key
      const elementsData = {
        semi_major_axis:
          parseFloat(document.getElementById("semi-major-axis")?.value) || 0,
        eccentricity:
          parseFloat(document.getElementById("eccentricity")?.value) || 0,
        inclination:
          parseFloat(document.getElementById("inclination")?.value) || 0,
        argument_perigee:
          parseFloat(document.getElementById("argument-perigee")?.value) || 0,
        raan: parseFloat(document.getElementById("raan")?.value) || 0,
        true_anomaly:
          parseFloat(document.getElementById("true-anomaly")?.value) || 0,
      };
      // Assign it under Initial_States
      finalUpdateData["Initial_States"][initialConditionKey] = elementsData;

      // Set the reference in the main vehicle object
      finalUpdateData[vehicleKey].Initial_condition = initialConditionKey;
    } else {
      console.warn(
        "No data method (State/TLE/Elements) selected for Orbital vehicle."
      );
      finalUpdateData[vehicleKey].Initial_condition = "UNKNOWN"; // Indicate unknown state
    }
  }

  // --- End Marker ---
  finalUpdateData["_vehicle_data_end"] = "--- Vehicle Details End ---";

  // Merge vehicle data into finalMissionData using the merging update function
  console.log(
    "Data being sent to updateFinalData:",
    JSON.stringify(finalUpdateData, null, 2)
  );
  updateFinalData(finalUpdateData); // This merges the new data

  // Log the updated structure for verification
  console.log(
    "Updated finalMissionData structure after appendVehicleDetails:",
    JSON.stringify(window.finalMissionData, null, 2)
  );

  // --- Update stored names for next time ---
  window.currentEditingVehicleName = vehicleName;
  window.currentEditingMissionName = missionName;
  // --- End Update stored names ---

  console.log("Vehicle details appended:", finalUpdateData);
}

function saveStageData(stageForm, stageId) {
  const stageNumber = parseInt(stageId.replace("stage", ""));
  const vehicleName = document.getElementById("vehicle-name").value.trim();
  // Construct the key used in appendVehicleDetails
  const vehicleKey = vehicleName ? `${vehicleName}` : null;

  // --- ADD CHECK: Ensure vehicle details are saved first ---
  if (!vehicleKey || !window.finalMissionData[vehicleKey]) {
    console.error(
      `Cannot save stage ${stageNumber}: Vehicle details for '${
        vehicleName || "unnamed vehicle"
      }' have not been saved yet.`
    );
    Swal.fire({
      icon: "error",
      title: "Save Vehicle First",
      text: "Please save the main vehicle details (including name) before saving stage information.",
      toast: false,
      confirmButtonText: "OK",
    });
    return null; // Indicate failure
  }
  // --- END CHECK ---

  // Basic check if stageForm exists
  if (!stageForm) {
    console.error(`Could not find stage form for ID: ${stageId}`);
    return null; // Indicate failure
  }

  const formData = {
    structural_mass:
      parseFloat(
        stageForm.querySelector('input[placeholder="Enter Structural Mass"]')
          ?.value
      ) || 0,
    reference_area:
      parseFloat(
        stageForm.querySelector('input[placeholder="Enter Reference Area"]')
          ?.value
      ) || 0,
    burn_time:
      parseFloat(
        stageForm.querySelector('input[placeholder="Enter Burn Time"]')?.value
      ) || 0,
    dciss:
      stageForm.querySelector(`#dciss-toggle-${stageId}`)?.checked || false,
    coasting:
      stageForm.querySelector(`#coasting-toggle-${stageId}`)?.checked || false,
    aero_data_file:
      stageForm.querySelector(`#aero-filename-${stageId}`)?.value || "",
  };

  // Update stage in savedStages array (internal tracking)
  const stageIndex = savedStages.findIndex(
    (stage) => stage && stage.stage_number === stageNumber
  );

  const stageData = {
    stage_number: stageNumber,
    structural_mass: formData.structural_mass,
    reference_area: formData.reference_area,
    burn_time: formData.burn_time,
    burn_time_identifier: `ST_${stageNumber}_INI`,
    separation_flag: `ST_${stageNumber}_SEP`,
    dciss: formData.dciss,
    coasting: formData.coasting,
    aero_data_file: formData.aero_data_file,
    motors: [], // Initialize motors for new stage data object
  };

  // --- Motor Handling within savedStages ---
  let existingMotors = [];
  if (stageIndex >= 0 && savedStages[stageIndex]) {
    // Preserve existing motors from savedStages when updating
    existingMotors = savedStages[stageIndex].motors || [];
    stageData.motors = existingMotors; // Carry over existing motors

    // Update burn time in existing motor data *within savedStages*
    stageData.motors.forEach((motor) => {
      if (motor) {
        motor.burn_time = formData.burn_time;
      }
    });
  }

  // Update or add stage in savedStages array
  if (stageIndex >= 0) {
    savedStages[stageIndex] = stageData;
  } else {
    savedStages.push(stageData);
  }

  // Sort stages by stage number in savedStages
  savedStages.sort((a, b) => (a?.stage_number || 0) - (b?.stage_number || 0));

  // Update flag registry
  updateFlagRegistry(
    stageNumber,
    stageData.burn_time_identifier,
    stageData.separation_flag
  );

  // --- Update finalMissionData ---
  // Use the vehicleKey constructed earlier (e.g., "Garuda_1")
  if (vehicleKey && window.finalMissionData[vehicleKey]) {
    const stageName = `Stage_${stageNumber}`;

    // Ensure the stage list exists on the vehicle entry
    if (!Array.isArray(window.finalMissionData[vehicleKey].stage)) {
      window.finalMissionData[vehicleKey].stage = [];
    }

    // Add stage name to the vehicle's stage list if not already present
    if (!window.finalMissionData[vehicleKey].stage.includes(stageName)) {
      window.finalMissionData[vehicleKey].stage.push(stageName);
      // Sort stage array numerically by stage number after adding
      window.finalMissionData[vehicleKey].stage.sort((a, b) => {
        const numA = parseInt(a.split("_")[1]);
        const numB = parseInt(b.split("_")[1]);
        return numA - numB;
      });
    }

    // Create or update the top-level stage object in finalMissionData
    const existingStageMotorsInFinal = finalMissionData[stageName]?.motor || [];

    // --- Handle Aero Data ---
    let aeroDataKey = null;
    const aeroFile = stageForm._selectedAeroFile; // Retrieve the stored File object
    let aeroDataFilename = stageData.aero_data_file;

    // First setup the stage data without aero data
    // CHANGE: Create a unique key for this stage's aero data
    const uniqueAeroDataKey = `Stage_${stageNumber}_AeroData`;
    aeroDataKey = aeroFile && aeroDataFilename ? uniqueAeroDataKey : null;

    // CHANGE: Update structure to match desired format
    finalMissionData[stageName] = {
      // Use existing motors or initialize empty array with correct format (e.g., S1_MOTOR1)
      motor: existingStageMotorsInFinal,
      actuator: null, // New default field
      str_mass: stageData.structural_mass, // Renamed from structural_mass
      length: null, // New default field
      ref_area: stageData.reference_area, // Keep as is
      burntime: stageData.burn_time, // Renamed from burn_time
      // CHANGE: Reference the top-level aero data key (string or null)
      // Use the uniqueAeroDataKey determined above
      aero_data: aeroDataKey ? [aeroDataKey] : null, // Wrap the key in an array if it exists, otherwise keep it null
      sample_data: null, // New default field
      inert_mass: null, // New default field
      ini_flag: stageData.burn_time_identifier, // Renamed from burn_time_identifier
      sep_flag: stageData.separation_flag, // Renamed from separation_flag
      strapon: null, // New default field
      descend_drag: null, // New default field (hardcoded)
      DCISS: stageData.dciss ? "ON" : "OFF", // Keep as is
      coasting: stageData.coasting ? "ON" : "OFF", // Keep as is
      // REMOVED: Redundant "motors" array (ensuring it's gone)
    };

    // Process aero data only if a file was selected and has a name - do this asynchronously
    if (aeroFile && aeroDataFilename) {
      // Predict the first motor's ignition flag
      const firstMotorIgnFlag = `S${stageNumber}_M1_IGN`;

      // Create a placeholder immediately so structure exists
      finalMissionData[uniqueAeroDataKey] = {
        Flag: [firstMotorIgnFlag],
        aero: [], // Will be populated when file is processed
      };

      // --- Read and Parse Aero CSV asynchronously ---
      readFileAsText(aeroFile)
        .then((csvContent) => {
          try {
            const parsedAeroData = parseAtmosCSV(csvContent);
            // Update the already-created entry with real data
            finalMissionData[uniqueAeroDataKey].aero = parsedAeroData;
            console.log(
              `Successfully parsed and stored aero data for: ${uniqueAeroDataKey}`
            );
          } catch (parseError) {
            console.error(
              `Error parsing aero CSV file ${aeroDataFilename} for key ${uniqueAeroDataKey}:`,
              parseError
            );
            // Keep placeholder array rather than setting to null
          }
        })
        .catch((error) => {
          console.error(
            `Error reading aero CSV file: ${aeroDataFilename} for key ${uniqueAeroDataKey}`,
            error
          );
          // Keep placeholder array rather than deleting
        });
    }
    // --- End Handle Aero Data ---

    // Remove the redundant 'motors' key if it somehow exists (belt-and-suspenders)
    delete finalMissionData[stageName].motors;

    // Update stage count based on the length of the sorted stage list in the vehicle entry
    window.finalMissionData[vehicleKey].no_Stg =
      window.finalMissionData[vehicleKey].stage.length;

    // Update burn time in motor forms (visual) and in finalMissionData[motorName]
    // This needs to happen *after* the stage structure is potentially updated/created
    existingMotors.forEach((motor, motorIndex) => {
      if (motor) {
        const currentMotorNumber = motorIndex + 1; // Assuming 1-based indexing for motor number
        const motorForm = document.getElementById(
          `${stageId}-motor${currentMotorNumber}-form`
        );
        if (motorForm) {
          const burnTimeInput = motorForm.querySelector(
            'input[placeholder="Enter Burn Time"]'
          );
          if (burnTimeInput) {
            burnTimeInput.value = formData.burn_time;
          }
        }
        // Update finalMissionData for this specific motor's burn time
        // Use the S{}_MOTOR{} format
        const motorName = `S${stageNumber}_MOTOR${currentMotorNumber}`;
        if (finalMissionData[motorName]) {
          // Use the correct field name 'burntime'
          finalMissionData[motorName].burntime = formData.burn_time;
        } else {
          console.warn(
            `Motor ${motorName} not found in finalMissionData during stage save. Burn time update might be missed if motor is saved later.`
          );
        }
      }
    });
  } else {
    console.warn(
      `Vehicle key '${vehicleKey}' not found or not initialized in finalMissionData when saving stage ${stageNumber}. Stage data might not be linked correctly.`
    );
  }

  // Log the stage data
  console.log(`Stage ${stageNumber} saved (internal):`, stageData);
  console.log("Updated savedStages:", savedStages);
  console.log(
    "Updated finalMissionData after saveStageData:",
    JSON.stringify(finalMissionData, null, 2) // Log updated final data
  );

  return stageData; // Return the processed stage data
}

function updateFlagRegistry(stageNumber, initializationFlag, sepFlag) {
  // Find if this stage's flags already exist
  const initIndex = flagRegistry.stages.initializationFlags.findIndex(
    (item) => item.stageNumber === parseInt(stageNumber)
  );

  const sepFlagIndex = flagRegistry.stages.separationFlags.findIndex(
    (item) => item.stageNumber === parseInt(stageNumber)
  );

  // Update or add initialization flag
  if (initIndex >= 0) {
    flagRegistry.stages.initializationFlags[initIndex].flag =
      initializationFlag;
  } else {
    flagRegistry.stages.initializationFlags.push({
      stageNumber: parseInt(stageNumber),
      flag: initializationFlag,
    });
  }

  // Update or add separation flag
  if (sepFlagIndex >= 0) {
    flagRegistry.stages.separationFlags[sepFlagIndex].flag = sepFlag;
  } else {
    flagRegistry.stages.separationFlags.push({
      stageNumber: parseInt(stageNumber),
      flag: sepFlag,
    });
  }

  // Sort flags by stage number
  flagRegistry.stages.initializationFlags.sort(
    (a, b) => a.stageNumber - b.stageNumber
  );
  flagRegistry.stages.separationFlags.sort(
    (a, b) => a.stageNumber - b.stageNumber
  );

  // Log updated registry for debugging
  console.log(
    "Updated Stage Flag Registry:",
    JSON.stringify(flagRegistry.stages, null, 2)
  );
}

function updateHeatShieldFlag(flag) {
  flagRegistry.heatShieldFlags = [{ flag: flag }];
}

function registerMotorFlags(
  stageNumber,
  motorNumber,
  ignitionFlag,
  burnoutFlag,
  cutOffFlag,
  separationFlag
) {
  // Find if this motor's flags already exist
  const motorIndex = flagRegistry.motors.findIndex(
    (motor) =>
      motor.stageNumber === parseInt(stageNumber) &&
      motor.motorNumber === parseInt(motorNumber)
  );

  const motorFlags = {
    stageNumber: parseInt(stageNumber),
    motorNumber: parseInt(motorNumber),
    flags: {
      ignition: ignitionFlag,
      burnout: burnoutFlag,
      cutOff: cutOffFlag,
      separation: separationFlag,
    },
  };

  // Update or add motor flags
  if (motorIndex >= 0) {
    flagRegistry.motors[motorIndex] = motorFlags;
  } else {
    flagRegistry.motors.push(motorFlags);
  }

  // Sort motors by stage number and then motor number
  flagRegistry.motors.sort((a, b) => {
    if (a.stageNumber === b.stageNumber) {
      return a.motorNumber - b.motorNumber;
    }
    return a.stageNumber - b.stageNumber;
  });

  // Log updated registry for debugging
  console.log(
    "Updated Motor Flag Registry:",
    JSON.stringify(flagRegistry.motors, null, 2)
  );
}

function saveMotorData(form, stageNumber, motorNumber) {
  try {
    // Get form elements
    const structuralMass = form.querySelector(
      'input[placeholder="Enter Structural Mass"]'
    );
    const propulsionType = form.querySelector("select.input-field");
    const propulsionMass = form.querySelector(
      'input[placeholder="Enter Propulsion Mass"]'
    );
    const nozzleDiameter = form.querySelector(
      'input[placeholder="Enter Nozzle Diameter"]'
    );
    const thrustFilenameInput = form.querySelector(
      'input[type="text"].filename'
    ); // Get the input element
    const burnTime = form.querySelector(".stage-burn-time"); // Get burn time from hidden input

    // Generate flags with consistent format
    const ignitionFlag = `S${stageNumber}_M${motorNumber}_IGN`;
    const cutOffFlag = `S${stageNumber}_M${motorNumber}_CUTOFF`;
    const burnoutFlag = `S${stageNumber}_M${motorNumber}_Burnout`; // Corrected flag name
    const separationFlag = `ST_${stageNumber}_SEP`;

    // Validate required fields
    if (
      !structuralMass ||
      !propulsionType ||
      !propulsionMass ||
      !nozzleDiameter ||
      !thrustFilenameInput || // Check the input element itself
      !burnTime
    ) {
      throw new Error(
        `One or more required motor form fields are missing for S${stageNumber} M${motorNumber}`
      );
    }

    // Create motor data object with initial/default values
    const thrustFile = form._selectedThrustFile; // Retrieve stored File object from the form
    const parsedCsvData = [
      ["Time", "Thrust", "PropMass"],
      ["s", "kN", "Kg"],
    ]; // Default headers

    // Define motor name according to S{stageNumber}_MOTOR{motorNumber} format
    const motorName = `S${stageNumber}_MOTOR${motorNumber}`;
    // Define nozzle name dynamically
    const nozzleName = `S${stageNumber}_MOTOR${motorNumber}_NOZ1`; // Assuming 1 nozzle for now

    // Create motor data object initially (will be updated by async reader if file exists)
    const motorData = {
      str_mass: parseFloat(structuralMass.value) || 0,
      type_of_prop: propulsionType.value,
      prop_mass: parseFloat(propulsionMass.value) || 0,
      nozzledia: parseFloat(nozzleDiameter.value) || 0,
      burntime: parseFloat(burnTime.value) || 0,
      ign_flag: ignitionFlag,
      burn_out_flag: burnoutFlag,
      cut_off_flags: [cutOffFlag],
      sep_flag: separationFlag,
      no_of_nozzles: 1,
      nozzle: nozzleName, // Use the dynamically generated nozzle name
      thr_time: parsedCsvData, // Start with default/placeholder
    };

    // Register all motor flags (ensure this uses the correct flags generated above)
    registerMotorFlags(
      stageNumber,
      motorNumber,
      ignitionFlag,
      burnoutFlag, // Pass burnout flag
      cutOffFlag,
      separationFlag // Pass stage separation flag
    );

    // Find the stage in savedStages
    const stageIndex = savedStages.findIndex(
      (stage) => stage && stage.stage_number === stageNumber // Safe access
    );

    if (stageIndex !== -1) {
      // Initialize motors array if it doesn't exist
      if (!savedStages[stageIndex].motors) {
        savedStages[stageIndex].motors = [];
      }

      // Add or update motor data IN savedStages
      const motorIndexInSaved = savedStages[stageIndex].motors.findIndex(
        (m) => m && m.motor_number === motorNumber // Check internal number
      );

      const internalMotorData = { ...motorData, motor_number: motorNumber }; // Add internal tracking number

      if (motorIndexInSaved !== -1) {
        savedStages[stageIndex].motors[motorIndexInSaved] = internalMotorData;
      } else {
        // Add new motor at the correct index (motorNumber-1)
        while (savedStages[stageIndex].motors.length < motorNumber) {
          savedStages[stageIndex].motors.push(null); // Pad with null if needed
        }
        savedStages[stageIndex].motors[motorNumber - 1] = internalMotorData;
      }

      // Update finalMissionData
      const vehicleName = document.getElementById("vehicle-name").value.trim();
      const vehicleKey = vehicleName ? `${vehicleName}` : null; // Use vehicle name as key

      if (vehicleKey && window.finalMissionData[vehicleKey]) {
        const stageName = `Stage_${stageNumber}`;

        // Ensure stage object exists in finalMissionData
        if (!finalMissionData[stageName]) {
          console.warn(
            `Stage object ${stageName} not found in finalMissionData when saving motor ${motorName}. Creating minimal stage entry.`
          );
          // Create a minimal stage entry if it doesn't exist
          finalMissionData[stageName] = {
            motor: [],
            burntime: savedStages[stageIndex].burn_time || 0, // Get burntime from saved stage
            // Add other essential stage defaults if necessary
          };
        }

        // Ensure the motor array exists in the stage object
        if (!Array.isArray(finalMissionData[stageName].motor)) {
          finalMissionData[stageName].motor = [];
        }

        // Update or add the motor object using the motorName key (e.g., S1_MOTOR1)
        finalMissionData[motorName] = motorData; // Assign the motor data object

        // Add motor name (e.g., S1_MOTOR1) to the stage's motor array if not already present
        if (!finalMissionData[stageName].motor.includes(motorName)) {
          finalMissionData[stageName].motor.push(motorName);
          // Optional: Sort motor array if needed
          finalMissionData[stageName].motor.sort((a, b) => {
            const numA = parseInt(a.match(/MOTOR(\d+)$/)[1]);
            const numB = parseInt(b.match(/MOTOR(\d+)$/)[1]);
            return numA - numB;
          });
        }

        // Ensure the stage is in the vehicle's stage array (redundant check, but safe)
        if (
          window.finalMissionData[vehicleKey].stage &&
          !window.finalMissionData[vehicleKey].stage.includes(stageName)
        ) {
          window.finalMissionData[vehicleKey].stage.push(stageName);
          // Sort stage array numerically by stage number after adding
          window.finalMissionData[vehicleKey].stage.sort((a, b) => {
            const numA = parseInt(a.split("_")[1]);
            const numB = parseInt(b.split("_")[1]);
            return numA - numB;
          });
          // Update stage count
          window.finalMissionData[vehicleKey].no_Stg =
            window.finalMissionData[vehicleKey].stage.length;
        }
      } else {
        console.error(
          `Vehicle key '${vehicleKey}' not found in finalMissionData when saving motor ${motorName}. Motor data cannot be linked.`
        );
      }
    } else {
      console.error(
        `Stage index not found for stage number ${stageNumber} in savedStages when saving motor.`
      );
    }

    // Process thrust file asynchronously and update the thr_time later if needed
    if (thrustFile) {
      readFileAsText(thrustFile)
        .then((csvContent) => {
          try {
            const parsedThrustData = parseAtmosCSV(csvContent);
            // Update in finalMissionData
            if (finalMissionData[motorName]) {
              finalMissionData[motorName].thr_time = parsedThrustData;
              console.log(`Updated thrust data for ${motorName}`);
            }
            // Also update in savedStages for consistency
            const stageIndex = savedStages.findIndex(
              (s) => s && s.stage_number === stageNumber
            );
            if (stageIndex !== -1) {
              const motorIndex = savedStages[stageIndex].motors.findIndex(
                (m) => m && m.motor_number === motorNumber
              );
              if (motorIndex !== -1) {
                savedStages[stageIndex].motors[motorIndex].thr_time =
                  parsedThrustData;
              }
            }
          } catch (error) {
            console.error(`Error parsing thrust CSV for ${motorName}:`, error);
          }
        })
        .catch((error) => {
          console.error(
            `Error reading thrust CSV file for ${motorName}:`,
            error
          );
        });
    }

    // Log the motor data
    console.log(
      `Motor ${motorName} for Stage ${stageNumber} saved (finalMissionData structure):`,
      motorData
    );
    console.log("Updated savedStages:", savedStages);

    return motorData; // Return the processed motor data
  } catch (error) {
    console.error(
      `Error saving motor data for S${stageNumber} M${motorNumber}:`,
      error
    );
    // Optionally show error to user
    Swal.fire({
      icon: "error",
      title: "Motor Save Error",
      text: `Failed to save motor ${stageNumber}-${motorNumber}. ${error.message}`,
      toast: false,
      confirmButtonText: "OK",
    });
    // Do not return anything or return null to indicate failure
    return null;
  }
}

function updateMotorCutOffFlag(stageNumber, motorNumber) {
  const cutOffFlagField = document.querySelector(
    'input[placeholder="Enter COF Value"]'
  );
  if (cutOffFlagField) {
    cutOffFlagField.value = `S${stageNumber}_M${motorNumber}_CUTOFF`;
    cutOffFlagField.readOnly = true;
  }
}

// Function to update Reference Flag dropdown
function updateReferenceFlagDropdown(currentEventFlag = null) {
  const referenceDropdown = document.getElementById("dependent-event");
  if (!referenceDropdown) return;

  // Clear all existing options and groups
  referenceDropdown.innerHTML = "";

  // Create and add the None option first
  const noneOptgroup = document.createElement("optgroup");
  noneOptgroup.label = "No Reference";
  const noneOption = document.createElement("option");
  noneOption.value = "none";
  noneOption.textContent = "None";
  noneOptgroup.appendChild(noneOption);
  referenceDropdown.appendChild(noneOptgroup);

  // If no events, just keep None option
  if (window.eventSequence.length === 0) {
    return;
  }

  // Create groups with unique flags
  const uniqueGroups = {
    initialization: { label: "Stage Initialization", flags: new Set() },
    separation: { label: "Stage Separation", flags: new Set() },
    ignition: { label: "Motor Ignition", flags: new Set() },
    burnout: { label: "Motor Burnout", flags: new Set() },
  };

  // Collect all unique flags
  window.eventSequence.forEach((event) => {
    const flag = event.flag;
    if (flag === currentEventFlag) return; // Skip current event's flag

    if (flag.match(/ST_\d+_INI$/)) {
      uniqueGroups.initialization.flags.add(flag);
    } else if (flag.match(/ST_\d+_SEP$/)) {
      uniqueGroups.separation.flags.add(flag);
    } else if (flag.match(/S\d+_M\d+_IGN$/)) {
      uniqueGroups.ignition.flags.add(flag);
    } else if (flag.match(/S\d+_M\d+_Burnout$/)) {
      uniqueGroups.burnout.flags.add(flag);
    }
  });

  // Create and append groups only if they have flags
  Object.entries(uniqueGroups).forEach(([groupKey, group]) => {
    if (group.flags.size > 0) {
      // Create new optgroup
      const optgroup = document.createElement("optgroup");
      optgroup.label = group.label;
      optgroup.dataset.groupType = groupKey;

      // Sort and add flags to group
      const sortedFlags = Array.from(group.flags).sort((a, b) => {
        const aNumbers = a.match(/\d+/g).map(Number);
        const bNumbers = b.match(/\d+/g).map(Number);
        // Compare stage numbers first
        if (aNumbers[0] !== bNumbers[0]) {
          return aNumbers[0] - bNumbers[0];
        }
        // If stage numbers are same, compare motor numbers (if they exist)
        return (aNumbers[1] || 0) - (bNumbers[1] || 0);
      });

      // Add options to group
      sortedFlags.forEach((flag) => {
        const option = document.createElement("option");
        option.value = flag;
        option.textContent = flag;
        optgroup.appendChild(option);
      });

      // Append the group to dropdown
      referenceDropdown.appendChild(optgroup);
    }
  });
}

// Function to add event to sequence
function addEventToSequence(eventData) {
  window.eventSequence.push(eventData);

  // Add event to the event list in UI
  const eventList = document.getElementById("event-list");
  const eventItem = document.createElement("div");
  eventItem.className = "event-item";
  eventItem.setAttribute("data-flag", eventData.flag);
  eventItem.setAttribute("draggable", "true");

  eventItem.innerHTML = `
    <div class="drag-handle" title="Drag to reorder">
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="9" cy="12" r="1"></circle>
        <circle cx="9" cy="5" r="1"></circle>
        <circle cx="9" cy="19" r="1"></circle>
        <circle cx="15" cy="12" r="1"></circle>
        <circle cx="15" cy="5" r="1"></circle>
        <circle cx="15" cy="19" r="1"></circle>
      </svg>
    </div>
    <div class="event-content">
      <span class="event-flag" title="Event Flag">${eventData.flag}</span>
      <span class="trigger-type" title="Trigger Type">${
        eventData.triggerType
      }</span>
      <span class="trigger-value" title="Trigger Value">${
        eventData.triggerValue
      }</span>
      <span class="reference-flag" title="Reference Flag">${
        eventData.referenceFlag
      }</span>
      ${
        eventData.comment
          ? `<span class="event-comment" title="Comment">${eventData.comment}</span>`
          : ""
      }
    </div>
    <div class="event-actions">
      <button type="button" class="edit-event" title="Edit Event">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
      </button>
      <button type="button" class="delete-event" title="Delete Event">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"></path>
        </svg>
      </button>
    </div>
  `;

  // Add drag event listeners
  eventItem.addEventListener("dragstart", handleDragStart);
  eventItem.addEventListener("dragend", handleDragEnd);
  eventItem.addEventListener("dragover", handleDragOver);
  eventItem.addEventListener("drop", handleDrop);
  eventItem.addEventListener("dragenter", handleDragEnter);
  eventItem.addEventListener("dragleave", handleDragLeave);

  // Add click handler for edit button
  const editBtn = eventItem.querySelector(".edit-event");
  editBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    openEditEventModal(eventData.flag);
  });

  // Add click handler for delete button
  const deleteBtn = eventItem.querySelector(".delete-event");
  deleteBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Show confirmation dialog
    Swal.fire({
      title: "Delete Event?",
      text: `Are you sure you want to delete this event (${eventData.flag})?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ff3b30",
      cancelButtonColor: "#8e8e93",
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        removeEventFromSequence(eventData.flag);
        // Show success message
        Swal.fire({
          icon: "success",
          title: "Event Deleted",
          text: "The event has been removed from the sequence.",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
      }
    });
  });

  eventList.appendChild(eventItem);

  // Update reference flag dropdown for next event
  updateReferenceFlagDropdown();

  // Dispatch sequenceUpdated event
  document.dispatchEvent(new CustomEvent("sequenceUpdated"));
}

// Function to remove event from sequence - updated to refresh the stopping flag dropdown
function removeEventFromSequence(flag) {
  const index = window.eventSequence.findIndex((event) => event.flag === flag);
  if (index !== -1) {
    window.eventSequence.splice(index, 1);

    // Remove from UI
    const eventItem = document.querySelector(
      `.event-item[data-flag="${flag}"]`
    );
    if (eventItem) {
      eventItem.remove();
    }

    // Update reference flag dropdown
    updateReferenceFlagDropdown();

    // Update any existing events that were referencing this flag
    const eventsReferencingDeletedFlag = window.eventSequence.filter(
      (event) => event.referenceFlag === flag
    );

    if (eventsReferencingDeletedFlag.length > 0) {
      eventsReferencingDeletedFlag.forEach((event) => {
        event.referenceFlag = "none";
        // Update UI for this event
        const eventElement = document.querySelector(
          `.event-item[data-flag="${event.flag}"]`
        );
        if (eventElement) {
          const referenceSpan = eventElement.querySelector(".reference-flag");
          if (referenceSpan) {
            referenceSpan.textContent = "none";
          }
        }
      });
    }

    // ADDED: Update stopping flag dropdown after removing an event
    populateStoppingFlagDropdown();

    // Dispatch sequenceUpdated event
    document.dispatchEvent(new CustomEvent("sequenceUpdated"));
  }
}

// Function to validate trigger value based on trigger type
function validateTriggerValue(triggerType, value) {
  const numValue = parseFloat(value);

  if (isNaN(numValue)) {
    return {
      isValid: false,
      message: "Trigger value must be a number",
    };
  }

  if (numValue < 0) {
    return {
      isValid: false,
      message: "Trigger value cannot be negative",
    };
  }

  switch (triggerType) {
    case "mission-time":
    case "phase-time":
      return {
        isValid: true,
        message: "Value in seconds",
      };
    case "altitude":
      return {
        isValid: true,
        message: "Value in meters",
      };
    default:
      return {
        isValid: false,
        message: "Invalid trigger type",
      };
  }
}

// Function to reset form fields
function resetSequenceForm() {
  const form = document.getElementById("sequence-form");
  if (!form) return;

  // Reset Event Flag dropdown to first option
  const eventFlagDropdown = document.getElementById("event-flag");
  if (eventFlagDropdown) {
    eventFlagDropdown.selectedIndex = 0;
  }

  // Reset Trigger Type dropdown
  const triggerTypeDropdown = document.getElementById("trigger-type");
  if (triggerTypeDropdown) {
    triggerTypeDropdown.selectedIndex = 0;
  }

  // Clear Trigger Value
  const triggerValue = document.getElementById("trigger-value");
  if (triggerValue) {
    triggerValue.value = "";
    triggerValue.placeholder = "Enter value";
  }

  // Reset Reference Flag to None
  const referenceFlag = document.getElementById("dependent-event");
  if (referenceFlag) {
    referenceFlag.selectedIndex = 0;
  }

  // Clear Comment
  const comment = document.getElementById("event-comment");
  if (comment) {
    comment.value = "";
  }

  // Remove any error styling
  form.querySelectorAll(".error-field").forEach((field) => {
    field.classList.remove("error-field");
  });
}

// Add styles for the optgroups in the reference flag dropdown
const style = document.createElement("style");
style.textContent = `
    .input-field optgroup {
        background-color: #1a1a1a;
        color: #888;
        font-size: 0.9em;
        padding: 5px;
        border-bottom: 1px solid #333;
    }
    
    .input-field option {
        background-color: #2a2a2a;
        color: #fff;
        padding: 8px;
    }
    
    .input-field option:hover {
        background-color: #3a3a3a;
    }
`;
document.head.appendChild(style);

// Make finalMissionData accessible globally
window.finalMissionData = finalMissionData;
window.flagRegistry = flagRegistry;

// Function to populate event flag dropdown based on event type
function populateEventFlagDropdown(eventType) {
  const dropdown = document.getElementById("event-flag");
  const eventFlagContainer = dropdown.parentElement;

  console.log("Attempting to populate dropdown for event type:", eventType);
  console.log("Current flagRegistry state:", flagRegistry);

  // Handle heat shield separation differently
  if (eventType === "heat-shield-separation") {
    // Create readonly input if it doesn't exist
    if (!document.getElementById("heat-shield-flag")) {
      const input = document.createElement("input");
      input.type = "text";
      input.id = "heat-shield-flag";
      input.className = "input-field";
      input.value = "HSS_Flag";
      input.readOnly = true;

      // Replace dropdown with input
      dropdown.style.display = "none";
      eventFlagContainer.appendChild(input);
    }
    return;
  }

  // For other event types, show dropdown and remove readonly input if it exists
  const heatShieldInput = document.getElementById("heat-shield-flag");
  if (heatShieldInput) {
    heatShieldInput.remove();
  }
  dropdown.style.display = "block";

  // Clear existing options except the first one
  while (dropdown.options.length > 1) {
    dropdown.remove(1);
  }

  // Get appropriate flags based on event type
  let flags = [];
  switch (eventType) {
    case "stage-start":
      // Only show flags for saved stages
      flags = savedStages.map((stage) => `ST_${stage.stage_number}_INI`);
      break;
    case "stage-separation":
      // Only show flags for saved stages
      flags = savedStages.map((stage) => `ST_${stage.stage_number}_SEP`);
      break;
    case "motor-ignition":
      // Get ignition flags from the motor flag registry
      console.log(
        "Motor Ignition tab selected, flagRegistry.motors:",
        flagRegistry.motors
      );
      if (
        flagRegistry &&
        flagRegistry.motors &&
        flagRegistry.motors.length > 0
      ) {
        console.log("Using flags from flagRegistry.motors");
        flagRegistry.motors.forEach((motor) => {
          flags.push(motor.flags.ignition);
        });
      } else {
        console.log("Falling back to savedStages for motor flags");
        // Fallback to generate from savedStages if flagRegistry is not populated
        savedStages.forEach((stage) => {
          if (stage.motors && stage.motors.length > 0) {
            console.log(
              `Stage ${stage.stage_number} has ${stage.motors.length} motors`
            );
            stage.motors.forEach((motor, index) => {
              const motorNum = index + 1;
              flags.push(`S${stage.stage_number}_M${motorNum}_IGN`);
            });
          } else {
            console.log(`Stage ${stage.stage_number} has no motors defined`);
          }
        });
      }
      break;
    case "motor-termination":
      // Get burnout flags from the motor flag registry
      if (
        flagRegistry &&
        flagRegistry.motors &&
        flagRegistry.motors.length > 0
      ) {
        flagRegistry.motors.forEach((motor) => {
          flags.push(motor.flags.burnout);
        });
      } else {
        // Fallback to generate from savedStages if flagRegistry is not populated
        savedStages.forEach((stage) => {
          if (stage.motors && stage.motors.length > 0) {
            stage.motors.forEach((motor, index) => {
              const motorNum = index + 1;
              flags.push(`S${stage.stage_number}_M${motorNum}_Burnout`);
            });
          }
        });
      }
      break;
  }

  console.log(`Final flags array for ${eventType}:`, flags);

  // Add options to dropdown
  flags.forEach((flag) => {
    const option = document.createElement("option");
    option.value = flag;
    option.textContent = flag;
    dropdown.appendChild(option);
  });

  console.log(
    `Populated event flag dropdown for ${eventType} with flags:`,
    flags
  );
}

// Function to get all available flags from the sequence
function getAllSequenceFlags() {
  const flags = new Set();

  console.log("Checking eventSequence:", window.eventSequence);

  // Check if eventSequence exists and is an array
  if (window.eventSequence && Array.isArray(window.eventSequence)) {
    console.log(
      "Found eventSequence with length:",
      window.eventSequence.length
    );
    window.eventSequence.forEach((event) => {
      if (event && event.flag) {
        console.log("Adding flag:", event.flag);
        flags.add(event.flag);
      }
    });
  } else {
    console.log("eventSequence not found or not an array");
  }

  const sortedFlags = Array.from(flags).sort((a, b) => {
    // Sort by stage number first, then by motor number if present
    const aNumbers = a.match(/\d+/g)?.map(Number) || [];
    const bNumbers = b.match(/\d+/g)?.map(Number) || [];

    if (aNumbers[0] !== bNumbers[0]) {
      return aNumbers[0] - bNumbers[0];
    }
    return (aNumbers[1] || 0) - (bNumbers[1] || 0);
  });

  console.log("Returning sorted flags:", sortedFlags);
  return sortedFlags;
}

// Function to update all reference dropdowns in the steering form
function updateSteeringReferenceDropdowns() {
  const referenceDropdowns = document.querySelectorAll(
    '[data-field="start_reference"], [data-field="stop_reference"]'
  );

  referenceDropdowns.forEach((dropdown) => {
    if (!dropdown.classList.contains("reference")) {
      dropdown.classList.add("reference");
    }
  });

  const selectedComponentId = window.steeringState?.selectedComponentId;
  const sequenceFlags = getAllSequenceFlags();

  referenceDropdowns.forEach((dropdown) => {
    const isStopSection = dropdown.dataset.field === "stop_reference";
    const currentValue = dropdown.value;

    // Clear existing options
    dropdown.innerHTML = "";

    // Add the None option
    const noneOptgroup = document.createElement("optgroup");
    noneOptgroup.label = "No Reference";
    const noneOption = document.createElement("option");
    noneOption.value = "none";
    noneOption.textContent = "None";
    noneOptgroup.appendChild(noneOption);
    dropdown.appendChild(noneOptgroup);

    // Add sequence flags if they exist
    if (sequenceFlags && sequenceFlags.length > 0) {
      const sequenceGroup = document.createElement("optgroup");
      sequenceGroup.label = "Sequence Flags";

      sequenceFlags.forEach((flag) => {
        const option = document.createElement("option");
        option.value = flag;
        option.textContent = flag;
        sequenceGroup.appendChild(option);
      });

      dropdown.appendChild(sequenceGroup);
    }

    // Add steering component flags
    const components = Object.entries(
      window.steeringState?.activeComponents || {}
    );
    const currentComponentIndex = components.findIndex(
      ([id]) => id === selectedComponentId
    );

    if (currentComponentIndex === -1) return;

    // Get flags from previous components only
    const steeringFlags = [];

    components.forEach(([id, comp], index) => {
      // Skip if component is not configured or is the current component
      if (!comp || !comp.config) return;

      // For Start section, only show flags from previous components
      if (!isStopSection && index >= currentComponentIndex) return;

      // For Stop section of current component, add its own Start flag
      if (isStopSection && id === selectedComponentId) {
        if (comp.config.start_trigger_type && comp.config.start_trigger_value) {
          steeringFlags.push({
            value: comp.config.start_identity,
            label: comp.config.start_identity,
          });
        }
        return;
      }

      // For previous components, add both Start and Stop flags if configured
      if (id !== selectedComponentId) {
        if (comp.config.start_trigger_type && comp.config.start_trigger_value) {
          steeringFlags.push({
            value: comp.config.start_identity,
            label: comp.config.start_identity,
          });
        }
        if (comp.config.stop_trigger_type && comp.config.stop_trigger_value) {
          steeringFlags.push({
            value: comp.config.stop_identity,
            label: comp.config.stop_identity,
          });
        }
      }
    });

    // Add steering flags if any exist
    if (steeringFlags.length > 0) {
      const steeringGroup = document.createElement("optgroup");
      steeringGroup.label = "Component Flags";

      steeringFlags.forEach((flag) => {
        const option = document.createElement("option");
        option.value = flag.value;
        option.textContent = flag.value;
        steeringGroup.appendChild(option);
      });

      dropdown.appendChild(steeringGroup);
    }

    // Restore previous value if it exists
    if (
      currentValue &&
      [...dropdown.options].some((opt) => opt.value === currentValue)
    ) {
      dropdown.value = currentValue;
    } else {
      dropdown.value = "none";
    }
  });
}

// Add event listener for sequence updates
document.addEventListener("sequenceUpdated", updateSteeringReferenceDropdowns);

// Update dropdowns when steering form is shown
document.getElementById("steering-btn")?.addEventListener("click", () => {
  setTimeout(updateSteeringReferenceDropdowns, 100);
});

function updateFinalData(newData) {
  console.log("updateFinalData received:", JSON.stringify(newData, null, 2));
  if (typeof newData === "object" && newData !== null) {
    // Deep merge might be safer if newData contains nested objects that need merging,
    // but Object.assign is fine for adding/overwriting top-level keys as done here.
    Object.assign(window.finalMissionData, newData);
    console.log(
      "finalMissionData after Object.assign:",
      JSON.stringify(window.finalMissionData, null, 2)
    );
  } else {
    console.error("Invalid data passed to updateFinalData:", newData);
  }
}

// --- ADDED: Function to Save Steering Configuration to finalMissionData ---
function saveSteeringConfigToFinalData() {
  const vehicleName = document.getElementById("vehicle-name")?.value.trim();
  const sequenceSelect = document.getElementById("sequence");
  const selectedSequence = sequenceSelect ? sequenceSelect.value : "";

  if (!vehicleName) {
    console.error("Cannot save steering config: Vehicle name is missing.");
    showError("Please enter and save the Vehicle Name first."); // Use global showError
    return false;
  }

  const mainSteeringKey = `${vehicleName}_Steering`;
  let steeringUpdate = {};
  let componentKeys = [];
  let allComponentsValid = true;
  let validationErrors = [];

  // Add start marker
  steeringUpdate["_steering_data_start"] = "--- Steering Details Start ---";

  const activeComponents = window.steeringState?.activeComponents || {};

  // Basic check if there are components
  if (Object.keys(activeComponents).length === 0) {
    console.warn("No active steering components to save.");
    // Decide if this is an error or just nothing to do
    // showError("No active steering components configured.");
    // return false; // Or maybe return true if it's not an error state
  }

  // Iterate through active components
  for (const componentId in activeComponents) {
    const component = activeComponents[componentId];
    const config = component.config;

    // Validate if component is fully configured (simple check)
    // You might want more robust validation later
    const isStartValid =
      config.start_trigger_type && config.start_trigger_value;
    const isStopValid = config.stop_trigger_type && config.stop_trigger_value;
    const isSteeringValid = config.steering_type; // Basic check, specific params checked below
    // Add profile CSV validation
    let isProfileCsvValid = true;
    if (config.steering_type === "profile" && !config.profile_csv_data) {
      isProfileCsvValid = false;
      validationErrors.push(
        `${component.displayName}: Profile CSV is required but not uploaded or failed to parse.`
      );
    }

    if (
      !isStartValid ||
      !isStopValid ||
      !isSteeringValid ||
      !isProfileCsvValid
    ) {
      allComponentsValid = false;
      if (!isStartValid)
        validationErrors.push(
          `${component.displayName}: Start configuration incomplete.`
        );
      if (!isStopValid)
        validationErrors.push(
          `${component.displayName}: Stop configuration incomplete.`
        );
      if (!isSteeringValid)
        validationErrors.push(
          `${component.displayName}: Steering type not selected.`
        );
      // Profile CSV error already added
      continue; // Skip this component, but collect errors
    }

    // --- Map trigger types ---
    const mapTriggerType = (type) => {
      switch (type) {
        case "time":
          return "PHASE_TIME";
        case "missiontime":
          return "MISSION_TIME";
        case "profiletime":
          return "PROFILE_TIME"; // Assuming this mapping
        case "altitude":
          return "ALTITUDE";
        default:
          return type.toUpperCase(); // Default fallback
      }
    };

    // --- Map steering types ---
    const mapSteeringType = (type) => {
      switch (type) {
        case "zeroRate":
          return "ZERO_RATE";
        case "constantBodyRate":
          return "CONST_BODYRATE";
        case "clg":
          return "CLG";
        case "profile":
          return "PROFILE";
        // Add mappings for other types if they exist (e.g., verticalAscend -> VERTICAL_ASCEND?)
        case "verticalAscend":
          return "VERTICAL_ASCEND"; // Example
        case "pitchHold":
          return "PITCH_HOLD"; // Example
        case "constantPitch":
          return "CONST_PITCHRATE"; // Example
        case "gravityTurn":
          return "GRAVITY_TURN"; // Example
        case "coasting":
          return "COASTING"; // Example for coasting if it has steering params (likely ZERO_RATE)
        default:
          return type.toUpperCase();
      }
    };

    // Generate a readable component key based on the component type and flag number
    let componentKey = "";
    if (config.start_identity.startsWith("VA_")) {
      const instanceNum = config.start_identity.split("_").pop(); // Get number from VA_START_1
      componentKey = `Vertical_Ascend_${instanceNum}`;
    } else if (config.start_identity.startsWith("PH_")) {
      const instanceNum = config.start_identity.split("_").pop();
      componentKey = `Pitch_Hold_${instanceNum}`;
    } else if (config.start_identity.startsWith("CP_")) {
      const instanceNum = config.start_identity.split("_").pop();
      componentKey = `Constant_Pitch_${instanceNum}`;
    } else if (config.start_identity.startsWith("GT_")) {
      const instanceNum = config.start_identity.split("_").pop();
      componentKey = `Gravity_Turn_${instanceNum}`;
    } else if (config.start_identity.startsWith("PROFILE_")) {
      const instanceNum = config.start_identity.split("_").pop();
      componentKey = `Profile_${instanceNum}`;
    } else if (config.start_identity.startsWith("COASTING_")) {
      const instanceNum = config.start_identity.split("_").pop();
      componentKey = `Coasting_${instanceNum}`;
    } else {
      // Fallback to original naming for unknown types
      componentKey = config.start_identity;
    }
    componentKeys.push(componentKey);

    steeringUpdate[componentKey] = {
      start: {
        identity: config.start_identity,
        trigger: mapTriggerType(config.start_trigger_type),
        value: parseFloat(config.start_trigger_value) || 0,
        reference: config.start_reference,
        comment: config.start_comment || "",
      },
      stop: {
        identity: config.stop_identity,
        trigger: mapTriggerType(config.stop_trigger_type),
        value: parseFloat(config.stop_trigger_value) || 0,
        reference: config.stop_reference,
        comment: config.stop_comment || "",
      },
      steering: {
        type: mapSteeringType(config.steering_type),
        comment: config.steering_comment || "",
      },
    };

    // Add specific steering parameters
    const params = config.steering_params || {};
    switch (config.steering_type) {
      case "constantBodyRate":
        steeringUpdate[componentKey].steering.axis = params.axis;
        steeringUpdate[componentKey].steering.value =
          parseFloat(params.value) || 0;
        break;
      case "clg":
        steeringUpdate[componentKey].steering.algorithm = params.algorithm;
        if (params.algorithm === "aoa") {
          steeringUpdate[componentKey].steering.max_qaoa =
            parseFloat(params.max_qaoa) || 0;
          steeringUpdate[componentKey].steering.alpha_time =
            parseFloat(params.alpha_time) || 0;
        } else if (params.algorithm === "fpa") {
          steeringUpdate[componentKey].steering.pitch_gain =
            parseFloat(params.pitch_gain) || 0;
          steeringUpdate[componentKey].steering.yaw_gain =
            parseFloat(params.yaw_gain) || 0;
        }
        break;
      case "profile":
        // Assign common profile properties first
        steeringUpdate[componentKey].steering.mode = params.mode || "normal"; // Default to normal if not set

        // FIXED: Use proper conversion function for camelCase to UPPER_CASE_WITH_UNDERSCORES
        const convertToUpperUnderscore = (str) => {
          if (!str) return "";
          // Insert underscore before capital letters (except the first char), then uppercase
          return str.replace(/([A-Z])/g, "_$1").toUpperCase();
        };

        steeringUpdate[componentKey].steering.quantity = params.quantity
          ? convertToUpperUnderscore(params.quantity)
          : ""; // Map to uppercase with underscores

        steeringUpdate[componentKey].steering.ind_variable =
          params.independentVar
            ? convertToUpperUnderscore(params.independentVar)
            : ""; // Map to uppercase with underscores

        // Process parsed CSV data based on mode
        const csvData = config.profile_csv_data;
        if (Array.isArray(csvData) && csvData.length > 1) {
          const headers = csvData[0].map((h) => h.trim()); // Get headers from first row
          const numDataRows = csvData.length - 1;
          const colData = {};
          headers.forEach((header) => (colData[header] = [])); // Initialize arrays for each header

          // Populate colData
          for (let i = 1; i < csvData.length; i++) {
            const row = csvData[i];
            headers.forEach((header, index) => {
              if (row[index] !== undefined) {
                const rawValue = row[index];
                const numValue = parseFloat(rawValue);
                colData[header].push(isNaN(numValue) ? rawValue : numValue);
              } else {
                colData[header].push(null);
              }
            });
          }

          // Structure data based on mode
          if (steeringUpdate[componentKey].steering.mode === "normal") {
            // Create the value matrix (row-wise)
            const valueMatrix = [headers]; // Start with header row
            for (let i = 0; i < numDataRows; i++) {
              const dataRow = headers.map((header) => colData[header][i]);
              valueMatrix.push(dataRow);
            }
            steeringUpdate[componentKey].steering.value = valueMatrix;
          } else if (steeringUpdate[componentKey].steering.mode === "step") {
            // Assign data column-wise with capitalized keys, shortening non-Time arrays
            headers.forEach((header) => {
              // Capitalize common headers like Roll, Yaw, Pitch
              let key = header;
              if (["ROLL", "YAW", "PITCH"].includes(header.toUpperCase())) {
                key =
                  header.charAt(0).toUpperCase() +
                  header.slice(1).toLowerCase(); // e.g., ROLL -> Roll
              } else if (header.toUpperCase() === "TIME") {
                key = "Time"; // Ensure Time is capitalized
              }
              // else, keep original header capitalization

              if (key !== "Time") {
                // Shorten arrays other than Time
                steeringUpdate[componentKey].steering[key] = colData[
                  header
                ].slice(0, -1);
              } else {
                steeringUpdate[componentKey].steering[key] = colData[header];
              }
            });
          } else {
            console.warn(
              `Unknown profile mode: ${steeringUpdate[componentKey].steering.mode}. Defaulting to normal structure.`
            );
            // Fallback to normal structure or handle error
            const valueMatrix = [headers]; // Start with header row
            for (let i = 0; i < numDataRows; i++) {
              const dataRow = headers.map((header) => colData[header][i]);
              valueMatrix.push(dataRow);
            }
            steeringUpdate[componentKey].steering.value = valueMatrix;
          }
        } else {
          console.warn(
            `Profile CSV data for ${componentKey} is missing or invalid. Skipping data array generation.`
          );
          // Ensure profile is marked invalid if CSV is required and missing/bad
          if (!config.profile_csv_data) {
            // Check if it was actually missing vs just invalid format
            validationErrors.push(
              `${component.displayName}: Profile CSV is required but not uploaded.`
            );
          } else {
            validationErrors.push(
              `${component.displayName}: Profile CSV data invalid or empty.`
            );
          }
          allComponentsValid = false; // Mark as invalid
        }
        break;
      // Add cases for verticalAscend, pitchHold, etc. if they have specific params (most don't)
      case "coasting":
        // Coasting might imply ZERO_RATE or have specific coasting parameters?
        // Assuming ZERO_RATE for now if no specific params defined.
        if (Object.keys(params).length === 0) {
          steeringUpdate[componentKey].steering.type = "ZERO_RATE"; // Override type if no params
        }
        break;
    }
  }

  // --- Final Validation Check ---
  if (!allComponentsValid) {
    console.error(
      "Steering configuration validation failed:",
      validationErrors
    );
    showError(
      `Please fix the following steering configuration errors:<br><br>${validationErrors.join(
        "<br>"
      )}`
    );
    return false; // Stop saving
  }

  // Add the main steering sequence object
  steeringUpdate[mainSteeringKey] = {
    Steering_Sequence: selectedSequence,
    steering: componentKeys, // Array of component identity keys
  };

  // Add end marker
  steeringUpdate["_steering_data_end"] = "--- Steering Details End ---";

  // Merge into finalMissionData
  updateFinalData(steeringUpdate);

  console.log(
    "Steering configuration saved to finalMissionData:",
    steeringUpdate
  );
  Swal.fire({
    title: "Steering Saved",
    text: "Steering configuration has been saved.",
    icon: "success",
    timer: 2000,
    showConfirmButton: false,
    toast: true,
    position: "top-end",
  });
  return true; // Indicate success
}
// --- END: Function to Save Steering Configuration to finalMissionData ---

// --- ADDED: Function to Save Stopping Condition to finalMissionData ---
function saveStoppingConditionToFinalData() {
  let stoppingCriteria = {};
  let isValid = true;
  let errorMessages = [];

  const selectedCriteriaInput = document.querySelector(
    'input[name="stopping-criteria"]:checked'
  );

  if (!selectedCriteriaInput) {
    isValid = false;
    errorMessages.push(
      "Please select a stopping criterion (Flag, Time, or Altitude)."
    );
  }

  const criteriaType = selectedCriteriaInput
    ? selectedCriteriaInput.value
    : null; // 'flag', 'time', 'altitude'

  // Add start marker
  window.finalMissionData["_stopping_criteria_start"] =
    "--- Stopping Criteria Start ---";

  switch (criteriaType) {
    case "flag":
      const flagNameInput = document.getElementById("flag-name");
      const flagValueInput = document.getElementById("flag-value");
      const flagConditionInput = document.getElementById("flag-condition");

      // Get selected flag from dropdown instead of text input value
      const flagName = flagNameInput ? flagNameInput.value.trim() : "";
      const flagValue = flagValueInput ? parseFloat(flagValueInput.value) : NaN;
      const flagCondition = flagConditionInput ? flagConditionInput.value : "";

      if (!flagName) {
        isValid = false;
        errorMessages.push("Please select a Flag from the dropdown.");
        flagNameInput?.classList.add("error-field");
      } else {
        flagNameInput?.classList.remove("error-field");
      }
      if (isNaN(flagValue)) {
        isValid = false;
        errorMessages.push("Flag Value must be a valid number.");
        flagValueInput?.classList.add("error-field");
      } else {
        flagValueInput?.classList.remove("error-field");
      }

      stoppingCriteria = {
        type: "Flag",
        flag_name: flagName,
        value: flagValue,
        condition: flagCondition.toUpperCase(), // Ensure uppercase
      };
      break;

    case "time":
      const timeValueInput = document.getElementById("time-value");
      const timeConditionInput = document.getElementById("time-condition");
      const timeValue = timeValueInput ? parseFloat(timeValueInput.value) : NaN;
      const timeCondition = timeConditionInput ? timeConditionInput.value : "";

      if (isNaN(timeValue)) {
        isValid = false;
        errorMessages.push("Time Value must be a valid number.");
        timeValueInput?.classList.add("error-field");
      } else {
        timeValueInput?.classList.remove("error-field");
      }

      stoppingCriteria = {
        type: "Time",
        value: timeValue,
        condition: timeCondition.toUpperCase(), // Ensure uppercase
      };
      break;

    case "altitude":
      const altValueInput = document.getElementById("altitude-value");
      const altConditionInput = document.getElementById("altitude-condition");
      const altValue = altValueInput ? parseFloat(altValueInput.value) : NaN;
      const altCondition = altConditionInput ? altConditionInput.value : "";

      if (isNaN(altValue)) {
        isValid = false;
        errorMessages.push("Altitude Value must be a valid number.");
        altValueInput?.classList.add("error-field");
      } else {
        altValueInput?.classList.remove("error-field");
      }

      stoppingCriteria = {
        type: "Altitude",
        value: altValue,
        condition: altCondition.toUpperCase(), // Ensure uppercase
      };
      break;

    default:
      if (criteriaType !== null) {
        isValid = false;
        errorMessages.push("Invalid stopping criteria type selected.");
      }
      break;
  }

  if (!isValid) {
    // Add end marker even on error to avoid leaving hanging markers
    window.finalMissionData["_stopping_criteria_end"] =
      "--- Stopping Criteria End ---";
    // Show error toast
    const errorSummary =
      errorMessages.length > 2
        ? `${errorMessages.slice(0, 2).join(", ")} and ${
            errorMessages.length - 2
          } more issue(s)`
        : errorMessages.join(", ");
    if (
      window.FormValidator &&
      typeof FormValidator.showToastMessage === "function"
    ) {
      FormValidator.showToastMessage(
        "error",
        "Stopping Condition Validation Error",
        `Please fix these issues: ${errorSummary}`
      );
    }
    return false; // Stop saving
  }

  // Merge into finalMissionData
  updateFinalData({ stopping_criteria: stoppingCriteria });

  // Add end marker
  window.finalMissionData["_stopping_criteria_end"] =
    "--- Stopping Criteria End ---";

  console.log(
    "Stopping condition saved to finalMissionData:",
    stoppingCriteria
  );
  Swal.fire({
    title: "Stopping Condition Saved",
    text: "Stopping condition configuration has been saved.",
    icon: "success",
    timer: 2000,
    showConfirmButton: false,
    toast: true,
    position: "top-end",
  });
  return true; // Indicate success
}
// --- END: Function to Save Stopping Condition to finalMissionData ---

// TODO: Add saveNozzleData function here
function saveNozzleData(nozzleForm, stageNumber, motorNumber, nozzleNumber) {
  const diameter =
    parseFloat(
      nozzleForm.querySelector('input[placeholder="Enter nozzle diameter"]')
        .value
    ) || 0;
  const etaThrust =
    parseFloat(
      nozzleForm.querySelector('input[placeholder="Enter ETA thrust"]').value
    ) || 0;
  const zetaThrust =
    parseFloat(
      nozzleForm.querySelector('input[placeholder="Enter Zeta thrust"]').value
    ) || 0;
  const radialDist =
    parseFloat(
      nozzleForm.querySelector('input[placeholder="Enter radial distance"]')
        .value
    ) || 0;
  const phi =
    parseFloat(
      nozzleForm.querySelector('input[placeholder="Enter Phi value"]').value
    ) || 0;
  const sigmaThrust =
    parseFloat(
      nozzleForm.querySelector('input[placeholder="Enter sigma thrust"]').value
    ) || 0;
  const tauThrust =
    parseFloat(
      nozzleForm.querySelector('input[placeholder="Enter thau thrust"]').value
    ) || 0; // Corrected typo from thau to tau
  const epsilonThrust =
    parseFloat(
      nozzleForm.querySelector('input[placeholder="Enter epsilon thrust"]')
        .value
    ) || 0; // Corrected typo from thurst to thrust
  const mu =
    parseFloat(
      nozzleForm.querySelector('input[placeholder="Enter MU value"]').value
    ) || 0;
  const lamda =
    parseFloat(
      nozzleForm.querySelector('input[placeholder="Enter LAMDA value"]').value
    ) || 0;
  const kappa =
    parseFloat(
      nozzleForm.querySelector('input[placeholder="Enter KAPPA value"]').value
    ) || 0;
  const x =
    parseFloat(
      nozzleForm.querySelector('input[placeholder="Enter X value"]').value
    ) || 0;
  const y =
    parseFloat(
      nozzleForm.querySelector('input[placeholder="Enter Y value"]').value
    ) || 0;
  const z =
    parseFloat(
      nozzleForm.querySelector('input[placeholder="Enter Z value"]').value
    ) || 0;

  // Format nozzle data according to the desired structure
  const nozzleData = {
    Diameter: diameter,
    Location: {
      Radial_dist: radialDist,
      Phi: phi,
    },
    mis_alignment: {
      // Assuming 'mis_alignment' is the intended key name
      sigma_thrust: sigmaThrust,
      tau_thrust: tauThrust, // Corrected key name
      epsilon_thrust: epsilonThrust, // Corrected key name and typo
    },
    Orientation: {
      mu: mu,
      lamda: lamda,
      kappa: kappa,
    },
    eta_thrust: etaThrust,
    zeta_thrust: zetaThrust,
    Throat_location: {
      x: x,
      y: y,
      z: z,
    },
  };

  // Generate the unique key for the nozzle
  const nozzleKey = `S${stageNumber}_MOTOR${motorNumber}_NOZ${nozzleNumber}`;

  // --- CHANGE: Add nozzleData as a top-level entry in finalMissionData ---
  window.finalMissionData[nozzleKey] = nozzleData;
  console.log(
    `Added nozzle data to finalMissionData with key ${nozzleKey}:`,
    nozzleData
  );
  // --- END CHANGE ---

  // --- REMOVED: Logic for nesting nozzle data under the motor object ---
  /*
  const vehicleName = window.finalMissionData?.SSPO?.vehicle?.[0]; // Get current vehicle name (assuming single vehicle from SSPO)
  const stageKey = `Stage_${stageNumber}`;
  const motorKey = `S${stageNumber}_MOTOR${motorNumber}`;
  if (
    vehicleName &&
    window.finalMissionData[vehicleName] &&
    window.finalMissionData[stageKey] &&
    window.finalMissionData[motorKey]
  ) {
    if (!window.finalMissionData[motorKey].nozzles) {
      window.finalMissionData[motorKey].nozzles = {};
    }
    window.finalMissionData[motorKey].nozzles[nozzleKey] = nozzleData;
    console.log(`Nested nozzle data for ${nozzleKey} under ${motorKey}`);
  } else {
    console.error(
      `Cannot find correct stage/motor structure (Vehicle: ${vehicleName}, Stage: ${stageKey}, Motor: ${motorKey}) to save nozzle ${nozzleKey}.`
    );
  }
  */
  // --- END REMOVED ---

  // Ensure the corresponding motor object references this nozzleKey.
  // This is handled in saveMotorData which should be called before/during the process.
  const motorKey = `S${stageNumber}_MOTOR${motorNumber}`;
  if (window.finalMissionData[motorKey]) {
    // Assuming only one nozzle per motor for now, directly assign key
    // If multiple nozzles are supported later, this should be an array
    window.finalMissionData[motorKey].nozzle = nozzleKey;
    console.log(`Updated motor ${motorKey} to reference nozzle ${nozzleKey}`);
  } else {
    console.warn(
      `Motor ${motorKey} not found in finalMissionData when trying to link nozzle ${nozzleKey}. Ensure motor is saved first.`
    );
  }

  return nozzleKey; // Return the key or data if needed
}

// --- Placeholder functions for state management (to be implemented) ---

function removeStageFromSavedData(stageNumber) {
  try {
    console.log(`Removing stage ${stageNumber} from savedStages array...`);
    const stageIndex = savedStages?.findIndex(
      (s) => s && s.stage_number === stageNumber
    );

    if (stageIndex === undefined || stageIndex === null) {
      console.warn("savedStages array is not properly initialized.");
      return false;
    }

    if (stageIndex !== -1) {
      savedStages.splice(stageIndex, 1);
      console.log(
        `Successfully removed stage ${stageNumber} from savedStages.`
      );
      return true;
    } else {
      console.warn(
        `Stage ${stageNumber} not found in savedStages for removal.`
      );
      return false;
    }
  } catch (error) {
    console.error(
      `Error while removing stage ${stageNumber} from savedStages:`,
      error
    );
    return false;
  }
}

function removeStageFromFinalData(stageNumber) {
  try {
    console.log(`Removing stage ${stageNumber} from finalMissionData...`);

    if (!window.finalMissionData) {
      console.warn("finalMissionData is not properly initialized.");
      return false;
    }

    // Get current mission and vehicle names
    const missionKeys = Object.keys(finalMissionData).filter(
      (key) =>
        finalMissionData[key] &&
        typeof finalMissionData[key] === "object" &&
        Array.isArray(finalMissionData[key].vehicle)
    );

    if (missionKeys.length === 0) {
      console.warn(
        "No mission with vehicle reference found in finalMissionData."
      );
      return false;
    }

    let success = false;

    // Try to remove stage data from each vehicle in each mission
    for (const missionKey of missionKeys) {
      const vehicles = finalMissionData[missionKey].vehicle || [];

      for (const vehicleKey of vehicles) {
        if (vehicleKey && finalMissionData[vehicleKey]) {
          const stageName = `Stage_${stageNumber}`;
          // Remove from vehicle's stage array
          if (Array.isArray(finalMissionData[vehicleKey].stage)) {
            const stageIndex =
              finalMissionData[vehicleKey].stage.indexOf(stageName);
            if (stageIndex !== -1) {
              finalMissionData[vehicleKey].stage.splice(stageIndex, 1);

              // Update stage count
              finalMissionData[vehicleKey].no_Stg =
                finalMissionData[vehicleKey].stage.length;
              success = true;

              console.log(
                `Removed stage ${stageName} reference from vehicle ${vehicleKey}.`
              );
            }
          }

          // If we found the stage, also remove stage data & related motor/nozzle data
          if (success) {
            // Get motor references before removing stage
            const stageMotors = finalMissionData[stageName]?.motor || [];

            // Remove the stage object itself
            delete finalMissionData[stageName];
            console.log(
              `Removed stage object ${stageName} from finalMissionData.`
            );

            // Remove related motor and nozzle data
            for (const motorKey of stageMotors) {
              if (finalMissionData[motorKey]) {
                // Get nozzle reference before removing motor
                const nozzleKey = finalMissionData[motorKey].nozzle;

                // Remove motor data
                delete finalMissionData[motorKey];
                console.log(
                  `Removed motor object ${motorKey} from finalMissionData.`
                );

                // Remove nozzle data if it exists
                if (nozzleKey && finalMissionData[nozzleKey]) {
                  delete finalMissionData[nozzleKey];
                  console.log(
                    `Removed nozzle object ${nozzleKey} from finalMissionData.`
                  );
                }
              }
            }

            // Remove any aero data for the stage
            const aeroDataKey = `Stage_${stageNumber}_AeroData`;
            if (finalMissionData[aeroDataKey]) {
              delete finalMissionData[aeroDataKey];
              console.log(
                `Removed aero data object ${aeroDataKey} from finalMissionData.`
              );
            }
          }
        }
      }
    }

    return success;
  } catch (error) {
    console.error(
      `Error while removing stage ${stageNumber} from finalMissionData:`,
      error
    );
    return false;
  }
}

function removeStageFlagsFromRegistry(stageNumber) {
  try {
    console.log(`Removing flags for stage ${stageNumber} from flagRegistry...`);

    if (!window.flagRegistry) {
      console.warn("flagRegistry is not properly initialized.");
      return false;
    }

    // Remove stage initialization flags
    if (Array.isArray(flagRegistry.stages?.initializationFlags)) {
      flagRegistry.stages.initializationFlags =
        flagRegistry.stages.initializationFlags.filter(
          (f) => f.stageNumber !== stageNumber
        );
    }

    // Remove stage separation flags
    if (Array.isArray(flagRegistry.stages?.separationFlags)) {
      flagRegistry.stages.separationFlags =
        flagRegistry.stages.separationFlags.filter(
          (f) => f.stageNumber !== stageNumber
        );
    }

    // Remove motor flags for the deleted stage
    if (Array.isArray(flagRegistry.motors)) {
      flagRegistry.motors = flagRegistry.motors.filter(
        (m) => m.stageNumber !== stageNumber
      );
    }

    console.log(
      `Successfully removed flags for stage ${stageNumber} from flagRegistry.`
    );
    return true;
  } catch (error) {
    console.error(
      `Error while removing flags for stage ${stageNumber}:`,
      error
    );
    return false;
  }
}

function updateStageNumberInData(oldNumber, newNumber) {
  // TODO: Implement logic to update stage number references in savedStages, finalMissionData, and flagRegistry.
  console.warn(
    `Attempting to update stage number data from ${oldNumber} to ${newNumber}. This is complex and may require careful checking.`
  );
  // This will be complex, involving renaming keys and updating flag strings.

  // 1. Update savedStages
  if (window.savedStages) {
    const stageIndex = window.savedStages.findIndex(
      (s) => s.stage_number === oldNumber
    );
    if (stageIndex !== -1) {
      window.savedStages[stageIndex].stage_number = newNumber;
      // Update flags within savedStages if they exist and follow pattern
      if (
        window.savedStages[stageIndex].burn_time_identifier ===
        `ST_${oldNumber}_INI`
      ) {
        window.savedStages[
          stageIndex
        ].burn_time_identifier = `ST_${newNumber}_INI`;
      }
      if (
        window.savedStages[stageIndex].separation_flag === `ST_${oldNumber}_SEP`
      ) {
        window.savedStages[stageIndex].separation_flag = `ST_${newNumber}_SEP`;
      }
      // TODO: Update motor flags within savedStages if stored there?
      console.log(
        `Updated stage number in savedStages[${stageIndex}] from ${oldNumber} to ${newNumber}.`
      );
    } else {
      console.warn(`Stage ${oldNumber} not found in savedStages for update.`);
    }
  }

  // 2. Update finalMissionData
  const vehicleName = window.finalMissionData?.SSPO?.vehicle?.[0]; // Assuming single vehicle
  const oldStageKey = `Stage_${oldNumber}`;
  const newStageKey = `Stage_${newNumber}`;

  if (
    vehicleName &&
    window.finalMissionData &&
    window.finalMissionData[vehicleName] &&
    window.finalMissionData[oldStageKey]
  ) {
    // Rename stage key in vehicle's stage array
    if (window.finalMissionData[vehicleName].stage) {
      const stageIndexInVehicle =
        window.finalMissionData[vehicleName].stage.indexOf(oldStageKey);
      if (stageIndexInVehicle !== -1) {
        window.finalMissionData[vehicleName].stage[stageIndexInVehicle] =
          newStageKey;
      }
    }

    // Rename the stage object key itself
    window.finalMissionData[newStageKey] = window.finalMissionData[oldStageKey];
    delete window.finalMissionData[oldStageKey];

    // Update flags within the stage object
    if (
      window.finalMissionData[newStageKey].burn_time_identifier ===
      `ST_${oldNumber}_INI`
    ) {
      window.finalMissionData[
        newStageKey
      ].burn_time_identifier = `ST_${newNumber}_INI`;
    }
    if (
      window.finalMissionData[newStageKey].separation_flag ===
      `ST_${oldNumber}_SEP`
    ) {
      window.finalMissionData[
        newStageKey
      ].separation_flag = `ST_${newNumber}_SEP`;
    }

    // TODO: Update Motor Keys and their internal flags?
    // This requires iterating through motors, renaming keys (e.g., S{old}_MOTOR{x} to S{new}_MOTOR{x}),
    // and updating flags within each motor object (IGN, CUTOFF, Burnout, SEP).
    // console.warn(`Need to implement motor key and flag updates within finalMissionData for stage ${newNumber}.`);

    // Iterate through all keys in finalMissionData to find motors belonging to the old stage number
    const motorKeysToUpdate = Object.keys(window.finalMissionData).filter(
      (key) => key.startsWith(`S${oldNumber}_MOTOR`)
    );

    motorKeysToUpdate.forEach((oldMotorKey) => {
      const motorData = window.finalMissionData[oldMotorKey];
      if (!motorData) return; // Skip if data somehow missing

      // Extract motor number
      const motorNumberMatch = oldMotorKey.match(/_MOTOR(\d+)/);
      if (!motorNumberMatch || !motorNumberMatch[1]) return; // Skip if key format is unexpected
      const motorNumber = motorNumberMatch[1];

      // Create new key
      const newMotorKey = `S${newNumber}_MOTOR${motorNumber}`;

      // Update internal flags
      if (motorData.ignition_flag?.startsWith(`S${oldNumber}_`)) {
        motorData.ignition_flag = motorData.ignition_flag.replace(
          `S${oldNumber}_`,
          `S${newNumber}_`
        );
      }
      if (motorData.burnout_flag?.startsWith(`S${oldNumber}_`)) {
        motorData.burnout_flag = motorData.burnout_flag.replace(
          `S${oldNumber}_`,
          `S${newNumber}_`
        );
      }
      if (motorData.cutoff_flag?.startsWith(`S${oldNumber}_`)) {
        motorData.cutoff_flag = motorData.cutoff_flag.replace(
          `S${oldNumber}_`,
          `S${newNumber}_`
        );
      }
      if (motorData.separation_flag === `ST_${oldNumber}_SEP`) {
        motorData.separation_flag = `ST_${newNumber}_SEP`;
      }

      // TODO: Update Nozzle keys and flags within the motor object if they exist?
      if (motorData.nozzles) {
        // console.warn(`Need to implement nozzle key/flag updates within motor ${newMotorKey}.`);
        // Similar logic: iterate motorData.nozzles, rename keys (S{old}_M{x}_NOZ{y} -> S{new}_...), update internal flags if any.
        const nozzleKeysToUpdate = Object.keys(motorData.nozzles).filter(
          (key) => key.startsWith(`S${oldNumber}_MOTOR${motorNumber}_NOZ`)
        );

        nozzleKeysToUpdate.forEach((oldNozzleKey) => {
          const nozzleData = motorData.nozzles[oldNozzleKey];
          if (!nozzleData) return; // Skip if nozzle data missing

          // Extract nozzle number
          const nozzleNumberMatch = oldNozzleKey.match(/_NOZ(\d+)/);
          if (!nozzleNumberMatch || !nozzleNumberMatch[1]) return; // Skip if key format unexpected
          const nozzleNumber = nozzleNumberMatch[1];

          // Create new nozzle key
          const newNozzleKey = `S${newNumber}_MOTOR${motorNumber}_NOZ${nozzleNumber}`;

          // Update any internal flags within nozzleData if needed (assuming none for now)
          // e.g., if (nozzleData.some_flag?.startsWith(...)) { ... }

          // Rename the nozzle object key within the motor
          motorData.nozzles[newNozzleKey] = nozzleData;
          delete motorData.nozzles[oldNozzleKey];
          console.log(
            `Updated nozzle key within motor ${newMotorKey} from ${oldNozzleKey} to ${newNozzleKey}.`
          );
        });
      }

      // Rename the motor object key
      window.finalMissionData[newMotorKey] = motorData;
      delete window.finalMissionData[oldMotorKey];
      console.log(
        `Updated motor key in finalMissionData from ${oldMotorKey} to ${newMotorKey} and updated internal flags.`
      );
    });
    // End of motor key/flag update

    console.log(
      `Updated stage key in finalMissionData from ${oldStageKey} to ${newStageKey}.`
    );
  } else {
    console.warn(
      `Vehicle ${vehicleName} or stage ${oldStageKey} not found in finalMissionData for update.`
    );
  }

  // 3. Update flagRegistry
  if (window.flagRegistry) {
    // Update stage flags
    if (window.flagRegistry.stages?.initializationFlags) {
      window.flagRegistry.stages.initializationFlags.forEach((flag) => {
        if (flag.stageNumber === oldNumber) flag.stageNumber = newNumber;
        if (flag.flag === `ST_${oldNumber}_INI`)
          flag.flag = `ST_${newNumber}_INI`;
      });
    }
    if (window.flagRegistry.stages?.separationFlags) {
      window.flagRegistry.stages.separationFlags.forEach((flag) => {
        if (flag.stageNumber === oldNumber) flag.stageNumber = newNumber;
        if (flag.flag === `ST_${oldNumber}_SEP`)
          flag.flag = `ST_${newNumber}_SEP`;
      });
    }
    // Update motor flags
    if (window.flagRegistry.motors) {
      window.flagRegistry.motors.forEach((motor) => {
        if (motor.stageNumber === oldNumber) {
          motor.stageNumber = newNumber;
          // Update specific flag strings
          if (motor.flags?.ignition?.startsWith(`S${oldNumber}_`)) {
            motor.flags.ignition = motor.flags.ignition.replace(
              `S${oldNumber}_`,
              `S${newNumber}_`
            );
          }
          if (motor.flags?.burnout?.startsWith(`S${oldNumber}_`)) {
            motor.flags.burnout = motor.flags.burnout.replace(
              `S${oldNumber}_`,
              `S${newNumber}_`
            );
          }
          if (motor.flags?.cutOff?.startsWith(`S${oldNumber}_`)) {
            motor.flags.cutOff = motor.flags.cutOff.replace(
              `S${oldNumber}_`,
              `S${newNumber}_`
            );
          }
          if (motor.flags?.separation === `ST_${oldNumber}_SEP`) {
            motor.flags.separation = `ST_${newNumber}_SEP`;
          }
          // Update motor key if stored? (Assuming not based on structure)
        }
      });
    }
    console.log(
      `Updated stage numbers and flag strings in flagRegistry from ${oldNumber} to ${newNumber}.`
    );
  } else {
    console.warn(`flagRegistry not found, cannot update flags.`);
  }

  // Finally, sort the stages array after updates
  sortSavedStages();
}

function sortSavedStages() {
  // TODO: Implement logic to sort the savedStages array by stage_number.
  // console.warn("Placeholder: Need to implement sortSavedStages");
  // Example:
  if (window.savedStages && Array.isArray(window.savedStages)) {
    window.savedStages.sort((a, b) => a.stage_number - b.stage_number);
    console.log("Sorted savedStages array by stage_number.");
  } else {
    console.warn("savedStages not found or not an array, cannot sort.");
  }
}

function addMotorKeyToStage(stageNumber, motorNumber, motorKey) {
  // TODO: Implement logic to add the motorKey to the correct stage in savedStages.
  // console.warn(`Placeholder: Need to implement addMotorKeyToStage for S${stageNumber} M${motorNumber} (${motorKey})`);
  // Example:
  if (!window.savedStages) {
    console.warn("savedStages not found, cannot add motor key.");
    return;
  }
  const stageIndex = window.savedStages.findIndex(
    (s) => s.stage_number === stageNumber
  );
  if (stageIndex !== -1) {
    if (!window.savedStages[stageIndex].motors) {
      window.savedStages[stageIndex].motors = [];
    }
    // Ensure array is long enough, filling gaps with null
    while (window.savedStages[stageIndex].motors.length < motorNumber) {
      window.savedStages[stageIndex].motors.push(null);
    }
    // Add the key at the correct 0-based index
    window.savedStages[stageIndex].motors[motorNumber - 1] = motorKey;
    console.log(
      `Added motor key ${motorKey} to savedStages[${stageIndex}].motors[${
        motorNumber - 1
      }].`
    );
  } else {
    console.warn(
      `Stage ${stageNumber} not found in savedStages, cannot add motor key ${motorKey}.`
    );
  }
}

// Ensure the module exports necessary functions if using modules
// ... existing code ...

// --- ADDED: Make key functions available globally ---
// Export the showSuccess and showError functions to the window object
window.showSuccess = showSuccess;
window.showError = showError;
window.showWarning = showWarning;
// --- END ADDED ---

// --- ADDED: Event listener management utilities ---
/**
 * Safely adds an event listener to an element with tracking for later cleanup
 * @param {HTMLElement} element - The DOM element to attach the listener to
 * @param {string} eventType - The event type (e.g., 'click', 'change')
 * @param {Function} handler - The event handler function
 * @param {boolean} [options=false] - Event listener options
 */
function safeAddEventListener(element, eventType, handler, options = false) {
  if (!element || !eventType || !handler) return;

  // Create a listeners array on the element if it doesn't exist
  if (!element._eventListeners) {
    element._eventListeners = [];
  }

  // Add the event listener and store it for later cleanup
  element.addEventListener(eventType, handler, options);
  element._eventListeners.push({ eventType, handler, options });

  // Mark the element for easier identification
  element.setAttribute("data-has-listeners", "true");
}

/**
 * Removes all tracked event listeners from an element
 * @param {HTMLElement} element - The DOM element to clean up
 */
function cleanupElementListeners(element) {
  if (!element || !element._eventListeners) return;

  // Remove all tracked listeners
  element._eventListeners.forEach(({ eventType, handler, options }) => {
    element.removeEventListener(eventType, handler, options);
  });

  // Clear the tracking array
  element._eventListeners = [];
  element.removeAttribute("data-has-listeners");
}

/**
 * Recursively removes all event listeners from a form and its elements
 * @param {HTMLFormElement} formElement - The form to clean up
 */
function cleanupFormListeners(formElement) {
  if (!formElement) return;

  // Clean up the form's own listeners
  cleanupElementListeners(formElement);

  // Clean up listeners on all child elements
  const elementsWithListeners = formElement.querySelectorAll(
    '[data-has-listeners="true"]'
  );
  elementsWithListeners.forEach(cleanupElementListeners);

  console.log(
    `Cleaned up event listeners for form: ${formElement.id || "unnamed"}`
  );
}

// Expose cleanup function to window for global access
window.cleanupFormListeners = cleanupFormListeners;
window.safeAddEventListener = safeAddEventListener;
// --- END ADDED ---

// --- ADDED: Function to populate stopping flag dropdown ---
function populateStoppingFlagDropdown() {
  const flagDropdown = document.getElementById("flag-name");
  if (!flagDropdown) return;

  // Remember previous selection
  const prevValue = flagDropdown.value;
  // Clear ALL existing options and optgroups completely
  flagDropdown.innerHTML = "";

  // Add back the placeholder option (will select it only if no valid previous value)
  const placeholderOption = document.createElement("option");
  placeholderOption.value = "";
  placeholderOption.textContent = "Select a stopping flag";
  placeholderOption.disabled = true;
  flagDropdown.appendChild(placeholderOption);

  // Get all sequence flags
  const sequenceFlags = getAllSequenceFlags();

  // Create groups with unique flags - same approach as updateReferenceFlagDropdown
  const uniqueGroups = {
    initialization: { label: "Stage Initialization", flags: new Set() },
    separation: { label: "Stage Separation", flags: new Set() },
    ignition: { label: "Motor Ignition", flags: new Set() },
    burnout: { label: "Motor Burnout", flags: new Set() },
    heatShield: { label: "Heat Shield", flags: new Set() },
  };

  // Add HSS_Flag if not in sequence but available in the system
  if (flagRegistry.heatShieldFlags && flagRegistry.heatShieldFlags.length > 0) {
    flagRegistry.heatShieldFlags.forEach((entry) => {
      if (entry && entry.flag) {
        uniqueGroups.heatShield.flags.add(entry.flag);
      }
    });
  }

  // Always add hard-coded HSS_Flag for heat shield separation
  uniqueGroups.heatShield.flags.add("HSS_Flag");

  // Collect all unique flags from event sequence
  sequenceFlags.forEach((flag) => {
    if (flag.match(/ST_\d+_INI$/)) {
      uniqueGroups.initialization.flags.add(flag);
    } else if (flag.match(/ST_\d+_SEP$/)) {
      uniqueGroups.separation.flags.add(flag);
    } else if (flag.match(/S\d+_M\d+_IGN$/)) {
      uniqueGroups.ignition.flags.add(flag);
    } else if (flag.match(/S\d+_M\d+_Burnout$/)) {
      uniqueGroups.burnout.flags.add(flag);
    } else if (flag === "HSS_Flag") {
      uniqueGroups.heatShield.flags.add(flag);
    }
  });

  // Also add stage flags from flag registry (in case they're not in sequence yet)
  if (flagRegistry.stages && flagRegistry.stages.initializationFlags) {
    flagRegistry.stages.initializationFlags.forEach((entry) => {
      if (entry && entry.flag) {
        uniqueGroups.initialization.flags.add(entry.flag);
      }
    });
  }

  if (flagRegistry.stages && flagRegistry.stages.separationFlags) {
    flagRegistry.stages.separationFlags.forEach((entry) => {
      if (entry && entry.flag) {
        uniqueGroups.separation.flags.add(entry.flag);
      }
    });
  }

  // Add motor flags from registry
  if (flagRegistry.motors && flagRegistry.motors.length > 0) {
    flagRegistry.motors.forEach((motor) => {
      if (motor && motor.flags) {
        if (motor.flags.ignition)
          uniqueGroups.ignition.flags.add(motor.flags.ignition);
        if (motor.flags.burnout)
          uniqueGroups.burnout.flags.add(motor.flags.burnout);
      }
    });
  }

  // Create and append groups only if they have flags
  Object.entries(uniqueGroups).forEach(([groupKey, group]) => {
    if (group.flags.size > 0) {
      // Create new optgroup
      const optgroup = document.createElement("optgroup");
      optgroup.label = group.label;
      optgroup.dataset.groupType = groupKey;

      // Sort and add flags to group
      const sortedFlags = Array.from(group.flags).sort((a, b) => {
        // Extract numbers if they exist
        const aNumbers = a.match(/\d+/g)?.map(Number) || [];
        const bNumbers = b.match(/\d+/g)?.map(Number) || [];

        // If both have stage numbers, compare them
        if (aNumbers.length > 0 && bNumbers.length > 0) {
          // Compare stage numbers first
          if (aNumbers[0] !== bNumbers[0]) {
            return aNumbers[0] - bNumbers[0];
          }
          // If stage numbers are same, compare motor numbers (if they exist)
          return (aNumbers[1] || 0) - (bNumbers[1] || 0);
        }
        // Fallback to string comparison if no numbers
        return a.localeCompare(b);
      });

      // Add options to group
      sortedFlags.forEach((flag) => {
        const option = document.createElement("option");
        option.value = flag;
        option.textContent = flag;
        optgroup.appendChild(option);
      });

      // Append the group to dropdown
      flagDropdown.appendChild(optgroup);
    }
  });

  // Restore previous selection if still available, else select placeholder
  if (
    prevValue &&
    Array.from(flagDropdown.options).some((opt) => opt.value === prevValue)
  ) {
    flagDropdown.value = prevValue;
  } else {
    placeholderOption.selected = true;
  }
  console.log(
    "Populated stopping flag dropdown with flags from sequence and registry, preserved selection:",
    flagDropdown.value
  );
}

// Make the function accessible globally for ui-navigation.js to call
window.populateStoppingFlagDropdown = populateStoppingFlagDropdown;

// --- Get elements for stopping condition form ---
const stoppingRadioButtons = document.querySelectorAll(
  'input[name="stopping-criteria"]'
);
const flagFields = document.getElementById("flag-fields");
const timeFields = document.getElementById("time-fields");
const altitudeFields = document.getElementById("altitude-fields");
const flagInputs = flagFields
  ? flagFields.querySelectorAll("input, select")
  : [];
const timeInputs = timeFields
  ? timeFields.querySelectorAll("input, select")
  : [];
const altitudeInputs = altitudeFields
  ? altitudeFields.querySelectorAll("input, select")
  : [];

// NOTE: The functions disableFields, enableFields, and resetStoppingFields
// are defined in ui-navigation.js and should be used from there
// to avoid duplication. The implementations were removed from here.

// NOTE: The stoppingRadioButtons event listeners are defined in ui-navigation.js
// The ui-navigation.js event handlers will call window.populateStoppingFlagDropdown when needed

// Initial population of flag dropdown if flag stopping condition is checked by default
document.addEventListener("DOMContentLoaded", function () {
  const flagRadio = document.getElementById("stop-flag");
  if (flagRadio && flagRadio.checked) {
    populateStoppingFlagDropdown();
  }
});
// --- END: Function to populate stopping flag dropdown ---

// Update sequence button listener to also refresh the stopping flag dropdown
const sequenceBtn = document.getElementById("sequence-btn");
if (sequenceBtn) {
  sequenceBtn.addEventListener("click", function () {
    // If sequence form has been loaded
    setTimeout(() => {
      // Get the initially active tab's event type (should be 'stage-start')
      const initialTab = document.querySelector(
        '.sequence-tab[data-tab="stage-start"]'
      );
      const initialEventType = initialTab
        ? initialTab.getAttribute("data-tab")
        : null;

      if (initialEventType) {
        // Ensure the tab is visually marked as active
        document
          .querySelectorAll(".sequence-tab")
          .forEach((t) => t.classList.remove("active"));
        initialTab.classList.add("active");

        // Populate the dropdown for the initial tab
        populateEventFlagDropdown(initialEventType);

        // Update the reference dropdown as well
        updateReferenceFlagDropdown();

        // Also update stopping flag dropdown in case it's opened later
        populateStoppingFlagDropdown();

        console.log(
          "Sequence form opened, populated for initial tab:",
          initialEventType
        );
        console.log("Current flagRegistry:", flagRegistry);
      } else {
        console.warn(
          "Initial 'stage-start' tab not found when opening sequence form."
        );
      }
    }, 100); // Small timeout to ensure DOM is ready
  });
}

// Add event listener for sequence updates to also update stopping flag dropdown
document.addEventListener("sequenceUpdated", function () {
  // Update steering reference dropdowns
  updateSteeringReferenceDropdowns();

  // Also update stopping flag dropdown
  populateStoppingFlagDropdown();
});

// Add listener to stopping button to populate flag dropdown when form is opened
const stoppingBtn = document.getElementById("stopping-btn");
if (stoppingBtn) {
  stoppingBtn.addEventListener("click", function () {
    // Short timeout to ensure the form is visible
    setTimeout(() => {
      // Populate flag dropdown when stopping condition form is opened
      populateStoppingFlagDropdown();
      console.log("Stopping condition form opened, populated flag dropdown");
    }, 100);
  });
}

// Function to validate trigger value based on trigger type
function validateTriggerValue(triggerType, value) {
  const numValue = parseFloat(value);

  if (isNaN(numValue)) {
    return {
      isValid: false,
      message: "Trigger value must be a number",
    };
  }

  if (numValue < 0) {
    return {
      isValid: false,
      message: "Trigger value cannot be negative",
    };
  }

  switch (triggerType) {
    case "mission-time":
    case "phase-time":
      return {
        isValid: true,
        message: "Value in seconds",
      };
    case "altitude":
      return {
        isValid: true,
        message: "Value in meters",
      };
    default:
      return {
        isValid: false,
        message: "Invalid trigger type",
      };
  }
}

// Edit Event Modal Functions
function openEditEventModal(eventFlag) {
  const modal = document.getElementById("edit-event-modal");
  const event = window.eventSequence.find((e) => e.flag === eventFlag);

  if (!event) {
    console.error("Event not found:", eventFlag);
    return;
  }

  // Populate modal fields with current event data
  document.getElementById("edit-event-flag").value = event.flag;
  document.getElementById("edit-trigger-type").value = event.triggerType;
  document.getElementById("edit-trigger-value").value = event.triggerValue;
  document.getElementById("edit-event-comment").value = event.comment || "";

  // Populate reference flag dropdown for edit modal
  populateEditEventReferenceDropdown(event.flag, event.referenceFlag);

  // Show modal
  modal.style.display = "block";

  // Store current editing flag
  modal.dataset.editingFlag = eventFlag;
}

function populateEditEventReferenceDropdown(
  currentEventFlag,
  selectedFlag = "none"
) {
  const dropdown = document.getElementById("edit-dependent-event");
  dropdown.innerHTML = '<option value="none">None</option>';

  // Get all available flags except the current event's flag
  const availableFlags = window.eventSequence
    .filter((event) => event.flag !== currentEventFlag)
    .map((event) => event.flag);

  availableFlags.forEach((flag) => {
    const option = document.createElement("option");
    option.value = flag;
    option.textContent = flag;
    if (flag === selectedFlag) {
      option.selected = true;
    }
    dropdown.appendChild(option);
  });

  // Set selected value
  dropdown.value = selectedFlag;
}

function saveEditedEvent() {
  const modal = document.getElementById("edit-event-modal");
  const editingFlag = modal.dataset.editingFlag;

  if (!editingFlag) {
    console.error("No editing flag found");
    return;
  }

  // Get form values
  const eventFlag = document.getElementById("edit-event-flag").value;
  const triggerType = document.getElementById("edit-trigger-type").value;
  const triggerValue = document.getElementById("edit-trigger-value").value;
  const referenceFlag = document.getElementById("edit-dependent-event").value;
  const comment = document.getElementById("edit-event-comment").value;

  // Validate inputs
  if (!triggerType) {
    showError("Please select a trigger type");
    return;
  }

  if (!triggerValue) {
    showError("Please enter a trigger value");
    return;
  }

  const validation = validateTriggerValue(triggerType, triggerValue);
  if (!validation.isValid) {
    showError(validation.message);
    return;
  }

  // Find and update the event in the sequence
  const eventIndex = window.eventSequence.findIndex(
    (e) => e.flag === editingFlag
  );
  if (eventIndex === -1) {
    console.error("Event not found in sequence:", editingFlag);
    return;
  }

  // Update event data
  const updatedEvent = {
    ...window.eventSequence[eventIndex],
    triggerType: triggerType,
    triggerValue: parseFloat(triggerValue),
    referenceFlag: referenceFlag || "none",
    comment: comment,
  };

  window.eventSequence[eventIndex] = updatedEvent;

  // Update UI
  updateEventInUI(updatedEvent);

  // Close modal
  closeEditEventModal();

  // Update reference flag dropdown for main form
  updateReferenceFlagDropdown();

  // Show success message
  showSuccess("Event updated successfully", "Event Saved");

  // Dispatch sequenceUpdated event
  document.dispatchEvent(new CustomEvent("sequenceUpdated"));
}

function updateEventInUI(eventData) {
  const eventItem = document.querySelector(
    `.event-item[data-flag="${eventData.flag}"]`
  );
  if (!eventItem) {
    console.error("Event item not found in UI:", eventData.flag);
    return;
  }

  // Update the event content
  const eventContent = eventItem.querySelector(".event-content");
  eventContent.innerHTML = `
    <span class="event-flag" title="Event Flag">${eventData.flag}</span>
    <span class="trigger-type" title="Trigger Type">${
      eventData.triggerType
    }</span>
    <span class="trigger-value" title="Trigger Value">${
      eventData.triggerValue
    }</span>
    <span class="reference-flag" title="Reference Flag">${
      eventData.referenceFlag
    }</span>
    ${
      eventData.comment
        ? `<span class="event-comment" title="Comment">${eventData.comment}</span>`
        : ""
    }
  `;
}

function closeEditEventModal() {
  const modal = document.getElementById("edit-event-modal");
  modal.style.display = "none";
  delete modal.dataset.editingFlag;

  // Clear form
  document.getElementById("edit-event-flag").value = "";
  document.getElementById("edit-trigger-type").value = "";
  document.getElementById("edit-trigger-value").value = "";
  document.getElementById("edit-dependent-event").value = "none";
  document.getElementById("edit-event-comment").value = "";
}

// Initialize edit event modal event listeners
function initializeEditEventModal() {
  const modal = document.getElementById("edit-event-modal");

  // Close modal handlers
  const closeBtn = document.getElementById("close-edit-event-modal");
  const cancelBtn = document.getElementById("cancel-edit-event");
  const saveBtn = document.getElementById("save-edit-event");

  closeBtn.addEventListener("click", closeEditEventModal);
  cancelBtn.addEventListener("click", closeEditEventModal);
  saveBtn.addEventListener("click", saveEditedEvent);

  // Close modal when clicking outside
  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeEditEventModal();
    }
  });
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  initializeEditEventModal();
});

// Drag and Drop Variables
let draggedElement = null;
let draggedFlag = null;
let dropIndicator = null;

// Drag and Drop Event Handlers
function handleDragStart(e) {
  draggedElement = this;
  draggedFlag = this.getAttribute("data-flag");
  this.classList.add("dragging");

  // Set drag data
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/html", this.outerHTML);
  e.dataTransfer.setData("text/plain", draggedFlag);
}

function handleDragEnd(e) {
  this.classList.remove("dragging");

  // Clean up
  if (dropIndicator && dropIndicator.parentNode) {
    dropIndicator.parentNode.removeChild(dropIndicator);
  }
  dropIndicator = null;
  draggedElement = null;
  draggedFlag = null;

  // Remove drag-over classes from all items
  document.querySelectorAll(".event-item.drag-over").forEach((item) => {
    item.classList.remove("drag-over");
  });
}

function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }

  e.dataTransfer.dropEffect = "move";
  return false;
}

function handleDragEnter(e) {
  if (this !== draggedElement) {
    this.classList.add("drag-over");
  }
}

function handleDragLeave(e) {
  // Only remove drag-over if we're actually leaving the element
  if (!this.contains(e.relatedTarget)) {
    this.classList.remove("drag-over");
  }
}

function handleDrop(e) {
  if (e.stopPropagation) {
    e.stopPropagation();
  }

  if (this !== draggedElement) {
    const eventList = document.getElementById("event-list");
    const draggedIndex = Array.from(eventList.children).indexOf(draggedElement);
    const targetIndex = Array.from(eventList.children).indexOf(this);

    // Reorder elements in the DOM
    if (draggedIndex < targetIndex) {
      // Moving down
      this.parentNode.insertBefore(draggedElement, this.nextSibling);
    } else {
      // Moving up
      this.parentNode.insertBefore(draggedElement, this);
    }

    // Reorder the eventSequence array
    reorderEventSequence(draggedFlag, this.getAttribute("data-flag"));

    // Show success message
    showSuccess("Event sequence reordered successfully!", "Sequence Updated");
  }

  this.classList.remove("drag-over");
  return false;
}

function reorderEventSequence(draggedFlag, targetFlag) {
  const draggedIndex = window.eventSequence.findIndex(
    (event) => event.flag === draggedFlag
  );
  const targetIndex = window.eventSequence.findIndex(
    (event) => event.flag === targetFlag
  );

  if (draggedIndex !== -1 && targetIndex !== -1) {
    // Remove the dragged item
    const draggedItem = window.eventSequence.splice(draggedIndex, 1)[0];

    // Insert it at the new position
    const newTargetIndex =
      draggedIndex < targetIndex ? targetIndex : targetIndex;
    window.eventSequence.splice(newTargetIndex, 0, draggedItem);

    // Dispatch sequenceUpdated event
    document.dispatchEvent(new CustomEvent("sequenceUpdated"));

    // Update any dependencies that might be affected
    updateReferenceFlagDropdown();
  }
}

// Initialize drag and drop tooltip for event list
function initializeEventSequenceDragDrop() {
  const eventList = document.getElementById("event-list");
  if (eventList && !eventList.querySelector(".drag-tooltip")) {
    const tooltip = document.createElement("div");
    tooltip.className = "drag-tooltip";
    tooltip.textContent =
      "Drag events to reorder • Click icons to edit or delete";
    eventList.appendChild(tooltip);
  }
}

// Initialize drag and drop when the sequence form is shown
document.addEventListener("DOMContentLoaded", function () {
  // Initialize tooltip when sequence form becomes visible
  const sequenceBtn = document.getElementById("sequence-btn");
  if (sequenceBtn) {
    sequenceBtn.addEventListener("click", function () {
      setTimeout(() => {
        initializeEventSequenceDragDrop();
      }, 100);
    });
  }

  // Also initialize if sequence form is already visible
  const sequenceForm = document.getElementById("sequence-form");
  if (sequenceForm && !sequenceForm.classList.contains("hidden")) {
    initializeEventSequenceDragDrop();
  }
});
