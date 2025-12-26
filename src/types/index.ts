import * as THREE from 'three';

export type Mode = 'normal' | 'pro';
export type GuitarType = 'acoustic' | 'electric' | 'classical' | 'bass';
export type TuningType = 'standard' | 'bass';

export interface TuningNote {
  note: string;
  freq: number;
}

export interface GuitarTypeConfig {
  oscillator: { type: OscillatorType };
  envelope: {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
  };
  filterFreq: number;
  strings: number;
  tuning: TuningType;
}

export interface Config {
  mode: Mode;
  guitarType: GuitarType;
  strings: number;
  frets: number;

  zoneSize: number;
  zoneXOffset: number;
  zoneYOffset: number;

  stringDetectionWidth: number;
  strumSensitivity: number;

  volume: number;
  reverb: number;
  distortion: boolean;
  sustain: boolean;

  mirrorCamera: boolean;
  showGhostHands: boolean;
  showDebug: boolean;
  showTuner: boolean;

  stringColors: number[];
  tuning: {
    standard: TuningNote[];
    bass: TuningNote[];
  };
}

export interface ZoneBounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export interface HandData {
  left: NormalizedLandmark[] | null;
  right: NormalizedLandmark[] | null;
}

export interface NormalizedLandmark {
  x: number;
  y: number;
  z: number;
}

export interface ThreeJSRefs {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  strings3D: THREE.Mesh[];
  stringGlows: THREE.Mesh[];
  frets3D: THREE.Mesh[];
  ghostLeft: THREE.Mesh[];
  ghostRight: THREE.Mesh[];
  fretboard: THREE.Mesh | null;
  guitarBody: THREE.Mesh | null;
  soundHole: THREE.Mesh | null;
}

export interface AudioRefs {
  synth: any;
  reverb: any;
  distortion: any;
  filter: any;
  ready: boolean;
}
