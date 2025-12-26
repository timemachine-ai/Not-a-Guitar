import { useRef, useState, useCallback } from 'react';
import { NOTES } from '../config';

export interface TunerData {
  note: string;
  octave: number;
  freq: number;
  cents: number;
}

export function useAutoTuner() {
  const [tunerRunning, setTunerRunning] = useState(false);
  const [tunerData, setTunerData] = useState<TunerData | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const dataArrayRef = useRef<Float32Array<ArrayBuffer> | null>(null);
  const animFrameRef = useRef<number>(0);

  const detectPitchACF = useCallback((buffer: Float32Array<ArrayBuffer>, sampleRate: number): number => {
    // Check RMS
    let rms = 0;
    for (let i = 0; i < buffer.length; i++) rms += buffer[i] * buffer[i];
    rms = Math.sqrt(rms / buffer.length);
    if (rms < 0.01) return -1;

    // Autocorrelation
    const size = buffer.length;
    const halfSize = Math.floor(size / 2);
    let bestLag = -1;
    let bestCorr = 0;

    // Search in frequency range ~50Hz to ~1000Hz
    const minLag = Math.floor(sampleRate / 1000);
    const maxLag = Math.floor(sampleRate / 50);

    for (let lag = minLag; lag < Math.min(maxLag, halfSize); lag++) {
      let corr = 0;
      let norm1 = 0;
      let norm2 = 0;

      for (let i = 0; i < halfSize; i++) {
        corr += buffer[i] * buffer[i + lag];
        norm1 += buffer[i] * buffer[i];
        norm2 += buffer[i + lag] * buffer[i + lag];
      }

      // Normalized correlation
      const normCorr = corr / Math.sqrt(norm1 * norm2 + 0.0001);

      if (normCorr > bestCorr && normCorr > 0.5) {
        bestCorr = normCorr;
        bestLag = lag;
      }
    }

    if (bestLag === -1) return -1;

    // Parabolic interpolation for better accuracy
    if (bestLag > 0 && bestLag < halfSize - 1) {
      const getCorrelation = (lag: number) => {
        let corr = 0;
        for (let i = 0; i < halfSize; i++) {
          corr += buffer[i] * buffer[i + lag];
        }
        return corr;
      };

      const y0 = getCorrelation(bestLag - 1);
      const y1 = getCorrelation(bestLag);
      const y2 = getCorrelation(bestLag + 1);
      const shift = (y2 - y0) / (2 * (2 * y1 - y0 - y2));
      bestLag += shift;
    }

    return sampleRate / bestLag;
  }, []);

  const freqToNote = useCallback((freq: number): TunerData => {
    const A4 = 440;
    const semitones = 12 * Math.log2(freq / A4);
    const rounded = Math.round(semitones);
    const cents = (semitones - rounded) * 100;

    const noteIdx = ((rounded % 12) + 12 + 9) % 12;
    const octave = Math.floor((rounded + 9) / 12) + 4;

    return { note: NOTES[noteIdx], octave, cents, freq };
  }, []);

  const runTuner = useCallback(() => {
    if (!analyserRef.current || !dataArrayRef.current || !audioCtxRef.current) return;

    analyserRef.current.getFloatTimeDomainData(dataArrayRef.current);
    const freq = detectPitchACF(dataArrayRef.current, audioCtxRef.current.sampleRate);

    if (freq > 50 && freq < 1000) {
      const info = freqToNote(freq);
      setTunerData(info);
    }

    animFrameRef.current = requestAnimationFrame(runTuner);
  }, [detectPitchACF, freqToNote]);

  const startTuner = useCallback(async () => {
    try {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioCtxRef.current.createAnalyser();
      analyserRef.current.fftSize = 8192;
      analyserRef.current.smoothingTimeConstant = 0.8;

      dataArrayRef.current = new Float32Array(analyserRef.current.fftSize);

      micStreamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        }
      });

      const source = audioCtxRef.current.createMediaStreamSource(micStreamRef.current);
      source.connect(analyserRef.current);

      setTunerRunning(true);
      runTuner();
    } catch (e) {
      console.error('Tuner error:', e);
    }
  }, [runTuner]);

  const stopTuner = useCallback(() => {
    setTunerRunning(false);
    cancelAnimationFrame(animFrameRef.current);

    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(t => t.stop());
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close();
    }

    setTunerData(null);
  }, []);

  const toggleTuner = useCallback(() => {
    if (tunerRunning) {
      stopTuner();
    } else {
      startTuner();
    }
  }, [tunerRunning, startTuner, stopTuner]);

  return {
    tunerRunning,
    tunerData,
    startTuner,
    stopTuner,
    toggleTuner
  };
}
