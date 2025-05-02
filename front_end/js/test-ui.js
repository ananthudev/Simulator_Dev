// Initialize test UI
document.addEventListener("DOMContentLoaded", function () {
  // Create main test button
  const testButton = document.createElement("button");
  testButton.id = "run-tests";
  testButton.textContent = "Run Tests";
  testButton.className = "test-button main main-test-button";
  testButton.onclick = window.TestHelpers.runAllTests;
  document.body.appendChild(testButton);

  // Create container for individual test buttons
  const testContainer = document.createElement("div");
  testContainer.className = "test-container";

  // Define test types
  const testTypes = [
    { name: "Test Mission", fn: window.TestHelpers.fillTestMissionData },
    {
      name: "Test Environment",
      fn: window.TestHelpers.fillTestEnvironmentData,
    },
    {
      name: "Test ASCEND",
      fn: () => window.TestHelpers.fillTestVehicleData("ascend"),
    },
    {
      name: "Test PROJECTILE",
      fn: () => window.TestHelpers.fillTestVehicleData("projectile"),
    },
    {
      name: "Test ORBITAL",
      fn: () => window.TestHelpers.fillTestVehicleData("orbital"),
    },
    // --- NEW Buttons for Filling Stage/Motor Data ---
    {
      name: "Fill Current Stage",
      fn: window.TestHelpers.fillCurrentStageData,
      className: "test-button stage",
    },
    {
      name: "Fill Current Motor",
      fn: window.TestHelpers.fillCurrentMotorData,
      className: "test-button motor",
    },
    // Example for Stage 2 (can be added if needed)
    // {
    //     name: "Fill Stage 2 Data",
    //     fn: () => window.TestHelpers.fillTestStageData(2),
    //     className: "test-button stage",
    // },
    // Example for Motor 2_1 (can be added if needed)
    // {
    //     name: "Fill Motor 2_1 Data",
    //     fn: () => window.TestHelpers.fillTestMotorData(2, 1),
    //     className: "test-button motor",
    // },
  ];

  // Create individual test buttons
  testTypes.forEach((test) => {
    const button = document.createElement("button");
    button.textContent = test.name;
    // Use specific class if provided, otherwise default to secondary
    button.className = test.className || "test-button secondary";
    button.onclick = test.fn;
    testContainer.appendChild(button);
  });

  document.body.appendChild(testContainer);
});
