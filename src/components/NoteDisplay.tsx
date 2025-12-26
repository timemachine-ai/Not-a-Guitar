import React, { useState, useEffect } from 'react';
import './NoteDisplay.css';

interface NoteDisplayProps {
  note: string;
}

export const NoteDisplay: React.FC<NoteDisplayProps> = ({ note }) => {
  const [isActive, setIsActive] = useState(false);
  const [displayNote, setDisplayNote] = useState('');

  useEffect(() => {
    if (note) {
      setDisplayNote(note);
      setIsActive(true);
      const timer = setTimeout(() => setIsActive(false), 300);
      return () => clearTimeout(timer);
    }
  }, [note]);

  return (
    <div className="note-display">
      <div className={`note-badge glass ${isActive ? 'active' : ''}`}>
        {displayNote}
      </div>
    </div>
  );
};
