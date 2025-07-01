/**
 * Luna Knowledge Base
 * ASTRA-specific help content and intelligent response generation
 */

class LunaKnowledgeBase {
  constructor() {
    this.knowledge = {
      sections: this.initializeSections(),
      fields: this.initializeFields(),
      troubleshooting: this.initializeTroubleshooting(),
      workflows: this.initializeWorkflows(),
      bestPractices: this.initializeBestPractices(),
    };

    this.responsePatterns = this.initializeResponsePatterns();
  }

  initializeSections() {
    return {
      "mission-info": {
        title: "Mission Information",
        description: "Define basic mission parameters and objectives",
        content: `This section sets up your mission's fundamental parameters:
        
        **Mission Name**: A unique identifier for your mission
        **Mission Type**: Choose from simulation or optimization modes
        **Target Orbit**: Define your desired orbital parameters
        **Launch Date**: Set mission timeline constraints
        **Mission Duration**: Total mission length
        
        Key considerations:
        - Use descriptive names for easy identification
        - Simulation mode tests specific configurations
        - Optimization mode finds optimal solutions within constraints`,
        fields: [
          "missionName",
          "missionType",
          "targetOrbit",
          "launchDate",
          "duration",
        ],
      },

      environment: {
        title: "Environment Settings",
        description: "Configure atmospheric and gravitational models",
        content: `Environmental parameters affect trajectory accuracy:
        
        **Atmospheric Model**: Choose density model (US Standard, GRAM, etc.)
        **Gravity Model**: Earth gravitational field representation
        **Launch Site**: Geographic location and elevation
        **Weather Conditions**: Wind profiles and temperature
        **Solar Activity**: Space weather effects
        
        Recommendations:
        - Use higher fidelity models for accurate results
        - Consider seasonal variations for launch windows
        - Include wind uncertainty for robust design`,
        fields: [
          "atmosphericModel",
          "gravityModel",
          "launchSite",
          "windProfile",
        ],
      },

      "vehicle-config": {
        title: "Vehicle Configuration",
        description: "Define vehicle mass properties and geometry",
        content: `Vehicle configuration defines physical properties:
        
        **Mass Properties**: Dry mass, propellant mass, center of mass
        **Geometry**: Length, diameter, reference area
        **Aerodynamics**: Drag coefficients and lift characteristics
        **Structure**: Material properties and structural limits
        
        Critical for:
        - Trajectory calculations
        - Structural analysis
        - Performance optimization
        - Control system design`,
        fields: [
          "dryMass",
          "propellantMass",
          "length",
          "diameter",
          "dragCoeff",
        ],
      },

      "stages-motors": {
        title: "Stages & Motors",
        description: "Configure propulsion system and staging",
        content: `Propulsion system configuration:
        
        **Number of Stages**: Multi-stage vs single-stage design
        **Motor Type**: Solid, liquid, or hybrid propulsion
        **Thrust Profile**: Time-varying thrust characteristics
        **Specific Impulse**: Propellant efficiency measure
        **Burn Time**: Duration of each motor firing
        
        Design principles:
        - Higher stages use higher Isp propulsion
        - Optimize mass ratios for maximum performance
        - Consider throttling and restart capabilities`,
        fields: [
          "numStages",
          "motorType",
          "thrust",
          "specificImpulse",
          "burnTime",
        ],
      },

      steering: {
        title: "Steering Parameters",
        description: "Set guidance and control parameters",
        content: `Steering controls trajectory shaping:
        
        **Guidance Law**: Method for trajectory correction
        **Control Gains**: Feedback control parameters
        **Attitude Control**: Vehicle orientation management
        **Thrust Vectoring**: Engine gimbal capabilities
        **Rate Limits**: Maximum control authority
        
        Key concepts:
        - Proportional navigation for intercept missions
        - Gravity turn for launch trajectories
        - Three-axis stabilization for precision pointing`,
        fields: [
          "guidanceLaw",
          "controlGains",
          "attitudeControl",
          "thrustVector",
        ],
      },

      optimization: {
        title: "Optimization Settings",
        description: "Define objectives and constraints for optimization",
        content: `Optimization finds best solutions:
        
        **Objective Function**: What to minimize/maximize
        **Design Variables**: Parameters to optimize
        **Constraints**: Physical and mission limits
        **Algorithm**: Optimization method selection
        **Tolerance**: Convergence criteria
        
        Common objectives:
        - Minimize propellant consumption
        - Maximize payload mass
        - Minimize flight time
        - Minimize cost or risk`,
        fields: [
          "objectiveFunction",
          "designVariables",
          "constraints",
          "algorithm",
        ],
      },

      "stopping-conditions": {
        title: "Stopping Conditions",
        description: "Define mission termination criteria",
        content: `Conditions that end the simulation:
        
        **Altitude Limits**: Maximum/minimum altitude
        **Time Limits**: Maximum simulation duration
        **Velocity Conditions**: Target velocities achieved
        **Distance Criteria**: Range or position targets
        **Event Triggers**: Stage separation, engine cutoff
        
        Purpose:
        - Prevent infinite simulations
        - Define success criteria
        - Capture mission milestones`,
        fields: [
          "altitudeLimit",
          "timeLimit",
          "velocityTarget",
          "distanceCriteria",
        ],
      },
    };
  }

  initializeFields() {
    return {
      // Mission Info Fields
      missionName: {
        description: "Unique identifier for your mission",
        help: 'Use descriptive names like "Mars-Transfer-2024" or "ISS-Resupply-Mission"',
        validation:
          "Must be non-empty and contain only alphanumeric characters, hyphens, and underscores",
        examples: [
          "lunar-landing-demo",
          "mars-transfer-2024",
          "satellite-deployment",
        ],
      },

      missionType: {
        description:
          "Simulation analyzes a specific design; Optimization finds the best design",
        help: "Choose Simulation to test known parameters, or Optimization to find optimal solutions",
        options: ["simulation", "optimization"],
        examples: ["simulation", "optimization"],
      },

      // Environment Fields
      atmosphericModel: {
        description:
          "Mathematical model of atmospheric density variation with altitude",
        help: "US Standard 1976 is good for most applications. GRAM provides more detailed modeling.",
        options: ["US Standard 1976", "GRAM-99", "MSIS-E-90", "Custom"],
        examples: ["US Standard 1976"],
      },

      launchSite: {
        description: "Geographic location of launch facility",
        help: "Affects trajectory due to Earth rotation and gravitational variations",
        examples: [
          "Kennedy Space Center",
          "Vandenberg SFB",
          "Baikonur Cosmodrome",
        ],
      },

      // Vehicle Config Fields
      dryMass: {
        description: "Vehicle mass without propellant (kg)",
        help: "Includes structure, payload, avionics, and empty tanks",
        units: "kg",
        range: [100, 500000],
        examples: [5000, 15000, 50000],
      },

      propellantMass: {
        description: "Total usable propellant mass (kg)",
        help: "Directly affects delta-V capability and performance",
        units: "kg",
        range: [100, 2000000],
        examples: [45000, 120000, 400000],
      },

      // Propulsion Fields
      specificImpulse: {
        description: "Measure of propellant efficiency (seconds)",
        help: "Higher Isp means more efficient propulsion. Typical values: Solid ~250s, Liquid ~300-450s",
        units: "seconds",
        range: [200, 500],
        examples: [250, 310, 420],
      },

      thrust: {
        description: "Motor thrust force (Newtons)",
        help: "Determines acceleration and burn time. Higher thrust = faster acceleration but shorter burn",
        units: "N",
        range: [1000, 10000000],
        examples: [890000, 2200000, 7600000],
      },
    };
  }

  initializeTroubleshooting() {
    return {
      "validation-error": {
        title: "Validation Errors",
        solutions: [
          "Check that all required fields are filled",
          "Verify numeric values are within acceptable ranges",
          "Ensure text fields don't contain special characters",
          "Review field formats (dates, coordinates, etc.)",
        ],
      },

      "performance-issues": {
        title: "Performance Problems",
        solutions: [
          "Reduce simulation time step for stability",
          "Check for unrealistic parameter combinations",
          "Verify thrust-to-weight ratios are reasonable",
          "Review staging sequence timing",
        ],
      },

      "convergence-failure": {
        title: "Optimization Not Converging",
        solutions: [
          "Widen design variable bounds",
          "Relax constraint tolerances",
          "Try different optimization algorithms",
          "Check for conflicting constraints",
          "Verify objective function scaling",
        ],
      },

      "trajectory-instability": {
        title: "Unstable Trajectory",
        solutions: [
          "Check control system gains",
          "Verify vehicle stability derivatives",
          "Review guidance law parameters",
          "Ensure reasonable thrust vectoring limits",
        ],
      },
    };
  }

  initializeWorkflows() {
    return {
      "first-time-setup": [
        "1. Start with Mission Information - define your mission goals",
        "2. Configure Environment - set atmospheric and gravity models",
        "3. Define Vehicle Configuration - enter mass and geometry",
        "4. Set up Stages & Motors - configure propulsion system",
        "5. Configure Steering - set guidance parameters",
        "6. Run Simulation or set up Optimization",
        "7. Review results and iterate design",
      ],

      "optimization-workflow": [
        "1. Complete simulation setup first",
        "2. Define objective function (what to optimize)",
        "3. Select design variables (what can change)",
        "4. Set constraints (limits and requirements)",
        "5. Choose optimization algorithm",
        "6. Run optimization and review results",
        "7. Validate optimized design with simulation",
      ],

      "troubleshooting-workflow": [
        "1. Identify the specific error or issue",
        "2. Check most recent changes to configuration",
        "3. Verify all required fields are completed",
        "4. Review parameter ranges and units",
        "5. Test with known-good configurations",
        "6. Check console for detailed error messages",
      ],
    };
  }

  initializeBestPractices() {
    return {
      "mission-design": [
        "Start simple and add complexity gradually",
        "Use realistic parameter values based on existing systems",
        "Validate each stage of design before proceeding",
        "Document assumptions and design choices",
        "Perform sensitivity analysis on key parameters",
      ],

      optimization: [
        "Define clear, measurable objectives",
        "Start with wide design variable bounds",
        "Use multiple optimization runs with different starting points",
        "Validate optimization results with detailed simulation",
        "Consider robustness and uncertainty in design",
      ],

      simulation: [
        "Use appropriate fidelity models for mission phase",
        "Include uncertainty and dispersions in analysis",
        "Verify simulation results against analytical estimates",
        "Document configuration for reproducibility",
        "Run Monte Carlo analysis for statistical confidence",
      ],
    };
  }

  initializeResponsePatterns() {
    return {
      greeting: [
        "Hello! I'm here to help you with ASTRA mission design.",
        "Hi there! What aspect of your mission would you like assistance with?",
        "Welcome! I can help you navigate ASTRA's mission design tools.",
      ],

      field_help: [
        "Let me explain the {field} parameter for you.",
        "The {field} setting is important because...",
        "Here's what you need to know about {field}:",
      ],

      validation_help: [
        "I can help you fix those validation errors.",
        "Let's resolve these validation issues step by step.",
        "Those error messages indicate...",
      ],

      section_guidance: [
        "For the {section} section, here's what you should focus on:",
        "The {section} configuration is crucial for...",
        "Let me guide you through the {section} setup:",
      ],

      best_practices: [
        "Here are some best practices for {topic}:",
        "Based on aerospace industry standards, I recommend:",
        "For optimal results in {topic}, consider:",
      ],
    };
  }

  getResponse(message, context) {
    const intent = this.analyzeIntent(message, context);

    switch (intent.type) {
      case "field_help":
        return this.getFieldHelp(intent.field, context);

      case "section_help":
        return this.getSectionHelp(intent.section || context.section);

      case "validation_help":
        return this.getValidationHelp(context.errors);

      case "troubleshooting":
        return this.getTroubleshootingHelp(intent.issue);

      case "best_practices":
        return this.getBestPracticesHelp(intent.topic || context.section);

      case "workflow":
        return this.getWorkflowHelp(intent.workflow);

      case "greeting":
        return this.getGreeting(context);

      default:
        return this.getGeneralHelp(message, context);
    }
  }

  analyzeIntent(message, context) {
    const msg = message.toLowerCase();

    // Field-specific help
    for (const field of Object.keys(this.knowledge.fields)) {
      if (
        msg.includes(field.toLowerCase()) ||
        msg.includes(field.replace(/([A-Z])/g, " $1").toLowerCase())
      ) {
        return { type: "field_help", field };
      }
    }

    // Section help
    for (const section of Object.keys(this.knowledge.sections)) {
      const sectionName = this.knowledge.sections[section].title.toLowerCase();
      if (msg.includes(sectionName) || msg.includes(section)) {
        return { type: "section_help", section };
      }
    }

    // Validation help
    if (
      msg.includes("error") ||
      msg.includes("validation") ||
      msg.includes("fix") ||
      msg.includes("wrong")
    ) {
      return { type: "validation_help" };
    }

    // Best practices
    if (
      msg.includes("best practice") ||
      msg.includes("recommendation") ||
      msg.includes("should i") ||
      msg.includes("how to")
    ) {
      return { type: "best_practices", topic: context.section };
    }

    // Troubleshooting
    if (
      msg.includes("problem") ||
      msg.includes("issue") ||
      msg.includes("not working") ||
      msg.includes("help")
    ) {
      return { type: "troubleshooting", issue: "general" };
    }

    // Workflow
    if (
      msg.includes("workflow") ||
      msg.includes("process") ||
      msg.includes("steps") ||
      msg.includes("start")
    ) {
      return { type: "workflow", workflow: "first-time-setup" };
    }

    // Greeting
    if (
      msg.includes("hello") ||
      msg.includes("hi") ||
      (msg.includes("help") && msg.length < 20)
    ) {
      return { type: "greeting" };
    }

    return { type: "general" };
  }

  getFieldHelp(fieldName, context) {
    const field = this.knowledge.fields[fieldName];
    if (!field) {
      return `I don't have specific information about the "${fieldName}" field. Could you tell me more about what you're trying to configure?`;
    }

    let response = `**${fieldName}**: ${field.description}\n\n`;

    if (field.help) {
      response += `💡 **Tip**: ${field.help}\n\n`;
    }

    if (field.units) {
      response += `📏 **Units**: ${field.units}\n\n`;
    }

    if (field.range) {
      response += `📊 **Typical Range**: ${field.range[0]} - ${field.range[1]}\n\n`;
    }

    if (field.examples && field.examples.length > 0) {
      response += `📋 **Examples**: ${field.examples.join(", ")}\n\n`;
    }

    if (field.validation) {
      response += `⚠️ **Validation**: ${field.validation}`;
    }

    return response;
  }

  getSectionHelp(sectionId) {
    const section = this.knowledge.sections[sectionId];
    if (!section) {
      return `I don't have detailed information about that section. Could you be more specific about what you need help with?`;
    }

    return `# ${section.title}\n\n${section.content}`;
  }

  getValidationHelp(errors) {
    if (!errors || errors.length === 0) {
      return "I don't see any validation errors right now. All fields appear to be filled correctly! 🎉";
    }

    let response = "I can help you fix these validation errors:\n\n";

    errors.forEach((error, index) => {
      response += `${index + 1}. **${error.field}**: ${error.message}\n`;
    });

    response +=
      "\n" +
      this.knowledge.troubleshooting["validation-error"].solutions
        .map((s) => `• ${s}`)
        .join("\n");

    return response;
  }

  getTroubleshootingHelp(issue) {
    const troubleshooting =
      this.knowledge.troubleshooting[issue] ||
      this.knowledge.troubleshooting["validation-error"];

    let response = `## ${troubleshooting.title}\n\n`;
    response += "Here are some solutions to try:\n\n";
    response += troubleshooting.solutions.map((s) => `• ${s}`).join("\n");

    return response;
  }

  getBestPracticesHelp(topic) {
    const practices = this.knowledge.bestPractices["mission-design"];

    let response = `## Best Practices for ${topic}\n\n`;
    response += practices.map((p) => `• ${p}`).join("\n");

    return response;
  }

  getWorkflowHelp(workflowType) {
    const workflow =
      this.knowledge.workflows[workflowType] ||
      this.knowledge.workflows["first-time-setup"];

    let response = "Here's the recommended workflow:\n\n";
    response += workflow.join("\n");

    return response;
  }

  getGreeting(context) {
    const greetings = this.responsePatterns.greeting;
    let response = greetings[Math.floor(Math.random() * greetings.length)];

    if (context.section) {
      response += ` I see you're working on the ${context.sectionName} section.`;
    }

    if (context.hasErrors) {
      response +=
        " I notice there are some validation errors I can help you fix.";
    }

    return response;
  }

  getGeneralHelp(message, context) {
    const responses = [
      `I'm here to help with ASTRA mission design. You're currently in the ${context.sectionName} section. What specific aspect would you like assistance with?`,

      `I can help you with field definitions, validation errors, best practices, and mission design workflows. What would you like to know more about?`,

      `For the ${context.sectionName} section, I can explain field requirements, troubleshoot issues, or provide guidance on best practices. How can I assist you?`,
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Utility methods
  searchKnowledge(query) {
    const results = [];
    const searchTerm = query.toLowerCase();

    // Search sections
    Object.entries(this.knowledge.sections).forEach(([key, section]) => {
      if (
        section.title.toLowerCase().includes(searchTerm) ||
        section.content.toLowerCase().includes(searchTerm)
      ) {
        results.push({ type: "section", key, content: section });
      }
    });

    // Search fields
    Object.entries(this.knowledge.fields).forEach(([key, field]) => {
      if (
        key.toLowerCase().includes(searchTerm) ||
        field.description.toLowerCase().includes(searchTerm)
      ) {
        results.push({ type: "field", key, content: field });
      }
    });

    return results;
  }

  getRandomTip() {
    const allTips = Object.values(this.knowledge.bestPractices).flat();
    return allTips[Math.floor(Math.random() * allTips.length)];
  }
}

// Make available globally
window.LunaKnowledgeBase = LunaKnowledgeBase;
