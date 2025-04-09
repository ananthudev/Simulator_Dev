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
  let deletedStages = []; // Track deleted stage numbers

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
  hideAllForms();

  // Function to show only one form at a time
  function showForm(formToShow) {
    hideAllForms();
    formToShow.style.display = "block";
    // Hide both welcome message and its container
    const welcomeMessage = document.getElementById("welcome-message");
    const welcomeContainer = document.querySelector(".welcome-container");
    if (welcomeMessage) welcomeMessage.style.display = "none";
    if (welcomeContainer) welcomeContainer.style.display = "none";
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
    // Check if we've reached the maximum number of active stages
    const activeStages = document.querySelectorAll(".stage-nav-item").length;
    if (activeStages >= maxStages) {
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
                            <button class="delete-stage-icon" data-stage="${stageId}" data-stage-number="${nextStageNumber}" title="Delete Stage ${nextStageNumber}">
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
                        <input type="number" id="structural-mass-${nextStageNumber}" class="input-field" placeholder="Enter Structural Mass">
                    </div>
                    
                    <div class="form-group">
                        <label for="reference-area-${nextStageNumber}" class="label">Reference Area:</label>
                        <input type="number" id="reference-area-${nextStageNumber}" class="input-field" placeholder="Enter Reference Area">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="burn-time-${nextStageNumber}" class="label">Burn Time:</label>
                        <input type="number" id="burn-time-${nextStageNumber}" class="input-field" placeholder="Enter Burn Time">
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

      const errors = validateStageForm(stageForm);

      if (errors.length > 0) {
        // Show error message with SweetAlert2
        Swal.fire({
          icon: "error",
          title: "Input Data Missing",
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
            title: `Stage ${nextStageNumber - 1} has been saved successfully`,
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

    // Create new Motor entry in the sidebar with delete icon
    const newMotor = document.createElement("li");
    newMotor.innerHTML = `
      <div class="motor-nav-item">
        <a href="#" class="motor-btn" id="${stageId}-motor${motorCount}-btn">└── Motor ${motorCount}</a>
        <button class="delete-motor-icon" data-stage="${stageId}" data-motor="${motorCount}" title="Delete Motor ${motorCount}">
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
        `;
      document.head.appendChild(styleElement);
    }

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

    // Add event listener for form submission
    const saveButton = motorForm.querySelector(".next-motor-btn");
    saveButton.addEventListener("click", function (e) {
      e.preventDefault();

      const errors = validateMotorForm(motorForm);

      if (errors.length > 0) {
        // Show error message with SweetAlert2
        Swal.fire({
          icon: "error",
          title: "Input Data Missing",
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
          title: `Motor ${motorCount} has been saved successfully`,
        });

        // TODO: Add logic to save motor data
        // This is where we'll add the code to save the motor data once validation passes
      }
    });

    // Add event listener for nozzle form submission
    const saveNozzleButton = nozzleForm.querySelector(".next-nozzle-btn");
    saveNozzleButton.addEventListener("click", function (e) {
      e.preventDefault();

      const errors = validateNozzleForm(nozzleForm);

      if (errors.length > 0) {
        // Show error message with SweetAlert2
        Swal.fire({
          icon: "error",
          title: "Input Data Missing",
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
          title: `Nozzle 1 has been saved successfully`,
        });

        // TODO: Add logic to save nozzle data
        // This is where we'll add the code to save the nozzle data once validation passes
      }
    });
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

          // Remove stage from savedStages array
          const stageIndex = savedStages.findIndex(
            (s) => s.stage_number === stageNumber
          );
          if (stageIndex !== -1) {
            savedStages.splice(stageIndex, 1);
          }

          // Remove stage from finalMissionData
          const vehicleName = document
            .getElementById("vehicle-name")
            .value.trim();
          if (vehicleName && finalMissionData[vehicleName]) {
            // Remove stage from vehicle's stage array
            const stageName = `Stage_${stageNumber}`;
            const stageIndex =
              finalMissionData[vehicleName].stage.indexOf(stageName);
            if (stageIndex !== -1) {
              finalMissionData[vehicleName].stage.splice(stageIndex, 1);
            }

            // Delete stage data
            delete finalMissionData[stageName];

            // Update number of stages
            finalMissionData[vehicleName].no_Stg =
              finalMissionData[vehicleName].stage.length;
          }

          // Remove stage flags from registry
          const burnTimeIndex = flagRegistry.burnTimeIdentifiers.findIndex(
            (flag) => flag.stageNumber === stageNumber
          );
          if (burnTimeIndex !== -1) {
            flagRegistry.burnTimeIdentifiers.splice(burnTimeIndex, 1);
          }

          const sepFlagIndex = flagRegistry.separationFlags.findIndex(
            (flag) => flag.stageNumber === stageNumber
          );
          if (sepFlagIndex !== -1) {
            flagRegistry.separationFlags.splice(sepFlagIndex, 1);
          }

          // Remove motor flags for this stage
          flagRegistry.motorIgnitionFlags =
            flagRegistry.motorIgnitionFlags.filter(
              (flag) => flag.stageNumber !== stageNumber
            );
          flagRegistry.motorBurnoutFlags =
            flagRegistry.motorBurnoutFlags.filter(
              (flag) => flag.stageNumber !== stageNumber
            );

          // Update dropdowns in sequence form
          try {
            updateStageStartDropdown();
            updateMotorIgnitionDropdown();
            updateMotorTerminationDropdown();
            updateStageSeparationDropdown();
          } catch (error) {
            console.warn("Error updating sequence dropdowns:", error);
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

  // Function to update all dropdowns
  function updateAllDropdowns() {
    try {
      updateStageStartDropdown();
      updateMotorIgnitionDropdown();
      updateMotorTerminationDropdown();
      updateStageSeparationDropdown();
    } catch (error) {
      console.warn("Error updating sequence dropdowns:", error);
    }
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

          // Update savedStages array
          const savedStageIndex = savedStages.findIndex(
            (s) => s.stage_number === oldNumber
          );
          if (savedStageIndex !== -1) {
            savedStages[savedStageIndex].stage_number = newNumber;
            savedStages[
              savedStageIndex
            ].burn_time_identifier = `ST_${newNumber}_INI`;
            savedStages[
              savedStageIndex
            ].separation_flag = `ST_${newNumber}_SEP`;
          }
        }
      }

      // Reinsert the stage element after the rearrange button
      stagesList.appendChild(stage.element);
    });

    // Sort savedStages array
    savedStages.sort((a, b) => a.stage_number - b.stage_number);

    // Update sequence dropdowns
    try {
      updateStageStartDropdown();
      updateMotorIgnitionDropdown();
      updateMotorTerminationDropdown();
      updateStageSeparationDropdown();
    } catch (error) {
      console.warn("Error updating sequence dropdowns:", error);
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

// Update the saveStageData function to use StageManager
function saveStageData(stageForm, stageId) {
  const stageNumber = parseInt(stageId.replace("stage", ""));
  const vehicleName = document.getElementById("vehicle-name").value.trim();

  const formData = {
    structural_mass:
      parseFloat(
        stageForm.querySelector('input[placeholder="Enter Structural Mass"]')
          .value
      ) || 0,
    reference_area:
      parseFloat(
        stageForm.querySelector('input[placeholder="Enter Reference Area"]')
          .value
      ) || 0,
    burn_time:
      parseFloat(
        stageForm.querySelector('input[placeholder="Enter Burn Time"]').value
      ) || 0,
    dciss: stageForm.querySelector(`#dciss-toggle-${stageId}`).checked,
    coasting: stageForm.querySelector(`#coasting-toggle-${stageId}`).checked,
    aero_data_file:
      stageForm.querySelector(`#aero-filename-${stageId}`).value || "",
  };

  // Update stage in StageManager
  const updatedStage = stageManager.updateStage(stageNumber, formData);
  if (!updatedStage) return null;

  // Update finalMissionData
  if (vehicleName) {
    updateFinalMissionData(vehicleName, updatedStage);
  }

  return updatedStage;
}

// Helper function to update finalMissionData
function updateFinalMissionData(vehicleName, stageData) {
  const stageName = `Stage_${stageData.stage_number}`;

  if (!finalMissionData[vehicleName].stage.includes(stageName)) {
    finalMissionData[vehicleName].stage.push(stageName);
  }

  finalMissionData[stageName] = {
    ...finalMissionData[stageName],
    structural_mass: stageData.structural_mass,
    ref_area: stageData.reference_area,
    burn_time: stageData.burn_time,
    burn_time_identifier: stageData.burn_time_identifier,
    separation_flag: stageData.separation_flag,
    DCISS: stageData.dciss ? "ON" : "OFF",
    coasting: stageData.coasting ? "ON" : "OFF",
    aero_data: stageData.aero_data_file,
    motors: finalMissionData[stageName]?.motors || [],
  };

  finalMissionData[vehicleName].no_Stg = Math.max(
    stageData.stage_number,
    finalMissionData[vehicleName].no_Stg
  );
}

// Update the sequence dropdown functions to work without stageManager
function updateStageStartDropdown() {
  const eventFlagDropdown = document.getElementById("event-flag");
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

    // Use savedStages array instead of stageManager
    savedStages.forEach((stage) => {
      const option = document.createElement("option");
      option.value = `ST_${stage.stage_number}_INI`;
      option.text = `ST_${stage.stage_number}_INI - Stage ${stage.stage_number}`;
      eventFlagDropdown.appendChild(option);
    });
  }
}

function updateMotorIgnitionDropdown() {
  const eventFlagDropdown = document.getElementById("event-flag");
  const activeTab = document.querySelector(".sequence-tab.active");

  if (
    activeTab &&
    activeTab.getAttribute("data-tab") === "motor-ignition" &&
    eventFlagDropdown
  ) {
    // Clear existing options except the first default one
    while (eventFlagDropdown.options.length > 1) {
      eventFlagDropdown.remove(1);
    }

    // Use savedStages array
    savedStages.forEach((stage) => {
      if (stage.motors) {
        stage.motors.forEach((motor, index) => {
          const motorNum = index + 1;
          const option = document.createElement("option");
          option.value = `S${stage.stage_number}_M${motorNum}_IGN`;
          option.text = `S${stage.stage_number}_M${motorNum}_IGN - Stage ${stage.stage_number} Motor ${motorNum}`;
          eventFlagDropdown.appendChild(option);
        });
      }
    });
  }
}

function updateMotorTerminationDropdown() {
  const eventFlagDropdown = document.getElementById("event-flag");
  const activeTab = document.querySelector(".sequence-tab.active");

  if (
    activeTab &&
    activeTab.getAttribute("data-tab") === "motor-termination" &&
    eventFlagDropdown
  ) {
    // Clear existing options except the first default one
    while (eventFlagDropdown.options.length > 1) {
      eventFlagDropdown.remove(1);
    }

    // Use savedStages array
    savedStages.forEach((stage) => {
      if (stage.motors) {
        stage.motors.forEach((motor, index) => {
          const motorNum = index + 1;
          const option = document.createElement("option");
          option.value = `S${stage.stage_number}_M${motorNum}_Burnout`;
          option.text = `S${stage.stage_number}_M${motorNum}_Burnout - Stage ${stage.stage_number} Motor ${motorNum}`;
          eventFlagDropdown.appendChild(option);
        });
      }
    });
  }
}

function updateStageSeparationDropdown() {
  const eventFlagDropdown = document.getElementById("event-flag");
  const activeTab = document.querySelector(".sequence-tab.active");

  if (
    activeTab &&
    activeTab.getAttribute("data-tab") === "stage-separation" &&
    eventFlagDropdown
  ) {
    // Clear existing options except the first default one
    while (eventFlagDropdown.options.length > 1) {
      eventFlagDropdown.remove(1);
    }

    // Use savedStages array
    savedStages.forEach((stage) => {
      const option = document.createElement("option");
      option.value = `ST_${stage.stage_number}_SEP`;
      option.text = `ST_${stage.stage_number}_SEP - Stage ${stage.stage_number} Separation`;
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

// Function to validate motor form
function validateMotorForm(motorForm) {
  const errors = [];

  // Get all required fields
  const structuralMass = motorForm.querySelector(
    'input[placeholder="Enter Structural Mass"]'
  );
  const propulsionType = motorForm.querySelector("select.input-field");
  const propulsionMass = motorForm.querySelector(
    'input[placeholder="Enter Propulsion Mass"]'
  );
  const cutOffFlag = motorForm.querySelector(
    'input[placeholder="Enter COF Value"]'
  );
  const nozzleDiameter = motorForm.querySelector(
    'input[placeholder="Enter Nozzle Diameter"]'
  );
  const burnTime = motorForm.querySelector(
    'input[placeholder="Enter Burn Time"]'
  );
  const thrustFilename = motorForm.querySelector('input[type="text"].filename');

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

  // Validate Propulsion Type
  if (!propulsionType.value || propulsionType.value === "") {
    errors.push("Propulsion Type is required");
    propulsionType.classList.add("error-field");
  } else {
    propulsionType.classList.remove("error-field");
  }

  // Validate Propulsion Mass
  if (!propulsionMass.value.trim()) {
    errors.push("Propulsion Mass is required");
    propulsionMass.classList.add("error-field");
  } else if (parseFloat(propulsionMass.value) <= 0) {
    errors.push("Propulsion Mass must be greater than 0");
    propulsionMass.classList.add("error-field");
  } else {
    propulsionMass.classList.remove("error-field");
  }

  // Validate Cut Off Flag
  if (!cutOffFlag.value.trim()) {
    errors.push("Cut Off Flag is required");
    cutOffFlag.classList.add("error-field");
  } else {
    cutOffFlag.classList.remove("error-field");
  }

  // Validate Nozzle Diameter
  if (!nozzleDiameter.value.trim()) {
    errors.push("Nozzle Diameter is required");
    nozzleDiameter.classList.add("error-field");
  } else if (parseFloat(nozzleDiameter.value) <= 0) {
    errors.push("Nozzle Diameter must be greater than 0");
    nozzleDiameter.classList.add("error-field");
  } else {
    nozzleDiameter.classList.remove("error-field");
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

  // Validate Thrust Time File
  if (!thrustFilename.value.trim()) {
    errors.push("Thrust Time file is required");
    thrustFilename.classList.add("error-field");
  } else {
    thrustFilename.classList.remove("error-field");
  }

  return errors;
}

// Function to validate nozzle form
function validateNozzleForm(nozzleForm) {
  const errors = [];

  // Get all required fields
  const nozzleDiameter = nozzleForm.querySelector(
    'input[placeholder="Enter nozzle diameter"]'
  );
  const etaThrust = nozzleForm.querySelector(
    'input[placeholder="Enter ETA thrust"]'
  );
  const zetaThrust = nozzleForm.querySelector(
    'input[placeholder="Enter Zeta thrust"]'
  );
  const radialDistance = nozzleForm.querySelector(
    'input[placeholder="Enter radial distance"]'
  );
  const phi = nozzleForm.querySelector('input[placeholder="Enter Phi value"]');
  const sigmaThrust = nozzleForm.querySelector(
    'input[placeholder="Enter sigma thrust"]'
  );
  const thauThrust = nozzleForm.querySelector(
    'input[placeholder="Enter thau thrust"]'
  );
  const epsilonThrust = nozzleForm.querySelector(
    'input[placeholder="Enter epsilon thrust"]'
  );
  const mu = nozzleForm.querySelector('input[placeholder="Enter MU value"]');
  const lamda = nozzleForm.querySelector(
    'input[placeholder="Enter LAMDA value"]'
  );
  const kappa = nozzleForm.querySelector(
    'input[placeholder="Enter KAPPA value"]'
  );
  const xValue = nozzleForm.querySelector('input[placeholder="Enter X value"]');
  const yValue = nozzleForm.querySelector('input[placeholder="Enter Y value"]');
  const zValue = nozzleForm.querySelector('input[placeholder="Enter Z value"]');

  // Validate Nozzle Diameter
  if (!nozzleDiameter.value.trim()) {
    errors.push("Nozzle Diameter is required");
    nozzleDiameter.classList.add("error-field");
  } else if (parseFloat(nozzleDiameter.value) <= 0) {
    errors.push("Nozzle Diameter must be greater than 0");
    nozzleDiameter.classList.add("error-field");
  } else {
    nozzleDiameter.classList.remove("error-field");
  }

  // Validate ETA Thrust
  if (!etaThrust.value.trim()) {
    errors.push("ETA Thrust is required");
    etaThrust.classList.add("error-field");
  } else {
    etaThrust.classList.remove("error-field");
  }

  // Validate Zeta Thrust
  if (!zetaThrust.value.trim()) {
    errors.push("Zeta Thrust is required");
    zetaThrust.classList.add("error-field");
  } else {
    zetaThrust.classList.remove("error-field");
  }

  // Validate Radial Distance
  if (!radialDistance.value.trim()) {
    errors.push("Radial Distance is required");
    radialDistance.classList.add("error-field");
  } else if (parseFloat(radialDistance.value) < 0) {
    errors.push("Radial Distance cannot be negative");
    radialDistance.classList.add("error-field");
  } else {
    radialDistance.classList.remove("error-field");
  }

  // Validate Phi
  if (!phi.value.trim()) {
    errors.push("Phi value is required");
    phi.classList.add("error-field");
  } else {
    phi.classList.remove("error-field");
  }

  // Validate Sigma Thrust
  if (!sigmaThrust.value.trim()) {
    errors.push("Sigma Thrust is required");
    sigmaThrust.classList.add("error-field");
  } else {
    sigmaThrust.classList.remove("error-field");
  }

  // Validate Thau Thrust
  if (!thauThrust.value.trim()) {
    errors.push("Thau Thrust is required");
    thauThrust.classList.add("error-field");
  } else {
    thauThrust.classList.remove("error-field");
  }

  // Validate Epsilon Thrust
  if (!epsilonThrust.value.trim()) {
    errors.push("Epsilon Thrust is required");
    epsilonThrust.classList.add("error-field");
  } else {
    epsilonThrust.classList.remove("error-field");
  }

  // Validate MU
  if (!mu.value.trim()) {
    errors.push("MU value is required");
    mu.classList.add("error-field");
  } else {
    mu.classList.remove("error-field");
  }

  // Validate LAMDA
  if (!lamda.value.trim()) {
    errors.push("LAMDA value is required");
    lamda.classList.add("error-field");
  } else {
    lamda.classList.remove("error-field");
  }

  // Validate KAPPA
  if (!kappa.value.trim()) {
    errors.push("KAPPA value is required");
    kappa.classList.add("error-field");
  } else {
    kappa.classList.remove("error-field");
  }

  // Validate X Value
  if (!xValue.value.trim()) {
    errors.push("X value is required");
    xValue.classList.add("error-field");
  } else {
    xValue.classList.remove("error-field");
  }

  // Validate Y Value
  if (!yValue.value.trim()) {
    errors.push("Y value is required");
    yValue.classList.add("error-field");
  } else {
    yValue.classList.remove("error-field");
  }

  // Validate Z Value
  if (!zValue.value.trim()) {
    errors.push("Z value is required");
    zValue.classList.add("error-field");
  } else {
    zValue.classList.remove("error-field");
  }

  return errors;
}
