document.addEventListener("DOMContentLoaded", function () {
    const welcomeMessage = document.getElementById("welcome-message");

    // Forms
    const missionForm = document.getElementById("mission-form");
    const enviroForm = document.getElementById("enviro-form");
    const vehicleForm = document.getElementById("vehicle-form");

    // Buttons
    const detailsButton = document.getElementById("details-btn");
    const enviroButton = document.getElementById("enviro-btn");
    const vehicleButton = document.getElementById("vehicle-btn");
    const addStageBtn = document.getElementById("add-stage-btn");
    const vehicleStagesList = document.getElementById("vehicle-stages");

    let stageCounter = 1; // Track stage numbers
    const maxStages = 4; // Maximum allowed stages

    // Initially hide all forms except welcome message
    function hideAllForms() {
        missionForm.style.display = "none";
        enviroForm.style.display = "none";
        vehicleForm.style.display = "none";
        document.querySelectorAll(".stage-form, .motor-form").forEach(form => {
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
                    <label class="label">Stage Name:</label>
                    <input type="text" class="input-field" placeholder="Enter Stage Name">

                    <label class="label">Weight:</label>
                    <input type="number" class="input-field" placeholder="Enter Weight">

                    <label class="label">Thrust:</label>
                    <input type="number" class="input-field" placeholder="Enter Thrust">
                </div>
                <button type="button" class="add-motor-btn add-stg" data-stage="${stageId}">Add Motor</button>
                <div class="button-group">
                    <button type="reset" class="clear-btn">Clear</button>
                    <button type="submit" class="next-btn">Next Phase</button>
                </div>
            </div>
        `;

        document.querySelector(".mission-content").appendChild(stageForm);

        // Make Stage clickable to show its form
        newStage.querySelector(".stage-btn").addEventListener("click", function (event) {
            event.preventDefault();
            showForm(stageForm);
        });

        stageCounter++; // Increment stage count
    });

    // Event delegation for dynamically added "Add Motor" buttons
    document.addEventListener("click", function (event) {
        if (event.target.classList.contains("add-motor-btn")) {
            const stageId = event.target.getAttribute("data-stage");
            addMotor(stageId);
        }
    });

    // Add Motor Function
    function addMotor(stageId) {
        const stageMotorsList = document.getElementById(`${stageId}-motors`);
        let motorCount = stageMotorsList.childElementCount + 1;

        // Create new Motor entry in the sidebar
        const newMotor = document.createElement("li");
        newMotor.innerHTML = `<a href="#" class="motor-btn" id="${stageId}-motor${motorCount}-btn">└── Motor ${motorCount}</a>
                              <ul id="${stageId}-motor${motorCount}-nozzles" class="submenu"></ul>`;
        stageMotorsList.appendChild(newMotor);

        // Create corresponding Motor form
        const motorForm = document.createElement("form");
        motorForm.id = `${stageId}-motor${motorCount}-form`;
        motorForm.classList.add("hidden", "motor-form");
        motorForm.innerHTML = `
            <div class="form-container">
                <h2 class="stage-heading">Motor ${motorCount} - ${stageId}</h2>
                <div class="form-fields">
                    <label class="label">Motor Name:</label>
                    <input type="text" class="input-field" placeholder="Enter Motor Name">

                    <label class="label">Power:</label>
                    <input type="number" class="input-field" placeholder="Enter Power">

                    <label class="label">Fuel Type:</label>
                    <input type="text" class="input-field" placeholder="Enter Fuel Type">
                </div>
                <div class="button-group">
                    <button type="reset" class="clear-btn">Clear</button>
                    <button type="submit" class="next-btn">Next Phase</button>
                </div>
            </div>
        `;

        document.querySelector(".mission-content").appendChild(motorForm);

        // Make Motor clickable to show its form
        newMotor.querySelector(".motor-btn").addEventListener("click", function (event) {
            event.preventDefault();
            showForm(motorForm);
        });
    }
});
