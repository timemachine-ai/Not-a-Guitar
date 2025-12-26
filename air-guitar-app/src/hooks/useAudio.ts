import { useRef, useCallback, useState } from 'react';
import * as Tone from 'tone';
import type { Config, TuningNote } from '../types';
import { GUITAR_TYPES, NOTES } from '../config';

export function useAudio() {
  const synthRef = useRef<Tone.PolySynth | null>(null);
  const reverbRef = useRef<Tone.Reverb | null>(null);
  const distortionRef = useRef<Tone.Distortion | null>(null);
  const filterRef = useRef<Tone.Filter | null>(null);
  const [audioReady, setAudioReady] = useState(false);

  const initAudio = useCallback(async () => {
    await Tone.start();
    setAudioReady(true);
  }, []);

  const setupSynth = useCallback((config: Config) => {
    // Dispose existing
    if (synthRef.current) synthRef.current.dispose();
    if (reverbRef.current) reverbRef.current.dispose();
    if (distortionRef.current) distortionRef.current.dispose();
    if (filterRef.current) filterRef.current.dispose();

    const gc = GUITAR_TYPES[config.guitarType];

    synthRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: gc.oscillator,
      envelope: {
        ...gc.envelope,
        release: config.sustain ? gc.envelope.release * 1.5 : gc.envelope.release * 0.4
      }
    });

    filterRef.current = new Tone.Filter(gc.filterFreq, 'lowpass');
    distortionRef.current = new Tone.Distortion({ distortion: 0.5, wet: config.distortion ? 0.4 : 0 });
    reverbRef.current = new Tone.Reverb({ decay: 2, wet: config.reverb });

    synthRef.current.chain(
      filterRef.current,
      distortionRef.current,
      reverbRef.current,
      Tone.getDestination()
    );
    synthRef.current.volume.value = Tone.gainToDb(config.volume);
  }, []);

  const updateVolume = useCallback((volume: number) => {
    if (synthRef.current) {
      synthRef.current.volume.value = Tone.gainToDb(volume);
    }
  }, []);

  const updateReverb = useCallback((reverb: number) => {
    if (reverbRef.current) {
      reverbRef.current.wet.value = reverb;
    }
  }, []);

  const updateDistortion = useCallback((enabled: boolean) => {
    if (distortionRef.current) {
      distortionRef.current.wet.value = enabled ? 0.4 : 0;
    }
  }, []);

  const playNote = useCallback((note: string, velocity: number = 0.8, sustain: boolean = true) => {
    if (!audioReady || !synthRef.current) return;
    synthRef.current.triggerAttackRelease(note, sustain ? '2n' : '8n', undefined, velocity);
  }, [audioReady]);

  const getNoteAtFret = useCallback((tuning: TuningNote[], stringIdx: number, fretNum: number): string => {
    if (!tuning[stringIdx]) return 'C4';

    const base = tuning[stringIdx].note;
    const basePitch = base.slice(0, -1);
    const baseOctave = parseInt(base.slice(-1));
    const baseIdx = NOTES.indexOf(basePitch);

    const newIdx = (baseIdx + fretNum) % 12;
    const octaveUp = Math.floor((baseIdx + fretNum) / 12);

    return NOTES[newIdx] + (baseOctave + octaveUp);
  }, []);

  return {
    audioReady,
    initAudio,
    setupSynth,
    updateVolume,
    updateReverb,
    updateDistortion,
    playNote,
    getNoteAtFret
  };
}
