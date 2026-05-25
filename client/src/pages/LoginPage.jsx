import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AuthForm from '../components/auth/AuthForm.jsx';

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    navigate('/', { replace: true });
    return null;
  }

  const handleLogin = async (email, password) => {
    await login(email, password);
    navigate('/');
  };

  return (
    <div className="page">
      <AuthForm mode="login" onSubmit={handleLogin} />
    </div>
  );
}
