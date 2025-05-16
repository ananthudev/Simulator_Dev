// Initialize test UI
document.addEventListener("DOMContentLoaded", function () {
  // Check if TestData is available - if not, load it
  if (!window.TestData) {
    console.warn("TestData not available - dynamically loading test-data.js");
    const script = document.createElement("script");
    script.src = "js/test-data.js";
    script.onload = function () {
      console.log("TestData loaded successfully");
      initializeTestUI();
    };
    script.onerror = function () {
      console.error("Failed to load TestData");
      // Initialize anyway with what we have
      initializeTestUI();
    };
    document.head.appendChild(script);
  } else {
    initializeTestUI();
  }
});

function initializeTestUI() {
  // Create the main test UI container
  const mainTestContainer = document.createElement("div");
  mainTestContainer.id = "main-test-ui-container";

  // Create header for collapsing
  const testHeader = document.createElement("div");
  testHeader.id = "test-ui-header";

  const headerTitle = document.createElement("h3");
  headerTitle.textContent = "Test Controls";
  testHeader.appendChild(headerTitle);

  const toggleButton = document.createElement("button");
  toggleButton.id = "test-ui-toggle";
  toggleButton.textContent = "Show"; // Initial state is hidden
  testHeader.appendChild(toggleButton);

  mainTestContainer.appendChild(testHeader);

  // Create the collapsible content container - initially hidden
  const collapsibleContent = document.createElement("div");
  collapsibleContent.id = "test-ui-collapsible-content";
  collapsibleContent.style.display = "none"; // Initially hidden

  // Create the 'Run All Tests' button (moved inside collapsible content)
  const runAllTestsButton = document.createElement("button");
  runAllTestsButton.id = "run-tests";
  runAllTestsButton.textContent = "Run All Tests";
  runAllTestsButton.className = "test-button main"; // Removed fixed positioning class
  runAllTestsButton.onclick = window.TestHelpers.runAllTests;
  collapsibleContent.appendChild(runAllTestsButton);

  // Create container for individual test buttons (existing)
  const testButtonContainer = document.createElement("div"); // Renamed from testContainer for clarity
  testButtonContainer.className = "test-button-container"; // New class for specific styling
  collapsibleContent.appendChild(testButtonContainer);

  // Create status indicator area (existing)
  const statusIndicator = document.createElement("div");
  statusIndicator.className = "test-status-indicator";
  statusIndicator.style.display = "none"; // Initially hidden
  collapsibleContent.appendChild(statusIndicator);

  mainTestContainer.appendChild(collapsibleContent);
  document.body.appendChild(mainTestContainer);

  // Add event listener for toggling
  toggleButton.addEventListener("click", function () {
    const content = document.getElementById("test-ui-collapsible-content");
    const isHidden = content.style.display === "none";
    content.style.display = isHidden ? "block" : "none";
    toggleButton.textContent = isHidden ? "Hide" : "Show";
  });

  // Get data from realdata.json through TestData
  const stagesData = [
    { name: "Stage 1", index: 1 },
    { name: "Stage 2", index: 2 },
  ];

  const motorsData = [
    { name: "Motor 1_1", stageIndex: 1, motorIndex: 1 },
    { name: "Motor 2_1", stageIndex: 2, motorIndex: 1 },
  ];

  // Count objective functions, constraints, and design variables
  const optimizationData = window.TestData.optimization;
  const numObjectives = optimizationData?.objective?.length || 1;
  const numConstraints = optimizationData?.constraints?.length || 4;
  const numDesignVars = optimizationData?.design_variables?.length || 4;

  // Define test categories with specific buttons based on realdata.json
  const testGroups = [
    {
      name: "Basic Forms",
      tests: [
        {
          name: "Test Mission",
          fn: window.TestHelpers.fillTestMissionData,
          className: "test-button secondary mission",
        },
        {
          name: "Test Environment",
          fn: window.TestHelpers.fillTestEnvironmentData,
          className: "test-button secondary environment",
        },
        {
          name: "Test Vehicle",
          fn: () => window.TestHelpers.fillTestVehicleData("ascend"),
          className: "test-button secondary vehicle",
        },
      ],
    },
    {
      name: "Stages",
      tests: stagesData.map((stage) => ({
        name: stage.name,
        fn: () => {
          window.TestHelpers.fillTestStageData(stage.index);
          window.TestHelpers.fillTestAeroData(stage.index);
        },
        className: "test-button stage",
      })),
    },
    {
      name: "Motors",
      tests: motorsData.map((motor) => ({
        name: motor.name,
        fn: () => {
          window.TestHelpers.fillTestMotorData(
            motor.stageIndex,
            motor.motorIndex
          );
          window.TestHelpers.fillTestThrustData(
            motor.stageIndex,
            motor.motorIndex
          );
        },
        className: "test-button motor",
      })),
    },
    {
      name: "Sequence & Control",
      tests: [
        {
          name: "Fill Sequence",
          fn: window.TestHelpers.fillTestSequenceData,
          className: "test-button sequence",
        },
        {
          name: "Fill Steering",
          fn: window.TestHelpers.fillTestSteeringData,
          className: "test-button steering",
        },
        {
          name: "Fill Stopping Condition",
          fn: window.TestHelpers.fillTestStoppingConditionData,
          className: "test-button stopping",
        },
      ],
    },
    {
      name: "Optimization",
      tests: [
        {
          name: `${numObjectives} Objective${numObjectives > 1 ? "s" : ""}`,
          fn: window.TestHelpers.fillTestObjectiveFunction,
          className: "test-button objective",
        },
        {
          name: `${numConstraints} Constraint${numConstraints > 1 ? "s" : ""}`,
          fn: window.TestHelpers.fillTestConstraints,
          className: "test-button constraints",
        },
        {
          name: "Fill Optimization Mode",
          fn: window.TestHelpers.fillTestOptimizationMode,
          className: "test-button opt-mode",
        },
        {
          name: `${numDesignVars} Design Variable${
            numDesignVars > 1 ? "s" : ""
          }`,
          fn: window.TestHelpers.fillTestDesignVariables,
          className: "test-button design-vars",
        },
      ],
    },
  ];

  // Add group headers and buttons to container
  testGroups.forEach((group) => {
    // Add group header
    const groupHeader = document.createElement("h4"); // Changed to h4 for better hierarchy
    groupHeader.textContent = group.name;
    groupHeader.className = "test-group-header";
    testButtonContainer.appendChild(groupHeader); // Append to testButtonContainer

    // Add group tests
    group.tests.forEach((test) => {
      const button = document.createElement("button");
      button.textContent = test.name;
      // Use specific class if provided, otherwise default to secondary
      button.className = test.className || "test-button secondary";
      button.onclick = test.fn;
      testButtonContainer.appendChild(button); // Append to testButtonContainer
    });
  });

  // Add some basic styling specific to the test UI - more compact version
  const style = document.createElement("style");
  style.textContent = `
    #main-test-ui-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
      background: rgba(0,0,0,0.9);
      border: 1px solid #444;
      border-radius: 5px;
      width: 250px; /* Reduced width */
      color: #fff;
      font-family: sans-serif;
      font-size: 12px; /* Reduced font size */
      max-height: 90vh;
      overflow-y: auto;
    }
    #test-ui-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 5px 8px; /* Reduced padding */
      background: #333;
      border-bottom: 1px solid #444;
      cursor: pointer; /* Indicate it's clickable */
    }
    #test-ui-header h3 {
      margin: 0;
      font-size: 14px; /* Reduced font size */
      color: #eee;
    }
     #test-ui-toggle {
      padding: 2px 6px; /* Reduced padding */
      font-size: 10px; /* Reduced font size */
      cursor: pointer;
      background: #555;
      border: 1px solid #666;
      border-radius: 3px;
      color: #fff;
    }
    #test-ui-toggle:hover {
      background: #666;
    }
    #test-ui-collapsible-content {
      padding: 8px; /* Reduced padding */
      /* Initially hidden, will be toggled by JS */
    }
    .test-button-container {
       margin-bottom: 8px; /* Reduced margin */
       display: flex; /* Use flexbox for layout */
       flex-wrap: wrap; /* Allow buttons to wrap to the next line */
       gap: 2px; /* Reduced gap between buttons */
       align-items: flex-start; /* Align items to the start */
    }
    .test-button, #run-tests, #test-ui-toggle {
      padding: 1px 3px; /* Further reduced padding */
      font-size: 8px; /* Further reduced font size */
      cursor: pointer;
      border: 1px solid #666;
      border-radius: 3px;
      color: #fff;
      /* Add specific button styling */
      background-color: #555; /* Default background */
      flex: 0 1 auto; /* Allow buttons to shrink but not grow */
      min-width: 0; /* Allow buttons to shrink below content size if needed */
      box-sizing: border-box; /* Include padding and border in the element's total width and height */
      white-space: nowrap; /* Prevent text wrapping within buttons */
      overflow: hidden; /* Hide overflowed text */
      text-overflow: ellipsis; /* Add ellipsis for overflowed text */
    }

    #run-tests {
        width: 100%; /* Make run all tests button full width */
        flex-grow: 1; /* Allow it to grow */
        text-align: center;
        padding: 4px 8px; /* Slightly larger padding for main button */
        font-size: 10px; /* Slightly larger font for main button */
        margin-bottom: 5px;
    }

    .test-button:hover, #run-tests:hover, #test-ui-toggle:hover {
        background-color: #666;
    }

    /* Specific color styles for different button types */
    .test-button.main {
        background-color: #007bff; /* Blue */
    }
    .test-button.main:hover {
        background-color: #0056b3;
    }
    .test-button.mission {
        background-color: #28a745; /* Green */
    }
    .test-button.mission:hover {
        background-color: #218838;
    }
    .test-button.environment {
        background-color: #ffc107; /* Yellow */
        color: #333; /* Darken text for contrast */
    }
    .test-button.environment:hover {
        background-color: #e0a800;
    }
    .test-button.vehicle {
        background-color: #dc3545; /* Red */
    }
    .test-button.vehicle:hover {
        background-color: #c82333;
    }
    .test-button.stage {
        background-color: #6f42c1; /* Purple */
    }
    .test-button.stage:hover {
        background-color: #5a32a3;
    }
    .test-button.motor {
        background-color: #20c997; /* Teal */
        color: #333; /* Darken text */
    }
    .test-button.motor:hover {
        background-color: #1abc9c;
    }
    .test-button.upload {
        background-color: #17a2b8; /* Cyan */
    }
    .test-button.upload:hover {
        background-color: #138496;
    }
     .test-button.sequence {
        background-color: #fd7e14; /* Orange */
    }
    .test-button.sequence:hover {
        background-color: #fb8c00;
    }
     .test-button.steering {
        background-color: #6610f2; /* Indigo */
    }
    .test-button.steering:hover {
        background-color: #520bd7;
    }
    .test-button.stopping {
        background-color: #e83e8c; /* Pink */
    }
    .test-button.stopping:hover {
        background-color: #d63384;
    }
     .test-button.objective {
        background-color: #66bb6a; /* Light Green */
        color: #333;
    }
    .test-button.objective:hover {
        background-color: #5cb860;
    }
     .test-button.constraints {
        background-color: #42a5f5; /* Light Blue */
    }
    .test-button.constraints:hover {
        background-color: #3b9de5;
    }
     .test-button.opt-mode {
        background-color: #ffee58; /* Light Yellow */
        color: #333;
    }
    .test-button.opt-mode:hover {
        background-color: #ffeb3b;
    }
     .test-button.design-vars {
        background-color: #ab47bc; /* Purple */
    }
    .test-button.design-vars:hover {
        background-color: #9b3ebc;
    }

    .test-group-header {
        width: 100%; /* Make header take full width */
        margin-top: 6px; /* Less space above header */
        margin-bottom: 3px; /* Less space below header */
        font-size: 12px; /* Smaller font than before */
        color: #ccc;
        border-bottom: 1px solid #444; /* Separator line */
        padding-bottom: 2px;
    }

    .test-status-indicator {
      margin-top: 8px;
      border: 1px solid #555;
      padding: 6px;
      background: #222;
      max-height: 200px; /* Reduced height */
      overflow-y: auto;
      border-radius: 4px;
      color: #ccc;
      font-size: 10px; /* Smaller font size */
    }
    .test-step {
      margin-bottom: 3px;
      padding: 3px;
      border-left: 2px solid #444;
      border-radius: 2px;
      background: #2a2a2a;
    }
    .test-step.pending {
      border-left-color: #f39c12;
    }
    .test-step.completed {
      border-left-color: #2ecc71;
    }
    .test-step.error {
      border-left-color: #e74c3c;
    }
    .test-final-status {
      margin-top: 6px;
      text-align: center;
      font-weight: bold;
      color: #2ecc71;
      padding: 3px;
      border-radius: 3px;
      background: rgba(46, 204, 113, 0.1);
      font-size: 10px;
    }
  `;
  document.head.appendChild(style);
}
