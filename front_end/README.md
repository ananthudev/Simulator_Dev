# Astra Mission Planner

## Overview

Astra Mission Planner is a GUI-based application designed for configuring and optimizing satellite launch trajectories. It provides a structured workflow to collect mission parameters, environment data, vehicle details, sequence events, steering commands, and optimization settings. The application generates a structured JSON configuration file compatible with the ASTRA C++ backend for simulation and optimization.

## Core JavaScript Functionalities

The frontend application leverages several key JavaScript modules to provide a dynamic and interactive user experience:

### 1. UI Navigation & Dynamic Content (`js/ui-navigation.js`)

- **Single-Page Application Flow:** Manages the visibility of different configuration sections (Mission, Environment, Vehicle, Sequence, Steering, Optimization, Stopping Criteria) based on sidebar navigation clicks, providing a seamless single-page experience.
- **Dynamic Sidebar:** Adjusts the sidebar menu items based on the selected mission mode (Simulation vs. Optimization), adding relevant optimization sub-sections when needed.
- **Dynamic Stage/Motor/Nozzle Management:**
  - Handles the creation of new Stage, Motor, and Nozzle elements in the sidebar and their corresponding configuration forms in the main content area.
  - Enforces limits on the maximum number of stages per vehicle (4) and motors per stage (15).
  - Manages the deletion of stages/motors/nozzles, including UI cleanup and triggering data removal in the backend logic.
- **Vehicle Type Adaptation:** Modifies the Vehicle configuration form dynamically based on the selected vehicle type (Ascend, Projectile, Orbital), showing/hiding relevant input sections (e.g., State Vectors vs. Launch Point, TLE vs. Orbital Elements).
- **Conditional UI Elements:** Controls the visibility and state of UI elements based on user selections (e.g., enabling/disabling fields based on radio button choices in Stopping Criteria).

### 2. Form Handling & Data Management (`js/formHandler.js`)

- **Central Data Store:** Manages the primary `finalMissionData` JavaScript object, which accumulates all configuration data from the various forms.
- **Form Data Saving:** Contains functions to capture input values from each form section (Mission, Environment, Vehicle, Stage, Motor, Nozzle, Sequence, Steering, Stopping Conditions) and structure them correctly within `finalMissionData`.
- **Dynamic Key Generation:** Creates keys within the JSON structure based on user input (e.g., using the vehicle name for vehicle-specific entries like `MyRocket`, `MyRocket_Steering`, `MyRocket_Sequence`).
- **Data Structuring:** Ensures the final JSON adheres to the format expected by the ASTRA backend, correctly nesting objects and arrays for stages, motors, nozzles, initial conditions, payloads, etc.
- **Event Sequence Logic:** Manages the creation, validation (dependency checks, circular reference detection), and saving of the mission event sequence.
- **Flag Registry:** Maintains a registry of all defined event flags (Stage Init/Sep, Motor Ignition/Burnout/Cutoff, Heatshield Sep) used for event dependencies and dropdown population.
- **Data Cleanup:** Includes logic to remove orphaned data when configurations change (e.g., removing old vehicle data if the vehicle name is updated).
- **File Handling Integration:** Reads uploaded CSV files (Atmosphere, Wind, Aero, Thrust, Profile Steering) using the `FileReader` API and parses the data for inclusion in `finalMissionData`. Provides default data (e.g., wind) if files are missing or invalid.
- **User Feedback:** Integrates SweetAlert2 (`Swal`) to provide consistent success, error, and warning notifications to the user during data saving and validation.

### 3. Input Validation (`js/validation.js`)

- **`FormValidator` Class:** Provides a comprehensive set of static methods for validating user input across all forms.
- **Real-time Validation:** Attaches event listeners (`input`, `blur`) to form fields to provide immediate feedback as the user enters data.
- **Field-Level Error Display:** Shows/hides specific error messages directly below invalid fields and applies visual styling (red borders) for clarity.
- **Form-Level Validation:** Executes validation checks when attempting to save a form section, preventing submission if errors exist and displaying a summary message using SweetAlert2.
- **Comprehensive Rules:** Implements a wide range of validation rules, including:
  - Required fields check.
  - Data type validation (numeric, positive numbers, specific formats like TLE lines).
  - Range checks (e.g., mass > 0, probabilities 0-1).
  - Conditional validation based on selections (e.g., validating specific launch point fields only if "Launch Point" is selected).
  - Mutual exclusion checks (e.g., Atmosphere model vs. CSV upload).
- **Dynamic Validation:** Initializes validation listeners for dynamically created elements (Stages, Motors, Nozzles, Optimization constraints/variables).

### 4. Steering Configuration (`js/steering-module.js`)

- **Component-Based Steering:** Allows users to build steering sequences by adding multiple instances of different steering component types (Vertical Ascend, Pitch Hold, Constant Pitch Rate, Gravity Turn, Profile, Coasting, etc.).
- **Instance Management:** Manages unique instances of each component type, enforcing limits on the number of instances per type. Generates unique IDs and flags for each instance.
- **Configuration Panel:** Provides a dedicated panel with 'Start', 'Stop', and 'Steering' tabs to configure the parameters for each selected steering component instance.
- **Dynamic Parameter Fields:** Generates specific input fields within the 'Steering' tab based on the chosen steering logic (e.g., fields for Axis/Value for Constant Body Rate, fields for Algorithm/Gains for CLG).
- **Profile Steering Handling:** Includes specific UI for configuring Profile steering, including CSV upload, template download, and parameter selection (Mode, Quantity, Independent Variable).
- **State Management:** Uses a `window.steeringState` object to track active components, their configurations, and unsaved changes (`isDirty`, `isSaved`).
- **Validation & Saving:** Integrates with `FormValidator` to validate steering parameters and manages the saving of component configurations within `window.steeringState`. Provides visual feedback on save status via button text changes ("Save" -> "Saved ✓").

### 5. Optimization Configuration (`js/optimization.js`)

- **Dedicated Optimization Forms:** Manages the UI for the "Optimization" section, including sub-forms for Objective Function, Constraints, Mode, and Design Variables.
- **Algorithm Parameter Definition:** Defines the available parameters, types, ranges, and default values for various optimization algorithms (SGA, DE, SADE, pDE, PSO, IPOPT, CS, NLOPT).
- **Dynamic Form Generation:**
  - Allows adding multiple objective functions, constraints, and design variables dynamically.
  - Generates specific input fields based on the selected constraint type or design variable category.
  - Populates dropdowns with relevant options derived from the main mission configuration (e.g., stage names, motor flags, steering component names).
- **Complex Parameter Linking:** Manages relationships, allowing users to link design variables or constraints to specific parts of the mission setup (e.g., target a specific stage's structural mass or a specific steering component's trigger value).
- **Optimization Mode Setup:** Configures algorithm selection, population size, and other mode-specific settings, dynamically displaying parameters for the selected algorithm(s).
- **Data Aggregation & Saving:** Collects all optimization settings into a structured format suitable for the `finalMissionData` object.

### 6. Interactive Map for Constraints (`js/map-component.js`)

- **Leaflet Integration:** Embeds an interactive map within specific constraint types (DCISS Impact, IIP, Custom) that require geographic coordinates.
- **Marker Interaction:** Allows users to:
  - Click on the map to add coordinate markers (up to a limit).
  - Drag existing markers to adjust their position.
  - Manually input latitude/longitude values.
- **Coordinate Management:** Displays added coordinates in a table with options to center the map on a marker or delete it.
- **Data Binding:** Updates a hidden input field associated with the constraint, storing the collected coordinates as a JSON string (e.g., `[[lat1, lon1], [lat2, lon2]]`).
- **Dynamic Initialization:** Initializes the map only when a relevant constraint type requiring coordinates is added or selected.

### 7. Data Export (`js/missionDataHandler.js`)

- **Final Validation:** Performs a final integrity check (`validateMissionData`) on the complete `finalMissionData` object before export, ensuring all necessary sections and references are present.
- **JSON Generation:** Converts the final, validated `finalMissionData` object into a well-formatted JSON string.
- **File Download:** Prompts the user (via SweetAlert2) to save the generated configuration as a timestamped JSON file (`mission_data_YYYY-MM-DDTHH-mm-SS-sssZ.json`) using a Blob and temporary download link.
- **Launch Trigger:** Attaches the save/export functionality to the main "Launch" button.

## Installation

### Prerequisites

Ensure you have the following installed:

- **Node.js & npm:** For running the Electron frontend and managing dependencies (Install from [nodejs.org](https://nodejs.org/)).
- **(Optional) C++ Compiler:** Required if you intend to run the ASTRA C++ simulation/optimization backend using the generated JSON.

### Setup

```bash
# Navigate to the front_end directory
cd front_end

# Install dependencies
npm install

# Run the Electron.js application
npm start
```

## Project Workflow

### 1. Mission Configuration

- User inputs mission name, selects mode (Simulation/Optimization), sets date/time, and tracking options.

### 2. Environment Configuration

- User selects planet, atmospheric model (standard or CSV upload), wind data (CSV upload or default), gravity model, and COE info.

### 3. Vehicle Configuration

- User defines vehicle name, type (Ascend/Projectile/Orbital), payload details, PLF details (mass, separation flag), integration method, and initial conditions (State Vectors, Launch Point, TLE, or Orbital Elements based on type).

### 4. Stage/Motor/Nozzle Configuration

- User dynamically adds Stages (up to 4).
- For each stage, configures structural mass, reference area, burn time, aero data (CSV), DCISS/Coasting toggles.
- User dynamically adds Motors to each stage (up to 15).
- For each motor, configures propulsion type/mass, nozzle diameter, thrust data (CSV). Default flags are generated.
- For each motor, configures the Nozzle parameters (location, orientation, misalignment, throat location).

### 5. Sequence Configuration

- User defines a sequence of events by adding event entries.
- Each event has a unique flag, a trigger condition (type, value, reference flag), and an optional comment.
- Dependencies between events are managed via the reference flag dropdown, populated with flags from stages, motors, etc.

### 6. Steering Configuration

- User adds and configures instances of steering components (Vertical Ascend, Pitch Hold, Profile, etc.).
- Each component instance requires Start, Stop, and Steering logic configuration.
- Steering logic parameters are set based on the selected type (e.g., CLG gains, Profile CSV).

### 7. Optimization Configuration (If Mode=Optimization)

- **Objective Function:** User defines one or more objectives to minimize/maximize (e.g., final altitude, payload mass) potentially linked to specific flags or simulation outputs.
- **Constraints:** User defines constraints on simulation parameters (e.g., max acceleration, IIP location, DCISS impact zone) using various conditions and potentially geographic data via the map component.
- **Mode:** User selects optimization algorithm(s), population size, generation count, and configures algorithm-specific parameters.
- **Design Variables:** User defines variables the optimizer can change (e.g., stage burn times, motor thrust scaling, steering parameters) linked to specific mission elements, setting bounds and initial values.

### 8. Stopping Criteria Configuration

- User defines conditions for ending the simulation/optimization (e.g., reaching a specific altitude, time, or event flag state).

### 9. Launch (JSON Generation & Export)

- User clicks "Launch".
- The application performs final validation on the collected data (`finalMissionData`).
- If valid, the user is prompted to save the configuration as a structured, timestamped JSON file.
- This JSON file can then be used as input for the ASTRA C++ backend.

## JSON File Structure (Illustrative Example)

The generated JSON contains nested objects and arrays representing the full mission configuration. Key sections include `mission`, environment details (keyed by planet name), vehicle details (keyed by vehicle name), stage details (keyed by `Stage_X`), motor details (keyed by `Motor_Y`), nozzle details (keyed by `Nozzle_Z`), initial conditions (`Initial_States`), payload/PLF details, steering configuration (`<VehicleName>_Steering`), sequence configuration (`<VehicleName>_Sequence`), and potentially an `Optimization` section.

```json
{
  "Software": "ASTRA",
  "mission": {
    "mission_name": "MyLaunch",
    "planet_name": "EARTH",
    "MODE": "OPTIMIZATION", // or "SIMULATION"
    "tracking_option": "OFF",
    "frame_model": "POST",
    "output_frame": "POST",
    "UTC": {
      "Date": "2024-08-15",
      "Time": "10:30:00"
    }
  },
  "EARTH": {
    // Environment details under planet name
    "atmos_model": "GRAM" // Example
    // ... other environment params
  },
  "MyRocket": {
    // Vehicle details under vehicle name
    "no_Stg": 2,
    "stage": ["Stage_1", "Stage_2"],
    "payload": "MyPayload",
    "plf": "MyHeatshield",
    "integration_method": "RK45",
    "time_step": 0.1,
    // ... other vehicle params
    "steering": "MyRocket_Steering",
    "sequence": "MyRocket_Sequence",
    "Initial_condition": "initial_state1"
  },
  "MyPayload": {
    /* ... payload mass ... */
  },
  "MyHeatshield": {
    /* ... plf mass, sep flag ... */
  },
  "Initial_States": {
    "initial_state1": {
      /* ... state vectors or TLE or elements ... */
    }
    // or "Location_1": { /* ... launch point data ... */ }
  },
  "Stage_1": {
    "structural_mass": 1000,
    "reference_area": 5,
    "burn_time": 120,
    "burn_time_identifier": "ST_1_INI",
    "separation_flag": "ST_1_SEP",
    "DCISS": false,
    "coasting": false,
    "aero_data": "Stage1_AeroData", // Key for aero data array
    "motor": ["Motor_1"]
  },
  "Stage_2": {
    /* ... stage 2 details ... */
  },
  "Stage1_AeroData": [
    /* ... parsed aero CSV data ... */
  ],
  "Motor_1": {
    "structural_mass": 1000, // Inherited
    "propulsion_type": "SOLID",
    "propulsion_mass": 8000,
    "ignition_flag": "S1_M1_IGN",
    "cut_off_flag": "S1_M1_CUTOFF",
    "burn_out_flag": "S1_M1_Burnout",
    "nozzle_diameter": 1.5,
    "burn_time": 120, // Inherited
    "separation_flag": "ST_1_SEP", // Inherited
    "thrust_time_history": "Motor1_ThrustData", // Key for thrust data array
    "nozzle": ["Nozzle_1"]
  },
  "Motor1_ThrustData": [
    /* ... parsed thrust CSV data ... */
  ],
  "Nozzle_1": {
    /* ... nozzle params ... */
  },
  "MyRocket_Steering": [
    /* ... Array of steering component configurations ... */
  ],
  "MyRocket_Sequence": [
    /* ... Array of sequence event configurations ... */
  ],
  "Optimization": {
    // Present if MODE is OPTIMIZATION
    "objective_function": [
      /* ... objective defs ... */
    ],
    "constraints": [
      /* ... constraint defs ... */
    ],
    "mode": {
      /* ... algorithm selection, pop size, etc ... */
    },
    "design_variables": [
      /* ... design variable defs ... */
    ]
  },
  "Stopping_Criteria": {
    /* ... stopping criteria definition ... */
  }
  // ... other potential top-level keys for uploaded data (Wind, Atmos) ...
}
```

## Future Enhancements

- **UI/UX Refinements:** Further improve visual feedback, loading indicators, and overall user flow.
- **State Persistence:** Implement local storage or session storage to save form progress.
- **Advanced Visualization:** Integrate more detailed plotting or visualization for configuration data (e.g., trajectory preview based on initial state).
- **Backend Integration:** Streamline the process of passing the JSON to the C++ backend and receiving/displaying results.
- **Testing:** Implement comprehensive unit and integration tests for JavaScript modules.

## Contributors

- **Ananthu Dev** (Frontend & Integration)

