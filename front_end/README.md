# Astra Mission Planner

## Overview

Astra Mission Planner is a GUI-based application designed for configuring and optimizing satellite launch trajectories. It provides a structured workflow to collect mission parameters, environment data, vehicle details, and stage configurations before passing the generated JSON to a C++ backend for simulation and optimization.

## Features

- **User-Friendly GUI:** Built using Electron.js, HTML, CSS, and JavaScript.
- **Modular Input Forms:** Supports mission, environment, vehicle, and stage configuration.
- **JSON Data Generation:** Collects user inputs and converts them into a structured JSON file.
- **C++ Backend Integration:** Passes the JSON to the C++ simulation program for calculations.
- **Result Visualization:** Displays simulation results in an HTML-based terminal with plot diagrams.

## Installation

### Prerequisites

Ensure you have the following installed:

- **Node.js** (for Electron.js frontend)
- **Python** (for authentication and database management)
- **C++ Compiler** (to run the simulation backend)
- **npm** (Node Package Manager)

### Setup

# Install dependencies

npm install

# Start the backend server (Python)

python app.py

# Run the Electron.js application

npm start

````

## Project Workflow

### 1. Mission Configuration

- User inputs mission name, mode, date, time, and stopping conditions.
- Data is validated and stored in the mission JSON object.

### 2. Environment Configuration

- User selects planetary parameters, atmospheric models, and gravity options.
- CSV upload is supported for atmospheric data.

### 3. Vehicle Configuration

- Users define vehicle details such as payload, fairing separation, and integration methods.
- Different configurations for `ascend` and `projectile` modes.

### 4. Stage Configuration

- Supports multi-stage vehicle definitions.
- Collects structural mass, reference area, burn time, and other parameters dynamically.

### 5. JSON Generation & Simulation

- Converts collected data into JSON format.
- Sends JSON to the C++ backend for trajectory optimization.
- Displays results in an HTML-based terminal and generates plots.

## JSON File Structure

```json
{
  "mission": {
    "name": "Test Mission",
    "mode": "ascend",
    "date": "2025-04-02",
    "time": "12:00:00",
    "stopping_conditions": {...}
  },
  "environment": {...},
  "vehicle": {...},
  "stages": [{...}, {...}]
}
````

## Future Enhancements

- **Better Error Handling:** Improve validation feedback for user inputs.
- **Local Storage Support:** Allow users to save and resume mission inputs.
- **Advanced Visualization:** Add more graphical elements for data analysis.
- **Backend Optimization:** Enhance performance for large-scale simulations.

## Contributors

- **Ananthu Dev** (Frontend & Integration)
- **[Other Team Members]**
