/**
 * Luna AI Service
 * Handles external AI provider integration with intelligent fallbacks
 */

class LunaAIService {
  constructor() {
    this.apiKey = null;
    this.model = "gpt-4";
    this.apiUrl = null;
    this.provider = "openai";
    this.isConfigured = false;
    this.requestQueue = [];
    this.rateLimitDelay = 1000; // 1 second between requests
    this.lastRequestTime = 0;
  }

  configure(apiKey, model = "gpt-4", customUrl = null) {
    this.apiKey = apiKey;
    this.model = model;
    this.apiUrl = customUrl;

    // Determine provider type
    if (customUrl) {
      if (customUrl.includes("azure")) {
        this.provider = "azure";
      } else if (
        customUrl.includes("localhost") ||
        customUrl.includes("ollama")
      ) {
        this.provider = "ollama";
      } else {
        this.provider = "custom";
      }
    } else {
      this.provider = "openai";
    }

    this.isConfigured = !!apiKey || this.provider === "ollama";

    console.log(
      `Luna AI Service configured for ${this.provider} with model ${this.model}`
    );
  }

  isConfigured() {
    return this.isConfigured;
  }

  async getResponse(message, context, conversationHistory = []) {
    if (!this.isConfigured) {
      throw new Error("AI Service not configured");
    }

    // Rate limiting
    await this.respectRateLimit();

    try {
      const systemPrompt = this.buildSystemPrompt(context);
      const messages = this.buildMessageHistory(
        systemPrompt,
        message,
        conversationHistory
      );

      switch (this.provider) {
        case "openai":
          return await this.getOpenAIResponse(messages);
        case "azure":
          return await this.getAzureResponse(messages);
        case "ollama":
          return await this.getOllamaResponse(messages);
        case "custom":
          return await this.getCustomResponse(messages);
        default:
          throw new Error(`Unsupported provider: ${this.provider}`);
      }
    } catch (error) {
      console.error("AI Service error:", error);
      throw error;
    }
  }

  buildSystemPrompt(context) {
    return `You are Luna, an AI assistant specialized in ASTRA mission design software. You help users with aerospace mission planning, trajectory optimization, and spacecraft design.

CURRENT CONTEXT:
- Section: ${context.sectionName}
- Completion: ${context.completionRate}%
- Has Errors: ${context.hasErrors}
- Active Fields: ${context.activeFields.length}

USER'S CURRENT STATE:
${
  context.hasErrors
    ? `- Validation Errors: ${context.errors.map((e) => e.message).join(", ")}`
    : "- No validation errors"
}
${
  context.recommendations.length > 0
    ? `- Recommendations: ${context.recommendations.join(", ")}`
    : ""
}

INSTRUCTIONS:
1. Provide accurate, helpful information about ASTRA and mission design
2. Reference the current context when relevant
3. Use clear, technical but accessible language
4. Offer specific, actionable advice
5. If you mention parameters, include typical values and units
6. Format responses with markdown for readability
7. Keep responses focused and concise (under 300 words typically)
8. Always prioritize user safety and mission success

KNOWLEDGE AREAS:
- Mission design principles
- Orbital mechanics and trajectory optimization
- Spacecraft propulsion systems
- Atmospheric and environmental models
- Guidance, navigation, and control
- Optimization algorithms and constraints
- Aerospace engineering best practices

Respond as Luna, the knowledgeable and helpful ASTRA assistant.`;
  }

  buildMessageHistory(systemPrompt, currentMessage, history) {
    const messages = [{ role: "system", content: systemPrompt }];

    // Add recent conversation history (limited to prevent token overflow)
    const recentHistory = history.slice(-6); // Last 6 messages
    recentHistory.forEach((msg) => {
      messages.push({
        role: msg.role,
        content: msg.content,
      });
    });

    // Add current message
    messages.push({
      role: "user",
      content: currentMessage,
    });

    return messages;
  }

  async respectRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.rateLimitDelay) {
      const waitTime = this.rateLimitDelay - timeSinceLastRequest;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime = Date.now();
  }

  async getOpenAIResponse(messages) {
    const url = this.apiUrl || "https://api.openai.com/v1/chat/completions";

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("Invalid response format from OpenAI");
    }

    return data.choices[0].message.content.trim();
  }

  async getAzureResponse(messages) {
    const response = await fetch(this.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": this.apiKey,
      },
      body: JSON.stringify({
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Azure OpenAI error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  }

  async getOllamaResponse(messages) {
    const url = this.apiUrl || "http://localhost:11434/v1/chat/completions";

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        messages: messages,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Ollama error: ${response.status} - ${error}`);
    }

    const data = await response.json();

    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content.trim();
    } else if (data.message && data.message.content) {
      // Handle different Ollama response formats
      return data.message.content.trim();
    } else {
      throw new Error("Invalid response format from Ollama");
    }
  }

  async getCustomResponse(messages) {
    const response = await fetch(this.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(this.apiKey && { Authorization: `Bearer ${this.apiKey}` }),
      },
      body: JSON.stringify({
        model: this.model,
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Custom API error: ${response.status} - ${error}`);
    }

    const data = await response.json();

    // Try common response formats
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content.trim();
    } else if (data.response) {
      return data.response.trim();
    } else if (data.text) {
      return data.text.trim();
    } else {
      throw new Error("Unknown response format from custom API");
    }
  }

  // Utility methods for configuration
  testConnection() {
    return new Promise(async (resolve, reject) => {
      try {
        const testMessage = "Hello, this is a connection test.";
        const testContext = {
          section: "test",
          sectionName: "Test",
          completionRate: 0,
          hasErrors: false,
          errors: [],
          activeFields: [],
          recommendations: [],
        };

        const response = await this.getResponse(testMessage, testContext, []);
        resolve({
          success: true,
          provider: this.provider,
          model: this.model,
          response: response.substring(0, 100) + "...",
        });
      } catch (error) {
        reject({
          success: false,
          provider: this.provider,
          model: this.model,
          error: error.message,
        });
      }
    });
  }

  getConfiguration() {
    return {
      provider: this.provider,
      model: this.model,
      isConfigured: this.isConfigured,
      hasApiKey: !!this.apiKey,
      apiUrl: this.apiUrl,
    };
  }

  // Preset configurations for common setups
  configureForOpenAI(apiKey, model = "gpt-4") {
    this.configure(apiKey, model);
  }

  configureForAzure(
    apiKey,
    deploymentName,
    resourceName,
    apiVersion = "2023-12-01-preview"
  ) {
    const url = `https://${resourceName}.openai.azure.com/openai/deployments/${deploymentName}/chat/completions?api-version=${apiVersion}`;
    this.configure(apiKey, deploymentName, url);
  }

  configureForOllama(model = "llama2", baseUrl = "http://localhost:11434") {
    const url = `${baseUrl}/v1/chat/completions`;
    this.configure(null, model, url);
  }

  // Error handling helpers
  getErrorSuggestion(error) {
    const errorMessage = error.message.toLowerCase();

    if (errorMessage.includes("401") || errorMessage.includes("unauthorized")) {
      return "Check your API key - it may be invalid or expired.";
    }

    if (errorMessage.includes("429") || errorMessage.includes("rate limit")) {
      return "You've hit the rate limit. Please wait a moment before trying again.";
    }

    if (errorMessage.includes("404") || errorMessage.includes("not found")) {
      return "The model or endpoint wasn't found. Check your configuration.";
    }

    if (errorMessage.includes("timeout") || errorMessage.includes("network")) {
      return "Network connection issue. Check your internet connection.";
    }

    if (errorMessage.includes("ollama")) {
      return "Make sure Ollama is running locally and the model is installed.";
    }

    return "An unexpected error occurred. Please check the console for more details.";
  }

  // Fallback response when AI is unavailable
  getFallbackResponse(message, context) {
    const fallbacks = [
      `I'm having trouble connecting to the AI service right now. For help with ${context.sectionName}, you can check the documentation or try again in a moment.`,

      `The AI service is temporarily unavailable. However, I can still help with basic guidance for the ${context.sectionName} section. What specific field do you need help with?`,

      `Connection to AI service failed. For immediate assistance with ${context.sectionName}, please refer to the field tooltips or built-in help system.`,
    ];

    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }
}

// Make available globally
window.LunaAIService = LunaAIService;
