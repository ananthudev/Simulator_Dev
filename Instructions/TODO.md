# ASTRA GUI TODO List

## Completed Tasks ✅

### Core Data Management & Handling (`formHandler.js`, `missionDataHandler.js`)

- [x] **Global Data Structures:** Initialized and managed key data objects:
  - `finalMissionData`: The primary structure holding the complete mission configuration for export.
  - `flagRegistry`: Central registry for all event flags (Stage Init/Sep, Motor Ign/Burnout/Cutoff, Heatshield Sep, Custom Steering Start/Stop) used for dependencies and dropdowns.
  - `savedStages`: Internal array tracking stage data during configuration.
  - `eventSequence`: Array holding the user-defined sequence events.
- [x] **Mission Data Saving/Export (`missionDataHandler.js`):**
  - Triggered by 'Launch' button.
  - Performs final validation (`validateMissionData`) checking for required sections (mission, vehicle refs, stages, sequences) and properties.
  - Converts `finalMissionData` to formatted JSON.
  - Generates timestamped filename (`mission_data_...json`).
  - Prompts user to save the file using a dynamically generated download link.
- [x] **Data Integration (`formHandler.js`):**
  - Functions (`saveMissionDetails`, `appendEnviroDetails`, `appendVehicleDetails`, `saveStageData`, `saveMotorData`, `saveNozzleData`, `saveStoppingConditionToFinalData`, `saveSteeringConfigToFinalData`) to collect data from forms and merge it into the `finalMissionData` structure.
  - Handles complex data structuring: dynamic keys (e.g., `VehicleName`, `Stage_X`, `VehicleName_Sequence`), nested objects (Payload, Heatshield, Gravity, Initial States), array management (stages, motors, sequence events, steering components).
  - Manages cleanup of old data entries (e.g., previous vehicle/payload/mission link/steering/sequence) when names are changed during editing.
  - Updates `flagRegistry` as stages/motors/steering components are configured.
- [x] **File Handling (`formHandler.js`):**
  - CSV Upload for Environment (Atmosphere, Wind) and Steering (Profile).
  - Includes file input triggering, validation (type, size), filename display, clearing selection.
  - Reads file content using `FileReader` (`readFileAsText`).
  - Parses CSV data (`parseAtmosCSV` or specific parser).
  - Integrates parsed data into `finalMissionData` or component config (`steering-module.js`).
  - Provides default Wind data if no file uploaded or on error.

### Form Validation (`validation.js`)

- [x] **`FormValidator` Class:** Centralized validation logic with static methods.
- [x] **Field-Level Feedback:** `showError`/`removeError` methods provide real-time visual feedback (red border, error message below field).
- [x] **Real-time Validation:** `validateOnInput` attaches listeners (`input`, `blur`) to fields for immediate feedback.
- [x] **Comprehensive Form Validation:**
  - Mission: Name (required, length), Mode, Date, Time.
  - Environment: Planet, Atmosphere (model/CSV mutual exclusion), Gravity (order, degree), Core Info.
  - Vehicle: Name, Type, Payload/PLF mass & sep, Integration, Timestep, Effective Alt.
  - Vehicle Initial Conditions: Dynamic validation based on Type (Ascend/Projectile/Orbital) and selected method (States, Launch Point, TLE, Elements), ensuring all required numeric/text fields are filled correctly.
  - Sequence: Event Flag, Trigger Type/Value, Reference Flag.
  - Stage: Structural Mass, Ref Area, Burn Time, Aero Data file.
  - Motor: Structural Mass, Propulsion Type/Mass, Nozzle Diameter, Thrust Time file.
  - Nozzle: All parameters (Diameter, Thrust components, Location, Alignment, Orientation, Throat).
  - Steering (Profile): Mode, Quantity, Independent Variable, Profile CSV file.
- [x] **Initialization:** Disables default browser validation (`novalidate`) and initializes real-time listeners on `DOMContentLoaded`.
- [x] **General Feedback:** Utility methods (`showGeneralError`, `showGeneralSuccess`, `showGeneralInfo`) using SweetAlert2 for non-field-specific messages.

### UI Navigation & Interaction (`ui-navigation.js`)

- [x] **Single-Page Application Flow:** Manages visibility of different form sections (`mission`, `environment`, `vehicle`, `sequence`, `steering`, `stopping`, `optimization` sub-sections) using `showForm`, `hideAllForms`.
- [x] **Dynamic Sidebar Navigation:**
  - Updates sidebar menu based on Mission Mode (adds/removes Optimization section).
  - Handles clicks on main sidebar links to show corresponding forms.
- [x] **Dynamic Stage/Motor/Nozzle Management (UI):**
  - Creates sidebar entries and form elements dynamically when "Add Stage" or "Add Motor" is clicked.
  - Enforces limits on the number of stages (4) and motors per stage (15).
  - Adds delete buttons to stages/motors in the sidebar.
  - Handles deletion confirmation (SweetAlert2) and removal of UI elements (sidebar entry, form).
  - Coordinates with `formHandler.js` to remove associated data upon deletion.
- [x] **Dynamic Form Field Updates:**
  - Shows/hides initial condition sections based on selected Vehicle Type.
  - Shows/hides stopping condition fields based on selected criteria (Flag/Time/Altitude).
  - Clears/resets fields when relevant selections change (e.g., Vehicle Type) to prevent data conflicts.
- [x] **Data Inheritance (UI):** Automatically populates Motor structural mass and Nozzle diameter from their parent Stage/Motor forms (read-only).
- [x] **User Feedback:** Uses SweetAlert2 for confirmations (deletion), errors (max limits reached), and success messages (stage/motor created).

### Steering Module (`steering-module.js`)

- [x] **Component-Based Architecture:** Replaced older tab system with a flexible component approach.
  - Available Components list: Users add components from this list.
  - Active Components list: Shows the components added to the current steering sequence.
  - Configuration Panel: Displays configuration options for the currently selected active component.
- [x] **Component Management:**
  - Add/Remove components (`addSteeringComponent`, `removeSteeringComponent`).
  - Enforces instance limits per type (e.g., 5 Vertical Ascend, 8 Profile).
  - Generates unique IDs and display names (e.g., `profile_1`, "Profile 1").
  - Updates UI counters (`updateComponentCounter`) and disables "Add" buttons when limits are reached.
- [x] **Component Configuration:**
  - Dedicated tabs for Start Trigger, Stop Trigger, and Steering Parameters.
  - **Triggers:** Configurable Identity (flag name), Trigger Type, Value, Reference Flag, Comment. Uses shared dropdown logic (`updateSteeringReferenceDropdowns`).
  - **Steering Parameters:** Dynamically generates input fields (`generateSteeringFields`) based on selected `steering_type`. Supports Zero Rate, Constant Body Rate (Axis, Value), CLG (Algorithm, sub-params for AOA/FPA), Profile (Mode, Quantity, Independent Var, CSV upload).
- [x] **Configuration State Management (`SteeringConfigHandler`):**
  - Populates the panel when a component is selected (`populateAndValidatePanel`).
  - Tracks dirty/saved state (`isDirty`, `isSaved`) for each component's configuration sections (start, stop, steering).
  - Validates each section (`validateSection`, `validateSteeringParams`) before saving.
  - Enables/disables save buttons and updates their text/styling based on validity and state (`updateSaveButtonState`).
  - Saves configuration changes to the `window.steeringState.activeComponents` object.
- [x] **Profile Steering CSV Handling:** Integrated CSV upload, parsing, validation, and storage within the Profile component configuration. Includes template download function (`downloadProfileTemplate`).
- [x] **Integration with Main Data:** Saves the final steering configuration sequence into `finalMissionData` (likely via `saveSteeringConfigToFinalData` called on form submit). Updates global flag registry and reference dropdowns.

### Optimization Module Enhancements (`optimization.js`, `map-component.js`)

- [x] **Constraint Flag Handling:**
  - Implemented dynamic flag requirement logic for different constraint types.
  - Added automatic disabling of flag dropdown for specific constraint types (Q, MAX_QAOA, ALPHA, MAX_BODY_RATE, MAX_HEAT_FLUX, SLACK_VARIABLE, MAX_SENSED_ACC, CUSTOM, DCISS_IMPACT).
  - Added informative tooltip message when flag field is disabled.
  - Modified validation logic to skip flag validation for constraint types that don't require flags.
- [x] **Line Bounds Data Structure:**
  - Implemented segmented line bounds for DCISS_IMPACT and CUSTOM constraints.
  - Updated coordinate data structure to organize points into separate line segments (l1, l2, l3, etc.) instead of a single array.
  - Each line segment limited to 2 points to ensure proper line formation.
  - Maintained backward compatibility with existing code.
- [x] **Map Component for Constraint Visualization:**
  - Added interactive map interface for defining geographical constraints.
  - Implemented line segment selector to let users create multiple boundary lines.
  - Added color-coding for different line segments for better visual distinction.
  - Implemented coordinate input fields and table display with "center" and "delete" actions.
  - Maintained lat/long coordinate swapping for Astra C compatibility.
  - Added styling to improve the UI and make segment relationships clear.
- [x] **Design Variable Segment Dropdown Logic:** Ensured correct population of segment dropdowns for 'PROPULSION' (motor names) and 'STEERING' (steering component names) categories, including fixing refresh mechanisms and initialization.
- [x] **Per-Axis Bounds Configuration UI:**
  - Implemented a checkbox-based UI for selecting individual axes (Roll, Pitch, Yaw) in PROFILE and CONST_BODYRATE steering segment types.
  - Created a dynamic system where selecting an axis shows dedicated lower/upper bound input fields for that specific axis.
  - Structured the data collection to organize bounds into proper arrays per axis in the JSON output.
  - Improved form layout by positioning bound fields in logical order (e.g., above Independent Variable fields in PROFILE type).
  - Added validation to ensure at least one axis is selected.
  - Maintained backward compatibility with existing JSON structure.
- [x] **Optimization JSON Output:** Implement saving/exporting the Optimization configuration sections (Objective Function, Constraints, Mode, Design Variables) into the main `finalMissionData` JSON structure.
- [x] **Engine Integration (Initial):**
  - Test the fully generated JSON (including Mission, Env, Vehicle, Sequence, Steering, Optimization) directly with the Astra C simulation engine.
  - Establish communication channel between Electron frontend (JS) and the Astra C binary (potentially via WSL on Windows).
  - Implement passing the generated JSON file path or content to the C binary.
  - Capture standard output/error streams from the C binary process.
  - Display simulation results/output from the C binary back into the frontend UI.

### General UI/UX Features

- [x] **Interactive Form Navigation:** Smooth transitions between main sections and dynamic stage/motor/nozzle forms.
- [x] **Real-time Validation Feedback:** Immediate visual cues for input errors.
- [x] **User-Friendly Feedback:** Consistent use of SweetAlert2 for notifications, confirmations, errors, and success messages.
- [x] **Form State Management:** Handled within `formHandler.js` (saving data) and `steering-module.js` (component config state).
- [x] **Event System:** Robust use of event listeners for button clicks, input changes, form submissions, etc., including event delegation for dynamically added elements.
- [x] **Tooltips:** Added in specific sections for better user guidance.

### Steering Module Updates (Specific Tasks from Previous TODO)

- [x] Updated basic steering components (Vertical Ascend, Pitch Hold, Constant Pitch, Gravity Turn, Profile, Coasting) to allow multiple instances with limits.
- [x] Removed singleton behavior and added instance numbering to component names and flags (e.g., "Profile 1", `PROFILE_START_1`).
- [x] Implemented limits per component type.
- [x] Added unique identifiers for instances (`verticalAscend_1`, etc.).
- [x] Exposed steering component names (via Start/Stop flags) to sequence/stopping condition reference dropdowns.
- [x] Created data access interface (via `window.steeringState` and `finalMissionData` integration).
- [x] Ensured component references update correctly (e.g., in dropdowns).

### Mission Loading & Dropdown Fixes (`openMissionHandler.js`, `formHandler.js`)

- [x] Implemented "Open Mission" button and `populateForms` to load and parse mission JSON, reset state, and navigate to Mission Details form.
- [x] Added `seedFlags` logic in `populateForms` to initialize `window.eventSequence` from loaded data and refresh flag dropdowns (`updateReferenceFlagDropdown`, `populateStoppingFlagDropdown`).
- [x] Modified `populateStoppingFlagDropdown` in `formHandler.js` to remember and preserve the user's previous dropdown selection, preventing reset to placeholder on focus change.

### Form Handler Enhancements (`formHandler.js`)

- [x] Added `saveNozzleData` and wired it into the UI navigation for nozzle form submissions.
- [x] Integrated `saveMotorData` directly into motor form submissions through UI navigation.
- [x] Implemented `updateStageNumberInData` logic for renaming stages, motors, and nozzles in `savedStages`, `finalMissionData`, and `flagRegistry`.
- [x] Implemented `sortSavedStages` to maintain ordered `savedStages` array.
- [x] Added `addMotorKeyToStage` to track new motors in `savedStages`.

## Pending Tasks

### Core Features & Integration

- [ ] **Simultaneous Missions:** Enable the execution of multiple mission simulations concurrently (requires backend and UI handling for multiple processes/outputs).
- [x] **"Open Mission" Functionality:**
  - [x] Implement the "Open Mission" button to allow users to select a previously saved mission JSON file.
  - [x] Parse the selected JSON file.
  - [x] Auto-populate all corresponding form fields across all sections (Mission, Env, Vehicle, Stages, Motors, Nozzles, Sequence, Steering, Stopping, Optimization) with the loaded data.
  - [x] Handle potential parsing errors gracefully.
  - [x] Manage loaded file data (e.g., how to represent previously uploaded CSVs like Atmosphere, Wind, Aero, Thrust, Profile - maybe store filenames and prompt user if files are missing, or embed data if feasible).
- [ ] **Edit Loaded Mission Data:** Allow users to modify data in forms after loading a mission JSON.
- [ ] **Re-Save Prompt:** If a user modifies data loaded from a JSON, prompt them to save the changes before running the mission again.
- [ ] **Re-run Mission:** Allow users to trigger the mission launch (sending updated data to the backend) after editing a loaded file.

### UI/UX Improvements

- [ ] **Linear Form Workflow:**
  - Enforce a sequential form filling process. Start with only the "Mission Details" form enabled.
  - Unlock the next form section (e.g., Environment) only after the current one is successfully saved.
  - Continue this pattern for all main sections (Vehicle, Stages, Sequence, Steering, Stopping, Optimization if applicable).
- [ ] **Form Status Indicators:**
  - Add visual indicators (e.g., icons - checkmark, dot, warning) to sidebar navigation items and configuration panel tabs (like Steering Start/Stop/Params) to show the saved/unsaved/error status of each section.
- [ ] **Steering Preview Modal Styling:** Change the background color and overall styling of the steering configuration preview modal to match the application's dark theme.
- [ ] **Offline Map Functionality:**
  - Implement support for offline maps by downloading tiles using Mobile Atlas Creator.
  - Integrate cached map tiles with the map component for constraint visualization.
  - Ensure maps are accessible without internet connection.
- [ ] **Theme Toggle (Day/Night Mode):**
  - Add a toggle button (e.g., sun/moon icon) to switch between light and dark themes.
  - Implement CSS variables or class toggling to apply theme changes across the entire application UI.
- [ ] **Open Mission Loading Feedback:** Provide visual feedback (e.g., progress bar, status messages) while a mission JSON file is being parsed and forms are being populated.
- [ ] **Loading Indicator:** Update or replace the existing loading GIF/indicator with a more modern or theme-consistent visual.
- [ ] Refactor DOM-based data inheritance (e.g., structural mass, nozzle diameter) to use central data model in `formHandler.js` instead of brittle listeners in `ui-navigation.js`.
- [ ] Implement motor deletion cleanup: call `formHandler` functions to remove motor and its nozzle entries from `savedStages`, `finalMissionData`, and `flagRegistry` when a motor is deleted via the UI.

### Data Management & Persistence

- [ ] **Auto-Save Forms:** Implement an auto-save mechanism for each form section upon successful validation/saving to prevent data loss or inconsistency if the user navigates back and forth.
- [ ] **Session Persistence:** Prevent data loss upon application refresh or restart. Explore options:
  - `localStorage`/`sessionStorage` for temporary state.
  - Saving the current `finalMissionData` state to a local file periodically or on close.
  - Database storage (see User Management/Online Features).
- [ ] **Local & Database JSON Storage:**
  - Save generated mission JSON files both locally (as currently implemented) and to a database (see User Management).
- [ ] **Admin Dashboard:**
  - Create a separate interface for administrators.
  - Log user activity: logins, mission runs (timestamp, user, mission file/ID), key navigation events.
  - Display logs and user information in the admin dashboard.
- [ ] **Mission History:** Implement functionality to view a list of past mission runs (requires database storage).
- [ ] **View Past Outputs:** Allow users to view the simulation output associated with past mission runs (requires storing output data).
- [ ] **Rerun Past Mission:** Add an option to easily rerun a mission configuration from the history view.

### Validation

- [ ] **Complete Form Validations:** Review and implement robust validation for any remaining form sections or fields not currently covered (especially within Optimization sections).
- [ ] **Cross-Form Consistency Checks:** Implement checks to prevent data inconsistencies between different sections (e.g., ensuring flags used in Sequence/Steering exist). (Partially done, needs comprehensive review).

### User Management & Online Features

- [ ] **User Authentication:**
  - Implement Registration and Login functionality.
  - Securely manage user credentials.
- [ ] **User Accounts:** Provide basic user account management features.
- [ ] **Licensing:** Implement a licensing mechanism (details TBD).
- [ ] **Database Integration:** Set up a database (e.g., PostgreSQL, MongoDB) to store user accounts, saved missions, and potentially logs.
- [ ] **Online Backend Deployment (AWS):**
  - Dockerize the Astra C binary and potentially a lightweight backend API (e.g., Python/Node.js) to handle requests.
  - Deploy the containerized backend to AWS (e.g., ECS, EC2, Fargate).
  - Modify frontend to communicate with the deployed backend API instead of a local binary.

### DevOps

- [ ] **CI/CD Pipeline:** Complete setup and configuration of GitLab CI/CD pipeline (or Jenkins/Gerrit as mentioned) for automated builds, testing, and potentially deployment.

### Maintenance & Future Releases

- [ ] **Ongoing Maintenance:** Bug fixing, dependency updates, performance monitoring.
- [ ] **Future Releases:** Plan and implement future features and improvements based on user feedback and project roadmap.

### Documentation

- [ ] **Help Documentation:** Create user-facing documentation explaining application features, workflow, and configuration options.

### Testing

- [x] Create isolated test suite with Cypress
  - [x] End-to-end tests for core functionality
  - [x] Form validation tests
  - [x] API interaction tests with mock server
  - [x] Custom test commands and utilities
  - [x] Realistic test fixtures for simulation and optimization modes using testcase.jsonc data
- [ ] Unit test implementation
- [ ] Integration test suite
- [ ] Performance testing

### Optimization

- [ ] Code optimization for large datasets
- [ ] Memory usage optimization
- [ ] Loading time improvements
- [ ] Browser compatibility testing

### Contributor - Ananthu Dev (Frontend Developer (Electron.js, HTML, CSS, JavaScript, JSON Handling), Backend Integration (JS/Python, Astra C Binary), DevOps (GitLab CI/CD, Gerrit, Jenkins), Cloud (AWS, Docker), Database, Licensing, Maintenance and Support)

### Code Refactoring & Conflict Resolution

- [ ] **Function Name Deduplication:** Resolve duplicate utility functions across files:

  - Consolidate error/success handling (`showError`, `showSuccess`, `showWarning`) between `formHandler.js` and `validation.js`.
  - Standardize on `FormValidator` class for all validation and feedback.
  - Document which version should be used where to prevent confusion.

- [ ] **Global Namespace Management:**

  - Reduce reliance on `window` object properties (`finalMissionData`, `

## Documentation: Astra GUI Overview

This Electron-based desktop application (the Astra GUI) provides a complete interface for configuring, running, and visualizing ASTRA mission simulations:

- **Mission Workflow**: Build missions via forms covering Mission Details, Environment (planet, atmosphere, wind, gravity/COE), Vehicle (type, initial conditions, payload, PLF), Stages/Motors/Nozzles, Event Sequence, Steering, Stopping Criteria, and (in Optimization mode) Objective Function, Constraints, Optimization Mode, and Design Variables.
- **Mode-Aware UI**: Selecting "simulation" shows only simulation settings; selecting "optimization" reveals additional navigation items and forms for objective, constraints, mode settings, and design variables.
- **Dynamic Form Generation**: "Add Stage/Motor/Component" buttons create numbered form sections on-the-fly, each with limits and unique IDs (e.g., `profile_1`, `profile_2`).
- **CSV Upload Support**: Users can upload CSV files for atmosphere, wind, thrust curves, and steering profiles; the file names and parsed data are stored in memory and reloaded when opening saved missions.
- **Event-Driven Interactions**: Custom events (e.g., `sequenceUpdated`, `download-thrust-data`) and change/listeners manage UI updates and data synchronization.
- **Integration with ASTRA Engine**: Launches the ASTRA C binary via WSL, captures and colorizes its ANSI output in a pop-up terminal, and displays key results (COE, ΔV, mission info) in the GUI.
- **Mission Persistence**: Save and re-open mission JSON files with full state preservation; detect unsaved changes and prompt for re-save before re-running.
- **Testing & CI**: Cypress end-to-end tests, mock-server fixtures, and a GitLab CI pipeline ensure robust validation of core functionality, including form validation and engine integration.
- **Modular Architecture**: Organized into JavaScript modules (formHandler, missionDataHandler, openMissionHandler, steering-module, optimization.js) and styled with CSS; uses SweetAlert2 for notifications and modals.
- **State Management**: Uses global `window.finalMissionData` and `window.steeringState` objects for in-memory storage; aims to reduce direct DOM data mixing in future refactors.
- **UX Enhancements**: Real-time validation feedback, save/done indicators, component previews, theme support, offline map tile caching, and dynamic help/tooltips for a seamless user experience.

These points summarize the core capabilities, architecture, and workflow of the Astra GUI front-end.

// End of generated documentation
