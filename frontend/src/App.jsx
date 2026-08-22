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

        <p className="signup-text">
          Don't have an account? <span>Sign up</span>
        </p>
      </div>
    </div>
  )
}

function AdminDashboard() {
  const user = JSON.parse(localStorage.getItem('dayflow_user') || '{}')

  return (
    <div style={{ padding: '40px' }}>
      <h1>Welcome, {user.name || 'Admin'} 👋</h1>
      <p>Admin / HR Dashboard</p>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />

        <Route path="/dashboard" element={<EmployeeDashboard />} />

        <Route path="/leave" element={<Leave />} />

        <Route path="/admin" element={<AdminDashboard />} />

        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App