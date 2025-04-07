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
  burnTimeIdentifiers: [], // ST_1_INI, ST_2_INI, etc.
  separationFlags: [], // ST_1_SEP, ST_2_SEP, etc.
  motorIgnitionFlags: [], // S1_M1_IGN, S1_M2_IGN, etc.
  motorBurnoutFlags: [], // S1_M1_Burnout, S1_M2_Burnout, etc.
  heatShieldFlags: [], // Heat shield separation flags
};

// Global array to store saved stages
let savedStages = [];

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

  // Add event listener for sequence form
  const addEventBtn = document.getElementById("add-event-btn");
  if (addEventBtn) {
    addEventBtn.addEventListener("click", function (e) {
      e.preventDefault();
      if (validateSequenceForm()) {
        addEventToList();
        saveSequenceData();
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
          title: "Event added successfully!",
        });
      }
    });
  }

  // Add event listener for steering form
  const addSteeringEventBtn = document.getElementById("add-event-btn");
  if (addSteeringEventBtn) {
    addSteeringEventBtn.addEventListener("click", function (e) {
      e.preventDefault();
      if (validateSteeringForm()) {
        addSteeringEventToList();
        saveSteeringData();
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
          title: "Steering event added successfully!",
        });
      }
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

  // Log the mission details as JSON
  console.log("Mission Details JSON:", JSON.stringify(missionData, null, 2));
  console.log("Final Mission Data:", JSON.stringify(finalMissionData, null, 2));
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

  // Add wind data to EARTH section if needed
  if (!finalMissionData.EARTH.Wind) {
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

  // Log the environment details as JSON
  console.log(
    "Environment Details JSON:",
    JSON.stringify(missionData.environment, null, 2)
  );
}

function appendVehicleDetails() {
  const vehicleName = document.getElementById("vehicle-name").value.trim();
  const vehicleType = document.getElementById("vehicle-type").value;

  // Update the form-based structure
  missionData.vehicle = {
    name: vehicleName,
    type: vehicleType,
    payload: {
      name: document.getElementById("payload-name").value,
      mass: parseFloat(document.getElementById("payload-mass").value),
    },
    plf: {
      name: document.getElementById("plf-name").value,
      mass: parseFloat(document.getElementById("plf-mass").value),
      separation: {
        type: document.querySelector('input[name="plf-separation"]:checked')
          .value,
        value: parseFloat(document.getElementById("plf-sep-value").value),
        flag: document.getElementById("hss-flag").value,
      },
    },
    integration: {
      method: document.getElementById("integration-method").value,
      time_step: parseFloat(document.getElementById("time-step").value),
      effective_altitude: parseFloat(
        document.getElementById("effective-alt").value
      ),
    },
  };

  // Add heat shield separation flag to registry
  updateHeatShieldFlag(document.getElementById("hss-flag").value);

  // Update the target JSON structure
  finalMissionData.SSPO.vehicle = [vehicleName];
  finalMissionData[vehicleName] = {
    ...finalMissionData[vehicleName],
    vehicle_type: vehicleType,
    payload: missionData.vehicle.payload.name,
    plf: missionData.vehicle.plf.name,
    integration_method: missionData.vehicle.integration.method,
    time_step: missionData.vehicle.integration.time_step,
    effective_altitude: missionData.vehicle.integration.effective_altitude,
  };

  // Log the vehicle details as JSON
  console.log(
    "Vehicle Details JSON:",
    JSON.stringify(missionData.vehicle, null, 2)
  );
}

function saveStageData(stageForm, stageId) {
  const stageNumber = stageId.replace("stage", "");
  const vehicleName = document.getElementById("vehicle-name").value.trim();
  const stageName = `Stage_${stageNumber}`;

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
  const coastingToggle = stageForm.querySelector(`#coasting-toggle-${stageId}`);
  const aeroFilename = stageForm.querySelector(`#aero-filename-${stageId}`);

  if (!structuralMassInput || !referenceAreaInput || !burnTimeInput) {
    return null;
  }

  const burnTimeIdentifier = burnTimeIdentifierInput
    ? burnTimeIdentifierInput.value
    : `ST_${stageNumber}_INI`;
  const separationFlag = separationFlagInput
    ? separationFlagInput.value
    : `ST_${stageNumber}_SEP`;

  const stageData = {
    stage_number: parseInt(stageNumber),
    structural_mass: parseFloat(structuralMassInput.value) || 0,
    reference_area: parseFloat(referenceAreaInput.value) || 0,
    burn_time: parseFloat(burnTimeInput.value) || 0,
    burn_time_identifier: burnTimeIdentifier,
    separation_flag: separationFlag,
    dciss: dcissToggle ? dcissToggle.checked : false,
    coasting: coastingToggle ? coastingToggle.checked : false,
    aero_data_file: aeroFilename ? aeroFilename.value : "",
  };

  // Update flag registry with this stage's flags
  updateFlagRegistry(stageNumber, burnTimeIdentifier, separationFlag);

  // Add the stage to savedStages array if it's not already there
  const stageIndex = savedStages.findIndex(
    (s) => s.stage_number === parseInt(stageNumber)
  );
  if (stageIndex === -1) {
    savedStages.push(stageData);
  } else {
    savedStages[stageIndex] = stageData;
  }

  // Sort savedStages by stage_number
  savedStages.sort((a, b) => a.stage_number - b.stage_number);

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
      ...finalMissionData[stageName],
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
  }

  // Log the stage data as JSON
  console.log(
    `Stage ${stageNumber} Data JSON:`,
    JSON.stringify(stageData, null, 2)
  );
  return stageData;
}

function saveSequenceData() {
  const sequenceData = {
    events: [],
  };

  // Get all events from the event list
  const eventList = document.getElementById("event-list");
  const events = eventList.querySelectorAll(".event-item");

  events.forEach((event) => {
    const eventData = {
      type: event.getAttribute("data-event-type"),
      flag: event.querySelector(".event-flag").textContent,
      trigger_type: event.querySelector(".trigger-type").textContent,
      trigger_value: parseFloat(
        event.querySelector(".trigger-value").textContent
      ),
      reference_flag: event.querySelector(".reference-flag").textContent,
      comment: event.querySelector(".event-comment").textContent,
    };
    sequenceData.events.push(eventData);
  });

  // Update the target JSON structure
  const vehicleName = document.getElementById("vehicle-name").value.trim();
  if (vehicleName) {
    finalMissionData[vehicleName].sequence = sequenceData;
  }

  // Log the sequence data as JSON
  console.log("Sequence Data JSON:", JSON.stringify(sequenceData, null, 2));
}

// Form validation functions
function validateMissionForm() {
  const validation = FormValidator.validateMissionForm();

  if (!validation.isValid) {
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
      icon: "error",
      title: "Validation Errors",
      html: validation.errors.join("<br>"),
    });

    return false;
  }

  return true;
}

function validateEnvironmentForm() {
  const validation = FormValidator.validateEnvironmentForm();

  if (!validation.isValid) {
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
      icon: "error",
      title: "Validation Errors",
      html: validation.errors.join("<br>"),
    });

    return false;
  }

  return true;
}

function validateVehicleForm() {
  const validation = FormValidator.validateVehicleForm();

  if (!validation.isValid) {
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
      icon: "error",
      title: "Validation Errors",
      html: validation.errors.join("<br>"),
    });

    return false;
  }

  return true;
}

function validateSequenceForm() {
  const validation = FormValidator.validateSequenceForm();

  if (!validation.isValid) {
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
      icon: "error",
      title: "Validation Errors",
      html: validation.errors.join("<br>"),
    });

    return false;
  }

  return true;
}

function validateSteeringForm() {
  const validation = FormValidator.validateSteeringForm();

  if (!validation.isValid) {
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
      icon: "error",
      title: "Validation Errors",
      html: validation.errors.join("<br>"),
    });

    return false;
  }

  return true;
}

// Function to update the flag registry with stage flags
function updateFlagRegistry(stageNumber, burnTimeId, sepFlag) {
  // Find if this stage's flags already exist
  const burnTimeIndex = flagRegistry.burnTimeIdentifiers.findIndex(
    (flag) => flag.stageNumber === parseInt(stageNumber)
  );
  const sepFlagIndex = flagRegistry.separationFlags.findIndex(
    (flag) => flag.stageNumber === parseInt(stageNumber)
  );

  // Update burn time identifier
  if (burnTimeIndex >= 0) {
    flagRegistry.burnTimeIdentifiers[burnTimeIndex].flag = burnTimeId;
  } else {
    flagRegistry.burnTimeIdentifiers.push({
      stageNumber: parseInt(stageNumber),
      flag: burnTimeId,
    });
  }

  // Update separation flag
  if (sepFlagIndex >= 0) {
    flagRegistry.separationFlags[sepFlagIndex].flag = sepFlag;
  } else {
    flagRegistry.separationFlags.push({
      stageNumber: parseInt(stageNumber),
      flag: sepFlag,
    });
  }

  // Sort flags by stage number
  flagRegistry.burnTimeIdentifiers.sort(
    (a, b) => a.stageNumber - b.stageNumber
  );
  flagRegistry.separationFlags.sort((a, b) => a.stageNumber - b.stageNumber);

  // Log updated registry for debugging
  console.log("Updated Flag Registry:", JSON.stringify(flagRegistry, null, 2));
}

// Function to update heat shield flag in registry
function updateHeatShieldFlag(flag) {
  // Clear existing heat shield flags and add the new one
  flagRegistry.heatShieldFlags = [{ flag: flag }];
}

// Function to register a motor's ignition and burnout flags
function registerMotorFlags(
  stageNumber,
  motorNumber,
  ignitionFlag,
  burnoutFlag
) {
  // Find if this motor's flags already exist
  const ignitionIndex = flagRegistry.motorIgnitionFlags.findIndex(
    (flag) =>
      flag.stageNumber === parseInt(stageNumber) &&
      flag.motorNumber === parseInt(motorNumber)
  );

  const burnoutIndex = flagRegistry.motorBurnoutFlags.findIndex(
    (flag) =>
      flag.stageNumber === parseInt(stageNumber) &&
      flag.motorNumber === parseInt(motorNumber)
  );

  // Update ignition flag
  if (ignitionIndex >= 0) {
    flagRegistry.motorIgnitionFlags[ignitionIndex].flag = ignitionFlag;
  } else {
    flagRegistry.motorIgnitionFlags.push({
      stageNumber: parseInt(stageNumber),
      motorNumber: parseInt(motorNumber),
      flag: ignitionFlag,
    });
  }

  // Update burnout flag
  if (burnoutIndex >= 0) {
    flagRegistry.motorBurnoutFlags[burnoutIndex].flag = burnoutFlag;
  } else {
    flagRegistry.motorBurnoutFlags.push({
      stageNumber: parseInt(stageNumber),
      motorNumber: parseInt(motorNumber),
      flag: burnoutFlag,
    });
  }

  // Sort flags by stage number and then motor number
  flagRegistry.motorIgnitionFlags.sort((a, b) => {
    if (a.stageNumber === b.stageNumber) {
      return a.motorNumber - b.motorNumber;
    }
    return a.stageNumber - b.stageNumber;
  });

  flagRegistry.motorBurnoutFlags.sort((a, b) => {
    if (a.stageNumber === b.stageNumber) {
      return a.motorNumber - b.motorNumber;
    }
    return a.stageNumber - b.stageNumber;
  });

  console.log(
    "Updated Motor Flag Registry:",
    JSON.stringify(
      {
        ignition: flagRegistry.motorIgnitionFlags,
        burnout: flagRegistry.motorBurnoutFlags,
      },
      null,
      2
    )
  );
}

// Function to save motor data and register its flags
function saveMotorData(motorForm, stageNumber, motorNumber) {
  // Extract motor data from form
  const motorName = motorForm.querySelector(
    'input[placeholder="Motor Name"]'
  )?.value;
  const ignitionFlag =
    motorForm.querySelector('input[value^="S"]')?.value ||
    `S${stageNumber}_M${motorNumber}_IGN`;
  const burnoutFlag = `S${stageNumber}_M${motorNumber}_BURNOUT`;

  // Register motor flags
  registerMotorFlags(stageNumber, motorNumber, ignitionFlag, burnoutFlag);

  // Return motor data
  const motorData = {
    name: motorName,
    ignition_flag: ignitionFlag,
    burnout_flag: burnoutFlag,
    // Add other motor properties as needed
  };

  console.log(
    `Motor S${stageNumber}_M${motorNumber} Data:`,
    JSON.stringify(motorData, null, 2)
  );
  return motorData;
}

function saveSteeringData() {
  const steeringData = {
    events: [],
  };

  // Get all events from the event list
  const eventList = document.getElementById("event-list");
  const events = eventList.querySelectorAll(".event-item");

  events.forEach((event) => {
    const eventData = {
      type: event.getAttribute("data-event-type"),
      flag: event.querySelector(".event-flag").textContent,
      trigger_type: event.querySelector(".trigger-type").textContent,
      trigger_value: parseFloat(
        event.querySelector(".trigger-value").textContent
      ),
      reference_flag: event.querySelector(".reference-flag").textContent,
      comment: event.querySelector(".event-comment").textContent,
    };
    steeringData.events.push(eventData);
  });

  // Update the target JSON structure
  const vehicleName = document.getElementById("vehicle-name").value.trim();
  if (vehicleName) {
    finalMissionData[vehicleName].steering = steeringData;
  }

  // Log the steering data as JSON
  console.log("Steering Data JSON:", JSON.stringify(steeringData, null, 2));
}

function addSteeringEventToList() {
  const eventList = document.getElementById("event-list");
  const eventType = document.getElementById("event-type").value;
  const eventFlag = document.getElementById("event-flag").value;
  const triggerType = document.getElementById("trigger-type").value;
  const triggerValue = document.getElementById("trigger-value").value;
  const referenceFlag = document.getElementById("dependent-event").value;
  const comment = document.getElementById("event-comment").value;

  const eventItem = document.createElement("div");
  eventItem.className = "event-item";
  eventItem.setAttribute("data-event-type", eventType);

  eventItem.innerHTML = `
    <div class="event-content">
      <span class="event-flag">${eventFlag}</span>
      <span class="trigger-type">${triggerType}</span>
      <span class="trigger-value">${triggerValue}</span>
      <span class="reference-flag">${referenceFlag}</span>
      <span class="event-comment">${comment}</span>
    </div>
    <div class="event-actions">
      <button class="edit-event">Edit</button>
      <button class="delete-event">Delete</button>
    </div>
  `;

  eventList.appendChild(eventItem);

  // Clear form fields after adding event
  document.getElementById("event-flag").value = "";
  document.getElementById("trigger-type").value = "";
  document.getElementById("trigger-value").value = "";
  document.getElementById("dependent-event").value = "";
  document.getElementById("event-comment").value = "";
}

// Make finalMissionData accessible globally
window.finalMissionData = finalMissionData;
window.flagRegistry = flagRegistry;
