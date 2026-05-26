import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/ui/Navbar.jsx';
import ProtectedRoute from './components/ui/ProtectedRoute.jsx';
import AdminRoute from './components/ui/AdminRoute.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ListDetailPage from './pages/ListDetailPage.jsx';
import PublicListsPage from './pages/PublicListsPage.jsx';
import UpgradePage from './pages/UpgradePage.jsx';
import BlogPage from './pages/BlogPage.jsx';
import BlogPostPage from './pages/BlogPostPage.jsx';
import AdminPage from './pages/AdminPage.jsx';

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/explore" element={<PublicListsPage />} />
        <Route path="/upgrade" element={<UpgradePage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:id" element={<BlogPostPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/lists/:id" element={<ListDetailPage />} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
