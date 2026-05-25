import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/ui/Navbar.jsx';
import ProtectedRoute from './components/ui/ProtectedRoute.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ListDetailPage from './pages/ListDetailPage.jsx';
import PublicListsPage from './pages/PublicListsPage.jsx';
import UpgradePage from './pages/UpgradePage.jsx';

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/explore" element={<PublicListsPage />} />
        <Route path="/upgrade" element={<UpgradePage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/lists/:id" element={<ListDetailPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
