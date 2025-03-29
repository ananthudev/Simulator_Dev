// Global object to store mission data
let missionData = {
    mission: {}
};

// Function to collect data from Mission Details form
function saveMissionDetails() {
    const missionName = document.getElementById("mission-name").value.trim();
    const mode = document.getElementById("modes").value;
    const tracking = document.getElementById("tracking").checked;
    const missionDate = document.getElementById("mission-date").value;
    const missionTime = document.getElementById("mission-time").value;
    const stoppingCondition = document.querySelector('input[name="stopping-condition"]:checked')?.value || null;

    let stoppingData = {};
    
    // Storing stopping condition data based on user selection
    if (stoppingCondition === "flag") {
        stoppingData = {
            name: document.getElementById("flag-name").value.trim(),
            value: parseFloat(document.getElementById("flag-value").value),
            condition: document.getElementById("flag-condition").value
        };
    } else if (stoppingCondition === "time") {
        stoppingData = {
            value: parseFloat(document.getElementById("time-value").value),
            condition: document.getElementById("time-condition").value
        };
    } else if (stoppingCondition === "altitude") {
        stoppingData = {
            value: parseFloat(document.getElementById("altitude-value").value),
            condition: document.getElementById("altitude-condition").value
        };
    }

    // Store collected data in the missionData object
    missionData.mission = {
        mission_name: missionName,
        mode: mode,
        tracking: tracking,
        date: missionDate,
        time: missionTime,
        stopping_condition: stoppingCondition,
        stopping_data: stoppingData
    };

    console.log(" Mission Details Saved:", JSON.stringify(missionData, null, 2));
}

// Attach event listener to the Save button
document.addEventListener("DOMContentLoaded", function () {
    const saveButton = document.getElementById("save-mission");
    if (saveButton) {
        saveButton.addEventListener("click", function (event) {
            event.preventDefault(); // Prevent form submission
            saveMissionDetails();
        });
    }
});
