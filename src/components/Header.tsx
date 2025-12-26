import type { Mode } from '../types';
import './Header.css';

interface HeaderProps {
  mode: Mode;
  cameraActive: boolean;
  leftHandActive: boolean;
  rightHandActive: boolean;
  audioActive: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  cameraActive,
  leftHandActive,
  rightHandActive,
  audioActive
}) => {
  return (
    <div className="header">
      <div className="header-left">
        <span className="logo">Not a Guitar</span>
        <span className="mode-badge">{mode.toUpperCase()}</span>
      </div>
      <div className="status-bar">
        <div className="status-indicator">
          <span className={`status-dot ${cameraActive ? 'active' : ''}`}></span>
          <span>Cam</span>
        </div>
        <div className="status-indicator">
          <span className={`status-dot ${leftHandActive ? 'active' : ''}`}></span>
          <span>Left</span>
        </div>
        <div className="status-indicator">
          <span className={`status-dot ${rightHandActive ? 'active' : ''}`}></span>
          <span>Right</span>
        </div>
        <div className="status-indicator">
          <span className={`status-dot ${audioActive ? 'active' : ''}`}></span>
          <span>Audio</span>
        </div>
      </div>
    </div>
  );
};
