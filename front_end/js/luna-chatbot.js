/**
 * Luna AI Chatbot - Main Controller
 * ASTRA Mission Design Assistant
 */

class LunaChatbot {
  constructor(config = {}) {
    this.config = {
      enabled: true,
      maxContextLength: 10,
      autoShow: false,
      proactiveHelp: true,
      position: "bottom-right",
      theme: "auto",
      debug: false,
      ...config,
    };

    this.isVisible = false;
    this.isMinimized = false;
    this.conversationHistory = [];
    this.currentContext = null;
    this.eventListeners = new Map();

    // Initialize components if enabled
    if (this.config.enabled) {
      this.init();
    }
  }

  async init() {
    try {
      // Initialize services
      this.contextManager = new LunaContextManager();
      this.knowledgeBase = new LunaKnowledgeBase();
      this.aiService = new LunaAIService();

      // Load predefined responses
      await this.loadPredefinedResponses();

      // Create UI
      this.createChatInterface();
      this.setupEventListeners();

      // Setup context monitoring
      this.startContextMonitoring();

      this.log("Luna AI Assistant initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Luna chatbot:", error);
    }
  }

  async loadPredefinedResponses() {
    try {
      const response = await fetch("js/luna-responses.json");
      this.predefinedResponses = await response.json();
      this.log("Predefined responses loaded successfully");
    } catch (error) {
      console.error("Failed to load predefined responses:", error);
      // Fallback to minimal responses
      this.predefinedResponses = {
        responses: {
          default: {
            patterns: [],
            responses: [
              "I'm here to help with ASTRA mission design! Please try asking about vehicle configuration, optimization, or validation errors.",
            ],
          },
        },
      };
    }
  }

  createChatInterface() {
    // Create chat button
    this.chatButton = document.createElement("div");
    this.chatButton.id = "luna-chat-button";
    this.chatButton.className = "luna-chat-button";
    this.chatButton.innerHTML = `
      <div class="luna-avatar">
        <img src="assets/icons/luna-avatar.svg" alt="Luna AI" />
      </div>
      <div class="luna-notification-badge" style="display: none;">1</div>
    `;

    // Create chat window
    this.chatWindow = document.createElement("div");
    this.chatWindow.id = "luna-chat-window";
    this.chatWindow.className = "luna-chat-window";
    this.chatWindow.style.display = "none";
    this.chatWindow.innerHTML = `
      <div class="luna-chat-header">
        <div class="luna-header-info">
          <div class="luna-avatar-small">
            <img src="assets/icons/luna-avatar.svg" alt="Luna AI" />
          </div>
          <div class="luna-title">
            <h3>Luna AI Assistant</h3>
            <span class="luna-status">Ready to help with ASTRA</span>
          </div>
        </div>
        <div class="luna-header-controls">
          <button class="luna-minimize-btn" title="Minimize">−</button>
          <button class="luna-close-btn" title="Close">×</button>
        </div>
      </div>
      
      <div class="luna-quick-actions">
        <button class="luna-quick-btn" data-action="help-current">Help with current section</button>
        <button class="luna-quick-btn" data-action="validation-help">Fix validation errors</button>
        <button class="luna-quick-btn" data-action="best-practices">Best practices</button>
      </div>
      
      <div class="luna-chat-messages" id="luna-messages">
        <div class="luna-message luna-message-assistant">
          <div class="luna-message-avatar">
            <img src="assets/icons/luna-avatar.svg" alt="Luna" />
          </div>
          <div class="luna-message-content">
            <p>Hello! I'm Luna, your ASTRA mission design assistant. I can help you with:</p>
            <ul>
              <li><strong>Mission Design:</strong> Vehicle configuration, environment setup, optimization</li>
              <li><strong>Troubleshooting:</strong> Validation errors, file formats, common issues</li>
              <li><strong>Guidance:</strong> Best practices, parameter recommendations, step-by-step help</li>
              <li><strong>Quick Help:</strong> Use the buttons above or just ask me anything!</li>
            </ul>
            <p>Try asking: <em>"help with vehicle"</em>, <em>"fix validation errors"</em>, or <em>"how to optimize"</em></p>
          </div>
        </div>
      </div>
      
      <div class="luna-input-area">
        <div class="luna-input-container">
          <input 
            type="text" 
            id="luna-message-input" 
            placeholder="Ask me anything about ASTRA..." 
            maxlength="500"
          />
          <button id="luna-send-btn" title="Send message">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
        <div class="luna-input-footer">
          <span class="luna-char-count">0/500</span>
          <div class="luna-input-actions">
            <button class="luna-voice-btn" title="Voice input" style="display: none;">🎤</button>
          </div>
        </div>
      </div>
    `;

    // Position elements
    this.positionElements();

    // Add to DOM
    document.body.appendChild(this.chatButton);
    document.body.appendChild(this.chatWindow);
  }

  positionElements() {
    const positions = {
      "bottom-right": { bottom: "20px", right: "20px" },
      "bottom-left": { bottom: "20px", left: "20px" },
      "top-right": { top: "20px", right: "20px" },
      "top-left": { top: "20px", left: "20px" },
    };

    const pos = positions[this.config.position] || positions["bottom-right"];

    Object.assign(this.chatButton.style, pos);
    Object.assign(this.chatWindow.style, pos);
  }

  setupEventListeners() {
    // Chat button click
    this.chatButton.addEventListener("click", () => this.toggleChat());

    // Window controls
    this.chatWindow
      .querySelector(".luna-close-btn")
      .addEventListener("click", () => this.hideChat());
    this.chatWindow
      .querySelector(".luna-minimize-btn")
      .addEventListener("click", () => this.minimizeChat());

    // Quick actions
    this.chatWindow.querySelectorAll(".luna-quick-btn").forEach((btn) => {
      btn.addEventListener("click", (e) =>
        this.handleQuickAction(e.target.dataset.action)
      );
    });

    // Message input
    const messageInput = this.chatWindow.querySelector("#luna-message-input");
    const sendBtn = this.chatWindow.querySelector("#luna-send-btn");

    messageInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    messageInput.addEventListener("input", (e) => {
      const charCount = e.target.value.length;
      this.chatWindow.querySelector(
        ".luna-char-count"
      ).textContent = `${charCount}/500`;
    });

    sendBtn.addEventListener("click", () => this.sendMessage());

    // Click outside to close
    document.addEventListener("click", (e) => {
      if (
        !this.chatButton.contains(e.target) &&
        !this.chatWindow.contains(e.target)
      ) {
        if (this.isVisible && !this.isMinimized) {
          // Optional: auto-hide when clicking outside
          // this.hideChat();
        }
      }
    });
  }

  startContextMonitoring() {
    // Monitor form changes and provide proactive help
    if (this.config.proactiveHelp) {
      setInterval(() => {
        const newContext = this.contextManager.getCurrentContext();
        if (this.hasContextChanged(newContext)) {
          this.currentContext = newContext;
          this.onContextChange(newContext);
        }
      }, 2000);
    }
  }

  hasContextChanged(newContext) {
    if (!this.currentContext) return true;
    return (
      this.currentContext.section !== newContext.section ||
      this.currentContext.hasErrors !== newContext.hasErrors ||
      this.currentContext.completionRate !== newContext.completionRate
    );
  }

  onContextChange(context) {
    // Show proactive help based on context
    if (context.hasErrors && this.config.autoShow) {
      this.showChat();
      this.showNotificationBadge();
    }

    // Log context for debugging
    if (this.config.debug) {
      this.log("Context changed:", context);
    }
  }

  async sendMessage(messageText = null) {
    const input = this.chatWindow.querySelector("#luna-message-input");
    const message = messageText || input.value.trim();

    if (!message) return;

    // Clear input
    if (!messageText) {
      input.value = "";
      this.chatWindow.querySelector(".luna-char-count").textContent = "0/500";
    }

    // Add user message to chat
    this.addMessage(message, "user");

    // Get current context
    const context = this.contextManager.getCurrentContext();

    // Show typing indicator
    const typingStart = Date.now();
    this.showTypingIndicator();

    try {
      // Get AI response (synchronous/local lookup)
      const response = await this.getAIResponse(message, context);

      // Ensure typing indicator is visible for at least 800-1200 ms
      const minTypingDuration = 800 + Math.random() * 400; // randomize a bit
      const elapsed = Date.now() - typingStart;
      if (elapsed < minTypingDuration) {
        await new Promise((resolve) =>
          setTimeout(resolve, minTypingDuration - elapsed)
        );
      }

      // Remove typing indicator
      this.hideTypingIndicator();

      // Add AI response
      this.addMessage(response, "assistant");

      // Track conversation
      this.conversationHistory.push(
        { role: "user", content: message, timestamp: Date.now(), context },
        { role: "assistant", content: response, timestamp: Date.now() }
      );

      // Limit conversation history
      if (this.conversationHistory.length > this.config.maxContextLength * 2) {
        this.conversationHistory = this.conversationHistory.slice(
          -this.config.maxContextLength * 2
        );
      }
    } catch (error) {
      this.hideTypingIndicator();
      this.addMessage(
        "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        "assistant",
        true
      );
      console.error("Luna AI Error:", error);
    }
  }

  async getAIResponse(message, context) {
    // Directly use predefined responses only (no external AI or knowledge base)
    return this.getPredefinedResponse(message, context);
  }

  getPredefinedResponse(message, context) {
    if (!this.predefinedResponses || !this.predefinedResponses.responses) {
      return "I'm Luna, your ASTRA assistant! I'm ready to help with mission design, but I seem to be having trouble accessing my knowledge base. Please try refreshing the page.";
    }

    const userMessage = message.toLowerCase().trim();

    // Check for specific keyword responses first (highest priority)
    if (this.predefinedResponses.keyword_responses) {
      for (const [keyword, data] of Object.entries(
        this.predefinedResponses.keyword_responses
      )) {
        if (this.matchesPattern(userMessage, data.patterns)) {
          return data.response;
        }
      }
    }

    // Check for contextual responses
    if (context && context.sectionName) {
      const sectionKey =
        context.sectionName.toLowerCase().replace(/\s+/g, "_") + "_section";
      const contextualResponse =
        this.predefinedResponses.contextual_responses[sectionKey];
      if (
        contextualResponse &&
        this.matchesPattern(userMessage, contextualResponse.patterns)
      ) {
        return contextualResponse.response;
      }
    }

    // Check for error-specific responses
    if (context && context.hasErrors) {
      return this.predefinedResponses.error_responses.validation_error;
    }

    // Find best matching response category
    let bestMatch = null;
    let bestScore = 0;

    for (const [category, data] of Object.entries(
      this.predefinedResponses.responses
    )) {
      if (category === "default") continue;

      const score = this.calculateMatchScore(userMessage, data.patterns);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = data;
      }
    }

    // Use best match or default
    const responseData =
      bestMatch || this.predefinedResponses.responses.default;
    const responses = responseData.responses;

    // Return random response from the matched category
    return responses[Math.floor(Math.random() * responses.length)];
  }

  matchesPattern(message, patterns) {
    return patterns.some(
      (pattern) =>
        message.includes(pattern.toLowerCase()) ||
        pattern.toLowerCase().includes(message)
    );
  }

  calculateMatchScore(message, patterns) {
    let score = 0;
    const words = message.split(/\s+/);

    for (const pattern of patterns) {
      const patternWords = pattern.toLowerCase().split(/\s+/);

      // Exact phrase match
      if (message.includes(pattern.toLowerCase())) {
        score += 10;
      }

      // Word overlap scoring
      for (const word of words) {
        if (patternWords.some((pw) => pw.includes(word) || word.includes(pw))) {
          score += 2;
        }
      }

      // Partial match bonus
      if (
        patternWords.some((pw) =>
          words.some((w) => w.includes(pw) || pw.includes(w))
        )
      ) {
        score += 1;
      }
    }

    return score;
  }

  addMessage(content, role, isError = false) {
    const messagesContainer = this.chatWindow.querySelector("#luna-messages");
    const messageDiv = document.createElement("div");
    messageDiv.className = `luna-message luna-message-${role}`;

    if (isError) {
      messageDiv.classList.add("luna-message-error");
    }

    const timestamp = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (role === "user") {
      messageDiv.innerHTML = `
        <div class="luna-message-content">
          <p>${this.escapeHtml(content)}</p>
          <span class="luna-message-time">${timestamp}</span>
        </div>
      `;
    } else {
      // Assistant message with typing animation
      messageDiv.innerHTML = `
        <div class="luna-message-avatar">
          <img src="assets/icons/luna-avatar.svg" alt="Luna" />
        </div>
        <div class="luna-message-content"><span class="luna-typing-text"></span></div>
      `;
    }

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Trigger typing animation for assistant responses after element is in DOM
    if (role === "assistant" && !isError) {
      const textSpan = messageDiv.querySelector(".luna-typing-text");
      this.animateTyping(
        textSpan,
        this.formatMessage(content),
        timestamp,
        () => {
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
      );
    }
  }

  // Typewriter-style reveal effect for assistant messages
  animateTyping(targetElement, formattedHtml, timestamp, onComplete) {
    const plainText = formattedHtml.replace(/<[^>]+>/g, "");
    let idx = 0;
    const speed = 15; // ms per character
    const typeInterval = setInterval(() => {
      targetElement.textContent = plainText.slice(0, idx);
      idx++;
      if (idx > plainText.length) {
        clearInterval(typeInterval);
        // Replace with fully formatted HTML including timestamp
        const parent = targetElement.parentElement;
        parent.innerHTML = `${formattedHtml}<span class="luna-message-time">${timestamp}</span>`;
        if (typeof onComplete === "function") onComplete();
      }
    }, speed);
  }

  formatMessage(content) {
    // Convert markdown-like formatting to HTML
    return content
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`(.*?)`/g, "<code>$1</code>")
      .replace(/\n/g, "<br>")
      .replace(/^- (.+)$/gm, "<li>$1</li>")
      .replace(/(<li>.*<\/li>)/s, "<ul>$1</ul>");
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  showTypingIndicator() {
    const messagesContainer = this.chatWindow.querySelector("#luna-messages");
    const typingDiv = document.createElement("div");
    typingDiv.className = "luna-message luna-message-assistant luna-typing";
    typingDiv.id = "luna-typing-indicator";
    typingDiv.innerHTML = `
      <div class="luna-message-avatar">
        <img src="assets/icons/luna-avatar.svg" alt="Luna" />
      </div>
      <div class="luna-message-content">
        <div class="luna-typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    `;
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  hideTypingIndicator() {
    const typingIndicator = this.chatWindow.querySelector(
      "#luna-typing-indicator"
    );
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }

  async handleQuickAction(action) {
    const context = this.contextManager.getCurrentContext();

    switch (action) {
      case "help-current":
        await this.sendMessage(`Help me with the ${context.section} section`);
        break;
      case "validation-help":
        if (context.hasErrors) {
          await this.sendMessage(
            "I'm seeing validation errors. Can you help me fix them?"
          );
        } else {
          await this.sendMessage(
            "How can I avoid validation errors in my mission design?"
          );
        }
        break;
      case "best-practices":
        await this.sendMessage(
          `What are the best practices for ${context.section}?`
        );
        break;
    }
  }

  toggleChat() {
    if (this.isVisible) {
      this.hideChat();
    } else {
      this.showChat();
    }
  }

  showChat() {
    this.chatWindow.style.display = "flex";
    this.chatButton.style.display = "none";
    this.isVisible = true;
    this.isMinimized = false;
    this.hideNotificationBadge();

    // Focus input
    setTimeout(() => {
      const input = this.chatWindow.querySelector("#luna-message-input");
      if (input) input.focus();
    }, 100);
  }

  hideChat() {
    this.chatWindow.style.display = "none";
    this.chatButton.style.display = "flex";
    this.isVisible = false;
    this.isMinimized = false;
  }

  minimizeChat() {
    this.chatWindow.style.display = "none";
    this.chatButton.style.display = "flex";
    this.isVisible = false;
    this.isMinimized = true;
  }

  showNotificationBadge() {
    const badge = this.chatButton.querySelector(".luna-notification-badge");
    if (badge) badge.style.display = "block";
  }

  hideNotificationBadge() {
    const badge = this.chatButton.querySelector(".luna-notification-badge");
    if (badge) badge.style.display = "none";
  }

  // Public API methods
  enable() {
    this.config.enabled = true;
    if (!this.chatButton) {
      this.init();
    } else {
      this.chatButton.style.display = "flex";
      this.chatWindow.style.display = this.isVisible ? "flex" : "none";
    }
  }

  disable() {
    this.config.enabled = false;
    if (this.chatButton) this.chatButton.style.display = "none";
    if (this.chatWindow) this.chatWindow.style.display = "none";
  }

  destroy() {
    if (this.chatButton) this.chatButton.remove();
    if (this.chatWindow) this.chatWindow.remove();
    this.conversationHistory = [];
    this.eventListeners.clear();
  }

  // Event system
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach((callback) => callback(data));
    }
  }

  log(...args) {
    if (this.config.debug) {
      console.log("[Luna AI]", ...args);
    }
  }
}

// Make available globally
window.LunaChatbot = LunaChatbot;
