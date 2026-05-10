import { useCallback, useEffect, useState } from 'react';
import { apiUrl } from '../api';
import { SERVICE_TYPES, STATUS_LABELS } from '../constants';

const NEXT_STATUS = {
  PENDING: [
    { value: 'ACCEPTED', label: 'Accept' },
    { value: 'REJECTED', label: 'Reject' },
  ],
  ACCEPTED: [{ value: 'VEHICLE_RECEIVED', label: 'Vehicle received' }],
  VEHICLE_RECEIVED: [{ value: 'SERVICE_IN_PROGRESS', label: 'Service in progress' }],
  SERVICE_IN_PROGRESS: [{ value: 'SERVICE_COMPLETED', label: 'Service completed' }],
  SERVICE_COMPLETED: [{ value: 'FINAL_TOUCHUP_DONE', label: 'Final touch-up done' }],
};

export default function AdminDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setError('');
    try {
      const res = await fetch(apiUrl('/api/bookings'));
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Could not load bookings');
        return;
      }
      setBookings(data);
    } catch {
      setError('Network error — is the API running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function updateStatus(id, status) {
    setBusyId(id);
    setError('');
    try {
      const res = await fetch(apiUrl(`/api/bookings/${id}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Update failed');
        return;
      }
      setBookings((prev) => prev.map((b) => (b.id === id ? data : b)));
    } catch {
      setError('Network error — is the API running?');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="page admin-page">
      <div className="page-head">
        <div>
          <h1>Admin dashboard</h1>
          <p className="page-lead">
            Review appointment requests, accept or reject them, then advance the workshop status for each bike.
          </p>
        </div>
        <button type="button" className="btn btn-ghost" onClick={load} disabled={loading}>
          Refresh list
        </button>
      </div>

      {error && <p className="error banner">{error}</p>}

      {loading ? (
        <p className="muted">Loading appointments…</p>
      ) : bookings.length === 0 ? (
        <p className="muted">No bookings yet.</p>
      ) : (
        <div className="table-wrap card pad-none">
          <table className="data-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Vehicle</th>
                <th>Odometer</th>
                <th>Service</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td className="mono">{b.referenceCode}</td>
                  <td>
                    {b.brand} {b.model}
                  </td>
                  <td>{b.odometerKm.toLocaleString()} km</td>
                  <td>{SERVICE_TYPES.find((s) => s.value === b.serviceType)?.label}</td>
                  <td>{STATUS_LABELS[b.status]}</td>
                  <td className="actions-cell">
                    <AdminActions
                      booking={b}
                      disabled={busyId === b.id}
                      onUpdate={(status) => updateStatus(b.id, status)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AdminActions({ booking, onUpdate, disabled }) {
  const options = NEXT_STATUS[booking.status];
  if (!options || booking.status === 'FINAL_TOUCHUP_DONE' || booking.status === 'REJECTED') {
    return <span className="muted small">—</span>;
  }
  return (
    <div className="action-buttons">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`btn ${opt.value === 'REJECTED' ? 'btn-danger' : 'btn-secondary'}`}
          disabled={disabled}
          onClick={() => onUpdate(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
