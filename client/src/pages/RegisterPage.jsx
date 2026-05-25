import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AuthForm from '../components/auth/AuthForm.jsx';

export default function RegisterPage() {
  const { register, user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    navigate('/', { replace: true });
    return null;
  }

  const handleRegister = async (email, password, displayName) => {
    await register(email, password, displayName);
    navigate('/');
  };

  return (
    <div className="page">
      <AuthForm mode="register" onSubmit={handleRegister} />
    </div>
  );
}
