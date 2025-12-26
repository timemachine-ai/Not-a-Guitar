import type { GuitarType } from '../types';
import './GuitarSelector.css';

interface GuitarSelectorProps {
  guitarType: GuitarType;
  onGuitarTypeChange: (type: GuitarType) => void;
}

const GUITAR_TYPES: GuitarType[] = ['acoustic', 'electric', 'classical', 'bass'];

export const GuitarSelector: React.FC<GuitarSelectorProps> = ({
  guitarType,
  onGuitarTypeChange
}) => {
  return (
    <div className="guitar-selector">
      {GUITAR_TYPES.map(type => (
        <button
          key={type}
          className={`guitar-type-btn ${guitarType === type ? 'active' : ''}`}
          onClick={() => onGuitarTypeChange(type)}
        >
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </button>
      ))}
    </div>
  );
};
