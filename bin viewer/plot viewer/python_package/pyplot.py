import matplotlib.pyplot as plt
import numpy as np

import os
from os import listdir
from os.path import isfile, join
import numpy as np
from scipy.integrate import simpson
from numpy import trapz

# dir_list = os.listdir("Outputs/DCISS")


# for i in range(len(dir_list)):
#     dciss_time =[]
#     dciss_alti=[]
#     dciss_lati=[]
#     dciss_longi=[]
    
#     with open("Outputs/DCISS/"+dir_list[i]) as f:
#         next(f)
#         for line in f:
            
#             line = line.replace(',',' ')
#             l = line.split()
#             ll = [float(s) for s in l]
#             dciss_time.append(ll[1])
#             dciss_alti.append(ll[2])
#             dciss_lati.append(ll[3])
#             dciss_longi.append(ll[4])
#     plt.figure(13+i)
#     plt.plot(dciss_time,dciss_alti)
#     plt.grid(True)
#     plt.xlabel('DCISS Time(s)')
#     plt.ylabel('Altitude')
#     plt.tight_layout()
#     plt.legend([dir_list[i].replace(".csv","")])
    
# plt.show()

def plot():
    mission_time = []
    mission_time1 = []
    mission_time2 =[]
    altitude = []
    inertial_velocity = []
    flight_path_angle = []
    velocity_azimuth = []
    Pitch = []
    yaw = []
    roll = []
    longitude = []
    latitude = []
    Mass = []
    Acc = []
    thrust = []
    dyn_press =[]
    qAlpha = []
    alpha =[]
    mach = []
    total_acc = []
    mission_time_bod =[]
    sensedAcc =[]
    
    iip_longi =[]
    iip_lati =[]
    iip_time =[]
    
    dciss_alti =[]
    dciss_time =[]
    dragAcc =[]

    with open('Outputs/Garuda_Projectile_Polar.csv') as f:
        next(f)
        for line in f:
            
            line = line.replace(',',' ')
            l = line.split()
            ll = [float(s) for s in l]
            mission_time1.append(ll[0])
            altitude.append(ll[1]/1000)
            inertial_velocity.append(ll[2])
            flight_path_angle.append(ll[3])
            velocity_azimuth.append(ll[4])
            
    #with open('Outputs/Garuda_Projectile_IIP.csv') as f:
        # next(f)
        # for line in f:
            
        #     line = line.replace(',',' ')
        #     l = line.split()
        #     ll = [float(s) for s in l]
        #     # iip_time.append(ll[0])
        #     iip_lati.append(ll[1])
        #     iip_longi.append(ll[0])
            
    # with open('Outputs/DCISS/Garuda_Projectile_1_Stage_1.csv') as f:
    #     next(f)
    #     for line in f:
            
    #         line = line.replace(',',' ')
    #         l = line.split()
    #         ll = [float(s) for s in l]
    #         # iip_time.append(ll[0])
    #         dciss_time.append(ll[1])
    #         dciss_alti.append(ll[2])
           
    
            
    with open('Outputs/Garuda_Projectile_AeroDynamic.csv') as f:
        next(f)
        for line in f:
            
            line = line.replace(',',' ')
            
            l = line.split()
            ll = [float(s) for s in l]
            mission_time2.append(ll[0])
            mach.append(ll[1])
            dyn_press.append(ll[2])
            alpha.append(ll[3])
            qAlpha.append(ll[4])
            
            
        
            
    
    
    with open('Outputs/Garuda_Projectile_Acceleration.csv') as f:
      next(f)
      for line in f:
          line = line.replace(',',' ')
          l = line.split()
          ll = [float(s) for s in l]
          mission_time.append(ll[0])
          Mass.append(ll[1])
          thrust.append(ll[2])
          sensedAcc.append(ll[3])
          dragAcc.append(ll[4])
          Acc.append(ll[5])
         
    

    with open('Outputs/Garuda_Projectile_Body_rates.csv') as g:
        next(g)
        for line in g:
            line = line.replace(',',' ')
            l = line.split()
            ll = [float(s) for s in l]
            mission_time_bod.append(ll[0])
            roll.append(ll[1])
            Pitch.append(ll[2])
            yaw.append(ll[3])

    # with open('Outputs/lat_long_alt.log') as f:
    #     next(f)
    #     for line in f:
    #         l = line.split()
    #         ll = [float(s) for s in l]
    #         latitude.append(ll[1])
    #         longitude.append(ll[2])

    # plt.style.use("cyberpunk")
    plt.figure(1)
    plt.plot(mission_time_bod,Pitch)
    plt.grid(True)
    # plt.xlim(0, 650)
    # plt.ylim(0, 1000)
    plt.xlabel('Mission Time(s)')
    plt.ylabel('Pitch')
    plt.tight_layout()

    plt.savefig('Outputs/Graph/Pitch.png')

    plt.figure(2)
    plt.plot(mission_time2,alpha)
    plt.grid(True)
    plt.xlabel('Mission Time(s)')
    plt.ylabel('Alpha (deg)')
    plt.tight_layout()

    plt.savefig('Outputs/Graph/Alpha.png')

    plt.figure(3)
    plt.plot(mission_time1,altitude)
    plt.grid(True)
    plt.xlabel('Mission Time(s)')
    plt.ylabel('Altitude (km)')
    plt.tight_layout()
    
    
    plt.savefig('Outputs/Graph/Altitude.png')

    
    plt.figure(4)
    plt.plot(mission_time1, velocity_azimuth)
    plt.grid(True)
    plt.xlabel('Mission Time(s)')
    plt.ylabel('Velocity Azimuth (deg)')
    plt.tight_layout()

    plt.savefig('Outputs/Graph/VELOCITY AZIMUTH.png')


    plt.figure(5)
    plt.plot(mission_time2, dyn_press)
    plt.grid(True)
    plt.xlabel('Mission Time(s)')
    plt.ylabel('Dynamic Pressure (Pa)')
    plt.tight_layout() 

    plt.savefig('Outputs/Graph/Dynamic Pressure.png')

    plt.figure(6)
    plt.plot(mission_time1, inertial_velocity)
    plt.grid(True)
    plt.xlabel('Mission Time(s)')
    plt.ylabel('Inertial Velocity (m/s)')
    plt.tight_layout()

    plt.savefig('Outputs/Graph/INERTIAL VELOCITY.png')

    plt.figure(7)
    plt.plot(mission_time1, flight_path_angle)
    plt.grid(True)
    plt.xlabel('Mission Time(s)')
    plt.ylabel('Flight Path Angle (deg)')
    plt.tight_layout()

    plt.savefig('Outputs/Graph/FLIGHT PATH ANGLE.png')

    plt.figure(8)
    plt.plot(mission_time,Mass)
    plt.grid(True)
    plt.xlabel('Mission Time(s)')
    plt.ylabel('Mass (kg)')
    plt.tight_layout()

    plt.savefig('Outputs/Graph/Mass.png')

    plt.figure(9)
    plt.plot(mission_time2,qAlpha)
    plt.grid(True)
    plt.xlabel('Mission Time(s)')
    plt.ylabel('Q-Alpha (PaRad)')
    plt.tight_layout()

    plt.savefig('Outputs/Graph/Q-Alpha.png')

    plt.figure(10)
    plt.plot(mission_time,sensedAcc)
    plt.grid(True)
    plt.xlabel('Altitude')
    plt.ylabel('Sensed Acc (m/s^2)')
    plt.tight_layout()
    
   

    plt.savefig('Outputs/Graph/Sensed_Acc.png')
    
    plt.figure(11)
    plt.plot(mission_time2,mach)
    plt.grid(True)
    plt.xlabel('Mission Time(s)')
    plt.ylabel('Mach')
    plt.tight_layout()

    plt.savefig('Outputs/Graph/Mach.png')
    
    plt.figure(12)
    plt.plot(mission_time,yaw)
    plt.grid(True)
    plt.xlabel('Mission Time(s)')
    plt.ylabel('Yaw (Deg)')
    plt.tight_layout()

    plt.savefig('Outputs/Graph/Yaw.png')
    
    # plt.figure(13)
    # plt.plot(iip_longi,iip_lati)
    # plt.grid(True)
    # plt.xlabel('IIP Longitude')
    # plt.ylabel('IIP Latitude')
    # plt.tight_layout()

    # plt.savefig('Outputs/Graph/IIP.png')
    
    plt.figure(14)
    plt.plot(mission_time,dragAcc)
    plt.grid(True)
    plt.xlabel('Time')
    plt.ylabel('Drag Acc')
    plt.tight_layout()

    plt.savefig('Outputs/Graph/Drag Acc.png')
    
    plt.figure(15)
    plt.plot(mission_time,Acc)
    plt.grid(True)
    plt.xlabel('Mission Time(s)')
    plt.ylabel('Relative Velocity')
    plt.tight_layout()

    plt.savefig('Outputs/Graph/Relative Vel.png')
   
    # The y values.  A numpy array is used here,
    # but a python list could also be used.
    y = np.array(Acc)

    # Compute the area using the composite trapezoidal rule.
    area = trapz(y, dx=0.1)
    print("area =", area)

    # Compute the area using the composite Simpson's rule.
    area = simpson(y, dx=0.1)
    print("area =", area)
    plt.show()

    # mypath = 'Outputs/Graph/'

    # imagelist = [f for f in listdir(mypath) if isfile(join(mypath, f))]
    # imageName = []

    # for p in imagelist:
    #     imageName.append(os.path.splitext(p)[0])

    # pdf = FPDF()
    # pdf = FPDF(orientation = 'L')
    # pdf.set_margins(left=10, top=12, right=10)

    # i = 0

    # for images in imagelist:

    #     pdf.add_page()
    #     pdf.set_font('Arial', 'B', 12)
    #     w = pdf.get_string_width(imageName[i]) + 6
    #     pdf.set_x((55 - w) / 2)
    #     pdf.cell(w, 9, imageName[i], 0, 0, 'C')
    #     pdf.image(mypath+images)
    #     pdf.set_y(-27)
    #     pdf.set_font('Arial', 'B', 10)
    #     pdf.set_text_color(0)
    #     pdf.cell(0, 5, 'Page ' + str(pdf.page_no()), 0, 0, 'C')
    #     i = i+1

    # pdf.output("Outputs/Documents/GRAPH_REP.pdf", "F")
    # #deleting all imagess after use
    # for f in os.listdir(mypath):
    #     os.remove(os.path.join(mypath, f))


plot()



