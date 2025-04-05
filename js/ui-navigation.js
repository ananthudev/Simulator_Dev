document.addEventListener("DOMContentLoaded", function () {
  const welcomeMessage = document.getElementById("welcome-message");

  // Forms
  const missionForm = document.getElementById("mission-form");
  const enviroForm = document.getElementById("enviro-form");
  const vehicleForm = document.getElementById("vehicle-form");
  const sequenceForm = document.getElementById("sequence-form");
  const steeringForm = document.getElementById("steering-form");

  // Buttons
  const detailsButton = document.getElementById("details-btn");
  const enviroButton = document.getElementById("enviro-btn");
  const vehicleButton = document.getElementById("vehicle-btn");
  const sequenceButton = document.getElementById("sequence-btn");
  const steeringButton = document.getElementById("steering-btn");
  const addStageBtn = document.getElementById("add-stage-btn");
  const vehicleStagesList = document.getElementById("vehicle-stages");

  let stageCounter = 1; // Track stage numbers
  const maxStages = 4; // Maximum allowed stages

  // Initially hide all forms except welcome message
  function hideAllForms() {
    missionForm.style.display = "none";
    enviroForm.style.display = "none";
    vehicleForm.style.display = "none";
    sequenceForm.style.display = "none";
    steeringForm.style.display = "none";
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

    // Initialize steering tabs after showing the form
    initializeSteeringTabs();
  });

  // Hide "vehicle-stages" initially
  vehicleStagesList.style.display = "none";

  // Add stages dynamically when "Add Stage" button is clicked
  addStageBtn.addEventListener("click", function () {
    if (stageCounter > maxStages) {
      alert("No further stages allowed. Maximum stages creation reached.");
      return;
    }

    // Show the "vehicle-stages" menu if it's the first stage
    if (stageCounter === 1) {
      vehicleStagesList.style.display = "block";
    }

    // Create new Stage entry in the sidebar
    const newStage = document.createElement("li");
    const stageId = `stage${stageCounter}`;
    newStage.innerHTML = `<a href="#" class="stage-btn" id="${stageId}-btn">└── Stage ${stageCounter}</a>
                          <ul id="${stageId}-motors" class="submenu"></ul>`;
    vehicleStagesList.appendChild(newStage);

    // Create corresponding Stage form with heading & "Add Motor" button
    const stageForm = document.createElement("form");
    stageForm.id = `${stageId}-form`;
    stageForm.classList.add("hidden", "stage-form");
    stageForm.innerHTML = `
        <div class="form-container">
            <h2 class="stage-heading">Stage ${stageCounter}</h2>
            <div class="form-fields">
                <div class="form-row">
                    <div class="form-group">
                        <label class="label">Structural Mass:</label>
                        <input type="number" class="input-field" placeholder="Enter Structural Mass">
                    </div>
                    
                    <div class="form-group">
                        <label class="label">Reference Area:</label>
                        <input type="number" class="input-field" placeholder="Enter Reference Area">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="label">Burn Time:</label>
                        <input type="number" class="input-field" placeholder="Enter Burn Time">
                    </div>
                    
                    <div class="form-group">
                        <label class="label">Burn Time Identifier:</label>
                        <input type="text" class="input-field" value="ST_1_INI" readonly>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="label">Separation Flag:</label>
                        <input type="text" class="input-field" value="ST_1_SEP" readonly>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="label">DCISS:</label>
                        <div class="toggle-container">
                            <input type="checkbox" id="dciss-toggle-${stageId}" class="toggle-input">
                            <label for="dciss-toggle-${stageId}" class="toggle-slider"></label>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="label">Coasting:</label>
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
                <button type="submit" class="next-stage-btn">Save</button>
            </div>
        </div>
    `;

    document.querySelector(".mission-content").appendChild(stageForm);

    // Make Stage clickable to show its form
    newStage
      .querySelector(".stage-btn")
      .addEventListener("click", function (event) {
        event.preventDefault();
        showForm(stageForm);
      });

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
                    <label class="label">Burn Out Flag:</label>
                    <input type="text" class="input-field" value="M1_Burnout">
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label class="label">Cut Off Flag:</label>
                    <input type="text" class="input-field" placeholder="Enter COF Value">
                </div>
                
                <div class="form-group">
                    <label class="label">Separation Flag:</label>
                    <input type="text" class="input-field" value="ST_1_SEP" readonly>
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label class="label">Ignition Flag:</label>
                    <input type="text" class="input-field" value="M1_IGN" readonly>
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

    // Show forms on click
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
  }

  // Event handling for sequence form
  const addEventBtn = document.getElementById("add-event-btn");
  const eventList = document.getElementById("event-list");
  let eventCounter = 1;

  // Enable drag and drop for event list
  function enableDragAndDrop() {
    const eventItems = document.querySelectorAll(".event-item");

    eventItems.forEach((item) => {
      item.setAttribute("draggable", true);

      item.addEventListener("dragstart", (e) => {
        e.target.classList.add("dragging");
      });

      item.addEventListener("dragend", (e) => {
        e.target.classList.remove("dragging");
      });

      item.addEventListener("dragover", (e) => {
        e.preventDefault();
        const draggingItem = document.querySelector(".dragging");
        const siblings = [
          ...eventList.querySelectorAll(".event-item:not(.dragging)"),
        ];
        const nextSibling = siblings.find((sibling) => {
          const box = sibling.getBoundingClientRect();
          const offset = e.clientY - box.top - box.height / 2;
          return offset < 0;
        });

        if (nextSibling) {
          eventList.insertBefore(draggingItem, nextSibling);
        } else {
          eventList.appendChild(draggingItem);
        }
      });
    });
  }

  addEventBtn.addEventListener("click", function () {
    const eventType = document.getElementById("event-type").value;
    const eventFlag = document.getElementById("event-flag").value;
    const triggerType = document.getElementById("trigger-type").value;
    const triggerValue = document.getElementById("trigger-value").value;
    const dependentEvent = document.getElementById("dependent-event").value;
    const eventComment = document.getElementById("event-comment").value;

    if (!eventType || !eventFlag || !triggerType || !triggerValue) {
      alert("Please fill in all required fields");
      return;
    }

    const eventItem = document.createElement("div");
    eventItem.classList.add("event-item");
    eventItem.innerHTML = `
      <div class="event-details">
        <div class="event-type">Event ${eventCounter}: ${eventType}</div>
        <div class="event-info">
          Flag: ${eventFlag} | Trigger: ${triggerType} at ${triggerValue}
          ${dependentEvent !== "none" ? `| Depends on: ${dependentEvent}` : ""}
          ${eventComment ? `| Comment: ${eventComment}` : ""}
        </div>
      </div>
      <div class="event-actions">
        <button class="event-edit-btn">Edit</button>
        <button class="event-delete-btn">Delete</button>
      </div>
    `;

    eventList.appendChild(eventItem);
    eventCounter++;

    // Add the event to dependent event dropdown
    const dependentEventSelect = document.getElementById("dependent-event");
    const option = document.createElement("option");
    option.value = eventFlag;
    option.textContent = `Event ${eventCounter - 1}: ${eventType}`;
    dependentEventSelect.appendChild(option);

    // Clear form fields
    document.getElementById("event-type").selectedIndex = 0;
    document.getElementById("event-flag").value = "";
    document.getElementById("trigger-type").selectedIndex = 0;
    document.getElementById("trigger-value").value = "";
    document.getElementById("dependent-event").selectedIndex = 0;
    document.getElementById("event-comment").value = "";

    // Enable drag and drop for the new event item
    enableDragAndDrop();
  });

  // Event delegation for edit and delete buttons
  eventList.addEventListener("click", function (e) {
    if (e.target.classList.contains("event-delete-btn")) {
      const eventItem = e.target.closest(".event-item");
      const eventFlag = eventItem
        .querySelector(".event-info")
        .textContent.split("|")[0]
        .split(":")[1]
        .trim();

      // Remove the event from the list
      eventItem.remove();

      // Remove the event from dependent event dropdown
      const dependentEventSelect = document.getElementById("dependent-event");
      const options = dependentEventSelect.options;
      for (let i = 0; i < options.length; i++) {
        if (options[i].value === eventFlag) {
          dependentEventSelect.remove(i);
          break;
        }
      }
    } else if (e.target.classList.contains("event-edit-btn")) {
      e.preventDefault(); // Prevent form submission/page refresh
      const eventItem = e.target.closest(".event-item");

      // Get event info text
      const eventInfo = eventItem.querySelector(".event-info").textContent;

      // Extract values from event info
      const flag = eventInfo.split("|")[0].split(":")[1].trim();
      const triggerInfo = eventInfo.split("|")[1].trim();
      const trigger = triggerInfo.split("at")[0].replace("Trigger:", "").trim();
      const triggerValue = triggerInfo.split("at")[1].split("|")[0].trim();

      // Get event type from the event-type div
      const eventType = eventItem
        .querySelector(".event-type")
        .textContent.split(":")[1]
        .trim();

      // Get dependent event if it exists
      let dependentEvent = "none";
      if (eventInfo.includes("Depends on:")) {
        dependentEvent = eventInfo.split("Depends on:")[1].split("|")[0].trim();
      }

      // Get comment if it exists
      let comment = "";
      if (eventInfo.includes("Comment:")) {
        comment = eventInfo.split("Comment:")[1].trim();
      }

      // Populate form fields
      const eventTypeSelect = document.getElementById("event-type");
      const triggerTypeSelect = document.getElementById("trigger-type");
      const dependentEventSelect = document.getElementById("dependent-event");

      // Set event type
      for (let i = 0; i < eventTypeSelect.options.length; i++) {
        if (eventTypeSelect.options[i].text === eventType) {
          eventTypeSelect.selectedIndex = i;
          break;
        }
      }

      // Set trigger type
      for (let i = 0; i < triggerTypeSelect.options.length; i++) {
        if (triggerTypeSelect.options[i].text === trigger) {
          triggerTypeSelect.selectedIndex = i;
          break;
        }
      }

      // Set dependent event
      for (let i = 0; i < dependentEventSelect.options.length; i++) {
        if (dependentEventSelect.options[i].value === dependentEvent) {
          dependentEventSelect.selectedIndex = i;
          break;
        }
      }

      // Set other field values
      document.getElementById("event-flag").value = flag;
      document.getElementById("trigger-value").value = triggerValue;
      document.getElementById("event-comment").value = comment;

      // Remove the event from list and dropdown
      eventItem.remove();

      // Remove from dependent events dropdown
      const options = dependentEventSelect.options;
      for (let i = 0; i < options.length; i++) {
        if (options[i].value === flag) {
          dependentEventSelect.remove(i);
          break;
        }
      }

      // Scroll to the form
      document
        .getElementById("event-type")
        .scrollIntoView({ behavior: "smooth" });
    }
  });

  // Steering form functionality
  const addProfileBtn = document.getElementById("add-profile-btn");
  const profileList = document.getElementById("profile-list");
  let profileCounter = 1;

  // File upload handling
  const steeringDataInput = document.getElementById("steering-data");
  const steeringFilename = document.getElementById("steering-filename");

  steeringDataInput.addEventListener("change", function (e) {
    if (e.target.files.length > 0) {
      steeringFilename.value = e.target.files[0].name;
    }
  });

  addProfileBtn.addEventListener("click", function () {
    const steeringType = document.getElementById("steering-type").value;
    const controlMode = document.getElementById("control-mode").value;
    const startTime = document.getElementById("start-time").value;
    const endTime = document.getElementById("end-time").value;
    const initialAngle = document.getElementById("initial-angle").value;
    const finalAngle = document.getElementById("final-angle").value;
    const turnRate = document.getElementById("turn-rate").value;
    const rateLimit = document.getElementById("rate-limit").value;

    if (
      !steeringType ||
      !controlMode ||
      !startTime ||
      !endTime ||
      !initialAngle ||
      !finalAngle
    ) {
      alert("Please fill in all required fields");
      return;
    }

    const profileItem = document.createElement("div");
    profileItem.classList.add("event-item");
    profileItem.innerHTML = `
      <div class="event-details">
        <div class="event-type">Profile ${profileCounter}: ${steeringType}</div>
        <div class="event-info">
          Mode: ${controlMode} | Time: ${startTime}s to ${endTime}s
          <br>
          Angle: ${initialAngle}° to ${finalAngle}° | Rate: ${
      turnRate || "N/A"
    }°/s
          ${rateLimit ? `| Limit: ${rateLimit}°/s` : ""}
        </div>
      </div>
      <div class="event-actions">
        <button class="event-edit-btn">Edit</button>
        <button class="event-delete-btn">Delete</button>
      </div>
    `;

    profileList.appendChild(profileItem);
    profileCounter++;

    // Clear form fields
    document.getElementById("steering-type").selectedIndex = 0;
    document.getElementById("control-mode").selectedIndex = 0;
    document.getElementById("start-time").value = "";
    document.getElementById("end-time").value = "";
    document.getElementById("initial-angle").value = "";
    document.getElementById("final-angle").value = "";
    document.getElementById("turn-rate").value = "";
    document.getElementById("rate-limit").value = "";
  });

  // Event delegation for edit and delete buttons
  profileList.addEventListener("click", function (e) {
    if (e.target.classList.contains("event-delete-btn")) {
      const profileItem = e.target.closest(".event-item");
      profileItem.remove();
    }
    // Edit functionality can be added here
  });

  // Function to initialize steering tabs
  function initializeSteeringTabs() {
    const steeringTabs = document.querySelectorAll(".steering-tab");
    const steeringTabContents = document.querySelectorAll(
      ".steering-tab-content"
    );

    if (steeringTabs.length && steeringTabContents.length) {
      steeringTabs.forEach((tab) => {
        tab.addEventListener("click", () => {
          // Remove active class from all tabs and contents
          steeringTabs.forEach((t) => t.classList.remove("active"));
          steeringTabContents.forEach((content) =>
            content.classList.remove("active")
          );

          // Add active class to clicked tab and corresponding content
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

// details stopping condition radio button logic starts

document.addEventListener("DOMContentLoaded", function () {
  const radioButtons = document.querySelectorAll(
    'input[name="stopping-condition"]'
  );
  const flagFields = document.getElementById("flag-fields");
  const timeFields = document.getElementById("time-fields");
  const altitudeFields = document.getElementById("altitude-fields");

  function resetFields() {
    flagFields.classList.add("hidden");
    timeFields.classList.add("hidden");
    altitudeFields.classList.add("hidden");

    // Reset input values
    document.getElementById("flag-name").value = "";
    document.getElementById("flag-value").value = "";
    document.getElementById("flag-condition").selectedIndex = 0;

    document.getElementById("time-value").value = "";
    document.getElementById("time-condition").selectedIndex = 0;

    document.getElementById("altitude-value").value = "";
    document.getElementById("altitude-condition").selectedIndex = 0;
  }

  radioButtons.forEach((radio) => {
    radio.addEventListener("change", function () {
      resetFields(); // Hide all fields and reset values

      if (this.value === "flag") {
        flagFields.classList.remove("hidden");
      } else if (this.value === "time") {
        timeFields.classList.remove("hidden");
      } else if (this.value === "altitude") {
        altitudeFields.classList.remove("hidden");
      }
    });
  });
});

// details stopping condition radio button logic ends

// Sequence Form Tab Navigation
document.addEventListener("DOMContentLoaded", function () {
  const sequenceTabs = document.querySelectorAll(".sequence-tab");
  const eventTypeInput = document.getElementById("event-type");

  sequenceTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      // Remove active class from all tabs
      sequenceTabs.forEach((t) => t.classList.remove("active"));

      // Add active class to clicked tab
      tab.classList.add("active");

      // Update the hidden event type input
      eventTypeInput.value = tab.getAttribute("data-tab");
    });
  });
});
