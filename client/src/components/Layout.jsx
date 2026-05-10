import { Link, useLocation } from 'react-router-dom';

export default function Layout({ children }) {
  const location = useLocation();
  const onLanding = location.pathname === '/';

  return (
    <div className="layout">
      {!onLanding && (
        <header className="top-bar">
          <Link to="/" className="logo">
            RideCare Bookings
          </Link>
          <nav className="nav-links">
            <Link to="/user">User dashboard</Link>
            <Link to="/admin">Admin dashboard</Link>
          </nav>
        </header>
      )}
      <main className="main-area">{children}</main>
    </div>
  );
}
