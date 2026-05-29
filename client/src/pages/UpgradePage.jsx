import { useSearchParams, Link } from 'react-router-dom';
import Button from '../components/ui/Button.jsx';
import './UpgradePage.css';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: ['3 lists', '20 items per list', 'All pick modes', 'Basic randomization'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$5',
    period: '/month',
    highlighted: true,
    features: [
      'Unlimited lists & items',
      'Pick history (last 50)',
      'Full shuffle view',
      'Collaborative lists',
      'Clone public lists',
    ],
  },
  {
    id: 'lifetime',
    name: 'Lifetime',
    price: '$25',
    period: 'one-time',
    features: [
      'Everything in Pro',
      'Pay once, use forever',
      'Early access to templates',
    ],
  },
];

const COMPARISON = [
  { feature: 'Lists', free: '3', pro: 'Unlimited' },
  { feature: 'Items per list', free: '20', pro: 'Unlimited' },
  { feature: 'Pick modes', free: 'All 4', pro: 'All 4' },
  { feature: 'Pick history', free: '—', pro: 'Last 50' },
  { feature: 'Full shuffle', free: '—', pro: '✓' },
  { feature: 'Collaboration', free: '—', pro: '✓' },
  { feature: 'Clone lists', free: '—', pro: '✓' },
];

export default function UpgradePage() {
  const [params] = useSearchParams();
  const from = params.get('from');

  const handleCta = (planId) => {
    alert(
      `Payment for ${planId} is not wired up yet. Connect Stripe or your payment provider here.`
    );
  };

  return (
    <div className="page upgrade-page">
      <div className="page-header" style={{ textAlign: 'center' }}>
        <h1>Upgrade Randomify</h1>
        <p>Unlock unlimited lists, pick history, and more.</p>
        {from && (
          <p className="upgrade-from">
            You came from: <code>{from}</code>
          </p>
        )}
        <Link to="/dashboard" style={{ fontSize: '0.9rem' }}>
          ← Back to dashboard
        </Link>
      </div>

      <div className="pricing-grid">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`pricing-card card ${plan.highlighted ? 'pricing-card--highlight' : ''}`}
          >
            <h2>{plan.name}</h2>
            <p className="pricing-price">
              <span>{plan.price}</span>
              <small>{plan.period}</small>
            </p>
            <ul>
              {plan.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            {plan.id !== 'free' && (
              <Button
                className="pricing-cta"
                variant={plan.highlighted ? 'primary' : 'secondary'}
                onClick={() => handleCta(plan.id)}
              >
                {plan.id === 'pro' ? 'Subscribe' : 'Buy lifetime'}
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="comparison card">
        <h2>Feature comparison</h2>
        <table>
          <thead>
            <tr>
              <th>Feature</th>
              <th>Free</th>
              <th>Pro / Lifetime</th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON.map((row) => (
              <tr key={row.feature}>
                <td>{row.feature}</td>
                <td>{row.free}</td>
                <td>{row.pro}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
