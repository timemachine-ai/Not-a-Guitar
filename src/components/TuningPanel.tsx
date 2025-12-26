import { useRef, useCallback } from 'react';
import type { TuningNote } from '../types';
import './TuningPanel.css';

interface TuningPanelProps {
  visible: boolean;
  tuning: TuningNote[];
  onTuningChange: (index: number, freq: number) => void;
}

export const TuningPanel: React.FC<TuningPanelProps> = ({
  visible,
  tuning,
  onTuningChange
}) => {
  const knobStatesRef = useRef<Record<number, { dragging: boolean; startY: number; startRot: number; rot: number }>>({});

  const handleMouseDown = useCallback((e: React.MouseEvent, idx: number) => {
    knobStatesRef.current[idx] = {
      dragging: true,
      startY: e.clientY,
      startRot: knobStatesRef.current[idx]?.rot || 0,
      rot: knobStatesRef.current[idx]?.rot || 0
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const state = knobStatesRef.current[idx];
      if (!state?.dragging) return;

      const dy = state.startY - moveEvent.clientY;
      const newRot = state.startRot + dy * 2;
      state.rot = newRot;

      // Update the knob rotation visually
      const knob = document.querySelector(`[data-knob-idx="${idx}"]`) as HTMLElement;
      if (knob) {
        knob.style.transform = `rotate(${newRot}deg)`;
      }

      // Update frequency
      const cents = dy * 0.5;
      const newFreq = tuning[idx].freq * Math.pow(2, cents / 1200);
      onTuningChange(idx, newFreq);
    };

    const handleMouseUp = () => {
      if (knobStatesRef.current[idx]) {
        knobStatesRef.current[idx].dragging = false;
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [tuning, onTuningChange]);

  if (!visible) return null;

  return (
    <div className="tuning-panel glass">
      <h4>Tuning</h4>
      {tuning.map((t, i) => (
        <div key={i} className="tuning-row">
          <span className="tuning-label">{t.note}</span>
          <div
            className="tuning-knob"
            data-knob-idx={i}
            onMouseDown={(e) => handleMouseDown(e, i)}
          ></div>
          <span className="tuning-freq">{t.freq.toFixed(1)}Hz</span>
        </div>
      ))}
    </div>
  );
};
