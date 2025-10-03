// Supabase Client Configuration
// Replace with your actual Supabase credentials
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

class SupabaseClient {
  constructor() {
    this.url = SUPABASE_URL;
    this.key = SUPABASE_ANON_KEY;
    this.headers = {
      'apikey': this.key,
      'Authorization': `Bearer ${this.key}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };
  }

  async query(table, options = {}) {
    try {
      let url = `${this.url}/rest/v1/${table}`;
      const params = new URLSearchParams();

      if (options.select) {
        params.append('select', options.select);
      }
      if (options.filter) {
        Object.keys(options.filter).forEach(key => {
          params.append(key, `eq.${options.filter[key]}`);
        });
      }
      if (options.order) {
        params.append('order', options.order);
      }
      if (options.limit) {
        params.append('limit', options.limit);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Supabase query error:', error);
      throw error;
    }
  }

  async insert(table, data) {
    try {
      const response = await fetch(`${this.url}/rest/v1/${table}`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Supabase insert error:', error);
      throw error;
    }
  }

  async update(table, data, filter) {
    try {
      let url = `${this.url}/rest/v1/${table}`;
      const params = new URLSearchParams();

      if (filter) {
        Object.keys(filter).forEach(key => {
          params.append(key, `eq.${filter[key]}`);
        });
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        method: 'PATCH',
        headers: this.headers,
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Supabase update error:', error);
      throw error;
    }
  }

  async delete(table, filter) {
    try {
      let url = `${this.url}/rest/v1/${table}`;
      const params = new URLSearchParams();

      if (filter) {
        Object.keys(filter).forEach(key => {
          params.append(key, `eq.${filter[key]}`);
        });
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        method: 'DELETE',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Supabase delete error:', error);
      throw error;
    }
  }
}

// Export singleton instance
const supabase = new SupabaseClient();
