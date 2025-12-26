import type { Config, GuitarTypeConfig, GuitarType } from '../types';

export const DEFAULT_CONFIG: Config = {
  mode: 'normal',
  guitarType: 'acoustic',
  strings: 6,
  frets: 12,

  zoneSize: 0.70,
  zoneXOffset: 0.00,
  zoneYOffset: 0.10,

  stringDetectionWidth: 0.14,
  strumSensitivity: 0.012,

  volume: 0.8,
  reverb: 0.25,
  distortion: false,
  sustain: true,

  mirrorCamera: true,
  showGhostHands: true,
  showDebug: true,
  showTuner: false,

  // String colors: index 0 = LOW E (thickest), index 5 = HIGH E (thinnest)
  stringColors: [
    0xaa00ff, // E2 (low) - Purple
    0x00ffff, // A2 - Cyan
    0x00ff88, // D3 - Green
    0xffff00, // G3 - Yellow
    0xff6600, // B3 - Orange
    0xff0066  // E4 (high) - Pink
  ],

  tuning: {
    standard: [
      { note: 'E2', freq: 82.41 },
      { note: 'A2', freq: 110.00 },
      { note: 'D3', freq: 146.83 },
      { note: 'G3', freq: 196.00 },
      { note: 'B3', freq: 246.94 },
      { note: 'E4', freq: 329.63 }
    ],
    bass: [
      { note: 'E1', freq: 41.20 },
      { note: 'A1', freq: 55.00 },
      { note: 'D2', freq: 73.42 },
      { note: 'G2', freq: 98.00 }
    ]
  }
};

export const GUITAR_TYPES: Record<GuitarType, GuitarTypeConfig> = {
  acoustic: {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.005, decay: 0.4, sustain: 0.3, release: 1.5 },
    filterFreq: 2000,
    strings: 6,
    tuning: 'standard'
  },
  electric: {
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.001, decay: 0.2, sustain: 0.5, release: 0.8 },
    filterFreq: 4000,
    strings: 6,
    tuning: 'standard'
  },
  classical: {
    oscillator: { type: 'sine' },
    envelope: { attack: 0.01, decay: 0.5, sustain: 0.4, release: 2.0 },
    filterFreq: 1500,
    strings: 6,
    tuning: 'standard'
  },
  bass: {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.01, decay: 0.3, sustain: 0.6, release: 1.0 },
    filterFreq: 800,
    strings: 4,
    tuning: 'bass'
  }
};

export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const FINGER_TIPS = [4, 8, 12, 16, 20];

export const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17]
];
