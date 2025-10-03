/**
 * Authentication Page Logic
 * Handles login, signup, and password reset functionality
 */

// Utility function to show alerts
function showAlert(message, type = 'info') {
  const container = document.getElementById('alert-container');
  if (!container) return;

  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.textContent = message;

  container.innerHTML = '';
  container.appendChild(alert);

  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    alert.remove();
  }, 5000);
}

// Set button loading state
function setButtonLoading(button, isLoading) {
  if (isLoading) {
    button.classList.add('loading');
    button.disabled = true;
  } else {
    button.classList.remove('loading');
    button.disabled = false;
  }
}

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
  // Check if user is already logged in
  const isAuth = await Auth.isAuthenticated();
  if (isAuth) {
    // Redirect to dashboard
    window.location.href = '../dashboard/index.html';
    return;
  }

  // Initialize Supabase client
  if (window.SupabaseClient && !window.SupabaseClient.isGuestMode()) {
    window.SupabaseClient.init();
  }

  // Handle login form
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  // Handle signup form
  const signupForm = document.getElementById('signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', handleSignup);
  }

  // Handle Google OAuth button
  const googleBtn = document.getElementById('google-btn');
  if (googleBtn) {
    googleBtn.addEventListener('click', handleGoogleSignIn);
  }

  // Handle forgot password link
  const forgotPasswordLink = document.getElementById('forgot-password-link');
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', handleForgotPassword);
  }

  // Track page view
  Analytics.track('auth_page_view', {
    page: window.location.pathname
  });
});

// Handle login
async function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const submitBtn = document.getElementById('login-btn');

  if (!email || !password) {
    showAlert('Please fill in all fields', 'danger');
    return;
  }

  setButtonLoading(submitBtn, true);

  try {
    const { user, error } = await Auth.signIn(email, password);

    if (error) {
      showAlert(error, 'danger');
      setButtonLoading(submitBtn, false);
      return;
    }

    if (user) {
      showAlert('Login successful! Redirecting...', 'success');

      // Redirect to dashboard after short delay
      setTimeout(() => {
        window.location.href = '../dashboard/index.html';
      }, 1000);
    }
  } catch (error) {
    console.error('Login error:', error);
    showAlert('An unexpected error occurred. Please try again.', 'danger');
    setButtonLoading(submitBtn, false);
  }
}

// Handle signup
async function handleSignup(e) {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirm-password').value;
  const submitBtn = document.getElementById('signup-btn');

  if (!email || !password || !confirmPassword) {
    showAlert('Please fill in all fields', 'danger');
    return;
  }

  if (password !== confirmPassword) {
    showAlert('Passwords do not match', 'danger');
    return;
  }

  if (password.length < 8) {
    showAlert('Password must be at least 8 characters', 'danger');
    return;
  }

  setButtonLoading(submitBtn, true);

  try {
    const { user, error } = await Auth.signUp(email, password);

    if (error) {
      showAlert(error, 'danger');
      setButtonLoading(submitBtn, false);
      return;
    }

    if (user) {
      if (window.SupabaseClient && window.SupabaseClient.isGuestMode()) {
        // Guest mode - redirect immediately
        showAlert('Account created! Redirecting...', 'success');
        setTimeout(() => {
          window.location.href = '../dashboard/index.html';
        }, 1000);
      } else {
        // Supabase mode - may need email confirmation
        showAlert('Account created! Please check your email for confirmation.', 'success');
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 3000);
      }
    }
  } catch (error) {
    console.error('Signup error:', error);
    showAlert('An unexpected error occurred. Please try again.', 'danger');
    setButtonLoading(submitBtn, false);
  }
}

// Handle Google sign in
async function handleGoogleSignIn(e) {
  e.preventDefault();

  const googleBtn = document.getElementById('google-btn');
  setButtonLoading(googleBtn, true);

  try {
    const { user, error } = await Auth.signInWithGoogle();

    if (error) {
      showAlert(error, 'warning');
      setButtonLoading(googleBtn, false);
      return;
    }

    // The OAuth flow will redirect automatically
    // No need to manually redirect here
  } catch (error) {
    console.error('Google sign in error:', error);
    showAlert('Failed to sign in with Google. Please try again.', 'danger');
    setButtonLoading(googleBtn, false);
  }
}

// Handle forgot password
async function handleForgotPassword(e) {
  e.preventDefault();

  const email = prompt('Please enter your email address:');
  if (!email) return;

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showAlert('Please enter a valid email address', 'danger');
    return;
  }

  try {
    const { error } = await Auth.resetPassword(email);

    if (error) {
      showAlert(error, 'warning');
      return;
    }

    showAlert('Password reset email sent! Please check your inbox.', 'success');
  } catch (error) {
    console.error('Password reset error:', error);
    showAlert('Failed to send password reset email. Please try again.', 'danger');
  }
}
