// Interactive Map Component for ASTRA GUI
// Integrates with DCISS_IMPACT and IIP constraints
document.addEventListener("DOMContentLoaded", function () {
  // Configuration for the map component
  const config = {
    defaultLocation: [13.735675, 80.23], // Default center
    defaultZoom: 5,
    maxMarkers: 5,
  };

  let map = null;
  let markers = [];
  let activeConstraintContainer = null;

  // Add variables to track line segments
  let lineSegments = { l1: [] }; // Initialize with line 1
  let activeSegment = "l1";
  let segmentLines = {}; // To store the Leaflet polylines

  // Initialize maps when a constraint with coordinates is selected/created
  document.addEventListener("change", function (e) {
    // Check if the element that changed is a constraint type selector
    if (e.target.classList.contains("constraint-name")) {
      const constraintType = e.target.value;
      if (
        constraintType === "DCISS_IMPACT" ||
        constraintType === "IIP" ||
        constraintType === "CUSTOM"
      ) {
        // Find the constraint container
        const constraintContainer = e.target.closest(".optimization-instance");
        if (constraintContainer) {
          setTimeout(() => {
            // Use setTimeout to allow constraint additional fields to be created first
            initializeMapForConstraint(constraintContainer, constraintType);
          }, 100);
        }
      }
    }

    // Also handle constraint type changes (Line, Box, Ellipse) for both DCISS_IMPACT and IIP
    if (e.target.classList.contains("constraint-dciss-type")) {
      const dcissType = e.target.value;
      const constraintContainer = e.target.closest(".optimization-instance");
      const constraintNameElement =
        constraintContainer?.querySelector(".constraint-name");

      if (
        constraintContainer &&
        constraintNameElement &&
        (constraintNameElement.value === "DCISS_IMPACT" ||
          constraintNameElement.value === "IIP" ||
          constraintNameElement.value === "CUSTOM")
      ) {
        // Add a slight delay to allow for DOM updates
        setTimeout(() => {
          initializeMapForConstraint(
            constraintContainer,
            constraintNameElement.value
          );
        }, 100);
      }
    }
  });

  // Check existing constraints on page load
  setTimeout(() => {
    document.querySelectorAll(".constraint-name").forEach((select) => {
      if (
        select.value === "DCISS_IMPACT" ||
        select.value === "IIP" ||
        select.value === "CUSTOM"
      ) {
        const container = select.closest(".optimization-instance");
        if (container) {
          // For IIP/CUSTOM constraints, we need to also check if the type is selected
          if (select.value === "IIP" || select.value === "CUSTOM") {
            const dcissTypeSelect = container.querySelector(
              ".constraint-dciss-type"
            );
            // Only initialize if a constraint type (Line/Box/Ellipse) is selected
            if (dcissTypeSelect && dcissTypeSelect.value) {
              initializeMapForConstraint(container, select.value);
            }
          } else {
            // For DCISS_IMPACT, initialize normally
            initializeMapForConstraint(container, select.value);
          }
        }
      }
    });
  }, 1000);

  // Initialize map for a specific constraint container
  function initializeMapForConstraint(constraintContainer, constraintType) {
    activeConstraintContainer = constraintContainer;

    // Find the appropriate target container based on constraint type
    let targetContainer;
    if (constraintType === "IIP" || constraintType === "CUSTOM") {
      // For IIP (CUSTOM), we need to check the constraint type selection
      const dcissType = constraintContainer.querySelector(
        ".constraint-dciss-type"
      )?.value;

      // Skip map creation for Ellipse type, just like in DCISS
      if (dcissType === "Ellipse") {
        return;
      }

      // Only proceed if a constraint type is selected (Line or Box)
      if (dcissType) {
        // Find the map placeholder and use that area
        const placeholder =
          constraintContainer.querySelector(".map-placeholder");
        if (placeholder) {
          targetContainer = placeholder.parentElement;
          // Replace the placeholder with an empty div (we'll put the map here)
          placeholder.innerHTML = "";
        } else {
          targetContainer = constraintContainer.querySelector(
            ".dciss-parameters-container"
          );
        }
      } else {
        // Constraint type not selected yet, wait for it
        return;
      }
    } else if (constraintType === "DCISS_IMPACT") {
      const dcissType = constraintContainer.querySelector(
        ".constraint-dciss-type"
      )?.value;

      // Skip map creation for Ellipse type
      if (dcissType === "Ellipse") {
        return;
      }

      if (dcissType) {
        // Find the map placeholder and use that area
        const placeholder =
          constraintContainer.querySelector(".map-placeholder");
        if (placeholder) {
          targetContainer = placeholder.parentElement;
          // Replace the placeholder with an empty div (we'll put the map here)
          placeholder.innerHTML = "";
        } else {
          targetContainer = constraintContainer.querySelector(
            ".dciss-parameters-container"
          );
        }
      } else {
        // DCISS type not selected yet, wait for it
        return;
      }
    }

    if (!targetContainer) return;

    // Check if map container already exists
    let mapInterface = targetContainer.querySelector(".map-interface");

    // If not, create and add the map interface to the constraint
    if (!mapInterface) {
      // Create map interface HTML
      mapInterface = document.createElement("div");
      mapInterface.className = "map-interface";
      mapInterface.innerHTML = `
                <div class="map-container">
                    <div id="constraint-map-${Date.now()}" class="constraint-map"></div>
                </div>
                <div class="line-segments-control">
                    <div class="form-group">
                        <label class="label">Active Line Segment:</label>
                        <select class="input-field line-segment-selector">
                            <option value="l1">Line 1</option>
                        </select>
                        <button type="button" class="add-segment-btn">+ Add New Line Segment</button>
                    </div>
                </div>
                <table class="coordinates-table">
                    <thead>
                        <tr>
                            <th>Line</th>
                            <th>Latitude</th>
                            <th>Longitude</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody class="coordinates-list"></tbody>
                </table>
                <div class="add-coordinate-controls">
                    <div class="form-group">
                        <label class="label">Latitude:</label>
                        <input type="number" class="input-field lat-input" step="any" placeholder="Enter latitude">
                    </div>
                    <div class="form-group">
                        <label class="label">Longitude:</label>
                        <input type="number" class="input-field lng-input" step="any" placeholder="Enter longitude">
                    </div>
                    <button type="button" class="add-coordinate-btn">Add Coordinate</button>
                </div>
                <div class="map-instructions">
                    <p><strong>Instructions:</strong> Coordinates in pairs form line segments. Each line segment (Line 1, Line 2, etc.) represents a separate boundary.</p>
                </div>
            `;

      // Add to the target container
      targetContainer.appendChild(mapInterface);

      // Set up event listeners for the coordinate controls
      const addButton = mapInterface.querySelector(".add-coordinate-btn");
      addButton.addEventListener("click", function () {
        const latInput = mapInterface.querySelector(".lat-input");
        const lngInput = mapInterface.querySelector(".lng-input");

        if (latInput.value && lngInput.value) {
          const lat = parseFloat(latInput.value);
          const lng = parseFloat(lngInput.value);

          if (!isNaN(lat) && !isNaN(lng)) {
            addMarker([lat, lng]);
            latInput.value = "";
            lngInput.value = "";
            updateConstraintValue();
          }
        }
      });

      // Set up event listeners for segment controls
      const segmentSelector = mapInterface.querySelector(
        ".line-segment-selector"
      );
      const addSegmentBtn = mapInterface.querySelector(".add-segment-btn");

      if (segmentSelector) {
        segmentSelector.addEventListener("change", function () {
          activeSegment = this.value;
          highlightActiveSegment();
        });
      }

      if (addSegmentBtn) {
        addSegmentBtn.addEventListener("click", function () {
          const segmentCount = Object.keys(lineSegments).length + 1;
          const newSegmentKey = `l${segmentCount}`;

          // Add new segment option to selector
          const option = document.createElement("option");
          option.value = newSegmentKey;
          option.textContent = `Line ${segmentCount}`;
          segmentSelector.appendChild(option);

          // Select the new segment
          segmentSelector.value = newSegmentKey;
          activeSegment = newSegmentKey;

          // Initialize the new segment
          lineSegments[newSegmentKey] = [];

          // Update the UI
          highlightActiveSegment();
        });
      }
    }

    // Initialize the map if not done already
    const mapId = mapInterface.querySelector(".constraint-map").id;
    if (!map || map._container.id !== mapId) {
      // If a previous map exists, clean up
      if (map) {
        map.remove();
        markers = [];
      }

      // Initialize new map
      map = L.map(mapId, {
        center: config.defaultLocation,
        zoom: config.defaultZoom,
      });

      // Add tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | Astra GUI by <a href="https://thespacelabs.com" target="_blank">SpaceLabs</a>',
      }).addTo(map);

      // Add click handler to add markers
      map.on("click", function (e) {
        const latLng = [e.latlng.lat, e.latlng.lng];
        addMarker(latLng);
        updateConstraintValue();
      });

      // Force a resize to ensure map displays correctly
      setTimeout(() => {
        map.invalidateSize();
      }, 100);

      // Load existing coordinates if available
      loadExistingCoordinates(constraintContainer, constraintType);
    }
  }

  // Modify the addMarker function to associate markers with line segments
  function addMarker(latLng) {
    if (!activeSegment) return;

    // Check if we've reached the limit for this line segment (2 markers per segment)
    if (lineSegments[activeSegment].length >= 2) {
      alert(
        "Each line segment can only have 2 points. Please create a new line segment."
      );
      return;
    }

    // Add marker to the map
    const marker = L.marker(latLng, {
      draggable: true,
    }).addTo(map);

    // Store marker with its segment
    marker.segmentKey = activeSegment;

    // Store marker in array for active segment
    if (!lineSegments[activeSegment]) {
      lineSegments[activeSegment] = [];
    }
    lineSegments[activeSegment].push(marker);

    // Add drag end event to update when marker is moved
    marker.on("dragend", function () {
      updateCoordinatesTable();
      updateConstraintValue();
      updateLineSegments();
    });

    // Add to table
    updateCoordinatesTable();

    // Update line segments
    updateLineSegments();

    // Fit bounds considering all markers
    const allMarkers = getAllMarkers();
    if (allMarkers.length > 1) {
      const bounds = L.latLngBounds(allMarkers.map((m) => m.getLatLng()));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }

  // Helper function to get all markers from all segments
  function getAllMarkers() {
    let allMarkers = [];
    Object.values(lineSegments).forEach((markers) => {
      allMarkers = allMarkers.concat(markers);
    });
    return allMarkers;
  }

  // Update the coordinates table to show line segment info
  function updateCoordinatesTable() {
    if (!activeConstraintContainer) return;

    const coordsList =
      activeConstraintContainer.querySelector(".coordinates-list");
    if (!coordsList) return;

    // Clear existing rows
    coordsList.innerHTML = "";

    // Add rows for each segment and its markers
    Object.entries(lineSegments).forEach(([segmentKey, segmentMarkers]) => {
      segmentMarkers.forEach((marker, markerIndex) => {
        const latLng = marker.getLatLng();
        const row = document.createElement("tr");

        // Extract segment number from key (l1 -> Line 1)
        const segmentNumber = segmentKey.replace("l", "");

        row.innerHTML = `
                    <td>Line ${segmentNumber}</td>
                    <td>${latLng.lat.toFixed(6)}</td>
                    <td>${latLng.lng.toFixed(6)}</td>
                    <td class="coord-actions">
                        <button type="button" class="coord-btn center" title="Center on map">⌖</button>
                        <button type="button" class="coord-btn delete" title="Delete">×</button>
                    </td>
                `;

        // Add class if this is part of the active segment
        if (segmentKey === activeSegment) {
          row.classList.add("active-segment-row");
        }

        // Add event listeners for actions
        const centerBtn = row.querySelector(".coord-btn.center");
        centerBtn.addEventListener("click", function () {
          map.setView(latLng, 10);
        });

        const deleteBtn = row.querySelector(".coord-btn.delete");
        deleteBtn.addEventListener("click", function () {
          // Remove marker from map
          map.removeLayer(marker);

          // Remove marker from segment array
          const markerIndex = lineSegments[segmentKey].indexOf(marker);
          if (markerIndex !== -1) {
            lineSegments[segmentKey].splice(markerIndex, 1);
          }

          // Update UI
          updateCoordinatesTable();
          updateConstraintValue();
          updateLineSegments();
        });

        coordsList.appendChild(row);
      });
    });
  }

  // Draw lines connecting markers in each segment
  function updateLineSegments() {
    // Remove all existing lines
    Object.values(segmentLines).forEach((line) => {
      if (map.hasLayer(line)) {
        map.removeLayer(line);
      }
    });
    segmentLines = {};

    // Create new lines for each segment
    Object.entries(lineSegments).forEach(([segmentKey, segmentMarkers]) => {
      if (segmentMarkers.length >= 2) {
        const points = segmentMarkers.map((marker) => marker.getLatLng());

        // Different colors for different line segments
        const colors = {
          l1: "#4a90e2", // Blue
          l2: "#50e3c2", // Teal
          l3: "#e6a545", // Orange
          l4: "#bd10e0", // Purple
        };

        const color = colors[segmentKey] || "#e3506f"; // Default to pink for additional lines
        const weight = segmentKey === activeSegment ? 4 : 2; // Active segment has thicker line

        // Create polyline with color based on segment key
        const polyline = L.polyline(points, {
          color: color,
          weight: weight,
          opacity: 0.8,
          dashArray: segmentKey === activeSegment ? null : "5, 5", // Dashed for inactive segments
        }).addTo(map);

        segmentLines[segmentKey] = polyline;
      }
    });
  }

  // Highlight the active segment on the map
  function highlightActiveSegment() {
    // Update the line weights and styles
    updateLineSegments();

    // Update the table highlighting
    updateCoordinatesTable();
  }

  // Update the constraint value with segmented coordinates
  function updateConstraintValue() {
    if (!activeConstraintContainer) return;

    // Find the appropriate target field based on constraint type
    const constraintType =
      activeConstraintContainer.querySelector(".constraint-name").value;
    let targetField;

    if (
      constraintType === "IIP" ||
      constraintType === "CUSTOM" ||
      constraintType === "DCISS_IMPACT"
    ) {
      const dcissType = activeConstraintContainer.querySelector(
        ".constraint-dciss-type"
      )?.value;

      if (dcissType === "Line") {
        targetField = activeConstraintContainer.querySelector(
          ".constraint-dciss-line-bounds"
        );
      } else if (dcissType === "Box") {
        targetField = activeConstraintContainer.querySelector(
          ".constraint-dciss-line-bound"
        );
      }
    }

    // Format coordinates as per segments for the line_bounds field
    if (targetField) {
      const segmentedCoords = {};

      Object.entries(lineSegments).forEach(([segmentKey, markers]) => {
        if (markers.length > 0) {
          segmentedCoords[segmentKey] = markers.map((marker) => {
            const latLng = marker.getLatLng();
            return [latLng.lat, latLng.lng];
          });
        }
      });

      // Only update if we have some coordinates
      if (Object.keys(segmentedCoords).length > 0) {
        targetField.value = JSON.stringify(segmentedCoords);
      }
    }
  }

  // Load existing coordinates and recreate the segments
  function loadExistingCoordinates(constraintContainer, constraintType) {
    let coordinatesField;
    let coordinates = [];

    if (
      constraintType === "IIP" ||
      constraintType === "CUSTOM" ||
      constraintType === "DCISS_IMPACT"
    ) {
      const dcissType = constraintContainer.querySelector(
        ".constraint-dciss-type"
      )?.value;

      if (dcissType === "Line") {
        coordinatesField = constraintContainer.querySelector(
          ".constraint-dciss-line-bounds"
        );
      } else if (dcissType === "Box") {
        coordinatesField = constraintContainer.querySelector(
          ".constraint-dciss-line-bound"
        );
      }
    }

    // Reset the segments
    lineSegments = { l1: [] };
    activeSegment = "l1";

    // Clear segment selector
    const segmentSelector = constraintContainer.querySelector(
      ".line-segment-selector"
    );
    if (segmentSelector) {
      segmentSelector.innerHTML = '<option value="l1">Line 1</option>';
    }

    // Parse coordinates from field
    if (coordinatesField && coordinatesField.value) {
      try {
        const parsed = JSON.parse(coordinatesField.value);

        // Check if this is the new format (object with l1, l2, l3)
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          Object.entries(parsed).forEach(([segmentKey, coords]) => {
            // Add segment to selector if not l1
            if (segmentKey !== "l1" && segmentSelector) {
              const segmentNumber = segmentKey.replace("l", "");
              const option = document.createElement("option");
              option.value = segmentKey;
              option.textContent = `Line ${segmentNumber}`;
              segmentSelector.appendChild(option);
            }

            // Initialize segment if needed
            lineSegments[segmentKey] = [];

            // Add markers for this segment
            if (Array.isArray(coords)) {
              activeSegment = segmentKey; // Set active segment to add markers to the right segment
              coords.forEach((coord) => {
                if (Array.isArray(coord) && coord.length === 2) {
                  addMarker(coord);
                }
              });
            }
          });
        } else if (Array.isArray(parsed)) {
          // Old format: array of coordinates - all for l1
          activeSegment = "l1";
          parsed.forEach((coord) => {
            if (Array.isArray(coord) && coord.length === 2) {
              addMarker(coord);
            }
          });
        }
      } catch (e) {
        console.error("Error parsing coordinates:", e);
      }
    }

    // Reset active segment to l1
    activeSegment = "l1";
    if (segmentSelector) {
      segmentSelector.value = "l1";
    }

    // Update UI
    updateCoordinatesTable();
    updateLineSegments();
    highlightActiveSegment();
  }
});
