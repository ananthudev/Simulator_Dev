### **VEHICLE DATA STRUCTURE**
<p>Vehicle Data is stored in <b>Vehicle class</b> which contains dictionary of vehicle parameters, then the vehicle object is stored in a <b>list</b>(list is used for storing multiple vehicle data if a single mission contain more than one vehicle)</p>

<p>Following are the main dictionary <b>key name</b> ,  and its element dictionary keys which is stored inside the vehicle object</p>

 1. Polar :
     <em>Contains Dictionary of Polar Co-ordinates</em></br>
     >- Altitude - Returns list </br>
     >- Inertial Velocity -  Returns list</br>
     >- Flight Path Angle -  Returns list </br>
     >- Velocity Azimuth -  Returns list </br>
     >- Mission_Time -  Returns list </br>
 2. Rates : <em>Contains dictionary of Body rates</em><br>
     >- pitch -  Returns list</br> 
     >- yaw -  Returns list </br>  
     >- roll -  Returns list </br>
    
3. Angles: <em>Contains dictionary of Body Angles</em><br>
     >- Theta -  Returns list</br>
     >- Phi -  Returns list </br>
     >- Psi -  Returns list </br>
4. States : <em>Contains dictionary of Vehicle states</em><br>
     >- X -  Returns list</br>
     >- Y -  Returns list </br>
     >- Z -  Returns list </br>
     >- U -  Returns list</br>
     >- V -  Returns list </br>
     >- W -  Returns list </br>
5. Co_Ordinates: <em>Contains dictionary of Vehicle co-ordinates</em><br>
     >- Latitude -  Returns list</br>
     >- Longitude -  Returns list </br>
     >- Altitude -  Returns list </br>
6. Dynamics: <em>Contains dictionary of Vehicle Dynamic Properties</em></br>
    >- Mass -  Returns list</br>
     >- Thrust -  Returns list </br>
     >- Thrust_acc -  Returns list </br>
     >- Gravity_acc -  Returns list</br>
     >- Total_acc -  Returns list </br>
     >- Phase_Time -  Returns list </br>
 7. atmos_prop: <em>Contains dictionary of Atmospheric Properties</em></br>
    >- Zonal_wind -  Returns list</br>
     >- Meridonal_wind -  Returns list </br>
     >- Pressure -  Returns list </br>
     >- Temprature -  Returns list</br>
     >- Density -  Returns list </br>
     >- Altitude -  Returns list </br>
8. Sequence: <em>Contains dictionary of Vehicle Sequence</em></br>
9. Phase_time<em>Contains list of stage phase Time</em></br>
 10. Stage_counter</br>
 11. Final_COE<em>Contains dictionary of Classical Orbital Elements</em></br>
 12. IIP</br>

#### **<u>Example Code</u>**




```python
import SARAS

saras = SARAS.Saras() # creating simulator instantce

veh_map = saras.Initialize(filePath[0]) #calling simulator with file path containg vehicle configuration returns dictionary contain vehicle out data

 vehicle_dict = veh_map[0] #returns dictionary inside vehicle class object

 polar_iner_vel = vehicle_dict['Polar']['Inertial Velocity'] # returns list contain inertial velocity values

 print(polar_iner_vel)
```

