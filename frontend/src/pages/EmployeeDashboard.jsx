import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  profileAPI,
  attendanceAPI,
  leaveAPI,
  payrollAPI,
} from '../services/api'
 
function EmployeeDashboard() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('dayflow_user') || '{}')
 
  const [profile, setProfile] = useState(null)
  const [attendance, setAttendance] = useState([])
  const [leaves, setLeaves] = useState([])
  const [payroll, setPayroll] = useState(null)
  const [loading, setLoading] = useState(true)
  const [attendanceLoading, setAttendanceLoading] = useState(false)
  const [message, setMessage] = useState('')
 
  const loadDashboard = async () => {
    try {
      const [profileData, attendanceData, leaveData, payrollData] =
        await Promise.all([
          profileAPI.getMe(),
          attendanceAPI.getMe('weekly'),
          leaveAPI.getMe(),
          payrollAPI.getMe(),
        ])
 
      setProfile(profileData)
      setAttendance(attendanceData.attendance || [])
      setLeaves(leaveData.leave_requests || leaveData.leaves || [])
      setPayroll(payrollData)
    } catch (error) {
      console.error('Dashboard error:', error)
    } finally {
      setLoading(false)
    }
  }
 
  useEffect(() => {
    loadDashboard()
  }, [])
 
  const checkIn = async () => {
    setAttendanceLoading(true)
    setMessage('')
 
    try {
      await attendanceAPI.checkIn()
      setMessage('Checked in successfully! ✅')
      await loadDashboard()
    } catch (error) {
      setMessage(error.message)
    } finally {
      setAttendanceLoading(false)
    }
  }
 
  const checkOut = async () => {
    setAttendanceLoading(true)
    setMessage('')
 
    try {
      await attendanceAPI.checkOut()
      setMessage('Checked out successfully! ✅')
      await loadDashboard()
    } catch (error) {
      setMessage(error.message)
    } finally {
      setAttendanceLoading(false)
    }
  }
 
  const logout = () => {
    localStorage.removeItem('dayflow_token')
    localStorage.removeItem('dayflow_user')
    navigate('/login')
  }
 
  if (loading) {
    return <div className="dashboard-loading">Loading DayFlow...</div>
  }
 
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>DayFlow</h1>
          <p>Employee Dashboard</p>
        </div>
 
        <button className="logout-button" onClick={logout}>
          Logout
        </button>
      </header>
 
      <main className="dashboard-content">
        <section className="welcome">
          <h2>Good to see you, {user.name || 'Employee'} 👋</h2>
          <p>Here's your workday overview.</p>
        </section>
 
        {message && (
          <div className="dashboard-message">
            {message}
          </div>
        )}
 
        <section className="attendance-actions">
          <div>
            <h3>Today's Attendance</h3>
            <p>Record your workday.</p>
          </div>
 
          <div className="attendance-buttons">
            <button
              className="checkin-button"
              onClick={checkIn}
              disabled={attendanceLoading}
            >
              {attendanceLoading ? 'Processing...' : 'Check In'}
            </button>
 
            <button
              className="checkout-button"
              onClick={checkOut}
              disabled={attendanceLoading}
            >
              {attendanceLoading ? 'Processing...' : 'Check Out'}
            </button>
          </div>
        </section>
 
        <section className="dashboard-grid">
          <div className="dashboard-card">
            <h3>Profile</h3>
            <p>{profile?.designation || 'Employee'}</p>
            <p>{profile?.department || 'Department not assigned'}</p>
          </div>
 
          <div className="dashboard-card">
            <h3>Attendance</h3>
            <p className="card-number">{attendance.length}</p>
            <span>records this week</span>
          </div>
 
          <div className="dashboard-card">
            <h3>Leave Requests</h3>
            <p className="card-number">{leaves.length}</p>
            <span>total requests</span>
          </div>
 
          <div className="dashboard-card">
            <h3>Salary</h3>
            <p className="salary">
              ₹{Number(payroll?.net_salary || 0).toLocaleString('en-IN')}
            </p>
            <span>net salary</span>
          </div>
        </section>
 
        <section className="dashboard-section">
          <h2>Quick Actions</h2>
 
          <div className="actions">
            <Link to="/profile" className="action-link">
              View Profile
            </Link>
 
            <button
              onClick={() => {
                document
                  .querySelector('.attendance-actions')
                  ?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              Attendance
            </button>
 
            <Link to="/leave" className="action-link">
              Apply Leave
            </Link>
 
            <button>View Salary</button>
          </div>
        </section>
      </main>
    </div>
  )
}
 
export default EmployeeDashboard
