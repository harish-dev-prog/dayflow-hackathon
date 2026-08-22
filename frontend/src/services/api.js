
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
 
/* =========================
   AUTH
========================= */
 
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
 
  verifyEmail: (token) =>
    request(`/auth/verify/${token}`),
 
  me: () => request('/auth/me'),
};
 
/* =========================
   PROFILE
========================= */
 
export const profileAPI = {
  getMe: () => request('/profile/me'),
 
  updateMe: (data) =>
    request('/profile/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};
 
/* =========================
   ATTENDANCE
========================= */
 
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
 
/* =========================
   LEAVE - EMPLOYEE
========================= */
 
export const leaveAPI = {
  apply: (data) =>
    request('/leave/apply', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
 
  getMe: () => request('/leave/me'),
};
 
/* =========================
   PAYROLL
========================= */
 
export const payrollAPI = {
  getMe: () => request('/payroll/me'),
};
 
/* =========================
   ADMIN - EMPLOYEES
========================= */
 
export const adminAPI = {
  getEmployees: () =>
    request('/admin/employees'),
};
 
/* =========================
   ADMIN - LEAVES
========================= */
 
export const adminLeaveAPI = {
  getAll: (status = '') =>
    request(`/leave/all${status ? `?status=${status}` : ''}`),
 
  approve: (id, admin_comment = '') =>
    request(`/leave/${id}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({ admin_comment }),
    }),
 
  reject: (id, admin_comment = '') =>
    request(`/leave/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ admin_comment }),
    }),
};
 
/* =========================
   ADMIN - ATTENDANCE
========================= */
 
export const adminAttendanceAPI = {
  getAll: (date = '') =>
    request(`/attendance/all${date ? `?date=${date}` : ''}`),
 
  updateStatus: (userId, date, status) =>
    request(`/attendance/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ date, status }),
    }),
};
 
/* =========================
   ADMIN - PAYROLL
========================= */
 
export const adminPayrollAPI = {
  getAll: () =>
    request('/payroll/all'),
};
