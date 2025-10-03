/**
 * Dashboard Application Logic
 * Loads and displays user data summary from all tools
 */

let currentUser = null;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async () => {
  // Check for guest mode parameter
  const urlParams = new URLSearchParams(window.location.search);
  const isGuestMode = urlParams.get('guest') === 'true';

  if (isGuestMode) {
    // Set up guest user
    const guestUser = {
      id: 'guest_' + Date.now(),
      email: 'guest@testograph.local',
      created_at: new Date().toISOString()
    };
    StorageManager.save('guest_user', guestUser);
    currentUser = guestUser;
    showGuestNotice();
  } else {
    // Check authentication
    const isAuth = await Auth.isAuthenticated();
    if (!isAuth) {
      // Redirect to login
      window.location.href = '../auth/login.html';
      return;
    }

    // Get current user
    currentUser = await Auth.getCurrentUser();
    if (!currentUser) {
      window.location.href = '../auth/login.html';
      return;
    }
  }

  // Initialize UI
  initializeUI();

  // Load user data
  await loadUserData();

  // Set up event listeners
  setupEventListeners();

  // Track page view
  Analytics.track('dashboard_view', {
    user_id: currentUser.id
  });
});

// Initialize UI elements
function initializeUI() {
  const userEmailEl = document.getElementById('user-email');
  if (userEmailEl && currentUser) {
    userEmailEl.textContent = currentUser.email;
  }

  // Show guest notice if in guest mode
  if (window.SupabaseClient && window.SupabaseClient.isGuestMode()) {
    showGuestNotice();
  }
}

// Show guest mode notice
function showGuestNotice() {
  const notice = document.getElementById('guest-notice');
  if (notice) {
    notice.style.display = 'block';
  }
}

// Load user data from all tools
async function loadUserData() {
  if (!currentUser) return;

  try {
    // Load meal plans count
    const { data: mealPlans } = await DB.getMealPlans(currentUser.id);
    updateStatElement('meal-plans-count', mealPlans?.length || 0, 'saved plans');
    updateStatElement('total-plans', mealPlans?.length || 0);

    // Load sleep logs count
    const { data: sleepLogs } = await DB.getSleepLogs(currentUser.id);
    updateStatElement('sleep-logs-count', sleepLogs?.length || 0, 'sleep logs');
    updateStatElement('total-sleep-logs', sleepLogs?.length || 0);

    // Load lab results count
    const { data: labResults } = await DB.getLabResults(currentUser.id);
    updateStatElement('lab-results-count', labResults?.length || 0, 'test results');
    updateStatElement('total-lab-results', labResults?.length || 0);

    // Calculate days active
    const createdDate = new Date(currentUser.created_at);
    const today = new Date();
    const daysActive = Math.floor((today - createdDate) / (1000 * 60 * 60 * 24));
    updateStatElement('days-active', daysActive);

  } catch (error) {
    console.error('Error loading user data:', error);
  }
}

// Update stat element
function updateStatElement(elementId, value, suffix = '') {
  const element = document.getElementById(elementId);
  if (element) {
    if (suffix) {
      element.textContent = `${value} ${suffix}`;
    } else {
      element.textContent = value;
    }
  }
}

// Set up event listeners
function setupEventListeners() {
  // Logout button
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
}

// Handle logout
async function handleLogout() {
  const confirmed = confirm('Are you sure you want to logout?');
  if (!confirmed) return;

  try {
    const { error } = await Auth.signOut();

    if (error) {
      console.error('Logout error:', error);
      alert('Failed to logout. Please try again.');
      return;
    }

    // Clear local storage if in guest mode
    if (window.SupabaseClient && window.SupabaseClient.isGuestMode()) {
      if (confirm('Clear all local data? (This cannot be undone)')) {
        StorageManager.clear();
      }
    }

    // Redirect to login page
    window.location.href = '../auth/login.html';
  } catch (error) {
    console.error('Logout error:', error);
    alert('An unexpected error occurred during logout.');
  }
}

// Refresh dashboard data
async function refreshDashboard() {
  await loadUserData();
  Analytics.track('dashboard_refresh', {
    user_id: currentUser?.id
  });
}

// Auto-refresh every 30 seconds
setInterval(refreshDashboard, 30000);
