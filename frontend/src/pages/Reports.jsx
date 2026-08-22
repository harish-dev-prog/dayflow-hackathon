import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  adminPayrollAPI,
  adminAttendanceAPI,
  adminLeaveAPI,
} from '../services/api'

function downloadCSV(filename, rows) {
  if (!rows || rows.length === 0) return

  const headers = Object.keys(rows[0])
  const csv = [
    headers.join(','),
    ...rows.map((row) =>
      headers
        .map((h) => `"${String(row[h] ?? '').replace(/"/g, '""')}"`)
        .join(',')
    ),
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function Reports() {
  const navigate = useNavigate()
  const [payroll, setPayroll] = useState([])
  const [attendance, setAttendance] = useState([])
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const logout = () => {
    localStorage.removeItem('dayflow_token')
    localStorage.removeItem('dayflow_user')
    navigate('/login')
  }

  async function loadReports() {
    setLoading(true)
    setError('')

    try {
      const [payrollData, attendanceData, leaveData] = await Promise.all([
        adminPayrollAPI.getAll(),
        adminAttendanceAPI.getAll(),
        adminLeaveAPI.getAll(),
      ])

      setPayroll(payrollData.payroll || [])
      setAttendance(attendanceData.attendance || [])
      setLeaves(
        leaveData.leave_requests || leaveData.leaveRequests || leaveData.leaves || []
      )
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReports()
  }, [])

  if (loading) {
    return <div className="dashboard-loading">Loading reports...</div>
  }

  const totalPayroll = payroll.reduce(
    (sum, p) => sum + (Number(p.net_salary) || 0),
    0
  )

  const presentToday = attendance.filter((a) => a.status === 'present').length
  const pendingLeaves = leaves.filter((l) => l.status === 'pending').length

  return (
    <div style={{ minHeight: '100vh', background: '#f7f8fa' }}>
      <header
        style={{
          background: '#fff',
          padding: '20px 40px',
          borderBottom: '1px solid #ddd',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>DayFlow</h1>
          <p style={{ margin: '5px 0 0', color: '#666' }}>Reports & Analytics</p>
        </div>

        <Link to="/admin" style={{ marginLeft: 'auto', marginRight: '20px' }}>
          ← Back to Dashboard
        </Link>

        <button
          onClick={logout}
          style={{
            padding: '10px 18px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Logout
        </button>
      </header>

      <main className="page">
        {error && <div className="error-message">{error}</div>}

        <div className="dashboard-grid" style={{ marginBottom: '20px' }}>
          <div className="dashboard-card">
            <h3>Total Payroll</h3>
            <p className="card-number">
              ₹{totalPayroll.toLocaleString('en-IN')}
            </p>
            <span>monthly net, all employees</span>
          </div>

          <div className="dashboard-card">
            <h3>Present Today</h3>
            <p className="card-number">{presentToday}</p>
            <span>of {attendance.length} records</span>
          </div>

          <div className="dashboard-card">
            <h3>Pending Leaves</h3>
            <p className="card-number">{pendingLeaves}</p>
            <span>awaiting approval</span>
          </div>
        </div>

        {/* PAYROLL / SALARY SLIPS */}
        <div className="card">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
            }}
          >
            <h2 style={{ margin: 0 }}>Payroll Report</h2>
            <button
              className="primary-button"
              style={{ width: 'auto', padding: '8px 16px', marginTop: 0 }}
              onClick={() => downloadCSV('payroll-report.csv', payroll)}
            >
              Export CSV
            </button>
          </div>

          {payroll.length === 0 ? (
            <p className="profile-hint">No payroll records found.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '8px' }}>Employee</th>
                  <th style={{ padding: '8px' }}>Basic</th>
                  <th style={{ padding: '8px' }}>Allowances</th>
                  <th style={{ padding: '8px' }}>Deductions</th>
                  <th style={{ padding: '8px' }}>Net Salary</th>
                </tr>
              </thead>
              <tbody>
                {payroll.map((p) => (
                  <tr key={p.user_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '8px' }}>{p.name} ({p.employee_id})</td>
                    <td style={{ padding: '8px' }}>₹{Number(p.basic_salary || 0).toLocaleString('en-IN')}</td>
                    <td style={{ padding: '8px' }}>₹{Number(p.allowances || 0).toLocaleString('en-IN')}</td>
                    <td style={{ padding: '8px' }}>₹{Number(p.deductions || 0).toLocaleString('en-IN')}</td>
                    <td style={{ padding: '8px', fontWeight: 600 }}>₹{Number(p.net_salary || 0).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ATTENDANCE REPORT */}
        <div className="card">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
            }}
          >
            <h2 style={{ margin: 0 }}>Attendance Report</h2>
            <button
              className="primary-button"
              style={{ width: 'auto', padding: '8px 16px', marginTop: 0 }}
              onClick={() => downloadCSV('attendance-report.csv', attendance)}
            >
              Export CSV
            </button>
          </div>

          {attendance.length === 0 ? (
            <p className="profile-hint">No attendance records found.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '8px' }}>Employee</th>
                  <th style={{ padding: '8px' }}>Date</th>
                  <th style={{ padding: '8px' }}>Check In</th>
                  <th style={{ padding: '8px' }}>Check Out</th>
                  <th style={{ padding: '8px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((a, i) => (
                  <tr key={a.id || i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '8px' }}>{a.name || a.employee_id || 'Employee'}</td>
                    <td style={{ padding: '8px' }}>{a.date}</td>
                    <td style={{ padding: '8px' }}>{a.check_in ? new Date(a.check_in).toLocaleTimeString() : '-'}</td>
                    <td style={{ padding: '8px' }}>{a.check_out ? new Date(a.check_out).toLocaleTimeString() : '-'}</td>
                    <td style={{ padding: '8px', textTransform: 'capitalize' }}>{a.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* LEAVE REPORT */}
        <div className="card">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
            }}
          >
            <h2 style={{ margin: 0 }}>Leave Report</h2>
            <button
              className="primary-button"
              style={{ width: 'auto', padding: '8px 16px', marginTop: 0 }}
              onClick={() => downloadCSV('leave-report.csv', leaves)}
            >
              Export CSV
            </button>
          </div>

          {leaves.length === 0 ? (
            <p className="profile-hint">No leave records found.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '8px' }}>Employee</th>
                  <th style={{ padding: '8px' }}>Type</th>
                  <th style={{ padding: '8px' }}>Dates</th>
                  <th style={{ padding: '8px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((l) => (
                  <tr key={l.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '8px' }}>{l.name || l.employee_name || l.employee_id || 'Employee'}</td>
                    <td style={{ padding: '8px', textTransform: 'capitalize' }}>{l.leave_type}</td>
                    <td style={{ padding: '8px' }}>{l.start_date} → {l.end_date}</td>
                    <td style={{ padding: '8px', textTransform: 'capitalize' }}>{l.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  )
}

export default Reports