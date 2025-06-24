import pandas as pd

df=pd.read_csv('/home/user/Pictures/CORE/Garuda_Base_refer/Garuda_Base_Polar.csv')

header = list(df.keys())

for colName in header:
    print(colName)
    print('\tMax : ',df[colName].max())
    print('\tMin : ',df[colName].min())




