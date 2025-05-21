// Initialize Electron detection (if not already set by the main process)
if (typeof window.isElectron === "undefined") {
  window.isElectron = false;
  console.log("Running in browser environment, some features may be limited");
}

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

  // Log the final mission data to console with detailed info about steering
  console.log("Final Mission Data:");
  console.log(finalMissionData); // Log the object for interactive inspection

  // Check for steering data and log it specifically
  console.log("Checking for steering data in finalMissionData:");
  const steeringKeys = Object.keys(finalMissionData).filter(
    (key) =>
      key.includes("Vertical_Ascend") ||
      key.includes("Pitch_Hold") ||
      key.includes("Constant_Pitch") ||
      key.includes("Profile") ||
      key === "_steering_data_start" ||
      key === "_steering_data_end"
  );

  console.log("Found steering keys:", steeringKeys);
  steeringKeys.forEach((key) => {
    console.log(`Steering data for ${key}:`, finalMissionData[key]);
    if (finalMissionData[key]?.steering) {
      console.log(`Steering type: ${finalMissionData[key].steering.type}`);
      if (finalMissionData[key].steering.value) {
        console.log(
          `Steering value exists and has type: ${typeof finalMissionData[key]
            .steering.value}`
        );
        if (Array.isArray(finalMissionData[key].steering.value)) {
          console.log(
            `Steering value is array with length: ${finalMissionData[key].steering.value.length}`
          );
        }
      }
    }
  });

  console.log("JSON String:");
  console.log(jsonString); // Log the formatted JSON string

  // Create a blob with the JSON data
  const blob = new Blob([jsonString], { type: "application/json" });

  // Use a fixed filename for consistency
  const filename = "finalmissiondata.json";
  const filePath = `../back_end/Inputs/${filename}`;

  // Show confirmation dialog with save option
  Swal.fire({
    title: "Mission Data Ready",
    text: "Would you like to save and execute the mission?",
    icon: "success",
    showCancelButton: true,
    confirmButtonText: "Save & Execute",
    cancelButtonText: "Save Only",
    showDenyButton: true,
    denyButtonText: "Cancel",
  }).then((result) => {
    if (result.isConfirmed || result.dismiss === Swal.DismissReason.cancel) {
      if (window.isElectron) {
        // In Electron mode, save directly to the Inputs folder without download dialog
        console.log("Saving directly to Inputs folder in Electron mode");
      } else {
        // In browser mode, still use download link
        const downloadLink = document.createElement("a");
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = filename;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(downloadLink.href);
      }

      // If user chose "Save & Execute", run the ASTRA executable
      if (result.isConfirmed) {
        // Create a terminal window to show the output
        const terminal = window.open("", "_blank", "width=800,height=600");
        if (!terminal) {
          Swal.fire({
            title: "Error",
            text: "Could not open output window. Please allow popups for this site.",
            icon: "error",
          });
          return;
        }

        terminal.document.write(
          "<html><head><title>ASTRA Simulation Results</title>"
        );
        terminal.document.write(
          '<script src="https://cdn.jsdelivr.net/npm/ansi_up@5.2.1/ansi_up.min.js"><\\/script>'
        );
        terminal.document.write(
          "<style>body { background-color: #000; color: #fff; font-family: monospace; padding: 10px; }</style>"
        );
        terminal.document.write("</head><body>");
        terminal.document.write("<h2>Running ASTRA Simulation...</h2>");

        // Check if we're running in Electron environment
        if (window.isElectron) {
          try {
            // Use the direct Node.js modules exposed by main.js
            const fs = window.nodeFs;
            const path = window.nodePath;
            const exec = window.nodeExec;

            // Set up the output area
            terminal.document.write('<pre id="output"></pre>');

            // Get absolute path to the back_end/Inputs directory
            const inputsDir = path.resolve(path.join(__dirname, "../Inputs"));
            terminal.document.getElementById(
              "output"
            ).textContent = `Targeting directory: ${inputsDir}\n`;

            // Create directory if it doesn't exist
            if (!fs.existsSync(inputsDir)) {
              terminal.document.getElementById(
                "output"
              ).textContent += `Directory doesn't exist. Creating it...\n`;
              fs.mkdirSync(inputsDir, { recursive: true });
            }

            // Use absolute path for the input file
            const inputFilePath = path.join(inputsDir, filename);
            terminal.document.getElementById(
              "output"
            ).textContent += `Saving input file to: ${inputFilePath}\n`;

            // Force write the file and ensure it succeeds
            fs.writeFileSync(inputFilePath, jsonString);

            // Verify the file was created
            if (fs.existsSync(inputFilePath)) {
              const stats = fs.statSync(inputFilePath);
              terminal.document.getElementById(
                "output"
              ).textContent += `File saved successfully (${stats.size} bytes).\n`;

              // Wait a moment to ensure file system has fully written and flushed
              setTimeout(() => {
                if (fs.existsSync(inputFilePath)) {
                  terminal.document.getElementById(
                    "output"
                  ).textContent += `File verified after delay. Running ASTRA...\n`;

                  // inputFilePath is the absolute Windows path to the JSON file, e.g., C:\Users\...\finalmissiondata.json
                  const driveLetter = inputFilePath.charAt(0).toLowerCase();
                  const windowsPathAfterDrive = inputFilePath.substring(
                    inputFilePath.indexOf("\\")
                  );
                  const wslAbsoluteFilePath = `/mnt/${driveLetter}${windowsPathAfterDrive.replace(
                    /\\/g,
                    "/"
                  )}`;

                  // Command to run ASTRA directly using wsl --exec.
                  // Ensure wslAbsoluteFilePath is quoted as it contains spaces.
                  const cmd = `wsl --exec ASTRA "${wslAbsoluteFilePath}"`;

                  terminal.document.getElementById(
                    "output"
                  ).textContent += `Executing command: ${cmd}\n`;

                  // Execute ASTRA. No cwd option is needed for exec as ASTRA gets an absolute path.
                  exec(cmd, (error, stdout, stderr) => {
                    try {
                      if (error) {
                        let errorMessage = `Command execution error. Exit Code: ${
                          error.code
                        }. Message: ${String(error.message)}\n`;
                        if (stderr) {
                          // stderr from callback arguments
                          errorMessage += `Process Stderr: ${String(stderr)}\n`;
                        } else if (error.stderr) {
                          // stderr from the error object itself
                          errorMessage += `Process Stderr (from error object): ${String(
                            error.stderr
                          )}\n`;
                        } else {
                          errorMessage += `Process Stderr: (empty)\n`;
                        }

                        // Check if terminal and its elements are accessible before writing
                        if (
                          terminal &&
                          !terminal.closed &&
                          terminal.document &&
                          terminal.document.getElementById("output")
                        ) {
                          const ansiUp = new AnsiUp();
                          terminal.document.getElementById(
                            "output"
                          ).innerHTML += ansiUp.ansi_to_html(errorMessage);
                        } else {
                          console.error(
                            "Terminal window closed or inaccessible. ASTRA Error:",
                            errorMessage
                          );
                        }
                        return;
                      }

                      if (stderr) {
                        const Sstderr = `ASTRA Stderr: ${String(stderr)}\n`;
                        if (
                          terminal &&
                          !terminal.closed &&
                          terminal.document &&
                          terminal.document.getElementById("output")
                        ) {
                          const ansiUp = new AnsiUp();
                          terminal.document.getElementById(
                            "output"
                          ).innerHTML += ansiUp.ansi_to_html(Sstderr);
                        } else {
                          console.warn(
                            "Terminal window closed or inaccessible. ASTRA Stderr:",
                            Sstderr
                          );
                        }
                      }
                      if (stdout) {
                        const Sstdout = `ASTRA Stdout: ${String(stdout)}\n`;
                        if (
                          terminal &&
                          !terminal.closed &&
                          terminal.document &&
                          terminal.document.getElementById("output")
                        ) {
                          const ansiUp = new AnsiUp();
                          terminal.document.getElementById(
                            "output"
                          ).innerHTML += ansiUp.ansi_to_html(Sstdout);
                        } else {
                          console.log(
                            "Terminal window closed or inaccessible. ASTRA Stdout:",
                            Sstdout
                          );
                        }
                      }
                      const Scomplete = `Simulation completed!\n`;
                      if (
                        terminal &&
                        !terminal.closed &&
                        terminal.document &&
                        terminal.document.getElementById("output")
                      ) {
                        terminal.document.getElementById(
                          "output"
                        ).textContent += Scomplete;
                      } else {
                        console.log(Scomplete);
                      }
                    } catch (e) {
                      console.error(
                        "Error during ASTRA exec callback (e.g., writing to terminal):",
                        String(e)
                      );
                    }
                  });
                } else {
                  terminal.document.getElementById(
                    "output"
                  ).textContent += `ERROR: File verification failed after delay.\n`;
                }
              }, 2000); // 2 second delay to ensure file is fully saved
            } else {
              terminal.document.getElementById(
                "output"
              ).textContent += `ERROR: File verification failed immediately after save.\n`;
            }
          } catch (error) {
            terminal.document.write(
              `<p style="color: red;">Error setting up simulation: ${error.message}</p>`
            );
            terminal.document.write(
              "<p>Please try running the simulation manually using the saved JSON file.</p>"
            );
            console.error("Electron execution error:", error);
          }
        } else {
          // We're in a browser environment, provide instructions for manual execution
          terminal.document.write(
            `<p>Not running in Electron environment. Please follow these steps to run the simulation manually:</p>`
          );
          terminal.document.write(`<ol>
            <li>Save the downloaded file as "${filename}" to the back_end/Inputs directory</li>
            <li>Open a WSL terminal</li>
            <li>Navigate to the ASTRA directory</li>
            <li>Run: ASTRA ${filename}</li>
          </ol>`);
          terminal.document.write(
            `<p>For this demonstration, you can view the JSON content below:</p>`
          );
          terminal.document.write(
            `<pre style="height: 300px; overflow: auto; background-color: #222; padding: 10px;">${jsonString}</pre>`
          );
        }
        terminal.document.write("</body></html>");
      }

      // Show success message
      Swal.fire({
        title: "Success!",
        text: result.isConfirmed
          ? "Mission data has been saved and execution started."
          : "Mission data has been saved successfully.",
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
