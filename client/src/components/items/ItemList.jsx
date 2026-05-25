import ItemRow from './ItemRow.jsx';

export default function ItemList({ list, onUpdateItem, onDeleteItem }) {
  if (!list.items?.length) {
    return (
      <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>
        No items yet. Add your first item below.
      </p>
    );
  }

  return (
    <div className="stack">
      {list.items.map((item) => (
        <ItemRow
          key={item._id}
          list={list}
          item={item}
          onUpdate={onUpdateItem}
          onDelete={onDeleteItem}
        />
      ))}
    </div>
  );
}
