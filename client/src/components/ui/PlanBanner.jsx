import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import './PlanBanner.css';

const MAX_LISTS = 3;
const MAX_ITEMS = 20;

export default function PlanBanner({ lists }) {
  const { isPro } = useAuth();

  if (isPro) return null;

  const listCount = lists.length;
  const maxItemsInList = lists.reduce(
    (max, list) => Math.max(max, list.itemCount || list.items?.length || 0),
    0
  );

  const atListLimit = listCount >= MAX_LISTS;
  const nearListLimit = listCount >= MAX_LISTS - 1;
  const atItemLimit = maxItemsInList >= MAX_ITEMS;
  const nearItemLimit = maxItemsInList >= MAX_ITEMS - 3;

  const showCta = atListLimit || atItemLimit || (nearListLimit && nearItemLimit);

  return (
    <div className={`plan-banner ${showCta ? 'plan-banner--highlight' : ''}`}>
      <span>
        {listCount} of {MAX_LISTS} lists · {maxItemsInList} of {MAX_ITEMS} items in your
        longest list
      </span>
      {showCta && (
        <Link to="/upgrade?from=list_limit" className="plan-banner-cta">
          Upgrade for unlimited →
        </Link>
      )}
    </div>
  );
}
