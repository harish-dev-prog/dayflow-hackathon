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
import Profile from './pages/Profile'
import AdminDashboard from './pages/AdminDashboard'
import Reports from './pages/Reports'
import Signup from './pages/Signup'
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
 
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
 
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
 
        <p style={{ marginTop: '16px', textAlign: 'center' }}>
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
 
      </div>
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
 
        <Link to="/dashboard">
          Dashboard
        </Link>
 
        <Link to="/leave">
          Leave
        </Link>
 
        <Link to="/profile">
          Profile
        </Link>
 
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
   APP + ROUTES
========================= */
 
function App() {
 
  const token = localStorage.getItem('dayflow_token')
 
  const user = JSON.parse(
    localStorage.getItem('dayflow_user') || '{}'
  )
 
  return (
    <BrowserRouter>
 
      <Routes>
 
        {/* HOME */}
 
        <Route
          path="/"
          element={
            token ? (
              <Navigate
                to={
                  user.role === 'admin'
                    ? '/admin'
                    : '/dashboard'
                }
                replace
              />
            ) : (
              <Navigate
                to="/login"
                replace
              />
            )
          }
        />
 
 
        {/* LOGIN */}
 
        <Route
          path="/login"
          element={
            token ? (
              <Navigate
                to={
                  user.role === 'admin'
                    ? '/admin'
                    : '/dashboard'
                }
                replace
              />
            ) : (
              <Login />
            )
          }
        />
 
 
        {/* SIGNUP */}
 
        <Route
          path="/signup"
          element={
            token ? (
              <Navigate
                to={
                  user.role === 'admin'
                    ? '/admin'
                    : '/dashboard'
                }
                replace
              />
            ) : (
              <Signup />
            )
          }
        />
 
 
        {/* EMPLOYEE DASHBOARD */}
 
        <Route
          path="/dashboard"
          element={
            token && user.role === 'employee' ? (
              <EmployeeLayout>
                <EmployeeDashboard />
              </EmployeeLayout>
            ) : (
              <Navigate
                to="/login"
                replace
              />
            )
          }
        />
 
 
        {/* LEAVE */}
 
        <Route
          path="/leave"
          element={
            token ? (
              <EmployeeLayout>
                <Leave />
              </EmployeeLayout>
            ) : (
              <Navigate
                to="/login"
                replace
              />
            )
          }
        />
 
 
        {/* PROFILE (both roles) */}
 
        <Route
          path="/profile"
          element={
            token ? (
              <EmployeeLayout>
                <Profile />
              </EmployeeLayout>
            ) : (
              <Navigate
                to="/login"
                replace
              />
            )
          }
        />
 
 
        {/* ADMIN DASHBOARD */}
 
        <Route
          path="/admin"
          element={
            token && user.role === 'admin' ? (
              <AdminDashboard />
            ) : (
              <Navigate
                to="/login"
                replace
              />
            )
          }
        />
 
 
        {/* ADMIN REPORTS */}
 
        <Route
          path="/admin/reports"
          element={
            token && user.role === 'admin' ? (
              <Reports />
            ) : (
              <Navigate
                to="/login"
                replace
              />
            )
          }
        />
 
 
        {/* UNKNOWN ROUTES */}
 
        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />
 
      </Routes>
 
    </BrowserRouter>
  )
}
 
export default App