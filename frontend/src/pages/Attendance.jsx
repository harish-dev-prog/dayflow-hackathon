import { useEffect, useState } from 'react'
import { attendanceAPI } from '../services/api'
 
function Attendance() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
 
  async function loadAttendance() {
    setLoading(true)
    setError('')
 
    try {
      const data = await attendanceAPI.getMe('weekly')
      setRecords(data.attendance || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
 
  useEffect(() => {
    loadAttendance()
  }, [])
 
  async function checkIn() {
    setActionLoading(true)
    setMessage('')
    setError('')
 
    try {
      await attendanceAPI.checkIn()
      setMessage('Checked in successfully! ✅')
      await loadAttendance()
    } catch (err) {
      setError(err.message)
    } finally {
      setActionLoading(false)
    }
  }
 
  async function checkOut() {
    setActionLoading(true)
    setMessage('')
    setError('')
 
    try {
      await attendanceAPI.checkOut()
      setMessage('Checked out successfully! ✅')
      await loadAttendance()
    } catch (err) {
      setError(err.message)
    } finally {
      setActionLoading(false)
    }
  }
 
  return (
    <div className="page">
      <h1>Attendance</h1>
      <p>Check in, check out, and review your recent attendance.</p>
 
      {message && <div className="dashboard-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}
 
      <div className="card" style={{ marginBottom: '20px' }}>
        <h2>Today</h2>
        <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
          <button
            className="primary-button"
            onClick={checkIn}
            disabled={actionLoading}
          >
            {actionLoading ? 'Processing...' : 'Check In'}
          </button>
 
          <button
            className="primary-button"
            onClick={checkOut}
            disabled={actionLoading}
          >
            {actionLoading ? 'Processing...' : 'Check Out'}
          </button>
        </div>
      </div>
 
      <div className="card">
        <h2>Recent Records</h2>
 
        {loading ? (
          <p>Loading...</p>
        ) : records.length === 0 ? (
          <p className="profile-hint">No attendance records yet.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px' }}>Date</th>
                <th style={{ textAlign: 'left', padding: '8px' }}>Check In</th>
                <th style={{ textAlign: 'left', padding: '8px' }}>Check Out</th>
                <th style={{ textAlign: 'left', padding: '8px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id}>
                  <td style={{ padding: '8px' }}>{r.attendance_date}</td>
                  <td style={{ padding: '8px' }}>{r.check_in || '-'}</td>
                  <td style={{ padding: '8px' }}>{r.check_out || '-'}</td>
                  <td style={{ padding: '8px' }}>{r.status || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
 
export default Attendance
 