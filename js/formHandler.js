document.addEventListener("DOMContentLoaded", function () {
  const missionForm = document.getElementById("mission-form");
  const enviroForm = document.getElementById("enviro-form");
  const vehicleForm = document.getElementById("vehicle-form");
  const sequenceForm = document.getElementById("sequence-form");
  const saveMissionButton = document.getElementById("save-mission");
  const saveEnviroButton = enviroForm?.querySelector(".next-btn");
  const saveVehicleButton = vehicleForm?.querySelector(".next-btn");
  const saveSequenceButton = sequenceForm?.querySelector(".next-btn");
  const csvUploadBtn = document.getElementById("csv-upload-btn");
  const csvFileInput = document.getElementById("csv-upload");
  const csvFilename = document.getElementById("csv-filename");
  const atmosModelSelect = document.getElementById("atmos-model");

  let missionData = {}; // Store the complete mission JSON structure
  let stageCounter = 1; // Track the number of stages

  // Make finalMissionData globally accessible
  window.finalMissionData = {
    Software: "ASTRA",
    mission: {
      mission_name: "",
      planet_name: "",
      MODE: "",
      tracking_option: "",
      frame_model: "POST",
      output_frame: "POST",
      UTC: {
        Date: "",
        Time: "",
      },
    },
    stopping_criteria: {
      type: "Flag",
      flag_name: "",
      value: 0,
      condition: "EQ",
    },
    SSPO: {
      vehicle: [],
      vehicle_type: "",
    },
    // Vehicle details will be stored with the vehicle name as key
    Garuda_1: {
      no_Stg: 0,
      stage: [],
      payload: "",
      plf: "",
      integration_method: "",
      time_step: 0,
      effective_altitude: 0,
      steering: "",
      sequence: "",
      Initial_condition: "",
    },
  };

  // Mission Form Submission
  if (saveMissionButton && missionForm) {
    saveMissionButton.addEventListener("click", function (event) {
      event.preventDefault();
      let isValid = validateMissionForm();

      if (isValid) {
        missionData = saveMissionDetails();

        Swal.fire({
          title: "Mission Saved!",
          text: "Mission details saved successfully.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        }).then(() => {
          showForm(enviroForm);
        });
      }
    });
  }

  // Environment Form Submission
  if (saveEnviroButton && enviroForm) {
    saveEnviroButton.addEventListener("click", function (event) {
      event.preventDefault();
      let isValid = validateEnviroForm();

      if (isValid) {
        appendEnviroDetails();

        Swal.fire({
          title: "Environment Saved!",
          text: "Environment details saved successfully.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        }).then(() => {
          showForm(vehicleForm);
        });
      }
    });
  }

  // Wind data upload handling
  const windDataUpload = document.getElementById("wind-data-upload");
  const windDataInput = document.getElementById("wind-data-input");
  const windDataFilename = document.getElementById("wind-data-filename");

  if (windDataUpload && windDataInput && windDataFilename) {
    windDataUpload.addEventListener("click", function () {
      windDataInput.click();
    });

    windDataInput.addEventListener("change", function (e) {
      const file = e.target.files[0];
      if (file) {
        // Accept both .csv files and text/csv MIME type
        if (
          !file.name.toLowerCase().endsWith(".csv") &&
          file.type !== "text/csv"
        ) {
          Swal.fire({
            icon: "error",
            title: "Invalid File Type",
            text: "Please upload a CSV file.",
          });
          return;
        }

        const reader = new FileReader();
        reader.onload = function (event) {
          try {
            const csvData = event.target.result;
            const lines = csvData.split(/\r?\n/); // Handle both \r\n and \n line endings

            // Remove empty lines
            const nonEmptyLines = lines.filter(
              (line) => line.trim().length > 0
            );

            if (nonEmptyLines.length < 3) {
              // Need at least headers, units, and one data row
              throw new Error(
                "CSV file must contain headers, units, and at least one data row"
              );
            }

            // Create the Wind array structure
            const windData = [];

            // Process each line
            for (let i = 0; i < nonEmptyLines.length; i++) {
              const values = nonEmptyLines[i].split(",").map((v) => v.trim());

              // Skip empty lines
              if (
                values.length === 0 ||
                (values.length === 1 && values[0] === "")
              ) {
                continue;
              }

              // Validate row length
              if (values.length !== 3) {
                console.warn(
                  `Row ${i + 1} has ${
                    values.length
                  } values, expected 3. Skipping row.`
                );
                continue;
              }

              if (i === 0) {
                // Headers row - keep as strings
                windData.push(["Altitude", "Zonal", "Meridonal"]);
              } else if (i === 1) {
                // Units row - keep as strings
                windData.push(["m", "m/s", "m/s"]);
              } else {
                // Data rows - convert to numbers and format
                const processedRow = values.map((value) => {
                  const number = parseFloat(value);
                  if (isNaN(number)) {
                    throw new Error(
                      `Invalid number in data row ${i + 1}: ${value}`
                    );
                  }
                  // Return the number with 2 decimal places, but as a number not a string
                  return parseFloat(number.toFixed(2));
                });
                windData.push(processedRow);
              }
            }

            if (windData.length <= 2) {
              throw new Error("No valid data rows found in CSV");
            }

            // Update filename display
            windDataFilename.value = file.name;

            // Store wind data in the environment data structure
            if (!missionData.environment) {
              missionData.environment = {};
            }
            missionData.environment.Wind = windData;

            // Update the finalMissionData structure
            if (!finalMissionData.EARTH) {
              finalMissionData.EARTH = {};
            }
            finalMissionData.EARTH.Wind = windData;

            // Show success message
            Swal.fire({
              icon: "success",
              title: "Wind Data Uploaded",
              text: `Successfully processed ${
                windData.length - 2
              } rows of wind data.`,
              timer: 2000,
              showConfirmButton: false,
            });

            console.log("Processed wind data:", windData);
            console.log(
              "Updated finalMissionData.EARTH.Wind:",
              finalMissionData.EARTH.Wind
            );
          } catch (error) {
            console.error("Error processing wind data:", error);
            Swal.fire({
              icon: "error",
              title: "Error Processing File",
              text:
                error.message ||
                "Please ensure your CSV file is properly formatted.",
            });

            // Clear the file input and filename display
            windDataInput.value = "";
            windDataFilename.value = "";
          }
        };

        reader.onerror = function (error) {
          console.error("Error reading file:", error);
          Swal.fire({
            icon: "error",
            title: "Error Reading File",
            text: "There was an error reading the file. Please try again.",
          });
        };

        reader.readAsText(file);
      }
    });
  }

  // Vehicle Form Submission
  if (saveVehicleButton && vehicleForm) {
    saveVehicleButton.addEventListener("click", function (event) {
      event.preventDefault();
      let isValid = validateVehicleForm();

      if (isValid) {
        appendVehicleDetails();

        Swal.fire({
          title: "Vehicle Saved!",
          text: "Vehicle configuration saved successfully.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        }).then(() => {
          const firstStageForm = document.getElementById("stage1-form");
          if (firstStageForm) {
            showForm(firstStageForm);
          }
        });
      }
    });
  }

  // Sequence Form Submission
  if (saveSequenceButton && sequenceForm) {
    saveSequenceButton.addEventListener("click", function (event) {
      event.preventDefault();
      saveSequenceData();

      Swal.fire({
        title: "Sequence Saved!",
        text: "Event sequence saved successfully.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      }).then(() => {
        showForm(steeringForm);
      });
    });
  }

  // Function to handle enabling/disabling controls
  function updateAtmosControls(fileSelected) {
    if (fileSelected) {
      // If file is selected, disable dropdown and reset it
      atmosModelSelect.value = "Environment";
      atmosModelSelect.disabled = true;
    } else {
      // If no file is selected, enable dropdown
      atmosModelSelect.disabled = false;
    }

    // Disable file upload if a model is selected
    const isModelSelected = atmosModelSelect.value !== "Environment";
    csvUploadBtn.disabled = isModelSelected;
    if (isModelSelected) {
      csvUploadBtn.classList.add("disabled");
    } else {
      csvUploadBtn.classList.remove("disabled");
    }
  }

  // Add atmospheric model change handler
  if (atmosModelSelect) {
    atmosModelSelect.addEventListener("change", function () {
      updateAtmosControls(false);
    });
  }

  // Add CSV upload button handler
  if (csvUploadBtn) {
    csvUploadBtn.addEventListener("click", function (event) {
      event.preventDefault();
      if (!this.disabled) {
        csvFileInput.click();
      }
    });
  }

  // Add file input change handler
  if (csvFileInput) {
    csvFileInput.addEventListener("change", function () {
      if (this.files.length > 0) {
        const file = this.files[0];
        csvFilename.value = file.name;
        updateAtmosControls(true);

        // Create FileReader to read CSV content
        const reader = new FileReader();
        reader.onload = function (e) {
          const text = e.target.result;
          const lines = text.split("\n");
          const atmosData = [
            // First row - headers with exact spelling
            ["altitude", "temprature", "pressure", "density"],
            // Second row - units
            ["m", "k", "pa", "kg/m3"],
          ];

          // Process data lines starting from the third line
          lines.slice(2).forEach((line) => {
            if (line.trim()) {
              // Split by comma and parse numbers with high precision
              const values = line.split(",").map((value) => {
                const num = Number(value);
                if (!isNaN(num)) {
                  // Convert to string with exactly 20 decimal places
                  const numStr = num.toString();
                  // If it's a whole number, add decimal and zeros
                  if (!numStr.includes(".")) {
                    return numStr + ".00000000000000000000";
                  }
                  // If it has decimals, pad with zeros or truncate to 20 places
                  const [whole, decimal] = numStr.split(".");
                  const paddedDecimal = (
                    decimal + "00000000000000000000"
                  ).slice(0, 20);
                  return whole + "." + paddedDecimal;
                }
                return value.trim();
              });

              if (values.length === 4) {
                // Ensure we have all 4 values
                atmosData.push(values);
              }
            }
          });

          // Create the JSON structure
          const atmosJson = {
            atmos: atmosData,
          };

          // Log the formatted JSON with exact indentation
          console.log(JSON.stringify(atmosJson, null, 8));
        };

        reader.readAsText(file);
      } else {
        csvFilename.value = "";
        csvFilename.placeholder = "No file chosen";
      }
    });
  }

  document.addEventListener("click", function (event) {
    if (event.target && event.target.classList.contains("next-stage-btn")) {
      event.preventDefault();

      const currentStageForm = event.target.closest(".stage-form");
      if (!currentStageForm) return;

      const stageId = currentStageForm.id.replace("-form", "");
      const stageNumber = stageId.replace("stage", "");

      let isValid = validateStageForm(currentStageForm, stageId);

      if (isValid) {
        const savedStageData = saveStageData(currentStageForm, stageId);

        if (savedStageData) {
          Swal.fire({
            title: "Stage Saved!",
            text: `Stage ${stageNumber} configuration saved successfully.`,
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
          }).then(() => {
            const nextStageNumber = parseInt(stageNumber) + 1;
            const nextStageForm = document.getElementById(
              `stage${nextStageNumber}-form`
            );

            if (nextStageForm) {
              showForm(nextStageForm);
            } else {
              Swal.fire({
                title: "All Stages Configured!",
                text: "You have completed all stage configurations.",
                icon: "success",
              });
            }
          });
        } else {
          Swal.fire({
            title: "Error",
            text: `Failed to save stage ${stageNumber} configuration.`,
            icon: "error",
          });
        }
      }
    }
  });

  // Add event listener for motor form submission
  document.addEventListener("click", function (event) {
    if (event.target && event.target.classList.contains("next-motor-btn")) {
      event.preventDefault();

      const motorForm = event.target.closest(".motor-form");
      if (!motorForm) return;

      let isValid = validateMotorForm(motorForm);

      if (isValid) {
        const motorData = saveMotorData(motorForm);

        if (motorData) {
          Swal.fire({
            title: "Motor Saved!",
            text: "Motor configuration saved successfully.",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
          }).then(() => {
            const motorId = motorForm.id.replace("-form", "");
            const nozzleForm = document.getElementById(
              `${motorId}-nozzle1-form`
            );
            if (nozzleForm) {
              showForm(nozzleForm);
            }
          });
        } else {
          Swal.fire({
            title: "Error",
            text: "Failed to save motor configuration.",
            icon: "error",
          });
        }
      }
    }
  });

  // Add event listener for nozzle form submission
  document.addEventListener("click", function (event) {
    if (event.target && event.target.classList.contains("next-nozzle-btn")) {
      event.preventDefault();

      const nozzleForm = event.target.closest(".nozzle-form");
      if (!nozzleForm) return;

      let isValid = validateNozzleForm(nozzleForm);

      if (isValid) {
        const nozzleData = saveNozzleData(nozzleForm);

        if (nozzleData) {
          Swal.fire({
            title: "Nozzle Saved!",
            text: "Nozzle configuration saved successfully.",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            title: "Error",
            text: "Failed to save nozzle configuration.",
            icon: "error",
          });
        }
      }
    }
  });

  // Add event listener for file uploads on stage forms
  document.addEventListener("click", function (event) {
    if (event.target.id && event.target.id.startsWith("aero-upload-btn-")) {
      event.preventDefault();
      event.stopPropagation();

      // Prevent form submission
      const parentForm = event.target.closest("form");
      if (parentForm) {
        parentForm.onsubmit = function (e) {
          e.preventDefault();
          return false;
        };
      }

      const stageId = event.target.id.replace("aero-upload-btn-", "");
      const fileInput = document.getElementById(`aero-upload-${stageId}`);

      if (!fileInput) {
        console.error(
          `❌ File input element not found: aero-upload-${stageId}`
        );
        return;
      }

      // Create a new file input element
      const newFileInput = document.createElement("input");
      newFileInput.type = "file";
      newFileInput.accept = ".csv";
      newFileInput.style.display = "none";
      document.body.appendChild(newFileInput);

      // Add change listener
      newFileInput.addEventListener("change", function () {
        const filenameDisplay = document.getElementById(
          `aero-filename-${stageId}`
        );
        if (!filenameDisplay) {
          console.error(
            `❌ Filename display element not found: aero-filename-${stageId}`
          );
          return;
        }

        if (newFileInput.files.length > 0) {
          const file = newFileInput.files[0];
          filenameDisplay.value = file.name;

          // Create FileReader to read CSV content
          const reader = new FileReader();
          reader.onload = function (e) {
            const text = e.target.result;
            const lines = text.split("\n");
            const aeroData = [];

            // Process each line
            lines.forEach((line, index) => {
              if (line.trim()) {
                // Split by comma and parse values
                const values = line.split(",").map((value) => {
                  const trimmed = value.trim();
                  // If the field is empty, return empty string instead of null
                  if (!trimmed) {
                    return "";
                  }
                  // Try to convert to number if possible
                  const num = Number(trimmed);
                  return isNaN(num) ? trimmed : num;
                });

                // Add to aeroData array
                aeroData.push(values);
              }
            });

            // Update the stage data with aero data
            const stageNumber = stageId.replace("stage", "");
            const stage = missionData.stages?.find(
              (s) => s.stage_number === parseInt(stageNumber)
            );

            if (stage) {
              stage.aero_data = aeroData;

              // Update finalMissionData
              const stageName = `Stage_${stageNumber}`;
              if (finalMissionData[stageName]) {
                finalMissionData[stageName].aero_data = aeroData;
              }
            }

            console.log('"aero":', JSON.stringify(aeroData, null, 2));
          };

          reader.readAsText(file);
        } else {
          filenameDisplay.value = "";
          filenameDisplay.placeholder = "No file chosen";
        }

        // Clean up the temporary file input
        document.body.removeChild(newFileInput);
      });

      // Trigger file selection dialog
      newFileInput.click();
    } else if (
      event.target.id &&
      event.target.id.startsWith("thrust-upload-btn-")
    ) {
      event.preventDefault();
      event.stopPropagation();

      // Prevent form submission
      const parentForm = event.target.closest("form");
      if (parentForm) {
        parentForm.onsubmit = function (e) {
          e.preventDefault();
          return false;
        };
      }

      const [stageId, motorCount] = event.target.id
        .replace("thrust-upload-btn-", "")
        .split("-");
      const fileInput = document.getElementById(
        `thrust-upload-${stageId}-${motorCount}`
      );

      if (!fileInput) {
        console.error(
          `❌ File input element not found: thrust-upload-${stageId}-${motorCount}`
        );
        return;
      }

      // Create a new file input element
      const newFileInput = document.createElement("input");
      newFileInput.type = "file";
      newFileInput.accept = ".csv";
      newFileInput.style.display = "none";
      document.body.appendChild(newFileInput);

      // Add change listener
      newFileInput.addEventListener("change", function () {
        const filenameDisplay = document.getElementById(
          `thrust-filename-${stageId}-${motorCount}`
        );
        if (!filenameDisplay) {
          console.error(
            `❌ Filename display element not found: thrust-filename-${stageId}-${motorCount}`
          );
          return;
        }

        if (newFileInput.files.length > 0) {
          const file = newFileInput.files[0];
          filenameDisplay.value = file.name;

          // Create FileReader to read CSV content
          const reader = new FileReader();
          reader.onload = function (e) {
            const text = e.target.result;
            const lines = text.split("\n");
            const thrustData = [];

            // Process each line
            lines.forEach((line, index) => {
              if (line.trim()) {
                // Split by comma and parse values
                const values = line.split(",").map((value) => {
                  const trimmed = value.trim();
                  // If the field is empty, return empty string instead of null
                  if (!trimmed) {
                    return "";
                  }
                  // Try to convert to number if possible
                  const num = Number(trimmed);
                  return isNaN(num) ? trimmed : num;
                });

                // Add to thrustData array
                thrustData.push(values);
              }
            });

            // Update the motor data with thrust data
            const stage = missionData.stages?.find(
              (s) => s.stage_number === parseInt(stageId.replace("stage", ""))
            );

            if (stage) {
              const motor = stage.motors?.find(
                (m) => m.motor_number === parseInt(motorCount)
              );
              if (motor) {
                motor.thrust_data = thrustData;

                // Update finalMissionData
                const motorName = `Motor_${motorCount}`;
                if (finalMissionData[motorName]) {
                  finalMissionData[motorName].thrust_data = thrustData;
                }
              }
            }

            console.log('"thr_time":', JSON.stringify(thrustData, null, 2));
          };

          reader.readAsText(file);
        } else {
          filenameDisplay.value = "";
          filenameDisplay.placeholder = "No file chosen";
        }

        // Clean up the temporary file input
        document.body.removeChild(newFileInput);
      });

      // Trigger file selection dialog
      newFileInput.click();
    }
  });

  // ========== VALIDATION FUNCTIONS ========== //

  function validateMissionForm() {
    let isValid = true;
    clearErrorMessages();

    const missionName = document.getElementById("mission-name");
    const modes = document.getElementById("modes");
    const missionDate = document.getElementById("mission-date");
    const missionTime = document.getElementById("mission-time");
    const stoppingCondition = document.querySelector(
      "input[name='stopping-condition']:checked"
    );

    if (!missionName.value.trim()) {
      showError(missionName, "Mission name is required.");
      isValid = false;
    }

    if (modes.value === "Mode") {
      showError(modes, "Please select a mode.");
      isValid = false;
    }

    if (!missionDate.value) {
      showError(missionDate, "Date is required.");
      isValid = false;
    }

    if (!missionTime.value) {
      showError(missionTime, "Time is required.");
      isValid = false;
    }

    if (!stoppingCondition) {
      showError(
        document.querySelector(".radio-group"),
        "Please select a stopping condition."
      );
      isValid = false;
    }

    return isValid;
  }

  function validateEnviroForm() {
    let isValid = true;
    clearErrorMessages();

    const planet = document.getElementById("planets");
    const atmosModel = document.getElementById("atmos-model");
    const csvUpload = document.getElementById("csv-upload");
    const order = document.getElementById("order");
    const degree = document.getElementById("degree");
    const core = document.getElementById("core");

    if (planet.value === "Environment") {
      showError(planet, "Please select a planet.");
      isValid = false;
    }

    if (atmosModel.value === "Environment" && csvUpload.files.length === 0) {
      showError(
        atmosModel,
        "Please select an atmospheric model or upload a CSV."
      );
      isValid = false;
    }

    if (!order.value.trim() || isNaN(order.value) || order.value < 1) {
      showError(order, "Please enter a valid order (≥1).");
      isValid = false;
    }

    if (!degree.value.trim() || isNaN(degree.value) || degree.value < 0) {
      showError(degree, "Please enter a valid degree (≥0).");
      isValid = false;
    }

    if (core.value === "choose_core") {
      showError(core, "Please select a COE Info model.");
      isValid = false;
    }

    // Check for wind data only if the input exists
    const windDataInput = document.getElementById("wind-data-input");
    if (windDataInput && !windDataInput.files.length) {
      // Show info message but don't invalidate the form
      Swal.fire({
        icon: "info",
        title: "No Wind Data Uploaded",
        text: "Default wind data will be used.",
        timer: 2000,
        showConfirmButton: false,
      });
    }

    return isValid;
  }

  function validateVehicleForm() {
    let isValid = true;
    clearErrorMessages();

    const vehicleName = document.getElementById("vehicle-name");
    const vehicleType = document.getElementById("vehicle-type");
    const integrationMethod = document.getElementById("integration-method");
    const timeStep = document.getElementById("time-step");
    const payloadMass = document.getElementById("payload-mass");
    const plfMass = document.getElementById("plf-mass");
    const plfSepValue = document.getElementById("plf-sep-value");

    // Basic required fields
    if (!vehicleName.value.trim()) {
      showError(vehicleName, "Vehicle name is required.");
      isValid = false;
    }

    if (!vehicleType.value) {
      showError(vehicleType, "Please select a vehicle type.");
      isValid = false;
    }

    if (!integrationMethod.value) {
      showError(integrationMethod, "Please select an integration method.");
      isValid = false;
    }

    if (
      !timeStep.value ||
      isNaN(timeStep.value) ||
      parseFloat(timeStep.value) <= 0
    ) {
      showError(timeStep, "Please enter a valid time step (>0).");
      isValid = false;
    }

    // Payload validation
    if (
      !payloadMass.value ||
      isNaN(payloadMass.value) ||
      parseFloat(payloadMass.value) <= 0
    ) {
      showError(payloadMass, "Please enter a valid payload mass (>0).");
      isValid = false;
    }

    if (
      !plfMass.value ||
      isNaN(plfMass.value) ||
      parseFloat(plfMass.value) <= 0
    ) {
      showError(plfMass, "Please enter a valid PLF mass (>0).");
      isValid = false;
    }

    if (
      !plfSepValue.value ||
      isNaN(plfSepValue.value) ||
      parseFloat(plfSepValue.value) <= 0
    ) {
      showError(plfSepValue, "Please enter a valid separation value (>0).");
      isValid = false;
    }

    // Validate dynamic fields based on vehicle type
    if (vehicleType.value === "ascend" || vehicleType.value === "projectile") {
      const dataMethod = document.querySelector(
        'input[name="data-method"]:checked'
      );
      if (!dataMethod) {
        showError(
          document.querySelector("#data-options .radio-group"),
          "Please select a data input method."
        );
        isValid = false;
      } else if (dataMethod.value === "states") {
        // Validate state fields
        const stateFields = [
          "X",
          "Y",
          "Z",
          "U",
          "V",
          "W",
          "q0",
          "q1",
          "q2",
          "q3",
        ];
        stateFields.forEach((field) => {
          const element = document.getElementById(field);
          if (!element.value || isNaN(element.value)) {
            showError(element, `Please enter a valid ${field} value.`);
            isValid = false;
          }
        });
      } else if (dataMethod.value === "launch") {
        // Validate launch fields based on vehicle type
        const launchFields =
          vehicleType.value === "ascend"
            ? [
                "lat",
                "long",
                "azimuth",
                "msl",
                "lp-height",
                "launch-angle",
                "roll",
                "pitch",
                "yaw",
              ]
            : [
                "lat-proj",
                "long-proj",
                "msl-proj",
                "azimuth-proj",
                "elevation",
                "launch-angle-proj",
                "initial-velocity",
              ];

        launchFields.forEach((field) => {
          const element = document.getElementById(field);
          if (!element.value || isNaN(element.value)) {
            showError(
              element,
              `Please enter a valid ${field.replace("-", " ")} value.`
            );
            isValid = false;
          }
        });
      }
    } else if (vehicleType.value === "orbital") {
      const orbitalMethod = document.querySelector(
        'input[name="orbital-method"]:checked'
      );
      if (!orbitalMethod) {
        showError(
          document.querySelector("#orbital-options .radio-group"),
          "Please select an orbital data type."
        );
        isValid = false;
      } else {
        // Validate orbital fields based on selected method
        if (orbitalMethod.value === "state") {
          const stateFields = [
            "X-orbital",
            "Y-orbital",
            "Z-orbital",
            "U-orbital",
            "V-orbital",
            "W-orbital",
            "q0-orbital",
            "q1-orbital",
            "q2-orbital",
            "q3-orbital",
          ];
          stateFields.forEach((field) => {
            const element = document.getElementById(field);
            if (!element.value || isNaN(element.value)) {
              showError(
                element,
                `Please enter a valid ${field.replace("-orbital", "")} value.`
              );
              isValid = false;
            }
          });
        } else if (orbitalMethod.value === "tle") {
          const tleFields = [
            "line1",
            "line2",
            "start-time",
            "stop-time",
            "step-time",
          ];
          tleFields.forEach((field) => {
            const element = document.getElementById(field);
            if (!element.value) {
              showError(
                element,
                `Please enter a valid ${field.replace("-", " ")}.`
              );
              isValid = false;
            }
          });
        } else if (orbitalMethod.value === "elements") {
          const elementFields = [
            "semi-major-axis",
            "eccentricity",
            "inclination",
            "argument-perigee",
            "raan",
            "true-anomaly",
          ];
          elementFields.forEach((field) => {
            const element = document.getElementById(field);
            if (!element.value || isNaN(element.value)) {
              showError(
                element,
                `Please enter a valid ${field.replace("-", " ")}.`
              );
              isValid = false;
            }
          });
        }
      }
    }

    return isValid;
  }

  function validateStageForm(stageForm, stageId) {
    let isValid = true;
    clearErrorMessages();

    // Get all the required input fields
    const structuralMass = stageForm.querySelector(
      'input[placeholder="Enter Structural Mass"]'
    );
    const referenceArea = stageForm.querySelector(
      'input[placeholder="Enter Reference Area"]'
    );
    const burnTime = stageForm.querySelector(
      'input[placeholder="Enter Burn Time"]'
    );
    const aeroFilename = stageForm.querySelector(`#aero-filename-${stageId}`);
    const burnTimeIdentifier = stageForm.querySelector(
      'input[value^="ST_"]:not([value$="_SEP"])'
    );
    const separationFlag = stageForm.querySelector(
      'input[value^="ST_"][value$="_SEP"]'
    );

    // Check if all required elements exist
    if (
      !structuralMass ||
      !referenceArea ||
      !burnTime ||
      !aeroFilename ||
      !burnTimeIdentifier ||
      !separationFlag
    ) {
      console.error("Missing critical elements in the stage form:", stageId);
      showError(
        stageForm,
        "Form structure error. Please check console for details."
      );
      isValid = false;
      return isValid;
    }

    // Validate Structural Mass
    if (
      !structuralMass.value ||
      isNaN(structuralMass.value) ||
      parseFloat(structuralMass.value) <= 0
    ) {
      showError(structuralMass, "Please enter a valid structural mass (>0).");
      isValid = false;
    }

    // Validate Reference Area
    if (
      !referenceArea.value ||
      isNaN(referenceArea.value) ||
      parseFloat(referenceArea.value) <= 0
    ) {
      showError(referenceArea, "Please enter a valid reference area (>0).");
      isValid = false;
    }

    // Validate Burn Time
    if (
      !burnTime.value ||
      isNaN(burnTime.value) ||
      parseFloat(burnTime.value) < 0
    ) {
      showError(burnTime, "Please enter a valid burn time (≥0).");
      isValid = false;
    }

    // Validate File (optional validation)
    if (!aeroFilename.value && aeroFilename.placeholder === "No file chosen") {
      // Make this a warning instead of an error if you want to make it optional
      console.warn("⚠️ No aero data file chosen for stage", stageId);
      // Uncomment below if you want to make it required
      // showError(aeroFilename, "Please upload an aero data file.");
      // isValid = false;
    }

    return isValid;
  }

  function validateMotorForm(motorForm) {
    let isValid = true;
    clearErrorMessages();

    // Get all required input fields
    const structuralMass = motorForm.querySelector(
      'input[placeholder="Enter Structural Mass"]'
    );
    const propulsionType = motorForm.querySelector("select");
    const propulsionMass = motorForm.querySelector(
      'input[placeholder="Enter Propulsion Mass"]'
    );
    const burnOutFlag = motorForm.querySelector('input[value="M1_Burnout"]');
    const cutOffFlag = motorForm.querySelector(
      'input[placeholder="Enter COF Value"]'
    );
    const nozzleDiameter = motorForm.querySelector(
      'input[placeholder="Enter Nozzle Diameter"]'
    );
    const burnTime = motorForm.querySelector(
      'input[placeholder="Enter Burn Time"]'
    );
    const thrustFilename = motorForm.querySelector(
      'input[id^="thrust-filename-"]'
    );

    // Check if all required elements exist
    if (
      !structuralMass ||
      !propulsionType ||
      !propulsionMass ||
      !burnOutFlag ||
      !cutOffFlag ||
      !nozzleDiameter ||
      !burnTime ||
      !thrustFilename
    ) {
      console.error("Missing required elements in the motor form");
      showError(
        motorForm,
        "Form structure error. Please check console for details."
      );
      isValid = false;
      return isValid;
    }

    // Validate Structural Mass
    if (
      !structuralMass.value ||
      isNaN(structuralMass.value) ||
      parseFloat(structuralMass.value) <= 0
    ) {
      showError(structuralMass, "Please enter a valid structural mass (>0).");
      isValid = false;
    }

    // Validate Propulsion Type
    if (!propulsionType.value || propulsionType.value === "") {
      showError(propulsionType, "Please select a propulsion type.");
      isValid = false;
    }

    // Validate Propulsion Mass
    if (
      !propulsionMass.value ||
      isNaN(propulsionMass.value) ||
      parseFloat(propulsionMass.value) <= 0
    ) {
      showError(propulsionMass, "Please enter a valid propulsion mass (>0).");
      isValid = false;
    }

    // Validate Cut Off Flag
    if (!cutOffFlag.value.trim()) {
      showError(cutOffFlag, "Please enter a cut off flag value.");
      isValid = false;
    }

    // Validate Nozzle Diameter
    if (
      !nozzleDiameter.value ||
      isNaN(nozzleDiameter.value) ||
      parseFloat(nozzleDiameter.value) <= 0
    ) {
      showError(nozzleDiameter, "Please enter a valid nozzle diameter (>0).");
      isValid = false;
    }

    // Validate Burn Time
    if (
      !burnTime.value ||
      isNaN(burnTime.value) ||
      parseFloat(burnTime.value) < 0
    ) {
      showError(burnTime, "Please enter a valid burn time (≥0).");
      isValid = false;
    }

    // Validate Thrust Time File (optional validation)
    if (
      !thrustFilename.value &&
      thrustFilename.placeholder === "No file chosen"
    ) {
      console.warn("⚠️ No thrust time file chosen");
      // Uncomment below if you want to make it required
      // showError(thrustFilename, "Please upload a thrust time file.");
      // isValid = false;
    }

    return isValid;
  }

  function validateNozzleForm(nozzleForm) {
    let isValid = true;
    clearErrorMessages();

    // Define validation rules for each section
    const validationFields = {
      // Nozzle Parameters
      nozzle_parameters: [
        {
          field: 'input[placeholder="Enter nozzle diameter"]',
          name: "Nozzle Diameter",
          min: 0,
        },
        {
          field: 'input[placeholder="Enter ETA thrust"]',
          name: "ETA Thrust",
          required: true,
        },
        {
          field: 'input[placeholder="Enter Zeta thrust"]',
          name: "Zeta Thrust",
          required: true,
        },
      ],
      // Location
      location: [
        {
          field: 'input[placeholder="Enter radial distance"]',
          name: "Radial Distance",
          min: 0,
        },
        {
          field: 'input[placeholder="Enter Phi value"]',
          name: "Phi",
          required: true,
        },
      ],
      // Miss Alignment
      miss_alignment: [
        {
          field: 'input[placeholder="Enter sigma thrust"]',
          name: "Sigma Thrust",
          required: true,
        },
        {
          field: 'input[placeholder="Enter thau thrust"]',
          name: "Thau Thrust",
          required: true,
        },
        {
          field: 'input[placeholder="Enter epsilon thrust"]',
          name: "Epsilon Thrust",
          required: true,
        },
      ],
      // Orientation
      orientation: [
        {
          field: 'input[placeholder="Enter MU value"]',
          name: "MU",
          required: true,
        },
        {
          field: 'input[placeholder="Enter LAMDA value"]',
          name: "LAMDA",
          required: true,
        },
        {
          field: 'input[placeholder="Enter KAPPA value"]',
          name: "KAPPA",
          required: true,
        },
      ],
      // Throat Location
      throat_location: [
        {
          field: 'input[placeholder="Enter X value"]',
          name: "X Coordinate",
          required: true,
        },
        {
          field: 'input[placeholder="Enter Y value"]',
          name: "Y Coordinate",
          required: true,
        },
        {
          field: 'input[placeholder="Enter Z value"]',
          name: "Z Coordinate",
          required: true,
        },
      ],
    };

    // Validate each section
    for (const [section, fields] of Object.entries(validationFields)) {
      for (const field of fields) {
        const input = nozzleForm.querySelector(field.field);

        if (!input) {
          console.error(`❌ Missing required element: ${field.name}`);
          showError(
            nozzleForm,
            `Form structure error: Missing ${field.name} field`
          );
          isValid = false;
          continue;
        }

        const value = input.value.trim();

        // Check if field is empty
        if (!value) {
          showError(input, `${field.name} is required.`);
          isValid = false;
          continue;
        }

        // Check if value is a valid number
        if (isNaN(value)) {
          showError(
            input,
            `Please enter a valid number for ${field.name.toLowerCase()}.`
          );
          isValid = false;
          continue;
        }

        // Check minimum value if specified
        if (field.min !== undefined && parseFloat(value) <= field.min) {
          showError(input, `${field.name} must be greater than ${field.min}.`);
          isValid = false;
        }
      }
    }

    return isValid;
  }

  // ========== DATA SAVING FUNCTIONS ========== //

  function saveMissionDetails() {
    const selectedStoppingCondition = document.querySelector(
      'input[name="stopping-condition"]:checked'
    )?.value;

    // Update form-based structure
    missionData = {
      mission_name: document.getElementById("mission-name").value.trim(),
      mode: document.getElementById("modes").value.toLowerCase(),
      tracking: document.getElementById("tracking").checked,
      date: document.getElementById("mission-date").value,
      time: document.getElementById("mission-time").value,
      stopping_condition: selectedStoppingCondition,
    };

    // Update the target JSON structure for mission details
    finalMissionData.mission.mission_name = missionData.mission_name;
    finalMissionData.mission.MODE = missionData.mode.toUpperCase();
    finalMissionData.mission.tracking_option = missionData.tracking
      ? "ON"
      : "OFF";
    finalMissionData.mission.UTC.Date = missionData.date;
    finalMissionData.mission.UTC.Time = missionData.time;

    // Update stopping criteria based on selected type
    if (selectedStoppingCondition) {
      switch (selectedStoppingCondition) {
        case "flag":
          const flagName = document.getElementById("flag-name").value;
          const flagValue = parseFloat(
            document.getElementById("flag-value").value
          );
          const flagCondition = document.getElementById("flag-condition").value;

          finalMissionData.stopping_criteria = {
            type: "Flag",
            flag_name: flagName || "Flag_7",
            value: flagValue || 0.1,
            condition: flagCondition.toUpperCase(),
          };
          break;

        case "time":
          const timeValue = parseFloat(
            document.getElementById("time-value").value
          );
          const timeCondition = document.getElementById("time-condition").value;

          finalMissionData.stopping_criteria = {
            type: "Time",
            value: timeValue || 0,
            condition: timeCondition.toUpperCase(),
          };
          break;

        case "altitude":
          const altValue = parseFloat(
            document.getElementById("altitude-value").value
          );
          const altCondition =
            document.getElementById("altitude-condition").value;

          finalMissionData.stopping_criteria = {
            type: "Altitude",
            value: altValue || 0,
            condition: altCondition.toUpperCase(),
          };
          break;
      }
    }

    // Only log the updated data
    console.log(
      "Updated Mission Data:",
      JSON.stringify(finalMissionData, null, 2)
    );

    return missionData;
  }

  function appendEnviroDetails() {
    const csvUpload = document.getElementById("csv-upload");
    const selectedPlanet = document.getElementById("planets").value;
    const windDataInput = document.getElementById("wind-data-input");

    // Update the form-based structure
    missionData.environment = {
      planet: selectedPlanet,
      atmospheric_model:
        document.getElementById("atmos-model").value !== "Environment"
          ? document.getElementById("atmos-model").value
          : null,
      gravity_parameters: {
        order: parseInt(document.getElementById("order").value),
        degree: parseInt(document.getElementById("degree").value),
      },
      coe_info: document.getElementById("core").value,
      atmospheric_model_csv:
        csvUpload.files.length > 0 ? csvUpload.files[0].name : null,
    };

    // Update the target JSON structure
    finalMissionData.mission.planet_name = selectedPlanet.toUpperCase();

    // Update EARTH section if it exists
    if (!finalMissionData.EARTH) {
      finalMissionData.EARTH = {
        atmos_model: missionData.environment.atmospheric_model || "atmos_POST",
        Gravity_param: {
          order: missionData.environment.gravity_parameters.order,
          degree: missionData.environment.gravity_parameters.degree,
        },
        coe_info: {
          component: missionData.environment.coe_info,
        },
      };
    }

    // Add wind data to EARTH section
    // First check if we have uploaded wind data
    if (missionData.environment.Wind) {
      // Use the uploaded wind data
      finalMissionData.EARTH.Wind = missionData.environment.Wind;
    } else if (!finalMissionData.EARTH.Wind) {
      // Only set default wind data if there's no existing wind data
      finalMissionData.EARTH.Wind = [
        ["Altitude", "Zonal", "Meridonal"],
        ["m", "m/s", "m/s"],
        [0.0, 0.0, 0.0],
        [60000.0, 0.0, 0.0],
        [90000.0, 0.0, 0.0],
        [150000.0, 0.0, 0.0],
        [400000.0, 0.0, 0.0],
      ];
    }
    // If neither condition is met, keep the existing wind data

    // Only log the updated data
    console.log(
      "Updated Environment Data:",
      JSON.stringify(finalMissionData, null, 2)
    );
  }

  function appendVehicleDetails() {
    const vehicleType = document.getElementById("vehicle-type").value;
    const vehicleName = document.getElementById("vehicle-name").value.trim();

    // Update form-based structure (for backward compatibility)
    let vehicleConfig = {
      vehicle_name: vehicleName,
      vehicle_type: vehicleType,
      payload: {
        name: document.getElementById("payload-name").value,
        mass: parseFloat(document.getElementById("payload-mass").value),
      },
      plf: {
        name: document.getElementById("plf-name").value,
        mass: parseFloat(document.getElementById("plf-mass").value),
        separation: {
          condition: document.querySelector(
            'input[name="plf-separation"]:checked'
          ).value,
          value: parseFloat(document.getElementById("plf-sep-value").value),
        },
      },
      integration: {
        method: document.getElementById("integration-method").value,
        time_step: parseFloat(document.getElementById("time-step").value),
      },
      effective_altitude: document.getElementById("effective-alt").value
        ? parseFloat(document.getElementById("effective-alt").value)
        : null,
    };

    // Update the target JSON structure
    if (!finalMissionData.SSPO.vehicle.includes(vehicleName)) {
      finalMissionData.SSPO.vehicle.push(vehicleName);
    }
    finalMissionData.SSPO.vehicle_type = vehicleType.toUpperCase();

    // Create or update vehicle-specific configuration
    if (!finalMissionData[vehicleName]) {
      finalMissionData[vehicleName] = {
        no_Stg: 0,
        stage: [],
        payload: document.getElementById("payload-name").value,
        plf: document.getElementById("plf-name").value,
        integration_method: document.getElementById("integration-method").value,
        time_step: parseFloat(document.getElementById("time-step").value),
        effective_altitude:
          parseFloat(document.getElementById("effective-alt").value) || 0,
        steering: `${vehicleName}_Steering`,
        sequence: `${vehicleName}_Sequence`,
        Initial_condition: "Location_1",
      };
    }

    // Create payload configuration if it doesn't exist
    const payloadName = vehicleConfig.payload.name;
    if (!finalMissionData[payloadName]) {
      finalMissionData[payloadName] = {
        unit: "kg",
        mass: vehicleConfig.payload.mass,
      };
    }

    // Create PLF configuration if it doesn't exist
    const plfName = vehicleConfig.plf.name;
    if (!finalMissionData[plfName]) {
      finalMissionData[plfName] = {
        mass_unit: "kg",
        mass: vehicleConfig.plf.mass,
        ref_area: 0.0,
        sep_flag: vehicleConfig.plf.separation.condition,
        descend_drag: null,
        DCISS: "OFF",
      };
    }

    // Add Initial_States structure if it doesn't exist
    if (!finalMissionData.Initial_States) {
      finalMissionData.Initial_States = {
        Location_1: {
          type: "Launch_Point",
          latitude_unit: "deg",
          latitude: parseFloat(document.getElementById("lat")?.value) || 0,
          longitude_unit: "deg",
          longitude: parseFloat(document.getElementById("long")?.value) || 0,
          azimuth_unit: "deg",
          azimuth: parseFloat(document.getElementById("azimuth")?.value) || 0,
          above_MSL_unit: "m",
          above_MSL: parseFloat(document.getElementById("msl")?.value) || 0,
          height_unit: "m",
          lp_height:
            parseFloat(document.getElementById("lp-height")?.value) || 0,
          launch_set_angle:
            parseFloat(document.getElementById("launch-angle")?.value) || 0,
          pitch: parseFloat(document.getElementById("pitch")?.value) || 0,
          roll: parseFloat(document.getElementById("roll")?.value) || 0,
          yaw: parseFloat(document.getElementById("yaw")?.value) || 0,
        },
      };
    }

    // Only log the updated data
    console.log(
      "Updated Vehicle Data:",
      JSON.stringify(finalMissionData, null, 2)
    );
  }

  function saveStageData(stageForm, stageId) {
    const stageNumber = stageId.replace("stage", "");
    const vehicleName = finalMissionData.SSPO.vehicle[0];

    if (!missionData.stages) {
      missionData.stages = [];
    }

    const structuralMassInput = stageForm.querySelector(
      'input[placeholder="Enter Structural Mass"]'
    );
    const referenceAreaInput = stageForm.querySelector(
      'input[placeholder="Enter Reference Area"]'
    );
    const burnTimeInput = stageForm.querySelector(
      'input[placeholder="Enter Burn Time"]'
    );
    const burnTimeIdentifierInput = stageForm.querySelector(
      'input[value^="ST_"]:not([value$="_SEP"])'
    );
    const separationFlagInput = stageForm.querySelector(
      'input[value^="ST_"][value$="_SEP"]'
    );
    const dcissToggle = stageForm.querySelector(`#dciss-toggle-${stageId}`);
    const coastingToggle = stageForm.querySelector(
      `#coasting-toggle-${stageId}`
    );
    const aeroFilename = stageForm.querySelector(`#aero-filename-${stageId}`);

    if (!structuralMassInput || !referenceAreaInput || !burnTimeInput) {
      console.error("Missing critical elements in the stage form:", stageId);
      return null;
    }

    const stageData = {
      stage_number: parseInt(stageNumber),
      structural_mass: parseFloat(structuralMassInput.value) || 0,
      reference_area: parseFloat(referenceAreaInput.value) || 0,
      burn_time: parseFloat(burnTimeInput.value) || 0,
      burn_time_identifier: burnTimeIdentifierInput
        ? burnTimeIdentifierInput.value
        : `ST_${stageNumber}`,
      separation_flag: separationFlagInput
        ? separationFlagInput.value
        : `ST_${stageNumber}_SEP`,
      dciss: dcissToggle ? dcissToggle.checked : false,
      coasting: coastingToggle ? coastingToggle.checked : false,
      aero_data_file: aeroFilename ? aeroFilename.value : "",
    };

    const existingStageIndex = missionData.stages.findIndex(
      (s) => s.stage_number === parseInt(stageNumber)
    );
    if (existingStageIndex >= 0) {
      missionData.stages[existingStageIndex] = stageData;
    } else {
      missionData.stages.push(stageData);
    }

    if (vehicleName) {
      finalMissionData[vehicleName].no_Stg = Math.max(
        parseInt(stageNumber),
        finalMissionData[vehicleName].no_Stg
      );

      const stageName = `Stage_${stageNumber}`;
      if (!finalMissionData[vehicleName].stage.includes(stageName)) {
        finalMissionData[vehicleName].stage.push(stageName);
      }

      // Update or create stage data
      finalMissionData[stageName] = {
        ...finalMissionData[stageName], // Preserve existing data
        structural_mass: stageData.structural_mass,
        ref_area: stageData.reference_area,
        burn_time: stageData.burn_time,
        burn_time_identifier: stageData.burn_time_identifier,
        separation_flag: stageData.separation_flag,
        DCISS: stageData.dciss ? "ON" : "OFF",
        coasting: stageData.coasting ? "ON" : "OFF",
        aero_data: stageData.aero_data_file,
        motors: finalMissionData[stageName]?.motors || [], // Preserve existing motors
      };
    }

    // Only log the updated data
    console.log(
      "Updated Stage Data:",
      JSON.stringify(finalMissionData, null, 2)
    );
    return stageData;
  }

  function saveMotorData(motorForm) {
    const formId = motorForm.id;
    const [stageId, motorId] = formId.split("-motor");
    const stageNumber = stageId.replace("stage", "");
    const motorNumber = motorId.split("-")[0];
    const stageName = `Stage_${stageNumber}`;
    const motorName = `Motor_${motorNumber}`;

    const structuralMass = motorForm.querySelector(
      'input[placeholder="Enter Structural Mass"]'
    );
    const propulsionType = motorForm.querySelector("select");
    const propulsionMass = motorForm.querySelector(
      'input[placeholder="Enter Propulsion Mass"]'
    );
    const burnOutFlag = motorForm.querySelector('input[value="M1_Burnout"]');
    const cutOffFlag = motorForm.querySelector(
      'input[placeholder="Enter COF Value"]'
    );
    const separationFlag = motorForm.querySelector('input[value="ST_1_SEP"]');
    const ignitionFlag = motorForm.querySelector('input[value="M1_IGN"]');
    const nozzleDiameter = motorForm.querySelector(
      'input[placeholder="Enter Nozzle Diameter"]'
    );
    const burnTime = motorForm.querySelector(
      'input[placeholder="Enter Burn Time"]'
    );
    const thrustFilename = motorForm.querySelector(
      'input[id^="thrust-filename-"]'
    );

    const motorData = {
      motor_number: parseInt(motorNumber),
      structural_mass: parseFloat(structuralMass.value) || 0,
      propulsion: {
        type: propulsionType.value,
        mass: parseFloat(propulsionMass.value) || 0,
      },
      flags: {
        burnout: burnOutFlag.value,
        cutoff: cutOffFlag.value,
        separation: separationFlag.value,
        ignition: ignitionFlag.value,
      },
      nozzle_diameter: parseFloat(nozzleDiameter.value) || 0,
      burn_time: parseFloat(burnTime.value) || 0,
      thrust_data_file: thrustFilename.value || "",
    };

    if (!missionData.stages) {
      missionData.stages = [];
    }

    const stage = missionData.stages.find(
      (s) => s.stage_number === parseInt(stageNumber)
    );
    if (stage) {
      if (!stage.motors) {
        stage.motors = [];
      }
      const existingMotorIndex = stage.motors.findIndex(
        (m) => m.motor_number === parseInt(motorNumber)
      );
      if (existingMotorIndex >= 0) {
        stage.motors[existingMotorIndex] = motorData;
      } else {
        stage.motors.push(motorData);
      }
    }

    if (finalMissionData[stageName]) {
      if (!finalMissionData[stageName].motors.includes(motorName)) {
        finalMissionData[stageName].motors.push(motorName);
      }

      // Update or create motor data
      finalMissionData[motorName] = {
        ...finalMissionData[motorName], // Preserve existing data
        structural_mass: motorData.structural_mass,
        propulsion: {
          type: motorData.propulsion.type,
          mass: motorData.propulsion.mass,
        },
        flags: {
          burnout: motorData.flags.burnout,
          cutoff: motorData.flags.cutoff,
          separation: motorData.flags.separation,
          ignition: motorData.flags.ignition,
        },
        nozzle_diameter: motorData.nozzle_diameter,
        burn_time: motorData.burn_time,
        thrust_data: motorData.thrust_data_file,
        nozzles: finalMissionData[motorName]?.nozzles || [], // Preserve existing nozzles
      };
    }

    // Only log the updated data
    console.log(
      "Updated Motor Data:",
      JSON.stringify(finalMissionData, null, 2)
    );
    return motorData;
  }

  function saveNozzleData(nozzleForm) {
    const formId = nozzleForm.id;
    const [stageId, motorPart] = formId.split("-motor");
    const motorNumber = motorPart.split("-")[0];
    const stageNumber = stageId.replace("stage", "");
    const stageName = `Stage_${stageNumber}`;
    const motorName = `Motor_${motorNumber}`;
    const nozzleName = `noz_${motorNumber}`;

    const nozzleData = {
      nozzle_number: 1,
      parameters: {
        diameter:
          parseFloat(
            nozzleForm.querySelector(
              'input[placeholder="Enter nozzle diameter"]'
            ).value
          ) || 0,
        eta_thrust:
          parseFloat(
            nozzleForm.querySelector('input[placeholder="Enter ETA thrust"]')
              .value
          ) || 0,
        zeta_thrust:
          parseFloat(
            nozzleForm.querySelector('input[placeholder="Enter Zeta thrust"]')
              .value
          ) || 0,
      },
      location: {
        radial_distance:
          parseFloat(
            nozzleForm.querySelector(
              'input[placeholder="Enter radial distance"]'
            ).value
          ) || 0,
        phi:
          parseFloat(
            nozzleForm.querySelector('input[placeholder="Enter Phi value"]')
              .value
          ) || 0,
      },
      miss_alignment: {
        sigma_thrust:
          parseFloat(
            nozzleForm.querySelector('input[placeholder="Enter sigma thrust"]')
              .value
          ) || 0,
        thau_thrust:
          parseFloat(
            nozzleForm.querySelector('input[placeholder="Enter thau thrust"]')
              .value
          ) || 0,
        epsilon_thrust:
          parseFloat(
            nozzleForm.querySelector(
              'input[placeholder="Enter epsilon thrust"]'
            ).value
          ) || 0,
      },
      orientation: {
        mu:
          parseFloat(
            nozzleForm.querySelector('input[placeholder="Enter MU value"]')
              .value
          ) || 0,
        lamda:
          parseFloat(
            nozzleForm.querySelector('input[placeholder="Enter LAMDA value"]')
              .value
          ) || 0,
        kappa:
          parseFloat(
            nozzleForm.querySelector('input[placeholder="Enter KAPPA value"]')
              .value
          ) || 0,
      },
      throat_location: {
        x:
          parseFloat(
            nozzleForm.querySelector('input[placeholder="Enter X value"]').value
          ) || 0,
        y:
          parseFloat(
            nozzleForm.querySelector('input[placeholder="Enter Y value"]').value
          ) || 0,
        z:
          parseFloat(
            nozzleForm.querySelector('input[placeholder="Enter Z value"]').value
          ) || 0,
      },
    };

    const stage = missionData.stages?.find(
      (s) => s.stage_number === parseInt(stageNumber)
    );
    if (stage) {
      const motor = stage.motors?.find(
        (m) => m.motor_number === parseInt(motorNumber)
      );
      if (motor) {
        if (!motor.nozzles) {
          motor.nozzles = [];
        }
        const existingNozzleIndex = motor.nozzles.findIndex(
          (n) => n.nozzle_number === nozzleData.nozzle_number
        );
        if (existingNozzleIndex >= 0) {
          motor.nozzles[existingNozzleIndex] = nozzleData;
        } else {
          motor.nozzles.push(nozzleData);
        }
      }
    }

    if (finalMissionData[motorName]) {
      if (!finalMissionData[motorName].nozzles.includes(nozzleName)) {
        finalMissionData[motorName].nozzles.push(nozzleName);
      }

      // Update or create nozzle data
      finalMissionData[nozzleName] = {
        ...finalMissionData[nozzleName], // Preserve existing data
        Diameter: nozzleData.parameters.diameter,
        Location: {
          Radial_dist: nozzleData.location.radial_distance,
          Phi: nozzleData.location.phi,
        },
        mis_alignment: {
          sigma_thrust: nozzleData.miss_alignment.sigma_thrust,
          tau_thrust: nozzleData.miss_alignment.thau_thrust,
          epsilon_thurst: nozzleData.miss_alignment.epsilon_thrust,
        },
        Orientation: {
          mu: nozzleData.orientation.mu,
          lamda: nozzleData.orientation.lamda,
          kappa: nozzleData.orientation.kappa,
        },
        eta_thrust: nozzleData.parameters.eta_thrust,
        zeta_thrust: nozzleData.parameters.zeta_thrust,
        Throat_location: {
          x: nozzleData.throat_location.x,
          y: nozzleData.throat_location.y,
          z: nozzleData.throat_location.z,
        },
      };
    }

    // Log only the final consolidated JSON structure
    console.log(JSON.stringify(finalMissionData, null, 2));
    return nozzleData;
  }

  function saveSequenceData() {
    const vehicleName = document.getElementById("vehicle-name").value.trim();
    const eventList = document.getElementById("event-list");
    const events = eventList.querySelectorAll(".event-item");

    // Create an object with the vehicle name as the key
    const sequenceData = {
      [`${vehicleName}_Sequence`]: [],
    };

    events.forEach((eventItem) => {
      // Extract event info
      const eventInfo = eventItem.querySelector(".event-info").textContent;
      const flag = eventInfo.split("|")[0].split(":")[1].trim();
      const triggerInfo = eventInfo.split("|")[1].trim();
      const trigger = triggerInfo
        .split("at")[0]
        .replace("Trigger:", "")
        .trim()
        .toUpperCase()
        .replace("-", "_"); // Replace hyphen with underscore
      const triggerValue = parseFloat(
        triggerInfo.split("at")[1].split("|")[0].trim()
      );

      // Get dependent event if it exists
      let reference = "none";
      if (eventInfo.includes("Depends on:")) {
        reference = eventInfo.split("Depends on:")[1].split("|")[0].trim();
      }

      // Get comment if it exists
      let comment = "";
      if (eventInfo.includes("Comment:")) {
        comment = eventInfo.split("Comment:")[1].trim();
      }

      // Create event object in the required format
      const eventObject = {
        identity: flag,
        trigger: trigger,
        value: triggerValue,
        reference: reference,
        comment: comment,
      };

      sequenceData[`${vehicleName}_Sequence`].push(eventObject);
    });

    // Update the finalMissionData with the sequence data
    finalMissionData[`${vehicleName}_Sequence`] =
      sequenceData[`${vehicleName}_Sequence`];

    // Log the sequence data in the desired format
    console.log(JSON.stringify(sequenceData, null, 2));
  }

  // ========== HELPER FUNCTIONS ========== //

  function showError(inputElement, message) {
    const errorMsg = document.createElement("span");
    errorMsg.classList.add("error-message");
    errorMsg.style.color = "red";
    errorMsg.style.fontSize = "12px";
    errorMsg.textContent = message;
    inputElement.parentNode.appendChild(errorMsg);
  }

  function clearErrorMessages() {
    document.querySelectorAll(".error-message").forEach((el) => el.remove());
  }
});

function showForm(form) {
  if (!form) {
    console.error("Form not found!");
    return;
  }

  document
    .querySelectorAll("form")
    .forEach((f) => f.classList.add("hidden-form"));
  form.classList.remove("hidden-form");
}
