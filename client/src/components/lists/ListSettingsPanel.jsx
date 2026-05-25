import { useState } from 'react';
import Button from '../ui/Button.jsx';
import { CATEGORIES, PICK_MODES, CATEGORY_LABELS, PICK_MODE_LABELS } from '../../utils/labels.js';
import './ListSettingsPanel.css';

export default function ListSettingsPanel({ list, onUpdate }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(list.title);
  const [description, setDescription] = useState(list.description || '');
  const [category, setCategory] = useState(list.category);
  const [pickMode, setPickMode] = useState(list.pickMode);
  const [cooldownDays, setCooldownDays] = useState(list.cooldownDays || 7);
  const [isPublic, setIsPublic] = useState(list.isPublic || false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      await onUpdate({
        title,
        description,
        category,
        pickMode,
        cooldownDays: Number(cooldownDays),
        isPublic,
      });
      setOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-panel card">
      <button
        type="button"
        className="settings-panel-toggle"
        onClick={() => setOpen(!open)}
      >
        List settings {open ? '▲' : '▼'}
      </button>

      {open && (
        <form className="settings-panel-form stack" onSubmit={handleSave}>
          {error && <p className="field-error">{error}</p>}

          <div>
            <label htmlFor="settings-title">Title</label>
            <input
              id="settings-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>

          <div>
            <label htmlFor="settings-desc">Description</label>
            <textarea
              id="settings-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={3}
            />
          </div>

          <div>
            <label htmlFor="settings-category">Category</label>
            <select
              id="settings-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="settings-pick-mode">Pick mode</label>
            <select
              id="settings-pick-mode"
              value={pickMode}
              onChange={(e) => setPickMode(e.target.value)}
            >
              {PICK_MODES.map((m) => (
                <option key={m} value={m}>
                  {PICK_MODE_LABELS[m]}
                </option>
              ))}
            </select>
          </div>

          {pickMode === 'cooldown' && (
            <div>
              <label htmlFor="settings-cooldown">Cooldown (days)</label>
              <input
                id="settings-cooldown"
                type="number"
                min={1}
                value={cooldownDays}
                onChange={(e) => setCooldownDays(e.target.value)}
              />
            </div>
          )}

          <label className="settings-checkbox">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
            Make list public (others can clone on Explore)
          </label>

          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save settings'}
          </Button>
        </form>
      )}
    </div>
  );
}
