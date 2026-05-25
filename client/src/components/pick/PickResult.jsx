import { useState } from 'react';
import Button from '../ui/Button.jsx';
import { formatDate } from '../../utils/formatDate.js';
import './PickResult.css';

export default function PickResult({ picked, pickMode, onPickAgain, onDismiss }) {
  const [revealed, setRevealed] = useState(picked?.revealed !== false);
  const isSurprise = pickMode === 'surprise' && picked?.revealed === false;

  if (!picked) return null;

  const linkUrl = picked.affiliateUrl || picked.url;

  return (
    <div className="pick-result card animate-slide-up">
      <p className="pick-result-label">You picked</p>

      {isSurprise && !revealed ? (
        <>
          <h2 className="pick-result-title pick-result-hidden">???</h2>
          <Button onClick={() => setRevealed(true)}>Reveal</Button>
        </>
      ) : (
        <h2 className="pick-result-title">{picked.title}</h2>
      )}

      {revealed && (picked.addedAt || picked.watchedAt || picked.readAt) && (
        <p className="pick-result-meta">
          {picked.addedAt && `Added ${formatDate(picked.addedAt)}`}
          {picked.watchedAt && ` · Watched ${formatDate(picked.watchedAt)}`}
          {picked.readAt && ` · Read ${formatDate(picked.readAt)}`}
        </p>
      )}

      {revealed && picked.notes && (
        <p className="pick-result-notes">{picked.notes}</p>
      )}

      {revealed && linkUrl && (
        <a
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="pick-result-link"
        >
          View →
        </a>
      )}

      <div className="pick-result-actions row">
        <Button onClick={onPickAgain}>Pick again</Button>
        {onDismiss && (
          <Button variant="ghost" onClick={onDismiss}>
            Dismiss
          </Button>
        )}
      </div>
    </div>
  );
}
