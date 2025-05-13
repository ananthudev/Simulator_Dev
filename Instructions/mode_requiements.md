# Algorithm Parameter Editing Implementation Guide

## Overview

This document describes how to implement dynamic parameter editing for optimization algorithms in both Normal and Archipelago modes. Since different algorithms have different parameters, we need a flexible approach to display and collect the relevant form fields based on the selected algorithm.

## Implementation Approach

### 1. Data Structure for Algorithm Parameters

- Create a JavaScript object mapping algorithm names to their parameters
- Each parameter needs type, default value, label, and other relevant attributes
- Store this at the top of optimization.js for easy reference

```javascript
const algorithmParameters = {
  SGA: {
    generation: { type: "number", default: 5, label: "Generation", min: 1 },
    crossover_prob: {
      type: "number",
      default: 0.75,
      label: "Crossover Probability",
      step: 0.01,
      min: 0,
      max: 1,
    },
    // Additional parameters...
  },
  DE: {
    generation: { type: "number", default: 100, label: "Generation", min: 1 },
    // Additional parameters...
  },
  // Additional algorithms...
};
```

### 2. Normal Mode Implementation

#### HTML Changes

Add a container div after the algorithm select dropdown:

```html
<div class="form-row">
  <div class="form-group">
    <label for="normal-algorithm" class="label">Algorithm:</label>
    <select id="normal-algorithm" class="input-field">
      <option value="" disabled selected>Select Algorithm</option>
      <!-- Algorithm options here -->
    </select>
  </div>
</div>
<!-- Add this container right after the algorithm select group -->
<div id="normal-algorithm-params" class="algorithm-parameters-container"></div>
```

#### JavaScript Functions

Create a function to dynamically generate parameter inputs:

```javascript
function displayAlgorithmParameters(
  algorithmName,
  containerElement,
  mode,
  existingParams = {}
) {
  // Clear the container
  containerElement.innerHTML = "";

  // Get parameters for the selected algorithm
  const params = window.algorithmParameters[algorithmName];
  if (!params) return;

  // Create form elements for each parameter
  const paramsForm = document.createElement("div");
  paramsForm.className = "algorithm-parameters-form";

  // Add title
  const title = document.createElement("h4");
  title.textContent = `${algorithmName} Parameters`;
  paramsForm.appendChild(title);

  // Create rows of parameter inputs (2 per row for better layout)
  let row = document.createElement("div");
  row.className = "form-row";
  let itemsInRow = 0;

  for (const paramKey in params) {
    // Create form group for parameter
    const formGroup = document.createElement("div");
    formGroup.className = "form-group";

    // Create label
    const label = document.createElement("label");
    label.textContent = params[paramKey].label || paramKey;
    formGroup.appendChild(label);

    // Create appropriate input based on parameter type
    // (text, number, select, checkbox)
    // Set current value from existingParams or default
    // Add to the form group

    // Add to row, create new row when needed
    row.appendChild(formGroup);
    // Row management logic...
  }

  // Add the form to the container
  containerElement.appendChild(paramsForm);
}
```

#### Event Handling

Add event listener to algorithm dropdown:

```javascript
const normalAlgorithmSelect = document.getElementById("normal-algorithm");
normalAlgorithmSelect.addEventListener("change", (event) => {
  displayAlgorithmParameters(
    event.target.value,
    document.getElementById("normal-algorithm-params"),
    "normal",
    {}
  );
});
```

#### Data Collection

Modify `getModeData()` to collect parameter values:

```javascript
function getModeData() {
  // Existing code...

  if (isNormalMode) {
    // Existing normal mode data collection...

    // Add parameter collection
    const paramsContainer = document.getElementById("normal-algorithm-params");
    const algoParams = {};

    if (paramsContainer && algorithm) {
      const paramInputs = paramsContainer.querySelectorAll(
        ".algorithm-param-input"
      );

      paramInputs.forEach((input) => {
        const paramKey = input.name;
        let value;

        // Handle different input types (checkbox, number, text, select)
        if (input.type === "checkbox") {
          value = input.checked;
        } else if (input.type === "number") {
          value = parseFloat(input.value);
        } else {
          value = input.value;
        }

        if (paramKey) {
          algoParams[paramKey] = value;
        }
      });
    }

    modeData.parameters = algoParams;
  }

  // Rest of the function...
}
```

### 3. Archipelago Mode Implementation

For Archipelago mode, since multiple algorithms can be selected, we need a different approach using a modal dialog for editing parameters:

#### Modal HTML

```html
<!-- Add this to the end of your HTML file -->
<div id="algorithm-params-modal" class="modal">
  <div class="modal-content">
    <span class="close-modal">&times;</span>
    <h3 id="modal-algorithm-title">Algorithm Parameters</h3>
    <div id="modal-algorithm-params"></div>
    <div class="modal-footer">
      <button id="save-algorithm-params" class="btn btn-primary">Save</button>
      <button id="reset-algorithm-params" class="btn">Reset</button>
    </div>
  </div>
</div>
```

#### Modal JavaScript

Implement the modal functionality:

```javascript
// Global variables to track current editing
let currentEditingAlgorithm = null;
let currentEditingTagId = null;

function openAlgorithmParamsModal(algorithm, tagId) {
  const modal = document.getElementById("algorithm-params-modal");
  const modalTitle = document.getElementById("modal-algorithm-title");
  const modalParamsContainer = document.getElementById(
    "modal-algorithm-params"
  );

  // Set current editing context
  currentEditingAlgorithm = algorithm;
  currentEditingTagId = tagId;

  // Set title
  modalTitle.textContent = `${algorithm} Parameters`;

  // Get existing parameters for this tag
  const existingParams =
    window.optimizationHandler.getArchipelagoAlgorithmParams(tagId) || {};

  // Display parameters in the modal
  displayAlgorithmParameters(
    algorithm,
    modalParamsContainer,
    "modal",
    existingParams
  );

  // Show modal
  modal.style.display = "block";
}

// Setup event listeners for modal buttons
document
  .getElementById("save-algorithm-params")
  .addEventListener("click", () => {
    // Collect parameters from the modal
    const params = {};
    const inputs = document.querySelectorAll(
      "#modal-algorithm-params .algorithm-param-input"
    );

    inputs.forEach((input) => {
      // Similar logic as getModeData to collect parameter values
      // ...
    });

    // Store the parameters
    window.optimizationHandler.storeArchipelagoAlgorithmParams(
      currentEditingTagId,
      params
    );

    // Close modal
    document.getElementById("algorithm-params-modal").style.display = "none";
  });

// Setup close button and reset button
// ...
```

#### Tag Click Handling

Modify the algorithm tag creation to enable parameter editing:

```javascript
function createAlgorithmTag(algorithm) {
  // Existing tag creation code...

  // Add click handler to open the parameters modal
  tag.addEventListener("click", (event) => {
    // Don't trigger if the remove button was clicked
    if (event.target.classList.contains("remove-algorithm")) {
      return;
    }
    openAlgorithmParamsModal(algorithm, tag.id);
  });

  // Rest of the function...
}
```

### 4. Parameter Storage for Archipelago Mode

Create helper functions for storing and retrieving parameters:

```javascript
// Parameter storage (add to window.optimizationHandler)
window.optimizationHandler = window.optimizationHandler || {};
window.optimizationHandler.archipelagoParamsStore = {};

window.optimizationHandler.storeArchipelagoAlgorithmParams = function (
  tagId,
  params
) {
  window.optimizationHandler.archipelagoParamsStore[tagId] = params;
};

window.optimizationHandler.getArchipelagoAlgorithmParams = function (tagId) {
  return window.optimizationHandler.archipelagoParamsStore[tagId] || {};
};

window.optimizationHandler.clearArchipelagoAlgorithmParams = function (tagId) {
  delete window.optimizationHandler.archipelagoParamsStore[tagId];
};
```

### 5. CSS Styling

Add these styles for the parameter editing UI:

```css
.algorithm-parameters-container {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px dashed rgba(255, 255, 255, 0.2);
  min-height: 50px;
}

.algorithm-parameters-form {
  padding: 15px;
  background-color: rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  margin-top: 10px;
}

/* Make algorithm tags look clickable */
#selected-algorithms-container .algorithm-tag {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

#selected-algorithms-container .algorithm-tag:hover {
  opacity: 0.85;
}

/* Modal styles */
.modal {
  display: none;
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
}

.modal-content {
  background-color: #2a2a2a;
  margin: 10% auto;
  padding: 20px;
  border: 1px solid #444;
  border-radius: 5px;
  width: 80%;
  max-width: 800px;
  max-height: 80vh;
  overflow-y: auto;
}

.close-modal {
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
  cursor: pointer;
}

.close-modal:hover {
  color: white;
}

.modal-footer {
  padding-top: 15px;
  text-align: right;
  border-top: 1px solid #444;
  margin-top: 15px;
}
```

## Implementation Steps

1. Add the algorithm parameter definitions to `optimization.js`
2. Add the parameter container div to the Normal mode HTML
3. Implement the `displayAlgorithmParameters` function
4. Add event listener to the algorithm dropdown
5. Modify `getModeData` to collect parameters
6. Add modal HTML for Archipelago mode (at the end of the document)
7. Implement modal functionality and parameter storage
8. Update `createAlgorithmTag` to handle parameter editing
9. Add the CSS styles
10. Test in both Normal and Archipelago modes

## Notes

- You may need to adjust this implementation based on your existing code structure
- Consider adding validation for parameter values
- For production, you might want to extract the parameter definitions to a separate JSON file
- The modal implementation would benefit from a modal library like SweetAlert2 if already available
