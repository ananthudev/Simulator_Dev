# import os

# result = os.popen("/home/user/DEVOLOP/ASTRA_REL_V2.1/./run.sh").read().split('\n')

# if int(result[-2])==0:
#     print("Simulation Executed Sucessfully")
# else:
#     print("Simulation Failed! Check Error Report for more Details")

import json
# python object(dictionary) to be dumped
dict1 ={
"emp1": {
"name": "Lisa",
"designation": "programmer",
"age": "34",
"salary": "54000"
},
"emp2": {
"name": "Elis",
"designation": "Trainee",
"age": "24",
"salary": "40000"},
}
# the json file where the output must be stored
out_file = open("myfile.json", "w")
json.dump(dict1, out_file, indent = 6)
out_file.close()