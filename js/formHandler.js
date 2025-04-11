// Global mission data structure
let missionData = {
  mission: {},
  environment: {},
  vehicle: {},
  stages: [],
  sequence: {},
};

// Global final mission data structure
let finalMissionData = {
  mission: {
    mission_name: "",
    MODE: "",
    tracking_option: "OFF",
    UTC: {
      Date: "",
      Time: "",
    },
  },
  SSPO: {
    vehicle: [],
  },
  stopping_criteria: {
    type: "Time",
    value: 0,
    condition: "GT",
  },
};

// Flag registry to track all event flags
let flagRegistry = {
  stages: {
    initializationFlags: [], // ST_1_INI, ST_2_INI, etc.
    separationFlags: [], // ST_1_SEP, ST_2_SEP, etc.
  },
  motors: [], // This will be populated with motor flags
  heatShieldFlags: [], // Heat shield separation flags
};

// Global array to store saved stages
let savedStages = [];

// Array to store added events in sequence
let eventSequence = [];

// Add event listeners when document is loaded
document.addEventListener("DOMContentLoaded", function () {
  // Mission form save button
  const saveMissionBtn = document.getElementById("save-mission");
  if (saveMissionBtn) {
    saveMissionBtn.addEventListener("click", function (e) {
      e.preventDefault();
      if (validateMissionForm()) {
        saveMissionDetails();
        const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener("mouseenter", Swal.stopTimer);
            toast.addEventListener("mouseleave", Swal.resumeTimer);
          },
        });

        Toast.fire({
          icon: "success",
          title: "Mission details saved successfully!",
        });
      }
    });
  }

  // Environment form save button
  const enviroForm = document.getElementById("enviro-form");
  if (enviroForm) {
    enviroForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (validateEnvironmentForm()) {
        appendEnviroDetails();
        const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener("mouseenter", Swal.stopTimer);
            toast.addEventListener("mouseleave", Swal.resumeTimer);
          },
        });

        Toast.fire({
          icon: "success",
          title: "Environment details saved successfully!",
        });
      }
    });
  }

  // Vehicle form save button
  const vehicleForm = document.getElementById("vehicle-form");
  if (vehicleForm) {
    vehicleForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (validateVehicleForm()) {
        appendVehicleDetails();
        const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener("mouseenter", Swal.stopTimer);
            toast.addEventListener("mouseleave", Swal.resumeTimer);
          },
        });

        Toast.fire({
          icon: "success",
          title: "Vehicle details saved successfully!",
        });

        // Log the current state of finalMissionData
        console.log("Current Mission Data Structure:");
        console.log(JSON.stringify(finalMissionData, null, 2));
      }
    });
  }

  // Add trigger type change handler
  const triggerType = document.getElementById("trigger-type");
  const triggerValue = document.getElementById("trigger-value");

  if (triggerType && triggerValue) {
    // Update placeholder based on trigger type
    triggerType.addEventListener("change", function () {
      switch (this.value) {
        case "mission-time":
        case "phase-time":
          triggerValue.placeholder = "Enter time in seconds";
          break;
        case "altitude":
          triggerValue.placeholder = "Enter altitude in meters";
          break;
        default:
          triggerValue.placeholder = "Enter value";
      }
      // Clear any previous error styling when trigger type changes
      triggerValue.classList.remove("error-field");
    });

    // Validate trigger value on input
    triggerValue.addEventListener("input", function () {
      const validation = validateTriggerValue(triggerType.value, this.value);
      if (!validation.isValid) {
        this.classList.add("error-field");
        this.title = validation.message;
      } else {
        this.classList.remove("error-field");
        this.title = validation.message;
      }
    });
  }

  // Modify the Add Event button handler
  const addEventBtn = document.getElementById("add-event-btn");
  if (addEventBtn) {
    addEventBtn.addEventListener("click", function (e) {
      e.preventDefault();

      // Get form elements with null checks
      const eventFlagElement = document.getElementById("event-flag");
      const heatShieldFlagElement = document.getElementById("heat-shield-flag");
      const triggerTypeElement = document.getElementById("trigger-type");
      const triggerValueElement = document.getElementById("trigger-value");
      const referenceFlagElement = document.getElementById("dependent-event");
      const commentElement = document.getElementById("event-comment");

      // Get the event flag value based on which input is visible
      const eventFlag = heatShieldFlagElement
        ? heatShieldFlagElement.value
        : eventFlagElement.value;

      // Validate that all required elements exist
      if (
        (!eventFlagElement && !heatShieldFlagElement) ||
        !triggerTypeElement ||
        !triggerValueElement ||
        !referenceFlagElement
      ) {
        Swal.fire({
          icon: "error",
          title: "Form Error",
          text: "Required form elements are missing. Please check the form structure.",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
        return;
      }

      const triggerType = triggerTypeElement.value;
      const triggerValue = triggerValueElement.value;
      const referenceFlag = referenceFlagElement.value;
      const comment = commentElement ? commentElement.value : "";

      // Validate required fields
      let errors = [];

      if (!eventFlag) {
        errors.push("Event Flag is required");
        if (eventFlagElement && eventFlagElement.style.display !== "none") {
          eventFlagElement.classList.add("error-field");
        }
      }

      if (!triggerType) {
        errors.push("Trigger Type is required");
        triggerTypeElement.classList.add("error-field");
      }

      if (!triggerValue) {
        errors.push("Trigger Value is required");
        triggerValueElement.classList.add("error-field");
      } else {
        const validation = validateTriggerValue(triggerType, triggerValue);
        if (!validation.isValid) {
          errors.push(validation.message);
          triggerValueElement.classList.add("error-field");
        }
      }

      if (!referenceFlag) {
        errors.push("Reference Flag is required");
        referenceFlagElement.classList.add("error-field");
      }

      if (errors.length > 0) {
        Swal.fire({
          icon: "error",
          title: "Validation Error",
          html: errors.join("<br>"),
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
        return;
      }

      const eventData = {
        flag: eventFlag,
        triggerType: triggerType,
        triggerValue: triggerValue,
        referenceFlag: referenceFlag || "none",
        comment: comment,
      };

      // Add event to sequence
      addEventToSequence(eventData);

      // Reset form
      resetSequenceForm();

      // Show success message
      Swal.fire({
        icon: "success",
        title: "Event Added Successfully",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    });
  }
});

// Save functions
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
    stopping_condition: selectedStoppingCondition || "",
  };

  // Add stopping condition details based on selection
  if (selectedStoppingCondition === "flag") {
    missionData.flag_name = document.getElementById("flag-name").value;
    missionData.flag_value = document.getElementById("flag-value").value;
    missionData.flag_condition =
      document.getElementById("flag-condition").value;
  } else if (selectedStoppingCondition === "time") {
    missionData.time_value = document.getElementById("time-value").value;
    missionData.time_condition =
      document.getElementById("time-condition").value;
  } else if (selectedStoppingCondition === "altitude") {
    missionData.altitude_value =
      document.getElementById("altitude-value").value;
    missionData.altitude_condition =
      document.getElementById("altitude-condition").value;
  }

  // Update the target JSON structure
  finalMissionData.SSPO.mission = missionData;

  // Log the mission data as JSON
  console.log("Mission Data JSON:", JSON.stringify(missionData, null, 2));
}

function appendEnviroDetails() {
  const enviroData = {
    atmosphere: document.getElementById("atmosphere").value,
    gravity: document.getElementById("gravity").value,
    wind: document.getElementById("wind").checked,
    wind_file: document.getElementById("wind-filename").value,
  };

  // Update the target JSON structure
  finalMissionData.SSPO.environment = enviroData;

  // Log the environment data as JSON
  console.log("Environment Data JSON:", JSON.stringify(enviroData, null, 2));
}

function appendVehicleDetails() {
  const vehicleData = {
    name: document.getElementById("vehicle-name").value.trim(),
    type: document.getElementById("vehicle-type").value,
  };

  // Get the selected data option (state or launch point)
  const dataOption = document.querySelector(
    'input[name="data-option"]:checked'
  )?.value;

  if (dataOption === "state") {
    vehicleData.data_type = "state";
    vehicleData.state = {
      position: {
        x: document.getElementById("pos-x")?.value || "",
        y: document.getElementById("pos-y")?.value || "",
        z: document.getElementById("pos-z")?.value || "",
      },
      velocity: {
        x: document.getElementById("vel-x")?.value || "",
        y: document.getElementById("vel-y")?.value || "",
        z: document.getElementById("vel-z")?.value || "",
      },
    };
  } else if (dataOption === "launch") {
    vehicleData.data_type = "launch";
    if (vehicleData.type === "ascend") {
      vehicleData.launch = {
        latitude: document.getElementById("latitude")?.value || "",
        longitude: document.getElementById("longitude")?.value || "",
        altitude: document.getElementById("altitude")?.value || "",
        azimuth: document.getElementById("azimuth")?.value || "",
        elevation: document.getElementById("elevation")?.value || "",
      };
    } else if (vehicleData.type === "projectile") {
      vehicleData.launch = {
        latitude: document.getElementById("proj-latitude")?.value || "",
        longitude: document.getElementById("proj-longitude")?.value || "",
        altitude: document.getElementById("proj-altitude")?.value || "",
        velocity: document.getElementById("proj-velocity")?.value || "",
        azimuth: document.getElementById("proj-azimuth")?.value || "",
        elevation: document.getElementById("proj-elevation")?.value || "",
      };
    }
  }

  // Update the target JSON structure
  finalMissionData.SSPO.vehicle = [vehicleData.name];
  finalMissionData[vehicleData.name] = {
    type: vehicleData.type,
    data_type: vehicleData.data_type,
    ...(vehicleData.state && { state: vehicleData.state }),
    ...(vehicleData.launch && { launch: vehicleData.launch }),
    stage: [],
    no_Stg: 0,
  };

  // Log the vehicle data as JSON
  console.log("Vehicle Data JSON:", JSON.stringify(vehicleData, null, 2));
}

function saveStageData(stageForm, stageId) {
  const stageNumber = parseInt(stageId.replace("stage", ""));
  const vehicleName = document.getElementById("vehicle-name").value.trim();

  const formData = {
    structural_mass:
      parseFloat(
        stageForm.querySelector('input[placeholder="Enter Structural Mass"]')
          .value
      ) || 0,
    reference_area:
      parseFloat(
        stageForm.querySelector('input[placeholder="Enter Reference Area"]')
          .value
      ) || 0,
    burn_time:
      parseFloat(
        stageForm.querySelector('input[placeholder="Enter Burn Time"]').value
      ) || 0,
    dciss: stageForm.querySelector(`#dciss-toggle-${stageId}`).checked,
    coasting: stageForm.querySelector(`#coasting-toggle-${stageId}`).checked,
    aero_data_file:
      stageForm.querySelector(`#aero-filename-${stageId}`).value || "",
  };

  // Update stage in savedStages array
  const stageIndex = savedStages.findIndex(
    (stage) => stage.stage_number === stageNumber
  );

  const stageData = {
    stage_number: stageNumber,
    structural_mass: formData.structural_mass,
    reference_area: formData.reference_area,
    burn_time: formData.burn_time,
    burn_time_identifier: `ST_${stageNumber}_INI`,
    separation_flag: `ST_${stageNumber}_SEP`,
    dciss: formData.dciss,
    coasting: formData.coasting,
    aero_data_file: formData.aero_data_file,
    motors: [],
  };

  if (stageIndex >= 0) {
    // Preserve existing motors when updating stage
    stageData.motors = savedStages[stageIndex].motors || [];

    // Update burn time in all associated motor forms and data
    if (stageData.motors && stageData.motors.length > 0) {
      stageData.motors.forEach((motor, motorIndex) => {
        if (motor) {
          // Update motor data
          motor.burn_time = formData.burn_time;

          // Update motor form if it exists
          const motorNumber = motorIndex + 1;
          const motorForm = document.getElementById(
            `${stageId}-motor${motorNumber}-form`
          );
          if (motorForm) {
            const burnTimeInput = motorForm.querySelector(
              'input[placeholder="Enter Burn Time"]'
            );
            if (burnTimeInput) {
              burnTimeInput.value = formData.burn_time;
            }
          }

          // Update finalMissionData for this motor
          const motorName = `S${stageNumber}_M${motorNumber}`;
          if (finalMissionData[motorName]) {
            finalMissionData[motorName].burn_time = formData.burn_time;
          }
        }
      });
    }

    savedStages[stageIndex] = stageData;
  } else {
    savedStages.push(stageData);
  }

  // Sort stages by stage number
  savedStages.sort((a, b) => a.stage_number - b.stage_number);

  // Update flag registry
  updateFlagRegistry(
    stageNumber,
    stageData.burn_time_identifier,
    stageData.separation_flag
  );

  // Update finalMissionData if vehicle name exists
  if (vehicleName) {
    const stageName = `Stage_${stageNumber}`;

    if (!finalMissionData[vehicleName].stage.includes(stageName)) {
      finalMissionData[vehicleName].stage.push(stageName);
    }

    finalMissionData[stageName] = {
      structural_mass: stageData.structural_mass,
      ref_area: stageData.reference_area,
      burn_time: stageData.burn_time,
      burn_time_identifier: stageData.burn_time_identifier,
      separation_flag: stageData.separation_flag,
      DCISS: stageData.dciss ? "ON" : "OFF",
      coasting: stageData.coasting ? "ON" : "OFF",
      aero_data: stageData.aero_data_file,
      motors: finalMissionData[stageName]?.motors || [],
    };

    finalMissionData[vehicleName].no_Stg = Math.max(
      stageNumber,
      finalMissionData[vehicleName].no_Stg || 0
    );
  }

  // Log the stage data
  console.log(`Stage ${stageNumber} saved:`, stageData);
  console.log("Updated savedStages:", savedStages);
  console.log("Updated finalMissionData:", finalMissionData);

  return stageData;
}

// Form validation functions
function validateMissionForm() {
  const errors = [];
  const missionName = document.getElementById("mission-name");
  const missionDate = document.getElementById("mission-date");
  const modes = document.getElementById("modes");

  if (!missionName.value.trim()) {
    errors.push("Mission Name is required");
    missionName.classList.add("error-field");
  } else {
    missionName.classList.remove("error-field");
  }

  if (!missionDate.value) {
    errors.push("Mission Date is required");
    missionDate.classList.add("error-field");
  } else {
    missionDate.classList.remove("error-field");
  }

  if (!modes.value) {
    errors.push("Mode selection is required");
    modes.classList.add("error-field");
  } else {
    modes.classList.remove("error-field");
  }

  if (errors.length > 0) {
    // Show error message with SweetAlert2
    Swal.fire({
      icon: "error",
      title: "Validation Error",
      html: errors.join("<br>"),
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 5000,
      timerProgressBar: true,
    });
    return false;
  }

  return true;
}

function validateEnvironmentForm() {
  const errors = [];
  const atmosphere = document.getElementById("atmosphere");
  const gravity = document.getElementById("gravity");
  const windEnabled = document.getElementById("wind");
  const windFilename = document.getElementById("wind-filename");

  if (!atmosphere.value) {
    errors.push("Atmosphere selection is required");
    atmosphere.classList.add("error-field");
  } else {
    atmosphere.classList.remove("error-field");
  }

  if (!gravity.value) {
    errors.push("Gravity selection is required");
    gravity.classList.add("error-field");
  } else {
    gravity.classList.remove("error-field");
  }

  if (windEnabled.checked && !windFilename.value) {
    errors.push("Wind file is required when wind is enabled");
    windFilename.classList.add("error-field");
  } else {
    windFilename.classList.remove("error-field");
  }

  if (errors.length > 0) {
    // Show error message with SweetAlert2
    Swal.fire({
      icon: "error",
      title: "Validation Error",
      html: errors.join("<br>"),
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 5000,
      timerProgressBar: true,
    });
    return false;
  }

  return true;
}

function validateVehicleForm() {
  const errors = [];
  const vehicleName = document.getElementById("vehicle-name");
  const vehicleType = document.getElementById("vehicle-type");

  if (!vehicleName.value.trim()) {
    errors.push("Vehicle Name is required");
    vehicleName.classList.add("error-field");
  } else {
    vehicleName.classList.remove("error-field");
  }

  if (!vehicleType.value) {
    errors.push("Vehicle Type is required");
    vehicleType.classList.add("error-field");
  } else {
    vehicleType.classList.remove("error-field");
  }

  // Get the selected data option
  const dataOption = document.querySelector(
    'input[name="data-option"]:checked'
  )?.value;

  if (!dataOption) {
    errors.push("Please select either State Data or Launch Point");
  }

  if (errors.length > 0) {
    // Show error message with SweetAlert2
    Swal.fire({
      icon: "error",
      title: "Validation Error",
      html: errors.join("<br>"),
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 5000,
      timerProgressBar: true,
    });
    return false;
  }

  return true;
}

function updateFlagRegistry(stageNumber, initializationFlag, sepFlag) {
  // Find if this stage's flags already exist
  const initIndex = flagRegistry.stages.initializationFlags.findIndex(
    (item) => item.stageNumber === parseInt(stageNumber)
  );

  const sepFlagIndex = flagRegistry.stages.separationFlags.findIndex(
    (item) => item.stageNumber === parseInt(stageNumber)
  );

  // Update or add initialization flag
  if (initIndex >= 0) {
    flagRegistry.stages.initializationFlags[initIndex].flag =
      initializationFlag;
  } else {
    flagRegistry.stages.initializationFlags.push({
      stageNumber: parseInt(stageNumber),
      flag: initializationFlag,
    });
  }

  // Update or add separation flag
  if (sepFlagIndex >= 0) {
    flagRegistry.stages.separationFlags[sepFlagIndex].flag = sepFlag;
  } else {
    flagRegistry.stages.separationFlags.push({
      stageNumber: parseInt(stageNumber),
      flag: sepFlag,
    });
  }

  // Sort flags by stage number
  flagRegistry.stages.initializationFlags.sort(
    (a, b) => a.stageNumber - b.stageNumber
  );
  flagRegistry.stages.separationFlags.sort(
    (a, b) => a.stageNumber - b.stageNumber
  );

  // Log updated registry for debugging
  console.log(
    "Updated Stage Flag Registry:",
    JSON.stringify(flagRegistry.stages, null, 2)
  );
}

function updateHeatShieldFlag(flag) {
  flagRegistry.heatShieldFlags = [{ flag: flag }];
}

function registerMotorFlags(
  stageNumber,
  motorNumber,
  ignitionFlag,
  burnoutFlag,
  cutOffFlag,
  separationFlag
) {
  // Find if this motor's flags already exist
  const motorIndex = flagRegistry.motors.findIndex(
    (motor) =>
      motor.stageNumber === parseInt(stageNumber) &&
      motor.motorNumber === parseInt(motorNumber)
  );

  const motorFlags = {
    stageNumber: parseInt(stageNumber),
    motorNumber: parseInt(motorNumber),
    flags: {
      ignition: ignitionFlag,
      burnout: burnoutFlag,
      cutOff: cutOffFlag,
      separation: separationFlag,
    },
  };

  // Update or add motor flags
  if (motorIndex >= 0) {
    flagRegistry.motors[motorIndex] = motorFlags;
  } else {
    flagRegistry.motors.push(motorFlags);
  }

  // Sort motors by stage number and then motor number
  flagRegistry.motors.sort((a, b) => {
    if (a.stageNumber === b.stageNumber) {
      return a.motorNumber - b.motorNumber;
    }
    return a.stageNumber - b.stageNumber;
  });

  // Log updated registry for debugging
  console.log(
    "Updated Motor Flag Registry:",
    JSON.stringify(flagRegistry.motors, null, 2)
  );
}

function saveMotorData(form, stageNumber, motorNumber) {
  try {
    // Get form elements using their placeholders since they don't have IDs
    const structuralMass = form.querySelector(
      'input[placeholder="Enter Structural Mass"]'
    );
    const propulsionType = form.querySelector("select.input-field");
    const propulsionMass = form.querySelector(
      'input[placeholder="Enter Propulsion Mass"]'
    );
    const nozzleDiameter = form.querySelector(
      'input[placeholder="Enter Nozzle Diameter"]'
    );
    const thrustFilename = form.querySelector('input[type="text"].filename');
    const burnTime = form.querySelector(".stage-burn-time");

    // Generate flags with consistent format
    const ignitionFlag = `S${stageNumber}_M${motorNumber}_IGN`;
    const cutOffFlag = `S${stageNumber}_M${motorNumber}_CUTOFF`;
    const burnoutFlag = `S${stageNumber}_M${motorNumber}_Burnout`;
    const separationFlag = `ST_${stageNumber}_SEP`;

    // Validate required fields
    if (
      !structuralMass ||
      !propulsionType ||
      !propulsionMass ||
      !nozzleDiameter ||
      !thrustFilename ||
      !burnTime
    ) {
      throw new Error("One or more required form fields are missing");
    }

    // Find the stage to get its burn time
    const stage = savedStages.find((s) => s.stage_number === stageNumber);
    if (!stage) {
      // If stage is not found, create a basic stage object
      const stageData = {
        stage_number: stageNumber,
        burn_time: parseFloat(burnTime.value) || 0,
        motors: [],
      };
      savedStages.push(stageData);
      console.log(`Created new stage ${stageNumber} for motor ${motorNumber}`);
    }

    const motorData = {
      motor_number: motorNumber,
      structural_mass: parseFloat(structuralMass.value),
      propulsion_type: propulsionType.value,
      propulsion_mass: parseFloat(propulsionMass.value),
      ignition_flag: ignitionFlag,
      cut_off_flag: cutOffFlag,
      burnout_flag: burnoutFlag,
      separation_flag: separationFlag,
      nozzle_diameter: parseFloat(nozzleDiameter.value),
      burn_time: parseFloat(burnTime.value), // Use the burn time from the form
      thrust_file: thrustFilename.value,
    };

    // Register all motor flags
    registerMotorFlags(
      stageNumber,
      motorNumber,
      ignitionFlag,
      burnoutFlag,
      cutOffFlag,
      separationFlag
    );

    // Find the stage in savedStages (it should exist now)
    const stageIndex = savedStages.findIndex(
      (stage) => stage.stage_number === stageNumber
    );

    if (stageIndex !== -1) {
      // Initialize motors array if it doesn't exist
      if (!savedStages[stageIndex].motors) {
        savedStages[stageIndex].motors = [];
      }

      // Add or update motor data
      const motorIndex = savedStages[stageIndex].motors.findIndex(
        (m) => m && m.motor_number === motorNumber
      );

      if (motorIndex !== -1) {
        savedStages[stageIndex].motors[motorIndex] = motorData;
      } else {
        // Add new motor at the correct index (motorNumber-1)
        while (savedStages[stageIndex].motors.length < motorNumber) {
          savedStages[stageIndex].motors.push(null);
        }
        savedStages[stageIndex].motors[motorNumber - 1] = motorData;
      }

      // Update finalMissionData
      const vehicleName = document.getElementById("vehicle-name").value.trim();
      if (vehicleName) {
        const stageName = `Stage_${stageNumber}`;

        // Initialize stage in finalMissionData if it doesn't exist
        if (!finalMissionData[stageName]) {
          finalMissionData[stageName] = {
            motors: [],
            burn_time: parseFloat(burnTime.value) || 0,
          };
        }

        // Initialize motors array if it doesn't exist
        if (!finalMissionData[stageName].motors) {
          finalMissionData[stageName].motors = [];
        }

        // Update or add motor in finalMissionData
        const motorName = `S${stageNumber}_M${motorNumber}`;
        finalMissionData[motorName] = {
          structural_mass: motorData.structural_mass,
          propulsion_type: motorData.propulsion_type,
          propulsion_mass: motorData.propulsion_mass,
          ignition_flag: motorData.ignition_flag,
          cut_off_flag: motorData.cut_off_flag,
          separation_flag: motorData.separation_flag,
          nozzle_diameter: motorData.nozzle_diameter,
          burn_time: motorData.burn_time,
          thrust_file: motorData.thrust_file,
        };

        // Add motor to stage's motor array if not already present
        if (!finalMissionData[stageName].motors.includes(motorName)) {
          finalMissionData[stageName].motors.push(motorName);
        }

        // Ensure the stage is in the vehicle's stage array
        if (!finalMissionData[vehicleName].stage.includes(stageName)) {
          finalMissionData[vehicleName].stage.push(stageName);
        }
      }
    }

    // Log the motor data
    console.log(
      `Motor ${motorNumber} for Stage ${stageNumber} saved:`,
      motorData
    );
    console.log("Updated savedStages:", savedStages);
    console.log("Updated finalMissionData:", finalMissionData);

    return motorData;
  } catch (error) {
    console.error("Error saving motor data:", error);
    throw error;
  }
}

function updateMotorCutOffFlag(stageNumber, motorNumber) {
  const cutOffFlagField = document.querySelector(
    'input[placeholder="Enter COF Value"]'
  );
  if (cutOffFlagField) {
    cutOffFlagField.value = `S${stageNumber}_M${motorNumber}_CUTOFF`;
    cutOffFlagField.readOnly = true;
  }
}

// Function to update Reference Flag dropdown
function updateReferenceFlagDropdown(currentEventFlag = null) {
  const referenceDropdown = document.getElementById("dependent-event");
  if (!referenceDropdown) return;

  // Clear all existing options and groups
  referenceDropdown.innerHTML = "";

  // Create and add the None option first
  const noneOptgroup = document.createElement("optgroup");
  noneOptgroup.label = "No Reference";
  const noneOption = document.createElement("option");
  noneOption.value = "none";
  noneOption.textContent = "None";
  noneOptgroup.appendChild(noneOption);
  referenceDropdown.appendChild(noneOptgroup);

  // If no events, just keep None option
  if (eventSequence.length === 0) {
    return;
  }

  // Create groups with unique flags
  const uniqueGroups = {
    initialization: { label: "Stage Initialization", flags: new Set() },
    separation: { label: "Stage Separation", flags: new Set() },
    ignition: { label: "Motor Ignition", flags: new Set() },
    burnout: { label: "Motor Burnout", flags: new Set() },
  };

  // Collect all unique flags
  eventSequence.forEach((event) => {
    const flag = event.flag;
    if (flag === currentEventFlag) return; // Skip current event's flag

    if (flag.match(/ST_\d+_INI$/)) {
      uniqueGroups.initialization.flags.add(flag);
    } else if (flag.match(/ST_\d+_SEP$/)) {
      uniqueGroups.separation.flags.add(flag);
    } else if (flag.match(/S\d+_M\d+_IGN$/)) {
      uniqueGroups.ignition.flags.add(flag);
    } else if (flag.match(/S\d+_M\d+_Burnout$/)) {
      uniqueGroups.burnout.flags.add(flag);
    }
  });

  // Create and append groups only if they have flags
  Object.entries(uniqueGroups).forEach(([groupKey, group]) => {
    if (group.flags.size > 0) {
      // Create new optgroup
      const optgroup = document.createElement("optgroup");
      optgroup.label = group.label;
      optgroup.dataset.groupType = groupKey;

      // Sort and add flags to group
      const sortedFlags = Array.from(group.flags).sort((a, b) => {
        const aNumbers = a.match(/\d+/g).map(Number);
        const bNumbers = b.match(/\d+/g).map(Number);

        // Compare stage numbers first
        if (aNumbers[0] !== bNumbers[0]) {
          return aNumbers[0] - bNumbers[0];
        }
        // If stage numbers are same, compare motor numbers (if they exist)
        return (aNumbers[1] || 0) - (bNumbers[1] || 0);
      });

      // Add options to group
      sortedFlags.forEach((flag) => {
        const option = document.createElement("option");
        option.value = flag;
        option.textContent = flag;
        optgroup.appendChild(option);
      });

      // Append the group to dropdown
      referenceDropdown.appendChild(optgroup);
    }
  });
}

// Function to add event to sequence
function addEventToSequence(eventData) {
  eventSequence.push(eventData);

  // Add event to the event list in UI
  const eventList = document.getElementById("event-list");
  const eventItem = document.createElement("div");
  eventItem.className = "event-item";
  eventItem.setAttribute("data-flag", eventData.flag);

  eventItem.innerHTML = `
    <div class="event-content">
      <span class="event-flag" title="Event Flag">${eventData.flag}</span>
      <span class="trigger-type" title="Trigger Type">${
        eventData.triggerType
      }</span>
      <span class="trigger-value" title="Trigger Value">${
        eventData.triggerValue
      }</span>
      <span class="reference-flag" title="Reference Flag">${
        eventData.referenceFlag
      }</span>
      ${
        eventData.comment
          ? `<span class="event-comment" title="Comment">${eventData.comment}</span>`
          : ""
      }
    </div>
    <div class="event-actions">
      <button class="delete-event" title="Delete Event">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"></path>
        </svg>
      </button>
    </div>
  `;

  // Add click handler for delete button
  const deleteBtn = eventItem.querySelector(".delete-event");
  deleteBtn.addEventListener("click", () => {
    // Show confirmation dialog
    Swal.fire({
      title: "Delete Event?",
      text: `Are you sure you want to delete this event (${eventData.flag})?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ff3b30",
      cancelButtonColor: "#8e8e93",
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        removeEventFromSequence(eventData.flag);
        // Show success message
        Swal.fire({
          icon: "success",
          title: "Event Deleted",
          text: "The event has been removed from the sequence.",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
      }
    });
  });

  eventList.appendChild(eventItem);

  // Update reference flag dropdown for next event
  updateReferenceFlagDropdown();
}

// Function to remove event from sequence
function removeEventFromSequence(flag) {
  const index = eventSequence.findIndex((event) => event.flag === flag);
  if (index !== -1) {
    eventSequence.splice(index, 1);

    // Remove from UI
    const eventItem = document.querySelector(
      `.event-item[data-flag="${flag}"]`
    );
    if (eventItem) {
      eventItem.remove();
    }

    // Update reference flag dropdown
    updateReferenceFlagDropdown();

    // Update any existing events that were referencing this flag
    const eventsReferencingDeletedFlag = eventSequence.filter(
      (event) => event.referenceFlag === flag
    );

    if (eventsReferencingDeletedFlag.length > 0) {
      eventsReferencingDeletedFlag.forEach((event) => {
        event.referenceFlag = "none";
        // Update UI for this event
        const eventElement = document.querySelector(
          `.event-item[data-flag="${event.flag}"]`
        );
        if (eventElement) {
          const referenceSpan = eventElement.querySelector(".reference-flag");
          if (referenceSpan) {
            referenceSpan.textContent = "none";
          }
        }
      });
    }
  }
}

// Function to validate trigger value based on trigger type
function validateTriggerValue(triggerType, value) {
  const numValue = parseFloat(value);

  if (isNaN(numValue)) {
    return {
      isValid: false,
      message: "Trigger value must be a number",
    };
  }

  if (numValue < 0) {
    return {
      isValid: false,
      message: "Trigger value cannot be negative",
    };
  }

  switch (triggerType) {
    case "mission-time":
    case "phase-time":
      return {
        isValid: true,
        message: "Value in seconds",
      };
    case "altitude":
      return {
        isValid: true,
        message: "Value in meters",
      };
    default:
      return {
        isValid: false,
        message: "Invalid trigger type",
      };
  }
}

// Function to reset form fields
function resetSequenceForm() {
  const form = document.getElementById("sequence-form");
  if (!form) return;

  // Reset Event Flag dropdown to first option
  const eventFlagDropdown = document.getElementById("event-flag");
  if (eventFlagDropdown) {
    eventFlagDropdown.selectedIndex = 0;
  }

  // Reset Trigger Type dropdown
  const triggerTypeDropdown = document.getElementById("trigger-type");
  if (triggerTypeDropdown) {
    triggerTypeDropdown.selectedIndex = 0;
  }

  // Clear Trigger Value
  const triggerValue = document.getElementById("trigger-value");
  if (triggerValue) {
    triggerValue.value = "";
    triggerValue.placeholder = "Enter value";
  }

  // Reset Reference Flag to None
  const referenceFlag = document.getElementById("dependent-event");
  if (referenceFlag) {
    referenceFlag.selectedIndex = 0;
  }

  // Clear Comment
  const comment = document.getElementById("event-comment");
  if (comment) {
    comment.value = "";
  }

  // Remove any error styling
  form.querySelectorAll(".error-field").forEach((field) => {
    field.classList.remove("error-field");
  });
}

// Add styles for the optgroups in the reference flag dropdown
const style = document.createElement("style");
style.textContent = `
    .input-field optgroup {
        background-color: #1a1a1a;
        color: #888;
        font-size: 0.9em;
        padding: 5px;
        border-bottom: 1px solid #333;
    }
    
    .input-field option {
        background-color: #2a2a2a;
        color: #fff;
        padding: 8px;
    }
    
    .input-field option:hover {
        background-color: #3a3a3a;
    }
`;
document.head.appendChild(style);

// Make finalMissionData accessible globally
window.finalMissionData = finalMissionData;
window.flagRegistry = flagRegistry;

// Function to populate event flag dropdown based on event type
function populateEventFlagDropdown(eventType) {
  const dropdown = document.getElementById("event-flag");
  const eventFlagContainer = dropdown.parentElement;

  console.log("Attempting to populate dropdown for event type:", eventType);
  console.log("Current flagRegistry state:", flagRegistry);

  // Handle heat shield separation differently
  if (eventType === "heat-shield-separation") {
    // Create readonly input if it doesn't exist
    if (!document.getElementById("heat-shield-flag")) {
      const input = document.createElement("input");
      input.type = "text";
      input.id = "heat-shield-flag";
      input.className = "input-field";
      input.value = "HSS_Flag";
      input.readOnly = true;

      // Replace dropdown with input
      dropdown.style.display = "none";
      eventFlagContainer.appendChild(input);
    }
    return;
  }

  // For other event types, show dropdown and remove readonly input if it exists
  const heatShieldInput = document.getElementById("heat-shield-flag");
  if (heatShieldInput) {
    heatShieldInput.remove();
  }
  dropdown.style.display = "block";

  // Clear existing options except the first one
  while (dropdown.options.length > 1) {
    dropdown.remove(1);
  }

  // Get appropriate flags based on event type
  let flags = [];
  switch (eventType) {
    case "stage-start":
      // Only show flags for saved stages
      flags = savedStages.map((stage) => `ST_${stage.stage_number}_INI`);
      break;
    case "stage-separation":
      // Only show flags for saved stages
      flags = savedStages.map((stage) => `ST_${stage.stage_number}_SEP`);
      break;
    case "motor-ignition":
      // Get ignition flags from the motor flag registry
      console.log(
        "Motor Ignition tab selected, flagRegistry.motors:",
        flagRegistry.motors
      );
      if (
        flagRegistry &&
        flagRegistry.motors &&
        flagRegistry.motors.length > 0
      ) {
        console.log("Using flags from flagRegistry.motors");
        flagRegistry.motors.forEach((motor) => {
          flags.push(motor.flags.ignition);
        });
      } else {
        console.log("Falling back to savedStages for motor flags");
        // Fallback to generate from savedStages if flagRegistry is not populated
        savedStages.forEach((stage) => {
          if (stage.motors && stage.motors.length > 0) {
            console.log(
              `Stage ${stage.stage_number} has ${stage.motors.length} motors`
            );
            stage.motors.forEach((motor, index) => {
              const motorNum = index + 1;
              flags.push(`S${stage.stage_number}_M${motorNum}_IGN`);
            });
          } else {
            console.log(`Stage ${stage.stage_number} has no motors defined`);
          }
        });
      }
      break;
    case "motor-termination":
      // Get burnout flags from the motor flag registry
      if (
        flagRegistry &&
        flagRegistry.motors &&
        flagRegistry.motors.length > 0
      ) {
        flagRegistry.motors.forEach((motor) => {
          flags.push(motor.flags.burnout);
        });
      } else {
        // Fallback to generate from savedStages if flagRegistry is not populated
        savedStages.forEach((stage) => {
          if (stage.motors && stage.motors.length > 0) {
            stage.motors.forEach((motor, index) => {
              const motorNum = index + 1;
              flags.push(`S${stage.stage_number}_M${motorNum}_Burnout`);
            });
          }
        });
      }
      break;
  }

  console.log(`Final flags array for ${eventType}:`, flags);

  // Add options to dropdown
  flags.forEach((flag) => {
    const option = document.createElement("option");
    option.value = flag;
    option.textContent = flag;
    dropdown.appendChild(option);
  });

  console.log(
    `Populated event flag dropdown for ${eventType} with flags:`,
    flags
  );
}
