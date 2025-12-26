import React from 'react';
import './InstructionsModal.css';

interface InstructionsModalProps {
  visible: boolean;
  onStart: () => void;
}

export const InstructionsModal: React.FC<InstructionsModalProps> = ({ visible, onStart }) => {
  if (!visible) return null;

  return (
    <div className="instructions-modal">
      <div className="modal-content">
        <h2>NOT A GUITAR</h2>
        <p><span className="highlight">Normal Mode</span> — Vertical fretboard, strum with right hand</p>
        <p><span className="highlight">Pro Mode</span> — Horizontal guitar, left hand frets, right hand strums</p>
        <p>Adjust the zone sliders to calibrate for your distance from camera</p>
        <button className="btn primary" onClick={onStart}>Start Playing</button>
      </div>
    </div>
  );
};
