// Optimization Module for Astra GUI
document.addEventListener("DOMContentLoaded", function () {
  console.log("Optimization module loaded");

  // =========================================
  // OBJECTIVE FUNCTION ELEMENTS
  // =========================================
  const objectiveFunctionContainer = document.getElementById(
    "objective-function-container"
  );
  const addObjectiveBtn = document.getElementById("add-objective-btn");

  const MAX_OBJECTIVES = 4;
  let objectiveCount = 0;

  // Form references
  const objectiveFunctionForm = document.getElementById(
    "objective-function-form"
  );
  const constraintsForm = document.getElementById("constraints-form");
  const modeForm = document.getElementById("mode-form");
  const designVariablesForm = document.getElementById("design-variables-form");

  // Function to toggle CSV upload visibility based on toggle state
  function toggleCsvUploadVisibility(mode) {
    const toggleElement = document.getElementById(`${mode}-set-population`);

    // Directly target the upload row or group
    let uploadElement;

    if (mode === "normal") {
      uploadElement = document.getElementById("normal-upload-row");
    } else {
      // For archipelago, try both ID and class selector
      uploadElement = document.getElementById("archipelago-upload-group");
      if (!uploadElement) {
        // Try finding it by form-group with upload-data class
        uploadElement = document.querySelector(
          `.form-group.upload-data[id="${mode}-upload-group"]`
        );
        if (!uploadElement) {
          // As a last resort, try finding any upload-data element in the archipelago section
          uploadElement = document.querySelector(
            `#archipelago-mode-fields .upload-data`
          );
        }
      }
    }

    if (toggleElement && uploadElement) {
      // Use flex for form rows, block for form groups
      const displayValue = mode === "normal" ? "flex" : "block";
      uploadElement.style.display = toggleElement.checked
        ? displayValue
        : "none";
      console.log(`Toggle ${mode} CSV visibility: ${toggleElement.checked}`);
    } else {
      console.warn(
        `Could not find elements to toggle CSV visibility for ${mode} mode`
      );
      if (!toggleElement)
        console.warn(`Toggle element '${mode}-set-population' not found`);
      if (!uploadElement)
        console.warn(`Upload element for ${mode} mode not found`);
    }
  }

  // Simplified function to initialize the CSV upload containers
  function setupCsvUploadContainers() {
    console.log("Setting up CSV upload visibility");

    // For normal mode
    const normalSetPopToggle = document.getElementById("normal-set-population");
    const normalUploadRow = document.getElementById("normal-upload-row");

    if (normalSetPopToggle && normalUploadRow) {
      // Initialize visibility based on toggle state - use flex for form rows
      normalUploadRow.style.display = normalSetPopToggle.checked
        ? "flex"
        : "none";
      console.log(
        `Normal mode CSV visibility initialized: ${normalSetPopToggle.checked}`
      );
    } else if (normalSetPopToggle) {
      console.warn("Normal upload row element not found");
    }

    // For archipelago mode
    const archipelagoSetPopToggle = document.getElementById(
      "archipelago-set-population"
    );

    // Use the same robust element finding strategy
    let archipelagoUploadElement = document.getElementById(
      "archipelago-upload-group"
    );
    if (!archipelagoUploadElement) {
      // Try finding it by form-group with upload-data class
      archipelagoUploadElement = document.querySelector(
        '.form-group.upload-data[id="archipelago-upload-group"]'
      );
      if (!archipelagoUploadElement) {
        // As a last resort, try finding any upload-data element in the archipelago section
        archipelagoUploadElement = document.querySelector(
          "#archipelago-mode-fields .upload-data"
        );
      }
    }

    if (archipelagoSetPopToggle && archipelagoUploadElement) {
      // Initialize visibility based on toggle state - use block for form groups
      archipelagoUploadElement.style.display = archipelagoSetPopToggle.checked
        ? "block"
        : "none";
      console.log(
        `Archipelago mode CSV visibility initialized: ${archipelagoSetPopToggle.checked}`
      );
    } else if (archipelagoSetPopToggle) {
      console.warn("Archipelago upload element not found");
    }
  }

  // Call this after a short delay to ensure the DOM is fully loaded
  setTimeout(() => {
    setupCsvUploadContainers();

    // Set up event listeners for the toggle buttons
    const normalSetPopToggle = document.getElementById("normal-set-population");
    const archipelagoSetPopToggle = document.getElementById(
      "archipelago-set-population"
    );

    if (normalSetPopToggle) {
      normalSetPopToggle.addEventListener("change", function () {
        toggleCsvUploadVisibility("normal");
      });
    }

    if (archipelagoSetPopToggle) {
      archipelagoSetPopToggle.addEventListener("change", function () {
        toggleCsvUploadVisibility("archipelago");
      });
    }

    console.log("CSV upload containers and toggle listeners initialized");
  }, 500);

  // =========================================
  // CONSTRAINT ELEMENTS
  // =========================================
  const constraintNameSelect = document.getElementById("constraint-name");
  const constraintFlagSelect = document.getElementById("constraint-flag");
  const constraintsContainer = document.getElementById("constraints-container");
  const addConstraintBtn = document.getElementById("add-constraint-btn");

  // =========================================
  // DESIGN VARIABLE ELEMENTS
  // =========================================
  const designVariablesContainer = document.getElementById(
    "design-variables-container"
  );
  const addDesignVariableBtn = document.getElementById(
    "add-design-variable-btn"
  );
  const designVariableTemplate = document.getElementById(
    "design-variable-template-content" // Using the template element directly
  );
  const MAX_DESIGN_VARIABLES = 10;
  let designVariableCounter = 0;

  // --- Objective Function Options ---
  const allObjectiveOptions = {
    DUMMY: "None",
    PAYLOAD_MASS: "Total Payload mass",
    BODY_RATES: "Body rates of the vehicle",
    HEAT_FLUX: "Heat Flux",
    SEMI_MAJOR_AXIS: "Semi Major Axis",
    ANGULAR_MOMENTUM: "Angular Momentum",
    ECCENTRICITY: "Eccentricity",
    INCLINATION: "Inclination",
    TRUE_ANOMALY: "True Anomaly",
    ECCENTRIC_ANOMALY: "Eccentric Anomaly",
    MEAN_ANOMALY: "Mean Anomaly",
    RAAN: "Right Ascension of the Ascending Node",
    AOP: "Argument of Perigee",
    PERIGEE_GC_LATITUDE: "Perigee geocentric latitude",
    APOGEE_GC: "Apogee geocentric altitude",
    PERIGEE_GC: "Perigee geocentric altitude",
    TOTAL_ENERGY: "Total Energy",
    QAOA: "Q Angle of Attack",
  };

  // --- Constraint Options ---
  const allConstraintOptions = {
    LIFT_OFF_MASS: "Lift Off Mass",
    MAX_SENSED_ACC: "Max Sensed Acceleration",
    SLACK_VARIABLE: "Slack Variable",
    TOTAL_ENERGY: "Total Energy",
    SEMI_MAJOR_AXIS: "Semi Major Axis",
    ANGULAR_MOMENTUM: "Angular Momentum",
    ECCENTRICITY: "Eccentricity",
    INCLINATION: "Inclination",
    TRUE_ANOMALY: "True Anomaly",
    ECCENTRIC_ANOMALY: "Eccentric Anomaly",
    RAAN: "Right Ascension of the Ascending Node",
    AOP: "Argument of Perigee",
    PERIGEE_GC_LATITUDE: "Perigee Geocentric Latitude",
    PERIGEE_GC: "Perigee Geocentric Altitude",
    APOGEE_GC: "Apogee Geocentric Altitude",
    PERIGEE: "Perigee Altitude",
    APOGEE: "Apogee Altitude",
    STAGE_IMPACT: "Stage Impact Coordinates",
    DCISS_IMPACT: "DCISS Impact",
    MAX_QAOA: "Maximum QAOA",
    Q: "Dynamic Pressure",
    ALPHA: "Angle of Attack",
    MAX_BODY_RATE: "Maximum Body Rate",
    MAX_HEAT_FLUX: "Maximum Heat Flux",
    BODY_RATES: "Body Rates",
    // QAOA: "Q Angle of Attack",
    CUSTOM: "IIP",
  };

  // Make constraint options globally available
  window.allConstraintOptions = allConstraintOptions;

  // Function to get currently selected objective names
  function getSelectedObjectiveNames() {
    const selected = [];
    objectiveFunctionContainer
      .querySelectorAll(".objective-name-select")
      .forEach((select) => {
        if (select.value) {
          selected.push(select.value);
        }
      });
    return selected;
  }

  // Function to get available objective options (excluding already selected ones)
  function getAvailableObjectiveOptions() {
    const selectedNames = getSelectedObjectiveNames();
    const available = {};
    for (const key in allObjectiveOptions) {
      if (!selectedNames.includes(key)) {
        available[key] = allObjectiveOptions[key];
      }
    }
    return available;
  }

  // Function to populate a flag dropdown
  function populateFlagDropdown(selectElement, context) {
    if (!selectElement) {
      console.warn(`Flag dropdown not found for ${context}`);
      return;
    }

    // Clear existing options except placeholder
    const currentValue = selectElement.value; // Preserve selection if possible
    while (selectElement.options.length > 1) {
      selectElement.remove(1);
    }

    try {
      let allFlags = [];
      if (typeof getAllSequenceFlags === "function") {
        allFlags = getAllSequenceFlags();
      } else if (
        window.formHandler &&
        typeof window.formHandler.getAllSequenceFlags === "function"
      ) {
        allFlags = window.formHandler.getAllSequenceFlags();
      } else {
        console.warn(
          `getAllSequenceFlags function not found. Cannot populate flags for ${context}.`
        );
        // Add some placeholder flags for testing
        allFlags = ["FLAG_1", "FLAG_2", "FLAG_3", "MECO", "SECO", "TOUCHDOWN"];
      }

      allFlags.forEach((flag) => {
        if (flag) {
          const option = document.createElement("option");
          option.value = flag;
          option.textContent = flag;
          selectElement.appendChild(option);
        }
      });
      // Restore selection
      selectElement.value = currentValue;
    } catch (error) {
      console.error(`Error populating flag dropdown for ${context}:`, error);
    }
  }

  // Function to add a new objective function form
  function addObjectiveFunctionForm() {
    if (objectiveCount >= MAX_OBJECTIVES) {
      Swal.fire({
        icon: "error",
        title: "Maximum Objectives Reached",
        text: `You can only add up to ${MAX_OBJECTIVES} objective functions.`,
        toast: false,
        confirmButtonText: "OK",
      });
      return;
    }

    objectiveCount++;
    const formIndex = objectiveCount; // Use count for unique IDs

    const formElement = document.createElement("div");
    formElement.classList.add("objective-function-instance", "form-card"); // Added form-card for styling
    formElement.setAttribute("data-index", formIndex);

    // Add a unique form-index class for potential distinct styling based on index
    formElement.classList.add(`objective-form-${formIndex}`);

    // Get options available *at this moment*
    const availableOptions = getAvailableObjectiveOptions();

    // Start with placeholder
    let nameOptionsHTML =
      '<option value="" disabled selected>Select Objective</option>';

    // Add special options first (if available)
    if (availableOptions["DUMMY"]) {
      nameOptionsHTML += `<option value="DUMMY">${availableOptions["DUMMY"]}</option>`;
    }
    if (availableOptions["PAYLOAD_MASS"]) {
      nameOptionsHTML += `<option value="PAYLOAD_MASS">${availableOptions["PAYLOAD_MASS"]}</option>`;
    }

    // Create sorted array for the rest of the options
    const sortedOptions = [];
    for (const key in availableOptions) {
      if (key !== "DUMMY" && key !== "PAYLOAD_MASS") {
        sortedOptions.push({
          value: key,
          text: availableOptions[key],
        });
      }
    }

    // Sort other options alphabetically
    sortedOptions.sort((a, b) => a.text.localeCompare(b.text));

    // Add sorted options
    sortedOptions.forEach((option) => {
      nameOptionsHTML += `<option value="${option.value}">${option.text}</option>`;
    });

    formElement.innerHTML = `
            <button type="button" class="remove-objective-btn remove-btn" title="Remove Objective">&times;</button>
            <h3 class="objective-heading">Objective Function ${formIndex}</h3>
            <div class="form-row">
                <div class="form-group">
                    <label for="objective-name-${formIndex}" class="label">Name:</label>
                    <select id="objective-name-${formIndex}" class="input-field objective-name-select">
                        ${nameOptionsHTML}
                    </select>
                </div>
                <div class="form-group">
                    <label for="objective-type-${formIndex}" class="label">Type:</label>
                    <input type="text" id="objective-type-${formIndex}" class="input-field" value="Objective" readonly>
                </div>
            </div>
            <div class="form-row">
                 <div class="form-group">
                    <label for="objective-flag-${formIndex}" class="label">Flag:</label>
                    <select id="objective-flag-${formIndex}" class="input-field objective-flag-select">
                         <option value="" disabled selected>Select Flag</option>
                         <!-- Options populated by JS -->
                    </select>
                </div>
                <div class="form-group">
                    <label for="objective-factor-${formIndex}" class="label">Factor:</label>
                    <select id="objective-factor-${formIndex}" class="input-field objective-factor-select">
                        <option value="+1">Minimize</option>
                        <option value="-1">Maximize</option>
                    </select>
                </div>
            </div>
        `;

    objectiveFunctionContainer.appendChild(formElement);

    // If not the first form, add a divider before this form
    if (objectiveCount > 1) {
      const divider = document.createElement("div");
      divider.className = "objective-divider";
      objectiveFunctionContainer.insertBefore(divider, formElement);
    }

    // Populate the flag dropdown for the new form
    const flagSelect = formElement.querySelector(
      `#objective-flag-${formIndex}`
    );
    populateFlagDropdown(flagSelect, `Objective ${formIndex}`);

    // Add event listener for the remove button
    formElement
      .querySelector(".remove-objective-btn")
      .addEventListener("click", () => {
        removeObjectiveFunctionForm(formElement);
      });
  }

  // Function to remove an objective function form
  function removeObjectiveFunctionForm(formElement) {
    // Also remove the divider if it exists
    const prevElement = formElement.previousElementSibling;
    if (prevElement && prevElement.classList.contains("objective-divider")) {
      objectiveFunctionContainer.removeChild(prevElement);
    }

    objectiveFunctionContainer.removeChild(formElement);
    objectiveCount--;
  }

  // Function to get objective function data
  function getObjectiveFunctionData() {
    const objectives = [];
    objectiveFunctionContainer
      .querySelectorAll(".objective-function-instance")
      .forEach((formInstance) => {
        const index = formInstance.getAttribute("data-index");
        const nameSelect = formInstance.querySelector(
          `#objective-name-${index}`
        );
        const flagSelect = formInstance.querySelector(
          `#objective-flag-${index}`
        );
        const factorSelect = formInstance.querySelector(
          `#objective-factor-${index}`
        );

        if (nameSelect && nameSelect.value && flagSelect && factorSelect) {
          objectives.push({
            name: nameSelect.value,
            value: "null",
            type: "OBJECTIVE",
            flag: flagSelect.value || null,
            factor: parseInt(factorSelect.value),
          });
        }
      });
    console.log("Collected Objectives:", objectives);
    return objectives;
  }

  // Function to save optimization data
  function saveOptimizationData(section, data) {
    console.log(`Saving ${section} data:`, data);

    // Here you would normally save to backend or update in memory

    // Show success message
    Swal.fire({
      icon: "success",
      title: "Saved",
      text: `${section} data saved successfully!`,
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
    });

    return data;
  }

  // =========================================
  // CONSTRAINT FUNCTIONS
  // =========================================

  // Function to populate constraint name dropdown
  function populateConstraintNameDropdown() {
    if (!constraintNameSelect) return;
    const currentValue = constraintNameSelect.value;
    while (constraintNameSelect.options.length > 1) {
      constraintNameSelect.remove(1);
    }

    // Create an array of options for sorting
    const options = [];
    for (const key in allConstraintOptions) {
      options.push({
        value: key,
        text: allConstraintOptions[key],
      });
    }

    // Sort options alphabetically by text
    options.sort((a, b) => a.text.localeCompare(b.text));

    // Add sorted options to dropdown
    options.forEach((option) => {
      const optionElement = document.createElement("option");
      optionElement.value = option.value;
      optionElement.textContent = option.text;
      constraintNameSelect.appendChild(optionElement);
    });

    constraintNameSelect.value = currentValue;
  }

  // Function to handle constraint name changes
  function handleConstraintNameChange(event) {
    const nameSelect = event.target;
    const instance = nameSelect.closest(".optimization-instance");
    if (!instance) return;

    const constraintType = nameSelect.value;
    const additionalFieldsContainer =
      instance.querySelector(".additional-fields");
    if (!additionalFieldsContainer) return;

    // Clear existing fields
    additionalFieldsContainer.innerHTML = "";

    // Add fields based on constraint type
    if (
      [
        "SEMI_MAJOR_AXIS",
        "ANGULAR_MOMENTUM",
        "ECCENTRICITY",
        "INCLINATION",
        "TRUE_ANOMALY",
        "ECCENTRIC_ANOMALY",
        "RAAN",
        "AOP",
        "PERIGEE_GC_LATITUDE",
        "PERIGEE_GC",
        "APOGEE_GC",
        "PERIGEE",
        "APOGEE",
      ].includes(constraintType)
    ) {
      // These are orbit-related constraints with basic fields
      // No additional fields needed as the common fields are already in the form
      // (name, value, type, condition, flag, factor are part of the base form)
    } else if (constraintType === "STAGE_IMPACT") {
      additionalFieldsContainer.innerHTML = `
        <div class="form-row">
          <div class="form-group">
            <label class="label">Coordinate:</label>
            <select class="input-field constraint-coordinate">
              <option value="" disabled selected>Select Coordinate</option>
              <option value="latitude">Latitude</option>
              <option value="longitude">Longitude</option>
            </select>
          </div>
        </div>
      `;
    } else if (
      [
        "Q",
        "MAX_QAOA",
        "ALPHA",
        "MAX_BODY_RATE",
        "MAX_HEAT_FLUX",
        "SLACK_VARIABLE",
        "MAX_SENSED_ACC",
      ].includes(constraintType)
    ) {
      additionalFieldsContainer.innerHTML = `
        <div class="form-row">
          <div class="form-group">
            <label class="label">Trigger:</label>
            <select class="input-field constraint-trigger">
              <option value="" disabled selected>Select Trigger</option>
              <option value="FLAG">Flag</option>
              <option value="MISSION_TIME">Mission Time</option>
            </select>
          </div>
        </div>
        <div class="flag-time-range">
          <!-- Range fields will be added dynamically based on trigger selection -->
        </div>
      `;

      // Add listener for trigger changes
      const triggerSelect = additionalFieldsContainer.querySelector(
        ".constraint-trigger"
      );
      if (triggerSelect) {
        triggerSelect.addEventListener("change", (e) =>
          handleTriggerChange(e, instance)
        );
      }
    } else if (constraintType === "CUSTOM") {
      additionalFieldsContainer.innerHTML = `
        <div class="form-row">
          <div class="form-group">
            <label class="label">Initial Time (ti):</label>
            <input type="number" step="any" class="input-field constraint-ti" placeholder="Enter initial time">
          </div>
          <div class="form-group">
            <label class="label">Final Time (tf):</label>
            <input type="number" step="any" class="input-field constraint-tf" placeholder="Enter final time">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="label">Time Point:</label>
            <input type="number" step="any" class="input-field constraint-time-point" placeholder="Enter time point">
          </div>
          <div class="form-group">
            <label class="label">Input:</label>
            <select class="input-field constraint-custom-input">
              <option value="" disabled selected>Select Input</option>
              <option value="IIP">IIP</option>
              <option value="GROUND_TRACE">GROUND_TRACE</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="label">Position:</label>
            <input type="text" class="input-field constraint-position" placeholder="Enter position">
          </div>
        </div>
      `;
    } else if (constraintType === "DCISS_IMPACT") {
      additionalFieldsContainer.innerHTML = `
        <div class="form-row">
          <div class="form-group">
            <label class="label">DCISS Type:</label>
            <select class="input-field constraint-dciss-type">
              <option value="" disabled selected>Select DCISS Type</option>
              <option value="Line">Line</option>
              <option value="Ellipse">Ellipse</option>
              <option value="Box">Box</option>
            </select>
          </div>
        </div>
        <div class="dciss-parameters-container">
          <!-- DCISS type specific fields will be added here -->
        </div>
      `;

      // Add listener for DCISS type changes
      const dcissTypeSelect = additionalFieldsContainer.querySelector(
        ".constraint-dciss-type"
      );
      if (dcissTypeSelect) {
        dcissTypeSelect.addEventListener("change", (e) =>
          handleDcissTypeChange(e, instance)
        );
      }
    }
  }

  // Function to handle trigger changes for Q/QAOA group constraints
  function handleTriggerChange(event, instance) {
    const triggerSelect = event.target;
    const rangeContainer = instance.querySelector(".flag-time-range");
    if (!rangeContainer) return;

    const triggerType = triggerSelect.value;
    if (triggerType === "FLAG") {
      rangeContainer.innerHTML = `
        <div class="form-row">
          <div class="form-group">
            <label class="label">From Flag:</label>
            <select class="input-field constraint-flag-from">
              <option value="" disabled selected>Select From Flag</option>
              <!-- Flags will be populated by JS -->
            </select>
          </div>
          <div class="form-group">
            <label class="label">To Flag:</label>
            <select class="input-field constraint-flag-to">
              <option value="" disabled selected>Select To Flag</option>
              <!-- Flags will be populated by JS -->
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="label">From Offset (s):</label>
            <input type="number" step="any" class="input-field constraint-from-offset" value="0">
          </div>
          <div class="form-group">
            <label class="label">To Offset (s):</label>
            <input type="number" step="any" class="input-field constraint-to-offset" value="0">
          </div>
        </div>
      `;

      // Populate flag dropdowns
      populateFlagDropdown(
        rangeContainer.querySelector(".constraint-flag-from"),
        "Constraint From"
      );
      populateFlagDropdown(
        rangeContainer.querySelector(".constraint-flag-to"),
        "Constraint To"
      );
    } else if (triggerType === "MISSION_TIME") {
      rangeContainer.innerHTML = `
        <div class="form-row">
          <div class="form-group">
            <label class="label">From Time (s):</label>
            <input type="number" step="any" class="input-field constraint-time-from" value="0">
          </div>
          <div class="form-group">
            <label class="label">To Time (s):</label>
            <input type="number" step="any" class="input-field constraint-time-to" value="0">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="label">From Offset (s):</label>
            <input type="number" step="any" class="input-field constraint-from-offset" value="0">
          </div>
          <div class="form-group">
            <label class="label">To Offset (s):</label>
            <input type="number" step="any" class="input-field constraint-to-offset" value="0">
          </div>
        </div>
      `;
    }
  }

  // Function to handle DCISS type changes
  function handleDcissTypeChange(event, instance) {
    const dcissTypeSelect = event.target;
    const parametersContainer = instance.querySelector(
      ".dciss-parameters-container"
    );
    if (!parametersContainer) return;

    const dcissType = dcissTypeSelect.value;
    if (dcissType === "Line") {
      parametersContainer.innerHTML = `
        <div class="form-row">
          <div class="form-group">
            <label class="label">Position:</label>
            <select class="input-field constraint-dciss-position">
              <option value="" disabled selected>Select Position</option>
              <option value="above">Above</option>
              <option value="below">Below</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="label">Line Bounds:</label>
            <textarea class="input-field constraint-dciss-line-bounds" placeholder="Enter line bounds in format [[lat1,lon1],[lat2,lon2]]" rows="3"></textarea>
          </div>
        </div>
      `;
    } else if (dcissType === "Ellipse") {
      parametersContainer.innerHTML = `
        <div class="form-row">
          <div class="form-group">
            <label class="label">Semi Major:</label>
            <input type="number" step="any" class="input-field constraint-dciss-semi-major" placeholder="Enter semi major">
          </div>
          <div class="form-group">
            <label class="label">Semi Minor:</label>
            <input type="number" step="any" class="input-field constraint-dciss-semi-minor" placeholder="Enter semi minor">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="label">Center:</label>
            <input type="text" class="input-field constraint-dciss-center" placeholder="Enter center coordinates [lat,lon]">
          </div>
        </div>
      `;
    } else if (dcissType === "Box") {
      parametersContainer.innerHTML = `
        <div class="form-row">
          <div class="form-group">
            <label class="label">Line Bound:</label>
            <textarea class="input-field constraint-dciss-line-bound" placeholder="Enter line bound coordinates" rows="3"></textarea>
          </div>
        </div>
      `;
    }
  }

  // Function to add a new constraint instance
  function addConstraintInstance() {
    const template = document.getElementById("constraint-template");
    if (!template || !constraintsContainer) {
      console.error(
        "Required elements not found for adding constraint instance"
      );
      return;
    }

    // Use a global counter for unique identification
    window.constraintCounter = window.constraintCounter || 0;
    window.constraintCounter++;

    const newInstance = template.cloneNode(true);
    newInstance.id = `constraint-instance-${window.constraintCounter}`;
    newInstance.classList.remove("hidden-template");
    newInstance.classList.add("optimization-instance"); // Make sure this class is added
    newInstance.setAttribute("data-index", window.constraintCounter);

    // Add a unique constraint-index class for distinct styling based on index
    // Use modulo to cycle through 6 different colors
    const colorIndex = window.constraintCounter % 6 || 6;
    newInstance.classList.add(`constraint-form-${colorIndex}`);

    // Apply the color directly with inline style as a backup
    const borderColors = {
      1: "#4a90e2", // Blue
      2: "#50e3c2", // Teal
      3: "#e6a545", // Orange
      4: "#bd10e0", // Purple
      5: "#e3506f", // Pink
      6: "#67c23a", // Green
    };
    newInstance.style.borderLeft = `4px solid ${borderColors[colorIndex]}`;

    // Update title
    const titleSpan = newInstance.querySelector(".instance-title span");
    if (titleSpan) {
      titleSpan.textContent = window.constraintCounter;
    }

    // Also update the heading to be more prominent
    const heading = newInstance.querySelector(".instance-title");
    if (heading) {
      heading.classList.add("constraint-heading");
    }

    // Update enable toggle IDs to be unique
    const enableToggle = newInstance.querySelector(".constraint-enable");
    const enableToggleLabel = newInstance.querySelector(".toggle-slider");
    if (enableToggle && enableToggleLabel) {
      const toggleId = `constraint-enable-${window.constraintCounter}`;
      enableToggle.id = toggleId;
      enableToggleLabel.setAttribute("for", toggleId);
    }

    // If not the first constraint, add a divider before this one
    if (constraintsContainer.children.length > 0) {
      const divider = document.createElement("div");
      divider.className = "constraint-divider";
      constraintsContainer.appendChild(divider);
    }

    // Hide the factor field completely since it's always 1
    const factorInput = newInstance.querySelector(".constraint-factor");
    if (factorInput) {
      factorInput.parentElement.style.display = "none";
    }

    // Add to container first so we can find elements
    constraintsContainer.appendChild(newInstance);

    // Populate constraint name dropdown for this instance
    const nameSelect = newInstance.querySelector(".constraint-name");
    if (nameSelect) {
      // Clear the dropdown except for the placeholder
      while (nameSelect.options.length > 1) {
        nameSelect.remove(1);
      }

      // Create an array of options for sorting
      const options = [];
      for (const key in allConstraintOptions) {
        options.push({
          value: key,
          text: allConstraintOptions[key],
        });
      }

      // Sort options alphabetically by text
      options.sort((a, b) => a.text.localeCompare(b.text));

      // Add sorted options to dropdown
      options.forEach((option) => {
        const optionElement = document.createElement("option");
        optionElement.value = option.value;
        optionElement.textContent = option.text;
        nameSelect.appendChild(optionElement);
      });

      // Add listener for constraint name changes
      nameSelect.addEventListener("change", handleConstraintNameChange);
    }

    // Populate flag dropdown if it exists
    const flagSelect = newInstance.querySelector(".constraint-flag");
    if (flagSelect) {
      populateFlagDropdown(
        flagSelect,
        `Constraint ${window.constraintCounter}`
      );
    }

    // Add event listener for the delete button
    const deleteBtn = newInstance.querySelector(".delete-instance-btn");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", () => {
        // Also remove the divider if it exists
        const prevElement = newInstance.previousElementSibling;
        if (
          prevElement &&
          prevElement.classList.contains("constraint-divider")
        ) {
          constraintsContainer.removeChild(prevElement);
        }

        newInstance.remove();
        // Optionally renumber remaining constraints
        renumberConstraints();
      });
    }

    // Add event listener to the type dropdown to toggle condition field
    const typeSelect = newInstance.querySelector(".constraint-type");
    const conditionField = newInstance.querySelector(".constraint-condition");

    if (typeSelect && conditionField) {
      typeSelect.addEventListener("change", () => {
        toggleConditionBasedOnType(typeSelect, conditionField);
      });
    }

    // Add div container for additional fields
    const additionalFieldsContainer = document.createElement("div");
    additionalFieldsContainer.className = "additional-fields";
    newInstance.appendChild(additionalFieldsContainer);
  }

  // Function to toggle condition dropdown based on type selection
  function toggleConditionBasedOnType(typeSelect, conditionField) {
    if (typeSelect.value === "EQUALITY") {
      // For EQUALITY, disable condition selection
      conditionField.value = "";
      conditionField.disabled = true;
      conditionField.parentElement.classList.add("disabled-field");
    } else {
      // For INEQUALITY, enable condition selection
      conditionField.disabled = false;
      conditionField.parentElement.classList.remove("disabled-field");
    }
  }

  // Function to renumber constraints after deletion
  function renumberConstraints() {
    const instances = constraintsContainer.querySelectorAll(
      ".optimization-instance:not(.hidden-template)"
    );
    instances.forEach((instance, index) => {
      const titleSpan = instance.querySelector(".instance-title span");
      if (titleSpan) {
        titleSpan.textContent = index + 1;
      }
      instance.setAttribute("data-index", index + 1);
    });
  }

  // Function to populate all constraint name dropdowns
  function populateAllConstraintNameDropdowns() {
    const nameSelects = document.querySelectorAll(".constraint-name");
    console.log(`Populating ${nameSelects.length} constraint name dropdowns`);

    // Create an array of options for sorting
    const options = [];
    for (const key in allConstraintOptions) {
      options.push({
        value: key,
        text: allConstraintOptions[key],
      });
    }

    // Sort options alphabetically by text
    options.sort((a, b) => a.text.localeCompare(b.text));

    nameSelects.forEach((select) => {
      // Save current value
      const currentValue = select.value;

      // Clear dropdown except placeholder
      while (select.options.length > 1) {
        select.remove(1);
      }

      // Add sorted options to dropdown
      options.forEach((option) => {
        const optionElement = document.createElement("option");
        optionElement.value = option.value;
        optionElement.textContent = option.text;
        select.appendChild(optionElement);
      });

      // Restore value if possible
      if (currentValue) {
        select.value = currentValue;
      }
    });
  }

  // Function to get constraints data
  function getConstraintsData() {
    const constraintsData = [];
    const constraintInstances = document.querySelectorAll(
      "#constraints-container .optimization-instance:not(.hidden-template)"
    );

    constraintInstances.forEach((instance) => {
      const index = instance.getAttribute("data-index");
      const nameSelect = instance.querySelector(".constraint-name");
      const valueInput = instance.querySelector(".constraint-value");
      const typeSelect = instance.querySelector(".constraint-type");
      const conditionSelect = instance.querySelector(".constraint-condition");
      const flagSelect = instance.querySelector(".constraint-flag");
      const toleranceInput = instance.querySelector(".constraint-tolerance");
      const enableToggle = instance.querySelector(".constraint-enable");

      if (nameSelect && nameSelect.value) {
        const constraintType = nameSelect.value;
        const constraint = {
          name: constraintType,
          value: valueInput ? parseFloat(valueInput.value) : null,
          type: typeSelect ? typeSelect.value : null,
          condition: conditionSelect ? conditionSelect.value : null,
          flag: flagSelect ? flagSelect.value || null : null,
          tolerance: toleranceInput ? parseFloat(toleranceInput.value) : null,
          enable: enableToggle ? enableToggle.checked : true,
          factor: 1, // Always 1 as per requirements - kept in data model but hidden in UI
        };

        // Handle specific constraint types
        if (
          [
            "SEMI_MAJOR_AXIS",
            "ANGULAR_MOMENTUM",
            "ECCENTRICITY",
            "INCLINATION",
            "TRUE_ANOMALY",
            "ECCENTRIC_ANOMALY",
            "RAAN",
            "AOP",
            "PERIGEE_GC_LATITUDE",
            "PERIGEE_GC",
            "APOGEE_GC",
            "PERIGEE",
            "APOGEE",
          ].includes(constraintType)
        ) {
          // These constraints use the standard fields already set above
        } else if (constraintType === "STAGE_IMPACT") {
          const coordinateSelect = instance.querySelector(
            ".constraint-coordinate"
          );
          if (coordinateSelect) {
            constraint.coordinate = coordinateSelect.value;
          }
        } else if (
          [
            "Q",
            "MAX_QAOA",
            "ALPHA",
            "MAX_BODY_RATE",
            "MAX_HEAT_FLUX",
            "SLACK_VARIABLE",
            "MAX_SENSED_ACC",
          ].includes(constraintType)
        ) {
          const triggerSelect = instance.querySelector(".constraint-trigger");
          if (triggerSelect) {
            constraint.trigger = triggerSelect.value;

            if (triggerSelect.value === "FLAG") {
              const fromSelect = instance.querySelector(
                ".constraint-flag-from"
              );
              const toSelect = instance.querySelector(".constraint-flag-to");
              constraint.from = fromSelect ? fromSelect.value : null;
              constraint.to = toSelect ? toSelect.value : null;
            } else if (triggerSelect.value === "MISSION_TIME") {
              const fromInput = instance.querySelector(".constraint-time-from");
              const toInput = instance.querySelector(".constraint-time-to");
              constraint.from = fromInput ? parseFloat(fromInput.value) : 0;
              constraint.to = toInput ? parseFloat(toInput.value) : 0;
            }

            const fromOffsetInput = instance.querySelector(
              ".constraint-from-offset"
            );
            const toOffsetInput = instance.querySelector(
              ".constraint-to-offset"
            );
            constraint.from_offset = fromOffsetInput
              ? parseFloat(fromOffsetInput.value)
              : 0;
            constraint.to_offset = toOffsetInput
              ? parseFloat(toOffsetInput.value)
              : 0;
          }
        } else if (constraintType === "CUSTOM") {
          const tiInput = instance.querySelector(".constraint-ti");
          const tfInput = instance.querySelector(".constraint-tf");
          const timePointInput = instance.querySelector(
            ".constraint-time-point"
          );
          const inputSelect = instance.querySelector(
            ".constraint-custom-input"
          );
          const positionInput = instance.querySelector(".constraint-position");

          if (tiInput) constraint.ti = parseFloat(tiInput.value);
          if (tfInput) constraint.tf = parseFloat(tfInput.value);
          if (timePointInput)
            constraint.time_point = parseFloat(timePointInput.value);
          if (inputSelect) constraint.input = inputSelect.value;
          if (positionInput) constraint.Position = positionInput.value;
        } else if (constraintType === "DCISS_IMPACT") {
          const dcissTypeSelect = instance.querySelector(
            ".constraint-dciss-type"
          );
          if (dcissTypeSelect) {
            constraint.Parameters = {
              constraint: dcissTypeSelect.value,
            };

            if (dcissTypeSelect.value === "Line") {
              const positionInput = instance.querySelector(
                ".constraint-dciss-position"
              );
              const lineBoundsInput = instance.querySelector(
                ".constraint-dciss-line-bounds"
              );

              if (positionInput)
                constraint.Parameters.Position = positionInput.value;
              if (lineBoundsInput) {
                try {
                  // Try to parse as JSON first
                  const lineBoundsText = lineBoundsInput.value.trim();

                  // Format expected: [[lat1,lon1],[lat2,lon2]]
                  if (
                    lineBoundsText.startsWith("[") &&
                    lineBoundsText.endsWith("]")
                  ) {
                    constraint.Parameters.line_bounds = {
                      l1: JSON.parse(lineBoundsText),
                    };
                  } else {
                    constraint.Parameters.line_bounds = {
                      l1: lineBoundsText,
                    };
                  }
                } catch (e) {
                  console.warn("Could not parse line bounds as JSON:", e);
                  constraint.Parameters.line_bounds = {
                    l1: lineBoundsInput.value,
                  };
                }
              }
            } else if (dcissTypeSelect.value === "Ellipse") {
              const semiMajorInput = instance.querySelector(
                ".constraint-dciss-semi-major"
              );
              const semiMinorInput = instance.querySelector(
                ".constraint-dciss-semi-minor"
              );
              const centerInput = instance.querySelector(
                ".constraint-dciss-center"
              );

              if (semiMajorInput)
                constraint.Parameters.SemiMajor = parseFloat(
                  semiMajorInput.value
                );
              if (semiMinorInput)
                constraint.Parameters.SemiMinor = parseFloat(
                  semiMinorInput.value
                );
              if (centerInput) {
                try {
                  // Try to parse as array [lat,lon]
                  const centerText = centerInput.value.trim();
                  if (centerText.startsWith("[") && centerText.endsWith("]")) {
                    constraint.Parameters.Center = JSON.parse(centerText);
                  } else {
                    constraint.Parameters.Center = centerText;
                  }
                } catch (e) {
                  console.warn("Could not parse center as JSON:", e);
                  constraint.Parameters.Center = centerInput.value;
                }
              }
            } else if (dcissTypeSelect.value === "Box") {
              const lineBoundInput = instance.querySelector(
                ".constraint-dciss-line-bound"
              );
              if (lineBoundInput) {
                try {
                  // Try to parse as JSON array
                  const lineBoundText = lineBoundInput.value.trim();
                  if (
                    lineBoundText.startsWith("[") &&
                    lineBoundText.endsWith("]")
                  ) {
                    constraint.Parameters.Line_Bound =
                      JSON.parse(lineBoundText);
                  } else {
                    constraint.Parameters.Line_Bound = lineBoundText;
                  }
                } catch (e) {
                  console.warn("Could not parse line bound as JSON:", e);
                  constraint.Parameters.Line_Bound = lineBoundInput.value;
                }
              }
            }
          }
        }

        constraintsData.push(constraint);
      }
    });

    console.log("Collected Constraints Data:", constraintsData);
    return constraintsData;
  }

  // =========================================
  // DESIGN VARIABLE FUNCTIONS
  // =========================================

  // Function to populate relevant dropdowns in design variables
  function populateDesignVariableDropdowns(instanceElement) {
    const flagSelects = instanceElement.querySelectorAll(".dv-flag");
    const segmentSelects = instanceElement.querySelectorAll(".dv-segment"); // Might target different types of segments

    flagSelects.forEach((select) =>
      populateFlagDropdown(
        select,
        `Design Variable ${instanceElement.dataset.index || ""}`
      )
    );

    // Populate Steering Segments (Requires access to Steering Module data)
    const steeringSegmentSelect = instanceElement.querySelector(
      '.dv-segment[data-category="STEERING"]'
    );
    if (steeringSegmentSelect) {
      populateSteeringSegmentDropdown(steeringSegmentSelect);
    }

    // Populate Propulsion Segments (e.g., Stage names - requires access to vehicle data)
    const propulsionSegmentSelect = instanceElement.querySelector(
      '.dv-segment[data-category="PROPULSION"]'
    );
    if (propulsionSegmentSelect) {
      // Placeholder: Add logic to get stage names
      populateGenericSegmentDropdown(propulsionSegmentSelect, "PROPULSION");
    }

    // Populate Sequence Flags (Coasting related)
    const sequenceFlagSelect = instanceElement.querySelector(
      '.dv-flag[data-category="SEQUENCE"]'
    );
    if (sequenceFlagSelect) {
      // populateFlagDropdown(sequenceFlagSelect, `Design Variable Sequence ${instanceElement.dataset.index || ''}`);
      // Flags already populated above, might need filtering for sequence-specific flags if required
    }
  }

  // Placeholder for populating steering segments
  function populateSteeringSegmentDropdown(selectElement) {
    if (!selectElement) return;
    // Clear existing options except placeholder
    while (selectElement.options.length > 1) {
      selectElement.remove(1);
    }
    try {
      const activeComponents =
        window.steeringManager?.getActiveComponentIdsAndTypes() || [];
      if (activeComponents.length === 0) {
        console.warn(
          "No active steering components found to populate Design Variable segment dropdown."
        );
        // Add a dummy option if needed
        // const option = document.createElement("option");
        // option.value = "dummy_segment";
        // option.textContent = "No Segments Defined";
        // selectElement.appendChild(option);
        return;
      }
      activeComponents.forEach((comp) => {
        const option = document.createElement("option");
        option.value = comp.id; // Use component ID as value
        option.textContent = comp.name; // Display user-friendly name (e.g., "Profile 1")
        option.dataset.segmentType = comp.type; // Store type (PROFILE, CLG etc.) for later use
        selectElement.appendChild(option);
      });
    } catch (error) {
      console.error("Error populating steering segment dropdown:", error);
    }
  }

  // Placeholder for populating propulsion segments (e.g., stages)
  function populateGenericSegmentDropdown(selectElement, category) {
    if (!selectElement) return;
    while (selectElement.options.length > 1) {
      selectElement.remove(1);
    }
    // Example: Fetch stage names if category is PROPULSION
    if (category === "PROPULSION") {
      // TODO: Replace with actual logic to get stage names from vehicle configuration
      const stageNames = ["Stage1", "Stage2", "UpperStage"]; // Placeholder
      stageNames.forEach((name) => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        selectElement.appendChild(option);
      });
    }
  }

  // Function to handle Design Variable category changes
  function handleDesignVariableCategoryChange(event) {
    const categorySelect = event.target;
    const instance = categorySelect.closest(".optimization-instance");
    if (!instance) return;

    const selectedCategory = categorySelect.value;
    const dynamicFieldsContainer = instance.querySelector(".dv-dynamic-fields");
    const allCategoryFields = dynamicFieldsContainer.querySelectorAll(
      ".dv-category-fields"
    );
    const nameInput = instance.querySelector(".dv-name");

    // Hide all category-specific fields first
    allCategoryFields.forEach((fieldSet) => fieldSet.classList.add("hidden"));

    // Show fields for the selected category
    const selectedFieldSet = dynamicFieldsContainer.querySelector(
      `.dv-category-fields[data-category="${selectedCategory}"]`
    );
    if (selectedFieldSet) {
      selectedFieldSet.classList.remove("hidden");
      // Populate necessary dropdowns within this fieldset
      populateDesignVariableDropdowns(selectedFieldSet);

      // Special handling for STEERING to show sub-type dropdown
      if (selectedCategory === "STEERING") {
        handleSteeringSegmentChange({
          target: selectedFieldSet.querySelector(".dv-segment"),
        }); // Trigger segment change handler
      }
    }

    // Auto-fill name based on category
    if (nameInput) {
      // Define default name patterns for each category
      const defaultNamePatterns = {
        CUT_OFF: "opt_cut_off",
        PAYLOAD: "opt_payload",
        AZIMUTH: "opt_azimuth",
        SEQUENCE: "opt_sequence",
        PROPULSION: "opt_propulsion",
        STEERING: "opt_steering",
      };

      // Get the new default name for the selected category
      const newDefaultName = defaultNamePatterns[selectedCategory] || "";

      // Check if the current name matches any of our default patterns
      const currentValue = nameInput.value || "";
      const isUsingDefaultName = Object.values(defaultNamePatterns).some(
        (pattern) =>
          currentValue === pattern || currentValue.startsWith(pattern + "_")
      );

      // Update the name if it's empty or matches a default pattern
      if (!currentValue || isUsingDefaultName) {
        nameInput.value = newDefaultName;
      }
    }
  }

  // Function to handle Steering Segment selection change
  function handleSteeringSegmentChange(event) {
    const segmentSelect = event.target;
    const instance = segmentSelect.closest(".optimization-instance");
    if (!instance) return;

    const segmentTypeSelect = instance.querySelector(".dv-segment-type");
    const selectedOption = segmentSelect.options[segmentSelect.selectedIndex];
    const segmentType = selectedOption
      ? selectedOption.dataset.segmentType
      : null; // Get type from selected segment option

    if (segmentTypeSelect && segmentType) {
      segmentTypeSelect.value = segmentType; // Auto-select the type based on the chosen segment
      handleSteeringSegmentTypeChange({ target: segmentTypeSelect }); // Trigger the type change handler
    } else if (segmentTypeSelect) {
      // If no segment is selected or type info is missing, reset type dropdown and hide sub-fields
      segmentTypeSelect.value = "";
      handleSteeringSegmentTypeChange({ target: segmentTypeSelect });
    }
  }

  // Function to handle Steering Segment Type changes (within STEERING category)
  function handleSteeringSegmentTypeChange(event) {
    const typeSelect = event.target;
    const instance = typeSelect.closest(
      '.dv-category-fields[data-category="STEERING"]'
    );
    if (!instance) return;

    const selectedType = typeSelect.value;
    const subFieldsContainer = instance.querySelector(
      ".dv-steering-sub-fields"
    );
    const allSubTypeFields = subFieldsContainer.querySelectorAll(
      ".dv-steering-type-fields"
    );

    // Hide all sub-type fields
    allSubTypeFields.forEach((fieldSet) => fieldSet.classList.add("hidden"));

    // Show fields for the selected sub-type
    const selectedFieldSet = subFieldsContainer.querySelector(
      `.dv-steering-type-fields[data-segment-type="${selectedType}"]`
    );
    if (selectedFieldSet) {
      selectedFieldSet.classList.remove("hidden");
      // Update name suggestion based on segment + type
      const mainInstance = instance.closest(".optimization-instance");
      const nameInput = mainInstance.querySelector(".dv-name");
      const segmentSelect = instance.querySelector(".dv-segment");
      if (nameInput && segmentSelect && segmentSelect.value) {
        const segmentName =
          segmentSelect.options[segmentSelect.selectedIndex]?.textContent ||
          segmentSelect.value;
        const baseName = `opt_steering_${segmentName.replace(
          /\s+/g,
          "_"
        )}_${selectedType.toLowerCase()}_${mainInstance.dataset.index || "1"}`;
        nameInput.placeholder = `e.g., ${baseName}`;
        // Uncomment to auto-fill: nameInput.value = baseName;
      }
    }
    // Adjust input types based on requirements (e.g., some bounds are arrays)
    adjustInputTypesForSteering(selectedFieldSet);
  }

  // Helper to adjust input types for steering (e.g., bounds might be comma-separated)
  function adjustInputTypesForSteering(fieldSet) {
    if (!fieldSet) return;
    const category = fieldSet.dataset.segmentType;

    // Most steering bounds/variables can be arrays (comma-separated)
    const lowerBoundInputs = fieldSet.querySelectorAll(".dv-lower-bound");
    const upperBoundInputs = fieldSet.querySelectorAll(".dv-upper-bound");
    const controlVarInputs = fieldSet.querySelectorAll(".dv-control-variable");
    const axisInputs = fieldSet.querySelectorAll(".dv-axis"); // Axis can also be multiple

    // Change type to 'text' for potential comma-separated values, except for specific single-value fields
    if (category === "CLG") {
      // CLG bounds are typically single numbers
    } else {
      lowerBoundInputs.forEach((input) => {
        input.type = "text";
        input.placeholder = input.placeholder.replace(
          "numeric",
          "comma-separated"
        );
      });
      upperBoundInputs.forEach((input) => {
        input.type = "text";
        input.placeholder = input.placeholder.replace(
          "numeric",
          "comma-separated"
        );
      });
      controlVarInputs.forEach((input) => {
        input.type = "text";
        input.placeholder = input.placeholder.replace(
          "numeric",
          "comma-separated"
        );
      });
      axisInputs.forEach((input) => {
        if (input.tagName === "INPUT") {
          // Only change input fields, not selects
          input.type = "text";
          input.placeholder = input.placeholder.replace(
            "numeric",
            "comma-separated"
          );
        }
      });
    }
    // Handle PROFILE independent vector nodes - should be text
    if (category === "PROFILE") {
      const indVectorInput = fieldSet.querySelector(".dv-ind-vector");
      if (indVectorInput) indVectorInput.type = "text";
      // Profile bounds can also be arrays
      fieldSet
        .querySelectorAll(".dv-lower-bound, .dv-upper-bound")
        .forEach((input) => {
          input.type = "text";
          input.placeholder = input.placeholder.replace(
            "numeric",
            "comma-separated"
          );
        });
    }
  }

  // Function to add a new design variable instance
  function addDesignVariableInstance() {
    if (!designVariableTemplate || !designVariablesContainer) {
      console.error(
        "Required elements not found for adding design variable instance"
      );
      return;
    }

    const currentCount = designVariablesContainer.querySelectorAll(
      ".optimization-instance:not(.hidden-template)"
    ).length;
    if (currentCount >= MAX_DESIGN_VARIABLES) {
      Swal.fire({
        icon: "error",
        title: "Maximum Reached",
        text: `You can only add up to ${MAX_DESIGN_VARIABLES} design variables.`,
      });
      return;
    }

    designVariableCounter++; // Use a simple counter for uniqueness

    // Clone the content of the template element
    const newInstanceContent = designVariableTemplate.content.cloneNode(true);
    const newInstance = newInstanceContent.querySelector(
      ".optimization-instance"
    ); // Get the actual div

    if (!newInstance) {
      console.error(
        "Could not find '.optimization-instance' within the template content."
      );
      return;
    }

    newInstance.id = `design-variable-${designVariableCounter}`;
    newInstance.classList.remove("hidden-template"); // Ensure it's visible if template itself was hidden
    newInstance.dataset.index = designVariableCounter;

    // Add color-coding based on instance number (cycle through 6 colors)
    const colorIndex = designVariableCounter % 6 || 6;
    newInstance.classList.add(`design-var-color-${colorIndex}`);

    // Update title
    const titleSpan = newInstance.querySelector(".instance-title span");
    if (titleSpan) {
      titleSpan.textContent = designVariableCounter;
    }

    // Add event listener for category change
    const categorySelect = newInstance.querySelector(".dv-category");
    if (categorySelect) {
      categorySelect.addEventListener(
        "change",
        handleDesignVariableCategoryChange
      );
    }

    // Add event listener for steering segment change (only applies if category becomes STEERING)
    const steeringSegmentSelect = newInstance.querySelector(
      '.dv-segment[data-category="STEERING"]'
    );
    if (steeringSegmentSelect) {
      steeringSegmentSelect.addEventListener(
        "change",
        handleSteeringSegmentChange
      );
    }

    // Add event listener for steering type change (only applies if category becomes STEERING)
    const steeringTypeSelect = newInstance.querySelector(".dv-segment-type");
    if (steeringTypeSelect) {
      steeringTypeSelect.addEventListener(
        "change",
        handleSteeringSegmentTypeChange
      );
    }

    // Add event listener for the delete button
    const deleteBtn = newInstance.querySelector(".delete-instance-btn");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", () => {
        // Also remove the divider if it exists
        const prevElement = newInstance.previousElementSibling;
        if (
          prevElement &&
          prevElement.classList.contains("design-variable-divider")
        ) {
          designVariablesContainer.removeChild(prevElement);
        }

        newInstance.remove();
        renumberDesignVariables();
      });
    }

    // If not the first instance, add a divider before this one
    if (designVariablesContainer.children.length > 0) {
      const divider = document.createElement("div");
      divider.className = "design-variable-divider";
      designVariablesContainer.appendChild(divider);
    }

    // Add the new instance to the container
    designVariablesContainer.appendChild(newInstance);

    // Populate dropdowns for the new instance AFTER it's added to the DOM
    populateDesignVariableDropdowns(newInstance);
  }

  // Function to renumber design variables after deletion
  function renumberDesignVariables() {
    const instances = designVariablesContainer.querySelectorAll(
      ".optimization-instance:not(.hidden-template)"
    );
    instances.forEach((instance, index) => {
      const newIndex = index + 1;
      const titleSpan = instance.querySelector(".instance-title span");
      if (titleSpan) {
        titleSpan.textContent = newIndex;
      }
      instance.dataset.index = newIndex;
      instance.id = `design-variable-${newIndex}`;

      // Update name placeholder/value if it follows the pattern
      const nameInput = instance.querySelector(".dv-name");
      if (nameInput) {
        const match = nameInput.placeholder.match(/^(.*_)(\d+)$/);
        if (match) {
          nameInput.placeholder = `${match[1]}${newIndex}`;
        }
        const valueMatch = nameInput.value.match(/^(.*_)(\d+)$/);
        if (valueMatch) {
          nameInput.value = `${valueMatch[1]}${newIndex}`;
        }
      }

      // Update color coding classes
      // First remove all existing color classes
      for (let i = 1; i <= 6; i++) {
        instance.classList.remove(`design-var-color-${i}`);
      }
      // Add the appropriate color class based on new index
      const colorIndex = newIndex % 6 || 6;
      instance.classList.add(`design-var-color-${colorIndex}`);
    });
    // Update the main counter
    designVariableCounter = instances.length;
  }

  // Function to get design variables data
  function getDesignVariablesData() {
    const designVariablesData = [];
    const instances = designVariablesContainer.querySelectorAll(
      ".optimization-instance:not(.hidden-template)"
    );

    instances.forEach((instance) => {
      const categorySelect = instance.querySelector(".dv-category");
      const nameInput = instance.querySelector(".dv-name");
      const category = categorySelect ? categorySelect.value : null;
      const name = nameInput ? nameInput.value : null;

      if (category && name) {
        const dv = { name: name, category: category, type: {} };
        const categoryFields = instance.querySelector(
          `.dv-category-fields[data-category="${category}"]`
        );

        if (categoryFields) {
          const flagSelect = categoryFields.querySelector(".dv-flag");
          const controlVarInput = categoryFields.querySelector(
            ".dv-control-variable"
          );
          const lowerBoundInput =
            categoryFields.querySelector(".dv-lower-bound");
          const upperBoundInput =
            categoryFields.querySelector(".dv-upper-bound");
          const segmentSelect = categoryFields.querySelector(".dv-segment"); // Could be for PROPULSION or STEERING

          // Helper to parse comma-separated string to array of numbers/strings
          const parseArray = (inputElement) => {
            if (!inputElement || !inputElement.value) return [];
            // Attempt to parse numbers, otherwise keep as strings
            return inputElement.value.split(",").map((item) => {
              const trimmed = item.trim();
              const num = parseFloat(trimmed);
              return !isNaN(num) && trimmed !== "" ? num : trimmed; // Keep original string if not a valid number or empty after trim
            });
          };
          // Helper to parse single number or return null
          const parseSingleNumber = (inputElement) => {
            if (!inputElement || !inputElement.value) return null;
            const num = parseFloat(inputElement.value);
            return !isNaN(num) ? num : null;
          };

          // --- Populate based on category ---
          if (["CUT_OFF", "SEQUENCE"].includes(category)) {
            if (flagSelect) dv.flag = flagSelect.value || null;
            if (controlVarInput)
              dv.type.control_variable = controlVarInput.value; // Usually single for these
            if (lowerBoundInput)
              dv.type.lower_bound = parseSingleNumber(lowerBoundInput);
            if (upperBoundInput)
              dv.type.upper_bound = parseSingleNumber(upperBoundInput);
          } else if (["PAYLOAD", "AZIMUTH"].includes(category)) {
            if (controlVarInput)
              dv.type.control_variable = parseArray(controlVarInput);
            if (lowerBoundInput)
              dv.type.lower_bound = parseArray(lowerBoundInput);
            if (upperBoundInput)
              dv.type.upper_bound = parseArray(upperBoundInput);
          } else if (category === "PROPULSION") {
            if (segmentSelect) dv.segment = segmentSelect.value || null;
            if (controlVarInput)
              dv.type.control_variable = parseArray(controlVarInput);
            if (lowerBoundInput)
              dv.type.lower_bound = parseArray(lowerBoundInput);
            if (upperBoundInput)
              dv.type.upper_bound = parseArray(upperBoundInput);
          } else if (category === "STEERING") {
            const segmentTypeSelect =
              categoryFields.querySelector(".dv-segment-type");
            const segmentType = segmentTypeSelect
              ? segmentTypeSelect.value
              : null;

            if (segmentSelect) dv.segment = segmentSelect.value || null;
            if (segmentType) dv.segment_type = segmentType;

            const subTypeFields = categoryFields.querySelector(
              `.dv-steering-type-fields[data-segment-type="${segmentType}"]`
            );
            if (subTypeFields) {
              const subControlVar = subTypeFields.querySelector(
                ".dv-control-variable"
              );
              const subLowerBound =
                subTypeFields.querySelector(".dv-lower-bound");
              const subUpperBound =
                subTypeFields.querySelector(".dv-upper-bound");
              const subAxis = subTypeFields.querySelector(".dv-axis"); // Could be input or select
              const subIndVar = subTypeFields.querySelector(".dv-ind-variable"); // PROFILE only
              const subIndVector =
                subTypeFields.querySelector(".dv-ind-vector"); // PROFILE only

              // Common fields (may be arrays)
              if (subControlVar)
                dv.type.control_variable = parseArray(subControlVar);
              if (subLowerBound)
                dv.type.lower_bound = parseArray(subLowerBound);
              if (subUpperBound)
                dv.type.upper_bound = parseArray(subUpperBound);

              // Axis (might be single select or multi input)
              if (subAxis) {
                if (subAxis.tagName === "SELECT") {
                  dv.type.axis = subAxis.value || null; // Single axis from dropdown
                } else if (subAxis.tagName === "INPUT") {
                  dv.type.axis = parseArray(subAxis); // Multiple axes from input
                }
              }

              // Profile specific fields
              if (segmentType === "PROFILE") {
                if (subIndVar) dv.type.ind_variable = subIndVar.value || null;
                if (subIndVector) dv.type.ind_vector = parseArray(subIndVector); // Indices
              }
              // CLG specific (bounds are single numbers)
              else if (segmentType === "CLG") {
                if (subLowerBound)
                  dv.type.lower_bound = parseSingleNumber(subLowerBound);
                if (subUpperBound)
                  dv.type.upper_bound = parseSingleNumber(subUpperBound);
                // CLG control_variable is typically the 'GAIN' name, bounds apply to it
                if (subControlVar)
                  dv.type.control_variable = subControlVar.value;
              }
              // Adjust single value fields for other types if needed
              else if (segmentType === "ZERO_RATE") {
                // Zero rate bounds are typically single duration values, but control_variable could be array if multiple zero rates defined? Adjust as needed.
                if (subLowerBound)
                  dv.type.lower_bound = parseArray(subLowerBound); // Assuming array possible
                if (subUpperBound)
                  dv.type.upper_bound = parseArray(subUpperBound); // Assuming array possible
              }
            } else {
              console.warn(
                `No sub-type fields found for steering type: ${segmentType} in DV ${dv.name}`
              );
            }
          }

          designVariablesData.push(dv);
        }
      } else {
        console.warn(
          "Skipping design variable instance due to missing category or name."
        );
      }
    });

    console.log("Collected Design Variables Data:", designVariablesData);
    return designVariablesData;
  }

  // Function to clear design variable inputs
  function clearDesignVariablesForm() {
    designVariablesContainer.innerHTML = ""; // Remove all instances
    designVariableCounter = 0; // Reset counter
    // Optionally, add back one default instance
    addDesignVariableInstance();
    Swal.fire({
      icon: "info",
      title: "Cleared",
      text: "Design Variables form cleared.",
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 2000,
    });
  }

  // =========================================
  // EVENT LISTENERS & INITIALIZATION
  // =========================================

  // --- Objective Function Listeners ---
  if (addObjectiveBtn) {
    addObjectiveBtn.addEventListener("click", addObjectiveFunctionForm);
  }

  if (objectiveFunctionForm) {
    objectiveFunctionForm.addEventListener("submit", (event) => {
      event.preventDefault();
      console.log("Objective Function form submitted.");

      // Perform basic validation
      const objectiveData = getObjectiveFunctionData();

      if (objectiveData.length === 0) {
        Swal.fire({
          icon: "error",
          title: "Validation Error",
          text: "Please add at least one objective function.",
          toast: false,
          confirmButtonText: "OK",
        });
        return;
      }

      saveOptimizationData("objectiveFunctions", objectiveData);
    });
  }

  // --- Constraints Listeners ---
  const constraintsNavButton = document.getElementById("constraints-btn");
  if (constraintsNavButton) {
    constraintsNavButton.addEventListener("click", () => {
      setTimeout(() => {
        populateAllConstraintNameDropdowns();
        populateFlagDropdown(constraintFlagSelect, "Constraints");
      }, 50);
    });
  }

  // Clear any existing event handlers for the Add Constraint button
  if (addConstraintBtn) {
    const newAddBtn = addConstraintBtn.cloneNode(true);
    addConstraintBtn.parentNode.replaceChild(newAddBtn, addConstraintBtn);

    // Re-add the event listener
    newAddBtn.addEventListener("click", () => {
      addConstraintInstance();
    });
  }

  // Make sure all constraint name dropdowns have change listeners
  const constraints = document.querySelectorAll(
    "#constraints-container .optimization-instance:not(.hidden-template) .constraint-name"
  );

  if (constraints.length > 0) {
    console.log(`Applying fixes to ${constraints.length} constraint forms`);

    constraints.forEach((nameSelect) => {
      // Remove existing event listeners by cloning
      const newNameSelect = nameSelect.cloneNode(true);
      nameSelect.parentNode.replaceChild(newNameSelect, nameSelect);

      // Add back the main event listener
      newNameSelect.addEventListener("change", handleConstraintNameChange);

      // Trigger the change event to ensure UI is correctly set up
      if (newNameSelect.value) {
        newNameSelect.dispatchEvent(new Event("change"));
      }
    });
  }

  if (constraintsForm) {
    constraintsForm.addEventListener("submit", (event) => {
      event.preventDefault();
      console.log("Constraints form submitted.");
      const sectionId = "constraints";

      // Validation
      let isValid = true;
      let errors = [];
      const constraintInstances = constraintsContainer.querySelectorAll(
        ".optimization-instance:not(.hidden-template)"
      );

      if (constraintInstances.length === 0) {
        console.log("No constraints added, proceeding with save.");
      } else {
        // Validate each instance
        constraintInstances.forEach((instance) => {
          if (!FormValidator.validateConstraintInstance(instance, errors)) {
            isValid = false;
          }
        });
      }

      if (isValid) {
        const constraintsData = getConstraintsData();
        console.log(
          "Constraints Data is valid, ready to save:",
          constraintsData
        );

        if (typeof saveOptimizationData === "function") {
          saveOptimizationData("constraints", constraintsData);

          // Update state management
          if (window.sectionStates && window.sectionStates[sectionId]) {
            window.sectionStates[sectionId].isSaved = true;
            window.sectionStates[sectionId].isDirty = false;
            window.sectionStates[sectionId].isValid = true;
            window.sectionStates[sectionId].needsReview = false;

            // Unlock the next section ('mode')
            const nextSectionId = "mode";
            if (window.sectionStates[nextSectionId]) {
              window.sectionStates[nextSectionId].isLocked = false;
              console.log(`Section ${nextSectionId} unlocked.`);
            }

            // Handle dependents
            const currentState = window.sectionStates[sectionId];
            if (
              currentState.dependents &&
              Array.isArray(currentState.dependents)
            ) {
              currentState.dependents.forEach((depId) => {
                if (
                  window.sectionStates[depId] &&
                  window.sectionStates[depId].isSaved
                ) {
                  window.sectionStates[depId].needsReview = true;
                }
              });
            }

            // Update sidebar visuals
            if (typeof updateSidebarStates === "function") {
              updateSidebarStates();
            }
          }
        } else {
          console.error("saveOptimizationData function is not defined!");
          Swal.fire({
            icon: "error",
            title: "Save Error",
            text: "Could not save data. Handler function missing.",
          });
        }
      } else {
        // Update state on validation failure
        if (window.sectionStates && window.sectionStates[sectionId]) {
          window.sectionStates[sectionId].isValid = false;
          if (typeof updateSidebarStates === "function") {
            updateSidebarStates();
          }
        }

        Swal.fire({
          icon: "error",
          title: "Constraints Validation Failed",
          html: errors.join("<br>"),
          toast: false,
          confirmButtonText: "OK",
        });
      }
    });
  }

  // Auto-create an initial objective function form if the container exists and is empty
  if (
    objectiveFunctionContainer &&
    objectiveFunctionContainer.children.length === 0
  ) {
    console.log(
      "Automatically creating initial objective function form on page load"
    );
    addObjectiveFunctionForm();
  }

  // Auto-create an initial constraint form if the container exists and is empty
  if (constraintsContainer && constraintsContainer.children.length === 0) {
    console.log("Automatically creating initial constraint form on page load");
    addConstraintInstance();
  }

  // Initialize dropdowns for all existing constraints
  populateAllConstraintNameDropdowns();

  // Hide factor fields for all existing constraints
  document
    .querySelectorAll("#constraints-container .constraint-factor")
    .forEach((element) => {
      if (element.parentElement) {
        element.parentElement.style.display = "none";
      }
    });

  // Add styles for the optimization module in a way that ensures they're applied
  const optimizationStyles = `
  .form-card {
      border: 1px dashed rgba(255, 255, 255, 0.2);
      border-radius: 5px;
      padding: 15px;
      margin-bottom: 20px;
      position: relative;
  }
  
  .objective-function-instance {
      background: rgba(30, 30, 30, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.15);
      box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16);
      transition: all 0.3s ease;
  }
  
  .objective-function-instance:hover {
      background: rgba(40, 40, 40, 0.7);
      border-color: rgba(255, 255, 255, 0.25);
  }
  
  /* Different colors for different objective forms */
  .objective-form-1 {
      border-left: 4px solid #4a90e2;
  }
  
  .objective-form-2 {
      border-left: 4px solid #50e3c2;
  }
  
  .objective-form-3 {
      border-left: 4px solid #e6a545;
  }
  
  .objective-form-4 {
      border-left: 4px solid #bd10e0;
  }
  
  .objective-heading {
      margin-top: 0;
      margin-bottom: 18px;
      color: #ffffff;
      font-size: 18px;
      font-weight: 600;
      border-bottom: 1px solid rgba(255, 255, 255, 0.15);
      padding-bottom: 10px;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  }
  
  .objective-divider {
      height: 15px;
      margin-bottom: 20px;
      border-top: 1px dashed rgba(255, 255, 255, 0.2);
      position: relative;
  }
  
  .objective-divider:after {
      content: "";
      position: absolute;
      left: 50%;
      top: -8px;
      transform: translateX(-50%);
      width: 40px;
      height: 15px;
      background: #1e1e1e;
      border-radius: 10px;
  }

  .form-card h4 {
      margin-top: 0;
      margin-bottom: 15px;
      color: #e0e0e0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding-bottom: 5px;
  }

  .remove-btn {
      position: absolute;
      top: 10px;
      right: 10px;
      background-color: rgba(255, 82, 82, 0.7);
      color: white;
      border: none;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      font-size: 16px;
      line-height: 22px;
      text-align: center;
      cursor: pointer;
      transition: background-color 0.3s ease;
      font-weight: bold;
  }

  .remove-btn:hover {
      background-color: rgba(255, 82, 82, 1);
  }

  .hidden-template {
      display: none !important;
  }

  /* Constraint form styles with increased specificity */
  #constraints-container .optimization-instance {
      background: rgba(30, 30, 30, 0.5) !important;
      border: 1px solid rgba(255, 255, 255, 0.15) !important;
      box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16) !important;
      transition: all 0.3s ease !important;
      margin-bottom: 20px !important;
      border-radius: 5px !important;
      padding: 15px !important;
      position: relative !important;
  }
  
  #constraints-container .optimization-instance:hover {
      background: rgba(40, 40, 40, 0.7) !important;
      border-color: rgba(255, 255, 255, 0.25) !important;
  }
  
  /* Different colors for different constraint forms with increased specificity */
  #constraints-container .constraint-form-1 {
      border-left: 4px solid #4a90e2 !important; /* Blue */
  }
  
  #constraints-container .constraint-form-2 {
      border-left: 4px solid #50e3c2 !important; /* Teal */
  }
  
  #constraints-container .constraint-form-3 {
      border-left: 4px solid #e6a545 !important; /* Orange */
  }
  
  #constraints-container .constraint-form-4 {
      border-left: 4px solid #bd10e0 !important; /* Purple */
  }
  
  #constraints-container .constraint-form-5 {
      border-left: 4px solid #e3506f !important; /* Pink */
  }
  
  #constraints-container .constraint-form-6 {
      border-left: 4px solid #67c23a !important; /* Green */
  }
  
  #constraints-container .constraint-heading {
      margin-top: 0 !important;
      margin-bottom: 18px !important;
      color: #ffffff !important;
      font-size: 18px !important;
      font-weight: 600 !important;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3) !important;
  }
  
  #constraints-container .constraint-divider {
      height: 15px !important;
      margin-bottom: 20px !important;
      border-top: 1px dashed rgba(255, 255, 255, 0.2) !important;
      position: relative !important;
  }
  
  #constraints-container .constraint-divider:after {
      content: "" !important;
      position: absolute !important;
      left: 50% !important;
      top: -8px !important;
      transform: translateX(-50%) !important;
      width: 40px !important;
      height: 15px !important;
      background: #1e1e1e !important;
      border-radius: 10px !important;
  }
  
  .additional-fields {
      margin-top: 10px;
      border-top: 1px dashed rgba(255, 255, 255, 0.1);
      padding-top: 10px;
  }

  .dciss-parameters-container {
      margin-top: 10px;
  }

  .flag-time-range {
      margin-top: 10px;
  }

  .flag-offset-row {
      margin-top: 10px;
  }

  .disabled-field {
      opacity: 0.5;
      background-color: rgba(0, 0, 0, 0.2);
      cursor: not-allowed;
  }

  /* Form layout styles */
  .form-row {
      display: flex;
      gap: 10px;
      margin-bottom: 10px;
  }

  .form-row .form-group {
      flex: 1;
  }

  .form-group label {
      margin-bottom: 5px;
      display: block;
  }

  /* Input field styles */
  .input-field {
      width: 100%;
      padding: 8px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 4px;
      background-color: rgba(0, 0, 0, 0.2);
      color: #fff;
  }

  .input-field:focus {
      border-color: rgba(74, 144, 226, 0.5);
      outline: none;
  }

  .input-field:disabled {
      opacity: 0.5;
      cursor: not-allowed;
  }

  /* Error state */
  .error-field {
      border-color: rgba(255, 82, 82, 0.7);
  }

  .error-message {
      color: rgba(255, 82, 82, 0.9);
      font-size: 12px;
      margin-top: 4px;
  }
  `;

  // Apply the styles more directly to ensure they take effect
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.textContent = optimizationStyles; // Use textContent instead of innerText
  document.head.appendChild(styleSheet);

  // Also add initialization for existing constraints
  function initializeExistingConstraints() {
    const existingConstraints = document.querySelectorAll(
      "#constraints-container .optimization-instance:not(.hidden-template)"
    );
    existingConstraints.forEach((constraint, index) => {
      // Add the class and direct styling
      const colorIndex = (index + 1) % 6 || 6;
      constraint.classList.add(`constraint-form-${colorIndex}`);

      // Apply direct color with inline style
      const borderColors = {
        1: "#4a90e2", // Blue
        2: "#50e3c2", // Teal
        3: "#e6a545", // Orange
        4: "#bd10e0", // Purple
        5: "#e3506f", // Pink
        6: "#67c23a", // Green
      };
      constraint.style.borderLeft = `4px solid ${borderColors[colorIndex]}`;

      // Make the heading more prominent
      const heading = constraint.querySelector(".instance-title");
      if (heading) {
        heading.classList.add("constraint-heading");
      }
    });
  }

  // Call this on page load
  initializeExistingConstraints();

  // Export functions to make them available to other modules
  window.optimizationModule = {
    addObjectiveFunctionForm,
    getObjectiveFunctionData,
    saveOptimizationData,
    getConstraintsData,
    addDesignVariableInstance,
    getDesignVariablesData,
    clearDesignVariablesForm,
    initializeExistingDesignVariables,
    initModeForm,
    getModeData,
    initializeExistingModeData,
  };

  // Make helper functions available globally
  window.optimizationHandler = {
    getObjectiveFunctionData,
    getConstraintsData,
    getDesignVariablesData,
    getModeData,
    populateObjectiveFlagDropdown: (selectElement) =>
      populateFlagDropdown(selectElement, "Objective"),
    populateConstraintFlagDropdown: (selectElement) =>
      populateFlagDropdown(selectElement, "Constraint"),
    populateDesignVariableDropdowns,
    populateSteeringSegmentDropdown,
    populateGenericSegmentDropdown,
    populateConstraintNameDropdown,
    populateAllConstraintNameDropdowns,
    addObjectiveFunctionForm,
    addConstraintInstance,
    addDesignVariableInstance,
    renumberDesignVariables,
    handleDesignVariableCategoryChange,
    handleSteeringSegmentTypeChange,
    clearDesignVariablesForm,
    setupFileUpload,
    createAlgorithmTag,
    updateAlgorithmsCounter,
    toggleModeFields,
    setupAddAlgorithmButton,
  };

  // --- Design Variables Listeners ---
  if (addDesignVariableBtn) {
    addDesignVariableBtn.addEventListener("click", addDesignVariableInstance);
  }

  if (designVariablesForm) {
    designVariablesForm.addEventListener("submit", (event) => {
      event.preventDefault();
      console.log("Design Variables form submitted.");
      const designVariablesData = getDesignVariablesData();

      // Add validation logic here if needed
      let isValid = true;
      // Example validation: Check if names are unique
      const names = designVariablesData.map((dv) => dv.name);
      if (new Set(names).size !== names.length) {
        isValid = false;
        Swal.fire({
          icon: "error",
          title: "Validation Error",
          text: "Design variable names must be unique.",
        });
      }
      // Add more specific validation per category...

      if (isValid) {
        saveOptimizationData("designVariables", designVariablesData);
        // Update section state if using state management
        if (window.sectionStates && window.sectionStates["design-variables"]) {
          window.sectionStates["design-variables"].isSaved = true;
          // ... update other state properties ...
          if (typeof updateSidebarStates === "function") {
            updateSidebarStates();
          }
        }
      }
    });

    // Listener for the clear button
    const clearDVBtn = designVariablesForm.querySelector(
      "#clear-design-variables-btn"
    );
    if (clearDVBtn) {
      clearDVBtn.addEventListener("click", clearDesignVariablesForm);
    }
  }

  // Auto-create initial design variable instance
  if (
    designVariablesContainer &&
    designVariablesContainer.children.length === 0
  ) {
    console.log("Automatically creating initial design variable form on load");
    addDesignVariableInstance();
  }

  // Function to initialize existing design variables
  function initializeExistingDesignVariables() {
    try {
      const missionData = JSON.parse(localStorage.getItem("missionData")) || {};
      const designVariablesData =
        missionData.optimization?.designVariables || [];

      if (designVariablesData.length > 0) {
        // Clear existing instances
        designVariablesContainer.innerHTML = "";
        designVariableCounter = 0;

        // Create instances for each design variable
        designVariablesData.forEach((dvData) => {
          addDesignVariableInstance();

          // Get the last created instance
          const newInstance = designVariablesContainer.querySelector(
            `.optimization-instance:last-child`
          );

          if (newInstance) {
            // Set basic fields
            const categorySelect = newInstance.querySelector(".dv-category");
            const nameInput = newInstance.querySelector(".dv-name");

            if (categorySelect) {
              categorySelect.value = dvData.category;
              categorySelect.dispatchEvent(new Event("change"));
            }

            if (nameInput) {
              nameInput.value = dvData.name || "";
            }

            // Set category-specific fields
            const categoryFields = newInstance.querySelector(
              `.dv-category-fields[data-category="${dvData.category}"]`
            );
            if (categoryFields) {
              const controlVarInput = categoryFields.querySelector(
                ".dv-control-variable"
              );
              const lowerBoundInput =
                categoryFields.querySelector(".dv-lower-bound");
              const upperBoundInput =
                categoryFields.querySelector(".dv-upper-bound");
              const flagSelect = categoryFields.querySelector(".dv-flag");
              const segmentSelect = categoryFields.querySelector(".dv-segment");

              // Helper to set input value (handles arrays)
              const setInputValue = (input, value) => {
                if (!input || value === undefined || value === null) return;
                if (Array.isArray(value)) {
                  input.value = value.join(",");
                } else {
                  input.value = value;
                }
              };

              // Set control variables
              if (
                controlVarInput &&
                dvData.type &&
                dvData.type.control_variable
              ) {
                setInputValue(controlVarInput, dvData.type.control_variable);
              }

              // Set bounds
              if (
                lowerBoundInput &&
                dvData.type &&
                dvData.type.lower_bound !== undefined
              ) {
                setInputValue(lowerBoundInput, dvData.type.lower_bound);
              }

              if (
                upperBoundInput &&
                dvData.type &&
                dvData.type.upper_bound !== undefined
              ) {
                setInputValue(upperBoundInput, dvData.type.upper_bound);
              }

              // Set flag if applicable
              if (flagSelect && dvData.flag) {
                flagSelect.value = dvData.flag;
              }

              // Set segment if applicable
              if (segmentSelect && dvData.segment) {
                segmentSelect.value = dvData.segment;
              }

              // Special handling for STEERING category
              if (dvData.category === "STEERING" && dvData.segment_type) {
                const segmentTypeSelect =
                  categoryFields.querySelector(".dv-segment-type");
                if (segmentTypeSelect) {
                  segmentTypeSelect.value = dvData.segment_type;
                  segmentTypeSelect.dispatchEvent(new Event("change"));

                  // Find and populate the specific steering type fields
                  const steeringTypeFields = categoryFields.querySelector(
                    `.dv-steering-type-fields[data-segment-type="${dvData.segment_type}"]`
                  );

                  if (steeringTypeFields) {
                    const typeAxisSelect =
                      steeringTypeFields.querySelector(".dv-axis");

                    if (typeAxisSelect) {
                      if (typeAxisSelect.tagName === "SELECT") {
                        // For dropdown selects (e.g., CLG)
                        if (dvData.type && dvData.type.axis) {
                          typeAxisSelect.value = dvData.type.axis;
                        }
                      } else if (typeAxisSelect.tagName === "INPUT") {
                        // For text inputs (multi-axis)
                        setInputValue(
                          typeAxisSelect,
                          dvData.type && dvData.type.axis
                        );
                      }
                    }

                    // For PROFILE type, set additional fields
                    if (dvData.segment_type === "PROFILE") {
                      const indVarSelect =
                        steeringTypeFields.querySelector(".dv-ind-variable");
                      const indVectorInput =
                        steeringTypeFields.querySelector(".dv-ind-vector");

                      if (
                        indVarSelect &&
                        dvData.type &&
                        dvData.type.ind_variable
                      ) {
                        indVarSelect.value = dvData.type.ind_variable;
                      }

                      if (
                        indVectorInput &&
                        dvData.type &&
                        dvData.type.ind_vector
                      ) {
                        setInputValue(indVectorInput, dvData.type.ind_vector);
                      }
                    }
                  }
                }
              }
            }
          }
        });

        console.log(
          `Initialized ${designVariablesData.length} existing design variables`
        );
      }
    } catch (error) {
      console.error("Error initializing existing design variables:", error);
    }
  }

  // Call this on page load
  initializeExistingConstraints();

  // Also need to initialize design variables if they exist
  initializeExistingDesignVariables();

  // Add design variable specific styles
  const designVariableStyles = `
    /* Design Variable styles */
    #design-variables-container .optimization-instance {
      background: rgba(30, 30, 30, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.15);
      box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16);
      transition: all 0.3s ease;
      margin-bottom: 20px;
      border-radius: 5px;
      padding: 15px;
      position: relative;
    }
    
    #design-variables-container .optimization-instance:hover {
      background: rgba(40, 40, 40, 0.7);
      border-color: rgba(255, 255, 255, 0.25);
    }
    
    /* Colored borders for different design variables */
    #design-variables-container .optimization-instance:nth-child(6n+1) {
      border-left: 4px solid #4a90e2; /* Blue */
    }
    
    #design-variables-container .optimization-instance:nth-child(6n+2) {
      border-left: 4px solid #50e3c2; /* Teal */
    }
    
    #design-variables-container .optimization-instance:nth-child(6n+3) {
      border-left: 4px solid #e6a545; /* Orange */
    }
    
    #design-variables-container .optimization-instance:nth-child(6n+4) {
      border-left: 4px solid #bd10e0; /* Purple */
    }
    
    #design-variables-container .optimization-instance:nth-child(6n+5) {
      border-left: 4px solid #e3506f; /* Pink */
    }
    
    #design-variables-container .optimization-instance:nth-child(6n+6) {
      border-left: 4px solid #67c23a; /* Green */
    }
    
    /* Add color coding classes by index */
    .design-var-color-1 { border-left: 4px solid #4a90e2 !important; } /* Blue */
    .design-var-color-2 { border-left: 4px solid #50e3c2 !important; } /* Teal */
    .design-var-color-3 { border-left: 4px solid #e6a545 !important; } /* Orange */
    .design-var-color-4 { border-left: 4px solid #bd10e0 !important; } /* Purple */
    .design-var-color-5 { border-left: 4px solid #e3506f !important; } /* Pink */
    .design-var-color-6 { border-left: 4px solid #67c23a !important; } /* Green */
    
    /* Divider between design variable instances */
    .design-variable-divider {
      height: 15px;
      margin-bottom: 20px;
      border-top: 1px dashed rgba(255, 255, 255, 0.2);
      position: relative;
    }
    
    .design-variable-divider:after {
      content: "";
      position: absolute;
      left: 50%;
      top: -8px;
      transform: translateX(-50%);
      width: 40px;
      height: 15px;
      background: #1e1e1e;
      border-radius: 10px;
    }
    
    .instance-title {
      margin-top: 0;
      margin-bottom: 15px;
      font-size: 18px;
      font-weight: 600;
      color: #ffffff;
      border-bottom: 1px solid rgba(255, 255, 255, 0.15);
      padding-bottom: 10px;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    }
    
    .dv-dynamic-fields {
      margin-top: 15px;
      padding-top: 10px;
      border-top: 1px dashed rgba(255, 255, 255, 0.1);
    }
    
    .dv-category-fields {
      margin-bottom: 10px;
    }
    
    .dv-steering-sub-fields {
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px dotted rgba(255, 255, 255, 0.1);
    }
    
    .dv-steering-type-fields {
      margin-top: 10px;
    }
  `;

  // Add the design variable styles to the document
  const dvStyleSheet = document.createElement("style");
  dvStyleSheet.type = "text/css";
  dvStyleSheet.textContent = designVariableStyles;
  document.head.appendChild(dvStyleSheet);

  // =========================================
  // MODE FORM FUNCTIONS
  // =========================================

  // Mode form elements
  const modeNormalRadio = document.getElementById("mode-normal");
  const modeArchipelagoRadio = document.getElementById("mode-archipelago");
  const normalModeFields = document.getElementById("normal-mode-fields");
  const archipelagoModeFields = document.getElementById(
    "archipelago-mode-fields"
  );

  // File upload elements
  const normalCsvUploadBtn = document.getElementById("normal-csv-upload-btn");
  const normalCsvClearBtn = document.getElementById("normal-csv-clear-btn");
  const normalCsvUpload = document.getElementById("normal-csv-upload");
  const normalCsvFilename = document.getElementById("normal-csv-filename");

  const archipelagoCsvUploadBtn = document.getElementById(
    "archipelago-csv-upload-btn"
  );
  const archipelagoCsvClearBtn = document.getElementById(
    "archipelago-csv-clear-btn"
  );
  const archipelagoCsvUpload = document.getElementById(
    "archipelago-csv-upload"
  );
  const archipelagoCsvFilename = document.getElementById(
    "archipelago-csv-filename"
  );

  // Archipelago algorithm elements
  const addAlgorithmBtn = document.getElementById("add-algorithm-btn");
  const archipelagoAlgorithm = document.getElementById("archipelago-algorithm");
  const selectedAlgorithmsContainer = document.getElementById(
    "selected-algorithms-container"
  );
  const algorithmsCounter = document.getElementById("algorithms-counter");

  // Store selected algorithms
  let selectedAlgorithms = [];
  const MAX_ALGORITHMS = 3;

  // Function to toggle between normal and archipelago mode
  function toggleModeFields() {
    if (modeNormalRadio && modeNormalRadio.checked) {
      normalModeFields.style.display = "block";
      archipelagoModeFields.style.display = "none";
    } else if (modeArchipelagoRadio && modeArchipelagoRadio.checked) {
      normalModeFields.style.display = "none";
      archipelagoModeFields.style.display = "block";
    }
  }

  // Function to setup file upload for CSV files
  function setupFileUpload(
    uploadBtn,
    clearBtn,
    fileInput,
    filenameDisplay,
    fileStoreCallback
  ) {
    if (!uploadBtn || !fileInput || !filenameDisplay) return;

    // Click on upload button triggers file input
    uploadBtn.addEventListener("click", () => {
      fileInput.click();
    });

    // When file is selected, update the display and show clear button
    fileInput.addEventListener("change", () => {
      if (fileInput.files.length > 0) {
        const fileName = fileInput.files[0].name;
        filenameDisplay.value = fileName;
        clearBtn.style.display = "block";

        // Read file if callback provided
        if (typeof fileStoreCallback === "function") {
          const reader = new FileReader();
          reader.onload = (e) => {
            fileStoreCallback(e.target.result, fileName);
          };
          reader.readAsText(fileInput.files[0]);
        }
      }
    });

    // Clear button functionality
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        fileInput.value = ""; // Clear file input
        filenameDisplay.value = ""; // Clear displayed filename
        clearBtn.style.display = "none"; // Hide clear button

        if (typeof fileStoreCallback === "function") {
          fileStoreCallback(null, null); // Reset stored file data
        }
      });
    }
  }

  // Function to update the algorithms counter
  function updateAlgorithmsCounter() {
    if (algorithmsCounter) {
      algorithmsCounter.textContent = `${selectedAlgorithms.length}/${MAX_ALGORITHMS} selected`;

      // Visual feedback when limit is reached
      if (selectedAlgorithms.length >= MAX_ALGORITHMS) {
        algorithmsCounter.classList.add("limit-reached");
        if (addAlgorithmBtn) addAlgorithmBtn.disabled = true;
      } else {
        algorithmsCounter.classList.remove("limit-reached");
        if (addAlgorithmBtn) addAlgorithmBtn.disabled = false;
      }
    }
  }

  // Function to create an algorithm tag/chip
  function createAlgorithmTag(algorithm) {
    const tag = document.createElement("div");
    tag.className = "algorithm-tag";
    tag.dataset.algorithm = algorithm;

    // Add color class based on algorithm
    const algorithmColors = {
      SGA: "blue",
      DE: "green",
      PSO: "orange",
      IPOT: "purple",
      CS: "teal",
      GAGGS: "red",
      // Add more color mappings as needed
    };

    const colorClass = algorithmColors[algorithm] || "default";
    tag.classList.add(`algorithm-${colorClass}`);

    tag.innerHTML = `
      <span class="algorithm-name">${algorithm}</span>
      <button type="button" class="remove-algorithm" title="Remove algorithm">×</button>
    `;

    // Add remove button functionality
    const removeBtn = tag.querySelector(".remove-algorithm");
    if (removeBtn) {
      removeBtn.addEventListener("click", () => {
        // Remove from array
        const index = selectedAlgorithms.indexOf(algorithm);
        if (index !== -1) {
          selectedAlgorithms.splice(index, 1);
        }

        // Remove the tag from UI
        tag.remove();

        // Update counter
        updateAlgorithmsCounter();

        // Add the option back to the dropdown
        const option = document.createElement("option");
        option.value = algorithm;
        option.textContent = algorithm;

        // Try to find the position to insert alphabetically
        const options = Array.from(archipelagoAlgorithm.options);
        let inserted = false;

        for (let i = 1; i < options.length; i++) {
          if (options[i].textContent > algorithm) {
            archipelagoAlgorithm.insertBefore(option, options[i]);
            inserted = true;
            break;
          }
        }

        // If we couldn't find a position, add at the end
        if (!inserted) {
          archipelagoAlgorithm.appendChild(option);
        }
      });
    }

    return tag;
  }

  // Function to get the mode data
  function getModeData() {
    const isNormalMode = modeNormalRadio && modeNormalRadio.checked;

    if (isNormalMode) {
      // Get normal mode data
      return {
        mode: "normal",
        algorithm: document.getElementById("normal-algorithm").value,
        map: {
          lower: parseFloat(
            document.getElementById("normal-lower-bound").value
          ),
          upper: parseFloat(
            document.getElementById("normal-upper-bound").value
          ),
        },
        population:
          parseInt(document.getElementById("normal-population").value) || 0,
        setPopulation: document.getElementById("normal-set-population").checked,
        csvFilename: document.getElementById("normal-csv-filename").value,
        problemStrategy: document.getElementById("normal-problem-strategy")
          .value,
      };
    } else {
      // Get archipelago mode data
      return {
        mode: "archipelago",
        algorithms: selectedAlgorithms,
        topology: document.getElementById("archipelago-topology").value,
        migrationType: document.getElementById("archipelago-migration-type")
          .value,
        migrationHandling: document.getElementById(
          "archipelago-migration-handling"
        ).value,
        map: {
          lower: parseFloat(
            document.getElementById("archipelago-lower-bound").value
          ),
          upper: parseFloat(
            document.getElementById("archipelago-upper-bound").value
          ),
        },
        population:
          parseInt(document.getElementById("archipelago-population").value) ||
          0,
        setPopulation: document.getElementById("archipelago-set-population")
          .checked,
        csvFilename: document.getElementById("archipelago-csv-filename").value,
      };
    }
  }

  // Initialize the mode form
  function initModeForm() {
    // Set up mode switching with a more direct approach
    const modeRadios = document.querySelectorAll(
      'input[name="optimization-mode"]'
    );
    modeRadios.forEach((radio) => {
      radio.addEventListener("change", function () {
        const normalMode = document.getElementById("normal-mode-fields");
        const archipelagoMode = document.getElementById(
          "archipelago-mode-fields"
        );
        const isNormalChecked =
          document.getElementById("mode-normal") &&
          document.getElementById("mode-normal").checked;

        if (normalMode && archipelagoMode) {
          if (isNormalChecked) {
            normalMode.style.display = "block";
            archipelagoMode.style.display = "none";
          } else {
            normalMode.style.display = "none";
            archipelagoMode.style.display = "block";
          }
        }
      });
    });

    // Force initial display based on current selection
    const isNormalChecked =
      document.getElementById("mode-normal") &&
      document.getElementById("mode-normal").checked;
    const normalMode = document.getElementById("normal-mode-fields");
    const archipelagoMode = document.getElementById("archipelago-mode-fields");

    if (normalMode && archipelagoMode) {
      if (isNormalChecked) {
        normalMode.style.display = "block";
        archipelagoMode.style.display = "none";
      } else {
        normalMode.style.display = "none";
        archipelagoMode.style.display = "block";
      }
    }

    // Set up file uploads
    setupFileUpload(
      normalCsvUploadBtn,
      normalCsvClearBtn,
      normalCsvUpload,
      normalCsvFilename,
      (fileData, fileName) => {
        // Store file data in memory or localStorage if needed
        console.log(`Normal mode CSV file ${fileName} selected`);
      }
    );

    setupFileUpload(
      archipelagoCsvUploadBtn,
      archipelagoCsvClearBtn,
      archipelagoCsvUpload,
      archipelagoCsvFilename,
      (fileData, fileName) => {
        // Store file data in memory or localStorage if needed
        console.log(`Archipelago mode CSV file ${fileName} selected`);
      }
    );

    // Set up algorithm selection
    if (
      addAlgorithmBtn &&
      archipelagoAlgorithm &&
      selectedAlgorithmsContainer
    ) {
      addAlgorithmBtn.addEventListener("click", () => {
        const selectedValue = archipelagoAlgorithm.value;

        if (selectedValue && !selectedAlgorithms.includes(selectedValue)) {
          // Limit number of algorithms
          if (selectedAlgorithms.length >= MAX_ALGORITHMS) {
            Swal.fire({
              title: "Maximum Algorithms Reached",
              text: `You can only select up to ${MAX_ALGORITHMS} algorithms`,
              icon: "warning",
              toast: true,
              position: "top-end",
              showConfirmButton: false,
              timer: 3000,
            });
            return;
          }

          // Add to selected algorithms array
          selectedAlgorithms.push(selectedValue);

          // Create and append tag
          const algorithmTag = createAlgorithmTag(selectedValue);
          selectedAlgorithmsContainer.insertBefore(
            algorithmTag,
            algorithmsCounter
          );

          // Remove from dropdown
          for (let i = 0; i < archipelagoAlgorithm.options.length; i++) {
            if (archipelagoAlgorithm.options[i].value === selectedValue) {
              archipelagoAlgorithm.remove(i);
              break;
            }
          }

          // Reset dropdown
          archipelagoAlgorithm.value = "";

          // Update counter
          updateAlgorithmsCounter();
        }
      });

      // Initial counter update
      updateAlgorithmsCounter();
    }

    // Add event listeners for the "Set Population" toggle buttons
    const normalSetPopToggle = document.getElementById("normal-set-population");
    const archipelagoSetPopToggle = document.getElementById(
      "archipelago-set-population"
    );

    if (normalSetPopToggle) {
      normalSetPopToggle.addEventListener("change", function () {
        toggleCsvUploadVisibility("normal");
      });
      // Initialize visibility on load
      toggleCsvUploadVisibility("normal");
    }

    if (archipelagoSetPopToggle) {
      archipelagoSetPopToggle.addEventListener("change", function () {
        toggleCsvUploadVisibility("archipelago");
      });
      // Initialize visibility on load
      toggleCsvUploadVisibility("archipelago");
    }

    // Set up form submission
    if (modeForm) {
      modeForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const modeData = getModeData();
        console.log("Mode data:", modeData);

        // Validate the form
        let isValid = true;
        let errorMessage = "";

        if (modeData.mode === "normal") {
          if (!modeData.algorithm) {
            isValid = false;
            errorMessage = "Please select an algorithm";
          }
        } else if (modeData.mode === "archipelago") {
          if (selectedAlgorithms.length === 0) {
            isValid = false;
            errorMessage = "Please select at least one algorithm";
          }
        }

        if (isValid) {
          // Save the data
          saveOptimizationData("mode", modeData);

          Swal.fire({
            title: "Success",
            text: "Optimization mode settings saved successfully",
            icon: "success",
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 3000,
          });
        } else {
          Swal.fire({
            title: "Validation Error",
            text: errorMessage,
            icon: "error",
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 3000,
          });
        }
      });
    }
  }

  // Function to initialize the mode form with existing data
  function initializeExistingModeData() {
    try {
      const missionData = JSON.parse(localStorage.getItem("missionData")) || {};
      const modeData = missionData.optimization?.mode || null;

      if (modeData) {
        // Set the mode radio button
        if (modeData.mode === "normal" && modeNormalRadio) {
          modeNormalRadio.checked = true;
        } else if (modeData.mode === "archipelago" && modeArchipelagoRadio) {
          modeArchipelagoRadio.checked = true;
        }

        // Apply the mode toggle
        toggleModeFields();

        if (modeData.mode === "normal") {
          // Set normal mode fields
          document.getElementById("normal-algorithm").value =
            modeData.algorithm || "";

          if (modeData.map) {
            document.getElementById("normal-lower-bound").value =
              modeData.map.lower || 0;
            document.getElementById("normal-upper-bound").value =
              modeData.map.upper || 1;
          }

          document.getElementById("normal-population").value =
            modeData.population || "";
          document.getElementById("normal-set-population").checked =
            modeData.setPopulation !== undefined
              ? modeData.setPopulation
              : true;
          document.getElementById("normal-csv-filename").value =
            modeData.csvFilename || "";
          document.getElementById("normal-problem-strategy").value =
            modeData.problemStrategy || "IGNORE";

          // Show/hide clear button based on whether a file is selected
          if (modeData.csvFilename && normalCsvClearBtn) {
            normalCsvClearBtn.style.display = "block";
          }

          // Update CSV upload visibility based on toggle state
          toggleCsvUploadVisibility("normal");
        } else if (modeData.mode === "archipelago") {
          // Set archipelago mode fields
          document.getElementById("archipelago-topology").value =
            modeData.topology || "Fully Connected";
          document.getElementById("archipelago-migration-type").value =
            modeData.migrationType || "Broadcast";
          document.getElementById("archipelago-migration-handling").value =
            modeData.migrationHandling || "Evict";

          if (modeData.map) {
            document.getElementById("archipelago-lower-bound").value =
              modeData.map.lower || 0;
            document.getElementById("archipelago-upper-bound").value =
              modeData.map.upper || 1;
          }

          document.getElementById("archipelago-population").value =
            modeData.population || "";
          document.getElementById("archipelago-set-population").checked =
            modeData.setPopulation !== undefined
              ? modeData.setPopulation
              : true;
          document.getElementById("archipelago-csv-filename").value =
            modeData.csvFilename || "";

          // Show/hide clear button based on whether a file is selected
          if (modeData.csvFilename && archipelagoCsvClearBtn) {
            archipelagoCsvClearBtn.style.display = "block";
          }

          // Update CSV upload visibility based on toggle state
          toggleCsvUploadVisibility("archipelago");

          // Add selected algorithms
          if (modeData.algorithms && Array.isArray(modeData.algorithms)) {
            // Clear existing algorithms
            selectedAlgorithms = [];

            // Remove any existing algorithm tags
            const existingTags =
              selectedAlgorithmsContainer.querySelectorAll(".algorithm-tag");
            existingTags.forEach((tag) => tag.remove());

            // Add each algorithm
            modeData.algorithms.forEach((algorithm) => {
              // Add to selected algorithms array
              if (!selectedAlgorithms.includes(algorithm)) {
                selectedAlgorithms.push(algorithm);

                // Create and append tag
                const algorithmTag = createAlgorithmTag(algorithm);
                selectedAlgorithmsContainer.insertBefore(
                  algorithmTag,
                  algorithmsCounter
                );

                // Remove from dropdown
                for (let i = 0; i < archipelagoAlgorithm.options.length; i++) {
                  if (archipelagoAlgorithm.options[i].value === algorithm) {
                    archipelagoAlgorithm.remove(i);
                    break;
                  }
                }
              }
            });

            // Update counter
            updateAlgorithmsCounter();
          }
        }
      }
    } catch (error) {
      console.error("Error initializing existing mode data:", error);
    }
  }

  // Function to toggle CSV upload visibility based on toggle state
  function toggleCsvUploadVisibility(mode) {
    const toggleElement = document.getElementById(`${mode}-set-population`);

    // Directly target the upload row or group
    let uploadElement;

    if (mode === "normal") {
      uploadElement = document.getElementById("normal-upload-row");
    } else {
      // For archipelago, try both ID and class selector
      uploadElement = document.getElementById("archipelago-upload-group");
      if (!uploadElement) {
        // Try finding it by form-group with upload-data class
        uploadElement = document.querySelector(
          `.form-group.upload-data[id="${mode}-upload-group"]`
        );
        if (!uploadElement) {
          // As a last resort, try finding any upload-data element in the archipelago section
          uploadElement = document.querySelector(
            `#archipelago-mode-fields .upload-data`
          );
        }
      }
    }

    if (toggleElement && uploadElement) {
      // Use flex for form rows, block for form groups
      const displayValue = mode === "normal" ? "flex" : "block";
      uploadElement.style.display = toggleElement.checked
        ? displayValue
        : "none";
      console.log(`Toggle ${mode} CSV visibility: ${toggleElement.checked}`);
    } else {
      console.warn(
        `Could not find elements to toggle CSV visibility for ${mode} mode`
      );
      if (!toggleElement)
        console.warn(`Toggle element '${mode}-set-population' not found`);
      if (!uploadElement)
        console.warn(`Upload element for ${mode} mode not found`);
    }
  }

  // Enhanced function to ensure Add Algorithm button works
  function setupAddAlgorithmButton() {
    const addBtn = document.getElementById("add-algorithm-btn");
    const algorithmSelect = document.getElementById("archipelago-algorithm");
    const container = document.getElementById("selected-algorithms-container");
    const counter = document.getElementById("algorithms-counter");

    if (addBtn && algorithmSelect && container) {
      console.log("Setting up Add Algorithm button");

      // Remove any existing listeners by cloning and replacing the button
      const newBtn = addBtn.cloneNode(true);
      addBtn.parentNode.replaceChild(newBtn, addBtn);

      // Add new event listener
      newBtn.addEventListener("click", function (e) {
        e.preventDefault();
        console.log("Add Algorithm button clicked");

        const selectedValue = algorithmSelect.value;
        console.log("Selected algorithm:", selectedValue);

        if (selectedValue && !selectedAlgorithms.includes(selectedValue)) {
          // Limit number of algorithms
          if (selectedAlgorithms.length >= MAX_ALGORITHMS) {
            Swal.fire({
              title: "Maximum Algorithms Reached",
              text: `You can only select up to ${MAX_ALGORITHMS} algorithms`,
              icon: "warning",
              toast: true,
              position: "top-end",
              showConfirmButton: false,
              timer: 3000,
            });
            return;
          }

          // Add to selected algorithms array
          selectedAlgorithms.push(selectedValue);

          // Create and append tag
          const algorithmTag = createAlgorithmTag(selectedValue);
          container.insertBefore(algorithmTag, counter);

          // Remove from dropdown
          for (let i = 0; i < algorithmSelect.options.length; i++) {
            if (algorithmSelect.options[i].value === selectedValue) {
              algorithmSelect.remove(i);
              break;
            }
          }

          // Reset dropdown
          algorithmSelect.value = "";

          // Update counter
          updateAlgorithmsCounter();
        }
      });
    }
  }

  // Add setupAddAlgorithmButton to the initialization flow
  const modeBtn = document.getElementById("mode-btn");
  if (modeBtn) {
    modeBtn.addEventListener("click", () => {
      // Initialize the form after it becomes visible
      setTimeout(() => {
        initModeForm();
        initializeExistingModeData();

        // Setup Add Algorithm button
        setupAddAlgorithmButton();

        // Force update of algorithms counter
        updateAlgorithmsCounter();
      }, 100);
    });
  }

  // Add mode-specific styles
  const modeStyles = `
    /* Mode Form Styles */
    .optimization-mode-section {
      margin-bottom: 20px;
      padding: 15px;
      background: rgba(30, 30, 30, 0.3);
      border-radius: 5px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    /* Fix for archipelago upload group to match normal upload row styling */
    #archipelago-upload-group {
      padding: 10px 0;
      margin: 10px 0;
      width: 100%; /* Ensure full width like the normal upload row */
    }
    
    /* Make all upload controls consistent */
    .upload-data {
      margin-bottom: 10px;
      margin-top: 10px;
    }
    
    /* Normalize the upload controls across both modes */
    #normal-upload-row .upload-data,
    #archipelago-upload-group.upload-data {
      padding: 8px 0;
    }
    
    /* Upload label consistency */
    .upload-label {
      display: block;
      margin-bottom: 8px;
      color: #e0e0e0;
    }
    
    /* Fix for alignment of upload buttons */
    .upload-controls {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
    }
    
    /* Normalize upload buttons */
    .upload {
      padding: 8px 12px;
      background-color: #4a90e2;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 500;
      margin-right: 8px;
    }
    
    .upload:hover {
      background-color: #3a80d2;
    }
    
    /* Clear buttons */
    .clear-upload {
      width: 24px;
      height: 24px;
      background-color: rgba(255, 82, 82, 0.7);
      color: white;
      border: none;
      border-radius: 50%;
      font-size: 16px;
      line-height: 1;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .clear-upload:hover {
      background-color: rgba(255, 82, 82, 1);
    }
    
    /* Make filename fields consistent */
    .filename {
      width: 100%;
      height: 38px;
      padding: 8px;
      background-color: rgba(0, 0, 0, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 4px;
      color: #fff;
    }
    
    .subsection-title {
      margin-top: 0;
      margin-bottom: 15px;
      color: #e0e0e0;
      font-size: 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding-bottom: 8px;
    }
    
    .input-group {
      display: flex;
      gap: 10px;
    }
    
    .input-group .input-field {
      flex: 1;
    }
    
    .selected-algorithms-container {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 10px;
      min-height: 40px;
      padding: 10px;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 4px;
      border: 1px dashed rgba(255, 255, 255, 0.2);
    }
    
    .algorithms-counter {
      color: rgba(255, 255, 255, 0.6);
      font-size: 12px;
      align-self: center;
    }
    
    .algorithms-counter.limit-reached {
      color: #e74c3c;
      font-weight: bold;
    }
    
    .algorithm-selector-row {
      display: flex;
      gap: 10px;
      margin-top: 10px;
    }
    
    .algorithm-selector {
      flex: 1;
    }
    
    .add-algorithm-btn {
      display: flex;
      align-items: center;
      gap: 5px;
      background: #4a90e2;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 8px 15px;
      cursor: pointer;
      transition: background 0.3s;
    }
    
    .add-algorithm-btn:hover {
      background: #3a80d2;
    }
    
    .add-algorithm-btn:disabled {
      background: #6c757d;
      cursor: not-allowed;
    }
    
    .algorithm-tag {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #4a90e2;
      color: white;
      border-radius: 20px;
      padding: 5px 10px;
      font-size: 14px;
    }
    
    .algorithm-blue { background: #4a90e2; }
    .algorithm-green { background: #27ae60; }
    .algorithm-orange { background: #e67e22; }
    .algorithm-purple { background: #9b59b6; }
    .algorithm-teal { background: #1abc9c; }
    .algorithm-red { background: #e74c3c; }
    .algorithm-default { background: #7f8c8d; }
    
    .remove-algorithm {
      background: rgba(0, 0, 0, 0.2);
      border: none;
      color: white;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      font-size: 14px;
      line-height: 1;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
    }
    
    .remove-algorithm:hover {
      background: rgba(0, 0, 0, 0.4);
    }
    
    /* Transition effect for CSV upload section */
    #normal-upload-row,
    #archipelago-upload-group {
      transition: all 0.3s ease;
    }
  `;

  // Add the mode styles to the document
  const modeStyleSheet = document.createElement("style");
  modeStyleSheet.type = "text/css";
  modeStyleSheet.textContent = modeStyles;
  document.head.appendChild(modeStyleSheet);

  // Also initialize the design variables when the design variables button is clicked
  const designVariablesBtn = document.getElementById("design-variables-btn");
  if (designVariablesBtn) {
    designVariablesBtn.addEventListener("click", function () {
      // Wait for the form to be visible before initializing
      setTimeout(() => {
        // If the container is empty, add at least one design variable
        if (
          designVariablesContainer &&
          designVariablesContainer.children.length === 0
        ) {
          addDesignVariableInstance();
        }

        // Make sure flag dropdowns are populated
        const flagDropdowns = document.querySelectorAll(".reference-dropdown");
        flagDropdowns.forEach((dropdown) => {
          populateFlagDropdown(dropdown, "designVariables");
        });

        // Initialize existing design variables data
        initializeExistingDesignVariables();
      }, 100);
    });
  }

  // Directly initialize mode form to ensure radio buttons work properly
  // This ensures the event listeners are attached when the page loads
  setTimeout(() => {
    // Force direct initialization of mode form
    console.log("Initializing mode form directly");

    // Make sure the DOM elements are correctly identified
    const modeRadios = document.querySelectorAll(
      'input[name="optimization-mode"]'
    );
    console.log("Mode radios found:", modeRadios.length);

    // Enhanced toggle function that uses more direct approach
    function enhancedToggleMode() {
      const normalMode = document.getElementById("normal-mode-fields");
      const archipelagoMode = document.getElementById(
        "archipelago-mode-fields"
      );
      const isNormalChecked =
        document.getElementById("mode-normal") &&
        document.getElementById("mode-normal").checked;

      console.log("Toggle mode called, normal checked:", isNormalChecked);

      if (normalMode && archipelagoMode) {
        if (isNormalChecked) {
          normalMode.style.display = "block";
          archipelagoMode.style.display = "none";
        } else {
          normalMode.style.display = "none";
          archipelagoMode.style.display = "block";
        }
      }
    }

    // Attach enhanced listeners to both radio buttons
    modeRadios.forEach((radio) => {
      radio.addEventListener("change", enhancedToggleMode);
      console.log("Added event listener to radio:", radio.id);
    });

    // Force call toggle function
    enhancedToggleMode();

    // Also set up the Add Algorithm button
    setupAddAlgorithmButton();
  }, 1000); // Slightly longer timeout to ensure all elements are loaded

  // Export functions to make them available to other modules
});
