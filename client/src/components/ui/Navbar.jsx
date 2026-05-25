import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Button from './Button.jsx';
import './Navbar.css';

export default function Navbar() {
  const { user, logout, isPro } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          Randomify
        </Link>

        <div className="navbar-links">
          <NavLink to="/explore" className={({ isActive }) => (isActive ? 'active' : '')}>
            Explore
          </NavLink>
          {user && (
            <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
              Dashboard
            </NavLink>
          )}
          {user && !isPro && (
            <NavLink to="/upgrade" className={({ isActive }) => (isActive ? 'active' : '')}>
              Upgrade
            </NavLink>
          )}
        </div>

        <div className="navbar-actions">
          {user ? (
            <>
              <span className="navbar-user">
                {user.displayName}
                {isPro && <span className="navbar-pro">Pro</span>}
              </span>
              <Button variant="ghost" size="sm" onClick={logout}>
                Log out
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Sign up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
