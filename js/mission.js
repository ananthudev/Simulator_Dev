document.addEventListener("DOMContentLoaded", () => {
    const welcomeMessage = document.getElementById("welcome-message");
    const missionForm = document.getElementById("mission-form");
    const detailsButton = document.getElementById("details-btn");

    // Initially show the welcome message and hide the mission form
    missionForm.style.display = "none";

    // Add click event listener to the "Details" button
    detailsButton.addEventListener("click", (event) => {
        event.preventDefault(); // Prevent default anchor behavior

        // Hide the welcome message and show the mission form
        welcomeMessage.style.display = "none";
        missionForm.style.display = "block";
    });
});