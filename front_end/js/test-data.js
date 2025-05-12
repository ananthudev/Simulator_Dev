// test-data.js - Standardized test data aligned with test_suite.json format
// This file provides consistent test data for the Astra GUI application

const TestData = {
  // Mission section data
  mission: {
    name: "SSPO",
    mode: "simulation",
    tracking: true,
    date: "2025-04-19",
    time: "12:45:23",
  },

  // Environment section data
  environment: {
    planet: "earth",
    atmosphere: {
      model: "atmos_76",
      csv: null, // Would contain file data if using CSV
    },
    wind: {
      csv: null, // Would contain file data if using CSV
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
    coe_info: "PERIGEE_GC_LATITUDE",
  },

  // Vehicle section data
  vehicle: {
    name: "Garuda",
    type: "ascend",
    integration_method: "RK4",
    time_step: 0.1,
    effective_altitude: 100000,
    dciss: false, // DCISS toggle off
    initial_conditions: {
      ascend: {
        data_method: "launch", // 'launch' or 'states'
        launch_point: {
          latitude: 13,
          longitude: 80.2,
          azimuth: 180,
          msl: 0,
          lp_height: 30,
          launch_angle: 0,
          roll: 0,
          pitch: 0,
          yaw: 0,
        },
        states: {
          // If using states method
          X: 0,
          Y: 0,
          Z: 0,
          U: 0,
          V: 0,
          W: 0,
          q0: 0,
          q1: 0,
          q2: 0,
          q3: 0,
        },
      },
      projectile: {
        data_method: "launch",
        launch_point: {
          latitude: 13,
          longitude: 80.2,
          msl: 0,
          azimuth: 90,
          elevation: 45,
          launch_angle: 0,
          initial_velocity: 600,
        },
      },
      orbital: {
        data_method: "state", // 'state', 'tle', or 'elements'
        state: {
          X: 1000,
          Y: 2000,
          Z: 3000,
          U: 4000,
          V: 5000,
          W: 6000,
          q0: 7000,
          q1: 8000,
          q2: 9000,
          q3: 10000,
        },
        tle: {
          line1: "",
          line2: "",
          start_time: 0,
          stop_time: 0,
          step_time: 0,
        },
        elements: {
          semi_major_axis: 0,
          eccentricity: 0,
          inclination: 0,
          argument_perigee: 0,
          raan: 0,
          true_anomaly: 0,
        },
      },
    },
    payload: {
      name: "James Webb",
      mass: 500,
    },
    plf: {
      name: "Heat Shield",
      mass: 200,
      separation: {
        type: "time", // 'time' or 'altitude'
        value: 150,
        flag: "HSS_Flag",
      },
    },
  },

  // Stage data
  stage: {
    stage1: {
      structural_mass: 1000,
      reference_area: 2.5,
      burn_time: 120,
      aero_data: null, // Would contain file data
      ini_flag: "ST_1_INI",
      sep_flag: "ST_1_SEP",
      dciss: false,
    },
    stage2: {
      structural_mass: 2000,
      reference_area: 5.0,
      burn_time: 140,
      aero_data: null,
      ini_flag: "ST_2_INI",
      sep_flag: "ST_2_SEP",
      dciss: false,
    },
  },

  // Motor data
  motor: {
    motor1_1: {
      // Stage 1, Motor 1
      propulsion_type: "Solid", // "Solid", "Liquid", "Hybrid"
      nozzle_diameter: 0.6,
      propulsion_mass: 5050,
      thrust_data: null, // Would contain file data
    },
    motor1_2: {
      // Stage 1, Motor 2
      propulsion_type: "Liquid", // Different type for testing
      nozzle_diameter: 0.8,
      propulsion_mass: 6000,
      thrust_data: null,
    },
    motor2_1: {
      // Stage 2, Motor 1
      propulsion_type: "Hybrid", // Different type for testing
      nozzle_diameter: 0.5,
      propulsion_mass: 3500,
      thrust_data: null,
    },
  },

  // Sequence data
  sequence: [
    {
      identity: "ST_1_INI",
      trigger: "MISSION_TIME",
      value: 23,
      reference: "none",
      comment: "Stage 1 Initialization",
    },
    {
      identity: "S1_M1_IGN",
      trigger: "MISSION_TIME",
      value: 23.5,
      reference: "ST_1_INI",
      comment: "Motor 1 Ignition",
    },
    {
      identity: "S1_M1_CUTOFF",
      trigger: "PHASE_TIME",
      value: 120,
      reference: "S1_M1_IGN",
      comment: "Motor 1 Cutoff",
    },
    {
      identity: "HSS_Flag",
      trigger: "ALTITUDE",
      value: 80000,
      reference: "none",
      comment: "Heat Shield Separation",
    },
    {
      identity: "ST_1_SEP",
      trigger: "MISSION_TIME",
      value: 150,
      reference: "S1_M1_CUTOFF",
      comment: "Stage 1 Separation",
    },
  ],

  // Steering data
  steering: {
    sequence: "123", // Roll → Pitch → Yaw
    components: [
      {
        id: "verticalAscend_1",
        name: "Vertical Ascend 1",
        type: "verticalAscend",
        start: {
          identity: "VERTICAL_START_1",
          trigger_type: "missiontime",
          trigger_value: 0,
          reference: "none",
          comment: "Start of vertical ascent",
        },
        stop: {
          identity: "VERTICAL_STOP_1",
          trigger_type: "altitude",
          trigger_value: 1000,
          reference: "none",
          comment: "End of vertical ascent",
        },
        parameters: {
          steering_type: "zeroRate",
          comment: "Zero rate vertical ascent phase",
        },
      },
      {
        id: "pitchHold_1",
        name: "Pitch Hold 1",
        type: "pitchHold",
        start: {
          identity: "PITCH_HOLD_START_1",
          trigger_type: "missiontime",
          trigger_value: 30,
          reference: "VERTICAL_STOP_1",
          comment: "Start of pitch hold",
        },
        stop: {
          identity: "PITCH_HOLD_STOP_1",
          trigger_type: "missiontime",
          trigger_value: 60,
          reference: "PITCH_HOLD_START_1",
          comment: "End of pitch hold",
        },
        parameters: {
          steering_type: "constantBodyRate",
          axis: "pitch",
          value: -1.5,
          comment: "Constant pitch rate maneuver",
        },
      },
      {
        id: "gravityTurn_1",
        name: "Gravity Turn 1",
        type: "gravityTurn",
        start: {
          identity: "GRAVITY_TURN_START_1",
          trigger_type: "missiontime",
          trigger_value: 90,
          reference: "PITCH_HOLD_STOP_1",
          comment: "Start of gravity turn",
        },
        stop: {
          identity: "GRAVITY_TURN_STOP_1",
          trigger_type: "altitude",
          trigger_value: 60000,
          reference: "none",
          comment: "End of gravity turn",
        },
        parameters: {
          steering_type: "clg",
          algorithm: "aoa",
          max_qaoa: 50000,
          alpha_time: 10,
          comment: "CLG gravity turn using AOA",
        },
      },
      {
        id: "profile_1",
        name: "Profile 1",
        type: "profile",
        start: {
          identity: "PROFILE_START_1",
          trigger_type: "missiontime",
          trigger_value: 120,
          reference: "GRAVITY_TURN_STOP_1",
          comment: "Start of profile steering",
        },
        stop: {
          identity: "PROFILE_STOP_1",
          trigger_type: "altitude",
          trigger_value: 100000,
          reference: "none",
          comment: "End of profile steering",
        },
        parameters: {
          steering_type: "profile",
          mode: "normal",
          quantity: "bodyRate",
          independentVar: "phaseTime",
          profile_csv_filename: "profile_data.csv",
          profile_csv:
            "Time,Roll,Pitch,Yaw\n0,0,-1,0\n10,0,-0.8,0\n20,0,-0.6,0\n30,0,-0.4,0\n40,0,-0.2,0\n50,0,0,0",
          comment: "Profile based steering using normal mode and body rate",
        },
      },
    ],
  },

  // Stopping condition
  stopping: {
    criteria: "flag", // 'flag', 'time', or 'altitude'
    flag: {
      name: "ST_1_SEP",
      condition: "eq",
      value: 1,
    },
    time: {
      value: 500,
      condition: "eq",
    },
    altitude: {
      value: 100000,
      condition: "gt",
    },
  },

  // Optimization data (for optimization mode)
  optimization: {
    // Objective function data - using format from test_suite.json
    objective: [
      {
        name: "MAXIMIZE_ALTITUDE",
        value: 1.0,
        weight: 1.0,
        type: "MAX",
      },
      {
        name: "MINIMIZE_FLIGHT_TIME",
        value: 0.5,
        weight: 0.3,
        type: "MIN",
      },
    ],

    // Constraints data - using format from test_suite.json
    constraints: [
      {
        name: "Q",
        value: 50000,
        type: "INEQUALITY",
        condition: "LESS_THAN",
        flag: "",
        enable: true,
        factor: 1,
        tolerance: 0.001,
      },
      {
        name: "MAX_QAOA",
        value: 45000,
        type: "INEQUALITY",
        condition: "LESS_THAN",
        flag: "",
        enable: true,
        factor: 1,
        tolerance: 0.001,
      },
      {
        name: "MAX_SENSED_ACC",
        value: 6,
        type: "INEQUALITY",
        condition: "LESS_THAN",
        flag: "",
        enable: true,
        factor: 1,
        tolerance: 0.01,
      },
      {
        name: "SLACK_VARIABLE",
        value: 0.1,
        type: "INEQUALITY",
        condition: "GREATER_THAN",
        flag: "ST_1_SEP",
        enable: true,
        factor: 1,
        tolerance: 0.0001,
      },
    ],

    // Mode data - using format from test_suite.json
    mode: {
      type: "archipelago", // 'normal' or 'archipelago'
      normal: {
        algorithm: "PSO",
        map: {
          lower: 0,
          upper: 1,
        },
        population: 20,
        set_population: true,
        problem_strategy: "ignore_o",
        csv_upload: null,
        algorithm_params: {
          PSO: {
            omega: 0.7,
            eta1: 2.0,
            eta2: 2.0,
            max_vel: 0.5,
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

    // Design variables data - using format from test_suite.json
    design_variables: [
      {
        category: "CUT_OFF",
        name: "opt_cutoff_1",
        flag: "ST_1_SEP",
        control_variable: "TIME",
        lower_bound: 100,
        upper_bound: 200,
      },
      {
        category: "STEERING",
        name: "opt_steering_1",
        segment: "pitchHold_1",
        segment_type: "CONST_BODYRATE",
        control_variable: "RATE",
        axis: "pitch",
        lower_bound: -2.0,
        upper_bound: -0.5,
      },
      {
        category: "PROPULSION",
        name: "opt_thrust_1",
        segment: "Stage_1",
        control_variable: "THRUST_SCALE",
        lower_bound: 0.8,
        upper_bound: 1.2,
      },
      {
        category: "AZIMUTH",
        name: "opt_azimuth",
        control_variable: "AZIMUTH_ANGLE",
        lower_bound: 90,
        upper_bound: 180,
      },
    ],
  },
};

// Make the test data globally available
window.TestData = TestData;
