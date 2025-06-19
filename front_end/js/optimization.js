// Optimization Module for Astra GUI

// Global state to track CSV file content for both modes
window.optimizationHandler = window.optimizationHandler || {};
window.optimizationHandler.normalCsvData = Array(49).fill(0); // Initialize with default array of zeros
window.optimizationHandler.normalCsvFile = null;
window.optimizationHandler.archipelagoCsvData = Array(49).fill(0); // Initialize with default array of zeros
window.optimizationHandler.archipelagoCsvFile = null;

// Add a CSV parse function to parse initial population data
// Function to calculate dynamic initial population size based on design variables
function calculateInitialPopulationSize() {
  try {
    // First try to get design variables from current form state
    let designVariablesData = [];

    if (typeof getDesignVariablesData === "function") {
      designVariablesData = getDesignVariablesData();
    }

    // If no form data, try to get from window.finalMissionData
    if (designVariablesData.length === 0 && window.finalMissionData) {
      // Get design variable names from the mission data
      const dvCollectionName = window.finalMissionData.design_variables;
      if (dvCollectionName && window.finalMissionData[dvCollectionName]) {
        const dvNames = window.finalMissionData[dvCollectionName];

        // For each design variable name, get its configuration
        dvNames.forEach((dvName) => {
          if (
            window.finalMissionData[dvName] &&
            window.finalMissionData[dvName][0]
          ) {
            designVariablesData.push({
              name: dvName,
              category: window.finalMissionData[dvName][0].category,
              segment_type: window.finalMissionData[dvName][0].segment_type,
              type: window.finalMissionData[dvName][0].type
                ? window.finalMissionData[dvName][0].type[0]
                : {},
            });
          }
        });
      }
    }

    // If still no data, return default size
    if (designVariablesData.length === 0) {
      console.log("No design variables found, using default size of 1");
      return 1; // Return minimal default instead of 49
    }

    let totalSize = 0;

    designVariablesData.forEach((dv) => {
      const dvType = dv.type || {};

      // Calculate size based on upper_bound arrays (since upper/lower are symmetric)
      if (dvType.upper_bound && Array.isArray(dvType.upper_bound)) {
        // Handle nested array structure
        if (Array.isArray(dvType.upper_bound[0])) {
          // For multi-axis variables like pitch and yaw
          dvType.upper_bound.forEach((axisArray) => {
            if (Array.isArray(axisArray)) {
              totalSize += axisArray.length;
            }
          });
        } else {
          // For single axis variables
          totalSize += dvType.upper_bound.length;
        }
      } else {
        // For single value bounds (like CLG, CUT_OFF, etc.)
        totalSize += 1;
      }
    });

    console.log(
      `Calculated initial population size: ${totalSize} based on ${designVariablesData.length} design variables`
    );
    return totalSize > 0 ? totalSize : 1; // Ensure at least size 1
  } catch (error) {
    console.error("Error calculating initial population size:", error);
    return 1; // Return minimal default on error
  }
}

function parseInitialPopulationCSV(csvString) {
  // Calculate dynamic size based on design variables
  const dynamicSize = calculateInitialPopulationSize();

  if (!csvString) return Array(dynamicSize).fill(0); // Return dynamic array if no input

  try {
    // Clean and prepare the string
    const trimmedString = csvString.trim();
    const lines = trimmedString.split("\n");

    if (lines.length === 0) return Array(dynamicSize).fill(0); // Return dynamic array if no lines

    // Initialize array to hold values
    const result = [];

    lines.forEach((line) => {
      const trimmedLine = line.trim();
      if (trimmedLine) {
        // Split by comma and parse each value as a number
        const values = trimmedLine.split(",").map((value) => {
          const cleanedValue = value.trim();
          const numValue = parseFloat(cleanedValue);
          return isNaN(numValue) ? cleanedValue : numValue;
        });

        // Add all valid numeric values to the result array
        values
          .filter((val) => typeof val === "number" && !isNaN(val))
          .forEach((val) => {
            result.push(val);
          });
      }
    });

    // Return the parsed result or dynamic array if empty
    return result.length > 0 ? result : Array(dynamicSize).fill(0);
  } catch (error) {
    console.error("Error parsing initial population CSV:", error);
    return Array(dynamicSize).fill(0); // Return dynamic array on error
  }
}

// Algorithm parameters definition for optimization
const algorithmParameters = {
  SGA: {
    generation: {
      type: "number",
      default: 5,
      label: "Generation",
      min: 1,
      step: 1,
      help: "Number of generations (integer)",
    },
    crossover_prob: {
      type: "number",
      default: 0.75,
      label: "Crossover Probability",
      min: 0,
      max: 1,
      step: 0.01,
      help: "Probability of crossover (0 to 1)",
    },
    eta_c: {
      type: "number",
      default: 1.0,
      label: "Eta C",
      min: 0,
      step: 0.1,
      help: "Distribution index for crossover (positive)",
    },
    mutation_prob: {
      type: "number",
      default: 0.85,
      label: "Mutation Probability",
      min: 0,
      max: 1,
      step: 0.01,
      help: "Probability of mutation (0 to 1)",
    },
    param_m: {
      type: "number",
      default: 1.0,
      label: "Param M",
      min: 0,
      step: 0.1,
      help: "Distribution index for mutation (positive)",
    },
    param_s: {
      type: "number",
      default: 2,
      label: "Param S",
      min: 0,
      step: 1,
      help: "Parameter for selection (positive)",
    },
    crossover: {
      type: "select",
      default: "exponential",
      label: "Crossover Method",
      options: ["exponential", "polynomial"],
      help: "Type of crossover operation",
    },
    mutation: {
      type: "select",
      default: "gaussian",
      label: "Mutation Method",
      options: ["gaussian", "polynomial", "uniform"],
      help: "Type of mutation operation",
    },
    selection: {
      type: "select",
      default: "tournament",
      label: "Selection Method",
      options: ["tournament", "truncated"],
      help: "Method for selecting individuals",
    },
    seed: {
      type: "number",
      default: 600,
      label: "Seed",
      step: 1,
      help: "Random seed (integer)",
    },
  },
  DE: {
    // Also covers SADE, pDE
    generation: {
      type: "number",
      default: 100,
      label: "Generation",
      min: 1,
      step: 1,
      help: "Number of generations",
    },
    variant_adptv: {
      type: "select",
      default: 1,
      label: "Adaptive Variant",
      options: [1, 2],
      help: "Adaptive variant setting (1 or 2)",
    },
    memory: {
      type: "select",
      default: false,
      label: "Memory",
      options: [true, false],
      help: "Enable memory feature (true/false)",
    },
    F: {
      type: "number",
      default: 0.8,
      label: "Weight Coefficient (F)",
      min: 0,
      step: 0.01,
      help: "Differential weight (positive)",
    },
    CR: {
      type: "number",
      default: 0.9,
      label: "Crossover Rate (CR)",
      min: 0,
      max: 1,
      step: 0.01,
      help: "Crossover probability (0 to 1)",
    },
    variant: {
      type: "select",
      default: 2,
      label: "Variant",
      options: [1, 2],
      help: "DE variant setting (1 or 2)",
    },
    ftol: {
      type: "number",
      default: 1e-6,
      label: "Function Tolerance",
      min: 0,
      step: 1e-7,
      help: "Tolerance for function value change",
    },
    xtol: {
      type: "number",
      default: 1e-6,
      label: "Variable Tolerance",
      min: 0,
      step: 1e-7,
      help: "Tolerance for variable change",
    },
    seed: {
      type: "number",
      default: 9,
      label: "Seed",
      step: 1,
      help: "Random seed (integer)",
    },
  },
  SADE: {
    // Shares DE parameters, can add specific ones if needed
    generation: {
      type: "number",
      default: 100,
      label: "Generation",
      min: 1,
      step: 1,
      help: "Number of generations",
    },
    variant_adptv: {
      type: "select",
      default: 1,
      label: "Adaptive Variant",
      options: [1, 2],
      help: "Adaptive variant setting (1 or 2)",
    },
    memory: {
      type: "select",
      default: false,
      label: "Memory",
      options: [true, false],
      help: "Enable memory feature (true/false)",
    },
    F: {
      type: "number",
      default: 0.8,
      label: "Weight Coefficient (F)",
      min: 0,
      step: 0.01,
      help: "Differential weight (positive)",
    },
    CR: {
      type: "number",
      default: 0.9,
      label: "Crossover Rate (CR)",
      min: 0,
      max: 1,
      step: 0.01,
      help: "Crossover probability (0 to 1)",
    },
    variant: {
      type: "select",
      default: 2,
      label: "Variant",
      options: [1, 2],
      help: "DE variant setting (1 or 2)",
    },
    ftol: {
      type: "number",
      default: 1e-6,
      label: "Function Tolerance",
      min: 0,
      step: 1e-7,
      help: "Tolerance for function value change",
    },
    xtol: {
      type: "number",
      default: 1e-6,
      label: "Variable Tolerance",
      min: 0,
      step: 1e-7,
      help: "Tolerance for variable change",
    },
    seed: {
      type: "number",
      default: 9,
      label: "Seed",
      step: 1,
      help: "Random seed (integer)",
    },
  },
  pDE: {
    // Shares DE parameters, can add specific ones if needed
    generation: {
      type: "number",
      default: 100,
      label: "Generation",
      min: 1,
      step: 1,
      help: "Number of generations",
    },
    variant_adptv: {
      type: "select",
      default: 1,
      label: "Adaptive Variant",
      options: [1, 2],
      help: "Adaptive variant setting (1 or 2)",
    },
    memory: {
      type: "select",
      default: false,
      label: "Memory",
      options: [true, false],
      help: "Enable memory feature (true/false)",
    },
    F: {
      type: "number",
      default: 0.8,
      label: "Scale Factor (F)",
      min: 0,
      step: 0.01,
      help: "Differential weight (positive)",
    },
    CR: {
      type: "number",
      default: 0.9,
      label: "Crossover Rate (CR)",
      min: 0,
      max: 1,
      step: 0.01,
      help: "Crossover probability (0 to 1)",
    },
    variant: {
      type: "select",
      default: 2,
      label: "Variant",
      options: [1, 2],
      help: "DE variant setting (1 or 2)",
    },
    ftol: {
      type: "number",
      default: 1e-6,
      label: "Function Tolerance",
      min: 0,
      step: 1e-7,
      help: "Tolerance for function value change",
    },
    xtol: {
      type: "number",
      default: 1e-6,
      label: "Variable Tolerance",
      min: 0,
      step: 1e-7,
      help: "Tolerance for variable change",
    },
    seed: {
      type: "number",
      default: 9,
      label: "Seed",
      step: 1,
      help: "Random seed (integer)",
    },
  },
  PSO: {
    generation: {
      type: "number",
      default: 100,
      label: "Generation",
      min: 1,
      step: 1,
      help: "Number of generations (integer)",
    },
    omega: {
      type: "number",
      default: 0.8,
      label: "Inertia Weight (Omega)",
      max: 1,
      step: 0.01,
      help: "Inertia weight (<1)",
    },
    eta1: {
      type: "number",
      default: 2.05,
      label: "Eta1",
      min: 0,
      step: 0.01,
      help: "Magnitude of force",
    },
    eta2: {
      type: "number",
      default: 2.05,
      label: "Eta2",
      min: 0,
      step: 0.01,
      help: "Magnitude of force",
    },
    max_vel: {
      type: "number",
      default: 0.6,
      label: "Max Velocity",
      min: 0,
      step: 0.01,
      help: "Maximum particle velocity (positive)",
    },
    variant: {
      type: "select",
      default: 5,
      label: "Variant",
      options: [1, 2, 3, 4, 5, 6],
      help: "PSO variant type (1-6)",
    },
    neighb_type: {
      type: "select",
      default: 2,
      label: "Neighborhood Type",
      options: [1, 2, 3, 4],
      help: "Neighborhood topology (1-4)",
    },
    neighb_param: {
      type: "number",
      default: 4,
      label: "Neighborhood Param",
      min: 0,
      step: 1,
      help: "Neighborhood parameter (positive)",
    },
    memory: {
      type: "select",
      default: false, // Assuming 0 means false
      label: "Memory",
      options: [true, false],
      help: "Enable memory feature (true/false)",
    },
    seed: {
      type: "number",
      default: 9,
      label: "Seed",
      step: 1,
      help: "Random seed (integer)",
    },
  },
  IPOPT: {
    tol: {
      type: "number",
      default: 100,
      label: "Tolerance",
      min: 0,
      step: 1,
      help: "Overall convergence tolerance",
    },
    linear_solver: {
      type: "select",
      default: "mumps",
      label: "Linear Solver",
      options: [
        "ma27",
        "ma57",
        "ma77",
        "ma86",
        "ma97",
        "pardiso",
        "pardisomkl",
        "spral",
        "wsmp",
        "mumps",
      ],
      help: "Linear system solver",
    },
    dual_inf_tol: {
      type: "number",
      default: 1,
      label: "Dual Inf Tol",
      min: 0,
      step: 0.1,
      help: "Dual infeasibility tolerance (>0)",
    },
    constr_viol_tol: {
      type: "number",
      default: 0.0001,
      label: "Constr Viol Tol",
      min: 0,
      step: 1e-5,
      help: "Constraint violation tolerance (>0)",
    },
    compl_inf_tol: {
      type: "number",
      default: 0.0001,
      label: "Compl Inf Tol",
      min: 0,
      step: 1e-5,
      help: "Complementarity infeasibility tolerance (>0)",
    },
    bound_relax_factor: {
      type: "number",
      default: 1e-8,
      label: "Bound Relax Factor",
      min: 0,
      step: 1e-9,
      help: "Bound relaxation factor (>0)",
    },
    acceptable_tol: {
      type: "number",
      default: 1e-6,
      label: "Acceptable Tol",
      min: 0,
      step: 1e-7,
      help: "Acceptable convergence tolerance (>0)",
    },
    acceptable_iter: {
      type: "number",
      default: 15,
      label: "Acceptable Iter",
      min: 0,
      step: 1,
      help: "Acceptable iteration limit (>=0)",
    },
    gradient_approximation: {
      type: "select",
      default: "exact",
      label: "Gradient Approximation",
      options: ["exact", "finite-difference-values"],
      help: "Method for gradient calculation",
    },
  },
  CS: {
    max_feval: {
      type: "number",
      default: 500,
      label: "Max Function Evals",
      min: 1,
      step: 1,
      help: "Maximum number of function evaluations",
    },
    start_range: {
      type: "number",
      default: 0.1,
      label: "Start Range",
      min: 0,
      max: 1,
      step: 0.01,
      help: "Initial search range (0 to 1)",
    },
    stop_range: {
      type: "number",
      default: 0.0001,
      label: "Stop Range",
      min: 0,
      max: 1,
      step: 1e-5,
      help: "Stopping search range (0 to 1)",
    },
    reduction_coeff: {
      type: "number",
      default: 0.5,
      label: "Reduction Coeff",
      min: 0,
      max: 1,
      step: 0.01,
      help: "Range reduction coefficient (0 to 1)",
    },
  },
  NLOPT: {
    solver: {
      type: "select",
      default: "slsqp",
      label: "Solver",
      options: ["slsqp", "mma", "ccsaq", "cobyla", "auglag"],
      help: "Internal NLOPT solver",
    },
    stop_val: {
      type: "number",
      default: null,
      label: "Stop Value",
      step: "any",
      nullable: true,
      help: "Stop when function value reaches this (null to disable)",
    },
    ftol_rel: {
      type: "number",
      default: 0,
      label: "Func Tol Relative",
      min: 0,
      step: 1e-7,
      help: "Relative function tolerance (positive)",
    },
    ftol_abs: {
      type: "number",
      default: 0,
      label: "Func Tol Absolute",
      min: 0,
      step: 1e-7,
      help: "Absolute function tolerance (positive)",
    },
    xtol_rel: {
      type: "number",
      default: 0,
      label: "Var Tol Relative",
      min: 0,
      step: 1e-7,
      help: "Relative variable tolerance (positive)",
    },
    xtol_abs: {
      type: "number",
      default: 1e-6,
      label: "Var Tol Absolute",
      min: 0,
      step: 1e-7,
      help: "Absolute variable tolerance (positive)",
    },
    maxeval: {
      type: "number",
      default: 0,
      label: "Max Evaluations",
      min: 0,
      step: 1,
      help: "Max function evaluations (0 for none)",
    },
    maxtime: {
      type: "number",
      default: 0,
      label: "Max Time",
      min: 0,
      step: 0.1,
      help: "Max optimization time in seconds (0 for none)",
    },
  },
  GAGGS: {
    Algorithm_1: {
      type: "select",
      default: "PSO",
      label: "Algorithm 1 (Global)",
      options: [
        "SGA",
        "DE",
        "SADE",
        "pDE",
        "PSO",
        "CS",
        "GAGGS",
        "MBH",
        "CSTRS",
        "GWO",
        "IHS",
        "AC",
        "ABC",
        "CMAES",
        "XNES",
        "NSGA2",
      ], // Excludes NLOPT, IPOPT
      help: "First algorithm (global search)",
    },
    Algorithm_2: {
      type: "select",
      default: "NLOPT",
      label: "Algorithm 2 (Local)",
      options: ["NLOPT", "IPOPT"],
      help: "Second algorithm (local search)",
    },
    Gaggs_generation: {
      type: "number",
      default: 5,
      label: "GAGGS Generation",
      min: 1,
      step: 1,
      help: "Number of GAGGS generations",
    },
    pop_GA: {
      type: "number",
      default: 5,
      label: "Population GA",
      min: 1,
      step: 1,
      help: "Population size for Algorithm 1",
    },
  },
  MBH: {
    innerr_algorithm: {
      type: "select",
      default: "CS",
      label: "Inner Algorithm",
      options: [
        "SGA",
        "DE",
        "SADE",
        "pDE",
        "PSO",
        "CS",
        "GAGGS",
        "MBH",
        "CSTRS",
        "GWO",
        "IHS",
        "AC",
        "ABC",
        "CMAES",
        "XNES",
        "NSGA2",
        "NLOPT",
        "IPOPT",
      ],
      help: "Algorithm used in the inner loop",
    },
    runs: {
      type: "number",
      default: 100,
      label: "Runs",
      min: 1,
      step: 1,
      help: "Number of inner algorithm runs",
    },
    perturb: {
      type: "number",
      default: 1e-2,
      label: "Perturbation",
      min: 0,
      step: 1e-3,
      help: "Perturbation factor (positive)",
    },
    seed: {
      type: "text",
      default: "random",
      label: "Seed",
      help: "Random seed ('random' or integer)",
    },
  },
  CSTRS: {
    innerr_algorithm: {
      type: "select",
      default: "DE",
      label: "Inner Algorithm",
      options: [
        "SGA",
        "DE",
        "SADE",
        "pDE",
        "PSO",
        "CS",
        "GAGGS",
        "MBH",
        "CSTRS",
        "GWO",
        "IHS",
        "AC",
        "ABC",
        "CMAES",
        "XNES",
        "NSGA2",
        "NLOPT",
        "IPOPT",
      ],
      help: "Algorithm used in the inner loop",
    },
    iters: {
      type: "number",
      default: 1,
      label: "Iterations",
      min: 1,
      step: 1,
      help: "Number of iterations",
    },
    seed: {
      type: "text",
      default: "random",
      label: "Seed",
      help: "Random seed ('random' or integer)",
    },
  },
  GWO: {
    generation: {
      type: "number",
      default: 50,
      label: "Generation",
      min: 1,
      step: 1,
      help: "Number of generations",
    },
    seed: {
      type: "text",
      default: "random",
      label: "Seed",
      help: "Random seed ('random' or integer)",
    },
  },
  IHS: {
    phmcr: {
      type: "number",
      default: 0.85,
      label: "PHMCR",
      min: 0,
      max: 1,
      step: 0.01,
      help: "Harmony Memory Considering Rate (0-1)",
    },
    ppar_min: {
      type: "number",
      default: 0.35,
      label: "Min PPAR",
      min: 0,
      max: 1,
      step: 0.01,
      help: "Min Pitch Adjusting Rate (0-1)",
    },
    ppar_max: {
      type: "number",
      default: 0.99,
      label: "Max PPAR",
      min: 0,
      max: 1,
      step: 0.01,
      help: "Max Pitch Adjusting Rate (0-1)",
    },
    bw_min: {
      type: "number",
      default: 1e-5,
      label: "Min BW",
      min: 0,
      step: 1e-6,
      help: "Min Bandwidth (positive)",
    },
    bw_max: {
      type: "number",
      default: 1.0,
      label: "Max BW",
      min: 0,
      step: 0.01,
      help: "Max Bandwidth (positive)",
    },
  },
  AC: {
    generation: {
      type: "number",
      default: 1,
      label: "Generation",
      min: 1,
      step: 1,
      help: "Number of generations",
    },
    ker: {
      type: "number",
      default: 63,
      label: "Kernel Size",
      min: 2,
      step: 1,
      help: "Kernel size (>=2)",
    },
    q: {
      type: "number",
      default: 1.0,
      label: "Q Factor",
      min: 0,
      step: 0.1,
      help: "Q parameter (>=0)",
    },
    oracle: {
      type: "number",
      default: 0.0,
      label: "Oracle",
      min: 0,
      step: 0.1,
      help: "Oracle value (positive)",
    },
    acc: {
      type: "number",
      default: 0.01,
      label: "Accuracy",
      min: 0,
      step: 0.001,
      help: "Accuracy parameter (>=0)",
    },
    threshold: {
      type: "number",
      default: 1,
      label: "Threshold",
      min: 1,
      step: 1,
      help: "Threshold value (>=1)",
    },
    n_gen_mark: {
      type: "number",
      default: 7,
      label: "N Gen Mark",
      min: 1,
      step: 1,
      help: "Generation mark (positive)",
    },
    impstop: {
      type: "number",
      default: 100000,
      label: "Imp Stop",
      min: 1,
      step: 100,
      help: "Improvement stop criterion",
    },
    evalstop: {
      type: "number",
      default: 100000,
      label: "Eval Stop",
      min: 1,
      step: 100,
      help: "Evaluation stop criterion",
    },
    focus: {
      type: "number",
      default: 0.0,
      label: "Focus",
      min: 0,
      step: 0.1,
      help: "Focus parameter (>=0)",
    },
    memory: {
      type: "select",
      default: false,
      label: "Memory",
      options: [true, false],
      help: "Enable memory feature (true/false)",
    },
    seed: {
      type: "text",
      default: "random",
      label: "Seed",
      help: "Random seed ('random' or integer)",
    },
  },
  ABC: {
    generation: {
      type: "number",
      default: 1,
      label: "Generation",
      min: 1,
      step: 1,
      help: "Number of generations",
    },
    limit: {
      type: "number",
      default: 20,
      label: "Limit",
      min: 1,
      step: 1,
      help: "Scout limit for bees",
    },
    seed: {
      type: "text",
      default: "random",
      label: "Seed",
      help: "Random seed ('random' or integer)",
    },
  },
  CMAES: {
    generation: {
      type: "number",
      default: 1,
      label: "Generation",
      min: 1,
      step: 1,
      help: "Number of generations",
    },
    sigma0: {
      type: "number",
      default: 0.5,
      label: "Initial Sigma",
      min: 0,
      step: 0.01,
      help: "Initial standard deviation (positive)",
    },
    ftol: {
      type: "number",
      default: 1e-6,
      label: "Function Tolerance",
      min: 0,
      step: 1e-7,
      help: "Function value tolerance (positive)",
    },
    xtol: {
      type: "number",
      default: 1e-6,
      label: "Variable Tolerance",
      min: 0,
      step: 1e-7,
      help: "Variable value tolerance (positive)",
    },
    memory: {
      type: "select",
      default: false,
      label: "Memory",
      options: [true, false],
      help: "Enable memory feature (true/false)",
    },
    force_bounds: {
      type: "select",
      default: false,
      label: "Force Bounds",
      options: [true, false],
      help: "Force variables within bounds (true/false)",
    },
    seed: {
      type: "text",
      default: "random",
      label: "Seed",
      help: "Random seed ('random' or integer)",
    },
  },
  XNES: {
    generation: {
      type: "number",
      default: 1,
      label: "Generation",
      min: 1,
      step: 1,
      help: "Number of generations",
    },
    ftol: {
      type: "number",
      default: 1e-6,
      label: "Function Tolerance",
      min: 0,
      step: 1e-7,
      help: "Function value tolerance (positive)",
    },
    xtol: {
      type: "number",
      default: 1e-6,
      label: "Variable Tolerance",
      min: 0,
      step: 1e-7,
      help: "Variable value tolerance (positive)",
    },
    memory: {
      type: "select",
      default: false,
      label: "Memory",
      options: [true, false],
      help: "Enable memory feature (true/false)",
    },
    force_bounds: {
      type: "select",
      default: false,
      label: "Force Bounds",
      options: [true, false],
      help: "Force variables within bounds (true/false)",
    },
    seed: {
      type: "text",
      default: "random",
      label: "Seed",
      help: "Random seed ('random' or integer)",
    },
  },
  NSGA2: {
    generation: {
      type: "number",
      default: 1,
      label: "Generation",
      min: 1,
      step: 1,
      help: "Number of generations",
    },
    cr: {
      type: "number",
      default: 0.95,
      label: "Crossover Rate",
      min: 0,
      max: 1,
      step: 0.01,
      help: "Crossover probability (<1)",
    },
    eta_c: {
      type: "number",
      default: 10.0,
      label: "Eta C (Crossover)",
      min: 1,
      max: 100,
      step: 0.1,
      help: "Distribution index for crossover (1-100)",
    },
    m: {
      type: "number",
      default: 0.01,
      label: "Mutation Rate",
      min: 0,
      max: 1,
      step: 0.001,
      help: "Mutation probability (<1)",
    },
    eta_m: {
      type: "number",
      default: 50.0,
      label: "Eta M (Mutation)",
      min: 1,
      max: 100,
      step: 0.1,
      help: "Distribution index for mutation (1-100)",
    },
    seed: {
      type: "text",
      default: "random",
      label: "Seed",
      help: "Random seed ('random' or integer)",
    },
  },
};

// Make algorithm parameters globally available
window.algorithmParameters = algorithmParameters;

// Control Variable options for each design variable category
const designVariableControlOptions = {
  CUT_OFF: ["TIME"],
  PAYLOAD: ["MASS"],
  AZIMUTH: ["LAUNCH_AZIMUTH"],
  SEQUENCE: ["TIME"],
  PROPULSION: ["PROPULSION"],
  STEERING: {
    CLG: ["EULER_RATE", "BODY_RATE", "EULER_ANGLE", "BODY_ANGLE"],
    ZERO_RATE: ["STOP_TIME"],
    PROFILE: ["EULER_RATE", "BODY_RATE", "EULER_ANGLE", "BODY_ANGLE"],
    CONST_BODYRATE: [
      "STOP_TIME",
      "EULER_RATE",
      "BODY_RATE",
      "EULER_ANGLE",
      "BODY_ANGLE",
    ],
  },
};

// Make control options globally available
window.designVariableControlOptions = designVariableControlOptions;

document.addEventListener("DOMContentLoaded", function () {
  console.log("Optimization module loaded");

  // =========================================
  // OBJECTIVE FUNCTION ELEMENTS
  // =========================================
  const objectiveFunctionContainer = document.getElementById(
    "objective-function-container"
  );
  const addObjectiveBtn = document.getElementById("add-objective-btn");

  const MAX_OBJECTIVES = 2;
  let objectiveCount = 0;

  // Form references
  const objectiveFunctionForm = document.getElementById(
    "objective-function-form"
  );
  const constraintsForm = document.getElementById("constraints-form");
  const modeForm = document.getElementById("mode-form");
  const designVariablesForm = document.getElementById("design-variables-form");

  // Set default population values
  const normalPopulation = document.getElementById("normal-population");
  const archipelagoPopulation = document.getElementById(
    "archipelago-population"
  );

  if (normalPopulation && normalPopulation.value === "") {
    normalPopulation.value = "1";
  }

  if (archipelagoPopulation && archipelagoPopulation.value === "") {
    archipelagoPopulation.value = "1";
  }

  // Function to toggle CSV upload visibility based on toggle state
  function toggleCsvUploadVisibility(mode) {
    const toggleElement = document.getElementById(`${mode}-set-population`);

    // Directly target the upload row or group
    let uploadElement;

    if (mode === "normal") {
      uploadElement = document.getElementById("normal-upload-row");
    } else {
      // For archipelago, try both ID and class selector
      uploadElement = document.getElementById("archipelago-upload-group");
      if (!uploadElement) {
        // Try finding it by form-group with upload-data class
        uploadElement = document.querySelector(
          `.form-group.upload-data[id="${mode}-upload-group"]`
        );
        if (!uploadElement) {
          // As a last resort, try finding any upload-data element in the archipelago section
          uploadElement = document.querySelector(
            `#archipelago-mode-fields .upload-data`
          );
        }
      }
    }

    if (toggleElement && uploadElement) {
      // Use flex for form rows, block for form groups
      const displayValue = mode === "normal" ? "flex" : "block";
      uploadElement.style.display = toggleElement.checked
        ? displayValue
        : "none";
      console.log(`Toggle ${mode} CSV visibility: ${toggleElement.checked}`);
    } else {
      console.warn(
        `Could not find elements to toggle CSV visibility for ${mode} mode`
      );
      if (!toggleElement)
        console.warn(`Toggle element '${mode}-set-population' not found`);
      if (!uploadElement)
        console.warn(`Upload element for ${mode} mode not found`);
    }
  }

  // Simplified function to initialize the CSV upload containers
  function setupCsvUploadContainers() {
    console.log("Setting up CSV upload visibility");

    // For normal mode
    const normalSetPopToggle = document.getElementById("normal-set-population");
    const normalUploadRow = document.getElementById("normal-upload-row");

    if (normalSetPopToggle && normalUploadRow) {
      // Initialize visibility based on toggle state - use flex for form rows
      normalUploadRow.style.display = normalSetPopToggle.checked
        ? "flex"
        : "none";
      console.log(
        `Normal mode CSV visibility initialized: ${normalSetPopToggle.checked}`
      );
    } else if (normalSetPopToggle) {
      console.warn("Normal upload row element not found");
    }

    // For archipelago mode
    const archipelagoSetPopToggle = document.getElementById(
      "archipelago-set-population"
    );

    // Use the same robust element finding strategy
    let archipelagoUploadElement = document.getElementById(
      "archipelago-upload-group"
    );
    if (!archipelagoUploadElement) {
      // Try finding it by form-group with upload-data class
      archipelagoUploadElement = document.querySelector(
        '.form-group.upload-data[id="archipelago-upload-group"]'
      );
      if (!archipelagoUploadElement) {
        // As a last resort, try finding any upload-data element in the archipelago section
        archipelagoUploadElement = document.querySelector(
          "#archipelago-mode-fields .upload-data"
        );
      }
    }

    if (archipelagoSetPopToggle && archipelagoUploadElement) {
      // Initialize visibility based on toggle state - use block for form groups
      archipelagoUploadElement.style.display = archipelagoSetPopToggle.checked
        ? "block"
        : "none";
      console.log(
        `Archipelago mode CSV visibility initialized: ${archipelagoSetPopToggle.checked}`
      );
    } else if (archipelagoSetPopToggle) {
      console.warn("Archipelago upload element not found");
    }

    // Setup file upload handlers
    setupNormalCsvUpload();
    setupArchipelagoCsvUpload();
  }

  // Setup normal mode CSV upload
  function setupNormalCsvUpload() {
    const uploadBtn = document.getElementById("normal-csv-upload-btn");
    const clearBtn = document.getElementById("normal-csv-clear-btn");
    const fileInput = document.getElementById("normal-csv-upload");
    const filenameDisplay = document.getElementById("normal-csv-filename");

    if (!uploadBtn || !fileInput || !filenameDisplay) {
      console.warn("Missing normal mode CSV upload elements");
      return;
    }

    // File store callback
    const fileStoreCallback = (fileContent, filename) => {
      if (fileContent && filename) {
        window.optimizationHandler.normalCsvFile = {
          name: filename,
          content: fileContent,
        };
        window.optimizationHandler.normalCsvData =
          parseInitialPopulationCSV(fileContent);
        console.log("Normal mode CSV data parsed and stored");
      } else {
        window.optimizationHandler.normalCsvFile = null;
        const dynamicSize = calculateInitialPopulationSize();
        window.optimizationHandler.normalCsvData = Array(dynamicSize).fill(0);
        console.log(
          "Normal mode CSV data cleared and set to default zeros with dynamic size"
        );
      }
    };

    setupFileUpload(
      uploadBtn,
      clearBtn,
      fileInput,
      filenameDisplay,
      fileStoreCallback
    );
  }

  // Setup archipelago mode CSV upload
  function setupArchipelagoCsvUpload() {
    const uploadBtn = document.getElementById("archipelago-csv-upload-btn");
    const clearBtn = document.getElementById("archipelago-csv-clear-btn");
    const fileInput = document.getElementById("archipelago-csv-upload");
    const filenameDisplay = document.getElementById("archipelago-csv-filename");

    if (!uploadBtn || !fileInput || !filenameDisplay) {
      console.warn("Missing archipelago mode CSV upload elements");
      return;
    }

    // File store callback
    const fileStoreCallback = (fileContent, filename) => {
      if (fileContent && filename) {
        window.optimizationHandler.archipelagoCsvFile = {
          name: filename,
          content: fileContent,
        };
        window.optimizationHandler.archipelagoCsvData =
          parseInitialPopulationCSV(fileContent);
        console.log("Archipelago mode CSV data parsed and stored");
      } else {
        window.optimizationHandler.archipelagoCsvFile = null;
        const dynamicSize = calculateInitialPopulationSize();
        window.optimizationHandler.archipelagoCsvData =
          Array(dynamicSize).fill(0);
        console.log(
          "Archipelago mode CSV data cleared and set to default zeros with dynamic size"
        );
      }
    };

    setupFileUpload(
      uploadBtn,
      clearBtn,
      fileInput,
      filenameDisplay,
      fileStoreCallback
    );
  }

  // Call this after a short delay to ensure the DOM is fully loaded
  setTimeout(() => {
    setupCsvUploadContainers();

    // Set up event listeners for the toggle buttons
    const normalSetPopToggle = document.getElementById("normal-set-population");
    const archipelagoSetPopToggle = document.getElementById(
      "archipelago-set-population"
    );

    if (normalSetPopToggle) {
      normalSetPopToggle.addEventListener("change", function () {
        toggleCsvUploadVisibility("normal");
      });
    }

    if (archipelagoSetPopToggle) {
      archipelagoSetPopToggle.addEventListener("change", function () {
        toggleCsvUploadVisibility("archipelago");
      });
    }

    console.log("CSV upload containers and toggle listeners initialized");
  }, 500);

  // =========================================
  // CONSTRAINT ELEMENTS
  // =========================================
  const constraintNameSelect = document.getElementById("constraint-name");
  const constraintFlagSelect = document.getElementById("constraint-flag");
  const constraintsContainer = document.getElementById("constraints-container");
  const addConstraintBtn = document.getElementById("add-constraint-btn");

  // =========================================
  // DESIGN VARIABLE ELEMENTS
  // =========================================
  const designVariablesContainer = document.getElementById(
    "design-variables-container"
  );
  const addDesignVariableBtn = document.getElementById(
    "add-design-variable-btn"
  );
  const designVariableTemplate = document.getElementById(
    "design-variable-template-content" // Using the template element directly
  );
  const MAX_DESIGN_VARIABLES = 10;
  let designVariableCounter = 0;

  // --- Objective Function Options ---
  const allObjectiveOptions = {
    DUMMY: "None",
    PAYLOAD_MASS: "Total Payload mass",
    BODY_RATES: "Body rates of the vehicle",
    HEAT_FLUX: "Heat Flux",
    SEMI_MAJOR_AXIS: "Semi Major Axis",
    ANGULAR_MOMENTUM: "Angular Momentum",
    ECCENTRICITY: "Eccentricity",
    INCLINATION: "Inclination",
    TRUE_ANOMALY: "True Anomaly",
    ECCENTRIC_ANOMALY: "Eccentric Anomaly",
    MEAN_ANOMALY: "Mean Anomaly",
    RAAN: "Right Ascension of the Ascending Node",
    AOP: "Argument of Perigee",
    PERIGEE_GC_LATITUDE: "Perigee geocentric latitude",
    APOGEE_GC: "Apogee geocentric altitude",
    APOGEE_ALTITUDE: "Apogee Altitude",
    PERIGEE_ALTITUDE: "Perigee Altitude",
    PERIGEE_GC: "Perigee geocentric altitude",
    TOTAL_ENERGY: "Total Energy",
    QAOA: "Q Angle of Attack",
  };

  // --- Constraint Options ---
  const allConstraintOptions = {
    LIFT_OFF_MASS: "Lift Off Mass",
    MAX_SENSED_ACC: "Max Sensed Acceleration",
    SLACK_VARIABLE: "Slack Variable",
    TOTAL_ENERGY: "Total Energy",
    SEMI_MAJOR_AXIS: "Semi Major Axis",
    ANGULAR_MOMENTUM: "Angular Momentum",
    ECCENTRICITY: "Eccentricity",
    INCLINATION: "Inclination",
    TRUE_ANOMALY: "True Anomaly",
    ECCENTRIC_ANOMALY: "Eccentric Anomaly",
    RAAN: "Right Ascension of the Ascending Node",
    AOP: "Argument of Perigee",
    PERIGEE_GC_LATITUDE: "Perigee Geocentric Latitude",
    PERIGEE_GC: "Perigee Geocentric Altitude",
    APOGEE_GC: "Apogee Geocentric Altitude",
    PERIGEE: "Perigee Altitude",
    APOGEE: "Apogee Altitude",
    STAGE_IMPACT: "Stage Impact Coordinates",
    DCISS_IMPACT: "DCISS Impact",
    MAX_QAOA: "Maximum QAOA",
    Q: "Dynamic Pressure",
    ALPHA: "Angle of Attack",
    MAX_BODY_RATE: "Maximum Body Rate",
    MAX_HEAT_FLUX: "Maximum Heat Flux",
    BODY_RATES: "Body Rates",
    // QAOA: "Q Angle of Attack",
    CUSTOM: "IIP",
  };

  // Make constraint options globally available
  window.allConstraintOptions = allConstraintOptions;

  // Function to get currently selected objective names
  function getSelectedObjectiveNames() {
    const selected = [];
    objectiveFunctionContainer
      .querySelectorAll(".objective-name-select")
      .forEach((select) => {
        if (select.value) {
          selected.push(select.value);
        }
      });
    return selected;
  }

  // Function to get available objective options (excluding already selected ones)
  function getAvailableObjectiveOptions() {
    const selectedNames = getSelectedObjectiveNames();
    const available = {};
    for (const key in allObjectiveOptions) {
      if (!selectedNames.includes(key)) {
        available[key] = allObjectiveOptions[key];
      }
    }
    return available;
  }

  // Function to populate a flag dropdown
  function populateFlagDropdown(selectElement, context) {
    if (!selectElement) {
      console.warn(`Flag dropdown not found for ${context}`);
      return;
    }

    // Save current selection if any
    const currentValue = selectElement.value;

    // Completely clear the dropdown
    selectElement.innerHTML = "";

    // Add back the placeholder option
    const placeholderOption = document.createElement("option");
    placeholderOption.value = "";
    placeholderOption.textContent = "Select Flag";
    placeholderOption.disabled = true;
    placeholderOption.selected = true;
    selectElement.appendChild(placeholderOption);

    try {
      // Get all sequence flags
      let sequenceFlags = [];
      if (typeof getAllSequenceFlags === "function") {
        sequenceFlags = getAllSequenceFlags();
      } else if (
        window.formHandler &&
        typeof window.formHandler.getAllSequenceFlags === "function"
      ) {
        sequenceFlags = window.formHandler.getAllSequenceFlags();
      } else {
        console.warn(
          `getAllSequenceFlags function not found. Cannot populate flags for ${context}.`
        );
        // Add some placeholder flags for testing
        sequenceFlags = [
          "FLAG_1",
          "FLAG_2",
          "FLAG_3",
          "MECO",
          "SECO",
          "TOUCHDOWN",
        ];
      }

      // Create map of category types to their labels
      const categoryLabels = {
        initialization: "Stage Initialization",
        separation: "Stage Separation",
        ignition: "Motor Ignition",
        burnout: "Motor Burnout",
        heatShield: "Heat Shield",
        other: "Other Flags",
      };

      // Create a mapping to hold all flags by category
      const categoryFlags = {
        initialization: new Set(),
        separation: new Set(),
        ignition: new Set(),
        burnout: new Set(),
        heatShield: new Set(),
        other: new Set(),
      };

      // Process all flags from sequence and categorize them
      sequenceFlags.forEach((flag) => {
        if (flag.match(/ST_\d+_INI$/)) {
          categoryFlags.initialization.add(flag);
        } else if (flag.match(/ST_\d+_SEP$/)) {
          categoryFlags.separation.add(flag);
        } else if (flag.match(/S\d+_M\d+_IGN$/)) {
          categoryFlags.ignition.add(flag);
        } else if (flag.match(/S\d+_M\d+_Burnout$/)) {
          categoryFlags.burnout.add(flag);
        } else if (flag === "HSS_Flag") {
          categoryFlags.heatShield.add(flag);
        } else {
          categoryFlags.other.add(flag);
        }
      });

      // Process registry flags as well
      if (window.flagRegistry) {
        // Add stage initialization flags
        if (window.flagRegistry.stages?.initializationFlags) {
          window.flagRegistry.stages.initializationFlags.forEach((entry) => {
            if (entry?.flag) categoryFlags.initialization.add(entry.flag);
          });
        }

        // Add stage separation flags
        if (window.flagRegistry.stages?.separationFlags) {
          window.flagRegistry.stages.separationFlags.forEach((entry) => {
            if (entry?.flag) categoryFlags.separation.add(entry.flag);
          });
        }

        // Add motor ignition and burnout flags
        if (
          window.flagRegistry.motors &&
          Array.isArray(window.flagRegistry.motors)
        ) {
          window.flagRegistry.motors.forEach((motor) => {
            if (motor?.flags?.ignition) {
              categoryFlags.ignition.add(motor.flags.ignition);
            }
            if (motor?.flags?.burnout) {
              categoryFlags.burnout.add(motor.flags.burnout);
            }
          });
        }

        // Add heat shield flags
        if (
          window.flagRegistry.heatShieldFlags &&
          Array.isArray(window.flagRegistry.heatShieldFlags)
        ) {
          window.flagRegistry.heatShieldFlags.forEach((entry) => {
            if (entry?.flag) categoryFlags.heatShield.add(entry.flag);
          });
        }
      }

      // Add HSS_Flag if it appears in the sequence
      if (sequenceFlags.includes("HSS_Flag")) {
        categoryFlags.heatShield.add("HSS_Flag");
      }

      // The categories in the order we want to add them
      const categoryOrder = [
        "initialization",
        "separation",
        "ignition",
        "burnout",
        "heatShield",
        "other",
      ];

      // Track actual categories added
      const addedCategories = [];

      // Create and append optgroups
      categoryOrder.forEach((category) => {
        const flags = categoryFlags[category];

        // Skip categories with no flags
        if (!flags || flags.size === 0) return;

        // Create optgroup
        const optgroup = document.createElement("optgroup");
        optgroup.label = categoryLabels[category];
        optgroup.dataset.groupType = category;

        // Sort flags
        const sortedFlags = Array.from(flags).sort((a, b) => {
          // Extract numbers if they exist
          const aNumbers = a.match(/\d+/g)?.map(Number) || [];
          const bNumbers = b.match(/\d+/g)?.map(Number) || [];

          // If both have stage numbers, compare them
          if (aNumbers.length > 0 && bNumbers.length > 0) {
            // Compare stage numbers first
            if (aNumbers[0] !== bNumbers[0]) {
              return aNumbers[0] - bNumbers[0];
            }
            // If stage numbers are same, compare motor numbers (if they exist)
            return (aNumbers[1] || 0) - (bNumbers[1] || 0);
          }

          // Fallback to string comparison if no numbers
          return a.localeCompare(b);
        });

        // Add options to group
        sortedFlags.forEach((flag) => {
          const option = document.createElement("option");
          option.value = flag;
          option.textContent = flag;
          optgroup.appendChild(option);
        });

        // Add the optgroup to the dropdown
        selectElement.appendChild(optgroup);
        addedCategories.push(categoryLabels[category]);
      });

      // Restore previous selection if possible
      if (currentValue) {
        selectElement.value = currentValue;
      }

      console.log(
        `Populated flag dropdown for ${context} with ${
          addedCategories.length
        } categories: ${addedCategories.join(", ")}`
      );
    } catch (error) {
      console.error(`Error populating flag dropdown for ${context}:`, error);
    }
  }

  // Function to add a new objective function form
  function addObjectiveFunctionForm() {
    if (objectiveCount >= MAX_OBJECTIVES) {
      Swal.fire({
        icon: "error",
        title: "Maximum Objectives Reached",
        text: `You can only add up to ${MAX_OBJECTIVES} objective functions.`,
        toast: false,
        confirmButtonText: "OK",
      });
      return;
    }

    objectiveCount++;
    const formIndex = objectiveCount; // Use count for unique IDs

    const formElement = document.createElement("div");
    formElement.classList.add("objective-function-instance", "form-card"); // Added form-card for styling
    formElement.setAttribute("data-index", formIndex);

    // Add a unique form-index class for potential distinct styling based on index
    formElement.classList.add(`objective-form-${formIndex}`);

    // Get options available *at this moment*
    const availableOptions = getAvailableObjectiveOptions();

    // Start with placeholder
    let nameOptionsHTML =
      '<option value="" disabled selected>Select Objective</option>';

    // Add special options first (if available)
    if (availableOptions["DUMMY"]) {
      nameOptionsHTML += `<option value="DUMMY">${availableOptions["DUMMY"]}</option>`;
    }
    if (availableOptions["PAYLOAD_MASS"]) {
      nameOptionsHTML += `<option value="PAYLOAD_MASS">${availableOptions["PAYLOAD_MASS"]}</option>`;
    }

    // Create sorted array for the rest of the options
    const sortedOptions = [];
    for (const key in availableOptions) {
      if (key !== "DUMMY" && key !== "PAYLOAD_MASS") {
        sortedOptions.push({
          value: key,
          text: availableOptions[key],
        });
      }
    }

    // Sort other options alphabetically
    sortedOptions.sort((a, b) => a.text.localeCompare(b.text));

    // Add sorted options
    sortedOptions.forEach((option) => {
      nameOptionsHTML += `<option value="${option.value}">${option.text}</option>`;
    });

    formElement.innerHTML = `
            <button type="button" class="remove-objective-btn remove-btn" title="Remove Objective">&times;</button>
            <h3 class="objective-heading">Objective Function ${formIndex}</h3>
            <div class="form-row">
                <div class="form-group">
                    <label for="objective-name-${formIndex}" class="label">Name:</label>
                    <select id="objective-name-${formIndex}" class="input-field objective-name-select">
                        ${nameOptionsHTML}
                    </select>
                </div>
                <div class="form-group">
                    <label for="objective-type-${formIndex}" class="label">Type:</label>
                    <input type="text" id="objective-type-${formIndex}" class="input-field" value="Objective" readonly>
                </div>
            </div>
            <div class="form-row">
                 <div class="form-group">
                    <label for="objective-flag-${formIndex}" class="label">Flag:</label>
                    <select id="objective-flag-${formIndex}" class="input-field objective-flag-select">
                         <option value="" disabled selected>Select Flag</option>
                         <!-- Options populated by JS -->
                    </select>
                </div>
                <div class="form-group">
                    <label for="objective-factor-${formIndex}" class="label">Factor:</label>
                    <select id="objective-factor-${formIndex}" class="input-field objective-factor-select">
                        <option value="" disabled selected>Select Factor</option>
                        <option value="+1">Minimize</option>
                        <option value="-1">Maximize</option>
                    </select>
                </div>
            </div>
        `;

    objectiveFunctionContainer.appendChild(formElement);

    // If not the first form, add a divider before this form
    if (objectiveCount > 1) {
      const divider = document.createElement("div");
      divider.className = "objective-divider";
      objectiveFunctionContainer.insertBefore(divider, formElement);
    }

    // Populate the flag dropdown for the new form
    const flagSelect = formElement.querySelector(
      `#objective-flag-${formIndex}`
    );
    populateFlagDropdown(flagSelect, `Objective ${formIndex}`);

    // Add event listener for the remove button
    formElement
      .querySelector(".remove-objective-btn")
      .addEventListener("click", () => {
        removeObjectiveFunctionForm(formElement);
      });
  }

  // Function to remove an objective function form
  function removeObjectiveFunctionForm(formElement) {
    // Also remove the divider if it exists
    const prevElement = formElement.previousElementSibling;
    if (prevElement && prevElement.classList.contains("objective-divider")) {
      objectiveFunctionContainer.removeChild(prevElement);
    }

    objectiveFunctionContainer.removeChild(formElement);
    objectiveCount--;
  }

  // Function to get objective function data
  function getObjectiveFunctionData() {
    const objectives = [];
    objectiveFunctionContainer
      .querySelectorAll(".objective-function-instance")
      .forEach((formInstance) => {
        const index = formInstance.getAttribute("data-index");
        const nameSelect = formInstance.querySelector(
          `#objective-name-${index}`
        );
        const flagSelect = formInstance.querySelector(
          `#objective-flag-${index}`
        );
        const factorSelect = formInstance.querySelector(
          `#objective-factor-${index}`
        );

        if (
          nameSelect &&
          nameSelect.value &&
          flagSelect &&
          flagSelect.value &&
          factorSelect &&
          factorSelect.value
        ) {
          objectives.push({
            name: nameSelect.value,
            value: "null",
            type: "OBJECTIVE",
            flag: flagSelect.value || null,
            factor: parseInt(factorSelect.value),
          });
        }
      });
    console.log("Collected Objectives:", objectives);
    return objectives;
  }

  // Helper function to remove items of a specific type from optimization array
  function removeItemsByType(optimizationArray, type) {
    if (!Array.isArray(optimizationArray)) return [];
    return optimizationArray.filter((item) => item.type !== type);
  }

  // Function to save optimization data
  function saveOptimizationData(section, data) {
    console.log(`Saving ${section} data:`, data);

    // Here you would normally save to backend or update in memory

    // Store data in finalMissionData if it exists
    if (window.finalMissionData) {
      // Transform data structure for optimization to match expected format
      if (section === "objectiveFunctions" || section === "constraints") {
        if (!window.finalMissionData.optimization) {
          window.finalMissionData.optimization = [];
        }

        // If we're handling constraints, extract tolerance values
        if (section === "constraints" && Array.isArray(data)) {
          // Extract tolerance values into a separate array
          const tolerances = data.map(
            (constraint) => constraint.tolerance || 0
          );

          // Remove tolerance property from constraints before adding to the optimization array
          const constraintsWithoutTolerance = data.map((constraint) => {
            const { tolerance, ...constraintData } = constraint;
            return constraintData;
          });

          // Update or create constraint_tolerence array
          window.finalMissionData.constraint_tolerence = tolerances;

          // Remove existing constraints before adding new ones
          window.finalMissionData.optimization = removeItemsByType(
            window.finalMissionData.optimization,
            "EQUALITY"
          );
          window.finalMissionData.optimization = removeItemsByType(
            window.finalMissionData.optimization,
            "INEQUALITY"
          );

          // Add constraints (without tolerance) to optimization array
          window.finalMissionData.optimization.push(
            ...constraintsWithoutTolerance
          );
        } else if (section === "objectiveFunctions" && Array.isArray(data)) {
          // Remove existing objective functions before adding new ones
          window.finalMissionData.optimization = removeItemsByType(
            window.finalMissionData.optimization,
            "OBJECTIVE"
          );

          // Add objective functions to optimization array
          window.finalMissionData.optimization.push(...data);
        }
      } else if (section === "designVariables") {
        // For design variables, transform to the required format and add to finalMissionData
        console.log("Processing design variables for final mission data", data);
        try {
          const transformedData = transformDesignVariablesForOutput(data);
          console.log("Transformed design variables data:", transformedData);

          // Add the transformed data directly to finalMissionData
          Object.keys(transformedData).forEach((key) => {
            window.finalMissionData[key] = transformedData[key];
            console.log(`Added ${key} to finalMissionData`);
          });

          console.log(
            `Updated finalMissionData with design variables data`,
            window.finalMissionData
          );
        } catch (error) {
          console.error(
            "Error transforming or saving design variables:",
            error
          );
        }
      } else {
        // For other sections, maintain original structure
        if (!window.finalMissionData.optimization) {
          window.finalMissionData.optimization = {};
        }
        window.finalMissionData.optimization[section] = data;
      }

      console.log(`Updated finalMissionData optimization data`);

      // Save to localStorage for persistence (optional)
      try {
        const missionData = JSON.parse(
          localStorage.getItem("missionData") || "{}"
        );

        // Apply same transformation for localStorage
        if (section === "objectiveFunctions" || section === "constraints") {
          if (!missionData.optimization) {
            missionData.optimization = [];
          }

          if (section === "constraints" && Array.isArray(data)) {
            const tolerances = data.map(
              (constraint) => constraint.tolerance || 0
            );
            const constraintsWithoutTolerance = data.map((constraint) => {
              const { tolerance, ...constraintData } = constraint;
              return constraintData;
            });

            missionData.constraint_tolerence = tolerances;

            // Remove existing constraints before adding new ones
            missionData.optimization = removeItemsByType(
              missionData.optimization,
              "EQUALITY"
            );
            missionData.optimization = removeItemsByType(
              missionData.optimization,
              "INEQUALITY"
            );

            missionData.optimization.push(...constraintsWithoutTolerance);
          } else if (section === "objectiveFunctions" && Array.isArray(data)) {
            // Remove existing objective functions before adding new ones
            missionData.optimization = removeItemsByType(
              missionData.optimization,
              "OBJECTIVE"
            );

            missionData.optimization.push(...data);
          }
        } else if (section === "designVariables") {
          // Transform design variables for localStorage too
          const transformedData = transformDesignVariablesForOutput(data);

          // Add the transformed data to localStorage mission data
          Object.keys(transformedData).forEach((key) => {
            missionData[key] = transformedData[key];
          });
        } else {
          if (!missionData.optimization) {
            missionData.optimization = {};
          }
          missionData.optimization[section] = data;
        }

        localStorage.setItem("missionData", JSON.stringify(missionData));
      } catch (error) {
        console.warn("Could not save to localStorage:", error);
      }
    }

    // Show success message using the toast instead of a popup
    if (
      window.FormValidator &&
      typeof window.FormValidator.showToastMessage === "function"
    ) {
      window.FormValidator.showToastMessage(
        "success",
        "Saved",
        `${section} data saved successfully!`
      );
    } else {
      // Fallback to SweetAlert directly
      Swal.fire({
        icon: "success",
        title: "Saved",
        text: `${section} data saved successfully!`,
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
      });
    }

    return data;
  }

  // =========================================
  // CONSTRAINT FUNCTIONS
  // =========================================

  // Function to populate constraint name dropdown
  function populateConstraintNameDropdown() {
    if (!constraintNameSelect) return;
    const currentValue = constraintNameSelect.value;
    while (constraintNameSelect.options.length > 1) {
      constraintNameSelect.remove(1);
    }

    // Create an array of options for sorting
    const options = [];
    for (const key in allConstraintOptions) {
      options.push({
        value: key,
        text: allConstraintOptions[key],
      });
    }

    // Sort options alphabetically by text
    options.sort((a, b) => a.text.localeCompare(b.text));

    // Add sorted options to dropdown
    options.forEach((option) => {
      const optionElement = document.createElement("option");
      optionElement.value = option.value;
      optionElement.textContent = option.text;
      constraintNameSelect.appendChild(optionElement);
    });

    constraintNameSelect.value = currentValue;
  }

  // Function to handle constraint name changes
  function handleConstraintNameChange(event) {
    const nameSelect = event.target;
    const instance = nameSelect.closest(".optimization-instance");
    if (!instance) return;

    const constraintType = nameSelect.value;
    const additionalFieldsContainer =
      instance.querySelector(".additional-fields");
    if (!additionalFieldsContainer) return;

    // Get the flag dropdown in this constraint instance
    const flagDropdown = instance.querySelector(".constraint-flag");

    // Check if this is a type that doesn't require a flag
    const noFlagTypes = [
      "Q",
      "MAX_QAOA",
      "ALPHA",
      "MAX_BODY_RATE",
      "MAX_HEAT_FLUX",
      "SLACK_VARIABLE",
      "MAX_SENSED_ACC",
      "CUSTOM",
      "DCISS_IMPACT",
    ];

    // Disable or enable the flag dropdown based on constraint type
    if (flagDropdown) {
      if (noFlagTypes.includes(constraintType)) {
        // Disable the flag dropdown for these types
        flagDropdown.disabled = true;
        flagDropdown.title = "Flag not required for this constraint type";
        flagDropdown.value = "";
        flagDropdown.parentElement.classList.add("disabled-field");
      } else {
        // Enable the flag dropdown for other types
        flagDropdown.disabled = false;
        flagDropdown.title = "";
        flagDropdown.parentElement.classList.remove("disabled-field");
      }
    }

    // Get the value input field in this constraint instance
    const valueInput = instance.querySelector(".constraint-value");

    // Check if this is a type that doesn't require a value field
    const noValueTypes = ["CUSTOM", "DCISS_IMPACT"];

    // Disable or enable the value input field based on constraint type
    if (valueInput) {
      if (noValueTypes.includes(constraintType)) {
        // Disable the value input for these types
        valueInput.disabled = true;
        valueInput.title = "Value not required for this constraint type";
        valueInput.value = "";
        valueInput.parentElement.classList.add("disabled-field");
      } else {
        // Enable the value input for other types
        valueInput.disabled = false;
        valueInput.title = "";
        valueInput.parentElement.classList.remove("disabled-field");
      }
    }

    // Clear existing fields
    additionalFieldsContainer.innerHTML = "";

    // Add fields based on constraint type
    if (
      [
        "SEMI_MAJOR_AXIS",
        "ANGULAR_MOMENTUM",
        "ECCENTRICITY",
        "INCLINATION",
        "TRUE_ANOMALY",
        "ECCENTRIC_ANOMALY",
        "RAAN",
        "AOP",
        "PERIGEE_GC_LATITUDE",
        "PERIGEE_GC",
        "APOGEE_GC",
        "PERIGEE",
        "APOGEE",
      ].includes(constraintType)
    ) {
      // These are orbit-related constraints with basic fields
      // No additional fields needed as the common fields are already in the form
      // (name, value, type, condition, flag, factor are part of the base form)
    } else if (constraintType === "STAGE_IMPACT") {
      additionalFieldsContainer.innerHTML = `
        <div class="form-row">
          <div class="form-group">
            <label class="label">Coordinate:</label>
            <select class="input-field constraint-coordinate">
              <option value="" disabled selected>Select Coordinate</option>
              <option value="Latitude">Latitude</option>
              <option value="Longitude">Longitude</option>
            </select>
          </div>
        </div>
      `;
    } else if (
      [
        "Q",
        "MAX_QAOA",
        "ALPHA",
        "MAX_BODY_RATE",
        "MAX_HEAT_FLUX",
        "SLACK_VARIABLE",
        "MAX_SENSED_ACC",
      ].includes(constraintType)
    ) {
      additionalFieldsContainer.innerHTML = `
        <div class="form-row">
          <div class="form-group">
            <label class="label">Trigger:</label>
            <select class="input-field constraint-trigger">
              <option value="" disabled selected>Select Trigger</option>
              <option value="FLAG">Flag</option>
              <option value="MISSION_TIME">Mission Time</option>
            </select>
          </div>
        </div>
        <div class="flag-time-range">
          <!-- Range fields will be added dynamically based on trigger selection -->
        </div>
      `;

      // Add listener for trigger changes
      const triggerSelect = additionalFieldsContainer.querySelector(
        ".constraint-trigger"
      );
      if (triggerSelect) {
        triggerSelect.addEventListener("change", (e) =>
          handleTriggerChange(e, instance)
        );
      }
    } else if (constraintType === "CUSTOM") {
      additionalFieldsContainer.innerHTML = `
        <div class="form-row">
          <div class="form-group">
            <label class="label">Initial Time (ti):</label>
            <input type="number" step="any" class="input-field constraint-ti" placeholder="Enter initial time">
          </div>
          <div class="form-group">
            <label class="label">Final Time (tf):</label>
            <input type="number" step="any" class="input-field constraint-tf" placeholder="Enter final time">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="label">Time Point:</label>
            <input type="number" step="any" class="input-field constraint-time-point" placeholder="Enter time point">
          </div>
          <div class="form-group">
            <label class="label">Input:</label>
            <select class="input-field constraint-custom-input">
              <option value="" disabled selected>Select Input</option>
              <option value="IIP">IIP</option>
              <option value="GROUND_TRACE">GROUND_TRACE</option>
            </select>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label class="label">Constraint Type:</label>
            <select class="input-field constraint-dciss-type">
              <option value="" disabled selected>Select Constraint Type</option>
              <option value="Line">Line</option>
              <option value="Ellipse">Ellipse</option>
              <option value="Box">Box</option>
            </select>
          </div>
        </div>
        <div class="dciss-parameters-container">
          <!-- Constraint type specific fields will be added here -->
        </div>
      `;

      // Add listener for Constraint type changes (just like in DCISS_IMPACT)
      const dcissTypeSelect = additionalFieldsContainer.querySelector(
        ".constraint-dciss-type"
      );
      if (dcissTypeSelect) {
        dcissTypeSelect.addEventListener("change", (e) =>
          handleDcissTypeChange(e, instance)
        );
      }
    } else if (constraintType === "DCISS_IMPACT") {
      additionalFieldsContainer.innerHTML = `
        <div class="form-row">
          <div class="form-group">
            <label class="label">DCISS Type:</label>
            <select class="input-field constraint-dciss-type">
              <option value="" disabled selected>Select DCISS Type</option>
              <option value="Line">Line</option>
              <option value="Ellipse">Ellipse</option>
              <option value="Box">Box</option>
            </select>
          </div>
        </div>
        <div class="dciss-parameters-container">
          <!-- DCISS type specific fields will be added here -->
        </div>
      `;

      // Add listener for DCISS type changes
      const dcissTypeSelect = additionalFieldsContainer.querySelector(
        ".constraint-dciss-type"
      );
      if (dcissTypeSelect) {
        dcissTypeSelect.addEventListener("change", (e) =>
          handleDcissTypeChange(e, instance)
        );
      }
    }
  }

  // Function to handle trigger changes for Q/QAOA group constraints
  function handleTriggerChange(event, instance) {
    const triggerSelect = event.target;
    const rangeContainer = instance.querySelector(".flag-time-range");
    if (!rangeContainer) return;

    const triggerType = triggerSelect.value;
    if (triggerType === "FLAG") {
      rangeContainer.innerHTML = `
        <div class="form-row">
          <div class="form-group">
            <label class="label">From Flag:</label>
            <select class="input-field constraint-flag-from">
              <option value="" disabled selected>Select From Flag</option>
              <!-- Flags will be populated by JS -->
            </select>
          </div>
          <div class="form-group">
            <label class="label">To Flag:</label>
            <select class="input-field constraint-flag-to">
              <option value="" disabled selected>Select To Flag</option>
              <!-- Flags will be populated by JS -->
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="label">From Offset (s):</label>
            <input type="number" step="any" class="input-field constraint-from-offset" value="0">
          </div>
          <div class="form-group">
            <label class="label">To Offset (s):</label>
            <input type="number" step="any" class="input-field constraint-to-offset" value="0">
          </div>
        </div>
      `;

      // Populate flag dropdowns
      populateFlagDropdown(
        rangeContainer.querySelector(".constraint-flag-from"),
        "Constraint From"
      );
      populateFlagDropdown(
        rangeContainer.querySelector(".constraint-flag-to"),
        "Constraint To"
      );
    } else if (triggerType === "MISSION_TIME") {
      rangeContainer.innerHTML = `
        <div class="form-row">
          <div class="form-group">
            <label class="label">From Time (s):</label>
            <input type="number" step="any" class="input-field constraint-time-from" value="0">
          </div>
          <div class="form-group">
            <label class="label">To Time (s):</label>
            <input type="number" step="any" class="input-field constraint-time-to" value="0">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="label">From Offset (s):</label>
            <input type="number" step="any" class="input-field constraint-from-offset" value="0">
          </div>
          <div class="form-group">
            <label class="label">To Offset (s):</label>
            <input type="number" step="any" class="input-field constraint-to-offset" value="0">
          </div>
        </div>
      `;
    }
  }

  // Function to handle DCISS type changes
  function handleDcissTypeChange(event, instance) {
    const dcissTypeSelect = event.target;
    const parametersContainer = instance.querySelector(
      ".dciss-parameters-container"
    );
    if (!parametersContainer) return;

    const dcissType = dcissTypeSelect.value;
    if (dcissType === "Line") {
      parametersContainer.innerHTML = `
        <div class="form-row">
          <div class="form-group">
            <label class="label">Position:</label>
            <select class="input-field constraint-dciss-position">
              <option value="" disabled selected>Select Position</option>
              <option value="above">Above</option>
              <option value="below">Below</option>
            </select>
          </div>
        </div>
        <input type="hidden" class="constraint-dciss-line-bounds">
        <div class="map-placeholder"><small>A map will appear here to select coordinates</small></div>
      `;
    } else if (dcissType === "Ellipse") {
      parametersContainer.innerHTML = `
        <div class="form-row">
          <div class="form-group">
            <label class="label">Semi Major:</label>
            <input type="number" step="any" class="input-field constraint-dciss-semi-major" placeholder="Enter semi major">
            <small class="input-help">The semi-major axis of the ellipse (in meters)</small>
          </div>
          <div class="form-group">
            <label class="label">Semi Minor:</label>
            <input type="number" step="any" class="input-field constraint-dciss-semi-minor" placeholder="Enter semi minor">
            <small class="input-help">The semi-minor axis of the ellipse (in meters)</small>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group full-width">
            <label class="label">Center:</label>
            <input type="text" class="input-field constraint-dciss-center" placeholder="Enter center coordinates as latitude, longitude">
            <small class="input-help">Simply enter values separated by comma - Example: 28.574, 77.312</small>
          </div>
        </div>
      `;
    } else if (dcissType === "Box") {
      parametersContainer.innerHTML = `
        <input type="hidden" class="constraint-dciss-line-bound">
        <div class="map-placeholder"><small>A map will appear here to select coordinates</small></div>
      `;
    }
  }

  // Function to add a new constraint instance
  function addConstraintInstance() {
    const template = document.getElementById("constraint-template");
    if (!template || !constraintsContainer) {
      console.error(
        "Required elements not found for adding constraint instance"
      );
      return;
    }

    // Use a global counter for unique identification
    window.constraintCounter = window.constraintCounter || 0;
    window.constraintCounter++;

    const newInstance = template.cloneNode(true);
    newInstance.id = `constraint-instance-${window.constraintCounter}`;
    newInstance.classList.remove("hidden-template");
    newInstance.classList.add("optimization-instance"); // Make sure this class is added
    newInstance.setAttribute("data-index", window.constraintCounter);

    // Add a unique constraint-index class for distinct styling based on index
    // Use modulo to cycle through 6 different colors
    const colorIndex = window.constraintCounter % 6 || 6;
    newInstance.classList.add(`constraint-form-${colorIndex}`);

    // Apply the color directly with inline style as a backup
    const borderColors = {
      1: "#4a90e2", // Blue
      2: "#50e3c2", // Teal
      3: "#e6a545", // Orange
      4: "#bd10e0", // Purple
      5: "#e3506f", // Pink
      6: "#67c23a", // Green
    };
    newInstance.style.borderLeft = `4px solid ${borderColors[colorIndex]}`;

    // Update title
    const titleSpan = newInstance.querySelector(".instance-title span");
    if (titleSpan) {
      titleSpan.textContent = window.constraintCounter;
    }

    // Also update the heading to be more prominent
    const heading = newInstance.querySelector(".instance-title");
    if (heading) {
      heading.classList.add("constraint-heading");
    }

    // Update enable toggle IDs to be unique
    const enableToggle = newInstance.querySelector(".constraint-enable");
    if (enableToggle) {
      enableToggle.id = `constraint-enable-${window.constraintCounter}`;
    }

    // Update the label's for attribute to match the toggle ID
    const toggleLabel = newInstance.querySelector(".toggle-slider");
    if (toggleLabel) {
      toggleLabel.setAttribute(
        "for",
        `constraint-enable-${window.constraintCounter}`
      );
    }

    // Setup constraint name select change handler
    const constraintNameSelect = newInstance.querySelector(".constraint-name");
    if (constraintNameSelect) {
      constraintNameSelect.addEventListener(
        "change",
        handleConstraintNameChange
      );
    }

    // Setup constraint type change handler
    const constraintTypeSelect = newInstance.querySelector(".constraint-type");
    if (constraintTypeSelect) {
      constraintTypeSelect.addEventListener("change", function () {
        const conditionField = newInstance.querySelector(
          ".constraint-condition"
        );
        if (conditionField) {
          toggleConditionBasedOnType(this, conditionField);
        }
      });
    }

    // Setup delete button
    const deleteBtn = newInstance.querySelector(".delete-instance-btn");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", function () {
        // Remove this instance
        newInstance.remove();
        // Renumber remaining instances
        renumberConstraints();
      });
    }

    // Make sure we create a container for additional fields
    let additionalFieldsContainer =
      newInstance.querySelector(".additional-fields");
    if (!additionalFieldsContainer) {
      additionalFieldsContainer = document.createElement("div");
      additionalFieldsContainer.classList.add("additional-fields");
      newInstance.appendChild(additionalFieldsContainer);
    }

    // Add the instance to the container
    constraintsContainer.appendChild(newInstance);

    // Populate the constraint name dropdown for this instance
    if (constraintNameSelect) {
      // Clear dropdown except placeholder
      while (constraintNameSelect.options.length > 1) {
        constraintNameSelect.remove(1);
      }

      // Create an array of options for sorting
      const options = [];
      for (const key in allConstraintOptions) {
        options.push({
          value: key,
          text: allConstraintOptions[key],
        });
      }

      // Sort options alphabetically by text
      options.sort((a, b) => a.text.localeCompare(b.text));

      // Add sorted options to dropdown
      options.forEach((option) => {
        const optionElement = document.createElement("option");
        optionElement.value = option.value;
        optionElement.textContent = option.text;
        constraintNameSelect.appendChild(optionElement);
      });
    }

    // Populate the flag dropdown for this instance
    const flagSelect = newInstance.querySelector(".constraint-flag");
    if (flagSelect) {
      populateFlagDropdown(flagSelect, "Constraint");
    }

    return newInstance.appendChild(additionalFieldsContainer);
  }

  // Function to toggle condition dropdown based on type selection
  function toggleConditionBasedOnType(typeSelect, conditionField) {
    if (typeSelect.value === "EQUALITY") {
      // For EQUALITY, disable condition selection
      conditionField.value = "";
      conditionField.disabled = true;
      conditionField.parentElement.classList.add("disabled-field");
    } else {
      // For INEQUALITY, enable condition selection
      conditionField.disabled = false;
      conditionField.parentElement.classList.remove("disabled-field");
    }
  }

  // Function to renumber constraints after deletion
  function renumberConstraints() {
    const instances = constraintsContainer.querySelectorAll(
      ".optimization-instance:not(.hidden-template)"
    );
    instances.forEach((instance, index) => {
      const titleSpan = instance.querySelector(".instance-title span");
      if (titleSpan) {
        titleSpan.textContent = index + 1;
      }
      instance.setAttribute("data-index", index + 1);
    });
  }

  // Function to populate all constraint name dropdowns
  function populateAllConstraintNameDropdowns() {
    const nameSelects = document.querySelectorAll(".constraint-name");
    console.log(`Populating ${nameSelects.length} constraint name dropdowns`);

    // Create an array of options for sorting
    const options = [];
    for (const key in allConstraintOptions) {
      options.push({
        value: key,
        text: allConstraintOptions[key],
      });
    }

    // Sort options alphabetically by text
    options.sort((a, b) => a.text.localeCompare(b.text));

    nameSelects.forEach((select) => {
      // Save current value
      const currentValue = select.value;

      // Clear dropdown except placeholder
      while (select.options.length > 1) {
        select.remove(1);
      }

      // Add sorted options to dropdown
      options.forEach((option) => {
        const optionElement = document.createElement("option");
        optionElement.value = option.value;
        optionElement.textContent = option.text;
        select.appendChild(optionElement);
      });

      // Restore value if possible
      if (currentValue) {
        select.value = currentValue;
      }
    });
  }

  // Function to get constraints data
  function getConstraintsData() {
    const constraintsData = [];
    const constraintInstances = document.querySelectorAll(
      "#constraints-container .optimization-instance:not(.hidden-template)"
    );

    constraintInstances.forEach((instance) => {
      const index = instance.getAttribute("data-index");
      const nameSelect = instance.querySelector(".constraint-name");
      const valueInput = instance.querySelector(".constraint-value");
      const typeSelect = instance.querySelector(".constraint-type");
      const conditionSelect = instance.querySelector(".constraint-condition");
      const flagSelect = instance.querySelector(".constraint-flag");
      const toleranceInput = instance.querySelector(".constraint-tolerance");
      const enableToggle = instance.querySelector(".constraint-enable");

      if (nameSelect && nameSelect.value) {
        const constraintType = nameSelect.value;
        const constraint = {
          name: constraintType,
          type: typeSelect ? typeSelect.value : null,
          condition: conditionSelect ? conditionSelect.value : null,
          flag: flagSelect ? flagSelect.value || null : null,
          tolerance: toleranceInput ? parseFloat(toleranceInput.value) : null,
          enable: enableToggle ? enableToggle.checked : true,
          factor: 1, // Always 1 as per requirements - kept in data model but hidden in UI
        };

        // Only add value field for constraint types that need it
        if (!["CUSTOM", "DCISS_IMPACT"].includes(constraintType)) {
          constraint.value = valueInput ? parseFloat(valueInput.value) : null;
        }

        // Handle specific constraint types
        if (
          [
            "SEMI_MAJOR_AXIS",
            "ANGULAR_MOMENTUM",
            "ECCENTRICITY",
            "INCLINATION",
            "TRUE_ANOMALY",
            "ECCENTRIC_ANOMALY",
            "RAAN",
            "AOP",
            "PERIGEE_GC_LATITUDE",
            "PERIGEE_GC",
            "APOGEE_GC",
            "PERIGEE",
            "APOGEE",
          ].includes(constraintType)
        ) {
          // These constraints use the standard fields already set above
        } else if (constraintType === "STAGE_IMPACT") {
          const coordinateSelect = instance.querySelector(
            ".constraint-coordinate"
          );
          if (coordinateSelect) {
            constraint.coordinate = coordinateSelect.value;
          }
        } else if (
          [
            "Q",
            "MAX_QAOA",
            "ALPHA",
            "MAX_BODY_RATE",
            "MAX_HEAT_FLUX",
            "SLACK_VARIABLE",
            "MAX_SENSED_ACC",
          ].includes(constraintType)
        ) {
          const triggerSelect = instance.querySelector(".constraint-trigger");
          if (triggerSelect) {
            constraint.trigger = triggerSelect.value;

            if (triggerSelect.value === "FLAG") {
              const fromSelect = instance.querySelector(
                ".constraint-flag-from"
              );
              const toSelect = instance.querySelector(".constraint-flag-to");
              constraint.from = fromSelect ? fromSelect.value : null;
              constraint.to = toSelect ? toSelect.value : null;
            } else if (triggerSelect.value === "MISSION_TIME") {
              const fromInput = instance.querySelector(".constraint-time-from");
              const toInput = instance.querySelector(".constraint-time-to");
              constraint.from = fromInput ? parseFloat(fromInput.value) : 0;
              constraint.to = toInput ? parseFloat(toInput.value) : 0;
            }

            const fromOffsetInput = instance.querySelector(
              ".constraint-from-offset"
            );
            const toOffsetInput = instance.querySelector(
              ".constraint-to-offset"
            );
            constraint.from_offset = fromOffsetInput
              ? parseFloat(fromOffsetInput.value)
              : 0;
            constraint.to_offset = toOffsetInput
              ? parseFloat(toOffsetInput.value)
              : 0;
          }
        } else if (constraintType === "CUSTOM") {
          const tiInput = instance.querySelector(".constraint-ti");
          const tfInput = instance.querySelector(".constraint-tf");
          const timePointInput = instance.querySelector(
            ".constraint-time-point"
          );
          const inputSelect = instance.querySelector(
            ".constraint-custom-input"
          );
          const positionInput = instance.querySelector(".constraint-position");
          const dcissTypeSelect = instance.querySelector(
            ".constraint-dciss-type"
          );

          if (tiInput) constraint.ti = parseFloat(tiInput.value);
          if (tfInput) constraint.tf = parseFloat(tfInput.value);
          if (timePointInput)
            constraint.time_point = parseFloat(timePointInput.value);
          if (inputSelect) constraint.input = inputSelect.value;
          if (positionInput) constraint.Position = positionInput.value;

          // Handle Constraint Type parameters (similar to DCISS_IMPACT)
          if (dcissTypeSelect && dcissTypeSelect.value) {
            // Add Parameters if they don't exist yet
            if (!constraint.Parameters) {
              constraint.Parameters = {};
            }

            // Set constraint type
            constraint.Parameters.constraint = dcissTypeSelect.value;

            if (dcissTypeSelect.value === "Line") {
              const positionInput = instance.querySelector(
                ".constraint-dciss-position"
              );
              const lineBoundsInput = instance.querySelector(
                ".constraint-dciss-line-bounds"
              );

              if (positionInput)
                constraint.Parameters.Position = positionInput.value;
              if (lineBoundsInput) {
                try {
                  // Try to parse as JSON first
                  const lineBoundsText = lineBoundsInput.value.trim();

                  // Check if this is the new segment format (object with l1, l2, l3)
                  if (
                    lineBoundsText.startsWith("{") &&
                    lineBoundsText.endsWith("}")
                  ) {
                    // Parse the segmented coordinates
                    const segmentedCoords = JSON.parse(lineBoundsText);

                    // Create line_bounds object with each segment
                    constraint.Parameters.line_bounds = {};

                    // Process each segment, swapping lat/lon order
                    Object.entries(segmentedCoords).forEach(
                      ([segmentKey, coordsArray]) => {
                        if (Array.isArray(coordsArray)) {
                          // Swap the order of latitude and longitude for Astra C format (from [lat, lon] to [lon, lat])
                          const swappedCoords = coordsArray.map((point) => [
                            point[1],
                            point[0],
                          ]);
                          constraint.Parameters.line_bounds[segmentKey] =
                            swappedCoords;
                        }
                      }
                    );
                  }
                  // Old format: array of coordinates
                  else if (
                    lineBoundsText.startsWith("[") &&
                    lineBoundsText.endsWith("]")
                  ) {
                    // Parse the lineBounds array
                    const coordsArray = JSON.parse(lineBoundsText);

                    // Handle array of arrays (group by pairs into segments)
                    if (
                      coordsArray.length > 0 &&
                      Array.isArray(coordsArray[0])
                    ) {
                      // Ensure all coordinates are processed as pairs for different segments
                      constraint.Parameters.line_bounds = {};

                      // If there are 2 coordinates, put them in l1
                      if (coordsArray.length === 2) {
                        // Swap the order of latitude and longitude
                        const swappedCoords = coordsArray.map((point) => [
                          point[1],
                          point[0],
                        ]);
                        constraint.Parameters.line_bounds.l1 = swappedCoords;
                      }
                      // If more than 2, group in pairs into l1, l2, l3, etc.
                      else if (coordsArray.length > 2) {
                        for (let i = 0; i < coordsArray.length - 1; i += 2) {
                          if (i + 1 < coordsArray.length) {
                            const segmentKey = `l${Math.floor(i / 2) + 1}`;
                            const segmentCoords = [
                              coordsArray[i],
                              coordsArray[i + 1],
                            ];

                            // Swap the order of latitude and longitude
                            const swappedCoords = segmentCoords.map((point) => [
                              point[1],
                              point[0],
                            ]);
                            constraint.Parameters.line_bounds[segmentKey] =
                              swappedCoords;
                          }
                        }
                      }
                    } else {
                      constraint.Parameters.line_bounds = {
                        l1: lineBoundsText,
                      };
                    }
                  } else {
                    constraint.Parameters.line_bounds = {
                      l1: lineBoundsText,
                    };
                  }
                } catch (e) {
                  console.warn("Could not parse line bounds as JSON:", e);
                  constraint.Parameters.line_bounds = {
                    l1: lineBoundsInput.value,
                  };
                }
              }
            } else if (dcissTypeSelect.value === "Ellipse") {
              const semiMajorInput = instance.querySelector(
                ".constraint-dciss-semi-major"
              );
              const semiMinorInput = instance.querySelector(
                ".constraint-dciss-semi-minor"
              );
              const centerInput = instance.querySelector(
                ".constraint-dciss-center"
              );

              if (semiMajorInput)
                constraint.Parameters.SemiMajor = parseFloat(
                  semiMajorInput.value
                );
              if (semiMinorInput)
                constraint.Parameters.SemiMinor = parseFloat(
                  semiMinorInput.value
                );
              if (centerInput && centerInput.value.trim()) {
                try {
                  const centerText = centerInput.value.trim();

                  // Check if it's already in array format
                  if (centerText.startsWith("[") && centerText.endsWith("]")) {
                    const centerCoords = JSON.parse(centerText);
                    // Swap the order if it's a coordinate pair [lat, lon] to [lon, lat]
                    if (
                      Array.isArray(centerCoords) &&
                      centerCoords.length === 2
                    ) {
                      constraint.Parameters.Center = [
                        centerCoords[1],
                        centerCoords[0],
                      ];
                    } else {
                      constraint.Parameters.Center = centerCoords;
                    }
                  } else {
                    // Parse comma-separated values
                    const parts = centerText
                      .split(",")
                      .map((part) => parseFloat(part.trim()));

                    // If we have two valid numbers, use them as coordinates
                    if (
                      parts.length === 2 &&
                      !isNaN(parts[0]) &&
                      !isNaN(parts[1])
                    ) {
                      // Swap the order for Astra C format [lat, lon] to [lon, lat]
                      constraint.Parameters.Center = [parts[1], parts[0]];
                    } else {
                      // Fall back to original text if parsing fails
                      console.warn(
                        "Could not parse center coordinates from:",
                        centerText
                      );
                      constraint.Parameters.Center = centerText;
                    }
                  }
                } catch (e) {
                  console.warn("Error parsing center coordinates:", e);
                  constraint.Parameters.Center = centerInput.value;
                }
              }
            } else if (dcissTypeSelect.value === "Box") {
              const lineBoundInput = instance.querySelector(
                ".constraint-dciss-line-bound"
              );
              if (lineBoundInput) {
                try {
                  // Try to parse as JSON
                  const lineBoundText = lineBoundInput.value.trim();

                  // Check if this is segmented format (with l1, l2, l3...)
                  if (
                    lineBoundText.startsWith("{") &&
                    lineBoundText.endsWith("}")
                  ) {
                    // Parse the segmented coordinates
                    const segmentedCoords = JSON.parse(lineBoundText);

                    // Extract all coordinates from all segments into a flat array
                    const allCoordinates = [];
                    Object.entries(segmentedCoords).forEach(
                      ([segmentKey, coordsArray]) => {
                        if (Array.isArray(coordsArray)) {
                          // Add each coordinate pair to the array, swapping lat/lon to lon/lat
                          coordsArray.forEach((point) => {
                            if (Array.isArray(point) && point.length === 2) {
                              allCoordinates.push([point[1], point[0]]);
                            }
                          });
                        }
                      }
                    );

                    // Use the flat array of coordinates for the Box
                    constraint.Parameters.Line_Bound = allCoordinates;
                  }
                  // Standard array format
                  else if (
                    lineBoundText.startsWith("[") &&
                    lineBoundText.endsWith("]")
                  ) {
                    // Parse the coordinate array
                    const coordsArray = JSON.parse(lineBoundText);

                    // If this is a nested array with coordinate pairs, swap lat/long in each pair
                    if (
                      Array.isArray(coordsArray) &&
                      coordsArray.some((item) => Array.isArray(item))
                    ) {
                      const swappedCoords = coordsArray.map((point) => {
                        if (Array.isArray(point) && point.length === 2) {
                          return [point[1], point[0]]; // Swap lat/long to long/lat
                        }
                        return point;
                      });
                      constraint.Parameters.Line_Bound = swappedCoords;
                    } else {
                      constraint.Parameters.Line_Bound = coordsArray;
                    }
                  } else {
                    constraint.Parameters.Line_Bound = lineBoundText;
                  }
                } catch (e) {
                  console.warn("Could not parse line bound as JSON:", e);
                  constraint.Parameters.Line_Bound = lineBoundInput.value;
                }
              }
            }
          }
        } else if (constraintType === "DCISS_IMPACT") {
          const dcissTypeSelect = instance.querySelector(
            ".constraint-dciss-type"
          );
          if (dcissTypeSelect) {
            constraint.Parameters = {
              constraint: dcissTypeSelect.value,
            };

            if (dcissTypeSelect.value === "Line") {
              const positionInput = instance.querySelector(
                ".constraint-dciss-position"
              );
              const lineBoundsInput = instance.querySelector(
                ".constraint-dciss-line-bounds"
              );

              if (positionInput)
                constraint.Parameters.Position = positionInput.value;
              if (lineBoundsInput) {
                try {
                  // Try to parse as JSON first
                  const lineBoundsText = lineBoundsInput.value.trim();

                  // Check if this is the new segment format (object with l1, l2, l3)
                  if (
                    lineBoundsText.startsWith("{") &&
                    lineBoundsText.endsWith("}")
                  ) {
                    // Parse the segmented coordinates
                    const segmentedCoords = JSON.parse(lineBoundsText);

                    // Create line_bounds object with each segment
                    constraint.Parameters.line_bounds = {};

                    // Process each segment, swapping lat/lon order
                    Object.entries(segmentedCoords).forEach(
                      ([segmentKey, coordsArray]) => {
                        if (Array.isArray(coordsArray)) {
                          // Swap the order of latitude and longitude for Astra C format (from [lat, lon] to [lon, lat])
                          const swappedCoords = coordsArray.map((point) => [
                            point[1],
                            point[0],
                          ]);
                          constraint.Parameters.line_bounds[segmentKey] =
                            swappedCoords;
                        }
                      }
                    );
                  }
                  // Old format: array of coordinates
                  else if (
                    lineBoundsText.startsWith("[") &&
                    lineBoundsText.endsWith("]")
                  ) {
                    // Parse the lineBounds array
                    const coordsArray = JSON.parse(lineBoundsText);

                    // Handle array of arrays (group by pairs into segments)
                    if (
                      coordsArray.length > 0 &&
                      Array.isArray(coordsArray[0])
                    ) {
                      // Ensure all coordinates are processed as pairs for different segments
                      constraint.Parameters.line_bounds = {};

                      // If there are 2 coordinates, put them in l1
                      if (coordsArray.length === 2) {
                        // Swap the order of latitude and longitude
                        const swappedCoords = coordsArray.map((point) => [
                          point[1],
                          point[0],
                        ]);
                        constraint.Parameters.line_bounds.l1 = swappedCoords;
                      }
                      // If more than 2, group in pairs into l1, l2, l3, etc.
                      else if (coordsArray.length > 2) {
                        for (let i = 0; i < coordsArray.length - 1; i += 2) {
                          if (i + 1 < coordsArray.length) {
                            const segmentKey = `l${Math.floor(i / 2) + 1}`;
                            const segmentCoords = [
                              coordsArray[i],
                              coordsArray[i + 1],
                            ];

                            // Swap the order of latitude and longitude
                            const swappedCoords = segmentCoords.map((point) => [
                              point[1],
                              point[0],
                            ]);
                            constraint.Parameters.line_bounds[segmentKey] =
                              swappedCoords;
                          }
                        }
                      }
                    } else {
                      constraint.Parameters.line_bounds = {
                        l1: lineBoundsText,
                      };
                    }
                  } else {
                    constraint.Parameters.line_bounds = {
                      l1: lineBoundsText,
                    };
                  }
                } catch (e) {
                  console.warn("Could not parse line bounds as JSON:", e);
                  constraint.Parameters.line_bounds = {
                    l1: lineBoundsInput.value,
                  };
                }
              }
            } else if (dcissTypeSelect.value === "Ellipse") {
              const semiMajorInput = instance.querySelector(
                ".constraint-dciss-semi-major"
              );
              const semiMinorInput = instance.querySelector(
                ".constraint-dciss-semi-minor"
              );
              const centerInput = instance.querySelector(
                ".constraint-dciss-center"
              );

              if (semiMajorInput)
                constraint.Parameters.SemiMajor = parseFloat(
                  semiMajorInput.value
                );
              if (semiMinorInput)
                constraint.Parameters.SemiMinor = parseFloat(
                  semiMinorInput.value
                );
              if (centerInput && centerInput.value.trim()) {
                try {
                  const centerText = centerInput.value.trim();

                  // Check if it's already in array format
                  if (centerText.startsWith("[") && centerText.endsWith("]")) {
                    const centerCoords = JSON.parse(centerText);
                    // Swap the order if it's a coordinate pair [lat, lon] to [lon, lat]
                    if (
                      Array.isArray(centerCoords) &&
                      centerCoords.length === 2
                    ) {
                      constraint.Parameters.Center = [
                        centerCoords[1],
                        centerCoords[0],
                      ];
                    } else {
                      constraint.Parameters.Center = centerCoords;
                    }
                  } else {
                    // Parse comma-separated values
                    const parts = centerText
                      .split(",")
                      .map((part) => parseFloat(part.trim()));

                    // If we have two valid numbers, use them as coordinates
                    if (
                      parts.length === 2 &&
                      !isNaN(parts[0]) &&
                      !isNaN(parts[1])
                    ) {
                      // Swap the order for Astra C format [lat, lon] to [lon, lat]
                      constraint.Parameters.Center = [parts[1], parts[0]];
                    } else {
                      // Fall back to original text if parsing fails
                      console.warn(
                        "Could not parse center coordinates from:",
                        centerText
                      );
                      constraint.Parameters.Center = centerText;
                    }
                  }
                } catch (e) {
                  console.warn("Error parsing center coordinates:", e);
                  constraint.Parameters.Center = centerInput.value;
                }
              }
            } else if (dcissTypeSelect.value === "Box") {
              const lineBoundInput = instance.querySelector(
                ".constraint-dciss-line-bound"
              );
              if (lineBoundInput) {
                try {
                  // Try to parse as JSON
                  const lineBoundText = lineBoundInput.value.trim();

                  // Check if this is segmented format (with l1, l2, l3...)
                  if (
                    lineBoundText.startsWith("{") &&
                    lineBoundText.endsWith("}")
                  ) {
                    // Parse the segmented coordinates
                    const segmentedCoords = JSON.parse(lineBoundText);

                    // Extract all coordinates from all segments into a flat array
                    const allCoordinates = [];
                    Object.entries(segmentedCoords).forEach(
                      ([segmentKey, coordsArray]) => {
                        if (Array.isArray(coordsArray)) {
                          // Add each coordinate pair to the array, swapping lat/lon to lon/lat
                          coordsArray.forEach((point) => {
                            if (Array.isArray(point) && point.length === 2) {
                              allCoordinates.push([point[1], point[0]]);
                            }
                          });
                        }
                      }
                    );

                    // Use the flat array of coordinates for the Box
                    constraint.Parameters.Line_Bound = allCoordinates;
                  }
                  // Standard array format
                  else if (
                    lineBoundText.startsWith("[") &&
                    lineBoundText.endsWith("]")
                  ) {
                    // Parse the coordinate array
                    const coordsArray = JSON.parse(lineBoundText);

                    // If this is a nested array with coordinate pairs, swap lat/long in each pair
                    if (
                      Array.isArray(coordsArray) &&
                      coordsArray.some((item) => Array.isArray(item))
                    ) {
                      const swappedCoords = coordsArray.map((point) => {
                        if (Array.isArray(point) && point.length === 2) {
                          return [point[1], point[0]]; // Swap lat/long to long/lat
                        }
                        return point;
                      });
                      constraint.Parameters.Line_Bound = swappedCoords;
                    } else {
                      constraint.Parameters.Line_Bound = coordsArray;
                    }
                  } else {
                    constraint.Parameters.Line_Bound = lineBoundText;
                  }
                } catch (e) {
                  console.warn("Could not parse line bound as JSON:", e);
                  constraint.Parameters.Line_Bound = lineBoundInput.value;
                }
              }
            }
          }
        }

        constraintsData.push(constraint);
      }
    });

    console.log("Collected Constraints Data:", constraintsData);
    return constraintsData;
  }

  // =========================================
  // DESIGN VARIABLE ELEMENTS
  // =========================================

  // Function to populate relevant dropdowns in design variables
  function populateDesignVariableDropdowns(instanceElement) {
    const flagSelects = instanceElement.querySelectorAll(".dv-flag");
    const segmentSelects = instanceElement.querySelectorAll(".dv-segment"); // Might target different types of segments

    flagSelects.forEach((select) =>
      populateFlagDropdown(
        select,
        `Design Variable ${instanceElement.dataset.index || ""}`
      )
    );

    // Populate Steering Segments (Requires access to Steering Module data)
    const steeringSegmentSelect = instanceElement.querySelector(
      '.dv-segment[data-category="STEERING"]'
    );
    if (steeringSegmentSelect) {
      populateSteeringSegmentDropdown(steeringSegmentSelect);
    }

    // Populate Propulsion Segments (e.g., Stage names - requires access to vehicle data)
    const propulsionSegmentSelect = instanceElement.querySelector(
      '.dv-segment[data-category="PROPULSION"]'
    );
    if (propulsionSegmentSelect) {
      // Placeholder: Add logic to get stage names
      populateGenericSegmentDropdown(propulsionSegmentSelect, "PROPULSION");
    }

    // Populate Sequence Flags (Coasting related)
    const sequenceFlagSelect = instanceElement.querySelector(
      '.dv-flag[data-category="SEQUENCE"]'
    );
    if (sequenceFlagSelect) {
      // populateFlagDropdown(sequenceFlagSelect, `Design Variable Sequence ${instanceElement.dataset.index || ''}`);
      // Flags already populated above, might need filtering for sequence-specific flags if required
    }
  }

  // Placeholder for populating steering segments
  function populateSteeringSegmentDropdown(selectElement) {
    if (!selectElement) return;
    // Clear existing options except placeholder
    while (selectElement.options.length > 1) {
      selectElement.remove(1);
    }
    try {
      // Directly use window.steeringState.activeComponents
      const activeComponentsData = window.steeringState?.activeComponents || {};
      const activeComponentsArray = Object.values(activeComponentsData);

      if (activeComponentsArray.length === 0) {
        console.warn(
          "No active steering components found (from window.steeringState.activeComponents) to populate Design Variable segment dropdown."
        );
        // Add a disabled option indicating no components
        const option = document.createElement("option");
        option.value = "";
        option.textContent = "No steering components active";
        option.disabled = true;
        // selectElement.appendChild(option); // No need to append if placeholder already exists
        return;
      }
      activeComponentsArray.forEach((comp) => {
        // Ensure comp has id, displayName, and type, which it should if coming from steeringState
        if (comp && comp.id && comp.displayName && comp.type) {
          const option = document.createElement("option");
          // Store the exact displayName as the value to preserve case and format
          option.value = comp.displayName;
          // Display name should already be in 'Capitalized_Type_Name_Increment' format e.g. Vertical_Ascend_1
          option.textContent = comp.displayName;
          selectElement.appendChild(option);
        } else {
          console.warn(
            "Skipping steering component due to missing data:",
            comp
          );
        }
      });
      console.log(
        `Populated STEERING segment dropdown with ${activeComponentsArray.length} components.`
      );
    } catch (error) {
      console.error("Error populating steering segment dropdown:", error);
      // Add a disabled option indicating an error
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "Error loading steering segments";
      option.disabled = true;
      selectElement.appendChild(option);
    }
  }

  // Placeholder for populating propulsion segments (e.g., stages)
  function populateGenericSegmentDropdown(selectElement, category) {
    // Clear current options except the default one
    selectElement.innerHTML =
      '<option value="" disabled selected>Select Segment</option>';

    let segments = [];
    // CRITICAL CHANGE: Only populate with motor names if category is PROPULSION
    if (category === "PROPULSION") {
      // Fetch motor flags from flagRegistry and extract unique motor identifiers
      const motorIdentifiers = new Set();
      if (window.flagRegistry && window.flagRegistry.motors) {
        // Iterate through flags to find motor-related flags
        // Example flag patterns: S1_MOTOR1_IGNITION, S2_MOTOR1_CUTOFF, etc.
        // Updated to directly use motor names from the new structure
        window.flagRegistry.motors.forEach((motorDetail) => {
          // Construct the motor identifier, e.g., S1_MOTOR1
          const motorId = `S${motorDetail.stageNumber}_MOTOR${motorDetail.motorNumber}`;
          motorIdentifiers.add(motorId);
        });
      }

      segments = Array.from(motorIdentifiers).sort((a, b) => {
        // Extract numbers for sorting (e.g., S1_MOTOR1 -> [1, 1])
        const numsA = a.match(/\d+/g).map(Number);
        const numsB = b.match(/\d+/g).map(Number);
        if (numsA[0] !== numsB[0]) return numsA[0] - numsB[0]; // Sort by Stage number
        return numsA[1] - numsB[1]; // Then by Motor number
      });
      console.log(
        `Found ${segments.length} motor identifiers for PROPULSION category.`
      );
    } else {
      // Log if another category is passed here unexpectedly, but don't populate motors.
      console.warn(
        `populateGenericSegmentDropdown called with unhandled category: ${category}. Segment dropdown will be empty.`
      );
    }

    segments.forEach((segment) => {
      const option = document.createElement("option");
      option.value = segment;
      option.textContent = segment; // Display the raw motor ID like S1_MOTOR1
      selectElement.appendChild(option);
    });
    if (segments.length > 0) {
      console.log(
        `Populated ${category} segment dropdown with:`,
        segments.join(", ")
      );
    }
  }

  // Function to handle Design Variable category changes
  function handleDesignVariableCategoryChange(event) {
    const categorySelect = event.target;
    const instance = categorySelect.closest(".optimization-instance");
    const category = categorySelect.value;

    // Hide all category-specific fields first
    instance.querySelectorAll(".dv-category-fields").forEach((fields) => {
      fields.classList.add("hidden");
    });

    if (!category) {
      // If no category is selected, ensure name input is disabled and placeholder is set
      const nameInput = instance.querySelector(".dv-name");
      if (nameInput) {
        nameInput.disabled = true;
        nameInput.value = "";
        nameInput.placeholder = "Select Category to Generate Name";
      }
      // Clear all segment dropdowns in this instance if no category is selected
      instance.querySelectorAll(".dv-segment").forEach((s) => {
        s.innerHTML =
          '<option value="" disabled selected>Select Segment</option>';
      });
      return;
    }

    // Show fields for selected category
    const categoryFields = instance.querySelector(
      `.dv-category-fields[data-category="${category}"]`
    );
    if (categoryFields) {
      categoryFields.classList.remove("hidden");

      // Populate/Clear segment dropdown based on category
      const segmentSelect = categoryFields.querySelector(".dv-segment");
      if (segmentSelect) {
        if (category === "PROPULSION") {
          console.log(
            `Populating PROPULSION segment for DV: ${instance.dataset.index}`
          );
          populateGenericSegmentDropdown(segmentSelect, "PROPULSION");
        } else if (category === "STEERING") {
          console.log(
            `Populating STEERING segment for DV: ${instance.dataset.index}`
          );
          populateSteeringSegmentDropdown(segmentSelect);
        } else {
          // Clear segment dropdown for other categories if it exists in their specific fields
          segmentSelect.innerHTML =
            '<option value="" disabled selected>Select Segment</option>';
        }
      } else {
        // If this category (e.g. PAYLOAD) doesn't have a segment dropdown in its specific fields, this is fine.
        // We ensure any segment dropdowns from other categories (now hidden) don't interfere.
      }

      // Populate control variable dropdown based on category
      const controlVarSelect = categoryFields.querySelector(
        ".dv-control-variable"
      );
      if (
        controlVarSelect &&
        !controlVarSelect.classList.contains("dv-control-variable-cb")
      ) {
        // Clear existing options
        controlVarSelect.innerHTML =
          '<option value="" disabled selected>Select Control Variable</option>';

        // Get options for this category
        const options = designVariableControlOptions[category];
        if (Array.isArray(options)) {
          // For non-steering categories
          options.forEach((option) => {
            const optionElement = document.createElement("option");
            optionElement.value = option;
            optionElement.textContent = option.replace(/_/g, " ");
            controlVarSelect.appendChild(optionElement);
          });
        }
      }

      // Special handling for steering category
      if (category === "STEERING") {
        // Add event listener for segment type change if not already added
        const segmentTypeSelect =
          categoryFields.querySelector(".dv-segment-type");
        if (segmentTypeSelect) {
          segmentTypeSelect.addEventListener("change", function (e) {
            const segmentType = e.target.value;
            const steeringTypeFields = instance.querySelectorAll(
              ".dv-steering-type-fields"
            );

            // Hide all steering type fields first
            steeringTypeFields.forEach((field) =>
              field.classList.add("hidden")
            );

            // Show selected type fields
            const selectedTypeFields = instance.querySelector(
              `.dv-steering-type-fields[data-segment-type="${segmentType}"]`
            );

            if (selectedTypeFields) {
              selectedTypeFields.classList.remove("hidden");

              // Handle control variable options based on segment type
              if (segmentType === "PROFILE") {
                // Ensure per-axis bounds are set up for the PROFILE type
                // categoryFields here is the main .dv-category-fields[data-category="STEERING"]
                // selectedTypeFields is the .dv-steering-type-fields[data-segment-type="PROFILE"]
                if (typeof setupPerAxisBounds === "function") {
                  setupPerAxisBounds(categoryFields, selectedTypeFields);
                } else {
                  console.error(
                    "setupPerAxisBounds function is not defined. Cannot set up axis bounds."
                  );
                }

                // Populate control variable dropdown for PROFILE
                const controlVarSelect = selectedTypeFields.querySelector(
                  ".dv-control-variable"
                );
                if (controlVarSelect) {
                  controlVarSelect.innerHTML =
                    '<option value="" disabled selected>Select Control Variable</option>';
                  const options =
                    designVariableControlOptions.STEERING[segmentType] || [];
                  options.forEach((option) => {
                    const optionElement = document.createElement("option");
                    optionElement.value = option;
                    optionElement.textContent = option.replace(/_/g, " ");
                    controlVarSelect.appendChild(optionElement);
                  });
                }
              } else if (segmentType === "CONST_BODYRATE") {
                // For CONST_BODYRATE, we already have checkboxes in the HTML
                const checkboxContainer = selectedTypeFields.querySelector(
                  ".control-variable-checkboxes"
                );
                if (checkboxContainer) {
                  // Add event listeners to handle checkbox logic
                  const checkboxes = checkboxContainer.querySelectorAll(
                    ".dv-control-variable-cb"
                  );

                  const mutuallyExclusiveGroupValues = [
                    "EULER_RATE",
                    "BODY_RATE",
                    "EULER_ANGLE",
                    "BODY_ANGLE",
                  ];

                  checkboxes.forEach((checkbox) => {
                    checkbox.addEventListener("change", function () {
                      const clickedCheckbox = this;
                      const clickedValue = clickedCheckbox.value;
                      const isClickedRateAngle =
                        mutuallyExclusiveGroupValues.includes(clickedValue);

                      if (clickedCheckbox.checked) {
                        if (isClickedRateAngle) {
                          // Uncheck other Rate/Angle checkboxes
                          checkboxes.forEach((cb) => {
                            if (
                              cb !== clickedCheckbox &&
                              mutuallyExclusiveGroupValues.includes(cb.value)
                            ) {
                              cb.checked = false;
                            }
                          });
                        }

                        // Validate overall selection
                        const stopTimeCheckbox = Array.from(checkboxes).find(
                          (cb) => cb.value === "STOP_TIME"
                        );
                        const checkedRateAngleCheckboxes = Array.from(
                          checkboxes
                        ).filter(
                          (cb) =>
                            mutuallyExclusiveGroupValues.includes(cb.value) &&
                            cb.checked
                        );

                        if (
                          stopTimeCheckbox &&
                          stopTimeCheckbox.checked &&
                          checkedRateAngleCheckboxes.length > 1
                        ) {
                          // This case implies Stop_Time is checked, and the user tried to check a second Rate/Angle.
                          // The just-clicked item (which is a Rate/Angle one) should be unchecked.
                          if (isClickedRateAngle) {
                            // Ensure the clicked one was indeed Rate/Angle
                            clickedCheckbox.checked = false;
                            if (typeof showWarning === "function") {
                              showWarning(
                                "You can select Stop Time with only one of Euler Rate, Body Rate, Euler Angle, or Body Angle."
                              );
                            } else {
                              console.warn(
                                "showWarning function not available. Cannot display warning."
                              );
                            }
                          }
                        }
                      }
                      // No specific action needed on uncheck for these rules,
                      // as unchecking doesn't create an invalid state from a valid one.
                    });
                  });
                }
              } else {
                // For other steering types, populate the dropdown
                const controlVarSelect = selectedTypeFields.querySelector(
                  ".dv-control-variable"
                );
                if (controlVarSelect) {
                  controlVarSelect.innerHTML =
                    '<option value="" disabled selected>Select Control Variable</option>';
                  const options =
                    designVariableControlOptions.STEERING[segmentType] || [];
                  options.forEach((option) => {
                    const optionElement = document.createElement("option");
                    optionElement.value = option;
                    optionElement.textContent = option.replace(/_/g, " ");
                    controlVarSelect.appendChild(optionElement);
                  });
                }
              }
            }
          });
        }
      }

      // Populate flag dropdown if it exists
      const flagSelect = categoryFields.querySelector(".dv-flag");
      if (flagSelect) {
        populateFlagDropdown(flagSelect, `Design Variable - ${category}`);
      }

      // Restore dynamic name generation
      const nameInput = instance.querySelector(".dv-name");
      if (nameInput) {
        if (category) {
          // A category is selected
          nameInput.disabled = false;
          const defaultNamePatterns = {
            CUT_OFF: "opt_cut_off",
            PAYLOAD: "opt_payload",
            AZIMUTH: "opt_azimuth",
            SEQUENCE: "opt_coast",
            PROPULSION: "opt_propulsion",
            STEERING: "opt_steering",
          };
          const instanceIndex =
            instance.dataset.index ||
            Array.from(
              designVariablesContainer.querySelectorAll(
                ".optimization-instance"
              )
            ).indexOf(instance) + 1;
          const baseName = defaultNamePatterns[category] || "opt_variable";
          nameInput.value = `${baseName}_${instanceIndex}`;
          nameInput.placeholder = ""; // Clear placeholder as value is set
        } else {
          // No category is selected (e.g., "Select Category" was chosen)
          nameInput.disabled = true;
          nameInput.value = "";
          nameInput.placeholder = "Select Category to Generate Name";
        }
      }
    } else {
      // No category selected, or category fieldset not found
      const nameInput = instance.querySelector(".dv-name");
      if (nameInput) {
        nameInput.disabled = true;
        nameInput.value = "";
        nameInput.placeholder = "Select Category to Generate Name";
      }
      // Ensure any segment dropdowns in any (now hidden) category fields are cleared
      instance.querySelectorAll(".dv-segment").forEach((s) => {
        s.innerHTML =
          '<option value="" disabled selected>Select Segment</option>';
      });
    }
  }

  // Function to handle Steering Segment selection change
  function handleSteeringSegmentChange(event) {
    const segmentSelect = event.target;
    const instance = segmentSelect.closest(".optimization-instance");
    if (!instance) return;

    const segmentTypeSelect = instance.querySelector(".dv-segment-type");
    const selectedOption = segmentSelect.options[segmentSelect.selectedIndex];
    const segmentType = selectedOption
      ? selectedOption.dataset.segmentType
      : null; // Get type from selected segment option's dataset

    if (segmentTypeSelect && segmentType) {
      segmentTypeSelect.value = segmentType; // Auto-select the type based on the chosen segment
      handleSteeringSegmentTypeChange({ target: segmentTypeSelect }); // Trigger the type change handler
    } else if (segmentTypeSelect) {
      // If no segment is selected or type info is missing, reset type dropdown and hide sub-fields
      segmentTypeSelect.value = "";
      handleSteeringSegmentTypeChange({ target: segmentTypeSelect });
    }
  }

  // Function to handle Steering Segment Type changes (within STEERING category)
  function handleSteeringSegmentTypeChange(event) {
    const typeSelect = event.target;
    const instance = typeSelect.closest(
      '.dv-category-fields[data-category="STEERING"]'
    );
    if (!instance) return;

    const selectedType = typeSelect.value;
    const subFieldsContainer = instance.querySelector(
      ".dv-steering-sub-fields"
    );
    const allSubTypeFields = subFieldsContainer.querySelectorAll(
      ".dv-steering-type-fields"
    );

    // Hide all sub-type fields
    allSubTypeFields.forEach((fieldSet) => fieldSet.classList.add("hidden"));

    // Show fields for the selected sub-type
    const selectedFieldSet = subFieldsContainer.querySelector(
      `.dv-steering-type-fields[data-segment-type="${selectedType}"]`
    );
    if (selectedFieldSet) {
      selectedFieldSet.classList.remove("hidden");
      // Update name suggestion based on segment + type
      const mainInstance = instance.closest(".optimization-instance");
      const nameInput = mainInstance.querySelector(".dv-name");
      const segmentSelect = instance.querySelector(".dv-segment");
      if (nameInput && segmentSelect && segmentSelect.value) {
        const segmentName =
          segmentSelect.options[segmentSelect.selectedIndex]?.textContent ||
          segmentSelect.value;
        const baseName = `opt_steering_${segmentName.replace(
          /\s+/g,
          "_"
        )}_${selectedType.toLowerCase()}_${mainInstance.dataset.index || "1"}`;
        nameInput.placeholder = `e.g., ${baseName}`;
        // Uncomment to auto-fill: nameInput.value = baseName;
      }
    }
    // Adjust input types based on requirements (e.g., some bounds are arrays)
    adjustInputTypesForSteering(selectedFieldSet);
  }

  // Helper to adjust input types for steering (e.g., bounds might be comma-separated)
  function adjustInputTypesForSteering(fieldSet) {
    if (!fieldSet) return;
    const category = fieldSet.dataset.segmentType;

    // Most steering bounds/variables can be arrays (comma-separated)
    const lowerBoundInputs = fieldSet.querySelectorAll(".dv-lower-bound");
    const upperBoundInputs = fieldSet.querySelectorAll(".dv-upper-bound");
    const controlVarInputs = fieldSet.querySelectorAll(".dv-control-variable");
    const axisInputs = fieldSet.querySelectorAll(".dv-axis"); // Axis can also be multiple

    // Change type to 'text' for potential comma-separated values, except for specific single-value fields
    if (category === "CLG") {
      // CLG bounds are typically single numbers
    } else {
      lowerBoundInputs.forEach((input) => {
        input.type = "text";
        if (input.placeholder && typeof input.placeholder === "string") {
          input.placeholder = input.placeholder.replace(
            "numeric",
            "comma-separated"
          );
        } else {
          input.placeholder = "Enter comma-separated values";
        }
      });
      upperBoundInputs.forEach((input) => {
        input.type = "text";
        if (input.placeholder && typeof input.placeholder === "string") {
          input.placeholder = input.placeholder.replace(
            "numeric",
            "comma-separated"
          );
        } else {
          input.placeholder = "Enter comma-separated values";
        }
      });
      controlVarInputs.forEach((input) => {
        input.type = "text";
        if (input.placeholder && typeof input.placeholder === "string") {
          input.placeholder = input.placeholder.replace(
            "numeric",
            "comma-separated"
          );
        } else {
          input.placeholder = "Enter control variables";
        }
      });
      axisInputs.forEach((input) => {
        if (input.tagName === "INPUT") {
          // Only change input fields, not selects
          input.type = "text";
          if (input.placeholder && typeof input.placeholder === "string") {
            input.placeholder = input.placeholder.replace(
              "numeric",
              "comma-separated"
            );
          } else {
            input.placeholder = "Enter axis values";
          }
        }
      });
    }
    // Handle PROFILE independent vector nodes - should be text
    if (category === "PROFILE") {
      const indVectorInput = fieldSet.querySelector(".dv-ind-vector");
      if (indVectorInput) indVectorInput.type = "text";
      // Profile bounds can also be arrays
      fieldSet
        .querySelectorAll(".dv-lower-bound, .dv-upper-bound")
        .forEach((input) => {
          input.type = "text";
          if (input.placeholder && typeof input.placeholder === "string") {
            input.placeholder = input.placeholder.replace(
              "numeric",
              "comma-separated"
            );
          } else {
            input.placeholder = "Enter comma-separated values";
          }
        });
    }
  }

  // Function to add a new design variable instance
  function addDesignVariableInstance() {
    if (!designVariableTemplate || !designVariablesContainer) {
      console.error(
        "Required elements not found for adding design variable instance"
      );
      return;
    }

    const currentCount = designVariablesContainer.querySelectorAll(
      ".optimization-instance:not(.hidden-template)"
    ).length;
    if (currentCount >= MAX_DESIGN_VARIABLES) {
      Swal.fire({
        icon: "error",
        title: "Maximum Reached",
        text: `You can only add up to ${MAX_DESIGN_VARIABLES} design variables.`,
      });
      return;
    }

    designVariableCounter++; // Use a simple counter for uniqueness

    // Clone the content of the template element
    const newInstanceContent = designVariableTemplate.content.cloneNode(true);
    const newInstance = newInstanceContent.querySelector(
      ".optimization-instance"
    ); // Get the actual div

    if (!newInstance) {
      console.error(
        "Could not find '.optimization-instance' within the template content."
      );
      return;
    }

    newInstance.id = `design-variable-${designVariableCounter}`;
    newInstance.classList.remove("hidden-template"); // Ensure it's visible if template itself was hidden
    newInstance.dataset.index = designVariableCounter;

    // Add color-coding based on instance number (cycle through 6 colors)
    const colorIndex = designVariableCounter % 6 || 6;
    newInstance.classList.add(`design-var-color-${colorIndex}`);

    // Update title
    const titleSpan = newInstance.querySelector(".instance-title span");
    if (titleSpan) {
      titleSpan.textContent = designVariableCounter;
    }

    // Add event listener for category change
    const categorySelect = newInstance.querySelector(".dv-category");
    if (categorySelect) {
      categorySelect.addEventListener(
        "change",
        handleDesignVariableCategoryChange
      );
    }

    // Add event listener for steering segment change (only applies if category becomes STEERING)
    const steeringSegmentSelect = newInstance.querySelector(
      '.dv-segment[data-category="STEERING"]'
    );
    if (steeringSegmentSelect) {
      steeringSegmentSelect.addEventListener(
        "change",
        handleSteeringSegmentChange
      );
    }

    // Add event listener for steering type change (only applies if category becomes STEERING)
    const steeringTypeSelect = newInstance.querySelector(".dv-segment-type");
    if (steeringTypeSelect) {
      steeringTypeSelect.addEventListener(
        "change",
        handleSteeringSegmentTypeChange
      );
    }

    // Add event listener for the delete button
    const deleteBtn = newInstance.querySelector(".delete-instance-btn");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", () => {
        // Also remove the divider if it exists
        const prevElement = newInstance.previousElementSibling;
        if (
          prevElement &&
          prevElement.classList.contains("design-variable-divider")
        ) {
          designVariablesContainer.removeChild(prevElement);
        }

        newInstance.remove();
        renumberDesignVariables();
      });
    }

    // If not the first instance, add a divider before this one
    if (designVariablesContainer.children.length > 0) {
      const divider = document.createElement("div");
      divider.className = "design-variable-divider";
      designVariablesContainer.appendChild(divider);
    }

    // Add the new instance to the container
    designVariablesContainer.appendChild(newInstance);

    // Populate dropdowns for the new instance AFTER it's added to the DOM
    populateDesignVariableDropdowns(newInstance);

    // Set the instance title
    const titleElement = newInstance.querySelector(".instance-title span");
    if (titleElement) {
      titleElement.textContent = designVariableCounter;
    }

    // Get the name input field and set its initial state
    const nameInput = newInstance.querySelector(".dv-name");
    if (nameInput) {
      nameInput.disabled = true;
      nameInput.placeholder = "Select Category to Generate Name";
    }

    // Style the new instance before appending
    const existingDvInstances = designVariablesContainer.querySelectorAll(
      ".optimization-instance:not(.hidden-template)"
    );
    const newIndex = existingDvInstances.length; // Index for the new instance
    applyOptimizationInstanceStyling(newInstance, newIndex, "design-variable");

    return newInstance; // Added return statement
  }

  // Function to renumber design variables after deletion
  function renumberDesignVariables() {
    const instances = designVariablesContainer.querySelectorAll(
      ".optimization-instance:not(.hidden-template)"
    );
    instances.forEach((instance, index) => {
      const newIndex = index + 1;
      const titleSpan = instance.querySelector(".instance-title span");
      if (titleSpan) {
        titleSpan.textContent = newIndex;
      }
      instance.dataset.index = newIndex;
      instance.id = `design-variable-${newIndex}`;

      // Update name placeholder/value if it follows the pattern
      const nameInput = instance.querySelector(".dv-name");
      if (nameInput) {
        const match = nameInput.placeholder.match(/^(.*_)(\d+)$/);
        if (match) {
          nameInput.placeholder = `${match[1]}${newIndex}`;
        }
        const valueMatch = nameInput.value.match(/^(.*_)(\d+)$/);
        if (valueMatch) {
          nameInput.value = `${valueMatch[1]}${newIndex}`;
        }
      }

      // Update color coding classes
      // First remove all existing color classes
      for (let i = 1; i <= 6; i++) {
        instance.classList.remove(`design-var-color-${i}`);
      }
      // Add the appropriate color class based on new index
      const colorIndex = newIndex % 6 || 6;
      instance.classList.add(`design-var-color-${colorIndex}`);
    });
    // Update the main counter
    designVariableCounter = instances.length;
  }

  // Function to get design variables data
  function getDesignVariablesData() {
    const designVariablesData = [];
    const instances = designVariablesContainer.querySelectorAll(
      ".optimization-instance:not(.hidden-template)"
    );

    instances.forEach((instance) => {
      const categorySelect = instance.querySelector(".dv-category");
      const nameInput = instance.querySelector(".dv-name");
      const category = categorySelect ? categorySelect.value : null;
      const name = nameInput ? nameInput.value : null;

      if (category && name) {
        const dv = { name: name, category: category, type: {} };
        const categoryFields = instance.querySelector(
          `.dv-category-fields[data-category="${category}"]`
        );

        if (categoryFields) {
          const flagSelect = categoryFields.querySelector(".dv-flag");
          const controlVarInput = categoryFields.querySelector(
            ".dv-control-variable"
          );
          const lowerBoundInput =
            categoryFields.querySelector(".dv-lower-bound");
          const upperBoundInput =
            categoryFields.querySelector(".dv-upper-bound");

          // Add segment for propulsion and steering categories
          if (["PROPULSION", "STEERING"].includes(category)) {
            const segmentSelect = categoryFields.querySelector(".dv-segment");
            if (segmentSelect && segmentSelect.value) {
              dv.segment = segmentSelect.value;
            } else {
              console.warn(`Missing segment for ${category} variable: ${name}`);
            }
          }

          // Helper to parse comma-separated string to array of numbers/strings
          const parseArray = (inputElement) => {
            if (!inputElement || !inputElement.value) return [];
            // Attempt to parse numbers, otherwise keep as strings
            return inputElement.value.split(",").map((item) => {
              const trimmed = item.trim();
              const num = parseFloat(trimmed);
              return !isNaN(num) && trimmed !== "" ? num : trimmed; // Keep original string if not a valid number or empty after trim
            });
          };
          // Helper to parse single number or return null
          const parseSingleNumber = (inputElement) => {
            if (!inputElement || !inputElement.value) return null;
            const num = parseFloat(inputElement.value);
            return !isNaN(num) ? num : null;
          };

          // --- Populate based on category ---
          if (["CUT_OFF", "SEQUENCE"].includes(category)) {
            if (flagSelect) dv.flag = flagSelect.value || null;
            if (controlVarInput)
              dv.type.control_variable = controlVarInput.value; // Usually single for these
            if (lowerBoundInput)
              dv.type.lower_bound = parseSingleNumber(lowerBoundInput);
            if (upperBoundInput)
              dv.type.upper_bound = parseSingleNumber(upperBoundInput);
          } else if (["PAYLOAD", "AZIMUTH"].includes(category)) {
            if (controlVarInput)
              dv.type.control_variable = parseArray(controlVarInput);
            if (lowerBoundInput)
              dv.type.lower_bound = parseArray(lowerBoundInput);
            if (upperBoundInput)
              dv.type.upper_bound = parseArray(upperBoundInput);
          } else if (category === "PROPULSION") {
            if (controlVarInput)
              dv.type.control_variable = parseArray(controlVarInput);
            if (lowerBoundInput)
              dv.type.lower_bound = parseArray(lowerBoundInput);
            if (upperBoundInput)
              dv.type.upper_bound = parseArray(upperBoundInput);
          } else if (category === "STEERING") {
            const segmentTypeSelect =
              categoryFields.querySelector(".dv-segment-type");

            // Add segment_type for steering category
            if (segmentTypeSelect && segmentTypeSelect.value) {
              dv.segment_type = segmentTypeSelect.value;
            } else {
              console.warn(
                `Missing segment_type for STEERING variable: ${name}`
              );
            }

            const segmentType = dv.segment_type || null;

            const subTypeFields = categoryFields.querySelector(
              `.dv-steering-type-fields[data-segment-type="${segmentType}"]`
            );
            if (subTypeFields) {
              const subControlVar = subTypeFields.querySelector(
                ".dv-control-variable"
              );
              const subLowerBound =
                subTypeFields.querySelector(".dv-lower-bound");
              const subUpperBound =
                subTypeFields.querySelector(".dv-upper-bound");
              const subAxis = subTypeFields.querySelector(".dv-axis"); // Could be input or select
              const subIndVar = subTypeFields.querySelector(".dv-ind-variable"); // PROFILE only
              const subIndVector =
                subTypeFields.querySelector(".dv-ind-vector"); // PROFILE only

              // Common fields (may be arrays)
              if (subControlVar)
                dv.type.control_variable = parseArray(subControlVar);
              if (subLowerBound)
                dv.type.lower_bound = parseArray(subLowerBound);
              if (subUpperBound)
                dv.type.upper_bound = parseArray(subUpperBound);

              // Axis (might be single select or multi input)
              if (subAxis) {
                if (subAxis.tagName === "SELECT") {
                  dv.type.axis = subAxis.value || null; // Single axis from dropdown
                } else if (subAxis.tagName === "INPUT") {
                  dv.type.axis = parseArray(subAxis); // Multiple axes from input
                }
              }

              // Profile specific fields
              if (segmentType === "PROFILE") {
                if (subIndVar) dv.type.ind_variable = subIndVar.value || null;
                if (subIndVector) dv.type.ind_vector = parseArray(subIndVector); // Indices
              }
              // CLG specific (bounds are single numbers)
              else if (segmentType === "CLG") {
                if (subLowerBound)
                  dv.type.lower_bound = parseSingleNumber(subLowerBound);
                if (subUpperBound)
                  dv.type.upper_bound = parseSingleNumber(subUpperBound);
                // CLG control_variable is typically the 'GAIN' name, bounds apply to it
                if (subControlVar)
                  dv.type.control_variable = subControlVar.value;
              }
              // Adjust single value fields for other types if needed
              else if (segmentType === "ZERO_RATE") {
                // Zero rate bounds are typically single duration values, but control_variable could be array if multiple zero rates defined? Adjust as needed.
                if (subLowerBound)
                  dv.type.lower_bound = parseArray(subLowerBound); // Assuming array possible
                if (subUpperBound)
                  dv.type.upper_bound = parseArray(subUpperBound); // Assuming array possible
              }
            } else {
              console.warn(
                `No sub-type fields found for steering type: ${segmentType} in DV ${dv.name}`
              );
            }
          }

          designVariablesData.push(dv);
        }
      } else {
        console.warn(
          "Skipping design variable instance due to missing category or name."
        );
      }
    });

    console.log("Collected Design Variables Data:", designVariablesData);
    return designVariablesData;
  }

  // Function to clear design variable inputs
  function clearDesignVariablesForm() {
    designVariablesContainer.innerHTML = ""; // Remove all instances
    designVariableCounter = 0; // Reset counter
    // Optionally, add back one default instance
    addDesignVariableInstance();
    Swal.fire({
      icon: "info",
      title: "Cleared",
      text: "Design Variables form cleared.",
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 2000,
    });
  }

  // =========================================
  // EVENT LISTENERS & INITIALIZATION
  // =========================================

  // --- Objective Function Listeners ---
  if (addObjectiveBtn) {
    addObjectiveBtn.addEventListener("click", addObjectiveFunctionForm);
  }

  if (objectiveFunctionForm) {
    // Submit handler moved to FormValidator.initializeObjectiveFunctionValidation() in validation.js
    // This prevents duplicate event handlers and centralizes validation logic
  }

  // --- Constraints Listeners ---
  const constraintsNavButton = document.getElementById("constraints-btn");
  if (constraintsNavButton) {
    constraintsNavButton.addEventListener("click", () => {
      setTimeout(() => {
        populateAllConstraintNameDropdowns();
        populateFlagDropdown(constraintFlagSelect, "Constraints");
      }, 50);
    });
  }

  // Clear any existing event handlers for the Add Constraint button
  if (addConstraintBtn) {
    const newAddBtn = addConstraintBtn.cloneNode(true);
    addConstraintBtn.parentNode.replaceChild(newAddBtn, addConstraintBtn);

    // Re-add the event listener
    newAddBtn.addEventListener("click", () => {
      addConstraintInstance();
    });
  }

  // Make sure all constraint name dropdowns have change listeners
  const constraints = document.querySelectorAll(
    "#constraints-container .optimization-instance:not(.hidden-template) .constraint-name"
  );

  if (constraints.length > 0) {
    console.log(`Applying fixes to ${constraints.length} constraint forms`);

    constraints.forEach((nameSelect) => {
      // Remove existing event listeners by cloning
      const newNameSelect = nameSelect.cloneNode(true);
      nameSelect.parentNode.replaceChild(newNameSelect, nameSelect);

      // Add back the main event listener
      newNameSelect.addEventListener("change", handleConstraintNameChange);

      // Trigger the change event to ensure UI is correctly set up
      if (newNameSelect.value) {
        newNameSelect.dispatchEvent(new Event("change"));
      }
    });
  }

  if (constraintsForm) {
    constraintsForm.addEventListener("submit", (event) => {
      event.preventDefault();
      console.log("Constraints form submitted.");
      const sectionId = "constraints";

      // Validation
      let isValid = true;
      let errors = [];
      const constraintInstances = constraintsContainer.querySelectorAll(
        ".optimization-instance:not(.hidden-template)"
      );

      if (constraintInstances.length === 0) {
        console.log("No constraints added, proceeding with save.");
      } else {
        // Validate each instance
        constraintInstances.forEach((instance) => {
          if (!FormValidator.validateConstraintInstance(instance, errors)) {
            isValid = false;
          }
        });
      }

      if (isValid) {
        const constraintsData = getConstraintsData();
        console.log(
          "Constraints Data is valid, ready to save:",
          constraintsData
        );

        if (typeof saveOptimizationData === "function") {
          saveOptimizationData("constraints", constraintsData);

          // Update state management
          if (window.sectionStates && window.sectionStates[sectionId]) {
            window.sectionStates[sectionId].isSaved = true;
            window.sectionStates[sectionId].isDirty = false;
            window.sectionStates[sectionId].isValid = true;
            window.sectionStates[sectionId].needsReview = false;

            // Unlock the next section ('mode')
            const nextSectionId = "mode";
            if (window.sectionStates[nextSectionId]) {
              window.sectionStates[nextSectionId].isLocked = false;
              console.log(`Section ${nextSectionId} unlocked.`);
            }

            // Handle dependents
            const currentState = window.sectionStates[sectionId];
            if (
              currentState.dependents &&
              Array.isArray(currentState.dependents)
            ) {
              currentState.dependents.forEach((depId) => {
                if (
                  window.sectionStates[depId] &&
                  window.sectionStates[depId].isSaved
                ) {
                  window.sectionStates[depId].needsReview = true;
                }
              });
            }

            // Update sidebar visuals
            if (typeof updateSidebarStates === "function") {
              updateSidebarStates();
            }
          }
        } else {
          console.error("saveOptimizationData function is not defined!");
          Swal.fire({
            icon: "error",
            title: "Save Error",
            text: "Could not save data. Handler function missing.",
          });
        }
      } else {
        // Update state on validation failure
        if (window.sectionStates && window.sectionStates[sectionId]) {
          window.sectionStates[sectionId].isValid = false;
          if (typeof updateSidebarStates === "function") {
            updateSidebarStates();
          }
        }

        Swal.fire({
          icon: "error",
          title: "Constraints Validation Failed",
          html: errors.join("<br>"),
          toast: false,
          confirmButtonText: "OK",
        });
      }
    });
  }

  // Auto-create an initial objective function form if the container exists and is empty
  // Commenting out this block to prevent creating two forms on page load
  // (one here and one in initOptimizationModule)
  /*
  if (
    objectiveFunctionContainer &&
    objectiveFunctionContainer.children.length === 0
  ) {
    console.log(
      "Automatically creating initial objective function form on page load"
    );
    addObjectiveFunctionForm();
  }
  */

  // REMOVED: Auto-create initial constraint form on page load
  // This was creating a duplicate constraint form since the initOptimizationModule
  // function also creates one when initialized
  // if (constraintsContainer && constraintsContainer.children.length === 0) {
  //   console.log("Automatically creating initial constraint form on page load");
  //   addConstraintInstance();
  // }

  // Initialize dropdowns for all existing constraints
  populateAllConstraintNameDropdowns();

  // Hide factor fields for all existing constraints
  document
    .querySelectorAll("#constraints-container .constraint-factor")
    .forEach((element) => {
      if (element.parentElement) {
        element.parentElement.style.display = "none";
      }
    });

  // Add styles for the optimization module in a way that ensures they're applied
  const optimizationStyles = `
  .form-card {
      border: 1px dashed rgba(255, 255, 255, 0.2);
      border-radius: 5px;
      padding: 15px;
      margin-bottom: 20px;
      position: relative;
  }
  
  .objective-function-instance {
      background: rgba(30, 30, 30, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.15);
      box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16);
      transition: all 0.3s ease;
  }
  
  .objective-function-instance:hover {
      background: rgba(40, 40, 40, 0.7);
      border-color: rgba(255, 255, 255, 0.25);
  }
  
  /* Different colors for different objective forms */
  .objective-form-1 {
      border-left: 4px solid #4a90e2;
  }
  
  .objective-form-2 {
      border-left: 4px solid #50e3c2;
  }
  
  .objective-form-3 {
      border-left: 4px solid #e6a545;
  }
  
  .objective-form-4 {
      border-left: 4px solid #bd10e0;
  }
  
  .objective-heading {
      margin-top: 0;
      margin-bottom: 18px;
      color: #ffffff;
      font-size: 18px;
      font-weight: 600;
      border-bottom: 1px solid rgba(255, 255, 255, 0.15);
      padding-bottom: 10px;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  }
  
  .objective-divider {
      height: 15px;
      margin-bottom: 20px;
      border-top: 1px dashed rgba(255, 255, 255, 0.2);
      position: relative;
  }
  
  .objective-divider:after {
      content: "";
      position: absolute;
      left: 50%;
      top: -8px;
      transform: translateX(-50%);
      width: 40px;
      height: 15px;
      background: #1e1e1e;
      border-radius: 10px;
  }

  .form-card h4 {
      margin-top: 0;
      margin-bottom: 15px;
      color: #e0e0e0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding-bottom: 5px;
  }

  .remove-btn {
      position: absolute;
      top: 10px;
      right: 10px;
      background-color: rgba(255, 82, 82, 0.7);
      color: white;
      border: none;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      font-size: 16px;
      line-height: 22px;
      text-align: center;
      cursor: pointer;
      transition: background-color 0.3s ease;
      font-weight: bold;
  }

  .remove-btn:hover {
      background-color: rgba(255, 82, 82, 1);
  }

  .hidden-template {
      display: none !important;
  }

  /* Constraint form styles with increased specificity */
  #constraints-container .optimization-instance {
      background: rgba(30, 30, 30, 0.5) !important;
      border: 1px solid rgba(255, 255, 255, 0.15) !important;
      box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16) !important;
      transition: all 0.3s ease !important;
      margin-bottom: 20px !important;
      border-radius: 5px !important;
      padding: 15px !important;
      position: relative !important;
  }
  
  #constraints-container .optimization-instance:hover {
      background: rgba(40, 40, 40, 0.7) !important;
      border-color: rgba(255, 255, 255, 0.25) !important;
  }
  
  /* Different colors for different constraint forms with increased specificity */
  #constraints-container .constraint-form-1 {
      border-left: 4px solid #4a90e2 !important; /* Blue */
  }
  
  #constraints-container .constraint-form-2 {
      border-left: 4px solid #50e3c2 !important; /* Teal */
  }
  
  #constraints-container .constraint-form-3 {
      border-left: 4px solid #e6a545 !important; /* Orange */
  }
  
  #constraints-container .constraint-form-4 {
      border-left: 4px solid #bd10e0 !important; /* Purple */
  }
  
  #constraints-container .constraint-form-5 {
      border-left: 4px solid #e3506f !important; /* Pink */
  }
  
  #constraints-container .constraint-form-6 {
      border-left: 4px solid #67c23a !important; /* Green */
  }
  
  #constraints-container .constraint-heading {
      margin-top: 0 !important;
      margin-bottom: 18px !important;
      color: #ffffff !important;
      font-size: 18px !important;
      font-weight: 600 !important;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3) !important;
  }
  
  #constraints-container .constraint-divider {
      height: 15px !important;
      margin-bottom: 20px !important;
      border-top: 1px dashed rgba(255, 255, 255, 0.2) !important;
      position: relative !important;
  }
  
  #constraints-container .constraint-divider:after {
      content: "" !important;
      position: absolute !important;
      left: 50% !important;
      top: -8px !important;
      transform: translateX(-50%) !important;
      width: 40px !important;
      height: 15px !important;
      background: #1e1e1e !important;
      border-radius: 10px !important;
  }
  
  .additional-fields {
      margin-top: 10px;
      border-top: 1px dashed rgba(255, 255, 255, 0.1);
      padding-top: 10px;
  }

  .dciss-parameters-container {
      margin-top: 10px;
  }

  .flag-time-range {
      margin-top: 10px;
  }

  .flag-offset-row {
      margin-top: 10px;
  }

  .disabled-field {
      opacity: 0.5;
      background-color: rgba(0, 0, 0, 0.2);
      cursor: not-allowed;
  }

  /* Form layout styles */
  .form-row {
      display: flex;
      gap: 10px;
      margin-bottom: 10px;
  }

  .form-row .form-group {
      flex: 1;
  }

  .form-group label {
      margin-bottom: 5px;
      display: block;
  }

  /* Input field styles */
  .input-field {
      width: 100%;
      padding: 8px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 4px;
      background-color: rgba(0, 0, 0, 0.2);
      color: #fff;
  }

  .input-field:focus {
      border-color: rgba(74, 144, 226, 0.5);
      outline: none;
  }

  .input-field:disabled {
      opacity: 0.5;
      cursor: not-allowed;
  }

  /* Error state */
  .error-field {
      border-color: rgba(255, 82, 82, 0.7);
  }

  .error-message {
      color: rgba(255, 82, 82, 0.9);
      font-size: 12px;
      margin-top: 4px;
  }

  /* Design Variable form styles with increased specificity */
  #design-variables-container .optimization-instance {
      background: rgba(30, 30, 30, 0.5) !important;
      border: 1px solid rgba(255, 255, 255, 0.15) !important;
      box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16) !important;
      transition: all 0.3s ease !important;
      margin-bottom: 20px !important;
      border-radius: 5px !important;
      padding: 15px !important;
      position: relative !important;
  }
  
  #design-variables-container .optimization-instance:hover {
      background: rgba(40, 40, 40, 0.7) !important;
      border-color: rgba(255, 255, 255, 0.25) !important;
  }
  
  #design-variables-container .design-variable-form-1 {
      border-left: 4px solid #4a90e2 !important; /* Blue */
  }
  
  #design-variables-container .design-variable-form-2 {
      border-left: 4px solid #50e3c2 !important; /* Teal */
  }
  
  #design-variables-container .design-variable-form-3 {
      border-left: 4px solid #e6a545 !important; /* Orange */
  }
  
  #design-variables-container .design-variable-form-4 {
      border-left: 4px solid #bd10e0 !important; /* Purple */
  }
  
  #design-variables-container .design-variable-form-5 {
      border-left: 4px solid #e3506f !important; /* Pink */
  }
  
  #design-variables-container .design-variable-form-6 {
      border-left: 4px solid #67c23a !important; /* Green */
  }
  
  #design-variables-container .design-variable-heading {
      margin-top: 0 !important;
      margin-bottom: 18px !important;
      color: #ffffff !important;
      font-size: 18px !important;
      font-weight: 600 !important;
      border-bottom: 1px solid rgba(255, 255, 255, 0.15); /* Copied from constraint-heading for consistency */
      padding-bottom: 10px !important; /* Copied from constraint-heading for consistency */
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3) !important;
  }
  `;

  // Apply the styles more directly to ensure they take effect
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.textContent = optimizationStyles; // Use textContent instead of innerText
  document.head.appendChild(styleSheet);

  // Helper function to apply styling to optimization instances (constraints, design variables, etc.)
  function applyOptimizationInstanceStyling(instance, index, typePrefix) {
    const colorIndex = (index + 1) % 6 || 6; // Cycle 1-6

    // Remove any existing color-specific classes for this type to prevent accumulation
    for (let i = 1; i <= 6; i++) {
      instance.classList.remove(`${typePrefix}-form-${i}`);
    }
    instance.classList.add(`${typePrefix}-form-${colorIndex}`);

    // Direct style for border-left is applied by the CSS class with !important
    // but we ensure the class is present.

    const heading = instance.querySelector(".instance-title"); // Common class for title element
    if (heading) {
      // Remove other potential heading classes to avoid conflicts if type changes (though unlikely here)
      heading.classList.remove(
        "constraint-heading",
        "design-variable-heading",
        "objective-heading"
      );
      heading.classList.add(`${typePrefix}-heading`);
    }
  }

  // Also add initialization for existing constraints
  function initializeExistingConstraints() {
    // Get saved constraints from finalData if available
    const savedConstraints = window.finalData?.constraints || [];

    // Apply styling to existing constraint instances
    const existingConstraints = document.querySelectorAll(
      "#constraints-container .optimization-instance:not(.hidden-template)"
    );

    existingConstraints.forEach((instance, index) => {
      applyOptimizationInstanceStyling(instance, index, "constraint");

      // Check if flag dropdown should be disabled for this constraint
      const nameSelect = instance.querySelector(".constraint-name");
      const flagSelect = instance.querySelector(".constraint-flag");

      if (nameSelect && flagSelect) {
        const constraintType = nameSelect.value;

        // List of constraint types that don't require a flag
        const noFlagTypes = [
          "Q",
          "MAX_QAOA",
          "ALPHA",
          "MAX_BODY_RATE",
          "MAX_HEAT_FLUX",
          "SLACK_VARIABLE",
          "MAX_SENSED_ACC",
          "CUSTOM",
          "DCISS_IMPACT",
        ];

        // Disable flag dropdown if this constraint type doesn't need it
        if (noFlagTypes.includes(constraintType)) {
          flagSelect.disabled = true;
          flagSelect.title = "Flag not required for this constraint type";
          flagSelect.value = "";
          flagSelect.parentElement.classList.add("disabled-field");
        }
      }

      // Check if value field should be disabled for this constraint
      const nameSelect2 = instance.querySelector(".constraint-name");
      const valueInput = instance.querySelector(".constraint-value");

      if (nameSelect2 && valueInput) {
        const constraintType = nameSelect2.value;

        // List of constraint types that don't require a value
        const noValueTypes = ["CUSTOM", "DCISS_IMPACT"];

        // Disable value input if this constraint type doesn't need it
        if (noValueTypes.includes(constraintType)) {
          valueInput.disabled = true;
          valueInput.title = "Value not required for this constraint type";
          valueInput.value = "";
          valueInput.parentElement.classList.add("disabled-field");
        }
      }
    });

    // If we have saved constraints but no UI instances, create them
    if (
      savedConstraints.length > 0 &&
      constraintsContainer &&
      (!existingConstraints.length ||
        existingConstraints.length !== savedConstraints.length)
    ) {
      console.log(
        "Initializing constraints from saved data:",
        savedConstraints.length
      );

      // Clear the container
      constraintsContainer.innerHTML = "";

      // Reset the counter
      window.constraintCounter = 0;

      // Create instances for each saved constraint
      savedConstraints.forEach((constraint) => {
        addConstraintInstance();

        // Get the last created instance
        const instance = constraintsContainer.querySelector(
          ".optimization-instance:last-child"
        );
        if (!instance) return;

        // Populate basic fields
        const nameSelect = instance.querySelector(".constraint-name");
        const valueInput = instance.querySelector(".constraint-value");
        const typeSelect = instance.querySelector(".constraint-type");
        const conditionSelect = instance.querySelector(".constraint-condition");
        const flagSelect = instance.querySelector(".constraint-flag");
        const toleranceInput = instance.querySelector(".constraint-tolerance");
        const enableToggle = instance.querySelector(".constraint-enable");

        if (nameSelect) {
          nameSelect.value = constraint.name || "";

          // Check if this is a type that doesn't require a flag
          const noFlagTypes = [
            "Q",
            "MAX_QAOA",
            "ALPHA",
            "MAX_BODY_RATE",
            "MAX_HEAT_FLUX",
            "SLACK_VARIABLE",
            "MAX_SENSED_ACC",
            "CUSTOM",
            "DCISS_IMPACT",
          ];

          // Disable the flag dropdown if needed
          if (flagSelect && noFlagTypes.includes(constraint.name)) {
            flagSelect.disabled = true;
            flagSelect.title = "Flag not required for this constraint type";
            flagSelect.value = "";
            flagSelect.parentElement.classList.add("disabled-field");
          }

          // Trigger change event to populate additional fields
          nameSelect.dispatchEvent(new Event("change"));
        }

        // Set other fields
        if (valueInput && constraint.value !== undefined)
          valueInput.value = constraint.value;
        if (typeSelect) typeSelect.value = constraint.type || "INEQUALITY";
        if (conditionSelect && constraint.condition)
          conditionSelect.value = constraint.condition;
        if (flagSelect && constraint.flag) flagSelect.value = constraint.flag;
        if (toleranceInput && constraint.tolerance !== undefined)
          toleranceInput.value = constraint.tolerance;
        if (enableToggle)
          enableToggle.checked =
            constraint.enable !== undefined ? constraint.enable : true;

        // Handle additional constraint-specific fields (will be populated by the change event)
      });
    }
  }

  // Call this on page load
  initializeExistingConstraints();

  // Export functions to make them available to other modules
  window.optimizationModule = {
    addObjectiveFunctionForm,
    getObjectiveFunctionData,
    saveOptimizationData,
    getConstraintsData,
    addDesignVariableInstance,
    getDesignVariablesData,
    clearDesignVariablesForm,
    initializeExistingDesignVariables,
    initModeForm,
    getModeData,
    initializeExistingModeData,
    calculateInitialPopulationSize,
    parseInitialPopulationCSV,
  };

  // Make helper functions available globally
  window.optimizationHandler = {
    getObjectiveFunctionData,
    getConstraintsData,
    getDesignVariablesData,
    getModeData,
    populateObjectiveFlagDropdown: (selectElement) =>
      populateFlagDropdown(selectElement, "Objective"),
    populateConstraintFlagDropdown: (selectElement) =>
      populateFlagDropdown(selectElement, "Constraint"),
    populateDesignVariableDropdowns,
    populateSteeringSegmentDropdown,
    populateGenericSegmentDropdown,
    populateConstraintNameDropdown,
    populateAllConstraintNameDropdowns,
    addObjectiveFunctionForm,
    addConstraintInstance,
    addDesignVariableInstance,
    renumberDesignVariables,
    resetDesignVariableCounter: () => {
      designVariableCounter = 0;
      console.log("[Optimization] Design variable counter reset to 0");
    },
    handleDesignVariableCategoryChange,
    handleSteeringSegmentTypeChange,
    clearDesignVariablesForm,
    setupFileUpload,
    createAlgorithmTag,
    updateAlgorithmsCounter,
    toggleModeFields,
    setupAddAlgorithmButton,
    refreshAllDesignVariableSegmentDropdowns,
    saveOptimizationData, // Expose save function
    initOptimizationModule, // Expose init function for re-initialization if needed
    algorithmParameters, // Expose algorithm parameters
    calculateInitialPopulationSize, // Expose dynamic size calculation
    parseInitialPopulationCSV, // Expose CSV parsing with dynamic sizing
  };

  // --- Design Variables Listeners ---
  // REMOVED: Duplicate event listener that was causing 2 design variables to be created
  // The correct event listener is added later with the patched function
  // if (addDesignVariableBtn) {
  //   addDesignVariableBtn.addEventListener("click", addDesignVariableInstance);
  // }

  // --- NEW: Robust validation for Design Variables Form ---
  function validateDesignVariablesForm() {
    const designVariablesData = getDesignVariablesData();
    let isValid = true;
    let errors = [];
    const nameSet = new Set();

    // Helper to show error on a field
    function showFieldError(input, message) {
      if (input) {
        input.classList.add("error-field");
        if (
          window.FormValidator &&
          typeof FormValidator.showError === "function"
        ) {
          FormValidator.showError(input, message);
        }
      }
    }

    // Helper to remove error from a field
    function removeFieldError(input) {
      if (input) input.classList.remove("error-field");
    }

    // Validate each instance
    const instances = designVariablesContainer.querySelectorAll(
      ".optimization-instance:not(.hidden-template)"
    );

    instances.forEach((instance, idx) => {
      const categorySelect = instance.querySelector(".dv-category");
      const nameInput = instance.querySelector(".dv-name");
      const category = categorySelect ? categorySelect.value : null;
      const name = nameInput ? nameInput.value.trim() : null;
      let localErrors = [];

      // Remove previous error highlights
      removeFieldError(categorySelect);
      removeFieldError(nameInput);

      // Category and Name required
      if (!category) {
        isValid = false;
        localErrors.push("Category is required");
        showFieldError(categorySelect, "Category is required");
      }
      if (!name) {
        isValid = false;
        localErrors.push("Name is required");
        showFieldError(nameInput, "Name is required");
      } else if (nameSet.has(name)) {
        isValid = false;
        localErrors.push("Name must be unique");
        showFieldError(nameInput, "Name must be unique");
      } else {
        nameSet.add(name);
      }

      // Category-specific validation
      const categoryFields = instance.querySelector(
        `.dv-category-fields[data-category="${category}"]`
      );
      if (categoryFields) {
        // Helper for number/array validation
        const isNumber = (v) => !isNaN(parseFloat(v));
        const isArrayOfNumbers = (arr) =>
          Array.isArray(arr) && arr.every((v) => isNumber(v));
        // Common selectors
        const flagSelect = categoryFields.querySelector(".dv-flag");
        const controlVarInput = categoryFields.querySelector(
          ".dv-control-variable"
        );
        const lowerBoundInput = categoryFields.querySelector(".dv-lower-bound");
        const upperBoundInput = categoryFields.querySelector(".dv-upper-bound");
        const segmentSelect = categoryFields.querySelector(".dv-segment");
        // For STEERING
        const segmentTypeSelect =
          categoryFields.querySelector(".dv-segment-type");
        // For PROFILE
        const subTypeFields = categoryFields.querySelector(
          `.dv-steering-type-fields[data-segment-type="PROFILE"]`
        );
        // Remove previous error highlights
        [
          flagSelect,
          controlVarInput,
          lowerBoundInput,
          upperBoundInput,
          segmentSelect,
          segmentTypeSelect,
        ].forEach(removeFieldError);

        switch (category) {
          case "CUT_OFF":
          case "SEQUENCE":
            if (flagSelect && !flagSelect.value) {
              isValid = false;
              localErrors.push("Flag is required");
              showFieldError(flagSelect, "Flag is required");
            }
            if (controlVarInput && !controlVarInput.value) {
              isValid = false;
              localErrors.push("Control Variable is required");
              showFieldError(controlVarInput, "Control Variable is required");
            }
            if (lowerBoundInput && !isNumber(lowerBoundInput.value)) {
              isValid = false;
              localErrors.push("Lower Bound must be a number");
              showFieldError(lowerBoundInput, "Lower Bound must be a number");
            }
            if (upperBoundInput && !isNumber(upperBoundInput.value)) {
              isValid = false;
              localErrors.push("Upper Bound must be a number");
              showFieldError(upperBoundInput, "Upper Bound must be a number");
            }
            break;
          case "PAYLOAD":
          case "AZIMUTH":
            if (controlVarInput && !controlVarInput.value) {
              isValid = false;
              localErrors.push("Control Variable(s) required");
              showFieldError(controlVarInput, "Control Variable(s) required");
            }
            if (lowerBoundInput && lowerBoundInput.value) {
              const arr = lowerBoundInput.value.split(",").map((v) => v.trim());
              if (!isArrayOfNumbers(arr)) {
                isValid = false;
                localErrors.push("Lower Bound(s) must be numbers");
                showFieldError(
                  lowerBoundInput,
                  "Lower Bound(s) must be numbers"
                );
              }
            }
            if (upperBoundInput && upperBoundInput.value) {
              const arr = upperBoundInput.value.split(",").map((v) => v.trim());
              if (!isArrayOfNumbers(arr)) {
                isValid = false;
                localErrors.push("Upper Bound(s) must be numbers");
                showFieldError(
                  upperBoundInput,
                  "Upper Bound(s) must be numbers"
                );
              }
            }
            break;
          case "PROPULSION":
            if (segmentSelect && !segmentSelect.value) {
              isValid = false;
              localErrors.push("Segment is required");
              showFieldError(segmentSelect, "Segment is required");
            }
            if (controlVarInput && !controlVarInput.value) {
              isValid = false;
              localErrors.push("Control Variable(s) required");
              showFieldError(controlVarInput, "Control Variable(s) required");
            }
            if (lowerBoundInput && lowerBoundInput.value) {
              const arr = lowerBoundInput.value.split(",").map((v) => v.trim());
              if (!isArrayOfNumbers(arr)) {
                isValid = false;
                localErrors.push("Lower Bound(s) must be numbers");
                showFieldError(
                  lowerBoundInput,
                  "Lower Bound(s) must be numbers"
                );
              }
            }
            if (upperBoundInput && upperBoundInput.value) {
              const arr = upperBoundInput.value.split(",").map((v) => v.trim());
              if (!isArrayOfNumbers(arr)) {
                isValid = false;
                localErrors.push("Upper Bound(s) must be numbers");
                showFieldError(
                  upperBoundInput,
                  "Upper Bound(s) must be numbers"
                );
              }
            }
            break;
          case "STEERING":
            if (segmentSelect && !segmentSelect.value) {
              isValid = false;
              localErrors.push("Steering Segment is required");
              showFieldError(segmentSelect, "Steering Segment is required");
            }
            if (segmentTypeSelect && !segmentTypeSelect.value) {
              isValid = false;
              localErrors.push("Segment Type is required");
              showFieldError(segmentTypeSelect, "Segment Type is required");
            }
            // Validate sub-type fields for PROFILE
            if (
              segmentTypeSelect &&
              segmentTypeSelect.value === "PROFILE" &&
              subTypeFields
            ) {
              const subControlVar = subTypeFields.querySelector(
                ".dv-control-variable"
              );
              const subLowerBound =
                subTypeFields.querySelector(".dv-lower-bound");
              const subUpperBound =
                subTypeFields.querySelector(".dv-upper-bound");
              const subAxis = subTypeFields.querySelector(".dv-axis");
              const subIndVar = subTypeFields.querySelector(".dv-ind-variable");
              const subIndVector =
                subTypeFields.querySelector(".dv-ind-vector");
              [
                subControlVar,
                subLowerBound,
                subUpperBound,
                subAxis,
                subIndVar,
                subIndVector,
              ].forEach(removeFieldError);
              if (subControlVar && !subControlVar.value) {
                isValid = false;
                localErrors.push("Profile Control Variable required");
                showFieldError(
                  subControlVar,
                  "Profile Control Variable required"
                );
              }
              if (subLowerBound && subLowerBound.value) {
                const arr = subLowerBound.value.split(",").map((v) => v.trim());
                if (!isArrayOfNumbers(arr)) {
                  isValid = false;
                  localErrors.push("Profile Lower Bound(s) must be numbers");
                  showFieldError(
                    subLowerBound,
                    "Profile Lower Bound(s) must be numbers"
                  );
                }
              }
              if (subUpperBound && subUpperBound.value) {
                const arr = subUpperBound.value.split(",").map((v) => v.trim());
                if (!isArrayOfNumbers(arr)) {
                  isValid = false;
                  localErrors.push("Profile Upper Bound(s) must be numbers");
                  showFieldError(
                    subUpperBound,
                    "Profile Upper Bound(s) must be numbers"
                  );
                }
              }
              if (subAxis && !subAxis.value) {
                isValid = false;
                localErrors.push("Profile Axis is required");
                showFieldError(subAxis, "Profile Axis is required");
              }
              if (subIndVar && !subIndVar.value) {
                isValid = false;
                localErrors.push("Profile Independent Variable is required");
                showFieldError(
                  subIndVar,
                  "Profile Independent Variable is required"
                );
              }
              if (subIndVector && !subIndVector.value) {
                isValid = false;
                localErrors.push("Profile Independent Vector Node(s) required");
                showFieldError(
                  subIndVector,
                  "Profile Independent Vector Node(s) required"
                );
              }
            }
            break;
          default:
            break;
        }
      }

      if (localErrors.length > 0) {
        errors.push(`Design Variable ${idx + 1}: ${localErrors.join(", ")}`);
      }
    });

    // Show error toast if not valid
    if (!isValid) {
      const errorSummary =
        errors.length > 2
          ? `${errors.slice(0, 2).join(", ")} and ${
              errors.length - 2
            } more issue(s)`
          : errors.join(", ");
      if (
        window.FormValidator &&
        typeof FormValidator.showToastMessage === "function"
      ) {
        FormValidator.showToastMessage(
          "error",
          "Design Variables Validation Error",
          `Please fix these issues: ${errorSummary}`
        );
      }
    }
    return isValid;
  }
  // --- END NEW VALIDATION ---

  if (designVariablesForm) {
    designVariablesForm.addEventListener("submit", (event) => {
      event.preventDefault();
      console.log("Design Variables form submitted.");
      // Use new validation
      const isValid = validateDesignVariablesForm();
      if (isValid) {
        const designVariablesData = getDesignVariablesData();
        saveOptimizationData("designVariables", designVariablesData);
        // Update section state if using state management
        if (window.sectionStates && window.sectionStates["design-variables"]) {
          window.sectionStates["design-variables"].isSaved = true;
          // ... update other state properties ...
          if (typeof updateSidebarStates === "function") {
            updateSidebarStates();
          }
        }
      }
    });

    // Listener for the clear button
    const clearDVBtn = designVariablesForm.querySelector(
      "#clear-design-variables-btn"
    );
    if (clearDVBtn) {
      clearDVBtn.addEventListener("click", clearDesignVariablesForm);
    }
  }

  // REMOVED: Auto-create initial design variable instance on page load
  // This was creating a duplicate design variable form since the design variables
  // button click handler also creates one when the container is empty
  // if (
  //   designVariablesContainer &&
  //   designVariablesContainer.children.length === 0
  // ) {
  //   console.log("Automatically creating initial design variable form on load");
  //   addDesignVariableInstance();
  // }

  // Function to initialize existing design variables
  function initializeExistingDesignVariables() {
    console.debug("Initializing existing design variable instances...");
    const instances = designVariablesContainer.querySelectorAll(
      ".optimization-instance:not(.hidden-template)"
    );
    instances.forEach((instance, index) => {
      console.debug(`Initializing instance ${index + 1}:`, instance);
      const categorySelect = instance.querySelector(".dv-category");
      const typeSelect = instance.querySelector(".dv-steering-segment-type");

      // Restore data if available (e.g., from a loaded file)
      // This part is highly dependent on how data is stored and passed for initialization
      const instanceData = instance.dataset.initialData // Assuming data is passed via dataset
        ? JSON.parse(instance.dataset.initialData)
        : {};

      if (categorySelect) {
        if (instanceData.category) categorySelect.value = instanceData.category;
        handleDesignVariableCategoryChange({ target: categorySelect }); // Corrected function name
      }

      const nameInput = instance.querySelector(".dv-name");
      if (nameInput && instanceData.name) {
        nameInput.value = instanceData.name;
      }

      if (categorySelect && categorySelect.value === "STEERING" && typeSelect) {
        if (instanceData.segment_type)
          typeSelect.value = instanceData.segment_type;
        handleSteeringSegmentTypeChange({ target: typeSelect });

        const segmentType = typeSelect.value;
        const categoryFields = instance.querySelector(
          '.dv-category-fields[data-category="STEERING"]'
        );
        const typeFields =
          categoryFields?.querySelector(
            `.dv-steering-type-fields[data-segment-type="${segmentType}"]`
          ) ?? null;

        if (typeFields) {
          if (["PROFILE", "CONST_BODYRATE", "CLG"].includes(segmentType)) {
            setupPerAxisBounds(categoryFields, typeFields); // This also handles pre-selecting checkboxes
            // Pre-fill bounds if data exists
            if (instanceData.axes && instanceData.axes.length > 0) {
              instanceData.axes.forEach((axis, axisIndex) => {
                const axisCb = typeFields.querySelector(
                  `.dv-axis-select-cb[value="${axis}"]`
                );
                if (axisCb) axisCb.checked = true; // Check the box

                // Simulate a change event on the checkbox to trigger bound field visibility and population
                const event = new Event("change", { bubbles: true });
                axisCb.dispatchEvent(event);

                const lbInput = typeFields.querySelector(
                  `.dv-lower-bound-${axis.toLowerCase()}`
                );
                const ubInput = typeFields.querySelector(
                  `.dv-upper-bound-${axis.toLowerCase()}`
                );

                if (
                  lbInput &&
                  instanceData.lower_bound &&
                  instanceData.lower_bound[axisIndex] !== undefined
                ) {
                  lbInput.value = instanceData.lower_bound[axisIndex];
                }
                if (
                  ubInput &&
                  instanceData.upper_bound &&
                  instanceData.upper_bound[axisIndex] !== undefined
                ) {
                  ubInput.value = instanceData.upper_bound[axisIndex];
                }
              });
            }
            // Pre-fill other common fields for these types
            const controlVarInput = typeFields.querySelector(
              ".dv-control-variable"
            );
            if (controlVarInput && instanceData.control_variable)
              controlVarInput.value = instanceData.control_variable;

            if (segmentType === "PROFILE") {
              const indVarSelect = typeFields.querySelector(".dv-ind-variable");
              const indVecInput = typeFields.querySelector(".dv-ind-vector");
              if (indVarSelect && instanceData.independent_variable)
                indVarSelect.value = instanceData.independent_variable;
              if (indVecInput && instanceData.independent_vector_nodes)
                indVecInput.value =
                  instanceData.independent_vector_nodes.join(", ");
            }
          } else if (segmentType === "ZERO_RATE") {
            const controlVarInput = typeFields.querySelector(
              ".dv-control-variable"
            );
            const lowerBoundInput = typeFields.querySelector(".dv-lower-bound");
            const upperBoundInput = typeFields.querySelector(".dv-upper-bound");

            if (controlVarInput && instanceData.control_variable) {
              controlVarInput.value = instanceData.control_variable;
            }
            if (lowerBoundInput && instanceData.lower_bound) {
              lowerBoundInput.value = instanceData.lower_bound;
            }
            if (upperBoundInput && instanceData.upper_bound) {
              upperBoundInput.value = instanceData.upper_bound;
            }
          }
        }
      }

      const paramTable = instance.querySelector(
        ".optimization-parameters-table"
      );
      const toggleButton = instance.querySelector(".toggle-params-btn");
      if (paramTable && toggleButton) {
        const isTableVisible = !paramTable.classList.contains("hidden");
        toggleButton.textContent = isTableVisible
          ? "Hide Parameters"
          : "Show Parameters";
      }
    });
    console.debug("Finished initializing existing design variables.");
  }

  // Make sure this is called after the DOM is fully loaded
  // if it's not already handled elsewhere.
  // window.addEventListener('load', initializeExistingDesignVariables);

  // --- END OF PATCHED SECTION for initializeExistingDesignVariables ---

  // Simplified window.onload, focusing on initializing existing DV if any and general setup
  window.addEventListener("load", () => {
    console.log("Window loaded. Initializing optimization UI components.");

    // Setup for existing Design Variable instances
    initializeExistingDesignVariables(); // This will handle category and type changes internally

    // Add event listener for adding new design variables
    const addDvButton = document.getElementById("add-design-variable-btn"); // Corrected ID
    if (addDvButton) {
      addDvButton.addEventListener("click", patchedAddDesignVariableInstance);
    } else {
      console.error("Add Design Variable button not found.");
    }

    // Other initializations
    // setupGlobalEventListeners(); // For delete buttons, etc. - Commented out as function is not defined
    // updateDesignVariablesJsonOutput(); // Initial update - Commented out as function is not defined
    // Any other on-load setup tasks
  });

  // =========================================
  // MODE FORM FUNCTIONS
  // =========================================

  // Mode form elements
  const modeNormalRadio = document.getElementById("mode-normal");
  const modeArchipelagoRadio = document.getElementById("mode-archipelago");
  const normalModeFields = document.getElementById("normal-mode-fields");
  const archipelagoModeFields = document.getElementById(
    "archipelago-mode-fields"
  );

  // File upload elements
  const normalCsvUploadBtn = document.getElementById("normal-csv-upload-btn");
  const normalCsvClearBtn = document.getElementById("normal-csv-clear-btn");
  const normalCsvUpload = document.getElementById("normal-csv-upload");
  const normalCsvFilename = document.getElementById("normal-csv-filename");

  const archipelagoCsvUploadBtn = document.getElementById(
    "archipelago-csv-upload-btn"
  );
  const archipelagoCsvClearBtn = document.getElementById(
    "archipelago-csv-clear-btn"
  );
  const archipelagoCsvUpload = document.getElementById(
    "archipelago-csv-upload"
  );
  const archipelagoCsvFilename = document.getElementById(
    "archipelago-csv-filename"
  );

  // Archipelago algorithm elements
  const addAlgorithmBtn = document.getElementById("add-algorithm-btn");
  const archipelagoAlgorithm = document.getElementById("archipelago-algorithm");
  const selectedAlgorithmsContainer = document.getElementById(
    "selected-algorithms-container"
  );
  const algorithmsCounter = document.getElementById("algorithms-counter");

  // Store selected algorithms
  let selectedAlgorithms = [];
  const MAX_ALGORITHMS = 3;

  // Function to toggle between normal and archipelago mode
  function toggleModeFields() {
    if (modeNormalRadio && modeNormalRadio.checked) {
      normalModeFields.style.display = "block";
      archipelagoModeFields.style.display = "none";
    } else if (modeArchipelagoRadio && modeArchipelagoRadio.checked) {
      normalModeFields.style.display = "none";
      archipelagoModeFields.style.display = "block";
    }
  }

  // Function to setup file upload for CSV files
  function setupFileUpload(
    uploadBtn,
    clearBtn,
    fileInput,
    filenameDisplay,
    fileStoreCallback
  ) {
    if (!uploadBtn || !fileInput || !filenameDisplay) return;

    // Click on upload button triggers file input
    uploadBtn.addEventListener("click", () => {
      fileInput.click();
    });

    // When file is selected, update the display and show clear button
    fileInput.addEventListener("change", () => {
      if (fileInput.files.length > 0) {
        const fileName = fileInput.files[0].name;
        filenameDisplay.value = fileName;
        clearBtn.style.display = "block";

        // Read file if callback provided
        if (typeof fileStoreCallback === "function") {
          const reader = new FileReader();
          reader.onload = (e) => {
            fileStoreCallback(e.target.result, fileName);
          };
          reader.readAsText(fileInput.files[0]);
        }
      }
    });

    // Clear button functionality
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        fileInput.value = ""; // Clear file input
        filenameDisplay.value = ""; // Clear displayed filename
        clearBtn.style.display = "none"; // Hide clear button

        if (typeof fileStoreCallback === "function") {
          fileStoreCallback(null, null); // Reset stored file data
        }
      });
    }
  }

  // Function to update the algorithms counter
  function updateAlgorithmsCounter() {
    if (algorithmsCounter) {
      algorithmsCounter.textContent = `${selectedAlgorithms.length}/${MAX_ALGORITHMS} selected`;

      // Visual feedback when limit is reached
      if (selectedAlgorithms.length >= MAX_ALGORITHMS) {
        algorithmsCounter.classList.add("limit-reached");
        if (addAlgorithmBtn) addAlgorithmBtn.disabled = true;
      } else {
        algorithmsCounter.classList.remove("limit-reached");
        if (addAlgorithmBtn) addAlgorithmBtn.disabled = false;
      }
    }
  }

  // Function to create an algorithm tag/chip
  function createAlgorithmTag(algorithm) {
    // Generate a unique ID for this tag
    const tagId = `algo-${algorithm.toLowerCase()}-${Date.now()}`;

    // Create the tag
    const tag = document.createElement("div");
    tag.className = "algorithm-tag";
    tag.id = tagId;
    tag.dataset.algorithm = algorithm;

    // Tag text
    const tagText = document.createElement("span");
    tagText.className = "algorithm-name";
    tagText.textContent = algorithm;

    // Tag remove button
    const removeButton = document.createElement("button");
    removeButton.className = "remove-algorithm";
    removeButton.innerHTML = "&times;"; // × symbol
    removeButton.title = "Remove this algorithm";

    // Add parameter indicator
    const paramIndicator = document.createElement("span");
    paramIndicator.className = "params-indicator";
    paramIndicator.innerHTML = "⚙️"; // Gear emoji
    paramIndicator.title = "Click to edit parameters";

    // Add elements to tag
    tag.appendChild(tagText);
    tag.appendChild(paramIndicator);
    tag.appendChild(removeButton);

    // Add event listener for tag click to edit parameters
    tag.addEventListener("click", (event) => {
      // Don't trigger if the remove button was clicked
      if (event.target.classList.contains("remove-algorithm")) {
        return;
      }

      // Open parameters modal
      openAlgorithmParamsModal(algorithm, tagId);
    });

    // Add event listener for remove button
    removeButton.addEventListener("click", (event) => {
      event.stopPropagation(); // Prevent tag click

      // Remove the tag
      tag.remove();

      // Remove parameters from store
      if (window.optimizationHandler.clearArchipelagoAlgorithmParams) {
        window.optimizationHandler.clearArchipelagoAlgorithmParams(tagId);
      }

      // Update counter
      if (window.optimizationHandler.updateAlgorithmsCounter) {
        window.optimizationHandler.updateAlgorithmsCounter();
      } else if (window.updateAlgorithmsCounter) {
        updateAlgorithmsCounter();
      }
    });

    return tag;
  }

  // Function to get the mode data
  function getModeData() {
    const modeData = {};
    const isNormalMode = document.getElementById("mode-normal").checked;

    modeData.type = isNormalMode ? "normal" : "archipelago";

    if (isNormalMode) {
      // Get algorithm selection
      const algorithm = document.getElementById("normal-algorithm").value;
      const lowerBound = parseFloat(
        document.getElementById("normal-lower-bound").value
      );
      const upperBound = parseFloat(
        document.getElementById("normal-upper-bound").value
      );
      const population = parseInt(
        document.getElementById("normal-population").value
      );
      const setPopulation = document.getElementById(
        "normal-set-population"
      ).checked;
      const problemStrategy = document.getElementById(
        "normal-problem-strategy"
      ).value;

      modeData.algorithm = algorithm;
      modeData.map = {
        lower: lowerBound,
        upper: upperBound,
      };
      modeData.population = population;
      modeData.setPopulation = setPopulation;
      modeData.problemStrategy = problemStrategy;

      // Get file information if setPopulation is enabled
      if (setPopulation && window.optimizationHandler.normalCsvFile) {
        modeData.initialPopulationFile =
          window.optimizationHandler.normalCsvFile.name;
        modeData.initialPopulationData =
          window.optimizationHandler.normalCsvData;
      }

      // Collect algorithm parameters
      const paramsContainer = document.getElementById(
        "normal-algorithm-params"
      );
      const algoParams = {};

      if (paramsContainer && algorithm) {
        const paramInputs = paramsContainer.querySelectorAll(
          ".algorithm-param-input"
        );

        const algorithmDef = window.algorithmParameters[algorithm] || {};

        paramInputs.forEach((input) => {
          const paramKey = input.dataset.parameter;
          let value;

          // Get parameter definition
          const paramDef = algorithmDef[paramKey] || {};

          // Handle different input types with proper type conversion
          if (input.type === "checkbox") {
            value = input.checked;
          } else if (input.type === "number" || paramDef.type === "number") {
            value = parseFloat(input.value);
            if (isNaN(value)) value = null;
          } else if (input.tagName === "SELECT") {
            // For select, convert to proper type based on options
            value = input.value;
            // If all options are numbers, convert to number
            if (
              paramDef.options &&
              paramDef.options.every(
                (opt) => typeof opt === "number" || !isNaN(Number(opt))
              )
            ) {
              value = Number(value);
            }
            // If boolean options, convert to actual boolean
            else if (value === "true" || value === "false") {
              value = value === "true";
            }
            // Additional check for boolean parameters with string representations
            else if (
              paramDef.options &&
              paramDef.options.length === 2 &&
              paramDef.options.includes(true) &&
              paramDef.options.includes(false)
            ) {
              // Force conversion to boolean for boolean parameters
              value = value === "true" || value === true;
            }
          } else {
            value = input.value;
            // Try to convert known numeric or boolean values in string form
            if (value === "true") {
              value = true;
            } else if (value === "false") {
              value = false;
            } else if (!isNaN(Number(value)) && value.trim() !== "") {
              value = Number(value);
            }
          }

          if (paramKey && value !== undefined) {
            // Special handling for known boolean parameters
            if (paramKey === "memory" && value !== null) {
              algoParams[paramKey] = value === true || value === "true";
            } else {
              algoParams[paramKey] = value;
            }
          }
        });

        modeData.parameters = algoParams;
      }
    } else {
      // Archipelago mode data collection
      const topology = document.getElementById("archipelago-topology").value;
      const migrationType = document.getElementById(
        "archipelago-migration-type"
      ).value;
      const migrationHandling = document.getElementById(
        "archipelago-migration-handling"
      ).value;
      const lowerBound = parseFloat(
        document.getElementById("archipelago-lower-bound").value
      );
      const upperBound = parseFloat(
        document.getElementById("archipelago-upper-bound").value
      );
      const population = parseInt(
        document.getElementById("archipelago-population").value
      );
      const setPopulation = document.getElementById(
        "archipelago-set-population"
      ).checked;

      modeData.topology = topology;
      modeData.migrationType = migrationType;
      modeData.migrationHandling = migrationHandling;
      modeData.map = {
        lower: lowerBound,
        upper: upperBound,
      };
      modeData.population = population;
      modeData.setPopulation = setPopulation;

      // Get file information if setPopulation is enabled
      if (setPopulation && window.optimizationHandler.archipelagoCsvFile) {
        modeData.initialPopulationFile =
          window.optimizationHandler.archipelagoCsvFile.name;
        modeData.initialPopulationData =
          window.optimizationHandler.archipelagoCsvData;
      }

      // Get selected algorithms with their parameters
      const algorithmTags = document
        .getElementById("selected-algorithms-container")
        .querySelectorAll(".algorithm-tag");

      const algorithms = [];

      algorithmTags.forEach((tag) => {
        const algo = {
          name: tag.dataset.algorithm,
        };

        // Get parameters from parameter store if they exist
        if (
          window.optimizationHandler.archipelagoParamsStore &&
          window.optimizationHandler.archipelagoParamsStore[tag.id]
        ) {
          algo.parameters =
            window.optimizationHandler.archipelagoParamsStore[tag.id];
        }

        algorithms.push(algo);
      });

      modeData.algorithms = algorithms;
    }

    return modeData;
  }

  // Function to format mode data for JSON output
  function formatModeDataForJSON(modeData) {
    const jsonData = {};

    // Set the mode type
    jsonData.mode = modeData.type;

    // Format the map array
    jsonData.map = [modeData.map.lower, modeData.map.upper];

    // Add population
    jsonData.population = modeData.population;

    // Add initial population configuration if setPopulation is enabled
    const initialPopulationKey = "initial_control1"; // Default name as specified in requirements

    if (modeData.setPopulation) {
      jsonData.initial_population = [
        {
          population: initialPopulationKey,
          set_population: "YES",
        },
      ];

      // Include CSV data if available
      if (
        modeData.initialPopulationData &&
        Array.isArray(modeData.initialPopulationData)
      ) {
        jsonData[initialPopulationKey] = modeData.initialPopulationData;
      }
    } else {
      // Still include the structure but with empty population and set_population: "OFF"
      jsonData.initial_population = [
        {
          population: initialPopulationKey,
          set_population: "NO",
        },
      ];

      // Add default array of zeros with dynamic size
      const dynamicSize = calculateInitialPopulationSize();
      jsonData[initialPopulationKey] = Array(dynamicSize).fill(0);
    }

    if (modeData.type === "normal") {
      // For normal mode
      jsonData.problem_strategy = modeData.problemStrategy;
      jsonData.optimizer = modeData.algorithm;

      // Add algorithm parameters if present
      if (modeData.algorithm && modeData.parameters) {
        jsonData[modeData.algorithm] = modeData.parameters;
      }
    } else {
      // For archipelago mode
      jsonData.archipelago = {
        algorithms: modeData.algorithms.map((algo) => algo.name),
        topology: modeData.topology.toLowerCase().replace(" ", "_"),
        migration_type: modeData.migrationType.toLowerCase(),
        migrant_handling: modeData.migrationHandling.toLowerCase(),
      };

      // Add problem strategy
      jsonData.problem_strategy = "ignore_o"; // Default value for archipelago mode

      // Add algorithm parameters separately
      modeData.algorithms.forEach((algo) => {
        if (algo.name && algo.parameters) {
          jsonData[algo.name] = algo.parameters;
        }
      });
    }

    return jsonData;
  }

  // Initialize the mode form
  function initModeForm() {
    try {
      // Set up field visibility toggles
      const normalModeRadio = document.getElementById("mode-normal");
      const archipelagoModeRadio = document.getElementById("mode-archipelago");
      const normalModeFields = document.getElementById("normal-mode-fields");
      const archipelagoModeFields = document.getElementById(
        "archipelago-mode-fields"
      );

      if (
        normalModeRadio &&
        archipelagoModeRadio &&
        normalModeFields &&
        archipelagoModeFields
      ) {
        // Initial visibility based on default selection
        normalModeFields.style.display = normalModeRadio.checked
          ? "block"
          : "none";
        archipelagoModeFields.style.display = archipelagoModeRadio.checked
          ? "block"
          : "none";

        // Event listeners for mode toggling
        normalModeRadio.addEventListener("change", function () {
          enhancedToggleMode();
        });

        archipelagoModeRadio.addEventListener("change", function () {
          enhancedToggleMode();
        });
      }

      // Set up event listener for normal algorithm selection
      const normalAlgorithmSelect = document.getElementById("normal-algorithm");
      if (normalAlgorithmSelect) {
        console.log("Adding change event listener to normal algorithm select");
        // Remove any existing listeners to avoid duplicates
        const newSelect = normalAlgorithmSelect.cloneNode(true);
        normalAlgorithmSelect.parentNode.replaceChild(
          newSelect,
          normalAlgorithmSelect
        );

        // Add the event listener
        newSelect.addEventListener("change", function (event) {
          const algorithmValue = event.target.value;
          console.log(`Normal algorithm selected: ${algorithmValue}`);
          const paramsContainer = document.getElementById(
            "normal-algorithm-params"
          );

          if (paramsContainer && algorithmValue) {
            displayAlgorithmParameters(
              algorithmValue,
              paramsContainer,
              "normal",
              {} // Empty object for now, will be populated when loading existing data
            );
          } else {
            console.warn("Could not display algorithm parameters:", {
              algorithm: algorithmValue,
              container: paramsContainer ? "found" : "not found",
            });
          }
        });

        // If there's already a value selected, trigger the change event
        if (newSelect.value) {
          console.log(
            `Triggering change event for pre-selected algorithm: ${newSelect.value}`
          );
          newSelect.dispatchEvent(new Event("change"));
        }
      } else {
        console.warn("Normal algorithm select element not found");
      }

      // Set up the file upload functionality
      const normalCsvUploadBtn = document.getElementById(
        "normal-csv-upload-btn"
      );
      const normalCsvClearBtn = document.getElementById("normal-csv-clear-btn");
      const normalCsvInput = document.getElementById("normal-csv-upload");
      const normalCsvFilename = document.getElementById("normal-csv-filename");

      if (
        normalCsvUploadBtn &&
        normalCsvClearBtn &&
        normalCsvInput &&
        normalCsvFilename
      ) {
        setupFileUpload(
          normalCsvUploadBtn,
          normalCsvClearBtn,
          normalCsvInput,
          normalCsvFilename,
          (file) => {
            console.log("Normal CSV file selected:", file.name);
            window.optimizationHandler.normalCsvFile = file;
          }
        );
      }

      // Set up archipelago algorithm selection functionality
      const archipelagoAlgorithmSelect = document.getElementById(
        "archipelago-algorithm"
      );
      const addAlgorithmBtn = document.getElementById("add-algorithm-btn");

      if (archipelagoAlgorithmSelect && addAlgorithmBtn) {
        this.setupAddAlgorithmButton = setupAddAlgorithmButton;
      }

      // Set up archipelago CSV upload
      const archipelagoCsvUploadBtn = document.getElementById(
        "archipelago-csv-upload-btn"
      );
      const archipelagoCsvClearBtn = document.getElementById(
        "archipelago-csv-clear-btn"
      );
      const archipelagoCsvInput = document.getElementById(
        "archipelago-csv-upload"
      );
      const archipelagoCsvFilename = document.getElementById(
        "archipelago-csv-filename"
      );

      if (
        archipelagoCsvUploadBtn &&
        archipelagoCsvClearBtn &&
        archipelagoCsvInput &&
        archipelagoCsvFilename
      ) {
        setupFileUpload(
          archipelagoCsvUploadBtn,
          archipelagoCsvClearBtn,
          archipelagoCsvInput,
          archipelagoCsvFilename,
          (file) => {
            console.log("Archipelago CSV file selected:", file.name);
            window.optimizationHandler.archipelagoCsvFile = file;
          }
        );
      }

      console.log("Mode form initialized successfully");
    } catch (error) {
      console.error("Error initializing mode form:", error);
    }
  }

  // Function to initialize the mode form with existing data
  function initializeExistingModeData() {
    try {
      // Get mode data from localStorage or other source
      const missionData = JSON.parse(localStorage.getItem("missionData")) || {};
      const modeData = missionData.optimization?.mode;

      if (!modeData) {
        console.log("No saved mode data found.");
        return;
      }

      console.log("Initializing mode form with saved data:", modeData);

      // Select the appropriate mode radio button
      const isNormalMode = modeData.type === "normal";
      const normalModeRadio = document.getElementById("mode-normal");
      const archipelagoModeRadio = document.getElementById("mode-archipelago");

      if (normalModeRadio && archipelagoModeRadio) {
        if (isNormalMode) {
          normalModeRadio.checked = true;
        } else {
          archipelagoModeRadio.checked = true;
        }
        // Trigger mode toggle to update UI
        enhancedToggleMode();
      }

      if (isNormalMode) {
        // Normal mode fields
        const normalAlgorithm = document.getElementById("normal-algorithm");
        const normalLowerBound = document.getElementById("normal-lower-bound");
        const normalUpperBound = document.getElementById("normal-upper-bound");
        const normalPopulation = document.getElementById("normal-population");
        const normalSetPopulation = document.getElementById(
          "normal-set-population"
        );
        const normalProblemStrategy = document.getElementById(
          "normal-problem-strategy"
        );
        const normalCsvFilename = document.getElementById(
          "normal-csv-filename"
        );

        // Set values if they exist in modeData
        if (normalAlgorithm && modeData.algorithm) {
          normalAlgorithm.value = modeData.algorithm;

          // Display algorithm parameters if algorithm is selected
          if (modeData.algorithm) {
            displayAlgorithmParameters(
              modeData.algorithm,
              document.getElementById("normal-algorithm-params"),
              "normal",
              modeData.parameters || {} // Load stored parameters
            );
          }
        }

        if (
          normalLowerBound &&
          modeData.map &&
          modeData.map.lower !== undefined
        ) {
          normalLowerBound.value = modeData.map.lower;
        }

        if (
          normalUpperBound &&
          modeData.map &&
          modeData.map.upper !== undefined
        ) {
          normalUpperBound.value = modeData.map.upper;
        }

        if (normalPopulation && modeData.population !== undefined) {
          normalPopulation.value = modeData.population;
        }

        if (normalSetPopulation && modeData.setPopulation !== undefined) {
          normalSetPopulation.checked = modeData.setPopulation;
          // Update CSV upload visibility
          toggleCsvUploadVisibility("normal");
        }

        if (normalProblemStrategy && modeData.problemStrategy) {
          normalProblemStrategy.value = modeData.problemStrategy;
        }

        if (normalCsvFilename && modeData.initialPopulationFile) {
          normalCsvFilename.value = modeData.initialPopulationFile;
          document.getElementById("normal-csv-clear-btn").style.display =
            "inline-block";
        }
      } else {
        // Archipelago mode fields
        const archipelagoTopology = document.getElementById(
          "archipelago-topology"
        );
        const archipelagoMigrationType = document.getElementById(
          "archipelago-migration-type"
        );
        const archipelagoMigrationHandling = document.getElementById(
          "archipelago-migration-handling"
        );
        const archipelagoLowerBound = document.getElementById(
          "archipelago-lower-bound"
        );
        const archipelagoUpperBound = document.getElementById(
          "archipelago-upper-bound"
        );
        const archipelagoPopulation = document.getElementById(
          "archipelago-population"
        );
        const archipelagoSetPopulation = document.getElementById(
          "archipelago-set-population"
        );
        const archipelagoCsvFilename = document.getElementById(
          "archipelago-csv-filename"
        );
        const selectedAlgorithmsContainer = document.getElementById(
          "selected-algorithms-container"
        );

        // Set values if they exist in modeData
        if (archipelagoTopology && modeData.topology) {
          archipelagoTopology.value = modeData.topology;
        }

        if (archipelagoMigrationType && modeData.migrationType) {
          archipelagoMigrationType.value = modeData.migrationType;
        }

        if (archipelagoMigrationHandling && modeData.migrationHandling) {
          archipelagoMigrationHandling.value = modeData.migrationHandling;
        }

        if (
          archipelagoLowerBound &&
          modeData.map &&
          modeData.map.lower !== undefined
        ) {
          archipelagoLowerBound.value = modeData.map.lower;
        }

        if (
          archipelagoUpperBound &&
          modeData.map &&
          modeData.map.upper !== undefined
        ) {
          archipelagoUpperBound.value = modeData.map.upper;
        }

        if (archipelagoPopulation && modeData.population !== undefined) {
          archipelagoPopulation.value = modeData.population;
        }

        if (archipelagoSetPopulation && modeData.setPopulation !== undefined) {
          archipelagoSetPopulation.checked = modeData.setPopulation;
          // Update CSV upload visibility
          toggleCsvUploadVisibility("archipelago");
        }

        if (archipelagoCsvFilename && modeData.initialPopulationFile) {
          archipelagoCsvFilename.value = modeData.initialPopulationFile;
          document.getElementById("archipelago-csv-clear-btn").style.display =
            "inline-block";
        }

        // Populate selected algorithms if they exist
        if (
          selectedAlgorithmsContainer &&
          modeData.algorithms &&
          Array.isArray(modeData.algorithms)
        ) {
          // Clear existing algorithms
          const existingTags =
            selectedAlgorithmsContainer.querySelectorAll(".algorithm-tag");
          existingTags.forEach((tag) => tag.remove());

          // Add algorithm tags with parameters
          modeData.algorithms.forEach((algo) => {
            if (algo.name) {
              const tag = createAlgorithmTag(algo.name);

              // Position tag before the counter
              const counter = document.getElementById("algorithms-counter");
              if (counter) {
                selectedAlgorithmsContainer.insertBefore(tag, counter);
              } else {
                selectedAlgorithmsContainer.appendChild(tag);
              }

              // Store algorithm parameters if they exist
              if (
                algo.parameters &&
                window.optimizationHandler.storeArchipelagoAlgorithmParams
              ) {
                window.optimizationHandler.storeArchipelagoAlgorithmParams(
                  tag.id,
                  algo.parameters
                );
              }
            }
          });

          // Update counter
          if (window.optimizationHandler.updateAlgorithmsCounter) {
            window.optimizationHandler.updateAlgorithmsCounter();
          } else if (window.updateAlgorithmsCounter) {
            window.updateAlgorithmsCounter();
          }
        }
      }
    } catch (error) {
      console.error("Error initializing mode form with saved data:", error);
    }
  }

  // Enhanced function to ensure Add Algorithm button works
  function setupAddAlgorithmButton() {
    const archipelagoAlgorithm = document.getElementById(
      "archipelago-algorithm"
    );
    const addAlgorithmBtn = document.getElementById("add-algorithm-btn");
    const selectedAlgorithmsContainer = document.getElementById(
      "selected-algorithms-container"
    );

    if (
      !archipelagoAlgorithm ||
      !addAlgorithmBtn ||
      !selectedAlgorithmsContainer
    ) {
      console.warn(
        "Required elements for archipelago algorithm selection not found"
      );
      return;
    }

    const MAX_ALGORITHMS = 3;

    addAlgorithmBtn.addEventListener("click", () => {
      const selectedValue = archipelagoAlgorithm.value;

      if (!selectedValue) {
        Swal.fire({
          title: "No Algorithm Selected",
          text: "Please select an algorithm to add",
          icon: "warning",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
        });
        return;
      }

      // Check if algorithm is already selected
      const existingAlgorithms = Array.from(
        selectedAlgorithmsContainer.querySelectorAll(".algorithm-tag")
      ).map((tag) => tag.dataset.algorithm);

      if (existingAlgorithms.includes(selectedValue)) {
        Swal.fire({
          title: "Algorithm Already Added",
          text: `${selectedValue} is already in your selection`,
          icon: "warning",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
        });
        return;
      }

      // Check maximum number of algorithms
      if (existingAlgorithms.length >= MAX_ALGORITHMS) {
        Swal.fire({
          title: "Maximum Algorithms Reached",
          text: `You can only select up to ${MAX_ALGORITHMS} algorithms`,
          icon: "warning",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
        });
        return;
      }

      // Create algorithm tag
      const tag = createAlgorithmTag(selectedValue);

      // Insert before the counter
      const counter = document.getElementById("algorithms-counter");
      selectedAlgorithmsContainer.insertBefore(tag, counter);

      // Reset dropdown
      archipelagoAlgorithm.value = "";

      // Update counter
      updateAlgorithmsCounter();
    });
  }

  // Parameter storage for archipelago mode
  // Initialize parameter storage
  window.optimizationHandler = window.optimizationHandler || {};
  window.optimizationHandler.archipelagoParamsStore = {};

  // Function to store algorithm parameters
  window.optimizationHandler.storeArchipelagoAlgorithmParams = function (
    tagId,
    params
  ) {
    if (!window.optimizationHandler.archipelagoParamsStore) {
      window.optimizationHandler.archipelagoParamsStore = {};
    }
    window.optimizationHandler.archipelagoParamsStore[tagId] = params;
    console.log(`Stored parameters for ${tagId}:`, params);
  };

  // Function to get algorithm parameters
  window.optimizationHandler.getArchipelagoAlgorithmParams = function (tagId) {
    if (!window.optimizationHandler.archipelagoParamsStore) {
      return {};
    }
    return window.optimizationHandler.archipelagoParamsStore[tagId] || {};
  };

  // Function to clear algorithm parameters
  window.optimizationHandler.clearArchipelagoAlgorithmParams = function (
    tagId
  ) {
    if (window.optimizationHandler.archipelagoParamsStore) {
      delete window.optimizationHandler.archipelagoParamsStore[tagId];
      console.log(`Cleared parameters for ${tagId}`);
    }
  };

  // Add setupAddAlgorithmButton to the initialization flow
  const modeBtn = document.getElementById("mode-btn");
  if (modeBtn) {
    modeBtn.addEventListener("click", () => {
      // Initialize the form after it becomes visible
      setTimeout(() => {
        initModeForm();
        initializeExistingModeData();

        // Setup Add Algorithm button
        setupAddAlgorithmButton();

        // Force update of algorithms counter
        updateAlgorithmsCounter();
      }, 100);
    });
  }

  // Add mode-specific styles
  const modeStyles = `
    /* Mode Form Styles */
    .optimization-mode-section {
      margin-bottom: 20px;
      padding: 15px;
      background: rgba(30, 30, 30, 0.3);
      border-radius: 5px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    /* Fix for archipelago upload group to match normal upload row styling */
    #archipelago-upload-group {
      padding: 10px 0;
      margin: 10px 0;
      width: 100%; /* Ensure full width like the normal upload row */
    }
    
    /* Make all upload controls consistent */
    .upload-data {
      margin-bottom: 10px;
      margin-top: 10px;
    }
    
    /* Normalize the upload controls across both modes */
    #normal-upload-row .upload-data,
    #archipelago-upload-group.upload-data {
      padding: 8px 0;
    }
    
    /* Upload label consistency */
    .upload-label {
      display: block;
      margin-bottom: 8px;
      color: #e0e0e0;
    }
    
    /* Fix for alignment of upload buttons */
    .upload-controls {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
    }
    
    /* Normalize upload buttons */
    .upload {
      padding: 8px 12px;
      background-color: #4a90e2;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 500;
      margin-right: 8px;
    }
    
    .upload:hover {
      background-color: #3a80d2;
    }
    
    /* Clear buttons */
    .clear-upload {
      width: 24px;
      height: 24px;
      background-color: rgba(255, 82, 82, 0.7);
      color: white;
      border: none;
      border-radius: 50%;
      font-size: 16px;
      line-height: 1;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .clear-upload:hover {
      background-color: rgba(255, 82, 82, 1);
    }
    
    /* Make filename fields consistent */
    .filename {
      width: 100%;
      height: 38px;
      padding: 8px;
      background-color: rgba(0, 0, 0, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 4px;
      color: #fff;
    }
    
    .subsection-title {
      margin-top: 0;
      margin-bottom: 15px;
      color: #e0e0e0;
      font-size: 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding-bottom: 8px;
    }
    
    .input-group {
      display: flex;
      gap: 10px;
    }
    
    .input-group .input-field {
      flex: 1;
    }
    
    .selected-algorithms-container {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 10px;
      min-height: 40px;
      padding: 10px;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 4px;
      border: 1px dashed rgba(255, 255, 255, 0.2);
    }
    
    .algorithms-counter {
      color: rgba(255, 255, 255, 0.6);
      font-size: 12px;
      align-self: center;
    }
    
    .algorithms-counter.limit-reached {
      color: #e74c3c;
      font-weight: bold;
    }
    
    .algorithm-selector-row {
      display: flex;
      gap: 10px;
      margin-top: 10px;
    }
    
    .algorithm-selector {
      flex: 1;
    }
    
    .add-algorithm-btn {
      display: flex;
      align-items: center;
      gap: 5px;
      background: #4a90e2;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 8px 15px;
      cursor: pointer;
      transition: background 0.3s;
    }
    
    .add-algorithm-btn:hover {
      background: #3a80d2;
    }
    
    .add-algorithm-btn:disabled {
      background: #6c757d;
      cursor: not-allowed;
    }
    
    .algorithm-tag {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #4a90e2;
      color: white;
      border-radius: 20px;
      padding: 5px 10px;
      font-size: 14px;
    }
    
    .algorithm-blue { background: #4a90e2; }
    .algorithm-green { background: #27ae60; }
    .algorithm-orange { background: #e67e22; }
    .algorithm-purple { background: #9b59b6; }
    .algorithm-teal { background: #1abc9c; }
    .algorithm-red { background: #e74c3c; }
    .algorithm-default { background: #7f8c8d; }
    
    .remove-algorithm {
      background: rgba(0, 0, 0, 0.2);
      border: none;
      color: white;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      font-size: 14px;
      line-height: 1;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
    }
    
    .remove-algorithm:hover {
      background: rgba(0, 0, 0, 0.4);
    }
    
    /* Transition effect for CSV upload section */
    #normal-upload-row,
    #archipelago-upload-group {
      transition: all 0.3s ease;
    }
  `;

  // Add the mode styles to the document
  const modeStyleSheet = document.createElement("style");
  modeStyleSheet.type = "text/css";
  modeStyleSheet.textContent = modeStyles;
  document.head.appendChild(modeStyleSheet);

  // Also initialize the design variables when the design variables button is clicked
  const designVariablesBtn = document.getElementById("design-variables-btn");
  if (designVariablesBtn) {
    designVariablesBtn.addEventListener("click", function () {
      // Wait for the form to be visible before initializing
      setTimeout(() => {
        // If the container is empty, add at least one design variable
        if (
          designVariablesContainer &&
          designVariablesContainer.children.length === 0
        ) {
          addDesignVariableInstance();
        }

        // Make sure flag dropdowns are populated
        const flagDropdowns = document.querySelectorAll(".reference-dropdown");
        flagDropdowns.forEach((dropdown) => {
          populateFlagDropdown(dropdown, "designVariables");
        });

        // Initialize existing design variables data
        initializeExistingDesignVariables();
      }, 100);
    });
  }

  // Directly initialize mode form to ensure radio buttons work properly
  // This ensures the event listeners are attached when the page loads
  setTimeout(() => {
    // Force direct initialization of mode form
    console.log("Initializing mode form directly");

    // Make sure the DOM elements are correctly identified
    const modeRadios = document.querySelectorAll(
      'input[name="optimization-mode"]'
    );
    console.log("Mode radios found:", modeRadios.length);

    // Enhanced toggle function that uses more direct approach
    function enhancedToggleMode() {
      const normalMode = document.getElementById("normal-mode-fields");
      const archipelagoMode = document.getElementById(
        "archipelago-mode-fields"
      );
      const isNormalChecked =
        document.getElementById("mode-normal") &&
        document.getElementById("mode-normal").checked;

      console.log("Toggle mode called, normal checked:", isNormalChecked);

      if (normalMode && archipelagoMode) {
        if (isNormalChecked) {
          normalMode.style.display = "block";
          archipelagoMode.style.display = "none";

          // Check if an algorithm is already selected in Normal mode and display parameters
          const normalAlgorithm = document.getElementById("normal-algorithm");
          const paramsContainer = document.getElementById(
            "normal-algorithm-params"
          );

          if (normalAlgorithm && normalAlgorithm.value && paramsContainer) {
            console.log(
              `Displaying parameters for pre-selected algorithm: ${normalAlgorithm.value}`
            );
            displayAlgorithmParameters(
              normalAlgorithm.value,
              paramsContainer,
              "normal",
              {} // Will use defaults until actual params are loaded
            );
          }
        } else {
          normalMode.style.display = "none";
          archipelagoMode.style.display = "block";
        }
      }
    }

    // Attach enhanced listeners to both radio buttons
    modeRadios.forEach((radio) => {
      radio.addEventListener("change", enhancedToggleMode);
      console.log("Added event listener to radio:", radio.id);
    });

    // Force call toggle function
    enhancedToggleMode();

    // Also set up the Add Algorithm button
    setupAddAlgorithmButton();
  }, 1000); // Slightly longer timeout to ensure all elements are loaded

  // Add a direct initialization for the normal mode algorithm parameters
  setTimeout(() => {
    // Initialize normal algorithm parameters if already selected
    const normalAlgorithm = document.getElementById("normal-algorithm");
    const paramsContainer = document.getElementById("normal-algorithm-params");

    if (normalAlgorithm && normalAlgorithm.value && paramsContainer) {
      console.log(
        `Direct initialization: Displaying parameters for algorithm: ${normalAlgorithm.value}`
      );
      displayAlgorithmParameters(
        normalAlgorithm.value,
        paramsContainer,
        "normal",
        {} // Will use default values
      );
    }

    // Re-attach event listener to normal algorithm select to ensure it works
    if (normalAlgorithm) {
      // Clone to remove any existing listeners
      const newSelect = normalAlgorithm.cloneNode(true);
      normalAlgorithm.parentNode.replaceChild(newSelect, normalAlgorithm);

      console.log("Re-attaching normal algorithm change event listener");
      newSelect.addEventListener("change", function (event) {
        if (event.target.value && paramsContainer) {
          console.log(
            `Change event: Displaying parameters for ${event.target.value}`
          );
          displayAlgorithmParameters(
            event.target.value,
            paramsContainer,
            "normal",
            {}
          );
        }
      });
    }
  }, 1500); // Slightly longer timeout to ensure everything else is loaded

  // Listen for sequence updates to refresh all flag dropdowns
  document.addEventListener("sequenceUpdated", function () {
    console.log(
      "Sequence updated, refreshing all flag dropdowns in optimization module"
    );

    // Refresh objective flags
    document
      .querySelectorAll(".objective-flag-select")
      .forEach((dropdown, index) => {
        populateFlagDropdown(dropdown, `Objective ${index + 1}`);
      });

    // Refresh constraint flags
    document.querySelectorAll(".constraint-flag").forEach((dropdown, index) => {
      populateFlagDropdown(dropdown, `Constraint ${index + 1}`);
    });

    // Refresh design variable flags
    document.querySelectorAll(".dv-flag").forEach((dropdown, index) => {
      populateFlagDropdown(dropdown, `Design Variable ${index + 1}`);
    });
  });

  // Add after the getModeData function, before the initModeForm function

  // Function to dynamically generate parameter inputs based on selected algorithm
  function displayAlgorithmParameters(
    algorithmName,
    containerElement,
    mode,
    existingParams = {}
  ) {
    // Skip if algorithm name is empty or null
    if (!algorithmName || algorithmName === "") {
      console.log("No algorithm selected, not displaying parameters");
      if (containerElement) {
        containerElement.innerHTML = "";
      }
      return;
    }

    // Skip if container is missing
    if (!containerElement) {
      console.warn(
        `Container element not found for algorithm ${algorithmName}`
      );
      return;
    }

    // Clear the container
    containerElement.innerHTML = "";

    // Get parameters for the selected algorithm
    const params = window.algorithmParameters[algorithmName];
    if (!params) {
      console.warn(`No parameters defined for algorithm: ${algorithmName}`);
      return;
    }

    console.log(`Displaying parameters for ${algorithmName} in ${mode} mode`);

    // Create form elements for each parameter
    const paramsForm = document.createElement("div");
    paramsForm.className = "algorithm-parameters-form";

    // Add title
    const title = document.createElement("h4");
    title.textContent = `${algorithmName} Parameters`;
    paramsForm.appendChild(title);

    // Create rows of parameter inputs (2 per row for better layout)
    let row;
    let itemsInRow = 0;

    // Count total parameters to handle odd number
    const totalParams = Object.keys(params).length;
    let paramCounter = 0;

    for (const paramKey in params) {
      paramCounter++;

      // Create new row if needed
      if (itemsInRow === 0) {
        row = document.createElement("div");
        row.className = "form-row";
        paramsForm.appendChild(row);
      }

      // Create form group for parameter
      const formGroup = document.createElement("div");
      formGroup.className = "form-group";

      // For last parameter in odd-numbered set, make it full width
      if (paramCounter === totalParams && totalParams % 2 === 1) {
        formGroup.className = "form-group full-width";
      }

      // Create label
      const label = document.createElement("label");
      label.className = "label";
      label.textContent = params[paramKey].label || paramKey;
      formGroup.appendChild(label);

      // Create appropriate input based on parameter type
      const param = params[paramKey];
      let input;

      // Default value from existingParams or parameter default
      const paramValue =
        existingParams[paramKey] !== undefined
          ? existingParams[paramKey]
          : param.default;

      console.log(
        `[Modal] Parameter ${paramKey}: existing=${existingParams[paramKey]}, default=${param.default}, using=${paramValue}`
      );

      if (param.type === "select") {
        // Create select dropdown
        input = document.createElement("select");
        input.className = "input-field algorithm-param-input";

        // Add options
        if (param.options && Array.isArray(param.options)) {
          param.options.forEach((option) => {
            const optionElement = document.createElement("option");
            optionElement.value = option;
            optionElement.textContent = option;
            optionElement.selected = option === paramValue;
            input.appendChild(optionElement);
          });
        }
      } else if (param.type === "checkbox") {
        // Create checkbox
        input = document.createElement("input");
        input.type = "checkbox";
        input.className = "toggle-input algorithm-param-input";
        input.checked = paramValue === true;

        // Create toggle container
        const toggleContainer = document.createElement("div");
        toggleContainer.className = "toggle-container";

        // Add slider label
        const sliderLabel = document.createElement("label");
        sliderLabel.className = "toggle-slider";

        toggleContainer.appendChild(input);
        toggleContainer.appendChild(sliderLabel);
        formGroup.appendChild(toggleContainer);

        // Skip adding input separately since it's already in toggle container
        input = null;
      } else {
        // Default to text/number input
        input = document.createElement("input");
        input.type = param.type || "text";
        input.className = "input-field algorithm-param-input";
        input.value = paramValue !== undefined ? paramValue : "";

        // Set attributes based on parameter definition
        if (param.min !== undefined) input.min = param.min;
        if (param.max !== undefined) input.max = param.max;
        if (param.step !== undefined) input.step = param.step;
        if (param.placeholder) input.placeholder = param.placeholder;
      }

      // Set common attributes and add to form group
      if (input) {
        input.name = paramKey;
        input.id = `${mode}-${algorithmName}-${paramKey}`;
        input.dataset.algorithm = algorithmName;
        input.dataset.parameter = paramKey;
        formGroup.appendChild(input);
      }

      // Add tooltip/help text if provided
      if (param.help) {
        const helpText = document.createElement("small");
        helpText.className = "input-help";
        helpText.textContent = param.help;
        formGroup.appendChild(helpText);
      }

      // Add to row
      row.appendChild(formGroup);
      itemsInRow++;

      // Reset for next row if needed (2 items per row)
      if (itemsInRow >= 2) {
        itemsInRow = 0;
      }
    }

    // Add the form to the container
    containerElement.appendChild(paramsForm);
  }

  // Function to open the algorithm parameters modal
  function openAlgorithmParamsModal(algorithm, tagId) {
    const modal = document.getElementById("algorithm-params-modal");
    const modalTitle = document.getElementById("modal-algorithm-title");
    const modalParamsContainer = document.getElementById(
      "modal-algorithm-params"
    );
    const saveButton = document.getElementById("save-algorithm-params");
    const resetButton = document.getElementById("reset-algorithm-params");
    const closeButton = document.querySelector(".close-modal");

    if (!modal || !modalTitle || !modalParamsContainer) {
      console.error("Modal elements not found");
      return;
    }

    // Set current editing context in window object for access by event handlers
    window.currentEditingAlgorithm = algorithm;
    window.currentEditingTagId = tagId;

    // Set title
    modalTitle.textContent = `${algorithm} Parameters`;

    // Get existing parameters for this tag
    let existingParams = {};
    if (
      window.optimizationHandler &&
      window.optimizationHandler.getArchipelagoAlgorithmParams
    ) {
      existingParams =
        window.optimizationHandler.getArchipelagoAlgorithmParams(tagId);
    } else if (
      window.optimizationHandler &&
      window.optimizationHandler.archipelagoParamsStore
    ) {
      existingParams =
        window.optimizationHandler.archipelagoParamsStore[tagId] || {};
    }

    console.log(`[Modal] Opening modal for ${algorithm} with tagId: ${tagId}`);
    console.log(`[Modal] Retrieved existing params:`, existingParams);

    // Display parameters in the modal
    displayAlgorithmParameters(
      algorithm,
      modalParamsContainer,
      "modal",
      existingParams
    );

    // Show modal
    modal.style.display = "block";

    // Handle save button click
    if (saveButton) {
      // Remove any existing event listeners by cloning
      const newSaveButton = saveButton.cloneNode(true);
      saveButton.parentNode.replaceChild(newSaveButton, saveButton);

      newSaveButton.addEventListener("click", () => {
        // Collect parameters from the modal
        const params = {};
        const inputs = modalParamsContainer.querySelectorAll(
          ".algorithm-param-input"
        );

        inputs.forEach((input) => {
          const paramKey = input.dataset.parameter;
          let value;

          // Handle different input types
          if (input.type === "checkbox") {
            value = input.checked;
          } else if (input.type === "number") {
            value = parseFloat(input.value);
            if (isNaN(value)) value = null;
          } else if (input.tagName === "SELECT") {
            value = input.value;
            // For boolean options, ensure proper conversion
            if (value === "true" || value === "false") {
              value = value === "true";
            }
          } else {
            value = input.value;
            // Try to convert known numeric or boolean values in string form
            if (value === "true") {
              value = true;
            } else if (value === "false") {
              value = false;
            } else if (!isNaN(Number(value)) && value.trim() !== "") {
              value = Number(value);
            }
          }

          if (paramKey && value !== undefined) {
            // Special handling for known boolean parameters
            if (paramKey === "memory" && value !== null) {
              params[paramKey] = value === true || value === "true";
            } else {
              params[paramKey] = value;
            }
          }
        });

        // Store the parameters
        if (window.optimizationHandler.storeArchipelagoAlgorithmParams) {
          window.optimizationHandler.storeArchipelagoAlgorithmParams(
            window.currentEditingTagId,
            params
          );
        }

        // Close modal
        modal.style.display = "none";

        // Show success message
        Swal.fire({
          title: "Parameters Saved",
          text: `Parameters for ${window.currentEditingAlgorithm} have been saved`,
          icon: "success",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 2000,
        });
      });
    }

    // Handle reset button click
    if (resetButton) {
      // Remove any existing event listeners by cloning
      const newResetButton = resetButton.cloneNode(true);
      resetButton.parentNode.replaceChild(newResetButton, resetButton);

      newResetButton.addEventListener("click", () => {
        // Reset to default parameters
        displayAlgorithmParameters(
          window.currentEditingAlgorithm,
          modalParamsContainer,
          "modal",
          {} // Empty object will use default values
        );
      });
    }

    // Handle close button click
    if (closeButton) {
      // Remove any existing event listeners by cloning
      const newCloseButton = closeButton.cloneNode(true);
      closeButton.parentNode.replaceChild(newCloseButton, closeButton);

      newCloseButton.addEventListener("click", () => {
        modal.style.display = "none";
      });
    }

    // Also close modal when clicking outside
    window.addEventListener("click", (event) => {
      if (event.target === modal) {
        modal.style.display = "none";
      }
    });
  }

  // Make this function available globally
  window.optimizationHandler.openAlgorithmParamsModal =
    openAlgorithmParamsModal;

  // --- Mode Form Validation ---
  function validateModeForm() {
    let isValid = true;
    let errors = [];

    // Helper to show error on a field
    function showFieldError(input, message) {
      if (input) {
        input.classList.add("error-field");
        if (
          window.FormValidator &&
          typeof FormValidator.showError === "function"
        ) {
          FormValidator.showError(input, message);
        }
      }
    }
    function removeFieldError(input) {
      if (input) input.classList.remove("error-field");
    }

    const isNormalMode = document.getElementById("mode-normal").checked;

    if (isNormalMode) {
      // Normal mode fields
      const algorithm = document.getElementById("normal-algorithm");
      const lowerBound = document.getElementById("normal-lower-bound");
      const upperBound = document.getElementById("normal-upper-bound");
      const population = document.getElementById("normal-population");
      const setPopulation = document.getElementById("normal-set-population");
      const problemStrategy = document.getElementById(
        "normal-problem-strategy"
      );

      [algorithm, lowerBound, upperBound, population, problemStrategy].forEach(
        removeFieldError
      );

      if (!algorithm.value) {
        isValid = false;
        errors.push("Algorithm is required");
        showFieldError(algorithm, "Algorithm is required");
      }
      if (!lowerBound.value || isNaN(parseFloat(lowerBound.value))) {
        isValid = false;
        errors.push("Lower Bound must be a number");
        showFieldError(lowerBound, "Lower Bound must be a number");
      }
      if (!upperBound.value || isNaN(parseFloat(upperBound.value))) {
        isValid = false;
        errors.push("Upper Bound must be a number");
        showFieldError(upperBound, "Upper Bound must be a number");
      }
      if (!population.value || isNaN(parseInt(population.value))) {
        isValid = false;
        errors.push("Population must be a number");
        showFieldError(population, "Population must be a number");
      }
      if (!problemStrategy.value) {
        isValid = false;
        errors.push("Problem Strategy is required");
        showFieldError(problemStrategy, "Problem Strategy is required");
      }
      // If setPopulation is checked, check for file
      if (setPopulation.checked && !window.optimizationHandler.normalCsvFile) {
        isValid = false;
        errors.push(
          "Initial Control Variable CSV is required when Set Population is enabled"
        );
        const filenameInput = document.getElementById("normal-csv-filename");
        showFieldError(filenameInput, "CSV file required");
      }
      // Algorithm parameters (if any)
      const paramsContainer = document.getElementById(
        "normal-algorithm-params"
      );
      if (paramsContainer && algorithm.value) {
        const paramInputs = paramsContainer.querySelectorAll(
          ".algorithm-param-input"
        );
        paramInputs.forEach((input) => {
          removeFieldError(input);
          if (
            input.required &&
            (!input.value ||
              (input.type === "number" && isNaN(parseFloat(input.value))))
          ) {
            isValid = false;
            errors.push(
              `${
                input.dataset.parameter || input.name || "Algorithm parameter"
              } is required`
            );
            showFieldError(
              input,
              `${
                input.dataset.parameter || input.name || "Algorithm parameter"
              } is required`
            );
          }
        });
      }
    } else {
      // Archipelago mode fields
      const topology = document.getElementById("archipelago-topology");
      const migrationType = document.getElementById(
        "archipelago-migration-type"
      );
      const migrationHandling = document.getElementById(
        "archipelago-migration-handling"
      );
      const lowerBound = document.getElementById("archipelago-lower-bound");
      const upperBound = document.getElementById("archipelago-upper-bound");
      const population = document.getElementById("archipelago-population");
      const setPopulation = document.getElementById(
        "archipelago-set-population"
      );
      const selectedAlgorithmsContainer = document.getElementById(
        "selected-algorithms-container"
      );

      [
        topology,
        migrationType,
        migrationHandling,
        lowerBound,
        upperBound,
        population,
      ].forEach(removeFieldError);

      if (!topology.value) {
        isValid = false;
        errors.push("Topology is required");
        showFieldError(topology, "Topology is required");
      }
      if (!migrationType.value) {
        isValid = false;
        errors.push("Migration Type is required");
        showFieldError(migrationType, "Migration Type is required");
      }
      if (!migrationHandling.value) {
        isValid = false;
        errors.push("Migration Handling is required");
        showFieldError(migrationHandling, "Migration Handling is required");
      }
      if (!lowerBound.value || isNaN(parseFloat(lowerBound.value))) {
        isValid = false;
        errors.push("Lower Bound must be a number");
        showFieldError(lowerBound, "Lower Bound must be a number");
      }
      if (!upperBound.value || isNaN(parseFloat(upperBound.value))) {
        isValid = false;
        errors.push("Upper Bound must be a number");
        showFieldError(upperBound, "Upper Bound must be a number");
      }
      if (!population.value || isNaN(parseInt(population.value))) {
        isValid = false;
        errors.push("Population must be a number");
        showFieldError(population, "Population must be a number");
      }
      // If setPopulation is checked, check for file
      if (
        setPopulation.checked &&
        !window.optimizationHandler.archipelagoCsvFile
      ) {
        isValid = false;
        errors.push(
          "Initial Control Variable CSV is required when Set Population is enabled"
        );
        const filenameInput = document.getElementById(
          "archipelago-csv-filename"
        );
        showFieldError(filenameInput, "CSV file required");
      }
      // At least one algorithm must be selected
      const algorithmTags =
        selectedAlgorithmsContainer.querySelectorAll(".algorithm-tag");
      if (!algorithmTags.length) {
        isValid = false;
        errors.push("At least one algorithm must be selected");
        showFieldError(
          selectedAlgorithmsContainer,
          "At least one algorithm must be selected"
        );
      }
      // Algorithm parameters (if any)
      if (window.optimizationHandler.archipelagoParamsStore) {
        Object.values(
          window.optimizationHandler.archipelagoParamsStore
        ).forEach((params) => {
          Object.entries(params).forEach(([key, value]) => {
            if (
              value === undefined ||
              value === null ||
              value === "" ||
              (typeof value === "number" && isNaN(value))
            ) {
              isValid = false;
              errors.push(`Algorithm parameter '${key}' is required`);
            }
          });
        });
      }
    }

    if (!isValid) {
      const errorSummary =
        errors.length > 2
          ? `${errors.slice(0, 2).join(", ")} and ${
              errors.length - 2
            } more issue(s)`
          : errors.join(", ");
      if (
        window.FormValidator &&
        typeof FormValidator.showToastMessage === "function"
      ) {
        FormValidator.showToastMessage(
          "error",
          "Mode Validation Error",
          `Please fix these issues: ${errorSummary}`
        );
      }
    }
    return isValid;
  }
  // --- END Mode Form Validation ---

  if (modeForm) {
    modeForm.addEventListener("submit", (event) => {
      event.preventDefault();
      // Use new validation
      const isValid = validateModeForm();
      if (isValid) {
        const modeData = getModeData();
        saveOptimizationData("mode", modeData);

        // Format mode data for JSON and add to finalMissionData
        if (window.finalMissionData) {
          const jsonModeData = formatModeDataForJSON(modeData);

          // First, clean up any existing mode properties
          const modeProperties = [
            "mode",
            "map",
            "population",
            "problem_strategy",
            "optimizer",
            "archipelago",
          ];
          // Also remove any algorithm-specific properties
          const algorithmProperties = [
            "DE",
            "SADE",
            "pDE",
            "PSO",
            "IPOPT",
            "CS",
            "NLOPT",
            "GAGGS",
            "MBH",
            "CSTRS",
            "GWO",
            "IHS",
            "AC",
            "ABC",
            "CMAES",
            "XNES",
            "NSGA2",
            "SGA",
          ];

          // Remove existing properties
          [...modeProperties, ...algorithmProperties].forEach((prop) => {
            if (prop in window.finalMissionData) {
              delete window.finalMissionData[prop];
            }
          });

          // Add each property from jsonModeData to finalMissionData
          Object.keys(jsonModeData).forEach((key) => {
            window.finalMissionData[key] = jsonModeData[key];
          });

          console.log("Mode data added to finalMissionData");
        }

        // Update section state if using state management
        if (window.sectionStates && window.sectionStates["mode"]) {
          window.sectionStates["mode"].isSaved = true;
          if (typeof updateSidebarStates === "function") {
            updateSidebarStates();
          }
        }
      }
    });
  }

  // Function to refresh all segment dropdowns in Design Variables
  function refreshAllDesignVariableSegmentDropdowns() {
    console.log("Attempting to refresh all design variable segment dropdowns.");
    const designVariableInstances = document.querySelectorAll(
      "#design-variables-container .optimization-instance:not(.hidden-template)"
    );

    designVariableInstances.forEach((instance) => {
      const categorySelect = instance.querySelector(".dv-category");
      if (!categorySelect) {
        console.warn(
          "Could not find category select in DV instance:",
          instance
        );
        // Clear all segment dropdowns in this instance as a fallback
        instance.querySelectorAll(".dv-segment").forEach((s) => {
          s.innerHTML =
            '<option value="" disabled selected>Select Segment</option>';
        });
        return;
      }

      const selectedCategory = categorySelect.value;
      console.log(
        `Refreshing segment for DV instance ${
          instance.dataset.index || "N/A"
        } with category: ${selectedCategory}`
      );

      // Find the segment select within the specific category's fields.
      // These fields should be the only ones visible for .dv-segment due to handleDesignVariableCategoryChange logic.
      const categoryFields = instance.querySelector(
        `.dv-category-fields[data-category="${selectedCategory}"]`
      );

      if (categoryFields && !categoryFields.classList.contains("hidden")) {
        const segmentSelect = categoryFields.querySelector(".dv-segment");
        if (segmentSelect) {
          if (selectedCategory === "PROPULSION") {
            populateGenericSegmentDropdown(segmentSelect, "PROPULSION");
          } else if (selectedCategory === "STEERING") {
            populateSteeringSegmentDropdown(segmentSelect);
          } else {
            // For other categories, ensure the segment dropdown (if it exists in this category's HTML) is cleared.
            segmentSelect.innerHTML =
              '<option value="" disabled selected>Select Segment</option>';
          }
        } else {
          // If the current active category (e.g. "PAYLOAD") doesn't have a ".dv-segment", this is fine.
          // We don't need to do anything for its non-existent segment dropdown.
          // console.warn(`No .dv-segment found within active category fields for ${selectedCategory} in DV instance:`, instance.dataset.index || 'N/A');
        }
      } else {
        // If no category is selected, or if the selected category's fields are unexpectedly hidden.
        // Clear all segment dropdowns in this instance as a safety measure.
        console.warn(
          `No active/visible category-specific fields found for "${selectedCategory}" in DV instance: ${
            instance.dataset.index || "N/A"
          }. Clearing all segments.`
        );
        instance.querySelectorAll(".dv-segment").forEach((s) => {
          s.innerHTML =
            '<option value="" disabled selected>Select Segment</option>';
        });
      }
    });
    console.log(
      `Finished refreshing ${designVariableInstances.length} design variable segment dropdowns.`
    );
  }

  // Function to initialize the core optimization module UI components
  function initOptimizationModule() {
    console.log("Initializing Optimization Module UI components...");

    // Automatically create initial objective function form
    console.log(
      "Automatically creating initial objective function form on page load"
    );
    if (typeof addObjectiveFunctionForm === "function") {
      addObjectiveFunctionForm();
    } else {
      console.error(
        "addObjectiveFunctionForm is not defined at the point of calling initOptimizationModule"
      );
    }

    // Automatically create initial constraint form
    console.log("Automatically creating initial constraint form on page load");
    if (typeof addConstraintInstance === "function") {
      addConstraintInstance(); // Creates the first constraint instance
      if (typeof populateAllConstraintNameDropdowns === "function") {
        populateAllConstraintNameDropdowns(); // Populate its name dropdown and any others
      } else {
        console.error("populateAllConstraintNameDropdowns is not defined.");
      }
    } else {
      console.error(
        "addConstraintInstance is not defined at the point of calling initOptimizationModule"
      );
    }

    // Automatically create initial design variable form
    console.log("Automatically creating initial design variable form on load");
    if (typeof addDesignVariableInstance === "function") {
      addDesignVariableInstance();
    } else {
      console.error(
        "addDesignVariableInstance is not defined at the point of calling initOptimizationModule"
      );
    }

    // Any other initial setup tasks for the optimization module can go here.
    console.log("Optimization Module UI components initialization complete.");
  }

  // Call the initialization function after it's defined.
  // This is likely what line 4446 in the original error was referring to or should be.
  // Ensure this call happens after all necessary helper functions are defined.
  initOptimizationModule();

  // =========================================
  // EXPOSE HANDLERS TO GLOBAL SCOPE
  // =========================================
  window.optimizationHandler = {
    getObjectiveFunctionData,
    getConstraintsData,
    getDesignVariablesData,
    getModeData,
    formatModeDataForJSON,
    parseInitialPopulationCSV,
    populateObjectiveFlagDropdown: (selectElement) =>
      populateFlagDropdown(selectElement, "Objective"),
    populateConstraintFlagDropdown: (selectElement) =>
      populateFlagDropdown(selectElement, "Constraint"),
    populateDesignVariableDropdowns,
    populateSteeringSegmentDropdown,
    populateGenericSegmentDropdown,
    populateConstraintNameDropdown,
    populateAllConstraintNameDropdowns,
    addObjectiveFunctionForm,
    addConstraintInstance,
    addDesignVariableInstance,
    renumberDesignVariables,
    renumberConstraints,
    handleDesignVariableCategoryChange,
    handleSteeringSegmentTypeChange,
    clearDesignVariablesForm,
    setupFileUpload,
    createAlgorithmTag,
    updateAlgorithmsCounter,
    toggleModeFields,
    setupAddAlgorithmButton,
    refreshAllDesignVariableSegmentDropdowns,
    saveOptimizationData,
    initOptimizationModule, // Expose the defined init function
    algorithmParameters, // Expose algorithm parameters
  };

  // Any remaining top-level DOMContentLoaded logic that isn't part of initOptimizationModule
  // For example, code that was previously here:
  // addObjectiveFunctionForm(); // MOVED into initOptimizationModule
  // addConstraintInstance(); // MOVED into initOptimizationModule
  // populateAllConstraintNameDropdowns(); // MOVED into initOptimizationModule
  // addDesignVariableInstance(); // MOVED into initOptimizationModule
  // initializeExistingObjectiveFunctions(); // This should be called within initOptimizationModule if needed
  // initializeExistingConstraints(); // This should be called within initOptimizationModule if needed
  // initializeExistingDesignVariables(); // This should be called within initOptimizationModule if needed
  // initModeForm(); // This should be called within initOptimizationModule if needed
  // setupAllEventListeners(); // This should be called within initOptimizationModule if needed

  // --- Per-Axis Bounds for PROFILE and CONST_BODYRATE ---

  /**
   * Dynamically manage per-axis bounds fields for PROFILE and CONST_BODYRATE steering types.
   * @param {HTMLElement} categoryFields - The .dv-category-fields[data-category="STEERING"] element
   * @param {HTMLElement} typeFields - The .dv-steering-type-fields[data-segment-type] element
   */
  function setupPerAxisBounds(categoryFields, typeFields) {
    console.debug("Setting up per-axis bounds", typeFields);
    const boundsContainer = typeFields.querySelector(
      ".dv-axis-bounds-container"
    );
    const axisCheckboxes = typeFields.querySelectorAll(".dv-axis-select-cb");

    if (!boundsContainer) {
      console.error("Bounds container not found!", typeFields);
      return;
    }

    if (!axisCheckboxes.length) {
      console.error("Axis checkboxes not found!", typeFields);
      return;
    }

    console.debug(
      `Found ${axisCheckboxes.length} checkboxes and bounds container`
    );

    // Helper: Axis label map
    const axisLabels = { roll: "Roll", pitch: "Pitch", yaw: "Yaw" };

    // Create all possible bounds fields once (if they don't exist)
    const existingAxes = boundsContainer.querySelectorAll(
      ".per-axis-bounds-section"
    );
    if (existingAxes.length === 0) {
      console.debug("Creating initial bounds fields for all axes");
      for (const axis of ["roll", "pitch", "yaw"]) {
        const wrapper = document.createElement("div");
        wrapper.className = "per-axis-bounds-section";
        wrapper.dataset.axis = axis;
        wrapper.style.display = "none"; // Hidden by default
        wrapper.innerHTML = `
          <div class="form-row">
            <div class="form-group">
              <label class="label">Lower Bound (${axisLabels[axis]}):</label>
              <input type="text" class="input-field dv-lower-bound" data-axis="${axis}" placeholder="e.g., -1.0,-0.5,0.0" />
              <small class="input-help">Comma-separated values for ${axisLabels[axis]}</small>
            </div>
            <div class="form-group">
              <label class="label">Upper Bound (${axisLabels[axis]}):</label>
              <input type="text" class="input-field dv-upper-bound" data-axis="${axis}" placeholder="e.g., 1.0,0.5,0.0" />
              <small class="input-help">Comma-separated values for ${axisLabels[axis]}</small>
            </div>
          </div>
        `;
        boundsContainer.appendChild(wrapper);
      }
    }

    // Simplified direct handler that just shows/hides existing fields
    function directCheckboxHandler(event) {
      const checkbox = event.target;
      const axis = checkbox.value;
      console.debug(`Checkbox for ${axis} changed to ${checkbox.checked}`);

      const boundsSection = boundsContainer.querySelector(
        `.per-axis-bounds-section[data-axis="${axis}"]`
      );
      if (boundsSection) {
        console.debug(
          `Found bounds section for ${axis}, setting display to ${
            checkbox.checked ? "block" : "none"
          }`
        );
        boundsSection.style.display = checkbox.checked ? "block" : "none";
      } else {
        console.error(`Could not find bounds section for ${axis}`);
      }
    }

    // Detach existing listeners to avoid duplicates
    axisCheckboxes.forEach((cb) => {
      cb.removeEventListener("change", directCheckboxHandler);
      cb.addEventListener("change", directCheckboxHandler);
      console.debug(`Attached change handler to ${cb.value} checkbox`);

      // Initial visibility state
      const boundsSection = boundsContainer.querySelector(
        `.per-axis-bounds-section[data-axis="${cb.value}"]`
      );
      if (boundsSection) {
        boundsSection.style.display = cb.checked ? "block" : "none";
        console.debug(
          `Set initial visibility for ${cb.value} to ${
            cb.checked ? "visible" : "hidden"
          }`
        );
      }
    });
  }

  // --- Patch handleSteeringSegmentTypeChange to support per-axis bounds ---
  const originalHandleSteeringSegmentTypeChange =
    handleSteeringSegmentTypeChange;
  function patchedHandleSteeringSegmentTypeChange(event) {
    originalHandleSteeringSegmentTypeChange(event);
    const typeSelect = event.target;
    const instance = typeSelect.closest(
      '.dv-category-fields[data-category="STEERING"]'
    );
    if (!instance) return;
    const selectedType = typeSelect.value;
    const typeFields = instance.querySelector(
      `.dv-steering-type-fields[data-segment-type="${selectedType}"]`
    );
    if (!typeFields) return;
    // Updated list: PROFILE, CONST_BODYRATE, CLG
    if (["PROFILE", "CONST_BODYRATE", "CLG"].includes(selectedType)) {
      console.log(
        `Setting up per-axis bounds for ${selectedType} segment type`
      );
      setupPerAxisBounds(instance, typeFields);
    }
  }
  // Patch the event handler
  window.handleSteeringSegmentTypeChange =
    patchedHandleSteeringSegmentTypeChange;

  // --- Patch addDesignVariableInstance to use patched handler ---
  const originalAddDesignVariableInstance = addDesignVariableInstance;
  function patchedAddDesignVariableInstance() {
    const newInstance = originalAddDesignVariableInstance();
    // Patch steering type change event for new instance
    const steeringTypeSelect = newInstance.querySelector(".dv-segment-type");
    if (steeringTypeSelect) {
      steeringTypeSelect.removeEventListener(
        "change",
        handleSteeringSegmentTypeChange
      );
      steeringTypeSelect.addEventListener(
        "change",
        patchedHandleSteeringSegmentTypeChange
      );

      // If STEERING category is already selected, initialize segment dropdown
      const categorySelect = newInstance.querySelector(".dv-category");
      if (categorySelect && categorySelect.value === "STEERING") {
        // Populate steering segment dropdown for the new instance
        const steeringSegmentDropdown = newInstance.querySelector(
          '.dv-segment[data-category="STEERING"]'
        );
        if (steeringSegmentDropdown) {
          populateSteeringSegmentDropdown(steeringSegmentDropdown);
        }

        // If segment type is already selected, setup per-axis bounds
        if (steeringTypeSelect.value) {
          const categoryFields = newInstance.querySelector(
            '.dv-category-fields[data-category="STEERING"]'
          );
          const typeFields = categoryFields.querySelector(
            `.dv-steering-type-fields[data-segment-type="${steeringTypeSelect.value}"]`
          );
          // Updated list: PROFILE, CONST_BODYRATE, CLG
          if (
            typeFields &&
            ["PROFILE", "CONST_BODYRATE", "CLG"].includes(
              steeringTypeSelect.value
            )
          ) {
            console.log(
              `Setting up per-axis bounds for new ${steeringTypeSelect.value} instance`
            );
            setupPerAxisBounds(categoryFields, typeFields);
          }
        }
      }
    }
    return newInstance;
  }
  addDesignVariableInstance = patchedAddDesignVariableInstance;

  // --- Add CSS for per-axis bounds styling ---
  function addPerAxisBoundsStyling() {
    const style = document.createElement("style");
    style.textContent = `
      .per-axis-bounds-section {
        background: rgba(255, 255, 255, 0.05);
        padding: 12px;
        margin-bottom: 12px;
        border-radius: 4px;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      .axis-checkboxes {
        display: flex;
        gap: 15px;
        margin: 8px 0;
      }
      .axis-checkboxes label {
        display: flex;
        align-items: center;
        gap: 5px;
        cursor: pointer;
      }
      .axis-checkboxes input[type="checkbox"] {
        cursor: pointer;
      }
    `;
    document.head.appendChild(style);
  }

  // --- Initialize existing design variable instances ---
  function initExistingPerAxisBounds() {
    console.log("Initializing existing per-axis bounds");
    const instances = document.querySelectorAll(
      ".optimization-instance:not(.hidden-template)"
    );
    instances.forEach((instance, index) => {
      console.log(`Processing instance ${index}`);
      const categorySelect = instance.querySelector(".dv-category");
      const category = categorySelect ? categorySelect.value : null;

      if (category === "STEERING") {
        const categoryFields = instance.querySelector(
          '.dv-category-fields[data-category="STEERING"]'
        );
        if (!categoryFields) return;

        const segmentTypeSelect =
          categoryFields.querySelector(".dv-segment-type");
        const segmentType = segmentTypeSelect ? segmentTypeSelect.value : null;

        // Updated list: PROFILE, CONST_BODYRATE, CLG
        if (
          segmentType &&
          ["PROFILE", "CONST_BODYRATE", "CLG"].includes(segmentType)
        ) {
          console.log(`Instance ${index} has segment type ${segmentType}`);
          const typeFields = categoryFields.querySelector(
            `.dv-steering-type-fields[data-segment-type="${segmentType}"]`
          );
          if (typeFields) {
            console.log(
              `Setting up per-axis bounds for existing ${segmentType} instance`
            );
            setupPerAxisBounds(categoryFields, typeFields);

            // Ensure type fields are visible
            typeFields.classList.remove("hidden");
          }
        }
      }
    });
  }

  // --- Initialization function for the module ---
  const originalInitOptimizationModule = initOptimizationModule;
  function patchedInitOptimizationModule() {
    console.log(
      "Initializing optimization module with per-axis bounds support"
    );
    // Call original init
    originalInitOptimizationModule();

    // Add custom styling
    addPerAxisBoundsStyling();

    // Setup existing instances
    setTimeout(initExistingPerAxisBounds, 500); // Small delay to ensure DOM is ready

    // Patch all existing steering segment type selects
    const steeringTypeSelects = document.querySelectorAll(".dv-segment-type");
    steeringTypeSelects.forEach((select) => {
      select.removeEventListener("change", handleSteeringSegmentTypeChange);
      select.addEventListener("change", patchedHandleSteeringSegmentTypeChange);
    });

    console.log("Per-axis bounds module initialization complete");
  }
  initOptimizationModule = patchedInitOptimizationModule;

  // Ensure initialization happens, especially if the page is already loaded
  if (document.readyState === "complete") {
    console.log("Document already loaded, initializing per-axis bounds");
    addPerAxisBoundsStyling();
    initExistingPerAxisBounds();
  }

  // --- Patch getDesignVariablesData to collect per-axis bounds ---
  const originalGetDesignVariablesData = getDesignVariablesData;
  function patchedGetDesignVariablesData() {
    const designVariablesData = [];
    const instances = designVariablesContainer.querySelectorAll(
      ".optimization-instance:not(.hidden-template)"
    );
    instances.forEach((instance) => {
      const categorySelect = instance.querySelector(".dv-category");
      const nameInput = instance.querySelector(".dv-name");
      const category = categorySelect ? categorySelect.value : null;
      const name = nameInput ? nameInput.value : null;
      if (category && name) {
        const dv = { name: name, category: category, type: {} };
        const categoryFields = instance.querySelector(
          `.dv-category-fields[data-category="${category}"]`
        );
        if (categoryFields) {
          // Add segment for propulsion and steering categories
          if (["PROPULSION", "STEERING"].includes(category)) {
            const segmentSelect = categoryFields.querySelector(".dv-segment");
            if (segmentSelect && segmentSelect.value) {
              dv.segment = segmentSelect.value;
            } else {
              console.warn(`Missing segment for ${category} variable: ${name}`);
            }
          }

          const segmentTypeSelect =
            categoryFields.querySelector(".dv-segment-type");
          const segmentType = segmentTypeSelect
            ? segmentTypeSelect.value
            : null;

          // Set segment_type for steering category
          if (category === "STEERING" && segmentType) {
            dv.segment_type = segmentType;
          }

          // Updated list: PROFILE, CONST_BODYRATE, CLG
          if (["PROFILE", "CONST_BODYRATE", "CLG"].includes(segmentType)) {
            // Per-axis bounds logic
            const typeFields = categoryFields.querySelector(
              `.dv-steering-type-fields[data-segment-type="${segmentType}"]`
            );
            if (typeFields) {
              // Collect selected axes
              const axisCheckboxes = typeFields.querySelectorAll(
                ".dv-axis-select-cb:checked"
              );
              const axes = Array.from(axisCheckboxes).map((cb) => cb.value);
              dv.type.axis = axes;
              // Collect bounds for each axis
              const lowerBounds = [];
              const upperBounds = [];
              axes.forEach((axis) => {
                const lowerInput = typeFields.querySelector(
                  `.dv-lower-bound[data-axis="${axis}"]`
                );
                const upperInput = typeFields.querySelector(
                  `.dv-upper-bound[data-axis="${axis}"]`
                );
                const parseArr = (input) =>
                  input && input.value
                    ? input.value
                        .split(",")
                        .map((v) => parseFloat(v.trim()))
                        .filter((v) => !isNaN(v))
                    : [];
                lowerBounds.push(parseArr(lowerInput));
                upperBounds.push(parseArr(upperInput));
              });
              dv.type.lower_bound = lowerBounds;
              dv.type.upper_bound = upperBounds;

              // For CONST_BODYRATE, collect from checkboxes instead of dropdown
              if (segmentType === "CONST_BODYRATE") {
                const controlVarCheckboxes = typeFields.querySelectorAll(
                  ".dv-control-variable-cb:checked"
                );
                if (controlVarCheckboxes && controlVarCheckboxes.length > 0) {
                  dv.type.control_variable = Array.from(
                    controlVarCheckboxes
                  ).map((cb) => cb.value);
                } else {
                  // No default value if no checkbox is selected
                  dv.type.control_variable = [];
                }
              } else {
                // For other types, collect from dropdown as before
                const controlVarInput = typeFields.querySelector(
                  ".dv-control-variable"
                );
                if (controlVarInput)
                  dv.type.control_variable = controlVarInput.value;
              }
              if (segmentType === "PROFILE") {
                const indVar = typeFields.querySelector(".dv-ind-variable");
                const indVector = typeFields.querySelector(".dv-ind-vector");
                if (indVar) dv.type.ind_variable = indVar.value;
                if (indVector)
                  dv.type.ind_vector = indVector.value
                    .split(",")
                    .map((v) => parseFloat(v.trim()))
                    .filter((v) => !isNaN(v));
              }
            }
          } else {
            // Use original logic for other segment types (e.g. ZERO_RATE)
            const controlVarInput = categoryFields.querySelector(
              ".dv-control-variable"
            );
            const axisInput = categoryFields.querySelector(".dv-axis"); // May not exist for ZERO_RATE
            const lowerBoundInput =
              categoryFields.querySelector(".dv-lower-bound"); // May not exist for ZERO_RATE
            const upperBoundInput =
              categoryFields.querySelector(".dv-upper-bound"); // May not exist for ZERO_RATE

            if (controlVarInput) {
              dv.type.control_variable = controlVarInput.value;
            }
            // For types like ZERO_RATE that now don't have axis/bounds in this specific UI,
            // ensure we don't try to read them if they aren't there.
            if (axisInput) {
              if (axisInput.tagName === "SELECT") {
                dv.type.axis = axisInput.value;
              } else {
                dv.type.axis = axisInput.value
                  .split(",")
                  .map((a) => a.trim())
                  .filter((a) => a);
              }
            }
            if (lowerBoundInput) {
              const val = lowerBoundInput.value;
              dv.type.lower_bound = val.includes(",")
                ? val
                    .split(",")
                    .map((v) => parseFloat(v.trim()))
                    .filter((v) => !isNaN(v))
                : parseFloat(val);
            }
            if (upperBoundInput) {
              const val = upperBoundInput.value;
              dv.type.upper_bound = val.includes(",")
                ? val
                    .split(",")
                    .map((v) => parseFloat(v.trim()))
                    .filter((v) => !isNaN(v))
                : parseFloat(val);
            }

            // For PROFILE segment type (should not hit here if PROFILE is in the per-axis list)
            if (segmentType === "PROFILE") {
              const indVar = categoryFields.querySelector(".dv-ind-variable");
              const indVector = categoryFields.querySelector(".dv-ind-vector");
              if (indVar) dv.type.ind_variable = indVar.value;
              if (indVector)
                dv.type.ind_vector = indVector.value
                  .split(",")
                  .map((v) => parseFloat(v.trim()))
                  .filter((v) => !isNaN(v));
            }
          }
        }
        designVariablesData.push(dv);
      }
    });
    console.log("Collected design variables data:", designVariablesData);
    return designVariablesData;
  }
  getDesignVariablesData = patchedGetDesignVariablesData;

  // --- Fix scope/access issues in our patches ---
  function fixScope() {
    // Make sure our patched functions are properly exposed
    window.handleSteeringSegmentTypeChange =
      patchedHandleSteeringSegmentTypeChange;
    window.addDesignVariableInstance = patchedAddDesignVariableInstance;
    window.getDesignVariablesData = patchedGetDesignVariablesData;
    window.initOptimizationModule = patchedInitOptimizationModule;
    window.transformDesignVariablesForOutput =
      transformDesignVariablesForOutput;

    // Also expose our new helper functions if needed
    window.setupPerAxisBounds = setupPerAxisBounds;
    window.initExistingPerAxisBounds = initExistingPerAxisBounds;
    window.addPerAxisBoundsStyling = addPerAxisBoundsStyling;

    // Add direct click handler for the save design variables button
    const saveDesignVariablesBtn = document.getElementById(
      "save-design-variables-btn"
    );
    if (saveDesignVariablesBtn) {
      // Remove any existing handlers to avoid duplicates
      saveDesignVariablesBtn.removeEventListener(
        "click",
        handleSaveDesignVariables
      );
      // Add the click handler
      saveDesignVariablesBtn.addEventListener(
        "click",
        handleSaveDesignVariables
      );
      console.log("Added explicit save handler for design variables button");
    }
  }

  // Function to handle saving design variables
  function handleSaveDesignVariables(event) {
    event.preventDefault();
    console.log("Save Design Variables button clicked directly");

    // Check if the transform function exists
    if (typeof transformDesignVariablesForOutput !== "function") {
      console.error(
        "transformDesignVariablesForOutput function is not defined!"
      );
      console.log(
        "Available window functions:",
        Object.keys(window)
          .filter((key) => typeof window[key] === "function")
          .slice(0, 50)
      );

      // Try to use it from the window object if available
      if (typeof window.transformDesignVariablesForOutput === "function") {
        console.log(
          "Found transform function on window object, using that instead"
        );
      } else {
        alert(
          "Failed to save design variables: transformation function not found. Please refresh the page and try again."
        );
        return;
      }
    }

    // Validate form
    if (
      typeof validateDesignVariablesForm === "function" &&
      !validateDesignVariablesForm()
    ) {
      console.log("Design variables form validation failed");
      return;
    }

    // Get and save data
    const designVariablesData = getDesignVariablesData();
    console.log("Design variables data collected:", designVariablesData);

    // Call the save function
    saveOptimizationData("designVariables", designVariablesData);

    // Show a confirmation message
    if (typeof Swal !== "undefined") {
      Swal.fire({
        icon: "success",
        title: "Saved",
        text: "Design variables data saved successfully!",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
      });
    }

    console.log("Design variables saved to finalMissionData");
  }

  // Call this after everything else
  setTimeout(fixScope, 0);

  // Add a direct manual initialization that runs after everything else
  window.addEventListener("load", function () {
    console.debug("Window load event - initializing per-axis bounds");

    // Force a timeout to ensure DOM is fully ready
    setTimeout(() => {
      console.debug("Delayed initialization starting");

      // Force initialization for all PROFILE, CONST_BODYRATE, and CLG fields
      document
        .querySelectorAll(
          '.dv-steering-type-fields[data-segment-type="PROFILE"], .dv-steering-type-fields[data-segment-type="CONST_BODYRATE"], .dv-steering-type-fields[data-segment-type="CLG"]'
        )
        .forEach((typeFields) => {
          if (typeFields.closest(".hidden-template")) {
            console.debug("Skipping template field");
            return; // Skip template
          }

          const categoryFields = typeFields.closest(
            '.dv-category-fields[data-category="STEERING"]'
          );
          if (categoryFields) {
            console.debug("Setting up bounds for:", typeFields);
            setupPerAxisBounds(categoryFields, typeFields);

            // Force a manual checkbox change event on all checkboxes to ensure fields update
            typeFields.querySelectorAll(".dv-axis-select-cb").forEach((cb) => {
              const event = new Event("change");
              cb.dispatchEvent(event);
              console.debug(`Dispatched change event to ${cb.value} checkbox`);
            });
          }
        });

      console.debug("Delayed initialization complete");
    }, 1000);
  });

  // Transform design variables data to the required final mission data JSON format
  function transformDesignVariablesForOutput(designVariablesData) {
    const dvNames = designVariablesData.map((dv) => dv.name);

    const result = {
      design_variables: "design_variable1",
      design_variable1: dvNames,
    };

    const availableMotors = [];
    // Get available steering segments in the correct format
    const availableSteeringSegments = [];

    if (window.finalMissionData) {
      // Get motors
      Object.keys(window.finalMissionData).forEach((key) => {
        if (
          key.startsWith("Stage_") &&
          window.finalMissionData[key] &&
          window.finalMissionData[key].motor
        ) {
          availableMotors.push(...window.finalMissionData[key].motor);
        }
      });

      // Get steering segments from any steering sequence in the mission data
      Object.keys(window.finalMissionData).forEach((key) => {
        if (
          window.finalMissionData[key] &&
          window.finalMissionData[key].steering &&
          Array.isArray(window.finalMissionData[key].steering)
        ) {
          availableSteeringSegments.push(
            ...window.finalMissionData[key].steering
          );
        }
      });
    }

    designVariablesData.forEach((dv) => {
      const dvEntry = [
        {
          category: dv.category,
        },
      ];

      // Add segment with proper formatting based on category
      if (dv.segment) {
        if (dv.category === "STEERING") {
          // Find the exact segment name as it appears in the steering section
          const formattedSegment = availableSteeringSegments.find(
            (segment) => segment === dv.segment
          );

          // Use the exact name from the steering section, or search case-insensitively if not found
          if (formattedSegment) {
            dvEntry[0].segment = formattedSegment;
          } else {
            // Fallback: try to find by case-insensitive comparison
            const fallbackSegment = availableSteeringSegments.find(
              (segment) => segment.toLowerCase() === dv.segment.toLowerCase()
            );
            dvEntry[0].segment = fallbackSegment || dv.segment;
          }
        } else {
          // For other categories, use the segment as is
          dvEntry[0].segment = dv.segment;
        }
      } else if (dv.category === "PROPULSION") {
        if (availableMotors.length > 0) {
          dvEntry[0].segment = availableMotors[0];
        } else {
          dvEntry[0].segment = "S1_MOTOR1";
        }
      }

      // Add segment_type for STEERING only if it exists in dv object
      if (dv.category === "STEERING" && dv.segment_type) {
        dvEntry[0].segment_type = dv.segment_type;
      }

      if (dv.flag) {
        dvEntry[0].flag = dv.flag;
      }

      // Construct the typeObject carefully from dv.type
      const typeObject = {};
      const sourceDvType = dv.type || {}; // Ensure dv.type exists

      // control_variable: must be an array. If single string, convert. If undefined/null, use empty array.
      if (Array.isArray(sourceDvType.control_variable)) {
        typeObject.control_variable = sourceDvType.control_variable;
      } else if (typeof sourceDvType.control_variable === "string") {
        typeObject.control_variable = sourceDvType.control_variable
          ? [sourceDvType.control_variable]
          : [];
      } else {
        typeObject.control_variable = [];
      }

      // Ensure control_variable is never an empty array for STEERING category
      // except for CONST_BODYRATE which should only have user-selected values
      if (
        dv.category === "STEERING" &&
        typeObject.control_variable.length === 0 &&
        dv.segment_type !== "CONST_BODYRATE"
      ) {
        // Add a default control variable based on segment_type
        if (dv.segment_type === "CLG") {
          typeObject.control_variable = ["GAIN"];
        } else if (dv.segment_type === "PROFILE") {
          typeObject.control_variable = ["PROFILE"];
        } else if (dv.segment_type === "ZERO_RATE") {
          typeObject.control_variable = ["ZERO_RATE"];
        }
      }

      // axis: only if present in sourceDvType. Must be an array.
      if (sourceDvType.axis !== undefined) {
        typeObject.axis = Array.isArray(sourceDvType.axis)
          ? sourceDvType.axis
          : [sourceDvType.axis];
      }

      // PROFILE specific fields for STEERING: only if present in sourceDvType
      if (dv.category === "STEERING" && dv.segment_type === "PROFILE") {
        if (sourceDvType.ind_variable !== undefined) {
          typeObject.ind_variable = sourceDvType.ind_variable;
        }
        if (sourceDvType.ind_vector !== undefined) {
          typeObject.ind_vector = Array.isArray(sourceDvType.ind_vector)
            ? sourceDvType.ind_vector
            : [sourceDvType.ind_vector];
        }
      }

      // upper_bound: only if present. Ensure correct nesting.
      if (
        sourceDvType.upper_bound !== undefined &&
        sourceDvType.upper_bound !== null
      ) {
        if (Array.isArray(sourceDvType.upper_bound)) {
          if (
            sourceDvType.upper_bound.length === 0 ||
            Array.isArray(sourceDvType.upper_bound[0])
          ) {
            typeObject.upper_bound = sourceDvType.upper_bound;
          } else {
            typeObject.upper_bound = [sourceDvType.upper_bound];
          }
        } else {
          typeObject.upper_bound = [[sourceDvType.upper_bound]];
        }
      }

      // lower_bound: only if present. Ensure correct nesting.
      if (
        sourceDvType.lower_bound !== undefined &&
        sourceDvType.lower_bound !== null
      ) {
        if (Array.isArray(sourceDvType.lower_bound)) {
          if (
            sourceDvType.lower_bound.length === 0 ||
            Array.isArray(sourceDvType.lower_bound[0])
          ) {
            typeObject.lower_bound = sourceDvType.lower_bound;
          } else {
            typeObject.lower_bound = [sourceDvType.lower_bound];
          }
        } else {
          typeObject.lower_bound = [[sourceDvType.lower_bound]];
        }
      }

      // Assign typeObject based on category
      // ALL categories, including PROPULSION, should have type as an array with one object.
      dvEntry[0].type = [typeObject];

      result[dv.name] = dvEntry;
    });

    return result;
  }
});
