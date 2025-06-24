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
  try {
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
    runAllTestsButton.onclick = function () {
      if (typeof window.TestHelpers.runAllTests === "function") {
        window.TestHelpers.runAllTests();
      } else {
        console.error("runAllTests function not found in TestHelpers");
      }
    };
    collapsibleContent.appendChild(runAllTestsButton);

    // Create container for individual test buttons
    const testButtonContainer = document.createElement("div");
    testButtonContainer.className = "test-button-container";
    collapsibleContent.appendChild(testButtonContainer);

    // Create status indicator area
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

    // Make the test UI draggable with improved implementation
    makeDraggable(mainTestContainer, testHeader);

    // Get data from test_sim.json through TestData
    const stagesData = [
      { name: "Stage 1", index: 1 },
      { name: "Stage 2", index: 2 },
    ];

    const motorsData = [
      { name: "Motor 1_1", stageIndex: 1, motorIndex: 1 },
      { name: "Motor 2_1", stageIndex: 2, motorIndex: 1 },
    ];

    // Count objective functions, constraints, and design variables
    // with better error handling
    const optimizationData = window.TestData
      ? window.TestData.optimization
      : null;
    const numObjectives = optimizationData?.objective?.length || 1;
    const numConstraints = optimizationData?.constraints?.length || 4;
    const numDesignVars = optimizationData?.design_variables?.length || 4;

    // Define test categories with specific buttons based on test_sim.json
    const testGroups = [
      {
        name: "Basic Forms",
        tests: [
          {
            name: "Test Mission",
            fn: function () {
              if (
                typeof window.TestHelpers.fillTestMissionData === "function"
              ) {
                window.TestHelpers.fillTestMissionData();
              } else {
                console.error(
                  "fillTestMissionData function not found in TestHelpers"
                );
              }
            },
            className: "test-button secondary mission",
          },
          {
            name: "Test Environment",
            fn: function () {
              if (
                typeof window.TestHelpers.fillTestEnvironmentData === "function"
              ) {
                window.TestHelpers.fillTestEnvironmentData();
              } else {
                console.error(
                  "fillTestEnvironmentData function not found in TestHelpers"
                );
              }
            },
            className: "test-button secondary environment",
          },
          {
            name: "Test Vehicle",
            fn: function () {
              if (
                typeof window.TestHelpers.fillTestVehicleData === "function"
              ) {
                window.TestHelpers.fillTestVehicleData("ascend");
              } else {
                console.error(
                  "fillTestVehicleData function not found in TestHelpers"
                );
              }
            },
            className: "test-button secondary vehicle",
          },
        ],
      },
      {
        name: "Stages",
        tests: stagesData.map((stage) => ({
          name: stage.name,
          fn: function () {
            if (
              typeof window.TestHelpers.fillTestStageData === "function" &&
              typeof window.TestHelpers.fillTestAeroData === "function"
            ) {
              window.TestHelpers.fillTestStageData(stage.index);
              window.TestHelpers.fillTestAeroData(stage.index);
            } else {
              console.error(
                "Stage data fill functions not found in TestHelpers"
              );
            }
          },
          className: "test-button stage",
        })),
      },
      {
        name: "Motors",
        tests: motorsData.map((motor) => ({
          name: motor.name,
          fn: function () {
            if (
              typeof window.TestHelpers.fillTestMotorData === "function" &&
              typeof window.TestHelpers.fillTestThrustData === "function"
            ) {
              window.TestHelpers.fillTestMotorData(
                motor.stageIndex,
                motor.motorIndex
              );
              window.TestHelpers.fillTestThrustData(
                motor.stageIndex,
                motor.motorIndex
              );
            } else {
              console.error(
                "Motor data fill functions not found in TestHelpers"
              );
            }
          },
          className: "test-button motor",
        })),
      },
      {
        name: "Sequence & Control",
        tests: [
          {
            name: "Fill Sequence",
            fn: function () {
              if (
                typeof window.TestHelpers.fillTestSequenceData === "function"
              ) {
                window.TestHelpers.fillTestSequenceData();
              } else {
                console.error(
                  "fillTestSequenceData function not found in TestHelpers"
                );
              }
            },
            className: "test-button sequence",
          },
          {
            name: "Fill Steering",
            fn: function () {
              if (
                typeof window.TestHelpers.fillTestSteeringData === "function"
              ) {
                window.TestHelpers.fillTestSteeringData();
              } else {
                console.error(
                  "fillTestSteeringData function not found in TestHelpers"
                );
              }
            },
            className: "test-button steering",
          },
          {
            name: "Fill Stopping Condition",
            fn: function () {
              if (
                typeof window.TestHelpers.fillTestStoppingConditionData ===
                "function"
              ) {
                window.TestHelpers.fillTestStoppingConditionData();
              } else {
                console.error(
                  "fillTestStoppingConditionData function not found in TestHelpers"
                );
              }
            },
            className: "test-button stopping",
          },
        ],
      },
      {
        name: "Optimization",
        tests: [
          {
            name: `${numObjectives} Objective${numObjectives > 1 ? "s" : ""}`,
            fn: function () {
              if (
                typeof window.TestHelpers.fillTestObjectiveFunction ===
                "function"
              ) {
                window.TestHelpers.fillTestObjectiveFunction();
              } else {
                console.error(
                  "fillTestObjectiveFunction function not found in TestHelpers"
                );
              }
            },
            className: "test-button objective",
          },
          {
            name: `${numConstraints} Constraint${
              numConstraints > 1 ? "s" : ""
            }`,
            fn: function () {
              if (
                typeof window.TestHelpers.fillTestConstraints === "function"
              ) {
                window.TestHelpers.fillTestConstraints();
              } else {
                console.error(
                  "fillTestConstraints function not found in TestHelpers"
                );
              }
            },
            className: "test-button constraints",
          },
          {
            name: "Fill Optimization Mode",
            fn: function () {
              if (
                typeof window.TestHelpers.fillTestOptimizationMode ===
                "function"
              ) {
                window.TestHelpers.fillTestOptimizationMode();
              } else {
                console.error(
                  "fillTestOptimizationMode function not found in TestHelpers"
                );
              }
            },
            className: "test-button opt-mode",
          },
          {
            name: `${numDesignVars} Design Variable${
              numDesignVars > 1 ? "s" : ""
            }`,
            fn: function () {
              if (
                typeof window.TestHelpers.fillTestDesignVariables === "function"
              ) {
                window.TestHelpers.fillTestDesignVariables();
              } else {
                console.error(
                  "fillTestDesignVariables function not found in TestHelpers"
                );
              }
            },
            className: "test-button design-vars",
          },
        ],
      },
    ];

    // Add group headers and buttons to container
    testGroups.forEach((group) => {
      // Add group header
      const groupHeader = document.createElement("h4");
      groupHeader.textContent = group.name;
      groupHeader.className = "test-group-header";
      testButtonContainer.appendChild(groupHeader);

      // Add group tests
      group.tests.forEach((test) => {
        const button = document.createElement("button");
        button.textContent = test.name;
        button.className = test.className || "test-button secondary";
        button.onclick = test.fn;
        testButtonContainer.appendChild(button);
      });
    });

    // Add basic styling specific to the test UI - more compact version
    addTestUIStyles();
  } catch (error) {
    console.error("Error initializing test UI:", error);
  }
}

// Helper function to make an element draggable
function makeDraggable(element, handle) {
  try {
    let isDragging = false;
    let offsetX, offsetY;

    // Mouse down event to start dragging
    handle.addEventListener("mousedown", function (e) {
      // Ignore if the click was on buttons or other interactive elements
      if (e.target !== handle && e.target.parentNode !== handle) return;

      isDragging = true;

      // Get the current position of the panel
      const rect = element.getBoundingClientRect();

      // Calculate the offset of the mouse within the header
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;

      // Change cursor to indicate dragging
      element.style.cursor = "grabbing";
    });

    // Mouse move event to perform the dragging
    document.addEventListener("mousemove", function (e) {
      if (!isDragging) return;

      // Calculate new position
      const x = e.clientX - offsetX;
      const y = e.clientY - offsetY;

      // Apply new position
      element.style.left = x + "px";
      element.style.top = y + "px";
      element.style.right = "auto"; // Remove the default right positioning
    });

    // Mouse up event to stop dragging
    document.addEventListener("mouseup", function () {
      if (isDragging) {
        isDragging = false;
        element.style.cursor = "default";
      }
    });
  } catch (error) {
    console.error("Error making element draggable:", error);
  }
}

// Helper function to add test UI styles
function addTestUIStyles() {
  const style = document.createElement("style");
  style.textContent = `
    #main-test-ui-container {
      position: fixed;
      bottom: 20px; /* Changed from top to bottom */
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
      box-shadow: 0 4px 8px rgba(0,0,0,0.3);
      transition: box-shadow 0.3s ease;
    }
    #main-test-ui-container:hover {
      box-shadow: 0 6px 12px rgba(0,0,0,0.5);
    }
    #test-ui-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 5px 8px; /* Reduced padding */
      background: #333;
      border-bottom: 1px solid #444;
      cursor: grab; /* Indicate it's draggable */
      user-select: none; /* Prevent text selection while dragging */
      border-top-left-radius: 5px;
      border-top-right-radius: 5px;
    }
    #test-ui-header:active {
      cursor: grabbing; /* Change cursor when actively dragging */
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

// Function to initialize test forms using test_sim.json
function initializeFromRealDataJson() {
  // Check if rawTestData is available
  if (window.rawTestData) {
    console.log("Initializing test forms from test_sim.json");

    // Set up the window.rawTestData variable as a global for test helpers to use
    if (!window.rawTestData) {
      loadRealDataJson().then((data) => {
        if (data) {
          console.log("Loaded rawTestData from test_sim.json");
          window.rawTestData = data;
          populateFromRealDataJson();
        }
      });
    } else {
      populateFromRealDataJson();
    }
  }
}

// Function to populate the test forms from test_sim.json
function populateFromRealDataJson() {
  try {
    // Add optimization mode
    const optModeBtn = document.getElementById("optimization-mode-test-btn");
    if (optModeBtn) {
      optModeBtn.addEventListener("click", function () {
        if (typeof window.TestHelpers.fillTestOptimizationMode === "function") {
          window.TestHelpers.fillTestOptimizationMode();
        } else {
          console.error(
            "fillTestOptimizationMode function not found in TestHelpers"
          );
        }
      });
    }

    // Add constraints
    const constraintsBtn = document.getElementById("constraints-test-btn");
    if (constraintsBtn) {
      constraintsBtn.addEventListener("click", function () {
        if (typeof window.TestHelpers.fillTestConstraints === "function") {
          window.TestHelpers.fillTestConstraints();
        } else {
          console.error(
            "fillTestConstraints function not found in TestHelpers"
          );
        }
      });
    }

    // Add design variables
    const designVarsBtn = document.getElementById("design-variables-test-btn");
    if (designVarsBtn) {
      designVarsBtn.addEventListener("click", function () {
        if (typeof window.TestHelpers.fillTestDesignVariables === "function") {
          window.TestHelpers.fillTestDesignVariables();
        } else {
          console.error(
            "fillTestDesignVariables function not found in TestHelpers"
          );
        }
      });
    }
  } catch (error) {
    console.error("Error in populateFromRealDataJson:", error);
  }
}

// Check if we need to add a Direct from JSON button to the test UI
document.addEventListener("DOMContentLoaded", function () {
  try {
    // Create a special button to fill forms directly from test_sim.json
    const testToolbar = document.querySelector(".test-toolbar");
    if (testToolbar) {
      const directJsonBtn = document.createElement("button");
      directJsonBtn.id = "direct-json-btn";
      directJsonBtn.textContent = "Fill from test_sim.json";
      directJsonBtn.className = "test-action-btn";
      directJsonBtn.style.backgroundColor = "#8e44ad"; // Purple color to differentiate

      directJsonBtn.addEventListener("click", function () {
        // Load test_sim.json if it's not already loaded
        if (!window.rawTestData) {
          loadRealDataJson().then((data) => {
            if (data) {
              // Check if SweetAlert is available
              if (typeof Swal !== "undefined") {
                Swal.fire({
                  title: "Using test_sim.json",
                  text: "Forms will be populated with data from test_sim.json",
                  icon: "info",
                  toast: true,
                  position: "top-end",
                  showConfirmButton: false,
                  timer: 3000,
                });
              } else {
                console.log("Using test_sim.json to fill forms");
              }

              // First we'll populate the design variables - with longer timeouts for stability
              setTimeout(() => {
                if (
                  typeof window.TestHelpers.fillTestDesignVariables ===
                  "function"
                ) {
                  window.TestHelpers.fillTestDesignVariables();

                  // Then the constraints with longer delay
                  setTimeout(() => {
                    if (
                      typeof window.TestHelpers.fillTestConstraints ===
                      "function"
                    ) {
                      window.TestHelpers.fillTestConstraints();

                      // And finally the mode with longer delay
                      setTimeout(() => {
                        if (
                          typeof window.TestHelpers.fillTestOptimizationMode ===
                          "function"
                        ) {
                          window.TestHelpers.fillTestOptimizationMode();
                        }
                      }, 3000);
                    }
                  }, 3000);
                }
              }, 2000);
            } else {
              // Show error message
              if (typeof Swal !== "undefined") {
                Swal.fire({
                  title: "Error",
                  text: "Failed to load test_sim.json",
                  icon: "error",
                  toast: true,
                  position: "top-end",
                  showConfirmButton: false,
                  timer: 3000,
                });
              } else {
                console.error("Failed to load test_sim.json");
              }
            }
          });
        } else {
          // If data is already loaded, just use it to populate the forms
          if (typeof Swal !== "undefined") {
            Swal.fire({
              title: "Using cached test_sim.json",
              text: "Forms will be populated with data from test_sim.json",
              icon: "info",
              toast: true,
              position: "top-end",
              showConfirmButton: false,
              timer: 3000,
            });
          } else {
            console.log("Using cached test_sim.json to fill forms");
          }

          // Follow the same sequence as above with longer delays
          setTimeout(() => {
            if (
              typeof window.TestHelpers.fillTestDesignVariables === "function"
            ) {
              window.TestHelpers.fillTestDesignVariables();

              setTimeout(() => {
                if (
                  typeof window.TestHelpers.fillTestConstraints === "function"
                ) {
                  window.TestHelpers.fillTestConstraints();

                  setTimeout(() => {
                    if (
                      typeof window.TestHelpers.fillTestOptimizationMode ===
                      "function"
                    ) {
                      window.TestHelpers.fillTestOptimizationMode();
                    }
                  }, 3000);
                }
              }, 3000);
            }
          }, 2000);
        }
      });

      // Add button to the toolbar
      testToolbar.appendChild(directJsonBtn);
    }
  } catch (error) {
    console.error("Error setting up direct JSON button:", error);
  }
});
