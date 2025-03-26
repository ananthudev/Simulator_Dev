
// Menu tree navigation
document.addEventListener("DOMContentLoaded", () => {
    const welcomeMessage = document.getElementById("welcome-message");
// Forms add here
    const missionForm = document.getElementById("mission-form");
    const enviroForm = document.getElementById("enviro-form");
    const vehicleForm = document.getElementById("vehicle-form"); 

        // Buttons
    const detailsButton = document.getElementById("details-btn");
    const enviroButton = document.getElementById("enviro-btn");
    const vehicleButton = document.getElementById("vehicle-btn");


    // Initially hide both forms, show only welcome message
    missionForm.style.display = "none";
    enviroForm.style.display = "none";
    vehicleForm.style.display = "none";

    // Function to show a form and hide others
    function showForm(formToShow) {
        // Hide all forms in the start
        missionForm.style.display = "none";
        enviroForm.style.display = "none";
        vehicleForm.style.display = "none";

        // Show only selected form
        formToShow.style.display = "block";

        // then Hide welcome message
        welcomeMessage.style.display = "none";
    }

    // Event listener for Details/mission button
    detailsButton.addEventListener("click", (event) => {
        event.preventDefault(); // Prevent default link behavior
        showForm(missionForm);
    });

    // Event listener for Environment button
    enviroButton.addEventListener("click", (event) => {
        event.preventDefault();
        showForm(enviroForm);
    });

    // Event listener for Vehicle button
    vehicleButton.addEventListener("click", (event) => {
        event.preventDefault();
        showForm(vehicleForm);
    });
});

// add stages when add stage button is clicked
document.addEventListener("DOMContentLoaded", function () {
    let stageCounter = 1; // Keeps track of the number of stages
    const addStageBtn = document.getElementById("add-stage-btn");
    const vehicleStagesList = document.getElementById("vehicle-stages");

    addStageBtn.addEventListener("click", function () {
        // Create a new list item
        const newStage = document.createElement("li");
        newStage.innerHTML = `└── Stage ${stageCounter}`;

        // Append the new stage to the submenu
        vehicleStagesList.appendChild(newStage);

        // Increment the stage counter for the next stage
        stageCounter++;
    });
});
