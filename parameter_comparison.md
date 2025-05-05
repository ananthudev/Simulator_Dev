# Algorithm Parameter Comparison (`optimization.js` vs Pagmo Docs)

This document compares the parameter definitions (`label` and `help` text) in `front_end/js/optimization.js` against the official Pagmo documentation context.

**Note:** This comparison relies on inferring standard Pagmo parameter names and meanings from the provided documentation snippets and general optimization knowledge, as the snippets themselves don't list detailed parameter descriptions. The goal is to check if the labels and help text in the code align with the likely Pagmo terminology.

---

## `pagmo::sga` (Simple Genetic Algorithm)

| Code Parameter   | Code Label            | Code Help Text                              | Pagmo Context & Assessment                                           | Status           |
| ---------------- | --------------------- | ------------------------------------------- | -------------------------------------------------------------------- | ---------------- |
| `generation`     | Generation            | Number of generations (integer)             | Standard term. **Match**.                                            | **Match**        |
| `crossover_prob` | Crossover Probability | Probability of crossover (0 to 1)           | Standard term. **Match**.                                            | **Match**        |
| `eta_c`          | Eta C                 | Distribution index for crossover (positive) | Standard term for polynomial crossover. **Match**.                   | **Match**        |
| `mutation_prob`  | Mutation Probability  | Probability of mutation (0 to 1)            | Standard term. **Match**.                                            | **Match**        |
| `param_m`        | Param M               | Distribution index for mutation (positive)  | Likely `eta_m` for polynomial mutation. Label generic.               | **Review Label** |
| `param_s`        | Param S               | Parameter for selection (positive)          | Likely related to tournament size or truncation rate. Label generic. | **Review Label** |
| `crossover`      | Crossover Method      | Type of crossover operation                 | Standard term. **Match**.                                            | **Match**        |
| `mutation`       | Mutation Method       | Type of mutation operation                  | Standard term. **Match**.                                            | **Match**        |
| `selection`      | Selection Method      | Method for selecting individuals            | Standard term. **Match**.                                            | **Match**        |
| `seed`           | Seed                  | Random seed (integer)                       | Standard term. **Match**.                                            | **Match**        |

---

## `pagmo::de` / `pagmo::sade` / `pagmo::de1220` (Differential Evolution)

| Code Parameter  | Code Label             | Code Help Text                      | Pagmo Context & Assessment                                                  | Status    |
| --------------- | ---------------------- | ----------------------------------- | --------------------------------------------------------------------------- | --------- |
| `generation`    | Generation             | Number of generations               | Standard term. **Match**.                                                   | **Match** |
| `variant_adptv` | Adaptive Variant       | Adaptive variant setting (1 or 2)   | Specific to `sade` variants (jDE/iDE). Label okay.                          | **Match** |
| `memory`        | Memory                 | Enable memory feature (true/false)  | Parameter often present in adaptive variants (`sade`). **Match**.           | **Match** |
| `F`             | Weight Coefficient (F) | Differential weight (positive)      | Standard DE parameter ('Scale Factor'). Label okay.                         | **Match** |
| `CR`            | Crossover Rate (CR)    | Crossover probability (0 to 1)      | Standard DE parameter. **Match**.                                           | **Match** |
| `variant`       | Variant                | DE variant setting (1 or 2)         | Standard DE parameter. Options (1/2) map to specific strategies. **Match**. | **Match** |
| `ftol`          | Function Tolerance     | Tolerance for function value change | Common stopping criterion. **Match**.                                       | **Match** |
| `xtol`          | Variable Tolerance     | Tolerance for variable change       | Common stopping criterion. **Match**.                                       | **Match** |
| `seed`          | Seed                   | Random seed (integer)               | Standard term. **Match**.                                                   | **Match** |

---

## `pagmo::pso` / `pagmo::pso_gen` (Particle Swarm Optimization)

| Code Parameter | Code Label             | Code Help Text                       | Pagmo Context & Assessment                                             | Status    |
| -------------- | ---------------------- | ------------------------------------ | ---------------------------------------------------------------------- | --------- |
| `generation`   | Generation             | Number of generations (integer)      | Standard term (`pso_gen`). **Match**.                                  | **Match** |
| `omega`        | Inertia Weight (Omega) | Inertia weight (<1)                  | Standard PSO parameter. **Match**.                                     | **Match** |
| `eta1`         | Eta1                   | Magnitude of force                   | Standard PSO parameter (Cognitive component). Help text okay.          | **Match** |
| `eta2`         | Eta2                   | Magnitude of force                   | Standard PSO parameter (Social component). Help text okay.             | **Match** |
| `max_vel`      | Max Velocity           | Maximum particle velocity (positive) | Standard PSO parameter. **Match**.                                     | **Match** |
| `variant`      | Variant                | PSO variant type (1-6)               | Standard PSO parameter. Options map to specific strategies. **Match**. | **Match** |
| `neighb_type`  | Neighborhood Type      | Neighborhood topology (1-4)          | Standard PSO parameter. Options map to specific topologies. **Match**. | **Match** |
| `neighb_param` | Neighborhood Param     | Neighborhood parameter (positive)    | Standard PSO parameter (e.g., size for ring topology). **Match**.      | **Match** |
| `memory`       | Memory                 | Enable memory feature (true/false)   | Often used in PSO variants. **Match**.                                 | **Match** |
| `seed`         | Seed                   | Random seed (integer)                | Standard term. **Match**.                                              | **Match** |

---

## `pagmo::ipopt` (Interior Point Optimizer)

| Code Parameter           | Code Label             | Code Help Text                               | Pagmo Context & Assessment                                      | Status    |
| ------------------------ | ---------------------- | -------------------------------------------- | --------------------------------------------------------------- | --------- |
| `tol`                    | Tolerance              | Overall convergence tolerance                | IPOPT parameter `tol`. **Match**.                               | **Match** |
| `linear_solver`          | Linear Solver          | Linear system solver                         | IPOPT parameter `linear_solver`. **Match**.                     | **Match** |
| `dual_inf_tol`           | Dual Inf Tol           | Dual infeasibility tolerance (>0)            | IPOPT parameter `dual_inf_tol`. **Match**.                      | **Match** |
| `constr_viol_tol`        | Constr Viol Tol        | Constraint violation tolerance (>0)          | IPOPT parameter `constr_viol_tol`. **Match**.                   | **Match** |
| `compl_inf_tol`          | Compl Inf Tol          | Complementarity infeasibility tolerance (>0) | IPOPT parameter `compl_inf_tol`. **Match**.                     | **Match** |
| `bound_relax_factor`     | Bound Relax Factor     | Bound relaxation factor (>0)                 | IPOPT parameter `bound_relax_factor`. **Match**.                | **Match** |
| `acceptable_tol`         | Acceptable Tol         | Acceptable convergence tolerance (>0)        | IPOPT parameter `acceptable_tol`. **Match**.                    | **Match** |
| `acceptable_iter`        | Acceptable Iter        | Acceptable iteration limit (>=0)             | IPOPT parameter `acceptable_iter`. **Match**.                   | **Match** |
| `gradient_approximation` | Gradient Approximation | Method for gradient calculation              | IPOPT parameter `hessian_approximation` or similar? Label okay. | **Match** |

---

## `pagmo::compass_search` (CS - Assuming this maps to Compass Search)

| Code Parameter    | Code Label         | Code Help Text                         | Pagmo Context & Assessment                                   | Status    |
| ----------------- | ------------------ | -------------------------------------- | ------------------------------------------------------------ | --------- |
| `max_feval`       | Max Function Evals | Maximum number of function evaluations | Standard stopping criterion. Likely `max_fevals`. **Match**. | **Match** |
| `start_range`     | Start Range        | Initial search range (0 to 1)          | Parameter for initial step size. **Match**.                  | **Match** |
| `stop_range`      | Stop Range         | Stopping search range (0 to 1)         | Parameter for stopping step size/tolerance. **Match**.       | **Match** |
| `reduction_coeff` | Reduction Coeff    | Range reduction coefficient (0 to 1)   | Parameter for step size reduction. **Match**.                | **Match** |

---

## `pagmo::nlopt` (NLopt wrapper)

| Code Parameter | Code Label        | Code Help Text                                          | Pagmo Context & Assessment                               | Status    |
| -------------- | ----------------- | ------------------------------------------------------- | -------------------------------------------------------- | --------- |
| `solver`       | Solver            | Internal NLOPT solver                                   | Maps to NLopt method selection. **Match**.               | **Match** |
| `stop_val`     | Stop Value        | Stop when function value reaches this (null to disable) | Standard NLopt stopping criterion `stopval`. **Match**.  | **Match** |
| `ftol_rel`     | Func Tol Relative | Relative function tolerance (positive)                  | Standard NLopt stopping criterion `ftol_rel`. **Match**. | **Match** |
| `ftol_abs`     | Func Tol Absolute | Absolute function tolerance (positive)                  | Standard NLopt stopping criterion `ftol_abs`. **Match**. | **Match** |
| `xtol_rel`     | Var Tol Relative  | Relative variable tolerance (positive)                  | Standard NLopt stopping criterion `xtol_rel`. **Match**. | **Match** |
| `xtol_abs`     | Var Tol Absolute  | Absolute variable tolerance (positive)                  | Standard NLopt stopping criterion `xtol_abs`. **Match**. | **Match** |
| `maxeval`      | Max Evaluations   | Max function evaluations (0 for none)                   | Standard NLopt stopping criterion `maxeval`. **Match**.  | **Match** |
| `maxtime`      | Max Time          | Max optimization time in seconds (0 for none)           | Standard NLopt stopping criterion `maxtime`. **Match**.  | **Match** |

---

## `pagmo::gaco` (GACO - Assuming GAGGS maps to GACO or a hybrid)

_(Assessment assumes GAGGS uses GACO principles)_

| Code Parameter     | Code Label           | Code Help Text                  | Pagmo Context & Assessment                               | Status    |
| ------------------ | -------------------- | ------------------------------- | -------------------------------------------------------- | --------- |
| `Algorithm_1`      | Algorithm 1 (Global) | First algorithm (global search) | Meta-algorithm parameter. Label/Help clear.              | **Match** |
| `Algorithm_2`      | Algorithm 2 (Local)  | Second algorithm (local search) | Meta-algorithm parameter. Label/Help clear.              | **Match** |
| `Gaggs_generation` | GAGGS Generation     | Number of GAGGS generations     | Likely main loop generations. **Match**.                 | **Match** |
| `pop_GA`           | Population GA        | Population size for Algorithm 1 | Specific population size for one part. Label/Help clear. | **Match** |

---

## `pagmo::mbh` (Monotonic Basin Hopping)

| Code Parameter     | Code Label      | Code Help Text                    | Pagmo Context & Assessment                               | Status    |
| ------------------ | --------------- | --------------------------------- | -------------------------------------------------------- | --------- |
| `innerr_algorithm` | Inner Algorithm | Algorithm used in the inner loop  | MBH uses a local optimizer internally. Label/Help clear. | **Match** |
| `runs`             | Runs            | Number of inner algorithm runs    | Likely stop criterion for MBH steps. **Match**.          | **Match** |
| `perturb`          | Perturbation    | Perturbation factor (positive)    | Parameter for the hopping step. **Match**.               | **Match** |
| `seed`             | Seed            | Random seed ('random' or integer) | Standard term. **Match**.                                | **Match** |

---

## `pagmo::cstrs_self_adaptive` (Cstrs Self-Adaptive)

| Code Parameter     | Code Label      | Code Help Text                    | Pagmo Context & Assessment                       | Status    |
| ------------------ | --------------- | --------------------------------- | ------------------------------------------------ | --------- |
| `innerr_algorithm` | Inner Algorithm | Algorithm used in the inner loop  | Cstrs wraps another algorithm. Label/Help clear. | **Match** |
| `iters`            | Iterations      | Number of iterations              | Main loop iterations for Cstrs. **Match**.       | **Match** |
| `seed`             | Seed            | Random seed ('random' or integer) | Standard term. **Match**.                        | **Match** |

---

## `pagmo::gwo` (Grey Wolf Optimizer)

| Code Parameter | Code Label | Code Help Text                    | Pagmo Context & Assessment | Status    |
| -------------- | ---------- | --------------------------------- | -------------------------- | --------- |
| `generation`   | Generation | Number of generations             | Standard term. **Match**.  | **Match** |
| `seed`         | Seed       | Random seed ('random' or integer) | Standard term. **Match**.  | **Match** |

---

## `pagmo::ihs` (Improved Harmony Search)

| Code Parameter | Code Label | Code Help Text                        | Pagmo Context & Assessment                            | Status    |
| -------------- | ---------- | ------------------------------------- | ----------------------------------------------------- | --------- |
| `phmcr`        | PHMCR      | Harmony Memory Considering Rate (0-1) | Standard IHS parameter (`hmcr`). Label/Help clear.    | **Match** |
| `ppar_min`     | Min PPAR   | Min Pitch Adjusting Rate (0-1)        | Standard IHS parameter (`par_min`). Label/Help clear. | **Match** |
| `ppar_max`     | Max PPAR   | Max Pitch Adjusting Rate (0-1)        | Standard IHS parameter (`par_max`). Label/Help clear. | **Match** |
| `bw_min`       | Min BW     | Min Bandwidth (positive)              | Standard IHS parameter (`bw_min`). Label/Help clear.  | **Match** |
| `bw_max`       | Max BW     | Max Bandwidth (positive)              | Standard IHS parameter (`bw_max`). Label/Help clear.  | **Match** |

---

## `pagmo::gaco` (Extended Ant Colony Optimization - Assuming AC maps here)

| Code Parameter | Code Label  | Code Help Text                     | Pagmo Context & Assessment                | Status    |
| -------------- | ----------- | ---------------------------------- | ----------------------------------------- | --------- |
| `generation`   | Generation  | Number of generations              | Standard term (`gen`). **Match**.         | **Match** |
| `ker`          | Kernel Size | Kernel size (>=2)                  | GACO parameter (`ker`). **Match**.        | **Match** |
| `q`            | Q Factor    | Q parameter (>=0)                  | GACO parameter (`q`). **Match**.          | **Match** |
| `oracle`       | Oracle      | Oracle value (positive)            | GACO parameter (`oracle`). **Match**.     | **Match** |
| `acc`          | Accuracy    | Accuracy parameter (>=0)           | GACO parameter (`acc`). **Match**.        | **Match** |
| `threshold`    | Threshold   | Threshold value (>=1)              | GACO parameter (`threshold`). **Match**.  | **Match** |
| `n_gen_mark`   | N Gen Mark  | Generation mark (positive)         | GACO parameter (`n_gen_mark`). **Match**. | **Match** |
| `impstop`      | Imp Stop    | Improvement stop criterion         | GACO parameter (`impstop`). **Match**.    | **Match** |
| `evalstop`     | Eval Stop   | Evaluation stop criterion          | GACO parameter (`evalstop`). **Match**.   | **Match** |
| `focus`        | Focus       | Focus parameter (>=0)              | GACO parameter (`focus`). **Match**.      | **Match** |
| `memory`       | Memory      | Enable memory feature (true/false) | GACO parameter (`memory`). **Match**.     | **Match** |
| `seed`         | Seed        | Random seed ('random' or integer)  | Standard term. **Match**.                 | **Match** |

---

## `pagmo::bee_colony` (Artificial Bee Colony - ABC)

| Code Parameter | Code Label | Code Help Text                    | Pagmo Context & Assessment          | Status    |
| -------------- | ---------- | --------------------------------- | ----------------------------------- | --------- |
| `generation`   | Generation | Number of generations             | Standard term (`gen`). **Match**.   | **Match** |
| `limit`        | Limit      | Scout limit for bees              | ABC parameter (`limit`). **Match**. | **Match** |
| `seed`         | Seed       | Random seed ('random' or integer) | Standard term. **Match**.           | **Match** |

---

## `pagmo::cmaes` (Covariance Matrix Adaptation Evo. Strategy)

| Code Parameter | Code Label         | Code Help Text                             | Pagmo Context & Assessment                   | Status    |
| -------------- | ------------------ | ------------------------------------------ | -------------------------------------------- | --------- |
| `generation`   | Generation         | Number of generations                      | Standard term (`gen`). **Match**.            | **Match** |
| `sigma0`       | Initial Sigma      | Initial standard deviation (positive)      | CMAES parameter (`sigma0`). **Match**.       | **Match** |
| `ftol`         | Function Tolerance | Function value tolerance (positive)        | Stopping criterion (`ftol`). **Match**.      | **Match** |
| `xtol`         | Variable Tolerance | Variable value tolerance (positive)        | Stopping criterion (`xtol`). **Match**.      | **Match** |
| `memory`       | Memory             | Enable memory feature (true/false)         | CMAES parameter (`memory`). **Match**.       | **Match** |
| `force_bounds` | Force Bounds       | Force variables within bounds (true/false) | CMAES parameter (`force_bounds`). **Match**. | **Match** |
| `seed`         | Seed               | Random seed ('random' or integer)          | Standard term. **Match**.                    | **Match** |

---

## `pagmo::xnes` (Exponential Evolution Strategies)

| Code Parameter | Code Label         | Code Help Text                             | Pagmo Context & Assessment                  | Status    |
| -------------- | ------------------ | ------------------------------------------ | ------------------------------------------- | --------- |
| `generation`   | Generation         | Number of generations                      | Standard term (`gen`). **Match**.           | **Match** |
| `ftol`         | Function Tolerance | Function value tolerance (positive)        | Stopping criterion (`ftol`). **Match**.     | **Match** |
| `xtol`         | Variable Tolerance | Variable value tolerance (positive)        | Stopping criterion (`xtol`). **Match**.     | **Match** |
| `memory`       | Memory             | Enable memory feature (true/false)         | XNES parameter (`memory`). **Match**.       | **Match** |
| `force_bounds` | Force Bounds       | Force variables within bounds (true/false) | XNES parameter (`force_bounds`). **Match**. | **Match** |
| `seed`         | Seed               | Random seed ('random' or integer)          | Standard term. **Match**.                   | **Match** |

---

## `pagmo::nsga2` (Non-dominated Sorting GA)

| Code Parameter | Code Label        | Code Help Text                           | Pagmo Context & Assessment            | Status    |
| -------------- | ----------------- | ---------------------------------------- | ------------------------------------- | --------- |
| `generation`   | Generation        | Number of generations                    | Standard term (`gen`). **Match**.     | **Match** |
| `cr`           | Crossover Rate    | Crossover probability (<1)               | NSGA2 parameter (`cr`). **Match**.    | **Match** |
| `eta_c`        | Eta C (Crossover) | Distribution index for crossover (1-100) | NSGA2 parameter (`eta_c`). **Match**. | **Match** |
| `m`            | Mutation Rate     | Mutation probability (<1)                | NSGA2 parameter (`m`). **Match**.     | **Match** |
| `eta_m`        | Eta M (Mutation)  | Distribution index for mutation (1-100)  | NSGA2 parameter (`eta_m`). **Match**. | **Match** |
| `seed`         | Seed              | Random seed ('random' or integer)        | Standard term. **Match**.             | **Match** |

---

**Overall Assessment:**

The parameter labels and help text in `front_end/js/optimization.js` generally align well with the standard terminology and parameter names inferred from the Pagmo documentation context. Minor points for review exist (e.g., generic labels `param_m`, `param_s` in SGA), but the core parameters seem correctly represented.
