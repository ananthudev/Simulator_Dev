from tkinter import *
import sys
import os
from Buffer_pb2 import Buffer
import matplotlib.pyplot as plt
import tkinter.font as font
import customtkinter
from tkinter import messagebox
from tkinter import filedialog


pathMap ={}

def find_folders(root_folder, target_folder):
    found_folders = []

    for folder, _, _ in os.walk(root_folder):
        if target_folder in folder:
            found_folders.append(folder)
            

    return found_folders

root_folder = os.getcwd()
target_folder = "bin"

dir_list = find_folders(root_folder, target_folder)
binFolder =[]

for folder in dir_list:
    binFilesList = os.listdir(folder)
    for binFiles in binFilesList:
        binFolder.append(folder+"/"+binFiles)
        pathMap[binFiles] = folder+"/"+binFiles




timecr =[]
cr=[]
dw=[]

# with open('Outputs/dw.csv') as f:
#         next(f)
#         for line in f:
            
#             line = line.replace(',',' ')
#             l = line.split()
#             ll = [float(s) for s in l]
#             timecr.append(ll[0])
#             cr.append(ll[5])
#             dw.append(ll[6])
            
          

def closePlot():
    plt.close('all')
    button2.place_forget()
    



def on_error():
   messagebox.showerror('Value Error', '\nError: Please Select a Vehicle!')
   



def read_serialized_data(file_path):
    with open(file_path, "rb") as f:
        serialized_data = f.read()
    return serialized_data

def deserialize_person(serialized_data):
    person = Buffer()
    person.ParseFromString(serialized_data)
    return person

def on_option_change(filePath):
    
    serialized_data = read_serialized_data(filePath)
    vehicleData = deserialize_person(serialized_data)
    label2.configure(text = round(vehicleData.coe["APOGEE"],2))
    label4.configure(text = round(vehicleData.coe["PERIGEE"],2))
    label6.configure(text = round(vehicleData.coe["INCLINATION"],2))
    pathMap['URL'] = filePath

def getBinPath(fileName):
    if(fileName == "Select a Vehicle"):
        on_error()
        return
    file_path = pathMap[fileName+".bin"]  # Path to the serialized data file
    plot(file_path)
	
def browseFiles():
	filename = filedialog.askopenfilename(initialdir = ".",title = "Select a File",filetypes = (("binary files","*.bin"),("all files","*.*")))
	label_bin_url.configure(text=filename.split("/")[-1])
	on_option_change(filename)    
    

def plot(flag=1):
    button2.place(relx=0.15, rely=0.88, anchor=customtkinter.CENTER)
    serialized_data = read_serialized_data(pathMap['URL'])
    vehicleData = deserialize_person(serialized_data)
    
    if vehicleData.vehicleType == "ASCEND" or vehicleData.vehicleType == "PROJECTILE":
        
        plt.figure(1)
        plt.plot(vehicleData.vehPolar.time,[x/1000.0 for x in vehicleData.vehPolar.altitude])
        plt.grid(True)
        plt.xlabel('Mission Time(s)')
        plt.ylabel('Altitude (km)')
        plt.tight_layout()
        #plt.savefig('Outputs/Graph/Altitude.png')
        
        plt.figure(6)
        plt.plot(vehicleData.vehPolar.time, vehicleData.vehPolar.inerVel)
        plt.grid(True)
        plt.xlabel('Mission Time(s)')
        plt.ylabel('Inertial Velocity (m/s)')
        plt.tight_layout()

        #plt.savefig('Outputs/Graph/INERTIAL VELOCITY.png')

        plt.figure(7)
        plt.plot(vehicleData.vehPolar.time, vehicleData.vehPolar.fpa)
        plt.grid(True)
        plt.xlabel('Mission Time(s)')
        plt.ylabel('Flight Path Angle (deg)')
        plt.tight_layout()

        #plt.savefig('Outputs/Graph/FLIGHT PATH ANGLE.png')

    
        plt.figure(4)
        plt.plot(vehicleData.vehPolar.time, vehicleData.vehPolar.velAzi)
        plt.grid(True)
        plt.xlabel('Mission Time(s)')
        plt.ylabel('Velocity Azimuth (deg)')
        plt.tight_layout()

        #plt.savefig('Outputs/Graph/VELOCITY AZIMUTH.png')
        
        plt.figure(12)
        plt.plot(vehicleData.vehNavigation.time,vehicleData.vehNavigation.bodyRates.z)
        plt.grid(True)
        plt.xlabel('Mission Time(s)')
        plt.ylabel('Yaw (Deg)')
        plt.tight_layout()

        #plt.savefig('Outputs/Graph/Yaw.png')
        
        plt.figure(13)
        plt.plot(vehicleData.vehNavigation.time,vehicleData.vehNavigation.bodyRates.y)
        plt.grid(True)
        # plt.xlim(0, 650)
        # plt.ylim(0, 1000)
        plt.xlabel('Mission Time(s)')
        plt.ylabel('Pitch')
        plt.tight_layout()
        #plt.savefig('Outputs/Graph/Pitch.png')

    if vehicleData.vehicleType == "ASCEND" or vehicleData.vehicleType == "DCISS" or vehicleData.vehicleType == "PROJECTILE":
        plt.figure(5)
        plt.plot(vehicleData.vehAeroDynamics.time, vehicleData.vehAeroDynamics.dynamicPressure)
        plt.grid(True)
        plt.xlabel('Mission Time(s)')
        plt.ylabel('Dynamic Pressure (Pa)')
        plt.tight_layout() 

        #plt.savefig('Outputs/Graph/Dynamic Pressure.png')

    

        plt.figure(8)
        plt.plot(vehicleData.vehDynamics.time,vehicleData.vehDynamics.mass)
        plt.grid(True)
        plt.xlabel('Mission Time(s)')
        plt.ylabel('Mass (kg)')
        plt.tight_layout()

        #plt.savefig('Outputs/Graph/Mass.png')

        plt.figure(9)
        plt.plot(vehicleData.vehAeroDynamics.time,vehicleData.vehAeroDynamics.qAlpha)
        plt.grid(True)
        plt.xlabel('Mission Time(s)')
        plt.ylabel('Q-Alpha (PaRad)')
        plt.tight_layout()

        #plt.savefig('Outputs/Graph/Q-Alpha.png')

        plt.figure(10)
        plt.plot(vehicleData.vehDynamics.time,vehicleData.vehDynamics.sensedAcc)
        plt.grid(True)
        plt.xlabel('Altitude')
        plt.ylabel('Sensed Acc (m/s^2)')
        plt.tight_layout()

    

        #plt.savefig('Outputs/Graph/Sensed_Acc.png')

        plt.figure(11)
        plt.plot(vehicleData.vehAeroDynamics.time,vehicleData.vehAeroDynamics.mach)
        plt.grid(True)
        plt.xlabel('Mission Time(s)')
        plt.ylabel('Mach')
        plt.tight_layout()

        #plt.savefig('Outputs/Graph/Mach.png')
        
        plt.figure(15)
        plt.plot(vehicleData.vehRange.time,vehicleData.vehRange.downRange,timecr,dw)
        plt.grid(True)
        plt.xlabel('Time(s)')
        plt.ylabel('Down Range')
        plt.tight_layout()

        #plt.savefig('Outputs/Graph/Down_Range.png')
        
        
        plt.figure(14)
        plt.plot(vehicleData.vehRange.time,vehicleData.vehRange.crossRange,timecr,cr)
        plt.grid(True)
        plt.xlabel('Time(s)')
        plt.ylabel('Cross Range')
        plt.tight_layout()


        plt.figure(16)
        plt.plot(vehicleData.vehAeroDynamics.time,vehicleData.vehAeroDynamics.AOA)
        plt.grid(True)
        plt.xlabel('Mission Time(s)')
        plt.ylabel('Angle of Attack(deg)')
        plt.tight_layout()
        #plt.savefig('Outputs/Graph/Cross_Range.png')

        #button2.pack(anchor=SW, side = "left")
        #button2.place(relx=0.12, rely=0.88, anchor=customtkinter.CENTER)
        
        
    plt.show()


def GUI():
        customtkinter.set_appearance_mode("dark")  # Modes: system (default), light, dark
        customtkinter.set_default_color_theme("blue")  # Themes: blue (default), dark-blue, green
        app = customtkinter.CTk()  # create CTk window like  Tk window
        app.geometry("400x180")
        app.title("ASTRA PLOT")
        app.eval('tk::PlaceWindow . center')
        global label2  
        global label4 
        global label6 
        global optionmenu_var 
        global button2
        global label_bin_url
        global labe_bin
        button2 = customtkinter.CTkButton(master=app, text="Close Plots", command=closePlot,width = 60,fg_color = "#C41E3A",hover_color = "#EE4B2B")
        
        

        labe_bin = customtkinter.CTkLabel(app, text="Bin File : ", fg_color="transparent")
        labe_bin.place(relx=0.05, rely=0.1)
        
        label_bin_url = customtkinter.CTkLabel(app, text="", fg_color="transparent")
        label_bin_url.place(relx=0.2, rely=0.1)

        button_upload = customtkinter.CTkButton(app, text="Upload", command=browseFiles ,width = 60,height = 20)
        button_upload.place(relx=0.8,rely = .1)
# check_var = customtkinter.IntVar(value=1)
# checkbox = customtkinter.CTkCheckBox(app, text="Grid",
#                                      variable=check_var, onvalue=1, offvalue=0,checkbox_height = 20,checkbox_width = 20)
# checkbox.place(relx=0.06, rely=0.3)

# Use CTkButton instead of tkinter Button
        button1 = customtkinter.CTkButton(master=app, text="Plots", command=lambda: plot(1),width = 60,fg_color = "green",hover_color = "#228B22")
        button1.place(relx=0.88, rely=0.88, anchor=customtkinter.CENTER)



        label = customtkinter.CTkLabel(app, text="APOGEE : ", fg_color="transparent")
        label.place(relx=0.05, rely=0.4)

        label2 = customtkinter.CTkLabel(app, text="0.0", fg_color="transparent")
        label2.place(relx=0.2, rely=0.4)

        label3 = customtkinter.CTkLabel(app, text="PERIGEE : ", fg_color="transparent")
        label3.place(relx=0.05, rely=0.5)

        label4 = customtkinter.CTkLabel(app, text="0.0", fg_color="transparent")
        label4.place(relx=0.2, rely=0.5)

        label5 = customtkinter.CTkLabel(app, text="INCL : ", fg_color="transparent")
        label5.place(relx=0.05, rely=0.6)

        label6 = customtkinter.CTkLabel(app, text="0.0", fg_color="transparent")
        label6.place(relx=0.2, rely=0.6)


        app.mainloop()

if __name__ == "__main__":
    GUI()