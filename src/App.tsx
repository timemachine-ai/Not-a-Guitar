import { useState, useRef, useCallback, useEffect } from 'react';
import type { Results } from '@mediapipe/hands';
import {
  LoadingScreen,
  InstructionsModal,
  Header,
  ModeSwitcher,
  GuitarSelector,
  SettingsSidebar,
  DebugPanel,
  NoteDisplay,
  StringIndicators,
  AutoTuner,
  TuningPanel,
  WebcamContainer,
  GuitarCanvas
} from './components';
import type { WebcamContainerRef } from './components';
import {
  useConfig,
  useAudio,
  useAutoTuner,
  useThreeJS,
  useHandTracking
} from './hooks';
import type { HandData, NormalizedLandmark } from './types';
import './App.css';

function App() {
  // State
  const [loading, setLoading] = useState(true);
  const [loadingText, setLoadingText] = useState('Loading');
  const [showInstructions, setShowInstructions] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState('');
  const [activeString, setActiveString] = useState(-1);
  const [debugHandData, setDebugHandData] = useState<HandData>({ left: null, right: null });
  const [debugString, setDebugString] = useState('');
  const [debugFret, setDebugFret] = useState(-1);

  // Refs
  const webcamRef = useRef<WebcamContainerRef>(null);
  const initCompletedRef = useRef(false);

  // Hooks
  const {
    config,
    currentTuning,
    updateConfig,
    setMode,
    setGuitarType,
    updateTuning,
    resetDefaults,
    getZoneBounds
  } = useConfig();

  const {
    audioReady,
    initAudio,
    setupSynth,
    updateVolume,
    updateReverb,
    updateDistortion,
    playNote,
    getNoteAtFret
  } = useAudio();

  const {
    tunerRunning,
    tunerData,
    toggleTuner,
    stopTuner
  } = useAutoTuner();

  const {
    initThree,
    createGuitar,
    createGhostHands,
    updateGhostHands,
    hideGhostHands,
    triggerStringGlow,
    animate,
    getNumStrings
  } = useThreeJS();

  const {
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
  } = useHandTracking();

  // Handle strum callback
  const handleStrum = useCallback((stringIdx: number, fret: number, velocity: number) => {
    const note = getNoteAtFret(currentTuning, stringIdx, fret);
    playNote(note, velocity, config.sustain);
    setCurrentNote(note);
    setActiveString(stringIdx);
    triggerStringGlow(stringIdx);
    setDebugString(currentTuning[stringIdx]?.note || '');
    setDebugFret(fret);

    setTimeout(() => setActiveString(-1), 200);
  }, [currentTuning, config.sustain, getNoteAtFret, playNote, triggerStringGlow]);

  // Handle hand tracking results
  const handleHandResults = useCallback((results: Results) => {
    const bounds = getZoneBounds();
    const numStrings = getNumStrings();

    // Draw zones on debug canvas
    drawZones(config, bounds, numStrings, currentTuning, config.stringColors);

    processResults(
      results,
      config,
      bounds,
      numStrings,
      // Left hand callback
      (landmarks: NormalizedLandmark[]) => {
        if (config.showGhostHands) {
          updateGhostHands(landmarks, true, config, bounds);
        }
        if (config.showDebug) {
          drawHandLandmarks(landmarks, '#00d4ff');
        }

        // Process fretting
        if (config.mode === 'pro') {
          processProFretting(landmarks, bounds, numStrings, config.frets);
        } else {
          processNormalFretting(landmarks, bounds, numStrings, config.frets);
        }
      },
      // Right hand callback
      (landmarks: NormalizedLandmark[]) => {
        if (config.showGhostHands) {
          updateGhostHands(landmarks, false, config, bounds);
        }
        if (config.showDebug) {
          drawHandLandmarks(landmarks, '#ff0080');
        }

        // Process strumming
        if (config.mode === 'pro') {
          processProStrumming(landmarks, bounds, numStrings, config, handleStrum);
        } else {
          processNormalStrumming(landmarks, bounds, numStrings, config, handleStrum);
        }
      }
    );

    // Update debug data
    setDebugHandData(getRawHandData());

    // Reset fretted notes at end of frame
    resetFrettedNotes();

    // Hide ghost hands if no hands detected
    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
      hideGhostHands();
    }
  }, [
    config,
    currentTuning,
    getZoneBounds,
    getNumStrings,
    drawZones,
    processResults,
    updateGhostHands,
    drawHandLandmarks,
    processProFretting,
    processProStrumming,
    processNormalFretting,
    processNormalStrumming,
    handleStrum,
    getRawHandData,
    resetFrettedNotes,
    hideGhostHands
  ]);

  // Initialize Three.js
  const handleCanvasMount = useCallback((container: HTMLElement) => {
    initThree(container);
    createGuitar(config, currentTuning);
    createGhostHands();
    animate();
  }, [initThree, createGuitar, createGhostHands, animate, config, currentTuning]);

  // Initialize application
  useEffect(() => {
    if (initCompletedRef.current) return;
    initCompletedRef.current = true;

    const init = async () => {
      try {
        setLoadingText('Starting Camera');
        const video = webcamRef.current?.getVideo();
        const canvas = webcamRef.current?.getCanvas();

        if (video && canvas) {
          await initMediaPipe(video, canvas, handleHandResults);
        }

        setLoadingText('Ready');
        setTimeout(() => {
          setLoading(false);
          setShowInstructions(true);
        }, 400);
      } catch (err) {
        console.error(err);
        setLoadingText('Error: ' + (err as Error).message);
      }
    };

    // Wait for webcam ref to be ready
    const checkRef = setInterval(() => {
      if (webcamRef.current?.getVideo()) {
        clearInterval(checkRef);
        init();
      }
    }, 100);

    return () => clearInterval(checkRef);
  }, [initMediaPipe, handleHandResults]);

  // Handle start button click
  const handleStart = useCallback(async () => {
    setShowInstructions(false);
    await initAudio();
    setupSynth(config);
  }, [initAudio, setupSynth, config]);

  // Update synth when guitar type changes
  const handleGuitarTypeChange = useCallback((type: typeof config.guitarType) => {
    setGuitarType(type);
    createGuitar({ ...config, guitarType: type }, currentTuning);
    if (audioReady) {
      setupSynth({ ...config, guitarType: type });
    }
  }, [config, currentTuning, setGuitarType, createGuitar, audioReady, setupSynth]);

  // Update mode
  const handleModeChange = useCallback((mode: typeof config.mode) => {
    setMode(mode);
    createGuitar({ ...config, mode }, currentTuning);
  }, [config, currentTuning, setMode, createGuitar]);

  // Handle config changes
  const handleConfigChange = useCallback(<K extends keyof typeof config>(key: K, value: typeof config[K]) => {
    updateConfig(key, value);

    // Handle specific config changes
    if (key === 'volume' && typeof value === 'number') {
      updateVolume(value);
    } else if (key === 'reverb' && typeof value === 'number') {
      updateReverb(value);
    } else if (key === 'distortion' && typeof value === 'boolean') {
      updateDistortion(value);
    } else if (key === 'sustain' && audioReady) {
      setupSynth({ ...config, [key]: value });
    } else if (key === 'showTuner' && !value) {
      stopTuner();
    }
  }, [config, updateConfig, updateVolume, updateReverb, updateDistortion, audioReady, setupSynth, stopTuner]);

  // Handle reset
  const handleReset = useCallback(() => {
    resetDefaults();
    createGuitar(config, currentTuning);
    if (audioReady) {
      setupSynth(config);
    }
  }, [resetDefaults, config, currentTuning, createGuitar, audioReady, setupSynth]);

  return (
    <>
      <LoadingScreen visible={loading} text={loadingText} />
      <InstructionsModal visible={showInstructions} onStart={handleStart} />

      <GuitarCanvas onMount={handleCanvasMount} />

      <WebcamContainer ref={webcamRef} mirrored={config.mirrorCamera} />

      <Header
        mode={config.mode}
        cameraActive={cameraReady}
        leftHandActive={leftHandActive}
        rightHandActive={rightHandActive}
        audioActive={audioReady}
      />

      <ModeSwitcher mode={config.mode} onModeChange={handleModeChange} />

      <GuitarSelector
        guitarType={config.guitarType}
        onGuitarTypeChange={handleGuitarTypeChange}
      />

      <DebugPanel
        visible={config.showDebug}
        handData={debugHandData}
        currentString={debugString}
        currentFret={debugFret}
      />

      <TuningPanel
        visible={config.mode === 'pro'}
        tuning={currentTuning}
        onTuningChange={updateTuning}
      />

      <AutoTuner
        visible={config.showTuner}
        running={tunerRunning}
        data={tunerData}
        onToggle={toggleTuner}
      />

      <StringIndicators
        tuning={currentTuning}
        stringColors={config.stringColors}
        activeString={activeString}
      />

      <NoteDisplay note={currentNote} />

      <SettingsSidebar
        isOpen={settingsOpen}
        onToggle={() => setSettingsOpen(!settingsOpen)}
        config={config}
        onConfigChange={handleConfigChange}
        onReset={handleReset}
      />
    </>
  );
}

export default App;
