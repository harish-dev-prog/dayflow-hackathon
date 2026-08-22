import { useEffect, useState } from 'react'
import { payrollAPI } from '../services/api'

function Payroll() {
  const [payroll, setPayroll] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadPayroll()
  }, [])

  async function loadPayroll() {
    try {
      setLoading(true)
      setMessage('')

      const data = await payrollAPI.getMe()

      console.log('Payroll data:', data)

      setPayroll(
        data.payroll ||
        data.salary ||
        data.data ||
        data
      )
    } catch (err) {
      console.error('Payroll error:', err)
      setMessage(err.message || 'Could not load payroll details.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="page">
        <h1>Payroll</h1>
        <p>Loading payroll details...</p>
      </div>
    )
  }

  return (
    <div className="page">
      <h1>Payroll</h1>

      <p>View your salary and payroll information.</p>

      {message && (
        <div
          className="card"
          style={{
            marginTop: '20px',
            color: '#b00020',
          }}
        >
          {message}
        </div>
      )}

      {!message && !payroll ? (
        <div className="card">
          <h2>No Payroll Information</h2>
          <p>Payroll details are not available yet.</p>
        </div>
      ) : (
        <div
          className="card"
          style={{
            marginTop: '25px',
          }}
        >
          <h2>My Payroll</h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '20px',
              marginTop: '20px',
            }}
          >
            <div>
              <strong>Basic Salary</strong>
              <p>₹{payroll?.basic_salary ?? '-'}</p>
            </div>

            <div>
              <strong>Allowances</strong>
              <p>₹{payroll?.allowances ?? '-'}</p>
            </div>

            <div>
              <strong>Deductions</strong>
              <p>₹{payroll?.deductions ?? '-'}</p>
            </div>

            <div>
              <strong>Net Salary</strong>
              <p
                style={{
                  fontSize: '22px',
                  fontWeight: 'bold',
                }}
              >
                ₹{payroll?.net_salary ?? '-'}
              </p>
            </div>
          </div>

          <hr style={{ margin: '25px 0' }} />

          <p>
            <strong>Month:</strong> {payroll?.month || '-'}
          </p>

          <p>
            <strong>Year:</strong> {payroll?.year || '-'}
          </p>
        </div>
      )}
    </div>
  )
}

export default Payroll