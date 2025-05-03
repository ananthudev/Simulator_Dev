Allowing users to configure the specific parameters for the selected optimization algorithm(s) is crucial for flexibility. Since the parameters differ significantly between algorithms (as shown in mode_algorithms.md), we need a dynamic way to display the relevant form fields.
Here's a user-friendly approach we can implement, focusing first on the "Normal" mode for simplicity, and then outlining the path for "Archipelago" mode:

1. Data Structure for Parameters:
   First, we need the parameter definitions accessible in JavaScript. We'll create an object based on mode_algorithms.md. I'll put this near the top of the optimization.js file. Note: This requires manually translating the markdown structure. A dedicated JSON config file might be more robust long-term.
2. Dynamic Form Generation (Normal Mode):
   We'll add a container div in the HTML right below the "Algorithm" dropdown in the "Normal" mode section. Let's give it an ID like normal-algorithm-params.
   We'll create a new JavaScript function, displayAlgorithmParameters(algorithmName, containerElement, mode, existingParams = {}), which will:
   Take the selected algorithm's name, the container element to populate, the mode ('normal' or 'archipelago'), and optional existing parameters (for loading saved data).
   Clear the container.
   Look up the parameters for algorithmName in our algorithmParameters object.
   If parameters exist, iterate through them and generate appropriate HTML form elements (input, select, checkbox) with labels, default values (or existingParams), and necessary attributes (like min, max, step).
   Append these elements to the containerElement. We can arrange them in a two-column layout for better space usage.
   We'll modify initModeForm to add an event listener to the #normal-algorithm dropdown. When the selection changes, it will call displayAlgorithmParameters to update the form. It will also call this function initially on load to show parameters for the default or previously selected algorithm.
3. Collecting Parameter Data:
   We'll modify the getModeData function. When in "Normal" mode, after getting the selected algorithm, it will find all the input elements within the #normal-algorithm-params container and collect their values. These will be stored in the returned object, perhaps under a parameters key (e.g., modeData.parameters = { generation: 100, F: 0.8, ... }).
4. Loading Parameter Data:
   We'll modify initializeExistingModeData. When loading data for "Normal" mode, after setting the algorithm dropdown, it will call displayAlgorithmParameters, passing the saved parameters (modeData.parameters) to pre-fill the form.
5. Archipelago Mode Adaptation:
   Displaying parameters directly under each tag could become messy. A better approach for archipelago would be:
   Modal Dialog: When an algorithm tag is clicked, open a modal window specific to that algorithm instance.
   Parameter Storage: We'll need a way to store the parameters associated with each specific algorithm tag in the archipelago (since you could potentially add the same algorithm multiple times, though the current limit is 3 unique ones). The modal's "Save" button would update this storage.
   Data Collection: getModeData would need to collect the parameters for each selected algorithm from this storage mechanism (e.g., modeData.parameters = { "PSO": {...}, "DE": {...} }).
   Implementation:
   I will now add the necessary JavaScript code to optimization.js to implement the dynamic parameter display for the Normal mode. This involves:
   Adding the algorithmParameters data structure.
   Creating the displayAlgorithmParameters function.
   Modifying initModeForm, getModeData, and initializeExistingModeData.
   Adding placeholder functions for archipelago parameter handling (storeArchipelagoAlgorithmParams, getArchipelagoAlgorithmParams) which will be needed when we implement the modal approach.
   I'll also add comments indicating where the corresponding HTML containers (#normal-algorithm-params) should be placed.
   Apply to mode_algorit...
   To complete this:
   HTML Changes: You need to add <div id="normal-algorithm-params" class="algorithm-parameters-container"></div> inside the normal-mode-fields div in your HTML file, likely right after the #normal-algorithm select element's group.
   CSS: Add the CSS rules provided in the dynamicStyles constant within the script, or add them to your project's CSS file.
   Archipelago Implementation: The next step would be to implement the modal logic (openAlgorithmParamsModal) triggered by clicking the algorithm tags in archipelago mode, using the store/get/clearArchipelagoAlgorithmParams functions to manage parameters associated with each tag's unique ID.

HTML Changes: You need to add <div id="normal-algorithm-params" class="algorithm-parameters-container"></div> inside the normal-mode-fields div in your HTML file, likely right after the #normal-algorithm select element's group.
CSS: Add the CSS rules provided in the dynamicStyles constant within the script, or add them to your project's CSS file.
Archipelago Implementation: The next step would be to implement the modal logic (openAlgorithmParamsModal) triggered by clicking the algorithm tags in archipelago mode, using the store/get/clearArchipelagoAlgorithmParams functions to manage parameters associated with each tag's unique ID.

document.addEventListener("DOMContentLoaded", function () {
console.log("Optimization module loaded");

    // =========================================
    // ALGORITHM PARAMETERS DATA
    // =========================================
    const algorithmParameters = {
        "SGA": {
            "generation": { type: "number", default: 5, label: "Generation", min: 1 },
            "crossover_prob": { type: "number", default: 0.75, label: "Crossover Probability", step: 0.01, min: 0, max: 1 },
            "eta_c": { type: "number", default: 1.0, label: "Eta C (SBX Crossover)", step: 0.1 },
            "mutation_prob": { type: "number", default: 0.85, label: "Mutation Probability", step: 0.01, min: 0, max: 1 },
            "param_m": { type: "number", default: 1.0, label: "Eta M (Polynomial Mutation)", step: 0.1 },
            "param_s": { type: "number", default: 2, label: "Tournament Size", min: 2, step: 1 },
            "crossover": { type: "select", default: "exponential", label: "Crossover Type", options: ["exponential", "sbx", "uniform", "single_point", "two_point", "binomial"] },
            "mutation": { type: "select", default: "gaussian", label: "Mutation Type", options: ["gaussian", "polynomial", "uniform", "cauchy", "macga"] },
            "selection": { type: "select", default: "tournament", label: "Selection Type", options: ["tournament", "roulette", "rank", "stochastic_universal_sampling"] },
            "seed": { type: "text", default: "random", label: "Seed ('random' or number)" }
        },
        "DE": {
            "generation": { type: "number", default: 100, label: "Generation", min: 1 },
            "variant_adptv": { type: "select", default: 1, label: "Adaptive Variant", options: [{value: 0, text:"None"}, {value: 1, text:"SaDE"}, {value: 2, text:"jDE"}] }, // 0=None, 1=SaDE, 2=jDE?
            "memory": { type: "boolean", default: false, label: "Memory (for SaDE/jDE)" },
            "F": { type: "number", default: 0.8, label: "F (Differential Weight)", step: 0.01, min: 0 },
            "CR": { type: "number", default: 0.9, label: "CR (Crossover Rate)", step: 0.01, min: 0, max: 1 },
            "variant": { type: "select", default: 2, label: "DE Variant", options: [
                { value: 1, text: "rand/1/exp" }, { value: 2, text: "best/1/exp" }, { value: 3, text: "rand-to-best/1/exp" },
                { value: 4, text: "best/2/exp" }, { value: 5, text: "rand/2/exp" }, { value: 6, text: "rand/1/bin" },
                { value: 7, text: "best/1/bin" }, { value: 8, text: "rand-to-best/1/bin" }, { value: 9, text: "best/2/bin" },
                { value: 10, text: "rand/2/bin" }
             ] },
            "ftol": { type: "number", default: 1e-6, label: "Function Tolerance", step: "any" },
            "xtol": { type: "number", default: 1e-6, label: "Parameter Tolerance", step: "any" },
            "seed": { type: "text", default: "random", label: "Seed ('random' or number)" }
        },
        "PSO": {
            "generation": { type: "number", default: 100, label: "Generation", min: 1 },
            "omega": { type: "number", default: 0.8, label: "Omega (Inertia Weight)", step: 0.01 },
            "eta1": { type: "number", default: 2.05, label: "Eta 1 (Cognitive)", step: 0.01 },
            "eta2": { type: "number", default: 2.05, label: "Eta 2 (Social)", step: 0.01 },
            "max_vel": { type: "number", default: 0.6, label: "Max Velocity (% range)", step: 0.01, min: 0, max: 1 },
            "variant": { type: "select", default: 5, label: "PSO Variant", options: [
                { value: 1, text: "Canonical" }, { value: 2, text: "Socially Async" }, { value: 3, text: "Cognitively Async" },
                { value: 4, text: "Fully Async" }, { value: 5, text: "Canonical w/ Constriction" }, { value: 6, text: "Self-Organising HPSO-TVAC"}
            ] },
            "neighb_type": { type: "select", default: 2, label: "Neighborhood Type", options: [{value: 1, text:"gbest"}, {value: 2, text:"lbest"}, {value: 3, text:"Von Neumann"}, {value: 4, text:"Adaptive Random"}] },
            "neighb_param": { type: "number", default: 4, label: "Neighborhood Parameter (k for lbest/AR)", min: 1, step: 1 },
            "memory": { type: "boolean", default: false, label: "Memory (Use Particle's Best)" },
            "seed": { type: "text", default: "random", label: "Seed ('random' or number)" }
        },
        "IPOPT": {
            "tol": { type: "number", default: 1e-8, label: "Overall Optimality Tol", step: "any" }, // IPOPT default
            "linear_solver": { type: "select", default: "mumps", label: "Linear Solver", options: ["mumps", "ma27", "ma57", "ma77", "ma86", "ma97", "pardiso", "wsmp", "hsl"] },
            "dual_inf_tol": { type: "number", default: 1, label: "Dual Infeasibility Tol", step: "any" },
            "constr_viol_tol": { type: "number", default: 1e-4, label: "Constraint Violation Tol", step: "any" },
            "compl_inf_tol": { type: "number", default: 1e-4, label: "Complementarity Inf Tol", step: "any" },
            "bound_relax_factor": { type: "number", default: 1e-8, label: "Bound Relax Factor", step: "any", min:0 },
            "acceptable_tol": { type: "number", default: 1e-6, label: "Acceptable Tolerance", step: "any" },
            "acceptable_iter": { type: "number", default: 15, label: "Acceptable Iterations", min: 0, step: 1 },
            "gradient_approximation": { type: "select", default: "exact", label: "Gradient Approximation", options: ["exact", "finite-difference-values"] }
        },
         "CS": { // Compass Search
            "max_feval": { type: "number", default: 500, label: "Max Function Evaluations", min: 1 },
            "start_range": { type: "number", default: 0.1, label: "Start Range", step: 0.01, min: 0 },
            "stop_range": { type: "number", default: 1e-4, label: "Stop Range", step: "any", min: 0 },
            "reduction_coeff": { type: "number", default: 0.5, label: "Reduction Coefficient", step: 0.01, min: 0, max: 1 }
        },
        "NLOPT": {
            "solver": { type: "select", default: "slsqp", label: "Solver", options: [
                "ccsaq", "cobyla", "slsqp", "mma", // Gradient-based, constrained
                "auglag", "auglag_eq", // Augmented Lagrangian
                "neldermead", "sbplx", "praxis", // Derivative-free, unconstrained/bound
                "bobyqa", "newuoa", "newuoa_bound" // Derivative-free, bound
            ] },
            "stop_val": { type: "number", default: null, label: "Stop Value (null to disable)", optional: true, step: "any" },
            "ftol_rel": { type: "number", default: 1e-6, label: "Relative Function Tol", step: "any", min: 0 }, // Pagmo default
            "ftol_abs": { type: "number", default: 1e-6, label: "Absolute Function Tol", step: "any", min: 0 }, // Pagmo default
            "xtol_rel": { type: "number", default: 1e-6, label: "Relative Parameter Tol", step: "any", min: 0 }, // Pagmo default
            "xtol_abs": { type: "number", default: 1e-6, label: "Absolute Parameter Tol", step: "any", min: 0 }, // Pagmo default
            "maxeval": { type: "number", default: 0, label: "Max Evaluations (0=inf)", min: 0, step: 1 },
            "maxtime": { type: "number", default: 0, label: "Max Time (s) (0=inf)", min: 0, step: 0.1 }
        },
        "GAGGS": { // GA + Global/Local Search
            "Algorithm_1": { type: "select", default: "PSO", label: "Global Algorithm", options: ["SGA", "DE", "PSO", "GWO", "IHS", "AC", "ABC", "CMAES", "XNES", "NSGA2", "CS"] },
            "Algorithm_2": { type: "select", default: "NLOPT", label: "Local Algorithm", options: ["IPOPT", "NLOPT", "CS"] }, // Typically local optimizers
            "Gaggs_generation": { type: "number", default: 5, label: "GAGGS Switch Generation", min: 1 },
            "pop_GA": { type: "number", default: 5, label: "Global Algo Population", min: 1 }
        },
        "MBH": { // Multi-start Basin Hopping
            "innerr_algorithm": { type: "select", default: "CS", label: "Inner (Local) Algorithm", options: ["IPOPT", "NLOPT", "CS"] },
            "runs": { type: "number", default: 100, label: "Number of Runs", min: 1 },
            "perturb": { type: "number", default: 1e-2, label: "Perturbation Factor (% range)", step: "any", min: 0 },
            "seed": { type: "text", default: "random", label: "Seed ('random' or number)" }
        },
        "CSTRS": { // Continuous Stochastic Tunneling Random Search? (Hypothetical based on name)
            "innerr_algorithm": { type: "select", default: "DE", label: "Inner Algorithm", options: ["SGA", "DE", "PSO", "IPOPT", "CS", "NLOPT", "GWO", "IHS", "AC", "ABC", "CMAES", "XNES", "NSGA2"] },
            "iters": { type: "number", default: 1, label: "Tunneling Iterations", min: 1 },
            "seed": { type: "text", default: "random", label: "Seed ('random' or number)" }
        },
        "GWO": { // Grey Wolf Optimizer
            "generation": { type: "number", default: 50, label: "Generation", min: 1 },
            "seed": { type: "text", default: "random", label: "Seed ('random' or number)" }
        },
        "IHS": { // Improved Harmony Search
            "phmcr": { type: "number", default: 0.85, label: "HMCR (Memory Consideration Rate)", step: 0.01, min: 0, max: 1 },
            "ppar_min": { type: "number", default: 0.35, label: "PAR Min (Pitch Adjustment Rate)", step: 0.01, min: 0, max: 1 },
            "ppar_max": { type: "number", default: 0.99, label: "PAR Max", step: 0.01, min: 0, max: 1 },
            "bw_min": { type: "number", default: 1E-5, label: "BW Min (Bandwidth Min)", step: "any" },
            "bw_max": { type: "number", default: 1.0, label: "BW Max", step: "any" }
        },
        "AC": { // Ant Colony Optimization (for continuous) - Pagmo's is API-ACO
            "generation": { type: "number", default: 1, label: "Generation", min: 1 },
            "ker": { type: "number", default: 63, label: "Kernel Factor (Archive Size)", min: 1 },
            "q": { type: "number", default: 1.0, label: "Q (Selection Pressure)", step: 0.01, min:0 },
            "oracle": { type: "number", default: 0.0, label: "Oracle Value", step: 0.01 },
            "acc": { type: "number", default: 0.01, label: "Accuracy (Epsilon)", step: "any", min:0 },
            "threshold": { type: "number", default: 1, label: "Threshold", min:0, step:1 },
            "n_gen_mark": { type: "number", default: 7, label: "N Gen Mark (Stagnation)", min: 1 },
            "impstop": { type: "number", default: 100000, label: "Improvement Stop Generations", min: 0 },
            "evalstop": { type: "number", default: 100000, label: "Evaluation Stop", min: 0 },
            "focus": { type: "number", default: 0.0, label: "Focus", step: 0.01 }, // Might be xi in pagmo
            "memory": { type: "boolean", default: false, label: "Memory (Use Past Solutions)" },
            "seed": { type: "text", default: "random", label: "Seed ('random' or number)" }
        },
        "ABC": { // Artificial Bee Colony
            "generation": { type: "number", default: 1, label: "Generation", min: 1 },
            "limit": { type: "number", default: 20, label: "Limit (Scout Trigger)", min: 1, step:1 },
            "seed": { type: "text", default: "random", label: "Seed ('random' or number)" }
        },
        "CMAES": { // Covariance Matrix Adaptation Evolution Strategy
            "generation": { type: "number", default: 1, label: "Generation", min: 1 },
            "cc": { type: "number", default: -1, label: "cc (Time constant for C path) (-1=auto)" },
            "cs": { type: "number", default: -1, label: "cs (Time constant for step-size) (-1=auto)" },
            "c1": { type: "number", default: -1, label: "c1 (Learning rate for rank-1) (-1=auto)" },
            "cmu": { type: "number", default: -1, label: "cmu (Learning rate for rank-mu) (-1=auto)" },
            "sigma0": { type: "number", default: 0.5, label: "Initial Step Size (% range)", step: 0.01, min: 0 },
            "ftol": { type: "number", default: 1e-6, label: "Function Tolerance", step: "any" },
            "xtol": { type: "number", default: 1e-6, label: "Parameter Tolerance", step: "any" },
            "memory": { type: "boolean", default: false, label: "Memory (Restart Strategy)" },
            "force_bounds": { type: "boolean", default: false, label: "Force Bounds Strictly" },
            "seed": { type: "text", default: "random", label: "Seed ('random' or number)" }
        },
        "XNES": { // Exponential Natural Evolution Strategy
            "generation": { type: "number", default: 1, label: "Generation", min: 1 },
            "eta_mu": { type: "number", default: -1, label: "Eta Mu (Mean LR) (-1=auto)" },
            "eta_sigma": { type: "number", default: -1, label: "Eta Sigma (Step Size LR) (-1=auto)" },
            "eta_b": { type: "number", default: -1, label: "Eta B (Covariance LR) (-1=auto)" },
            "sigma0": { type: "number", default: -1, label: "Initial Step Size (% range) (-1=auto)" },
            "ftol": { type: "number", default: 1e-6, label: "Function Tolerance", step: "any" },
            "xtol": { type: "number", default: 1e-6, label: "Parameter Tolerance", step: "any" },
            "memory": { type: "boolean", default: false, label: "Memory (Restart Strategy)" },
            "force_bounds": { type: "boolean", default: false, label: "Force Bounds Strictly" },
            "seed": { type: "text", default: "random", label: "Seed ('random' or number)" }
        },
        "NSGA2": { // Non-dominated Sorting Genetic Algorithm II (Multi-objective)
            "generation": { type: "number", default: 1, label: "Generation", min: 1 },
            "cr": { type: "number", default: 0.95, label: "Crossover Rate (SBX)", step: 0.01, min: 0, max: 1 },
            "eta_c": { type: "number", default: 10.0, label: "Eta C (Crossover Distribution)", step: 0.1, min:0 },
            "m": { type: "number", default: 0.01, label: "Mutation Rate (Polynomial)", step: 0.001, min:0, max:1 },
            "eta_m": { type: "number", default: 50.0, label: "Eta M (Mutation Distribution)", step: 0.1, min:0 },
            "seed": { type: "text", default: "random", label: "Seed ('random' or number)" }
        }
    };
    // Make it globally accessible (or pass it around if preferred)
    window.algorithmParameters = algorithmParameters;

    // =========================================
    // OBJECTIVE FUNCTION ELEMENTS (Existing)
    // =========================================
    // ...

    // =========================================
    // DYNAMIC PARAMETER FORM FUNCTIONS
    // =========================================

    function displayAlgorithmParameters(algorithmName, containerElement, mode, existingParams = {}) {
        if (!containerElement) {
            console.warn(`Container element for ${mode} parameters not found.`);
            return;
        }
        containerElement.innerHTML = ''; // Clear previous params
        console.log(`Displaying parameters for ${algorithmName} in ${mode} mode. Existing:`, existingParams);

        const params = window.algorithmParameters ? window.algorithmParameters[algorithmName] : null;

        if (!params) {
            containerElement.innerHTML = '<p class="no-params-message">No configurable parameters for this algorithm.</p>';
            return;
        }

        const paramsForm = document.createElement('div');
        paramsForm.className = 'algorithm-parameters-form form-card';

        const title = document.createElement('h4');
        title.className = 'subsection-title';
        title.textContent = `${algorithmName} Parameters`;
        paramsForm.appendChild(title);

        let row = document.createElement('div');
        row.className = 'form-row';
        let itemsInRow = 0;
        const maxItemsPerRow = 2;

        for (const paramKey in params) {
            const paramConfig = params[paramKey];
            const paramId = `${mode}-${algorithmName}-${paramKey}`.replace(/[/.]/g, '-'); // Sanitize ID

            const formGroup = document.createElement('div');
            formGroup.className = 'form-group';

            const label = document.createElement('label');
            label.htmlFor = paramId;
            label.className = 'label';
            label.textContent = paramConfig.label || paramKey;
            if (paramConfig.tooltip) {
                label.title = paramConfig.tooltip;
            }
            formGroup.appendChild(label);

            let inputElementWrapper = formGroup; // Usually append input directly to formGroup
            let inputElement = null; // Initialize inputElement

            const currentValue = (existingParams && existingParams[paramKey] !== undefined)
                ? existingParams[paramKey]
                : paramConfig.default;

            if (paramConfig.type === 'select') {
                inputElement = document.createElement('select');
                inputElement.id = paramId;
                inputElement.className = 'input-field algorithm-param-input';
                inputElement.name = paramKey;

                let options = paramConfig.options || [];
                let defaultValueFound = false;

                // Add placeholder if needed (usually not for parameter selects with defaults)
                // const placeholder = document.createElement('option'); ...

                options.forEach(opt => {
                    const option = document.createElement('option');
                    // Handle object options {value: v, text: t}
                    if (typeof opt === 'object' && opt !== null && opt.value !== undefined) {
                        option.value = opt.value;
                        option.textContent = opt.text || opt.value;
                    } else { // Handle simple array options ['a', 'b']
                        option.value = opt;
                        option.textContent = opt;
                    }

                    // Use loose comparison for default value matching (e.g., 1 == "1")
                    if (option.value == currentValue) {
                        option.selected = true;
                        defaultValueFound = true;
                    }
                    inputElement.appendChild(option);
                });

                 // If current value didn't match any option (e.g. loaded value is invalid), select first option or handle error
                if (!defaultValueFound && inputElement.options.length > 0) {
                     // Maybe select the actual default from config if it exists as an option
                     let defaultOption = Array.from(inputElement.options).find(o => o.value == paramConfig.default);
                     if(defaultOption) {
                         defaultOption.selected = true;
                     } else {
                        // Or select the first option as a fallback
                        // inputElement.options[0].selected = true;
                        console.warn(`Value "${currentValue}" for ${paramKey} not found in options. Defaulting.`);
                     }
                }


            } else if (paramConfig.type === 'boolean') {
                // Create a container for better layout
                const toggleContainer = document.createElement('div');
                toggleContainer.className = 'toggle-container form-control-like'; // Class to mimic input field height/alignment

                inputElement = document.createElement('input');
                inputElement.type = 'checkbox';
                inputElement.id = paramId;
                inputElement.className = 'algorithm-param-input toggle-switch';
                inputElement.name = paramKey;
                inputElement.checked = currentValue === true; // Explicitly check for true

                const sliderLabel = document.createElement('label');
                sliderLabel.className = 'toggle-slider';
                sliderLabel.htmlFor = paramId;
                 // Add text to the label if needed, e.g., "Enabled"
                 // sliderLabel.textContent = ' Enabled';

                toggleContainer.appendChild(inputElement);
                toggleContainer.appendChild(sliderLabel);
                inputElementWrapper.appendChild(toggleContainer); // Append container instead of raw input
                inputElement = null; // Prevent adding the checkbox again below

            } else { // Default to number or text
                inputElement = document.createElement('input');
                inputElement.id = paramId;
                inputElement.className = 'input-field algorithm-param-input';
                inputElement.name = paramKey;
                // Use 'text' for type='text' or if allowing 'random' in number field
                inputElement.type = (paramConfig.type === 'number' && paramKey !== 'seed') ? 'number' : 'text';
                inputElement.value = (currentValue !== null && currentValue !== undefined) ? currentValue : '';

                // Add placeholder using label
                inputElement.placeholder = paramConfig.label || paramKey;
                 if (paramConfig.optional && (paramConfig.default === null || paramConfig.default === undefined)) {
                     inputElement.placeholder += ' (optional)';
                 }

                if (inputElement.type === 'number') {
                    if (paramConfig.min !== undefined) inputElement.min = paramConfig.min;
                    if (paramConfig.max !== undefined) inputElement.max = paramConfig.max;
                    // Set step to 'any' for floating point, otherwise use config or default to 1 for integers
                    inputElement.step = paramConfig.step || (Number.isInteger(paramConfig.default || 1) ? 1 : 'any');
                 }
                 // Add pattern for seed if needed?
                 // if (paramKey === 'seed') inputElement.pattern = "^(random|\\d+)$";
            }

            if (inputElement) { // Append the input/select if it was created
                inputElementWrapper.appendChild(inputElement);
            }

            row.appendChild(formGroup);
            itemsInRow++;

            if (itemsInRow >= maxItemsPerRow) {
                paramsForm.appendChild(row);
                row = document.createElement('div');
                row.className = 'form-row';
                itemsInRow = 0;
            }
        }

        if (itemsInRow > 0) {
            while (itemsInRow < maxItemsPerRow) {
                const emptyGroup = document.createElement('div');
                emptyGroup.className = 'form-group empty-group';
                row.appendChild(emptyGroup);
                itemsInRow++;
            }
            paramsForm.appendChild(row);
        }

        containerElement.appendChild(paramsForm);
    }


    // =========================================
    // CONSTRAINT ELEMENTS (Existing)
    // =========================================
    // ...

    // =========================================
    // DESIGN VARIABLE ELEMENTS (Existing)
    // =========================================
    // ...

    // =========================================
    // MODE FORM FUNCTIONS (MODIFIED)
    // =========================================

    // Mode form elements
    const modeNormalRadio = document.getElementById("mode-normal");
    const modeArchipelagoRadio = document.getElementById("mode-archipelago");
    const normalModeFields = document.getElementById("normal-mode-fields");
    const archipelagoModeFields = document.getElementById("archipelago-mode-fields");
    const normalAlgorithmParamsContainer = document.getElementById('normal-algorithm-params');
    // const archipelagoAlgorithmParamsContainer = document.getElementById('archipelago-algorithm-params'); // For future modal/display

    // ... (Other mode elements: file uploads, archipelago buttons, etc.) ...

    // Store selected algorithms (ensure this is initialized correctly)
    let selectedAlgorithms = []; // Initialize globally if not already done
    const MAX_ALGORITHMS = 3;

    // Function to toggle between normal and archipelago mode (Existing)
    function toggleModeFields() {
        // ... (implementation should exist) ...
        if (modeNormalRadio && modeNormalRadio.checked) {
            normalModeFields.style.display = "block";
            archipelagoModeFields.style.display = "none";
        } else if (modeArchipelagoRadio && modeArchipelagoRadio.checked) {
            normalModeFields.style.display = "none";
            archipelagoModeFields.style.display = "block";
        }
    }

    // Function to setup file upload for CSV files (Existing)
    // ...

    // Function to update the algorithms counter (Existing)
    // ...

    // Function to create an algorithm tag/chip (Existing)
    // --- POTENTIAL MODIFICATION FOR ARCHIPELAGO PARAMS ---
    function createAlgorithmTag(algorithm) {
        const tag = document.createElement("div");
        tag.className = "algorithm-tag";
        tag.dataset.algorithm = algorithm;
        // Add unique ID for parameter storage association?
        tag.id = `algo-tag-${algorithm}-${Date.now()}`; // Simple unique ID

        // ... (rest of tag creation, color, name) ...

        // --- Add click listener to the tag itself (not just remove btn) ---
        tag.addEventListener('click', (event) => {
             // Don't trigger if the remove button was clicked
             if (event.target.classList.contains('remove-algorithm')) {
                 return;
             }
             console.log(`Tag clicked for ${algorithm}`);
             // TODO: Implement openAlgorithmParamsModal(algorithm, tag.id);
             Swal.fire({ icon: 'info', title: 'Parameter Editing', text: `Parameter editing for ${algorithm} in archipelago mode is not yet implemented.` });
        });


        const removeBtn = tag.querySelector(".remove-algorithm");
        if (removeBtn) {
            removeBtn.addEventListener("click", (e) => {
                e.stopPropagation(); // Prevent tag click listener
                // ... (existing remove logic) ...
                 // Remove stored parameters for this tag instance
                 // clearArchipelagoAlgorithmParams(tag.id); // Requires implementation
            });
        }
        return tag;
    }


    // Function to get the mode data (MODIFIED)
    function getModeData() {
        const isNormalMode = modeNormalRadio && modeNormalRadio.checked;
        let modeData = {
            mode: isNormalMode ? "normal" : "archipelago",
            map: {
                lower: 0, // Default
                upper: 1  // Default
            },
            population: 1, // Default
            setPopulation: false, // Default
            csvFilename: null, // Default
            parameters: {} // Parameters specific to the main algorithm(s)
        };

        if (isNormalMode) {
            const algorithm = document.getElementById("normal-algorithm").value;
            modeData.algorithm = algorithm;
            modeData.map.lower = parseFloat(document.getElementById("normal-lower-bound").value) || 0;
            modeData.map.upper = parseFloat(document.getElementById("normal-upper-bound").value) || 1;
            modeData.population = parseInt(document.getElementById("normal-population").value) || 1; // Ensure default is 1
            modeData.setPopulation = document.getElementById("normal-set-population")?.checked || false;
            modeData.csvFilename = document.getElementById("normal-csv-filename")?.value || null;
            modeData.problemStrategy = document.getElementById("normal-problem-strategy")?.value || "IGNORE";

            // Get parameters for the selected algorithm
            const paramsContainer = document.getElementById('normal-algorithm-params');
            const algoParams = {};
            if (paramsContainer && algorithm && window.algorithmParameters[algorithm]) {
                const paramInputs = paramsContainer.querySelectorAll('.algorithm-param-input');
                paramInputs.forEach(input => {
                    const paramKey = input.name;
                    let value;

                    if (input.type === 'checkbox') {
                        value = input.checked;
                    } else if (input.type === 'number') {
                         const config = window.algorithmParameters[algorithm][paramKey];
                         if (input.value === '' && config?.optional) {
                             value = null; // Use null for empty optional number fields
                         } else if (input.value === '') {
                             value = config?.default; // Fallback to default if empty but not optional? Or null? Let's use null.
                             value = null;
                         }
                          else {
                             value = parseFloat(input.value);
                             if (isNaN(value)) { // Handle invalid number input
                                console.warn(`Invalid number format "${input.value}" for ${paramKey}. Using null.`);
                                value = null; // Or fallback to default?
                             }
                         }
                    } else if (input.type === 'text' && paramKey === 'seed') {
                        // Handle 'random' seed specifically
                        if (input.value.toLowerCase() === 'random') {
                            value = 'random';
                        } else {
                            value = parseInt(input.value); // Try parsing as int
                            if (isNaN(value)) {
                                console.warn(`Invalid seed value "${input.value}". Using 'random'.`);
                                value = 'random'; // Fallback for invalid seed number
                            }
                        }
                    }
                     else { // text, select-one, etc.
                        value = input.value;
                    }

                    if (paramKey) {
                        algoParams[paramKey] = value;
                    }
                });
            }
            modeData.parameters = algoParams; // Assign collected parameters

        } else { // Archipelago Mode
            modeData.algorithms = [...selectedAlgorithms]; // Clone the array
            modeData.topology = document.getElementById("archipelago-topology")?.value || "Fully Connected";
            modeData.migrationType = document.getElementById("archipelago-migration-type")?.value || "Broadcast";
            modeData.migrationHandling = document.getElementById("archipelago-migration-handling")?.value || "Evict";
            modeData.map.lower = parseFloat(document.getElementById("archipelago-lower-bound")?.value) || 0;
            modeData.map.upper = parseFloat(document.getElementById("archipelago-upper-bound")?.value) || 1;
            modeData.population = parseInt(document.getElementById("archipelago-population")?.value) || 1; // Ensure default is 1
            modeData.setPopulation = document.getElementById("archipelago-set-population")?.checked || false;
            modeData.csvFilename = document.getElementById("archipelago-csv-filename")?.value || null;

            // Collect parameters for archipelago mode (requires implementation)
            modeData.parameters = {}; // Key: unique tag ID, Value: {param: value, ...}
            const algoTags = selectedAlgorithmsContainer.querySelectorAll('.algorithm-tag');
            algoTags.forEach(tag => {
                 const tagId = tag.id;
                 const algoName = tag.dataset.algorithm;
                 // Retrieve params associated with tagId from where the modal saves them
                 const params = window.optimizationHandler.getArchipelagoAlgorithmParams(tagId); // Use tagId as key
                 modeData.parameters[tagId] = { algorithm: algoName, params: params }; // Store algo name along with params
            });
            console.warn("Archipelago parameter collection assumes getArchipelagoAlgorithmParams(tagId) is implemented.");
        }
        console.log("Collected Mode Data:", modeData);
        return modeData;
    }


    // Function to initialize the mode form (MODIFIED)
    function initModeForm() {
        console.log("Initializing Mode Form");
        // Set default population values if not already set (existing code)
        // ...

        // Set up mode switching (existing code, ensure toggleModeFields is robust)
        const modeRadios = document.querySelectorAll('input[name="optimization-mode"]');
        modeRadios.forEach((radio) => {
            // Remove old listener before adding new one
            radio.removeEventListener('change', toggleModeFields); // Ensure no duplicates if called again
            radio.addEventListener('change', toggleModeFields);
        });
        toggleModeFields(); // Initial call


        // Setup listener for normal algorithm selection
        const normalAlgorithmSelect = document.getElementById("normal-algorithm");
        const normalParamsContainer = document.getElementById('normal-algorithm-params');

        if (normalAlgorithmSelect && normalParamsContainer) {
            // Clone and replace to ensure only one listener
            const newSelect = normalAlgorithmSelect.cloneNode(true);
            normalAlgorithmSelect.parentNode.replaceChild(newSelect, normalAlgorithmSelect);

            newSelect.addEventListener('change', (event) => {
                console.log(`Normal algorithm changed to: ${event.target.value}`);
                // Pass empty object for existingParams on change (use defaults)
                displayAlgorithmParameters(event.target.value, normalParamsContainer, 'normal', {});
            });

            // Initial display on load (will be potentially overridden by initializeExistingModeData)
            if (newSelect.value) {
                console.log(`Initial display for normal algorithm: ${newSelect.value}`);
                displayAlgorithmParameters(newSelect.value, normalParamsContainer, 'normal', {});
            } else {
                 normalParamsContainer.innerHTML = ''; // Clear if no initial algo selected
            }
        } else {
             console.warn("Normal algorithm select or params container not found during init.");
        }

        // Set up file uploads (existing code)
        setupFileUpload( normalCsvUploadBtn, normalCsvClearBtn, normalCsvUpload, normalCsvFilename, (fileData, fileName) => { console.log(`Normal mode CSV file ${fileName} selected`); });
        setupFileUpload( archipelagoCsvUploadBtn, archipelagoCsvClearBtn, archipelagoCsvUpload, archipelagoCsvFilename, (fileData, fileName) => { console.log(`Archipelago mode CSV file ${fileName} selected`); });

        // Setup Add Algorithm Button (ensure it uses the updated createAlgorithmTag)
        setupAddAlgorithmButton(); // Assumes this function correctly adds listeners

        // Add event listeners for the "Set Population" toggle buttons (Existing)
        // ... Ensure toggleCsvUploadVisibility works ...
         const normalSetPopToggle = document.getElementById("normal-set-population");
         const archipelagoSetPopToggle = document.getElementById("archipelago-set-population");
         if (normalSetPopToggle) {
            normalSetPopToggle.addEventListener("change", () => toggleCsvUploadVisibility("normal"));
            toggleCsvUploadVisibility("normal"); // Initial check
         }
         if (archipelagoSetPopToggle) {
            archipelagoSetPopToggle.addEventListener("change", () => toggleCsvUploadVisibility("archipelago"));
            toggleCsvUploadVisibility("archipelago"); // Initial check
         }


        // Set up form submission (Existing)
        if (modeForm) {
             // Clone/replace form to remove old listeners? Safer.
             const newModeForm = modeForm.cloneNode(true);
             modeForm.parentNode.replaceChild(newModeForm, modeForm);
             modeForm = newModeForm; // Update reference

            modeForm.addEventListener("submit", (event) => {
                event.preventDefault();
                const modeData = getModeData();
                console.log("Mode form submitted. Data:", modeData);

                // Add validation if needed
                let isValid = true;
                let errorMessage = "";
                if (modeData.mode === 'normal' && !modeData.algorithm) {
                    isValid = false; errorMessage = "Please select an algorithm for Normal mode.";
                } else if (modeData.mode === 'archipelago' && modeData.algorithms.length === 0) {
                    isValid = false; errorMessage = "Please add at least one algorithm for Archipelago mode.";
                }
                // TODO: Add parameter validation?

                if (isValid) {
                    saveOptimizationData("mode", modeData);
                    // Update state management if applicable
                    // ...
                    Swal.fire({ icon: "success", title: "Mode Saved", text: "Optimization mode settings saved.", toast: true, position: "top-end", showConfirmButton: false, timer: 3000 });
                } else {
                     Swal.fire({ icon: "error", title: "Validation Error", text: errorMessage, toast: false });
                }
            });
        } else {
            console.warn("Mode form not found during init.");
        }
    }


    // Function to initialize the mode form with existing data (MODIFIED)
    function initializeExistingModeData() {
        console.log("Initializing Existing Mode Data");
        try {
            const missionData = JSON.parse(localStorage.getItem("missionData")) || {};
            const modeData = missionData.optimization?.mode || null;

            // Clear archipelago parameter store on load
             window.optimizationHandler.archipelagoParamsStore = {};

            if (!modeData) {
                console.log("No existing mode data found, using defaults.");
                // Set defaults explicitly if needed (e.g., ensure normal mode is checked)
                if (modeNormalRadio) modeNormalRadio.checked = true;
                toggleModeFields(); // Apply default view
                 // Display default params for default selected algo
                 const normalAlgorithmSelect = document.getElementById("normal-algorithm");
                 const normalParamsContainer = document.getElementById('normal-algorithm-params');
                 if (normalAlgorithmSelect?.value && normalParamsContainer) {
                     displayAlgorithmParameters(normalAlgorithmSelect.value, normalParamsContainer, 'normal', {});
                 } else if (normalParamsContainer) {
                      normalParamsContainer.innerHTML = ''; // Clear if no default algo
                 }
                return;
            }

            // Set the mode radio button
            if (modeData.mode === "normal" && modeNormalRadio) {
                modeNormalRadio.checked = true;
            } else if (modeData.mode === "archipelago" && modeArchipelagoRadio) {
                modeArchipelagoRadio.checked = true;
            }
            toggleModeFields(); // Apply the loaded mode view

            if (modeData.mode === "normal") {
                // Set normal mode fields
                const normalAlgorithmSelect = document.getElementById("normal-algorithm");
                const normalParamsContainer = document.getElementById('normal-algorithm-params');

                if (normalAlgorithmSelect) normalAlgorithmSelect.value = modeData.algorithm || "";
                if (modeData.map) {
                    document.getElementById("normal-lower-bound").value = modeData.map.lower ?? 0;
                    document.getElementById("normal-upper-bound").value = modeData.map.upper ?? 1;
                }
                document.getElementById("normal-population").value = modeData.population ?? 1;
                document.getElementById("normal-set-population").checked = modeData.setPopulation ?? false;
                document.getElementById("normal-csv-filename").value = modeData.csvFilename || "";
                document.getElementById("normal-problem-strategy").value = modeData.problemStrategy || "IGNORE";

                // Display parameters with saved values
                if (normalAlgorithmSelect?.value && normalParamsContainer) {
                    console.log(`Loading parameters for normal algorithm: ${normalAlgorithmSelect.value}`);
                    displayAlgorithmParameters(normalAlgorithmSelect.value, normalParamsContainer, 'normal', modeData.parameters || {});
                } else if (normalParamsContainer) {
                     normalParamsContainer.innerHTML = ''; // Clear if no algo selected
                }

                // Show/hide clear button
                 const normalCsvClearBtn = document.getElementById("normal-csv-clear-btn");
                 if (normalCsvClearBtn) normalCsvClearBtn.style.display = modeData.csvFilename ? "block" : "none";

            } else if (modeData.mode === "archipelago") {
                // Set archipelago mode fields
                document.getElementById("archipelago-topology").value = modeData.topology || "Fully Connected";
                document.getElementById("archipelago-migration-type").value = modeData.migrationType || "Broadcast";
                document.getElementById("archipelago-migration-handling").value = modeData.migrationHandling || "Evict";
                if (modeData.map) {
                    document.getElementById("archipelago-lower-bound").value = modeData.map.lower ?? 0;
                    document.getElementById("archipelago-upper-bound").value = modeData.map.upper ?? 1;
                }
                document.getElementById("archipelago-population").value = modeData.population ?? 1;
                document.getElementById("archipelago-set-population").checked = modeData.setPopulation ?? false;
                document.getElementById("archipelago-csv-filename").value = modeData.csvFilename || "";

                 // Show/hide clear button
                 const archipelagoCsvClearBtn = document.getElementById("archipelago-csv-clear-btn");
                 if(archipelagoCsvClearBtn) archipelagoCsvClearBtn.style.display = modeData.csvFilename ? "block" : "none";

                // Add selected algorithms and store their parameters
                if (modeData.algorithms && Array.isArray(modeData.algorithms) && archipelagoAlgorithm && selectedAlgorithmsContainer) {
                    // Clear existing state before loading
                    selectedAlgorithms = [];
                    selectedAlgorithmsContainer.innerHTML = `<span id="algorithms-counter" class="algorithms-counter">0/${MAX_ALGORITHMS} selected</span>`; // Reset container

                    // Restore available options in dropdown (start with all)
                    const allAlgoOptions = Array.from(document.querySelectorAll('#normal-algorithm option')).filter(opt => opt.value); // Get options from normal dropdown as source
                    archipelagoAlgorithm.innerHTML = '<option value="" disabled selected>Select to Add</option>'; // Reset dropdown
                     allAlgoOptions.forEach(opt => archipelagoAlgorithm.add(opt.cloneNode(true)) );


                    modeData.algorithms.forEach((algorithmName) => {
                         // Check if we already added this name (prevent duplicates if loaded data had them)
                         if(selectedAlgorithms.includes(algorithmName)){
                             console.warn(`Duplicate algorithm "${algorithmName}" found in loaded data, skipping.`);
                             return;
                         }
                         // Check if algorithm is valid
                         if(!window.algorithmParameters[algorithmName]) {
                             console.warn(`Invalid algorithm "${algorithmName}" found in loaded data, skipping.`);
                             return;
                         }

                        selectedAlgorithms.push(algorithmName);
                        const algorithmTag = createAlgorithmTag(algorithmName); // Creates tag with unique ID
                        const tagId = algorithmTag.id; // Get the unique ID

                        // Find corresponding parameters in loaded data
                        // The loaded data structure is parameters[tagId] = { algorithm: algoName, params: {...} }
                        let loadedAlgoParams = {};
                        for (const storedTagId in modeData.parameters) {
                            if (modeData.parameters[storedTagId]?.algorithm === algorithmName) {
                                // Found params for this algo type - ASSUME it's for this instance
                                // This assumption breaks if multiple instances of same algo type exist and params differ
                                loadedAlgoParams = modeData.parameters[storedTagId].params || {};
                                // Store these params associated with the NEW tagId we just generated
                                window.optimizationHandler.storeArchipelagoAlgorithmParams(tagId, loadedAlgoParams);
                                // Ideally, remove this entry from modeData.parameters to avoid reusing? Or handle better.
                                break; // Take the first match for now
                            }
                        }
                         if (Object.keys(loadedAlgoParams).length === 0) {
                              console.log(`No specific params found for ${algorithmName} (tag: ${tagId}), using defaults.`);
                               window.optimizationHandler.storeArchipelagoAlgorithmParams(tagId, {}); // Store empty to signify defaults later maybe?
                         }


                        // Add tag to UI
                         const counterElem = selectedAlgorithmsContainer.querySelector('#algorithms-counter');
                         selectedAlgorithmsContainer.insertBefore(algorithmTag, counterElem);

                        // Remove from dropdown
                        for (let i = 0; i < archipelagoAlgorithm.options.length; i++) {
                            if (archipelagoAlgorithm.options[i].value === algorithmName) {
                                archipelagoAlgorithm.remove(i);
                                break;
                            }
                        }
                    });
                    updateAlgorithmsCounter(); // Update counter after adding all
                }
            }

            // Ensure CSV visibility is correct after loading
            toggleCsvUploadVisibility("normal");
            toggleCsvUploadVisibility("archipelago");

        } catch (error) {
            console.error("Error initializing existing mode data:", error);
            // Fallback to default state
             if (modeNormalRadio) modeNormalRadio.checked = true;
             toggleModeFields();
             const normalAlgorithmSelect = document.getElementById("normal-algorithm");
             const normalParamsContainer = document.getElementById('normal-algorithm-params');
             if (normalAlgorithmSelect?.value && normalParamsContainer) {
                  displayAlgorithmParameters(normalAlgorithmSelect.value, normalParamsContainer, 'normal', {});
             } else if (normalParamsContainer) {
                 normalParamsContainer.innerHTML = '';
             }
        }
    }

    // Helper function to setup Add Algorithm button (Ensure this is called/works)
    function setupAddAlgorithmButton() {
        const addBtn = document.getElementById("add-algorithm-btn");
        const algorithmSelect = document.getElementById("archipelago-algorithm");
        const container = document.getElementById("selected-algorithms-container");
        const counter = document.getElementById("algorithms-counter"); // Ensure counter exists

        if (addBtn && algorithmSelect && container && counter) {
            console.log("Setting up Add Algorithm button listener.");
            // Clone/replace to ensure single listener
            const newBtn = addBtn.cloneNode(true);
            addBtn.parentNode.replaceChild(newBtn, addBtn);

            newBtn.addEventListener("click", function (e) {
                e.preventDefault();
                const selectedValue = algorithmSelect.value;

                if (selectedValue && !selectedAlgorithms.includes(selectedValue)) {
                    if (selectedAlgorithms.length >= MAX_ALGORITHMS) {
                        Swal.fire({ title: "Maximum Algorithms Reached", text: `You can only select up to ${MAX_ALGORITHMS} algorithms.`, icon: "warning" });
                        return;
                    }
                    selectedAlgorithms.push(selectedValue);
                    const algorithmTag = createAlgorithmTag(selectedValue); // Creates tag with unique ID
                    // Store default parameters for this new tag instance
                    window.optimizationHandler.storeArchipelagoAlgorithmParams(algorithmTag.id, {});

                    container.insertBefore(algorithmTag, counter); // Insert before the counter span

                    // Remove from dropdown
                    for (let i = 0; i < algorithmSelect.options.length; i++) {
                        if (algorithmSelect.options[i].value === selectedValue) {
                            algorithmSelect.remove(i);
                            break;
                        }
                    }
                    algorithmSelect.value = ""; // Reset dropdown
                    updateAlgorithmsCounter();
                } else if (selectedAlgorithms.includes(selectedValue)) {
                     Swal.fire({ title: "Algorithm Already Added", text: `${selectedValue} has already been added.`, icon: "info" });
                }
            });
        } else {
             console.warn("Could not setup Add Algorithm button - elements missing.");
        }
    }


    // Add placeholder functions for archipelago param storage
    window.optimizationHandler = window.optimizationHandler || {};
    window.optimizationHandler.archipelagoParamsStore = {}; // Key: tag.id, Value: parameters object

    window.optimizationHandler.storeArchipelagoAlgorithmParams = function(tagId, params) {
        // Store params associated with a specific tag ID
        console.log(`Storing params for archipelago tag ${tagId}:`, params);
        window.optimizationHandler.archipelagoParamsStore[tagId] = params;
    };

    window.optimizationHandler.getArchipelagoAlgorithmParams = function(tagId) {
        // Retrieve params for a specific tag ID
        return window.optimizationHandler.archipelagoParamsStore[tagId] || {}; // Return empty object if not found
    };
     window.optimizationHandler.clearArchipelagoAlgorithmParams = function(tagId) {
        // Retrieve params for a specific tag ID
        console.log(`Clearing params for archipelago tag ${tagId}`);
        delete window.optimizationHandler.archipelagoParamsStore[tagId];
    };


    // =========================================
    // INITIALIZATION CALLS (within DOMContentLoaded)
    // =========================================
    console.log("Running initial setup within DOMContentLoaded...");

    // Initialize Mode Form first - this sets up listeners including algorithm change
    initModeForm();

    // Then load existing data - this will trigger displayAlgorithmParameters with saved values
    initializeExistingModeData();

    // Setup other parts if needed (e.g., constraints, objectives init might happen elsewhere or here)
    initializeExistingConstraints(); // Assuming this exists
    initializeExistingDesignVariables(); // Assuming this exists

    // Ensure Add Algorithm button is set up correctly after potential DOM manipulation
    setupAddAlgorithmButton();

    // Final check on mode display and CSV visibility after all initializations
    toggleModeFields();
    toggleCsvUploadVisibility("normal");
    toggleCsvUploadVisibility("archipelago");

    // Add necessary styles dynamically
    const dynamicStyles = `
        .algorithm-parameters-container {
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px dashed rgba(255, 255, 255, 0.2);
            min-height: 50px; /* Ensure container has some height */
        }
        .algorithm-parameters-form {
            padding: 15px;
            background-color: rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 4px;
            margin-top: 10px;
        }
        .no-params-message {
            font-style: italic;
            color: rgba(255, 255, 255, 0.6);
            padding: 10px 0;
        }
        .toggle-container.form-control-like {
            display: flex;
            align-items: center;
            min-height: 38px; /* Match input field height */
            padding: 5px 0; /* Add some padding */
        }
        .toggle-switch {
           margin-right: 10px;
           width: 18px; height: 18px; /* Basic size */
           vertical-align: middle;
        }
        .toggle-slider { /* Label acting as slider */
            cursor: pointer;
            vertical-align: middle;
        }
        .form-group.empty-group {
             flex: 1;
             visibility: hidden;
        }
        /* Style algorithm tags to be clickable */
        #selected-algorithms-container .algorithm-tag {
            cursor: pointer;
            transition: background-color 0.2s ease;
        }
         #selected-algorithms-container .algorithm-tag:hover {
             opacity: 0.85;
         }

        /* Ensure form groups handle taller elements like toggles */
        .form-row .form-group {
             display: flex;
             flex-direction: column; /* Stack label and input/control */
             justify-content: flex-start; /* Align label to top */
        }
         .form-group .label {
             margin-bottom: 5px;
         }
    `;
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.textContent = dynamicStyles;
    document.head.appendChild(styleSheet);

    // --- Export functions (ensure new/modified functions are included) ---
     window.optimizationHandler = {
        ...window.optimizationHandler, // Keep existing exports
        displayAlgorithmParameters,
        storeArchipelagoAlgorithmParams,
        getArchipelagoAlgorithmParams,
        clearArchipelagoAlgorithmParams
        // Add others if needed
    };

     console.log("Optimization module fully initialized.");

}); // End DOMContentLoaded

"SGA":

       {
           "generation"	: 5, - input box
           "crossover_prob": 0.75, - input box
           "eta_c"			: 1.0, - input box
           "mutation_prob"	: 0.85,
           "param_m" 		: 1.0,
           "param_s" 		: 2,
           "crossover"		: "exponential", - drop down
           "mutation" 		: "gaussian",
           "selection" 	: "tournament",
           "seed"			: 600
       }

,

    "DE" :

       {
           "generation" : 100,
           "variant_adptv" : 1, //SADE,pDE
           "memory" : false,//sade
           "F" : 0.8,
           "CR" : 0.9,
           "variant" : 2,
           "ftol" : 1e-6,
           "xtol" : 1e-6,
           "seed" : 9
           },

    "PSO" :

           {
               "generation" : 100,
               "omega" : 0.8,
               "eta1" : 2.05,
               "eta2" : 2.05,
               "max_vel" : 0.6,
               "variant" : 5,
               "neighb_type" : 2,
               "neighb_param" : 4,
               "memory" : 0,
               "seed" : 9
               }
           ,

"IPOPT" :

       {
           "tol" : 100,
           "linear_solver" : "mumps",
           "dual_inf_tol" : 1,  //1
           "constr_viol_tol" : 0.0001,  //0.0001
           "compl_inf_tol" : 0.0001, //0.0001
           "bound_relax_factor" : 10e-8, //10e-8
           "acceptable_tol" : 10e-06, //10e-06
           "acceptable_iter" : 5, //15
           "gradient_approximation" : "exact" // finite-difference-values
       },

"CS":

           {
               "max_feval"         : 500,
               "start_range"       : 0.1,
               "stop_range"        : 0.0001,
               "reduction_coeff"   : 0.5
           }
       ,

"NLOPT" :

           {
               "solver"    : "slsqp",//slsqp,mma,ccsaq,cobyla,auglag

               "stop_val"  : null, //set to null for disabling this option

               "ftol_rel"  : 0,
               "ftol_abs"  : 0,

               "xtol_rel"  : 0,
               "xtol_abs"  : 1e-6,

               "maxeval"   : 0,
               "maxtime"   : 0

           },

"GAGGS":
{
"Algorithm_1" : "PSO",
"Algorithm_2" : "NLOPT",
"Gaggs_generation" : 5,
"pop_GA" :5
},

"MBH":
{
"innerr_algorithm" : "CS",
"runs" : 100,
"perturb" : 1e-2,
"seed" : "random"

               },

"CSTRS" :
{
"innerr_algorithm" : "DE",
"iters" : 1,
"seed" : "random"
},

"GWO":
{
"generation" : 50,
"seed" : "random"
},

"IHS":
{
"phmcr" : 0.85,
"ppar_min" : 0.35,  
 "ppar_max" : 0.99,  
 "bw_min" : 1E-5,  
 "bw_max" : 1.0
},

"AC":
{
"generation" : 1,  
 "ker" : 63,
"q" : 1.0,  
 "oracle" : 0.0,
"acc" : 0.01,  
 "threshold" : 1,  
 "n_gen_mark" : 7,  
 "impstop" : 100000,  
 "evalstop" : 100000,  
 "focus" : 0.0,  
 "memory" : false,  
 "seed" : "random"
},

"ABC" :
{
"generation" : 1,  
 "limit" : 20,  
 "seed" : "random"
},

"CMAES" :
{
"generation": 1,
"cc": -1,
"cs": -1,
"c1": -1,
"cmu": -1,
"sigma0": 0.5,
"ftol": 1e-6,
"xtol": 1e-6,
"memory": false,
"force_bounds": false,
"seed": "random"
},

"XNES":
{
"generation" : 1,
"eta_mu" : -1,
"eta_sigma" : -1,  
 "eta_b" : -1,  
 "sigma0" : -1,
"ftol" : 1e-6,  
 "xtol" : 1e-6,  
 "memory" : false,  
 "force_bounds" : false,  
 "seed" : "random"
},

"NSGA2": // multi obj
{
"generation" : 1,
"cr" : 0.95,
"eta_c" : 10.0,
"m" : 0.01,
"eta_m" : 50.0,
"seed" : "random"
},
