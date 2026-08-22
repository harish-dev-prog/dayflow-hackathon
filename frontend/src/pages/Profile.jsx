import { useEffect, useState } from 'react'
import { profileAPI } from '../services/api'

function Profile() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  // Only these are editable by an employee on their own profile
  // (matches EMPLOYEE_EDITABLE_FIELDS in backend/controllers/profile.controller.js)
  const [form, setForm] = useState({
    phone: '',
    address: '',
    profile_picture: '',
  })

  async function loadProfile() {
    setLoading(true)
    setError('')

    try {
      const data = await profileAPI.getMe()
      const p = data.profile || data

      setProfile(p)
      setForm({
        phone: p.phone || '',
        address: p.address || '',
        profile_picture: p.profile_picture || '',
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')

    try {
      await profileAPI.updateMe(form)
      setMessage('Profile updated successfully.')
      await loadProfile()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="dashboard-loading">Loading profile...</div>
  }

  if (error && !profile) {
    return (
      <div className="page">
        <h1>Profile</h1>
        <div className="error-message">{error}</div>
      </div>
    )
  }

  const netSalary =
    (Number(profile?.basic_salary) || 0) +
    (Number(profile?.allowances) || 0) -
    (Number(profile?.deductions) || 0)

  const documents = (profile?.documents || '')
    .split(',')
    .map((d) => d.trim())
    .filter(Boolean)

  return (
    <div className="page profile-page">
      <h1>My Profile</h1>
      <p>View your details and update your contact information.</p>

      {message && <div className="dashboard-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="profile-grid">
        {/* READ-ONLY: personal + job details */}
        <div className="card">
          <h2>Personal Details</h2>

          <div className="profile-field">
            <span className="profile-label">Employee ID</span>
            <span>{profile?.employee_id}</span>
          </div>

          <div className="profile-field">
            <span className="profile-label">Name</span>
            <span>{profile?.name}</span>
          </div>

          <div className="profile-field">
            <span className="profile-label">Email</span>
            <span>{profile?.email}</span>
          </div>

          <div className="profile-field">
            <span className="profile-label">Role</span>
            <span className="role-badge">{profile?.role}</span>
          </div>
        </div>

        <div className="card">
          <h2>Job Details</h2>

          <div className="profile-field">
            <span className="profile-label">Department</span>
            <span>{profile?.department || 'Not assigned'}</span>
          </div>

          <div className="profile-field">
            <span className="profile-label">Designation</span>
            <span>{profile?.designation || 'Not assigned'}</span>
          </div>

          <div className="profile-field">
            <span className="profile-label">Date of Joining</span>
            <span>{profile?.date_of_joining || 'Not set'}</span>
          </div>

          <p className="profile-hint">
            Job details are managed by HR/Admin.
          </p>
        </div>

        <div className="card">
          <h2>Salary Structure</h2>

          <div className="profile-field">
            <span className="profile-label">Basic Salary</span>
            <span>₹{Number(profile?.basic_salary || 0).toLocaleString('en-IN')}</span>
          </div>

          <div className="profile-field">
            <span className="profile-label">Allowances</span>
            <span>₹{Number(profile?.allowances || 0).toLocaleString('en-IN')}</span>
          </div>

          <div className="profile-field">
            <span className="profile-label">Deductions</span>
            <span>₹{Number(profile?.deductions || 0).toLocaleString('en-IN')}</span>
          </div>

          <div className="profile-field profile-net">
            <span className="profile-label">Net Salary</span>
            <span className="salary">₹{netSalary.toLocaleString('en-IN')}</span>
          </div>

          <p className="profile-hint">Read-only. Managed by HR/Admin.</p>
        </div>

        <div className="card">
          <h2>Documents</h2>

          {documents.length === 0 ? (
            <p className="profile-hint">No documents on file.</p>
          ) : (
            <ul className="documents-list">
              {documents.map((doc, i) => (
                <li key={i}>
                  <a href={doc} target="_blank" rel="noreferrer">
                    {doc}
                  </a>
                </li>
              ))}
            </ul>
          )}

          <p className="profile-hint">Uploaded and managed by HR/Admin.</p>
        </div>

        {/* EDITABLE: employee-owned fields */}
        <div className="card profile-edit-card">
          <h2>Edit Contact Info</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                id="phone"
                type="tel"
                placeholder="+91 90000 00000"
                value={form.phone}
                onChange={(e) =>
                  setForm({ ...form, phone: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="address">Address</label>
              <input
                id="address"
                type="text"
                placeholder="Street, City, State"
                value={form.address}
                onChange={(e) =>
                  setForm({ ...form, address: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="profile_picture">Profile Picture URL</label>
              <input
                id="profile_picture"
                type="text"
                placeholder="https://..."
                value={form.profile_picture}
                onChange={(e) =>
                  setForm({ ...form, profile_picture: e.target.value })
                }
              />
            </div>

            <button className="primary-button" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Profile