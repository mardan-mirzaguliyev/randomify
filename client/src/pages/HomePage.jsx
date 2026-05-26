import { Link } from 'react-router-dom';
import Button from '../components/ui/Button.jsx';
import './HomePage.css';

export default function HomePage() {
  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Can't decide? <span className="gradient-text">Let Randomify choose.</span>
          </h1>
          <p className="hero-subtitle">
            Create lists of items and let fate decide. Perfect for restaurants, movies, games, gifts, or any decision you're stuck on.
          </p>
          <div className="hero-actions">
            <Link to="/register">
              <Button size="lg">Get started free</Button>
            </Link>
            <Link to="/explore">
              <Button variant="secondary" size="lg">Browse lists</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="page">
          <h2 className="features-title">Why Randomify?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Weighted Picks</h3>
              <p>Give some items higher chances to be picked. Perfect when you have preferences but still want surprise.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⏰</div>
              <h3>Cooldowns</h3>
              <p>Prevent the same item from being picked again for a set time. Keep things fresh and varied.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎲</div>
              <h3>Surprise Mode</h3>
              <p>True randomness with no repeats until every item has been picked. Great for games and activities.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📜</div>
              <h3>Pick History</h3>
              <p>Track your past decisions (Pro feature). See patterns and review your choices over time.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="page">
          <div className="cta-card">
            <h2>Ready to stop overthinking?</h2>
            <p>Join thousands of users who let Randomify make their decisions.</p>
            <div className="cta-actions">
              <Link to="/register">
                <Button size="lg">Create free account</Button>
              </Link>
              <Link to="/login">
                <Button variant="ghost" size="lg">Sign in</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
