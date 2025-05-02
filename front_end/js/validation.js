// Form validation utilities
class FormValidator {
  static showError(field, message) {
    // Remove any existing error message
    this.removeError(field);

    // Create and add error message
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.style.color = "#ff3333";
    errorDiv.style.fontSize = "12px";
    errorDiv.style.marginTop = "4px";
    errorDiv.textContent = message;

    // Insert error message after the field
    field.parentNode.appendChild(errorDiv);

    // Add error styling to the input
    field.style.borderColor = "#ff3333";
  }

  static removeError(field) {
    // Remove error styling
    field.style.borderColor = "";

    // Remove error message if it exists
    const errorDiv = field.parentNode.querySelector(".error-message");
    if (errorDiv) {
      errorDiv.remove();
    }
  }

  static validateMissionForm() {
    let isValid = true;
    const errors = [];

    // Mission Name validation
    const missionName = document.getElementById("mission-name");
    if (!missionName.value.trim()) {
      this.showError(missionName, "Mission name is required");
      isValid = false;
      errors.push("Mission name is required");
    } else if (missionName.value.trim().length < 3) {
      this.showError(
        missionName,
        "Mission name must be at least 3 characters long"
      );
      isValid = false;
      errors.push("Mission name must be at least 3 characters long");
    } else {
      this.removeError(missionName);
    }

    // Mode validation
    const mode = document.getElementById("modes");
    if (mode.value === "Mode" || !mode.value) {
      this.showError(mode, "Please select a mode");
      isValid = false;
      errors.push("Mode selection is required");
    } else {
      this.removeError(mode);
    }

    // Date validation - only check if it's filled
    const date = document.getElementById("mission-date");
    if (!date.value) {
      this.showError(date, "Mission date is required");
      isValid = false;
      errors.push("Mission date is required");
    } else {
      this.removeError(date);
    }

    // Time validation - only check if it's filled
    const time = document.getElementById("mission-time");
    if (!time.value) {
      this.showError(time, "Mission time is required");
      isValid = false;
      errors.push("Mission time is required");
    } else {
      this.removeError(time);
    }

    return {
      isValid,
      errors,
    };
  }

  static validateOnInput(field, validationFn) {
    // Add step="any" to numeric inputs to prevent browser validation messages
    if (field.type === "number") {
      field.setAttribute("step", "any");
    }

    field.addEventListener("input", () => {
      validationFn(field);
    });

    field.addEventListener("blur", () => {
      validationFn(field);
    });
  }

  static initializeMissionFormValidation() {
    // Add real-time validation for mission name
    const missionName = document.getElementById("mission-name");
    this.validateOnInput(missionName, (field) => {
      if (!field.value.trim()) {
        this.showError(field, "Mission name is required");
      } else if (field.value.trim().length < 3) {
        this.showError(
          field,
          "Mission name must be at least 3 characters long"
        );
      } else {
        this.removeError(field);
      }
    });

    // Add real-time validation for mode
    const mode = document.getElementById("modes");
    this.validateOnInput(mode, (field) => {
      if (field.value === "Mode" || !field.value) {
        this.showError(field, "Please select a mode");
      } else {
        this.removeError(field);
      }
    });

    // Add real-time validation for date - only required field check
    const date = document.getElementById("mission-date");
    this.validateOnInput(date, (field) => {
      if (!field.value) {
        this.showError(field, "Mission date is required");
      } else {
        this.removeError(field);
      }
    });

    // Add real-time validation for time - only required field check
    const time = document.getElementById("mission-time");
    this.validateOnInput(time, (field) => {
      if (!field.value) {
        this.showError(field, "Mission time is required");
      } else {
        this.removeError(field);
      }
    });
  }

  static validateEnvironmentForm() {
    let isValid = true;
    const errors = [];

    // Planet validation
    const planet = document.getElementById("planets");
    if (planet.value === "Environment" || !planet.value) {
      this.showError(planet, "Please select a planet");
      isValid = false;
      errors.push("Planet selection is required");
    } else {
      this.removeError(planet);
    }

    // Atmospheric Model validation
    const atmosModel = document.getElementById("atmos-model");
    const csvUpload = document.getElementById("csv-upload");
    const hasModelSelected = atmosModel.value !== "Environment";
    const hasFileUploaded = csvUpload.files.length > 0;

    if (!hasModelSelected && !hasFileUploaded) {
      this.showError(atmosModel, "Please select a model or upload a CSV file");
      isValid = false;
      errors.push("Either select an atmospheric model or upload a CSV file");
    } else {
      this.removeError(atmosModel);
    }

    // Gravity Parameters validation
    const order = document.getElementById("order");
    const degree = document.getElementById("degree");

    if (!order.value) {
      this.showError(order, "Order is required");
      isValid = false;
      errors.push("Gravity parameter order is required");
    } else {
      this.removeError(order);
    }

    if (!degree.value) {
      this.showError(degree, "Degree is required");
      isValid = false;
      errors.push("Gravity parameter degree is required");
    } else {
      this.removeError(degree);
    }

    // Core Info validation
    const core = document.getElementById("core");
    if (core.value === "choose_core" || !core.value) {
      this.showError(core, "Please select a COE info model");
      isValid = false;
      errors.push("COE info model selection is required");
    } else {
      this.removeError(core);
    }

    return {
      isValid,
      errors,
    };
  }

  static initializeEnvironmentFormValidation() {
    // Planet validation
    const planet = document.getElementById("planets");
    this.validateOnInput(planet, (field) => {
      if (field.value === "Environment" || !field.value) {
        this.showError(field, "Please select a planet");
      } else {
        this.removeError(field);
      }
    });

    // Atmospheric Model and CSV mutual exclusion
    const atmosModel = document.getElementById("atmos-model");
    const csvUpload = document.getElementById("csv-upload");
    const csvUploadBtn = document.getElementById("csv-upload-btn");

    // When model is selected
    atmosModel.addEventListener("change", () => {
      if (atmosModel.value !== "Environment") {
        csvUpload.disabled = true;
        csvUploadBtn.style.opacity = "0.5";
        csvUploadBtn.style.cursor = "not-allowed";
        this.removeError(atmosModel);
      } else {
        csvUpload.disabled = false;
        csvUploadBtn.style.opacity = "1";
        csvUploadBtn.style.cursor = "pointer";
      }
    });

    // When CSV is uploaded
    csvUpload.addEventListener("change", () => {
      if (csvUpload.files.length > 0) {
        atmosModel.disabled = true;
        atmosModel.style.opacity = "0.5";
        this.removeError(atmosModel);
      } else {
        atmosModel.disabled = false;
        atmosModel.style.opacity = "1";
      }
    });

    // Gravity Parameters validation
    const order = document.getElementById("order");
    this.validateOnInput(order, (field) => {
      if (!field.value) {
        this.showError(field, "Order is required");
      } else {
        this.removeError(field);
      }
    });

    const degree = document.getElementById("degree");
    this.validateOnInput(degree, (field) => {
      if (!field.value) {
        this.showError(field, "Degree is required");
      } else {
        this.removeError(field);
      }
    });

    // Core Info validation
    const core = document.getElementById("core");
    this.validateOnInput(core, (field) => {
      if (field.value === "choose_core" || !field.value) {
        this.showError(field, "Please select a COE info model");
      } else {
        this.removeError(field);
      }
    });
  }

  static validateVehicleForm() {
    let isValid = true;
    const errors = [];
    const vehicleType = document.getElementById("vehicle-type").value;

    // Basic vehicle validation
    const vehicleName = document.getElementById("vehicle-name");
    if (!vehicleName.value.trim()) {
      this.showError(vehicleName, "Vehicle name is required");
      isValid = false;
      errors.push("Vehicle name is required");
    } else {
      this.removeError(vehicleName);
    }

    // Vehicle Type validation
    const vehicleTypeSelect = document.getElementById("vehicle-type");
    if (!vehicleTypeSelect.value || vehicleTypeSelect.value === "") {
      this.showError(vehicleTypeSelect, "Please select a vehicle type");
      isValid = false;
      errors.push("Vehicle type selection is required");
    } else {
      this.removeError(vehicleTypeSelect);
    }

    // Validate dynamic fields based on vehicle type
    if (vehicleType === "ascend" || vehicleType === "projectile") {
      const dataMethod = document.querySelector(
        'input[name="data-method"]:checked'
      );

      if (!dataMethod) {
        const dataOptions = document.getElementById("data-options");
        if (dataOptions) {
          this.showError(
            dataOptions,
            "Please select either States or Launch Point Data"
          );
          isValid = false;
          errors.push("Data input method selection is required");
        }
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
          const input = document.getElementById(field);
          if (input && (!input.value || isNaN(parseFloat(input.value)))) {
            this.showError(input, `Please enter a valid value for ${field}`);
            isValid = false;
            errors.push(`Valid ${field} value is required`);
          } else if (input) {
            this.removeError(input);
          }
        });
      } else if (dataMethod.value === "launch") {
        if (vehicleType === "ascend") {
          // Validate ASCEND launch point fields
          const ascendFields = {
            lat: "Latitude",
            long: "Longitude",
            azimuth: "Azimuth",
            msl: "MSL",
            "lp-height": "LP Height",
            "launch-angle": "Launch Set Angle",
            roll: "Initial Roll",
            pitch: "Initial Pitch",
            yaw: "Initial Yaw",
          };

          Object.entries(ascendFields).forEach(([id, label]) => {
            const input = document.getElementById(id);
            if (input && (!input.value || isNaN(parseFloat(input.value)))) {
              this.showError(input, `Please enter a valid ${label}`);
              isValid = false;
              errors.push(`Valid ${label} is required`);
            } else if (input) {
              this.removeError(input);
            }
          });
        } else if (vehicleType === "projectile") {
          // Validate PROJECTILE launch point fields
          const projectileFields = {
            "lat-proj": "Latitude",
            "long-proj": "Longitude",
            "msl-proj": "MSL",
            "azimuth-proj": "Azimuth",
            elevation: "Elevation",
            "launch-angle-proj": "Launch Set Angle",
            "initial-velocity": "Initial Velocity",
          };

          Object.entries(projectileFields).forEach(([id, label]) => {
            const input = document.getElementById(id);
            if (input && (!input.value || isNaN(parseFloat(input.value)))) {
              this.showError(input, `Please enter a valid ${label}`);
              isValid = false;
              errors.push(`Valid ${label} is required`);
            } else if (input) {
              this.removeError(input);
            }
          });
        }
      }
    } else if (vehicleType === "orbital") {
      const orbitalMethod = document.querySelector(
        'input[name="orbital-method"]:checked'
      );

      if (!orbitalMethod) {
        const orbitalOptions = document.getElementById("orbital-options");
        if (orbitalOptions) {
          this.showError(orbitalOptions, "Please select an orbital data type");
          isValid = false;
          errors.push("Orbital data type selection is required");
        }
      } else {
        switch (orbitalMethod.value) {
          case "state":
            // Validate orbital state fields
            const orbitalStateFields = [
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
            orbitalStateFields.forEach((field) => {
              const input = document.getElementById(field);
              if (input && (!input.value || isNaN(parseFloat(input.value)))) {
                this.showError(
                  input,
                  `Please enter a valid value for ${field.replace(
                    "-orbital",
                    ""
                  )}`
                );
                isValid = false;
                errors.push(
                  `Valid ${field.replace("-orbital", "")} value is required`
                );
              } else if (input) {
                this.removeError(input);
              }
            });
            break;

          case "tle":
            // Validate TLE fields
            const tleFields = {
              line1: "Line 1",
              line2: "Line 2",
              "start-time": "Start Time",
              "stop-time": "Stop Time",
              "step-time": "Step Time",
            };

            Object.entries(tleFields).forEach(([id, label]) => {
              const input = document.getElementById(id);
              if (input) {
                if (id === "line1" || id === "line2") {
                  if (!input.value.trim()) {
                    this.showError(input, `Please enter ${label}`);
                    isValid = false;
                    errors.push(`${label} is required`);
                  } else {
                    this.removeError(input);
                  }
                } else if (!input.value || isNaN(parseFloat(input.value))) {
                  this.showError(input, `Please enter a valid ${label}`);
                  isValid = false;
                  errors.push(`Valid ${label} is required`);
                } else {
                  this.removeError(input);
                }
              }
            });
            break;

          case "elements":
            // Validate orbital elements fields
            const elementFields = {
              "semi-major-axis": "Semi Major Axis",
              eccentricity: "Eccentricity",
              inclination: "Inclination",
              "argument-perigee": "Argument of Perigee",
              raan: "RAAN",
              "true-anomaly": "True Anomaly",
            };

            Object.entries(elementFields).forEach(([id, label]) => {
              const input = document.getElementById(id);
              if (input && (!input.value || isNaN(parseFloat(input.value)))) {
                this.showError(input, `Please enter a valid ${label}`);
                isValid = false;
                errors.push(`Valid ${label} is required`);
              } else if (input) {
                this.removeError(input);
              }
            });
            break;
        }
      }
    }

    // Payload and PLF validation
    const payloadMass = document.getElementById("payload-mass");
    if (!payloadMass.value || payloadMass.value <= 0) {
      this.showError(payloadMass, "Please enter a valid payload mass");
      isValid = false;
      errors.push("Valid payload mass is required");
    } else {
      this.removeError(payloadMass);
    }

    const plfMass = document.getElementById("plf-mass");
    if (!plfMass.value || plfMass.value <= 0) {
      this.showError(plfMass, "Please enter a valid PLF mass");
      isValid = false;
      errors.push("Valid PLF mass is required");
    } else {
      this.removeError(plfMass);
    }

    const plfSepValue = document.getElementById("plf-sep-value");
    if (!plfSepValue.value || plfSepValue.value <= 0) {
      this.showError(plfSepValue, "Please enter a valid separation value");
      isValid = false;
      errors.push("Valid separation value is required");
    } else {
      this.removeError(plfSepValue);
    }

    // Integration method validation
    const integrationMethod = document.getElementById("integration-method");
    if (!integrationMethod.value || integrationMethod.value === "") {
      this.showError(integrationMethod, "Please select an integration method");
      isValid = false;
      errors.push("Integration method selection is required");
    } else {
      this.removeError(integrationMethod);
    }

    const timeStep = document.getElementById("time-step");
    if (!timeStep.value || timeStep.value <= 0) {
      this.showError(timeStep, "Please enter a valid time step");
      isValid = false;
      errors.push("Valid time step is required");
    } else {
      this.removeError(timeStep);
    }

    const effectiveAlt = document.getElementById("effective-alt");
    if (!effectiveAlt.value || effectiveAlt.value < 0) {
      this.showError(effectiveAlt, "Please enter a valid effective altitude");
      isValid = false;
      errors.push("Valid effective altitude is required");
    } else {
      this.removeError(effectiveAlt);
    }

    return {
      isValid,
      errors,
    };
  }

  static initializeVehicleFormValidation() {
    // Vehicle Name validation
    const vehicleName = document.getElementById("vehicle-name");
    this.validateOnInput(vehicleName, (field) => {
      if (!field.value.trim()) {
        this.showError(field, "Vehicle name is required");
      } else {
        this.removeError(field);
      }
    });

    // Vehicle Type validation and dynamic field initialization
    const vehicleType = document.getElementById("vehicle-type");
    this.validateOnInput(vehicleType, (field) => {
      if (!field.value || field.value === "") {
        this.showError(field, "Please select a vehicle type");
      } else {
        this.removeError(field);
        // Initialize validation for dynamic fields after a short delay
        setTimeout(() => {
          this.initializeDynamicFieldValidation(field.value);
        }, 100);
      }
    });

    // Payload Mass validation
    const payloadMass = document.getElementById("payload-mass");
    this.validateOnInput(payloadMass, (field) => {
      if (!field.value || field.value <= 0) {
        this.showError(field, "Please enter a valid payload mass");
      } else {
        this.removeError(field);
      }
    });

    // PLF Mass validation
    const plfMass = document.getElementById("plf-mass");
    this.validateOnInput(plfMass, (field) => {
      if (!field.value || field.value <= 0) {
        this.showError(field, "Please enter a valid PLF mass");
      } else {
        this.removeError(field);
      }
    });

    // PLF Separation Value validation
    const plfSepValue = document.getElementById("plf-sep-value");
    this.validateOnInput(plfSepValue, (field) => {
      if (!field.value || field.value <= 0) {
        this.showError(field, "Please enter a valid separation value");
      } else {
        this.removeError(field);
      }
    });

    // Integration Method validation
    const integrationMethod = document.getElementById("integration-method");
    this.validateOnInput(integrationMethod, (field) => {
      if (!field.value || field.value === "") {
        this.showError(field, "Please select an integration method");
      } else {
        this.removeError(field);
      }
    });

    // Time Step validation
    const timeStep = document.getElementById("time-step");
    this.validateOnInput(timeStep, (field) => {
      if (!field.value || field.value <= 0) {
        this.showError(field, "Please enter a valid time step");
      } else {
        this.removeError(field);
      }
    });

    // Effective Altitude validation
    const effectiveAlt = document.getElementById("effective-alt");
    this.validateOnInput(effectiveAlt, (field) => {
      if (!field.value || field.value < 0) {
        this.showError(field, "Please enter a valid effective altitude");
      } else {
        this.removeError(field);
      }
    });
  }

  static initializeDynamicFieldValidation(vehicleType) {
    // Add validation for data method selection
    const dataMethodRadios = document.querySelectorAll(
      'input[name="data-method"]'
    );
    dataMethodRadios.forEach((radio) => {
      radio.addEventListener("change", () => {
        const dataOptions = document.getElementById("data-options");
        if (dataOptions) {
          this.removeError(dataOptions);
        }
        // Initialize validation for the selected data type fields
        setTimeout(() => {
          if (radio.value === "states") {
            this.initializeStateFieldsValidation();
          } else if (radio.value === "launch") {
            this.initializeLaunchFieldsValidation(vehicleType);
          }
        }, 100);
      });
    });

    // Add validation for orbital method selection
    const orbitalMethodRadios = document.querySelectorAll(
      'input[name="orbital-method"]'
    );
    orbitalMethodRadios.forEach((radio) => {
      radio.addEventListener("change", () => {
        const orbitalOptions = document.getElementById("orbital-options");
        if (orbitalOptions) {
          this.removeError(orbitalOptions);
        }
        // Initialize validation for the selected orbital type fields
        setTimeout(() => {
          if (radio.value === "state") {
            this.initializeOrbitalStateValidation();
          } else if (radio.value === "tle") {
            this.initializeTLEValidation();
          } else if (radio.value === "elements") {
            this.initializeElementsValidation();
          }
        }, 100);
      });
    });
  }

  static initializeStateFieldsValidation() {
    const stateFields = ["X", "Y", "Z", "U", "V", "W", "q0", "q1", "q2", "q3"];
    stateFields.forEach((field) => {
      const input = document.getElementById(field);
      if (input) {
        this.validateOnInput(input, (field) => {
          if (!field.value || isNaN(parseFloat(field.value))) {
            this.showError(field, `Please enter a valid value for ${field.id}`);
          } else {
            this.removeError(field);
          }
        });
      }
    });
  }

  static initializeLaunchFieldsValidation(vehicleType) {
    if (vehicleType === "ascend") {
      const ascendFields = [
        "lat",
        "long",
        "azimuth",
        "msl",
        "lp-height",
        "launch-angle",
        "roll",
        "pitch",
        "yaw",
      ];
      ascendFields.forEach((field) => {
        const input = document.getElementById(field);
        if (input) {
          this.validateOnInput(input, (field) => {
            if (!field.value || isNaN(parseFloat(field.value))) {
              this.showError(
                field,
                `Please enter a valid ${field.id.replace("-", " ")}`
              );
            } else {
              this.removeError(field);
            }
          });
        }
      });
    } else if (vehicleType === "projectile") {
      const projectileFields = [
        "lat-proj",
        "long-proj",
        "msl-proj",
        "azimuth-proj",
        "elevation",
        "launch-angle-proj",
        "initial-velocity",
      ];
      projectileFields.forEach((field) => {
        const input = document.getElementById(field);
        if (input) {
          this.validateOnInput(input, (field) => {
            if (!field.value || isNaN(parseFloat(field.value))) {
              this.showError(
                field,
                `Please enter a valid ${field.id
                  .replace("-proj", "")
                  .replace("-", " ")}`
              );
            } else {
              this.removeError(field);
            }
          });
        }
      });
    }
  }

  static initializeOrbitalStateValidation() {
    const orbitalStateFields = [
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
    orbitalStateFields.forEach((field) => {
      const input = document.getElementById(field);
      if (input) {
        this.validateOnInput(input, (field) => {
          if (!field.value || isNaN(parseFloat(field.value))) {
            this.showError(
              field,
              `Please enter a valid ${field.id.replace("-orbital", "")}`
            );
          } else {
            this.removeError(field);
          }
        });
      }
    });
  }

  static initializeTLEValidation() {
    const tleFields = [
      "line1",
      "line2",
      "start-time",
      "stop-time",
      "step-time",
    ];
    tleFields.forEach((field) => {
      const input = document.getElementById(field);
      if (input) {
        this.validateOnInput(input, (field) => {
          if (field.id === "line1" || field.id === "line2") {
            if (!field.value.trim()) {
              this.showError(field, `Please enter ${field.id}`);
            } else {
              this.removeError(field);
            }
          } else if (!field.value || isNaN(parseFloat(field.value))) {
            this.showError(
              field,
              `Please enter a valid ${field.id.replace("-", " ")}`
            );
          } else {
            this.removeError(field);
          }
        });
      }
    });
  }

  static initializeElementsValidation() {
    const elementFields = [
      "semi-major-axis",
      "eccentricity",
      "inclination",
      "argument-perigee",
      "raan",
      "true-anomaly",
    ];
    elementFields.forEach((field) => {
      const input = document.getElementById(field);
      if (input) {
        this.validateOnInput(input, (field) => {
          if (!field.value || isNaN(parseFloat(field.value))) {
            this.showError(
              field,
              `Please enter a valid ${field.id.replace("-", " ")}`
            );
          } else {
            this.removeError(field);
          }
        });
      }
    });
  }

  static validateSequenceForm() {
    let isValid = true;
    const errors = [];

    // Event Flag validation
    const eventFlag = document.getElementById("event-flag");
    if (!eventFlag.value) {
      this.showError(eventFlag, "Event flag is required");
      isValid = false;
      errors.push("Event flag is required");
    } else {
      this.removeError(eventFlag);
    }

    // Trigger Type validation
    const triggerType = document.getElementById("trigger-type");
    if (!triggerType.value || triggerType.value === "") {
      this.showError(triggerType, "Please select a trigger type");
      isValid = false;
      errors.push("Trigger type selection is required");
    } else {
      this.removeError(triggerType);
    }

    // Trigger Value validation
    const triggerValue = document.getElementById("trigger-value");
    if (!triggerValue.value || isNaN(parseFloat(triggerValue.value))) {
      this.showError(triggerValue, "Please enter a valid trigger value");
      isValid = false;
      errors.push("Valid trigger value is required");
    } else {
      this.removeError(triggerValue);
    }

    // Reference Flag validation (optional)
    const referenceFlag = document.getElementById("dependent-event");
    if (referenceFlag.value === "") {
      this.showError(referenceFlag, "Please select a reference flag");
      isValid = false;
      errors.push("Reference flag selection is required");
    } else {
      this.removeError(referenceFlag);
    }

    return {
      isValid,
      errors,
    };
  }

  static initializeSequenceFormValidation() {
    // Event Flag validation
    const eventFlag = document.getElementById("event-flag");
    this.validateOnInput(eventFlag, (field) => {
      if (!field.value) {
        this.showError(field, "Event flag is required");
      } else {
        this.removeError(field);
      }
    });

    // Trigger Type validation
    const triggerType = document.getElementById("trigger-type");
    this.validateOnInput(triggerType, (field) => {
      if (!field.value || field.value === "") {
        this.showError(field, "Please select a trigger type");
      } else {
        this.removeError(field);
      }
    });

    // Trigger Value validation
    const triggerValue = document.getElementById("trigger-value");
    this.validateOnInput(triggerValue, (field) => {
      if (!field.value || isNaN(parseFloat(field.value))) {
        this.showError(field, "Please enter a valid trigger value");
      } else {
        this.removeError(field);
      }
    });

    // Reference Flag validation
    const referenceFlag = document.getElementById("dependent-event");
    this.validateOnInput(referenceFlag, (field) => {
      if (field.value === "") {
        this.showError(field, "Please select a reference flag");
      } else {
        this.removeError(field);
      }
    });
  }

  /*
  static validateSteeringForm() {
      // ... function body ...
  }
  */

  /*
  static initializeSteeringFormValidation() {
      // ... function body ...
  }
  */

  // --- ADDED: Validation methods for dynamic Stage, Motor, Nozzle forms ---

  static validateStageForm(stageForm) {
    let isValid = true;
    const errors = [];

    // Get all required fields
    const structuralMass = stageForm.querySelector(
      'input[placeholder="Enter Structural Mass"]'
    );
    const referenceArea = stageForm.querySelector(
      'input[placeholder="Enter Reference Area"]'
    );
    const burnTime = stageForm.querySelector(
      'input[placeholder="Enter Burn Time"]'
    );
    const aeroFilename = stageForm.querySelector('input[type="text"].filename');

    // Validate Structural Mass
    if (!structuralMass.value.trim()) {
      this.showError(structuralMass, "Structural Mass is required");
      isValid = false;
      errors.push("Structural Mass is required");
    } else if (parseFloat(structuralMass.value) <= 0) {
      this.showError(structuralMass, "Structural Mass must be greater than 0");
      isValid = false;
      errors.push("Structural Mass must be greater than 0");
    } else {
      this.removeError(structuralMass);
    }

    // Validate Reference Area
    if (!referenceArea.value.trim()) {
      this.showError(referenceArea, "Reference Area is required");
      isValid = false;
      errors.push("Reference Area is required");
    } else if (parseFloat(referenceArea.value) <= 0) {
      this.showError(referenceArea, "Reference Area must be greater than 0");
      isValid = false;
      errors.push("Reference Area must be greater than 0");
    } else {
      this.removeError(referenceArea);
    }

    // Validate Burn Time
    if (!burnTime.value.trim()) {
      this.showError(burnTime, "Burn Time is required");
      isValid = false;
      errors.push("Burn Time is required");
    } else if (parseFloat(burnTime.value) <= 0) {
      this.showError(burnTime, "Burn Time must be greater than 0");
      isValid = false;
      errors.push("Burn Time must be greater than 0");
    } else {
      this.removeError(burnTime);
    }

    // Validate Aero Data File
    if (!aeroFilename.value.trim()) {
      this.showError(aeroFilename, "Aero Data file is required");
      isValid = false;
      errors.push("Aero Data file is required");
    } else {
      this.removeError(aeroFilename);
    }

    return {
      isValid,
      errors,
    };
  }

  static validateMotorForm(motorForm) {
    let isValid = true;
    const errors = [];

    // Get all required fields
    const structuralMass = motorForm.querySelector(
      'input[placeholder="Enter Structural Mass"]'
    );
    const propulsionType = motorForm.querySelector("select.input-field");
    const propulsionMass = motorForm.querySelector(
      'input[placeholder="Enter Propulsion Mass"]'
    );
    const nozzleDiameter = motorForm.querySelector(
      'input[placeholder="Enter Nozzle Diameter"]'
    );
    const thrustFilename = motorForm.querySelector(
      'input[type="text"].filename'
    );

    // Validate Structural Mass
    if (!structuralMass || !structuralMass.value.trim()) {
      this.showError(structuralMass, "Structural Mass is required");
      isValid = false;
      errors.push("Structural Mass is required");
    } else if (parseFloat(structuralMass.value) <= 0) {
      this.showError(structuralMass, "Structural Mass must be greater than 0");
      isValid = false;
      errors.push("Structural Mass must be greater than 0");
    } else {
      this.removeError(structuralMass);
    }

    // Validate Propulsion Type
    if (!propulsionType || !propulsionType.value) {
      this.showError(propulsionType, "Propulsion Type is required");
      isValid = false;
      errors.push("Propulsion Type is required");
    } else {
      this.removeError(propulsionType);
    }

    // Validate Propulsion Mass
    if (!propulsionMass || !propulsionMass.value.trim()) {
      this.showError(propulsionMass, "Propulsion Mass is required");
      isValid = false;
      errors.push("Propulsion Mass is required");
    } else if (parseFloat(propulsionMass.value) <= 0) {
      this.showError(propulsionMass, "Propulsion Mass must be greater than 0");
      isValid = false;
      errors.push("Propulsion Mass must be greater than 0");
    } else {
      this.removeError(propulsionMass);
    }

    // Validate Nozzle Diameter
    if (!nozzleDiameter || !nozzleDiameter.value.trim()) {
      this.showError(nozzleDiameter, "Nozzle Diameter is required");
      isValid = false;
      errors.push("Nozzle Diameter is required");
    } else if (parseFloat(nozzleDiameter.value) <= 0) {
      this.showError(nozzleDiameter, "Nozzle Diameter must be greater than 0");
      isValid = false;
      errors.push("Nozzle Diameter must be greater than 0");
    } else {
      this.removeError(nozzleDiameter);
    }

    // Validate Thrust Time File
    if (!thrustFilename || !thrustFilename.value.trim()) {
      this.showError(thrustFilename, "Thrust Time file is required");
      isValid = false;
      errors.push("Thrust Time file is required");
    } else {
      this.removeError(thrustFilename);
    }

    return {
      isValid,
      errors,
    };
  }

  static validateNozzleForm(nozzleForm) {
    let isValid = true;
    const errors = [];

    // Get all required fields
    const nozzleDiameter = nozzleForm.querySelector(
      'input[placeholder="Enter nozzle diameter"]'
    );
    const etaThrust = nozzleForm.querySelector(
      'input[placeholder="Enter ETA thrust"]'
    );
    const zetaThrust = nozzleForm.querySelector(
      'input[placeholder="Enter Zeta thrust"]'
    );
    const radialDistance = nozzleForm.querySelector(
      'input[placeholder="Enter radial distance"]'
    );
    const phi = nozzleForm.querySelector(
      'input[placeholder="Enter Phi value"]'
    );
    const sigmaThrust = nozzleForm.querySelector(
      'input[placeholder="Enter sigma thrust"]'
    );
    const thauThrust = nozzleForm.querySelector(
      'input[placeholder="Enter thau thrust"]'
    );
    const epsilonThrust = nozzleForm.querySelector(
      'input[placeholder="Enter epsilon thrust"]'
    );
    const mu = nozzleForm.querySelector('input[placeholder="Enter MU value"]');
    const lamda = nozzleForm.querySelector(
      'input[placeholder="Enter LAMDA value"]'
    );
    const kappa = nozzleForm.querySelector(
      'input[placeholder="Enter KAPPA value"]'
    );
    const xValue = nozzleForm.querySelector(
      'input[placeholder="Enter X value"]'
    );
    const yValue = nozzleForm.querySelector(
      'input[placeholder="Enter Y value"]'
    );
    const zValue = nozzleForm.querySelector(
      'input[placeholder="Enter Z value"]'
    );

    // Validate Nozzle Diameter
    if (!nozzleDiameter.value.trim()) {
      this.showError(nozzleDiameter, "Nozzle Diameter is required");
      isValid = false;
      errors.push("Nozzle Diameter is required");
    } else if (parseFloat(nozzleDiameter.value) <= 0) {
      this.showError(nozzleDiameter, "Nozzle Diameter must be greater than 0");
      isValid = false;
      errors.push("Nozzle Diameter must be greater than 0");
    } else {
      this.removeError(nozzleDiameter);
    }

    // Validate ETA Thrust
    if (!etaThrust.value.trim()) {
      this.showError(etaThrust, "ETA Thrust is required");
      isValid = false;
      errors.push("ETA Thrust is required");
    } else {
      this.removeError(etaThrust);
    }

    // Validate Zeta Thrust
    if (!zetaThrust.value.trim()) {
      this.showError(zetaThrust, "Zeta Thrust is required");
      isValid = false;
      errors.push("Zeta Thrust is required");
    } else {
      this.removeError(zetaThrust);
    }

    // Validate Radial Distance
    if (!radialDistance.value.trim()) {
      this.showError(radialDistance, "Radial Distance is required");
      isValid = false;
      errors.push("Radial Distance is required");
    } else if (parseFloat(radialDistance.value) < 0) {
      this.showError(radialDistance, "Radial Distance cannot be negative");
      isValid = false;
      errors.push("Radial Distance cannot be negative");
    } else {
      this.removeError(radialDistance);
    }

    // Validate Phi
    if (!phi.value.trim()) {
      this.showError(phi, "Phi value is required");
      isValid = false;
      errors.push("Phi value is required");
    } else {
      this.removeError(phi);
    }

    // Validate Sigma Thrust
    if (!sigmaThrust.value.trim()) {
      this.showError(sigmaThrust, "Sigma Thrust is required");
      isValid = false;
      errors.push("Sigma Thrust is required");
    } else {
      this.removeError(sigmaThrust);
    }

    // Validate Thau Thrust
    if (!thauThrust.value.trim()) {
      this.showError(thauThrust, "Thau Thrust is required");
      isValid = false;
      errors.push("Thau Thrust is required");
    } else {
      this.removeError(thauThrust);
    }

    // Validate Epsilon Thrust
    if (!epsilonThrust.value.trim()) {
      this.showError(epsilonThrust, "Epsilon Thrust is required");
      isValid = false;
      errors.push("Epsilon Thrust is required");
    } else {
      this.removeError(epsilonThrust);
    }

    // Validate MU
    if (!mu.value.trim()) {
      this.showError(mu, "MU value is required");
      isValid = false;
      errors.push("MU value is required");
    } else {
      this.removeError(mu);
    }

    // Validate LAMDA
    if (!lamda.value.trim()) {
      this.showError(lamda, "LAMDA value is required");
      isValid = false;
      errors.push("LAMDA value is required");
    } else {
      this.removeError(lamda);
    }

    // Validate KAPPA
    if (!kappa.value.trim()) {
      this.showError(kappa, "KAPPA value is required");
      isValid = false;
      errors.push("KAPPA value is required");
    } else {
      this.removeError(kappa);
    }

    // Validate X Value
    if (!xValue.value.trim()) {
      this.showError(xValue, "X value is required");
      isValid = false;
      errors.push("X value is required");
    } else {
      this.removeError(xValue);
    }

    // Validate Y Value
    if (!yValue.value.trim()) {
      this.showError(yValue, "Y value is required");
      isValid = false;
      errors.push("Y value is required");
    } else {
      this.removeError(yValue);
    }

    // Validate Z Value
    if (!zValue.value.trim()) {
      this.showError(zValue, "Z value is required");
      isValid = false;
      errors.push("Z value is required");
    } else {
      this.removeError(zValue);
    }

    return {
      isValid,
      errors,
    };
  }

  // --- ADDED: Validation method for Profile steering parameters ---
  static validateProfileSteeringParams(container) {
    let isValid = true;
    const errors = [];
    const profileParamsContainer = container.querySelector(
      '[data-steering-type="profile"]'
    );

    if (!profileParamsContainer) {
      console.error("Profile parameters container not found for validation.");
      return {
        isValid: false,
        errors: ["Internal error: Profile container not found."],
      };
    }

    // Mode validation
    const modeSelect = profileParamsContainer.querySelector(
      '[data-param="mode"]'
    );
    if (!modeSelect.value) {
      this.showError(modeSelect, "Please select a Mode");
      isValid = false;
      errors.push("Mode is required");
    } else {
      this.removeError(modeSelect);
    }

    // Quantity validation
    const quantitySelect = profileParamsContainer.querySelector(
      '[data-param="quantity"]'
    );
    if (!quantitySelect.value) {
      this.showError(quantitySelect, "Please select a Quantity");
      isValid = false;
      errors.push("Quantity is required");
    } else {
      this.removeError(quantitySelect);
    }

    // Independent Variable validation
    const independentVarSelect = profileParamsContainer.querySelector(
      '[data-param="independentVar"]'
    );
    if (!independentVarSelect.value) {
      this.showError(
        independentVarSelect,
        "Please select an Independent Variable"
      );
      isValid = false;
      errors.push("Independent Variable is required");
    } else {
      this.removeError(independentVarSelect);
    }

    // Profile CSV validation
    const profileCsvFilename = profileParamsContainer.querySelector(
      '[data-param="profile_csv_filename"]'
    );
    const profileCsvInput = document.getElementById("profile-csv-upload"); // Assumes this ID is unique

    // Check if filename is empty OR if the input element exists but has no file selected/stored
    if (
      !profileCsvFilename.value.trim() ||
      (profileCsvInput &&
        !profileCsvInput.files.length &&
        !profileCsvInput._selectedFile)
    ) {
      // Show error on the filename display input for better visibility
      this.showError(profileCsvFilename, "Please upload a Profile CSV file");
      isValid = false;
      errors.push("Profile CSV file is required");
    } else {
      this.removeError(profileCsvFilename);
    }

    return {
      isValid,
      errors,
    };
  }
  // --- END ADDED ---

  // --- Methods for general feedback (using Swal) ---
  static showGeneralError(title, message) {
    Swal.fire({
      title: title || "Error",
      text: message,
      icon: "error",
      confirmButtonText: "OK",
    });
  }

  static showGeneralSuccess(title, message) {
    Swal.fire({
      title: title || "Success",
      text: message,
      icon: "success",
      timer: 2000,
      showConfirmButton: false,
    });
  }

  static showGeneralInfo(title, message) {
    Swal.fire({
      title: title || "Information",
      text: message,
      icon: "info",
      confirmButtonText: "OK",
    });
  }
  // --- END Methods for general feedback ---
}

// Initialize validation when the document is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Add novalidate to all forms to prevent browser default validation
  document.querySelectorAll("form").forEach((form) => {
    form.setAttribute("novalidate", "");
  });

  FormValidator.initializeMissionFormValidation();
  FormValidator.initializeEnvironmentFormValidation();
  FormValidator.initializeVehicleFormValidation();
  FormValidator.initializeSequenceFormValidation();
  // FormValidator.initializeSteeringFormValidation(); // Removed
});
