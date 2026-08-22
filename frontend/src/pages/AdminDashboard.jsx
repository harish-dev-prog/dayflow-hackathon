import { useEffect, useState } from 'react'
import { adminAPI } from '../services/api'

function AdminDashboard() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const user = JSON.parse(
    localStorage.getItem('dayflow_user') || '{}'
  )

  const loadEmployees = async () => {
    try {
      setError('')
      const data = await adminAPI.getEmployees()
      setEmployees(data.employees || [])
    } catch (err) {
      console.error('Admin dashboard error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEmployees()
  }, [])

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

  return (
    <div style={{ minHeight: '100vh', background: '#f7f8fa' }}>

      {/* HEADER */}
      <header
        style={{
          background: '#ffffff',
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

      {/* CONTENT */}
      <main style={{ padding: '40px' }}>

        <h2>
          Welcome, {user.name || 'Admin'} 👋
        </h2>

        <p style={{ color: '#666' }}>
          Manage employees and HR operations from one place.
        </p>

        {error && (
          <div
            style={{
              padding: '12px',
              marginTop: '20px',
              background: '#ffe5e5',
              color: '#b00020',
              borderRadius: '6px',
            }}
          >
            {error}
          </div>
        )}

        {/* SUMMARY CARDS */}
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
            <p className="card-number">
              {employees.length}
            </p>
          </div>

          <div className="dashboard-card">
            <h3>Admins / HR</h3>
            <p className="card-number">
              {employees.filter((e) => e.role === 'admin').length}
            </p>
          </div>

          <div className="dashboard-card">
            <h3>Employees</h3>
            <p className="card-number">
              {employees.filter((e) => e.role === 'employee').length}
            </p>
          </div>
        </div>

        {/* EMPLOYEE LIST */}
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

          {employees.length === 0 ? (
            <p>No employees found.</p>
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
                    <th style={cellStyle}>Employee ID</th>
                    <th style={cellStyle}>Name</th>
                    <th style={cellStyle}>Email</th>
                    <th style={cellStyle}>Role</th>
                    <th style={cellStyle}>Verified</th>
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

                      <td style={cellStyle}>
                        {employee.is_verified ? 'Yes ✅' : 'No'}
                      </td>
                    </tr>
                  ))}
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