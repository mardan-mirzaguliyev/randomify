import Button from '../ui/Button.jsx';
import Spinner from '../ui/Spinner.jsx';
import { PICK_MODE_LABELS } from '../../utils/labels.js';
import './PickButton.css';

export default function PickButton({ list, onPick, picking, animating }) {
  return (
    <div className="pick-button-section card">
      <p className="pick-mode-label">
        Mode: <strong>{PICK_MODE_LABELS[list.pickMode]}</strong>
      </p>

      {animating ? (
        <div className="pick-animating">
          <Spinner size="lg" label="Choosing..." />
        </div>
      ) : (
        <Button size="lg" onClick={onPick} disabled={picking} className="pick-main-btn">
          {picking ? 'Picking...' : 'Pick random item'}
        </Button>
      )}
    </div>
  );
}
