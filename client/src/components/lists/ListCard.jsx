import { Link, useNavigate } from 'react-router-dom';
import Badge from '../ui/Badge.jsx';
import Button from '../ui/Button.jsx';
import { CATEGORY_LABELS, PICK_MODE_LABELS } from '../../utils/labels.js';
import './ListCard.css';

export default function ListCard({ list, onDelete }) {
  const navigate = useNavigate();
  const itemCount = list.itemCount ?? list.items?.length ?? 0;

  return (
    <article className="list-card card">
      <div className="list-card-header">
        <h3>
          <Link to={`/lists/${list._id}`}>{list.title}</Link>
        </h3>
        <Badge>{CATEGORY_LABELS[list.category] || list.category}</Badge>
      </div>

      <p className="list-card-meta">
        {itemCount} {itemCount === 1 ? 'item' : 'items'} ·{' '}
        {PICK_MODE_LABELS[list.pickMode] || list.pickMode}
      </p>

      <div className="list-card-actions">
        <Button size="sm" onClick={() => navigate(`/lists/${list._id}`)}>
          Pick one
        </Button>
        {list.isOwner && onDelete && (
          <Button variant="danger" size="sm" onClick={() => onDelete(list._id)}>
            Delete
          </Button>
        )}
      </div>
    </article>
  );
}
