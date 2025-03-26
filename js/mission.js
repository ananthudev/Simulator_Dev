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
        document.querySelectorAll(".stage-form").forEach(form => {
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
        newStage.innerHTML = `<a href="#" class="stage-btn" id="${stageId}-btn">└── Stage ${stageCounter}</a>`;
        vehicleStagesList.appendChild(newStage);

        // Create corresponding Stage form
        const stageForm = document.createElement("form");
        stageForm.id = `${stageId}-form`;
        stageForm.classList.add("hidden", "stage-form");
        stageForm.innerHTML = `
            <div class="form-container">
                <div class="form-fields">
                    <label class="label">Stage Name:</label>
                    <input type="text" class="input-field" placeholder="Enter Stage Name">

                    <label class="label">Weight:</label>
                    <input type="number" class="input-field" placeholder="Enter Weight">

                    <label class="label">Thrust:</label>
                    <input type="number" class="input-field" placeholder="Enter Thrust">
                </div>
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
});
