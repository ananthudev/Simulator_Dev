# Luna AI Chatbot - Implementation Guide

## Overview

Luna is an intelligent AI assistant specifically designed for the ASTRA mission design software. She provides context-aware help, troubleshooting guidance, and best practices for aerospace mission planning.

## 🎯 Features

### Core Capabilities

- **Context Awareness**: Understands current form sections and user progress
- **Real-time Help**: Provides immediate assistance based on current state
- **Validation Support**: Helps fix form validation errors
- **Knowledge Base**: Comprehensive ASTRA-specific information
- **AI Integration**: Supports OpenAI, Azure OpenAI, and local Ollama
- **Theme Integration**: Automatically matches ASTRA's themes
- **Modular Design**: Easy to enable, disable, or remove

### User Interface

- **Floating Chat Button**: Non-intrusive bottom-right positioning
- **Modern Chat Window**: Clean, professional design
- **Quick Action Buttons**: Common help tasks at a glance
- **Typing Indicators**: Visual feedback during AI responses
- **Notification System**: Proactive help suggestions

## 📁 File Structure

```
front_end/
├── assets/icons/
│   ├── luna-avatar.svg              # Luna's avatar image
│   └── luna-avatar.png              # PNG version (optional)
├── css/
│   └── luna-theme.css               # Complete styling
├── js/
│   ├── luna-chatbot.js              # Main chatbot controller
│   ├── luna-context-manager.js      # Form state monitoring
│   ├── luna-knowledge-base.js       # ASTRA knowledge base
│   └── luna-ai-service.js           # External AI integration
├── mission.html                     # Main application (integrated)
└── convert-luna-avatar.html         # SVG to PNG converter tool
```

## 🚀 Quick Start

### 1. Enable/Disable Luna

Luna is designed to be easily controlled. In `mission.html`, find the `LUNA_CONFIG` object:

```javascript
const LUNA_CONFIG = {
  enabled: true, // Set to false to disable Luna
  debug: false, // Enable debug logging
  position: "bottom-right",
  autoShow: false, // Auto-show on validation errors
  proactiveHelp: true, // Offer contextual suggestions
  maxContextLength: 10, // Conversation memory
};
```

### 2. Console Controls

Use these commands in the browser console:

```javascript
// Enable Luna
LunaControls.enable();

// Disable Luna (hides but keeps in memory)
LunaControls.disable();

// Completely remove Luna
LunaControls.destroy();

// Toggle Luna on/off
LunaControls.toggle();

// Update configuration
LunaControls.configure({ debug: true, position: "bottom-left" });
```

## 🔧 Configuration Options

### Basic Configuration

```javascript
const config = {
  enabled: true, // Enable/disable Luna
  debug: false, // Debug mode
  position: "bottom-right", // Chat button position
  autoShow: false, // Show on validation errors
  proactiveHelp: true, // Context-based suggestions
  maxContextLength: 10, // Conversation memory
  theme: "auto", // Theme matching
};
```

### Position Options

- `'bottom-right'` (default)
- `'bottom-left'`
- `'top-right'`
- `'top-left'`

## 🤖 AI Service Integration

### OpenAI Configuration

```javascript
// Basic OpenAI setup
window.lunaBot.aiService.configure("your-openai-api-key", "gpt-4");

// With custom endpoint
window.lunaBot.aiService.configure(
  "your-api-key",
  "gpt-4",
  "https://api.openai.com/v1/chat/completions"
);
```

### Azure OpenAI Configuration

```javascript
window.lunaBot.aiService.configureForAzure(
  "your-azure-key",
  "your-deployment-name",
  "your-resource-name"
);
```

### Local Ollama Configuration

```javascript
// Default local setup
window.lunaBot.aiService.configureForOllama();

// Custom model
window.lunaBot.aiService.configureForOllama("llama2");

// Custom endpoint
window.lunaBot.aiService.configureForOllama("llama2", "http://localhost:11434");
```

## 📋 Knowledge Base

Luna includes comprehensive ASTRA-specific knowledge:

### Sections Covered

- Mission Information
- Environment Settings
- Vehicle Configuration
- Stages & Motors
- Steering Parameters
- Optimization Settings
- Stopping Conditions

### Field Definitions

- Parameter descriptions
- Validation requirements
- Typical value ranges
- Units and examples
- Best practices

### Troubleshooting Guides

- Validation error resolution
- Performance optimization
- Convergence issues
- Trajectory stability

## 🎨 Theme Integration

Luna automatically adapts to ASTRA's themes:

### Supported Themes

- **Desktop Theme**: Light, professional
- **GMAT Theme**: Dark with orange accents
- **Modern Theme**: Clean, minimal
- **SpaceX Theme**: Dark with green accents

### Custom Theme Variables

```css
.luna-chat-window {
  --background-color: #ffffff;
  --text-color: #333333;
  --border-color: #e0e0e0;
  --primary-color: #667eea;
  --message-bg: #f0f0f0;
}
```

## 📱 Responsive Design

Luna adapts to different screen sizes:

### Desktop (> 480px)

- Full-sized chat window (380px width)
- Complete feature set
- Hover effects and animations

### Mobile (≤ 480px)

- Full-screen chat overlay
- Touch-optimized buttons
- Simplified layout

## 🔧 Advanced Customization

### Adding Custom Knowledge

Extend Luna's knowledge base:

```javascript
// Add custom section knowledge
window.lunaBot.knowledgeBase.knowledge.sections["custom-section"] = {
  title: "Custom Section",
  description: "Your custom section description",
  content: "Detailed help content...",
  fields: ["field1", "field2"],
};

// Add custom field definitions
window.lunaBot.knowledgeBase.knowledge.fields["customField"] = {
  description: "Field description",
  help: "Helpful tips",
  examples: ["example1", "example2"],
};
```

### Custom Event Handlers

```javascript
// Listen for Luna events
window.lunaBot.on("message-sent", (data) => {
  console.log("User message:", data.message);
});

window.lunaBot.on("response-received", (data) => {
  console.log("AI response:", data.response);
});
```

### Context Monitoring

```javascript
// Get current context
const context = window.lunaBot.contextManager.getCurrentContext();
console.log("Current section:", context.section);
console.log("Completion rate:", context.completionRate);
console.log("Has errors:", context.hasErrors);
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Luna Not Appearing

- Check `LUNA_CONFIG.enabled` is `true`
- Verify all script files are loaded
- Check browser console for errors

#### 2. AI Service Not Working

- Verify API key configuration
- Check network connectivity
- Review console error messages

#### 3. Knowledge Base Not Loading

- Ensure `luna-knowledge-base.js` is included
- Check for JavaScript errors
- Verify file paths are correct

### Debug Mode

Enable debug mode for detailed logging:

```javascript
LunaControls.configure({ debug: true });
```

### Test Connection

Test AI service connectivity:

```javascript
window.lunaBot.aiService
  .testConnection()
  .then((result) => console.log("Connection test:", result))
  .catch((error) => console.error("Connection failed:", error));
```

## 🔒 Security Considerations

### API Key Management

- Never commit API keys to version control
- Use environment variables in production
- Implement proper key rotation

### Content Filtering

- AI responses are automatically filtered
- Custom content validation can be added
- User input is sanitized

### Privacy

- Conversations are not stored permanently
- No personal data is transmitted by default
- GDPR compliance ready

## 🚀 Deployment

### Development

1. Ensure all files are in place
2. Configure `LUNA_CONFIG.enabled = true`
3. Test with knowledge base only
4. Add AI service if desired

### Production

1. Set `LUNA_CONFIG.debug = false`
2. Configure proper API endpoints
3. Implement API key security
4. Test all functionality

### Performance

- Luna is lightweight (~150KB total)
- Lazy loading for better performance
- Minimal DOM impact
- Efficient context monitoring

## 📊 Analytics Integration

Track Luna usage:

```javascript
// Track user interactions
window.lunaBot.on("message-sent", (data) => {
  analytics.track("luna-message", {
    section: data.context.section,
    intent: data.intent,
    timestamp: new Date(),
  });
});

// Track helpfulness
window.lunaBot.on("response-rating", (rating, message) => {
  analytics.track("luna-feedback", {
    rating: rating,
    message: message,
    helpful: rating >= 4,
  });
});
```

## 🔮 Future Enhancements

### Planned Features

- Voice input/output capability
- Multi-language support
- Advanced analytics dashboard
- Integration with ASTRA simulation results
- Collaborative features

### Extension Points

- Custom AI providers
- Additional knowledge domains
- Plugin system
- Advanced context awareness

## 📞 Support

### Getting Help

1. Check this documentation
2. Review console logs with debug mode
3. Test individual components
4. Check browser compatibility

### Contributing

1. Follow existing code patterns
2. Add tests for new features
3. Update documentation
4. Maintain backward compatibility

## 📄 License

Luna AI Chatbot is part of the ASTRA GUI project. See project license for details.

---

**Luna AI Assistant** - Making aerospace mission design more accessible and user-friendly. 🚀
