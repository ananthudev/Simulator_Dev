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
        const terminal = window.open("", "_blank", "width=900,height=700");
        if (!terminal) {
          Swal.fire({
            title: "Error",
            text: "Could not open output window. Please allow popups for this site.",
            icon: "error",
          });
          return;
        }

        terminal.document.write("<html><head><title>ASTRA Terminal</title>");
        terminal.document.write(`
          <style>
            body { 
              background-color: #000; 
              color: #fff; 
              font-family: 'Courier New', monospace; 
              padding: 0; 
              margin: 0;
              height: 100vh;
              display: flex;
              flex-direction: column;
            }
            #terminal-container {
              flex: 1;
              display: flex;
              flex-direction: column;
              height: 100%;
              position: relative; /* For positioning the button */
            }
            #output {
              flex: 1;
              overflow-y: auto;
              padding: 10px;
              background-color: #000;
              white-space: pre-wrap;
              word-wrap: break-word;
              font-size: 14px;
              line-height: 1.2;
            }
            #input-container {
              display: flex;
              align-items: center;
              padding: 5px 10px;
              background-color: #111;
              border-top: 1px solid #333;
            }
                         #prompt {
               color: #fff;
               margin-right: 5px;
             }
            #terminal-input {
              flex: 1;
              background-color: transparent;
              border: none;
              color: #fff;
              outline: none;
              font-family: 'Courier New', monospace;
              font-size: 14px;
            }
                         .header {
               background-color: #222;
               padding: 10px;
               border-bottom: 1px solid #333;
               text-align: center;
               color: #fff;
             }
             #go-to-live-btn {
                position: absolute;
                bottom: 45px; /* Position above the input container */
                left: 50%;
                transform: translateX(-50%);
                padding: 6px 12px;
                background-color: #007bff;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                display: none; /* Initially hidden */
                font-family: 'Courier New', monospace;
                font-size: 13px;
                z-index: 10;
             }
             #go-to-live-btn:hover {
                background-color: #0056b3;
             }
          </style>
        `);
        terminal.document.write("</head><body>");
        terminal.document.write(`
          <div id="terminal-container">
            <div class="header">
              <h3>ASTRA Terminal</h3>
            </div>
            <div id="output"></div>
            <button id="go-to-live-btn">↓ Go to Live View</button>
            <div id="input-container">
              <span id="prompt">$</span>
              <input type="text" id="terminal-input" placeholder="Enter commands when prompted..." />
            </div>
          </div>
        `);

        // Check if we're running in Electron environment
        if (window.isElectron) {
          try {
            // Use the direct Node.js modules exposed by main.js
            const fs = window.nodeFs;
            const path = window.nodePath;
            const exec = window.nodeExec;

            // Get references to terminal elements
            const outputElement = terminal.document.getElementById("output");
            const inputElement =
              terminal.document.getElementById("terminal-input");
            const goToLiveBtn =
              terminal.document.getElementById("go-to-live-btn");
            let astraProcess = null;
            let isUserScrolledUp = false;

            // --- Optimized Scroll Detection ---
            let scrollTimer = null;
            outputElement.addEventListener("scroll", () => {
              // Throttle scroll checks for performance
              if (scrollTimer) return;
              scrollTimer = setTimeout(() => {
                const isAtBottom =
                  outputElement.scrollHeight - outputElement.scrollTop <=
                  outputElement.clientHeight + 5;

                isUserScrolledUp = !isAtBottom;
                goToLiveBtn.style.display = isAtBottom ? "none" : "block";

                scrollTimer = null;
              }, 100); // Check every 100ms max
            });

            goToLiveBtn.addEventListener("click", () => {
              isUserScrolledUp = false; // Re-enable auto-scrolling
              outputElement.scrollTop = outputElement.scrollHeight; // Jump to bottom
            });
            // --- End of Scroll Logic ---

            // Direct processing mode - maximum speed achieved

            // Get absolute path to the back_end/Inputs directory
            const inputsDir = path.resolve(path.join(__dirname, "../Inputs"));
            outputElement.innerHTML = `Targeting directory: ${inputsDir}\n`;

            // Create directory if it doesn't exist
            if (!fs.existsSync(inputsDir)) {
              outputElement.innerHTML += `Directory doesn't exist. Creating it...\n`;
              fs.mkdirSync(inputsDir, { recursive: true });
            }

            // Use absolute path for the input file
            const inputFilePath = path.join(inputsDir, filename);
            outputElement.innerHTML += `Saving input file to: ${inputFilePath}\n`;

            // Force write the file and ensure it succeeds
            fs.writeFileSync(inputFilePath, jsonString);

            // Verify the file was created
            if (fs.existsSync(inputFilePath)) {
              const stats = fs.statSync(inputFilePath);
              outputElement.innerHTML += `File saved successfully (${stats.size} bytes).\n`;

              // Performance mode toggle - choose speed vs visual formatting
              const PERFORMANCE_MODE = true; // Set to false for colored output, true for maximum speed

              // Buffer processing function removed - using direct processing for maximum speed

              // Optimized ANSI to HTML conversion with pre-computed mappings for maximum performance
              const ansiColorMap = {
                "": "</span>",
                0: "</span>",
                1: '<span style="font-weight: bold;">',
                22: "</span>",
                30: '<span style="color: #000000;">',
                31: '<span style="color: #ff0000;">',
                32: '<span style="color: #00ff00;">',
                33: '<span style="color: #ffff00;">',
                34: '<span style="color: #0000ff;">',
                35: '<span style="color: #ff00ff;">',
                36: '<span style="color: #00ffff;">',
                37: '<span style="color: #ffffff;">',
                90: '<span style="color: #808080;">',
                91: '<span style="color: #ff6666;">',
                92: '<span style="color: #66ff66;">',
                93: '<span style="color: #ffff66;">',
                94: '<span style="color: #6666ff;">',
                95: '<span style="color: #ff66ff;">',
                96: '<span style="color: #66ffff;">',
                97: '<span style="color: #ffffff;">',
                40: '<span style="background-color: #000000;">',
                41: '<span style="background-color: #ff0000;">',
                42: '<span style="background-color: #00ff00;">',
                43: '<span style="background-color: #ffff00;">',
                44: '<span style="background-color: #0000ff;">',
                45: '<span style="background-color: #ff00ff;">',
                46: '<span style="background-color: #00ffff;">',
                47: '<span style="background-color: #ffffff;">',
                100: '<span style="background-color: #808080;">',
                101: '<span style="background-color: #ff6666;">',
                102: '<span style="background-color: #66ff66;">',
                103: '<span style="background-color: #ffff66;">',
                104: '<span style="background-color: #6666ff;">',
                105: '<span style="background-color: #ff66ff;">',
                106: '<span style="background-color: #66ffff;">',
                107: '<span style="background-color: #ffffff;">',
                // Pre-computed common combinations for maximum speed
                "32;1": '<span style="color: #00ff00; font-weight: bold;">',
                "31;1": '<span style="color: #ff0000; font-weight: bold;">',
                "37;1": '<span style="color: #ffffff; font-weight: bold;">',
                "1;32": '<span style="color: #00ff00; font-weight: bold;">',
                "1;31": '<span style="color: #ff0000; font-weight: bold;">',
                "1;37": '<span style="color: #ffffff; font-weight: bold;">',
              };

              const convertAnsiToHtml = (text) => {
                // Ultra-fast conversion using pre-computed map and minimal regex
                return text
                  .replace(/&/g, "&amp;")
                  .replace(/</g, "&lt;")
                  .replace(/>/g, "&gt;")
                  .replace(
                    /\x1b\[([0-9;]*)m/g,
                    (match, codes) => ansiColorMap[codes] || ""
                  );
              };

              // MAXIMUM SPEED - Direct processing with zero overhead
              const addToOutputBuffer = (data) => {
                // Skip all checks for absolute maximum speed
                const dataStr = data.toString();

                if (PERFORMANCE_MODE) {
                  // Ultra-fast ANSI stripping with optimized regex
                  outputElement.textContent += dataStr.replace(
                    /\x1b\[[0-9;]*m/g,
                    ""
                  );
                } else {
                  // Direct HTML processing
                  outputElement.insertAdjacentHTML(
                    "beforeend",
                    convertAnsiToHtml(dataStr)
                  );
                }

                // Conditional scroll - only when needed
                if (!isUserScrolledUp) {
                  outputElement.scrollTop = outputElement.scrollHeight;
                }
              };

              // Function to forcefully terminate ASTRA process immediately
              const forceTerminateProcess = () => {
                if (!astraProcess) return;

                // Update UI immediately
                outputElement.innerHTML += "\n^C\n";
                inputElement.disabled = true;
                inputElement.placeholder = "Process interrupted";
                outputElement.scrollTop = outputElement.scrollHeight;

                // Brutally kill the process using multiple methods simultaneously
                try {
                  const pid = astraProcess.pid;

                  // Method 1: Node.js process kill
                  if (!astraProcess.killed) {
                    astraProcess.kill("SIGKILL");
                    astraProcess.killed = true;
                  }

                  // Method 2: Windows taskkill (force kill process tree)
                  const exec = window.nodeExec;
                  exec(`taskkill /F /T /PID ${pid}`, () => {});

                  // Method 3: Kill all WSL processes (nuclear option)
                  exec(`wsl --shutdown`, () => {});

                  // Method 4: Kill by process name if PID fails
                  exec(`taskkill /F /IM ASTRA* /T`, () => {});

                  // Forcefully close all streams
                  if (astraProcess.stdin && !astraProcess.stdin.destroyed) {
                    astraProcess.stdin.destroy();
                  }
                  if (astraProcess.stdout && !astraProcess.stdout.destroyed) {
                    astraProcess.stdout.destroy();
                  }
                  if (astraProcess.stderr && !astraProcess.stderr.destroyed) {
                    astraProcess.stderr.destroy();
                  }
                } catch (error) {
                  // Ignore errors - we just want to kill everything
                }

                // Force trigger the close event to clean up
                setTimeout(() => {
                  if (outputElement && terminal && !terminal.closed) {
                    outputElement.innerHTML +=
                      "\nProcess forcefully terminated.\n";
                    outputElement.scrollTop = outputElement.scrollHeight;
                  }
                }, 10);
              };

              // Set up input handling
              const handleInput = (inputText) => {
                if (astraProcess && !astraProcess.killed) {
                  // Echo the input in the terminal immediately
                  outputElement.innerHTML += `${inputText}\n`;
                  // Send input to ASTRA process
                  astraProcess.stdin.write(inputText + "\n");
                  // Auto-scroll to bottom
                  outputElement.scrollTop = outputElement.scrollHeight;
                }
              };

              // Set up keyboard event handler
              inputElement.addEventListener("keydown", (event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  const inputText = inputElement.value;
                  inputElement.value = ""; // Clear input
                  handleInput(inputText);
                }
                // Handle Ctrl+C to interrupt the process
                else if (event.ctrlKey && event.key === "c") {
                  event.preventDefault();
                  forceTerminateProcess();
                }
              });

              // Also add global keydown listener for the terminal window
              terminal.document.addEventListener("keydown", (event) => {
                // Handle Ctrl+C globally in the terminal window
                if (event.ctrlKey && event.key === "c") {
                  event.preventDefault();
                  forceTerminateProcess();
                }
              });

              // Wait a moment to ensure file system has fully written and flushed
              setTimeout(() => {
                if (fs.existsSync(inputFilePath)) {
                  outputElement.innerHTML += `File verified after delay. Running ASTRA...\n`;

                  // inputFilePath is the absolute Windows path to the JSON file
                  const driveLetter = inputFilePath.charAt(0).toLowerCase();
                  const windowsPathAfterDrive = inputFilePath.substring(
                    inputFilePath.indexOf("\\")
                  );
                  const wslAbsoluteFilePath = `/mnt/${driveLetter}${windowsPathAfterDrive.replace(
                    /\\/g,
                    "/"
                  )}`;

                  // Use spawn for real-time output with better process control
                  const spawn = window.nodeSpawn;
                  astraProcess = spawn(
                    "wsl",
                    ["--exec", "ASTRA", wslAbsoluteFilePath],
                    {
                      stdio: ["pipe", "pipe", "pipe"],
                      detached: false,
                      shell: false,
                    }
                  );

                  outputElement.innerHTML += `Executing command: wsl --exec ASTRA "${wslAbsoluteFilePath}"\n\n`;

                  // Enable input field once process starts
                  inputElement.disabled = false;
                  inputElement.focus();

                  astraProcess.stdout.on("data", (data) => {
                    if (terminal && !terminal.closed && outputElement) {
                      // Add to buffer for real-time display with proper ANSI conversion
                      addToOutputBuffer(data);
                    } else {
                      console.log("ASTRA Stdout:", data.toString());
                    }
                  });

                  astraProcess.stderr.on("data", (data) => {
                    if (terminal && !terminal.closed && outputElement) {
                      // Add stderr with prefix to buffer for real-time display
                      addToOutputBuffer(`[STDERR] ${data.toString()}`);
                    } else {
                      console.error("ASTRA Stderr:", data.toString());
                    }
                  });

                  astraProcess.on("error", (error) => {
                    const errorMessage = `Failed to start ASTRA process. Error: ${error.message}\n`;
                    if (terminal && !terminal.closed && outputElement) {
                      outputElement.innerHTML += errorMessage;
                      inputElement.disabled = true;
                    } else {
                      console.error(errorMessage);
                    }
                  });

                  astraProcess.on("close", (code) => {
                    const endTime = Date.now();
                    const executionTime = (
                      (endTime - startTime) /
                      1000
                    ).toFixed(3);

                    Swal.fire({
                      title: code === 0 ? "Success!" : "Process Completed",
                      html: `
                        <p><strong>Execution time: ${executionTime} seconds</strong></p>
                        <p>Exit code: ${code}</p>
                        <details style="text-align: left; margin-top: 15px;">
                          <summary>View Output</summary>
                          <pre style="max-height: 300px; overflow-y: auto; background: #f5f5f5; padding: 10px; margin-top: 10px;">${outputData}</pre>
                        </details>
                      `,
                      icon: code === 0 ? "success" : "info",
                      confirmButtonText: "OK",
                    });
                  });

                  // Handle window close to clean up process
                  terminal.addEventListener("beforeunload", () => {
                    if (astraProcess && !astraProcess.killed) {
                      astraProcess.kill("SIGTERM");
                    }
                  });
                } else {
                  outputElement.innerHTML += `ERROR: File verification failed after delay.\n`;
                  inputElement.disabled = true;
                }
              }, 2000);
            } else {
              outputElement.innerHTML += `ERROR: File verification failed immediately after save.\n`;
              inputElement.disabled = true;
            }
          } catch (error) {
            terminal.document.getElementById("output").textContent =
              `Error setting up Astra: ${error.message}\n` +
              "Please try running the Astra manually using the saved JSON file.\n";
            console.error("Electron execution error:", error);
            terminal.document.getElementById("terminal-input").disabled = true;
          }
        } else {
          // We're in a browser environment, provide instructions for manual execution
          terminal.document.getElementById("output").innerHTML =
            `Not running in Electron environment. Please follow these steps to run the Astra manually:\n\n` +
            `1. Save the downloaded file as "${filename}" to the back_end/Inputs directory\n` +
            `2. Open a WSL terminal\n` +
            `3. Navigate to the ASTRA directory\n` +
            `4. Run: ASTRA ${filename}\n\n` +
            `For this demonstration, you can view the JSON content below:\n\n` +
            `${jsonString}`;
          terminal.document.getElementById("terminal-input").disabled = true;
          terminal.document.getElementById("terminal-input").placeholder =
            "Not available in browser mode";
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

// Background execution for maximum performance
function executeAstraBackground() {
  if (window.isElectron) {
    try {
      const fs = window.nodeFs;
      const path = window.nodePath;
      const spawn = window.nodeSpawn;

      // Show progress dialog
      Swal.fire({
        title: "ASTRA Running...",
        html: 'Executing in background mode for maximum performance.<br><div id="progress-text">Starting...</div>',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const progressText = document.getElementById("progress-text");

      // Get file path
      const inputsDir = path.resolve(path.join(__dirname, "../Inputs"));
      const inputFilePath = path.join(inputsDir, "finalmissiondata.json");
      const driveLetter = inputFilePath.charAt(0).toLowerCase();
      const windowsPathAfterDrive = inputFilePath.substring(
        inputFilePath.indexOf("\\")
      );
      const wslAbsoluteFilePath = `/mnt/${driveLetter}${windowsPathAfterDrive.replace(
        /\\/g,
        "/"
      )}`;

      // Execute ASTRA with minimal overhead
      const startTime = Date.now();
      const astraProcess = spawn(
        "wsl",
        ["--exec", "ASTRA", wslAbsoluteFilePath],
        {
          stdio: ["pipe", "pipe", "pipe"],
          detached: false,
          shell: false,
        }
      );

      let outputData = "";

      astraProcess.stdout.on("data", (data) => {
        outputData += data.toString();
        // Update progress occasionally
        if (Math.random() < 0.1) {
          if (progressText) progressText.textContent = "Processing...";
        }
      });

      astraProcess.stderr.on("data", (data) => {
        outputData += `[STDERR] ${data.toString()}`;
      });

      astraProcess.on("close", (code) => {
        const endTime = Date.now();
        const executionTime = ((endTime - startTime) / 1000).toFixed(3);

        Swal.fire({
          title: code === 0 ? "Success!" : "Process Completed",
          html: `
            <p><strong>Execution time: ${executionTime} seconds</strong></p>
            <p>Exit code: ${code}</p>
            <details style="text-align: left; margin-top: 15px;">
              <summary>View Output</summary>
              <pre style="max-height: 300px; overflow-y: auto; background: #f5f5f5; padding: 10px; margin-top: 10px;">${outputData}</pre>
            </details>
          `,
          icon: code === 0 ? "success" : "info",
          confirmButtonText: "OK",
        });
      });

      astraProcess.on("error", (error) => {
        Swal.fire({
          title: "Error",
          text: `Failed to execute ASTRA: ${error.message}`,
          icon: "error",
        });
      });
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: `Setup failed: ${error.message}`,
        icon: "error",
      });
    }
  } else {
    Swal.fire({
      title: "Not Available",
      text: "Background mode is only available in Electron environment.",
      icon: "info",
    });
  }
}

// Terminal execution (existing functionality)
function executeAstraTerminal() {
  // This function will contain the existing terminal code
  // For now, let's call the original saveMissionData logic
  saveMissionDataOriginal();
}

// Add event listener to Launch button
document.addEventListener("DOMContentLoaded", function () {
  const launchBtn = document.getElementById("launch-btn");
  if (launchBtn) {
    launchBtn.addEventListener("click", saveMissionData);
  }
});
