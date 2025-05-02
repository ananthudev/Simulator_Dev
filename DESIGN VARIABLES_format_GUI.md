DESIGN VARIABLES:
Like steering, should display the selected design variables. 
segment section (dropdown) should fetch steering tabs added by user in steering section.
name of each design variable we can give.
should dynamically add design vriables.

category: CUT_OFF/PAYLOAD/AZIMUTH/STEERING/SEQUENCE/PROPULSION

if category: CUT_OFF
name (display in jsonc): can be like opt_cut_off
flag:
type:
control_variable:
upper_bound
lower_bound

if category: PAYLOAD
name (display in jsonc): can be like opt_payload
type:
	control_variable: variable array
	upper_bound: numeric array
	lower_bound: numeric array

if category: AZIMUTH
name (display in jsonc): can be like opt_azimuth
type:
	control_variable: variable array
	upper_bound: numeric array
	lower_bound: numeric array

if category: SEQUENCE
name (display in jsonc): can be like opt_sequence or to be specific opt_coasting 
flag: 
type:
	control_variable: variable array
	upper_bound: numeric array
	lower_bound: numeric array


if category: PROPULSION
name (display in jsonc): can be like opt_propulsion
segment:
type:
	control_variable: variable array
	upper_bound: numeric array
	lower_bound: numeric array

if category: STEERING
name (display in jsonc): can be like opt_steering_ and add segment_type name to it
segment:
segment_type: PROFILE/CLG/ZERO_RATE/CONST_BODYRATE
type:
	control_variable: variable array
	upper_bound: numeric array
	lower_bound: numeric array

In steering, number of variables in control_variable/upper_bound/lower_bound should be same as that 
of steering tab  given in segment. 

extra keyvalues for steering category: 

if segment_type==CLG:
name (display in jsonc): can be like opt_steering_clg
			type:
				axis:
				upper_bound:
				lower_bound:	

if segment_type==ZERO_RATE:
name (display in jsonc): can be like opt_steering_zerorate
			type:
					control_variable: variable array
					upper_bound: numeric array
					lower_bound: numeric array

if segment_type==CONST_BODYRATE:
name (display in jsonc): can be like opt_steering_const_bodyrate
			type:
				control_variable: variable array
				axis: variable array
				upper_bound: numeric array
				lower_bound: numeric array

if segment_type==PROFILE:
name (display in jsonc): can be like opt_steering_profile
			type:
				control_variable:
				axis:
				ind_variable:
				ind_vector:
				upper_bound:
				lower_bound:
this can appear more than once, like profile1, profile2 etc
then we can name opt_steering_(segmentname)
same for coasting

