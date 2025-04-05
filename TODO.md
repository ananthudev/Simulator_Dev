# ASTRA Mission Simulator TODO List

## ✅ Completed Tasks

1. **Mission Form Implementation**

   - Basic mission details form with validation
   - Mission name, mode selection, tracking toggle
   - Date and time selection
   - Stopping criteria configuration (Flag, Time, Altitude)

2. **Environment Form Implementation**

   - Planet selection
   - Atmospheric model selection
   - Gravity parameters configuration
   - Core info model selection
   - Wind data upload functionality
   - CSV to JSON conversion for wind data
   - Proper validation and error handling

3. **Vehicle Configuration Form**

   - Vehicle type selection (ASCEND/ORBITAL/PROJECTILE)
   - Vehicle name input
   - Integration method selection
   - Time step configuration
   - Effective altitude setting
   - Launch point data configuration
   - State vector input options

4. **File Upload Features**

   - Wind data CSV upload with validation
   - Proper JSON conversion for wind data
   - Maintaining data structure integrity
   - Error handling and user feedback

5. **JSON Data Structure**

   - Implementation of finalMissionData structure
   - Proper data organization for all form inputs
   - Handling of nested objects and arrays
   - Data type validation (strings vs numbers)

6. **Mission Save Functionality**

   - JSON file generation
   - Standardized naming convention for saved files
   - Saving to missions folder
   - Success notifications

7. **Sequence Form Implementation**

   - Create sequence form UI with modern design
   - Add validation for sequence inputs
   - Implement updated event types:
     - Stage Start
     - Motor Ignition
     - Motor Termination
     - Stage Separation
     - Heat Shield Separation
   - Add trigger type configuration:
     - Mission Time
     - Phase Time
     - Altitude
   - Enable event dependencies
   - Add comment field for events
   - Create dynamic event list display
   - Add edit and delete functionality for events
   - Fix event deletion to properly remove from dependent events dropdown
   - Fix edit functionality to properly populate form fields
   - Add drag and drop functionality for reordering events
   - Integrate with main mission data
   - Implement responsive design using existing CSS
   - Auto-populate event flags in all tabs:
     - Stage Start tab with stage Burn Time Identifiers (ST_X_INI)
     - Motor Ignition tab with ignition flags (SX_MX_IGN)
     - Motor Termination tab with burnout flags (SX_MX_Burnout)
     - Stage Separation tab with separation flags (ST_X_SEP)
     - Heat Shield Separation tab with PLF separation flag

8. **Steering Form Implementation**
   - ✅ Create steering form UI with modern design
   - ✅ Implement tabbed interface with sections:
     - Vertical Section
     - Pitch Hold
     - Constant Pitch Rate
     - Gravity Turn
     - Profile
   - ✅ Style tabs with compact, modern design
   - [ ] Add validation for steering inputs
   - [ ] Implement steering type selection (Pitch/Gravity/Optimal)
   - [ ] Add control mode configuration (Open/Closed Loop)
   - [ ] Enable time and angle parameters
   - [ ] Add rate parameters configuration
   - [ ] Create dynamic profile list display
   - [ ] Add CSV upload for custom profiles
   - [ ] Add edit and delete functionality for profiles
   - [ ] Integrate with main mission data
   - [ ] Implement responsive design using existing CSS

## 🚀 Pending Tasks

1. **JSON File Management**

   - [ ] Complete JSON structure with all uploaded CSV data
   - [ ] Ensure proper key-value pairing
   - [ ] Validate entire JSON structure before saving

2. **Open Missions Feature**

   - [ ] Add "Open Missions" button to navigation bar
   - [ ] Create missions loading interface
   - [ ] Implement form auto-population from loaded JSON
   - [ ] Handle all data types during form population

3. **Backend Integration**

   - [ ] Setup connection to ASTRA C program
   - [ ] Implement secure file transfer to backend
   - [ ] Handle execution of C program
   - [ ] Protect proprietary business logic

4. **Terminal Output Display**

   - [ ] Create HTML/CSS terminal window
   - [ ] Implement real-time output streaming
   - [ ] Style terminal window for good UX
   - [ ] Handle different types of program output

5. **Security Measures**

   - [ ] Implement C program protection
   - [ ] Secure sensitive business logic
   - [ ] Add necessary access controls
   - [ ] Protect intellectual property

## ✅ Completed Recent Features

- [x] Auto-populate event flags in Stage Start tab with Burn Time Identifiers (ST_X_INI)
- [x] Auto-populate event flags in Motor Ignition tab with ignition flags (SX_MX_IGN)
- [x] Auto-populate event flags in Motor Termination tab with burnout flags (SX_MX_Burnout)
- [x] Auto-populate event flags in Stage Separation tab with separation flags (ST_X_SEP)
- [x] Auto-populate event flags in Heat Shield Separation tab with PLF separation flag
- [x] Update dropdown options when switching between tabs
- [x] Fixed stage separation flags (ST_X_SEP) incrementing for each stage
- [x] Updated motor flags to use stage-specific format (SX_MX_Burnout, SX_MX_IGN)
- [x] Implemented dynamic motor flag incrementing within each stage

## Future Improvements

- [ ] Add validation for event flag relationships
- [ ] Implement error handling for missing stage data
- [ ] Add tooltips/help text for event flag usage
- [ ] Consider adding a preview of available flags in sequence form
