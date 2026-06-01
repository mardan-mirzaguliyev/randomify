import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';

export default function ClaimAdminPage() {
  const { user, login: _login } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const handleClaim = async () => {
    setStatus('loading');
    setMessage('');
    try {
      const { data } = await api.post('/auth/claim-admin');
      setStatus('success');
      setMessage(data.message);
      setTimeout(() => navigate('/admin'), 1500);
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Something went wrong.');
    }
  };

  if (!user) {
    return (
      <div className="page" style={{ maxWidth: 480, margin: '80px auto', textAlign: 'center' }}>
        <h1>Admin Setup</h1>
        <p>You must be logged in to claim admin access.</p>
        <button className="btn-primary" onClick={() => navigate('/login')}>
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="page" style={{ maxWidth: 480, margin: '80px auto', textAlign: 'center' }}>
      <h1>Admin Setup</h1>
      <p>
        Logged in as <strong>{user.email}</strong>.<br />
        Click the button below to claim admin access.
        This only works if no admin account exists yet.
      </p>

      {message && (
        <p style={{ color: status === 'error' ? 'var(--danger)' : 'var(--success, green)', margin: '16px 0' }}>
          {message}
        </p>
      )}

      <button
        className="btn-primary"
        onClick={handleClaim}
        disabled={status === 'loading' || status === 'success'}
      >
        {status === 'loading' ? 'Claiming…' : status === 'success' ? 'Done!' : 'Claim Admin'}
      </button>
    </div>
  );
}
