document.addEventListener("DOMContentLoaded", function () {
  const welcomeMessage = document.getElementById("welcome-message");

  // Forms
  const missionForm = document.getElementById("mission-form");
  const enviroForm = document.getElementById("enviro-form");
  const vehicleForm = document.getElementById("vehicle-form");
  const sequenceForm = document.getElementById("sequence-form");
  const steeringForm = document.getElementById("steering-form");
  const stoppingForm = document.getElementById("stopping-form");

  // Buttons
  const detailsButton = document.getElementById("details-btn");
  const enviroButton = document.getElementById("enviro-btn");
  const vehicleButton = document.getElementById("vehicle-btn");
  const sequenceButton = document.getElementById("sequence-btn");
  const steeringButton = document.getElementById("steering-btn");
  const addStageBtn = document.getElementById("add-stage-btn");
  const vehicleStagesList = document.getElementById("vehicle-stages");
  const stoppingButton = document.getElementById("stopping-btn");

  let stageCounter = 1; // Track stage numbers
  const maxStages = 4; // Maximum allowed stages

  // Add a global array to track saved stages
  let savedStages = [];

  // Initially hide all forms except welcome message
  function hideAllForms() {
    missionForm.style.display = "none";
    enviroForm.style.display = "none";
    vehicleForm.style.display = "none";
    sequenceForm.style.display = "none";
    steeringForm.style.display = "none";
    stoppingForm.style.display = "none";
    document
      .querySelectorAll(".stage-form, .motor-form, .nozzle-form")
      .forEach((form) => {
        form.style.display = "none";
      });
  }
  hideAllForms(); // Apply initially

  // Function to show only one form at a time
  function showForm(formToShow) {
    hideAllForms();
    formToShow.style.display = "block";
    welcomeMessage.style.display = "none";
  }

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
    initializeSteeringTabs();
  });

  // Hide "vehicle-stages" initially
  vehicleStagesList.style.display = "none";

  // Add stages dynamically when "Add Stage" button is clicked
  addStageBtn.addEventListener("click", function () {
    if (stageCounter > maxStages) {
      Swal.fire({
        icon: "error",
        title: "Maximum Stages Reached",
        text: "No further stages allowed. Maximum stages creation reached.",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
      return;
    }

    // Show the "vehicle-stages" menu if it's the first stage
    if (stageCounter === 1) {
      vehicleStagesList.style.display = "block";
    }

    // Create new Stage entry in the sidebar
    const newStage = document.createElement("li");
    const stageId = `stage${stageCounter}`;
    newStage.innerHTML = `<div class="stage-nav-item">
                            <a href="#" class="stage-btn" id="${stageId}-btn">└── Stage ${stageCounter}</a>
                            <button class="delete-stage-icon" data-stage="${stageId}" data-stage-number="${stageCounter}" title="Delete Stage ${stageCounter}">
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
            <h2 class="stage-heading">Stage ${stageCounter}</h2>
            <div class="form-fields">
                <div class="form-row">
                    <div class="form-group">
                        <label for="structural-mass-${stageCounter}" class="label">Structural Mass:</label>
                        <input type="number" id="structural-mass-${stageCounter}" class="input-field" placeholder="Enter Structural Mass">
                    </div>
                    
                    <div class="form-group">
                        <label for="reference-area-${stageCounter}" class="label">Reference Area:</label>
                        <input type="number" id="reference-area-${stageCounter}" class="input-field" placeholder="Enter Reference Area">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="burn-time-${stageCounter}" class="label">Burn Time:</label>
                        <input type="number" id="burn-time-${stageCounter}" class="input-field" placeholder="Enter Burn Time">
                    </div>
                    
                    <div class="form-group">
                        <label for="burn-time-id-${stageCounter}" class="label">Burn Time Identifier:</label>
                        <input type="text" id="burn-time-id-${stageCounter}" class="input-field" value="ST_${stageCounter}_INI" readonly>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="separation-flag-${stageCounter}" class="label">Separation Flag:</label>
                        <input type="text" id="separation-flag-${stageCounter}" class="input-field" value="ST_${stageCounter}_SEP" readonly>
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
            </div>
            
            <div class="button-group">
                <button type="button" class="add-motor-btn add-stg" data-stage="${stageId}">Add Motor</button>
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

      const errors = validateStageForm(stageForm);

      if (errors.length > 0) {
        // Show error message with SweetAlert2
        Swal.fire({
          icon: "error",
          title: "Validation Error",
          html: errors.join("<br>"),
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 5000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener("mouseenter", Swal.stopTimer);
            toast.addEventListener("mouseleave", Swal.resumeTimer);
          },
        });
      } else {
        // Save the stage data
        const stageData = saveStageData(stageForm, stageId);

        if (stageData) {
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
            title: `Stage ${stageCounter - 1} has been saved successfully`,
          });
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
          aeroFilename.value = this.files[0].name;
          // Remove error styling if it was previously marked as error
          aeroFilename.classList.remove("error-field");
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
      title: `Stage ${stageCounter} has been created successfully!`,
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

    // Create new Motor entry in the sidebar
    const newMotor = document.createElement("li");
    newMotor.innerHTML = `<a href="#" class="motor-btn" id="${stageId}-motor${motorCount}-btn">└── Motor ${motorCount}</a>
                          <ul id="${stageId}-motor${motorCount}-nozzles" class="submenu">
                              <li><a href="#" class="nozzle-btn" id="${stageId}-motor${motorCount}-nozzle1-btn">└── Nozzle 1</a></li>
                          </ul>`;
    stageMotorsList.appendChild(newMotor);

    // Create Motor form
    const motorForm = document.createElement("form");
    motorForm.id = `${stageId}-motor${motorCount}-form`;
    motorForm.classList.add("hidden", "motor-form");
    const stageNumber = stageId.replace("stage", "");
    motorForm.innerHTML = `
    <div class="form-container">
        <h2 class="stage-heading">Motor ${motorCount} - ${stageId}</h2>
        <div class="form-fields">
            <div class="form-row">
                <div class="form-group">
                    <label class="label">Structural Mass:</label>
                    <input type="number" class="input-field" placeholder="Enter Structural Mass">
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
                    <input type="number" class="input-field" placeholder="Enter Propulsion Mass">
                </div>
                
                <div class="form-group">
                    <label class="label">Ignition Flag:</label>
                    <input type="text" class="input-field" value="S${stageNumber}_M${motorCount}_IGN" readonly>
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label class="label">Cut Off Flag:</label>
                    <input type="text" class="input-field" placeholder="Enter COF Value">
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
                    <input type="number" class="input-field" placeholder="Enter Nozzle Diameter">
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label class="label">Burn Time:</label>
                    <input type="number" class="input-field" placeholder="Enter Burn Time">
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group full-width">
                    <div class="upload-data">
                        <label for="thrust-upload-${stageId}-${motorCount}" class="upload-label">Thrust Time:</label>
                        <input type="file" id="thrust-upload-${stageId}-${motorCount}" accept=".csv" style="display: none" />
                        <button class="upload" id="thrust-upload-btn-${stageId}-${motorCount}">
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
            <button type="submit" class="next-motor-btn">Save</button>
        </div>
    </div>
`;

    document.querySelector(".mission-content").appendChild(motorForm);

    // Create Nozzle form
    const nozzleForm = document.createElement("form");
    nozzleForm.id = `${stageId}-motor${motorCount}-nozzle1-form`;
    nozzleForm.classList.add("hidden", "nozzle-form");
    nozzleForm.innerHTML = `
    <div class="form-container">
        <h2 class="stage-heading">Nozzle 1 - Motor ${motorCount}</h2>
        
        <!-- Nozzle Parameters -->
        <div class="form-fields">
            <div class="form-row">
                <div class="form-group">
                    <label class="label">Nozzle Diameter:</label>
                    <input type="number" class="input-field" placeholder="Enter nozzle diameter">
                </div>
                
                <div class="form-group">
                    <label class="label">ETA Thrust:</label>
                    <input type="number" class="input-field" placeholder="Enter ETA thrust">
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label class="label">Zeta Thrust:</label>
                    <input type="number" class="input-field" placeholder="Enter Zeta thrust">
                </div>
            </div>

            <!-- Location Section -->
            <h3 class="section-title">Location</h3>
            <div class="form-row">
                <div class="form-group">
                    <label class="label">Radial Distance:</label>
                    <input type="number" class="input-field" placeholder="Enter radial distance">
                </div>
                
                <div class="form-group">
                    <label class="label">Phi:</label>
                    <input type="number" class="input-field" placeholder="Enter Phi value">
                </div>
            </div>

            <!-- Miss Alignment Section -->
            <h3 class="section-title">Miss Alignment</h3>
            <div class="form-row">
                <div class="form-group">
                    <label class="label">Sigma Thrust:</label>
                    <input type="number" class="input-field" placeholder="Enter sigma thrust">
                </div>
                
                <div class="form-group">
                    <label class="label">Thau Thrust:</label>
                    <input type="number" class="input-field" placeholder="Enter thau thrust">
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label class="label">Epsilon Thrust:</label>
                    <input type="number" class="input-field" placeholder="Enter epsilon thrust">
                </div>
            </div>

            <!-- Orientation Section -->
            <h3 class="section-title">Orientation</h3>
            <div class="form-row">
                <div class="form-group">
                    <label class="label">MU:</label>
                    <input type="number" class="input-field" placeholder="Enter MU value">
                </div>
                
                <div class="form-group">
                    <label class="label">LAMDA:</label>
                    <input type="number" class="input-field" placeholder="Enter LAMDA value">
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label class="label">KAPPA:</label>
                    <input type="number" class="input-field" placeholder="Enter KAPPA value">
                </div>
            </div>

            <!-- Throat Location Section -->
            <h3 class="section-title">Throat Location</h3>
            <div class="form-row">
                <div class="form-group">
                    <label class="label">X:</label>
                    <input type="number" class="input-field" placeholder="Enter X value">
                </div>
                
                <div class="form-group">
                    <label class="label">Y:</label>
                    <input type="number" class="input-field" placeholder="Enter Y value">
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label class="label">Z:</label>
                    <input type="number" class="input-field" placeholder="Enter Z value">
                </div>
            </div>
        </div>
        
        <div class="button-group">
            <button type="reset" class="clear-btn">Clear</button>
            <button type="submit" class="next-nozzle-btn">Save</button>
        </div>
    </div>
`;

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
          thrustFilename.value = this.files[0].name;
        }
      });
    }
  }

  // Function to initialize steering tabs
  function initializeSteeringTabs() {
    const steeringTabs = document.querySelectorAll(".steering-tab");
    const steeringTabContents = document.querySelectorAll(
      ".steering-tab-content"
    );

    if (steeringTabs.length && steeringTabContents.length) {
      steeringTabs.forEach((tab) => {
        tab.addEventListener("click", () => {
          steeringTabs.forEach((t) => t.classList.remove("active"));
          steeringTabContents.forEach((content) =>
            content.classList.remove("active")
          );

          tab.classList.add("active");
          const contentId = tab.getAttribute("data-tab");
          const content = document.getElementById(contentId);
          if (content) {
            content.classList.add("active");
          }
        });
      });
    }
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

  function disableFields(elements) {
    elements.forEach((element) => {
      element.disabled = true;
    });
  }

  function enableFields(elements) {
    elements.forEach((element) => {
      element.disabled = false;
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
      } else if (this.value === "time") {
        timeFields.classList.remove("hidden");
        enableFields(timeInputs);
      } else if (this.value === "altitude") {
        altitudeFields.classList.remove("hidden");
        enableFields(altitudeInputs);
      }
    });
  });
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

// Update the saveStageData function to add the stage to savedStages
function saveStageData(stageForm, stageId) {
  const stageNumber = stageId.replace("stage", "");
  const vehicleName = document.getElementById("vehicle-name").value.trim();
  const stageName = `Stage_${stageNumber}`;

  console.log("Saving stage data for stage:", stageNumber);
  console.log("Vehicle name:", vehicleName);

  if (!missionData.stages) {
    missionData.stages = [];
  }

  const structuralMassInput = stageForm.querySelector(
    'input[placeholder="Enter Structural Mass"]'
  );
  const referenceAreaInput = stageForm.querySelector(
    'input[placeholder="Enter Reference Area"]'
  );
  const burnTimeInput = stageForm.querySelector(
    'input[placeholder="Enter Burn Time"]'
  );
  const burnTimeIdentifierInput = stageForm.querySelector(
    'input[value^="ST_"]:not([value$="_SEP"])'
  );
  const separationFlagInput = stageForm.querySelector(
    'input[value^="ST_"][value$="_SEP"]'
  );
  const dcissToggle = stageForm.querySelector(`#dciss-toggle-${stageId}`);
  const coastingToggle = stageForm.querySelector(`#coasting-toggle-${stageId}`);
  const aeroFilename = stageForm.querySelector(`#aero-filename-${stageId}`);

  if (!structuralMassInput || !referenceAreaInput || !burnTimeInput) {
    console.error("Missing critical elements in the stage form:", stageId);
    return null;
  }

  const stageData = {
    stage_number: parseInt(stageNumber),
    structural_mass: parseFloat(structuralMassInput.value) || 0,
    reference_area: parseFloat(referenceAreaInput.value) || 0,
    burn_time: parseFloat(burnTimeInput.value) || 0,
    burn_time_identifier: burnTimeIdentifierInput
      ? burnTimeIdentifierInput.value
      : `ST_${stageNumber}_INI`,
    separation_flag: separationFlagInput
      ? separationFlagInput.value
      : `ST_${stageNumber}_SEP`,
    dciss: dcissToggle ? dcissToggle.checked : false,
    coasting: coastingToggle ? coastingToggle.checked : false,
    aero_data_file: aeroFilename ? aeroFilename.value : "",
  };

  console.log("Stage data to be saved:", stageData);

  // Add the stage to savedStages array if it's not already there
  const stageIndex = savedStages.findIndex(
    (s) => s.stage_number === parseInt(stageNumber)
  );
  if (stageIndex === -1) {
    // Add new stage
    savedStages.push(stageData);
    console.log(`Added stage ${stageNumber} to savedStages`);
  } else {
    // Update existing stage
    savedStages[stageIndex] = stageData;
    console.log(`Updated stage ${stageNumber} in savedStages`);
  }

  // Sort savedStages by stage_number
  savedStages.sort((a, b) => a.stage_number - b.stage_number);
  console.log("Current saved stages:", savedStages);

  if (vehicleName) {
    finalMissionData[vehicleName].no_Stg = Math.max(
      parseInt(stageNumber),
      finalMissionData[vehicleName].no_Stg
    );

    const stageName = `Stage_${stageNumber}`;
    if (!finalMissionData[vehicleName].stage.includes(stageName)) {
      finalMissionData[vehicleName].stage.push(stageName);
    }

    // Update or create stage data
    finalMissionData[stageName] = {
      ...finalMissionData[stageName], // Preserve existing data
      structural_mass: stageData.structural_mass,
      ref_area: stageData.reference_area,
      burn_time: stageData.burn_time,
      burn_time_identifier: stageData.burn_time_identifier,
      separation_flag: stageData.separation_flag,
      DCISS: stageData.dciss ? "ON" : "OFF",
      coasting: stageData.coasting ? "ON" : "OFF",
      aero_data: stageData.aero_data_file,
      motors: finalMissionData[stageName]?.motors || [], // Preserve existing motors
    };

    // Update the sequence form's event flag dropdown
    setTimeout(() => {
      try {
        updateSequenceEventFlags();
      } catch (error) {
        console.warn("Error updating sequence flags:", error);
      }
    }, 0);
  }

  return stageData;
}

// Add this function to update the event flag dropdown in Stage Start tab of Sequence form
function updateStageStartDropdown() {
  console.log("Updating Stage Start dropdown with saved stages:", savedStages);
  // Find the event-flag dropdown in the sequence form
  const eventFlagDropdown = document.getElementById("event-flag");

  // Check if we're on the Stage Start tab
  const activeTab = document.querySelector(".sequence-tab.active");
  if (
    activeTab &&
    activeTab.getAttribute("data-tab") === "stage-start" &&
    eventFlagDropdown
  ) {
    // Clear existing options except the first default one
    while (eventFlagDropdown.options.length > 1) {
      eventFlagDropdown.remove(1);
    }

    // Use savedStages array instead of stageCounter
    if (savedStages.length > 0) {
      savedStages.forEach((stage) => {
        const option = document.createElement("option");
        option.value = stage.burn_time_identifier;
        option.text = `${stage.burn_time_identifier} - Stage ${stage.stage_number}`;
        eventFlagDropdown.appendChild(option);
      });
      console.log(`Added ${savedStages.length} saved stages to dropdown`);
    } else {
      console.log("No saved stages found");
    }
  }
}

// Update the motor ignition dropdown to use saved stages
function updateMotorIgnitionDropdown() {
  console.log("Updating motor ignition dropdown with saved stages");
  const eventFlagDropdown = document.getElementById("event-flag");
  if (eventFlagDropdown) {
    // Clear existing options except the first default one
    while (eventFlagDropdown.options.length > 1) {
      eventFlagDropdown.remove(1);
    }

    // Use savedStages instead of looping through stageCounter
    savedStages.forEach((stage) => {
      const stageNum = stage.stage_number;
      const stageId = `stage${stageNum}`;

      // Find all motor buttons for this stage
      const motorButtons = document.querySelectorAll(
        `#${stageId}-motors .motor-btn`
      );
      const motorsCount = motorButtons.length;

      console.log(`Found ${motorsCount} motors for saved stage ${stageNum}`);

      // Add options for each motor in this stage
      for (let motorNum = 1; motorNum <= motorsCount; motorNum++) {
        const option = document.createElement("option");
        option.value = `S${stageNum}_M${motorNum}_IGN`;
        option.text = `S${stageNum}_M${motorNum}_IGN - Stage ${stageNum} Motor ${motorNum}`;
        eventFlagDropdown.appendChild(option);
      }
    });
  }
}

// Update the motor termination dropdown to use saved stages
function updateMotorTerminationDropdown() {
  console.log("Updating motor termination dropdown with saved stages");
  const eventFlagDropdown = document.getElementById("event-flag");
  if (eventFlagDropdown) {
    // Clear existing options except the first default one
    while (eventFlagDropdown.options.length > 1) {
      eventFlagDropdown.remove(1);
    }

    // Use savedStages instead of looping through stageCounter
    savedStages.forEach((stage) => {
      const stageNum = stage.stage_number;
      const stageId = `stage${stageNum}`;

      // Find all motor buttons for this stage
      const motorButtons = document.querySelectorAll(
        `#${stageId}-motors .motor-btn`
      );
      const motorsCount = motorButtons.length;

      // Add options for each motor in this stage
      for (let motorNum = 1; motorNum <= motorsCount; motorNum++) {
        const option = document.createElement("option");
        option.value = `S${stageNum}_M${motorNum}_Burnout`;
        option.text = `S${stageNum}_M${motorNum}_Burnout - Stage ${stageNum} Motor ${motorNum}`;
        eventFlagDropdown.appendChild(option);
      }
    });
  }
}

// Update the stage separation dropdown to use saved stages
function updateStageSeparationDropdown() {
  console.log("Updating stage separation dropdown with saved stages");
  const eventFlagDropdown = document.getElementById("event-flag");
  if (eventFlagDropdown) {
    // Clear existing options except the first default one
    while (eventFlagDropdown.options.length > 1) {
      eventFlagDropdown.remove(1);
    }

    // Use savedStages array
    savedStages.forEach((stage) => {
      const option = document.createElement("option");
      option.value = stage.separation_flag;
      option.text = `${stage.separation_flag} - Stage ${stage.stage_number} Separation`;
      eventFlagDropdown.appendChild(option);
    });
  }
}

// Function to populate event flag dropdown based on event type
function populateEventFlagDropdown(eventType) {
  const dropdown = document.getElementById("event-flag");

  // Clear existing options except the first one
  while (dropdown.options.length > 1) {
    dropdown.remove(1);
  }

  // Get appropriate flags based on event type
  let flags = [];
  switch (eventType) {
    case "stage-start":
      flags = window.flagRegistry.burnTimeIdentifiers.map((item) => item.flag);
      break;
    case "stage-separation":
      flags = window.flagRegistry.separationFlags.map((item) => item.flag);
      break;
    case "motor-ignition":
      flags = window.flagRegistry.motorIgnitionFlags.map((item) => item.flag);
      break;
    case "motor-termination":
      flags = window.flagRegistry.motorBurnoutFlags.map((item) => item.flag);
      break;
    case "heat-shield-separation":
      // Add heat shield separation flag if exists
      flags = window.flagRegistry.heatShieldFlags.map((item) => item.flag);
      if (flags.length === 0) {
        flags.push("HSS_Flag"); // Default value
      }
      break;
  }

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

document.addEventListener("DOMContentLoaded", function () {
  // ... existing code ...

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

        // Populate event flag dropdown
        populateEventFlagDropdown(eventType);
      });
    });
  }

  // Add event listener to sequence button to populate flags when sequence form is opened
  const sequenceBtn = document.getElementById("sequence-btn");
  if (sequenceBtn) {
    sequenceBtn.addEventListener("click", function () {
      // If sequence form has been loaded
      setTimeout(() => {
        // Get the active tab's event type
        const activeTab = document.querySelector(".sequence-tab.active");
        if (activeTab) {
          const eventType = activeTab.getAttribute("data-tab");
          // Populate dropdown with appropriate flags
          populateEventFlagDropdown(eventType);
        }
      }, 100); // Small timeout to ensure DOM is ready
    });
  }

  // ... existing code ...
});

// Function to validate stage form
function validateStageForm(stageForm) {
  const errors = [];

  // Get all required fields
  const structuralMass = stageForm.querySelector(
    'input[placeholder="Enter Structural Mass"]'
  );
  const referenceArea = stageForm.querySelector(
    'input[placeholder="Enter Reference Area"]'
  );
  const burnTime = stageForm.querySelector(
    'input[placeholder="Enter Burn Time"]'
  );
  const aeroFilename = stageForm.querySelector('input[type="text"].filename');

  // Validate Structural Mass
  if (!structuralMass.value.trim()) {
    errors.push("Structural Mass is required");
    structuralMass.classList.add("error-field");
  } else if (parseFloat(structuralMass.value) <= 0) {
    errors.push("Structural Mass must be greater than 0");
    structuralMass.classList.add("error-field");
  } else {
    structuralMass.classList.remove("error-field");
  }

  // Validate Reference Area
  if (!referenceArea.value.trim()) {
    errors.push("Reference Area is required");
    referenceArea.classList.add("error-field");
  } else if (parseFloat(referenceArea.value) <= 0) {
    errors.push("Reference Area must be greater than 0");
    referenceArea.classList.add("error-field");
  } else {
    referenceArea.classList.remove("error-field");
  }

  // Validate Burn Time
  if (!burnTime.value.trim()) {
    errors.push("Burn Time is required");
    burnTime.classList.add("error-field");
  } else if (parseFloat(burnTime.value) <= 0) {
    errors.push("Burn Time must be greater than 0");
    burnTime.classList.add("error-field");
  } else {
    burnTime.classList.remove("error-field");
  }

  // Validate Aero Data File
  if (!aeroFilename.value.trim()) {
    errors.push("Aero Data file is required");
    aeroFilename.classList.add("error-field");
  } else {
    aeroFilename.classList.remove("error-field");
  }

  return errors;
}
