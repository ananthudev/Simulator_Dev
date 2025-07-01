# Luna AI Chatbot Implementation Guide

## Overview

Luna is an intelligent AI assistant designed specifically for the ASTRA mission design software. It provides contextual help, guidance, and troubleshooting support to users throughout their mission design workflow.

### Key Features

- **Context-Aware**: Understands current form/section and provides relevant help
- **Knowledge Base**: Trained on ASTRA user manual and technical documentation
- **Non-Intrusive UI**: Floating widget that doesn't interfere with main workflow
- **Quick Actions**: Pre-built responses for common tasks
- **Real-time Assistance**: Monitors form completion and offers proactive help
- **Multi-Modal Support**: Text input with planned voice integration

### Architecture Overview

```
Luna AI System
├── UI Components
│   ├── Floating Chat Button
│   ├── Chat Panel (Messages, Input, Quick Actions)
│   └── Theme Integration
├── Core Engine
│   ├── Context Manager (Form state awareness)
│   ├── Knowledge Base (ASTRA-specific content)
│   ├── AI Service (OpenAI/Local AI integration)
│   └── Conversation Manager
├── Integration Layer
│   ├── Form State Monitoring
│   ├── Event Flag Registry Access
│   └── Mission Data Integration
└── Data Sources
    ├── User Manual Content
    ├── Field Definitions
    ├── Error Messages & Solutions
    └── Best Practices Guide
```

## Implementation Strategy

### Phase 1: Core Infrastructure

1. Create floating chat widget
2. Implement basic context awareness
3. Set up knowledge base structure
4. Integrate with existing theme system

### Phase 2: AI Integration

1. Connect to AI service (OpenAI/Local)
2. Implement conversation management
3. Add contextual response generation
4. Test knowledge base accuracy

### Phase 3: Advanced Features

1. Add proactive assistance
2. Implement quick actions
3. Add voice input/output
4. Create learning from user interactions

### Phase 4: Optimization

1. Performance optimization
2. Offline capability
3. Advanced context understanding
4. Integration with simulation results

## File Structure

```
front_end/
├── js/
│   ├── luna-chatbot.js          # Main chatbot class
│   ├── luna-context-manager.js  # Context awareness
│   ├── luna-knowledge-base.js   # Knowledge management
│   └── luna-ai-service.js       # AI integration
├── css/
│   └── luna-theme.css           # Chatbot styling
├── data/
│   ├── luna-knowledge-base.json # Knowledge content
│   └── luna-examples.json       # Usage examples
└── assets/
    └── luna/
        ├── avatar.svg           # Luna avatar
        └── icons/               # UI icons
```

## Detailed Implementation

### 1. Main Chatbot Class (`front_end/js/luna-chatbot.js`)

```javascript
class LunaChatbot {
  constructor() {
    this.isOpen = false;
    this.conversationHistory = [];
    this.currentContext = null;
    this.knowledgeBase = null;
    this.aiService = null;
    this.contextManager = null;
    this.init();
  }

  async init() {
    // Initialize dependencies
    this.contextManager = new ContextManager();
    this.knowledgeBase = new KnowledgeBase();
    this.aiService = new AIService();

    // Create UI components
    this.createChatWidget();
    this.attachEventListeners();

    // Load knowledge base
    await this.knowledgeBase.loadKnowledgeBase();

    // Start context monitoring
    this.startContextMonitoring();

    console.log("Luna AI Assistant initialized successfully");
  }

  createChatWidget() {
    // Create floating chat button
    const chatButton = document.createElement("div");
    chatButton.id = "luna-chat-button";
    chatButton.innerHTML = `
      <div class="luna-avatar">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M12 2L13.09 8.26L19 7L14.74 11.26L21 12L14.74 12.74L19 17L13.09 15.74L12 22L10.91 15.74L5 17L9.26 12.74L3 12L9.26 11.26L5 7L10.91 8.26L12 2Z"/>
        </svg>
        <span class="luna-name">Luna</span>
      </div>
      <div class="notification-badge" style="display: none;">1</div>
    `;

    // Create chat panel
    const chatPanel = document.createElement("div");
    chatPanel.id = "luna-chat-panel";
    chatPanel.innerHTML = this.createChatPanelHTML();

    // Add to DOM
    document.body.appendChild(chatButton);
    document.body.appendChild(chatPanel);
  }

  createChatPanelHTML() {
    return `
      <div class="luna-header">
        <div class="luna-title">
          <span class="luna-status-dot"></span>
          Luna - ASTRA Assistant
        </div>
        <div class="luna-controls">
          <button class="luna-minimize" title="Minimize">−</button>
          <button class="luna-close" title="Close">×</button>
        </div>
      </div>
      
      <div class="luna-messages" id="luna-messages">
        <div class="luna-message luna-bot">
          <div class="message-avatar">L</div>
          <div class="message-content">
            <p>Hello! I'm Luna, your ASTRA mission design assistant. I can help you with:</p>
            <ul>
              <li>Understanding mission parameters and configurations</li>
              <li>Vehicle setup and staging guidance</li>
              <li>Optimization strategies and algorithms</li>
              <li>Troubleshooting validation errors</li>
              <li>Best practices for mission design</li>
            </ul>
            <p>What would you like to know about your current mission?</p>
          </div>
        </div>
      </div>
      
      <div class="luna-quick-actions">
        <button class="quick-action" data-action="current-form">Help with current section</button>
        <button class="quick-action" data-action="optimization">Optimization guide</button>
        <button class="quick-action" data-action="vehicle-config">Vehicle setup</button>
        <button class="quick-action" data-action="troubleshoot">Troubleshoot errors</button>
      </div>
      
      <div class="luna-input-area">
        <div class="input-container">
          <textarea id="luna-input" placeholder="Ask Luna anything about ASTRA..." rows="1"></textarea>
          <button id="luna-send" disabled>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z"/>
            </svg>
          </button>
        </div>
        <div class="luna-footer">
          <span class="context-indicator" id="context-indicator">Context: Welcome</span>
          <span class="typing-indicator" style="display: none;">Luna is thinking...</span>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    const chatButton = document.getElementById("luna-chat-button");
    const chatPanel = document.getElementById("luna-chat-panel");
    const closeBtn = chatPanel.querySelector(".luna-close");
    const minimizeBtn = chatPanel.querySelector(".luna-minimize");
    const sendBtn = document.getElementById("luna-send");
    const inputArea = document.getElementById("luna-input");

    // Toggle chat panel
    chatButton.addEventListener("click", () => this.toggleChat());

    // Close chat panel
    closeBtn.addEventListener("click", () => this.closeChat());

    // Minimize chat panel
    minimizeBtn.addEventListener("click", () => this.minimizeChat());

    // Send message
    sendBtn.addEventListener("click", () => this.sendMessage());

    // Auto-resize textarea and send on Enter
    inputArea.addEventListener("input", (e) => {
      this.autoResizeTextarea(e.target);
      this.toggleSendButton();
    });

    inputArea.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // Quick actions
    chatPanel.addEventListener("click", (e) => {
      if (e.target.classList.contains("quick-action")) {
        const action = e.target.dataset.action;
        this.handleQuickAction(action);
      }
    });
  }

  toggleChat() {
    const chatPanel = document.getElementById("luna-chat-panel");
    this.isOpen = !this.isOpen;

    if (this.isOpen) {
      chatPanel.style.display = "flex";
      this.updateContext();
      document.getElementById("luna-input").focus();
    } else {
      chatPanel.style.display = "none";
    }
  }

  closeChat() {
    this.isOpen = false;
    document.getElementById("luna-chat-panel").style.display = "none";
  }

  minimizeChat() {
    // Implementation for minimize functionality
    const chatPanel = document.getElementById("luna-chat-panel");
    chatPanel.classList.toggle("minimized");
  }

  autoResizeTextarea(textarea) {
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 100) + "px";
  }

  toggleSendButton() {
    const input = document.getElementById("luna-input");
    const sendBtn = document.getElementById("luna-send");
    sendBtn.disabled = !input.value.trim();
  }

  async sendMessage() {
    const input = document.getElementById("luna-input");
    const message = input.value.trim();

    if (!message) return;

    // Add user message to chat
    this.addMessage(message, "user");

    // Clear input
    input.value = "";
    this.autoResizeTextarea(input);
    this.toggleSendButton();

    // Show typing indicator
    this.showTypingIndicator();

    try {
      // Get current context
      this.updateContext();

      // Generate AI response
      const response = await this.aiService.sendMessage(
        message,
        this.currentContext,
        this.knowledgeBase
      );

      // Add AI response to chat
      this.addMessage(response, "bot");
    } catch (error) {
      console.error("Error generating response:", error);
      this.addMessage(
        "I apologize, but I encountered an error. Please try again.",
        "bot"
      );
    } finally {
      this.hideTypingIndicator();
    }
  }

  addMessage(content, sender) {
    const messagesContainer = document.getElementById("luna-messages");
    const messageDiv = document.createElement("div");
    messageDiv.className = `luna-message luna-${sender}`;

    const avatar = sender === "bot" ? "L" : "U";
    const avatarClass = sender === "bot" ? "luna-bot" : "luna-user";

    messageDiv.innerHTML = `
      <div class="message-avatar">${avatar}</div>
      <div class="message-content">
        ${this.formatMessage(content)}
      </div>
    `;

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Store in conversation history
    this.conversationHistory.push({
      content,
      sender,
      timestamp: new Date(),
      context: this.currentContext,
    });
  }

  formatMessage(content) {
    // Convert markdown-like formatting to HTML
    let formatted = content
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`(.*?)`/g, "<code>$1</code>")
      .replace(/\n/g, "<br>");

    return formatted;
  }

  showTypingIndicator() {
    document.querySelector(".typing-indicator").style.display = "block";
  }

  hideTypingIndicator() {
    document.querySelector(".typing-indicator").style.display = "none";
  }

  updateContext() {
    this.currentContext = this.contextManager.getCurrentContext();

    // Update context indicator
    const contextIndicator = document.getElementById("context-indicator");
    if (contextIndicator) {
      contextIndicator.textContent = `Context: ${this.currentContext.section}`;
    }
  }

  handleQuickAction(action) {
    const quickActions = {
      "current-form": () => {
        this.updateContext();
        const help = this.knowledgeBase.getContextualHelp(this.currentContext);
        if (help) {
          this.addMessage(help, "bot");
        } else {
          this.addMessage(
            "I can provide help specific to the section you're currently working on. Please navigate to a form section and try again.",
            "bot"
          );
        }
      },
      optimization: () => {
        this.addMessage(
          "Here's a guide to optimization in ASTRA:\n\n**Optimization Mode** allows you to find optimal mission parameters automatically.\n\n**Key Steps:**\n1. Define your objective function (what to optimize)\n2. Set constraints (limits and requirements)\n3. Choose design variables (parameters to change)\n4. Select optimization algorithm\n\nWould you like specific help with any of these steps?",
          "bot"
        );
      },
      "vehicle-config": () => {
        this.addMessage(
          "**Vehicle Configuration Guide:**\n\n1. **Vehicle Type**: Choose Ascend for launch vehicles, Orbital for spacecraft, Projectile for ballistic trajectories\n2. **Stages**: Add stages based on your mission profile\n3. **Motors**: Configure propulsion for each stage\n4. **Mass Properties**: Set structural and propellant masses\n\nNeed help with a specific aspect?",
          "bot"
        );
      },
      troubleshoot: () => {
        this.updateContext();
        if (
          this.currentContext.errors &&
          this.currentContext.errors.length > 0
        ) {
          let errorHelp = "**Current Issues Found:**\n\n";
          this.currentContext.errors.forEach((error) => {
            errorHelp += `- **${error.field}**: ${error.type}\n`;
          });
          errorHelp +=
            "\nWould you like specific help resolving any of these issues?";
          this.addMessage(errorHelp, "bot");
        } else {
          this.addMessage(
            "No validation errors detected in the current section. If you're experiencing issues, please describe the problem and I'll help you troubleshoot.",
            "bot"
          );
        }
      },
    };

    if (quickActions[action]) {
      quickActions[action]();
    }
  }

  startContextMonitoring() {
    // Monitor form changes for proactive assistance
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class"
        ) {
          const target = mutation.target;
          if (target.classList.contains("active-form")) {
            this.updateContext();
            this.considerProactiveHelp();
          }
        }
      });
    });

    const missionContent = document.querySelector(".mission-content");
    if (missionContent) {
      observer.observe(missionContent, {
        attributes: true,
        subtree: true,
        attributeFilter: ["class"],
      });
    }
  }

  considerProactiveHelp() {
    // Logic for offering proactive help based on context changes
    if (!this.isOpen) {
      // Show notification badge
      const badge = document.querySelector(".notification-badge");
      if (badge) {
        badge.style.display = "block";
        badge.textContent = "1";
      }
    }
  }
}

// Initialize Luna when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  window.lunaBot = new LunaChatbot();
});
```

### 2. Context Manager (`front_end/js/luna-context-manager.js`)

```javascript
class ContextManager {
  constructor() {
    this.formStateCache = new Map();
    this.lastContextUpdate = null;
  }

  static getCurrentContext() {
    // Detect current active form/section
    const activeForm = document.querySelector(".active-form");
    if (!activeForm) {
      return {
        section: "welcome",
        data: {},
        errors: [],
        completionStatus: { total: 0, completed: 0, percentage: 0 },
        formElements: [],
        validationState: "unknown",
      };
    }

    const formId = activeForm.id;
    const context = {
      section: formId.replace("-form", ""),
      data: this.extractFormData(activeForm),
      errors: this.getFormErrors(activeForm),
      completionStatus: this.getCompletionStatus(activeForm),
      formElements: this.getFormElements(activeForm),
      validationState: this.getValidationState(activeForm),
      currentStage: this.getCurrentStage(activeForm),
      missionMode: this.getMissionMode(),
      timestamp: new Date().toISOString(),
    };

    return context;
  }

  static extractFormData(form) {
    const data = {};
    const inputs = form.querySelectorAll("input, select, textarea");

    inputs.forEach((input) => {
      if (input.id && input.value) {
        let value = input.value;

        // Convert specific input types
        if (input.type === "number") {
          value = parseFloat(value) || 0;
        } else if (input.type === "checkbox") {
          value = input.checked;
        } else if (input.type === "date" || input.type === "time") {
          value = input.value;
        }

        data[input.id] = {
          value: value,
          type: input.type,
          label: this.getFieldLabel(input),
          required: input.hasAttribute("required"),
          placeholder: input.placeholder || "",
        };
      }
    });

    return data;
  }

  static getFieldLabel(input) {
    // Find associated label
    const label =
      document.querySelector(`label[for="${input.id}"]`) ||
      input.closest(".form-group")?.querySelector("label");
    return label ? label.textContent.trim() : input.id;
  }

  static getFormErrors(form) {
    const errors = [];

    // Check for validation errors
    const invalidFields = form.querySelectorAll(
      "input:invalid, select:invalid, textarea:invalid"
    );
    invalidFields.forEach((field) => {
      errors.push({
        field: field.id || field.name || "unknown",
        label: this.getFieldLabel(field),
        type: field.validationMessage || "Invalid input",
        severity: "error",
      });
    });

    // Check for custom error styling
    const errorFields = form.querySelectorAll(".error-field, .has-error");
    errorFields.forEach((field) => {
      if (!invalidFields.includes(field)) {
        errors.push({
          field: field.id || field.name || "unknown",
          label: this.getFieldLabel(field),
          type: "Custom validation error",
          severity: "warning",
        });
      }
    });

    return errors;
  }

  static getCompletionStatus(form) {
    const requiredFields = form.querySelectorAll("[required]");
    const filledFields = Array.from(requiredFields).filter((field) => {
      if (field.type === "checkbox") {
        return field.checked;
      }
      return field.value && field.value.trim() !== "";
    });

    const total = requiredFields.length;
    const completed = filledFields.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 100;

    return {
      total,
      completed,
      percentage,
      requiredFields: Array.from(requiredFields).map((f) => ({
        id: f.id,
        label: this.getFieldLabel(f),
        filled: filledFields.includes(f),
      })),
    };
  }

  static getFormElements(form) {
    const elements = [];
    const formElements = form.querySelectorAll(
      "input, select, textarea, button"
    );

    formElements.forEach((element) => {
      elements.push({
        id: element.id,
        type: element.type || element.tagName.toLowerCase(),
        label: this.getFieldLabel(element),
        value: element.value,
        required: element.hasAttribute("required"),
        disabled: element.disabled,
        visible: element.offsetParent !== null,
      });
    });

    return elements;
  }

  static getValidationState(form) {
    const errors = this.getFormErrors(form);
    const completion = this.getCompletionStatus(form);

    if (errors.length > 0) {
      return "invalid";
    } else if (completion.percentage === 100) {
      return "complete";
    } else if (completion.percentage > 0) {
      return "partial";
    } else {
      return "empty";
    }
  }

  static getCurrentStage(form) {
    // Detect if we're in a stage-specific form
    const stageMatch = form.id.match(/stage(\d+)/);
    if (stageMatch) {
      const stageNumber = parseInt(stageMatch[1]);
      const motorMatch = form.id.match(/motor(\d+)/);
      const nozzleMatch = form.id.match(/nozzle(\d+)/);

      return {
        number: stageNumber,
        motor: motorMatch ? parseInt(motorMatch[1]) : null,
        nozzle: nozzleMatch ? parseInt(nozzleMatch[1]) : null,
        type: nozzleMatch ? "nozzle" : motorMatch ? "motor" : "stage",
      };
    }

    return null;
  }

  static getMissionMode() {
    const modeSelect = document.getElementById("modes");
    return modeSelect ? modeSelect.value : "unknown";
  }

  static getNavigationState() {
    const sidebarItems = document.querySelectorAll(".menu-tree a");
    const navigationState = [];

    sidebarItems.forEach((item) => {
      const statusDot = item.querySelector(".nav-status-dot");
      const isActive =
        item.closest("li").querySelector(".active-form") !== null;

      navigationState.push({
        id: item.id,
        text: item.textContent.trim(),
        status: statusDot ? statusDot.style.color : "unknown",
        active: isActive,
        href: item.href,
      });
    });

    return navigationState;
  }

  static getGlobalMissionData() {
    // Access global mission data if available
    const missionData = {};

    if (window.finalMissionData) {
      missionData.finalMissionData = window.finalMissionData;
    }

    if (window.savedStages) {
      missionData.savedStages = window.savedStages;
    }

    if (window.flagRegistry) {
      missionData.flagRegistry = window.flagRegistry;
    }

    return missionData;
  }

  static analyzeUserIntent(message, context) {
    const intent = {
      type: "general",
      confidence: 0.5,
      entities: [],
      context_relevant: false,
    };

    const message_lower = message.toLowerCase();

    // Intent patterns
    const patterns = {
      help: /\b(help|assist|guide|how to|tutorial)\b/,
      error: /\b(error|problem|issue|wrong|fix|debug)\b/,
      optimization: /\b(optimi[sz]e|algorithm|objective|constraint)\b/,
      vehicle: /\b(vehicle|stage|motor|nozzle|propulsion)\b/,
      environment: /\b(environment|atmosphere|planet|earth|mars)\b/,
      sequence: /\b(sequence|event|flag|timing)\b/,
      steering: /\b(steering|control|guidance|attitude)\b/,
      validation: /\b(valid|check|verify|correct)\b/,
      example: /\b(example|sample|demo|show me)\b/,
      explanation: /\b(what is|explain|define|meaning)\b/,
    };

    // Determine intent type
    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.test(message_lower)) {
        intent.type = type;
        intent.confidence = 0.8;
        break;
      }
    }

    // Check context relevance
    if (context && context.section) {
      const contextTerms = [
        context.section,
        ...(context.currentStage ? ["stage", "motor", "nozzle"] : []),
      ];
      intent.context_relevant = contextTerms.some((term) =>
        message_lower.includes(term)
      );
    }

    // Extract entities (field names, numbers, etc.)
    const fieldPattern =
      /\b(mission[- ]?name|vehicle[- ]?type|burn[- ]?time|structural[- ]?mass)\b/g;
    const matches = message_lower.match(fieldPattern);
    if (matches) {
      intent.entities = matches;
    }

    return intent;
  }
}

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = ContextManager;
}
```

### 3. Knowledge Base (`front_end/js/luna-knowledge-base.js`)

```javascript
class KnowledgeBase {
  constructor() {
    this.manualContent = {};
    this.definitions = {};
    this.examples = {};
    this.troubleshooting = {};
    this.bestPractices = {};
    this.fieldMappings = {};
    this.isLoaded = false;
  }

  async loadKnowledgeBase() {
    try {
      // Load from JSON file if available
      const response = await fetch("./data/luna-knowledge-base.json");
      if (response.ok) {
        const data = await response.json();
        Object.assign(this, data);
      } else {
        // Fallback to embedded knowledge
        this.loadEmbeddedKnowledge();
      }
      this.isLoaded = true;
      console.log("Luna Knowledge Base loaded successfully");
    } catch (error) {
      console.warn(
        "Failed to load external knowledge base, using embedded:",
        error
      );
      this.loadEmbeddedKnowledge();
      this.isLoaded = true;
    }
  }

  loadEmbeddedKnowledge() {
    // Mission Configuration
    this.manualContent.mission = {
      title: "Mission Configuration",
      content:
        "The mission section defines the fundamental parameters for your space mission design.",
      description:
        "Set up basic mission parameters including name, mode, tracking options, and mission timing.",
      fields: {
        "mission-name": {
          description: "Unique identifier for your mission",
          tips: "Use descriptive names like 'LEO-Deployment-2024' or 'Mars-Transfer-Mission'",
          validation: "Must be unique and contain no special characters",
        },
        modes: {
          description: "Choose between Simulation or Optimization mode",
          tips: "Use Simulation for trajectory analysis, Optimization for parameter finding",
          options: {
            simulation: "Analyze predetermined mission parameters",
            optimization: "Find optimal mission parameters automatically",
          },
        },
        tracking: {
          description: "Enable trajectory tracking during simulation",
          tips: "Enable for detailed trajectory visualization and analysis",
        },
        "mission-date": {
          description: "Mission start date",
          tips: "Consider seasonal variations and launch windows",
        },
        "mission-time": {
          description: "Mission start time in HH:MM:SS format",
          tips: "Consider orbital mechanics and ground station coverage",
        },
      },
      workflows: [
        "1. Enter a descriptive mission name",
        "2. Select appropriate mode (Simulation vs Optimization)",
        "3. Set mission date and time",
        "4. Enable tracking if needed for analysis",
      ],
    };

    // Environment Configuration
    this.manualContent.environment = {
      title: "Environment Configuration",
      content:
        "Configure atmospheric and planetary environment settings for accurate mission simulation.",
      fields: {
        planets: {
          description: "Select the primary celestial body for your mission",
          options: {
            earth: "Standard Earth environment with full atmospheric modeling",
            mars: "Martian environment with thin atmosphere",
            moon: "Lunar environment with no atmosphere",
          },
        },
        "atmos-model": {
          description: "Choose atmospheric model for simulation accuracy",
          options: {
            atmos_76:
              "US Standard Atmosphere 1976 - Good for most Earth missions",
            "NRLMSISE-00":
              "High-fidelity empirical model for varying conditions",
            JB2008: "Advanced model for upper atmosphere missions",
            ISA: "Indian Standard Atmosphere for regional missions",
          },
        },
      },
      bestPractices: [
        "Use US Standard Atmosphere 1976 for routine Earth missions",
        "Consider NRLMSISE-00 for high-altitude or variable condition missions",
        "Match atmospheric model to mission altitude and duration",
      ],
    };

    // Vehicle Configuration
    this.manualContent.vehicle = {
      title: "Vehicle Configuration",
      content:
        "Define vehicle type, initial conditions, and configuration parameters.",
      fields: {
        "vehicle-name": {
          description: "Unique vehicle identifier",
          tips: "Use systematic naming like 'Vehicle-1', 'Booster-Stage', etc.",
        },
        "vehicle-type": {
          description: "Vehicle mission profile type",
          options: {
            ascend:
              "Launch vehicles starting from surface (rockets, launchers)",
            orbital: "Spacecraft already in orbit (satellites, space stations)",
            projectile: "Ballistic trajectories (missiles, projectiles)",
          },
        },
      },
      examples: [
        "LEO Launch: Use 'Ascend' type with launch point configuration",
        "Satellite Deployment: Use 'Orbital' type with TLE or orbital elements",
        "Ballistic Missile: Use 'Projectile' type with trajectory parameters",
      ],
    };

    // Stage Configuration
    this.manualContent["vehicle-stage-config"] = {
      title: "Vehicle Stage Configuration",
      content:
        "Configure multi-stage vehicle architecture including stages, motors, and nozzles.",
      fields: {
        "structural-mass": {
          description: "Dry mass of the stage structure",
          units: "kg",
          tips: "Include tanks, avionics, structure but exclude propellant",
        },
        "reference-area": {
          description: "Cross-sectional area for aerodynamic calculations",
          units: "m²",
          tips: "Use maximum cross-sectional area of the stage",
        },
        "burn-time": {
          description: "Duration of motor operation",
          units: "seconds",
          tips: "Total burn time for all motors in this stage",
        },
        "number-of-motors": {
          description: "Number of motors in this stage",
          range: "1-15",
          tips: "Consider thrust requirements and redundancy needs",
        },
      },
      workflows: [
        "1. Set stage structural mass and reference area",
        "2. Define burn time for the stage",
        "3. Specify number of motors (1-15)",
        "4. Configure each motor's properties",
        "5. Set up nozzle configurations",
      ],
    };

    // Steering Configuration
    this.manualContent.steering = {
      title: "Steering Configuration",
      content:
        "Control vehicle orientation and attitude throughout the mission.",
      components: {
        verticalAscend: {
          description: "Maintains vertical orientation during initial ascent",
          usage: "First phase of most launch missions",
          parameters: "Duration and reference conditions",
        },
        pitchHold: {
          description: "Holds a constant pitch angle",
          usage: "Maintaining specific attitude orientation",
          parameters: "Target pitch angle and duration",
        },
        constantPitch: {
          description: "Applies constant pitch rate",
          usage: "Gradual attitude changes",
          parameters: "Pitch rate and duration",
        },
        gravityTurn: {
          description: "Follows natural gravity turn trajectory",
          usage: "Efficient ascent trajectories",
          parameters: "Initial conditions and constraints",
        },
        profile: {
          description: "Follows predefined attitude profile",
          usage: "Complex attitude maneuvers",
          parameters: "Profile data and interpolation method",
        },
        coasting: {
          description: "No active attitude control",
          usage: "Ballistic flight phases",
          parameters: "Duration and initial conditions",
        },
      },
    };

    // Optimization Configuration
    this.manualContent["objective-function"] = {
      title: "Objective Function Configuration",
      content: "Define what parameter to optimize in your mission.",
      objectives: {
        minimize: "Reduce the target parameter (fuel consumption, time, etc.)",
        maximize:
          "Increase the target parameter (payload mass, efficiency, etc.)",
      },
    };

    this.manualContent.constraints = {
      title: "Optimization Constraints",
      content: "Set limits and requirements for the optimization process.",
      types: {
        equality: "Parameters that must equal specific values",
        inequality: "Parameters that must be less than or greater than limits",
      },
    };

    this.manualContent["design-variables"] = {
      title: "Design Variables",
      content: "Define which parameters the optimizer can modify.",
      guidelines: [
        "Select parameters that significantly affect your objective",
        "Set realistic bounds based on physical limitations",
        "Limit to 10 variables for computational efficiency",
      ],
    };

    // Common Definitions
    this.definitions = {
      RAAN: "Right Ascension of Ascending Node - angle from vernal equinox to ascending node",
      apogee: "Highest point in an elliptical orbit above the central body",
      perigee: "Lowest point in an elliptical orbit above the central body",
      "specific impulse": "Measure of propulsion efficiency (seconds)",
      "delta-v": "Change in velocity required for orbital maneuvers (m/s)",
      "burn time": "Duration of motor operation (seconds)",
      "structural mass":
        "Dry mass of vehicle structure excluding propellant (kg)",
      "reference area":
        "Cross-sectional area used for aerodynamic calculations (m²)",
      "separation flag": "Event marker for stage separation timing",
      "ignition flag": "Event marker for motor ignition timing",
      "burnout flag": "Event marker for motor burnout timing",
    };

    // Troubleshooting Guide
    this.troubleshooting = {
      "validation-errors": {
        "missing-required-fields": {
          problem: "Required fields are empty",
          solution: "Fill in all required fields marked with red indicators",
          prevention:
            "Use the completion percentage indicator to track progress",
        },
        "invalid-number-format": {
          problem: "Number fields contain invalid values",
          solution:
            "Enter numeric values only, use decimal point for fractions",
          prevention: "Check field tooltips for expected value ranges",
        },
        "file-upload-failed": {
          problem: "CSV file upload failed",
          solution:
            "Ensure file is valid CSV format with correct column headers",
          prevention: "Use provided templates for data file format",
        },
      },
      "configuration-issues": {
        "stage-motor-mismatch": {
          problem: "Stage and motor configurations don't match",
          solution: "Ensure motor count matches specified number of motors",
          prevention: "Use the motor configuration wizard",
        },
        "optimization-convergence": {
          problem: "Optimization doesn't converge",
          solution: "Adjust design variable bounds and constraints",
          prevention: "Start with wider bounds and fewer variables",
        },
      },
    };

    // Best Practices
    this.bestPractices = {
      mission: [
        "Use descriptive mission names for easy identification",
        "Choose simulation mode for analysis, optimization for design",
        "Enable tracking for detailed trajectory visualization",
      ],
      vehicle: [
        "Start with simple single-stage configurations",
        "Add stages incrementally and test each addition",
        "Use realistic mass and performance values",
      ],
      optimization: [
        "Define clear, measurable objectives",
        "Set realistic constraints based on mission requirements",
        "Limit design variables to most impactful parameters",
      ],
    };
  }

  getContextualHelp(context) {
    if (!this.isLoaded) {
      return "Knowledge base is still loading. Please try again in a moment.";
    }

    const section = context.section;
    const manual = this.manualContent[section];

    if (!manual) {
      return this.getGeneralHelp(context);
    }

    let help = `# ${manual.title}\n\n${manual.content}\n\n`;

    // Add field-specific help
    if (manual.fields && context.data && Object.keys(context.data).length > 0) {
      help += "## Current Fields:\n";
      Object.keys(context.data).forEach((fieldId) => {
        const fieldInfo = manual.fields[fieldId];
        if (fieldInfo) {
          help += `**${fieldInfo.description || fieldId}**\n`;
          if (fieldInfo.tips) help += `- Tips: ${fieldInfo.tips}\n`;
          if (fieldInfo.units) help += `- Units: ${fieldInfo.units}\n`;
          if (fieldInfo.range) help += `- Range: ${fieldInfo.range}\n`;
          help += `- Current value: ${context.data[fieldId].value}\n\n`;
        }
      });
    }

    // Add completion status
    if (context.completionStatus) {
      help += `## Progress: ${context.completionStatus.percentage}% complete\n`;
      if (context.completionStatus.percentage < 100) {
        help += `- ${
          context.completionStatus.total - context.completionStatus.completed
        } required fields remaining\n`;
      }
    }

    // Add errors if any
    if (context.errors && context.errors.length > 0) {
      help += "\n## Issues to Address:\n";
      context.errors.forEach((error) => {
        const troubleshootInfo = this.getTroubleshootingInfo(error.type);
        help += `- **${error.label}**: ${error.type}\n`;
        if (troubleshootInfo) {
          help += `  - Solution: ${troubleshootInfo.solution}\n`;
        }
      });
    }

    // Add workflow if available
    if (manual.workflows) {
      help += "\n## Recommended Workflow:\n";
      manual.workflows.forEach((step) => {
        help += `${step}\n`;
      });
    }

    // Add best practices
    const practices = this.bestPractices[section];
    if (practices) {
      help += "\n## Best Practices:\n";
      practices.forEach((practice) => {
        help += `- ${practice}\n`;
      });
    }

    return help;
  }

  getGeneralHelp(context) {
    let help = "# ASTRA Mission Design Assistant\n\n";
    help += "I can help you with all aspects of mission design:\n\n";

    Object.keys(this.manualContent).forEach((section) => {
      const manual = this.manualContent[section];
      help += `**${manual.title}**: ${manual.content}\n`;
    });

    help += "\n## Available Commands:\n";
    help += "- Ask about specific fields or parameters\n";
    help += "- Request troubleshooting help\n";
    help += "- Get examples and best practices\n";
    help += "- Explain technical terms and definitions\n";

    return help;
  }

  getDefinition(term) {
    const termLower = term.toLowerCase();
    const definition = this.definitions[termLower];

    if (definition) {
      return `**${term}**: ${definition}`;
    }

    // Check for partial matches
    const partialMatches = Object.keys(this.definitions).filter(
      (key) => key.includes(termLower) || termLower.includes(key)
    );

    if (partialMatches.length > 0) {
      let response = `Related definitions:\n`;
      partialMatches.forEach((match) => {
        response += `**${match}**: ${this.definitions[match]}\n`;
      });
      return response;
    }

    return `I don't have a definition for "${term}". Could you provide more context or check the spelling?`;
  }

  getTroubleshootingInfo(errorType) {
    // Search through troubleshooting categories
    for (const category of Object.values(this.troubleshooting)) {
      for (const [key, info] of Object.entries(category)) {
        if (errorType.toLowerCase().includes(key.replace(/-/g, " "))) {
          return info;
        }
      }
    }
    return null;
  }

  searchKnowledgeBase(query) {
    const results = [];
    const queryLower = query.toLowerCase();

    // Search through manual content
    Object.entries(this.manualContent).forEach(([section, content]) => {
      if (
        content.title.toLowerCase().includes(queryLower) ||
        content.content.toLowerCase().includes(queryLower)
      ) {
        results.push({
          type: "manual",
          section: section,
          title: content.title,
          relevance: this.calculateRelevance(queryLower, content),
        });
      }
    });

    // Search through definitions
    Object.entries(this.definitions).forEach(([term, definition]) => {
      if (
        term.toLowerCase().includes(queryLower) ||
        definition.toLowerCase().includes(queryLower)
      ) {
        results.push({
          type: "definition",
          term: term,
          definition: definition,
          relevance: this.calculateRelevance(queryLower, { term, definition }),
        });
      }
    });

    return results.sort((a, b) => b.relevance - a.relevance);
  }

  calculateRelevance(query, content) {
    // Simple relevance scoring based on keyword matches
    let score = 0;
    const contentText = JSON.stringify(content).toLowerCase();
    const queryWords = query.split(" ");

    queryWords.forEach((word) => {
      const matches = (contentText.match(new RegExp(word, "g")) || []).length;
      score += matches;
    });

    return score;
  }
}

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = KnowledgeBase;
}
```

### 4. AI Service (`front_end/js/luna-ai-service.js`)

```javascript
class AIService {
  constructor() {
    this.apiKey = null;
    this.baseURL = "https://api.openai.com/v1/chat/completions";
    this.model = "gpt-4";
    this.isConfigured = false;
    this.fallbackResponses = new Map();
    this.conversationContext = [];
    this.maxContextLength = 10;
    this.setupFallbacks();
  }

  configure(apiKey, model = "gpt-4", baseURL = null) {
    this.apiKey = apiKey;
    this.model = model;
    if (baseURL) this.baseURL = baseURL;
    this.isConfigured = !!apiKey;
    console.log(`AI Service configured with model: ${this.model}`);
  }

  async sendMessage(message, context, knowledgeBase) {
    // Analyze user intent first
    const intent = ContextManager.analyzeUserIntent(message, context);

    try {
      if (this.isConfigured) {
        return await this.callAIService(
          message,
          context,
          knowledgeBase,
          intent
        );
      } else {
        return this.generateFallbackResponse(
          message,
          context,
          knowledgeBase,
          intent
        );
      }
    } catch (error) {
      console.error("AI Service Error:", error);
      return this.generateFallbackResponse(
        message,
        context,
        knowledgeBase,
        intent
      );
    }
  }

  async callAIService(message, context, knowledgeBase, intent) {
    const systemPrompt = this.buildSystemPrompt(context, knowledgeBase);
    const userPrompt = this.buildUserPrompt(message, context, intent);

    // Manage conversation context
    this.addToContext("user", message, context);

    const response = await fetch(this.baseURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: "system", content: systemPrompt },
          ...this.conversationContext.slice(-this.maxContextLength),
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 500,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Add AI response to context
    this.addToContext("assistant", aiResponse, context);

    return aiResponse;
  }

  generateFallbackResponse(message, context, knowledgeBase, intent) {
    // Generate response based on intent and context without AI service

    switch (intent.type) {
      case "help":
        return knowledgeBase.getContextualHelp(context);

      case "error":
        return this.handleErrorQuestions(message, context);

      case "optimization":
        return this.getOptimizationGuidance(context);

      case "vehicle":
        return this.getVehicleGuidance(context);

      case "explanation":
        return this.handleExplanationRequest(message, knowledgeBase);

      case "validation":
        return this.getValidationHelp(context);

      default:
        return this.getGeneralResponse(message, context, knowledgeBase);
    }
  }

  buildSystemPrompt(context, knowledgeBase) {
    const contextualHelp = knowledgeBase.getContextualHelp(context);

    return `You are Luna, an expert assistant for the ASTRA mission design software. You are knowledgeable about aerospace engineering, orbital mechanics, mission design, and the ASTRA software specifically.

Current Context:
- User is in the ${context.section} section
- Mission mode: ${context.missionMode}
- Form completion: ${context.completionStatus.percentage}%
- Validation state: ${context.validationState}

${contextualHelp || ""}

Guidelines:
- Be concise but comprehensive in your responses
- Use technical terms appropriately but explain when needed
- Provide specific, actionable guidance based on current form state
- Reference field names and values when relevant
- Suggest next steps when appropriate
- If asked about definitions, provide clear explanations
- Always maintain a helpful, professional tone
- Focus on ASTRA-specific functionality and workflows

Response format:
- Use markdown formatting for structure
- Keep responses under 400 words
- Include numbered steps for procedures
- Use bullet points for lists
- Bold important terms and values`;
  }

  buildUserPrompt(message, context, intent) {
    let prompt = `User question: "${message}"\n\n`;

    if (intent.context_relevant) {
      prompt += `This question appears to be related to the current form section (${context.section}).\n`;
    }

    if (context.data && Object.keys(context.data).length > 0) {
      prompt += `Current form data:\n`;
      Object.entries(context.data).forEach(([field, info]) => {
        prompt += `- ${field}: ${info.value} (${info.type})\n`;
      });
    }

    if (context.errors && context.errors.length > 0) {
      prompt += `\nCurrent validation errors:\n`;
      context.errors.forEach((error) => {
        prompt += `- ${error.field}: ${error.type}\n`;
      });
    }

    return prompt;
  }

  addToContext(role, content, context) {
    this.conversationContext.push({
      role: role,
      content: content,
      timestamp: new Date().toISOString(),
      context_section: context ? context.section : null,
    });

    // Keep context size manageable
    if (this.conversationContext.length > this.maxContextLength * 2) {
      this.conversationContext = this.conversationContext.slice(
        -this.maxContextLength
      );
    }
  }

  handleErrorQuestions(message, context) {
    if (context.errors && context.errors.length > 0) {
      let response = "I can help you resolve these validation errors:\n\n";

      context.errors.forEach((error, index) => {
        response += `${index + 1}. **${error.field}**: ${error.type}\n`;
        response += `   - Check that the field contains valid data\n`;
        response += `   - Ensure required fields are not empty\n`;
        response += `   - Verify number fields contain numeric values\n\n`;
      });

      response += "Would you like specific help with any of these fields?";
      return response;
    } else {
      return "I don't see any validation errors in the current section. Could you describe the specific issue you're experiencing?";
    }
  }

  getOptimizationGuidance(context) {
    return `# Optimization in ASTRA

**Optimization Mode** helps you find the best mission parameters automatically.

## Key Steps:
1. **Objective Function**: Define what to optimize (minimize fuel, maximize payload, etc.)
2. **Constraints**: Set limits and requirements your mission must meet
3. **Design Variables**: Choose which parameters the optimizer can modify
4. **Algorithm**: Select the optimization method

## Current Status:
${
  context.section === "objective-function"
    ? "✓ Currently setting up objective function"
    : context.section === "constraints"
    ? "✓ Currently configuring constraints"
    : context.section === "design-variables"
    ? "✓ Currently defining design variables"
    : "- Navigate to optimization sections in the sidebar"
}

## Tips:
- Start with a single objective
- Use realistic constraints based on mission requirements
- Limit design variables to 3-5 for initial runs

Need help with a specific optimization aspect?`;
  }

  getVehicleGuidance(context) {
    const stageInfo = context.currentStage;

    let response = "# Vehicle Configuration Guide\n\n";

    if (stageInfo) {
      response += `Currently configuring: **Stage ${stageInfo.number}`;
      if (stageInfo.motor) response += ` - Motor ${stageInfo.motor}`;
      if (stageInfo.nozzle) response += ` - Nozzle ${stageInfo.nozzle}`;
      response += "**\n\n";
    }

    response += `## Vehicle Types:
- **Ascend**: Launch vehicles starting from surface
- **Orbital**: Spacecraft already in orbit  
- **Projectile**: Ballistic trajectories

## Configuration Steps:
1. Set vehicle type and initial conditions
2. Add stages based on mission profile
3. Configure motors for each stage
4. Set up nozzle configurations
5. Define mass properties and burn times

## Current Progress: ${context.completionStatus.percentage}% complete

${
  context.errors.length > 0
    ? `\n⚠️ ${context.errors.length} validation error(s) need attention`
    : "✅ No validation errors detected"
}`;

    return response;
  }

  handleExplanationRequest(message, knowledgeBase) {
    // Extract potential terms to explain
    const words = message.toLowerCase().match(/\b\w+\b/g) || [];
    const definitions = [];

    words.forEach((word) => {
      const definition = knowledgeBase.getDefinition(word);
      if (definition && !definition.includes("don't have a definition")) {
        definitions.push(definition);
      }
    });

    if (definitions.length > 0) {
      return definitions.join("\n\n");
    } else {
      return "I'd be happy to explain concepts related to ASTRA mission design. Could you be more specific about what you'd like me to explain?";
    }
  }

  getValidationHelp(context) {
    if (context.validationState === "complete") {
      return "✅ **All validations passed!**\n\nThis section is complete and ready. You can proceed to the next section or review your entries.";
    } else if (context.validationState === "invalid") {
      return this.handleErrorQuestions("", context);
    } else {
      const remaining =
        context.completionStatus.total - context.completionStatus.completed;
      return `📋 **Validation Status**: ${
        context.completionStatus.percentage
      }% complete\n\n${remaining} required field(s) remaining:\n\n${context.completionStatus.requiredFields
        .filter((field) => !field.filled)
        .map((field) => `- ${field.label}`)
        .join("\n")}`;
    }
  }

  getGeneralResponse(message, context, knowledgeBase) {
    // Search knowledge base for relevant information
    const searchResults = knowledgeBase.searchKnowledgeBase(message);

    if (searchResults.length > 0) {
      const topResult = searchResults[0];

      if (topResult.type === "manual") {
        return knowledgeBase.getContextualHelp(context);
      } else if (topResult.type === "definition") {
        return knowledgeBase.getDefinition(topResult.term);
      }
    }

    return `I understand you're asking about "${message}". I can help you with:

🚀 **Mission Design**: Configuration and planning
🛰️ **Vehicle Setup**: Stages, motors, and mass properties  
🎯 **Optimization**: Finding optimal parameters
🔧 **Troubleshooting**: Resolving validation errors
📚 **Definitions**: Technical terms and concepts

Could you be more specific about what aspect you'd like help with?`;
  }

  setupFallbacks() {
    // Setup common fallback responses for when AI service is unavailable
    this.fallbackResponses.set(
      "greeting",
      "Hello! I'm Luna, your ASTRA mission design assistant. How can I help you today?"
    );

    this.fallbackResponses.set(
      "thanks",
      "You're welcome! Feel free to ask if you need more help with your mission design."
    );

    this.fallbackResponses.set(
      "goodbye",
      "Goodbye! I'll be here whenever you need assistance with ASTRA."
    );
  }

  clearContext() {
    this.conversationContext = [];
  }
}

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = AIService;
}
```

### 5. CSS Styling (`front_end/css/luna-theme.css`)

```css
/* Luna Chatbot Styles */
#luna-chat-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
  z-index: 1000;
  color: white;
  border: none;
  outline: none;
}

#luna-chat-button:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 25px rgba(102, 126, 234, 0.6);
}

#luna-chat-button:active {
  transform: scale(0.95);
}

.luna-avatar {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 10px;
  font-weight: 600;
}

.luna-avatar svg {
  width: 24px;
  height: 24px;
  margin-bottom: 2px;
  fill: currentColor;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.notification-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #ff4757;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  animation: pulse 2s infinite;
}

/* Chat Panel */
#luna-chat-panel {
  position: fixed;
  bottom: 90px;
  right: 20px;
  width: 380px;
  height: 500px;
  background: var(--bg-primary, #1e1e1e);
  border-radius: 12px;
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  display: none;
  flex-direction: column;
  z-index: 1001;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

#luna-chat-panel.minimized {
  height: 60px;
  overflow: hidden;
}

#luna-chat-panel.minimized .luna-messages,
#luna-chat-panel.minimized .luna-quick-actions,
#luna-chat-panel.minimized .luna-input-area {
  display: none;
}

/* Header */
.luna-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 12px 12px 0 0;
}

.luna-title {
  display: flex;
  align-items: center;
  font-weight: 600;
  font-size: 14px;
}

.luna-status-dot {
  width: 8px;
  height: 8px;
  background: #4caf50;
  border-radius: 50%;
  margin-right: 8px;
  animation: pulse 2s infinite;
}

.luna-controls {
  display: flex;
  gap: 8px;
}

.luna-controls button {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  transition: background-color 0.2s;
}

.luna-controls button:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Messages Area */
.luna-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: var(--bg-secondary, #2a2a2a);
  scrollbar-width: thin;
  scrollbar-color: var(--accent-color, #667eea) transparent;
}

.luna-messages::-webkit-scrollbar {
  width: 6px;
}

.luna-messages::-webkit-scrollbar-track {
  background: transparent;
}

.luna-messages::-webkit-scrollbar-thumb {
  background: var(--accent-color, #667eea);
  border-radius: 3px;
}

.luna-message {
  display: flex;
  margin-bottom: 16px;
  animation: slideIn 0.3s ease;
  max-width: 100%;
}

.luna-message.luna-user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  margin: 0 8px;
  flex-shrink: 0;
}

.luna-bot .message-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.luna-user .message-avatar {
  background: var(--accent-color, #4a90e2);
  color: white;
}

.message-content {
  max-width: 280px;
  padding: 12px 16px;
  border-radius: 18px;
  background: var(--bg-tertiary, #3a3a3a);
  color: var(--text-primary, #ffffff);
  line-height: 1.4;
  word-wrap: break-word;
}

.luna-user .message-content {
  background: var(--accent-color, #4a90e2);
  color: white;
  border-radius: 18px 18px 4px 18px;
}

.luna-bot .message-content {
  border-radius: 18px 18px 18px 4px;
}

.message-content h1,
.message-content h2,
.message-content h3 {
  margin: 0 0 8px 0;
  color: inherit;
}

.message-content ul,
.message-content ol {
  margin: 8px 0;
  padding-left: 20px;
}

.message-content code {
  background: rgba(0, 0, 0, 0.2);
  padding: 2px 4px;
  border-radius: 3px;
  font-family: "Courier New", monospace;
  font-size: 12px;
}

.message-content strong {
  font-weight: 600;
}

/* Quick Actions */
.luna-quick-actions {
  padding: 8px 16px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  background: var(--bg-secondary, #2a2a2a);
  border-top: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
}

.quick-action {
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.3);
  color: var(--text-primary, #ffffff);
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.quick-action:hover {
  background: rgba(102, 126, 234, 0.2);
  border-color: rgba(102, 126, 234, 0.5);
  transform: translateY(-1px);
}

.quick-action:active {
  transform: translateY(0);
}

/* Input Area */
.luna-input-area {
  background: var(--bg-tertiary, #3a3a3a);
  border-top: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
  padding: 16px;
  border-radius: 0 0 12px 12px;
}

.input-container {
  display: flex;
  gap: 8px;
  align-items: end;
}

#luna-input {
  flex: 1;
  background: var(--bg-primary, #1e1e1e);
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
  border-radius: 20px;
  padding: 10px 16px;
  color: var(--text-primary, #ffffff);
  resize: none;
  max-height: 100px;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.4;
  outline: none;
  transition: border-color 0.2s;
}

#luna-input:focus {
  border-color: var(--accent-color, #667eea);
}

#luna-input::placeholder {
  color: var(--text-secondary, #888);
}

#luna-send {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

#luna-send:hover:not(:disabled) {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

#luna-send:active:not(:disabled) {
  transform: scale(0.95);
}

#luna-send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

#luna-send svg {
  width: 18px;
  height: 18px;
  fill: currentColor;
}

/* Footer */
.luna-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  font-size: 12px;
  color: var(--text-secondary, #888);
}

.context-indicator {
  background: rgba(102, 126, 234, 0.1);
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  border: 1px solid rgba(102, 126, 234, 0.2);
}

.typing-indicator {
  color: var(--accent-color, #667eea);
  font-style: italic;
  animation: pulse 1.5s ease-in-out infinite alternate;
}

/* Animations */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

/* Responsive Design */
@media (max-width: 480px) {
  #luna-chat-panel {
    bottom: 10px;
    right: 10px;
    left: 10px;
    width: auto;
    height: 400px;
  }

  #luna-chat-button {
    bottom: 15px;
    right: 15px;
    width: 50px;
    height: 50px;
  }

  .luna-avatar svg {
    width: 20px;
    height: 20px;
  }

  .luna-avatar {
    font-size: 9px;
  }

  .message-content {
    max-width: 220px;
    font-size: 14px;
  }

  .quick-action {
    font-size: 11px;
    padding: 5px 10px;
  }
}

/* Theme Integration */
.desktop-theme #luna-chat-panel {
  background: #2c3e50;
  border-color: #34495e;
}

.desktop-theme .luna-messages {
  background: #34495e;
}

.desktop-theme .luna-input-area {
  background: #2c3e50;
  border-top-color: #34495e;
}

.desktop-theme #luna-input {
  background: #34495e;
  border-color: #5a6c7d;
  color: #ecf0f1;
}

.desktop-theme .message-content {
  background: #5a6c7d;
  color: #ecf0f1;
}

.gmat-theme #luna-chat-panel {
  background: #ffffff;
  border-color: #d4d4d4;
  color: #000000;
}

.gmat-theme .luna-messages {
  background: #f0f0f0;
}

.gmat-theme .message-content {
  background: #ffffff;
  color: #000000;
  border: 1px solid #d4d4d4;
}

.gmat-theme #luna-input {
  background: #ffffff;
  border-color: #7a7a7a;
  color: #000000;
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  #luna-chat-button {
    border: 2px solid white;
  }

  .message-content {
    border: 1px solid currentColor;
  }

  .quick-action {
    border-width: 2px;
  }
}

/* Print styles */
@media print {
  #luna-chat-button,
  #luna-chat-panel {
    display: none !important;
  }
}
```

## Integration Steps

### Step 1: File Creation

Create the following files in your project:

```bash
# JavaScript files
touch front_end/js/luna-chatbot.js
touch front_end/js/luna-context-manager.js
touch front_end/js/luna-knowledge-base.js
touch front_end/js/luna-ai-service.js

# CSS file
touch front_end/css/luna-theme.css

# Data files
mkdir -p front_end/data
touch front_end/data/luna-knowledge-base.json

# Assets
mkdir -p front_end/assets/luna
touch front_end/assets/luna/avatar.svg
```

### Step 2: HTML Integration

Add the following to your `mission.html` file:

```html
<!-- Add before closing </head> tag -->
<link rel="stylesheet" href="css/luna-theme.css" />

<!-- Add before closing </body> tag, after existing scripts -->
<script src="js/luna-context-manager.js"></script>
<script src="js/luna-knowledge-base.js"></script>
<script src="js/luna-ai-service.js"></script>
<script src="js/luna-chatbot.js"></script>
```

### Step 3: UI Navigation Integration

Add to your existing `ui-navigation.js`:

```javascript
// Add at the end of the DOMContentLoaded event listener
document.addEventListener("DOMContentLoaded", function () {
  // ... existing code ...

  // Initialize Luna chatbot
  setTimeout(() => {
    if (typeof LunaChatbot !== "undefined") {
      window.lunaBot = new LunaChatbot();
      console.log("Luna AI Assistant initialized");
    }
  }, 1000); // Delay to ensure all dependencies are loaded
});
```

### Step 4: Configuration

#### AI Service Configuration

To use OpenAI API:

```javascript
// Add to your application initialization
if (window.lunaBot) {
  window.lunaBot.aiService.configure("your-openai-api-key", "gpt-4");
}
```

#### Local AI Alternative (Optional)

For privacy or offline use, you can use local AI models:

```javascript
// Configure for local Ollama instance
window.lunaBot.aiService.configure(
  null,
  "llama2",
  "http://localhost:11434/api/chat"
);
```

### Step 5: Knowledge Base Data

Create `front_end/data/luna-knowledge-base.json`:

```json
{
  "manualContent": {
    "mission": {
      "title": "Mission Configuration",
      "content": "Configure basic mission parameters...",
      "fields": {
        "mission-name": {
          "description": "Unique mission identifier",
          "tips": "Use descriptive names"
        }
      }
    }
  },
  "definitions": {
    "RAAN": "Right Ascension of Ascending Node",
    "apogee": "Highest point in orbit"
  }
}
```

### Step 6: Testing

1. **Basic Functionality Test:**

   ```javascript
   // Open browser console and test
   console.log(window.lunaBot);
   window.lunaBot.toggleChat();
   ```

2. **Context Awareness Test:**

   - Navigate to different forms
   - Check if context indicator updates
   - Try the "Help with current section" quick action

3. **Knowledge Base Test:**
   - Ask "What is RAAN?"
   - Ask "Help with mission configuration"

### Step 7: Customization

#### Theme Integration

Ensure Luna matches your current theme by adding theme-specific CSS:

```css
/* Add to your theme files */
.your-theme #luna-chat-panel {
  background: var(--your-bg-color);
  border-color: var(--your-border-color);
}
```

#### Custom Knowledge

Extend the knowledge base with your specific documentation:

```javascript
// Add to luna-knowledge-base.js
this.manualContent.customSection = {
  title: "Your Custom Section",
  content: "Your specific content...",
  fields: {
    /* your fields */
  },
};
```

## Configuration Options

### AI Service Options

```javascript
// OpenAI Configuration
lunaBot.aiService.configure("sk-your-key", "gpt-4");

// Azure OpenAI
lunaBot.aiService.configure(
  "your-key",
  "gpt-4",
  "https://your-resource.openai.azure.com/openai/deployments/gpt-4/chat/completions?api-version=2023-12-01-preview"
);

// Local Ollama
lunaBot.aiService.configure(
  null,
  "llama2",
  "http://localhost:11434/v1/chat/completions"
);
```

### Customization Options

```javascript
// Chatbot Configuration
const config = {
  maxContextLength: 10, // Conversation memory
  autoShow: false, // Auto-show on errors
  proactiveHelp: true, // Offer help on context changes
  position: "bottom-right", // Chat button position
  theme: "auto", // Theme matching
};

window.lunaBot = new LunaChatbot(config);
```

## Advanced Features

### Voice Integration (Future)

```javascript
// Voice input capability
lunaBot.enableVoice({
  language: "en-US",
  continuous: false,
  autoStart: false,
});
```

### Analytics Integration

```javascript
// Track usage analytics
lunaBot.on("message-sent", (data) => {
  analytics.track("luna-message", {
    intent: data.intent,
    section: data.context.section,
    timestamp: new Date(),
  });
});
```

### Learning from Interactions

```javascript
// Collect feedback for improvement
lunaBot.on("response-rating", (rating, message) => {
  // Send to analytics service
  collectFeedback(rating, message);
});
```

## Troubleshooting

### Common Issues

1. **Luna not appearing:**

   - Check console for JavaScript errors
   - Ensure all script files are loaded
   - Verify CSS file is included

2. **Context not updating:**

   - Check if forms have proper class names
   - Verify MutationObserver is working
   - Test with `window.lunaBot.updateContext()`

3. **AI responses not working:**

   - Verify API key configuration
   - Check network connectivity
   - Test fallback responses

4. **Knowledge base not loading:**
   - Check if JSON file exists and is valid
   - Verify file path in fetch request
   - Test embedded knowledge fallback

### Debug Mode

Enable debug logging:

```javascript
window.lunaBot.debug = true;
```

This will provide detailed console logs for troubleshooting.

## Deployment Considerations

### Security

- Store API keys securely (environment variables)
- Implement rate limiting for AI requests
- Sanitize user inputs
- Use HTTPS for all API communications

### Performance

- Lazy load AI service only when needed
- Implement conversation context pruning
- Cache knowledge base data
- Optimize CSS for smooth animations

### Accessibility

- Ensure keyboard navigation works
- Add ARIA labels for screen readers
- Support high contrast mode
- Provide text alternatives for icons

## Future Enhancements

1. **Voice Integration**: Speech-to-text and text-to-speech
2. **Visual Assistance**: Screenshot analysis and annotation
3. **Advanced Analytics**: User behavior tracking and insights
4. **Multi-language Support**: Internationalization
5. **Collaborative Features**: Team chat and shared sessions
6. **Integration with External Tools**: CAD software, simulation tools
7. **Machine Learning**: Personalized responses based on user behavior
