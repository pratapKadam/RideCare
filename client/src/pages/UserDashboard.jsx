import { useState } from 'react';
import { apiUrl } from '../api';
import { SERVICE_TYPES, STATUS_LABELS, STATUS_ORDER, statusStepIndex } from '../constants';

export default function UserDashboard() {
  const [mode, setMode] = useState('choose'); // choose | form
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [odometerKm, setOdometerKm] = useState('');
  const [serviceType, setServiceType] = useState('WASH_ONLY');
  const [submitting, setSubmitting] = useState(false);
  const [booking, setBooking] = useState(null);
  const [formError, setFormError] = useState('');

  const [trackCode, setTrackCode] = useState('');
  const [tracked, setTracked] = useState(null);
  const [trackError, setTrackError] = useState('');
  const [tracking, setTracking] = useState(false);

  async function handleBook(e) {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      const res = await fetch(apiUrl('/api/bookings'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand,
          model,
          odometerKm: Number(odometerKm),
          serviceType,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormError(data.error || 'Could not create booking');
        return;
      }
      setBooking(data);
      setMode('done');
    } catch {
      setFormError('Network error — is the API running?');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleTrack(e) {
    e.preventDefault();
    setTrackError('');
    setTracked(null);
    setTracking(true);
    try {
      const code = trackCode.trim().toUpperCase();
      const res = await fetch(apiUrl(`/api/bookings/by-reference/${encodeURIComponent(code)}`));
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setTrackError(data.error || 'Booking not found');
        return;
      }
      setTracked(data);
    } catch {
      setTrackError('Network error — is the API running?');
    } finally {
      setTracking(false);
    }
  }

  function resetBookingFlow() {
    setMode('choose');
    setBooking(null);
    setBrand('');
    setModel('');
    setOdometerKm('');
    setServiceType('WASH_ONLY');
    setFormError('');
  }

  return (
    <div className="page user-page">
      <h1>User dashboard</h1>
      <p className="page-lead">
        Book a service appointment for your bike, then track status updates from the workshop.
      </p>

      <section className="card">
        <h2>Book an appointment</h2>
        {mode === 'choose' && (
          <div className="stack">
            <p>Register your bike and pick a service type. You’ll receive a reference code to track progress.</p>
            <button type="button" className="btn btn-primary" onClick={() => setMode('form')}>
              Book now
            </button>
          </div>
        )}
        {mode === 'form' && (
          <form className="form grid-form" onSubmit={handleBook}>
            <label className="field">
              <span>Brand</span>
              <input
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Honda"
                required
              />
            </label>
            <label className="field">
              <span>Model</span>
              <input
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. CB Shine"
                required
              />
            </label>
            <label className="field">
              <span>Kilometers on odometer</span>
              <input
                type="number"
                min="0"
                step="1"
                value={odometerKm}
                onChange={(e) => setOdometerKm(e.target.value)}
                placeholder="e.g. 12000"
                required
              />
            </label>
            <label className="field">
              <span>Type of service</span>
              <select value={serviceType} onChange={(e) => setServiceType(e.target.value)}>
                {SERVICE_TYPES.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
            {formError && <p className="error">{formError}</p>}
            <div className="row-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setMode('choose')}>
                Back
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Sending…' : 'Submit booking'}
              </button>
            </div>
          </form>
        )}
        {mode === 'done' && booking && (
          <div className="success-block stack">
            <p className="success-title">Booking submitted</p>
            <p>
              Save your reference code — you’ll need it to check status:
            </p>
            <p className="ref-code">{booking.referenceCode}</p>
            <p className="muted small">
              When the workshop accepts your request, your status will update below after you look up this code.
            </p>
            <button type="button" className="btn btn-ghost" onClick={resetBookingFlow}>
              Book another
            </button>
          </div>
        )}
      </section>

      <section className="card">
        <h2>Track your booking</h2>
        <form className="form track-form" onSubmit={handleTrack}>
          <label className="field inline-field">
            <span>Reference code</span>
            <input
              value={trackCode}
              onChange={(e) => setTrackCode(e.target.value)}
              placeholder="e.g. BK-ABC123XY"
            />
          </label>
          <button type="submit" className="btn btn-primary" disabled={tracking}>
            {tracking ? 'Looking up…' : 'View status'}
          </button>
          {trackError && <p className="error">{trackError}</p>}
        </form>

        {tracked && (
          <div className="track-result stack">
            <div className="track-meta">
              <div>
                <span className="muted">Bike</span>
                <p>
                  {tracked.brand} {tracked.model}
                </p>
              </div>
              <div>
                <span className="muted">Odometer</span>
                <p>{tracked.odometerKm.toLocaleString()} km</p>
              </div>
              <div>
                <span className="muted">Service</span>
                <p>{SERVICE_TYPES.find((s) => s.value === tracked.serviceType)?.label}</p>
              </div>
            </div>
            <StatusTimeline status={tracked.status} />
          </div>
        )}
      </section>
    </div>
  );
}

function StatusTimeline({ status }) {
  if (status === 'REJECTED') {
    return (
      <div className="timeline rejected">
        <p className="error">{STATUS_LABELS.REJECTED}</p>
        <p className="muted small">Contact the service center if you have questions.</p>
      </div>
    );
  }

  const currentIdx = statusStepIndex(status);
  return (
    <ol className="timeline">
      {STATUS_ORDER.map((key, idx) => {
        const done = idx <= currentIdx;
        const active = idx === currentIdx;
        return (
          <li key={key} className={`timeline-step ${done ? 'done' : ''} ${active ? 'active' : ''}`}>
            <span className="dot" aria-hidden />
            <div>
              <p className="timeline-label">{STATUS_LABELS[key]}</p>
              {active && <p className="muted small">Current step</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
