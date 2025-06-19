const { app, BrowserWindow } = require("electron");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");

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
      enableRemoteModule: true,
    },
  });

  mainWindow.loadFile(path.join(__dirname, "/mission.html"));

  // Set global flag and expose node modules directly
  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow.webContents.executeJavaScript(`
      window.isElectron = true;
      window.nodePath = require('path');
      window.nodeFs = require('fs');
      window.nodeExec = require('child_process').exec;
      window.nodeSpawn = require('child_process').spawn;
    `);
  });

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
