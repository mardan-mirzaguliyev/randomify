import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import './ProGate.css';

export default function ProGate({ children, feature, from }) {
  const { isPro } = useAuth();

  if (isPro) return children;

  const upgradeUrl = from ? `/upgrade?from=${from}` : '/upgrade';

  return (
    <div className="pro-gate">
      <div className="pro-gate-overlay">
        <div className="pro-gate-lock">🔒</div>
        <h3>Pro feature</h3>
        <p>{feature || 'Upgrade to unlock this feature.'}</p>
        <Link to={upgradeUrl} className="pro-gate-link">
          View plans →
        </Link>
      </div>
      <div className="pro-gate-content" aria-hidden="true">
        {children}
      </div>
    </div>
  );
}
