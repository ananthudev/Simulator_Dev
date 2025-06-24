// TEMP: Plot Viewer JavaScript - TODO: Remove this temporary feature
// Based on the Python bin file plotting functionality from csvplot.py and Desrialize.py

document.addEventListener("DOMContentLoaded", function () {
  // Plot categories and parameters based on the Python code structure
  const plotCategories = {
    Dynamics: [
      "Mission_time",
      "Phase_time",
      "Mass",
      "Thrust",
      "Vaccum_Thrust",
      "Sensed_Acc",
      "Drag_Acc",
      "Drag_Force",
      "Relative_velocity",
      "Gravity_Acc",
      "Total_Acc",
      "ThrustAcc.x",
      "ThrustAcc.y",
      "ThrustAcc.z",
      "ThrustAccMag",
      "GravAcc.x",
      "GravAcc.y",
      "GravAcc.z",
    ],
    AeroDynamics: [
      "Mission_time",
      "Mach",
      "CD",
      "Dynamic Pressure",
      "Angle of Attack",
      "Q Alpha",
      "Alpha",
      "Beta",
      "Pitch_Alpha",
      "Yaw_Alpha",
      "Heat_Flux",
    ],
    Body_Rates: ["Mission_time", "Roll", "Pitch", "Yaw"],
    Body_Angle: ["Mission_time", "Roll", "Pitch", "Yaw"],
    Euler_Angle: ["Mission_time", "Phi", "Theta", "Psi"],
    Lat_Long_Alt: [
      "Mission_time",
      "Altitude",
      "R_Earth_Surface",
      "GeoCentric_Latitide",
      "GeoDetic_Latitide",
      "Relative_Longitude",
      "Inertial_Longitude",
    ],
    IIP: ["Mission_time", "Longitude", "Latitude"],
    Quaternion: ["Mission_time", "Q1", "Q2", "Q3", "Q4"],
    States: ["Mission_time", "X", "Y", "Z", "U", "V", "W"],
    Polar: [
      "Mission_time",
      "Altitude",
      "Inertial_Velocity",
      "Flight_Path_Angle",
      "Velocity_Azimuth",
      "RMag",
      "VMag",
    ],
    Sequence: ["Events and Timeline"], // Special case for sequence data
  };

  // Window elements
  const plotViewerBtn = document.getElementById("plot-viewer-btn");
  const plotViewerWindow = document.getElementById("plot-viewer-window");
  const closePlotViewerWindow = document.getElementById(
    "close-plot-viewer-window"
  );
  const minimizePlotWindow = document.getElementById("minimize-plot-window");
  const maximizePlotWindow = document.getElementById("maximize-plot-window");
  const windowHeader = plotViewerWindow.querySelector(".window-header");
  const binFileInput = document.getElementById("bin-file-input");
  const fileInfo = document.getElementById("selected-file-info");
  const fileName = document.getElementById("file-name");
  const fileSize = document.getElementById("file-size");
  const plotCategoriesContainer = document.getElementById(
    "plot-categories-container"
  );
  const plotTree = document.querySelector(".plot-tree");
  const generatePlotsBtn = document.getElementById("generate-plots-btn");
  const selectAllPlotsBtn = document.getElementById("select-all-plots");
  const clearAllPlotsBtn = document.getElementById("clear-all-plots");

  // Progress and plot display elements
  const plotProgressContainer = document.getElementById(
    "plot-progress-container"
  );
  const progressFill = document.getElementById("progress-fill");
  const progressText = document.getElementById("progress-text");
  const plotDisplayContainer = document.getElementById(
    "plot-display-container"
  );
  const plotTabHeaders = document.getElementById("plot-tab-headers");
  const plotTabContents = document.getElementById("plot-tab-contents");
  const exportPlotsBtn = document.getElementById("export-plots-btn");
  const closePlotsBtn = document.getElementById("close-plots-btn");

  let selectedFile = null;
  let parsedData = null;
  let generatedPlots = [];
  let isDragging = false;
  let isMaximized = false;
  let isMinimized = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let windowStartX = 0;
  let windowStartY = 0;

  // Open window
  plotViewerBtn.addEventListener("click", function (e) {
    e.preventDefault();
    plotViewerWindow.style.display = "flex";
    resetWindow();
  });

  // Close window
  closePlotViewerWindow.addEventListener("click", function () {
    plotViewerWindow.style.display = "none";
  });

  // Minimize window
  minimizePlotWindow.addEventListener("click", function () {
    toggleMinimize();
  });

  // Maximize window
  maximizePlotWindow.addEventListener("click", function () {
    toggleMaximize();
  });

  // Window dragging functionality
  windowHeader.addEventListener("mousedown", function (e) {
    if (isMaximized) return; // Don't drag if maximized

    isDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;

    const rect = plotViewerWindow.getBoundingClientRect();
    windowStartX = rect.left;
    windowStartY = rect.top;

    document.addEventListener("mousemove", handleDrag);
    document.addEventListener("mouseup", stopDrag);
    e.preventDefault();
  });

  function handleDrag(e) {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStartX;
    const deltaY = e.clientY - dragStartY;

    const newX = windowStartX + deltaX;
    const newY = windowStartY + deltaY;

    // Keep window within viewport
    const maxX = window.innerWidth - 200; // Minimum 200px visible
    const maxY = window.innerHeight - 40; // Minimum title bar visible

    plotViewerWindow.style.left = Math.max(0, Math.min(maxX, newX)) + "px";
    plotViewerWindow.style.top = Math.max(0, Math.min(maxY, newY)) + "px";
  }

  function stopDrag() {
    isDragging = false;
    document.removeEventListener("mousemove", handleDrag);
    document.removeEventListener("mouseup", stopDrag);
  }

  function toggleMinimize() {
    isMinimized = !isMinimized;
    if (isMinimized) {
      plotViewerWindow.classList.add("minimized");
      minimizePlotWindow.textContent = "□";
    } else {
      plotViewerWindow.classList.remove("minimized");
      minimizePlotWindow.textContent = "−";
    }
  }

  function toggleMaximize() {
    isMaximized = !isMaximized;
    if (isMaximized) {
      plotViewerWindow.classList.add("maximized");
      maximizePlotWindow.textContent = "❐";
    } else {
      plotViewerWindow.classList.remove("maximized");
      maximizePlotWindow.textContent = "□";
    }
  }

  // File selection handler
  binFileInput.addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file && file.name.endsWith(".bin")) {
      selectedFile = file;
      showFileInfo(file);
      generatePlotTree();
      plotCategoriesContainer.style.display = "block";
    } else {
      alert("Please select a valid .bin file");
      resetFileSelection();
    }
  });

  // Generate plots button
  generatePlotsBtn.addEventListener("click", function () {
    const selectedPlots = getSelectedPlots();
    if (selectedPlots.length === 0) {
      alert("Please select at least one plot to generate");
      return;
    }
    generatePlots(selectedPlots);
  });

  // Select all plots
  selectAllPlotsBtn.addEventListener("click", function () {
    const checkboxes = plotTree.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((checkbox) => (checkbox.checked = true));
  });

  // Clear all plots
  clearAllPlotsBtn.addEventListener("click", function () {
    const checkboxes = plotTree.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((checkbox) => (checkbox.checked = false));
  });

  // Export plots
  exportPlotsBtn.addEventListener("click", function () {
    exportAllPlots();
  });

  // Close plots
  closePlotsBtn.addEventListener("click", function () {
    closePlotDisplay();
  });

  function resetWindow() {
    resetFileSelection();
    plotCategoriesContainer.style.display = "none";
    plotTree.innerHTML = "";

    // Reset window state
    isMinimized = false;
    isMaximized = false;
    plotViewerWindow.classList.remove("minimized", "maximized");
    minimizePlotWindow.textContent = "−";
    maximizePlotWindow.textContent = "□";
  }

  function resetFileSelection() {
    binFileInput.value = "";
    fileInfo.style.display = "none";
    selectedFile = null;
  }

  function showFileInfo(file) {
    fileName.textContent = `File: ${file.name}`;
    fileSize.textContent = `Size: ${formatFileSize(file.size)}`;
    fileInfo.style.display = "block";
  }

  function formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  function generatePlotTree() {
    plotTree.innerHTML = "";

    Object.keys(plotCategories).forEach((category) => {
      const categoryDiv = createCategoryElement(
        category,
        plotCategories[category]
      );
      plotTree.appendChild(categoryDiv);
    });
  }

  function createCategoryElement(categoryName, parameters) {
    const categoryDiv = document.createElement("div");
    categoryDiv.className = "plot-category";

    // Category header with checkbox and toggle
    const categoryHeader = document.createElement("div");
    categoryHeader.className = "category-header";

    const categoryCheckbox = document.createElement("input");
    categoryCheckbox.type = "checkbox";
    categoryCheckbox.id = `category-${categoryName}`;
    categoryCheckbox.addEventListener("change", function () {
      toggleCategorySelection(categoryName, this.checked);
    });

    const categoryLabel = document.createElement("label");
    categoryLabel.textContent = categoryName;
    categoryLabel.setAttribute("for", `category-${categoryName}`);

    const categoryToggle = document.createElement("span");
    categoryToggle.className = "category-toggle";
    categoryToggle.textContent = "▶";
    categoryToggle.addEventListener("click", function () {
      toggleCategoryExpansion(categoryName);
    });

    categoryHeader.appendChild(categoryCheckbox);
    categoryHeader.appendChild(categoryLabel);
    categoryHeader.appendChild(categoryToggle);

    // Create parameters container
    const parametersDiv = document.createElement("div");
    parametersDiv.className = "plot-parameters";
    parametersDiv.id = `parameters-${categoryName}`;

    if (categoryName === "Sequence") {
      // Special handling for sequence data
      const paramItem = document.createElement("div");
      paramItem.className = "parameter-item";

      const paramCheckbox = document.createElement("input");
      paramCheckbox.type = "checkbox";
      paramCheckbox.id = `param-${categoryName}-events`;
      paramCheckbox.setAttribute("data-category", categoryName);
      paramCheckbox.setAttribute("data-parameter", "Events and Timeline");

      const paramLabel = document.createElement("label");
      paramLabel.textContent = "Events and Timeline";
      paramLabel.setAttribute("for", `param-${categoryName}-events`);

      paramItem.appendChild(paramCheckbox);
      paramItem.appendChild(paramLabel);
      parametersDiv.appendChild(paramItem);
    } else {
      // Regular parameters
      parameters.forEach((param) => {
        const paramItem = document.createElement("div");
        paramItem.className = "parameter-item";

        const paramCheckbox = document.createElement("input");
        paramCheckbox.type = "checkbox";
        paramCheckbox.id = `param-${categoryName}-${param}`;
        paramCheckbox.setAttribute("data-category", categoryName);
        paramCheckbox.setAttribute("data-parameter", param);

        const paramLabel = document.createElement("label");
        paramLabel.textContent = param.replace(/_/g, " ");
        paramLabel.setAttribute("for", `param-${categoryName}-${param}`);

        paramItem.appendChild(paramCheckbox);
        paramItem.appendChild(paramLabel);
        parametersDiv.appendChild(paramItem);
      });
    }

    categoryDiv.appendChild(categoryHeader);
    categoryDiv.appendChild(parametersDiv);

    return categoryDiv;
  }

  function toggleCategoryExpansion(categoryName) {
    const parametersDiv = document.getElementById(`parameters-${categoryName}`);
    const toggleIcon = document
      .querySelector(`#parameters-${categoryName}`)
      .previousElementSibling.querySelector(".category-toggle");

    if (parametersDiv.classList.contains("expanded")) {
      parametersDiv.classList.remove("expanded");
      toggleIcon.classList.remove("expanded");
      toggleIcon.textContent = "▶";
    } else {
      parametersDiv.classList.add("expanded");
      toggleIcon.classList.add("expanded");
      toggleIcon.textContent = "▼";
    }
  }

  function toggleCategorySelection(categoryName, isChecked) {
    const parametersDiv = document.getElementById(`parameters-${categoryName}`);
    const paramCheckboxes = parametersDiv.querySelectorAll(
      'input[type="checkbox"]'
    );

    paramCheckboxes.forEach((checkbox) => {
      checkbox.checked = isChecked;
    });
  }

  function getSelectedPlots() {
    const selectedPlots = [];
    const paramCheckboxes = plotTree.querySelectorAll(
      '.parameter-item input[type="checkbox"]:checked'
    );

    paramCheckboxes.forEach((checkbox) => {
      const category = checkbox.getAttribute("data-category");
      const parameter = checkbox.getAttribute("data-parameter");
      selectedPlots.push({ category, parameter });
    });

    return selectedPlots;
  }

  async function generatePlots(selectedPlots) {
    if (!selectedFile) {
      alert("No file selected");
      return;
    }

    try {
      // Hide plot categories and show progress
      plotCategoriesContainer.style.display = "none";
      plotProgressContainer.style.display = "block";
      plotDisplayContainer.style.display = "none";

      // Step 1: Parse binary file
      updateProgress(10, "Reading binary file...");
      await simulateDelay(500);

      parsedData = await parseBinaryFile(selectedFile);

      updateProgress(30, "Extracting data parameters...");
      await simulateDelay(500);

      // Step 2: Generate plots
      generatedPlots = [];
      const totalPlots = selectedPlots.length;

      for (let i = 0; i < totalPlots; i++) {
        const plot = selectedPlots[i];
        const progress = 30 + ((i + 1) / totalPlots) * 60;
        updateProgress(
          progress,
          `Generating ${plot.category} - ${plot.parameter}...`
        );

        await simulateDelay(300);
        const plotData = await generatePlotData(plot, parsedData);
        generatedPlots.push(plotData);
      }

      updateProgress(95, "Finalizing plots...");
      await simulateDelay(500);

      // Step 3: Display plots
      displayPlots(generatedPlots);
      updateProgress(100, "Complete!");

      setTimeout(() => {
        plotProgressContainer.style.display = "none";
        plotDisplayContainer.style.display = "block";
      }, 500);
    } catch (error) {
      console.error("Error generating plots:", error);
      alert("Error generating plots: " + error.message);
      plotProgressContainer.style.display = "none";
      plotCategoriesContainer.style.display = "block";
    }
  }

  function updateProgress(percent, message) {
    progressFill.style.width = percent + "%";
    progressText.textContent = `${Math.round(percent)}% - ${message}`;
  }

  function simulateDelay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function parseBinaryFile(file) {
    // Use the new PlotViewer class for real binary parsing
    if (!window.plotViewer) {
      window.plotViewer = new PlotViewer();
    }

    try {
      // Wait a moment for PlotViewer to initialize
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Parse the actual binary file using Protocol Buffers
      const vehicleData = await window.plotViewer.parseBinaryFile(file);
      const vehicleName = file.name.replace(".bin", "");

      // Return data in the format expected by the UI
      return {
        vehicleName: vehicleName,
        data: vehicleData,
      };
    } catch (error) {
      console.error("Binary parsing failed:", error);
      throw new Error("Failed to parse binary file: " + error.message);
    }
  }

  async function generatePlotData(plotSelection, parsedData) {
    const { category, parameter } = plotSelection;

    if (category === "Sequence") {
      return {
        id: `${category}-${parameter}`,
        title: `${category}: ${parameter}`,
        category: category,
        parameter: parameter,
        type: "timeline",
        data: parsedData.data.Sequence,
      };
    } else {
      const categoryData = parsedData.data[category];
      if (!categoryData || !categoryData[parameter]) {
        throw new Error(`Data not found for ${category} - ${parameter}`);
      }

      return {
        id: `${category}-${parameter}`,
        title: `${category}: ${parameter.replace(/_/g, " ")}`,
        category: category,
        parameter: parameter,
        type: "line",
        data: {
          x: categoryData.Mission_time || parsedData.mission_time,
          y: categoryData[parameter],
          title: parameter.replace(/_/g, " "),
        },
      };
    }
  }

  function displayPlots(plots) {
    // Clear existing content
    plotTabHeaders.innerHTML = "";
    plotTabContents.innerHTML = "";

    plots.forEach((plot, index) => {
      // Create tab header
      const tabHeader = document.createElement("div");
      tabHeader.className = `plot-tab-header ${index === 0 ? "active" : ""}`;
      tabHeader.textContent = plot.title;
      tabHeader.addEventListener("click", () => switchTab(index));
      plotTabHeaders.appendChild(tabHeader);

      // Create tab content
      const tabContent = document.createElement("div");
      tabContent.className = `plot-tab-content ${index === 0 ? "active" : ""}`;
      tabContent.innerHTML = `<div class="plot-container" id="plot-${plot.id}"></div>`;
      plotTabContents.appendChild(tabContent);
    });

    // Generate actual plots
    setTimeout(() => {
      plots.forEach((plot) => {
        if (plot.type === "timeline") {
          createTimelinePlot(plot);
        } else {
          createLinePlot(plot);
        }
      });

      // Add a small delay to ensure plots are rendered before triggering resize
      setTimeout(() => {
        if (window.plotResizeHandlers) {
          window.plotResizeHandlers.forEach(({ id }) => {
            Plotly.Plots.resize(id);
          });
        }
      }, 200);
    }, 100);
  }

  function switchTab(activeIndex) {
    // Update tab headers
    const headers = plotTabHeaders.querySelectorAll(".plot-tab-header");
    headers.forEach((header, index) => {
      header.classList.toggle("active", index === activeIndex);
    });

    // Update tab contents
    const contents = plotTabContents.querySelectorAll(".plot-tab-content");
    contents.forEach((content, index) => {
      content.classList.toggle("active", index === activeIndex);
    });

    // Force resize of the now-visible plot after tab switch
    setTimeout(() => {
      if (window.plotResizeHandlers && generatedPlots[activeIndex]) {
        const plotId = `plot-${generatedPlots[activeIndex].id}`;
        Plotly.Plots.resize(plotId);
      }
    }, 50);
  }

  function createLinePlot(plot) {
    const trace = {
      x: plot.data.x,
      y: plot.data.y,
      type: "scatter",
      mode: "lines",
      name: plot.data.title,
      line: { color: "#4a90e2", width: 2 },
    };

    const layout = {
      title: {
        text: plot.title,
        font: { color: "#e0e0e0" },
      },
      xaxis: {
        title: "Mission Time (s)",
        color: "#e0e0e0",
        gridcolor: "#404040",
      },
      yaxis: {
        title: plot.data.title,
        color: "#e0e0e0",
        gridcolor: "#404040",
      },
      plot_bgcolor: "#1a1a1a",
      paper_bgcolor: "#1a1a1a",
      font: { color: "#e0e0e0" },
      autosize: true,
      margin: {
        l: 60,
        r: 20,
        t: 60,
        b: 60,
        pad: 5,
      },
    };

    const config = {
      responsive: true,
      displayModeBar: true,
      displaylogo: false,
      modeBarButtonsToRemove: ["lasso2d", "select2d"],
      toImageButtonOptions: {
        format: "png",
        filename: plot.title
          .replace(/[^a-zA-Z0-9\s]/g, "_")
          .replace(/\s+/g, "_"),
        height: 800,
        width: 1200,
        scale: 1,
      },
    };

    Plotly.newPlot(`plot-${plot.id}`, [trace], layout, config).then(() => {
      // Force immediate resize to ensure proper initial sizing
      setTimeout(() => {
        Plotly.Plots.resize(`plot-${plot.id}`);
      }, 50);

      // Additional resize after DOM settles to catch any layout shifts
      setTimeout(() => {
        Plotly.Plots.resize(`plot-${plot.id}`);
      }, 200);

      // Ensure plot resizes with container
      const resizeHandler = () => Plotly.Plots.resize(`plot-${plot.id}`);
      window.addEventListener("resize", resizeHandler);

      // Store resize handler for cleanup if needed
      if (!window.plotResizeHandlers) window.plotResizeHandlers = [];
      window.plotResizeHandlers.push({
        id: `plot-${plot.id}`,
        handler: resizeHandler,
      });

      // Add intersection observer to resize when plot becomes visible
      const plotElement = document.getElementById(`plot-${plot.id}`);
      if (plotElement && "IntersectionObserver" in window) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                setTimeout(() => {
                  Plotly.Plots.resize(`plot-${plot.id}`);
                }, 100);
              }
            });
          },
          { threshold: 0.1 }
        );

        observer.observe(plotElement);

        // Store observer for cleanup
        if (!window.plotObservers) window.plotObservers = [];
        window.plotObservers.push({ id: `plot-${plot.id}`, observer });
      }
    });
  }

  function createTimelinePlot(plot) {
    const events = plot.data.events;

    const trace = {
      x: events.map((e) => e.time),
      y: events.map((e, i) => i),
      mode: "markers+text",
      marker: {
        size: 12,
        color: "#e74c3c",
      },
      text: events.map((e) => e.event),
      textposition: "top center",
      textfont: { color: "#e0e0e0" },
      hovertemplate:
        "<b>%{text}</b><br>Time: %{x}s<br>%{customdata}<extra></extra>",
      customdata: events.map((e) => e.comment),
    };

    const layout = {
      title: {
        text: plot.title,
        font: { color: "#e0e0e0" },
      },
      xaxis: {
        title: "Mission Time (s)",
        color: "#e0e0e0",
        gridcolor: "#404040",
      },
      yaxis: {
        title: "Events",
        color: "#e0e0e0",
        gridcolor: "#404040",
        tickmode: "array",
        tickvals: events.map((e, i) => i),
        ticktext: events.map((e) => e.event),
      },
      plot_bgcolor: "#1a1a1a",
      paper_bgcolor: "#1a1a1a",
      font: { color: "#e0e0e0" },
      autosize: true,
      margin: {
        l: 60,
        r: 20,
        t: 60,
        b: 60,
        pad: 5,
      },
    };

    const config = {
      responsive: true,
      displayModeBar: true,
      displaylogo: false,
      toImageButtonOptions: {
        format: "png",
        filename: plot.title
          .replace(/[^a-zA-Z0-9\s]/g, "_")
          .replace(/\s+/g, "_"),
        height: 800,
        width: 1200,
        scale: 1,
      },
    };

    Plotly.newPlot(`plot-${plot.id}`, [trace], layout, config).then(() => {
      // Force immediate resize to ensure proper initial sizing
      setTimeout(() => {
        Plotly.Plots.resize(`plot-${plot.id}`);
      }, 50);

      // Additional resize after DOM settles to catch any layout shifts
      setTimeout(() => {
        Plotly.Plots.resize(`plot-${plot.id}`);
      }, 200);

      // Ensure plot resizes with container
      const resizeHandler = () => Plotly.Plots.resize(`plot-${plot.id}`);
      window.addEventListener("resize", resizeHandler);

      // Store resize handler for cleanup if needed
      if (!window.plotResizeHandlers) window.plotResizeHandlers = [];
      window.plotResizeHandlers.push({
        id: `plot-${plot.id}`,
        handler: resizeHandler,
      });

      // Add intersection observer to resize when plot becomes visible
      const plotElement = document.getElementById(`plot-${plot.id}`);
      if (plotElement && "IntersectionObserver" in window) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                setTimeout(() => {
                  Plotly.Plots.resize(`plot-${plot.id}`);
                }, 100);
              }
            });
          },
          { threshold: 0.1 }
        );

        observer.observe(plotElement);

        // Store observer for cleanup
        if (!window.plotObservers) window.plotObservers = [];
        window.plotObservers.push({ id: `plot-${plot.id}`, observer });
      }
    });
  }

  function exportAllPlots() {
    if (generatedPlots.length === 0) {
      alert("No plots to export");
      return;
    }

    // Create export options
    const exportOptions = [
      { format: "PNG", extension: "png" },
      { format: "SVG", extension: "svg" },
      { format: "PDF", extension: "pdf" },
    ];

    const format = prompt(
      `Choose export format:\n${exportOptions
        .map((opt, i) => `${i + 1}. ${opt.format}`)
        .join("\n")}\n\nEnter number (1-${exportOptions.length}):`
    );

    if (format && format >= 1 && format <= exportOptions.length) {
      const selectedFormat = exportOptions[format - 1];
      exportPlotsInFormat(selectedFormat);
    }
  }

  function exportPlotsInFormat(format) {
    generatedPlots.forEach((plot, index) => {
      setTimeout(() => {
        Plotly.downloadImage(`plot-${plot.id}`, {
          format: format.extension,
          width: 1200,
          height: 800,
          filename: `${plot.title.replace(/[^a-zA-Z0-9]/g, "_")}.${
            format.extension
          }`,
        });
      }, index * 500); // Stagger downloads
    });
  }

  function closePlotDisplay() {
    plotDisplayContainer.style.display = "none";
    plotCategoriesContainer.style.display = "block";

    // Clean up resize handlers
    if (window.plotResizeHandlers) {
      window.plotResizeHandlers.forEach(({ handler }) => {
        window.removeEventListener("resize", handler);
      });
      window.plotResizeHandlers = [];
    }

    // Clean up intersection observers
    if (window.plotObservers) {
      window.plotObservers.forEach(({ observer }) => {
        observer.disconnect();
      });
      window.plotObservers = [];
    }

    // Clear plot data
    generatedPlots = [];
    plotTabHeaders.innerHTML = "";
    plotTabContents.innerHTML = "";
  }
});

// Plot Viewer Module - Converted from Python Desrialize.py
class PlotViewer {
  constructor() {
    this.vehicleDataMap = {};
    this.currentData = null;
    this.loadProtobuf();
  }

  async loadProtobuf() {
    // No external protobuf loading needed - we'll use built-in parsing
    // This mimics how Python uses the pre-compiled Buffer_pb2.py
    console.log("Using built-in protobuf parsing (no external dependencies)");
    this.protobufReady = true;
  }

  // Equivalent to readDeSerializeData() from Python
  async parseBinaryFile(file) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      console.log(
        "Parsing binary file:",
        file.name,
        "Size:",
        uint8Array.length,
        "bytes"
      );

      // Use built-in protobuf parsing (mimics Python Buffer_pb2.py)
      const vehicleData = this.parseProtobufBuffer(uint8Array);

      // Extract the single vehicle from the map for dataIns processing
      const vehicleNames = Object.keys(vehicleData);
      if (vehicleNames.length > 0) {
        const mainVehicle = vehicleData[vehicleNames[0]];
        console.log("Processing vehicle for dataIns:", vehicleNames[0]);
        return this.dataIns(mainVehicle);
      } else {
        throw new Error("No vehicle data found in binary file");
      }
    } catch (error) {
      console.error("Error parsing binary file:", error);
      throw error;
    }
  }

  // Built-in protobuf parser - equivalent to Python Buffer_pb2.py
  parseProtobufBuffer(uint8Array) {
    console.log(
      "Using built-in protobuf parser (equivalent to Python Buffer_pb2.py)"
    );

    // Simple protobuf varint decoder
    let offset = 0;

    const readVarint = () => {
      let result = 0;
      let shift = 0;
      while (offset < uint8Array.length) {
        const byte = uint8Array[offset++];
        result |= (byte & 0x7f) << shift;
        if ((byte & 0x80) === 0) break;
        shift += 7;
      }
      return result;
    };

    const readString = (length) => {
      const bytes = uint8Array.slice(offset, offset + length);
      offset += length;
      return new TextDecoder().decode(bytes);
    };

    const readDouble = () => {
      const view = new DataView(uint8Array.buffer, offset, 8);
      offset += 8;
      return view.getFloat64(0, true); // little endian
    };

    const readFloat = () => {
      const view = new DataView(uint8Array.buffer, offset, 4);
      offset += 4;
      return view.getFloat32(0, true); // little endian
    };

    const readDoubleArray = (count) => {
      const array = [];
      for (let i = 0; i < count; i++) {
        array.push(readDouble());
      }
      return array;
    };

    // Parse the main buffer structure based on Buffer_pb2.py
    const vehicleData = {
      vehicleName: "",
      vehDynamics: {},
      vehAeroDynamics: {},
      vehNavigation: {},
      vehIIP: {},
      vehLLA: {},
      vehPolar: {},
      vehSequence: {},
    };

    try {
      // Basic protobuf parsing - read field by field
      while (offset < uint8Array.length) {
        const tag = readVarint();
        const fieldNumber = tag >> 3;
        const wireType = tag & 0x7;

        switch (fieldNumber) {
          case 2: // vehicleName
            if (wireType === 2) {
              const length = readVarint();
              vehicleData.vehicleName = readString(length);
              console.log("Parsed vehicle name:", vehicleData.vehicleName);
            }
            break;

          case 4: // vehDynamics
            if (wireType === 2) {
              const length = readVarint();
              console.log("Parsing vehDynamics submessage, length:", length);
              // Parse dynamics submessage
              vehicleData.vehDynamics = this.parseDynamicsMessage(
                uint8Array.slice(offset, offset + length)
              );
              console.log(
                "Parsed dynamics - time points:",
                vehicleData.vehDynamics.time?.length || 0
              );
              offset += length;
            }
            break;

          case 5: // vehAeroDynamics
            if (wireType === 2) {
              const length = readVarint();
              console.log(
                "Parsing vehAeroDynamics submessage, length:",
                length
              );
              vehicleData.vehAeroDynamics = this.parseAeroDynamicsMessage(
                uint8Array.slice(offset, offset + length)
              );
              console.log(
                "Parsed aerodynamics - time points:",
                vehicleData.vehAeroDynamics.time?.length || 0
              );
              offset += length;
            }
            break;

          case 8: // vehNavigation
            if (wireType === 2) {
              const length = readVarint();
              console.log("Parsing vehNavigation submessage, length:", length);
              vehicleData.vehNavigation = this.parseNavigationMessage(
                uint8Array.slice(offset, offset + length)
              );
              offset += length;
            }
            break;

          case 10: // vehIIP
            if (wireType === 2) {
              const length = readVarint();
              console.log("Parsing vehIIP submessage, length:", length);
              vehicleData.vehIIP = this.parseIIPMessage(
                uint8Array.slice(offset, offset + length)
              );
              offset += length;
            }
            break;

          case 6: // vehLLA
            if (wireType === 2) {
              const length = readVarint();
              console.log("Parsing vehLLA submessage, length:", length);
              vehicleData.vehLLA = this.parseLLAMessage(
                uint8Array.slice(offset, offset + length)
              );
              offset += length;
            }
            break;

          case 3: // vehPolar
            if (wireType === 2) {
              const length = readVarint();
              console.log("Parsing vehPolar submessage, length:", length);
              vehicleData.vehPolar = this.parsePolarMessage(
                uint8Array.slice(offset, offset + length)
              );
              offset += length;
            }
            break;

          case 18: // vehSequence
            if (wireType === 2) {
              const length = readVarint();
              console.log("Parsing vehSequence submessage, length:", length);
              vehicleData.vehSequence = this.parseSequenceMessage(
                uint8Array.slice(offset, offset + length)
              );
              offset += length;
            }
            break;

          default:
            // Skip unknown fields
            if (wireType === 0) {
              readVarint(); // varint
            } else if (wireType === 2) {
              const length = readVarint();
              offset += length; // skip bytes
            } else if (wireType === 1) {
              offset += 8; // skip 64-bit
            } else if (wireType === 5) {
              offset += 4; // skip 32-bit
            }
            break;
        }
      }

      console.log("Successfully parsed vehicle:", vehicleData.vehicleName);

      // Return in the format expected by dataIns() - a map with vehicle name as key
      const vehicleMap = {};
      vehicleMap[vehicleData.vehicleName || "Vehicle1"] = vehicleData;

      console.log(
        "Parsed vehicle data - Dynamics time points:",
        vehicleData.vehDynamics.time?.length || 0
      );
      console.log(
        "Sample dynamics time values:",
        vehicleData.vehDynamics.time?.slice(0, 5)
      );
      console.log(
        "Parsed vehicle data - AeroDynamics time points:",
        vehicleData.vehAeroDynamics.time?.length || 0
      );

      return vehicleMap;
    } catch (error) {
      console.error("Protobuf parsing error:", error);
      // Return basic structure to prevent crashes in the format expected by dataIns()
      const fallbackVehicle = {
        vehicleName: "ParsedVehicle",
        vehDynamics: { time: [], mass: [], thrust: [] },
        vehAeroDynamics: { time: [], mach: [], dynamicPressure: [] },
        vehNavigation: { time: [], vehSteering: {}, vehStates: {} },
        vehIIP: { time: [], longitude: [], latitude: [] },
        vehLLA: { time: [], altitude: [] },
        vehPolar: { time: [], altitude: [], inerVel: [] },
        vehSequence: { vehSeqence: {}, vehSteerSequence: {} },
      };

      const fallbackMap = {};
      fallbackMap["ParsedVehicle"] = fallbackVehicle;
      return fallbackMap;
    }
  }

  // Individual message parsers based on Buffer_pb2.py structure
  parseDynamicsMessage(uint8Array) {
    let offset = 0;
    const result = {
      time: [],
      phaseTime: [],
      mass: [],
      thrust: [],
      vaccumThrust: [],
      sensedAcc: [],
      dragAcc: [],
      dragForce: [],
      relativeVel: [],
      gravityAcc: [],
      totalAcc: [],
      thrustECI: { x: [], y: [], z: [] },
      gravityECI: { x: [], y: [], z: [] },
      thrustAccMag: [],
    };

    const readVarint = () => {
      let result = 0;
      let shift = 0;
      while (offset < uint8Array.length) {
        const byte = uint8Array[offset++];
        result |= (byte & 0x7f) << shift;
        if ((byte & 0x80) === 0) break;
        shift += 7;
      }
      return result;
    };

    const readDouble = () => {
      const view = new DataView(
        uint8Array.buffer,
        uint8Array.byteOffset + offset,
        8
      );
      offset += 8;
      return view.getFloat64(0, true);
    };

    const readPackedDoubles = () => {
      const length = readVarint();
      const values = [];
      const endOffset = offset + length;
      while (offset < endOffset) {
        values.push(readDouble());
      }
      return values;
    };

    try {
      while (offset < uint8Array.length) {
        const tag = readVarint();
        const fieldNumber = tag >> 3;
        const wireType = tag & 0x7;

        // Parse each field based on Buffer_pb2.py field numbers
        switch (fieldNumber) {
          case 1:
            result.time = wireType === 2 ? readPackedDoubles() : [];
            break;
          case 16:
            result.phaseTime = wireType === 2 ? readPackedDoubles() : [];
            break;
          case 6:
            result.mass = wireType === 2 ? readPackedDoubles() : [];
            break;
          case 3:
            result.thrust = wireType === 2 ? readPackedDoubles() : [];
            break;
          case 9:
            result.vaccumThrust = wireType === 2 ? readPackedDoubles() : [];
            break;
          case 4:
            result.sensedAcc = wireType === 2 ? readPackedDoubles() : [];
            break;
          case 2:
            result.dragAcc = wireType === 2 ? readPackedDoubles() : [];
            break;
          case 10:
            result.dragForce = wireType === 2 ? readPackedDoubles() : [];
            break;
          case 7:
            result.relativeVel = wireType === 2 ? readPackedDoubles() : [];
            break;
          case 11:
            result.gravityAcc = wireType === 2 ? readPackedDoubles() : [];
            break;
          case 5:
            result.totalAcc = wireType === 2 ? readPackedDoubles() : [];
            break;
          case 17:
            result.thrustAccMag = wireType === 2 ? readPackedDoubles() : [];
            break;
          default:
            // Skip unknown fields
            if (wireType === 2) {
              const length = readVarint();
              offset += length;
            } else if (wireType === 0) {
              readVarint();
            }
            break;
        }
      }
    } catch (error) {
      console.warn("Error parsing dynamics data:", error);
    }

    return result;
  }

  parseAeroDynamicsMessage(uint8Array) {
    let offset = 0;
    const result = {
      time: [],
      mach: [],
      coeffAxial: [],
      dynamicPressure: [],
      AOA: [],
      qAlpha: [],
      alpha: [],
      beta: [],
      pitchAlpha: [],
      yawAlpha: [],
      heatflux: [],
    };

    const readVarint = () => {
      let result = 0;
      let shift = 0;
      while (offset < uint8Array.length) {
        const byte = uint8Array[offset++];
        result |= (byte & 0x7f) << shift;
        if ((byte & 0x80) === 0) break;
        shift += 7;
      }
      return result;
    };

    const readDouble = () => {
      const view = new DataView(
        uint8Array.buffer,
        uint8Array.byteOffset + offset,
        8
      );
      offset += 8;
      return view.getFloat64(0, true);
    };

    const readPackedDoubles = () => {
      const length = readVarint();
      const values = [];
      const endOffset = offset + length;
      while (offset < endOffset) {
        values.push(readDouble());
      }
      return values;
    };

    try {
      while (offset < uint8Array.length) {
        const tag = readVarint();
        const fieldNumber = tag >> 3;
        const wireType = tag & 0x7;

        switch (fieldNumber) {
          case 1:
            result.time = wireType === 2 ? readPackedDoubles() : [];
            break;
          case 2:
            result.mach = wireType === 2 ? readPackedDoubles() : [];
            break;
          case 13:
            result.coeffAxial = wireType === 2 ? readPackedDoubles() : [];
            break;
          case 10:
            result.dynamicPressure = wireType === 2 ? readPackedDoubles() : [];
            break;
          case 3:
            result.AOA = wireType === 2 ? readPackedDoubles() : [];
            break;
          case 4:
            result.qAlpha = wireType === 2 ? readPackedDoubles() : [];
            break;
          case 5:
            result.alpha = wireType === 2 ? readPackedDoubles() : [];
            break;
          case 6:
            result.beta = wireType === 2 ? readPackedDoubles() : [];
            break;
          case 7:
            result.pitchAlpha = wireType === 2 ? readPackedDoubles() : [];
            break;
          case 8:
            result.yawAlpha = wireType === 2 ? readPackedDoubles() : [];
            break;
          case 9:
            result.heatflux = wireType === 2 ? readPackedDoubles() : [];
            break;
          default:
            if (wireType === 2) {
              const length = readVarint();
              offset += length;
            } else if (wireType === 0) {
              readVarint();
            }
            break;
        }
      }
    } catch (error) {
      console.warn("Error parsing aerodynamics data:", error);
    }

    return result;
  }

  parseNavigationMessage(uint8Array) {
    return {
      time: [],
      vehStates: { x: [], y: [], z: [], u: [], v: [], w: [] },
      vehSteering: {
        bodyRates: { x: [], y: [], z: [] },
        bodyAngle: { x: [], y: [], z: [] },
        eulerAngle: { x: [], y: [], z: [] },
        vehQuat: { q1: [], q2: [], q3: [], q4: [] },
      },
      vehLLA: {
        time: [],
        altitude: [],
        geoCentricLatitude: [],
        geoDeticLatitude: [],
        relativeLongitude: [],
        inertialLongitude: [],
        R_Earth_Surface: [],
      },
      vehPolar: {
        time: [],
        altitude: [],
        inerVel: [],
        fpa: [],
        velAzi: [],
        rMag: [],
        vMag: [],
      },
    };
  }

  parseIIPMessage(uint8Array) {
    return {
      time: [],
      longitude: [],
      latitude: [],
    };
  }

  parseLLAMessage(uint8Array) {
    return {
      time: [],
      altitude: [],
      geoCentricLatitude: [],
      geoDeticLatitude: [],
      relativeLongitude: [],
      inertialLongitude: [],
      R_Earth_Surface: [],
    };
  }

  parsePolarMessage(uint8Array) {
    return {
      time: [],
      altitude: [],
      inerVel: [],
      fpa: [],
      velAzi: [],
      rMag: [],
      vMag: [],
    };
  }

  parseSequenceMessage(uint8Array) {
    return {
      vehSeqence: {},
      vehSteerSequence: {},
    };
  }

  // Equivalent to dataIns() from Python - exact conversion
  dataIns(mainVehicle) {
    const vehicleName = mainVehicle.vehicleName || "ParsedVehicle";

    const mainParamMap = {
      Dynamics: {},
      AeroDynamics: {},
      Body_Rates: {},
      Body_Angle: {},
      Euler_Angle: {},
      IIP: {},
      Quaternion: {},
      States: {},
      Lat_Long_Alt: {},
      Polar: {},
      Sequence: {},
    };

    // Extract Dynamics data - direct conversion from Python
    if (mainVehicle.vehDynamics) {
      console.log(
        "DataIns: Processing Dynamics data, time points:",
        mainVehicle.vehDynamics.time?.length || 0
      );
      mainParamMap.Dynamics = {
        Mission_time: mainVehicle.vehDynamics.time || [],
        Phase_time: mainVehicle.vehDynamics.phaseTime || [],
        Mass: mainVehicle.vehDynamics.mass || [],
        Thrust: mainVehicle.vehDynamics.thrust || [],
        Vaccum_Thrust: mainVehicle.vehDynamics.vaccumThrust || [],
        Sensed_Acc: mainVehicle.vehDynamics.sensedAcc || [],
        Drag_Acc: mainVehicle.vehDynamics.dragAcc || [],
        Drag_Force: mainVehicle.vehDynamics.dragForce || [],
        Relative_velocity: mainVehicle.vehDynamics.relativeVel || [],
        Gravity_Acc: mainVehicle.vehDynamics.gravityAcc || [],
        Total_Acc: mainVehicle.vehDynamics.totalAcc || [],
        "ThrustAcc.x": mainVehicle.vehDynamics.thrustECI?.x || [],
        "ThrustAcc.y": mainVehicle.vehDynamics.thrustECI?.y || [],
        "ThrustAcc.z": mainVehicle.vehDynamics.thrustECI?.z || [],
        ThrustAccMag: mainVehicle.vehDynamics.thrustAccMag || [],
        "GravAcc.x": mainVehicle.vehDynamics.gravityECI?.x || [],
        "GravAcc.y": mainVehicle.vehDynamics.gravityECI?.y || [],
        "GravAcc.z": mainVehicle.vehDynamics.gravityECI?.z || [],
      };
      console.log(
        "DataIns: Mapped Dynamics Mission_time length:",
        mainParamMap.Dynamics.Mission_time.length
      );
    }

    // Extract AeroDynamics data - direct conversion from Python
    if (mainVehicle.vehAeroDynamics) {
      console.log(
        "DataIns: Processing AeroDynamics data, time points:",
        mainVehicle.vehAeroDynamics.time?.length || 0
      );
      mainParamMap.AeroDynamics = {
        Mission_time: mainVehicle.vehAeroDynamics.time || [],
        Mach: mainVehicle.vehAeroDynamics.mach || [],
        CD: mainVehicle.vehAeroDynamics.coeffAxial || [],
        "Dynamic Pressure": mainVehicle.vehAeroDynamics.dynamicPressure || [],
        "Angle of Attack": mainVehicle.vehAeroDynamics.AOA || [],
        "Q Alpha": mainVehicle.vehAeroDynamics.qAlpha || [],
        Alpha: mainVehicle.vehAeroDynamics.alpha || [],
        Beta: mainVehicle.vehAeroDynamics.beta || [],
        Pitch_Alpha: mainVehicle.vehAeroDynamics.pitchAlpha || [],
        Yaw_Alpha: mainVehicle.vehAeroDynamics.yawAlpha || [],
        Heat_Flux: mainVehicle.vehAeroDynamics.heatflux || [],
      };
      console.log(
        "DataIns: Mapped AeroDynamics Mission_time length:",
        mainParamMap.AeroDynamics.Mission_time.length
      );
    }

    // Extract Body_Rates data - direct conversion from Python
    if (mainVehicle.vehNavigation?.vehSteering?.bodyRates) {
      mainParamMap.Body_Rates = {
        Mission_time: mainVehicle.vehNavigation.time || [],
        Roll: mainVehicle.vehNavigation.vehSteering.bodyRates.x || [],
        Pitch: mainVehicle.vehNavigation.vehSteering.bodyRates.y || [],
        Yaw: mainVehicle.vehNavigation.vehSteering.bodyRates.z || [],
      };
    }

    // Extract Body_Angle data - direct conversion from Python
    if (mainVehicle.vehNavigation?.vehSteering?.bodyAngle) {
      mainParamMap.Body_Angle = {
        Mission_time: mainVehicle.vehNavigation.time || [],
        Roll: mainVehicle.vehNavigation.vehSteering.bodyAngle.x || [],
        Pitch: mainVehicle.vehNavigation.vehSteering.bodyAngle.y || [],
        Yaw: mainVehicle.vehNavigation.vehSteering.bodyAngle.z || [],
      };
    }

    // Extract Euler_Angle data - direct conversion from Python
    if (mainVehicle.vehNavigation?.vehSteering?.eulerAngle) {
      mainParamMap.Euler_Angle = {
        Mission_time: mainVehicle.vehNavigation.time || [],
        Phi: mainVehicle.vehNavigation.vehSteering.eulerAngle.x || [],
        Theta: mainVehicle.vehNavigation.vehSteering.eulerAngle.y || [],
        Psi: mainVehicle.vehNavigation.vehSteering.eulerAngle.z || [],
      };
    }

    // Extract IIP data - direct conversion from Python
    if (mainVehicle.vehIIP) {
      mainParamMap.IIP = {
        Mission_time: mainVehicle.vehIIP.time || [],
        Longitude: mainVehicle.vehIIP.longitude || [],
        Latitude: mainVehicle.vehIIP.latitude || [],
      };
    }

    // Extract Quaternion data - direct conversion from Python
    if (mainVehicle.vehNavigation?.vehSteering?.vehQuat) {
      mainParamMap.Quaternion = {
        Mission_time: mainVehicle.vehNavigation.time || [],
        Q1: mainVehicle.vehNavigation.vehSteering.vehQuat.q1 || [],
        Q2: mainVehicle.vehNavigation.vehSteering.vehQuat.q2 || [],
        Q3: mainVehicle.vehNavigation.vehSteering.vehQuat.q3 || [],
        Q4: mainVehicle.vehNavigation.vehSteering.vehQuat.q4 || [],
      };
    }

    // Extract States data - direct conversion from Python
    if (mainVehicle.vehNavigation?.vehStates) {
      mainParamMap.States = {
        Mission_time: mainVehicle.vehNavigation.time || [],
        X: mainVehicle.vehNavigation.vehStates.x || [],
        Y: mainVehicle.vehNavigation.vehStates.y || [],
        Z: mainVehicle.vehNavigation.vehStates.z || [],
        U: mainVehicle.vehNavigation.vehStates.u || [],
        V: mainVehicle.vehNavigation.vehStates.v || [],
        W: mainVehicle.vehNavigation.vehStates.w || [],
      };
    }

    // Extract Lat_Long_Alt data - direct conversion from Python
    if (mainVehicle.vehLLA) {
      mainParamMap.Lat_Long_Alt = {
        Mission_time: mainVehicle.vehLLA.time || [],
        Altitude: mainVehicle.vehLLA.altitude || [],
        R_Earth_Surface: mainVehicle.vehLLA.R_Earth_Surface || [],
        GeoCentric_Latitide: mainVehicle.vehLLA.geoCentricLatitude || [],
        GeoDetic_Latitide: mainVehicle.vehLLA.geoDeticLatitude || [],
        Relative_Longitude: mainVehicle.vehLLA.relativeLongitude || [],
        Inertial_Longitude: mainVehicle.vehLLA.inertialLongitude || [],
      };
    }

    // Extract Polar data - direct conversion from Python
    if (mainVehicle.vehPolar) {
      mainParamMap.Polar = {
        Mission_time: mainVehicle.vehPolar.time || [],
        Altitude: mainVehicle.vehPolar.altitude || [],
        Inertial_Velocity: mainVehicle.vehPolar.inerVel || [],
        Flight_Path_Angle: mainVehicle.vehPolar.fpa || [],
        Velocity_Azimuth: mainVehicle.vehPolar.velAzi || [],
        RMag: mainVehicle.vehPolar.rMag || [],
        VMag: mainVehicle.vehPolar.vMag || [],
      };
    }

    // Extract Sequence data - direct conversion from Python
    if (mainVehicle.vehSequence) {
      mainParamMap.Sequence = {
        Sequence: mainVehicle.vehSequence.vehSeqence || {},
        Steering: mainVehicle.vehSequence.vehSteerSequence || {},
      };
    }

    this.vehicleDataMap[vehicleName] = mainParamMap;

    console.log("DataIns: Final result structure:", Object.keys(mainParamMap));
    console.log(
      "DataIns: Dynamics available parameters:",
      Object.keys(mainParamMap.Dynamics || {})
    );
    console.log(
      "DataIns: AeroDynamics available parameters:",
      Object.keys(mainParamMap.AeroDynamics || {})
    );

    return mainParamMap;
  }

  getVehicleNames() {
    return Object.keys(this.vehicleDataMap);
  }

  getCategories() {
    return [
      "Dynamics",
      "AeroDynamics",
      "Body_Rates",
      "Body_Angle",
      "Euler_Angle",
      "Lat_Long_Alt",
      "IIP",
      "Quaternion",
      "States",
      "Polar",
      "Sequence",
    ];
  }
}

// Make PlotViewer globally available
window.PlotViewer = PlotViewer;
