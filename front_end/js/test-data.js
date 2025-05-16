// test-data.js - Standardized test data aligned with realdata.json format
// This file provides consistent test data for the Astra GUI application

const TestData = {
  // Mission section data
  mission: {
    name: "SSPO",
    mode: "optimization",
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
      order: 2,
      degree: 0,
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
        [0, 0.38, 0.38],
        [0.4, 0.38, 0.38],
        [0.6, 0.38, 0.38],
        [0.8, 0.38, 0.38],
        [1, 0.38, 0.38],
        [2, 0.38, 0.38],
        [4, 0.38, 0.38],
        [10, 0.38, 0.38],
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
        [0, 0.38, 0.38],
        [0.4, 0.38, 0.38],
        [0.6, 0.38, 0.38],
        [0.8, 0.38, 0.38],
        [1, 0.38, 0.38],
        [2, 0.38, 0.38],
        [4, 0.38, 0.38],
        [10, 0.38, 0.38],
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
        [169, 1011.5, 45.83783126],
        [169.1, 0, 14.24804193],
      ],
    },
    motor2_1: {
      propulsion_type: "solid",
      nozzle_diameter: 0.83,
      propulsion_mass: 7380.3422,
      thrust_data: [
        [0, 0, 7380.3422],
        [0.1, 88, 7377.78405581814],
        [50, 88, 6101.2701090681],
        [100, 88, 4822.1980181362],
        [200, 88, 2264.05383627239],
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
          trigger_type: "phaseTime",
          trigger_value: 0,
          reference: "ST_1_INI",
          comment: "Vertical_Ascend_Start",
        },
        stop: {
          identity: "VA_STOP_1",
          trigger_type: "altitude",
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
          trigger_type: "phaseTime",
          trigger_value: 0,
          reference: "VA_STOP_1",
          comment: "Pitch_Hold_Start",
        },
        stop: {
          identity: "PH_STOP_1",
          trigger_type: "phaseTime",
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
          trigger_type: "phaseTime",
          trigger_value: 0,
          reference: "PH_STOP_1",
          comment: "Constant_Pitch_Start",
        },
        stop: {
          identity: "CP_STOP_1",
          trigger_type: "phaseTime",
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
          trigger_type: "phaseTime",
          trigger_value: 0,
          reference: "CP_STOP_1",
          comment: "Profile_1 Start",
        },
        stop: {
          identity: "PROFILE_STOP_1",
          trigger_type: "phaseTime",
          trigger_value: 0,
          reference: "ST_1_SEP",
          comment: "Profile_1 Stop",
        },
        parameters: {
          steering_type: "profile",
          mode: "normal",
          quantity: "eulerRate",
          independentVar: "phaseTime",
          profile_csv: [
            ["Time", "ROLL", "YAW", "PITCH"],
            [0, 0, 0, -0.334529405053707],
            [2, 0, 0, 0.233022074238948],
            [5, 0, 0, -0.075264619006616],
            [10, 0, 0, 0.403930928182946],
            [15, 0, 0, 0.085355813534978],
            [20, 0, 0, -0.157149732190426],
            [30, 0, 0, -0.247917318042308],
            [43.9, 0, 0, -0.488417020318841],
            [54, 0, 0, -0.342402416619808],
            [74.1, 0, 0, -0.279531126433529],
            [95.1, 0, 0, -0.226561244417878],
            [120.4, 0, 0, -0.067123332302575],
            [123, 0, 0, -0.115620242285865],
            [129.9, 0, 0, -0.290306414622902],
            [140, 0, 0, -0.118410727945321],
            [160, 0, 0, -0.225918338044863],
            [180, 0, 0, 0.169276523850417],
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
          trigger_type: "phaseTime",
          trigger_value: 0,
          reference: "S2_M1_IGN",
          comment: "Profile_2 Start",
        },
        stop: {
          identity: "PROFILE_STOP_2",
          trigger_type: "phaseTime",
          trigger_value: 0,
          reference: "ST_2_SEP",
          comment: "Profile_2 Stop",
        },
        parameters: {
          steering_type: "profile",
          mode: "normal",
          quantity: "eulerRate",
          independentVar: "profileTime",
          profile_csv: [
            ["Time", "ROLL", "YAW", "PITCH"],
            [0, 0, 0.061251668429887, -0.057817997477519],
            [5, 0, 0.139424564066419, -0.292135239274413],
            [20, 0, -0.048974510464463, -0.331555528461593],
            [30, 0, 0.142225972937025, -0.215145300744634],
            [43.9, 0, -0.087154210942074, -0.23590766162741],
            [54, 0, 0.101381558898185, -0.288467475708868],
            [74.1, 0, -0.065190536303901, -0.229576481817389],
            [95.1, 0, 0.131513957846863, -0.255330949531613],
            [110.4, 0, -0.052805055427716, -0.016263081242757],
            [123, 0, -0.180728377372239, -0.351940514996392],
            [128.9, 0, 0.699965718999801, -0.239839926184689],
            [130, 0, -0.000618660426124, -0.461192483161337],
            [200, 0, 0.017933794466486, -0.227673909492046],
            [300, 0, -0.027856217193931, -0.291682956755576],
            [500, 0, -0.647422042007777, -1.89634511997135],
          ],
          comment: "Profile_2",
        },
      },
    ],
  },

  // Stopping condition
  stopping: {
    criteria: "flag", // Based on "type": "Flag"
    flag: {
      name: "ST_2_SEP",
      condition: "eq",
      value: 0.1,
    },
    time: {
      value: 500, // Default placeholder
      condition: "eq",
    },
    altitude: {
      value: 500000, // Default placeholder
      condition: "gt",
    },
  },

  // Optimization data
  optimization: {
    // Objective function data
    objective: [
      {
        name: "PAYLOAD_MASS",
        value: 1.0, // Default value since "null" in JSON
        weight: 1.0,
        type: "MAX", // Factor: -1 means maximize
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
        tolerance: 0.1, // From constraint_tolerence array
      },
      {
        name: "PERIGEE",
        value: 485.2,
        type: "INEQUALITY",
        condition: "GREATER_THAN",
        flag: "ST_2_SEP",
        enable: true,
        factor: 1,
        tolerance: 0.1, // From constraint_tolerence array
      },
      {
        name: "ECCENTRICITY",
        value: 0.001,
        type: "INEQUALITY",
        condition: "LESS_THAN",
        flag: "ST_2_SEP",
        enable: true,
        factor: 1,
        tolerance: 0.0001, // From constraint_tolerence array
      },
      {
        name: "INCLINATION",
        value: 97.35,
        type: "EQUALITY",
        condition: "",
        flag: "ST_2_SEP",
        enable: true,
        factor: 1,
        tolerance: 0.001, // From constraint_tolerence array
      },
    ],

    // Mode data
    mode: {
      type: "normal",
      normal: {
        algorithm: "SADE", // From optimizer
        map: {
          lower: 0,
          upper: 1,
        },
        population: 150,
        set_population: false, // Based on "set_population": "NO"
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
        algorithms: ["PSO", "MBH", "NLOPT"], // Default placeholder
        topology: "Fully Connected", // Default placeholder
        migration_type: "Broadcast", // Default placeholder
        migration_handling: "Evict", // Default placeholder
        map: {
          lower: 0,
          upper: 1,
        },
        population: 1, // Default placeholder
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

    // Design variables data from opt_steering_1, opt_steering_2, opt_steering_3, opt_payload_4
    design_variables: [
      {
        category: "STEERING",
        name: "opt_steering_1",
        segment: "constantPitch_1",
        segment_type: "CONST_BODYRATE",
        control_variable: "BODYRATE",
        axis: "pitch",
        lower_bound: -5.5,
        upper_bound: 6.5,
      },
      {
        category: "STEERING",
        name: "opt_steering_2",
        segment: "profile_1",
        segment_type: "PROFILE",
        control_variable: "EULER_RATE",
        axis: "pitch",
        lower_bound: -0.7, // simplifying to use the largest range value
        upper_bound: 0.7, // simplifying to use the largest range value
      },
      {
        category: "STEERING",
        name: "opt_steering_3",
        segment: "profile_2",
        segment_type: "PROFILE",
        control_variable: "EULER_RATE",
        axis: "pitch,yaw",
        lower_bound: -3, // simplifying to use the largest range value
        upper_bound: 3, // simplifying to use the largest range value
      },
      {
        category: "PAYLOAD",
        name: "opt_payload_4",
        control_variable: "MASS",
        lower_bound: 600,
        upper_bound: 900,
      },
    ],
  },
};

// Make the test data globally available
window.TestData = TestData;
