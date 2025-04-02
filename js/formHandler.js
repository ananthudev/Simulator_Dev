document.addEventListener("DOMContentLoaded", function () {
    const missionForm = document.getElementById("mission-form");
    const enviroForm = document.getElementById("enviro-form");
    const vehicleForm = document.getElementById("vehicle-form");
    const saveMissionButton = document.getElementById("save-mission");
    const saveEnviroButton = enviroForm?.querySelector(".next-btn");
    const saveVehicleButton = vehicleForm?.querySelector(".next-btn");




    let missionData = {}; // Store the complete mission JSON structure
    let stageCounter = 1; // Track the number of stages

    // Mission Form Submission
    if (saveMissionButton && missionForm) {
        saveMissionButton.addEventListener("click", function (event) {
            event.preventDefault();
            let isValid = validateMissionForm();

            if (isValid) {
                console.log("✅ Mission Form Validated!");
                missionData = saveMissionDetails();

                Swal.fire({
                    title: "Mission Saved!",
                    text: "Mission details saved successfully.",
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    showForm(enviroForm);
                    console.log("Navigating to Environment Form");
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
                console.log("✅ Environment Form Validated!");
                appendEnviroDetails();

                Swal.fire({
                    title: "Environment Saved!",
                    text: "Environment details saved successfully.",
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    showForm(vehicleForm);
                    console.log("Navigating to Vehicle Form");
                });
            }
        });
    }

    // Vehicle Form Submission
    if (saveVehicleButton && vehicleForm) {
        saveVehicleButton.addEventListener("click", function (event) {
            event.preventDefault();
            let isValid = validateVehicleForm();

            if (isValid) {
                console.log("✅ Vehicle Form Validated!");
                appendVehicleDetails();

                Swal.fire({
                    title: "Vehicle Saved!",
                    text: "Vehicle configuration saved successfully.",
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    console.log("✅ Complete Mission Data:", JSON.stringify(missionData, null, 2));
                    // Here you would typically proceed to the next step or submit the data

                    const firstStageForm = document.getElementById("stage1-form");
                    if (firstStageForm) {
                        showForm(firstStageForm);
                        console.log("Navigating to Stage 1 Form");
                    }
                });
            }
        });
    }
    document.addEventListener("click", function(event) {
        if (event.target && event.target.classList.contains("next-stage-btn")) {
            event.preventDefault();
            
            // Find the current stage form
            const currentStageForm = event.target.closest(".stage-form");
            if (!currentStageForm) return;
            
            // Extract the stage ID from the form ID (e.g., "stage1-form" -> "stage1")
            const stageId = currentStageForm.id.replace("-form", "");
            const stageNumber = stageId.replace("stage", "");
            
            // Validate the current stage form
            let isValid = validateStageForm(currentStageForm, stageId);
            
            if (isValid) {
                console.log(`✅ Stage ${stageNumber} Form Validated!`);
                
                // Call the saveStageData function to save stage data to missionData
                const savedStageData = saveStageData(currentStageForm, stageId);
                
                if (savedStageData) {
                    Swal.fire({
                        title: "Stage Saved!",
                        text: `Stage ${stageNumber} configuration saved successfully.`,
                        icon: "success",
                        timer: 1500,
                        showConfirmButton: false
                    }).then(() => {
                        // Determine next form to show
                        const nextStageNumber = parseInt(stageNumber) + 1;
                        const nextStageForm = document.getElementById(`stage${nextStageNumber}-form`);
                        
                        if (nextStageForm) {
                            showForm(nextStageForm);
                            console.log(`Navigating to Stage ${nextStageNumber} Form`);
                        } else {
                            // If no next stage, you might want to show a completion message or go somewhere else
                            console.log("No more stages to configure");
                            
                            // Print the complete mission data at this point
                            console.log("✅ Complete Mission Data:", JSON.stringify(missionData, null, 2));
                            
                            Swal.fire({
                                title: "All Stages Configured!",
                                text: "You have completed all stage configurations.",
                                icon: "success"
                            });
                        }
                    });
                } else {
                    // Handle case where stage data couldn't be saved
                    console.error(`❌ Failed to save data for Stage ${stageNumber}`);
                    Swal.fire({
                        title: "Error",
                        text: `Failed to save stage ${stageNumber} configuration.`,
                        icon: "error"
                    });
                }
            }
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
        const stoppingCondition = document.querySelector("input[name='stopping-condition']:checked");

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
            showError(document.querySelector(".radio-group"), "Please select a stopping condition.");
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
            showError(atmosModel, "Please select an atmospheric model or upload a CSV.");
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

        if (!timeStep.value || isNaN(timeStep.value) || parseFloat(timeStep.value) <= 0) {
            showError(timeStep, "Please enter a valid time step (>0).");
            isValid = false;
        }

        // Payload validation
        if (!payloadMass.value || isNaN(payloadMass.value) || parseFloat(payloadMass.value) <= 0) {
            showError(payloadMass, "Please enter a valid payload mass (>0).");
            isValid = false;
        }

        if (!plfMass.value || isNaN(plfMass.value) || parseFloat(plfMass.value) <= 0) {
            showError(plfMass, "Please enter a valid PLF mass (>0).");
            isValid = false;
        }

        if (!plfSepValue.value || isNaN(plfSepValue.value) || parseFloat(plfSepValue.value) <= 0) {
            showError(plfSepValue, "Please enter a valid separation value (>0).");
            isValid = false;
        }

        // Validate dynamic fields based on vehicle type
        if (vehicleType.value === "ascend" || vehicleType.value === "projectile") {
            const dataMethod = document.querySelector('input[name="data-method"]:checked');
            if (!dataMethod) {
                showError(document.querySelector("#data-options .radio-group"), "Please select a data input method.");
                isValid = false;
            } else if (dataMethod.value === "states") {
                // Validate state fields
                const stateFields = ["X", "Y", "Z", "U", "V", "W", "q0", "q1", "q2", "q3"];
                stateFields.forEach(field => {
                    const element = document.getElementById(field);
                    if (!element.value || isNaN(element.value)) {
                        showError(element, `Please enter a valid ${field} value.`);
                        isValid = false;
                    }
                });
            } else if (dataMethod.value === "launch") {
                // Validate launch fields based on vehicle type
                const launchFields = vehicleType.value === "ascend" ?
                    ["lat", "long", "azimuth", "msl", "lp-height", "launch-angle", "roll", "pitch", "yaw"] :
                    ["lat-proj", "long-proj", "msl-proj", "azimuth-proj", "elevation", "launch-angle-proj", "initial-velocity"];
                
                launchFields.forEach(field => {
                    const element = document.getElementById(field);
                    if (!element.value || isNaN(element.value)) {
                        showError(element, `Please enter a valid ${field.replace('-', ' ')} value.`);
                        isValid = false;
                    }
                });
            }
        } else if (vehicleType.value === "orbital") {
            const orbitalMethod = document.querySelector('input[name="orbital-method"]:checked');
            if (!orbitalMethod) {
                showError(document.querySelector("#orbital-options .radio-group"), "Please select an orbital data type.");
                isValid = false;
            } else {
                // Validate orbital fields based on selected method
                if (orbitalMethod.value === "state") {
                    const stateFields = ["X-orbital", "Y-orbital", "Z-orbital", "U-orbital", "V-orbital", "W-orbital", "q0-orbital", "q1-orbital", "q2-orbital", "q3-orbital"];
                    stateFields.forEach(field => {
                        const element = document.getElementById(field);
                        if (!element.value || isNaN(element.value)) {
                            showError(element, `Please enter a valid ${field.replace('-orbital', '')} value.`);
                            isValid = false;
                        }
                    });
                } else if (orbitalMethod.value === "tle") {
                    const tleFields = ["line1", "line2", "start-time", "stop-time", "step-time"];
                    tleFields.forEach(field => {
                        const element = document.getElementById(field);
                        if (!element.value) {
                            showError(element, `Please enter a valid ${field.replace('-', ' ')}.`);
                            isValid = false;
                        }
                    });
                } else if (orbitalMethod.value === "elements") {
                    const elementFields = ["semi-major-axis", "eccentricity", "inclination", "argument-perigee", "raan", "true-anomaly"];
                    elementFields.forEach(field => {
                        const element = document.getElementById(field);
                        if (!element.value || isNaN(element.value)) {
                            showError(element, `Please enter a valid ${field.replace('-', ' ')}.`);
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
        const structuralMass = stageForm.querySelector('input[placeholder="Enter Structural Mass"]');
        const referenceArea = stageForm.querySelector('input[placeholder="Enter Reference Area"]');
        const burnTime = stageForm.querySelector('input[placeholder="Enter Burn Time"]');
        const aeroFilename = stageForm.querySelector(`#aero-filename-${stageId}`);
        const burnTimeIdentifier = stageForm.querySelector('input[value^="ST_"]:not([value$="_SEP"])');
        const separationFlag = stageForm.querySelector('input[value^="ST_"][value$="_SEP"]');

        // Check if all required elements exist
        if (!structuralMass || !referenceArea || !burnTime || !aeroFilename || !burnTimeIdentifier || !separationFlag) {
            console.error("❌ Missing required elements in the stage form:", stageId);
            console.log("Elements found:", { structuralMass, referenceArea, burnTime, aeroFilename, burnTimeIdentifier, separationFlag });
            showError(stageForm, "Form structure error. Please check console for details.");
            isValid = false;
            return isValid;
        }

        // Validate Structural Mass
        if (!structuralMass.value || isNaN(structuralMass.value) || parseFloat(structuralMass.value) <= 0) {
            showError(structuralMass, "Please enter a valid structural mass (>0).");
            isValid = false;
        }

        // Validate Reference Area
        if (!referenceArea.value || isNaN(referenceArea.value) || parseFloat(referenceArea.value) <= 0) {
            showError(referenceArea, "Please enter a valid reference area (>0).");
            isValid = false;
        }

        // Validate Burn Time
        if (!burnTime.value || isNaN(burnTime.value) || parseFloat(burnTime.value) < 0) {
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


    

    

    // ========== DATA SAVING FUNCTIONS ========== //

    function saveMissionDetails() {
        return {
            mission_name: document.getElementById("mission-name").value.trim(),
            mode: document.getElementById("modes").value,
            tracking: document.getElementById("tracking").checked,
            date: document.getElementById("mission-date").value,
            time: document.getElementById("mission-time").value,
            stopping_condition: document.querySelector('input[name="stopping-condition"]:checked')?.value || null
        };
    }

    function appendEnviroDetails() {
        const csvUpload = document.getElementById("csv-upload");
        
        missionData.environment = {
            planet: document.getElementById("planets").value,
            atmospheric_model: document.getElementById("atmos-model").value !== "Environment" ? 
                document.getElementById("atmos-model").value : null,
            gravity_parameters: {
                order: parseInt(document.getElementById("order").value),
                degree: parseInt(document.getElementById("degree").value)
            },
            coe_info: document.getElementById("core").value,
            atmospheric_model_csv: csvUpload.files.length > 0 ? csvUpload.files[0].name : null
        };
    }

    function appendVehicleDetails() {
        const vehicleType = document.getElementById("vehicle-type").value;
        let vehicleConfig = {
            vehicle_name: document.getElementById("vehicle-name").value.trim(),
            vehicle_type: vehicleType,
            payload: {
                name: document.getElementById("payload-name").value,
                mass: parseFloat(document.getElementById("payload-mass").value)
            },
            plf: {
                name: document.getElementById("plf-name").value,
                mass: parseFloat(document.getElementById("plf-mass").value),
                separation: {
                    condition: document.querySelector('input[name="plf-separation"]:checked').value,
                    value: parseFloat(document.getElementById("plf-sep-value").value)
                }
            },
            integration: {
                method: document.getElementById("integration-method").value,
                time_step: parseFloat(document.getElementById("time-step").value)
            },
            effective_altitude: document.getElementById("effective-alt").value ? 
                parseFloat(document.getElementById("effective-alt").value) : null
        };

        // Add configuration based on vehicle type
        if (vehicleType === "ascend" || vehicleType === "projectile") {
            const dataMethod = document.querySelector('input[name="data-method"]:checked').value;
            vehicleConfig.initial_conditions = { method: dataMethod };

            if (dataMethod === "states") {
                vehicleConfig.initial_conditions.states = {
                    position: [
                        parseFloat(document.getElementById("X").value),
                        parseFloat(document.getElementById("Y").value),
                        parseFloat(document.getElementById("Z").value)
                    ],
                    velocity: [
                        parseFloat(document.getElementById("U").value),
                        parseFloat(document.getElementById("V").value),
                        parseFloat(document.getElementById("W").value)
                    ],
                    quaternion: [
                        parseFloat(document.getElementById("q0").value),
                        parseFloat(document.getElementById("q1").value),
                        parseFloat(document.getElementById("q2").value),
                        parseFloat(document.getElementById("q3").value)
                    ]
                };
            } else if (dataMethod === "launch") {
                if (vehicleType === "ascend") {
                    vehicleConfig.initial_conditions.launch_point = {
                        latitude: parseFloat(document.getElementById("lat").value),
                        longitude: parseFloat(document.getElementById("long").value),
                        azimuth: parseFloat(document.getElementById("azimuth").value),
                        msl: parseFloat(document.getElementById("msl").value),
                        lp_height: parseFloat(document.getElementById("lp-height").value),
                        launch_angle: parseFloat(document.getElementById("launch-angle").value),
                        initial_orientation: {
                            roll: parseFloat(document.getElementById("roll").value),
                            pitch: parseFloat(document.getElementById("pitch").value),
                            yaw: parseFloat(document.getElementById("yaw").value)
                        }
                    };
                } else { // projectile
                    vehicleConfig.initial_conditions.launch_point = {
                        latitude: parseFloat(document.getElementById("lat-proj").value),
                        longitude: parseFloat(document.getElementById("long-proj").value),
                        msl: parseFloat(document.getElementById("msl-proj").value),
                        azimuth: parseFloat(document.getElementById("azimuth-proj").value),
                        elevation: parseFloat(document.getElementById("elevation").value),
                        launch_angle: parseFloat(document.getElementById("launch-angle-proj").value),
                        initial_velocity: parseFloat(document.getElementById("initial-velocity").value)
                    };
                }
            }
        } else if (vehicleType === "orbital") {
            const orbitalMethod = document.querySelector('input[name="orbital-method"]:checked').value;
            vehicleConfig.initial_conditions = { method: orbitalMethod };

            if (orbitalMethod === "state") {
                vehicleConfig.initial_conditions.states = {
                    position: [
                        parseFloat(document.getElementById("X-orbital").value),
                        parseFloat(document.getElementById("Y-orbital").value),
                        parseFloat(document.getElementById("Z-orbital").value)
                    ],
                    velocity: [
                        parseFloat(document.getElementById("U-orbital").value),
                        parseFloat(document.getElementById("V-orbital").value),
                        parseFloat(document.getElementById("W-orbital").value)
                    ],
                    quaternion: [
                        parseFloat(document.getElementById("q0-orbital").value),
                        parseFloat(document.getElementById("q1-orbital").value),
                        parseFloat(document.getElementById("q2-orbital").value),
                        parseFloat(document.getElementById("q3-orbital").value)
                    ]
                };
            } else if (orbitalMethod === "tle") {
                vehicleConfig.initial_conditions.tle = {
                    line1: document.getElementById("line1").value,
                    line2: document.getElementById("line2").value,
                    start_time: parseFloat(document.getElementById("start-time").value),
                    stop_time: parseFloat(document.getElementById("stop-time").value),
                    step_time: parseFloat(document.getElementById("step-time").value)
                };
            } else if (orbitalMethod === "elements") {
                vehicleConfig.initial_conditions.orbital_elements = {
                    semi_major_axis: parseFloat(document.getElementById("semi-major-axis").value),
                    eccentricity: parseFloat(document.getElementById("eccentricity").value),
                    inclination: parseFloat(document.getElementById("inclination").value),
                    argument_of_perigee: parseFloat(document.getElementById("argument-perigee").value),
                    raan: parseFloat(document.getElementById("raan").value),
                    true_anomaly: parseFloat(document.getElementById("true-anomaly").value)
                };
            }
        }

        missionData.vehicle = vehicleConfig;
    }


    // Function to save stage data
    // Function to save stage data - IMPROVED WITH ERROR HANDLING
    function saveStageData(stageForm, stageId) {
        const stageNumber = stageId.replace("stage", "");
        
        // If stages array doesn't exist in mission data, create it
        if (!missionData.stages) {
            missionData.stages = [];
        }
        
        // Debug log to check form and elements
        console.log(`Saving data for stage ${stageNumber}`, stageForm);
        
        // Get the stage form elements with error handling
        const structuralMassInput = stageForm.querySelector('input[placeholder="Enter Structural Mass"]');
        const referenceAreaInput = stageForm.querySelector('input[placeholder="Enter Reference Area"]');
        const burnTimeInput = stageForm.querySelector('input[placeholder="Enter Burn Time"]');
        const burnTimeIdentifierInput = stageForm.querySelector('input[value^="ST_"]:not([value$="_SEP"])');
        const separationFlagInput = stageForm.querySelector('input[value^="ST_"][value$="_SEP"]');
        const dcissToggle = stageForm.querySelector(`#dciss-toggle-${stageId}`);
        const coastingToggle = stageForm.querySelector(`#coasting-toggle-${stageId}`);
        const aeroFilename = stageForm.querySelector(`#aero-filename-${stageId}`);
        
        // Check if essential elements are found
        if (!structuralMassInput || !referenceAreaInput || !burnTimeInput) {
            console.error("❌ Missing critical elements in the stage form:", stageId);
            console.log("Elements found:", { 
                structuralMassInput, 
                referenceAreaInput, 
                burnTimeInput, 
                burnTimeIdentifierInput, 
                separationFlagInput, 
                dcissToggle, 
                coastingToggle, 
                aeroFilename 
            });
            return null;
        }
        
        // Get the stage data from the form with safe fallbacks
        const stageData = {
            stage_number: parseInt(stageNumber),
            structural_mass: parseFloat(structuralMassInput.value) || 0,
            reference_area: parseFloat(referenceAreaInput.value) || 0,
            burn_time: parseFloat(burnTimeInput.value) || 0,
            burn_time_identifier: burnTimeIdentifierInput ? burnTimeIdentifierInput.value : `ST_${stageNumber}`,
            separation_flag: separationFlagInput ? separationFlagInput.value : `ST_${stageNumber}_SEP`,
            dciss: dcissToggle ? dcissToggle.checked : false,
            coasting: coastingToggle ? coastingToggle.checked : false,
            aero_data_file: aeroFilename ? aeroFilename.value : ""
        };
        
        // Add or update the stage data in the stages array
        const existingStageIndex = missionData.stages.findIndex(s => s.stage_number === parseInt(stageNumber));
        if (existingStageIndex >= 0) {
            missionData.stages[existingStageIndex] = stageData;
        } else {
            missionData.stages.push(stageData);
        }
        
        console.log(`✅ Stage ${stageNumber} data saved:`, stageData);
        console.log("📦 Updated mission data:", missionData);
        
        return stageData;
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
        document.querySelectorAll(".error-message").forEach(el => el.remove());
    }
});

function showForm(form) {
    if (!form) {
        console.error("❌ showForm() called with null or undefined form!");
        return;
    }
    
    document.querySelectorAll("form").forEach(f => f.classList.add("hidden-form"));
    form.classList.remove("hidden-form");
    console.log("✅ Navigating to form:", form.id);
}


// Stage Validation and json printing starts

// Add event listener for file uploads on stage forms
document.addEventListener("click", function(event) {
    if (event.target.id && event.target.id.startsWith("aero-upload-btn-")) {
        event.preventDefault(); // Prevent default to stop page refresh
        const stageId = event.target.id.replace("aero-upload-btn-", "");
        const fileInput = document.getElementById(`aero-upload-${stageId}`);
        
        if (!fileInput) {
            console.error(`❌ File input element not found: aero-upload-${stageId}`);
            return;
        }
        
        // Remove any existing listeners before adding a new one
        const newFileInput = fileInput.cloneNode(true);
        fileInput.parentNode.replaceChild(newFileInput, fileInput);
        
        // Add click handler
        newFileInput.addEventListener("click", function(e) {
            e.stopPropagation(); // Prevent event bubbling
        });
        
        // Add change listener
        newFileInput.addEventListener("change", function() {
            const filenameDisplay = document.getElementById(`aero-filename-${stageId}`);
            if (!filenameDisplay) {
                console.error(`❌ Filename display element not found: aero-filename-${stageId}`);
                return;
            }
            
            if (newFileInput.files.length > 0) {
                filenameDisplay.value = newFileInput.files[0].name;
                console.log(`✅ File selected: ${newFileInput.files[0].name}`);
            } else {
                filenameDisplay.value = "";
                filenameDisplay.placeholder = "No file chosen";
                console.log("❌ No file selected");
            }
        });
        
        // Trigger file selection dialog
        newFileInput.click();
    }
});