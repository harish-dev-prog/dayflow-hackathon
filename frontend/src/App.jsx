import { useState } from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  Link,
} from 'react-router-dom'

import { authAPI } from './services/api'
import EmployeeDashboard from './pages/EmployeeDashboard'
import Leave from './pages/Leave'
import './App.css'

function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (event) => {
    event.preventDefault()

    setError('')
    setLoading(true)

    try {
      const data = await authAPI.login(email, password)

      localStorage.setItem('dayflow_token', data.token)
      localStorage.setItem('dayflow_user', JSON.stringify(data.user))

      if (data.user.role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="brand">
          <div className="brand-icon">D</div>
          <div>
            <h1>DayFlow</h1>
            <p>Every workday, perfectly aligned.</p>
          </div>
        </div>

        <div className="login-header">
          <h2>Welcome back</h2>
          <p>Sign in to continue to your workspace.</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="primary-button"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}

/* =========================
   ADMIN DASHBOARD
========================= */

function AdminDashboard() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('dayflow_user') || '{}')

  const logout = () => {
    localStorage.removeItem('dayflow_token')
    localStorage.removeItem('dayflow_user')
    navigate('/login')
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>DayFlow</h1>
          <p>Admin / HR Dashboard</p>
        </div>

        <button className="logout-button" onClick={logout}>
          Logout
        </button>
      </header>

      <main className="dashboard-content">
        <section className="welcome">
          <h2>Welcome, {user.name || 'Admin'} 👋</h2>
          <p>Manage your workforce from one place.</p>
        </section>

        <section className="dashboard-grid">
          <div className="dashboard-card">
            <h3>Employees</h3>
            <p>Manage employee profiles and details.</p>
            <button className="primary-button">
              View Employees
            </button>
          </div>

          <div className="dashboard-card">
            <h3>Attendance</h3>
            <p>View employee attendance records.</p>
            <button className="primary-button">
              View Attendance
            </button>
          </div>

          <div className="dashboard-card">
            <h3>Leave Requests</h3>
            <p>Review and approve employee leave.</p>
            <Link to="/leave" className="primary-button">
              Manage Leave
            </Link>
          </div>

          <div className="dashboard-card">
            <h3>Payroll</h3>
            <p>View and manage salary information.</p>
            <button className="primary-button">
              View Payroll
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}

/* =========================
   EMPLOYEE NAVIGATION
========================= */

function EmployeeLayout({ children }) {
  const navigate = useNavigate()

  const logout = () => {
    localStorage.removeItem('dayflow_token')
    localStorage.removeItem('dayflow_user')
    navigate('/login')
  }

  return (
    <>
      <nav
        style={{
          display: 'flex',
          gap: '20px',
          padding: '15px 30px',
          borderBottom: '1px solid #ddd',
          alignItems: 'center',
        }}
      >
        <strong>DayFlow</strong>

        <Link to="/dashboard">Dashboard</Link>
        <Link to="/leave">Leave</Link>

        <button
          onClick={logout}
          style={{ marginLeft: 'auto' }}
        >
          Logout
        </button>
      </nav>

      {children}
    </>
  )
}

/* =========================
   ROUTES
========================= */

function App() {
  const token = localStorage.getItem('dayflow_token')
  const user = JSON.parse(
    localStorage.getItem('dayflow_user') || '{}'
  )

  return (
    <BrowserRouter>
      <Routes>

        {/* Login */}
        <Route
          path="/"
          element={
            token
              ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
              : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/login"
          element={
            token
              ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
              : <Login />
          }
        />

        {/* Employee Dashboard */}
        <Route
          path="/dashboard"
          element={
            token && user.role === 'employee' ? (
              <EmployeeLayout>
                <EmployeeDashboard />
              </EmployeeLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Leave */}
        <Route
          path="/leave"
          element={
            token ? (
              <EmployeeLayout>
                <Leave />
              </EmployeeLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            token && user.role === 'admin' ? (
              <AdminDashboard />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Anything unknown */}
        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />

      </Routes>
    </BrowserRouter>
  )
}

export default App