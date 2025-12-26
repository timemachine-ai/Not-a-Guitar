import type { Mode } from '../types';
import './ModeSwitcher.css';

interface ModeSwitcherProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
}

export const ModeSwitcher: React.FC<ModeSwitcherProps> = ({ mode, onModeChange }) => {
  return (
    <div className="mode-switcher glass">
      <button
        className={`mode-btn ${mode === 'normal' ? 'active' : ''}`}
        onClick={() => onModeChange('normal')}
      >
        Normal
      </button>
      <button
        className={`mode-btn ${mode === 'pro' ? 'active' : ''}`}
        onClick={() => onModeChange('pro')}
      >
        Pro Mode
      </button>
    </div>
  );
};
