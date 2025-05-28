# Event Sequence Drag & Drop Guide

## Overview

The Event Sequence in the ASTRA GUI now supports drag and drop functionality, allowing users to easily reorder events in their mission sequence. This feature enhances user experience by providing an intuitive way to manage event order without manually deleting and re-adding events.

## Features

### 🔧 Drag and Drop Capabilities

- **Visual Drag Handle**: Each event displays a grip icon (⋮⋮) on the left side when hovered
- **Smooth Reordering**: Drag events to any position in the sequence
- **Visual Feedback**: Events highlight during drag operations
- **Automatic Updates**: Event sequence data is automatically updated when reordered

### 💡 Interactive Tooltip

A helpful tooltip appears when hovering over the event list area that informs users:

- "Drag events to reorder • Click icons to edit or delete"

### 🎨 Visual Indicators

- **Drag Handle**: Appears on hover with grip dots icon
- **Dragging State**: Event becomes semi-transparent and slightly rotated
- **Drop Target**: Events highlight with blue border when dragged over
- **Smooth Animations**: All interactions have smooth CSS transitions

## How to Use

### 1. Adding Events

- Use the standard "Add Event" button to create events in your sequence
- Events will automatically have drag and drop capabilities

### 2. Reordering Events

1. **Hover** over any event to see the drag handle (⋮⋮) appear on the left
2. **Click and drag** the handle to move the event
3. **Drop** the event at the desired position
4. The sequence will automatically update and show a success message

### 3. Visual Feedback

- **Dragging**: The event being dragged will appear semi-transparent with a slight rotation
- **Drop Zones**: Valid drop targets will highlight with a blue glow
- **Success Notification**: A toast notification confirms successful reordering

## Technical Implementation

### CSS Classes

- `.event-item` - Base event styling with `cursor: grab`
- `.event-item.dragging` - Applied during drag operation
- `.event-item.drag-over` - Applied to valid drop targets
- `.drag-handle` - The grip icon that appears on hover
- `.drag-tooltip` - Informational tooltip

### JavaScript Events

- `dragstart` - Initiates drag operation
- `dragend` - Cleans up after drag operation
- `dragover` - Handles drag over valid targets
- `dragenter` - Visual feedback for entering drop zone
- `dragleave` - Removes feedback when leaving drop zone
- `drop` - Handles the actual reordering

### Data Management

- The `window.eventSequence` array is automatically updated
- Reference flag dropdowns are refreshed after reordering
- All event dependencies are maintained

## Browser Compatibility

The drag and drop functionality uses native HTML5 drag and drop APIs and is supported in:

- ✅ Chrome 4+
- ✅ Firefox 3.5+
- ✅ Safari 6+
- ✅ Edge 12+
- ✅ Opera 12+

## Testing

A test file `test_drag_drop.html` is provided to verify functionality:

1. Navigate to `front_end/test_drag_drop.html`
2. Click "Add Test Events" to populate sample events
3. Test drag and drop reordering
4. Verify visual feedback and success messages

## Code Structure

### Main Functions

- `addEventToSequence()` - Enhanced to include drag capabilities
- `handleDragStart()` - Initiates drag operation
- `handleDrop()` - Processes the drop and reorders events
- `reorderEventSequence()` - Updates the event sequence array
- `initializeEventSequenceDragDrop()` - Sets up the tooltip

### Event Listeners

Each event item gets the following listeners:

```javascript
eventItem.addEventListener("dragstart", handleDragStart);
eventItem.addEventListener("dragend", handleDragEnd);
eventItem.addEventListener("dragover", handleDragOver);
eventItem.addEventListener("drop", handleDrop);
eventItem.addEventListener("dragenter", handleDragEnter);
eventItem.addEventListener("dragleave", handleDragLeave);
```

## Best Practices

### User Experience

- Always show visual feedback during drag operations
- Provide clear tooltips and instructions
- Maintain data integrity during reordering
- Show confirmation messages for successful operations

### Development

- Ensure drag handles don't interfere with edit/delete buttons
- Maintain proper event cleanup to prevent memory leaks
- Update all dependent systems after reordering
- Test on multiple browsers and devices

## Troubleshooting

### Common Issues

1. **Drag handle not appearing**: Check CSS hover states
2. **Events not reordering**: Verify JavaScript event listeners
3. **Visual feedback missing**: Check CSS classes for drag states
4. **Data not updating**: Ensure `reorderEventSequence()` is called

### Debug Tips

- Use browser developer tools to inspect drag events
- Check console for any JavaScript errors
- Verify `window.eventSequence` array updates correctly
- Test with sample data using the test file

## Future Enhancements

Potential improvements for the drag and drop system:

- Multi-select drag and drop
- Keyboard navigation support
- Undo/redo functionality
- Enhanced animations and transitions
- Touch device support optimization

---

_This guide covers the drag and drop functionality implemented for the ASTRA GUI Event Sequence. For additional support or feature requests, please refer to the main project documentation._
