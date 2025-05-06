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

## Pending Tasks

### Core Features & Integration

- [ ] **Optimization JSON Output:** Implement saving/exporting the Optimization configuration sections (Objective Function, Constraints, Mode, Design Variables) into the main `finalMissionData` JSON structure.
- [ ] **Engine Integration (Initial):**
  - Test the fully generated JSON (including Mission, Env, Vehicle, Sequence, Steering, Optimization) directly with the Astra C simulation engine.
  - Establish communication channel between Electron frontend (JS) and the Astra C binary (potentially via WSL on Windows).
  - Implement passing the generated JSON file path or content to the C binary.
  - Capture standard output/error streams from the C binary process.
  - Display simulation results/output from the C binary back into the frontend UI.
- [ ] **Simultaneous Missions:** Enable the execution of multiple mission simulations concurrently (requires backend and UI handling for multiple processes/outputs).
- [ ] **"Open Mission" Functionality:**
  - Implement the "Open Mission" button to allow users to select a previously saved mission JSON file.
  - Parse the selected JSON file.
  - Auto-populate all corresponding form fields across all sections (Mission, Env, Vehicle, Stages, Motors, Nozzles, Sequence, Steering, Stopping, Optimization) with the loaded data.
  - Handle potential parsing errors gracefully.
  - Manage loaded file data (e.g., how to represent previously uploaded CSVs like Atmosphere, Wind, Aero, Thrust, Profile - maybe store filenames and prompt user if files are missing, or embed data if feasible).
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

- [ ] Unit test implementation
- [ ] Integration test suite
- [ ] End-to-end testing
- [ ] Performance testing

### Optimization

- [ ] Code optimization for large datasets
- [ ] Memory usage optimization
- [ ] Loading time improvements
- [ ] Browser compatibility testing

### Contributor - Ananthu Dev (Frontend Developer (Electron.js, HTML, CSS, JavaScript, JSON Handling), Backend Integration (JS/Python, Astra C Binary), DevOps (GitLab CI/CD, Gerrit, Jenkins), Cloud (AWS, Docker), Database, Licensing, Maintenance and Support)
