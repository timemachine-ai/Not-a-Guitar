import React from 'react';
import './LoadingScreen.css';

interface LoadingScreenProps {
  visible: boolean;
  text: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ visible, text }) => {
  if (!visible) return null;

  return (
    <div className="loading-screen">
      <div className="loader"></div>
      <div className="loading-text">{text}</div>
    </div>
  );
};
