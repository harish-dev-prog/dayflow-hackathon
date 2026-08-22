# Dayflow Backend API Reference

Base URL (local): `http://localhost:5000`

## Authentication

All protected routes require a header:
```
Authorization: Bearer <token>
```
Get a token from `POST /api/auth/login`. Tokens expire in 7 days by default.

Two roles: `employee` and `admin`. Routes marked **Admin only** will return `403` for employees.

---

## 1. Auth — `/api/auth`

### POST `/api/auth/signup`
Public. Creates a new user + an empty profile row.

**Body:**
```json
{
  "employee_id": "EMP001",
  "name": "Jane Doe",
  "email": "jane@company.com",
  "password": "Passw0rd1",
  "role": "employee"
}
```
`role` must be `"employee"` or `"admin"`. Password needs 8+ chars, at least one letter and one number.

**Response `201`:**
```json
{
  "message": "Signup successful. Please verify your email before logging in.",
  "user": { "id": 1, "employee_id": "EMP001", "name": "Jane Doe", "email": "jane@company.com", "role": "employee" }
}
```

### POST `/api/auth/login`
Public.

**Body:** `{ "email": "jane@company.com", "password": "Passw0rd1" }`

**Response `200`:**
```json
{
  "message": "Login successful.",
  "token": "eyJhbGciOi...",
  "user": { "id": 1, "employee_id": "EMP001", "name": "Jane Doe", "email": "jane@company.com", "role": "employee" }
}
```

### GET `/api/auth/me`
Protected. Returns the logged-in user's basic info (sanity-check route).

---

## 2. Profile — `/api/profile`

### GET `/api/profile/me`
Protected. Full profile of the logged-in user (personal + job + salary + documents).

### PUT `/api/profile/me`
Protected. Employee can only update: `phone`, `address`, `profile_picture`.

**Body example:** `{ "phone": "9876543210", "address": "Bengaluru" }`

### GET `/api/profile/:userId`
**Admin only.** View any employee's full profile.

### PUT `/api/profile/:userId`
**Admin only.** Can update ANY field: `phone`, `address`, `profile_picture`, `department`, `designation`, `date_of_joining`, `basic_salary`, `allowances`, `deductions`, `documents`.

---

## 3. Attendance — `/api/attendance`

### POST `/api/attendance/check-in`
Protected. Marks check-in for today. One check-in per user per day (`409` if already checked in).

### POST `/api/attendance/check-out`
Protected. Marks check-out for today. Auto-sets status to `half-day` if less than 4 hours worked, otherwise `present`.

### GET `/api/attendance/me?range=daily` or `?range=weekly`
Protected. `daily` = today only. `weekly` = last 7 days. Defaults to `daily`.

### GET `/api/attendance/all?date=YYYY-MM-DD`
**Admin only.** Everyone's attendance for a given date (defaults to today).

### GET `/api/attendance/:userId?range=daily|weekly`
**Admin only.** One employee's attendance.

### PATCH `/api/attendance/:userId/status`
**Admin only.** Manually set a status for a date (e.g. mark absent).

**Body:** `{ "date": "2026-08-25", "status": "absent" }`
Valid statuses: `present`, `absent`, `half-day`, `leave`.

---

## 4. Leave — `/api/leave`

### POST `/api/leave/apply`
Protected. Employee applies for leave.

**Body:**
```json
{
  "leave_type": "sick",
  "start_date": "2026-08-25",
  "end_date": "2026-08-26",
  "remarks": "fever"
}
```
`leave_type`: `paid`, `sick`, or `unpaid`.

### GET `/api/leave/me`
Protected. All of the logged-in user's leave requests (any status).

### GET `/api/leave/all?status=pending`
**Admin only.** All leave requests, optionally filtered by `pending`, `approved`, `rejected`.

### PATCH `/api/leave/:id/approve`
**Admin only.** Approves the request AND automatically marks every date in the range as `status: "leave"` in attendance.

**Body (optional):** `{ "admin_comment": "approved, get well soon" }`

### PATCH `/api/leave/:id/reject`
**Admin only.** Rejects the request.

**Body (optional):** `{ "admin_comment": "insufficient leave balance" }`

---

## 5. Payroll — `/api/payroll`

### GET `/api/payroll/me`
Protected. Employee's own salary — **read-only**. Returns `basic_salary`, `allowances`, `deductions`, `net_salary` (calculated).

### GET `/api/payroll/all`
**Admin only.** Everyone's payroll in one list.

### PUT `/api/payroll/:userId`
**Admin only.** Update salary structure for one employee.

**Body:** `{ "basic_salary": 50000, "allowances": 5000, "deductions": 1200 }` (any subset of these three fields)

---

## Error Format

All errors return: `{ "message": "Human-readable explanation." }` with an appropriate status code (`400`, `401`, `403`, `404`, `409`, `500`).

## Typical Frontend Flow

1. `POST /api/auth/signup` → `POST /api/auth/login` → store `token` (e.g. in memory or localStorage)
2. Attach `Authorization: Bearer <token>` to every subsequent request
3. On app load, call `GET /api/profile/me` to populate the dashboard with name/role
4. Route employee vs admin dashboards based on `user.role` from the login response
