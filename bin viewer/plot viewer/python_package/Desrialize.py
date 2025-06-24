from Buffer_pb2 import Buffer

def readDeSerializeData(filePath):
    with open(filePath, "rb") as f:
        serialized_data = f.read()
        Vehicle = Buffer()
        Vehicle.ParseFromString(serialized_data)
    
    return Vehicle

vehicleDataMap={}


def dataIns(key,mainVehicle):
    
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
    vehicleDataMap[key] = mainParamMap
    
    vehicleDataMap[key]['Dynamics'] = {'Mission_time':mainVehicle.vehDynamics.time,
                                  'Phase_time':mainVehicle.vehDynamics.phaseTime,
                                  'Mass':mainVehicle.vehDynamics.mass,
                                  'Thrust':mainVehicle.vehDynamics.thrust,
                                  'Vaccum_Thrust':mainVehicle.vehDynamics.vaccumThrust,
                                    'Sensed_Acc':mainVehicle.vehDynamics.sensedAcc,
                                    'Drag_Acc':mainVehicle.vehDynamics.dragAcc,
                                    'Drag_Force':mainVehicle.vehDynamics.dragForce,
                                    'Relative_velocity':mainVehicle.vehDynamics.relativeVel,
                                    'Gravity_Acc':mainVehicle.vehDynamics.gravityAcc,
                                    'Total_Acc':mainVehicle.vehDynamics.totalAcc,
                                    'ThrustAcc.x':mainVehicle.vehDynamics.thrustECI.x,
                                    'ThrustAcc.y':mainVehicle.vehDynamics.thrustECI.y,
                                    'ThrustAcc.z':mainVehicle.vehDynamics.thrustECI.z,
                                    'ThrustAccMag':mainVehicle.vehDynamics.thrustAccMag,
                                    'GravAcc.x':mainVehicle.vehDynamics.gravityECI.x,
                                    'GravAcc.y':mainVehicle.vehDynamics.gravityECI.y,
                                    'GravAcc.z':mainVehicle.vehDynamics.gravityECI.z}
    vehicleDataMap[key]['AeroDynamics'] = {'Mission_time':mainVehicle.vehAeroDynamics.time,
                                      'Mach':mainVehicle.vehAeroDynamics.mach,
                                      'CD':mainVehicle.vehAeroDynamics.coeffAxial,
                                      'Dynamic Pressure':mainVehicle.vehAeroDynamics.dynamicPressure,
                                      'Angle of Attack':mainVehicle.vehAeroDynamics.AOA,
                                      'Q Alpha':mainVehicle.vehAeroDynamics.qAlpha,
                                        'Alpha':mainVehicle.vehAeroDynamics.alpha,
                                        'Beta':mainVehicle.vehAeroDynamics.beta,
                                        'Pitch_Alpha':mainVehicle.vehAeroDynamics.pitchAlpha,
                                        'Yaw_Alpha':mainVehicle.vehAeroDynamics.yawAlpha,
                                        'Heat_Flux':mainVehicle.vehAeroDynamics.heatflux}
    
    vehicleDataMap[key]['Body_Rates'] ={'Mission_time':mainVehicle.vehNavigation.time,
                                   'Roll':mainVehicle.vehNavigation.vehSteering.bodyRates.x,
                                   'Pitch':mainVehicle.vehNavigation.vehSteering.bodyRates.y,
                                   'Yaw':mainVehicle.vehNavigation.vehSteering.bodyRates.z}
    
    vehicleDataMap[key]['Body_Angle'] ={'Mission_time':mainVehicle.vehNavigation.time,
                                   'Roll':mainVehicle.vehNavigation.vehSteering.bodyAngle.x,
                                   'Pitch':mainVehicle.vehNavigation.vehSteering.bodyAngle.y,
                                   'Yaw':mainVehicle.vehNavigation.vehSteering.bodyAngle.z}
    
    vehicleDataMap[key]['Euler_Angle'] ={'Mission_time':mainVehicle.vehNavigation.time,
                                   'Phi':mainVehicle.vehNavigation.vehSteering.eulerAngle.x,
                                   'Theta':mainVehicle.vehNavigation.vehSteering.eulerAngle.y,
                                   'Psi':mainVehicle.vehNavigation.vehSteering.eulerAngle.z}
    vehicleDataMap[key]['IIP'] ={'Mission_time':mainVehicle.vehIIP.time,
                                   'Longitude':mainVehicle.vehIIP.longitude,
                                   'Latitude':mainVehicle.vehIIP.latitude,
                                  }
    vehicleDataMap[key]['Quaternion'] ={'Mission_time':mainVehicle.vehNavigation.time,
                                   'Q1':mainVehicle.vehNavigation.vehSteering.vehQuat.q1,
                                   'Q2':mainVehicle.vehNavigation.vehSteering.vehQuat.q2,
                                   'Q3':mainVehicle.vehNavigation.vehSteering.vehQuat.q3,
                                   'Q4':mainVehicle.vehNavigation.vehSteering.vehQuat.q4,
                                  }
    vehicleDataMap[key]['States'] ={'Mission_time':mainVehicle.vehNavigation.time,
                                   'X':mainVehicle.vehNavigation.vehStates.x,
                                   'Y':mainVehicle.vehNavigation.vehStates.y,
                                   'Z':mainVehicle.vehNavigation.vehStates.z,
                                   'U':mainVehicle.vehNavigation.vehStates.u,
                                    'V':mainVehicle.vehNavigation.vehStates.v,
                                    'W':mainVehicle.vehNavigation.vehStates.w
                                  }
    vehicleDataMap[key]['Lat_Long_Alt'] = {'Mission_time':mainVehicle.vehNavigation.vehLLA.time,
                                      'Altitude':mainVehicle.vehNavigation.vehLLA.altitude,
                                      'R_Earth_Surface':mainVehicle.vehNavigation.vehLLA.R_Earth_Surface,
                                      'GeoCentric_Latitide':mainVehicle.vehNavigation.vehLLA.geoCentricLatitude,
                                      'GeoDetic_Latitide':mainVehicle.vehNavigation.vehLLA.geoDeticLatitude,
                                      'Relative_Longitude':mainVehicle.vehNavigation.vehLLA.relativeLongitude,
                                      'Inertial_Longitude':mainVehicle.vehNavigation.vehLLA.inertialLongitude}
    
    vehicleDataMap[key]['Polar'] = {'Mission_time':mainVehicle.vehNavigation.vehPolar.time,
                               'Altitude':mainVehicle.vehNavigation.vehPolar.altitude,
                               'Inertial_Velocity':mainVehicle.vehNavigation.vehPolar.inerVel,
                               'Flight_Path_Angle':mainVehicle.vehNavigation.vehPolar.fpa,
                               'Velocity_Azimuth':mainVehicle.vehNavigation.vehPolar.velAzi,
                               'RMag':mainVehicle.vehNavigation.vehPolar.rMag,
                               'VMag':mainVehicle.vehNavigation.vehPolar.vMag}
    vehicleDataMap[key]['Sequence'] = {'Sequence' : mainVehicle.vehSequence.vehSeqence,
                           'Steering' : mainVehicle.vehSequence.vehSteerSequence}

            
def populateData(vehicle,vehicle2=""):
    
    if(vehicle2 !=""):
        dataIns(vehicle.vehicleName,vehicle)
        dataIns(vehicle2.vehicleName+"_2",vehicle2)
    else:
        dataIns(vehicle.vehicleName,vehicle)
    
    
def collectData(filePath1,filePath2=""):
    if(filePath2 !=""):
        vehicle1 = readDeSerializeData(filePath1)
        vehicle2 = readDeSerializeData(filePath2)
        
        populateData(vehicle1,vehicle2)
    else:     
        vehicle = readDeSerializeData(filePath1)
        populateData(vehicle)