

document.addEventListener("DOMContentLoaded", function () {
    const missionForm = document.getElementById("mission-form");

    if (missionForm) {
        missionForm.addEventListener("submit", function (event) {
            event.preventDefault(); // Prevent form submission if validation fails

            let isValid = true;

            // Get form fields
            const missionName = document.getElementById("mission-name");
            const modes = document.getElementById("modes");
            const missionDate = document.getElementById("mission-date");
            const missionTime = document.getElementById("mission-time");
            const stoppingCondition = document.querySelector("input[name='stopping-condition']:checked");

            // Clear previous errors
            document.querySelectorAll(".error-message").forEach(el => el.remove());

            // Validation checks
            if (!missionName.value.trim()) {
                isValid = false;
                showError(missionName, "Mission name is required.");
            }

            if (modes.value === "Mode") {
                isValid = false;
                showError(modes, "Please select a mode.");
            }

            if (!missionDate.value) {
                isValid = false;
                showError(missionDate, "Date is required.");
            }

            if (!missionTime.value) {
                isValid = false;
                showError(missionTime, "Time is required.");
            }

            if (!stoppingCondition) {
                isValid = false;
                showError(document.querySelector(".radio-group"), "Please select a stopping condition.");
            }

            // Validate condition fields based on stopping condition
            if (stoppingCondition) {
                const conditionType = stoppingCondition.value;
                if (conditionType === "flag") {
                    validateConditionField("flag-name", "Flag name is required.");
                    validateConditionField("flag-value", "Value is required.");
                } else if (conditionType === "time") {
                    validateConditionField("time-value", "Time value is required.");
                } else if (conditionType === "altitude") {
                    validateConditionField("altitude-value", "Altitude value is required.");
                }
            }

            // Submit form if valid
            if (isValid) {
                console.log("Form submitted successfully.");
                missionForm.submit();
            }
        });
    }

    // Function to show error messages
    // Change the color and size of the error message if you want to
    function showError(inputElement, message) {
        const errorMsg = document.createElement("span");
        errorMsg.classList.add("error-message");
        errorMsg.style.color = "red";
        errorMsg.style.fontSize = "12px";
        errorMsg.textContent = message;
        inputElement.parentNode.appendChild(errorMsg);
    }

    // Function to validate condition fields
    function validateConditionField(fieldId, errorMessage) {
        const field = document.getElementById(fieldId);
        if (field && !field.value.trim()) {
            showError(field, errorMessage);
        }
    }
});
