import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';
import './AdminPage.css';

export default function AdminPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [lists, setLists] = useState([]);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (activeTab === 'overview') {
        const { data } = await api.get('/admin/stats');
        setStats(data);
      } else if (activeTab === 'users') {
        const { data } = await api.get('/admin/users');
        setUsers(data);
      } else if (activeTab === 'lists') {
        const { data } = await api.get('/admin/lists');
        setLists(data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(users.filter(u => u._id !== userId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleDeleteList = async (listId) => {
    if (!window.confirm('Are you sure you want to delete this list?')) return;
    try {
      await api.delete(`/admin/lists/${listId}`);
      setLists(lists.filter(l => l._id !== listId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete list');
    }
  };

  if (loading && activeTab === 'overview') {
    return <div className="page"><p>Loading...</p></div>;
  }

  if (error) {
    return <div className="page"><p style={{ color: 'var(--danger)' }}>{error}</p></div>;
  }

  return (
    <div className="admin-page">
      <div className="page">
        <div className="page-header">
          <h1>Admin Dashboard</h1>
          <p>Manage users, content, and site settings.</p>
        </div>

        <div className="admin-tabs">
          <button
            className={`admin-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
          <button
            className={`admin-tab ${activeTab === 'lists' ? 'active' : ''}`}
            onClick={() => setActiveTab('lists')}
          >
            Lists
          </button>
          <button
            className={`admin-tab ${activeTab === 'blog' ? 'active' : ''}`}
            onClick={() => setActiveTab('blog')}
          >
            Blog
          </button>
        </div>

        <div className="admin-content">
          {activeTab === 'overview' && (
            <div className="admin-section">
              <h2>Site Overview</h2>
              {loading ? (
                <p>Loading stats...</p>
              ) : stats ? (
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-value">{stats.totalUsers}</div>
                    <div className="stat-label">Total Users</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{stats.totalLists}</div>
                    <div className="stat-label">Total Lists</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{stats.totalPicks}</div>
                    <div className="stat-label">Total Picks</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{stats.activeSubscriptions}</div>
                    <div className="stat-label">Active Subscriptions</div>
                  </div>
                </div>
              ) : (
                <p>No stats available</p>
              )}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="admin-section">
              <h2>User Management</h2>
              {loading ? (
                <p>Loading users...</p>
              ) : (
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Email</th>
                        <th>Name</th>
                        <th>Plan</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user._id}>
                          <td>{user.email}</td>
                          <td>{user.displayName}</td>
                          <td>
                            <span className={`status-badge ${user.plan === 'pro' || user.plan === 'lifetime' ? 'pro' : 'free'}`}>
                              {user.plan}
                            </span>
                          </td>
                          <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                          <td>
                            <button className="action-btn danger" onClick={() => handleDeleteUser(user._id)}>
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'lists' && (
            <div className="admin-section">
              <h2>List Management</h2>
              {loading ? (
                <p>Loading lists...</p>
              ) : (
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Owner</th>
                        <th>Items</th>
                        <th>Visibility</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lists.map((list) => (
                        <tr key={list._id}>
                          <td>{list.title}</td>
                          <td>{list.owner?.displayName || 'Unknown'}</td>
                          <td>{list.items?.length || 0}</td>
                          <td>
                            <span className={`status-badge ${list.isPublic ? 'public' : 'private'}`}>
                              {list.isPublic ? 'Public' : 'Private'}
                            </span>
                          </td>
                          <td>{new Date(list.createdAt).toLocaleDateString()}</td>
                          <td>
                            <button className="action-btn danger" onClick={() => handleDeleteList(list._id)}>
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'blog' && (
            <div className="admin-section">
              <div className="section-header">
                <h2>Blog Management</h2>
                <button className="btn-primary">New Post</button>
              </div>
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                        Blog management coming soon - currently using static posts
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
