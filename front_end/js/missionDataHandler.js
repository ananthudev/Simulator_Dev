// Function to validate mission data for integrity and completeness
function validateMissionData(data) {
  if (!data) return { isValid: false, errors: ["No mission data available"] };

  const errors = [];

  // Check for required top-level properties
  const requiredTopLevel = ["mission"];
  requiredTopLevel.forEach((prop) => {
    if (!data[prop]) {
      errors.push(`Missing required section: ${prop}`);
    }
  });

  // If basic validation fails, no need to check deeper
  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  // Validate mission section
  if (typeof data.mission !== "object") {
    errors.push("Mission section is invalid");
  } else {
    // Check required mission properties
    const requiredMission = ["mission_name", "MODE", "UTC"];
    requiredMission.forEach((prop) => {
      if (!data.mission[prop]) {
        errors.push(`Missing required mission property: ${prop}`);
      }
    });

    // Validate UTC
    if (data.mission.UTC) {
      if (!data.mission.UTC.Date) errors.push("Missing mission date");
      if (!data.mission.UTC.Time) errors.push("Missing mission time");
    }
  }

  // Check for vehicle section (should at least have one vehicle entry)
  const missionKeys = Object.keys(data).filter(
    (key) => typeof data[key] === "object" && Array.isArray(data[key]?.vehicle)
  );

  if (missionKeys.length === 0) {
    errors.push("No vehicle information found in any mission");
  } else {
    // Check each mission for a vehicle reference
    missionKeys.forEach((missionKey) => {
      const vehicles = data[missionKey].vehicle || [];
      if (vehicles.length === 0) {
        errors.push(`Mission ${missionKey} has no vehicles`);
      } else {
        // Check that each referenced vehicle exists
        vehicles.forEach((vehicleName) => {
          if (!data[vehicleName]) {
            errors.push(
              `Vehicle '${vehicleName}' referenced in mission '${missionKey}' does not exist`
            );
          } else {
            // Check for stages in the vehicle
            if (
              !Array.isArray(data[vehicleName].stage) ||
              data[vehicleName].stage.length === 0
            ) {
              errors.push(`Vehicle '${vehicleName}' has no stages defined`);
            } else {
              // Verify each stage reference exists
              data[vehicleName].stage.forEach((stageName) => {
                if (!data[stageName]) {
                  errors.push(
                    `Stage '${stageName}' referenced in vehicle '${vehicleName}' does not exist`
                  );
                }
              });
            }
          }
        });
      }
    });
  }

  // Validate sequence information
  const sequenceKeys = Object.keys(data).filter((key) =>
    key.endsWith("_Sequence")
  );
  if (sequenceKeys.length === 0) {
    errors.push("No sequence configuration found");
  } else {
    sequenceKeys.forEach((sequenceKey) => {
      const sequence = data[sequenceKey];
      if (!Array.isArray(sequence) || sequence.length === 0) {
        errors.push(`Sequence '${sequenceKey}' is empty or invalid`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Function to handle mission launch
function saveMissionData() {
  console.log("saveMissionData function called");

  // Get the final mission data from formHandler.js
  const finalMissionData = window.finalMissionData;

  console.log("Checking finalMissionData availability:");
  console.log("typeof finalMissionData:", typeof finalMissionData);
  console.log("finalMissionData value:", finalMissionData);

  if (!finalMissionData) {
    console.error("finalMissionData is not available!");
    Swal.fire({
      title: "Error",
      text: "Please complete all mission details before launching.",
      icon: "error",
    });
    return;
  }

  // Validate mission data integrity
  const validation = validateMissionData(finalMissionData);
  if (!validation.isValid) {
    console.error("Mission data validation failed:", validation.errors);
    Swal.fire({
      title: "Incomplete Mission Data",
      html: `<p>The mission data is incomplete or has errors:</p><ul>${validation.errors
        .map((err) => `<li>${err}</li>`)
        .join(
          ""
        )}</ul><p>Please complete all required sections before launching.</p>`,
      icon: "warning",
      confirmButtonText: "OK",
    });
    return;
  }

  // Create a JSON string with proper formatting
  const jsonString = JSON.stringify(finalMissionData, null, 2);

  // Log the final mission data to console
  console.log("Final Mission Data:");
  console.log(finalMissionData); // Log the object for interactive inspection
  console.log("JSON String:");
  console.log(jsonString); // Log the formatted JSON string

  // Create a blob with the JSON data
  const blob = new Blob([jsonString], { type: "application/json" });

  // Generate a timestamp for the filename
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

  // Create a download link
  const downloadLink = document.createElement("a");
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = `mission_data_${timestamp}.json`;

  // Show confirmation dialog with save option
  Swal.fire({
    title: "Mission Data Ready",
    text: "Would you like to save the mission configuration?",
    icon: "success",
    showCancelButton: true,
    confirmButtonText: "Save Mission Data",
    cancelButtonText: "Cancel",
  }).then((result) => {
    if (result.isConfirmed) {
      // Trigger the download
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      // Clean up the URL object
      URL.revokeObjectURL(downloadLink.href);

      // Show success message
      Swal.fire({
        title: "Success!",
        text: "Mission data has been saved successfully.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    }
  });
}

// Add event listener to Launch button
document.addEventListener("DOMContentLoaded", function () {
  const launchBtn = document.getElementById("launch-btn");
  if (launchBtn) {
    launchBtn.addEventListener("click", saveMissionData);
  }
});
