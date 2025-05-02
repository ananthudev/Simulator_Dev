I have to add optimization option to this project too.
First I need to design the front end and then js logic
Intially I need to add ui navigation function for optimization option
to check the user navigation.
then i need to add validation for the fields
then i have to add the json printing function to finalMissiondata to append the optimization

Optimization is additonal appended json strucuture with simulation

If the user choose, simulation these fields are fine, and user saves the form after saving stopping criteria and click launch button, that is okay

but if the user choose Optimization from the drop down menu, in mission details form
an additional tree structure will dynamically generate between steering and stopping criteria. The new dynamically generated nav menu item would look something like this

-------- Steering
-------- Optimization
-------- Objective Function
-------- Constraints
-------- Mode
-------- Design Variables
-------- Stopping Criteria

Intially i have to add js logic to dynamically view the nav item, only if the user select the optimization drop down

In Optimisation heading nav menu the first navigatable Item is Objective Function

1. Objective Function

There should be an option for user to add multiple objective function forms, for now the limit should be 4.

In objective function the fields are

Name - is a drop down

with options - PAYLOAD_MASS Total Payload mass(kg)
BODY_RATES Body rates of the vehicle(deg)
HEAT_FLUX Heat Flux(W/m2)
SEMI_MAJOR_AXIS Semi Major Axis
ANGULAR_MOMENTUM Angular Momentum
ECCENTRICITY Eccentricity
INCLINATION Inclination(deg)
TRUE_ANOMALY True Anomaly
ECCENTRICITY_ANOMALY Eccentric Anomaly
MEAN_ANOMALY Mean Anomaly
RAAN Right Ascension of the Ascending Node
AOP Angle Of Perigee(deg)
PERIGEE_GC_LATITUDE Perigee gc latitude(deg)
APOGEE_GC Apogee gc
PERIGEE_GC Perigee gc
TOTAL_ENERGY Total Energy(j)
QAOA Q Angle of Attack

these are the options in the drop down, if the user choose a drop down item like payload mass , then if the user add another objective function form the previos choose item payload_mass shouldnt be there on the next form, also it applies to the all the objective function an user added in linear way, the ui/ux should be intuitive.

the second field in the objective function form is the type label input box with Objective value as readonly
the next field is called drop down with label flag. these drop down should be populated with sequence flags(previous stages,motor flags include) from the flag registry.

The next field is label with option to choose min or max- if it is max the json data will be - 1, min +1

These applies to multiple Objective forms user adds

Next one in nav item is Constraints

2. Constraints

The first field of Constraints form is label Name with a drop down to choose multiple option like -
TOTAL_ENERGY Total Energy
SEMI_MAJOR_AXIS Semi Major Axix
ANGULAR_MOMENTUM Angular Momentum
ECCENTRICITY Eccentricity
INCLINATION Inclination
TRUE_ANOMALY True Anomaly
ECCENTRIC_ANOMALY Eccentric Anomaly
RAAN Right Ascension of the Ascending Node
AOP Angle of Perigee
PERIGEE_GC_LATITUDE Perigee Geo Centric Latitude
PERIGEE_GC Perigee Geo Centric
APOGEE_GC Apogee Geo Centric
PERIGEE Perigee
APOGEE Apogee
STAGE_IMPACT Stage Impact Coordinates
MAX_QAOA Maximum Q Angle of Attack
Q Dynamic Pressure
ALPHA alpha
MAX_BODY_RATE Maximum Body Rate
MAX_HEAT_FLUX Maximum Heat Flux
BODY_RATES Body Rates
HEAT_FLUX Heat Flux
QAOA Q Angle of Attack

the next field is input box with Label Value, its a numeric value input box
next field to choose either of 2 options EQ or IEQ
next field label Condition to Choose LT or GT, drop down would be better, follow ux of rest of the application.

next field is dropdown with label flag - these drop down should be populated with flags from flag registry

next field is label Factor with read me value 1 - these field is not neccessarily required. but it is needed in json structure, so we can add a default in json

next field is enable with true or false, A toggle button would be better

Next Navigatable item in nav menu is Mode

3. Mode

Under mode there are 2 options

1. Normal

   OR

2. Archipelago

User can choose either one of them

3.1 Normal

The first Field in label - Optimizer Algorithm were user can choose any one of the Multiple algorithms

SGA (Simple Genetic Algorithm), DE (Differential Evolution), PSO(Particle Swarm Optimization), IPOPT(Interior Point OPTimizer), NLOPT(Non Linear Optimizer)...etc

the next field is map with 2 input boxes Upper bound and lower bound. in json the structure would print in a singel array - for eg [UP,LB] - [0,1] .

the next field is Population with input box with numeric value

the next field is label - Set Population Toggle button - default is on

if the value is on, there should be button to Initial Control Variable -upload a csv file

if the Set Population Toggle button is off, the upload button shouldnt be available, but when the page loads the default toggle value is on, so the user should see the upload button, the user can choose to turn off , so he shouldn't have to upload a csv

The next field is label Problem Strategy : with values - ignore - o , KURI, death penalty

The next field if the user choose either on is Archipelago
3.2 Archipelago

In first the user should have the option to choose Algorithms they are - SADC, DE , NLOPT.
The next input label is Toplogy with a drop down - Fully Connected, Ring, Unconnected .
The next input label is Migration Type with a drop down - Broadcast, P2P.
The next input label is Migration Handling with a drop down - Evict, Pressure.

The some fields are same as Normal

the next field is map with 2 input boxes Upper bound and lower bound. in json the structure would print in a singel array - for eg [UP,LB] - [0,1] .

the next field is Population with input box with numeric value

the next field is label - Set Population Toggle button - default is on

if the value is on, there should be button to Initial Control Variable -upload a csv file

if the Set Population Toggle button is off, the upload button shouldnt be available, but when the page loads the default toggle value is on, so the user should see the upload button, the user can choose to turn off , so he shouldn't have to upload a csv

The next nav item in side menu tree is Design Variable

4. Design Variable

add a place holder form here, that dont have any functionality.

---

# Refactored Optimization Requirements

## Overview

Introduce an "Optimization" option alongside the existing "Simulation" option. Selecting "Optimization" dynamically adds a new section to the navigation menu and modifies the data structure appended to the `finalMissiondata` JSON.

## Implementation Steps

1.  **UI Navigation:** Add JavaScript logic to dynamically display the "Optimization" navigation section only when the user selects "Optimization" from the mission details dropdown.
2.  **Field Validation:** Implement validation for all new input fields introduced in the Optimization section.
3.  **JSON Structure:** Modify the function responsible for generating `finalMissiondata` to include the new optimization-specific JSON structure when applicable.

## Dynamic Navigation Menu Structure (When Optimization is selected)

```
-------- Steering
-------- Optimization
          -------- Objective Function
          -------- Constraints
          -------- Mode
          -------- Design Variables
-------- Stopping Criteria
```

## Optimization Section Details

### 1. Objective Function

- **Functionality:** Allow users to add multiple objective function forms (up to a limit of 4).
- **Fields:**
  - **Name:** Dropdown list.
    - **Options:**
      - `PAYLOAD_MASS`: Total Payload mass (kg)
      - `BODY_RATES`: Body rates of the vehicle (deg/s)
      - `HEAT_FLUX`: Heat Flux (W/m²)
      - `SEMI_MAJOR_AXIS`: Semi Major Axis (km)
      - `ANGULAR_MOMENTUM`: Angular Momentum
      - `ECCENTRICITY`: Eccentricity
      - `INCLINATION`: Inclination (deg)
      - `TRUE_ANOMALY`: True Anomaly (deg)
      - `ECCENTRICITY_ANOMALY`: Eccentric Anomaly (deg)
      - `MEAN_ANOMALY`: Mean Anomaly (deg)
      - `RAAN`: Right Ascension of the Ascending Node (deg)
      - `AOP`: Argument of Perigee (deg)
      - `PERIGEE_GC_LATITUDE`: Perigee geocentric latitude (deg)
      - `APOGEE_GC`: Apogee geocentric altitude (km)
      - `PERIGEE_GC`: Perigee geocentric altitude (km)
      - `TOTAL_ENERGY`: Total Energy (J)
      - `QAOA`: Q Angle of Attack (deg²)
    - **Constraint:** An option selected in one form cannot be selected in subsequently added forms. Ensure intuitive UI/UX for this.
  - **Type:** Readonly input box labeled "Type" with a default value of "Objective".
  - **Flag:** Dropdown list labeled "Flag", populated with sequence flags (including previous stages and motor flags) from the flag registry.
  - **Factor:** Dropdown list labeled "Factor" with options:
    - `Minimize` (JSON value: `+1`)
    - `Maximize` (JSON value: `-1`)
- **Note:** These fields apply to each objective function form the user adds.

### 2. Constraints

- **Fields:**
  - **Name:** Dropdown list labeled "Name".
    - **Options:**
      - `TOTAL_ENERGY`: Total Energy
      - `SEMI_MAJOR_AXIS`: Semi Major Axis
      - `ANGULAR_MOMENTUM`: Angular Momentum
      - `ECCENTRICITY`: Eccentricity
      - `INCLINATION`: Inclination
      - `TRUE_ANOMALY`: True Anomaly
      - `ECCENTRIC_ANOMALY`: Eccentric Anomaly
      - `RAAN`: Right Ascension of the Ascending Node
      - `AOP`: Argument of Perigee
      - `PERIGEE_GC_LATITUDE`: Perigee Geocentric Latitude
      - `PERIGEE_GC`: Perigee Geocentric Altitude
      - `APOGEE_GC`: Apogee Geocentric Altitude
      - `PERIGEE`: Perigee Altitude
      - `APOGEE`: Apogee Altitude
      - `STAGE_IMPACT`: Stage Impact Coordinates
      - `MAX_QAOA`: Maximum Q Angle of Attack
      - `Q`: Dynamic Pressure
      - `ALPHA`: Angle of Attack (alpha)
      - `MAX_BODY_RATE`: Maximum Body Rate
      - `MAX_HEAT_FLUX`: Maximum Heat Flux
      - `BODY_RATES`: Body Rates
      - `HEAT_FLUX`: Heat Flux
      - `QAOA`: Q Angle of Attack
  - **Value:** Numeric input box labeled "Value".
  - **Type:** Dropdown list labeled "Type" with options: `EQ` (Equality), `IEQ` (Inequality).
  - **Condition:** Dropdown list labeled "Condition" with options: `LT` (Less Than), `GT` (Greater Than). (Ensure UI consistency with the rest of the application).
  - **Flag:** Dropdown list labeled "Flag", populated with flags from the flag registry.
  - **Factor:** Readonly input box labeled "Factor" with a default value of `1`. (Required for JSON structure).
  - **Enable:** Toggle button labeled "Enable" (default: `true`).

### 3. Mode

- **Options:** User must choose one: `Normal` OR `Archipelago`.

#### 3.1 Normal Mode

- **Fields:**
  - **Optimizer Algorithm:** Dropdown list labeled "Optimizer Algorithm".
    - **Options:** `SGA` (Simple Genetic Algorithm), `DE` (Differential Evolution), `PSO` (Particle Swarm Optimization), `IPOPT` (Interior Point OPTimizer), `NLOPT` (Non-Linear Optimizer), etc.
  - **Bounds:** Two numeric input boxes labeled "Lower Bound" and "Upper Bound". (JSON format: `[UB, LB]`, e.g., `[0, 1]`).
  - **Population:** Numeric input box labeled "Population".
  - **Set Population:** Toggle button labeled "Set Population" (default: `on`).
    - **If ON:** Display an "Upload Initial Control Variable" button (allows CSV upload).
    - **If OFF:** Hide the upload button.
  - **Problem Strategy:** Dropdown list labeled "Problem Strategy".
    - **Options:** `ignore - o`, `KURI`, `death penalty`.

#### 3.2 Archipelago Mode

- **Fields:**
  - **Algorithm:** Dropdown list labeled "Algorithm".
    - **Options:** `SADC`, `DE`, `NLOPT`.
  - **Topology:** Dropdown list labeled "Topology".
    - **Options:** `Fully Connected`, `Ring`, `Unconnected`.
  - **Migration Type:** Dropdown list labeled "Migration Type".
    - **Options:** `Broadcast`, `P2P`.
  - **Migration Handling:** Dropdown list labeled "Migration Handling".
    - **Options:** `Evict`, `Pressure`.
  - **Bounds:** (Same as Normal Mode) Two numeric input boxes labeled "Lower Bound" and "Upper Bound". (JSON format: `[UB, LB]`, e.g., `[0, 1]`).
  - **Population:** (Same as Normal Mode) Numeric input box labeled "Population".
  - **Set Population:** (Same as Normal Mode) Toggle button labeled "Set Population" (default: `on`).
    - **If ON:** Display an "Upload Initial Control Variable" button (allows CSV upload).
    - **If OFF:** Hide the upload button.

### 4. Design Variable

- **Content:** Add a placeholder form/section for Design Variables. No specific functionality is required for this section at this time.
