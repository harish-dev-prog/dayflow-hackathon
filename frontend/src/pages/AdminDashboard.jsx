import { useEffect, useState } from 'react'
import { adminAPI, adminLeaveAPI } from '../services/api'

function AdminDashboard() {
  const [employees, setEmployees] = useState([])
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [processing, setProcessing] = useState(null)

  const user = JSON.parse(
    localStorage.getItem('dayflow_user') || '{}'
  )

  const loadData = async () => {
    try {
      setLoading(true)

      const [employeeData, leaveData] = await Promise.all([
        adminAPI.getEmployees(),
        adminLeaveAPI.getAll(),
      ])

      setEmployees(employeeData.employees || [])
      setLeaves(leaveData.leaveRequests || leaveData.leaves || [])
    } catch (err) {
      console.error('Admin dashboard error:', err)
      setMessage(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleLeaveAction = async (id, action) => {
    try {
      setProcessing(id)
      setMessage('')

      if (action === 'approve') {
        await adminLeaveAPI.approve(id)
      } else {
        await adminLeaveAPI.reject(id)
      }

      setMessage(
        action === 'approve'
          ? 'Leave request approved successfully ✅'
          : 'Leave request rejected successfully.'
      )

      await loadData()
    } catch (err) {
      setMessage(err.message)
    } finally {
      setProcessing(null)
    }
  }

  const logout = () => {
    localStorage.removeItem('dayflow_token')
    localStorage.removeItem('dayflow_user')
    window.location.href = '/login'
  }

  if (loading) {
    return (
      <div style={{ padding: '40px' }}>
        <h2>Loading Admin Dashboard...</h2>
      </div>
    )
  }

  const pendingLeaves = leaves.filter(
    (leave) => leave.status?.toLowerCase() === 'pending'
  )

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
          <p style={{ margin: '5px 0 0', color: '#666' }}>
            Admin / HR Dashboard
          </p>
        </div>

        <button
          onClick={logout}
          style={{
            marginLeft: 'auto',
            padding: '10px 18px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Logout
        </button>
      </header>

      <main style={{ padding: '40px' }}>

        <h2>Welcome, {user.name || 'Admin'} 👋</h2>

        <p style={{ color: '#666' }}>
          Manage employees and HR operations from one place.
        </p>

        {message && (
          <div
            style={{
              padding: '12px',
              margin: '20px 0',
              background: '#eef6ff',
              borderRadius: '6px',
            }}
          >
            {message}
          </div>
        )}

        {/* SUMMARY */}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '20px',
            marginTop: '30px',
          }}
        >
          <div className="dashboard-card">
            <h3>Total Employees</h3>
            <p className="card-number">{employees.length}</p>
          </div>

          <div className="dashboard-card">
            <h3>Pending Leaves</h3>
            <p className="card-number">{pendingLeaves.length}</p>
          </div>

          <div className="dashboard-card">
            <h3>Total Leave Requests</h3>
            <p className="card-number">{leaves.length}</p>
          </div>
        </div>

        {/* EMPLOYEES */}

        <section
          style={{
            marginTop: '35px',
            background: '#fff',
            padding: '25px',
            borderRadius: '10px',
            border: '1px solid #ddd',
          }}
        >
          <h2>Employee List</h2>

          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                marginTop: '20px',
              }}
            >
              <thead>
                <tr>
                  <th style={cellStyle}>Employee ID</th>
                  <th style={cellStyle}>Name</th>
                  <th style={cellStyle}>Email</th>
                  <th style={cellStyle}>Role</th>
                </tr>
              </thead>

              <tbody>
                {employees.map((employee) => (
                  <tr key={employee.id}>
                    <td style={cellStyle}>
                      {employee.employee_id}
                    </td>

                    <td style={cellStyle}>
                      {employee.name}
                    </td>

                    <td style={cellStyle}>
                      {employee.email}
                    </td>

                    <td style={cellStyle}>
                      {employee.role}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* LEAVE APPROVAL */}

        <section
          style={{
            marginTop: '35px',
            background: '#fff',
            padding: '25px',
            borderRadius: '10px',
            border: '1px solid #ddd',
          }}
        >
          <h2>Leave Requests</h2>

          {leaves.length === 0 ? (
            <p>No leave requests found.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  marginTop: '20px',
                }}
              >
                <thead>
                  <tr>
                    <th style={cellStyle}>Employee</th>
                    <th style={cellStyle}>Type</th>
                    <th style={cellStyle}>Dates</th>
                    <th style={cellStyle}>Reason</th>
                    <th style={cellStyle}>Status</th>
                    <th style={cellStyle}>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {leaves.map((leave) => {
                    const pending =
                      leave.status?.toLowerCase() === 'pending'

                    return (
                      <tr key={leave.id}>

                        <td style={cellStyle}>
                          {leave.employee_name ||
                            leave.name ||
                            leave.employee_id ||
                            'Employee'}
                        </td>

                        <td style={cellStyle}>
                          {leave.leave_type ||
                            leave.type ||
                            '-'}
                        </td>

                        <td style={cellStyle}>
                          {leave.start_date} → {leave.end_date}
                        </td>

                        <td style={cellStyle}>
                          {leave.remarks ||
                            leave.reason ||
                            '-'}
                        </td>

                        <td style={cellStyle}>
                          {leave.status}
                        </td>

                        <td style={cellStyle}>
                          {pending ? (
                            <div
                              style={{
                                display: 'flex',
                                gap: '8px',
                              }}
                            >
                              <button
                                onClick={() =>
                                  handleLeaveAction(
                                    leave.id,
                                    'approve'
                                  )
                                }
                                disabled={
                                  processing === leave.id
                                }
                              >
                                Approve
                              </button>

                              <button
                                onClick={() =>
                                  handleLeaveAction(
                                    leave.id,
                                    'reject'
                                  )
                                }
                                disabled={
                                  processing === leave.id
                                }
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            'Completed'
                          )}
                        </td>

                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </main>
    </div>
  )
}

const cellStyle = {
  padding: '14px',
  borderBottom: '1px solid #eee',
  textAlign: 'left',
}

export default AdminDashboard