# Open Mission Implementation Guide

## Overview

This guide details how to implement the remaining components of the Open Mission functionality, which allows users to load saved mission configurations from JSON files. The following components are already implemented:

- Mission details form
- Environment form
- Stages forms
- CSV parsing for wind data and aero data

## Pending Implementation Components

1. Motors data (propulsion type, mass, nozzle diameter, thrust time CSV)
2. Nozzles data
3. Event sequence data
4. Steering components data
5. Optimization data (objective function, constraints, mode, design variables)
6. Stopping condition data

## Implementation Details

### 1. Motors Implementation

Add the following functions to `openMissionHandler.js` to handle motor data:

```javascript
function populateMotorsData(vehicleData, stageUINumber, stageNameKey) {
  if (!vehicleData || !stageNameKey) return;

  const stageData = window.finalMissionData[stageNameKey];
  if (!stageData || !stageData.motor || !Array.isArray(stageData.motor)) {
    console.warn(`No motors found for stage: ${stageNameKey}`);
    return;
  }

  const motors = stageData.motor;
  for (let i = 0; i < motors.length; i++) {
    const motorNameKey = motors[i];
    const motorData = window.finalMissionData[motorNameKey];
    const motorUINumber = i + 1;

    if (!motorData) {
      console.warn(`Data for motor '${motorNameKey}' not found. Skipping.`);
      continue;
    }

    // Ensure motor form exists first by triggering Add Motor button
    const addMotorBtn = document.querySelector(
      `#stage${stageUINumber}-form .add-motor-btn`
    );
    if (!addMotorBtn) {
      console.warn(`Add Motor button not found for Stage ${stageUINumber}`);
      continue;
    }

    // Click to create form if it doesn't exist
    const motorForm = document.getElementById(
      `stage${stageUINumber}-motor${motorUINumber}-form`
    );
    if (!motorForm) {
      addMotorBtn.click();

      // Wait for form to be created
      setTimeout(() => {
        populateMotorFields(
          motorData,
          stageUINumber,
          motorUINumber,
          motorNameKey
        );
      }, 200);
    } else {
      populateMotorFields(
        motorData,
        stageUINumber,
        motorUINumber,
        motorNameKey
      );
    }
  }
}

function populateMotorFields(
  motorData,
  stageUINumber,
  motorUINumber,
  motorNameKey
) {
  const form = document.getElementById(
    `stage${stageUINumber}-motor${motorUINumber}-form`
  );
  if (!form) {
    console.error(
      `Motor form for stage${stageUINumber}-motor${motorUINumber} not found.`
    );
    return;
  }

  // Populate propulsion type
  const propulsionTypeSelect = form.querySelector(
    'select[id$="-propulsion-type"]'
  );
  if (propulsionTypeSelect && motorData.type_of_prop) {
    propulsionTypeSelect.value = motorData.type_of_prop; // e.g., "solid", "liquid"
  }

  // Populate propulsion mass
  const propulsionMassInput = form.querySelector(
    'input[placeholder="Enter Propulsion Mass"]'
  );
  if (propulsionMassInput && motorData.prop_mass !== undefined) {
    propulsionMassInput.value = motorData.prop_mass;
  }

  // Populate nozzle diameter
  const nozzleDiameterInput = form.querySelector(
    'input[placeholder="Enter Nozzle Diameter"]'
  );
  if (nozzleDiameterInput && motorData.nozzledia !== undefined) {
    nozzleDiameterInput.value = motorData.nozzledia;
  }

  // Handle thrust time CSV file (displaying filename if there's thrust data)
  const thrustFilenameInput = form.querySelector(
    `#thrust-filename-stage${stageUINumber}-motor${motorUINumber}`
  );
  if (
    thrustFilenameInput &&
    motorData.thr_time &&
    Array.isArray(motorData.thr_time)
  ) {
    thrustFilenameInput.value = `${motorNameKey}_thrust.csv`;

    // Show the clear button if it exists
    const clearThrustBtn = form.querySelector(".clear-thrust-btn");
    if (clearThrustBtn) clearThrustBtn.style.display = "block";
  }

  // After populating, populate associated nozzle(s)
  if (motorData.nozzle) {
    populateNozzleData(motorData.nozzle, stageUINumber, motorUINumber);
  }
}
```

### 2. Nozzles Implementation

Add this function to handle nozzle data:

```javascript
function populateNozzleData(nozzleKey, stageUINumber, motorUINumber) {
  // Handle both array of nozzles or single nozzle key
  const nozzleKeys = Array.isArray(nozzleKey) ? nozzleKey : [nozzleKey];

  for (let i = 0; i < nozzleKeys.length; i++) {
    const nozzleName = nozzleKeys[i];
    const nozzleData = window.finalMissionData[nozzleName];
    const nozzleUINumber = i + 1;

    if (!nozzleData) {
      console.warn(`Nozzle data for '${nozzleName}' not found. Skipping.`);
      continue;
    }

    const form = document.getElementById(
      `stage${stageUINumber}-motor${motorUINumber}-nozzle${nozzleUINumber}-form`
    );
    if (!form) {
      console.warn(
        `Nozzle form stage${stageUINumber}-motor${motorUINumber}-nozzle${nozzleUINumber}-form not found.`
      );
      continue;
    }

    // Populate eta and zeta thrust
    const etaThrustInput = form.querySelector(
      'input[placeholder="Enter ETA thrust"]'
    );
    if (etaThrustInput && nozzleData.eta_thrust !== undefined) {
      etaThrustInput.value = nozzleData.eta_thrust;
    }

    const zetaThrustInput = form.querySelector(
      'input[placeholder="Enter Zeta thrust"]'
    );
    if (zetaThrustInput && nozzleData.zeta_thrust !== undefined) {
      zetaThrustInput.value = nozzleData.zeta_thrust;
    }

    // Populate location parameters
    const radialDistInput = form.querySelector(
      'input[placeholder="Enter radial distance"]'
    );
    if (
      radialDistInput &&
      nozzleData.Location &&
      nozzleData.Location.Radial_dist !== undefined
    ) {
      radialDistInput.value = nozzleData.Location.Radial_dist;
    }

    const phiInput = form.querySelector('input[placeholder="Enter Phi value"]');
    if (
      phiInput &&
      nozzleData.Location &&
      nozzleData.Location.Phi !== undefined
    ) {
      phiInput.value = nozzleData.Location.Phi;
    }

    // Populate misalignment parameters
    const sigmaThrustInput = form.querySelector(
      'input[placeholder="Enter sigma thrust"]'
    );
    if (
      sigmaThrustInput &&
      nozzleData.mis_alignment &&
      nozzleData.mis_alignment.sigma_thrust !== undefined
    ) {
      sigmaThrustInput.value = nozzleData.mis_alignment.sigma_thrust;
    }

    const tauThrustInput = form.querySelector(
      'input[placeholder="Enter thau thrust"]'
    );
    if (
      tauThrustInput &&
      nozzleData.mis_alignment &&
      nozzleData.mis_alignment.tau_thrust !== undefined
    ) {
      tauThrustInput.value = nozzleData.mis_alignment.tau_thrust;
    }

    const epsilonThrustInput = form.querySelector(
      'input[placeholder="Enter epsilon thrust"]'
    );
    if (
      epsilonThrustInput &&
      nozzleData.mis_alignment &&
      nozzleData.mis_alignment.epsilon_thrust !== undefined
    ) {
      epsilonThrustInput.value = nozzleData.mis_alignment.epsilon_thrust;
    }

    // Populate orientation parameters
    const muInput = form.querySelector('input[placeholder="Enter MU value"]');
    if (
      muInput &&
      nozzleData.Orientation &&
      nozzleData.Orientation.mu !== undefined
    ) {
      muInput.value = nozzleData.Orientation.mu;
    }

    const lambdaInput = form.querySelector(
      'input[placeholder="Enter LAMDA value"]'
    );
    if (
      lambdaInput &&
      nozzleData.Orientation &&
      nozzleData.Orientation.lamda !== undefined
    ) {
      lambdaInput.value = nozzleData.Orientation.lamda;
    }

    const kappaInput = form.querySelector(
      'input[placeholder="Enter KAPPA value"]'
    );
    if (
      kappaInput &&
      nozzleData.Orientation &&
      nozzleData.Orientation.kappa !== undefined
    ) {
      kappaInput.value = nozzleData.Orientation.kappa;
    }

    // Populate throat location
    const xInput = form.querySelector('input[placeholder="Enter X value"]');
    if (
      xInput &&
      nozzleData.Throat_location &&
      nozzleData.Throat_location.x !== undefined
    ) {
      xInput.value = nozzleData.Throat_location.x;
    }

    const yInput = form.querySelector('input[placeholder="Enter Y value"]');
    if (
      yInput &&
      nozzleData.Throat_location &&
      nozzleData.Throat_location.y !== undefined
    ) {
      yInput.value = nozzleData.Throat_location.y;
    }

    const zInput = form.querySelector('input[placeholder="Enter Z value"]');
    if (
      zInput &&
      nozzleData.Throat_location &&
      nozzleData.Throat_location.z !== undefined
    ) {
      zInput.value = nozzleData.Throat_location.z;
    }
  }
}
```

### 3. Event Sequence Implementation

Add this function to populate the event sequence data:

```javascript
function populateEventSequence(loadedData, vehicleName) {
  const sequenceKey = vehicleName + "_Sequence";
  if (!loadedData[sequenceKey] || !Array.isArray(loadedData[sequenceKey])) {
    console.warn(
      `Event sequence data for '${sequenceKey}' not found or invalid.`
    );
    return;
  }

  const eventSequence = loadedData[sequenceKey];
  const eventSequenceContainer = document.getElementById(
    "event-sequence-container"
  );
  if (!eventSequenceContainer) {
    console.error("Event sequence container not found in the DOM.");
    return;
  }

  // Clear existing events first
  window.eventSequence = [];

  // Empty the event preview area
  const eventPreviewArea = document.getElementById("event-sequence-preview");
  if (eventPreviewArea) {
    eventPreviewArea.innerHTML = "";
  }

  // Register events in the global eventSequence array and update UI
  eventSequence.forEach((event) => {
    // Add to global event registry
    window.eventSequence.push({
      id: event.identity,
      trigger: event.trigger,
      value: event.value,
      reference: event.reference,
      comment: event.comment,
    });

    // Update UI preview
    if (eventPreviewArea) {
      const eventDiv = document.createElement("div");
      eventDiv.className = "event-item";
      eventDiv.innerHTML = `
        <span class="event-id">${event.identity}</span>
        <span class="event-trigger">${event.trigger}</span>
        <span class="event-value">${event.value}</span>
        <span class="event-reference">${event.reference || "none"}</span>
      `;
      eventPreviewArea.appendChild(eventDiv);
    }

    // Register in the global flag registry for dropdown selections
    if (window.flagRegistry) {
      // Determine event type from the id prefix
      let eventType = "event"; // Default
      if (event.identity.includes("_INI") || event.identity.includes("_SEP")) {
        eventType = "stage";
      } else if (
        event.identity.includes("_IGN") ||
        event.identity.includes("_Burnout") ||
        event.identity.includes("_CUTOFF")
      ) {
        eventType = "motor";
      } else if (event.identity.includes("HSS")) {
        eventType = "heatshield";
      } else if (event.identity.includes("STEER")) {
        eventType = "steering";
      }

      // Add to the appropriate registry
      if (window.flagRegistry[eventType]) {
        window.flagRegistry[eventType][event.identity] = event.identity;
      }
    }
  });

  console.log(`Populated ${eventSequence.length} events in the sequence.`);
}
```

### 4. Steering Components Implementation

Add this function to populate steering components:

```javascript
function populateSteering(loadedData, vehicleName) {
  const steeringKey = vehicleName + "_Steering";
  if (
    !loadedData[steeringKey] ||
    !Array.isArray(loadedData[steeringKey].steering)
  ) {
    console.warn(`Steering data for '${steeringKey}' not found or invalid.`);
    return;
  }

  const steeringComponents = loadedData[steeringKey].steering;

  // Clear existing steering components first
  if (window.steeringState) {
    window.steeringState.activeComponents = [];
  }

  // Clear the steering components container
  const steeringComponentsContainer = document.getElementById(
    "steering-components-container"
  );
  if (steeringComponentsContainer) {
    steeringComponentsContainer.innerHTML = "";
  }

  // Add each steering component
  steeringComponents.forEach((componentKey) => {
    const componentData = loadedData[componentKey];
    if (!componentData) {
      console.warn(`Data for steering component '${componentKey}' not found.`);
      return;
    }

    // Add new steering component through UI
    const addSteeringComponentBtn = document.getElementById(
      "add-steering-component-btn"
    );
    if (addSteeringComponentBtn) {
      addSteeringComponentBtn.click();

      // Wait for the component to be created, then populate it
      setTimeout(() => {
        const componentIndex =
          window.steeringState?.activeComponents?.length - 1 || 0;
        populateSteeringComponent(componentData, componentKey, componentIndex);
      }, 200);
    }
  });
}

function populateSteeringComponent(
  componentData,
  componentKey,
  componentIndex
) {
  if (
    !componentData ||
    !componentData.start ||
    !componentData.stop ||
    !componentData.steering
  ) {
    console.warn(`Steering component data invalid for ${componentKey}`);
    return;
  }

  // Get the tabs for this component
  const startTab = document.getElementById(
    `steering-component-${componentIndex}-start-tab`
  );
  const stopTab = document.getElementById(
    `steering-component-${componentIndex}-stop-tab`
  );
  const steeringTab = document.getElementById(
    `steering-component-${componentIndex}-steering-tab`
  );

  if (!startTab || !stopTab || !steeringTab) {
    console.warn(`Tabs for steering component ${componentIndex} not found`);
    return;
  }

  // 1. Populate Start tab
  startTab.click(); // Show start tab
  setTimeout(() => {
    const startForm = document.getElementById(
      `steering-component-${componentIndex}-start-form`
    );
    if (startForm) {
      const startIdInput = startForm.querySelector(
        'input[placeholder="Enter start Identity"]'
      );
      if (startIdInput) startIdInput.value = componentData.start.identity;

      const startTriggerSelect = startForm.querySelector(
        'select[id$="-start-trigger"]'
      );
      if (startTriggerSelect)
        startTriggerSelect.value = componentData.start.trigger;

      const startValueInput = startForm.querySelector(
        'input[placeholder="Enter start value"]'
      );
      if (startValueInput) startValueInput.value = componentData.start.value;

      const startReferenceSelect = startForm.querySelector(
        'select[id$="-start-reference"]'
      );
      if (startReferenceSelect && componentData.start.reference !== "none") {
        startReferenceSelect.value = componentData.start.reference;
      }
    }

    // 2. Populate Stop tab
    stopTab.click(); // Show stop tab
    setTimeout(() => {
      const stopForm = document.getElementById(
        `steering-component-${componentIndex}-stop-form`
      );
      if (stopForm) {
        const stopIdInput = stopForm.querySelector(
          'input[placeholder="Enter stop Identity"]'
        );
        if (stopIdInput) stopIdInput.value = componentData.stop.identity;

        const stopTriggerSelect = stopForm.querySelector(
          'select[id$="-stop-trigger"]'
        );
        if (stopTriggerSelect)
          stopTriggerSelect.value = componentData.stop.trigger;

        const stopValueInput = stopForm.querySelector(
          'input[placeholder="Enter stop value"]'
        );
        if (stopValueInput) stopValueInput.value = componentData.stop.value;

        const stopReferenceSelect = stopForm.querySelector(
          'select[id$="-stop-reference"]'
        );
        if (stopReferenceSelect && componentData.stop.reference !== "none") {
          stopReferenceSelect.value = componentData.stop.reference;
        }
      }

      // 3. Populate Steering tab
      steeringTab.click(); // Show steering tab
      setTimeout(() => {
        const steeringForm = document.getElementById(
          `steering-component-${componentIndex}-steering-form`
        );
        if (steeringForm) {
          const steeringTypeSelect = steeringForm.querySelector(
            'select[id$="-steering-type"]'
          );
          if (steeringTypeSelect) {
            steeringTypeSelect.value = componentData.steering.type;
            // Trigger change event to show relevant fields
            steeringTypeSelect.dispatchEvent(
              new Event("change", { bubbles: true })
            );

            // Wait for fields to update based on type
            setTimeout(() => {
              // Handle different types of steering
              switch (componentData.steering.type) {
                case "CONST_BODYRATE":
                  const axisSelect = steeringForm.querySelector(
                    'select[id$="-axis-select"]'
                  );
                  if (axisSelect)
                    axisSelect.value = componentData.steering.axis;

                  const rateValueInput = steeringForm.querySelector(
                    'input[id$="-rate-value"]'
                  );
                  if (rateValueInput)
                    rateValueInput.value = componentData.steering.value;
                  break;

                case "PROFILE":
                  const modeSelect = steeringForm.querySelector(
                    'select[id$="-mode-select"]'
                  );
                  if (modeSelect)
                    modeSelect.value = componentData.steering.mode;

                  const quantitySelect = steeringForm.querySelector(
                    'select[id$="-quantity-select"]'
                  );
                  if (quantitySelect)
                    quantitySelect.value = componentData.steering.quantity;

                  const indVarSelect = steeringForm.querySelector(
                    'select[id$="-indvar-select"]'
                  );
                  if (indVarSelect)
                    indVarSelect.value = componentData.steering.ind_variable;

                  // Handle profile data as CSV
                  if (
                    componentData.steering.value &&
                    Array.isArray(componentData.steering.value)
                  ) {
                    const profileCsvFilename = steeringForm.querySelector(
                      `#profile-csv-filename-${componentIndex}`
                    );
                    if (profileCsvFilename) {
                      profileCsvFilename.value = `${componentKey}_profile.csv`;

                      // Show clear button if it exists
                      const clearProfileBtn =
                        steeringForm.querySelector(".clear-profile-btn");
                      if (clearProfileBtn)
                        clearProfileBtn.style.display = "block";
                    }
                  }
                  break;

                // Add other steering types as needed
              }
            }, 200);
          }
        }
      }, 200);
    }, 200);
  }, 200);
}
```

### 5. Optimization Implementation

Add functions to handle optimization data if present:

```javascript
function populateOptimization(loadedData) {
  if (
    !loadedData.optimization ||
    loadedData.mission.MODE?.toLowerCase() !== "optimization"
  ) {
    console.log(
      "No optimization data or not in optimization mode. Skipping optimization population."
    );
    return;
  }

  // Show the optimization section in UI
  const optimizationSection = document.getElementById("optimization-section");
  if (optimizationSection) {
    optimizationSection.classList.remove("hidden");
  }

  // Populate objective function
  populateObjectiveFunction(loadedData.optimization.objective_function);

  // Populate constraints
  populateConstraints(loadedData.optimization.constraints);

  // Populate mode settings
  populateOptimizationMode(loadedData.optimization.mode_settings);

  // Populate design variables
  populateDesignVariables(loadedData.optimization.design_variables);
}

function populateObjectiveFunction(objectiveData) {
  if (!objectiveData) return;

  const objFunctionContainer = document.getElementById(
    "objective-function-container"
  );
  if (!objFunctionContainer) {
    console.warn("Objective function container not found.");
    return;
  }

  // Find the objective function type selection and set it
  const objTypeSelect = document.getElementById("objective-type-select");
  if (objTypeSelect && objectiveData.type) {
    objTypeSelect.value = objectiveData.type;
    objTypeSelect.dispatchEvent(new Event("change", { bubbles: true }));

    // Wait for type-specific fields to be created
    setTimeout(() => {
      switch (objectiveData.type) {
        case "minimum":
        case "maximum":
          const quantitySelect = document.getElementById("obj-quantity-select");
          if (quantitySelect && objectiveData.quantity) {
            quantitySelect.value = objectiveData.quantity;
          }
          break;

        case "target":
          const targetQuantitySelect = document.getElementById(
            "target-quantity-select"
          );
          if (targetQuantitySelect && objectiveData.quantity) {
            targetQuantitySelect.value = objectiveData.quantity;
          }

          const targetValueInput =
            document.getElementById("target-value-input");
          if (targetValueInput && objectiveData.target_value !== undefined) {
            targetValueInput.value = objectiveData.target_value;
          }
          break;

        case "weighted_sum":
          // Populate each term in the weighted sum
          if (objectiveData.terms && Array.isArray(objectiveData.terms)) {
            objectiveData.terms.forEach((term, index) => {
              // Click add term button for each term except the first (which is created by default)
              if (index > 0) {
                const addTermBtn = document.getElementById(
                  "add-weighted-term-btn"
                );
                if (addTermBtn) {
                  addTermBtn.click();
                }
              }

              // Wait for term to be created
              setTimeout(() => {
                const weightInput = document.getElementById(
                  `weight-${index + 1}`
                );
                if (weightInput && term.weight !== undefined) {
                  weightInput.value = term.weight;
                }

                const quantitySelect = document.getElementById(
                  `quantity-${index + 1}`
                );
                if (quantitySelect && term.quantity) {
                  quantitySelect.value = term.quantity;
                }
              }, 200);
            });
          }
          break;
      }
    }, 200);
  }
}

function populateConstraints(constraintsData) {
  if (!constraintsData || !Array.isArray(constraintsData)) return;

  const constraintsContainer = document.getElementById("constraints-container");
  if (!constraintsContainer) {
    console.warn("Constraints container not found.");
    return;
  }

  // Remove any default constraints first
  const existingConstraints =
    constraintsContainer.querySelectorAll(".constraint-item");
  existingConstraints.forEach((item) => item.remove());

  // Add each constraint
  constraintsData.forEach((constraint, index) => {
    const addConstraintBtn = document.getElementById("add-constraint-btn");
    if (addConstraintBtn) {
      addConstraintBtn.click();

      setTimeout(() => {
        const constraintType = document.getElementById(
          `constraint-type-${index}`
        );
        if (constraintType && constraint.type) {
          constraintType.value = constraint.type;
          constraintType.dispatchEvent(new Event("change", { bubbles: true }));

          setTimeout(() => {
            const quantitySelect = document.getElementById(
              `constraint-quantity-${index}`
            );
            if (quantitySelect && constraint.quantity) {
              quantitySelect.value = constraint.quantity;
            }

            // Handle different constraint types
            switch (constraint.type) {
              case "upper_bound":
              case "lower_bound":
                const boundValueInput = document.getElementById(
                  `bound-value-${index}`
                );
                if (boundValueInput && constraint.bound_value !== undefined) {
                  boundValueInput.value = constraint.bound_value;
                }
                break;

              case "range":
                const lowerBoundInput = document.getElementById(
                  `lower-bound-${index}`
                );
                if (lowerBoundInput && constraint.lower_bound !== undefined) {
                  lowerBoundInput.value = constraint.lower_bound;
                }

                const upperBoundInput = document.getElementById(
                  `upper-bound-${index}`
                );
                if (upperBoundInput && constraint.upper_bound !== undefined) {
                  upperBoundInput.value = constraint.upper_bound;
                }
                break;
            }
          }, 200);
        }
      }, 200);
    }
  });
}

function populateOptimizationMode(modeData) {
  if (!modeData) return;

  const modeContainer = document.getElementById("optimization-mode-container");
  if (!modeContainer) {
    console.warn("Optimization mode container not found.");
    return;
  }

  // Find mode type select and set it
  const modeTypeSelect = document.getElementById("optimization-mode-select");
  if (modeTypeSelect && modeData.type) {
    modeTypeSelect.value = modeData.type;
    modeTypeSelect.dispatchEvent(new Event("change", { bubbles: true }));

    // Wait for type-specific fields to be created
    setTimeout(() => {
      switch (modeData.type) {
        case "gradient":
          const maxIterInput = document.getElementById("max-iterations");
          if (maxIterInput && modeData.max_iterations !== undefined) {
            maxIterInput.value = modeData.max_iterations;
          }

          const convergenceTolInput = document.getElementById(
            "convergence-tolerance"
          );
          if (
            convergenceTolInput &&
            modeData.convergence_tolerance !== undefined
          ) {
            convergenceTolInput.value = modeData.convergence_tolerance;
          }
          break;

        case "genetic":
          const populationSizeInput =
            document.getElementById("population-size");
          if (populationSizeInput && modeData.population_size !== undefined) {
            populationSizeInput.value = modeData.population_size;
          }

          const generationsInput = document.getElementById("generations");
          if (generationsInput && modeData.generations !== undefined) {
            generationsInput.value = modeData.generations;
          }

          const mutationRateInput = document.getElementById("mutation-rate");
          if (mutationRateInput && modeData.mutation_rate !== undefined) {
            mutationRateInput.value = modeData.mutation_rate;
          }
          break;

        // Add other optimization modes as needed
      }
    }, 200);
  }
}

function populateDesignVariables(designVarsData) {
  if (!designVarsData || !Array.isArray(designVarsData)) return;

  const designVarsContainer = document.getElementById(
    "design-variables-container"
  );
  if (!designVarsContainer) {
    console.warn("Design variables container not found.");
    return;
  }

  // Remove any default design variables first
  const existingVars = designVarsContainer.querySelectorAll(".design-var-item");
  existingVars.forEach((item) => item.remove());

  // Add each design variable
  designVarsData.forEach((designVar, index) => {
    const addDesignVarBtn = document.getElementById("add-design-var-btn");
    if (addDesignVarBtn) {
      addDesignVarBtn.click();

      setTimeout(() => {
        const nameInput = document.getElementById(`design-var-name-${index}`);
        if (nameInput && designVar.name) {
          nameInput.value = designVar.name;
        }

        const typeSelect = document.getElementById(`design-var-type-${index}`);
        if (typeSelect && designVar.type) {
          typeSelect.value = designVar.type;
          typeSelect.dispatchEvent(new Event("change", { bubbles: true }));

          // Wait for type-specific fields
          setTimeout(() => {
            const initialValueInput = document.getElementById(
              `initial-value-${index}`
            );
            if (initialValueInput && designVar.initial_value !== undefined) {
              initialValueInput.value = designVar.initial_value;
            }

            const lowerBoundInput = document.getElementById(
              `design-var-lower-${index}`
            );
            if (lowerBoundInput && designVar.lower_bound !== undefined) {
              lowerBoundInput.value = designVar.lower_bound;
            }

            const upperBoundInput = document.getElementById(
              `design-var-upper-${index}`
            );
            if (upperBoundInput && designVar.upper_bound !== undefined) {
              upperBoundInput.value = designVar.upper_bound;
            }

            // For steering variables, populate additional fields
            if (designVar.type === "steering") {
              const componentSelect = document.getElementById(
                `steering-component-${index}`
              );
              if (componentSelect && designVar.component) {
                componentSelect.value = designVar.component;
              }

              const parameterSelect = document.getElementById(
                `steering-parameter-${index}`
              );
              if (parameterSelect && designVar.parameter) {
                parameterSelect.value = designVar.parameter;
              }
            }
          }, 200);
        }
      }, 200);
    }
  });
}
```

### 6. Stopping Condition Implementation

Add this function to populate stopping condition data:

```javascript
function populateStoppingCondition(loadedData) {
  if (!loadedData.stopping_condition) return;

  const stoppingData = loadedData.stopping_condition;
  const stoppingForm = document.getElementById("stopping-condition-form");
  if (!stoppingForm) {
    console.warn("Stopping condition form not found.");
    return;
  }

  // Set stopping condition type
  const typeSelect = document.getElementById("stopping-condition-type");
  if (typeSelect && stoppingData.type) {
    typeSelect.value = stoppingData.type;
    typeSelect.dispatchEvent(new Event("change", { bubbles: true }));

    // Wait for type-specific fields
    setTimeout(() => {
      switch (stoppingData.type) {
        case "time":
          const timeInput = document.getElementById("max-time");
          if (timeInput && stoppingData.max_time !== undefined) {
            timeInput.value = stoppingData.max_time;
          }
          break;

        case "altitude":
          const altTypeSelect = document.getElementById(
            "altitude-condition-type"
          );
          if (altTypeSelect && stoppingData.condition) {
            altTypeSelect.value = stoppingData.condition;
          }

          const altValueInput = document.getElementById("altitude-value");
          if (altValueInput && stoppingData.value !== undefined) {
            altValueInput.value = stoppingData.value;
          }
          break;

        case "velocity":
          const velTypeSelect = document.getElementById(
            "velocity-condition-type"
          );
          if (velTypeSelect && stoppingData.condition) {
            velTypeSelect.value = stoppingData.condition;
          }

          const velValueInput = document.getElementById("velocity-value");
          if (velValueInput && stoppingData.value !== undefined) {
            velValueInput.value = stoppingData.value;
          }
          break;

        case "custom":
          const customEventSelect = document.getElementById(
            "custom-event-select"
          );
          if (customEventSelect && stoppingData.event) {
            customEventSelect.value = stoppingData.event;
          }
          break;
      }
    }, 200);
  }
}
```

### Integrating with Main Population Function

Modify the `populateForms` function in `openMissionHandler.js` to call these new functions:

```javascript
function populateForms(loadedData) {
  console.log(
    "[OpenMission] Starting populateForms with loadedData:",
    JSON.stringify(loadedData, null, 2)
  );
  window.finalMissionData = loadedData; // Make loaded data globally accessible

  if (!loadedData.mission) {
    console.error("Mission data is missing!");
    Swal.fire(
      "Error",
      "Cannot populate forms: Mission section is missing in the loaded file.",
      "error"
    );
    return;
  }

  // Already implemented sections
  populateMissionDetails(loadedData.mission);
  populateEnvironment({
    planet_name: loadedData.mission?.planet_name,
    EARTH: loadedData.EARTH,
    Wind: loadedData.Wind,
  });

  // Find vehicle and mission data
  let missionKey = null;
  let vehicleType = null;
  let vehicleName = null;
  let vehicleData = null;
  let initialConditionName = null;
  let initialConditionData = null;

  // Find the main mission key (e.g., SSPO)
  for (const key in loadedData) {
    if (
      loadedData.hasOwnProperty(key) &&
      typeof loadedData[key] === "object" &&
      loadedData[key] !== null &&
      loadedData[key].vehicle &&
      Array.isArray(loadedData[key].vehicle)
    ) {
      missionKey = key;
      break;
    }
  }

  if (missionKey && loadedData[missionKey]) {
    vehicleType = loadedData[missionKey].vehicle_type;
    if (
      loadedData[missionKey].vehicle &&
      loadedData[missionKey].vehicle.length > 0
    ) {
      vehicleName = loadedData[missionKey].vehicle[0];
      vehicleData = loadedData[vehicleName];
      if (vehicleData) {
        initialConditionName = vehicleData.Initial_condition;
        if (
          loadedData.Initial_States &&
          loadedData.Initial_States[initialConditionName]
        ) {
          initialConditionData =
            loadedData.Initial_States[initialConditionName];
        }
      }
    }
  }

  if (vehicleData && vehicleType && initialConditionData) {
    populateVehicle(
      vehicleData,
      vehicleName,
      vehicleType,
      initialConditionData
    );

    // Populate stages including motors and nozzles
    populateStagesAndMotors(loadedData, vehicleName, vehicleData);

    // New: Populate event sequence
    const sequenceKey = vehicleName + "_Sequence";
    if (loadedData[sequenceKey]) {
      populateEventSequence(loadedData, vehicleName);
    }

    // New: Populate steering components
    populateSteering(loadedData, vehicleName);
  } else {
    console.warn(
      "[OpenMission] Could not find all necessary vehicle data to populate vehicle form."
    );
  }

  // New: Populate optimization data if in optimization mode
  if (
    loadedData.mission.MODE?.toLowerCase() === "optimization" &&
    loadedData.optimization
  ) {
    populateOptimization(loadedData);
  }

  // New: Populate stopping condition
  if (loadedData.stopping_condition) {
    populateStoppingCondition(loadedData);
  }

  console.log("Form population process completed.");
}
```

## Important Implementation Notes

1. **Error Handling**: Each function includes error checking to avoid breaking when specific data is missing.

2. **Timing**: Since forms are dynamically created, use `setTimeout` to ensure elements exist before trying to populate them.

3. **Dispatch Events**: After setting select input values, dispatch a `change` event to trigger any dependent UI updates.

4. **Global State**: The implementation integrates with existing global state objects like `window.finalMissionData`, `window.eventSequence`, `window.flagRegistry`, and `window.steeringState`.

5. **Element Selectors**: Use flexible selectors (like `form.querySelector`) where possible to accommodate dynamic IDs.

## Testing Strategy

1. Start by implementing one feature at a time, beginning with Motors since they're most straightforward
2. After each feature implementation, test loading a sample mission JSON
3. Verify both simple and complex cases (e.g., multiple stages with multiple motors)
4. Check edge cases like missing data fields or empty arrays
5. Test with different vehicle types: ASCEND, PROJECTILE, ORBITAL

## Handling CSV Data

For functionality that loads array data as CSV files:

- Set the input field value to show a filename based on the component name
- Make the clear button visible to indicate data is loaded
- Don't create actual CSV files - the array data is already in memory via `window.finalMissionData`

By following this implementation plan, you'll complete the Open Mission functionality while maintaining compatibility with the existing codebase.
