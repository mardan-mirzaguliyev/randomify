import { useState } from 'react';
import { useLists } from '../hooks/useLists.js';
import ListCard from '../components/lists/ListCard.jsx';
import CreateListModal from '../components/lists/CreateListModal.jsx';
import PlanBanner from '../components/ui/PlanBanner.jsx';
import Button from '../components/ui/Button.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import ErrorMessage from '../components/ui/ErrorMessage.jsx';

export default function DashboardPage() {
  const { lists, loading, error, createList, deleteList, refetch } = useLists();
  const [modalOpen, setModalOpen] = useState(false);

  const handleDelete = async (listId) => {
    if (!window.confirm('Delete this list and all its history?')) return;
    await deleteList(listId);
  };

  return (
    <div className="page">
      <div className="page-header row" style={{ justifyContent: 'space-between' }}>
        <div>
          <h1>Your lists</h1>
          <p>Create lists and let Randomify choose for you.</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>New list</Button>
      </div>

      <PlanBanner lists={lists} />

      {loading && (
        <div className="spinner-page">
          <Spinner label="Loading lists..." />
        </div>
      )}

      {error && <ErrorMessage message={error} onRetry={refetch} />}

      {!loading && !error && (
        <>
          {lists.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
              <p style={{ color: 'var(--text-muted)', margin: '0 0 1rem' }}>
                No lists yet. Create your first list to get started.
              </p>
              <Button onClick={() => setModalOpen(true)}>Create a list</Button>
            </div>
          ) : (
            <div className="grid">
              {lists.map((list) => (
                <ListCard key={list._id} list={list} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </>
      )}

      <CreateListModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={createList}
      />
    </div>
  );
}
