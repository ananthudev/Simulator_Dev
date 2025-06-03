# Optimization JSON Loading Implementation Plan

## Overview

This document outlines the plan for implementing JSON loading functionality for the optimization sections of the Astra GUI. When a user uploads a mission JSON file with optimization data, the system needs to properly populate the following sections:

1. Objective Function
2. Constraints
3. Optimization Mode Settings
4. Design Variables

The JSON upload functionality for simulation sections is already working. This plan focuses on extending that functionality to handle optimization-specific data.

## JSON Structure Analysis

Based on the example JSON provided, here's the structure for optimization sections:

### 1. Objective Function

- Located in the `optimization` array with entries that have `"type": "OBJECTIVE"`
- Contains fields:
  - `name`: Objective name (e.g., "PAYLOAD_MASS")
  - `value`: Target value (can be "null")
  - `flag`: Reference flag
  - `factor`: Multiplier value (-1 for minimization, 1 for maximization)

### 2. Constraints

- Located in the `optimization` array with entries that don't have `"type": "OBJECTIVE"`
- Contains fields:
  - `name`: Constraint name (e.g., "APOGEE", "PERIGEE")
  - `type`: "INEQUALITY" or "EQUALITY"
  - `condition`: "LESS_THAN" or "GREATER_THAN" (for INEQUALITY)
  - `flag`: Reference flag
  - `enable`: Boolean
  - `factor`: Usually 1
  - `value`: Numeric value
- Tolerance values are in a separate array `constraint_tolerence`

### 3. Optimization Mode Settings

- Contains multiple sections:
  - `mode`: Mode type ("normal" or "archipelago")
  - `map`: Lower and upper bounds `[0, 1]`
  - `population`: Population size number
  - `initial_population`: Array with settings
  - `problem_strategy`: Strategy name
  - `optimizer`: Algorithm name (e.g., "DE")
  - Algorithm-specific settings (e.g., "DE" object)

### 4. Design Variables

- Entry point: `design_variables` points to a key (e.g., "design_variable1")
- `design_variable1` lists variable groups (e.g., "opt_steering_1")
- Each variable group has specific structures based on category:
  - STEERING: Complex with segment, segment_type, control_variable, axis, bounds
  - PAYLOAD: Simpler with control_variable and bounds

## Implementation Strategy

### Phase 1: Extending `openMissionHandler.js`

1. Enhance `populateOptimization` function to handle all optimization sections

   - Create helper functions for each section:
     - `populateObjectiveFunction(data)`
     - `populateConstraints(data, tolerances)`
     - `populateOptimizationMode(modeData)`
     - `populateDesignVariables(designVarData)`

2. Add detection for optimization mode
   - Check if `loadedData.mission.MODE.toLowerCase() === "optimization"`
   - Only populate optimization sections when in optimization mode

### Phase 2: Helper Function Implementation

#### `populateObjectiveFunction(data)`

1. Extract objective entries from `data.optimization` array where `type === "OBJECTIVE"`
2. Count number of entries to determine how many forms needed
3. Add/remove objective forms to match JSON data (max 2)
4. For each objective:
   - Set objective type (minimum/maximum based on factor)
   - Set quantity (from name)
   - Set target value if present
   - Set reference flag

#### `populateConstraints(data, tolerances)`

1. Extract constraint entries from `data.optimization` array where `type !== "OBJECTIVE"`
2. For each constraint:
   - Add constraint instance if needed
   - Set constraint name (from name field)
   - Set constraint type (EQUALITY/INEQUALITY)
   - Set condition (LESS_THAN/GREATER_THAN)
   - Set value
   - Set flag
   - Set enabled state
   - Set tolerance (from matching `constraint_tolerence` array)

#### `populateOptimizationMode(modeData)`

1. Set mode radio button (normal/archipelago)
2. For normal mode:
   - Set algorithm dropdown
   - Set map bounds
   - Set population
   - Set population toggle
   - Set problem strategy
   - Set algorithm-specific parameters
   - Handle CSV if present
3. For archipelago mode:
   - Similar settings with appropriate UI differences
   - Add algorithm tags

#### `populateDesignVariables(designVarData)`

1. Parse the design variable structure:
   - Get main key from `designVarData.design_variables`
   - Get variable list from that key
   - Process each variable entry
2. For each variable:
   - Add design variable instance
   - Set category dropdown
   - Set name field
   - Handle category-specific fields:
     - For STEERING: Set segment, segment type, control variables, axis checkboxes, bounds
     - For PAYLOAD: Set control variable, bounds
     - For other categories: Set appropriate fields
3. Handle complex nested structures (arrays of arrays for bounds)

### Phase 3: Integration and Testing

1. Integrate with existing `populateForms` function in `openMissionHandler.js`
2. Add timing/sequencing to ensure proper form population
   - Forms may need sequential population due to dynamic content
   - Use timeouts or promises to handle asynchronous UI updates
3. Test with various JSON structures:
   - Single vs multiple objectives
   - Different constraint types
   - Both optimization modes
   - Various design variable categories

### Phase 4: Error Handling and Edge Cases

1. Add validation for JSON data structure
2. Handle missing or malformed data gracefully
3. Provide user feedback for loading issues
4. Address edge cases:
   - Empty arrays
   - Invalid references
   - Obsolete steering/segment references

## Implementation Challenges

1. **Dynamic Form Handling**: The forms are generated dynamically, requiring careful coordination with existing UI code
2. **Complex Nested Structures**: Design variables especially have deeply nested data structures
3. **Asynchronous UI Updates**: Need to account for DOM updates that happen after form changes
4. **Dropdown Population**: Many dropdowns depend on other system state (flags, segments)
5. **Multi-dimensional Arrays**: Handling array-of-arrays for bounds in design variables

## Sequence of Implementation

1. Start with Objective Function (simplest structure)
2. Move to Optimization Mode (mostly static fields)
3. Implement Constraints (moderate complexity)
4. Finally, implement Design Variables (most complex structure)

## Testing Strategy

1. Create test JSON files with various optimization configurations
2. Implement unit tests for each helper function
3. Develop integration tests for the complete loading process
4. Manual testing with real-world optimization scenarios

This implementation will extend the existing "Open Mission" functionality to fully support optimization scenarios, maintaining backward compatibility with simulation-only mission files.
