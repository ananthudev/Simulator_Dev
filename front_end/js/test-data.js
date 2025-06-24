// test-data.js - Standardized test data aligned with test_sim.json format
// This file provides consistent test data for the Astra GUI application

const TestData = {
  // Mission section data
  mission: {
    name: "SSPO",
    mode: "simulation", // Changed from optimization to simulation to match test_sim.json
    tracking: false, // "OFF" in JSON
    date: "2025-05-16",
    time: "09:32:53",
  },

  // Environment section data
  environment: {
    planet: "earth",
    atmosphere: {
      model: "atmos_76",
      csv: null, // Would contain file data if using CSV
    },
    wind: {
      csv: null,
      defaultData: [
        ["Altitude", "Zonal", "Meridonal"],
        ["m", "m/s", "m/s"],
        [0, 0, 0],
        [60000, 0, 0],
        [90000, 0, 0],
        [150000, 0, 0],
        [400000, 0, 0],
      ],
    },
    gravity: {
      order: 0, // Updated from 2 to 0 to match test_sim.json
      degree: 2,
    },
    coe_info: "MSL",
  },

  // Vehicle section data
  vehicle: {
    name: "TestVehicle",
    type: "ascend", // From "vehicle_type": "ASCEND"
    integration_method: "RK4",
    time_step: 0.1,
    effective_altitude: 70000,
    dciss: false, // DCISS toggle off
    initial_conditions: {
      ascend: {
        data_method: "launch", // Using launch point data
        launch_point: {
          latitude: 8.4038977,
          longitude: 78.0197,
          azimuth: 187.43,
          msl: 10,
          lp_height: 17,
          launch_angle: 0,
          roll: 0,
          pitch: 0,
          yaw: 0,
        },
      },
    },
    payload: {
      name: "James Webb",
      mass: 448.72318255,
    },
    plf: {
      name: "Heat Shield",
      mass: 150,
      separation: {
        type: "altitude", // Based on HSS_Flag in sequence with ALTITUDE trigger
        value: 115000,
        flag: "HSS_Flag",
      },
    },
  },

  // Stage data
  stage: {
    stage1: {
      structural_mass: 6604.0269,
      reference_area: 3.141592654,
      burn_time: 169.1,
      aero_data: [
        // Simplified version of Stage_1_AeroData
        [0, 0.2568, 0.248],
        [0.4, 0.4241, 0.3969],
        [0.6, 0.426, 0.4389],
        [0.8, 0.5673, 0.5718],
        [0.95, 0.7328, 0.7326],
        [1.05, 0.8354, 0.8328],
        [1.1, 0.8723, 0.8686],
        [1.2, 0.927, 0.9211],
        [1.5, 0.8692, 0.901],
        [2, 0.7371, 0.7583],
        [3, 0.6283, 0.6394],
        [4, 0.5936, 0.5993],
        [20, 0.5936, 0.5993],
      ],
      ini_flag: "ST_1_INI",
      sep_flag: "ST_1_SEP",
      dciss: false,
    },
    stage2: {
      structural_mass: 1102.8098,
      reference_area: 3.14159,
      burn_time: 288.5,
      aero_data: [
        // Simplified version of Stage_2_AeroData
        [0, 0.2568, 0.248],
        [0.4, 0.4241, 0.3969],
        [0.6, 0.426, 0.4389],
        [0.8, 0.5673, 0.5718],
        [0.95, 0.7328, 0.7326],
        [1.05, 0.8354, 0.8328],
        [1.1, 0.8723, 0.8686],
        [1.2, 0.927, 0.9211],
        [1.5, 0.8692, 0.901],
        [2, 0.7371, 0.7583],
        [3, 0.6283, 0.6394],
        [4, 0.5936, 0.5993],
        [20, 0.5936, 0.5993],
      ],
      ini_flag: "ST_2_INI",
      sep_flag: "ST_2_SEP",
      dciss: false,
    },
  },

  // Motor data
  motor: {
    motor1_1: {
      propulsion_type: "solid",
      nozzle_diameter: 0.14,
      propulsion_mass: 53432.5818,
      thrust_data: [
        [0, 0, 53432.5818],
        [0.1, 1011.5, 53400.99201],
        [10, 1011.5, 50273.60287],
        [50, 1011.5, 37637.68713],
        [100, 1011.5, 21842.79247],
        [150, 1011.5, 6047.897804],
        [160.8, 1011.5, 2636.200556],
        [160.9, 1011.5, 2604.610767],
        [161.2, 1011.5, 2509.841399],
        [169, 1011.5, 45.83783126],
        [169.1, 0, 14.24804193],
        [170.0, 0, 14.24804193],
      ],
    },
    motor2_1: {
      propulsion_type: "solid",
      nozzle_diameter: 0.83,
      propulsion_mass: 7380.3422,
      thrust_data: [
        [0, 0, 7380.3422],
        [0.1, 88, 7377.78405581814],
        [2.1, 88, 7326.62117218086],
        [50, 88, 6101.2701090681],
        [50.1, 88, 6098.71196488624],
        [100, 88, 4822.1980181362],
        [150, 88, 3543.1259272043],
        [200, 88, 2264.05383627239],
        [250, 88, 984.981745340492],
        [288.4, 88, 2.65437950479225],
        [288.5, 0, 0.096235322927861],
      ],
    },
  },

  // Sequence data
  sequence: [
    {
      identity: "ST_1_INI",
      trigger: "MISSION_TIME",
      value: 0,
      reference: "none",
      comment: "Stage 1 Start",
    },
    {
      identity: "S1_M1_IGN",
      trigger: "MISSION_TIME",
      value: 0,
      reference: "none",
      comment: "Motor 1 Ignition",
    },
    {
      identity: "S1_M1_Burnout",
      trigger: "MISSION_TIME",
      value: 169.1,
      reference: "none",
      comment: "Motor 1 Burn out",
    },
    {
      identity: "ST_1_SEP",
      trigger: "PHASE_TIME",
      value: 169.1,
      reference: "ST_1_INI",
      comment: "Stage 1 Separation",
    },
    {
      identity: "ST_2_INI",
      trigger: "PHASE_TIME",
      value: 0,
      reference: "ST_1_SEP",
      comment: "Stage 2 Start",
    },
    {
      identity: "S2_M1_IGN",
      trigger: "PHASE_TIME",
      value: 0,
      reference: "ST_1_SEP",
      comment: "Motor 2 Ignition",
    },
    {
      identity: "S2_M1_Burnout",
      trigger: "PHASE_TIME",
      value: 288.5,
      reference: "S2_M1_IGN",
      comment: "Motor 2 burn out",
    },
    {
      identity: "ST_2_SEP",
      trigger: "PHASE_TIME",
      value: 288.5,
      reference: "S2_M1_IGN",
      comment: "Stage 2 Separation",
    },
    {
      identity: "HSS_Flag",
      trigger: "ALTITUDE",
      value: 115000,
      reference: "none",
      comment: "Heat Shield Seperation",
    },
  ],

  // Steering data
  steering: {
    sequence: "213", // From TestVehicle_Steering
    components: [
      {
        id: "verticalAscend_1",
        name: "Vertical Ascend 1",
        type: "verticalAscend",
        start: {
          identity: "VA_START_1",
          trigger_type: "PHASE_TIME",
          trigger_value: 0,
          reference: "ST_1_INI",
          comment: "Vertical_Ascend_Start",
        },
        stop: {
          identity: "VA_STOP_1",
          trigger_type: "ALTITUDE",
          trigger_value: 190,
          reference: "VA_START_1",
          comment: "Vertical_Ascend_Stop",
        },
        parameters: {
          steering_type: "zeroRate",
          comment: "Vertical_Ascend",
        },
      },
      {
        id: "pitchHold_1",
        name: "Pitch Hold 1",
        type: "pitchHold",
        start: {
          identity: "PH_START_1",
          trigger_type: "PHASE_TIME",
          trigger_value: 0,
          reference: "VA_STOP_1",
          comment: "Pitch_Hold_Start",
        },
        stop: {
          identity: "PH_STOP_1",
          trigger_type: "PHASE_TIME",
          trigger_value: 5,
          reference: "PH_START_1",
          comment: "Pitch_Hold_Stop",
        },
        parameters: {
          steering_type: "zeroRate",
          comment: "Pitch_Hold",
        },
      },
      {
        id: "constantPitch_1",
        name: "Constant Pitch 1",
        type: "constantPitch",
        start: {
          identity: "CP_START_1",
          trigger_type: "PHASE_TIME",
          trigger_value: 0,
          reference: "PH_STOP_1",
          comment: "Constant_Pitch_Start",
        },
        stop: {
          identity: "CP_STOP_1",
          trigger_type: "PHASE_TIME",
          trigger_value: 3.1104355,
          reference: "CP_START_1",
          comment: "Constant_Pitch_Stop",
        },
        parameters: {
          steering_type: "constantBodyRate",
          axis: "pitch",
          value: -4.767241713786673,
          comment: "Constant_Pitch",
        },
      },
      {
        id: "profile_1",
        name: "Profile 1",
        type: "profile",
        start: {
          identity: "PROFILE_START_1",
          trigger_type: "PHASE_TIME",
          trigger_value: 0,
          reference: "CP_STOP_1",
          comment: "Profile_1 Start",
        },
        stop: {
          identity: "PROFILE_STOP_1",
          trigger_type: "PHASE_TIME",
          trigger_value: 0,
          reference: "ST_1_SEP",
          comment: "Profile_1 Stop",
        },
        parameters: {
          steering_type: "profile",
          mode: "normal",
          quantity: "EULER_RATE",
          independentVar: "PHASE_TIME",
          profile_csv: [
            ["Time", "ROLL", "YAW", "PITCH"],
            [0, 0, 0, 0],
            [2, 0, 0, 0],
            [5, 0, 0, 0],
            [10, 0, 0, 0],
            [15, 0, 0, -0.548259479],
            [20, 0, 0, -0.545069313],
            [30, 0, 0, -0.418256636],
            [43.9, 0, 0, -0.408389469],
            [54, 0, 0, -0.545129447],
            [74.1, 0, 0, -0.514086138],
            [95.1, 0, 0, -0.312098692],
            [120.4, 0, 0, -0.227735727],
            [123, 0, 0, 1.11e-16],
            [129.9, 0, 0, 0],
            [200, 0, 0, 0],
          ],
          comment: "Profile_1",
        },
      },
      {
        id: "profile_2",
        name: "Profile 2",
        type: "profile",
        start: {
          identity: "PROFILE_START_2",
          trigger_type: "PHASE_TIME",
          trigger_value: 0,
          reference: "S2_M1_IGN",
          comment: "Profile_2 Start",
        },
        stop: {
          identity: "PROFILE_STOP_2",
          trigger_type: "PHASE_TIME",
          trigger_value: 0,
          reference: "ST_2_SEP",
          comment: "Profile_2 Stop",
        },
        parameters: {
          steering_type: "profile",
          mode: "normal",
          quantity: "EULER_RATE",
          independentVar: "PROFILE_TIME",
          profile_csv: [
            ["Time", "ROLL", "YAW", "PITCH"],
            [0, 0, 0, 0],
            [2, 0, 0, 0],
            [5, 0, 0, 0],
            [10, 0, 0, 0],
            [15, 0, 0, -0.548259479],
            [20, 0, 0, -0.545069313],
            [30, 0, 0, -0.418256636],
            [43.9, 0, 0, -0.408389469],
            [54, 0, 0, -0.545129447],
            [74.1, 0, 0, -0.514086138],
            [95.1, 0, 0, -0.312098692],
            [120.4, 0, 0, -0.227735727],
            [123, 0, 0, 1.11e-16],
            [129.9, 0, 0, 0],
            [300, 0, 0, 0],
          ],
          comment: "Profile_2",
        },
      },
    ],
  },

  // Stopping condition
  stopping: {
    criteria: "flag",
    flag: {
      name: "ST_2_SEP",
      condition: "EQ",
      value: 0.1,
    },
    time: {
      value: 500,
      condition: "eq",
    },
    altitude: {
      value: 500000,
      condition: "gt",
    },
  },

  // Optimization data - keeping this section for when optimization mode is selected
  optimization: {
    // Objective function data directly from JSON
    objective: [
      {
        name: "PAYLOAD_MASS",
        value: null,
        type: "OBJECTIVE",
        flag: "ST_2_SEP",
        factor: -1,
      },
    ],

    // Constraints data
    constraints: [
      {
        name: "APOGEE",
        value: 500.1,
        type: "INEQUALITY",
        condition: "LESS_THAN",
        flag: "ST_2_SEP",
        enable: true,
        factor: 1,
        tolerance: 0.1,
      },
      {
        name: "PERIGEE",
        value: 485.2,
        type: "INEQUALITY",
        condition: "GREATER_THAN",
        flag: "ST_2_SEP",
        enable: true,
        factor: 1,
        tolerance: 0.1,
      },
      {
        name: "ECCENTRICITY",
        value: 0.001,
        type: "INEQUALITY",
        condition: "LESS_THAN",
        flag: "ST_2_SEP",
        enable: true,
        factor: 1,
        tolerance: 0.0001,
      },
      {
        name: "INCLINATION",
        value: 97.35,
        type: "EQUALITY",
        condition: "",
        flag: "ST_2_SEP",
        enable: true,
        factor: 1,
        tolerance: 0.001,
      },
    ],

    // Mode data
    mode: {
      type: "normal",
      normal: {
        algorithm: "SADE",
        map: {
          lower: 0,
          upper: 1,
        },
        population: 150,
        set_population: false,
        problem_strategy: "ignore_o",
        csv_upload: null,
        algorithm_params: {
          SADE: {
            generation: 150,
            variant_adptv: "1",
            memory: false,
            F: 0.8,
            CR: 0.9,
            variant: "2",
            ftol: 0.000001,
            xtol: 0.000001,
            seed: 9,
          },
        },
      },
      archipelago: {
        algorithms: ["PSO", "MBH", "NLOPT"],
        topology: "Fully Connected",
        migration_type: "Broadcast",
        migration_handling: "Evict",
        map: {
          lower: 0,
          upper: 1,
        },
        population: 1,
        set_population: false,
        csv_upload: null,
        algorithm_params: {
          PSO: {
            omega: 0.7,
            eta1: 2.0,
            eta2: 2.0,
          },
          MBH: {
            stop_range: 0.001,
            perturb_range: 0.1,
          },
          NLOPT: {
            method: "cobyla",
            xtol_rel: 1e-4,
          },
        },
      },
    },

    // Design variables data structure updated to match JSON structure
    design_variables: [
      {
        category: "STEERING",
        name: "opt_steering_1",
        segment: "Constant_Pitch_1",
        segment_type: "CONST_BODYRATE",
        control_variable: "BODY_RATE",
        axis: "pitch",
        lower_bound: -5.5,
        upper_bound: 6.5,
      },
      {
        category: "STEERING",
        name: "opt_steering_2",
        segment: "Profile_1",
        segment_type: "PROFILE",
        control_variable: "EULER_RATE",
        axis: "pitch",
        lower_bound: -0.7,
        upper_bound: 0.7,
      },
      {
        category: "STEERING",
        name: "opt_steering_3",
        segment: "Profile_2",
        segment_type: "PROFILE",
        control_variable: "EULER_RATE",
        axis: "pitch,yaw",
        lower_bound: -3,
        upper_bound: 3,
      },
      {
        category: "PAYLOAD",
        name: "opt_payload_4",
        control_variable: "MASS",
        lower_bound: 0,
        upper_bound: 900,
      },
    ],
  },
};

// Make the test data globally available
window.TestData = TestData;

// Function to load raw data from realdata.json
async function loadRealDataJson() {
  try {
    const response = await fetch("/test_data/realdata.json");
    if (response.ok) {
      const data = await response.json();
      console.log("Successfully loaded realdata.json");
      window.rawTestData = data;
      return data;
    } else {
      console.warn("Could not load realdata.json:", response.status);
      return null;
    }
  } catch (error) {
    console.warn("Error loading realdata.json:", error);
    return null;
  }
}

// Load realdata.json when the script is loaded
document.addEventListener("DOMContentLoaded", () => {
  loadRealDataJson()
    .then((data) => {
      if (data) {
        console.log("rawTestData is available for test forms");
      }
    })
    .catch((err) => console.error("Failed to load realdata.json:", err));
});
