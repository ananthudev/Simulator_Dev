import tkinter as tk
import os
import customtkinter
from tkinter import messagebox
from tkinter import  filedialog

import subprocess
from os import system as cmd

root = customtkinter.CTk()
terminal = tk.Text(root, height=11, width=77)

def update():
    global filePath
    global mylabel
    file = filedialog.askopenfile(mode='r', filetypes=[('JSON files', '*.jsonc')])
    if(file):
        mylabel = tk.Entry(root,width=50)
        mylabel.configure(background="#28282B",fg="white")
        mylabel.insert(0,file.name)
        mylabel.place(x =100,y = 60)
        filePath = file.name
        
def main_window():
        if(filePath != ""):
            terminal.configure(state="normal")
            terminal.delete("1.0","end")
            command = "./ASTRA " + filePath # Get the command from the entry widget
            output = subprocess.check_output(command, shell=True)
            terminal.insert(tk.END, output.decode())  # Insert the output in the terminal widget
            terminal.configure(state="disabled")
            

width_of_window = 622
height_of_window = 405
screen_width = root.winfo_screenwidth()
screen_height = root.winfo_screenheight()
x_coordinate = (screen_width/2)-(width_of_window/2)
y_coordinate = (screen_height/2)-(height_of_window/2)
root.geometry("%dx%d+%d+%d" %(width_of_window,height_of_window,x_coordinate,y_coordinate))

mylabel = tk.Entry(root,width=35)
mylabel.configure(background="#28282B",bg="white")
mylabel2 = customtkinter.CTkLabel(root, text="Vehicele Configuration(json) : ", fg_color="transparent")
mylabel2.place(x=10,y=30)
mylabel.place(x =100,y = 60)

bt1 = customtkinter.CTkButton(master=root,text="UPLOAD",command=lambda:update(),width = 0.5)
bt2 = customtkinter.CTkButton(master=root,text="SIMULATE",command=lambda:main_window(),width = 0.5,fg_color = "green")

bt1.place(x = 230,y=100)
bt2.place(x = 310,y=100)
mylabel.place(x =100,y = 60)

root.title("ASTRA")
#root.resizable(False,False)

terminal = tk.Text(root, height=14, width=77,bg="#28282B",fg="white",borderwidth=0)
terminal.configure(state="disabled")
terminal.place(x=0,y=150)




root.mainloop()