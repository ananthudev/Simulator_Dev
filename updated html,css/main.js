const { app, BrowserWindow } = require("electron");
const path = require("path");

let mainWindow;

app.whenReady().then(() => {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 700,
        webPreferences: {
            nodeIntegration: true, // Allow Node.js in frontend
            contextIsolation: false
        }
    });

    // Load the HTML file into the window
    mainWindow.loadFile(path.join(__dirname, "/mission.html"));

    mainWindow.on("closed", () => {
        mainWindow = null;
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});
