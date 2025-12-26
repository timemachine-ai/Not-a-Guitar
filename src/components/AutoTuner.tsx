import type { TunerData } from '../hooks/useAutoTuner';
import './AutoTuner.css';

interface AutoTunerProps {
  visible: boolean;
  running: boolean;
  data: TunerData | null;
  onToggle: () => void;
}

export const AutoTuner: React.FC<AutoTunerProps> = ({
  visible,
  running,
  data,
  onToggle
}) => {
  if (!visible) return null;

  const note = data?.note ?? '—';
  const octave = data?.octave ?? '';
  const freq = data?.freq.toFixed(1) ?? '—';
  const cents = data?.cents ?? 0;
  const centsText = data ? ((cents >= 0 ? '+' : '') + cents.toFixed(0)) : '0';
  const needlePos = 50 + (data?.cents ?? 0);
  const inTune = data && Math.abs(cents) < 5;

  return (
    <div className="auto-tuner glass">
      <h4>Auto Tuner</h4>
      <div className="tuner-display">
        <span className="detected-note">{note}</span>
        <span className="detected-octave">{octave}</span>
        <div className="detected-freq">{freq} Hz</div>
      </div>
      <div className="tuner-meter">
        <div
          className={`tuner-needle ${inTune ? 'in-tune' : ''}`}
          style={{ left: `${Math.max(5, Math.min(95, needlePos))}%` }}
        ></div>
      </div>
      <div
        className="cents-display"
        style={{ color: inTune ? 'var(--accent-green)' : 'var(--text-secondary)' }}
      >
        {centsText} cents
      </div>
      <div className="tuner-status">
        {running ? 'Listening...' : 'Click to start'}
      </div>
      <button className="btn tuner-btn" onClick={onToggle}>
        {running ? 'Stop Tuner' : 'Start Tuner'}
      </button>
    </div>
  );
};
