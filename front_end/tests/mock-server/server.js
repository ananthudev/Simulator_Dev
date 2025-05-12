/**
 * ASTRA GUI Mock Server
 *
 * This is a simple mock server for testing API interactions without
 * requiring the actual backend to be running.
 */

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Data storage
const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Utility function to save mission data
const saveMissionData = (missionId, data) => {
  const filePath = path.join(dataDir, `mission_${missionId}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  return { id: missionId, path: filePath };
};

// Get list of missions
app.get("/api/missions", (req, res) => {
  const files = fs
    .readdirSync(dataDir)
    .filter((file) => file.startsWith("mission_") && file.endsWith(".json"));

  const missions = files.map((file) => {
    const content = JSON.parse(
      fs.readFileSync(path.join(dataDir, file), "utf8")
    );
    return {
      id: file.replace("mission_", "").replace(".json", ""),
      name: content.Mission?.name || "Unnamed Mission",
      date: content.Mission?.date || new Date().toISOString().split("T")[0],
      mode: content.Mission?.mode || "simulation",
    };
  });

  res.json({ missions });
});

// Get a specific mission
app.get("/api/missions/:id", (req, res) => {
  const filePath = path.join(dataDir, `mission_${req.params.id}.json`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Mission not found" });
  }

  const missionData = JSON.parse(fs.readFileSync(filePath, "utf8"));
  res.json(missionData);
});

// Create a new mission
app.post("/api/missions", (req, res) => {
  const missionData = req.body;
  const missionId = Date.now().toString();

  const result = saveMissionData(missionId, missionData);
  res
    .status(201)
    .json({ id: missionId, message: "Mission created successfully" });
});

// Update an existing mission
app.put("/api/missions/:id", (req, res) => {
  const missionId = req.params.id;
  const filePath = path.join(dataDir, `mission_${missionId}.json`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Mission not found" });
  }

  const result = saveMissionData(missionId, req.body);
  res.json({ id: missionId, message: "Mission updated successfully" });
});

// Delete a mission
app.delete("/api/missions/:id", (req, res) => {
  const filePath = path.join(dataDir, `mission_${req.params.id}.json`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Mission not found" });
  }

  fs.unlinkSync(filePath);
  res.json({ message: "Mission deleted successfully" });
});

// Launch a mission simulation
app.post("/api/launch/:id", (req, res) => {
  const missionId = req.params.id;
  const filePath = path.join(dataDir, `mission_${missionId}.json`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Mission not found" });
  }

  // In a real system, this would trigger the simulation
  // For the mock, we'll just return a success message

  // Generate some mock trajectory data
  const trajectoryData = {
    altitude: Array.from({ length: 100 }, (_, i) => ({
      t: i,
      value: 100 * i + Math.random() * 50,
    })),
    velocity: Array.from({ length: 100 }, (_, i) => ({
      t: i,
      value: 50 * Math.log(i + 1) + Math.random() * 10,
    })),
    acceleration: Array.from({ length: 100 }, (_, i) => ({
      t: i,
      value: 9.8 + Math.random() * 2 - 1,
    })),
    events: [
      { t: 0, name: "Launch" },
      { t: 25, name: "Max Q" },
      { t: 65, name: "MECO" },
      { t: 70, name: "Stage Separation" },
      { t: 85, name: "SECO" },
      { t: 95, name: "Target Orbit Reached" },
    ],
  };

  // Create a results directory if it doesn't exist
  const resultsDir = path.join(dataDir, "results");
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  // Save the mock trajectory data
  const resultPath = path.join(resultsDir, `result_${missionId}.json`);
  fs.writeFileSync(resultPath, JSON.stringify(trajectoryData, null, 2));

  res.json({
    message: "Mission launched successfully",
    resultId: missionId,
    status: "complete",
  });
});

// Get mission simulation results
app.get("/api/results/:id", (req, res) => {
  const resultPath = path.join(
    dataDir,
    "results",
    `result_${req.params.id}.json`
  );

  if (!fs.existsSync(resultPath)) {
    return res.status(404).json({ error: "Results not found" });
  }

  const resultData = JSON.parse(fs.readFileSync(resultPath, "utf8"));
  res.json(resultData);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Mock API server running on port ${PORT}`);
  console.log(`- GET    /api/missions         (Get all missions)`);
  console.log(`- GET    /api/missions/:id     (Get specific mission)`);
  console.log(`- POST   /api/missions         (Create new mission)`);
  console.log(`- PUT    /api/missions/:id     (Update mission)`);
  console.log(`- DELETE /api/missions/:id     (Delete mission)`);
  console.log(`- POST   /api/launch/:id       (Launch mission)`);
  console.log(`- GET    /api/results/:id      (Get mission results)`);
});

module.exports = app; // For testing
