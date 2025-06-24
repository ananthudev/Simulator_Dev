import SARAS
#import csvgen
    
# vehicle configuration file path
filePath = ["Resource/Mission_Data (copy).json"]

#constructing class object
saras = SARAS.Saras()

serial = SARAS.Serialization.getInstance()

#ReadInput class singleton object
mission = SARAS.ReadInput.getInstance()


# setting vehicle data
mission.setData(filePath[0])

# setting initial state vectors
#mission.setIntialStates("test_vehicle_1",[1050698,6104859,1513951,-445,76,0])

#changinng motor
#mission.setMotor("Stage_3",["Z9"])

#calling simulator 
veh_map = saras.Initialize()

#add the vehicle data to list
serial.addToList(veh_map)
    
#save the mission data to binary
serial.bindData("SSPO_1") 

# retriving unbinded binary file after simulation
bin_file = serial.unBindData()

# #printing basic information about simulated vehicle
#serial.printData(bin_file)

#generating csv file from unbinded data
#serial.generateCSV(bin_file)
#csvgen.generateCSV(bin_file)
# releasing memory
saras.CleanUp()

#define the data structure 
#.............

#user can plot data here
#..................