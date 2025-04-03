const { app, BrowserWindow } = require("electron");
const path = require("path");

let mainWindow;
let splashScreen;

app.whenReady().then(() => {
  // Create the splash screen
  splashScreen = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false, // No title bar
    alwaysOnTop: true, // Keep it on top
    transparent: true, // Transparent background if needed
    resizable: false,
  });

  splashScreen.loadFile(path.join(__dirname, "/splash.html"));

  // Create the main window (but don't show it yet)
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    show: false, // Hide initially
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, "/mission.html"));

  // Wait a few seconds, then close splash and show main window
  setTimeout(() => {
    splashScreen.close();
    mainWindow.show();
  }, 3000); // Adjust time as needed

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
