// Simple Analytics Utility
const Analytics = {
  events: [],

  // Track an event
  track(eventName, properties = {}) {
    const event = {
      name: eventName,
      properties: properties,
      timestamp: new Date().toISOString()
    };

    this.events.push(event);
    console.log('Analytics Event:', event);

    // Store in localStorage for persistence
    this.saveEvents();

    return event;
  },

  // Save events to localStorage
  saveEvents() {
    try {
      const recentEvents = this.events.slice(-100); // Keep last 100 events
      localStorage.setItem('analytics_events', JSON.stringify(recentEvents));
    } catch (e) {
      console.error('Failed to save analytics:', e);
    }
  },

  // Load events from localStorage
  loadEvents() {
    try {
      const stored = localStorage.getItem('analytics_events');
      if (stored) {
        this.events = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load analytics:', e);
    }
  },

  // Get all events
  getEvents() {
    return this.events;
  },

  // Get events by name
  getEventsByName(name) {
    return this.events.filter(e => e.name === name);
  },

  // Clear all events
  clear() {
    this.events = [];
    localStorage.removeItem('analytics_events');
  }
};

// Load existing events on initialization
Analytics.loadEvents();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Analytics;
}
