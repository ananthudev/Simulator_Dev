from pyatmos import jb2008
import numpy as np

swfile =['/home/user/src/sw-data/SOLFSMY.TXT',
         '/home/user/src/sw-data/DTCFILE.TXT']

sw_data1 = np.loadtxt(swfile[0],usecols=range(2,11))
sw_data2 = np.loadtxt(swfile[1],usecols=range(3,27),dtype=int)

swdata = (sw_data1,sw_data2)

def JB2008(date,alt,lat,lon,flag):
    
    #if(flag):
    # swfile = swfile =['/home/user/src/sw-data/SOLFSMY.TXT',
    #      '/home/user/src/sw-data/DTCFILE.TXT']
    # swdata = read_sw_jb2008(swfile)

    #t = '2014-07-22 22:18:45' # time(UTC) 
    t = date
    #lat,lon,alt = 25,102,600 # latitude, longitude in [degree], and altitude in [km]

    jb08 = jb2008(t,(lat,lon,alt),swdata)

    
    return [jb08.rho,jb08.T]

if __name__ == '__main__':
    pass