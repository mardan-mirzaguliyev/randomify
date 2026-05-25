import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Badge from '../components/ui/Badge.jsx';
import Button from '../components/ui/Button.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import ErrorMessage from '../components/ui/ErrorMessage.jsx';
import { CATEGORIES, CATEGORY_LABELS, PICK_MODE_LABELS } from '../utils/labels.js';
import './PublicListsPage.css';

export default function PublicListsPage() {
  const { user, isPro } = useAuth();
  const navigate = useNavigate();
  const [lists, setLists] = useState([]);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cloning, setCloning] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = category ? { category } : {};
      const { data } = await api.get('/lists/explore', { params });
      setLists(data.lists);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load public lists');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [category]);

  const handleClone = async (listId) => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!isPro) {
      navigate('/upgrade?from=clone');
      return;
    }

    setCloning(listId);
    try {
      const { data } = await api.post(`/lists/${listId}/clone`);
      navigate(`/lists/${data.list._id}`);
    } catch (err) {
      const data = err.response?.data;
      if (data?.code === 'UPGRADE_REQUIRED') {
        navigate('/upgrade?from=clone');
      } else {
        alert(data?.message || 'Failed to clone list');
      }
    } finally {
      setCloning(null);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Explore</h1>
        <p>Browse public and template lists shared by the community.</p>
      </div>

      <div className="explore-filter">
        <label htmlFor="category-filter">Category</label>
        <select
          id="category-filter"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
      </div>

      {loading && <Spinner label="Loading..." />}
      {error && <ErrorMessage message={error} onRetry={load} />}

      {!loading && !error && (
        <div className="grid">
          {lists.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No public lists found.</p>
          ) : (
            lists.map((list) => (
              <article key={list._id} className="explore-card card">
                <div className="explore-card-header">
                  <h3>{list.title}</h3>
                  {list.isTemplate && <Badge variant="accent">Template</Badge>}
                </div>
                <p className="explore-card-desc">
                  {list.description || 'No description'}
                </p>
                <p className="explore-card-meta">
                  by {list.ownerName} · {list.itemCount} items ·{' '}
                  {PICK_MODE_LABELS[list.pickMode]}
                </p>
                <Badge>{CATEGORY_LABELS[list.category]}</Badge>
                <div style={{ marginTop: '0.75rem' }}>
                  <Button
                    size="sm"
                    onClick={() => handleClone(list._id)}
                    disabled={cloning === list._id}
                  >
                    {cloning === list._id
                      ? 'Cloning...'
                      : isPro
                        ? 'Clone this list'
                        : 'Clone (Pro)'}
                  </Button>
                </div>
              </article>
            ))
          )}
        </div>
      )}
    </div>
  );
}
