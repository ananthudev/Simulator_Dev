
from tkinter import *
from PIL import ImageTk,Image
import tkinter.font as font
from tkinter.filedialog import askopenfile
from tkinter import  filedialog
from tkinter import messagebox
import subprocess


#/home/user/Pictures/SARAS_ASTRA_FINAL(29-12-2022 4 17)/SARAS_ASTRA_FINAL/Resource/Mission_Data (copy).json


w=Tk()

#Using piece of code from old splash screen
width_of_window = 427
height_of_window = 250
screen_width = w.winfo_screenwidth()
screen_height = w.winfo_screenheight()
x_coordinate = (screen_width/2)-(width_of_window/2)
y_coordinate = (screen_height/2)-(height_of_window/2)
w.geometry("%dx%d+%d+%d" %(width_of_window,height_of_window,x_coordinate,y_coordinate))
#w.configure(bg='#ED1B76')
w.overrideredirect(1) #for hiding titlebar

Frame(w, width=427, height=250, bg='#272727').place(x=0,y=0)
label1=Label(w, text='ASTRA', fg='white', bg='#272727') 
label3=Label(w, text='AEROSPACE TRAJECTORY OPTIMIZER', fg='white', bg='#272727') 
label1.configure(font=("Game Of Squids", 24, "bold")) 
label3.configure(font=("Terminal", 7, "bold")) 
label1.place(x=128,y=90)
label3.place(x=135,y=130)

label2=Label(w, text='THESPACELABS.COM', fg='white', bg='#272727')
label2.configure(font=("Mono", 8))
label2.place(x=10,y=220)


def sub_window():
        w.destroy()
        widthMain = 600
        heightMain = 150
        xCord = (screen_width/2)-(widthMain/2)
        yCord = (screen_height/2)-(heightMain/2)
        
        subroot = Tk()
        subroot.resizable(0,0)
                
        subroot.title("MISSION CONFIGURATION")
        subroot.geometry("%dx%d+%d+%d" %(widthMain,heightMain,xCord,yCord))
        subroot.configure(background="#28282B")
        button_font = font.Font(family='Helvitica', size=6)
        mylabel = Entry(subroot,width=50)
        mylabel.configure(background="#28282B",bg="white")

        mylabel2 = Label(subroot,text="Upload Vehicle Configuration :",
                 bg="#28282B",fg="white",font=font.Font(family='Terminal'))
        mylabel2.place(x=10,y=30)
        
        
        def update():
                global filePath
                global mylabel
                file = filedialog.askopenfile(mode='r', filetypes=[('JSON files', '*.jsonc')])
                if(file):
                        mylabel = Entry(subroot,width=50)
                        mylabel.configure(background="#28282B",fg="white")
                        mylabel.insert(0,file.name)
                        mylabel.place(x =100,y = 60)
                        filePath = file.name
        
        def main_window():
                if(filePath != ""):
                        subroot.destroy()
                        


                        #saras.Initialize(filePath)
                        subprocess.run(["echo", "Hello world"])
                        
                        widthMain = 900
                        heightMain = 600
                        xCord = (screen_width/2)-(widthMain/2)
                        yCord = (screen_height/2)-(heightMain/2)
                        
                        
                        root = Tk()
                        root.title("MISSION ANALYSIS")
                        root.configure(background="#28282B")
                        root.geometry("%dx%d+%d+%d" %(widthMain,heightMain,xCord,yCord))
                        root.resizable(0,0)
                        
                        my_image = ImageTk.PhotoImage(Image.open("/home/user/Pictures/COREv3.3/Outputs/Graph/Dynamic Pressure.png").resize((650, 400)))
                        my_imag1 = ImageTk.PhotoImage(Image.open("/home/user/Pictures/COREv3.3/Outputs/Graph/Altitude.png").resize((650, 400)))
                        my_image2 = ImageTk.PhotoImage(Image.open("/home/user/Pictures/COREv3.3/Outputs/Graph/Mass.png").resize((650, 400)))
                        my_image3 = ImageTk.PhotoImage(Image.open("/home/user/Pictures/COREv3.3/Outputs/Graph/Yaw.png").resize((650, 400)))
                        image_list = [my_imag1,my_image2 ,
                        my_image3,
                        my_image]

                        
                        def imageSelector(imageNumber,my_label):
                                
                                
                                my_label.grid_forget()
                                my_label = Label(frame2,image=image_list[imageNumber])
                                my_label.grid(row=0,column=0,padx=10,pady=10)

                        frame1 = LabelFrame(root,text="Parameters",padx=10,pady=10,height=100,width=500,font=("Sans"),fg="white")
                        #frame1.grid(row=0,column=0,padx=10,pady=5)
                        frame1.configure(background="#28282B")
                        
                        frame1.place(x=10,y=10)

                        frame2 = LabelFrame(root,text="Output",height=500,width=500,font=("Sans"),bg="#28282B",fg="white")
                        #frame2.grid(row=0,column=1,padx=10,pady=5)
                        frame2.place(x=200,y=10)

                        button_font = font.Font(family='Helvitica', size=7)
                        my_label = Label(frame2,image=image_list[0])

                        my_label.grid(row=0,column=0,padx=10,pady=10)

                        alt = Button(frame1,text="ALTITUDE",bg='#45b592',fg='#ffffff',bd=0,font=button_font,height=2,width=15,command=lambda:imageSelector(0,my_label))
                        fpa = Button(frame1,text="FPA",bg='#45b592',fg='#ffffff',bd=0,font=button_font,height=2,width=15,command=lambda:imageSelector(1,my_label))
                        iv = Button(frame1,text="IV",bg='#45b592',fg='#ffffff',bd=0,font=button_font,height=2,width=15,command=lambda:imageSelector(2,my_label))
                        va = Button(frame1,text="VA",bg='#45b592',fg='#ffffff',bd=0,font=button_font,height=2,width=15,command=lambda:imageSelector(3,my_label))
                        param1 = Button(frame1,text="Param 1",bg='#45b592',fg='#ffffff',bd=0,font=button_font,height=2,width=15,command=lambda:imageSelector(3,my_label))
                        param2 = Button(frame1,text="Param 2",bg='#45b592',fg='#ffffff',bd=0,font=button_font,height=2,width=15,command=lambda:imageSelector(3,my_label))
                        param3 = Button(frame1,text="Param 3",bg='#45b592',fg='#ffffff',bd=0,font=button_font,height=2,width=15,command=lambda:imageSelector(3,my_label))
                        param4 = Button(frame1,text="Param 4",bg='#45b592',fg='#ffffff',bd=0,font=button_font,height=2,width=15,command=lambda:imageSelector(3,my_label))
                        param5 = Button(frame1,text="Param 5",bg='#45b592',fg='#ffffff',bd=0,font=button_font,height=2,width=15,command=lambda:imageSelector(3,my_label))
                        
                        exit = Button(root,text="Exit",bg='#D10000',fg='#ffffff',bd=0,font=font.Font(family='Mono', size=6),height=2,width=15,command=root.quit)
                        back = Button(root,text="Back",bg='#1863D6',fg='#ffffff',bd=0,font=font.Font(family='Mono', size=6),height=2,width=15)
                        
                        exit.place(x=750,y=550)
                        back.place(x=630,y=550)
                        
                        alt.grid(column=0,row=0,pady=2)
                        fpa.grid(column=0,row=1,pady=2)
                        iv.grid(column=0,row=2,pady=2)
                        va.grid(column=0,row=3,pady=2)
                        param1.grid(column=0,row=4,pady=2)
                        param2.grid(column=0,row=5,pady=2)
                        param3.grid(column=0,row=6,pady=2)
                        param4.grid(column=0,row=7,pady=2)
                        param5.grid(column=0,row=8,pady=2)
                else:
                        messagebox.showerror("File Path is empty")
                

               



                
                
        bt1 = Button(subroot,text="UPLOAD",bg='#1863D6',fg='#ffffff',bd=0,font=font.Font(family='Helvitica',size=6),height=2,width=10,command=lambda:update())
        bt2 = Button(subroot,text="SIMULATE",bg='#007500',fg='#ffffff',bd=0,font=button_font,height=2,width=10,command=lambda:main_window())



        bt1.place(x = 350,y=90)
        bt2.place(x = 430,y=90)
        mylabel.place(x =100,y = 60)




w.after(1000,sub_window)





mainloop()
