import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AuthForm from '../components/auth/AuthForm.jsx';

export default function LoginPage() {
  const { login, user, isAdmin } = useAuth();
  const navigate = useNavigate();

  if (user) {
    navigate(isAdmin ? '/admin' : '/dashboard', { replace: true });
    return null;
  }

  const handleLogin = async (email, password) => {
    const data = await login(email, password);
    const dest = data.user?.isAdmin ? '/admin' : '/dashboard';
    navigate(dest, { replace: true });
  };

  return (
    <div className="page">
      <AuthForm mode="login" onSubmit={handleLogin} />
    </div>
  );
}
