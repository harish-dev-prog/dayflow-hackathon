import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authAPI } from '../services/api'

function Signup() {
  
  const [form, setForm] = useState({
    employee_id: '',
    name: '',
    email: '',
    password: '',
    role: 'employee',
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [verified, setVerified] = useState(false)
  const [token, setToken] = useState(null)

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSignup(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await authAPI.signup(form)
      setToken(data.verification_token)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleVerify() {
    setError('')
    setVerifying(true)

    try {
      await authAPI.verifyEmail(token)
      setVerified(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setVerifying(false)
    }
  }

  if (verified) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="login-header">
            <h2>Email verified</h2>
            <p>Your account is ready. You can log in now.</p>
          </div>
          <Link className="primary-button" to="/login" style={{ display: 'inline-block', textAlign: 'center' }}>
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  if (token) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="login-header">
            <h2>Verify your email</h2>
            <p>
              Signup successful. Since this hackathon build has no email server
              configured, click below to confirm your email (this simulates
              clicking the link that would be sent to your inbox).
            </p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            className="primary-button"
            onClick={handleVerify}
            disabled={verifying}
          >
            {verifying ? 'Verifying...' : 'Verify Email'}
          </button>
        </div>
      </div>
    )
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
          <h2>Create account</h2>
          <p>Sign up to get started.</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSignup}>
          <div className="form-group">
            <label htmlFor="employee_id">Employee ID</label>
            <input
              id="employee_id"
              type="text"
              value={form.employee_id}
              onChange={(e) => update('employee_id', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="At least 8 characters, 1 letter, 1 number"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select
              id="role"
              value={form.role}
              onChange={(e) => update('role', e.target.value)}
            >
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p style={{ marginTop: '16px', textAlign: 'center' }}>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  )
}

export default Signup