# Leaflet Map Enhancements - TODO List

## UI/UX Improvements for Leaflet Maps

### 1. Measurement Tools

- Implement Leaflet.draw plugin with distance and area measurement capabilities
- Add button to toggle measurement mode in map controls
- Display measurement results in a small overlay panel
- Include units toggle (meters/kilometers, miles/feet)

### 2. Custom Map Controls

- Design a more intuitive control panel with custom buttons for:
  - Drawing constraints
  - Editing existing lines
  - Deleting markers/lines
  - Toggling grid
  - Resetting view
- Position controls in a consolidated panel for better usability

### 3. Layer Control Panel

- Implement a layer selector to toggle between:
  - Different basemap styles (satellite, terrain, street)
  - Custom overlays for constraint visualization
  - Optional data layers (e.g., elevation data, custom markers)
- Style the control panel to match the application's dark theme

### 4. Minimap

- Add a small overview map in the corner using Leaflet-MiniMap plugin
- Style the minimap to complement the main map
- Allow user to toggle minimap visibility

### 5. Search Functionality

- Implement geocoding search bar to find and navigate to locations
- Use Nominatim or MapBox Geocoding API
- Add autocomplete for search suggestions
- Include a "fly to" animation when selecting results

### 6. Export Options

- Add functionality to export constraint data as:
  - GeoJSON
  - KML
  - CSV coordinates
- Include button in map controls for export options
- Add preview of export data option

### 7. Dynamic Tooltips

- Show helpful information when hovering over:
  - Points (coordinates, elevation if available)
  - Lines (length, bearing, constraint values)
- Style tooltips to match the dark theme
- Include option to pin tooltips for mobile users

### 8. Elevation Profile

- Implement elevation profile display for line constraints
- Use Leaflet.Elevation plugin
- Show altitude along the constraint path
- Add elevation statistics (min, max, average)

### 9. Snap-to-Grid Functionality

- Add option to snap points to a configurable grid
- Include button to toggle snap-to-grid feature
- Provide grid size adjustment control
- Visualize the grid with subtle lines

### 10. Constraint Visualization Enhancements

- Implement different line styles to represent constraint types:
  - Dashed lines for certain constraint types
  - Dotted lines for others
  - Varying widths to represent priority or importance
- Add a legend explaining the different styles
- Use consistent color coding for constraint categories

### 11. Undo/Redo Functionality

- Implement history management for drawing operations
- Add undo/redo buttons to map control panel
- Store state changes in a local history stack
- Limit history depth to prevent memory issues

### 12. Full-Screen Mode

- Add button to expand map to full screen
- Use Leaflet.fullscreen plugin
- Maintain all controls and functionality in full-screen mode
- Include keyboard shortcut (ESC to exit)

### 13. Coordinate Display

- Show current cursor coordinates in multiple formats:
  - Decimal degrees
  - Degrees, Minutes, Seconds (DMS)
  - UTM coordinates
- Add coordinate format toggle
- Update coordinates in real-time as cursor moves

### 14. Mobile-Friendly Controls

- Optimize touch controls for tablet/mobile use
- Increase button sizes for touch interaction
- Add gesture support (pinch-to-zoom, two-finger rotate)
- Implement a responsive layout for the map interface

### 15. Contextual Help Overlay

- Create interactive guides explaining map features
- Highlight different tools with tooltips on first use
- Add a "tour" feature to walk through available functionality
- Include dismissible help buttons near complex controls

## Implementation Priority

1. Measurement tools and custom map controls (essential functionality)
2. Layer control panel and constraint visualization enhancements (better visualization)
3. Coordinate display and snap-to-grid (improved precision)
4. Export options and undo/redo (data management)
5. Dynamic tooltips and contextual help (better user guidance)
6. Mobile-friendly controls and full-screen mode (improved accessibility)
7. Minimap and search functionality (navigation improvements)
8. Elevation profile (advanced feature)

## Resources and Libraries

- Leaflet.draw: https://leaflet.github.io/Leaflet.draw/
- Leaflet-MiniMap: https://github.com/Norkart/Leaflet-MiniMap
- Leaflet.fullscreen: https://github.com/brunob/leaflet.fullscreen
- Leaflet.Elevation: https://github.com/MrMufflon/Leaflet.Elevation
- Leaflet.GeometryUtil: https://github.com/makinacorpus/Leaflet.GeometryUtil
