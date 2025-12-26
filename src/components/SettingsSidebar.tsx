import type { Config } from '../types';
import './SettingsSidebar.css';

interface SettingsSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  config: Config;
  onConfigChange: <K extends keyof Config>(key: K, value: Config[K]) => void;
  onReset: () => void;
}

export const SettingsSidebar: React.FC<SettingsSidebarProps> = ({
  isOpen,
  onToggle,
  config,
  onConfigChange,
  onReset
}) => {
  return (
    <>
      <button className="settings-toggle glass" onClick={onToggle}>
        <svg viewBox="0 0 24 24">
          <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
        </svg>
      </button>

      <div className={`settings-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="settings-section">
          <h3>Zone Calibration</h3>
          <div className="setting-row">
            <div className="setting-label">
              <span>Zone Size</span>
              <span className="setting-value">{Math.round(config.zoneSize * 100)}%</span>
            </div>
            <input
              type="range"
              min="30"
              max="100"
              step="5"
              value={config.zoneSize * 100}
              onChange={(e) => onConfigChange('zoneSize', parseInt(e.target.value) / 100)}
            />
          </div>
          <div className="setting-row">
            <div className="setting-label">
              <span>Zone X Offset</span>
              <span className="setting-value">{Math.round(config.zoneXOffset * 100)}%</span>
            </div>
            <input
              type="range"
              min="-30"
              max="30"
              step="2"
              value={config.zoneXOffset * 100}
              onChange={(e) => onConfigChange('zoneXOffset', parseInt(e.target.value) / 100)}
            />
          </div>
          <div className="setting-row">
            <div className="setting-label">
              <span>Zone Y Offset</span>
              <span className="setting-value">{Math.round(config.zoneYOffset * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              step="2"
              value={config.zoneYOffset * 100}
              onChange={(e) => onConfigChange('zoneYOffset', parseInt(e.target.value) / 100)}
            />
          </div>
          <div className="setting-row">
            <div className="setting-label">
              <span>String Width</span>
              <span className="setting-value">{config.stringDetectionWidth.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.08"
              max="0.25"
              step="0.01"
              value={config.stringDetectionWidth}
              onChange={(e) => onConfigChange('stringDetectionWidth', parseFloat(e.target.value))}
            />
          </div>
          <div className="setting-row">
            <div className="setting-label">
              <span>Strum Sensitivity</span>
              <span className="setting-value">{config.strumSensitivity.toFixed(3)}</span>
            </div>
            <input
              type="range"
              min="0.005"
              max="0.03"
              step="0.001"
              value={config.strumSensitivity}
              onChange={(e) => onConfigChange('strumSensitivity', parseFloat(e.target.value))}
            />
          </div>
        </div>

        <div className="settings-section">
          <h3>Audio</h3>
          <div className="setting-row">
            <div className="setting-label">
              <span>Volume</span>
              <span className="setting-value">{Math.round(config.volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={config.volume * 100}
              onChange={(e) => onConfigChange('volume', parseInt(e.target.value) / 100)}
            />
          </div>
          <div className="setting-row">
            <div className="setting-label">
              <span>Reverb</span>
              <span className="setting-value">{Math.round(config.reverb * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={config.reverb * 100}
              onChange={(e) => onConfigChange('reverb', parseInt(e.target.value) / 100)}
            />
          </div>
          <div className="toggle-container">
            <span>Distortion</span>
            <div
              className={`toggle-switch ${config.distortion ? 'active' : ''}`}
              onClick={() => onConfigChange('distortion', !config.distortion)}
            ></div>
          </div>
          <div className="toggle-container">
            <span>Sustain</span>
            <div
              className={`toggle-switch ${config.sustain ? 'active' : ''}`}
              onClick={() => onConfigChange('sustain', !config.sustain)}
            ></div>
          </div>
        </div>

        <div className="settings-section">
          <h3>Display</h3>
          <div className="toggle-container">
            <span>Mirror Camera</span>
            <div
              className={`toggle-switch ${config.mirrorCamera ? 'active' : ''}`}
              onClick={() => onConfigChange('mirrorCamera', !config.mirrorCamera)}
            ></div>
          </div>
          <div className="toggle-container">
            <span>Ghost Hands</span>
            <div
              className={`toggle-switch ${config.showGhostHands ? 'active' : ''}`}
              onClick={() => onConfigChange('showGhostHands', !config.showGhostHands)}
            ></div>
          </div>
          <div className="toggle-container">
            <span>Debug Overlay</span>
            <div
              className={`toggle-switch ${config.showDebug ? 'active' : ''}`}
              onClick={() => onConfigChange('showDebug', !config.showDebug)}
            ></div>
          </div>
          <div className="toggle-container">
            <span>Auto Tuner</span>
            <div
              className={`toggle-switch ${config.showTuner ? 'active' : ''}`}
              onClick={() => onConfigChange('showTuner', !config.showTuner)}
            ></div>
          </div>
        </div>

        <div className="settings-section">
          <h3>Tools</h3>
          <button className="btn" onClick={onReset}>Reset to Defaults</button>
        </div>
      </div>
    </>
  );
};
