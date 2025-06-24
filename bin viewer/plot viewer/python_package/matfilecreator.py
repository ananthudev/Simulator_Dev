from scipy import io
from Desrialize import collectData,vehicleDataMap
import numpy as np;




matMap = {}

def generateMat(filePath,outPath):
    collectData(filePath)
    
    mainParamMap ={"Dynamics":{},
               'AeroDynamics':{},
               'Body_Rates':{},
               'Body_Angle':{},
               'Euler_Angle':{},
               'IIP':{},
               'Quaternion':{},
               'States':{},
               'Lat_Long_Alt':{},
               'Polar':{}
               }
    vehName = ""
    for vehicle in vehicleDataMap:
        matMap[vehicle] = mainParamMap
        vehName = vehicle
        for param in vehicleDataMap[vehicle]:
            if param != "Sequence":
                
                for subParam in vehicleDataMap[vehicle][param]:
                    newList =  np.array(vehicleDataMap[vehicle][param][subParam])
                    matMap[vehicle][param][subParam] = newList
            else:
                for mainParam in vehicleDataMap[vehicle][param]:
                    subMap ={}
                    for sParam in vehicleDataMap[vehicle][param][mainParam]:
                        someMap = {}
                        someMap["time"] = vehicleDataMap[vehicle][param][mainParam][sParam].time
                        someMap["comment"] = vehicleDataMap[vehicle][param][mainParam][sParam].comment
                        subMap[sParam] = someMap
                        
                    matMap[vehicle][mainParam] = subMap
                    
    
    
    io.savemat(outPath+vehName+'.mat',matMap)
    vehicleDataMap.clear()
    print("Mat file Generate Successfully!")
    
    
