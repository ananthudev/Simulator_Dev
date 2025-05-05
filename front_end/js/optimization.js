// Optimization Module for Astra GUI

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

        if (nameSelect && nameSelect.value && flagSelect && factorSelect) {
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

  // Function to save optimization data
  function saveOptimizationData(section, data) {
    console.log(`Saving ${section} data:`, data);

    // Here you would normally save to backend or update in memory

    // Show success message
    Swal.fire({
      icon: "success",
      title: "Saved",
      text: `${section} data saved successfully!`,
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
    });

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
              <option value="latitude">Latitude</option>
              <option value="longitude">Longitude</option>
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
    const enableToggleLabel = newInstance.querySelector(".toggle-slider");
    if (enableToggle && enableToggleLabel) {
      const toggleId = `constraint-enable-${window.constraintCounter}`;
      enableToggle.id = toggleId;
      enableToggleLabel.setAttribute("for", toggleId);
    }

    // If not the first constraint, add a divider before this one
    if (constraintsContainer.children.length > 0) {
      const divider = document.createElement("div");
      divider.className = "constraint-divider";
      constraintsContainer.appendChild(divider);
    }

    // Hide the factor field completely since it's always 1
    const factorInput = newInstance.querySelector(".constraint-factor");
    if (factorInput) {
      factorInput.parentElement.style.display = "none";
    }

    // Add to container first so we can find elements
    constraintsContainer.appendChild(newInstance);

    // Populate constraint name dropdown for this instance
    const nameSelect = newInstance.querySelector(".constraint-name");
    if (nameSelect) {
      // Clear the dropdown except for the placeholder
      while (nameSelect.options.length > 1) {
        nameSelect.remove(1);
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
        nameSelect.appendChild(optionElement);
      });

      // Add listener for constraint name changes
      nameSelect.addEventListener("change", handleConstraintNameChange);
    }

    // Populate flag dropdown if it exists
    const flagSelect = newInstance.querySelector(".constraint-flag");
    if (flagSelect) {
      populateFlagDropdown(
        flagSelect,
        `Constraint ${window.constraintCounter}`
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
          prevElement.classList.contains("constraint-divider")
        ) {
          constraintsContainer.removeChild(prevElement);
        }

        newInstance.remove();
        // Optionally renumber remaining constraints
        renumberConstraints();
      });
    }

    // Add event listener to the type dropdown to toggle condition field
    const typeSelect = newInstance.querySelector(".constraint-type");
    const conditionField = newInstance.querySelector(".constraint-condition");

    if (typeSelect && conditionField) {
      typeSelect.addEventListener("change", () => {
        toggleConditionBasedOnType(typeSelect, conditionField);
      });
    }

    // Add div container for additional fields
    const additionalFieldsContainer = document.createElement("div");
    additionalFieldsContainer.className = "additional-fields";
    newInstance.appendChild(additionalFieldsContainer);
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
          value: valueInput ? parseFloat(valueInput.value) : null,
          type: typeSelect ? typeSelect.value : null,
          condition: conditionSelect ? conditionSelect.value : null,
          flag: flagSelect ? flagSelect.value || null : null,
          tolerance: toleranceInput ? parseFloat(toleranceInput.value) : null,
          enable: enableToggle ? enableToggle.checked : true,
          factor: 1, // Always 1 as per requirements - kept in data model but hidden in UI
        };

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

                  // Format expected: [[lat1,lon1],[lat2,lon2]]
                  if (
                    lineBoundsText.startsWith("[") &&
                    lineBoundsText.endsWith("]")
                  ) {
                    constraint.Parameters.line_bounds = {
                      l1: JSON.parse(lineBoundsText),
                    };
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
                    constraint.Parameters.Center = JSON.parse(centerText);
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
                      constraint.Parameters.Center = parts;
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
                  // Try to parse as JSON array
                  const lineBoundText = lineBoundInput.value.trim();
                  if (
                    lineBoundText.startsWith("[") &&
                    lineBoundText.endsWith("]")
                  ) {
                    constraint.Parameters.Line_Bound =
                      JSON.parse(lineBoundText);
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

                  // Format expected: [[lat1,lon1],[lat2,lon2]]
                  if (
                    lineBoundsText.startsWith("[") &&
                    lineBoundsText.endsWith("]")
                  ) {
                    constraint.Parameters.line_bounds = {
                      l1: JSON.parse(lineBoundsText),
                    };
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
                    constraint.Parameters.Center = JSON.parse(centerText);
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
                      constraint.Parameters.Center = parts;
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
                  // Try to parse as JSON array
                  const lineBoundText = lineBoundInput.value.trim();
                  if (
                    lineBoundText.startsWith("[") &&
                    lineBoundText.endsWith("]")
                  ) {
                    constraint.Parameters.Line_Bound =
                      JSON.parse(lineBoundText);
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
      const activeComponents =
        window.steeringManager?.getActiveComponentIdsAndTypes() || [];
      if (activeComponents.length === 0) {
        console.warn(
          "No active steering components found to populate Design Variable segment dropdown."
        );
        // Add a dummy option if needed
        // const option = document.createElement("option");
        // option.value = "dummy_segment";
        // option.textContent = "No Segments Defined";
        // selectElement.appendChild(option);
        return;
      }
      activeComponents.forEach((comp) => {
        const option = document.createElement("option");
        option.value = comp.id; // Use component ID as value
        option.textContent = comp.name; // Display user-friendly name (e.g., "Profile 1")
        option.dataset.segmentType = comp.type; // Store type (PROFILE, CLG etc.) for later use
        selectElement.appendChild(option);
      });
    } catch (error) {
      console.error("Error populating steering segment dropdown:", error);
    }
  }

  // Placeholder for populating propulsion segments (e.g., stages)
  function populateGenericSegmentDropdown(selectElement, category) {
    if (!selectElement) return;
    while (selectElement.options.length > 1) {
      selectElement.remove(1);
    }
    // Example: Fetch stage names if category is PROPULSION
    if (category === "PROPULSION") {
      // TODO: Replace with actual logic to get stage names from vehicle configuration
      const stageNames = ["Stage1", "Stage2", "UpperStage"]; // Placeholder
      stageNames.forEach((name) => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        selectElement.appendChild(option);
      });
    }
  }

  // Function to handle Design Variable category changes
  function handleDesignVariableCategoryChange(event) {
    const categorySelect = event.target;
    const instance = categorySelect.closest(".optimization-instance");
    if (!instance) return;

    const selectedCategory = categorySelect.value;
    const dynamicFieldsContainer = instance.querySelector(".dv-dynamic-fields");
    const allCategoryFields = dynamicFieldsContainer.querySelectorAll(
      ".dv-category-fields"
    );
    const nameInput = instance.querySelector(".dv-name");

    // Hide all category-specific fields first
    allCategoryFields.forEach((fieldSet) => fieldSet.classList.add("hidden"));

    // Show fields for the selected category
    const selectedFieldSet = dynamicFieldsContainer.querySelector(
      `.dv-category-fields[data-category="${selectedCategory}"]`
    );
    if (selectedFieldSet) {
      selectedFieldSet.classList.remove("hidden");
      // Populate necessary dropdowns within this fieldset
      populateDesignVariableDropdowns(selectedFieldSet);

      // Special handling for STEERING to show sub-type dropdown
      if (selectedCategory === "STEERING") {
        handleSteeringSegmentChange({
          target: selectedFieldSet.querySelector(".dv-segment"),
        }); // Trigger segment change handler
      }
    }

    // Auto-fill name based on category
    if (nameInput) {
      // Define default name patterns for each category
      const defaultNamePatterns = {
        CUT_OFF: "opt_cut_off",
        PAYLOAD: "opt_payload",
        AZIMUTH: "opt_azimuth",
        SEQUENCE: "opt_coast_duration",
        PROPULSION: "opt_propulsion",
        STEERING: "opt_steering",
      };

      // Get the new default name for the selected category
      const newDefaultName = defaultNamePatterns[selectedCategory] || "";

      // Check if the current name matches any of our default patterns
      const currentValue = nameInput.value || "";
      const isUsingDefaultName = Object.values(defaultNamePatterns).some(
        (pattern) =>
          currentValue === pattern || currentValue.startsWith(pattern + "_")
      );

      // Update the name if it's empty or matches a default pattern
      if (!currentValue || isUsingDefaultName) {
        nameInput.value = newDefaultName;
      }
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
      : null; // Get type from selected segment option

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
        input.placeholder = input.placeholder.replace(
          "numeric",
          "comma-separated"
        );
      });
      upperBoundInputs.forEach((input) => {
        input.type = "text";
        input.placeholder = input.placeholder.replace(
          "numeric",
          "comma-separated"
        );
      });
      controlVarInputs.forEach((input) => {
        input.type = "text";
        input.placeholder = input.placeholder.replace(
          "numeric",
          "comma-separated"
        );
      });
      axisInputs.forEach((input) => {
        if (input.tagName === "INPUT") {
          // Only change input fields, not selects
          input.type = "text";
          input.placeholder = input.placeholder.replace(
            "numeric",
            "comma-separated"
          );
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
          input.placeholder = input.placeholder.replace(
            "numeric",
            "comma-separated"
          );
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
          const segmentSelect = categoryFields.querySelector(".dv-segment"); // Could be for PROPULSION or STEERING

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
            if (segmentSelect) dv.segment = segmentSelect.value || null;
            if (controlVarInput)
              dv.type.control_variable = parseArray(controlVarInput);
            if (lowerBoundInput)
              dv.type.lower_bound = parseArray(lowerBoundInput);
            if (upperBoundInput)
              dv.type.upper_bound = parseArray(upperBoundInput);
          } else if (category === "STEERING") {
            const segmentTypeSelect =
              categoryFields.querySelector(".dv-segment-type");
            const segmentType = segmentTypeSelect
              ? segmentTypeSelect.value
              : null;

            if (segmentSelect) dv.segment = segmentSelect.value || null;
            if (segmentType) dv.segment_type = segmentType;

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
    objectiveFunctionForm.addEventListener("submit", (event) => {
      event.preventDefault();
      console.log("Objective Function form submitted.");

      // Perform basic validation
      const objectiveData = getObjectiveFunctionData();

      if (objectiveData.length === 0) {
        Swal.fire({
          icon: "error",
          title: "Validation Error",
          text: "Please add at least one objective function.",
          toast: false,
          confirmButtonText: "OK",
        });
        return;
      }

      saveOptimizationData("objectiveFunctions", objectiveData);
    });
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
  if (
    objectiveFunctionContainer &&
    objectiveFunctionContainer.children.length === 0
  ) {
    console.log(
      "Automatically creating initial objective function form on page load"
    );
    addObjectiveFunctionForm();
  }

  // Auto-create an initial constraint form if the container exists and is empty
  if (constraintsContainer && constraintsContainer.children.length === 0) {
    console.log("Automatically creating initial constraint form on page load");
    addConstraintInstance();
  }

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
  `;

  // Apply the styles more directly to ensure they take effect
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.textContent = optimizationStyles; // Use textContent instead of innerText
  document.head.appendChild(styleSheet);

  // Also add initialization for existing constraints
  function initializeExistingConstraints() {
    const existingConstraints = document.querySelectorAll(
      "#constraints-container .optimization-instance:not(.hidden-template)"
    );
    existingConstraints.forEach((constraint, index) => {
      // Add the class and direct styling
      const colorIndex = (index + 1) % 6 || 6;
      constraint.classList.add(`constraint-form-${colorIndex}`);

      // Apply direct color with inline style
      const borderColors = {
        1: "#4a90e2", // Blue
        2: "#50e3c2", // Teal
        3: "#e6a545", // Orange
        4: "#bd10e0", // Purple
        5: "#e3506f", // Pink
        6: "#67c23a", // Green
      };
      constraint.style.borderLeft = `4px solid ${borderColors[colorIndex]}`;

      // Make the heading more prominent
      const heading = constraint.querySelector(".instance-title");
      if (heading) {
        heading.classList.add("constraint-heading");
      }
    });
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
    handleDesignVariableCategoryChange,
    handleSteeringSegmentTypeChange,
    clearDesignVariablesForm,
    setupFileUpload,
    createAlgorithmTag,
    updateAlgorithmsCounter,
    toggleModeFields,
    setupAddAlgorithmButton,
  };

  // --- Design Variables Listeners ---
  if (addDesignVariableBtn) {
    addDesignVariableBtn.addEventListener("click", addDesignVariableInstance);
  }

  if (designVariablesForm) {
    designVariablesForm.addEventListener("submit", (event) => {
      event.preventDefault();
      console.log("Design Variables form submitted.");
      const designVariablesData = getDesignVariablesData();

      // Add validation logic here if needed
      let isValid = true;
      // Example validation: Check if names are unique
      const names = designVariablesData.map((dv) => dv.name);
      if (new Set(names).size !== names.length) {
        isValid = false;
        Swal.fire({
          icon: "error",
          title: "Validation Error",
          text: "Design variable names must be unique.",
        });
      }
      // Add more specific validation per category...

      if (isValid) {
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

  // Auto-create initial design variable instance
  if (
    designVariablesContainer &&
    designVariablesContainer.children.length === 0
  ) {
    console.log("Automatically creating initial design variable form on load");
    addDesignVariableInstance();
  }

  // Function to initialize existing design variables
  function initializeExistingDesignVariables() {
    try {
      const missionData = JSON.parse(localStorage.getItem("missionData")) || {};
      const designVariablesData =
        missionData.optimization?.designVariables || [];

      if (designVariablesData.length > 0) {
        // Clear existing instances
        designVariablesContainer.innerHTML = "";
        designVariableCounter = 0;

        // Create instances for each design variable
        designVariablesData.forEach((dvData) => {
          addDesignVariableInstance();

          // Get the last created instance
          const newInstance = designVariablesContainer.querySelector(
            `.optimization-instance:last-child`
          );

          if (newInstance) {
            // Set basic fields
            const categorySelect = newInstance.querySelector(".dv-category");
            const nameInput = newInstance.querySelector(".dv-name");

            if (categorySelect) {
              categorySelect.value = dvData.category;
              categorySelect.dispatchEvent(new Event("change"));
            }

            if (nameInput) {
              nameInput.value = dvData.name || "";
            }

            // Set category-specific fields
            const categoryFields = newInstance.querySelector(
              `.dv-category-fields[data-category="${dvData.category}"]`
            );
            if (categoryFields) {
              const controlVarInput = categoryFields.querySelector(
                ".dv-control-variable"
              );
              const lowerBoundInput =
                categoryFields.querySelector(".dv-lower-bound");
              const upperBoundInput =
                categoryFields.querySelector(".dv-upper-bound");
              const flagSelect = categoryFields.querySelector(".dv-flag");
              const segmentSelect = categoryFields.querySelector(".dv-segment");

              // Helper to set input value (handles arrays)
              const setInputValue = (input, value) => {
                if (!input || value === undefined || value === null) return;
                if (Array.isArray(value)) {
                  input.value = value.join(",");
                } else {
                  input.value = value;
                }
              };

              // Set control variables
              if (
                controlVarInput &&
                dvData.type &&
                dvData.type.control_variable
              ) {
                setInputValue(controlVarInput, dvData.type.control_variable);
              }

              // Set bounds
              if (
                lowerBoundInput &&
                dvData.type &&
                dvData.type.lower_bound !== undefined
              ) {
                setInputValue(lowerBoundInput, dvData.type.lower_bound);
              }

              if (
                upperBoundInput &&
                dvData.type &&
                dvData.type.upper_bound !== undefined
              ) {
                setInputValue(upperBoundInput, dvData.type.upper_bound);
              }

              // Set flag if applicable
              if (flagSelect && dvData.flag) {
                flagSelect.value = dvData.flag;
              }

              // Set segment if applicable
              if (segmentSelect && dvData.segment) {
                segmentSelect.value = dvData.segment;
              }

              // Special handling for STEERING category
              if (dvData.category === "STEERING" && dvData.segment_type) {
                const segmentTypeSelect =
                  categoryFields.querySelector(".dv-segment-type");
                if (segmentTypeSelect) {
                  segmentTypeSelect.value = dvData.segment_type;
                  segmentTypeSelect.dispatchEvent(new Event("change"));

                  // Find and populate the specific steering type fields
                  const steeringTypeFields = categoryFields.querySelector(
                    `.dv-steering-type-fields[data-segment-type="${dvData.segment_type}"]`
                  );

                  if (steeringTypeFields) {
                    const typeAxisSelect =
                      steeringTypeFields.querySelector(".dv-axis");

                    if (typeAxisSelect) {
                      if (typeAxisSelect.tagName === "SELECT") {
                        // For dropdown selects (e.g., CLG)
                        if (dvData.type && dvData.type.axis) {
                          typeAxisSelect.value = dvData.type.axis;
                        }
                      } else if (typeAxisSelect.tagName === "INPUT") {
                        // For text inputs (multi-axis)
                        setInputValue(
                          typeAxisSelect,
                          dvData.type && dvData.type.axis
                        );
                      }
                    }

                    // For PROFILE type, set additional fields
                    if (dvData.segment_type === "PROFILE") {
                      const indVarSelect =
                        steeringTypeFields.querySelector(".dv-ind-variable");
                      const indVectorInput =
                        steeringTypeFields.querySelector(".dv-ind-vector");

                      if (
                        indVarSelect &&
                        dvData.type &&
                        dvData.type.ind_variable
                      ) {
                        indVarSelect.value = dvData.type.ind_variable;
                      }

                      if (
                        indVectorInput &&
                        dvData.type &&
                        dvData.type.ind_vector
                      ) {
                        setInputValue(indVectorInput, dvData.type.ind_vector);
                      }
                    }
                  }
                }
              }
            }
          }
        });

        console.log(
          `Initialized ${designVariablesData.length} existing design variables`
        );
      }
    } catch (error) {
      console.error("Error initializing existing design variables:", error);
    }
  }

  // Call this on page load
  initializeExistingConstraints();

  // Also need to initialize design variables if they exist
  initializeExistingDesignVariables();

  // Add design variable specific styles
  const designVariableStyles = `
    /* Design Variable styles */
    #design-variables-container .optimization-instance {
      background: rgba(30, 30, 30, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.15);
      box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16);
      transition: all 0.3s ease;
      margin-bottom: 20px;
      border-radius: 5px;
      padding: 15px;
      position: relative;
    }
    
    #design-variables-container .optimization-instance:hover {
      background: rgba(40, 40, 40, 0.7);
      border-color: rgba(255, 255, 255, 0.25);
    }
    
    /* Colored borders for different design variables */
    #design-variables-container .optimization-instance:nth-child(6n+1) {
      border-left: 4px solid #4a90e2; /* Blue */
    }
    
    #design-variables-container .optimization-instance:nth-child(6n+2) {
      border-left: 4px solid #50e3c2; /* Teal */
    }
    
    #design-variables-container .optimization-instance:nth-child(6n+3) {
      border-left: 4px solid #e6a545; /* Orange */
    }
    
    #design-variables-container .optimization-instance:nth-child(6n+4) {
      border-left: 4px solid #bd10e0; /* Purple */
    }
    
    #design-variables-container .optimization-instance:nth-child(6n+5) {
      border-left: 4px solid #e3506f; /* Pink */
    }
    
    #design-variables-container .optimization-instance:nth-child(6n+6) {
      border-left: 4px solid #67c23a; /* Green */
    }
    
    /* Add color coding classes by index */
    .design-var-color-1 { border-left: 4px solid #4a90e2 !important; } /* Blue */
    .design-var-color-2 { border-left: 4px solid #50e3c2 !important; } /* Teal */
    .design-var-color-3 { border-left: 4px solid #e6a545 !important; } /* Orange */
    .design-var-color-4 { border-left: 4px solid #bd10e0 !important; } /* Purple */
    .design-var-color-5 { border-left: 4px solid #e3506f !important; } /* Pink */
    .design-var-color-6 { border-left: 4px solid #67c23a !important; } /* Green */
    
    /* Divider between design variable instances */
    .design-variable-divider {
      height: 15px;
      margin-bottom: 20px;
      border-top: 1px dashed rgba(255, 255, 255, 0.2);
      position: relative;
    }
    
    .design-variable-divider:after {
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
    
    .instance-title {
      margin-top: 0;
      margin-bottom: 15px;
      font-size: 18px;
      font-weight: 600;
      color: #ffffff;
      border-bottom: 1px solid rgba(255, 255, 255, 0.15);
      padding-bottom: 10px;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    }
    
    .dv-dynamic-fields {
      margin-top: 15px;
      padding-top: 10px;
      border-top: 1px dashed rgba(255, 255, 255, 0.1);
    }
    
    .dv-category-fields {
      margin-bottom: 10px;
    }
    
    .dv-steering-sub-fields {
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px dotted rgba(255, 255, 255, 0.1);
    }
    
    .dv-steering-type-fields {
      margin-top: 10px;
    }
  `;

  // Add the design variable styles to the document
  const dvStyleSheet = document.createElement("style");
  dvStyleSheet.type = "text/css";
  dvStyleSheet.textContent = designVariableStyles;
  document.head.appendChild(dvStyleSheet);

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

        paramInputs.forEach((input) => {
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
          } else {
            value = input.value;
          }

          if (paramKey && value !== undefined) {
            algoParams[paramKey] = value;
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
    const existingParams = window.optimizationHandler
      .getArchipelagoAlgorithmParams
      ? window.optimizationHandler.getArchipelagoAlgorithmParams(tagId)
      : {};

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
          } else {
            value = input.value;
          }

          if (paramKey && value !== undefined) {
            params[paramKey] = value;
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
});
