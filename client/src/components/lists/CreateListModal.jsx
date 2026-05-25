import { useState } from 'react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import { CATEGORIES, PICK_MODES, CATEGORY_LABELS, PICK_MODE_LABELS } from '../../utils/labels.js';

export default function CreateListModal({ isOpen, onClose, onCreate }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('other');
  const [pickMode, setPickMode] = useState('pure_random');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await onCreate({ title, category, pickMode });
      setTitle('');
      setCategory('other');
      setPickMode('pure_random');
      onClose();
    } catch (err) {
      const data = err.response?.data;
      setError(data?.message || 'Failed to create list');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New list">
      <form className="stack" onSubmit={handleSubmit}>
        {error && <p className="field-error">{error}</p>}

        <div>
          <label htmlFor="list-title">Title</label>
          <input
            id="list-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={100}
            placeholder="Friday night movies"
          />
        </div>

        <div>
          <label htmlFor="list-category">Category</label>
          <select
            id="list-category"
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
          <label htmlFor="list-pick-mode">Pick mode</label>
          <select
            id="list-pick-mode"
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

        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create list'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
