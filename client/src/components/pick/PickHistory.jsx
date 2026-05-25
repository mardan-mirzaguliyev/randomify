import { useEffect, useState } from 'react';
import api from '../../services/api.js';
import Spinner from '../ui/Spinner.jsx';
import ErrorMessage from '../ui/ErrorMessage.jsx';
import { PICK_MODE_LABELS } from '../../utils/labels.js';
import './PickHistory.css';

export default function PickHistory({ listId }) {
  const [picks, setPicks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/lists/${listId}/picks`);
      setPicks(data.picks);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [listId]);

  if (loading) return <Spinner label="Loading history..." />;
  if (error) return <ErrorMessage message={error} onRetry={load} />;

  if (!picks.length) {
    return <p className="pick-history-empty">No picks recorded yet.</p>;
  }

  return (
    <ul className="pick-history-list">
      {picks.map((pick) => (
        <li key={pick._id} className="pick-history-item">
          <span className="pick-history-title">{pick.itemTitleSnapshot}</span>
          <span className="pick-history-meta">
            {PICK_MODE_LABELS[pick.pickMode] || pick.pickMode} · pool of{' '}
            {pick.poolSizeSnapshot} ·{' '}
            {new Date(pick.createdAt).toLocaleDateString()}
          </span>
        </li>
      ))}
    </ul>
  );
}
