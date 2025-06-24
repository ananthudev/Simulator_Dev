
import pickle
import os
import json
import copy
from jsmin import jsmin


class Stage:
    missionTime = []
    phase_time = []

    mass = []
    thrust = []
    total_acc = []
    gravity_acc = []
    aero_acc = []
    stage_name = ""
    sep_flag = ""

    def __init__(self, mtime, name, ptime, mass, thrust, t_acc, a_cc):
        self.missionTime = mtime
        self.phase_time = ptime
        self.mass = mass
        self.thrust = thrust
        self.total_acc = t_acc
        self.aero_acc = a_cc
        self.name = name


class Vehicle:
    mission_name = ""
    vehicleName = ""
    no_Stage = 0
    stageInfo = {}
    missionData = {}

    def __init__(self, t_stageInfo, t_missionData):
        self.stageInfo = t_stageInfo
        self.missionData = t_missionData


final_coe = []

g_phase_time = []
g_stageNumber = []
g_stageCounter = []


missionTime = []
altitude = []
inertialVelocity = []
flightPathAngle = []
velocityAzimuth = []

pitch = []
yaw = []
roll = []
rate_time = []

theta = []
phi = []
psi = []
ang_time = []

X = []
Y = []
Z = []
U = []
V = []
W = []
C_time = []

lati = []
longi = []
alti = []

aero_time = []
mach = []
dyn_pressure = []
coeff_drag = []
Q_alpha = []
total_AOA = []
alpha = []
beta = []
pitch_alpha = []
yaw_alpha = []
heat_flux = []  # missing in documentation

mass = []
thrust = []
thrust_acc = []
gravity_acc = []
total_acc = []
dyn_time = []
phase_time = []

# add stagenumber,phasetime,flag

pressure = []
temprature = []
density = []
# seperate in dictionary
zonalWind = []
meridWind = []

atmo_altitude = []
atmo_time = []

sam_time = []

iip_time = []
iip_lat = []
iip_longi = []

quaternion = []

rates = {}
eulerAngle = {}
polar = {}
states = {}
coOrdinates = {}
aeroDynamics = {}
COE = {}
dynamics = {}
atmos_prop = {}
sequence_flag = {}
steering_flag = {}
stageData = {}
mission_info = {}
obj_fun = {}
iip = {}
tracking_data = {}
radar_data = {}
dciss_data = {}
quat = {}

mission_data = {}

vehicleList = []

def clearData():

    print("[\u21BB] Data Cleared from PY END")
    final_coe.clear()


    g_phase_time.clear()
    g_stageNumber.clear()
    g_stageCounter.clear()


    missionTime.clear()
    altitude.clear()
    inertialVelocity.clear()
    flightPathAngle.clear()
    velocityAzimuth.clear()

    pitch.clear()
    yaw.clear()
    roll.clear()
    rate_time.clear()

    theta.clear()
    phi.clear()
    psi.clear()
    ang_time.clear()

    X.clear()
    Y.clear()
    Z.clear()
    U.clear()
    V.clear()
    W.clear()
    C_time.clear()

    lati.clear()
    longi.clear()
    alti.clear()

    aero_time.clear()
    mach.clear()
    dyn_pressure.clear()
    coeff_drag.clear()
    Q_alpha.clear()
    total_AOA.clear()
    alpha.clear()
    beta.clear()
    pitch_alpha.clear()
    yaw_alpha.clear()
    heat_flux.clear()  # missing in documentation

    mass.clear()
    thrust.clear()
    thrust_acc.clear()
    gravity_acc.clear()
    total_acc.clear()
    dyn_time.clear()
    phase_time.clear()

    # add stagenumber,phasetime,flag

    pressure.clear()
    temprature.clear()
    density.clear()
    # seperate in dictionary
    zonalWind.clear()
    meridWind.clear()

    atmo_altitude.clear()
    atmo_time.clear()

    sam_time.clear()

    iip_time.clear()
    iip_lat.clear()
    iip_longi.clear()

    quaternion.clear()

    rates.clear()
    eulerAngle.clear()
    polar.clear()
    states.clear()
    coOrdinates.clear()
    aeroDynamics.clear()
    COE.clear()
    dynamics.clear()
    atmos_prop.clear()
    sequence_flag.clear()
    steering_flag.clear()
    stageData.clear()
    mission_info.clear()
    obj_fun.clear()
    iip.clear()
    tracking_data.clear()
    radar_data.clear()
    dciss_data.clear()


    mission_data.clear()


def storeQuaternion(quat_list):
    quaternion.append(quat_list)


def storeIIP(i_time, i_lat, i_longi):
    iip_time.append(round(i_time, 1))
    iip_lat.append(i_lat)
    iip_longi.append(i_longi)


def storeMissionInfo(s_launchData):
    mission_info = s_launchData
    mission_data['Mission_info'] = mission_info


def storeFinalCOE(sam_coe):
    final_coe.append(sam_coe)


def storeTime(phase_time, stage_number, stg_counter):
    g_phase_time.append(round(phase_time, 1))
    g_stageNumber.append(int(stage_number))
    g_stageCounter.append(round(stg_counter, 1))


def storeAtmos_data(pres, temp, dens, zonal, mer, alti, time):
    pressure.append(pres)
    temprature.append(temp)
    density.append(dens)
    zonalWind.append(zonal)
    meridWind.append(mer)
    atmo_altitude.append(alti)
    atmo_time.append(round(time, 1))


def storeRate(rol, pi, ya, time):
    pitch.append(pi)
    yaw.append(ya)
    roll.append(rol)
    rate_time.append(round(time, 1))


def storeAngles(a_phi, a_psi, a_thet, a_time):
    # print(a_phi)
    phi.append(a_phi)
    psi.append(a_psi)
    theta.append(a_thet)
    ang_time.append(a_time)


def storeStates(x, y, z, u, v, w, time):
    X.append(x)
    Y.append(y)
    Z.append(z)
    U.append(u)
    V.append(v)
    W.append(w)
    C_time.append(round(time, 1))


def storeCoordinates(lat, long, alt):
    lati.append(lat)
    longi.append(long)
    alti.append(alt)


def storeData(time, alt, inertVel, flighAng, velAzi):
    missionTime.append(round(time, 1))
    sam_time.append(round(time, 1))
    altitude.append(alt)
    inertialVelocity.append(inertVel)
    flightPathAngle.append(flighAng)
    velocityAzimuth.append(velAzi)


def storeAero(a_time, a_mach, a_dyn_pres, a_QAOA, a_alpha, a_beta, a_pAlpha, a_yAlpha, a_heat_flux, a_coeff_drag, a_total_AOA):
    aero_time.append(round(a_time, 1))
    mach.append(a_mach)
    dyn_pressure.append(a_dyn_pres)
    Q_alpha.append(a_QAOA)
    alpha.append(a_alpha)
    beta.append(a_beta)
    pitch_alpha.append(a_pAlpha)
    yaw_alpha.append(a_yAlpha)
    heat_flux.append(a_heat_flux)
    coeff_drag.append(a_coeff_drag)
    total_AOA.append(a_total_AOA)


def storeCOE(coe,payloadMass):
    COE = coe
    mission_data['COE'] = COE
    mission_data['payload_mass'] = payloadMass

def storeDynamics(d_mass, d_thust,t_acc, g_acc, d_total_acc, time, phaseT):
    mass.append(d_mass)
    thrust.append(d_thust)
    thrust_acc.append(t_acc)
    gravity_acc.append(g_acc)
    total_acc.append(d_total_acc)
    dyn_time.append(round(time, 1))
    phase_time.append(round(phaseT, 1))


def storeFlag(flag_name, mis_time, seq_comment):
    seq_data = [str(round(mis_time, 1)), seq_comment]
    sequence_flag[flag_name] = seq_data


def storeSteering(flagname, mis_tim, steer_comment):
    steer_data = [str(round(mis_tim, 1)), steer_comment]
    steering_flag[flagname] = steer_data


def storeTrackingData(t_data):
    tracking_data = t_data
    mission_data['Tracking Data'] = tracking_data


def storeRadarData(stationName, coordinate):
    radar_data[stationName] = coordinate


def storeDCISS(objName, objCoordinates):
    dciss_data[objName] = objCoordinates


def bindStageData(stageName, time, ptime, mass, thrust, t_acc, a_cc):
    stage = Stage(time, stageName, ptime, mass, thrust, t_acc, a_cc)
    # data.stage.motor = ""
    # data.altitude = altitude
    # data.flightPathAngle = flightPathAngle
    # data.inertialVelocity =inertialVelocity
    # data.velocityAzimuth = velocityAzimuth
    stageData[stageName] = stage
    sam_time.clear()
    del data


def storeVehicleData(vehicleName):
    

    polar['Mission_Time'] = missionTime
    polar['Altitude'] = altitude
    polar['Inertial Velocity'] = inertialVelocity
    polar['Flight Path Angle'] = flightPathAngle
    polar['Velocity Azimuth'] = velocityAzimuth

    rates['Mission Time'] = C_time
    rates['pitch'] = pitch
    rates['yaw'] = yaw
    rates['roll'] = roll

    eulerAngle['Mission Time'] = C_time
    eulerAngle['Theta'] = theta
    eulerAngle['Phi'] = phi
    eulerAngle['Psi'] = psi
    
    states['Mission_Time'] = C_time
    states['X'] = X
    states['Y'] = Y
    states['Z'] = Z
    states['U'] = U
    states['V'] = V
    states['W'] = W
   

    aeroDynamics['Mission_Time'] = aero_time
    aeroDynamics['Mach'] = mach
    aeroDynamics['Dynamic Pressure'] = dyn_pressure
    aeroDynamics['Q_alpha'] = Q_alpha
    aeroDynamics['Alpha'] = alpha
    aeroDynamics['Beta'] = beta
    aeroDynamics['Pitch_alpha'] = pitch_alpha
    aeroDynamics['Yaw_alpha'] = yaw_alpha
    aeroDynamics['Heat_flux'] = heat_flux
    aeroDynamics['Coeff_drag'] = coeff_drag
    aeroDynamics['Total_AOA'] = total_AOA

    coOrdinates['Mission_Time'] = C_time
    coOrdinates['Latitude'] = lati
    coOrdinates['Longitude'] = longi
    coOrdinates['Altitude'] = alti
    

    dynamics['Mission_Time'] = dyn_time
    dynamics['Mass'] = mass
    dynamics['Thrust'] = thrust
    dynamics['Thrust_acc'] = thrust_acc
    dynamics['Gravity_acc'] = gravity_acc
    dynamics['Total_acc'] = total_acc
    dynamics['Phase_Time'] = phase_time

    atmos_prop["Mission_Time"] = atmo_time
    atmos_prop['Zonal_wind'] = zonalWind
    atmos_prop['Meridonal_wind'] = meridWind
    atmos_prop['Pressure'] = pressure
    atmos_prop['Temprature'] = temprature
    atmos_prop['Density'] = density
    atmos_prop['Altitude'] = atmo_altitude
    

    iip['Mission Time'] = iip_time
    iip['Latitude'] = iip_lat
    iip['Longitude'] = iip_longi

    mission_data['Polar'] = polar
    mission_data['Rates'] = rates
    mission_data['Angles'] = eulerAngle
    mission_data['States'] = states
    mission_data['Co_Ordinates'] = coOrdinates
    mission_data['Aerodynamics'] = aeroDynamics
    mission_data['Dynamics'] = dynamics
    mission_data['atmos_prop'] = atmos_prop
    mission_data['Sequence'] = sequence_flag
    mission_data['Steering'] = steering_flag
    mission_data['Phase_time'] = g_phase_time
    mission_data['Stage_number'] = g_stageNumber
    mission_data['Stage_counter'] = g_stageCounter
    mission_data['Final_COE'] = final_coe
    mission_data['IIP'] = iip
    mission_data['Vehicle_Name'] = vehicleName
    
    with open('Resource/Garuda.jsonc') as js_file:
        minified = jsmin(js_file.read())
    mission_data['vehicle_config']  = json.loads(minified)
    
    mission_data['Quaternion'] = quaternion
    mission_data['Radar'] = radar_data
    mission_data['DCISS'] = dciss_data

    
    #! can give condition whether to save the vehicle out data to list
    data_copy = copy.deepcopy(mission_data)
   
    
    addToList(data_copy)
    bindData(data_copy['Vehicle_Name'])

    clearData()
    
    return data_copy

    

   
def addToList(vehData):
    print("[\u21BB] Vehicle added to list")
    v = Vehicle(stageData,vehData)
    v.vehicleName = vehData['Vehicle_Name']
    # v.stageInfo = stageData
    vehicleList.append(v)


def bindData(missionName):
    if not os.path.exists('binary_output'):
        os.makedirs('binary_output')
    
    
    bin_file = open('binary_output/'+missionName, "wb")
    pickle.dump(vehicleList, bin_file)
    bin_file.close()
   

    print("[\u26C1] Data dump complete")
    
def printData(db):
    print("\nNo  Vehicle Name\n")
    for i in range(len(db)):
        print( i+1," ",db[i].vehicleName)

def unBindData()->list:

    dbfile = open("/home/user/Pictures/COREv3.0_OPT_TEST/binary_output/Garuda_1", "rb")

    db = pickle.load(dbfile)
    alt = db[0].missionData['vehicle_config']
    # tim =  db[0].missionData['States']['Mission_Time']
    # plt.plot(tim,alt)
    # plt.show()
    
    print(alt)

    dbfile.close()
    return db


    


if __name__ == '__main__':
    unBindData()
