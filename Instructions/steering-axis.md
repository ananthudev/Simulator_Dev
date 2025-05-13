# Steering Axis and Bounds UI Enhancement Workflow

This document outlines the planned changes to the user interface for defining Axis and Lower/Upper Bounds parameters within the "Steering" category of the Design Variables form in the Astra GUI.

**Problem:**
The previous UI for specifying steering axes and their corresponding bounds was inconsistent across different steering segment types (e.g., PROFILE vs. CONST_BODYRATE/ZERO_RATE) and lacked clarity for defining individual bounds per axis when multiple axes were selected. Manually entering comma-separated arrays for bounds in single input fields is error-prone and lacks visual guidance.

**Proposed UI/UX Solution:**
Implement a standard UI pattern for selecting axes and defining bounds for the PROFILE, CLG (Closed Loop Guidance), and ZERO_RATE steering segment types.

1.  **Axis Selection:** Replace the single axis input or select with a group of distinct checkboxes for Roll, Pitch, and Yaw. The user must select at least one axis.
2.  **Dynamic Per-Axis Bounds:** Below the axis checkboxes, a container will display distinct sections for defining the Lower and Upper Bounds for _each selected axis_.
    - Checking an axis checkbox (e.g., Pitch) will dynamically add a section labeled "Pitch Bounds".
    - Unchecking an axis checkbox will remove its corresponding bounds section.
    - Each section will contain dedicated input fields for the "Lower Bound (Axis Name)" and "Upper Bound (Axis Name)". These input fields will be text fields (`type="text"`) to accommodate comma-separated lists of values, matching the expected data structure for steering profiles with multiple nodes.

**Benefits:**

- **Clarity:** Immediately obvious which bounds apply to which axis.
- **Usability:** Easier to select multiple axes and define bounds individually.
- **Reduced Errors:** Minimizes mistakes associated with manual array entry and alignment.
- **Consistency:** Provides a uniform experience for managing multi-axis bounds across different steering types.
- **Progressive Disclosure:** Only displays bound fields for the axes the user is actively configuring.

**Affected Steering Segment Types:**

- PROFILE
- CLG (Closed Loop Guidance)
- ZERO_RATE

**(Note: Other steering types like CONST_BODYRATE may retain their existing input structure unless also updated.)**

**Implementation Workflow:**

This section details the technical steps to achieve the proposed UI/UX.

**Step 1: HTML Modifications (`front_end/mission.html`)**

1.  **Locate Template:** Find the `<template id="design-variable-template">`.
2.  **Modify Segment Type Structures:** Inside this template, find the `div` elements for `data-segment-type="PROFILE"`, `data-segment-type="CLG"`, and `data-segment-type="ZERO_RATE"`.
3.  **Remove Old Axis/Bounds:** In each of these three `div`s, remove the existing HTML elements used for the single axis selection/input (`.dv-axis`) and the general Lower/Upper Bound input fields (`.dv-lower-bound`, `.dv-upper-bound`).
4.  **Add New Axis Checkboxes:** In each of these three `div`s, add a `form-group` containing the "Axes (Select at least one):" label and the checkboxes for Roll, Pitch, and Yaw (`<input type="checkbox" class="dv-axis-select-cb" value="...">`). Include a hidden `div` with class `error-message` and `data-validation-for="axis-selection"` for validation feedback.
5.  **Add Bounds Container:** In each of these three `div`s, add an empty `div` with class `dv-axis-bounds-container`. This will be the target for dynamic content.
6.  **Create Per-Axis Bounds Template:** Outside the main `<template id="design-variable-template">`, add a new `<template id="per-axis-bounds-template">`. This template will contain the HTML structure for a single axis's bounds section, including a title (e.g., "Pitch Bounds") and `form-row`s with labels and text inputs for the "Lower Bound" and "Upper Bound" (using classes like `.dv-lower-bound` and `.dv-upper-bound` but within this template's structure). Include a `data-axis` attribute on the main section `div` within this template.

**Step 2: CSS Modifications (`front_end/css/desktop-theme.css`)**

1.  **Style Checkbox Group:** Add CSS rules for `.dv-axis-checkbox-group` and `.axis-checkboxes` to style the layout of the axis checkboxes. Ensure clear spacing and alignment.
2.  **Style Checkboxes:** Style the individual checkbox labels and inputs (`.axis-checkboxes label`, `.axis-checkboxes input[type="checkbox"]`) for visual theme consistency and usability. Add styling for the error message element within `.dv-axis-checkbox-group`.
3.  **Style Dynamic Bounds Container:** Add CSS for `.dv-axis-bounds-container` to manage spacing and visual separation above the dynamically added sections.
4.  **Style Dynamic Bounds Sections:** Add CSS for `.dv-axis-bounds-section` (the root of the per-axis template content) to give each axis's bounds a distinct visual block (e.g., borders, background, padding). Style the title (`.axis-bounds-title`) within these sections.

**Step 3: JavaScript Modifications (`front_end/js/optimization.js`)**

1.  **Get Template Reference:** Inside the main `DOMContentLoaded` listener, get a JavaScript reference to the `<template id="per-axis-bounds-template">`.
2.  **Create `updateAxisBoundSections(instanceElement)` Function:**
    - This function will take a design variable instance element as input.
    - It will find the axis checkboxes (`.dv-axis-select-cb`) and the bounds container (`.dv-axis-bounds-container`) within that instance.
    - It will determine which axes are currently selected based on checked checkboxes.
    - It will compare the selected axes to the axes currently displayed in the `.dv-axis-bounds-container` (checking the `data-axis` attribute on the sections).
    - For each selected axis that _doesn't_ have a corresponding section, it will clone the `per-axis-bounds-template`, set the `data-axis` attribute on the cloned section, update the section title and label text (e.g., "Pitch Bounds", "Lower Bound (Pitch):"), and append the new section to the `.dv-axis-bounds-container`.
    - For each axis that _does_ have a section but is no longer selected, it will find and remove that section from the DOM.
    - It will check if at least one axis is selected and show/hide the validation error message element (`.error-message[data-validation-for="axis-selection"]`) accordingly.
3.  **Create `populateAxisBoundSections(instanceElement, dvData)` Function:**
    - This function will take a design variable instance and existing data (`dvData`) as input.
    - It will read the saved `axis` array from `dvData.type.axis`.
    - It will check the corresponding axis checkboxes in the UI based on the saved `axis` array.
    - It will call `updateAxisBoundSections(instanceElement)` to ensure the correct dynamic bound sections are created based on the checked boxes.
    - It will then iterate through the saved `lower_bound` and `upper_bound` arrays (`dvData.type.lower_bound`, `dvData.type.upper_bound`).
    - For each axis in the saved `dvData.type.axis` array, it will find the corresponding dynamic section (`.dv-axis-bounds-section[data-axis="..."]`) and populate its `.dv-lower-bound` and `.dv-upper-bound` text inputs with the corresponding bound arrays from the saved data (joining the array elements with commas).
4.  **Modify `handleSteeringSegmentTypeChange(event)` Function:**
    - Inside this function, after the correct `.dv-steering-type-fields` div is made visible, check if it's for "PROFILE", "CLG", or "ZERO_RATE".
    - If it is, find the axis checkboxes (`.dv-axis-select-cb`) within this specific field set.
    - Add `change` event listeners to these checkboxes that call `updateAxisBoundSections`, passing the parent design variable instance. Ensure duplicate listeners are not added (e.g., remove existing ones first or use event delegation).
    - Call `updateAxisBoundSections` once after the segment type fields are shown to set up the initial state based on any pre-checked boxes or loaded data.
5.  **Modify `getDesignVariablesData()` Function:**
    - Within the logic for `category === "STEERING"`, when the `segment_type` is "PROFILE", "CLG", or "ZERO_RATE", change how `axis`, `lower_bound`, and `upper_bound` are collected.
    - Find the `.dv-axis-bounds-container`.
    - Find all `.dv-axis-bounds-section` elements within it.
    - Iterate through these sections. For each section, collect the `data-axis` value and the parsed array of numbers from its `.dv-lower-bound` and `.dv-upper-bound` text inputs.
    - Construct the `axis` array (`["pitch", "yaw"]`) and the nested `lower_bound` and `upper_bound` arrays (`[[...pitch...], [...yaw...]], [[...pitch...], [...yaw...]]`) in the required JSON format, ensuring the order of bound arrays matches the order of axes.
    - Also, ensure the collection of other fields like `control_variable`, `ind_variable`, `ind_vector` (for PROFILE) still happens correctly.
6.  **Modify `initializeExistingDesignVariables()` Function:**
    - Within the logic for loading a `category === "STEERING"` design variable, if the `segment_type` is "PROFILE", "CLG", or "ZERO_RATE", call `populateAxisBoundSections(newInstance, dvData)` after the steering sub-type fields are visible to load the saved axis selections and bound values into the dynamic UI.
7.  **Modify `validateDesignVariablesForm()` Function:**
    - Within the validation logic for `category === "STEERING"` and `segment_type` being "PROFILE", "CLG", or "ZERO_RATE":
    - Find the axis checkboxes and check if at least one is selected. If not, add an error to the `errors` array and ensure the validation message element in the UI is shown.
    - Find the `.dv-axis-bounds-container`. Iterate through the visible `.dv-axis-bounds-section` elements.
    - For each section, validate that the `.dv-lower-bound` and `.dv-upper-bound` text inputs are not empty and contain valid comma-separated numeric values using the `isArrayOfNumbers` helper. Add specific errors to the `errors` array and use `showFieldError` on the corresponding input fields if validation fails.
    - Ensure required fields specific to PROFILE (e.g., Independent Variable, Independent Vector) are still validated.
    - If `segment_type` is CONST_BODYRATE (which still uses static inputs), ensure its existing validation for those inputs is maintained.

This detailed plan covers the necessary changes across HTML, CSS, and JavaScript to implement the improved UI/UX for defining multi-axis steering design variables.
