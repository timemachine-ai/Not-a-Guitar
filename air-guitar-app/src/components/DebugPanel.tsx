import type { HandData } from '../types';
import './DebugPanel.css';

interface DebugPanelProps {
  visible: boolean;
  handData: HandData;
  currentString: string;
  currentFret: number;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({
  visible,
  handData,
  currentString,
  currentFret
}) => {
  if (!visible) return null;

  const leftX = handData.left?.[8]?.x.toFixed(3) ?? '—';
  const leftY = handData.left?.[8]?.y.toFixed(3) ?? '—';
  const rightX = handData.right?.[8]?.x.toFixed(3) ?? '—';
  const rightY = handData.right?.[8]?.y.toFixed(3) ?? '—';

  return (
    <div className="debug-panel glass">
      <h5>DEBUG</h5>
      <div className="debug-row">
        <span>Left X</span>
        <span className="debug-value">{leftX}</span>
      </div>
      <div className="debug-row">
        <span>Left Y</span>
        <span className="debug-value">{leftY}</span>
      </div>
      <div className="debug-row">
        <span>Right X</span>
        <span className="debug-value">{rightX}</span>
      </div>
      <div className="debug-row">
        <span>Right Y</span>
        <span className="debug-value">{rightY}</span>
      </div>
      <div className="debug-row">
        <span>String</span>
        <span className="debug-value">{currentString || '—'}</span>
      </div>
      <div className="debug-row">
        <span>Fret</span>
        <span className="debug-value">{currentFret >= 0 ? currentFret : '—'}</span>
      </div>
    </div>
  );
};
