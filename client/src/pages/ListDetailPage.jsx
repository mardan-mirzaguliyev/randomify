import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useList } from '../hooks/useLists.js';
import PickButton from '../components/pick/PickButton.jsx';
import PickResult from '../components/pick/PickResult.jsx';
import ItemList from '../components/items/ItemList.jsx';
import AddItemForm from '../components/items/AddItemForm.jsx';
import ListSettingsPanel from '../components/lists/ListSettingsPanel.jsx';
import PickHistory from '../components/pick/PickHistory.jsx';
import ProGate from '../components/ui/ProGate.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import ErrorMessage from '../components/ui/ErrorMessage.jsx';
import Badge from '../components/ui/Badge.jsx';
import { CATEGORY_LABELS, PICK_MODE_LABELS } from '../utils/labels.js';

export default function ListDetailPage() {
  const { id } = useParams();
  const {
    list,
    loading,
    error,
    picking,
    lastPick,
    addItem,
    updateItem,
    deleteItem,
    updateList,
    pick,
    clearLastPick,
    refetch,
  } = useList(id);

  const [animating, setAnimating] = useState(false);
  const [pickError, setPickError] = useState(null);

  const handlePick = async () => {
    setPickError(null);
    setAnimating(true);
    clearLastPick();

    await new Promise((r) => setTimeout(r, 1000));

    try {
      await pick();
    } catch (err) {
      const data = err.response?.data;
      setPickError(data?.message || 'Could not pick an item');
    } finally {
      setAnimating(false);
    }
  };

  if (loading) {
    return (
      <div className="spinner-page">
        <Spinner size="lg" label="Loading list..." />
      </div>
    );
  }

  if (error || !list) {
    return (
      <div className="page">
        <ErrorMessage message={error || 'List not found'} onRetry={refetch} />
        <Link to="/dashboard">← Back to dashboard</Link>
      </div>
    );
  }

  return (
    <div className="page">
      <p>
        <Link to="/dashboard" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          ← Dashboard
        </Link>
      </p>

      <div className="page-header">
        <h1>{list.title}</h1>
        <div className="row">
          <Badge>{CATEGORY_LABELS[list.category]}</Badge>
          <Badge variant="accent">{PICK_MODE_LABELS[list.pickMode]}</Badge>
        </div>
        {list.description && (
          <p style={{ color: 'var(--text-muted)' }}>{list.description}</p>
        )}
      </div>

      <PickButton
        list={list}
        onPick={handlePick}
        picking={picking}
        animating={animating}
      />

      {(pickError || error) && !animating && (
        <ErrorMessage message={pickError || error} />
      )}

      {lastPick && !animating && (
        <PickResult
          picked={lastPick}
          pickMode={list.pickMode}
          onPickAgain={handlePick}
          onDismiss={clearLastPick}
        />
      )}

      <section style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Items</h2>
        <ItemList list={list} onUpdateItem={updateItem} onDeleteItem={deleteItem} />
      </section>

      <AddItemForm list={list} onAdd={addItem} />

      {list.isOwner && (
        <div style={{ marginTop: '1.5rem' }}>
          <ListSettingsPanel list={list} onUpdate={updateList} />
        </div>
      )}

      <section style={{ marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Pick history</h2>
        <ProGate
          feature="See your last 50 picks and track what you've chosen over time."
          from="pick_history"
        >
          <div className="card">
            <PickHistory listId={list._id} />
          </div>
        </ProGate>
      </section>
    </div>
  );
}
