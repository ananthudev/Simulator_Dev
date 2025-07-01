/**
 * Luna Context Manager
 * Monitors form state and provides context-aware assistance
 */

class LunaContextManager {
  constructor() {
    this.currentSection = null;
    this.formSections = {
      "mission-info": "Mission Information",
      environment: "Environment Settings",
      "vehicle-config": "Vehicle Configuration",
      "stages-motors": "Stages & Motors",
      steering: "Steering Parameters",
      optimization: "Optimization Settings",
      "stopping-conditions": "Stopping Conditions",
    };
    this.lastContext = null;
  }

  getCurrentContext() {
    const context = {
      section: this.getCurrentSection(),
      sectionName: this.getCurrentSectionName(),
      activeFields: this.getActiveFields(),
      completionRate: this.getCompletionRate(),
      hasErrors: this.hasValidationErrors(),
      errors: this.getValidationErrors(),
      formData: this.getFormData(),
      recommendations: this.getRecommendations(),
      timestamp: Date.now(),
    };

    this.lastContext = context;
    return context;
  }

  getCurrentSection() {
    // Check active tab/section
    const activeTab = document.querySelector(
      ".nav-tab.active, .tab.active, .section.active"
    );
    if (activeTab) {
      return (
        activeTab.id ||
        activeTab.dataset.section ||
        this.extractSectionFromClass(activeTab)
      );
    }

    // Check focused elements
    const focusedElement = document.activeElement;
    if (focusedElement) {
      const section = this.findSectionForElement(focusedElement);
      if (section) return section;
    }

    // Check visible sections
    const visibleSection = this.getVisibleSection();
    if (visibleSection) return visibleSection;

    return "mission-info"; // Default
  }

  getCurrentSectionName() {
    const section = this.getCurrentSection();
    return (
      this.formSections[section] ||
      section.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())
    );
  }

  extractSectionFromClass(element) {
    const classes = element.className.split(" ");
    for (const cls of classes) {
      if (cls.includes("mission") || cls.includes("info"))
        return "mission-info";
      if (cls.includes("environment") || cls.includes("atmos"))
        return "environment";
      if (cls.includes("vehicle") || cls.includes("config"))
        return "vehicle-config";
      if (cls.includes("stage") || cls.includes("motor"))
        return "stages-motors";
      if (cls.includes("steering") || cls.includes("guidance"))
        return "steering";
      if (cls.includes("optimization") || cls.includes("opt"))
        return "optimization";
      if (cls.includes("stopping") || cls.includes("condition"))
        return "stopping-conditions";
    }
    return null;
  }

  findSectionForElement(element) {
    // Walk up the DOM to find section container
    let current = element;
    while (current && current !== document.body) {
      if (current.id && Object.keys(this.formSections).includes(current.id)) {
        return current.id;
      }

      // Check for section indicators in classes or data attributes
      if (current.dataset && current.dataset.section) {
        return current.dataset.section;
      }

      const section = this.extractSectionFromClass(current);
      if (section) return section;

      current = current.parentElement;
    }
    return null;
  }

  getVisibleSection() {
    // Find the most visible section
    for (const sectionId of Object.keys(this.formSections)) {
      const section = document.getElementById(sectionId);
      if (section && this.isElementVisible(section)) {
        return sectionId;
      }
    }
    return null;
  }

  isElementVisible(element) {
    const rect = element.getBoundingClientRect();
    const viewHeight = Math.max(
      document.documentElement.clientHeight,
      window.innerHeight
    );
    const viewWidth = Math.max(
      document.documentElement.clientWidth,
      window.innerWidth
    );

    return (
      rect.bottom >= 0 &&
      rect.right >= 0 &&
      rect.top < viewHeight &&
      rect.left < viewWidth &&
      window.getComputedStyle(element).display !== "none" &&
      window.getComputedStyle(element).visibility !== "hidden"
    );
  }

  getActiveFields() {
    const section = this.getCurrentSection();
    const sectionElement = document.getElementById(section);

    if (!sectionElement) return [];

    const fields = [];
    const inputs = sectionElement.querySelectorAll("input, select, textarea");

    inputs.forEach((input) => {
      if (input.name || input.id) {
        fields.push({
          name: input.name || input.id,
          type: input.type || input.tagName.toLowerCase(),
          value: input.value,
          required: input.required || input.hasAttribute("data-required"),
          placeholder: input.placeholder,
          label: this.getFieldLabel(input),
        });
      }
    });

    return fields;
  }

  getFieldLabel(input) {
    // Try to find associated label
    let label = "";

    // Direct label element
    const labelElement = document.querySelector(`label[for="${input.id}"]`);
    if (labelElement) {
      label = labelElement.textContent.trim();
    }

    // Parent label
    if (!label) {
      const parentLabel = input.closest("label");
      if (parentLabel) {
        label = parentLabel.textContent.replace(input.value, "").trim();
      }
    }

    // Preceding text
    if (!label) {
      const prevSibling = input.previousElementSibling;
      if (
        prevSibling &&
        (prevSibling.tagName === "SPAN" || prevSibling.tagName === "DIV")
      ) {
        label = prevSibling.textContent.trim();
      }
    }

    // Placeholder as fallback
    if (!label && input.placeholder) {
      label = input.placeholder;
    }

    return label;
  }

  getCompletionRate() {
    const activeFields = this.getActiveFields();
    if (activeFields.length === 0) return 0;

    const filledFields = activeFields.filter((field) => {
      const value = field.value.toString().trim();
      return value !== "" && value !== "0" && value !== "undefined";
    });

    return Math.round((filledFields.length / activeFields.length) * 100);
  }

  hasValidationErrors() {
    const errors = this.getValidationErrors();
    return errors.length > 0;
  }

  getValidationErrors() {
    const errors = [];

    // Check for validation classes
    const errorElements = document.querySelectorAll(
      ".error, .invalid, .validation-error, [data-error]"
    );
    errorElements.forEach((element) => {
      if (this.isElementVisible(element)) {
        errors.push({
          element: element,
          message:
            element.dataset.error || element.textContent || "Validation error",
          field: this.getFieldLabel(element) || element.name || element.id,
          type: "validation",
        });
      }
    });

    // Check required fields
    const requiredFields = document.querySelectorAll(
      "[required], [data-required]"
    );
    requiredFields.forEach((field) => {
      if (this.isElementVisible(field) && !field.value.trim()) {
        errors.push({
          element: field,
          message: `${this.getFieldLabel(field)} is required`,
          field: this.getFieldLabel(field) || field.name || field.id,
          type: "required",
        });
      }
    });

    // Check pattern validation
    const patternFields = document.querySelectorAll("[pattern]");
    patternFields.forEach((field) => {
      if (
        this.isElementVisible(field) &&
        field.value &&
        !field.checkValidity()
      ) {
        errors.push({
          element: field,
          message: `${this.getFieldLabel(field)} format is invalid`,
          field: this.getFieldLabel(field) || field.name || field.id,
          type: "pattern",
        });
      }
    });

    return errors;
  }

  getFormData() {
    const section = this.getCurrentSection();
    const sectionElement = document.getElementById(section);

    if (!sectionElement) return {};

    const formData = {};
    const inputs = sectionElement.querySelectorAll("input, select, textarea");

    inputs.forEach((input) => {
      const key = input.name || input.id;
      if (key) {
        formData[key] = input.value;
      }
    });

    return formData;
  }

  getRecommendations() {
    const recommendations = [];
    const section = this.getCurrentSection();
    const completionRate = this.getCompletionRate();
    const hasErrors = this.hasValidationErrors();

    // Section-specific recommendations
    switch (section) {
      case "mission-info":
        if (completionRate < 50) {
          recommendations.push(
            "Start by defining your mission name and basic parameters"
          );
        }
        break;

      case "environment":
        if (completionRate < 30) {
          recommendations.push(
            "Configure atmospheric conditions and launch site location"
          );
        }
        break;

      case "vehicle-config":
        if (completionRate < 40) {
          recommendations.push(
            "Define your vehicle mass properties and dimensions"
          );
        }
        break;

      case "stages-motors":
        if (completionRate < 60) {
          recommendations.push(
            "Configure your propulsion system and staging sequence"
          );
        }
        break;

      case "steering":
        if (completionRate < 50) {
          recommendations.push("Set up guidance and control parameters");
        }
        break;

      case "optimization":
        if (completionRate < 70) {
          recommendations.push(
            "Define optimization objectives and constraints"
          );
        }
        break;
    }

    // General recommendations
    if (hasErrors) {
      recommendations.push("Fix validation errors before proceeding");
    }

    if (completionRate === 100) {
      recommendations.push(
        "Section complete! Consider reviewing before moving to the next step"
      );
    }

    return recommendations;
  }

  // Utility methods for external access
  isFieldFocused(fieldName) {
    const focused = document.activeElement;
    return focused && (focused.name === fieldName || focused.id === fieldName);
  }

  getFieldValue(fieldName) {
    const field = document.querySelector(
      `[name="${fieldName}"], #${fieldName}`
    );
    return field ? field.value : null;
  }

  getFieldInfo(fieldName) {
    const field = document.querySelector(
      `[name="${fieldName}"], #${fieldName}`
    );
    if (!field) return null;

    return {
      name: fieldName,
      type: field.type || field.tagName.toLowerCase(),
      value: field.value,
      required: field.required || field.hasAttribute("data-required"),
      placeholder: field.placeholder,
      label: this.getFieldLabel(field),
      hasError:
        field.classList.contains("error") ||
        field.classList.contains("invalid"),
    };
  }

  // Context comparison
  hasContextChanged(newContext) {
    if (!this.lastContext) return true;

    return (
      this.lastContext.section !== newContext.section ||
      this.lastContext.hasErrors !== newContext.hasErrors ||
      Math.abs(this.lastContext.completionRate - newContext.completionRate) > 10
    );
  }
}

// Make available globally
window.LunaContextManager = LunaContextManager;
