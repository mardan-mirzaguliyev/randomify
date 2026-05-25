import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button.jsx';
import ErrorMessage from '../ui/ErrorMessage.jsx';
import './AuthForm.css';

export default function AuthForm({ mode, onSubmit }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isRegister = mode === 'register';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    setGeneralError('');
    setSubmitting(true);

    try {
      if (isRegister) {
        await onSubmit(email, password, displayName);
      } else {
        await onSubmit(email, password);
      }
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) {
        setFieldErrors(data.errors);
      } else {
        setGeneralError(data?.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="auth-form card" onSubmit={handleSubmit}>
      <h1>{isRegister ? 'Create account' : 'Welcome back'}</h1>
      <p className="auth-form-sub">
        {isRegister ? 'Start randomizing your lists today.' : 'Log in to your Randomify account.'}
      </p>

      {generalError && <ErrorMessage message={generalError} />}

      {isRegister && (
        <div className="auth-field">
          <label htmlFor="displayName">Display name</label>
          <input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            maxLength={50}
          />
          {fieldErrors.displayName && (
            <p className="field-error">{fieldErrors.displayName}</p>
          )}
        </div>
      )}

      <div className="auth-field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}
      </div>

      <div className="auth-field">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          autoComplete={isRegister ? 'new-password' : 'current-password'}
        />
        {fieldErrors.password && <p className="field-error">{fieldErrors.password}</p>}
      </div>

      <Button type="submit" disabled={submitting} className="auth-submit">
        {submitting ? 'Please wait...' : isRegister ? 'Sign up' : 'Log in'}
      </Button>

      <p className="auth-switch">
        {isRegister ? (
          <>
            Already have an account? <Link to="/login">Log in</Link>
          </>
        ) : (
          <>
            New here? <Link to="/register">Create an account</Link>
          </>
        )}
      </p>
    </form>
  );
}
