// ============================
// API Client for Pam_Lee's Kitchen
// ============================

const API_BASE = window.location.origin;

// Helper function to get auth token
function getAuthToken() {
  const user = JSON.parse(localStorage.getItem('pamlee_user') || 'null');
  return user?.token || null;
}

// Helper function to make API requests
async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// ============================
// Auth API
// ============================
const AuthAPI = {
  async signup(email, password, name) {
    const data = await apiRequest('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name })
    });

    if (data.success) {
      localStorage.setItem('pamlee_user', JSON.stringify({
        ...data.user,
        token: data.token
      }));
    }

    return data;
  },

  async login(email, password) {
    const data = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    if (data.success) {
      localStorage.setItem('pamlee_user', JSON.stringify({
        ...data.user,
        token: data.token
      }));
    }

    return data;
  },

  async getMe() {
    return await apiRequest('/api/auth/me');
  },

  logout() {
    localStorage.removeItem('pamlee_user');
    window.location.href = 'login.html';
  }
};

// ============================
// Products API
// ============================
const ProductsAPI = {
  async getAll(category = 'all') {
    const query = category !== 'all' ? `?category=${category}` : '';
    return await apiRequest(`/api/products${query}`);
  },

  async getById(id) {
    return await apiRequest(`/api/products/${id}`);
  },

  async create(product) {
    return await apiRequest('/api/products', {
      method: 'POST',
      body: JSON.stringify(product)
    });
  },

  async update(id, product) {
    return await apiRequest(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product)
    });
  },

  async delete(id) {
    return await apiRequest(`/api/products/${id}`, {
      method: 'DELETE'
    });
  }
};

// ============================
// Orders API
// ============================
const OrdersAPI = {
  async create(order) {
    return await apiRequest('/api/orders', {
      method: 'POST',
      body: JSON.stringify(order)
    });
  },

  async getAll() {
    return await apiRequest('/api/orders');
  },

  async getByTrackerId(trackerId) {
    return await apiRequest(`/api/orders/${trackerId}`);
  },

  async updateStatus(trackerId, status, note = '') {
    return await apiRequest(`/api/orders/${trackerId}`, {
      method: 'PUT',
      body: JSON.stringify({ status, note })
    });
  }
};

// ============================
// Stats API (Admin)
// ============================
const StatsAPI = {
  async get() {
    return await apiRequest('/api/stats');
  }
};

// Export for use in other files
if (typeof window !== 'undefined') {
  window.AuthAPI = AuthAPI;
  window.ProductsAPI = ProductsAPI;
  window.OrdersAPI = OrdersAPI;
  window.StatsAPI = StatsAPI;
}
