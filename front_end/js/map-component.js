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
                <table class="coordinates-table">
                    <thead>
                        <tr>
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

  // Add a marker to the map and table
  function addMarker(latLng) {
    if (markers.length >= config.maxMarkers) {
      alert(`Maximum of ${config.maxMarkers} markers allowed.`);
      return;
    }

    // Add marker to the map
    const marker = L.marker(latLng, {
      draggable: true,
    }).addTo(map);

    // Store marker in array
    markers.push(marker);

    // Add drag end event to update when marker is moved
    marker.on("dragend", function () {
      updateCoordinatesTable();
      updateConstraintValue();
    });

    // Add to table
    updateCoordinatesTable();

    // Fit bounds if multiple markers
    if (markers.length > 1) {
      const bounds = L.latLngBounds(markers.map((m) => m.getLatLng()));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }

  // Update the coordinates table
  function updateCoordinatesTable() {
    if (!activeConstraintContainer) return;

    const coordsList =
      activeConstraintContainer.querySelector(".coordinates-list");
    if (!coordsList) return;

    // Clear existing rows
    coordsList.innerHTML = "";

    // Add a row for each marker
    markers.forEach((marker, index) => {
      const latLng = marker.getLatLng();
      const row = document.createElement("tr");

      row.innerHTML = `
                <td>${latLng.lat.toFixed(6)}</td>
                <td>${latLng.lng.toFixed(6)}</td>
                <td class="coord-actions">
                    <button type="button" class="coord-btn center" title="Center on map">⌖</button>
                    <button type="button" class="coord-btn delete" title="Delete">×</button>
                </td>
            `;

      // Add event listeners for actions
      const centerBtn = row.querySelector(".coord-btn.center");
      centerBtn.addEventListener("click", function () {
        map.setView(latLng, 10);
      });

      const deleteBtn = row.querySelector(".coord-btn.delete");
      deleteBtn.addEventListener("click", function () {
        map.removeLayer(marker);
        markers.splice(index, 1);
        updateCoordinatesTable();
        updateConstraintValue();
      });

      coordsList.appendChild(row);
    });
  }

  // Update the constraint's value field with the coordinates
  function updateConstraintValue() {
    if (!activeConstraintContainer) return;

    // Convert markers to coordinate pairs
    const coordinates = markers.map((marker) => {
      const latLng = marker.getLatLng();
      return [latLng.lat, latLng.lng];
    });

    // Find the appropriate target field based on constraint type
    const constraintType =
      activeConstraintContainer.querySelector(".constraint-name").value;
    let targetField;

    if (constraintType === "IIP" || constraintType === "CUSTOM") {
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
      } else if (dcissType === "Ellipse") {
        // For Ellipse type, we don't use the map for coordinates
        return;
      }
    } else if (constraintType === "DCISS_IMPACT") {
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
      } else if (dcissType === "Ellipse") {
        // For Ellipse type, we don't use the map for coordinates
        return;
      }
    }

    // Update the target field if found - since this is now a hidden field we just set the value
    if (targetField && coordinates.length > 0) {
      targetField.value = JSON.stringify(coordinates);
    }
  }

  // Load existing coordinates from the constraint
  function loadExistingCoordinates(constraintContainer, constraintType) {
    let coordinatesField;
    let coordinates = [];

    if (constraintType === "IIP" || constraintType === "CUSTOM") {
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
      } else if (dcissType === "Ellipse") {
        // Skip adding markers for Ellipse type - map is not used
        return;
      }
    } else if (constraintType === "DCISS_IMPACT") {
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
      } else if (dcissType === "Ellipse") {
        // Skip adding markers for Ellipse type - map is not used
        return;
      }
    }

    // Parse coordinates from field
    if (coordinatesField && coordinatesField.value) {
      try {
        const parsed = JSON.parse(coordinatesField.value);
        if (Array.isArray(parsed)) {
          // Check if this is an array of arrays (coordinates)
          if (parsed.length > 0 && Array.isArray(parsed[0])) {
            coordinates = parsed;
          } else if (typeof parsed[0] === "number" && parsed.length === 2) {
            // Single coordinate pair [lat, lng]
            coordinates = [parsed];
          }
        }
      } catch (e) {
        console.error("Error parsing coordinates:", e);
      }
    }

    // Add markers for each coordinate
    coordinates.forEach((coord) => {
      if (Array.isArray(coord) && coord.length === 2) {
        addMarker(coord);
      }
    });

    // Update the table
    updateCoordinatesTable();
  }
});
