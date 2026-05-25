import { useState, useEffect } from 'react';
import Badge from '../ui/Badge.jsx';
import Button from '../ui/Button.jsx';
import DatePicker from '../ui/DatePicker.jsx';
import { itemTrackingType } from '../../utils/labels.js';
import { formatDate, toDateInputValue, dateInputToISO } from '../../utils/formatDate.js';
import './ItemRow.css';

function isInCooldown(list, item) {
  if (list.pickMode !== 'cooldown' || !item.lastPickedAt) return false;
  const cooldownMs = (list.cooldownDays || 7) * 86400000;
  return Date.now() - new Date(item.lastPickedAt).getTime() <= cooldownMs;
}

export default function ItemRow({ list, item, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [notes, setNotes] = useState(item.notes || '');
  const [weight, setWeight] = useState(item.weight || 1);
  const [watchedDate, setWatchedDate] = useState(toDateInputValue(item.watchedAt));
  const [readDate, setReadDate] = useState(toDateInputValue(item.readAt));

  useEffect(() => {
    setWatchedDate(toDateInputValue(item.watchedAt));
    setReadDate(toDateInputValue(item.readAt));
  }, [item.watchedAt, item.readAt]);

  const tracking = itemTrackingType(list.category);
  const inCooldown = isInCooldown(list, item);
  const showWeight = list.pickMode === 'weighted' && (item.weight || 1) > 1;

  const handleSave = async () => {
    const payload = { title, notes, weight: Number(weight) };
    if (tracking === 'watch') {
      payload.watchedAt = dateInputToISO(watchedDate);
      payload.readAt = null;
    }
    if (tracking === 'read') {
      payload.readAt = dateInputToISO(readDate);
      payload.watchedAt = null;
    }
    await onUpdate(item._id, payload);
    setEditing(false);
  };

  const toggleExclude = async () => {
    await onUpdate(item._id, { excludeFromPool: !item.excludeFromPool });
  };

  const toggleWatched = async (checked) => {
    if (checked) {
      const today = toDateInputValue(new Date());
      setWatchedDate(today);
      await onUpdate(item._id, { watchedAt: dateInputToISO(today) });
    } else {
      setWatchedDate('');
      await onUpdate(item._id, { watchedAt: null });
    }
  };

  const toggleRead = async (checked) => {
    if (checked) {
      const today = toDateInputValue(new Date());
      setReadDate(today);
      await onUpdate(item._id, { readAt: dateInputToISO(today) });
    } else {
      setReadDate('');
      await onUpdate(item._id, { readAt: null });
    }
  };

  const updateWatchedDate = async (value) => {
    setWatchedDate(value);
    if (value) {
      await onUpdate(item._id, { watchedAt: dateInputToISO(value) });
    }
  };

  const updateReadDate = async (value) => {
    setReadDate(value);
    if (value) {
      await onUpdate(item._id, { readAt: dateInputToISO(value) });
    }
  };

  const trackingFields = tracking === 'watch' && (
    <div className="item-tracking">
      <label className="item-tracking-toggle">
        <input
          type="checkbox"
          checked={!!item.watchedAt}
          onChange={(e) => toggleWatched(e.target.checked)}
        />
        Watched
      </label>
      {item.watchedAt && (
        <DatePicker
          value={watchedDate || toDateInputValue(item.watchedAt)}
          onChange={updateWatchedDate}
          label="Watched date"
          placeholder="Watched date"
        />
      )}
    </div>
  );

  const readFields = tracking === 'read' && (
    <div className="item-tracking">
      <label className="item-tracking-toggle">
        <input
          type="checkbox"
          checked={!!item.readAt}
          onChange={(e) => toggleRead(e.target.checked)}
        />
        Read
      </label>
      {item.readAt && (
        <DatePicker
          value={readDate || toDateInputValue(item.readAt)}
          onChange={updateReadDate}
          label="Read date"
          placeholder="Read date"
        />
      )}
    </div>
  );

  if (editing) {
    return (
      <div className="item-row item-row--editing card">
        <input value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes (optional)"
          rows={2}
        />
        {list.pickMode === 'weighted' && (
          <div>
            <label>Weight (1–10)</label>
            <input
              type="number"
              min={1}
              max={10}
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>
        )}
        {tracking === 'watch' && (
          <div>
            <label>Watched date</label>
            <DatePicker
              value={watchedDate}
              onChange={setWatchedDate}
              label="Watched date"
              placeholder="Not watched"
            />
          </div>
        )}
        {tracking === 'read' && (
          <div>
            <label>Read date</label>
            <DatePicker
              value={readDate}
              onChange={setReadDate}
              label="Read date"
              placeholder="Not read"
            />
          </div>
        )}
        <div className="row">
          <Button size="sm" onClick={handleSave}>
            Save
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`item-row card ${item.excludeFromPool ? 'item-row--excluded' : ''}`}>
      <div className="item-row-main">
        <span className="item-row-title">{item.title}</span>
        <div className="item-row-badges">
          {showWeight && <Badge variant="accent">×{item.weight}</Badge>}
          {inCooldown && <Badge variant="warning">Cooldown</Badge>}
          {item.watchedAt && <Badge variant="success">Watched</Badge>}
          {item.readAt && <Badge variant="success">Read</Badge>}
          {item.excludeFromPool && <Badge>Excluded</Badge>}
        </div>
      </div>

      <p className="item-row-dates">
        Added {formatDate(item.addedAt)}
        {item.watchedAt && ` · Watched ${formatDate(item.watchedAt)}`}
        {item.readAt && ` · Read ${formatDate(item.readAt)}`}
      </p>

      {item.notes && <p className="item-row-notes">{item.notes}</p>}

      {(trackingFields || readFields) && (
        <div className="item-row-tracking">{trackingFields}{readFields}</div>
      )}

      <div className="item-row-actions">
        <label className="item-exclude-toggle">
          <input
            type="checkbox"
            checked={item.excludeFromPool}
            onChange={toggleExclude}
          />
          Exclude
        </label>
        <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
          Edit
        </Button>
        <Button variant="danger" size="sm" onClick={() => onDelete(item._id)}>
          Delete
        </Button>
      </div>
    </div>
  );
}
