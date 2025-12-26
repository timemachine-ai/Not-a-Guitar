import { useRef, useCallback, useState } from 'react';
import { Hands } from '@mediapipe/hands';
import type { Results } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import type { Config, HandData, NormalizedLandmark, ZoneBounds } from '../types';
import { FINGER_TIPS, HAND_CONNECTIONS } from '../config';

interface ProcessResult {
  stringIdx: number;
  fret: number;
  note: string;
  velocity: number;
}

export function useHandTracking() {
  const [cameraReady, setCameraReady] = useState(false);
  const [leftHandActive, setLeftHandActive] = useState(false);
  const [rightHandActive, setRightHandActive] = useState(false);

  const handsRef = useRef<Hands | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const debugCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const rawHandDataRef = useRef<HandData>({ left: null, right: null });
  const frettedNotesRef = useRef<Record<number, number>>({});
  const lastStrumPosRef = useRef<Record<number, number | undefined>>({});
  const strumCooldownRef = useRef<Record<number, boolean>>({});

  const initMediaPipe = useCallback(async (
    video: HTMLVideoElement,
    debugCanvas: HTMLCanvasElement,
    onResults: (results: Results) => void
  ) => {
    videoRef.current = video;
    debugCtxRef.current = debugCanvas.getContext('2d');

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480 }
    });
    video.srcObject = stream;
    await new Promise<void>(r => { video.onloadedmetadata = () => r(); });

    debugCanvas.width = 300;
    debugCanvas.height = 225;

    setCameraReady(true);

    handsRef.current = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });

    handsRef.current.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.5
    });

    handsRef.current.onResults(onResults);

    const camera = new Camera(video, {
      onFrame: async () => {
        if (handsRef.current) {
          await handsRef.current.send({ image: video });
        }
      },
      width: 640,
      height: 480
    });

    camera.start();
  }, []);

  const processResults = useCallback((
    results: Results,
    config: Config,
    _bounds: ZoneBounds,
    _numStrings: number,
    onLeftHand: (landmarks: NormalizedLandmark[]) => void,
    onRightHand: (landmarks: NormalizedLandmark[]) => void
  ) => {
    if (debugCtxRef.current) {
      debugCtxRef.current.clearRect(0, 0, 300, 225);
    }

    setLeftHandActive(false);
    setRightHandActive(false);
    rawHandDataRef.current = { left: null, right: null };

    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
      return;
    }

    results.multiHandLandmarks.forEach((landmarks, i) => {
      const label = results.multiHandedness?.[i]?.label;
      const isUserLeft = config.mirrorCamera ? label === 'Right' : label === 'Left';

      const normalizedLandmarks: NormalizedLandmark[] = landmarks.map(lm => ({
        x: lm.x,
        y: lm.y,
        z: lm.z
      }));

      if (isUserLeft) {
        setLeftHandActive(true);
        rawHandDataRef.current.left = normalizedLandmarks;
        onLeftHand(normalizedLandmarks);
      } else {
        setRightHandActive(true);
        rawHandDataRef.current.right = normalizedLandmarks;
        onRightHand(normalizedLandmarks);
      }
    });
  }, []);

  const drawZones = useCallback((
    config: Config,
    bounds: ZoneBounds,
    numStrings: number,
    tuning: { note: string }[],
    stringColors: number[]
  ) => {
    if (!debugCtxRef.current || !config.showDebug) return;

    const ctx = debugCtxRef.current;
    const w = 300, h = 225;

    const zoneLeft = bounds.left * w;
    const zoneTop = bounds.top * h;
    const zoneWidth = (bounds.right - bounds.left) * w;
    const zoneHeight = (bounds.bottom - bounds.top) * h;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(zoneLeft, zoneTop, zoneWidth, zoneHeight);
    ctx.setLineDash([]);

    if (config.mode === 'pro') {
      const midX = zoneLeft + zoneWidth / 2;

      ctx.fillStyle = 'rgba(0, 212, 255, 0.6)';
      ctx.font = '600 9px Inter';
      ctx.fillText('FRET', zoneLeft + 8, zoneTop + 14);

      ctx.fillStyle = 'rgba(255, 0, 128, 0.6)';
      ctx.fillText('STRUM', midX + 8, zoneTop + 14);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.beginPath();
      ctx.moveTo(midX, zoneTop);
      ctx.lineTo(midX, zoneTop + zoneHeight);
      ctx.stroke();

      const strumZoneTop = zoneTop + 18;
      const strumZoneHeight = zoneHeight - 22;
      const stringSpacing = strumZoneHeight / numStrings;

      for (let i = 0; i < numStrings; i++) {
        const y = strumZoneTop + stringSpacing * (i + 0.5);
        const color = stringColors[i];

        ctx.strokeStyle = '#' + color.toString(16).padStart(6, '0');
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(midX + 5, y);
        ctx.lineTo(zoneLeft + zoneWidth - 5, y);
        ctx.stroke();

        ctx.fillStyle = '#' + color.toString(16).padStart(6, '0');
        ctx.font = '600 8px Inter';
        ctx.fillText(tuning[i]?.note || '', zoneLeft + zoneWidth - 22, y + 3);
      }
    } else {
      const stringSpacing = zoneWidth / numStrings;

      for (let i = 0; i < numStrings; i++) {
        const x = zoneLeft + stringSpacing * (i + 0.5);
        const color = stringColors[i];

        ctx.strokeStyle = '#' + color.toString(16).padStart(6, '0');
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, zoneTop + 12);
        ctx.lineTo(x, zoneTop + zoneHeight - 5);
        ctx.stroke();
      }
    }
  }, []);

  const drawHandLandmarks = useCallback((
    landmarks: NormalizedLandmark[],
    color: string
  ) => {
    if (!debugCtxRef.current) return;

    const ctx = debugCtxRef.current;

    ctx.fillStyle = color;
    landmarks.forEach((lm, i) => {
      const x = lm.x * 300;
      const y = lm.y * 225;
      const isTip = FINGER_TIPS.includes(i);
      const size = isTip ? 5 : 2;

      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;
    HAND_CONNECTIONS.forEach(([a, b]) => {
      ctx.beginPath();
      ctx.moveTo(landmarks[a].x * 300, landmarks[a].y * 225);
      ctx.lineTo(landmarks[b].x * 300, landmarks[b].y * 225);
      ctx.stroke();
    });
    ctx.globalAlpha = 1;
  }, []);

  const normalizeToZone = useCallback((lm: NormalizedLandmark, bounds: ZoneBounds) => {
    return {
      x: (lm.x - bounds.left) / (bounds.right - bounds.left),
      y: (lm.y - bounds.top) / (bounds.bottom - bounds.top),
      z: lm.z
    };
  }, []);

  const processProFretting = useCallback((
    landmarks: NormalizedLandmark[],
    bounds: ZoneBounds,
    numStrings: number,
    frets: number
  ) => {
    frettedNotesRef.current = {};

    FINGER_TIPS.slice(1).forEach(tipIdx => { // Skip thumb (4)
      const lm = landmarks[tipIdx];
      const norm = normalizeToZone(lm, bounds);

      if (norm.x > 0.5) return;

      const fretNorm = 1 - (norm.x / 0.5);
      const fret = Math.round(fretNorm * frets);

      const stringFloat = norm.y * numStrings;
      const stringIdx = Math.max(0, Math.min(numStrings - 1, Math.floor(stringFloat)));

      if (lm.z < 0.1) {
        frettedNotesRef.current[stringIdx] = Math.max(frettedNotesRef.current[stringIdx] || 0, fret);
      }
    });
  }, [normalizeToZone]);

  const processProStrumming = useCallback((
    landmarks: NormalizedLandmark[],
    bounds: ZoneBounds,
    numStrings: number,
    config: Config,
    onStrum: (stringIdx: number, fret: number, velocity: number) => void
  ): ProcessResult | null => {
    const indexTip = landmarks[8];
    const norm = normalizeToZone(indexTip, bounds);

    if (norm.x < 0.5) return null;

    for (let i = 0; i < numStrings; i++) {
      const stringCenter = (i + 0.5) / numStrings;
      const dist = Math.abs(norm.y - stringCenter);

      if (dist < config.stringDetectionWidth) {
        const lastPos = lastStrumPosRef.current[i];

        if (lastPos !== undefined) {
          const velocity = Math.abs(norm.y - lastPos);

          if (velocity > config.strumSensitivity && !strumCooldownRef.current[i]) {
            const fret = frettedNotesRef.current[i] || 0;

            strumCooldownRef.current[i] = true;
            setTimeout(() => { strumCooldownRef.current[i] = false; }, 120);

            onStrum(i, fret, Math.min(1, velocity * 25));
            lastStrumPosRef.current[i] = norm.y;
            return { stringIdx: i, fret, note: '', velocity: Math.min(1, velocity * 25) };
          }
        }

        lastStrumPosRef.current[i] = norm.y;
      } else {
        lastStrumPosRef.current[i] = undefined;
      }
    }

    return null;
  }, [normalizeToZone]);

  const processNormalFretting = useCallback((
    landmarks: NormalizedLandmark[],
    bounds: ZoneBounds,
    numStrings: number,
    frets: number
  ) => {
    frettedNotesRef.current = {};

    FINGER_TIPS.slice(1).forEach(tipIdx => { // Skip thumb
      const lm = landmarks[tipIdx];
      const norm = normalizeToZone(lm, bounds);

      const stringFloat = norm.x * numStrings;
      const stringIdx = Math.max(0, Math.min(numStrings - 1, Math.floor(stringFloat)));

      const fretNorm = 1 - norm.y;
      const fret = Math.round(fretNorm * frets);

      if (lm.z < 0.1) {
        frettedNotesRef.current[stringIdx] = Math.max(frettedNotesRef.current[stringIdx] || 0, fret);
      }
    });
  }, [normalizeToZone]);

  const processNormalStrumming = useCallback((
    landmarks: NormalizedLandmark[],
    bounds: ZoneBounds,
    numStrings: number,
    config: Config,
    onStrum: (stringIdx: number, fret: number, velocity: number) => void
  ): ProcessResult | null => {
    const indexTip = landmarks[8];
    const norm = normalizeToZone(indexTip, bounds);

    for (let i = 0; i < numStrings; i++) {
      const stringCenter = (i + 0.5) / numStrings;
      const dist = Math.abs(norm.x - stringCenter);

      if (dist < config.stringDetectionWidth) {
        const lastPos = lastStrumPosRef.current[i];

        if (lastPos !== undefined) {
          const velocity = Math.abs(norm.y - lastPos);

          if (velocity > config.strumSensitivity && !strumCooldownRef.current[i]) {
            const fret = frettedNotesRef.current[i] || 0;

            strumCooldownRef.current[i] = true;
            setTimeout(() => { strumCooldownRef.current[i] = false; }, 120);

            onStrum(i, fret, Math.min(1, velocity * 25));
            lastStrumPosRef.current[i] = norm.y;
            return { stringIdx: i, fret, note: '', velocity: Math.min(1, velocity * 25) };
          }
        }

        lastStrumPosRef.current[i] = norm.y;
      } else {
        lastStrumPosRef.current[i] = undefined;
      }
    }

    return null;
  }, [normalizeToZone]);

  const resetFrettedNotes = useCallback(() => {
    frettedNotesRef.current = {};
  }, []);

  const getRawHandData = useCallback(() => rawHandDataRef.current, []);

  return {
    cameraReady,
    leftHandActive,
    rightHandActive,
    initMediaPipe,
    processResults,
    drawZones,
    drawHandLandmarks,
    processProFretting,
    processProStrumming,
    processNormalFretting,
    processNormalStrumming,
    resetFrettedNotes,
    getRawHandData
  };
}
