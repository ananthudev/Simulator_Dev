document.addEventListener("DOMContentLoaded", function () {
  // Initialize flagRegistry if it doesn't exist
  // Remove conflicting flagRegistry initialization

  // Make UI navigation functions globally accessible
  window.uiNav = {}; // Create the global object

  const welcomeMessage = document.getElementById("welcome-message");

  // Forms
  const missionForm = document.getElementById("mission-form");
  const enviroForm = document.getElementById("enviro-form");
  const vehicleForm = document.getElementById("vehicle-form");
  const sequenceForm = document.getElementById("sequence-form");
  const steeringForm = document.getElementById("steering-form");
  const stoppingForm = document.getElementById("stopping-form");

  // Optimization forms
  // const optimizationForm = document.getElementById("optimization-form"); // No longer needed
  const objectiveFunctionForm = document.getElementById(
    "objective-function-form"
  );
  const constraintsForm = document.getElementById("constraints-form");
  const modeForm = document.getElementById("mode-form");
  const designVariablesForm = document.getElementById("design-variables-form");

  // Buttons
  const detailsButton = document.getElementById("details-btn");
  const enviroButton = document.getElementById("enviro-btn");
  const vehicleButton = document.getElementById("vehicle-btn");
  const sequenceButton = document.getElementById("sequence-btn");
  const steeringButton = document.getElementById("steering-btn");
  const addStageBtn = document.getElementById("add-stage-btn");
  const vehicleStagesList = document.getElementById("vehicle-stages");
  const stoppingButton = document.getElementById("stopping-btn");

  // Listen for changes to the mission mode selection
  const modeSelect = document.getElementById("modes");
  if (modeSelect) {
    modeSelect.addEventListener("change", updateOptimizationMenu);
    // Call on initial page load to set up the menu correctly
    updateOptimizationMenu();
  }

  // Function to update sidebar menu based on optimization selection
  function updateOptimizationMenu() {
    const modeValue = modeSelect ? modeSelect.value : null;
    const menuTree = document.querySelector(".menu-tree");
    const steeringItem = document.getElementById("steering-btn").parentNode;
    const stoppingItem = document.getElementById("stopping-btn").parentNode;

    // Remove any existing optimization items and stopping header
    const existingOptimizationItems = document.getElementById(
      "optimization-menu-items"
    );
    const existingStoppingHeader = document.querySelector(".stop-header");

    if (existingOptimizationItems) {
      existingOptimizationItems.remove();
    }

    if (existingStoppingHeader) {
      existingStoppingHeader.parentNode.remove();
    }

    // Always create a stopping header
    const stoppingHeader = document.createElement("li");
    stoppingHeader.innerHTML =
      '<span class="stop-header">Stopping Criteria</span>';

    if (modeValue === "optimization") {
      // Create container for optimization menu items
      const optimizationItems = document.createElement("div");
      optimizationItems.id = "optimization-menu-items";

      // Create optimization menu items
      optimizationItems.innerHTML = `
        <li><span class="opt-header">Optimization</span></li>
        <li><a href="#" id="objective-function-btn">└── Objective Function</a></li>
        <li><a href="#" id="constraints-btn">└── Constraints</a></li>
        <li><a href="#" id="mode-btn">└── Mode</a></li>
        <li><a href="#" id="design-variables-btn">└── Design Variables</a></li>
      `;

      // Insert optimization items after steering
      menuTree.insertBefore(optimizationItems, stoppingItem);

      // For optimization mode, add stopping header AFTER optimization items
      menuTree.insertBefore(stoppingHeader, stoppingItem);

      // Add event listeners for optimization menu items
      document
        .getElementById("objective-function-btn")
        .addEventListener("click", (event) => {
          event.preventDefault();
          showForm(objectiveFunctionForm);
        });

      document
        .getElementById("constraints-btn")
        .addEventListener("click", (event) => {
          event.preventDefault();
          showForm(constraintsForm);
        });

      document.getElementById("mode-btn").addEventListener("click", (event) => {
        event.preventDefault();
        showForm(modeForm);
      });

      document
        .getElementById("design-variables-btn")
        .addEventListener("click", (event) => {
          event.preventDefault();
          showForm(designVariablesForm);
          // Refresh design variable segment dropdowns when this form is shown
          if (
            window.optimizationHandler &&
            typeof window.optimizationHandler
              .refreshAllDesignVariableSegmentDropdowns === "function"
          ) {
            console.log(
              "Calling refreshAllDesignVariableSegmentDropdowns from ui-navigation."
            );
            window.optimizationHandler.refreshAllDesignVariableSegmentDropdowns();
          } else {
            console.warn(
              "refreshAllDesignVariableSegmentDropdowns function not found on window.optimizationHandler."
            );
          }
        });
    } else {
      // For simulation mode, add stopping header BEFORE stopping condition
      menuTree.insertBefore(stoppingHeader, stoppingItem);
    }

    // Add styles for the optimization and stopping headers if not already present
    if (!document.getElementById("menu-header-styles")) {
      const styleElement = document.createElement("style");
      styleElement.id = "menu-header-styles";
      styleElement.textContent = `
        .opt-header, .stop-header {
          color: #8fa7c6;
          display: block;
          padding: 5px 0;
          cursor: default;
          font-weight: 500;
          margin-top: 5px;
        }
      `;
      document.head.appendChild(styleElement);
    }
  }

  let stageCounter = 1; // Track stage numbers
  const maxStages = 4; // Maximum allowed stages
  let deletedStages = []; // Track deleted stage numbers

  // Initially hide all forms except welcome message
  function hideAllForms() {
    const forms = [
      missionForm,
      enviroForm,
      vehicleForm,
      sequenceForm,
      steeringForm,
      stoppingForm,
      // Optimization forms
      objectiveFunctionForm,
      constraintsForm,
      modeForm,
      designVariablesForm,
    ];
    forms.forEach((form) => {
      if (form) {
        form.classList.add("hidden");
        form.classList.remove("active-form");
        // form.style.display = "none"; // Remove direct style manipulation
      }
    });

    document
      .querySelectorAll(".stage-form, .motor-form, .nozzle-form")
      .forEach((form) => {
        // form.style.display = "none"; // Remove direct style manipulation
        form.classList.add("hidden");
        form.classList.remove("active-form");
      });
  }
  window.uiNav.hideAllForms = hideAllForms; // Expose it
  hideAllForms();

  // Function to show only one form at a time
  function showForm(formToShow) {
    hideAllForms();
    if (formToShow) {
      formToShow.classList.remove("hidden");
      formToShow.classList.add("active-form");
      // formToShow.style.display = "block"; // Remove direct style manipulation
    }
    // Hide both welcome message and its container
    const welcomeMessageElement = document.getElementById("welcome-message"); // Renamed to avoid conflict
    const welcomeContainerElement =
      document.querySelector(".welcome-container"); // Renamed to avoid conflict
    if (welcomeMessageElement) welcomeMessageElement.style.display = "none";
    if (welcomeContainerElement) welcomeContainerElement.style.display = "none";
  }
  window.uiNav.showForm = showForm; // Expose it

  // Navigation buttons event listeners
  detailsButton.addEventListener("click", (event) => {
    event.preventDefault();
    showForm(missionForm);
  });

  enviroButton.addEventListener("click", (event) => {
    event.preventDefault();
    showForm(enviroForm);
  });

  vehicleButton.addEventListener("click", (event) => {
    event.preventDefault();
    showForm(vehicleForm);
  });

  sequenceButton.addEventListener("click", (event) => {
    event.preventDefault();
    showForm(sequenceForm);
  });

  steeringButton.addEventListener("click", (event) => {
    event.preventDefault();
    showForm(steeringForm);

    // // First make sure flagRegistry is properly initialized
    // if (!window.flagRegistry) {
    //   window.flagRegistry = {
    //     burnTimeIdentifiers: [],
    //     separationFlags: [],
    //     motorIgnitionFlags: [],
    //     motorBurnoutFlags: [],
    //     cutOffFlags: [],
    //     heatShieldFlag: null,
    //   };
    // }

    // // Make sure the steering tabs are properly initialized - OBSOLETE with new layout
    // setTimeout(() => {
    //   initializeSteeringTabs();
    // }, 100);
  });

  // Hide "vehicle-stages" initially
  vehicleStagesList.style.display = "none";

  // Add stages dynamically when "Add Stage" button is clicked
  addStageBtn.addEventListener("click", function () {
    // Check if we've reached the maximum number of active stages
    const activeStages = document.querySelectorAll(".stage-nav-item").length;
    if (activeStages >= maxStages) {
      Swal.fire({
        icon: "error",
        title: "Maximum Stages Reached",
        text: "No further stages allowed. Maximum stages creation reached.",
        toast: false,
        confirmButtonText: "OK",
      });
      return;
    }

    // Show the "vehicle-stages" menu if it's the first stage
    if (activeStages === 0) {
      vehicleStagesList.style.display = "block";
    }

    // Find the next available stage number
    let nextStageNumber = 1;
    const existingStages = Array.from(
      document.querySelectorAll(".stage-nav-item")
    ).map((item) =>
      parseInt(item.querySelector(".stage-btn").textContent.match(/\d+/)[0])
    );

    while (existingStages.includes(nextStageNumber)) {
      nextStageNumber++;
    }

    // Create new Stage entry in the sidebar
    const newStage = document.createElement("li");
    const stageId = `stage${nextStageNumber}`;
    newStage.innerHTML = `<div class="stage-nav-item">
                            <a href="#" class="stage-btn" id="${stageId}-btn">└── Stage ${nextStageNumber}</a>
                            <button type="button" class="delete-stage-icon" data-stage="${stageId}" data-stage-number="${nextStageNumber}" title="Delete Stage ${nextStageNumber}">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                <line x1="14" y1="11" x2="14" y2="17"></line>
                              </svg>
                            </button>
                          </div>
                          <ul id="${stageId}-motors" class="submenu"></ul>`;
    vehicleStagesList.appendChild(newStage);

    // Add click event listener for the stage button
    const stageButton = newStage.querySelector(`#${stageId}-btn`);
    stageButton.addEventListener("click", function (event) {
      event.preventDefault();
      const stageForm = document.getElementById(`${stageId}-form`);
      if (stageForm) {
        showForm(stageForm);
      }
    });

    // Add styles for the stage nav item and delete icon
    if (!document.getElementById("stage-delete-icon-styles")) {
      const styleElement = document.createElement("style");
      styleElement.id = "stage-delete-icon-styles";
      styleElement.textContent = `
        .stage-nav-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-right: 8px;
        }
        .delete-stage-icon {
          background: none;
          border: none;
          cursor: pointer;
          padding: 3px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #777;
          opacity: 0.7;
          transition: color 0.2s, opacity 0.2s;
        }
        .delete-stage-icon:hover {
          color: #f44336;
          opacity: 1;
        }
      `;
      document.head.appendChild(styleElement);
    }

    // Create corresponding Stage form
    const stageForm = document.createElement("form");
    stageForm.id = `${stageId}-form`;
    stageForm.classList.add("hidden", "stage-form");

    // Try to update the sequence form's stage start tab dropdown
    try {
      if (typeof updateStageStartDropdown === "function") {
        updateStageStartDropdown();
      }
    } catch (error) {
      // Handle error silently
    }

    // Add the stage form HTML
    stageForm.innerHTML = `
        <div class="form-container">
            <h2 class="stage-heading">Stage ${nextStageNumber}</h2>
            <div class="form-fields">
                <div class="form-row">
                    <div class="form-group">
                        <label for="structural-mass-${nextStageNumber}" class="label">Structural Mass:</label>
                        <input type="number" id="structural-mass-${nextStageNumber}" class="input-field" placeholder="Enter Structural Mass" step="any">
                    </div>
                    
                    <div class="form-group">
                        <label for="reference-area-${nextStageNumber}" class="label">Reference Area:</label>
                        <input type="number" id="reference-area-${nextStageNumber}" class="input-field" placeholder="Enter Reference Area" step="any">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="burn-time-${nextStageNumber}" class="label">Burn Time:</label>
                        <input type="number" id="burn-time-${nextStageNumber}" class="input-field" placeholder="Enter Burn Time" step="any">
                    </div>
                    
                    <div class="form-group">
                        <label for="burn-time-id-${nextStageNumber}" class="label">Initialization Flag:</label>
                        <input type="text" id="burn-time-id-${nextStageNumber}" class="input-field" value="ST_${nextStageNumber}_INI" readonly>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="separation-flag-${stageId}" class="label">Separation Flag:</label>
                        <input type="text" id="separation-flag-${stageId}" class="input-field" value="ST_${nextStageNumber}_SEP" readonly>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="dciss-toggle-${stageId}" class="label">DCISS:</label>
                        <div class="toggle-container">
                            <input type="checkbox" id="dciss-toggle-${stageId}" class="toggle-input">
                            <label for="dciss-toggle-${stageId}" class="toggle-slider"></label>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="coasting-toggle-${stageId}" class="label">Coasting:</label>
                        <div class="toggle-container">
                            <input type="checkbox" id="coasting-toggle-${stageId}" class="toggle-input">
                            <label for="coasting-toggle-${stageId}" class="toggle-slider"></label>
                        </div>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group full-width">
                        <div class="upload-data">
                            <label for="aero-upload-${stageId}" class="upload-label">Aero Data:</label>
                            <input type="file" id="aero-upload-${stageId}" accept=".csv" style="display: none" />
                            <button type="button" class="upload" id="aero-upload-btn-${stageId}">
                                <svg aria-hidden="true" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"
                                    fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path stroke-width="2" stroke="#ffffff"
                                        d="M13.5 3H12H8C6.34315 3 5 4.34315 5 6V18C5 19.6569 6.34315 21 8 21H11M13.5 3L19 8.625M13.5 3V7.625C13.5 8.17728 13.9477 8.625 14.5 8.625H19M19 8.625V11.8125"
                                        stroke-linejoin="round" stroke-linecap="round"></path>
                                    <path stroke-linejoin="round" stroke-linecap="round" stroke-width="2"
                                        stroke="#ffffff" d="M17 15V18M17 21V18M17 18H14M17 18H20"></path>
                                </svg>
                                <span>ADD FILE</span>
                            </button>
                            <input type="text" id="aero-filename-${stageId}" class="filename" readonly placeholder="No file chosen" />
                        </div>
                    </div>
                </div>
            </div>

            <div style="text-align: center; margin: 30px 0; padding: 20px 0; border-top: 1px solid rgba(255, 255, 255, 0.1); border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                <button type="button" class="add-motor-btn add-stg" data-stage="${stageId}" style="margin: 0 auto; min-width: 200px;">Add Motor</button>
            </div>
            
            <div class="button-group">
                <button type="reset" class="clear-btn">Clear</button>
                <button type="submit" class="next-btn">Save</button>
            </div>
        </div>
    `;

    document.querySelector(".mission-content").appendChild(stageForm);

    // Add event listener for form submission
    const saveButton = stageForm.querySelector(".next-btn");
    saveButton.addEventListener("click", function (e) {
      e.preventDefault();

      // Use FormValidator class from validation.js
      const validationResult = FormValidator.validateStageForm(stageForm);
      const errors = validationResult.errors; // Get errors array

      if (!validationResult.isValid) {
        // Check isValid flag
        // Show error message with SweetAlert2
        Swal.fire({
          icon: "error",
          title: "Input Data Missing",
          html: errors.join("<br>"),
          toast: false,
          confirmButtonText: "OK",
        });
      } else {
        // Save the stage data
        const stageNumber = parseInt(stageId.replace("stage", ""));
        const stageData = saveStageData(stageForm, stageId);

        if (stageData) {
          // Show success message
          if (typeof window.showSuccess === "function") {
            window.showSuccess(
              `Stage ${stageNumber} has been saved successfully`
            );
          } else {
            // Fallback in case the global function isn't available
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
              title: `Stage ${stageNumber} has been saved successfully`,
            });
          }
        }
      }
    });

    // Add event listener for file upload
    const aeroUploadBtn = document.getElementById(`aero-upload-btn-${stageId}`);
    const aeroFileInput = document.getElementById(`aero-upload-${stageId}`);
    const aeroFilename = document.getElementById(`aero-filename-${stageId}`);

    if (aeroUploadBtn && aeroFileInput && aeroFilename) {
      aeroUploadBtn.addEventListener("click", function () {
        aeroFileInput.click();
      });

      aeroFileInput.addEventListener("change", function () {
        if (this.files.length > 0) {
          const file = this.files[0];
          aeroFilename.value = file.name;
          // Store the File object on the form element
          stageForm._selectedAeroFile = file;
          // Remove error styling if it was previously marked as error
          aeroFilename.classList.remove("error-field");
        } else {
          // Clear the stored file if selection is cancelled
          stageForm._selectedAeroFile = null;
          aeroFilename.value = ""; // Clear filename display
        }
      });
    }

    // Show success message for stage creation
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
      title: `Stage ${nextStageNumber} has been created successfully!`,
    });

    // Add CSS for error field highlighting if it doesn't exist
    if (!document.getElementById("error-field-styles")) {
      const styleElement = document.createElement("style");
      styleElement.id = "error-field-styles";
      styleElement.textContent = `
            .error-field {
                border-color: #dc3545 !important;
                box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25) !important;
            }
        `;
      document.head.appendChild(styleElement);
    }

    stageCounter++; // Increment stage count
  });

  // Event delegation for dynamically added "Add Motor" buttons
  document.addEventListener("click", function (event) {
    if (event.target.classList.contains("add-motor-btn")) {
      const stageId = event.target.getAttribute("data-stage");
      addMotorAndNozzle(stageId);
    }
  });

  // Add Motor & Nozzle Function
  function addMotorAndNozzle(stageId) {
    const stageMotorsList = document.getElementById(`${stageId}-motors`);
    let motorCount = stageMotorsList.childElementCount + 1;
    const stageNumber = stageId.replace("stage", "");

    // Check if we've reached the maximum number of motors (15)
    if (motorCount > 15) {
      // Show error toast message
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
        icon: "error",
        title: "Maximum limit of 15 motors per stage reached",
        toast: false,
        confirmButtonText: "OK",
      });
      return; // Exit the function without adding a new motor
    }

    // Get burn time from parent stage form instead of savedStages
    const stageForm = document.getElementById(`${stageId}-form`);
    const stageBurnTimeInput = stageForm.querySelector(
      'input[placeholder="Enter Burn Time"]'
    );
    const stageBurnTime = stageBurnTimeInput
      ? parseFloat(stageBurnTimeInput.value) || 0
      : 0;

    // Create new Motor entry in the sidebar
    const newMotor = document.createElement("li");
    newMotor.innerHTML = `
      <div class="motor-nav-item">
        <a href="#" class="motor-btn" id="${stageId}-motor${motorCount}-btn">└── Motor ${motorCount}</a>
        <button type="button" class="delete-motor-icon" data-stage="${stageId}" data-motor="${motorCount}" title="Delete Motor ${motorCount}">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </button>
      </div>
      <ul id="${stageId}-motor${motorCount}-nozzles" class="submenu">
        <li><a href="#" class="nozzle-btn" id="${stageId}-motor${motorCount}-nozzle1-btn">└── Nozzle 1</a></li>
      </ul>`;
    stageMotorsList.appendChild(newMotor);

    // Show success toast for motor creation
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
      title: `Motor ${motorCount} has been added to Stage ${stageNumber}`,
    });

    // Add styles for the motor nav item and delete icon if not already added
    if (!document.getElementById("motor-delete-icon-styles")) {
      const styleElement = document.createElement("style");
      styleElement.id = "motor-delete-icon-styles";
      styleElement.textContent = `
            .motor-nav-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding-right: 8px;
            }
            .delete-motor-icon {
                background: none;
                border: none;
                cursor: pointer;
                padding: 3px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #777;
                opacity: 0.7;
                transition: color 0.2s, opacity 0.2s;
            }
            .delete-motor-icon:hover {
                color: #f44336;
                opacity: 1;
            }
            .input-help {
                display: block;
                font-size: 0.8em;
                color: #666;
                margin-top: 2px;
            }
            .stage-burn-time {
                background-color: rgba(0, 0, 0, 0.1) !important;
            }
        `;
      document.head.appendChild(styleElement);
    }

    // Create Motor form
    const motorForm = document.createElement("form");
    motorForm.id = `${stageId}-motor${motorCount}-form`;
    motorForm.classList.add("hidden", "motor-form");
    motorForm.innerHTML = `
    <div class="form-container">
        <h2 class="stage-heading">Stage ${stageNumber} - Motor ${motorCount}</h2>
        <div class="form-fields">
            <div class="form-row">
                <div class="form-group">
                    <label class="label">Structural Mass:</label>
                    <input type="number" class="input-field" placeholder="Enter Structural Mass" step="any">
                    <small class="input-help">Inherited from stage</small>
                </div>
                
                <div class="form-group">
                    <label class="label">Types of Propulsion:</label>
                    <select class="input-field">
                        <option value="" disabled selected>Select Propulsion Type</option>
                        <option value="solid">Solid</option>
                        <option value="liquid">Liquid</option>
                    </select>
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label class="label">Propulsion Mass:</label>
                    <input type="number" class="input-field" placeholder="Enter Propulsion Mass" step="any">
                </div>
                
                <div class="form-group">
                    <label class="label">Ignition Flag:</label>
                    <input type="text" class="input-field" value="S${stageNumber}_M${motorCount}_IGN" readonly>
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label class="label">Cut Off Flag:</label>
                    <input type="text" class="input-field" value="S${stageNumber}_M${motorCount}_CUTOFF" readonly>
                </div>
                
                <div class="form-group">
                    <label class="label">Separation Flag:</label>
                    <input type="text" class="input-field" value="ST_${stageNumber}_SEP" readonly>
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label class="label">Burn Out Flag:</label>
                    <input type="text" class="input-field" value="S${stageNumber}_M${motorCount}_Burnout" readonly>
                </div>
                
                <div class="form-group">
                    <label class="label">Nozzle Diameter:</label>
                    <input type="number" class="input-field" placeholder="Enter Nozzle Diameter" step="any">
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label class="label">Burn Time:</label>
                    <input type="number" class="input-field stage-burn-time" value="${stageBurnTime}" readonly>
                    <small class="input-help">Inherited from stage</small>
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group full-width">
                    <div class="upload-data">
                        <label for="thrust-upload-${stageId}-${motorCount}" class="upload-label">Thrust Time:</label>
                        <input type="file" id="thrust-upload-${stageId}-${motorCount}" accept=".csv" style="display: none" />
                        <button type="button" class="upload" id="thrust-upload-btn-${stageId}-${motorCount}">
                            <svg aria-hidden="true" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"
                                fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path stroke-width="2" stroke="#ffffff"
                                    d="M13.5 3H12H8C6.34315 3 5 4.34315 5 6V18C5 19.6569 6.34315 21 8 21H11M13.5 3L19 8.625M13.5 3V7.625C13.5 8.17728 13.9477 8.625 14.5 8.625H19M19 8.625V11.8125"
                                    stroke-linejoin="round" stroke-linecap="round"></path>
                                <path stroke-linejoin="round" stroke-linecap="round" stroke-width="2"
                                    stroke="#ffffff" d="M17 15V18M17 21V18M17 18H14M17 18H20"></path>
                            </svg>
                            <span>ADD FILE</span>
                        </button>
                        <input type="text" id="thrust-filename-${stageId}-${motorCount}" class="filename" readonly placeholder="No file chosen" />
                    </div>
                </div>
            </div>
        </div>
        
        <div class="button-group">
            <button type="reset" class="clear-btn">Clear</button>
            <button type="submit" class="next-btn">Save</button>
        </div>
    </div>`;

    document.querySelector(".mission-content").appendChild(motorForm);

    // Inherit structural mass from stage form
    // TODO: Refactor data inheritance? This DOM-based approach is brittle.
    // Consider managing these relationships in the data model (formHandler.js)
    // and updating the UI based on data changes.
    const stageStructuralMassInput = stageForm.querySelector(
      'input[placeholder="Enter Structural Mass"]'
    );
    const motorStructuralMassInput = motorForm.querySelector(
      'input[placeholder="Enter Structural Mass"]'
    );

    if (stageStructuralMassInput && motorStructuralMassInput) {
      motorStructuralMassInput.value = stageStructuralMassInput.value;

      // Add listener to keep motor structural mass in sync with stage
      stageStructuralMassInput.addEventListener("input", function () {
        motorStructuralMassInput.value = this.value;
      });
    }

    // Create Nozzle form
    const nozzleForm = document.createElement("form");
    nozzleForm.id = `${stageId}-motor${motorCount}-nozzle1-form`;
    nozzleForm.classList.add("hidden", "nozzle-form");

    // Get the motor form's nozzle diameter input
    const motorNozzleDiameterInput = motorForm.querySelector(
      'input[placeholder="Enter Nozzle Diameter"]'
    );
    const motorNozzleDiameter = motorNozzleDiameterInput
      ? motorNozzleDiameterInput.value
      : "";

    nozzleForm.innerHTML = `
    <div class="form-container">
        <h2 class="stage-heading">Stage ${stageNumber} - Motor ${motorCount} - Nozzle 1</h2>
        
        <!-- Nozzle Parameters -->
        <div class="form-fields">
            <div class="form-row">
                <div class="form-group">
                    <label class="label">Nozzle Diameter:</label>
                    <input type="number" class="input-field" placeholder="Enter nozzle diameter" step="any" value="${motorNozzleDiameter}">
                    <small class="input-help">Inherited from motor</small>
                </div>
                
                <div class="form-group">
                    <label class="label">ETA Thrust:</label>
                    <input type="number" class="input-field" placeholder="Enter ETA thrust" step="any" value="0">
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label class="label">Zeta Thrust:</label>
                    <input type="number" class="input-field" placeholder="Enter Zeta thrust" step="any" value="0">
                </div>
            </div>

            <!-- Location Section -->
            <h3 class="section-title">Location</h3>
            <div class="form-row">
                <div class="form-group">
                    <label class="label">Radial Distance:</label>
                    <input type="number" class="input-field" placeholder="Enter radial distance" step="any" value="0">
                </div>
                
                <div class="form-group">
                    <label class="label">Phi:</label>
                    <input type="number" class="input-field" placeholder="Enter Phi value" step="any" value="0">
                </div>
            </div>

            <!-- Miss Alignment Section -->
            <h3 class="section-title">Miss Alignment</h3>
            <div class="form-row">
                <div class="form-group">
                    <label class="label">Sigma Thrust:</label>
                    <input type="number" class="input-field" placeholder="Enter sigma thrust" step="any" value="0">
                </div>
                
                <div class="form-group">
                    <label class="label">Thau Thrust:</label>
                    <input type="number" class="input-field" placeholder="Enter thau thrust" step="any" value="0">
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label class="label">Epsilon Thrust:</label>
                    <input type="number" class="input-field" placeholder="Enter epsilon thrust" step="any" value="0">
                </div>
            </div>

            <!-- Orientation Section -->
            <h3 class="section-title">Orientation</h3>
            <div class="form-row">
                <div class="form-group">
                    <label class="label">MU:</label>
                    <input type="number" class="input-field" placeholder="Enter MU value" step="any" value="0">
                </div>
                
                <div class="form-group">
                    <label class="label">LAMDA:</label>
                    <input type="number" class="input-field" placeholder="Enter LAMDA value" step="any" value="0">
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label class="label">KAPPA:</label>
                    <input type="number" class="input-field" placeholder="Enter KAPPA value" step="any" value="0">
                </div>
            </div>

            <!-- Throat Location Section -->
            <h3 class="section-title">Throat Location</h3>
            <div class="form-row">
                <div class="form-group">
                    <label class="label">X:</label>
                    <input type="number" class="input-field" placeholder="Enter X value" step="any" value="0">
                </div>
                
                <div class="form-group">
                    <label class="label">Y:</label>
                    <input type="number" class="input-field" placeholder="Enter Y value" step="any" value="0">
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label class="label">Z:</label>
                    <input type="number" class="input-field" placeholder="Enter Z value" step="any" value="0">
                </div>
            </div>
        </div>
        
        <div class="button-group">
            <button type="reset" class="clear-btn">Clear</button>
            <button type="submit" class="next-btn">Save</button>
        </div>
    </div>`;

    document.querySelector(".mission-content").appendChild(nozzleForm);

    // Add click handlers
    newMotor
      .querySelector(".motor-btn")
      .addEventListener("click", function (event) {
        event.preventDefault();
        showForm(motorForm);
      });

    document
      .getElementById(`${stageId}-motor${motorCount}-nozzle1-btn`)
      .addEventListener("click", function (event) {
        event.preventDefault();
        showForm(nozzleForm);
      });

    // Add file upload handler for thrust data
    const thrustUploadBtn = document.getElementById(
      `thrust-upload-btn-${stageId}-${motorCount}`
    );
    const thrustFileInput = document.getElementById(
      `thrust-upload-${stageId}-${motorCount}`
    );
    const thrustFilename = document.getElementById(
      `thrust-filename-${stageId}-${motorCount}`
    );

    if (thrustUploadBtn && thrustFileInput && thrustFilename) {
      thrustUploadBtn.addEventListener("click", function () {
        thrustFileInput.click();
      });

      thrustFileInput.addEventListener("change", function () {
        if (this.files.length > 0) {
          const file = this.files[0];
          thrustFilename.value = file.name;
          // Store the File object on the motor form element
          motorForm._selectedThrustFile = file;
        } else {
          // Clear the stored file if selection is cancelled
          motorForm._selectedThrustFile = null;
          thrustFilename.value = ""; // Clear filename display
        }
      });
    }

    // Add event listener for form submission
    const saveButton = motorForm.querySelector(".next-btn");
    saveButton.addEventListener("click", function (e) {
      e.preventDefault();

      // Use FormValidator class from validation.js
      const validationResult = FormValidator.validateMotorForm(motorForm);
      const errors = validationResult.errors;

      if (!validationResult.isValid) {
        // Show error message with SweetAlert2
        Swal.fire({
          icon: "error",
          title: "Input Data Missing",
          html: errors.join("<br>"),
          toast: false,
          confirmButtonText: "OK",
        });
      } else {
        // Save motor data
        const stageNumber = parseInt(stageId.replace("stage", ""));
        const motorNumber = motorCount;

        // TODO: Call formHandler.js to save motor data
        // e.g., formHandler.saveMotorData(motorForm, stageNumber, motorNumber);
        saveMotorData(motorForm, stageNumber, motorNumber); // Call directly

        // Show success message
        if (typeof window.showSuccess === "function") {
          window.showSuccess(
            `Motor ${motorNumber} has been saved successfully`
          );
        } else {
          // Fallback in case the global function isn't available
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
            title: `Motor ${motorNumber} has been saved successfully`,
          });
        }

        // Update dropdowns using formHandler
        // REMOVED: updateMotorIgnitionDropdown(); // Call directly
        // REMOVED: updateMotorTerminationDropdown(); // Call directly
      }
    });

    // Add event listener for nozzle form submission
    const saveNozzleButton = nozzleForm.querySelector(".next-btn");
    saveNozzleButton.addEventListener("click", function (e) {
      e.preventDefault();
      console.log("Nozzle Save Button Clicked for form:", nozzleForm.id);

      console.log("Validating nozzle form...");
      // Use FormValidator class from validation.js
      const validationResult = FormValidator.validateNozzleForm(nozzleForm);
      const errors = validationResult.errors;
      console.log("Validation errors:", errors);

      if (!validationResult.isValid) {
        console.log("Validation FAILED. Showing error message.");
        // Show error message with SweetAlert2
        if (typeof window.showError === "function") {
          window.showError(errors.join("<br>"), "Input Data Missing");
        } else {
          // Fallback in case the global function isn't available
          Swal.fire({
            icon: "error",
            title: "Input Data Missing",
            html: errors.join("<br>"),
            toast: false,
            confirmButtonText: "OK",
          });
        }
      } else {
        // Validation passed!
        console.log("Validation PASSED. Proceeding to save nozzle data.");

        // Save nozzle data
        const stageNumber = parseInt(stageId.replace("stage", ""));
        const motorNumber = motorCount;
        const nozzleNumber = 1; // Assuming only one nozzle

        console.log(
          `Calling saveNozzleData(${stageNumber}, ${motorNumber}, ${nozzleNumber})...`
        );
        // Assuming saveNozzleData is now globally available or handled by formHandler.js
        saveNozzleData(nozzleForm, stageNumber, motorNumber, nozzleNumber);
        console.log("Returned from saveNozzleData.");

        // Show success message
        if (typeof window.showSuccess === "function") {
          window.showSuccess(`Nozzle 1 has been saved successfully`);
        } else {
          // Fallback in case the global function isn't available
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
            title: `Nozzle 1 has been saved successfully`,
          });
        }
      }
    });

    // Add event listener to sync nozzle diameter when motor form changes
    if (motorNozzleDiameterInput) {
      motorNozzleDiameterInput.addEventListener("input", function () {
        const nozzleDiameterInput = nozzleForm.querySelector(
          'input[placeholder="Enter nozzle diameter"]'
        );
        if (nozzleDiameterInput) {
          nozzleDiameterInput.value = this.value;
        }
      });
    }

    return {
      motorCount: motorCount,
      motorForm: motorForm,
      nozzleForm: nozzleForm,
    };
  }

  // Expose addMotorAndNozzle globally for use in openMissionHandler.js
  window.addMotorAndNozzle = addMotorAndNozzle;

  // Function to initialize steering tabs
  function initializeSteeringTabs() {
    console.log("Initializing steering tabs");

    // Define the list of steering tab types
    const steeringTabsList = [
      "Vertical Ascend",
      "Pitch Hold",
      "Constant Pitch Rate",
      "Gravity Turn",
      "Profile",
      "Coasting",
    ];

    // Constants for maximum number of dynamic tabs
    const MAX_PROFILES = 6;
    const MAX_COASTING = 4;

    // Track the count of dynamic tabs
    let profileCount = 0;
    let coastingCount = 0;

    // Check if tabs container exists
    const tabsContainer = document.getElementById("steering-tabs");
    const tabContentsContainer = document.getElementById(
      "steering-tab-contents"
    );

    if (!tabsContainer || !tabContentsContainer) {
      console.error("Steering tab containers not found");
      return;
    }

    // Check if tabs have already been initialized
    if (tabsContainer.children.length > 0) {
      console.log("Tabs already initialized, skipping initialization");
      return;
    }

    console.log("Clearing existing tabs");
    // Clear existing tabs
    tabsContainer.innerHTML = "";
    tabContentsContainer.innerHTML = "";

    console.log("Creating default tabs");
    // Initialize the default tabs (first 4)
    steeringTabsList.slice(0, 4).forEach((name) => createSteeringTab(name));

    console.log("Setting first tab as active");
    // Set the first tab as active
    const firstTab = tabsContainer.querySelector(".steering-tab");
    const firstContent = tabContentsContainer.querySelector(
      ".steering-tab-content"
    );
    if (firstTab) firstTab.classList.add("active");
    if (firstContent) firstContent.classList.add("active");

    // Add event listeners for the dynamic profile and coasting buttons
    const addProfileBtn = document.getElementById("add-profile-btn");
    const addCoastingBtn = document.getElementById("add-coasting-btn");

    if (addProfileBtn) {
      console.log("Setting up add profile button");
      addProfileBtn.addEventListener("click", () => {
        if (profileCount < MAX_PROFILES) {
          console.log(`Adding profile tab ${profileCount + 1}`);
          createSteeringTab("Profile", true);
          profileCount++;
        } else {
          alert("Maximum 6 Profiles allowed");
        }
      });
    } else {
      console.warn("Add profile button not found");
    }

    if (addCoastingBtn) {
      console.log("Setting up add coasting button");
      addCoastingBtn.addEventListener("click", () => {
        if (coastingCount < MAX_COASTING) {
          console.log(`Adding coasting tab ${coastingCount + 1}`);
          createSteeringTab("Coasting", true);
          coastingCount++;
        } else {
          alert("Maximum 4 Coasting allowed");
        }
      });
    } else {
      console.warn("Add coasting button not found");
    }

    // Initialize sequence selector
    const sequenceSelect = document.getElementById("steering-sequence");
    if (sequenceSelect) {
      console.log("Setting up sequence selector");
      sequenceSelect.addEventListener("change", () => {
        console.log("Sequence selected:", sequenceSelect.value);
        // Additional logic for sequence selection can be added here
      });
    } else {
      console.warn("Sequence selector not found");
    }

    // Setup the tab switching functionality
    console.log("Setting up tab switching");
    setupTabSwitching();

    console.log("Steering tabs initialization complete");
  }

  // Setup tab switching functionality
  function setupTabSwitching() {
    const allTabs = document.querySelectorAll(".steering-tab");
    const contents = document.querySelectorAll(".steering-tab-content");

    allTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        allTabs.forEach((btn) => btn.classList.remove("active"));
        contents.forEach((c) => c.classList.remove("active"));

        tab.classList.add("active");
        const tabId = tab.getAttribute("data-tab");
        const content = document.getElementById(tabId);
        if (content) content.classList.add("active");
      });
    });
  }

  // Update reference dropdowns with sequence event flags
  function updateReferenceDropdowns(container) {
    const referenceDropdowns = container.querySelectorAll(
      ".reference-dropdown"
    );
    if (!referenceDropdowns.length) return;

    // Check if flagRegistry exists and is properly initialized
    if (!window.flagRegistry) {
      // Initialize flagRegistry if it doesn't exist
      window.flagRegistry = {
        burnTimeIdentifiers: [],
        separationFlags: [],
        motorIgnitionFlags: [],
        motorBurnoutFlags: [],
      };
    }

    // Safely get event flags with null checks
    const eventFlags = [];

    // Only map if the arrays exist
    if (
      flagRegistry.burnTimeIdentifiers &&
      Array.isArray(flagRegistry.burnTimeIdentifiers)
    ) {
      flagRegistry.burnTimeIdentifiers.forEach((item) => {
        if (item && item.flag) eventFlags.push(item.flag);
      });
    }

    if (
      flagRegistry.separationFlags &&
      Array.isArray(flagRegistry.separationFlags)
    ) {
      flagRegistry.separationFlags.forEach((item) => {
        if (item && item.flag) eventFlags.push(item.flag);
      });
    }

    if (
      flagRegistry.motorIgnitionFlags &&
      Array.isArray(flagRegistry.motorIgnitionFlags)
    ) {
      flagRegistry.motorIgnitionFlags.forEach((item) => {
        if (item && item.flag) eventFlags.push(item.flag);
      });
    }

    if (
      flagRegistry.motorBurnoutFlags &&
      Array.isArray(flagRegistry.motorBurnoutFlags)
    ) {
      flagRegistry.motorBurnoutFlags.forEach((item) => {
        if (item && item.flag) eventFlags.push(item.flag);
      });
    }

    // Add default options if no flags were found
    if (eventFlags.length === 0) {
      eventFlags.push("ST_1_INI", "ST_1_SEP"); // Add some default flags for testing
    }

    referenceDropdowns.forEach((dropdown) => {
      dropdown.innerHTML = '<option value="">None</option>';

      eventFlags.forEach((flag) => {
        const option = document.createElement("option");
        option.value = flag;
        option.textContent = flag;
        dropdown.appendChild(option);
      });
    });
  }

  // Setup type selection listener for steering sections
  function setupSteeringTypeListener(container) {
    const typeSelect = container.querySelector(".type-selector");
    const dynamicFields = container.querySelector(".steering-dynamic-fields");

    if (!typeSelect || !dynamicFields) return;

    typeSelect.addEventListener("change", () => {
      const val = typeSelect.value;
      dynamicFields.innerHTML = "";

      if (val === "body") {
        dynamicFields.innerHTML = `
          <div class="form-group"><label class="label">Axis:</label>
            <select class="input-field"><option>Roll</option><option>Pitch</option><option>Yaw</option></select>
          </div>
          <div class="form-group"><label class="label">Value:</label><input type="number" step="any" class="input-field"></div>
        `;
      } else if (val === "clg") {
        dynamicFields.innerHTML = `
          <div class="form-group"><label class="label">Algorithm:</label>
            <select class="input-field algorithm-select"><option>AOA</option><option>FPA</option></select>
          </div>
          <div class="form-group clg-fields"></div>
        `;
        const algorithmSelect =
          dynamicFields.querySelector(".algorithm-select");
        const clgFields = dynamicFields.querySelector(".clg-fields");

        if (algorithmSelect && clgFields) {
          algorithmSelect.addEventListener("change", () => {
            clgFields.innerHTML =
              algorithmSelect.value === "AOA"
                ? `<div class="form-row"><div class="form-group"><label class="label">MAX QAOA:</label><input type="number" class="input-field"></div><div class="form-group"><label class="label">Alpha Time:</label><input type="number" class="input-field"></div></div>`
                : `<div class="form-row"><div class="form-group"><label class="label">Pitch Gain:</label><input type="number" class="input-field"></div><div class="form-group"><label class="label">Yaw Gain:</label><input type="number" class="input-field"></div></div>`;
          });

          // Trigger initial display
          algorithmSelect.dispatchEvent(new Event("change"));
        }
      } else if (val === "profile") {
        dynamicFields.innerHTML = `
          <div class="form-row">
            <div class="form-group"><label class="label">Mode:</label><select class="input-field"><option>Normal</option><option>Step</option></select></div>
            <div class="form-group"><label class="label">Quantity:</label><select class="input-field"><option>Euler Rate</option><option>Body Rate</option><option>Quaternion</option><option>Euler Angle</option><option>Body Angle</option></select></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label class="label">Independent Variable:</label><select class="input-field"><option>Phase Time</option><option>Profile Time</option><option>Mission Time</option></select></div>
            <div class="form-group"><label class="label">Value:</label><input type="number" class="input-field"></div>
          </div>
          <div class="form-group upload-csv">
            <label class="label">Upload Profile Steering Values:</label>
            <input type="file" accept=".csv">
          </div>
        `;
      }
    });
  }

  // Create a global finalMissionData object if it doesn't exist
  if (typeof finalMissionData === "undefined") {
    window.finalMissionData = {
      SSPO: { vehicle: ["Garuda_1"] },
      Garuda_1: { stage: [] },
    };
  }

  // Add event listener for stopping condition button
  stoppingButton.addEventListener("click", (event) => {
    event.preventDefault();
    showForm(stoppingForm);
  });

  // Stopping condition radio button logic
  const stoppingRadioButtons = document.querySelectorAll(
    'input[name="stopping-criteria"]'
  );
  const flagFields = document.getElementById("flag-fields");
  const timeFields = document.getElementById("time-fields");
  const altitudeFields = document.getElementById("altitude-fields");

  // Get all input and select elements in each field group
  const flagInputs = flagFields.querySelectorAll("input, select");
  const timeInputs = timeFields.querySelectorAll("input, select");
  const altitudeInputs = altitudeFields.querySelectorAll("input, select");

  // Expose these functions globally so they can be used in formHandler.js
  window.disableFields = disableFields;
  window.enableFields = enableFields;
  window.resetStoppingFields = resetStoppingFields;

  function disableFields(elements) {
    elements.forEach((element) => {
      element.disabled = true;
      // Add disabled styling class for consistent appearance
      element.classList.add("disabled-field");
    });
  }

  function enableFields(elements) {
    elements.forEach((element) => {
      element.disabled = false;
      // Remove disabled styling class
      element.classList.remove("disabled-field");
    });
  }

  // Show flag fields and enable them by default
  flagFields.classList.remove("hidden");
  timeFields.classList.add("hidden");
  altitudeFields.classList.add("hidden");
  enableFields(flagInputs);
  disableFields(timeInputs);
  disableFields(altitudeInputs);

  function resetStoppingFields() {
    // Hide all fields
    flagFields.classList.add("hidden");
    timeFields.classList.add("hidden");
    altitudeFields.classList.add("hidden");

    // Disable all inputs
    disableFields(flagInputs);
    disableFields(timeInputs);
    disableFields(altitudeInputs);

    // Reset input values
    document.getElementById("flag-name").value = "";
    document.getElementById("flag-value").value = "";
    document.getElementById("flag-condition").selectedIndex = 0;

    document.getElementById("time-value").value = "";
    document.getElementById("time-condition").selectedIndex = 0;

    document.getElementById("altitude-value").value = "";
    document.getElementById("altitude-condition").selectedIndex = 0;
  }

  stoppingRadioButtons.forEach((radio) => {
    radio.addEventListener("change", function () {
      resetStoppingFields(); // Hide and disable all fields, reset values

      if (this.value === "flag") {
        flagFields.classList.remove("hidden");
        enableFields(flagInputs);
        // Ensure the dropdown is populated
        if (window.populateStoppingFlagDropdown) {
          window.populateStoppingFlagDropdown();
        }
      } else if (this.value === "time") {
        timeFields.classList.remove("hidden");
        enableFields(timeInputs);
      } else if (this.value === "altitude") {
        altitudeFields.classList.remove("hidden");
        enableFields(altitudeInputs);
      }
    });
  });

  // Update the stage deletion event listener
  document.addEventListener("click", function (event) {
    if (event.target.closest(".delete-stage-icon")) {
      const deleteButton = event.target.closest(".delete-stage-icon");
      const stageId = deleteButton.dataset.stage;
      const stageNumber = parseInt(deleteButton.dataset.stageNumber);

      // Show confirmation dialog
      Swal.fire({
        title: `Delete Stage ${stageNumber}?`,
        text: "This will delete the stage and all its motors and nozzles. This action cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        toast: false, // Ensure it's not a toast
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          // Delete stage from UI
          const stageElement = deleteButton.closest("li");
          if (stageElement) {
            stageElement.remove();
          }

          // Delete stage form
          const stageForm = document.getElementById(`${stageId}-form`);
          if (stageForm) {
            stageForm.remove();
          }

          // Call formHandler functions to remove data
          removeStageFromSavedData(stageNumber);
          removeStageFromFinalData(stageNumber);
          removeStageFlagsFromRegistry(stageNumber);

          // Update dropdowns in sequence form if it's visible
          const sequenceFormElement = document.getElementById("sequence-form");
          if (
            sequenceFormElement &&
            sequenceFormElement.classList.contains("active-form")
          ) {
            const activeSequenceTab = document.querySelector(
              ".sequence-tab.active"
            );
            if (activeSequenceTab) {
              const eventType = activeSequenceTab.getAttribute("data-tab");
              populateEventFlagDropdown(eventType); // Refresh current tab's dropdown
            }
            updateReferenceFlagDropdown(); // Refresh reference dropdown
          }

          // Show success message
          Swal.fire({
            icon: "success",
            title: `Stage ${stageNumber} Deleted`,
            text: "The stage and all its components have been removed.",
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
          });
        }
      });
    }
  });

  // Function to update UI after stage changes
  function updateStageUI(stages) {
    // Update stage buttons and forms
    stages.forEach((stage) => {
      const oldStageId = `stage${stage.stage_number}`;
      const stageBtn = document.querySelector(`#${oldStageId}-btn`);
      if (stageBtn) {
        stageBtn.textContent = `└── Stage ${stage.stage_number}`;
      }

      // Update form headings and IDs
      const stageForm = document.getElementById(`${oldStageId}-form`);
      if (stageForm) {
        const heading = stageForm.querySelector(".stage-heading");
        if (heading) {
          heading.textContent = `Stage ${stage.stage_number}`;
        }

        // Update flag input values
        const burnTimeId = stageForm.querySelector(
          'input[id^="burn-time-id-"]'
        );
        const separationFlag = stageForm.querySelector(
          'input[id^="separation-flag-"]'
        );

        if (burnTimeId) {
          burnTimeId.value = stage.burn_time_identifier;
        }
        if (separationFlag) {
          separationFlag.value = stage.separation_flag;
        }
      }
    });
  }

  // Add rearrange button to the side navigation menu
  const rearrangeBtn = document.createElement("button");
  rearrangeBtn.id = "rearrange-stages-btn";
  rearrangeBtn.className = "rearrange-btn";
  rearrangeBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12H3M3 12L7 8M3 12L7 16"></path>
          <path d="M3 6H21M21 6L17 2M21 6L17 10"></path>
          <path d="M21 18H3M3 18L7 14M3 18L7 22"></path>
      </svg>
      Rearrange
  `;
  vehicleStagesList.insertBefore(rearrangeBtn, vehicleStagesList.firstChild);

  // Add styles for the rearrange button
  const styleElement = document.createElement("style");
  styleElement.textContent = `
      .rearrange-btn {
          background: rgba(74, 144, 226, 0.1);
          border: 1px solid rgba(74, 144, 226, 0.2);
          color: #4a90e2;
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          margin-bottom: 8px;
          width: calc(100% - 16px);
          margin-left: 8px;
          transition: all 0.3s ease;
      }
      
      .rearrange-btn:hover {
          background: rgba(74, 144, 226, 0.2);
          border-color: rgba(74, 144, 226, 0.3);
      }
      
      .rearrange-btn svg {
          opacity: 0.8;
      }
  `;
  document.head.appendChild(styleElement);

  // Add click handler for rearrange button
  rearrangeBtn.addEventListener("click", function () {
    const stagesList = document.getElementById("vehicle-stages");
    const stages = Array.from(document.querySelectorAll(".stage-nav-item"))
      .map((item) => {
        const btn = item.querySelector(".stage-btn");
        const currentNumber = parseInt(btn.textContent.match(/\d+/)[0]);
        return {
          element: item.closest("li"),
          currentNumber: currentNumber,
          stageId: `stage${currentNumber}`,
        };
      })
      .sort((a, b) => a.currentNumber - b.currentNumber);

    if (stages.length === 0) return;

    // Remove all stages from DOM temporarily
    stages.forEach((stage) => stage.element.remove());

    // Reinsert stages in sorted order after the rearrange button
    stages.forEach((stage, index) => {
      const newNumber = index + 1;
      const oldNumber = stage.currentNumber;

      if (oldNumber !== newNumber) {
        // Update stage button text and ID
        const stageBtn = stage.element.querySelector(".stage-btn");
        stageBtn.textContent = `└── Stage ${newNumber}`;
        stageBtn.id = `stage${newNumber}-btn`;

        // Update delete button attributes
        const deleteBtn = stage.element.querySelector(".delete-stage-icon");
        deleteBtn.dataset.stage = `stage${newNumber}`;
        deleteBtn.dataset.stageNumber = newNumber;

        // Update motors submenu id
        const motorsMenu = stage.element.querySelector(".submenu");
        motorsMenu.id = `stage${newNumber}-motors`;

        // Update stage form id and ensure click handler works
        const stageForm = document.getElementById(`${stage.stageId}-form`);
        if (stageForm) {
          const newFormId = `stage${newNumber}-form`;
          stageForm.id = newFormId;

          // Update heading
          const heading = stageForm.querySelector(".stage-heading");
          if (heading) heading.textContent = `Stage ${newNumber}`;

          // Update burn time identifier and separation flag
          const burnTimeId = stageForm.querySelector(
            'input[id^="burn-time-id-"]'
          );
          const separationFlag = stageForm.querySelector(
            'input[id^="separation-flag-"]'
          );

          if (burnTimeId) {
            burnTimeId.value = `ST_${newNumber}_INI`;
            burnTimeId.id = `burn-time-id-${newNumber}`;
          }

          if (separationFlag) {
            separationFlag.value = `ST_${newNumber}_SEP`;
            separationFlag.id = `separation-flag-stage${newNumber}`;
          }

          // Update click handler for the stage button
          stageBtn.onclick = function (event) {
            event.preventDefault();
            showForm(document.getElementById(newFormId));
          };

          // Call formHandler function to update data structures
          updateStageNumberInData(oldNumber, newNumber);
        }
      }

      // Reinsert the stage element after the rearrange button
      stagesList.appendChild(stage.element);
    });

    // Sort savedStages array using formHandler
    sortSavedStages(); // Call directly

    // Update sequence dropdowns if sequence form is active
    const sequenceFormElement = document.getElementById("sequence-form");
    if (
      sequenceFormElement &&
      sequenceFormElement.classList.contains("active-form")
    ) {
      const activeSequenceTab = document.querySelector(".sequence-tab.active");
      if (activeSequenceTab) {
        const eventType = activeSequenceTab.getAttribute("data-tab");
        populateEventFlagDropdown(eventType); // Refresh current tab's dropdown
      }
      updateReferenceFlagDropdown(); // Refresh reference dropdown
    }
  });

  // Add event listener for motor deletion
  document.addEventListener("click", function (event) {
    if (event.target.closest(".delete-motor-icon")) {
      const deleteButton = event.target.closest(".delete-motor-icon");
      const stageId = deleteButton.dataset.stage;
      const motorNumber = parseInt(deleteButton.dataset.motor);
      const stageNumber = stageId.replace("stage", "");

      // Show confirmation dialog
      Swal.fire({
        title: `Delete Motor ${motorNumber} of Stage ${stageNumber}?`,
        text: "This will delete the motor and its nozzle. This action cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          // Delete motor from UI
          const motorElement = deleteButton.closest("li");
          if (motorElement) {
            motorElement.remove();
          }

          // Delete motor form
          const motorForm = document.getElementById(
            `${stageId}-motor${motorNumber}-form`
          );
          if (motorForm) {
            motorForm.remove();
          }

          // Delete nozzle form
          const nozzleForm = document.getElementById(
            `${stageId}-motor${motorNumber}-nozzle1-form`
          );
          if (nozzleForm) {
            nozzleForm.remove();
          }

          // TODO: Call formHandler to remove motor/nozzle data from savedStages/finalMissionData/flagRegistry

          // Show success message
          Swal.fire({
            icon: "success",
            title: `Motor ${motorNumber} of Stage ${stageNumber} Deleted`,
            text: "The motor and its nozzle have been removed.",
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
          });
        }
      });
    }
  });

  // Add event listeners to sequence tabs
  const sequenceTabs = document.querySelectorAll(".sequence-tab");
  if (sequenceTabs.length > 0) {
    sequenceTabs.forEach((tab) => {
      tab.addEventListener("click", function () {
        // Remove 'active' class from all tabs
        sequenceTabs.forEach((t) => t.classList.remove("active"));

        // Add 'active' class to clicked tab
        this.classList.add("active");

        // Update event type hidden field
        const eventType = this.getAttribute("data-tab");
        if (document.getElementById("event-type")) {
          document.getElementById("event-type").value = eventType;
        }

        // Populate event flag dropdown using formHandler
        populateEventFlagDropdown(eventType);

        // Log for debugging
        console.log(`Tab clicked: ${eventType}`);
        // console.log("Current savedStages:", savedStages); // Access via formHandler if needed
        console.log("Current flagRegistry:", flagRegistry); // Access via formHandler if needed
      });
    });
  }

  // Add event listener to sequence button to populate flags when sequence form is opened
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

  function updateMotorBurnTimes(stageId, newBurnTime) {
    const stageNumber = stageId.replace("stage", "");
    const stageMotorsList = document.getElementById(`${stageId}-motors`);
    if (!stageMotorsList) return;

    // Update all motor forms for this stage
    const motorForms = document.querySelectorAll(
      `form[id^="${stageId}-motor"]`
    );
    motorForms.forEach((form) => {
      const burnTimeInput = form.querySelector(".stage-burn-time");
      if (burnTimeInput) {
        burnTimeInput.value = newBurnTime;
      }
    });

    // Update savedStages
    const stageIndex = savedStages.findIndex(
      (s) => s.stage_number === parseInt(stageNumber)
    );
    if (stageIndex !== -1 && savedStages[stageIndex].motors) {
      savedStages[stageIndex].motors.forEach((motor) => {
        if (motor) {
          motor.burn_time = newBurnTime;
        }
      });
    }
  }

  // Add event listener for stage burn time changes
  document.addEventListener("input", function (event) {
    if (event.target.matches('input[placeholder="Enter Burn Time"]')) {
      const stageForm = event.target.closest("form");
      if (stageForm) {
        const stageId = stageForm.id.replace("-form", "");
        const newBurnTime = parseFloat(event.target.value) || 0;
        updateMotorBurnTimes(stageId, newBurnTime);
      }
    }
  });

  // Add event listener for stage structural mass changes
  document.addEventListener("input", function (event) {
    if (event.target.matches('input[placeholder="Enter Structural Mass"]')) {
      const stageForm = event.target.closest("form");
      if (stageForm && stageForm.id.includes("stage")) {
        const stageId = stageForm.id.replace("-form", "");
        const newStructuralMass = event.target.value;
        updateMotorStructuralMass(stageId, newStructuralMass);
      }
    }
  });

  // Function to update structural mass in all motors of a stage
  function updateMotorStructuralMass(stageId, newStructuralMass) {
    const motorForms = document.querySelectorAll(
      `form[id^="${stageId}-motor"]`
    );
    motorForms.forEach((form) => {
      const structuralMassInput = form.querySelector(
        'input[placeholder="Enter Structural Mass"]'
      );
      if (structuralMassInput) {
        structuralMassInput.value = newStructuralMass;
      }
    });

    // Update savedStages if needed
    const stageNumber = parseInt(stageId.replace("stage", ""));
    const stageIndex = savedStages.findIndex(
      (s) => s.stage_number === stageNumber
    );
    if (stageIndex !== -1 && savedStages[stageIndex].motors) {
      savedStages[stageIndex].motors.forEach((motor) => {
        if (motor) {
          motor.structural_mass = parseFloat(newStructuralMass) || 0;
        }
      });
    }
  }
});

// Vehicle Dynamic Field Display
document.addEventListener("DOMContentLoaded", function () {
  const vehicleType = document.getElementById("vehicle-type");
  const dataOptions = document.getElementById("data-options");
  const orbitalOptions = document.getElementById("orbital-options");

  // Fields for ASCEND and PROJECTILE
  const stateFields = document.getElementById("state-fields");
  const launchFieldsAscend = document.getElementById("launch-fields-ascend");
  const launchFieldsProjectile = document.getElementById(
    "launch-fields-projectile"
  );

  // Radio buttons for ASCEND and PROJECTILE
  const stateRadio = document.getElementById("state-data");
  const launchRadio = document.getElementById("launch-point");

  // Orbital Data Sections
  const stateFieldsOrbital = document.getElementById("state-fields-orbital");
  const tleFields = document.getElementById("tle-fields");
  const elementsFields = document.getElementById("elements-fields");

  // Orbital Radio Buttons
  const stateOrbital = document.getElementById("state-orbital");
  const tleOrbital = document.getElementById("tle-orbital");
  const elementsOrbital = document.getElementById("elements-orbital");

  // Function to reset all fields
  function resetFields() {
    // Hide all ASCEND and PROJECTILE fields
    stateFields.classList.add("hidden");
    launchFieldsAscend.classList.add("hidden");
    launchFieldsProjectile.classList.add("hidden");
    dataOptions.classList.add("hidden");

    // Hide all ORBITAL fields
    orbitalOptions.classList.add("hidden");
    resetOrbitalFields();

    // Reset all radio buttons
    stateRadio.checked = false;
    launchRadio.checked = false;
    stateOrbital.checked = false;
    tleOrbital.checked = false;
    elementsOrbital.checked = false;
  }

  // Function to reset orbital fields
  function resetOrbitalFields() {
    stateFieldsOrbital.classList.add("hidden");
    tleFields.classList.add("hidden");
    elementsFields.classList.add("hidden");
  }

  // Show or Hide Options for ASCEND, PROJECTILE, ORBITAL
  vehicleType.addEventListener("change", function () {
    resetFields(); // Reset fields when dropdown changes

    if (vehicleType.value === "ascend" || vehicleType.value === "projectile") {
      dataOptions.classList.remove("hidden");
    } else if (vehicleType.value === "orbital") {
      orbitalOptions.classList.remove("hidden");
    }
  });

  // Show State or Launch Fields Based on Selection (ASCEND & PROJECTILE)
  stateRadio.addEventListener("change", function () {
    if (stateRadio.checked) {
      stateFields.classList.remove("hidden");
      launchFieldsAscend.classList.add("hidden");
      launchFieldsProjectile.classList.add("hidden");
    }
  });

  launchRadio.addEventListener("change", function () {
    if (launchRadio.checked) {
      stateFields.classList.add("hidden");

      if (vehicleType.value === "ascend") {
        launchFieldsAscend.classList.remove("hidden");
        launchFieldsProjectile.classList.add("hidden");
      } else if (vehicleType.value === "projectile") {
        launchFieldsProjectile.classList.remove("hidden");
        launchFieldsAscend.classList.add("hidden");
      }
    }
  });

  // Show relevant fields based on selected orbital method
  stateOrbital.addEventListener("change", function () {
    resetOrbitalFields();
    if (stateOrbital.checked) stateFieldsOrbital.classList.remove("hidden");
  });

  tleOrbital.addEventListener("change", function () {
    resetOrbitalFields();
    if (tleOrbital.checked) tleFields.classList.remove("hidden");
  });

  elementsOrbital.addEventListener("change", function () {
    resetOrbitalFields();
    if (elementsOrbital.checked) elementsFields.classList.remove("hidden");
  });
});
