OPTIMIZATION:

Objective function:
Name: TOTAL_ENERGY/DUMMY/PAYLOAD_MASS/QAOA/BODY_RATES/HEAT_FLUX/SEMI_MAJOR_AXIS/
ANGULAR_MOMENTUM/ECCENTRICITY/INCLINATION/TRUE_ANOMALY/ECCENTRIC_ANOMALY/RAAN/AOP/
PERIGEE_GC_LATITUDE/PERIGEE_GC/APOGEE_GC/PERIGEE/APOGEE

type: EQUALITY
LIFT_OFF_MASS/MAX_SENSED_ACC/SLACK_VARIABLE/TOTAL_ENERGY/MAX_QAOA/Q/
ALPHA/MAX_BODY_RATE/MAX_HEAT_FLUX/SEMI_MAJOR_AXIS/ANGULAR_MOMENTUM/
ECCENTRICITY/INCLINATION/TRUE_ANOMALY/ECCENTRIC_ANOMALY/RAAN/AOP/
PERIGEE_GC_LATITUDE/PERIGEE_GC/APOGEE_GC/PERIGEE/APOGEE

type: INEQUALITY
LIFT_OFF_MASS/MAX_SENSED_ACC/SLACK_VARIABLE/TOTAL_ENERGY/MAX_QAOA/Q/
ALPHA/MAX_BODY_RATE/MAX_HEAT_FLUX/SEMI_MAJOR_AXIS/ANGULAR_MOMENTUM/
ECCENTRICITY/INCLINATION/TRUE_ANOMALY/ECCENTRIC_ANOMALY/RAAN/AOP/
PERIGEE_GC_LATITUDE/PERIGEE_GC/APOGEE_GC/PERIGEE/APOGEE +
STAGE_IMPACT/DCISS_IMPACT/CUSTOM

if constraint== SEMI_MAJOR_AXIS/ANGULAR_MOMENTUM/
ECCENTRICITY/INCLINATION/TRUE_ANOMALY/ECCENTRIC_ANOMALY/RAAN/AOP/
PERIGEE_GC_LATITUDE/PERIGEE_GC/APOGEE_GC/PERIGEE/APOGEE:
name:
value: numeric value
type: "EQUALITY"/"INEQUALITY"
if type== EQUALITY: no need to ask condition (N/A)
condition: "GREATER_THAN"/"LESS_THAN"
factor: 1 (no need to show it in the UI, its same for all constraints)
flag:
enable:

if constraint== "Stage_Impact":
keyvalues: name,value,type,condition,factor,flag,coordinate
name: 'Stage_Impact'
value: numeric value
type: "EQUALITY"/"INEQUALITY"
if type== EQUALITY: no need to ask condition (N/A)
condition: "GREATER_THAN"/"LESS_THAN"
factor: 1 (no need to show it in the UI, its same for all constraints)
flag: fetch flags from sequence
one more extra keyvalue :
coordinate: dropdown latitude/longitude

if constraint== "Q"/"MAX_QAOA"/"ALPHA"/"MAX_BODY_RATE"/"MAX_HEAT_FLUX"/"SLACK_VARIABLE"/"MAX_SENSED_ACC":
keyvalues: name,value,type,condition,factor,trigger,from,to,from_offset, to_offset
name: 'Q'
value: numeric value
type: "EQUALITY"/"INEQUALITY"
if type== EQUALITY: no need to ask condition (N/A)
condition: "GREATER_THAN"/"LESS_THAN"
factor: 1 (no need to show it in the UI, its same for all constraints)
extra keyvalues :
trigger: FLAG/MISSION_TIME
if trigger is FLAG, then From and to will be flags as well (string)
From:
To:
extra keyvalues again:
from_offset: numeric,
to_offset: numeric
elseif trigger ==MISSION_TIME, From and To will be numeric values (float)
From:
To:
"from_offset" and "to_offset" =0
enable: true/false (toggle button)

if constraint== "CUSTOM":
keyvalues--->
name:
type: "EQUALITY"/"INEQUALITY"
if type== EQUALITY: no need to ask condition (N/A)
condition: "GREATER_THAN"/"LESS_THAN"
factor: 1 (no need to show it in the UI, its same for all constraints)
ti: numeric value
tf: numeric value
time_point: numeric value
input: "IIP" / "GROUND_TRACE"
enable: true/false
Position:

if constraint== "DCISS":
type:
condition:
Parameters:
constraint: Line/Ellipse/Box
if constraint==Line:
Position:
line_bounds:
if constraint==Ellipse:
SemiMajor:
SemiMinor:
Center:
if constraint==Box:
Line_Bound:
enable: true/false

for all constraints there should be a tolerance keyvalue (input : numeric value)

The format of most of the constraints used are givwn below:

"optimization":
[
{
"name" : "PAYLOAD_MASS",
"value" : "null",
"type" : "OBJECTIVE",
"flag" : "ST_3_SEP",
"factor" : -1
},
{
"name" : "APOGEE",
"value" : 400.5,
"type" : "INEQUALITY",
"condition" : "LESS_THAN",
"flag" : "ST_3_SEP",
"factor" : 1,
"enable" : true
},
{
"name" : "PERIGEE",
"value" : 399.2,
"type" : "INEQUALITY",
"condition" : "GREATER_THAN",
"flag" : "ST_3_SEP",
"factor" : 1,
"enable" : true
},
{
"name" : "ECCENTRICITY",
"value" : 0.0001,
"type" : "INEQUALITY",
"condition" : "LESS_THAN",
"flag" : "ST_3_SEP",
"factor" : 1,
"enable" : true
},
{
"name" : "INCLINATION",
"value" : 97.031,
"type" : "EQUALITY",
"condition" : "GREATER_THAN",
"flag" : "ST_3_SEP",
"factor" : 1,
"enable" : true
}
{
"name" : "MAX_QAOA",
"value" : 2500,
"type" : "INEQUALITY",
"condition" : "LESS_THAN",
"trigger" : "MISSION_TIME",
"from" : 15.6,
"to" : 108.1,
"from_offset":0,
"to_offset" : 0,
"factor" : 1
},
{
"name" : "ALPHA",
"value" : 6.0,
"type" : "INEQUALITY",
"condition" : "LESS_THAN",
"trigger" : "MISSION_TIME",
"from" : 15.6,
"to" : 108.1,
"from_offset":0,
"to_offset" : 0,
"factor" : 1
},
{
"name" : "MAX_SENSED_ACC",
"value" : 49.0,
"type" : "INEQUALITY",
"condition" : "LESS_THAN",
"trigger" : "MISSION_TIME",
"from" : 0.0,
"to" : 478,
"from_offset":0,
"to_offset" : 0,
"factor" : 1,
"enable" : true
},

        {
            "name"      : "CUSTOM",
            "type"      : "INEQUALITY",
            "condition" : "LESS_THAN",
            "ti"        : 0.0,
            "tf"        : 300.0,
            "time_point" : 1.0,
            "input"     : "IIP", //GROUND_TRACE
            "factor"    : 1,
            "enable"    : true,
            "Parameters"          :

            {
                "constraint"     : "Line",
                "Position"       : "above",

                "line_bounds":
                {
                    "l1" : [[78.8040416667,7.2567777778],[78.7840833333,5.7924222222]]
                }
            }
        },
    	{
    		"name"      : "STAGE_IMPACT",
    		"value"     : 126.0,
    		"type"      : "INEQUALITY",
    		"condition" : "GREATER_THAN",
    		"factor"    : 1,
    		"flag"     : "Flag_5",
    		"enable"    : true,
    		"coordinate":"Longitude" //Latitude,Longitude
    	},
        {
    		"name"      : "Q",
    		"value"     : 1000,
    		"type"      : "INEQUALITY",
    		"condition" : "LESS_THAN",
    		"factor"    : 1,
    		"trigger"   : "FLAG",
    		"from"      : "Flag_50",
    		"to"        : "Flag_3",
    		"from_offset":5,
    		"to_offset" :5,
    		"enable"    : true
        },
    	{
            "name"      : "SLACK_VARIABLE",
            "value"     : 0.0,
            "condition" : "GREATER_THAN",
            "type"      : "INEQUALITY",
            "factor"    : 1,
    		"enable"    : true
    	},

{
"name" : "LIFT_OFF_MASS",
"value" : 1500,
"type" : "EQUALITY",
"condition" : "GREATER_THAN",
"flag" : "",
"factor" : 1,
"enable" : true
}

    ],

    "constraint_tolerence" : [0.1, 0.1,0.0001, 0.01],toop
