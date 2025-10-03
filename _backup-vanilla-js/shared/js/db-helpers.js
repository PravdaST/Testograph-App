/**
 * Database Helper Functions
 * CRUD operations for all database tables
 * Works with both Supabase and localStorage (guest mode)
 */

const DB = {
  // =====================================================
  // PROFILES
  // =====================================================

  async getProfile(userId) {
    try {
      // Guest mode
      if (window.SupabaseClient && window.SupabaseClient.isGuestMode()) {
        const profile = StorageManager.load(`profile_${userId}`);
        return { data: profile, error: null };
      }

      // Supabase mode
      const supabase = window.SupabaseClient.getClient();
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      return { data, error };
    } catch (error) {
      console.error('Get profile error:', error);
      return { data: null, error: error.message };
    }
  },

  async createProfile(userId, profileData) {
    try {
      // Guest mode
      if (window.SupabaseClient && window.SupabaseClient.isGuestMode()) {
        const profile = { id: userId, ...profileData, created_at: new Date().toISOString() };
        StorageManager.save(`profile_${userId}`, profile);
        return { data: profile, error: null };
      }

      // Supabase mode
      const supabase = window.SupabaseClient.getClient();
      const { data, error } = await supabase
        .from('profiles')
        .insert([{ id: userId, ...profileData }])
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Create profile error:', error);
      return { data: null, error: error.message };
    }
  },

  async updateProfile(userId, profileData) {
    try {
      // Guest mode
      if (window.SupabaseClient && window.SupabaseClient.isGuestMode()) {
        const existing = StorageManager.load(`profile_${userId}`) || {};
        const updated = { ...existing, ...profileData, updated_at: new Date().toISOString() };
        StorageManager.save(`profile_${userId}`, updated);
        return { data: updated, error: null };
      }

      // Supabase mode
      const supabase = window.SupabaseClient.getClient();
      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', userId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Update profile error:', error);
      return { data: null, error: error.message };
    }
  },

  // =====================================================
  // MEAL PLANS
  // =====================================================

  async getMealPlans(userId) {
    try {
      // Guest mode
      if (window.SupabaseClient && window.SupabaseClient.isGuestMode()) {
        const plans = StorageManager.load(`meal_plans_${userId}`, []);
        return { data: plans, error: null };
      }

      // Supabase mode
      const supabase = window.SupabaseClient.getClient();
      const { data, error } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      console.error('Get meal plans error:', error);
      return { data: null, error: error.message };
    }
  },

  async createMealPlan(userId, planData, planName = 'My Meal Plan') {
    try {
      // Guest mode
      if (window.SupabaseClient && window.SupabaseClient.isGuestMode()) {
        const plans = StorageManager.load(`meal_plans_${userId}`, []);
        const newPlan = {
          id: 'plan_' + Date.now(),
          user_id: userId,
          plan_name: planName,
          plan_data: planData,
          created_at: new Date().toISOString()
        };
        plans.push(newPlan);
        StorageManager.save(`meal_plans_${userId}`, plans);
        return { data: newPlan, error: null };
      }

      // Supabase mode
      const supabase = window.SupabaseClient.getClient();
      const { data, error } = await supabase
        .from('meal_plans')
        .insert([{
          user_id: userId,
          plan_name: planName,
          plan_data: planData
        }])
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Create meal plan error:', error);
      return { data: null, error: error.message };
    }
  },

  async deleteMealPlan(userId, planId) {
    try {
      // Guest mode
      if (window.SupabaseClient && window.SupabaseClient.isGuestMode()) {
        const plans = StorageManager.load(`meal_plans_${userId}`, []);
        const filtered = plans.filter(p => p.id !== planId);
        StorageManager.save(`meal_plans_${userId}`, filtered);
        return { error: null };
      }

      // Supabase mode
      const supabase = window.SupabaseClient.getClient();
      const { error } = await supabase
        .from('meal_plans')
        .delete()
        .eq('id', planId)
        .eq('user_id', userId);

      return { error };
    } catch (error) {
      console.error('Delete meal plan error:', error);
      return { error: error.message };
    }
  },

  // =====================================================
  // SLEEP LOGS
  // =====================================================

  async getSleepLogs(userId, limit = 30) {
    try {
      // Guest mode
      if (window.SupabaseClient && window.SupabaseClient.isGuestMode()) {
        const logs = StorageManager.load(`sleep_logs_${userId}`, []);
        return { data: logs.slice(0, limit), error: null };
      }

      // Supabase mode
      const supabase = window.SupabaseClient.getClient();
      const { data, error } = await supabase
        .from('sleep_logs')
        .select('*')
        .eq('user_id', userId)
        .order('log_date', { ascending: false })
        .limit(limit);

      return { data, error };
    } catch (error) {
      console.error('Get sleep logs error:', error);
      return { data: null, error: error.message };
    }
  },

  async createSleepLog(userId, logData) {
    try {
      // Guest mode
      if (window.SupabaseClient && window.SupabaseClient.isGuestMode()) {
        const logs = StorageManager.load(`sleep_logs_${userId}`, []);
        const newLog = {
          id: 'log_' + Date.now(),
          user_id: userId,
          ...logData,
          created_at: new Date().toISOString()
        };
        logs.push(newLog);
        StorageManager.save(`sleep_logs_${userId}`, logs);
        return { data: newLog, error: null };
      }

      // Supabase mode
      const supabase = window.SupabaseClient.getClient();
      const { data, error } = await supabase
        .from('sleep_logs')
        .insert([{ user_id: userId, ...logData }])
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Create sleep log error:', error);
      return { data: null, error: error.message };
    }
  },

  async updateSleepLog(userId, logId, logData) {
    try {
      // Guest mode
      if (window.SupabaseClient && window.SupabaseClient.isGuestMode()) {
        const logs = StorageManager.load(`sleep_logs_${userId}`, []);
        const index = logs.findIndex(l => l.id === logId);
        if (index !== -1) {
          logs[index] = { ...logs[index], ...logData, updated_at: new Date().toISOString() };
          StorageManager.save(`sleep_logs_${userId}`, logs);
          return { data: logs[index], error: null };
        }
        return { data: null, error: 'Log not found' };
      }

      // Supabase mode
      const supabase = window.SupabaseClient.getClient();
      const { data, error } = await supabase
        .from('sleep_logs')
        .update(logData)
        .eq('id', logId)
        .eq('user_id', userId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Update sleep log error:', error);
      return { data: null, error: error.message };
    }
  },

  // =====================================================
  // LAB RESULTS
  // =====================================================

  async getLabResults(userId) {
    try {
      // Guest mode
      if (window.SupabaseClient && window.SupabaseClient.isGuestMode()) {
        const results = StorageManager.load(`lab_results_${userId}`, []);
        return { data: results, error: null };
      }

      // Supabase mode
      const supabase = window.SupabaseClient.getClient();
      const { data, error } = await supabase
        .from('lab_results')
        .select('*')
        .eq('user_id', userId)
        .order('test_date', { ascending: false });

      return { data, error };
    } catch (error) {
      console.error('Get lab results error:', error);
      return { data: null, error: error.message };
    }
  },

  async createLabResult(userId, resultData) {
    try {
      // Guest mode
      if (window.SupabaseClient && window.SupabaseClient.isGuestMode()) {
        const results = StorageManager.load(`lab_results_${userId}`, []);
        const newResult = {
          id: 'result_' + Date.now(),
          user_id: userId,
          ...resultData,
          created_at: new Date().toISOString()
        };
        results.push(newResult);
        StorageManager.save(`lab_results_${userId}`, results);
        return { data: newResult, error: null };
      }

      // Supabase mode
      const supabase = window.SupabaseClient.getClient();
      const { data, error } = await supabase
        .from('lab_results')
        .insert([{ user_id: userId, ...resultData }])
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Create lab result error:', error);
      return { data: null, error: error.message };
    }
  },

  async updateLabResult(userId, resultId, resultData) {
    try {
      // Guest mode
      if (window.SupabaseClient && window.SupabaseClient.isGuestMode()) {
        const results = StorageManager.load(`lab_results_${userId}`, []);
        const index = results.findIndex(r => r.id === resultId);
        if (index !== -1) {
          results[index] = { ...results[index], ...resultData, updated_at: new Date().toISOString() };
          StorageManager.save(`lab_results_${userId}`, results);
          return { data: results[index], error: null };
        }
        return { data: null, error: 'Result not found' };
      }

      // Supabase mode
      const supabase = window.SupabaseClient.getClient();
      const { data, error } = await supabase
        .from('lab_results')
        .update(resultData)
        .eq('id', resultId)
        .eq('user_id', userId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Update lab result error:', error);
      return { data: null, error: error.message };
    }
  },

  async deleteLabResult(userId, resultId) {
    try {
      // Guest mode
      if (window.SupabaseClient && window.SupabaseClient.isGuestMode()) {
        const results = StorageManager.load(`lab_results_${userId}`, []);
        const filtered = results.filter(r => r.id !== resultId);
        StorageManager.save(`lab_results_${userId}`, results);
        return { error: null };
      }

      // Supabase mode
      const supabase = window.SupabaseClient.getClient();
      const { error } = await supabase
        .from('lab_results')
        .delete()
        .eq('id', resultId)
        .eq('user_id', userId);

      return { error };
    } catch (error) {
      console.error('Delete lab result error:', error);
      return { error: error.message };
    }
  },

  // =====================================================
  // ANALYTICS EVENTS
  // =====================================================

  async trackEvent(userId, eventType, eventData = {}) {
    try {
      // Guest mode
      if (window.SupabaseClient && window.SupabaseClient.isGuestMode()) {
        Analytics.track(eventType, eventData);
        return { error: null };
      }

      // Supabase mode
      const supabase = window.SupabaseClient.getClient();
      const { error } = await supabase
        .from('analytics_events')
        .insert([{
          user_id: userId,
          event_type: eventType,
          event_data: eventData
        }]);

      return { error };
    } catch (error) {
      console.error('Track event error:', error);
      return { error: error.message };
    }
  },

  async getAnalyticsEvents(userId, eventType = null, limit = 100) {
    try {
      // Guest mode
      if (window.SupabaseClient && window.SupabaseClient.isGuestMode()) {
        let events = Analytics.getEvents();
        if (eventType) {
          events = Analytics.getEventsByName(eventType);
        }
        return { data: events.slice(0, limit), error: null };
      }

      // Supabase mode
      const supabase = window.SupabaseClient.getClient();
      let query = supabase
        .from('analytics_events')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (eventType) {
        query = query.eq('event_type', eventType);
      }

      const { data, error } = await query;
      return { data, error };
    } catch (error) {
      console.error('Get analytics events error:', error);
      return { data: null, error: error.message };
    }
  }
};

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.DB = DB;
}
