const API_BASE_URL = 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('dayflow_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}

export const authAPI = {
  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  signup: (userData) =>
    request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  me: () => request('/auth/me'),
};

export const profileAPI = {
  getMe: () => request('/profile/me'),

  updateMe: (data) =>
    request('/profile/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

export const attendanceAPI = {
  checkIn: () =>
    request('/attendance/check-in', {
      method: 'POST',
    }),

  checkOut: () =>
    request('/attendance/check-out', {
      method: 'POST',
    }),

  getMe: (range = 'daily') =>
    request(`/attendance/me?range=${range}`),
};

export const leaveAPI = {
  apply: (data) =>
    request('/leave/apply', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMe: () => request('/leave/me'),
};

export const payrollAPI = {
  getMe: () => request('/payroll/me'),
};