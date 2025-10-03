/**
 * Authentication Utility
 * Handles user authentication with Supabase (login, signup, logout)
 * Falls back to localStorage for guest mode
 */

const Auth = {
  // Check if user is authenticated
  async isAuthenticated() {
    try {
      // Check if in guest mode
      if (window.SupabaseClient && window.SupabaseClient.isGuestMode()) {
        const guestUser = StorageManager.load('guest_user');
        return guestUser !== null;
      }

      // Check Supabase session
      const supabase = window.SupabaseClient.getClient();
      if (!supabase) return false;

      const { data: { session } } = await supabase.auth.getSession();
      return session !== null;
    } catch (error) {
      console.error('Auth check error:', error);
      return false;
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      // Guest mode
      if (window.SupabaseClient && window.SupabaseClient.isGuestMode()) {
        return StorageManager.load('guest_user', null);
      }

      // Supabase mode
      const supabase = window.SupabaseClient.getClient();
      if (!supabase) return null;

      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  },

  // Sign up new user
  async signUp(email, password, metadata = {}) {
    try {
      // Guest mode - create local user
      if (window.SupabaseClient && window.SupabaseClient.isGuestMode()) {
        const guestUser = {
          id: 'guest_' + Date.now(),
          email: email,
          created_at: new Date().toISOString(),
          metadata: metadata
        };
        StorageManager.save('guest_user', guestUser);

        Analytics.track('user_signup', { mode: 'guest' });
        return { user: guestUser, error: null };
      }

      // Supabase mode
      const supabase = window.SupabaseClient.getClient();
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: metadata
        }
      });

      if (error) throw error;

      Analytics.track('user_signup', { mode: 'supabase' });
      return { user: data.user, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { user: null, error: error.message };
    }
  },

  // Sign in existing user
  async signIn(email, password) {
    try {
      // Guest mode - check local user
      if (window.SupabaseClient && window.SupabaseClient.isGuestMode()) {
        const guestUser = StorageManager.load('guest_user');
        if (guestUser && guestUser.email === email) {
          Analytics.track('user_login', { mode: 'guest' });
          return { user: guestUser, error: null };
        }
        return { user: null, error: 'User not found in guest mode' };
      }

      // Supabase mode
      const supabase = window.SupabaseClient.getClient();
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (error) throw error;

      Analytics.track('user_login', { mode: 'supabase' });
      return { user: data.user, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { user: null, error: error.message };
    }
  },

  // Sign in with Google OAuth
  async signInWithGoogle() {
    try {
      // Guest mode - not supported
      if (window.SupabaseClient && window.SupabaseClient.isGuestMode()) {
        return { user: null, error: 'Google OAuth not available in guest mode' };
      }

      // Supabase mode
      const supabase = window.SupabaseClient.getClient();
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/dashboard/'
        }
      });

      if (error) throw error;

      Analytics.track('user_login', { mode: 'google_oauth' });
      return { user: data.user, error: null };
    } catch (error) {
      console.error('Google sign in error:', error);
      return { user: null, error: error.message };
    }
  },

  // Sign out user
  async signOut() {
    try {
      // Guest mode - clear local user
      if (window.SupabaseClient && window.SupabaseClient.isGuestMode()) {
        StorageManager.remove('guest_user');
        Analytics.track('user_logout', { mode: 'guest' });
        return { error: null };
      }

      // Supabase mode
      const supabase = window.SupabaseClient.getClient();
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      Analytics.track('user_logout', { mode: 'supabase' });
      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error: error.message };
    }
  },

  // Reset password
  async resetPassword(email) {
    try {
      // Guest mode - not supported
      if (window.SupabaseClient && window.SupabaseClient.isGuestMode()) {
        return { error: 'Password reset not available in guest mode' };
      }

      // Supabase mode
      const supabase = window.SupabaseClient.getClient();
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/auth/reset-password.html'
      });

      if (error) throw error;

      Analytics.track('password_reset_requested');
      return { error: null };
    } catch (error) {
      console.error('Password reset error:', error);
      return { error: error.message };
    }
  },

  // Update user password
  async updatePassword(newPassword) {
    try {
      // Guest mode - not supported
      if (window.SupabaseClient && window.SupabaseClient.isGuestMode()) {
        return { error: 'Password update not available in guest mode' };
      }

      // Supabase mode
      const supabase = window.SupabaseClient.getClient();
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      Analytics.track('password_updated');
      return { error: null };
    } catch (error) {
      console.error('Password update error:', error);
      return { error: error.message };
    }
  },

  // Listen to auth state changes
  onAuthStateChange(callback) {
    // Guest mode - check localStorage changes
    if (window.SupabaseClient && window.SupabaseClient.isGuestMode()) {
      window.addEventListener('storage', (e) => {
        if (e.key === 'guest_user') {
          const user = e.newValue ? JSON.parse(e.newValue) : null;
          callback(user ? 'SIGNED_IN' : 'SIGNED_OUT', user);
        }
      });
      return;
    }

    // Supabase mode
    const supabase = window.SupabaseClient.getClient();
    if (!supabase) return;

    supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session?.user || null);
    });
  }
};

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.Auth = Auth;
}
