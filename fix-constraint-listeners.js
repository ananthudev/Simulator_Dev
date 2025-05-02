/**
 * Fix for constraint forms
 * This file fixes issues with duplicate event listeners
 * and adds the dynamic field changes based on constraint type
 */
document.addEventListener("DOMContentLoaded", () => {
  console.log("Constraint form fix loaded");

  // Clear any existing event handlers for the Add Constraint button
  // to prevent duplicate event issues
  const addConstraintBtn = document.getElementById("add-constraint-btn");
  if (addConstraintBtn) {
    const newAddBtn = addConstraintBtn.cloneNode(true);
    addConstraintBtn.parentNode.replaceChild(newAddBtn, addConstraintBtn);

    // Re-add the event listener
    newAddBtn.addEventListener("click", () => {
      if (typeof addConstraintInstance === "function") {
        addConstraintInstance();
      } else if (
        window.optimizationHandler &&
        typeof window.optimizationHandler.addConstraintInstance === "function"
      ) {
        window.optimizationHandler.addConstraintInstance();
      } else {
        console.error("addConstraintInstance function not found");
      }
    });
  }

  // Make sure all constraint name dropdowns have change listeners
  // to update form fields dynamically
  const constraints = document.querySelectorAll(
    "#constraints-container .optimization-instance:not(.hidden-template) .constraint-name"
  );

  if (constraints.length > 0) {
    console.log(`Applying fixes to ${constraints.length} constraint forms`);

    constraints.forEach((nameSelect) => {
      // Remove existing event listeners by cloning
      const newNameSelect = nameSelect.cloneNode(true);
      nameSelect.parentNode.replaceChild(newNameSelect, nameSelect);

      // Add back the main event listener
      newNameSelect.addEventListener("change", (event) => {
        // Call handleConstraintNameChange if it exists
        if (typeof handleConstraintNameChange === "function") {
          handleConstraintNameChange(event);
        }

        // Also update all dropdowns
        if (typeof updateAllConstraintNameDropdowns === "function") {
          updateAllConstraintNameDropdowns();
        }
      });

      // Trigger the change event to ensure UI is correctly set up
      if (newNameSelect.value) {
        newNameSelect.dispatchEvent(new Event("change"));
      }
    });
  }
});
