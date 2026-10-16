// ============================================================
// AgriExport Connect – API Client Layer
// Connects React frontend with Express/MySQL backend on :5001
// ============================================================

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5001/api'
    : '/api');

// Helper for authorized fetch
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    ...(options.headers || {}),
  };

  // If not FormData, default to application/json
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg = data.message || 
        (Array.isArray(data.errors) && data.errors.length > 0 ? data.errors[0]?.msg : null) || 
        `HTTP error ${res.status}`;
      const err = new Error(errorMsg);
      err.status = res.status;
      err.data = data;
      console.warn(`[API ERROR] ${options.method || 'GET'} ${endpoint} [${res.status}]:`, errorMsg);
      throw err;
    }

    if (import.meta.env.DEV) {
      console.log(`[API SUCCESS] ${options.method || 'GET'} ${endpoint}:`, data);
    }

    return data;
  } catch (error) {
    // If backend is unreachable or down, log warning
    console.warn(`[API Error ${endpoint}]:`, error.message);
    throw error;
  }
}

export const api = {
  // Authentication
  auth: {
    login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
    getMe: () => request('/auth/me'),
    updateProfile: (profileData) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(profileData) }),
    changePassword: (passwords) => request('/auth/change-password', { method: 'POST', body: JSON.stringify(passwords) }),
    forgotPassword: (identifier) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ identifier }) }),
    verifyResetOtp: (identifier, otp) => request('/auth/verify-reset-otp', { method: 'POST', body: JSON.stringify({ identifier, otp }) }),
    resetPassword: (payloadOrId, maybeOtpOrPassword, maybePassword) => {
      const body = typeof payloadOrId === 'object' && payloadOrId !== null
        ? payloadOrId
        : {
            identifier: payloadOrId,
            otp: maybeOtpOrPassword,
            newPassword: maybePassword || maybeOtpOrPassword,
          };
      return request('/auth/reset-password', { method: 'POST', body: JSON.stringify(body) });
    },
    getPlatformStats: () => request('/auth/stats'),
  },

  // Crops
  crops: {
    getAll: () => request('/crops'),
    getById: (idOrSlug) => request(`/crops/${idOrSlug}`),
  },

  // Produce Listings
  listings: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/listings${query ? `?${query}` : ''}`);
    },
    getMy: () => request('/listings/my'),
    getById: (id) => request(`/listings/${id}`),
    create: (listingData) => {
      const isFormData = listingData instanceof FormData;
      return request('/listings', {
        method: 'POST',
        body: isFormData ? listingData : JSON.stringify(listingData),
      });
    },
    update: (id, updates) => request(`/listings/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
    delete: (id) => request(`/listings/${id}`, { method: 'DELETE' }),
  },

  // Buyer Requirements
  requirements: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/requirements${query ? `?${query}` : ''}`);
    },
    getMy: () => request('/requirements/my'),
    getById: (id) => request(`/requirements/${id}`),
    create: (reqData) => request('/requirements', { method: 'POST', body: JSON.stringify(reqData) }),
    delete: (id) => request(`/requirements/${id}`, { method: 'DELETE' }),
  },

  // Offers & Quotes
  offers: {
    getFarmerOffers: () => request('/offers/farmer'),
    getEnterpriseOffers: () => request('/offers/enterprise'),
    create: (offerData) => request('/offers', { method: 'POST', body: JSON.stringify(offerData) }),
    counter: (id, counterData) => request(`/offers/${id}/counter`, { method: 'POST', body: JSON.stringify(counterData) }),
    accept: (id) => request(`/offers/${id}/accept`, { method: 'POST' }),
    reject: (id) => request(`/offers/${id}/reject`, { method: 'POST' }),
    withdraw: (id) => request(`/offers/${id}/withdraw`, { method: 'POST' }),
  },

  // Deals Tracking
  deals: {
    getAll: () => request('/deals'),
    getById: (id) => request(`/deals/${id}`),
    updateStatus: (id, statusData) => request(`/deals/${id}/status`, { method: 'POST', body: JSON.stringify(statusData) }),
    uploadDocument: (id, formData) => request(`/deals/${id}/documents`, { method: 'POST', body: formData }),
  },

  // Messages & Chat
  messages: {
    getConversations: () => request('/messages/conversations'),
    getMessages: (conversationId) => request(`/messages/${conversationId}`),
    sendMessage: (msgData) => request('/messages', { method: 'POST', body: JSON.stringify(msgData) }),
  },

  // Notifications
  notifications: {
    getAll: () => request('/notifications'),
    markRead: (id) => request(`/notifications/${id}/read`, { method: 'PUT' }),
    markAllRead: () => request('/notifications/read-all', { method: 'PUT' }),
  },

  // Saved Items
  saved: {
    getAll: () => request('/saved'),
    toggle: (itemType, itemId) => request('/saved/toggle', { method: 'POST', body: JSON.stringify({ itemType, itemId }) }),
  },

  // Mandi Prices
  mandi: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/mandi${query ? `?${query}` : ''}`);
    },
    getFilters: () => request('/mandi/filters'),
    getHistory: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/mandi/history${query ? `?${query}` : ''}`);
    },
    getMarketCrops: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/mandi/market-crops${query ? `?${query}` : ''}`);
    },
    sync: (data = {}) => request('/mandi/sync', { method: 'POST', body: JSON.stringify(data) }),
  },

  // Export Guides
  guides: {
    getAll: () => request('/guides'),
    getBySlug: (slug) => request(`/guides/${slug}`),
  },

  // Public Directories
  enterprises: {
    getAll: () => request('/auth/enterprises'),
  },
  farmers: {
    getAll: () => request('/auth/farmers'),
  },

  // Admin Dashboard
  admin: {
    getStats: () => request('/admin/stats'),
    getVerifications: () => request('/admin/verifications'),
    reviewVerification: (id, action) => request(`/admin/verifications/${id}/review`, { method: 'POST', body: JSON.stringify({ action }) }),
    getComplaints: () => request('/admin/complaints'),
    resolveComplaint: (id, resolution) => request(`/admin/complaints/${id}/resolve`, { method: 'POST', body: JSON.stringify(resolution) }),
    getUsers: (role) => request(`/admin/users${role ? `?role=${role}` : ''}`),
    updateUserStatus: (id, data) => request(`/admin/users/${id}/status`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteUser: (id) => request(`/admin/users/${id}`, { method: 'DELETE' }),
    impersonate: (userId) => request(`/admin/impersonate/${userId}`, { method: 'POST' }),
  },

  // Complaints
  complaints: {
    getMy: () => request('/complaints/my'),
    create: (data) => request('/complaints', { method: 'POST', body: JSON.stringify(data) }),
  },

  // Reviews
  reviews: {
    getByUser: (userId) => request(`/reviews/user/${userId}`),
    create: (data) => request('/reviews', { method: 'POST', body: JSON.stringify(data) }),
  },

  // Health Diagnostics
  health: {
    get: () => request('/health'),
  },
};

export default api;
