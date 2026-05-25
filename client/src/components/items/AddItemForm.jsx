import { useState } from 'react';
import Button from '../ui/Button.jsx';
import './AddItemForm.css';

export default function AddItemForm({ list, onAdd }) {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [weight, setWeight] = useState(1);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setError('');
    setSubmitting(true);

    try {
      const payload = { title: title.trim(), notes: notes.trim() };
      if (list.pickMode === 'weighted') {
        payload.weight = Number(weight);
      }
      await onAdd(payload);
      setTitle('');
      setNotes('');
      setWeight(1);
    } catch (err) {
      const data = err.response?.data;
      if (data?.code === 'UPGRADE_REQUIRED') {
        setError(data.message);
      } else {
        setError(data?.message || 'Failed to add item');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="add-item-form card" onSubmit={handleSubmit}>
      <h3>Add item</h3>
      {error && <p className="field-error">{error}</p>}

      <div>
        <label htmlFor="item-title">Title</label>
        <input
          id="item-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={200}
          placeholder="Item name"
        />
      </div>

      <div>
        <label htmlFor="item-notes">Notes (optional)</label>
        <input
          id="item-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={1000}
        />
      </div>

      {list.pickMode === 'weighted' && (
        <div>
          <label htmlFor="item-weight">Weight (1–10)</label>
          <input
            id="item-weight"
            type="number"
            min={1}
            max={10}
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </div>
      )}

      <Button type="submit" disabled={submitting}>
        {submitting ? 'Adding...' : 'Add item'}
      </Button>
    </form>
  );
}
