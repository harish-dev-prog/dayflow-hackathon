import { useEffect, useState } from "react";
import { leaveAPI } from "../services/api";

function Leave() {
  const [form, setForm] = useState({
    leave_type: "paid",
    start_date: "",
    end_date: "",
    remarks: "",
  });

  const [leaves, setLeaves] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadLeaves() {
    try {
      const data = await leaveAPI.getMe();
      setLeaves(data.leave_requests || data.leaves || []);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadLeaves();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      await leaveAPI.apply(form);
      setMessage("Leave request submitted successfully.");
      setForm({
        leave_type: "paid",
        start_date: "",
        end_date: "",
        remarks: "",
      });
      loadLeaves();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <h1>Leave Management</h1>
      <p>Apply for leave and track your requests.</p>

      <div className="card">
        <h2>Apply for Leave</h2>

        <form onSubmit={handleSubmit}>
          <label>Leave Type</label>
          <select
            value={form.leave_type}
            onChange={(e) =>
              setForm({ ...form, leave_type: e.target.value })
            }
          >
            <option value="paid">Paid Leave</option>
            <option value="sick">Sick Leave</option>
            <option value="unpaid">Unpaid Leave</option>
          </select>

          <label>Start Date</label>
          <input
            type="date"
            value={form.start_date}
            onChange={(e) =>
              setForm({ ...form, start_date: e.target.value })
            }
            required
          />

          <label>End Date</label>
          <input
            type="date"
            value={form.end_date}
            onChange={(e) =>
              setForm({ ...form, end_date: e.target.value })
            }
            required
          />

          <label>Remarks</label>
          <textarea
            value={form.remarks}
            onChange={(e) =>
              setForm({ ...form, remarks: e.target.value })
            }
            placeholder="Optional"
          />

          <button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Apply for Leave"}
          </button>
        </form>

        {message && <p>{message}</p>}
      </div>

      <div className="card">
        <h2>My Leave Requests</h2>

        {leaves.length === 0 ? (
          <p>No leave requests yet.</p>
        ) : (
          leaves.map((leave) => (
            <div key={leave.id} className="leave-item">
              <strong>{leave.leave_type}</strong>
              <p>
                {leave.start_date} → {leave.end_date}
              </p>
              <p>Status: {leave.status}</p>
              {leave.remarks && <p>{leave.remarks}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Leave;