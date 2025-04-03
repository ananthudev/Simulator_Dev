// Function to save mission data as JSON file
function saveMissionData() {
  // Get the final mission data from formHandler.js
  const finalMissionData = window.finalMissionData;

  if (!finalMissionData) {
    Swal.fire({
      title: "Error",
      text: "Please complete all mission details before launching.",
      icon: "error",
    });
    return;
  }

  // Create a blob from the mission data
  const blob = new Blob([JSON.stringify(finalMissionData, null, 2)], {
    type: "application/json",
  });

  // Create a download link
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;

  // Get mission name and vehicle name from the form fields
  const missionName =
    document.getElementById("mission-name").value || "mission";
  const vehicleName =
    document.getElementById("vehicle-name").value || "vehicle";
  const safeMissionName = missionName.toLowerCase().replace(/[^a-z0-9]/g, "_");
  const safeVehicleName = vehicleName.toLowerCase().replace(/[^a-z0-9]/g, "_");

  // Get current date and time
  const now = new Date();
  const date = now.toISOString().split("T")[0]; // YYYY-MM-DD
  const time = now.toTimeString().split(" ")[0].replace(/:/g, "-"); // HH-MM-SS

  // Create filename with format: missions/vehicle_mission_YYYY-MM-DD_HH-MM-SS.json
  a.download = `missions/${safeVehicleName}_${safeMissionName}_${date}_${time}.json`;

  // Trigger download
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);

  // Show loading popup and redirect to demo page
  Swal.fire({
    title: "Preparing to Launch Mission...",
    text: "Please wait...",
    icon: "info",
    timer: 3000,
    showConfirmButton: false,
  }).then(() => {
    window.location.href = "demo.html";
  });
}

// Add event listener to Launch button
document.addEventListener("DOMContentLoaded", function () {
  const launchBtn = document.getElementById("launch-btn");
  if (launchBtn) {
    launchBtn.addEventListener("click", saveMissionData);
  }
});
