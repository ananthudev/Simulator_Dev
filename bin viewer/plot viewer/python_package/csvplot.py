from tkinter import IntVar
from tkinter import ttk
import matplotlib.pyplot as plt
import tkinter.font as font
import customtkinter
from tkinter import messagebox
from tkinter import filedialog
import pandas
from Buffer_pb2 import Buffer
import Desrialize
import os
import sys
sys.path.append(os.path.abspath('.'))
# from base.API import _Astra
from cpCallout import plotCallout
from matfilecreator import generateMat

from tkinter import *

from tkinter import messagebox

def show_success_message(msg):
    # Display a success message box
    messagebox.showinfo("Success", msg)
    
plt.style.use('ggplot')
figNum = 0
checkboxesVarMap = {}
checkboxesMap = {}

plot_figures = []

def storeFigure(fig):
    fig.canvas.mpl_connect('close_event', on_plot_close)
    plot_figures.append(fig)
    
def on_plot_close(event):
    fig = event.canvas.figure  
    if fig in plot_figures:
        plot_figures.remove(fig) 
        # print("Plot removed from list. Remaining open plots:", len(plot_figures))

def save_plots():
    if not plot_figures:
        messagebox.showwarning("No Plots", "No plots available to save.")
        return

    folder_path = filedialog.askdirectory()
    if not folder_path:
        return  
    try:
        for i, fig in enumerate(plot_figures):
            ax = fig.gca()  
            title = ax.get_title().replace('/', '') 
            file_path = os.path.join(folder_path, f"{title}.png")
            fig.set_size_inches(18, 10)
            fig.savefig(file_path)
            fig.set_size_inches(6.45, 5)
        messagebox.showinfo("Success", f"All plots saved to {folder_path}")
    except Exception as e:
        messagebox.showerror("Save Error", f"Failed to save plots: {e}")
        
def showSaveButton(_master):
    saveButton = customtkinter.CTkButton(master=_master, text="save", 
    command=save_plots,fg_color = "#228B22",hover_color = "#32CD32", width=10, height=2,corner_radius=5)
    saveButton.place(relx=0.965, rely=0.1, anchor=customtkinter.CENTER)
    
def multiPlot():
    plt.cla()
    csvData = pandas.read_csv(data['URL_1'])
    xData = csvData[optionmenu_var_x.get()]
    ydata = {}
    
    for key in checkboxesVarMap:
        if checkboxesVarMap.get(key).get() == "on":
            ydata[key] = csvData[key]
            
    
    
    
    
    fig = plt.figure(1)
    storeFigure(fig)
    for key in ydata:
        plt.plot(xData,ydata[key],label=key)
        if(len(ydata) == 1):
         plt.title(key.replace("_"," "))
        else:
         plt.title("Multiplot")
         plt.legend()
        
    plt.grid(1)
    plt.xlabel(optionmenu_var_x.get())
    plt.ylabel(', '.join(ydata.keys()))  
    plt.show()
    
def createCheckboxes(fileName):
    
    for key in checkboxesMap:
        checkboxesMap.get(key).destroy()
        
    checkboxesMap.clear()
            
    header = pandas.read_csv(fileName, nrows=1).columns
    index = 0
    for i in header:
        checkBoxVar = customtkinter.StringVar(value="off")
        checkBox = customtkinter.CTkCheckBox(scrollable_frame, text=i,
                                     variable=checkBoxVar,onvalue="on", offvalue="off")
        checkBox.pack(pady = 5)
        checkboxesVarMap[i] = checkBoxVar
        checkboxesMap[i] = checkBox
        
data = {'fignum':figNum,
        'file_desc': 'csv files',
        'file_ext':  '*.csv',
        'binCompare':False}

DEG_PER_RAD = 180.0 / 3.14159265358979323846264338327950288419716939937511

def compareBinEvent():
    if check_var.get() == "on":
        label_gen2.place(relx=0.05, rely=0.2)
        button_bin_upload_2.place(relx=0.8,rely = .2)
        optionmenu_bin_veh_param.place_forget()
        optionmenu_bin_x.place_forget()
        optionmenu_bin_y.place_forget()
        button_plot_bin.place_forget()
        button_plot_all_bin.place_forget() 
        button_fetch_all_bin.place_forget()
        button_plot_bin_compare.place_forget()
        data['binCompare'] = True
    else:
        label_gen2.place_forget()
        button_bin_upload_2.place_forget()
        label_file_bin_url_2.place_forget()
        optionmenu_bin_veh_param.place_forget()
        optionmenu_bin_x.place_forget()
        optionmenu_bin_y.place_forget()
        button_plot_bin.place_forget()
        button_plot_all_bin.place_forget() 
        button_fetch_all_bin.place_forget()
        button_plot_bin_compare.place_forget()
        data['binCompare'] = False
    
    Desrialize.vehicleDataMap.clear()
def populateMenu(fileName):
    if radio_var.get() == 3:
        header = pandas.read_csv(fileName, nrows=1).columns
        optionmenu_x.configure(values=header)
        optionmenu_y.configure(values=header)
        data['xy'] = pandas.read_csv(fileName)
    
    data['URL_1'] = fileName
    
def browseFiles():
	filename = filedialog.askopenfilename(initialdir = ".",title = "Select a File",filetypes=((data['file_desc'],data['file_ext']),("all files","*.*")))
	label_file1_url.configure(text=filename.split("/")[-1])
	populateMenu(filename)

def multiPlotBrowseFile():
    filename = filedialog.askopenfilename(initialdir = ".",title = "Select a File",filetypes=((data['file_desc'],data['file_ext']),("all files","*.*")))
    label_file1_url.configure(text=filename.split("/")[-1])
    data['URL_1'] = filename
    optionmenu_x.place(relx=0.05, rely=0.3)
    header = pandas.read_csv(filename, nrows=1).columns
    optionmenu_x.configure(values=header)
    scrollable_frame.place(relx = 0.5,rely = 0.2)
    button_multiplot.place(relx=0.1, rely=0.9, anchor=customtkinter.CENTER)
    createCheckboxes(filename)
    
def browseFiles_2():
	filename = filedialog.askopenfilename(initialdir = ".",title = "Select a File",filetypes = ((data['file_desc'],data['file_ext']),("all files","*.*")))
	label_file2_url.configure(text=filename.split("/")[-1])
	data['URL_2'] = filename

def populateVehParam(filename,flag):
    if flag:
        optionmenu_bin_veh_param.place_forget()
        optionmenu_bin_x.place_forget()
        optionmenu_bin_y.place_forget()
        button_plot_bin.place_forget()
        button_plot_all_bin.place_forget() 
        if(check_var.get() == "off"):
            button_fetch_all_bin.place(relx=0.7, rely=0.88, anchor=customtkinter.CENTER)
    if label_file_bin_url_2.cget("text") != "":
        if 'BIN_URL_2' not in data:
            data['BIN_URL_2'] = filename
    if label_file_bin_url.cget("text") != "":
        if 'BIN_URL_1' not in data:
            data['BIN_URL_1'] = filename
    if label_gen_file_url.cget("text") != "":
            data['BIN_URL_1_GEN'] = filename
    
    if label_file_bin_url.cget("text") != "" and label_file_bin_url_2.cget("text") != "":
        
        Desrialize.collectData(data['BIN_URL_1'],data['BIN_URL_2'])
        optionmenu_bin_veh_param.place(relx=0.05, rely=0.4)

def generateSubParam(choice):
    if data['binCompare']:
        button_plot_bin_compare.place(relx=0.88, rely=0.88, anchor=customtkinter.CENTER)
    else:
        optionmenu_var_bin_x.set("X-coordinate")
        optionmenu_var_bin_y.set("Y-coordinate")
        
        coordParamLis =[]
        if choice == 'Sequence':
            optionmenu_bin_x.place_forget()
            optionmenu_bin_y.place_forget()
            optionmenu_bin_x.place_forget()
            optionmenu_bin_y.place_forget()
            button_plot_bin.place_forget()
            button_plot_all_bin.place(relx=0.7, rely=0.88, anchor=customtkinter.CENTER)
        else:
            if(choice == 'Dynamics'):
                coordParamLis = ['Mission_time','Phase_time','Mass','Thrust','Vaccum_Thrust',
                                'Sensed_Acc','Drag_Acc','Drag_Force','Relative_velocity',
                                'Gravity_Acc','Total_Acc','ThrustAcc.x','ThrustAcc.y','ThrustAcc.z',
                                'ThrustAccMag','GravAcc.x','GravAcc.y','GravAcc.z']
            elif choice=='AeroDynamics':
                coordParamLis=['Mission_time','Mach','CD','Dynamic Pressure','Angle of Attack','Q Alpha',
                            'Alpha','Beta','Pitch_Alpha','Yaw_Alpha','Heat_Flux']
            elif choice == 'Body_Rates':
                coordParamLis =['Mission_time','Roll','Pitch','Yaw']
            elif choice == 'Body_Angle':
                coordParamLis =['Mission_time','Roll','Pitch','Yaw']
            elif choice == 'Euler_Angle':
                coordParamLis =['Mission_time','Phi','Theta','Psi']
            elif choice == 'Lat_Long_Alt':
                coordParamLis = ['Mission_time','Altitude','R_Earth_Surface','GeoCentric_Latitide','GeoDetic_Latitide'
                                ,'Relative_Longitude','Inertial_Longitude']
            elif choice == 'IIP':
                coordParamLis =['Mission_time','Longitude','Latitude']
            elif choice == 'Quaternion':
                coordParamLis =['Mission_time','Q1','Q2','Q3','Q4']
            elif choice == 'States':
                coordParamLis =['Mission_time','X','Y','Z','U','V','W']
            elif choice == 'Polar':
                coordParamLis =['Mission_time','Altitude','Inertial_Velocity','Flight_Path_Angle','Velocity_Azimuth','RMag','VMag']    
            
            optionmenu_bin_x.configure(values=coordParamLis)
            optionmenu_bin_y.configure(values=coordParamLis)
            optionmenu_bin_x.place(relx=0.05, rely=0.45)
            optionmenu_bin_y.place(relx=0.5, rely=0.45)
            button_plot_bin.place(relx=0.88, rely=0.88, anchor=customtkinter.CENTER)
            button_plot_all_bin.place(relx=0.7, rely=0.88, anchor=customtkinter.CENTER)
    
    
def plotAllBin(mainParam,xParaam):
    print(mainParam,xParaam)
    
    binName = label_file_bin_url.cget("text")[:len(label_file_bin_url.cget("text")) - 4]
    
    xKey = 'Mission_time'
    if xParaam != 'X-coordinate':
        xKey = xParaam

    button_bin_plot_close.place(relx=0.5, rely=0.8, anchor=customtkinter.CENTER)
    
    if mainParam == 'Sequence':
        vehSeqTime =[]
        vehSeqMsg =[]
        vehSteerTime =[]
        vehSteerMsg =[]

        vehSeq = Desrialize.vehicleDataMap[binName][mainParam]['Sequence']

        for key in vehSeq:
            vehSeqTime.append(round(vehSeq[key].time,2))
            vehSeqMsg.append(vehSeq[key].comment)

        vehSteer = Desrialize.vehicleDataMap[binName][mainParam]['Steering']

       

        for key in vehSteer:
            vehSteerTime.append(round(vehSteer[key].time,2))
            vehSteerMsg.append(vehSteer[key].comment)
        
        plotCallout({'Sequence' : [vehSeqTime,vehSeqMsg],
                    'Steering' : [vehSteerTime,vehSteerMsg]})
    else :
        for ykey in Desrialize.vehicleDataMap[binName][mainParam]:
            data['fignum'] = data['fignum'] + 1
            plt.figure(data['fignum'])
            plt.grid(1)
            plt.plot(Desrialize.vehicleDataMap[binName][mainParam][xKey],Desrialize.vehicleDataMap[binName][mainParam][ykey])
            plt.xlabel(xKey)
            plt.ylabel(ykey)
        plt.show()
        
def browseFiles_gen(labelVar,flag=False):
    
	filename = filedialog.askopenfilename(initialdir = ".",title = "Select a File",filetypes = (('Binary files','*.bin'),("all files","*.*")))
	labelVar.configure(text=filename.split("/")[-1])
	populateVehParam(filename,flag)

def browseFile_gen_out():
    folder_selected = filedialog.askdirectory()
    label_gen_file_dir.configure(text=folder_selected)
    data['OUT_DIR'] = folder_selected+"/"
    
def fetchData(filePath):
    Desrialize.collectData(filePath)
    
    optionmenu_bin_veh_param.place(relx=0.05, rely=0.25)
    button_fetch_all_bin.place_forget()
    
    
def generateCSV():
    if 'BIN_URL_1_GEN' not in data or 'OUT_DIR' not in data or formatRadio.get() == 0:
        on_error("All Field Required")
    else:
        if(formatRadio.get() == 1):
            _Astra.WriteOutput.getInstance().GenerateCSV(data['BIN_URL_1_GEN'],data["OUT_DIR"])
            show_success_message ('CSV GENERATED!')
        elif(formatRadio.get() == 2):
            generateMat(data['BIN_URL_1_GEN'],data["OUT_DIR"])
            show_success_message ('MAT File GENERATED!')
def compare():
    if label_file1_url.cget("text") == '' or label_file2_url.cget("text") == '':
        on_error("Please Upload both file")
    else:
        
        button2.place(relx=0.8, rely=0.7, anchor=customtkinter.CENTER)
        header_1 = pandas.read_csv(data['URL_1'], nrows=1).columns
        header_2 = pandas.read_csv(data['URL_2'], nrows=1).columns
        
        if(len(header_1) != len(header_2)):
            on_error("Number of Column mismatch")
        
        file1_x = header_1[0]
        file2_x = header_2[0]
        
        data_1 = pandas.read_csv(data['URL_1'])
        data_2 = pandas.read_csv(data['URL_2'])
        
        if diffcheck_var.get() == "on":
            for index in range(1,len(header_1)):
                fig = plt.figure(header_1[index])
                plt.title("Difference Plot : "+header_1[index])
                plt.plot(data_1[file1_x], data_1[header_1[index]] - data_2[header_2[index]])
                plt.xlabel(file1_x)
                plt.ylabel(header_1[index])
                plt.grid(1)
                storeFigure(fig) 
        else:
            for index in range(1,len(header_1)):
                data['fignum'] = data['fignum']+1
                fig = plt.figure(data['fignum'])
                plt.title(header_1[index])
                plt.plot(data_1[file1_x], data_1[header_1[index]], linestyle='dashed')
                plt.plot(data_2[file2_x], data_2[header_2[index]])
                plt.xlabel(file1_x)
                plt.ylabel(header_1[index])
                plt.legend([data['URL_1'].split("/")[-1][:len(data['URL_1'].split("/")[-1]) - 4],data['URL_2'].split("/")[-1][:len(data['URL_2'].split("/")[-1]) - 4]])
                plt.grid(1)
                storeFigure(fig) 
        plt.show()
 

    
def Plot(xpoints,ypoints):
    if(xpoints == 'X-coordinate' or ypoints == 'Y-coordinate'):
        on_error("Please select X/Y coordinate")
    else:
        
        button2.place(relx=0.8, rely=0.7, anchor=customtkinter.CENTER)
        data['fignum'] = data['fignum']+1
        fig = plt.figure(data['fignum'])
        plt.grid(1)
        plt.plot(data['xy'][xpoints],data['xy'][ypoints])
        plt.xlabel(optionmenu_var_x.get())
        plt.ylabel(optionmenu_var_y.get())
        storeFigure(fig)
        plt.show()

def plotAll(xParam):
    if label_file1_url.cget("text") == '':
        on_error("Please upload file")
    else:
        
        button2.place(relx=0.8, rely=0.7, anchor=customtkinter.CENTER)
        header = pandas.read_csv(data['URL_1'], nrows=1).columns
    if(xParam == 'X-coordinate'):
        xPoint = header[0]
    else:
        xPoint = xParam

    for param in header:
        data['fignum'] = data['fignum']+1
        fig = plt.figure(data['fignum'])
        plt.grid(1)
        plt.plot(data['xy'][xPoint],data['xy'][param])
        plt.xlabel(xPoint)
        plt.ylabel(param)
        plt.title(param.replace("_", " "))
        storeFigure(fig)
    plt.show()

def on_error(message1):
   messagebox.showerror('Error', '\nError:'+ message1)


def showCompare(val):
    if val == 1:
        optionmenu_y.place_forget()
        optionmenu_x.place_forget()
        button_plot_event_compare.place_forget()
        button2.place_forget()
        button_plot_all.place_forget()
        button_plot.place_forget()
        label_file2.place(relx=0.05, rely=0.2)
        label_file2_url.place(relx=0.15, rely=0.2)
        button_upload_2.place(relx=0.8,rely = .2)
        
        label_file1_url.configure(text='')
        label_file2_url.configure(text='')
        
        label_file1.configure(text='File 1 : ')
        label_file2.configure(text='File 2 : ')
        button_plot_compare.place(relx=0.88, rely=0.88, anchor=customtkinter.CENTER)
        data['file_desc'] = 'csv files'
        data['file_ext'] = '*.csv'
        diffcheckbox.place(relx = 0.49,rely = 0.85)
        
    elif val == 2:
        optionmenu_y.place_forget()
        optionmenu_x.place_forget()
        button2.place_forget()
        diffcheckbox.place_forget()
        button_plot_all.place_forget()
        button_plot.place_forget()
        label_file2.place(relx=0.05, rely=0.2)
        label_file1_url.place(relx=0.25, rely=0.05)
        label_file2_url.place(relx=0.25, rely=0.2)
        label_file1_url.configure(text='')
        label_file2_url.configure(text='')
        button_upload_2.place(relx=0.8,rely = .2)
        label_file1.configure(text='Binary File 1 : ')
        label_file2.configure(text='Binary File 2 : ')
        button_plot_event_compare.place(relx=0.88, rely=0.88, anchor=customtkinter.CENTER)
        data['file_desc'] = 'Binary files'
        data['file_ext'] = '*.bin'
        
    elif val == 3:
        button_plot_compare.place_forget()
        button_plot_event_compare.place_forget()
        diffcheckbox.place_forget()
        button_upload_2.place_forget()
        label_file2_url.place_forget()
        label_file2.place_forget()
        optionmenu_x.place(relx=0.05, rely=0.3)
        optionmenu_y.place(relx=0.5, rely=0.3)
        button_plot_all.place(relx=0.7, rely=0.88, anchor=customtkinter.CENTER)
        button_plot.place(relx=0.88, rely=0.88, anchor=customtkinter.CENTER)
        label_file1.configure(text='File : ')
        label_file1_url.configure(text='')
        data['file_desc'] = 'csv files'
        data['file_ext'] = '*.csv'


def compareBinParam(mainParam):
    
    button_bin_plot_close.place(relx=0.5, rely=0.8, anchor=customtkinter.CENTER)
        
    vehicle1_map = Desrialize.vehicleDataMap[list(Desrialize.vehicleDataMap.keys())[0]]
    vehicle2_map = Desrialize.vehicleDataMap[list(Desrialize.vehicleDataMap.keys())[1]]
    
    vehicleName = list(Desrialize.vehicleDataMap.keys())
    
    mainParamList = list(Desrialize.vehicleDataMap[list(Desrialize.vehicleDataMap.keys())[0]][mainParam].keys())
    
    
    for param in mainParamList[1:]:
            data['fignum'] = data['fignum']+1
            fig = plt.figure(data['fignum'])
            # plt.title(header_1[index])
            plt.plot(vehicle1_map[mainParam]['Mission_time'], vehicle1_map[mainParam][param], linestyle='dashed')
            plt.plot(vehicle2_map[mainParam]['Mission_time'], vehicle2_map[mainParam][param])
            plt.xlabel('Mission Time')
            plt.ylabel(param)
            plt.legend([vehicleName[0]+"_"+param,vehicleName[1]+"_"+param])
            plt.grid(1)
            storeFigure(fig) 
    plt.show()
    

def compareBin():
    
    if label_file1_url.cget("text") == '' or label_file2_url.cget("text") == '':
        on_error("Please Upload both file")
    else:
        vehicleData_1 = Desrialize.readDeSerializeData(data['URL_1']) 
        vehicleData_2 = Desrialize.readDeSerializeData(data['URL_2'])
       
        width= app.winfo_screenwidth() 
        height= app.winfo_screenheight()
#setting tkinter app size
       
        scores = Toplevel(app) 
        scores.geometry("%dx%d" % (width, height))
        label = Label(scores, text="General Info", font=("Arial",18)).place(relx=0.02,rely=0.01)
        label = Label(scores, text="Data Table", font=("Arial",18)).place(relx=0.45,rely=0.14)
        
        dataList_1 = []
        dataList_2 = []
        
        
        
        for flag in vehicleData_1.vehNavSeqData:
            samList =[
                vehicleData_1.vehNavSeqData[flag].event,
                    round(vehicleData_1.vehNavSeqData[flag].time,2),
                    round(vehicleData_1.vehNavSeqData[flag].altitude,2),
                        round(vehicleData_1.vehNavSeqData[flag].inerVel,2),
                        round(vehicleData_1.vehNavSeqData[flag].fpa * 180.0 / 3.14159265358979323846264338327950288419716939937511,2),
                        round( vehicleData_1.vehNavSeqData[flag].velAzi * 180.0 / 3.14159265358979323846264338327950288419716939937511,2),
                        round(vehicleData_1.vehNavSeqData[flag].mass,2),flag
                    ]
            dataList_1.append(samList)
        for flag in vehicleData_2.vehNavSeqData:
            samList =[
                vehicleData_1.vehNavSeqData[flag].event,
                    round(vehicleData_1.vehNavSeqData[flag].time,2),
                    round(vehicleData_1.vehNavSeqData[flag].altitude,2),
                        round(vehicleData_1.vehNavSeqData[flag].inerVel,2),
                        round(vehicleData_1.vehNavSeqData[flag].fpa * 180.0 / 3.14159265358979323846264338327950288419716939937511,2),
                        round( vehicleData_1.vehNavSeqData[flag].velAzi * 180.0 / 3.14159265358979323846264338327950288419716939937511,2),
                        round(vehicleData_1.vehNavSeqData[flag].mass,2),flag
                    ]
            dataList_2.append(samList)
        
        
        dataList_1.sort(key=lambda e: e[1])
        dataList_2.sort(key=lambda e: e[1])
        
        cols = ('EVENT','VEHICLE_1', 'VEHICLE_2','PARAM')
        vehicleName_1 = vehicleData_1.vehicleName
        vehicleName_2 = vehicleData_2.vehicleName
        
        if vehicleName_1 == vehicleName_2:
            vehicleName_2 = vehicleName_2 +'_2'
            
       
            
        cols_2 = ('COE',vehicleName_1, vehicleName_2)      
        coe1 = vehicleData_1.coe
        coe2 = vehicleData_2.coe
    
        listBox_2 = ttk.Treeview(scores, columns=cols_2, show='headings')
        for col in cols_2:
            listBox_2.heading(col, text=col)
        
        listBox_2.tag_configure('odd',font=("Mono",10,'bold'))
    
        listBox_2.insert("", "end", values=("APOGEE " , round(coe1['APOGEE'],2),round(coe2['APOGEE'],2)),tags='odd')
        listBox_2.insert("", "end", values=("PERIGEE " , round(coe1['PERIGEE'],2),round(coe2['PERIGEE'],2)),tags='odd')
        listBox_2.insert("", "end", values=("INCLINATION " , round(coe1['INCLINATION'],2),round(coe2['INCLINATION'],2)),tags='odd')
        listBox_2.place(relx=0.02, rely=0.05, width=650, height=100)
        # creating tree
        listBox = ttk.Treeview(scores, columns=cols, show='headings')
        listBox.tag_configure('odd', background='#E8E8E8',font=("Mono",10,'bold'))
        listBox.tag_configure('even', background='#DFDFDF')
        # set column headings
        for col in cols:
            listBox.heading(col, text=col)  
        
        # position
        # listBox.grid(row=1, column=0, columnspan=2)
        listBox.place(relx=0.02, rely=0.18, width=1850, height=800)
        for i in range(len(dataList_1)):
            compareFlag = dataList_1[i][-1]
            if compareFlag not in vehicleData_2.vehNavSeqData:
                on_error("Flag Not Found")
            else:
                fpa_1 = vehicleData_1.vehNavSeqData[compareFlag].fpa * DEG_PER_RAD
                fpa_2 = vehicleData_2.vehNavSeqData[compareFlag].fpa * DEG_PER_RAD
                
                velAzi_1 = vehicleData_1.vehNavSeqData[compareFlag].velAzi* DEG_PER_RAD
                velAzi_2 = vehicleData_2.vehNavSeqData[compareFlag].velAzi* DEG_PER_RAD
                
                listBox.insert("", "end", values=(("Event : " + vehicleData_1.vehNavSeqData[compareFlag].event).upper(),vehicleName_1.upper(),vehicleName_2.upper(),'DIFFERENCE(V_1 - V_2)'),tags='odd')
                listBox.insert("", "end", values=("Time", vehicleData_1.vehNavSeqData[compareFlag].time, vehicleData_2.vehNavSeqData[compareFlag].time,
                                                vehicleData_1.vehNavSeqData[compareFlag].time - vehicleData_2.vehNavSeqData[compareFlag].time))
                listBox.insert("", "end", values=("Altitude", vehicleData_1.vehNavSeqData[compareFlag].altitude, vehicleData_2.vehNavSeqData[compareFlag].altitude,
                                                vehicleData_1.vehNavSeqData[compareFlag].altitude - vehicleData_2.vehNavSeqData[compareFlag].altitude))
                listBox.insert("", "end", values=("Inertial Velocity", vehicleData_1.vehNavSeqData[compareFlag].inerVel, vehicleData_2.vehNavSeqData[compareFlag].inerVel,
                                                vehicleData_1.vehNavSeqData[compareFlag].inerVel - vehicleData_2.vehNavSeqData[compareFlag].inerVel))
                listBox.insert("", "end", values=("FPA", fpa_1, fpa_2,
                                                fpa_1- fpa_2))
                listBox.insert("", "end", values=("Velocity Azimuth", velAzi_1, velAzi_2,
                                                velAzi_1 - velAzi_2))
                listBox.insert("", "end", values=("Mass", vehicleData_1.vehNavSeqData[compareFlag].mass, vehicleData_2.vehNavSeqData[compareFlag].mass,
                                                vehicleData_1.vehNavSeqData[compareFlag].mass - vehicleData_2.vehNavSeqData[compareFlag].mass))
            
            
        # for i, (event, time,altitude,inerVel,fpa,velAzi,mass) in enumerate(dataList, start=1):
        #    listBox.insert("", "end", values=(event, time, altitude,inerVel,fpa,velAzi,mass))
        
        # scrollbar = ttk.Scrollbar(scores, orient=tk.VERTICAL, command=listBox.yview)
        # listBox.configure(yscroll=scrollbar.set)
        # scrollbar.place(relx=0.1, rely=0.2)
        
def plotFromBin(mainParam,subParamX,subParamY):
    binName = label_file_bin_url.cget("text")[:len(label_file_bin_url.cget("text")) - 4]
    button_bin_plot_close.place(relx=0.5, rely=0.8, anchor=customtkinter.CENTER)
    data['fignum'] = data['fignum'] + 1
    fig = plt.figure(data['fignum'])
    plt.grid(1)
    plt.plot(Desrialize.vehicleDataMap[binName][mainParam][subParamX],Desrialize.vehicleDataMap[binName][mainParam][subParamY])
    plt.xlabel(subParamX)
    plt.ylabel(subParamY)
    storeFigure(fig)
    plt.show()
    
    
def GUI():
        global app
        customtkinter.set_appearance_mode("dark")  # Modes: system (default), light, dark
        customtkinter.set_default_color_theme("blue")  # Themes: blue (default), dark-blue, green
        app = customtkinter.CTk()  # create CTk window like  Tk window
        app.geometry("500x300")
        app.title("ASTRA PLOT")
        app.eval('tk::PlaceWindow . center')
        app.resizable(False,False)
        global label_file1_url  
        global label_file2_url  
        global optionmenu_y 
        global optionmenu_var_y
        global button2
        global optionmenu_x
        global optionmenu_var_x
        global button_upload_2
        global button_plot_compare
        global label_file2
        global label_file1
        global button_plot_all
        global button_plot
        global button_plot_event_compare
        global radio_var
        global tabview
        global label_gen_file_url
        global label_gen_file_dir
        global label_file_bin_url
        global optionmenu_bin_veh_param
        global optionmenu_bin_x
        global optionmenu_bin_y
        global button_fetch_all_bin
        global button_plot_bin
        global optionmenu_var_bin_x
        global optionmenu_var_bin_y
        global button_bin_plot_close
        global button_plot_all_bin
        global label_file_bin_url_2
        global check_var
        global button_bin_upload_2
        global label_gen2
        global label_gen1
        global button_plot_bin_compare
        global formatRadio
        global diffcheckbox
        global diffcheck_var
        global scrollable_frame
        global button_multiplot
        
        tabview = customtkinter.CTkTabview(master=app,width = 490,height = 300)
        tabview.place(relx=0.01, rely=0.001,)

        tabview.add("PLOT")  # add tab at the end
        tabview.add("EXPORT")  
        tabview.add("BINARY PLOT")  
        tabview.add("MULTI PLOT")  
       
        showSaveButton(tabview.tab("PLOT"))
        showSaveButton(tabview.tab("EXPORT"))
        showSaveButton(tabview.tab("BINARY PLOT"))
        showSaveButton(tabview.tab("MULTI PLOT"))
       
        tabview.set("PLOT")  # set currently visible tab
        
        button2 = customtkinter.CTkButton(master=tabview.tab("PLOT"), text="Close Plots", command=closePlot,width = 60,fg_color = "#C41E3A",hover_color = "#EE4B2B")
        
        
        # !--------------GENERATE------------------------------------
        generate_button = customtkinter.CTkButton(master=tabview.tab("EXPORT"), text="Generate", command=generateCSV,width = 60,fg_color = "green",hover_color = "#228B22")

        generate_button.place(relx=0.88, rely=0.88, anchor=customtkinter.CENTER)
        
        label_gen = customtkinter.CTkLabel(tabview.tab("EXPORT"), text="Bin File : ", fg_color="transparent")
        
        label_gen.place(relx=0.05, rely=0.05)
        
        label_gen_file_url = customtkinter.CTkLabel(tabview.tab("EXPORT"), text="", fg_color="transparent")
        
        label_gen_file_url.place(relx=0.16, rely=0.05)
        
        # ---------------Out Dir-----------------
        label_dir_gen = customtkinter.CTkLabel(tabview.tab("EXPORT"), text="Path : ", fg_color="transparent")
        
        label_dir_gen.place(relx=0.05, rely=0.2)
        
        label_gen_file_dir = customtkinter.CTkLabel(tabview.tab("EXPORT"), text="", fg_color="transparent")
        
        label_gen_file_dir.place(relx=0.16, rely=0.2)
        
        button_gen_upload_dir = customtkinter.CTkButton(tabview.tab("EXPORT"), text="Browse", command=browseFile_gen_out ,width = 60,height = 20)
        button_gen_upload_dir.place(relx=0.8,rely = 0.2)
        
        # --------------------------------------
        #-----------------Format Selection------------------
        
        formatRadio = IntVar(value=0)
        label_format = customtkinter.CTkLabel(tabview.tab("EXPORT"), text="Format : ", fg_color="transparent")
        
        label_format.place(relx=0.05, rely=0.35)
        
        radiobutton_1 = customtkinter.CTkRadioButton(tabview.tab("EXPORT"), text="CSV (comma-separated values)",
                                              variable= formatRadio, value=1)
        radiobutton_2 = customtkinter.CTkRadioButton(tabview.tab("EXPORT"), text="MAT (MAT-file object)",
                                                     variable= formatRadio, value=2)

        radiobutton_1.place(relx=0.15,rely = 0.5)
        radiobutton_2.place(relx=0.15,rely = 0.65)
        #--------------------------------------------------
        
        button_gen_upload = customtkinter.CTkButton(tabview.tab("EXPORT"), text="Upload", command=lambda:browseFiles_gen(label_gen_file_url) ,width = 60,height = 20)
        button_gen_upload.place(relx=0.8,rely = .05)
        
        # !--------------------------------------------------------------
        
        # !--------------------------BIN PLOT---------------------------

        veh_param_list = ['Dynamics','AeroDynamics','Polar','Body_Rates','Body_Angle','Euler_Angle','Lat_Long_Alt','IIP','Quaternion','States','Sequence']
        
        label_gen1 = customtkinter.CTkLabel(tabview.tab("BINARY PLOT"), text="Bin File : ", fg_color="transparent")
        label_gen1.place(relx=0.05, rely=0.05)
        
        label_gen2 = customtkinter.CTkLabel(tabview.tab("BINARY PLOT"), text="Bin File : ", fg_color="transparent")
        
        
        label_file_bin_url = customtkinter.CTkLabel(tabview.tab("BINARY PLOT"), text="", fg_color="transparent")
        
        label_file_bin_url.place(relx=0.16, rely=0.05)
        
        label_file_bin_url_2 = customtkinter.CTkLabel(tabview.tab("BINARY PLOT"), text="", fg_color="transparent")
        
        label_file_bin_url_2.place(relx=0.16, rely=0.2)
        
        button_bin_upload = customtkinter.CTkButton(tabview.tab("BINARY PLOT"), text="Upload", command=lambda:browseFiles_gen(label_file_bin_url,True) ,width = 60,height = 20)
        button_bin_upload.place(relx=0.8,rely = .05)
        
        button_bin_upload_2 = customtkinter.CTkButton(tabview.tab("BINARY PLOT"), text="Upload", command=lambda:browseFiles_gen(label_file_bin_url_2,True) ,width = 60,height = 20)
        
        
        optionmenu_var_veh_param = customtkinter.StringVar(value="Parameters")
        
        button_plot_bin_compare = customtkinter.CTkButton(master=tabview.tab("BINARY PLOT"), text="Compare", command=lambda:compareBinParam(optionmenu_var_veh_param.get()),width = 60,fg_color = "green",hover_color = "#228B22")

        check_var = customtkinter.StringVar(value="off")
        checkbox = customtkinter.CTkCheckBox(tabview.tab("BINARY PLOT"), text="Compare Binary", command=compareBinEvent,
                                     variable=check_var, onvalue="on", offvalue="off")
        checkbox.place(relx=0.05, rely=0.8)
        optionmenu_bin_veh_param = customtkinter.CTkOptionMenu(tabview.tab("BINARY PLOT"),values=veh_param_list,command=generateSubParam,
                                         variable=optionmenu_var_veh_param)


        optionmenu_var_bin_x = customtkinter.StringVar(value="")
        optionmenu_var_bin_y = customtkinter.StringVar(value="")
        
        optionmenu_bin_x = customtkinter.CTkOptionMenu(tabview.tab("BINARY PLOT"),values=[],
                                         variable=optionmenu_var_bin_x)
        
        optionmenu_bin_y = customtkinter.CTkOptionMenu(tabview.tab("BINARY PLOT"),values=[],
                                         variable=optionmenu_var_bin_y)
        
        button_plot_bin = customtkinter.CTkButton(master=tabview.tab("BINARY PLOT"), text="Plot x-y", command=lambda:plotFromBin(optionmenu_bin_veh_param.get(),optionmenu_var_bin_x.get(),optionmenu_var_bin_y.get()),width = 60,fg_color = "green",hover_color = "#228B22")
        
        button_plot_all_bin = customtkinter.CTkButton(master=tabview.tab("BINARY PLOT"), text="Plot all", command=lambda:plotAllBin(optionmenu_var_veh_param.get(),optionmenu_bin_x.get()),width = 60,fg_color = "green",hover_color = "#228B22")
       
        button_fetch_all_bin = customtkinter.CTkButton(master=tabview.tab("BINARY PLOT"), text="Fetch Data", command=lambda:fetchData(data["BIN_URL_1"]),width = 60,fg_color = "green",hover_color = "#228B22")
        
        button_bin_plot_close = customtkinter.CTkButton(master=tabview.tab("BINARY PLOT"), text="Close Plots", command=closePlot,width = 60,fg_color = "#C41E3A",hover_color = "#EE4B2B")
        # !-------------------------------------------------------------
        optionmenu_var_x = customtkinter.StringVar(value="X-coordinate")
        optionmenu_var_y = customtkinter.StringVar(value="Y-coordinate")
        
        optionmenu_x = customtkinter.CTkOptionMenu(tabview.tab("PLOT"),values=[],
                                         variable=optionmenu_var_x)
        optionmenu_x.place(relx=0.05, rely=0.3)
        
        optionmenu_y = customtkinter.CTkOptionMenu(tabview.tab("PLOT"),values=[],
                                         variable=optionmenu_var_y)
        optionmenu_y.place(relx=0.5, rely=0.3)
        
        label_file1 = customtkinter.CTkLabel(tabview.tab("PLOT"), text="File : ", fg_color="transparent")
        
        label_file1.place(relx=0.05, rely=0.05)
        
        label_file2 = customtkinter.CTkLabel(tabview.tab("PLOT"), text="File 2 : ", fg_color="transparent")
        
        
        
        label_file1_url = customtkinter.CTkLabel(tabview.tab("PLOT"), text="", fg_color="transparent")
        
        label_file1_url.place(relx=0.15, rely=0.05)
        
        label_file2_url = customtkinter.CTkLabel(tabview.tab("PLOT"), text="", fg_color="transparent")
        
        
        
        button_upload = customtkinter.CTkButton(tabview.tab("PLOT"), text="Upload", command=browseFiles ,width = 60,height = 20)
        button_upload.place(relx=0.8,rely = .05)
        
        button_upload_2 = customtkinter.CTkButton(tabview.tab("PLOT"), text="Upload", command=browseFiles_2 ,width = 60,height = 20)
        

        button_plot = customtkinter.CTkButton(master=tabview.tab("PLOT"), text="Plot x-y", command=lambda: Plot(optionmenu_var_x.get(),optionmenu_var_y.get()),width = 60,fg_color = "green",hover_color = "#228B22")
        button_plot.place(relx=0.88, rely=0.88, anchor=customtkinter.CENTER)
        
        button_plot_all = customtkinter.CTkButton(master=tabview.tab("PLOT"), text="Plot all", command=lambda:plotAll(optionmenu_var_x.get()),width = 60,fg_color = "green",hover_color = "#228B22")
        button_plot_all.place(relx=0.7, rely=0.88, anchor=customtkinter.CENTER)
        
        button_plot_compare = customtkinter.CTkButton(master=tabview.tab("PLOT"), text="Plot", command=compare,width = 60,fg_color = "green",hover_color = "#228B22")
        
        button_plot_event_compare = customtkinter.CTkButton(master=tabview.tab("PLOT"), text="Compare", command=compareBin,width = 60,fg_color = "green",hover_color = "#228B22")
    
    

        radio_var = IntVar(value=3)
        radiobutton_1 = customtkinter.CTkRadioButton(tabview.tab("PLOT"), text="Compare CSV",
                                             command=lambda:showCompare(radio_var.get()), variable= radio_var, value=1)
        radiobutton_2 = customtkinter.CTkRadioButton(tabview.tab("PLOT"), text="Compare Events",
                                             command=lambda:showCompare(radio_var.get()), variable= radio_var, value=2)
        radiobutton_3 = customtkinter.CTkRadioButton(tabview.tab("PLOT"), text="Plot CSV",
                                             command=lambda:showCompare(radio_var.get()), variable= radio_var, value=3)
        
        radiobutton_1.place(relx=0.05, rely=0.86)
        radiobutton_2.place(relx=0.05, rely=0.72)
        radiobutton_3.place(relx=0.05, rely=0.58)
        
        
        diffcheck_var = customtkinter.StringVar(value="off")



        diffcheckbox = customtkinter.CTkCheckBox(tabview.tab("PLOT"), text="Difference Plot",
                                     variable=diffcheck_var, onvalue="on", offvalue="off")
        
        
       #! Multiplots widgets
       
        label_file1 = customtkinter.CTkLabel(tabview.tab("MULTI PLOT"), text="File : ", fg_color="transparent")
        
        label_file1.place(relx=0.05, rely=0.05)
        
        label_file1_url = customtkinter.CTkLabel(tabview.tab("MULTI PLOT"), text="", fg_color="transparent")
        
        label_file1_url.place(relx=0.15, rely=0.05)
        
        button_upload = customtkinter.CTkButton(tabview.tab("MULTI PLOT"), text="Upload", command=multiPlotBrowseFile ,width = 60,height = 20)
        button_upload.place(relx=0.8,rely = .05)

        optionmenu_x = customtkinter.CTkOptionMenu(tabview.tab("MULTI PLOT"),values=[],
                                         variable=optionmenu_var_x)
        
        scrollable_frame = customtkinter.CTkScrollableFrame(tabview.tab("MULTI PLOT"), width=200, height=20,corner_radius=0)
        
        button_multiplot = customtkinter.CTkButton(master=tabview.tab("MULTI PLOT"), text="Plot", command=multiPlot,width = 60,fg_color = "green",hover_color = "#228B22")
        
        
        label = customtkinter.CTkLabel(scrollable_frame,text="Select Y-coordinates")
        label.pack()
        
        app.mainloop()
        

    
def closePlot():
    plt.close('all')
    button2.place_forget()
    button_bin_plot_close.place_forget()
if __name__ == "__main__":
    GUI()