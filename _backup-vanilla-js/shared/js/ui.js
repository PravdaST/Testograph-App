/**
 * Shared UI Components and Utilities
 * Common functionality for modals, alerts, loading states, etc.
 */

// ========================================
// Alert Management
// ========================================
const Alert = {
  /**
   * Show an alert message
   * @param {string} message - The message to display
   * @param {string} type - Alert type: 'success', 'error', 'warning', 'info'
   * @param {number} duration - Auto-hide duration in ms (0 = no auto-hide)
   */
  show(message, type = 'info', duration = 5000) {
    const alertContainer = document.getElementById('alert-container') || this.createContainer();

    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
      <div style="display: flex; align-items: flex-start; gap: var(--space-sm);">
        <span class="alert-icon">${this.getIcon(type)}</span>
        <span style="flex: 1;">${message}</span>
        <button class="modal-close" style="margin-left: auto;" onclick="this.parentElement.parentElement.remove()">
          &times;
        </button>
      </div>
    `;

    alertContainer.appendChild(alert);

    // Auto-hide after duration
    if (duration > 0) {
      setTimeout(() => {
        alert.style.opacity = '0';
        alert.style.transform = 'translateY(-20px)';
        setTimeout(() => alert.remove(), 300);
      }, duration);
    }

    return alert;
  },

  createContainer() {
    const container = document.createElement('div');
    container.id = 'alert-container';
    container.style.cssText = `
      position: fixed;
      top: var(--space-md);
      right: var(--space-md);
      z-index: var(--z-tooltip);
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
      max-width: 400px;
    `;
    document.body.appendChild(container);
    return container;
  },

  getIcon(type) {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    return icons[type] || icons.info;
  },

  success(message, duration = 5000) {
    return this.show(message, 'success', duration);
  },

  error(message, duration = 5000) {
    return this.show(message, 'error', duration);
  },

  warning(message, duration = 5000) {
    return this.show(message, 'warning', duration);
  },

  info(message, duration = 5000) {
    return this.show(message, 'info', duration);
  },

  clear() {
    const container = document.getElementById('alert-container');
    if (container) {
      container.innerHTML = '';
    }
  }
};

// ========================================
// Modal Management
// ========================================
const Modal = {
  /**
   * Show a modal
   * @param {string} title - Modal title
   * @param {string} content - Modal content (HTML)
   * @param {Object} options - Modal options
   */
  show(title, content, options = {}) {
    const {
      confirmText = 'Потвърди',
      cancelText = 'Отказ',
      onConfirm = null,
      onCancel = null,
      showCancel = true,
      width = '600px'
    } = options;

    // Create modal HTML
    const modal = document.createElement('div');
    modal.className = 'modal-backdrop';
    modal.innerHTML = `
      <div class="modal" style="max-width: ${width};">
        <div class="modal-header">
          <h3 class="modal-title">${title}</h3>
          <button class="modal-close" data-action="close">&times;</button>
        </div>
        <div class="modal-body">
          ${content}
        </div>
        <div class="modal-footer">
          ${showCancel ? `<button class="btn btn-outline" data-action="cancel">${cancelText}</button>` : ''}
          <button class="btn btn-primary" data-action="confirm">${confirmText}</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Show modal with animation
    setTimeout(() => modal.classList.add('active'), 10);

    // Event handlers
    const closeModal = () => {
      modal.classList.remove('active');
      setTimeout(() => modal.remove(), 300);
    };

    modal.querySelector('[data-action="close"]').addEventListener('click', () => {
      if (onCancel) onCancel();
      closeModal();
    });

    if (showCancel) {
      modal.querySelector('[data-action="cancel"]').addEventListener('click', () => {
        if (onCancel) onCancel();
        closeModal();
      });
    }

    modal.querySelector('[data-action="confirm"]').addEventListener('click', () => {
      if (onConfirm) {
        const result = onConfirm();
        if (result !== false) closeModal();
      } else {
        closeModal();
      }
    });

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        if (onCancel) onCancel();
        closeModal();
      }
    });

    // Close on Escape key
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        if (onCancel) onCancel();
        closeModal();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);

    return modal;
  },

  /**
   * Show a confirmation dialog
   */
  confirm(message, onConfirm, options = {}) {
    return this.show(
      options.title || 'Потвърждение',
      `<p>${message}</p>`,
      {
        confirmText: options.confirmText || 'Да',
        cancelText: options.cancelText || 'Не',
        onConfirm,
        ...options
      }
    );
  },

  /**
   * Show an alert dialog (info only)
   */
  alert(message, title = 'Информация') {
    return this.show(title, `<p>${message}</p>`, {
      showCancel: false,
      confirmText: 'OK'
    });
  }
};

// ========================================
// Loading States
// ========================================
const Loading = {
  overlay: null,

  /**
   * Show full-page loading overlay
   */
  show(message = 'Зареждане...') {
    if (this.overlay) return;

    this.overlay = document.createElement('div');
    this.overlay.className = 'loading-overlay';
    this.overlay.innerHTML = `
      <div class="spinner spinner-lg"></div>
      <p style="margin-top: var(--space-md); color: var(--text-muted);">${message}</p>
    `;

    document.body.appendChild(this.overlay);
    document.body.style.overflow = 'hidden';
  },

  /**
   * Hide loading overlay
   */
  hide() {
    if (this.overlay) {
      this.overlay.style.opacity = '0';
      setTimeout(() => {
        this.overlay.remove();
        this.overlay = null;
        document.body.style.overflow = '';
      }, 200);
    }
  },

  /**
   * Set button to loading state
   */
  button(button, loading = true, loadingText = 'Зареждане...') {
    if (loading) {
      button.dataset.originalText = button.innerHTML;
      button.disabled = true;
      button.innerHTML = `
        <span class="spinner spinner-sm" style="margin-right: var(--space-xs);"></span>
        ${loadingText}
      `;
    } else {
      button.disabled = false;
      button.innerHTML = button.dataset.originalText || button.innerHTML;
    }
  }
};

// ========================================
// Form Validation
// ========================================
const Validator = {
  /**
   * Validate required field
   */
  required(value) {
    return value && value.trim() !== '';
  },

  /**
   * Validate email
   */
  email(value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },

  /**
   * Validate minimum length
   */
  minLength(value, min) {
    return value && value.length >= min;
  },

  /**
   * Validate maximum length
   */
  maxLength(value, max) {
    return value && value.length <= max;
  },

  /**
   * Validate number
   */
  number(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
  },

  /**
   * Validate positive number
   */
  positive(value) {
    return this.number(value) && parseFloat(value) > 0;
  },

  /**
   * Validate range
   */
  range(value, min, max) {
    const num = parseFloat(value);
    return this.number(value) && num >= min && num <= max;
  },

  /**
   * Validate phone number (Bulgarian)
   */
  phone(value) {
    const phoneRegex = /^(\+359|0)[0-9]{9}$/;
    return phoneRegex.test(value.replace(/\s/g, ''));
  },

  /**
   * Show field error
   */
  showError(input, message) {
    input.classList.add('error');
    const errorElement = input.parentElement.querySelector('.form-error');
    if (errorElement) {
      errorElement.textContent = message;
    }
  },

  /**
   * Clear field error
   */
  clearError(input) {
    input.classList.remove('error');
    const errorElement = input.parentElement.querySelector('.form-error');
    if (errorElement) {
      errorElement.textContent = '';
    }
  },

  /**
   * Validate form
   */
  validateForm(formElement) {
    let isValid = true;
    const inputs = formElement.querySelectorAll('[required], [data-validate]');

    inputs.forEach(input => {
      const value = input.value;
      const type = input.type;
      const validate = input.dataset.validate;

      // Required validation
      if (input.hasAttribute('required') && !this.required(value)) {
        this.showError(input, 'Това поле е задължително');
        isValid = false;
        return;
      }

      // Type-specific validation
      if (type === 'email' && value && !this.email(value)) {
        this.showError(input, 'Невалиден имейл адрес');
        isValid = false;
        return;
      }

      if (type === 'number' && value && !this.number(value)) {
        this.showError(input, 'Моля, въведете число');
        isValid = false;
        return;
      }

      // Min/max length
      const minLength = input.getAttribute('minlength');
      if (minLength && value && !this.minLength(value, parseInt(minLength))) {
        this.showError(input, `Минимална дължина: ${minLength} символа`);
        isValid = false;
        return;
      }

      const maxLength = input.getAttribute('maxlength');
      if (maxLength && value && !this.maxLength(value, parseInt(maxLength))) {
        this.showError(input, `Максимална дължина: ${maxLength} символа`);
        isValid = false;
        return;
      }

      // Custom validation
      if (validate === 'phone' && value && !this.phone(value)) {
        this.showError(input, 'Невалиден телефонен номер');
        isValid = false;
        return;
      }

      if (validate === 'positive' && value && !this.positive(value)) {
        this.showError(input, 'Стойността трябва да е положителна');
        isValid = false;
        return;
      }

      // If all validations pass, clear error
      this.clearError(input);
    });

    return isValid;
  }
};

// ========================================
// Sidebar Toggle (for dashboard)
// ========================================
function initSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const sidebarToggle = document.querySelector('.sidebar-toggle');
  const sidebarOverlay = document.querySelector('.sidebar-overlay');

  if (!sidebar || !sidebarToggle) return;

  sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('active');
    if (sidebarOverlay) {
      sidebarOverlay.classList.toggle('active');
    }
  });

  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', () => {
      sidebar.classList.remove('active');
      sidebarOverlay.classList.remove('active');
    });
  }

  // Close sidebar on navigation (mobile)
  const sidebarLinks = sidebar.querySelectorAll('.sidebar-link');
  sidebarLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth < 1024) {
        sidebar.classList.remove('active');
        if (sidebarOverlay) {
          sidebarOverlay.classList.remove('active');
        }
      }
    });
  });
}

// ========================================
// Mobile Navigation Toggle
// ========================================
function initMobileNav() {
  const navbarToggle = document.querySelector('.navbar-toggle');
  const navbarMenu = document.querySelector('.navbar-menu');

  if (!navbarToggle || !navbarMenu) return;

  navbarToggle.addEventListener('click', () => {
    navbarMenu.classList.toggle('active');
    navbarToggle.classList.toggle('active');
  });
}

// ========================================
// Form Auto-validation
// ========================================
function initFormValidation() {
  const forms = document.querySelectorAll('form[data-validate]');

  forms.forEach(form => {
    // Validate on blur
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      input.addEventListener('blur', () => {
        const value = input.value;
        const type = input.type;

        // Only validate if field has been touched
        if (value === '' && !input.hasAttribute('required')) return;

        if (input.hasAttribute('required') && !Validator.required(value)) {
          Validator.showError(input, 'Това поле е задължително');
        } else if (type === 'email' && value && !Validator.email(value)) {
          Validator.showError(input, 'Невалиден имейл адрес');
        } else {
          Validator.clearError(input);
        }
      });

      // Clear error on input
      input.addEventListener('input', () => {
        Validator.clearError(input);
      });
    });

    // Validate on submit
    form.addEventListener('submit', (e) => {
      if (!Validator.validateForm(form)) {
        e.preventDefault();
        Alert.error('Моля, коригирайте грешките във формата');
      }
    });
  });
}

// ========================================
// Utilities
// ========================================
const Utils = {
  /**
   * Format date to Bulgarian format
   */
  formatDate(date, includeTime = false) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    if (includeTime) {
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${day}.${month}.${year} ${hours}:${minutes}`;
    }

    return `${day}.${month}.${year}`;
  },

  /**
   * Format number with spaces as thousands separator
   */
  formatNumber(num, decimals = 0) {
    return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  },

  /**
   * Debounce function
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Copy to clipboard
   */
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      Alert.success('Копирано в клипборда');
      return true;
    } catch (err) {
      Alert.error('Грешка при копиране');
      return false;
    }
  },

  /**
   * Get user initials from name
   */
  getInitials(name) {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  },

  /**
   * Scroll to element
   */
  scrollTo(element, offset = 0) {
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
};

// ========================================
// Initialize on DOM ready
// ========================================
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initSidebar();
    initMobileNav();
    initFormValidation();
  });
}

// Export for use in other scripts
if (typeof window !== 'undefined') {
  window.Alert = Alert;
  window.Modal = Modal;
  window.Loading = Loading;
  window.Validator = Validator;
  window.Utils = Utils;
}
