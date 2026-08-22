# Dayflow Backend

Backend for **Dayflow — Human Resource Management System**.
Stack: Node.js + Express + SQLite.

## Setup

```bash
npm install
cp .env.example .env   # then fill in a real JWT_SECRET
npm run dev             # requires nodemon (dev dependency)
# or
npm start
```

Server runs on `http://localhost:5000` by default.

## API Endpoints (so far)

### Auth

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | Public | Register a new user (employee_id, name, email, password, role) |
| POST | `/api/auth/login` | Public | Log in, returns JWT |
| GET | `/api/auth/me` | Protected | Get current logged-in user's info |

### Admin

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/admin/employees` | Admin only | List all employees |

### Example signup body
```json
{
  "employee_id": "EMP001",
  "name": "Gowri Shankar",
  "email": "gowri@example.com",
  "password": "Passw0rd1",
  "role": "employee"
}
```

### Example login body
```json
{
  "email": "gowri@example.com",
  "password": "Passw0rd1"
}
```

Use the returned `token` as `Authorization: Bearer <token>` for protected routes.

## Project Structure

```
dayflow-backend/
├── config/         # DB connection + table setup
├── controllers/     # Route logic
├── middleware/       # auth (JWT) + role-based access
├── routes/           # Express routers
├── utils/             # helpers (JWT generation)
├── server.js
└── .env.example
```

## Next up
- Employee profile CRUD
- Attendance check-in/check-out
- Leave application + approval workflow
- Payroll endpoints
