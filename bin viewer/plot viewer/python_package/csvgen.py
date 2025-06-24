import csv
import os
import pickle
#import pickle

#bin_dats is list
def generateCSV(bin_data)-> None:
    
    # if type(bin_data)  != dict:
    #     bin_data = pickle.load(bin_data)
    #dbfile = open("/home/user/Pictures/SARAS_ASTRA_FINAL(29-12-2022 4 17)/SARAS_ASTRA_FINAL/binary_output/SSPO", "rb")

    if not os.path.exists('csv'):
        os.makedirs('csv')
        
    param = ['Polar','Rates','Angles','States','Co_Ordinates',
            'Aerodynamics','Dynamics','atmos_prop']
    flags = ['Sequence','Steering']
    
    
    
    


    #db = pickle.load(bin_data)

    for vehicle in bin_data:
        vehicle_name = vehicle.missionData['Vehicle_Name']
        for entry in param:
            fields = vehicle.missionData[entry].keys()
            val = vehicle.missionData[entry].values()
            rows = zip()
            for col in val:
                rows = zip(*zip(*rows), col)
                
            if(len(val)!=0): 
                with open("csv/"+vehicle_name+"_"+entry+".csv", "w") as f:
                    writer = csv.writer(f)
                    writer.writerow(fields)
                    for row in rows:
                        writer.writerow(row)
                    
        with open("csv/Quaternion.csv", "w") as f:
            quateField = ['Q1','Q2','Q3','Q4']
            
            writer = csv.writer(f)
            writer.writerow(quateField)
            writer.writerows(vehicle.missionData['Quaternion'])
            
        for flg in flags:
            Lis = []
            flgField = ['Flag ID','Mission Time','Event']
            for key in  vehicle.missionData[flg].keys():
                vehicle.missionData[flg][key].insert(0,key)
                Lis.append(vehicle.missionData[flg][key])
        
            with open("csv/"+vehicle_name+"_"+flg+".csv", "w") as f:
                writer = csv.writer(f)
                writer.writerow(flgField)
                writer.writerows(Lis)
            
          
    print("\n[\u2713] CSV file Generated Sucessfully")
    path = "csv/"
    dir_list = os.listdir(path)
    print("\u001b[32;1m\u2022\u001b[0m Following files Generated in  '", path, "' :")
    for file in dir_list:
        print("|_",file)



       







