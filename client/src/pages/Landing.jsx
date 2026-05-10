import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="landing">
      <p className="eyebrow">Vehicle servicing</p>
      <h1 className="landing-title">Book your bike service</h1>
      <p className="landing-sub">
        Choose where you want to go — book as a rider or manage requests as staff.
        No login required; you’ll get a reference code to track your booking.
      </p>
      <div className="landing-actions">
        <Link to="/user" className="btn btn-primary btn-large">
          User dashboard
        </Link>
        <Link to="/admin" className="btn btn-ghost btn-large">
          Admin dashboard
        </Link>
      </div>
    </div>
  );
}
