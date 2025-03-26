const output = document.getElementById("terminal-output");

const terminalData = [
    "Vehicle Name : Garuda 1",
    "Planet : EARTH",
    "Atmospheric Model : atmos POST",
    "Gravity Model : j2",
    "Solver : RK4",
    "StepSize : 0.1",
    "Number of Stages : 2",
    "Stage Info",
    "Stage Name : Stage 1",
    "Number of Motors : 1",
    "Motor Info",
    "Motor Name : G M1",
    "Type : solid",
    "Number Of Nozzles : 1",
    "Stage Info",
    "Stage Name : Stage 2",
    "Number of Motors : 1",
    "Motor Info",
    "Motor Name : G M2",
    "Type : solid",
    "Number Of Nozzles : 1",
    "• IIP Initiated.",
    "• Stage 1 Separated, Calculating Velocity Loss...",
    "Delta Velocity Needed : 2717.76 (m/s)",
    "Delta Velocity losses : 1354.28 (m/s)",
    "Total Delta Velocity : 4072.04 (m/s)",
    "Stage 2 Separated, Calculating Velocity Loss...",
    "Delta Velocity Needed : 2990.47 (m/s)",
    "Delta Velocity losses : 2480.94 (m/s)",
    "Total Delta Velocity : 5471.41 (m/s)",
    "Simulation Complete.",
    "• Checking for Anomalies...",
    "[ASTRA] Burn Duration of Motor G M1 is Greater than stage (Stage 1) duration!",
    "-Engine Burn Duration: 143.9 (s)",
    "-Stage Burn Duration : 143.3 (s)",
    "• Anomaly Detected.",
    "• Extracting Sub Module Buffers...",
    "• Extraction Complete",
    "• Serialized to Garuda_1.bin",
    "• Writing Vehicle Data.",
    "Server Sync Success.",
    "• Vehicle Registry Deleted.",
    "• ReadInput Terminated",
    "• Radar Tracking Terminated",
    "• System Log Terminated",
    "• Clean up complete",
    "• Core Destroyed",
    "• Elapsed time: [00:00:09.697]"
];

let index = 0;
function printTerminalData() {
    if (index < terminalData.length) {
        output.innerHTML += terminalData[index] + "\n";
        index++;
        setTimeout(printTerminalData, 500);
    } else {
        setTimeout(() => {
            window.open("plot.html", "_blank", "width=800,height=600");
        }, 3000);
    }
}
printTerminalData();
