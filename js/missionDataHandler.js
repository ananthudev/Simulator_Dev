// Function to handle mission launch
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

  // Log the complete mission data as JSON
  console.log(
    "Final Mission Data JSON:",
    JSON.stringify(finalMissionData, null, 2)
  );

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
