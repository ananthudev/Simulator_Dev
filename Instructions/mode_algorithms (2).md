the values are default, the values next to them are options

"SGA":

       {
           "generation": 5, - input box (integer)
           "crossover_prob": 0.75, - input box (<1)
           "eta_c": 1.0, - input box(+ve value)
           "mutation_prob": 0.85, - input box (<1)
           "param_m" : 1.0, - input box(+ve value)
           "param_s": 2, - input box(+ve value)
           "crossover": "exponential", - dropdown (exponential/polynomial)
           "mutation": "gaussian", - dropdown (gaussian/polynomial/uniform)
           "selection": "tournament", - dropdown (tournament/truncated)
           "seed": 600 - input box (integer)
       }

,

    "DE"/ "SADE"/ "pDE" :

       {
           "generation" : 100, - input box(+ve value)
           "variant_adptv" : 1, (1/2)- dropdown
           "memory" : false, (true or false)- drop down
           "F" : 0.8, - input box(+ve value)
           "CR" : 0.9, - input box(+ve value)
           "variant" : 2,- dropdown (1/2)
           "ftol" : 1e-6, - input box (decimal)
           "xtol" : 1e-6, - input box (decimal)
           "seed" : 9 - input box (integer)
           },

    "PSO" :

           {
               "generation" : 100, - input box (integer)
               "omega" : 0.8, - input box (<1)
               "eta1" : 2.05, - input box (+ve value)
               "eta2" : 2.05, - input box (+ve value)
               "max_vel" : 0.6, - input box (+ve value)
               "variant" : 5, - dropdown (1 to 6)
               "neighb_type" : 2, - dropdown (1 to 4)
               "neighb_param" : 4, - input box (+ve value)
               "memory" : 0, - true/false
               "seed" : 9 - input box (integer)
               }
           ,

"IPOPT" :

       {
           "tol" : 100, - input box
           "linear_solver" : "mumps" (is the default), - dropdown list are
           (ma27, ma57,
    ma77,
    ma86,
    ma97,
    pardiso,
    pardisomkl,
    spral,
    wsmp,
    mumps)

           "dual_inf_tol" : 1, -input box (greater than 0)
           "constr_viol_tol" : 0.0001,  -input box (greater than 0)
           "compl_inf_tol" : 0.0001, -input box (greater than 0)
           "bound_relax_factor" : 10e-8, -input box (GT 0)
           "acceptable_tol" : 10e-06, -input box (GT 0)
           "acceptable_iter" : 15, -input box (GT or = 0)
           "gradient_approximation" : "exact" , - dropdown (exact/finite-difference-values)
       },

"CS":

           {
               "max_feval"         : 500, - input box
               "start_range"       : 0.1, - input box (b/w 0&1)
               "stop_range"        : 0.0001, - input box (b/w 0 &1)
               "reduction_coeff"   : 0.5 - input box (b/w 0&1)
           }
       ,

"NLOPT" :

           {
               "solver"    : "slsqp", - dropdown(slsqp,mma,ccsaq,cobyla,auglag)

               "stop_val"  : null, - input box (set to null for disabling this option, or give numeric values)

               "ftol_rel"  : 0, - input box (+ve value)
               "ftol_abs"  : 0,- input box (+ve value)

               "xtol_rel"  : 0, - input box (+ve value)
               "xtol_abs"  : 1e-6, - input box (+ve value)

               "maxeval"   : 0,- input box (+ve value)
               "maxtime"   : 0 - input box (+ve value)

           },

"GAGGS":
{
"Algorithm_1" : "PSO", - dropdown (list of main alogorithms in normal and archipelago
except NLOPT and IPOPT)
"Algorithm_2" : "NLOPT", - dropdown (only NLOPT/IPOPT)
"Gaggs_generation" : 5, - input box(+ve value)
"pop_GA" :5 - input box(+ve value)
},

"MBH":
{
"innerr_algorithm" : "CS", - dropdown (list of main alogorithms in normal and archipelago)
"runs" : 100, - input box(+ve value)
"perturb" : 1e-2, - input box(+ve value)
"seed" : "random" - input box(+ve value)

               },

"CSTRS" :
{
"innerr_algorithm" : "DE", - dropdown (list of main alogorithms in normal and archipelago)
"iters" : 1, - input box(+ve value)
"seed" : "random" - input box(+ve value), add default value string random, or else use can enter an positive integer
},

"GWO":
{
"generation" : 50, - input box(+ve value)
"seed" : "random" - input box(+ve value), add default value string random, or else use can enter an positive integer
},

"IHS":
{
"phmcr" : 0.85, - input box(b/w 0& 1)
"ppar_min" : 0.35, - input box(b/w 0& 1)
"ppar_max" : 0.99, - input box (b/w 0& 1)
"bw_min" : 1E-5, - input box (+ve values only)
"bw_max" : 1.0 - input box(+ve value)
},

"AC":
{
"generation" : 1, - input box
"ker" : 63, - input box(GT or = 2)
"q" : 1.0, - input box(GT or = 0)
"oracle" : 0.0, - input box(+ve value)
"acc" : 0.01, - input box(GT or = 0)
"threshold" : 1, - input box (GT or = 1)
"n_gen_mark" : 7, - input box(+ve value)
"impstop" : 100000, - input box(+ve value)
"evalstop" : 100000, - input box(+ve value)
"focus" : 0.0, - input box(GT or = 0)
"memory" : false, - dropdown (true/false)
"seed" : "random" - input box(+ve value), add default value string random, or else use can enter an positive integer
},

"ABC" :
{
"generation" : 1, - input box(+ve value)
"limit" : 20, - input box(+ve value)
"seed" : "random" - input box(+ve value), add default value string random, or else use can enter an positive integer
},

"CMAES" :
{
"generation": 1, - input box(+ve value)
"sigma0": 0.5,- input box(+ve value)
"ftol": 1e-6,- input box(+ve value)
"xtol": 1e-6,- input box(+ve value)
"memory": false, -dropdown (true/false)
"force_bounds": false, -dropdown (true/false)
"seed": "random" - input box(+ve value), add default value string random, or else use can enter an positive integer
},

"XNES":
{
"generation" : 1,- input box(+ve value)
"ftol" : 1e-6, - input box(+ve value)
"xtol" : 1e-6, - input box(+ve value)
"memory" : false, -dropdown (true/false)
"force_bounds" : false, -dropdown (true/false)
"seed" : "random" - input box(+ve value), add default value string random, or else use can enter an positive integer
},

"NSGA2":
{
"generation" : 1, - input box(+ve value)
"cr" : 0.95, - input box(<1)
"eta_c" : 10.0, - input box(b/w 1 & 100)
"m" : 0.01, - input box(<1)
"eta_m" : 50.0, - input box(b/w 1 & 100)
"seed" : "random" - input box(+ve value)
},
