import pandas as pd
import matplotlib.pyplot as plt


def Repeat(x):
    _size = len(x)
    repeated = []
    for i in range(_size):
        k = i + 1
        for j in range(k, _size):
            if x[i] == x[j] and x[i] not in repeated:
                repeated.append(x[i])
    return repeated



def plotCallout(data):
    plt.style.use("dark_background")

    for param in ['text.color', 'axes.labelcolor', 'xtick.color', 'ytick.color']:
        plt.rcParams[param] = '0.9'  # very light grey

    for param in ['figure.facecolor', 'axes.facecolor', 'savefig.facecolor']:
        plt.rcParams[param] = '#212946'  # bluish dark grey

    colors = [
        '#08F7FE',  # teal/cyan
        '#FE53BB',  # pink
        '#F5D300',  # yellow
        '#00ff41',  # matrix green
    ]

    figNum = 1
    
    for key in data:
        legend = key
        time = data[key][0]
        msg = data[key][1]
      
        
        df = pd.DataFrame({legend: [i for i in range(int(max(time)+1))]})

        fig, ax = plt.subplots()

        df.plot(color=colors, ax=ax)



        ax.grid(color='#2A3459')
        ax.legend(loc = 'upper left')
        dupEvent = Repeat(time)

        redColor = '#E34234'
        greenColor = '#50C878'
        mainColor = greenColor

        posValy = (10 * max(time))/100
        posValx = (2.5 * max(time))/100

        for val in dupEvent:
            xPos = 0
            yPos = 0
            for i in range(len(time)):
                if time[i] == val:
                    if 'sep' in msg[i] or 'ter' in msg[i]:
                        mainColor = redColor
                    else:
                        mainColor = greenColor
                    
                    xPos = time[i] + posValx
                    yPos =  yPos + posValy
                    
                    
                    ax.annotate(
                    msg[i] + "\nMission Time : " + str(time[i]),
                    xy=(time[i],time[i]), xycoords='data',
                    xytext=(xPos, yPos), textcoords='data',
                    bbox=dict(boxstyle="round", facecolor=mainColor),
                    arrowprops=dict(arrowstyle="->",
                                    connectionstyle="angle,angleA=0,angleB=90,rad=10"),
                    color='black',)   


        for i in range(len(msg)):
            if 'sep' in msg[i] or 'ter' in msg[i]:
                mainColor = redColor
            else:
                mainColor = greenColor
            
            if time[i] not in dupEvent:
                if i % 2 == 0:
                    ax.annotate(
                        msg[i] + "\nMission Time : " +str(time[i]),
                        xy=(time[i],time[i]), xycoords='data',
                        xytext=(time[i],time[i]+ posValy), textcoords='data',
                        bbox=dict(boxstyle="round", fc=mainColor),
                        arrowprops=dict(arrowstyle="->",
                                        connectionstyle="angle,angleA=0,angleB=90,rad=10"),color = 'black')
                else:
                    
                    ax.annotate(
                    msg[i] + "\nMission Time : " +str(time[i]),
                    xy=(time[i],time[i]), xycoords='data',
                    xytext=(time[i],time[i]-  posValy), textcoords='data',
                    bbox=dict(boxstyle="round", fc=mainColor),
                    arrowprops=dict(arrowstyle="->",
                                    connectionstyle="angle,angleA=0,angleB=90,rad=10"),color = 'black')  

        ax.scatter(time, time,color = '#04d9ff', marker='o', label='Annotation Marker',s=22) 
        plt.figure(figNum)   
        plt.xlabel('Mission Time(s)')  
        plt.ylabel('Mission Time(s)')
        figNum = figNum + 1
    plt.show()
    
    plt.style.use('ggplot') 


    
    