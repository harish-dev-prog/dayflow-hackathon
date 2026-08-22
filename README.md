# DayFlow — Human Resource Management System

Odoo x NMIT Hackathon 2026

Every workday, perfectly aligned.

## What it does

DayFlow digitizes core HR operations for a small/mid-size company:

- **Auth** — signup/login with JWT, role-based access (Employee / Admin)
- **Employee Dashboard** — check-in/check-out, weekly attendance, leave summary, salary snapshot
- **Profile** — view personal, job, and salary details; edit contact info
- **Leave Management** — apply for paid/sick/unpaid leave, track status
- **Admin Dashboard** — employee directory, leave approval/rejection, live attendance
- **Reports** — payroll, attendance, and leave reports with CSV export

## Tech stack

- **Frontend:** React + Vite, React Router
- **Backend:** Node.js + Express + SQLite
- **Auth:** JWT, role-based middleware

## Setup

### Backend
```bash
cd backend
npm install
cp .env.example .env   # fill in a JWT_SECRET
npm run dev
```
Runs on `http://localhost:5000`.

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Runs on `http://localhost:5173`.

## Demo flow

1. Sign up / log in as an employee → check in, apply for leave, view profile
2. Log in as admin → approve the leave request, view the employee list
3. Open **Reports** from the admin dashboard → export payroll/attendance/leave as CSV

## Team

Odoo x NMIT Hackathon 2026 — Dayflow