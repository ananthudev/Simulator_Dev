// ======================================================
// Combined Steering Module
// Merged from steering-init.js and steering-configuration.js
// ======================================================

// -------------------------------------------
// Global Utility Functions
// -------------------------------------------

// -------------------------------------------
// Component Management Functions (from steering-init.js)
// -------------------------------------------

function addSteeringComponent(type, baseDisplayName) {
  const availableComponentsList = document.getElementById(
    "available-components-list"
  );
  const activeComponentsList = document.getElementById(
    "active-components-list"
  );
  if (!availableComponentsList || !activeComponentsList) {
    console.error("Component lists not found for adding component.");
    return;
  }

  // Define component types and their limits
  const basicComponentTypes = [
    "verticalAscend",
    "pitchHold",
    "constantPitch",
    "gravityTurn",
    "profile",
    "coasting",
  ];

  // Component limits
  const componentLimits = {
    verticalAscend: 5,
    pitchHold: 5,
    constantPitch: 5,
    gravityTurn: 5,
    profile: 8,
    coasting: 6,
  };

  // Check type-specific limits
  if (basicComponentTypes.includes(type)) {
    const currentCount = Object.values(
      window.steeringState.activeComponents
    ).filter((c) => c.type === type).length;

    const maxComponents = componentLimits[type] || 5;
    if (currentCount >= maxComponents) {
      FormValidator.showGeneralError(
        "Limit Reached",
        `Maximum ${maxComponents} ${baseDisplayName} components allowed.`
      );
      return;
    }
  }

  const componentId = generateComponentId(type);
  let finalDisplayName;

  // Create the desired display name format: Capitalized_Type_Name_Increment
  const idParts = componentId.split("_");
  const typeNamePart = idParts[0]; // e.g., "verticalAscend", "profile"
  const numericPart = idParts.slice(1).join("_"); // e.g., "1" or could be empty if id has no underscore

  // Convert typeNamePart from camelCase or single word to Capitalized_Words_With_Underscores
  // e.g., "verticalAscend" -> "Vertical_Ascend"
  // e.g., "profile" -> "Profile"
  let formattedTypeName = typeNamePart
    .replace(/([A-Z])/g, "_$1") // Insert underscore before caps: "vertical_Ascend" or "profile"
    .toLowerCase() // "vertical_ascend" or "profile"
    .split("_") // ["vertical", "ascend"] or ["profile"]
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // ["Vertical", "Ascend"] or ["Profile"]
    .join("_"); // "Vertical_Ascend" or "Profile"

  finalDisplayName = numericPart
    ? `${formattedTypeName}_${numericPart}`
    : formattedTypeName;

  // Create list item for the component
  const li = document.createElement("li");
  li.classList.add("active-component-item");
  li.dataset.componentId = componentId;
  li.dataset.type = type;
  li.innerHTML = `
    <span>${finalDisplayName}</span> 
    <button type="button" class="remove-component-btn" title="Remove">×</button>
  `;

  li.addEventListener("click", (e) => {
    if (!e.target.classList.contains("remove-component-btn")) {
      selectSteeringComponent(componentId);
    }
  });
  li.querySelector(".remove-component-btn").addEventListener("click", (e) => {
    e.stopPropagation();
    removeSteeringComponent(componentId);
  });
  activeComponentsList.appendChild(li);

  // Update component counter display in the UI
  if (basicComponentTypes.includes(type)) {
    updateComponentCounter(type);
  }

  window.steeringState.activeComponents[componentId] = {
    id: componentId,
    type: type,
    displayName: finalDisplayName,
    config: createDefaultConfig(componentId, type),
  };

  // Ensure dropdown update function exists before calling
  if (typeof updateSteeringReferenceDropdowns === "function") {
    window.updateSteeringReferenceDropdowns();
  } else {
    console.warn(
      "updateSteeringReferenceDropdowns function not found when adding component."
    );
  }
  selectSteeringComponent(componentId);
}

// Update component counter in the UI
function updateComponentCounter(type) {
  const basicComponentTypes = [
    "verticalAscend",
    "pitchHold",
    "constantPitch",
    "gravityTurn",
    "profile",
    "coasting",
  ];

  if (!basicComponentTypes.includes(type)) return;

  // Component limits
  const componentLimits = {
    verticalAscend: 5,
    pitchHold: 5,
    constantPitch: 5,
    gravityTurn: 5,
    profile: 8,
    coasting: 6,
  };

  // Get the component count
  const count = Object.values(window.steeringState.activeComponents).filter(
    (c) => c.type === type
  ).length;

  // Get max allowed for this component type
  const maxCount = componentLimits[type] || 5;

  // Find the button for this component type
  const addButton = document.querySelector(
    `.add-component-btn[data-type="${type}"]`
  );
  if (!addButton) return;

  // Create or update the counter element
  let counter = addButton.parentElement.querySelector(".component-counter");
  if (!counter) {
    counter = document.createElement("span");
    counter.className = "component-counter";
    addButton.parentElement.insertBefore(counter, addButton);
  }

  // Update the counter text and styling
  counter.textContent = count > 0 ? `(${count}/${maxCount})` : "";
  counter.style.marginRight = "5px";
  counter.style.fontSize = "12px";
  counter.style.color = count >= maxCount ? "#ff5252" : "#aaa";

  // Update button state based on count
  addButton.disabled = count >= maxCount;
  if (count >= maxCount) {
    addButton.classList.add("disabled");
    addButton.title = "Maximum limit reached";
  } else {
    addButton.classList.remove("disabled");
    addButton.title = `Add ${type.replace(/([A-Z])/g, " $1").trim()}`;
  }
}

function generateComponentId(type) {
  // Generate ID for any component type
  let currentMax = 0;
  const prefix = type + "_";
  Object.keys(window.steeringState.activeComponents).forEach((id) => {
    if (id.startsWith(prefix)) {
      const num = parseInt(id.substring(prefix.length));
      if (!isNaN(num) && num > currentMax) {
        currentMax = num;
      }
    }
  });
  return `${prefix}${currentMax + 1}`;
}

function createDefaultConfig(componentId, type) {
  // Extract instance number from componentId
  let instanceNum = "1"; // Default to 1
  if (componentId.includes("_")) {
    instanceNum = componentId.substring(componentId.lastIndexOf("_") + 1);
  }

  let flagPrefix;
  switch (type) {
    case "verticalAscend":
      flagPrefix = "VA";
      break;
    case "pitchHold":
      flagPrefix = "PH";
      break;
    case "constantPitch":
      flagPrefix = "CP";
      break;
    case "gravityTurn":
      flagPrefix = "GT";
      break;
    case "profile":
      flagPrefix = "PROFILE";
      break;
    case "coasting":
      flagPrefix = "COASTING";
      break;
    default:
      flagPrefix = `ST_${type.toUpperCase()}`;
  }

  // Use the new flag format with instance number suffix (_1, _2, etc.)
  const startFlag = `${flagPrefix}_START_${instanceNum}`;
  const stopFlag = `${flagPrefix}_STOP_${instanceNum}`;

  return {
    start_identity: startFlag,
    start_trigger_type: "",
    start_trigger_value: "",
    start_reference: "none",
    start_comment: "",
    stop_identity: stopFlag,
    stop_trigger_type: "",
    stop_trigger_value: "",
    stop_reference: "none",
    stop_comment: "",
    steering_type: "",
    steering_params: {},
    steering_comment: "",
    isDirty: false, // Initialize dirty/saved state
    isSaved: false,
  };
}

function selectSteeringComponent(componentId) {
  const configContentArea = document.getElementById("steering-config-content");
  const configPlaceholder = document.getElementById(
    "steering-config-placeholder"
  );
  const currentConfigTitle = document.querySelector(
    "#current-config-title span"
  );
  if (!configContentArea || !configPlaceholder || !currentConfigTitle) {
    console.error("Config area elements not found for selecting component.");
    return;
  }

  document.querySelectorAll(".active-component-item").forEach((item) => {
    item.classList.toggle("selected", item.dataset.componentId === componentId);
  });

  window.steeringState.selectedComponentId = componentId;
  configPlaceholder.classList.add("hidden");
  configContentArea.classList.remove("hidden");
  currentConfigTitle.textContent =
    window.steeringState.activeComponents[componentId].displayName;

  // Ensure the handler and its method exist before calling
  if (
    window.steeringConfigHandler &&
    typeof window.steeringConfigHandler.populateAndValidatePanel === "function"
  ) {
    window.steeringConfigHandler.populateAndValidatePanel(componentId);
  } else {
    console.error(
      "steeringConfigHandler or populateAndValidatePanel method not found!"
    );
  }

  // Explicitly switch to the 'start' tab whenever a component is selected
  if (typeof window.switchTab === "function") {
    window.switchTab("start");
  } else {
    console.warn("switchTab function not found when selecting component.");
  }

  // Update reference dropdowns after switching components
  if (typeof updateSteeringReferenceDropdowns === "function") {
    updateSteeringReferenceDropdowns();
  } else {
    console.warn(
      "updateSteeringReferenceDropdowns function not found when selecting component."
    );
  }
}

function removeSteeringComponent(componentId) {
  const activeComponentsList = document.getElementById(
    "active-components-list"
  );
  const listItem = activeComponentsList?.querySelector(
    `li[data-component-id="${componentId}"]`
  );

  if (listItem) {
    const type = listItem.dataset.type;
    listItem.remove();
    delete window.steeringState.activeComponents[componentId];

    // Update component counter when removing
    const basicComponentTypes = [
      "verticalAscend",
      "pitchHold",
      "constantPitch",
      "gravityTurn",
      "profile",
      "coasting",
    ];

    if (basicComponentTypes.includes(type)) {
      updateComponentCounter(type);
    }

    if (window.steeringState.selectedComponentId === componentId) {
      window.steeringState.selectedComponentId = null;
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

    // Ensure dropdown update function exists before calling
    if (typeof updateSteeringReferenceDropdowns === "function") {
      window.updateSteeringReferenceDropdowns();
    } else {
      console.warn(
        "updateSteeringReferenceDropdowns function not found when removing component."
      );
    }

    console.log(
      "Active components after removal:",
      window.steeringState.activeComponents
    );
  } else {
    console.warn(`List item for component ID ${componentId} not found.`);
  }
}

// -------------------------------------------
// Dynamic Field Generation (from steering-configuration.js)
// -------------------------------------------

function generateSteeringFields(type, params = {}) {
  const container = document.querySelector(".dynamic-steering-fields");
  if (!container) {
    console.error("Dynamic steering fields container not found.");
    return;
  }
  console.log(
    `Generating/Showing fields for type: ${type} with initial params:`,
    JSON.stringify(params)
  );

  container.querySelectorAll(".steering-params").forEach((section) => {
    section.style.display = "none";
  });

  // --- ADDED: Handle empty type ---
  if (!type) {
    console.log("No steering type selected, hiding all dynamic fields.");
    return; // Don't try to find or populate fields for an empty type
  }
  // --- END ADDED ---

  const activeSection = container.querySelector(
    `.steering-params[data-steering-type="${type}"]`
  );

  // Define types with no parameters
  const noParamTypes = [
    "zeroRate",
    "verticalAscend",
    "pitchHold",
    "constantPitch", // Assuming these also might not have specific UI params in this section
    "gravityTurn",
    "coasting",
  ];

  if (activeSection) {
    activeSection.style.display = "block";
    console.log(`Showing section for type: ${type}`);
    console.log(`Calling populateFields for type: ${type}`);
    populateFields(activeSection, params);

    if (type === "clg") {
      const algorithmSelect = activeSection.querySelector(".clg-algorithm");
      if (algorithmSelect) {
        algorithmSelect.removeEventListener("change", handleClgAlgorithmChange);
        algorithmSelect.addEventListener("change", handleClgAlgorithmChange);
        const initialAlgorithm = params.algorithm || algorithmSelect.value;
        if (initialAlgorithm) {
          updateClgFields(initialAlgorithm, params);
          algorithmSelect.value = initialAlgorithm;
        } else {
          updateClgFields(null, {});
        }
      }
    }
  } else if (!noParamTypes.includes(type)) {
    // Only warn if the type is not known to have no parameters
    console.warn(`No parameter section found for steering type: ${type}`);
  }
}

function populateFields(container, params) {
  const currentParams = params && typeof params === "object" ? params : {};
  console.log(
    `Populating fields in container:`,
    container,
    `with params:`,
    JSON.stringify(currentParams)
  );

  if (!container) {
    console.error("populateFields called with invalid container.");
    return;
  }

  // Check if we have any actual parameters to set
  const hasParameters = Object.keys(currentParams).length > 0;

  container
    .querySelectorAll("input[data-param], select[data-param]")
    .forEach((field) => {
      // Skip file inputs entirely
      if (field.type === "file") {
        console.log(
          `populateFields: skipping file input for param: ${field.dataset.param}`
        );
        return;
      }
      const paramName = field.dataset.param;
      console.log(
        `Attempting to populate field for param: ${paramName} (Element: ${
          field.name || field.id
        })`
      );

      if (currentParams.hasOwnProperty(paramName)) {
        const valueToSet = currentParams[paramName];
        const finalValue =
          valueToSet === null || valueToSet === undefined ? "" : valueToSet;
        console.log(
          `Found value for ${paramName}: ${valueToSet} -> Setting field to: '${finalValue}' (Type: ${typeof finalValue})`
        );

        // For SELECT elements, validate that the option exists before setting
        if (field.tagName === "SELECT") {
          // Check if the value exists as an option
          const optionExists = Array.from(field.options).some(
            (option) => option.value === finalValue
          );

          if (optionExists) {
            field.value = finalValue;
            // Use setTimeout to ensure the value is set before dispatching the event
            setTimeout(() => {
              console.log(
                `Triggering change event for select: ${field.name || field.id}`
              );
              field.dispatchEvent(new Event("change", { bubbles: true }));
            }, 50);
          } else {
            console.warn(
              `populateFields: Option "${finalValue}" not found in dropdown for param ${paramName}. Available options:`,
              Array.from(field.options).map((opt) => opt.value)
            );
            // Set to empty string if value doesn't exist
            field.value = "";
          }
        } else {
          field.value = finalValue;
        }
      } else if (!hasParameters) {
        // If no parameters provided at all, preserve existing field values
        console.log(
          `No parameters provided - preserving existing value for ${paramName}`
        );
        // Don't clear the field, just leave its current value
      } else {
        console.log(`Param ${paramName} not found in params object.`);

        // For SELECT elements, validate that empty string is an option
        if (field.tagName === "SELECT") {
          field.value = "";
          setTimeout(() => {
            console.log(
              `Triggering change event for cleared select: ${
                field.name || field.id
              }`
            );
            field.dispatchEvent(new Event("change", { bubbles: true }));
          }, 50);
        } else {
          field.value = "";
        }
      }
    });
}

function updateClgFields(algorithm, params = {}) {
  const clgContainer = document.querySelector(
    '.steering-params[data-steering-type="clg"]'
  );
  if (!clgContainer) return;
  const subFieldsContainer = clgContainer.querySelector(".clg-dynamic-fields");
  if (!subFieldsContainer) return;

  subFieldsContainer
    .querySelectorAll(".steering-params-clg-sub")
    .forEach((subSection) => {
      subSection.style.display = "none";
    });

  const activeSubSection = subFieldsContainer.querySelector(
    `.steering-params-clg-sub[data-clg-algorithm="${algorithm}"]`
  );
  if (activeSubSection) {
    activeSubSection.style.display = "block";
    console.log(`Showing CLG sub-section for algorithm: ${algorithm}`);
    console.log(`Calling populateFields for CLG sub-section: ${algorithm}`);
    populateFields(activeSubSection, params);
  }
}

function handleClgAlgorithmChange(event) {
  const selectedAlgorithm = event.target.value;
  const componentId = window.steeringState?.selectedComponentId;
  const componentParams = componentId
    ? window.steeringState.activeComponents[componentId]?.config
        ?.steering_params || {}
    : {};
  updateClgFields(selectedAlgorithm, componentParams);
  if (window.steeringConfigHandler) {
    window.steeringConfigHandler.markAsDirty("steering");
  }
}

function downloadProfileTemplate() {
  const quantity = document.querySelector('[name="quantity"]')?.value;
  let template = "";
  switch (quantity) {
    case "EULER_RATE":
    case "BODY_RATE":
      template =
        "Time,Roll Rate,Pitch Rate,Yaw Rate\n0,0,0,0\n1,10,20,30\n2,20,40,60";
      break;
    case "QUATERNION":
      template =
        "Time,q0,q1,q2,q3\n0,1,0,0,0\n1,0.9659,0,0.2588,0\n2,0.8660,0,0.5,0";
      break;
    case "EULER_ANGLE":
    case "BODY_ANGLE":
      template = "Time,Roll,Pitch,Yaw\n0,0,0,0\n1,10,20,30\n2,20,40,60";
      break;
    default:
      template = "Time,Roll,Pitch,Yaw\n0,0,0,0\n1,10,20,30\n2,20,40,60";
  }
  const blob = new Blob([template], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `steering_profile_${quantity || "default"}_template.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

// -------------------------------------------
// Configuration Handler Class (from steering-configuration.js)
// -------------------------------------------

class SteeringConfigHandler {
  constructor() {
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    document
      .getElementById("save-start-config")
      ?.addEventListener("click", () => this.saveStartConfig());
    document
      .getElementById("save-stop-config")
      ?.addEventListener("click", () => this.saveStopConfig());
    document
      .getElementById("save-steering-config")
      ?.addEventListener("click", () => this.saveSteeringConfig());

    const fieldsToListen = [
      {
        selector: '[data-field="start_trigger_type"]',
        section: "start",
        event: "change",
      },
      {
        selector: '[data-field="start_trigger_value"]',
        section: "start",
        event: "input",
      },
      {
        selector: '[data-field="start_reference"]',
        section: "start",
        event: "change",
      },
      {
        selector: '[data-field="start_comment"]',
        section: "start",
        event: "input",
      },
      {
        selector: '[data-field="stop_trigger_type"]',
        section: "stop",
        event: "change",
      },
      {
        selector: '[data-field="stop_trigger_value"]',
        section: "stop",
        event: "input",
      },
      {
        selector: '[data-field="stop_reference"]',
        section: "stop",
        event: "change",
      },
      {
        selector: '[data-field="stop_comment"]',
        section: "stop",
        event: "input",
      },
      {
        selector: '[data-field="steering_type"]',
        section: "steering",
        event: "change",
      },
      {
        selector: '[data-field="steering_comment"]',
        section: "steering",
        event: "input",
      },
    ];
    fieldsToListen.forEach(({ selector, section, event }) => {
      const element = document.querySelector(selector);
      if (element) {
        element.addEventListener(event, () => {
          this.markAsDirty(section);
        });
      } else {
        console.warn(
          `Steering config listener: Element not found for selector "${selector}"`
        );
      }
    });

    const steeringTypeSelect = document.querySelector(
      '[data-field="steering_type"]'
    );
    if (steeringTypeSelect) {
      steeringTypeSelect.addEventListener("change", (e) => {
        if (window.generateSteeringFields) {
          window.generateSteeringFields(e.target.value, {});
        } else {
          console.error("generateSteeringFields function not found.");
        }
        this.markAsDirty("steering");
        this.validateSection("steering");
      });
    }

    // --- ADDED: Event listeners for Profile CSV Upload ---
    const profileCsvUploadBtn = document.getElementById(
      "profile-csv-upload-btn"
    );
    const profileCsvUploadInput = document.getElementById("profile-csv-upload");
    const profileCsvFilename = document.getElementById("profile-csv-filename");
    const profileCsvClearBtn = document.getElementById("profile-csv-clear-btn");

    if (
      profileCsvUploadBtn &&
      profileCsvUploadInput &&
      profileCsvFilename &&
      profileCsvClearBtn
    ) {
      profileCsvUploadBtn.addEventListener("click", (e) => {
        e.preventDefault();
        profileCsvUploadInput.click(); // Trigger hidden file input
      });

      profileCsvUploadInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        const componentId = window.steeringState?.selectedComponentId;

        if (
          file &&
          componentId &&
          window.steeringState.activeComponents[componentId]
        ) {
          profileCsvFilename.value = file.name;
          profileCsvClearBtn.style.display = "inline-block";
          profileCsvFilename.classList.remove("error-field"); // Remove error state if any

          // Use FileReader to read the file content
          const reader = new FileReader();
          reader.onload = (event) => {
            try {
              const csvContent = event.target.result;
              // Attempt to use parseAtmosCSV if it exists globally, otherwise define simple parser
              const parseFunction =
                typeof window.parseAtmosCSV === "function"
                  ? window.parseAtmosCSV
                  : (csvString) =>
                      csvString
                        .trim()
                        .split("\n")
                        .map((line) =>
                          line.split(",").map((val) => val.trim())
                        );

              const parsedData = parseFunction(csvContent);

              // Store parsed data and filename in the component's config
              window.steeringState.activeComponents[
                componentId
              ].config.profile_csv_data = parsedData;
              window.steeringState.activeComponents[
                componentId
              ].config.profile_csv_filename = file.name;
              console.log(
                `Parsed and stored profile CSV data for ${componentId}:`,
                parsedData
              );
              this.markAsDirty("steering"); // Mark as dirty after successful parse
            } catch (error) {
              console.error("Error parsing profile CSV:", error);
              FormValidator.showGeneralError(
                "CSV Error",
                "Failed to parse profile CSV. Check file format."
              );
              // Clear data on error
              window.steeringState.activeComponents[
                componentId
              ].config.profile_csv_data = null;
              window.steeringState.activeComponents[
                componentId
              ].config.profile_csv_filename = "";
              profileCsvFilename.value = "Parsing failed";
              profileCsvFilename.classList.add("error-field");
              profileCsvClearBtn.style.display = "none";
              this.markAsDirty("steering"); // Also mark as dirty on error
            }
          };
          reader.onerror = () => {
            console.error("Error reading profile CSV file.");
            FormValidator.showGeneralError(
              "File Error",
              "Could not read the profile CSV file."
            );
            // Clear data on read error
            window.steeringState.activeComponents[
              componentId
            ].config.profile_csv_data = null;
            window.steeringState.activeComponents[
              componentId
            ].config.profile_csv_filename = "";
            profileCsvFilename.value = "Read error";
            profileCsvFilename.classList.add("error-field");
            profileCsvClearBtn.style.display = "none";
            this.markAsDirty("steering");
          };
          reader.readAsText(file);
        } else {
          // Handle case where no file is selected or no component is active
          profileCsvFilename.value = "No file chosen";
          profileCsvClearBtn.style.display = "none";
          if (
            componentId &&
            window.steeringState.activeComponents[componentId]
          ) {
            window.steeringState.activeComponents[
              componentId
            ].config.profile_csv_data = null;
            window.steeringState.activeComponents[
              componentId
            ].config.profile_csv_filename = "";
            this.markAsDirty("steering");
          }
        }
      });

      profileCsvClearBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const componentId = window.steeringState?.selectedComponentId;
        profileCsvUploadInput.value = ""; // Clear the file input
        profileCsvFilename.value = "No file chosen";
        profileCsvClearBtn.style.display = "none";
        profileCsvFilename.classList.remove("error-field");

        if (componentId && window.steeringState.activeComponents[componentId]) {
          window.steeringState.activeComponents[
            componentId
          ].config.profile_csv_data = null;
          window.steeringState.activeComponents[
            componentId
          ].config.profile_csv_filename = "";
          this.markAsDirty("steering");
        }
      });
    } else {
      console.warn("Profile CSV upload elements not found in the DOM.");
    }
    // --- END: Event listeners for Profile CSV Upload ---
  }

  markAsDirty(section) {
    const componentId = window.steeringState?.selectedComponentId;
    if (!componentId || !window.steeringState.activeComponents[componentId])
      return;
    console.log(
      `Marking section '${section}' as dirty for component ${componentId}`
    );
    window.steeringState.activeComponents[componentId].isDirty = true;
    window.steeringState.activeComponents[componentId].isSaved = false;
    this.validateSection(section);
  }

  validateSection(section) {
    let isValid = true;
    const componentId = window.steeringState?.selectedComponentId;
    const component = componentId
      ? window.steeringState.activeComponents[componentId]
      : null;
    const getFieldValue = (field) =>
      document.querySelector(`[data-field="${field}"]`)?.value?.trim() || "";

    switch (section) {
      case "start":
        isValid =
          getFieldValue("start_trigger_type") !== "" &&
          getFieldValue("start_trigger_value") !== "" &&
          !isNaN(parseFloat(getFieldValue("start_trigger_value")));
        break;
      case "stop":
        isValid =
          getFieldValue("stop_trigger_type") !== "" &&
          getFieldValue("stop_trigger_value") !== "" &&
          !isNaN(parseFloat(getFieldValue("stop_trigger_value")));
        break;
      case "steering":
        const steeringType = getFieldValue("steering_type");
        isValid = steeringType !== "";
        if (isValid) {
          const params = this.getSteeringParams(steeringType);
          isValid = this.validateSteeringParams(steeringType, params);
        }
        break;
      default:
        isValid = false;
    }
    this.updateSaveButtonState(
      section,
      isValid,
      component?.isDirty ?? true,
      component?.isSaved ?? false
    );
    return { isValid };
  }

  validateSteeringParams(type, params) {
    console.log(`Validating params for type: ${type}`, params);
    switch (type) {
      case "constantBodyRate":
        const isValid =
          params.axis &&
          params.axis !== "" &&
          params.value !== undefined &&
          !isNaN(params.value);
        console.log(
          `constantBodyRate validation: axis='${params.axis}', value=${params.value}, isValid=${isValid}`
        );
        return isValid;
      case "clg":
        if (!params.algorithm || params.algorithm === "") return false;
        if (params.algorithm === "aoa") {
          return !isNaN(params.max_qaoa) && !isNaN(params.alpha_time);
        } else if (params.algorithm === "fpa") {
          return !isNaN(params.pitch_gain) && !isNaN(params.yaw_gain);
        }
        return false;
      case "profile":
        return (
          params.mode &&
          params.mode !== "" &&
          params.quantity &&
          params.quantity !== "" &&
          params.independentVar &&
          params.independentVar !== ""
        );
      case "verticalAscend":
      case "pitchHold":
      case "constantPitch":
      case "gravityTurn":
      case "zeroRate":
        console.log(`Type ${type} has no parameters to validate here.`);
        return true;
      default:
        console.warn(
          `Unknown steering type encountered in validation: ${type}`
        );
        return false;
    }
  }

  async saveStartConfig() {
    const validationResult = this.validateSection("start");
    if (!validationResult.isValid) {
      FormValidator.showGeneralError(
        "Validation Error",
        "Please fill all required fields correctly in Start Configuration."
      );
      return;
    }
    const config = {
      trigger_type: document.querySelector('[data-field="start_trigger_type"]')
        .value,
      trigger_value: document.querySelector(
        '[data-field="start_trigger_value"]'
      ).value,
      reference: document.querySelector('[data-field="start_reference"]').value,
      comment: document.querySelector('[data-field="start_comment"]').value,
    };
    try {
      const componentId = window.steeringState.selectedComponentId;
      if (!componentId) throw new Error("No component selected");
      const component = window.steeringState.activeComponents[componentId];
      component.config.start_trigger_type = config.trigger_type;
      component.config.start_trigger_value = config.trigger_value;
      component.config.start_reference = config.reference;
      component.config.start_comment = config.comment;
      component.isDirty = false;
      component.isSaved = true;
      this.updateSaveButtonState("start", true, false, true);
      if (typeof updateSteeringReferenceDropdowns === "function") {
        updateSteeringReferenceDropdowns();
      }
      FormValidator.showGeneralSuccess(
        "Saved",
        "Start Configuration saved successfully"
      );
    } catch (error) {
      FormValidator.showGeneralError(
        "Save Error",
        "Failed to save Start Configuration"
      );
      console.error("Error saving start config:", error);
    }
  }

  async saveStopConfig() {
    const validationResult = this.validateSection("stop");
    if (!validationResult.isValid) {
      FormValidator.showGeneralError(
        "Validation Error",
        "Please fill all required fields correctly in Stop Configuration."
      );
      return;
    }
    const config = {
      trigger_type: document.querySelector('[data-field="stop_trigger_type"]')
        .value,
      trigger_value: document.querySelector('[data-field="stop_trigger_value"]')
        .value,
      reference: document.querySelector('[data-field="stop_reference"]').value,
      comment: document.querySelector('[data-field="stop_comment"]').value,
    };
    try {
      const componentId = window.steeringState.selectedComponentId;
      if (!componentId) throw new Error("No component selected");
      const component = window.steeringState.activeComponents[componentId];
      component.config.stop_trigger_type = config.trigger_type;
      component.config.stop_trigger_value = config.trigger_value;
      component.config.stop_reference = config.reference;
      component.config.stop_comment = config.comment;
      component.isDirty = false;
      component.isSaved = true;
      this.updateSaveButtonState("stop", true, false, true);
      if (typeof updateSteeringReferenceDropdowns === "function") {
        updateSteeringReferenceDropdowns();
      }
      FormValidator.showGeneralSuccess(
        "Saved",
        "Stop Configuration saved successfully"
      );
    } catch (error) {
      FormValidator.showGeneralError(
        "Save Error",
        "Failed to save Stop Configuration"
      );
      console.error("Error saving stop config:", error);
    }
  }

  async saveSteeringConfig() {
    const validationResult = this.validateSection("steering");
    if (!validationResult.isValid) {
      FormValidator.showGeneralError(
        "Validation Error",
        "Please fill all required fields correctly in Steering Configuration."
      );
      return;
    }
    const steeringType = document.querySelector(
      '[data-field="steering_type"]'
    ).value;
    const comment = document.querySelector(
      '[data-field="steering_comment"]'
    ).value;

    // --- ADDED: Validation for Profile type ---
    if (steeringType === "profile") {
      const profileContainer = document.getElementById("config-tab-steering"); // Get the container for profile params
      if (profileContainer) {
        const validationResult =
          FormValidator.validateProfileSteeringParams(profileContainer);
        if (!validationResult.isValid) {
          Swal.fire({
            icon: "error",
            title: "Profile Steering Errors",
            html: validationResult.errors.join("<br>"),
          });
          return; // Stop saving if validation fails
        }
      } else {
        console.error("Could not find profile container for validation.");
        // Optionally show a general error to the user
        return; // Stop saving if container not found
      }
    }
    // --- END ADDED ---

    const params = this.getSteeringParams(steeringType);
    try {
      const componentId = window.steeringState.selectedComponentId;
      if (!componentId) throw new Error("No component selected");
      const component = window.steeringState.activeComponents[componentId];
      component.config.steering_type = steeringType;
      component.config.steering_params = params;
      component.config.steering_comment = comment;
      component.isDirty = false;
      component.isSaved = true;
      this.updateSaveButtonState("steering", true, false, true);
      FormValidator.showGeneralSuccess(
        "Saved",
        "Steering Configuration saved successfully"
      );
    } catch (error) {
      FormValidator.showGeneralError(
        "Save Error",
        "Failed to save Steering Configuration"
      );
      console.error("Error saving steering config:", error);
    }
  }

  getSteeringParams(type) {
    const params = {};
    const container = document.querySelector(".dynamic-steering-fields");
    if (!container) return params;

    // Collect parameters based on the selected steering type
    switch (type) {
      case "zeroRate":
        // No specific params needed
        break;
      case "constantBodyRate":
        params.axis = container.querySelector('[data-param="axis"]')?.value;
        params.value = container.querySelector('[data-param="value"]')?.value;
        break;
      case "clg":
        params.algorithm = container.querySelector(
          '[data-param="algorithm"]'
        )?.value;
        const clgSubContainer = container.querySelector(
          `[data-clg-algorithm="${params.algorithm}"]`
        );
        if (clgSubContainer) {
          if (params.algorithm === "aoa") {
            params.max_qaoa = clgSubContainer.querySelector(
              '[data-param="max_qaoa"]'
            )?.value;
            params.alpha_time = clgSubContainer.querySelector(
              '[data-param="alpha_time"]'
            )?.value;
          } else if (params.algorithm === "fpa") {
            params.pitch_gain = clgSubContainer.querySelector(
              '[data-param="pitch_gain"]'
            )?.value;
            params.yaw_gain = clgSubContainer.querySelector(
              '[data-param="yaw_gain"]'
            )?.value;
          }
        }
        break;
      case "profile":
        // No conversion needed, use standard UPPERCASE_WITH_UNDERSCORES format directly
        params.mode = container.querySelector('[data-param="mode"]')?.value; // Keep mode as is (normal/step)

        // Get quantity value directly in UPPERCASE_WITH_UNDERSCORES format
        params.quantity =
          container.querySelector('[data-param="quantity"]')?.value ||
          "EULER_RATE";

        // Get independent var value directly in UPPERCASE_WITH_UNDERSCORES format
        params.independentVar =
          container.querySelector('[data-param="independentVar"]')?.value ||
          "PHASE_TIME";

        params.profile_csv_filename = container.querySelector(
          '[data-param="profile_csv_filename"]'
        )?.value;

        // Get the actual File object if it exists (stored previously)
        const fileInput = document.getElementById("profile-csv-upload");
        if (fileInput && fileInput._selectedFile) {
          params.profile_csv = fileInput._selectedFile; // Keep the File object
        } else {
          params.profile_csv = null;
        }
        break;
      default:
        console.warn(`Unknown steering type for param collection: ${type}`);
    }

    return params;
  }

  updateSaveButtonState(section, isValid, isDirty, isSaved) {
    const saveButton = document.getElementById(`save-${section}-config`);
    const statusIndicator = document.getElementById(`${section}-config-status`);
    const sectionElement = saveButton?.closest(".config-section");
    if (!saveButton) return;

    let buttonText = "Save";
    let buttonEnabled = false;
    let showSavedStatus = false;

    if (!isValid) {
      buttonText = "Save";
      buttonEnabled = false;
      showSavedStatus = false;
    } else {
      if (isDirty) {
        buttonText = "Save";
        buttonEnabled = true;
        showSavedStatus = false;
      } else {
        if (isSaved) {
          buttonText = "Saved ✓";
          buttonEnabled = true;
          showSavedStatus = true;
        } else {
          buttonText = "Save";
          buttonEnabled = true;
          showSavedStatus = false;
        }
      }
    }
    saveButton.textContent = buttonText;
    saveButton.disabled = !buttonEnabled;
    saveButton.classList.toggle("saved", showSavedStatus);
    if (sectionElement) {
      sectionElement.classList.toggle(
        "configured",
        showSavedStatus && !isDirty
      );
      sectionElement.classList.toggle("error", !isValid);
    }
    if (statusIndicator) {
      statusIndicator.textContent = showSavedStatus && !isDirty ? "✓" : "⚪";
      statusIndicator.className = `status-indicator ${
        showSavedStatus && !isDirty ? "complete" : !isValid ? "error" : ""
      }`;
    }
  }

  attachListenersToDynamicFields(container) {
    if (!container) return;
    const dynamicInputs = container.querySelectorAll("input, select");
    dynamicInputs.forEach((input) => {
      if (input.hasAttribute("data-dynamic-listener")) return;
      const eventType =
        input.tagName === "SELECT" ||
        input.type === "radio" ||
        input.type === "checkbox"
          ? "change"
          : "input";
      const listener = () => {
        console.log(
          `Dynamic field change detected: ${input.name}, Type: ${eventType}`
        );
        this.markAsDirty("steering");
      };
      input.addEventListener(eventType, listener);
      input.setAttribute("data-dynamic-listener", "true");
    });
  }

  // This might be redundant if the main listener handles it, keep for now
  handleSteeringTypeChange(type) {
    console.log("handleSteeringTypeChange called with type:", type);
    if (window.generateSteeringFields) {
      const componentId = window.steeringState?.selectedComponentId;
      const componentParams = componentId
        ? window.steeringState.activeComponents[componentId]?.config
            ?.steering_params || {}
        : {};
      window.generateSteeringFields(type, componentParams);
      const dynamicFieldsContainer = document.querySelector(
        ".dynamic-steering-fields"
      );
      const activeSection = dynamicFieldsContainer?.querySelector(
        `.steering-params[data-steering-type="${type}"]`
      );
      if (activeSection) {
        console.log("Attaching listeners after steering type change...");
        this.attachListenersToDynamicFields(activeSection);
      } else {
        console.warn("Could not find active section to attach listeners to.");
      }
    } else {
      console.error("generateSteeringFields function not found.");
    }
    this.validateSection("steering");
  }

  populateAndValidatePanel(componentId) {
    const component = window.steeringState.activeComponents[componentId];
    if (!component) {
      console.error(`Component ${componentId} not found for panel population`);
      return;
    }
    console.log(`Populating panel for component: ${componentId}`);
    const config = component.config;

    // Ensure isSaved is initialized if it doesn't exist (e.g., loading old data)
    component.isSaved = component.isSaved ?? false;

    // Update reference dropdowns before setting values
    if (typeof updateSteeringReferenceDropdowns === "function") {
      updateSteeringReferenceDropdowns();
    }

    // Helper function to safely set field values, especially for dropdowns
    const setFieldValueSafe = (selector, value) => {
      const field = document.querySelector(selector);
      if (!field) {
        console.warn(`Field not found: ${selector}`);
        return;
      }

      const displayValue = value || "";

      if (field.tagName === "SELECT") {
        // Check if the value exists as an option
        const optionExists = Array.from(field.options).some(
          (option) => option.value === displayValue
        );

        if (optionExists) {
          field.value = displayValue;
          // Use setTimeout to ensure the value is set before dispatching the event
          setTimeout(() => {
            field.dispatchEvent(new Event("change", { bubbles: true }));
          }, 50);
        } else if (
          displayValue &&
          displayValue !== "none" &&
          displayValue !== ""
        ) {
          // Add the missing option for reference dropdowns if it's a valid value
          if (selector.includes("reference")) {
            console.log(
              `Adding missing reference option "${displayValue}" to ${selector}`
            );
            const newOption = document.createElement("option");
            newOption.value = displayValue;
            newOption.textContent = displayValue;
            field.appendChild(newOption);
            field.value = displayValue;
            setTimeout(() => {
              field.dispatchEvent(new Event("change", { bubbles: true }));
            }, 50);
          } else {
            console.warn(
              `Option "${displayValue}" not found in dropdown ${selector}. Available options:`,
              Array.from(field.options).map((opt) => opt.value)
            );
            // Set to empty string if value doesn't exist
            field.value = "";
          }
        } else {
          field.value = displayValue;
        }
      } else {
        field.value = displayValue;
      }
    };

    setFieldValueSafe('[data-field="start_identity"]', config.start_identity);
    setFieldValueSafe(
      '[data-field="start_trigger_type"]',
      config.start_trigger_type
    );
    setFieldValueSafe(
      '[data-field="start_trigger_value"]',
      config.start_trigger_value
    );
    setFieldValueSafe('[data-field="start_reference"]', config.start_reference);
    setFieldValueSafe('[data-field="start_comment"]', config.start_comment);
    setFieldValueSafe('[data-field="stop_identity"]', config.stop_identity);
    setFieldValueSafe(
      '[data-field="stop_trigger_type"]',
      config.stop_trigger_type
    );
    setFieldValueSafe(
      '[data-field="stop_trigger_value"]',
      config.stop_trigger_value
    );
    setFieldValueSafe('[data-field="stop_reference"]', config.stop_reference);
    setFieldValueSafe('[data-field="stop_comment"]', config.stop_comment);
    setFieldValueSafe('[data-field="steering_type"]', config.steering_type);
    setFieldValueSafe(
      '[data-field="steering_comment"]',
      config.steering_comment
    );

    // --- ADDED: Update CSV upload UI state based on component data ---
    const profileCsvFilename = document.getElementById("profile-csv-filename");
    const profileCsvClearBtn = document.getElementById("profile-csv-clear-btn");
    const profileCsvUploadInput = document.getElementById("profile-csv-upload");

    if (profileCsvFilename && profileCsvClearBtn && profileCsvUploadInput) {
      // Update the CSV upload UI based on the component's stored CSV data
      if (
        config.profile_csv_filename &&
        config.profile_csv_filename.trim() !== ""
      ) {
        // Component has a CSV file
        profileCsvFilename.value = config.profile_csv_filename;
        profileCsvClearBtn.style.display = "inline-block";
        profileCsvFilename.classList.remove("error-field");
        console.log(
          `Restored CSV state for ${componentId}: ${config.profile_csv_filename}`
        );
      } else {
        // Component has no CSV file
        profileCsvFilename.value = "No file chosen";
        profileCsvClearBtn.style.display = "none";
        profileCsvFilename.classList.remove("error-field");
        profileCsvUploadInput.value = ""; // Clear the file input
        console.log(`Cleared CSV state for ${componentId}: no file`);
      }
    } else {
      console.warn(
        "CSV upload UI elements not found during component population."
      );
    }
    // --- END ADDED ---

    if (typeof generateSteeringFields === "function") {
      // Only call generateSteeringFields if we have actual parameters to set
      // or if the steering type has changed
      const hasParameters =
        config.steering_params &&
        Object.keys(config.steering_params).length > 0;
      const currentType = config.steering_type;

      console.log(
        `Populating steering fields for type: ${currentType} with params:`,
        config.steering_params
      );

      // Always call generateSteeringFields to show the correct section
      generateSteeringFields(currentType, config.steering_params || {});

      const dynamicFieldsContainer = document.querySelector(
        ".dynamic-steering-fields"
      );
      const activeSection = dynamicFieldsContainer?.querySelector(
        `.steering-params[data-steering-type="${currentType}"]`
      );
      if (activeSection) {
        console.log("Attaching listeners after populating panel...");
        this.attachListenersToDynamicFields(activeSection);
      } else {
        // --- MODIFIED: Check if steering type is non-empty before warning ---
        if (currentType) {
          console.warn(
            `Could not find active section for steering type '${currentType}' to attach listeners to during population.`
          );
        } else {
          console.log(
            "No steering type set yet, skipping listener attachment."
          );
        }
        // --- END MODIFICATION ---
      }
    } else {
      console.error("generateSteeringFields function not found.");
    }

    console.log("Validating sections after population...");
    this.validateSection("start");
    this.validateSection("stop");
    this.validateSection("steering");
    console.log("Section validation complete.");
  }
}

// ======================================================
// Initialization (Combined DOMContentLoaded)
// ======================================================
document.addEventListener("DOMContentLoaded", () => {
  console.log("Initializing Steering Module (Combined)...");

  // 1. Get UI Element References (Add error checking)
  const steeringForm = document.getElementById("steering-form");
  const availableComponentsList = document.getElementById(
    "available-components-list"
  );
  const activeComponentsList = document.getElementById(
    "active-components-list"
  );
  const configContentArea = document.getElementById("steering-config-content");
  const configPlaceholder = document.getElementById(
    "steering-config-placeholder"
  );
  const configTabsContainer = document.querySelector(".config-tabs");
  const previewBtn = document.getElementById("previewConfig");

  if (
    !steeringForm ||
    !availableComponentsList ||
    !activeComponentsList ||
    !configContentArea ||
    !configPlaceholder ||
    !configTabsContainer
  ) {
    console.error(
      "Essential steering UI elements missing! Aborting initialization."
    );
    return;
  }

  // 2. Clear Local Storage (if desired)
  localStorage.removeItem("steeringConfiguration");

  // 3. Initialize Global State
  window.steeringState = {
    sequence: "",
    activeComponents: {},
    selectedComponentId: null,
    activeTab: null,
  };

  // Add CSS for component counters
  const style = document.createElement("style");
  style.textContent = `
    .component-counter {
      display: inline-block;
      margin-right: 5px;
      font-size: 12px;
      color: #aaa;
    }
    .add-component-btn.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `;
  document.head.appendChild(style);

  // 4. Initialize Configuration Handler
  window.steeringConfigHandler = new SteeringConfigHandler();

  // 5. Assign Global Functions
  window.generateSteeringFields = generateSteeringFields;

  // 6. Attach Event Listeners

  // Initialize counters for all component types
  const basicComponentTypes = [
    "verticalAscend",
    "pitchHold",
    "constantPitch",
    "gravityTurn",
    "profile",
    "coasting",
  ];

  basicComponentTypes.forEach((type) => {
    // Create counter elements
    const addButton = availableComponentsList.querySelector(
      `.add-component-btn[data-type="${type}"]`
    );
    if (
      addButton &&
      !addButton.parentElement.querySelector(".component-counter")
    ) {
      const counter = document.createElement("span");
      counter.className = "component-counter";

      // Different limits for different component types
      const componentLimits = {
        verticalAscend: 5,
        pitchHold: 5,
        constantPitch: 5,
        gravityTurn: 5,
        profile: 8,
        coasting: 6,
      };

      const maxCount = componentLimits[type] || 5;
      counter.textContent = `(0/${maxCount})`;
      addButton.parentElement.insertBefore(counter, addButton);
    }
    updateComponentCounter(type);
  });

  // Tab switching (ensure function is defined)
  if (configTabsContainer) {
    window.switchTab = function (tabId) {
      const tabButton = configTabsContainer.querySelector(
        `[data-tab="${tabId}"]`
      );
      if (!tabButton) {
        console.error(`Tab button with id ${tabId} not found`);
        return false;
      }
      configTabsContainer
        .querySelectorAll(".config-tab")
        .forEach((tab) => tab.classList.remove("active"));
      document
        .querySelectorAll(".tab-pane")
        .forEach((pane) => pane.classList.add("hidden"));
      tabButton.classList.add("active");
      const tabPaneId = `config-tab-${tabId}`;
      const tabPane = document.getElementById(tabPaneId);
      if (tabPane) {
        tabPane.classList.remove("hidden");
        window.steeringState.activeTab = tabId;
        const event = new CustomEvent("tabChanged", {
          detail: { tabId: tabId, tabPane: tabPane },
        });
        document.dispatchEvent(event);
        return true;
      }
      return false;
    };
    window.getActiveTab = function () {
      return window.steeringState.activeTab;
    };
    configTabsContainer.addEventListener("click", (e) => {
      const tabButton = e.target.closest(".config-tab");
      if (tabButton) {
        window.switchTab(tabButton.dataset.tab);
      }
    });
  }

  // Adding components from available list
  availableComponentsList.addEventListener("click", (event) => {
    const addButton = event.target.closest(".add-component-btn");
    if (addButton && !addButton.disabled) {
      const type = addButton.dataset.type;
      const listItem = addButton.closest("li");
      const displayName = listItem?.querySelector("span")?.textContent || type;
      addSteeringComponent(type, displayName); // Call function defined earlier
    }
  });

  // Form submission (calls function from steering-storage.js)
  steeringForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (typeof saveSteeringConfigToFinalData === "function") {
      saveSteeringConfigToFinalData();
    } else {
      console.error("saveSteeringConfigToFinalData function not found!");
      FormValidator.showGeneralError(
        "Internal Error",
        "Error saving configuration. Required function not loaded."
      );
    }
  });

  // Preview button (calls function from steering-preview.js)
  if (previewBtn) {
    if (typeof showConfigurationPreview === "function") {
      previewBtn.addEventListener("click", showConfigurationPreview);
    } else {
      console.error(
        "showConfigurationPreview function not found! Cannot attach listener."
      );
    }
  } else {
    console.warn(
      "Preview button (previewConfig) not found during initialization."
    );
  }

  console.log("Steering Module initialization complete.");
});

// ======================================================
// Steering Preview Functionality (from steering-preview.js)
// ======================================================

function generateComponentPreview(component) {
  // Helper function to format parameters based on steering type
  function formatSteeringParams(type, params) {
    if (!params) return "Not configured";

    switch (type) {
      case "zeroRate":
        return "Zero Rate";
      case "constantBodyRate":
        return `Axis: ${params.axis || "Not set"}, Value: ${
          params.value || "Not set"
        }`;
      case "clg":
        if (params.algorithm === "aoa") {
          return `Algorithm: AOA, Max QAOA: ${
            params.max_qaoa || "Not set"
          }, Alpha Time: ${params.alpha_time || "Not set"}`;
        } else if (params.algorithm === "fpa") {
          return `Algorithm: FPA, Pitch Gain: ${
            params.pitch_gain || "Not set"
          }, Yaw Gain: ${params.yaw_gain || "Not set"}`;
        }
        return "Algorithm not configured";
      case "profile":
        return `Mode: ${params.mode || "Not set"}, Quantity: ${
          params.quantity || "Not set"
        }, Variable: ${params.independent_variable || "Not set"}`;
      default:
        return "Not configured";
    }
  }

  // Generate HTML for the component preview
  return `
        <div class="preview-component" style="margin-bottom: 20px; border-bottom: 1px solid #444;">
            <h3 style="color: #4a90e2; margin-bottom: 10px;">${
              component.displayName
            }</h3>
            
            <div style="margin-left: 15px;">
                <div class="preview-section">
                    <h4 style="color: #888;">Start Configuration</h4>
                    <p>Event Flag: ${
                      component.config.start_identity || "Not set"
                    }</p>
                    <p>Trigger: ${
                      component.config.start_trigger_type || "Not set"
                    }</p>
                    <p>Value: ${
                      component.config.start_trigger_value || "Not set"
                    }</p>
                    <p>Reference: ${
                      component.config.start_reference || "None"
                    }</p>
                </div>

                <div class="preview-section">
                    <h4 style="color: #888;">Stop Configuration</h4>
                    <p>Event Flag: ${
                      component.config.stop_identity || "Not set"
                    }</p>
                    <p>Trigger: ${
                      component.config.stop_trigger_type || "Not set"
                    }</p>
                    <p>Value: ${
                      component.config.stop_trigger_value || "Not set"
                    }</p>
                    <p>Reference: ${
                      component.config.stop_reference || "None"
                    }</p>
                </div>

                <div class="preview-section">
                    <h4 style="color: #888;">Steering Configuration</h4>
                    <p>Type: ${component.config.steering_type || "Not set"}</p>
                    <p>Comment: ${
                      component.config.steering_comment || "No comment"
                    }</p>
                    <p>Parameters: ${formatSteeringParams(
                      component.config.steering_type,
                      component.config.steering_params
                    )}</p>
                    ${
                      component.config.profile_csv_filename
                        ? `<p>Profile CSV: ${component.config.profile_csv_filename}</p>`
                        : ""
                    }
                </div>
            </div>
        </div>
    `;
}

function showConfigurationPreview() {
  // Get all active components
  const activeComponents = window.steeringState.activeComponents;

  if (!activeComponents || Object.keys(activeComponents).length === 0) {
    FormValidator.showGeneralInfo(
      "No Configuration",
      "No steering components have been configured yet."
    );
    return;
  }

  // Generate preview HTML for each component
  let previewHTML = `
        <div style="text-align: left; padding: 10px;">
            <h2 style="color: #4a90e2; margin-bottom: 20px;">Steering Configuration Preview</h2>
            <p style="margin-bottom: 20px;"><strong>Sequence:</strong> ${
              window.steeringState.sequence || "Not selected"
            }</p>
    `;

  // Add each component's preview
  Object.values(activeComponents).forEach((component) => {
    previewHTML += generateComponentPreview(component);
  });

  previewHTML += "</div>";

  Swal.fire({
    title: "Configuration Preview",
    html: previewHTML,
    width: "800px",
    showConfirmButton: true,
    confirmButtonText: "Close",
    showClass: {
      popup: "swal2-show",
      backdrop: "swal2-backdrop-show",
      icon: "swal2-icon-show",
    },
    customClass: {
      container: "steering-preview-modal",
      popup: "steering-preview-popup",
      content: "steering-preview-content",
    },
  });
}

// ======================================================
// Steering Storage Functionality (from steering-storage.js)
// ======================================================

function saveSteeringConfiguration() {
  const config = {
    sequence: window.steeringState.sequence,
    components: window.steeringState.activeComponents,
    profileCount: window.steeringState.profileCount,
    coastingCount: window.steeringState.coastingCount,
  };

  // Basic validation
  let isValid = true;
  let validationErrors = [];

  Object.values(config.components).forEach((comp) => {
    // Validate Start section
    if (!comp.config.start_trigger_type || !comp.config.start_trigger_value) {
      isValid = false;
      validationErrors.push(
        `${comp.displayName}: Start trigger configuration incomplete`
      );
    }

    // Validate Stop section
    if (!comp.config.stop_trigger_type || !comp.config.stop_trigger_value) {
      isValid = false;
      validationErrors.push(
        `${comp.displayName}: Stop trigger configuration incomplete`
      );
    }

    // Validate Steering section
    if (!comp.config.steering_type) {
      isValid = false;
      validationErrors.push(`${comp.displayName}: Steering type not selected`);
    } else {
      // Validate steering parameters based on type
      switch (comp.config.steering_type) {
        case "constantBodyRate":
          if (
            !comp.config.steering_params.axis ||
            !comp.config.steering_params.value
          ) {
            isValid = false;
            validationErrors.push(
              `${comp.displayName}: Constant Body Rate parameters incomplete`
            );
          }
          break;

        case "clg":
          if (!comp.config.steering_params.algorithm) {
            isValid = false;
            validationErrors.push(
              `${comp.displayName}: CLG algorithm not selected`
            );
          } else if (comp.config.steering_params.algorithm === "aoa") {
            if (
              !comp.config.steering_params.max_qaoa ||
              !comp.config.steering_params.alpha_time
            ) {
              isValid = false;
              validationErrors.push(
                `${comp.displayName}: AOA parameters incomplete`
              );
            }
          } else if (comp.config.steering_params.algorithm === "fpa") {
            if (
              !comp.config.steering_params.pitch_gain ||
              !comp.config.steering_params.yaw_gain
            ) {
              isValid = false;
              validationErrors.push(
                `${comp.displayName}: FPA parameters incomplete`
              );
            }
          }
          break;

        case "profile":
          if (
            !comp.config.steering_params.mode ||
            !comp.config.steering_params.quantity ||
            !comp.config.steering_params.independentVar
          ) {
            isValid = false;
            validationErrors.push(
              `${comp.displayName}: Profile parameters incomplete`
            );
          }
          if (!comp.config.profile_csv_filename) {
            isValid = false;
            validationErrors.push(
              `${comp.displayName}: Profile CSV file not uploaded`
            );
          }
          break;
      }
    }
  });

  if (!isValid) {
    FormValidator.showGeneralError(
      "Validation Error",
      `Please fix the following issues:<br><br>${validationErrors.join("<br>")}`
    );
    return false;
  }

  try {
    localStorage.setItem("steeringConfiguration", JSON.stringify(config));
    FormValidator.showGeneralSuccess(
      "Saved",
      "Steering configuration saved successfully to localStorage."
    );
    return true;
  } catch (error) {
    console.error("Error saving steering configuration:", error);
    FormValidator.showGeneralError(
      "Save Error",
      "Failed to save steering configuration to localStorage."
    );
    return false;
  }
}

function loadSteeringConfiguration() {
  try {
    const savedConfig = localStorage.getItem("steeringConfiguration");
    if (!savedConfig) return false;

    const config = JSON.parse(savedConfig);

    // Reset current state
    window.steeringState = {
      sequence: config.sequence || "",
      activeComponents: config.components || {},
      selectedComponentId: null,
      profileCount: config.profileCount || 0,
      coastingCount: config.coastingCount || 0,
    };

    // Clear active components list
    const activeComponentsList = document.getElementById(
      "active-components-list"
    );
    if (activeComponentsList) {
      activeComponentsList.innerHTML = "";
    }

    // Recreate component list items
    Object.values(config.components).forEach((comp) => {
      const li = document.createElement("li");
      li.classList.add("active-component-item");
      li.dataset.componentId = comp.id;
      li.dataset.type = comp.type;

      li.innerHTML = `
                <span>${comp.displayName}</span>
                <button type="button" class="remove-component-btn" title="Remove">×</button>
            `;

      li.addEventListener("click", (e) => {
        if (!e.target.classList.contains("remove-component-btn")) {
          selectSteeringComponent(comp.id);
        }
      });

      li.querySelector(".remove-component-btn").addEventListener(
        "click",
        (e) => {
          e.stopPropagation();
          removeSteeringComponent(comp.id);
        }
      );

      activeComponentsList.appendChild(li);
    });

    // Hide add buttons for singleton components that are already added
    const singletonTypes = [
      "verticalAscend",
      "pitchHold",
      "constantPitch",
      "gravityTurn",
    ];
    singletonTypes.forEach((type) => {
      if (Object.values(config.components).some((comp) => comp.type === type)) {
        const addButton = document.querySelector(
          `.add-component-btn[data-type="${type}"]`
        );
        if (addButton) addButton.classList.add("hidden");
      }
    });

    return true;
  } catch (error) {
    console.error("Error loading steering configuration:", error);
    return false;
  }
}
