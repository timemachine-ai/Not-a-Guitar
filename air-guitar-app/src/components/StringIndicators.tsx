import type { TuningNote } from '../types';
import './StringIndicators.css';

interface StringIndicatorsProps {
  tuning: TuningNote[];
  stringColors: number[];
  activeString: number;
}

export const StringIndicators: React.FC<StringIndicatorsProps> = ({
  tuning,
  stringColors,
  activeString
}) => {
  return (
    <div className="string-indicators">
      {tuning.map((t, i) => {
        const color = '#' + stringColors[i].toString(16).padStart(6, '0');
        const isActive = activeString === i;

        return (
          <div
            key={i}
            className={`string-indicator ${isActive ? 'active' : ''}`}
            style={{ color }}
          >
            <div className="string-dot"></div>
            <span className="string-name">{t.note}</span>
          </div>
        );
      })}
    </div>
  );
};
