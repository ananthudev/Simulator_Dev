document.addEventListener("DOMContentLoaded", () => {
  console.log("Optimization Handler Loaded");

  const objectiveFunctionContainer = document.getElementById(
    "objective-function-container"
  );
  const addObjectiveBtn = document.getElementById("add-objective-btn");

  const MAX_OBJECTIVES = 4;
  let objectiveCount = 0;

  // --- Constraints Elements ---
  const constraintNameSelect = document.getElementById("constraint-name");
  const constraintFlagSelect = document.getElementById("constraint-flag");

  // --- Mode Elements ---
  const modeNormalRadio = document.getElementById("mode-normal");
  const modeArchipelagoRadio = document.getElementById("mode-archipelago");
  const normalModeFields = document.getElementById("normal-mode-fields");
  const archipelagoModeFields = document.getElementById(
    "archipelago-mode-fields"
  );

  // Archipelago Algorithm Management
  const archipelagoAlgorithmSelect = document.getElementById(
    "archipelago-algorithm"
  );
  const addAlgorithmBtn = document.getElementById("add-algorithm-btn");
  const selectedAlgorithmsContainer = document.getElementById(
    "selected-algorithms-container"
  );
  const algorithmsCounter = document.getElementById("algorithms-counter");
  const selectedAlgorithms = []; // Store selected algorithms
  const MAX_ALGORITHMS = 3;

  // Normal Mode Sub-Elements
  const normalSetPopulationToggle = document.getElementById(
    "normal-set-population"
  );
  const normalUploadRow = document.getElementById("normal-upload-row");
  const normalCsvUploadBtn = document.getElementById("normal-csv-upload-btn");
  const normalCsvClearBtn = document.getElementById("normal-csv-clear-btn");
  const normalCsvInput = document.getElementById("normal-csv-upload");
  const normalCsvFilename = document.getElementById("normal-csv-filename");

  // Archipelago Mode Sub-Elements
  const archipelagoSetPopulationToggle = document.getElementById(
    "archipelago-set-population"
  );
  const archipelagoUploadGroup = document.getElementById(
    "archipelago-upload-group"
  ); // Note: this is the form-group div
  const archipelagoCsvUploadBtn = document.getElementById(
    "archipelago-csv-upload-btn"
  );
  const archipelagoCsvClearBtn = document.getElementById(
    "archipelago-csv-clear-btn"
  );
  const archipelagoCsvInput = document.getElementById("archipelago-csv-upload");
  const archipelagoCsvFilename = document.getElementById(
    "archipelago-csv-filename"
  );

  // Store file objects
  let normalControlVarFile = null;
  let archipelagoControlVarFile = null;

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
    MAX_QAOA: "Maximum QAO",
    Q: "Dynamic Pressure",
    ALPHA: "Angle of Attack",
    MAX_BODY_RATE: "Maximum Body Rate",
    MAX_HEAT_FLUX: "Maximum Heat Flux",
    BODY_RATES: "Body Rates",
    QAOA: "Q Angle of Attack",
    CUSTOM: "IIP",
  };

  // Make constraint options globally available
  window.allConstraintOptions = {
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
    MAX_QAOA: "Maximum QAO",
    Q: "Dynamic Pressure",
    ALPHA: "Angle of Attack",
    MAX_BODY_RATE: "Maximum Body Rate",
    MAX_HEAT_FLUX: "Maximum Heat Flux",
    BODY_RATES: "Body Rates",
    QAOA: "Q Angle of Attack",
    CUSTOM: "IIP",
  };

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

    // Get options available *at this moment*
    const availableOptions = getAvailableObjectiveOptions();

    let nameOptionsHTML =
      '<option value="" disabled selected>Select Objective</option>';
    for (const key in availableOptions) {
      nameOptionsHTML += `<option value="${key}">${availableOptions[key]}</option>`;
    }

    formElement.innerHTML = `
            <button type="button" class="remove-objective-btn remove-btn" title="Remove Objective">&times;</button>
            <h4>Objective Function ${formIndex}</h4>
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

    // Add listener to name dropdown to potentially update other dropdowns (optional)
    // This complexity might not be needed based on the requirement wording
    // formElement.querySelector('.objective-name-select').addEventListener('change', updateAllObjectiveNameDropdowns);
  }

  // Function to remove an objective function form
  function removeObjectiveFunctionForm(formElement) {
    objectiveFunctionContainer.removeChild(formElement);
    objectiveCount--;
    // Optional: Update other name dropdowns if an option becomes available again
    // updateAllObjectiveNameDropdowns();
  }

  // Optional: Function to update all name dropdowns based on current selections
  // function updateAllObjectiveNameDropdowns() {
  //     const selectedNames = getSelectedObjectiveNames();
  //     objectiveFunctionContainer.querySelectorAll('.objective-name-select').forEach(select => {
  //         const currentValue = select.value;
  //         // Logic to rebuild options, preserving current value if still valid
  //     });
  // }

  // --- Constraints --- (New)
  function populateConstraintNameDropdown() {
    if (!constraintNameSelect) return;
    const currentValue = constraintNameSelect.value;
    while (constraintNameSelect.options.length > 1) {
      constraintNameSelect.remove(1);
    }
    for (const key in allConstraintOptions) {
      const option = document.createElement("option");
      option.value = key;
      option.textContent = `${allConstraintOptions[key]} (${key})`;
      constraintNameSelect.appendChild(option);
    }
    constraintNameSelect.value = currentValue;
  }

  // --- Mode Toggles & Uploads --- (New)
  function setupFileUpload(
    uploadBtn,
    clearBtn,
    fileInput,
    filenameDisplay,
    fileStoreCallback
  ) {
    if (uploadBtn) {
      uploadBtn.addEventListener("click", () => fileInput.click());
    }
    if (fileInput) {
      fileInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
          filenameDisplay.value = file.name;
          fileStoreCallback(file); // Store the file object
          if (clearBtn) clearBtn.style.display = "inline-block"; // Show clear button
          filenameDisplay.classList.remove("error-field"); // Clear error state if present
        } else {
          filenameDisplay.value = "No file chosen";
          fileStoreCallback(null);
          if (clearBtn) clearBtn.style.display = "none"; // Hide clear button
        }
      });
    }
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        fileInput.value = ""; // Clear the file input
        filenameDisplay.value = "No file chosen";
        fileStoreCallback(null);
        clearBtn.style.display = "none";
      });
    }
  }

  function toggleUploadSection(toggleElement, sectionElement) {
    if (!toggleElement || !sectionElement) return;
    sectionElement.style.display = toggleElement.checked ? "" : "none"; // Use default display or 'block'/'flex' if needed
  }

  // =========================================
  // EVENT LISTENERS & INITIALIZATION
  // =========================================

  // --- Make helper functions from formHandler.js available ---
  // Assuming formHandler.js loads first, these should be globally available
  const handleInputChange =
    window.handleInputChange ||
    function (event) {
      console.warn("Using fallback handleInputChange in optimizationHandler");
    };
  const getSectionIdFromFormId =
    window.getSectionIdFromFormId ||
    function (formId) {
      console.warn(
        "Using fallback getSectionIdFromFormId in optimizationHandler"
      );
      return null;
    };
  const setupDirtyChecking =
    window.setupDirtyChecking ||
    function (formId) {
      console.warn("Using fallback setupDirtyChecking in optimizationHandler");
    };
  const updateSidebarStates =
    window.updateSidebarStates ||
    function () {
      console.warn("Using fallback updateSidebarStates in optimizationHandler");
    };

  // --- Objective Function Listeners ---
  if (addObjectiveBtn) {
    addObjectiveBtn.addEventListener("click", addObjectiveFunctionForm);
  }
  const objectiveForm = document.getElementById("objective-function-form");
  if (objectiveForm) {
    objectiveForm.addEventListener("submit", (event) => {
      event.preventDefault();
      console.log("Objective Function form submitted.");
      const sectionId = "objective-function"; // Identify the section

      const { isValid, errors } = FormValidator.validateObjectiveFunctionForm(
        objectiveFunctionContainer
      );

      if (isValid) {
        const objectiveData =
          window.optimizationHandler.getObjectiveFunctionData();
        console.log(
          "Objective Data is valid, calling saveOptimizationData:",
          objectiveData
        );
        // Call the save function from missionDataHandler.js
        if (typeof saveOptimizationData === "function") {
          saveOptimizationData("objectiveFunctions", objectiveData);
          // Success message is now handled within saveOptimizationData

          // --- NEW: Update State Management (on successful save) ---
          if (window.sectionStates && window.sectionStates[sectionId]) {
            window.sectionStates[sectionId].isSaved = true;
            window.sectionStates[sectionId].isDirty = false;
            window.sectionStates[sectionId].isValid = true;
            window.sectionStates[sectionId].needsReview = false; // Saving clears review flag

            // Unlock the next section ('constraints')
            const nextSectionId = "constraints";
            if (window.sectionStates[nextSectionId]) {
              window.sectionStates[nextSectionId].isLocked = false;
              console.log(`Section ${nextSectionId} unlocked.`);
            } else {
              console.warn(`Next section ${nextSectionId} not found in state.`);
            }

            // --- Handle Dependents ---
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
                  console.log(
                    `Flagging dependent section ${depId} for review after ${sectionId} save.`
                  );
                  window.sectionStates[depId].needsReview = true;
                  // window.sectionStates[depId].isValid = false; // Optionally invalidate
                }
              });
            }
            // --- End Handle Dependents ---

            // Update sidebar visuals
            if (typeof updateSidebarStates === "function") {
              updateSidebarStates();
            } else {
              console.error("updateSidebarStates function not found.");
            }
          } else {
            console.error(`Section state for ${sectionId} not found.`);
          }
          // --- END: Update State Management ---
        } else {
          console.error("saveOptimizationData function is not defined!");
          Swal.fire({
            icon: "error",
            title: "Save Error",
            text: "Could not save data. Handler function missing.",
          });
        }
      } else {
        // --- Update State on Validation Failure ---
        if (window.sectionStates && window.sectionStates[sectionId]) {
          window.sectionStates[sectionId].isValid = false;
          // Update sidebar visuals
          if (typeof updateSidebarStates === "function") {
            updateSidebarStates();
          } else {
            console.error("updateSidebarStates function not found.");
          }
        } else {
          console.error(`Section state for ${sectionId} not found.`);
        }
        // --- End State Update ---
        Swal.fire({
          icon: "error",
          title: "Objective Function Validation Failed",
          html: errors.join("<br>"),
          toast: false,
          confirmButtonText: "OK",
        });
      }

      // --- NEW: Setup Dirty Checking using Event Delegation ---
      if (objectiveFunctionContainer) {
        console.log(
          "Setting up dirty checking listener for objective function container."
        );
        objectiveFunctionContainer.addEventListener("input", handleInputChange);
        objectiveFunctionContainer.addEventListener(
          "change",
          handleInputChange
        );
        // Note: This assumes handleInputChange correctly finds the FORM element from the event target.
        // We might need to adjust handleInputChange if the event target is deeply nested.
      } else {
        console.warn(
          "Objective function container not found for dirty checking setup."
        );
      }
      // --- END: Setup Dirty Checking ---
    });
  }

  // --- Constraints Listeners ---
  const constraintsNavButton = document.getElementById("constraints-btn");
  if (constraintsNavButton) {
    constraintsNavButton.addEventListener("click", () => {
      setTimeout(() => {
        populateConstraintNameDropdown();
        populateFlagDropdown(constraintFlagSelect, "Constraints");
      }, 50);
    });
  }
  const constraintsForm = document.getElementById("constraints-form");
  if (constraintsForm) {
    constraintsForm.addEventListener("submit", (event) => {
      event.preventDefault();
      console.log("Constraints form submitted.");
      const sectionId = "constraints"; // Identify the section

      // --- START: New Validation Logic ---
      let isValid = true;
      let errors = [];
      const constraintsContainer = document.getElementById(
        "constraints-container"
      );
      const constraintInstances = constraintsContainer.querySelectorAll(
        ".optimization-instance:not(.hidden-template)"
      );

      if (constraintInstances.length === 0) {
        // Optional: Decide if saving with zero constraints is allowed or an error
        // isValid = false;
        // errors.push("Please add at least one constraint.");
        console.log("No constraints added, proceeding with save."); // Or show warning
      } else {
        // Validate each instance
        constraintInstances.forEach((instance) => {
          if (!FormValidator.validateConstraintInstance(instance, errors)) {
            isValid = false; // Mark form as invalid if any instance fails
          }
        });
      }
      // --- END: New Validation Logic ---

      // const { isValid, errors } = FormValidator.validateConstraintsForm(constraintsForm); // Old validation

      if (isValid) {
        const constraintsData = window.optimizationHandler.getConstraintsData();
        console.log(
          "Constraints Data is valid, ready to save:",
          constraintsData
        );
        // Call the save function from missionDataHandler.js
        if (typeof saveOptimizationData === "function") {
          saveOptimizationData("constraints", constraintsData);
          // Success message is now handled within saveOptimizationData

          // --- NEW: Update State Management (on successful save) ---
          if (window.sectionStates && window.sectionStates[sectionId]) {
            window.sectionStates[sectionId].isSaved = true;
            window.sectionStates[sectionId].isDirty = false;
            window.sectionStates[sectionId].isValid = true;
            window.sectionStates[sectionId].needsReview = false; // Saving clears review flag

            // Unlock the next section ('mode')
            const nextSectionId = "mode";
            if (window.sectionStates[nextSectionId]) {
              window.sectionStates[nextSectionId].isLocked = false;
              console.log(`Section ${nextSectionId} unlocked.`);
            } else {
              console.warn(`Next section ${nextSectionId} not found in state.`);
            }

            // --- Handle Dependents ---
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
                  console.log(
                    `Flagging dependent section ${depId} for review after ${sectionId} save.`
                  );
                  window.sectionStates[depId].needsReview = true;
                  // window.sectionStates[depId].isValid = false; // Optionally invalidate
                }
              });
            }
            // --- End Handle Dependents ---

            // Update sidebar visuals
            if (typeof updateSidebarStates === "function") {
              updateSidebarStates();
            } else {
              console.error("updateSidebarStates function not found.");
            }
          } else {
            console.error(`Section state for ${sectionId} not found.`);
          }
          // --- END: Update State Management ---
        } else {
          console.error("saveOptimizationData function is not defined!");
          Swal.fire({
            icon: "error",
            title: "Save Error",
            text: "Could not save data. Handler function missing.",
          });
        }
      } else {
        // --- Update State on Validation Failure ---
        if (window.sectionStates && window.sectionStates[sectionId]) {
          window.sectionStates[sectionId].isValid = false;
          // Update sidebar visuals
          if (typeof updateSidebarStates === "function") {
            updateSidebarStates();
          } else {
            console.error("updateSidebarStates function not found.");
          }
        } else {
          console.error(`Section state for ${sectionId} not found.`);
        }
        // --- End State Update ---
        Swal.fire({
          icon: "error",
          title: "Constraints Validation Failed",
          html: errors.join("<br>"),
          toast: false,
          confirmButtonText: "OK",
        });
      }
    });

    // --- NEW: Setup Dirty Checking using Event Delegation for Constraints ---
    const constraintsContainer = document.getElementById(
      "constraints-container"
    );
    if (constraintsContainer) {
      console.log(
        "Setting up dirty checking listener for constraints container."
      );
      constraintsContainer.addEventListener("input", handleInputChange);
      constraintsContainer.addEventListener("change", handleInputChange);
    } else {
      console.warn("Constraints container not found for dirty checking setup.");
    }
    // --- END: Setup Dirty Checking ---
  }

  // --- Setup Dirty Checking for Mode Form ---
  setupDirtyChecking("mode-form");
  // --- Setup Dirty Checking for Design Variables Form ---
  setupDirtyChecking("design-variables-form");
  // --- END Setup ---

  // --- Mode Listeners --- (New)
  if (modeNormalRadio) {
    modeNormalRadio.addEventListener("change", () => {
      if (modeNormalRadio.checked) {
        normalModeFields.style.display = "block";
        archipelagoModeFields.style.display = "none";
      }
    });
  }
  if (modeArchipelagoRadio) {
    modeArchipelagoRadio.addEventListener("change", () => {
      if (modeArchipelagoRadio.checked) {
        normalModeFields.style.display = "none";
        archipelagoModeFields.style.display = "block";
      }
    });
  }

  // Normal Mode Toggle Listener
  if (normalSetPopulationToggle) {
    normalSetPopulationToggle.addEventListener("change", () => {
      toggleUploadSection(normalSetPopulationToggle, normalUploadRow);
    });
  }
  // Archipelago Mode Toggle Listener
  if (archipelagoSetPopulationToggle) {
    archipelagoSetPopulationToggle.addEventListener("change", () => {
      toggleUploadSection(
        archipelagoSetPopulationToggle,
        archipelagoUploadGroup
      );
    });
  }

  // Archipelago Algorithm Management
  function updateAlgorithmsCounter() {
    if (algorithmsCounter) {
      algorithmsCounter.textContent = `${selectedAlgorithms.length}/${MAX_ALGORITHMS} selected`;

      // Disable add button if max reached
      if (addAlgorithmBtn) {
        addAlgorithmBtn.disabled = selectedAlgorithms.length >= MAX_ALGORITHMS;
        addAlgorithmBtn.classList.toggle(
          "disabled",
          selectedAlgorithms.length >= MAX_ALGORITHMS
        );
      }
    }
  }

  function createAlgorithmTag(algorithm) {
    const tag = document.createElement("div");
    tag.className = "algorithm-tag";
    tag.dataset.algorithm = algorithm;

    const algorithmText = document.createElement("span");
    algorithmText.textContent = algorithm;
    tag.appendChild(algorithmText);

    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-algorithm-btn";
    removeBtn.innerHTML = "&times;";
    removeBtn.title = "Remove";
    removeBtn.addEventListener("click", function () {
      // Remove from selectedAlgorithms array
      const index = selectedAlgorithms.indexOf(algorithm);
      if (index !== -1) {
        selectedAlgorithms.splice(index, 1);
      }

      // Remove tag from UI
      tag.remove();

      // Update counter
      updateAlgorithmsCounter();

      // Add back to dropdown
      const option = document.createElement("option");
      option.value = algorithm;
      option.textContent = algorithm;
      archipelagoAlgorithmSelect.appendChild(option);

      // Sort options
      sortSelectOptions(archipelagoAlgorithmSelect);
    });

    tag.appendChild(removeBtn);
    return tag;
  }

  function sortSelectOptions(selectElement) {
    const options = Array.from(selectElement.options);
    options.sort((a, b) => {
      // Keep the placeholder at the top
      if (a.disabled) return -1;
      if (b.disabled) return 1;
      return a.text.localeCompare(b.text);
    });

    while (selectElement.options.length > 0) {
      selectElement.remove(0);
    }

    options.forEach((option) => selectElement.add(option));
  }

  // Add Algorithm button event listener
  if (addAlgorithmBtn && archipelagoAlgorithmSelect) {
    addAlgorithmBtn.addEventListener("click", function () {
      const selectedOption =
        archipelagoAlgorithmSelect.options[
          archipelagoAlgorithmSelect.selectedIndex
        ];

      if (
        !selectedOption ||
        selectedOption.disabled ||
        selectedOption.value === ""
      ) {
        // Nothing selected or placeholder selected
        return;
      }

      const algorithm = selectedOption.value;

      // Check if already added or if we've reached the limit
      if (
        selectedAlgorithms.includes(algorithm) ||
        selectedAlgorithms.length >= MAX_ALGORITHMS
      ) {
        return;
      }

      // Add to selectedAlgorithms array
      selectedAlgorithms.push(algorithm);

      // Create and add tag to container
      const tag = createAlgorithmTag(algorithm);
      selectedAlgorithmsContainer.insertBefore(tag, algorithmsCounter);

      // Remove from dropdown
      archipelagoAlgorithmSelect.removeChild(selectedOption);

      // Reset dropdown to placeholder
      archipelagoAlgorithmSelect.selectedIndex = 0;

      // Update counter
      updateAlgorithmsCounter();
    });
  }

  // Setup File Uploads
  setupFileUpload(
    normalCsvUploadBtn,
    normalCsvClearBtn,
    normalCsvInput,
    normalCsvFilename,
    (file) => {
      normalControlVarFile = file;
    }
  );
  setupFileUpload(
    archipelagoCsvUploadBtn,
    archipelagoCsvClearBtn,
    archipelagoCsvInput,
    archipelagoCsvFilename,
    (file) => {
      archipelagoControlVarFile = file;
    }
  );

  const modeForm = document.getElementById("mode-form");
  if (modeForm) {
    modeForm.addEventListener("submit", (event) => {
      event.preventDefault();
      console.log("Mode form submitted.");
      const sectionId = "mode"; // Identify the section

      const { isValid, errors } = FormValidator.validateModeForm(modeForm);

      if (isValid) {
        const modeData = window.optimizationHandler.getModeData();
        console.log("Mode Data is valid, ready to save:", modeData);
        // Call the save function from missionDataHandler.js
        if (typeof saveOptimizationData === "function") {
          saveOptimizationData("mode", modeData);
          // Success message is now handled within saveOptimizationData

          // --- NEW: Update State Management (on successful save) ---
          if (window.sectionStates && window.sectionStates[sectionId]) {
            window.sectionStates[sectionId].isSaved = true;
            window.sectionStates[sectionId].isDirty = false;
            window.sectionStates[sectionId].isValid = true;
            window.sectionStates[sectionId].needsReview = false; // Saving clears review flag

            // Unlock the next section ('design-variables')
            const nextSectionId = "design-variables";
            if (window.sectionStates[nextSectionId]) {
              window.sectionStates[nextSectionId].isLocked = false;
              console.log(`Section ${nextSectionId} unlocked.`);
            } else {
              console.warn(`Next section ${nextSectionId} not found in state.`);
            }

            // --- Handle Dependents ---
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
                  console.log(
                    `Flagging dependent section ${depId} for review after ${sectionId} save.`
                  );
                  window.sectionStates[depId].needsReview = true;
                  // window.sectionStates[depId].isValid = false; // Optionally invalidate
                }
              });
            }
            // --- End Handle Dependents ---

            // Update sidebar visuals
            if (typeof updateSidebarStates === "function") {
              updateSidebarStates();
            } else {
              console.error("updateSidebarStates function not found.");
            }
          } else {
            console.error(`Section state for ${sectionId} not found.`);
          }
          // --- END: Update State Management ---
        } else {
          console.error("saveOptimizationData function is not defined!");
          Swal.fire({
            icon: "error",
            title: "Save Error",
            text: "Could not save data. Handler function missing.",
          });
        }
      } else {
        // --- Update State on Validation Failure ---
        if (window.sectionStates && window.sectionStates[sectionId]) {
          window.sectionStates[sectionId].isValid = false;
          // Update sidebar visuals
          if (typeof updateSidebarStates === "function") {
            updateSidebarStates();
          } else {
            console.error("updateSidebarStates function not found.");
          }
        } else {
          console.error(`Section state for ${sectionId} not found.`);
        }
        // --- End State Update ---
        Swal.fire({
          icon: "error",
          title: "Mode Validation Failed",
          html: errors.join("<br>"),
          toast: false,
          confirmButtonText: "OK",
        });
      }
    });
  }

  // --- ADDED: Design Variables form save listener ---
  const designVariablesForm = document.getElementById("design-variables-form");
  if (designVariablesForm) {
    designVariablesForm.addEventListener("submit", (event) => {
      event.preventDefault();
      console.log("Design Variables form submitted");
      const sectionId = "design-variables";

      // Get the data
      const designVariablesData =
        window.optimizationHandler.getDesignVariablesData();

      // Validate the data (minimal validation for now)
      let isValid = true;
      let errors = [];

      if (designVariablesData.length === 0) {
        // Allow empty design variables
        console.log("No design variables added, proceeding with save");
      }

      // Use the FormValidator to validate the form
      const { isValid: formIsValid, errors: formErrors } =
        FormValidator.validateDesignVariablesForm(designVariablesForm);
      isValid = formIsValid;
      errors = formErrors;

      if (isValid) {
        // Save the data
        if (typeof saveOptimizationData === "function") {
          saveOptimizationData("designVariables", designVariablesData);

          // Update state management
          if (window.sectionStates && window.sectionStates[sectionId]) {
            window.sectionStates[sectionId].isSaved = true;
            window.sectionStates[sectionId].isDirty = false;
            window.sectionStates[sectionId].isValid = true;
            window.sectionStates[sectionId].needsReview = false;

            // Unlock the next section
            const nextSectionId = "stopping";
            if (window.sectionStates[nextSectionId]) {
              window.sectionStates[nextSectionId].isLocked = false;
              console.log(`Section ${nextSectionId} unlocked.`);
            } else {
              console.warn(`Next section ${nextSectionId} not found in state.`);
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
                  console.log(
                    `Flagging dependent section ${depId} for review after ${sectionId} save.`
                  );
                  window.sectionStates[depId].needsReview = true;
                }
              });
            }

            // Update sidebar visuals
            if (typeof updateSidebarStates === "function") {
              updateSidebarStates();
            } else {
              console.error("updateSidebarStates function not found.");
            }
          } else {
            console.error(`Section state for ${sectionId} not found.`);
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
          } else {
            console.error("updateSidebarStates function not found.");
          }
        } else {
          console.error(`Section state for ${sectionId} not found.`);
        }

        Swal.fire({
          icon: "error",
          title: "Design Variables Validation Failed",
          html: errors.join("<br>"),
          toast: false,
          confirmButtonText: "OK",
        });
      }
    });
  }
  // --- END: Design Variables form save listener ---

  // --- Initial Setup ---
  populateConstraintNameDropdown(); // Populate constraints name initially

  // Initial Mode State
  if (modeNormalRadio && modeNormalRadio.checked) {
    normalModeFields.style.display = "block";
    archipelagoModeFields.style.display = "none";
    toggleUploadSection(normalSetPopulationToggle, normalUploadRow);
  } else if (modeArchipelagoRadio && modeArchipelagoRadio.checked) {
    normalModeFields.style.display = "none";
    archipelagoModeFields.style.display = "block";
    toggleUploadSection(archipelagoSetPopulationToggle, archipelagoUploadGroup);
    // Initialize algorithms counter
    updateAlgorithmsCounter();
  } else {
    // Default to Normal if nothing is checked initially (or handle error)
    if (normalModeFields) normalModeFields.style.display = "block";
    if (archipelagoModeFields) archipelagoModeFields.style.display = "none";
    toggleUploadSection(normalSetPopulationToggle, normalUploadRow);
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
  const constraintsContainer = document.getElementById("constraints-container");
  if (constraintsContainer && constraintsContainer.children.length === 0) {
    console.log("Automatically creating initial constraint form on page load");
    addConstraintInstance();
  }

  // =========================================
  // DATA GATHERING (for missionDataHandler)
  // =========================================
  window.optimizationHandler = {
    getObjectiveFunctionData: () => {
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
      console.log("Collected Objectives (adjusted):", objectives);
      return objectives;
    },
    getConstraintsData: () => {
      // (New - Updated to handle multiple instances)
      const constraintsData = [];
      const constraintInstances = document.querySelectorAll(
        "#constraints-container .optimization-instance:not(.hidden-template)"
      ); // Select only visible instances

      constraintInstances.forEach((instance) => {
        const index = instance.getAttribute("data-index"); // Use index if needed, or just query within instance
        const nameSelect = instance.querySelector(".constraint-name");
        const valueInput = instance.querySelector(".constraint-value");
        const typeSelect = instance.querySelector(".constraint-type");
        const conditionSelect = instance.querySelector(".constraint-condition");
        const flagSelect = instance.querySelector(".constraint-flag");
        const toleranceInput = instance.querySelector(".constraint-tolerance"); // New Tolerance
        const enableToggle = instance.querySelector(".constraint-enable");

        // Basic check: only add if a name is selected
        if (nameSelect && nameSelect.value) {
          const constraintType = nameSelect.value;
          const constraint = {
            name: constraintType,
            value: valueInput ? parseFloat(valueInput.value) : null,
            type: typeSelect ? typeSelect.value : null,
            condition: conditionSelect ? conditionSelect.value : null,
            flag: flagSelect ? flagSelect.value || null : null, // Handle empty selection
            tolerance: toleranceInput ? parseFloat(toleranceInput.value) : null, // New Tolerance - default to null if empty
            enable: enableToggle ? enableToggle.checked : true, // Default to true
          };

          // Add factor (always 1 as per requirements)
          constraint.factor = 1;

          // Orbital elements and related constraints - no special fields needed
          const orbitalElements = [
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
          ];

          // Handle Stage Impact constraint
          if (constraintType === "STAGE_IMPACT") {
            const coordinateSelect = instance.querySelector(
              ".constraint-coordinate"
            );
            if (coordinateSelect) {
              constraint.coordinate = coordinateSelect.value;
            }
          }
          // Handle Q/QAOA group constraints
          else if (
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

              // Check if FLAG or MISSION_TIME to determine how to collect from/to values
              if (triggerSelect.value === "FLAG") {
                const fromSelect = instance.querySelector(
                  ".constraint-flag-from"
                );
                const toSelect = instance.querySelector(".constraint-flag-to");
                constraint.from = fromSelect ? fromSelect.value : null;
                constraint.to = toSelect ? toSelect.value : null;
              } else if (triggerSelect.value === "MISSION_TIME") {
                const fromInput = instance.querySelector(
                  ".constraint-time-from"
                );
                const toInput = instance.querySelector(".constraint-time-to");
                constraint.from = fromInput ? parseFloat(fromInput.value) : 0;
                constraint.to = toInput ? parseFloat(toInput.value) : 0;
              }

              // Get offset values
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
          }
          // Handle Custom constraint
          else if (constraintType === "CUSTOM") {
            const tiInput = instance.querySelector(".constraint-ti");
            const tfInput = instance.querySelector(".constraint-tf");
            const timePointInput = instance.querySelector(
              ".constraint-time-point"
            );
            const inputSelect = instance.querySelector(
              ".constraint-custom-input"
            );
            const positionInput = instance.querySelector(
              ".constraint-position"
            );

            if (tiInput) constraint.ti = parseFloat(tiInput.value);
            if (tfInput) constraint.tf = parseFloat(tfInput.value);
            if (timePointInput)
              constraint.time_point = parseFloat(timePointInput.value);
            if (inputSelect) constraint.input = inputSelect.value;
            if (positionInput) constraint.Position = positionInput.value;
          }
          // Handle DCISS constraint
          else if (constraintType === "DCISS_IMPACT") {
            const dcissTypeSelect = instance.querySelector(
              ".constraint-dciss-type"
            );
            if (dcissTypeSelect) {
              // Create Parameters object
              constraint.Parameters = {
                constraint: dcissTypeSelect.value,
              };

              // Add specific parameters based on DCISS type
              if (dcissTypeSelect.value === "Line") {
                const positionInput = instance.querySelector(
                  ".constraint-dciss-position"
                );
                const lineBoundsInput = instance.querySelector(
                  ".constraint-dciss-line-bounds"
                );

                if (positionInput)
                  constraint.Parameters.Position = positionInput.value;

                // Line bounds should be parsed as JSON if possible
                if (lineBoundsInput) {
                  try {
                    constraint.Parameters.line_bounds = JSON.parse(
                      lineBoundsInput.value
                    );
                  } catch (e) {
                    console.warn("Could not parse line bounds as JSON:", e);
                    constraint.Parameters.line_bounds = lineBoundsInput.value;
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
                if (centerInput)
                  constraint.Parameters.Center = centerInput.value;
              } else if (dcissTypeSelect.value === "Box") {
                const lineBoundInput = instance.querySelector(
                  ".constraint-dciss-line-bound"
                );
                if (lineBoundInput)
                  constraint.Parameters.Line_Bound = lineBoundInput.value;
              }
            }
          }

          constraintsData.push(constraint);
        } else {
          console.warn(
            `Skipping constraint instance (index ${
              index || "unknown"
            }) because name is not selected.`
          );
        }
      });

      console.log("Collected Constraints Data (Multiple):", constraintsData);
      return constraintsData; // Return array of constraint objects
    },
    getModeData: () => {
      // Updated Implementation
      let modeData = {};
      const selectedMode = document.querySelector(
        'input[name="optimization-mode"]:checked'
      )?.value;

      if (selectedMode === "normal") {
        modeData = {
          mode_type: "normal",
          optimizer_algorithm:
            document.getElementById("normal-algorithm")?.value,
          bounds: [
            parseFloat(document.getElementById("normal-upper-bound")?.value) ||
              0,
            parseFloat(document.getElementById("normal-lower-bound")?.value) ||
              0,
          ],
          population:
            parseInt(document.getElementById("normal-population")?.value) || 0,
          set_population: normalSetPopulationToggle?.checked,
          initial_control_variable_file:
            normalSetPopulationToggle?.checked && normalControlVarFile
              ? normalControlVarFile.name
              : null,
          problem_strategy: document.getElementById("normal-problem-strategy")
            ?.value,
        };
      } else if (selectedMode === "archipelago") {
        modeData = {
          mode_type: "archipelago",
          algorithms: [...selectedAlgorithms], // Use the array of selected algorithms
          topology: document.getElementById("archipelago-topology")?.value,
          migration_type: document.getElementById("archipelago-migration-type")
            ?.value,
          migration_handling: document.getElementById(
            "archipelago-migration-handling"
          )?.value,
          bounds: [
            parseFloat(
              document.getElementById("archipelago-upper-bound")?.value
            ) || 0,
            parseFloat(
              document.getElementById("archipelago-lower-bound")?.value
            ) || 0,
          ],
          population:
            parseInt(
              document.getElementById("archipelago-population")?.value
            ) || 0,
          set_population: archipelagoSetPopulationToggle?.checked,
          initial_control_variable_file:
            archipelagoSetPopulationToggle?.checked && archipelagoControlVarFile
              ? archipelagoControlVarFile.name
              : null,
        };
      } else {
        console.warn("No optimization mode selected.");
        return null; // Or appropriate default/error state
      }

      console.log("Collected Mode Data:", modeData);
      return modeData;
    },
    populateObjectiveFlagDropdown: (selectElement) =>
      populateFlagDropdown(selectElement, "Objective"),
    populateConstraintFlagDropdown: () =>
      populateFlagDropdown(constraintFlagSelect, "Constraints"),
    addObjectiveFunctionForm: addObjectiveFunctionForm,
    addConstraintInstance: addConstraintInstance,
    addDesignVariableInstance: () => {
      const container = document.getElementById("design-variables-container");
      const template = document.getElementById("design-variable-template");

      if (!container || !template) {
        console.error("Design variable container or template not found!");
        return;
      }

      // Check max design variables (optional)
      const MAX_DESIGN_VARIABLES = 10; // Set a reasonable limit
      const currentCount = container.querySelectorAll(
        ".optimization-instance"
      ).length;
      if (currentCount >= MAX_DESIGN_VARIABLES) {
        Swal.fire({
          icon: "warning",
          title: "Maximum Design Variables Reached",
          text: `You can add a maximum of ${MAX_DESIGN_VARIABLES} design variables.`,
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
        });
        return;
      }

      // Use a global counter for unique identification
      window.designVariableCounter = window.designVariableCounter || 0;
      window.designVariableCounter++;

      const newInstance = template.cloneNode(true);
      newInstance.id = `design-variable-instance-${window.designVariableCounter}`;
      newInstance.classList.remove("hidden-template");
      newInstance.setAttribute("data-index", window.designVariableCounter);

      // Update title
      const titleSpan = newInstance.querySelector(".instance-title span");
      if (titleSpan) {
        titleSpan.textContent = window.designVariableCounter;
      }

      // Add listener for category changes - use safe event listener to prevent duplication
      const categorySelect = newInstance.querySelector(
        ".design-variable-category"
      );
      if (categorySelect) {
        categorySelect.addEventListener("change", (event) => {
          handleDesignVariableCategoryChange(event);

          // Run validation after category change to highlight required fields
          setTimeout(() => {
            const errors = [];
            FormValidator.validateDesignVariableInstance(newInstance, errors);
          }, 100);
        });
      }

      // Update input names/IDs with the counter for unique identification
      newInstance.querySelectorAll(".input-field, select").forEach((el) => {
        const originalId = el.id;
        if (originalId) {
          el.id = `${originalId}-${window.designVariableCounter}`;
        }
      });

      // Add event listener for the delete button
      const deleteBtn = newInstance.querySelector(".delete-instance-btn");
      if (deleteBtn) {
        deleteBtn.addEventListener("click", () => {
          newInstance.remove();
          // Optionally renumber remaining design variables for UI consistency
          renumberDesignVariables();
        });
      }

      container.appendChild(newInstance);

      // Run initial validation after a short delay
      setTimeout(() => {
        const errors = [];
        FormValidator.validateDesignVariableInstance(newInstance, errors);
      }, 100);
    },
    getDesignVariablesData: () => {
      const designVariablesData = [];
      const designVariableInstances = document.querySelectorAll(
        "#design-variables-container .optimization-instance:not(.hidden-template)"
      );

      designVariableInstances.forEach((instance) => {
        const category = instance.querySelector(
          ".design-variable-category"
        )?.value;
        const name = instance.querySelector(".design-variable-name")?.value;

        if (!category || !name) return; // Skip incomplete entries

        const designVariable = {
          category: category,
          name: name,
        };

        // Add category-specific fields
        switch (category) {
          case "CUT_OFF":
            designVariable.flag = instance.querySelector(
              ".design-variable-flag"
            )?.value;
            designVariable.type = instance.querySelector(
              ".design-variable-type"
            )?.value;
            designVariable.control_variable = instance.querySelector(
              ".design-variable-control-variable"
            )?.value;
            designVariable.upper_bound = parseFloat(
              instance.querySelector(".design-variable-upper-bound")?.value
            );
            designVariable.lower_bound = parseFloat(
              instance.querySelector(".design-variable-lower-bound")?.value
            );
            break;

          case "PAYLOAD":
          case "AZIMUTH":
            designVariable.type = {
              control_variable: instance
                .querySelector(".design-variable-control-variable")
                ?.value?.split(",")
                .map((item) => item.trim()),
              upper_bound: instance
                .querySelector(".design-variable-upper-bound")
                ?.value?.split(",")
                .map((item) => parseFloat(item.trim())),
              lower_bound: instance
                .querySelector(".design-variable-lower-bound")
                ?.value?.split(",")
                .map((item) => parseFloat(item.trim())),
            };
            break;

          case "SEQUENCE":
            designVariable.flag = instance.querySelector(
              ".design-variable-flag"
            )?.value;
            designVariable.type = {
              control_variable: instance
                .querySelector(".design-variable-control-variable")
                ?.value?.split(",")
                .map((item) => item.trim()),
              upper_bound: instance
                .querySelector(".design-variable-upper-bound")
                ?.value?.split(",")
                .map((item) => parseFloat(item.trim())),
              lower_bound: instance
                .querySelector(".design-variable-lower-bound")
                ?.value?.split(",")
                .map((item) => parseFloat(item.trim())),
            };
            break;

          case "PROPULSION":
            designVariable.segment = instance.querySelector(
              ".design-variable-segment"
            )?.value;
            designVariable.type = {
              control_variable: instance
                .querySelector(".design-variable-control-variable")
                ?.value?.split(",")
                .map((item) => item.trim()),
              upper_bound: instance
                .querySelector(".design-variable-upper-bound")
                ?.value?.split(",")
                .map((item) => parseFloat(item.trim())),
              lower_bound: instance
                .querySelector(".design-variable-lower-bound")
                ?.value?.split(",")
                .map((item) => parseFloat(item.trim())),
            };
            break;

          case "STEERING":
            designVariable.segment = instance.querySelector(
              ".design-variable-segment"
            )?.value;
            designVariable.segment_type = instance.querySelector(
              ".design-variable-segment-type"
            )?.value;

            // Add fields based on segment type
            if (designVariable.segment_type === "CLG") {
              designVariable.type = {
                axis: instance.querySelector(".design-variable-axis")?.value,
                upper_bound: parseFloat(
                  instance.querySelector(".design-variable-upper-bound")?.value
                ),
                lower_bound: parseFloat(
                  instance.querySelector(".design-variable-lower-bound")?.value
                ),
              };
            } else if (designVariable.segment_type === "ZERO_RATE") {
              designVariable.type = {
                control_variable: instance
                  .querySelector(".design-variable-control-variable")
                  ?.value?.split(",")
                  .map((item) => item.trim()),
                upper_bound: instance
                  .querySelector(".design-variable-upper-bound")
                  ?.value?.split(",")
                  .map((item) => parseFloat(item.trim())),
                lower_bound: instance
                  .querySelector(".design-variable-lower-bound")
                  ?.value?.split(",")
                  .map((item) => parseFloat(item.trim())),
              };
            } else if (designVariable.segment_type === "CONST_BODYRATE") {
              designVariable.type = {
                control_variable: instance
                  .querySelector(".design-variable-control-variable")
                  ?.value?.split(",")
                  .map((item) => item.trim()),
                axis: instance
                  .querySelector(".design-variable-axis")
                  ?.value?.split(",")
                  .map((item) => item.trim()),
                upper_bound: instance
                  .querySelector(".design-variable-upper-bound")
                  ?.value?.split(",")
                  .map((item) => parseFloat(item.trim())),
                lower_bound: instance
                  .querySelector(".design-variable-lower-bound")
                  ?.value?.split(",")
                  .map((item) => parseFloat(item.trim())),
              };
            } else if (designVariable.segment_type === "PROFILE") {
              designVariable.type = {
                control_variable: instance.querySelector(
                  ".design-variable-control-variable"
                )?.value,
                axis: instance.querySelector(".design-variable-axis")?.value,
                ind_variable: instance.querySelector(
                  ".design-variable-ind-variable"
                )?.value,
                ind_vector: instance
                  .querySelector(".design-variable-ind-vector")
                  ?.value?.split(",")
                  .map((item) => parseFloat(item.trim())),
                upper_bound: parseFloat(
                  instance.querySelector(".design-variable-upper-bound")?.value
                ),
                lower_bound: parseFloat(
                  instance.querySelector(".design-variable-lower-bound")?.value
                ),
              };
            }
            break;
        }

        designVariablesData.push(designVariable);
      });

      console.log("Collected Design Variables Data:", designVariablesData);
      return designVariablesData;
    },
  };
});

// Add styles for the remove button and form card
const optimizationStyles = `
.form-card {
    /* Style matching constraint instance */
    border: 1px dashed rgba(255, 255, 255, 0.2);
    border-radius: 5px;
    padding: 15px;
    margin-bottom: 20px;
    position: relative; /* Needed for absolute positioning of remove button */
}

.form-card h4 {
    margin-top: 0;
    margin-bottom: 15px;
    /* Style matching constraint instance title */
    color: #e0e0e0; /* Keeping color */
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding-bottom: 5px;
}

.remove-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    background-color: rgba(255, 82, 82, 0.7); /* Reddish */
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
    background-color: rgba(255, 82, 82, 1); /* Brighter red on hover */
}

.hidden-template {
    display: none !important; /* Make sure it's hidden */
}

/* NEW: Styling for mode sections */
.optimization-mode-section {
    border: 1px dashed rgba(255, 255, 255, 0.2);
    border-radius: 5px;
    padding: 15px;
    margin-top: 15px; /* Add some space above */
    margin-bottom: 20px;
}

.optimization-mode-section .subsection-title {
    margin-top: 0; /* Remove default top margin */
    margin-bottom: 15px;
    border-bottom: 1px solid rgba(255,255,255,0.1);
    padding-bottom: 5px;
}

/* Algorithm Selection Styles */
.selected-algorithms-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 10px;
    min-height: 30px;
    padding: 5px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    background-color: rgba(0, 0, 0, 0.2);
}

.algorithm-tag {
    display: inline-flex;
    align-items: center;
    background-color: rgba(74, 144, 226, 0.2);
    border: 1px solid rgba(74, 144, 226, 0.5);
    border-radius: 16px;
    padding: 4px 10px;
    margin-right: 5px;
    color: #4a90e2;
    font-size: 13px;
}

.remove-algorithm-btn {
    background: none;
    border: none;
    color: #4a90e2;
    cursor: pointer;
    font-size: 18px;
    line-height: 1;
    margin-left: 5px;
    padding: 0 2px;
}

.remove-algorithm-btn:hover {
    color: #ffffff;
}

.algorithms-counter {
    font-size: 12px;
    color: #888;
    margin-left: auto;
    align-self: center;
}

.algorithm-selector-row {
    display: flex;
    gap: 10px;
}

.algorithm-selector {
    flex: 1;
}

.add-algorithm-btn {
    display: flex;
    align-items: center;
    gap: 5px;
    background-color: rgba(74, 144, 226, 0.2);
    border: 1px solid rgba(74, 144, 226, 0.5);
    color: #4a90e2;
    padding: 5px 12px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.add-algorithm-btn:hover {
    background-color: rgba(74, 144, 226, 0.3);
}

.add-algorithm-btn.disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* NEW: Dynamic constraint form styles */
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

/* Ensure all form groups in rows are properly aligned */
.form-row {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
}

.form-row .form-group {
    flex: 1;
}

/* Ensure proper spacing on label-input pairs */
.form-group label {
    margin-bottom: 5px;
    display: block;
}
`;

const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = optimizationStyles;
document.head.appendChild(styleSheet);

// Helper function to safely add event listeners without duplication
function safeAddEventListener(element, eventType, handler) {
  if (!element) return;

  // Clone the element to remove existing event listeners
  const newElement = element.cloneNode(true);
  // Replace the old element with the clone
  if (element.parentNode) {
    element.parentNode.replaceChild(newElement, element);
  }

  // Add the event listener to the new element
  newElement.addEventListener(eventType, handler);

  return newElement;
}

// Function to renumber design variables after deletion
function renumberDesignVariables() {
  const container = document.getElementById("design-variables-container");
  if (!container) return;

  const instances = container.querySelectorAll(
    ".optimization-instance:not(.hidden-template)"
  );
  instances.forEach((instance, index) => {
    // Update instance number in title
    const titleSpan = instance.querySelector(".instance-title span");
    if (titleSpan) {
      titleSpan.textContent = index + 1;
    }
    // Update data-index attribute
    instance.setAttribute("data-index", index + 1);
  });
}

// Function to handle design variable category changes
function handleDesignVariableCategoryChange(event) {
  const categorySelect = event.target;
  const instance = categorySelect.closest(".optimization-instance");
  if (!instance) return;

  const category = categorySelect.value;
  const additionalFieldsContainer =
    instance.querySelector(".additional-fields");
  if (!additionalFieldsContainer) return;

  // Clear existing fields
  additionalFieldsContainer.innerHTML = "";

  // Default name based on category
  const nameInput = instance.querySelector(".design-variable-name");
  if (nameInput && !nameInput.value) {
    let defaultName = "";
    switch (category) {
      case "CUT_OFF":
        defaultName = "opt_cut_off";
        break;
      case "PAYLOAD":
        defaultName = "opt_payload";
        break;
      case "AZIMUTH":
        defaultName = "opt_azimuth";
        break;
      case "SEQUENCE":
        defaultName = "opt_sequence";
        break;
      case "PROPULSION":
        defaultName = "opt_propulsion";
        break;
      case "STEERING":
        defaultName = "opt_steering";
        break;
    }
    nameInput.value = defaultName;
  }

  // Add category-specific fields
  switch (category) {
    case "CUT_OFF":
      additionalFieldsContainer.innerHTML = `
        <div class="form-row">
          <div class="form-group">
            <label class="label">Flag:</label>
            <select class="input-field design-variable-flag">
              <option value="" disabled selected>Select Flag</option>
              <!-- Flags will be populated by JS -->
            </select>
          </div>
          <div class="form-group">
            <label class="label">Type:</label>
            <input type="text" class="input-field design-variable-type" placeholder="Enter type">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="label">Control Variable:</label>
            <input type="text" class="input-field design-variable-control-variable" placeholder="Enter control variable">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="label">Upper Bound:</label>
            <input type="number" step="any" class="input-field design-variable-upper-bound" placeholder="Enter upper bound">
          </div>
          <div class="form-group">
            <label class="label">Lower Bound:</label>
            <input type="number" step="any" class="input-field design-variable-lower-bound" placeholder="Enter lower bound">
          </div>
        </div>
      `;
      // Populate flag dropdown
      populateFlagDropdown(
        additionalFieldsContainer.querySelector(".design-variable-flag"),
        "Design Variable"
      );
      break;

    case "PAYLOAD":
    case "AZIMUTH":
      additionalFieldsContainer.innerHTML = `
        <div class="form-row">
          <div class="form-group">
            <label class="label">Control Variables (comma-separated):</label>
            <input type="text" class="input-field design-variable-control-variable" placeholder="Enter control variables">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="label">Upper Bounds (comma-separated):</label>
            <input type="text" class="input-field design-variable-upper-bound" placeholder="Enter upper bounds">
          </div>
          <div class="form-group">
            <label class="label">Lower Bounds (comma-separated):</label>
            <input type="text" class="input-field design-variable-lower-bound" placeholder="Enter lower bounds">
          </div>
        </div>
      `;
      break;

    case "SEQUENCE":
      additionalFieldsContainer.innerHTML = `
        <div class="form-row">
          <div class="form-group">
            <label class="label">Flag:</label>
            <select class="input-field design-variable-flag">
              <option value="" disabled selected>Select Flag</option>
              <!-- Flags will be populated by JS -->
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="label">Control Variables (comma-separated):</label>
            <input type="text" class="input-field design-variable-control-variable" placeholder="Enter control variables">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="label">Upper Bounds (comma-separated):</label>
            <input type="text" class="input-field design-variable-upper-bound" placeholder="Enter upper bounds">
          </div>
          <div class="form-group">
            <label class="label">Lower Bounds (comma-separated):</label>
            <input type="text" class="input-field design-variable-lower-bound" placeholder="Enter lower bounds">
          </div>
        </div>
      `;
      // Populate flag dropdown
      populateFlagDropdown(
        additionalFieldsContainer.querySelector(".design-variable-flag"),
        "Design Variable"
      );
      break;

    case "PROPULSION":
      additionalFieldsContainer.innerHTML = `
        <div class="form-row">
          <div class="form-group">
            <label class="label">Segment:</label>
            <input type="text" class="input-field design-variable-segment" placeholder="Enter segment">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="label">Control Variables (comma-separated):</label>
            <input type="text" class="input-field design-variable-control-variable" placeholder="Enter control variables">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="label">Upper Bounds (comma-separated):</label>
            <input type="text" class="input-field design-variable-upper-bound" placeholder="Enter upper bounds">
          </div>
          <div class="form-group">
            <label class="label">Lower Bounds (comma-separated):</label>
            <input type="text" class="input-field design-variable-lower-bound" placeholder="Enter lower bounds">
          </div>
        </div>
      `;
      break;

    case "STEERING":
      additionalFieldsContainer.innerHTML = `
        <div class="form-row">
          <div class="form-group">
            <label class="label">Segment:</label>
            <select class="input-field design-variable-segment">
              <option value="" disabled selected>Select Segment</option>
              <!-- Steering segments will be populated by JS -->
            </select>
          </div>
          <div class="form-group">
            <label class="label">Segment Type:</label>
            <select class="input-field design-variable-segment-type">
              <option value="" disabled selected>Select Segment Type</option>
              <option value="PROFILE">PROFILE</option>
              <option value="CLG">CLG</option>
              <option value="ZERO_RATE">ZERO_RATE</option>
              <option value="CONST_BODYRATE">CONST_BODYRATE</option>
            </select>
          </div>
        </div>
        <div class="segment-type-fields">
          <!-- Segment type specific fields will be added here -->
        </div>
      `;

      // Populate segments dropdown with steering tabs
      populateSteeringSegmentsDropdown(
        additionalFieldsContainer.querySelector(".design-variable-segment")
      );

      // Add listener for segment type changes
      const segmentTypeSelect = additionalFieldsContainer.querySelector(
        ".design-variable-segment-type"
      );
      if (segmentTypeSelect) {
        segmentTypeSelect.addEventListener("change", (e) => {
          handleSegmentTypeChange(e, instance);
        });
      }
      break;
  }
}

// Function to handle segment type changes
function handleSegmentTypeChange(event, instance) {
  const segmentTypeSelect = event.target;
  const segmentType = segmentTypeSelect.value;
  const segmentTypeFieldsContainer = instance.querySelector(
    ".segment-type-fields"
  );
  if (!segmentTypeFieldsContainer) return;

  // Update name field with segment type
  const nameInput = instance.querySelector(".design-variable-name");
  const segmentSelect = instance.querySelector(".design-variable-segment");
  if (nameInput && segmentSelect.value) {
    nameInput.value = `opt_steering_${
      segmentSelect.value
    }_${segmentType.toLowerCase()}`;
  }

  // Clear existing fields
  segmentTypeFieldsContainer.innerHTML = "";

  // Add fields based on segment type
  switch (segmentType) {
    case "CLG":
      segmentTypeFieldsContainer.innerHTML = `
        <div class="form-row">
          <div class="form-group">
            <label class="label">Axis:</label>
            <select class="input-field design-variable-axis">
              <option value="" disabled selected>Select Axis</option>
              <option value="X">X</option>
              <option value="Y">Y</option>
              <option value="Z">Z</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="label">Upper Bound:</label>
            <input type="number" step="any" class="input-field design-variable-upper-bound" placeholder="Enter upper bound">
          </div>
          <div class="form-group">
            <label class="label">Lower Bound:</label>
            <input type="number" step="any" class="input-field design-variable-lower-bound" placeholder="Enter lower bound">
          </div>
        </div>
      `;
      break;

    case "ZERO_RATE":
      segmentTypeFieldsContainer.innerHTML = `
        <div class="form-row">
          <div class="form-group">
            <label class="label">Control Variables (comma-separated):</label>
            <input type="text" class="input-field design-variable-control-variable" placeholder="Enter control variables">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="label">Upper Bounds (comma-separated):</label>
            <input type="text" class="input-field design-variable-upper-bound" placeholder="Enter upper bounds">
          </div>
          <div class="form-group">
            <label class="label">Lower Bounds (comma-separated):</label>
            <input type="text" class="input-field design-variable-lower-bound" placeholder="Enter lower bounds">
          </div>
        </div>
      `;
      break;

    case "CONST_BODYRATE":
      segmentTypeFieldsContainer.innerHTML = `
        <div class="form-row">
          <div class="form-group">
            <label class="label">Control Variables (comma-separated):</label>
            <input type="text" class="input-field design-variable-control-variable" placeholder="Enter control variables">
          </div>
          <div class="form-group">
            <label class="label">Axis (comma-separated):</label>
            <input type="text" class="input-field design-variable-axis" placeholder="Enter axes (X,Y,Z)">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="label">Upper Bounds (comma-separated):</label>
            <input type="text" class="input-field design-variable-upper-bound" placeholder="Enter upper bounds">
          </div>
          <div class="form-group">
            <label class="label">Lower Bounds (comma-separated):</label>
            <input type="text" class="input-field design-variable-lower-bound" placeholder="Enter lower bounds">
          </div>
        </div>
      `;
      break;

    case "PROFILE":
      segmentTypeFieldsContainer.innerHTML = `
        <div class="form-row">
          <div class="form-group">
            <label class="label">Control Variable:</label>
            <input type="text" class="input-field design-variable-control-variable" placeholder="Enter control variable">
          </div>
          <div class="form-group">
            <label class="label">Axis:</label>
            <select class="input-field design-variable-axis">
              <option value="" disabled selected>Select Axis</option>
              <option value="X">X</option>
              <option value="Y">Y</option>
              <option value="Z">Z</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="label">Independent Variable:</label>
            <input type="text" class="input-field design-variable-ind-variable" placeholder="Enter independent variable">
          </div>
          <div class="form-group">
            <label class="label">Independent Vector (comma-separated):</label>
            <input type="text" class="input-field design-variable-ind-vector" placeholder="Enter independent vector">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="label">Upper Bound:</label>
            <input type="number" step="any" class="input-field design-variable-upper-bound" placeholder="Enter upper bound">
          </div>
          <div class="form-group">
            <label class="label">Lower Bound:</label>
            <input type="number" step="any" class="input-field design-variable-lower-bound" placeholder="Enter lower bound">
          </div>
        </div>
      `;
      break;
  }
}

// Function to populate steering segments dropdown
function populateSteeringSegmentsDropdown(selectElement) {
  if (!selectElement) return;

  // Clear existing options except placeholder
  while (selectElement.options.length > 1) {
    selectElement.remove(1);
  }

  try {
    // Check if steering state exists
    if (!window.steeringState || !window.steeringState.activeComponents) {
      console.warn("No steering state found for populating segments dropdown");

      // Add a default placeholder option to indicate no steering components
      const noComponentsOption = document.createElement("option");
      noComponentsOption.value = "";
      noComponentsOption.textContent = "No steering components found";
      noComponentsOption.disabled = true;
      selectElement.appendChild(noComponentsOption);

      // Add hint to go create steering components
      const hintOption = document.createElement("option");
      hintOption.value = "";
      hintOption.textContent = "Please add steering components first";
      hintOption.disabled = true;
      selectElement.appendChild(hintOption);

      return;
    }

    // Check if there are any active components
    const components = Object.values(window.steeringState.activeComponents);
    if (components.length === 0) {
      const noComponentsOption = document.createElement("option");
      noComponentsOption.value = "";
      noComponentsOption.textContent = "No steering components available";
      noComponentsOption.disabled = true;
      selectElement.appendChild(noComponentsOption);
      return;
    }

    // Add options from steering state
    components.forEach((component) => {
      if (component && component.config) {
        const option = document.createElement("option");
        option.value = component.id;
        option.textContent = component.displayName;
        selectElement.appendChild(option);
      }
    });
  } catch (error) {
    console.error("Error populating steering segments dropdown:", error);

    // Add error option
    const errorOption = document.createElement("option");
    errorOption.value = "";
    errorOption.textContent = "Error loading steering components";
    errorOption.disabled = true;
    selectElement.appendChild(errorOption);
  }
}

// Initialize design variables form on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  // Add event listener for the "Add Design Variable" button
  const addDesignVariableBtn = document.getElementById(
    "add-design-variable-btn"
  );
  if (addDesignVariableBtn) {
    // Use safe event listener to prevent duplication
    const newBtn = safeAddEventListener(addDesignVariableBtn, "click", () => {
      if (
        typeof window.optimizationHandler.addDesignVariableInstance ===
        "function"
      ) {
        window.optimizationHandler.addDesignVariableInstance();
      } else {
        console.error("addDesignVariableInstance function not found");
      }
    });
  }

  // Listen for design variables form submission
  const designVariablesForm = document.getElementById("design-variables-form");
  if (designVariablesForm) {
    // Remove any existing submission listeners by cloning the form
    const newForm = designVariablesForm.cloneNode(true);
    if (designVariablesForm.parentNode) {
      designVariablesForm.parentNode.replaceChild(newForm, designVariablesForm);
    }

    // Add the submit event listener to the new form
    newForm.addEventListener("submit", (event) => {
      event.preventDefault();
      console.log("Design Variables form submitted");
      const sectionId = "design-variables";

      // Get the data
      const designVariablesData =
        window.optimizationHandler.getDesignVariablesData();

      // Validate the data (minimal validation for now)
      let isValid = true;
      let errors = [];

      if (designVariablesData.length === 0) {
        // Allow empty design variables
        console.log("No design variables added, proceeding with save");
      }

      if (isValid) {
        // Save the data
        if (typeof saveOptimizationData === "function") {
          saveOptimizationData("designVariables", designVariablesData);

          // Update state management
          if (window.sectionStates && window.sectionStates[sectionId]) {
            window.sectionStates[sectionId].isSaved = true;
            window.sectionStates[sectionId].isDirty = false;
            window.sectionStates[sectionId].isValid = true;
            window.sectionStates[sectionId].needsReview = false;

            // Unlock the next section
            const nextSectionId = "stopping";
            if (window.sectionStates[nextSectionId]) {
              window.sectionStates[nextSectionId].isLocked = false;
              console.log(`Section ${nextSectionId} unlocked.`);
            } else {
              console.warn(`Next section ${nextSectionId} not found in state.`);
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
                  console.log(
                    `Flagging dependent section ${depId} for review after ${sectionId} save.`
                  );
                  window.sectionStates[depId].needsReview = true;
                }
              });
            }

            // Update sidebar visuals
            if (typeof updateSidebarStates === "function") {
              updateSidebarStates();
            } else {
              console.error("updateSidebarStates function not found.");
            }
          } else {
            console.error(`Section state for ${sectionId} not found.`);
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
          } else {
            console.error("updateSidebarStates function not found.");
          }
        } else {
          console.error(`Section state for ${sectionId} not found.`);
        }

        Swal.fire({
          icon: "error",
          title: "Design Variables Validation Failed",
          html: errors.join("<br>"),
          toast: false,
          confirmButtonText: "OK",
        });
      }
    });

    // Also handle form reset (clear button)
    const clearBtn = newForm.querySelector(".clear-btn");
    if (clearBtn) {
      clearBtn.addEventListener("click", (event) => {
        event.preventDefault(); // Prevent default form reset
        resetDesignVariablesForm(newForm);
      });
    }
  }

  // Check for design variables button to attach click handler that updates steering segments dropdown
  const designVariablesBtn = document.getElementById("design-variables-btn");
  if (designVariablesBtn) {
    // Use safe event listener to prevent duplication
    safeAddEventListener(designVariablesBtn, "click", () => {
      setTimeout(() => {
        // Update any existing segment dropdowns
        const segmentDropdowns = document.querySelectorAll(
          ".design-variable-segment"
        );
        segmentDropdowns.forEach((dropdown) => {
          populateSteeringSegmentsDropdown(dropdown);
        });

        // Auto-create an initial design variable if the container is empty
        const container = document.getElementById("design-variables-container");
        if (container && container.children.length === 0) {
          console.log(
            "Automatically creating initial design variable on page load"
          );
          if (
            typeof window.optimizationHandler.addDesignVariableInstance ===
            "function"
          ) {
            window.optimizationHandler.addDesignVariableInstance();
          }
        }
      }, 100);
    });
  }
});

// Function to properly reset the design variables form
function resetDesignVariablesForm(formElement) {
  // Clear all design variable instances
  const container = document.getElementById("design-variables-container");
  if (container) {
    container.innerHTML = "";

    // Reset the counter
    window.designVariableCounter = 0;

    // Create a new initial instance
    setTimeout(() => {
      if (
        typeof window.optimizationHandler.addDesignVariableInstance ===
        "function"
      ) {
        window.optimizationHandler.addDesignVariableInstance();
      }
    }, 100);
  }

  // Show success message
  Swal.fire({
    title: "Form Cleared",
    text: "Design variables have been reset.",
    icon: "info",
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 2000,
  });
}
