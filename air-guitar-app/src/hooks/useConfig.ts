import { useState, useCallback } from 'react';
import type { Config, Mode, GuitarType, TuningNote } from '../types';
import { DEFAULT_CONFIG, GUITAR_TYPES } from '../config';

export function useConfig() {
  const [config, setConfig] = useState<Config>({ ...DEFAULT_CONFIG });
  const [currentTuning, setCurrentTuning] = useState<TuningNote[]>([...DEFAULT_CONFIG.tuning.standard]);

  const updateConfig = useCallback(<K extends keyof Config>(key: K, value: Config[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  }, []);

  const setMode = useCallback((mode: Mode) => {
    updateConfig('mode', mode);
  }, [updateConfig]);

  const setGuitarType = useCallback((guitarType: GuitarType) => {
    updateConfig('guitarType', guitarType);
    const gc = GUITAR_TYPES[guitarType];
    setCurrentTuning([...DEFAULT_CONFIG.tuning[gc.tuning]]);
  }, [updateConfig]);

  const updateTuning = useCallback((index: number, freq: number) => {
    setCurrentTuning(prev => {
      const newTuning = [...prev];
      newTuning[index] = { ...newTuning[index], freq };
      return newTuning;
    });
  }, []);

  const resetDefaults = useCallback(() => {
    setConfig({ ...DEFAULT_CONFIG });
    const gc = GUITAR_TYPES[DEFAULT_CONFIG.guitarType];
    setCurrentTuning([...DEFAULT_CONFIG.tuning[gc.tuning]]);
  }, []);

  const getZoneBounds = useCallback(() => {
    const margin = (1 - config.zoneSize) / 2;
    return {
      left: margin + config.zoneXOffset,
      right: 1 - margin + config.zoneXOffset,
      top: config.zoneYOffset,
      bottom: config.zoneYOffset + config.zoneSize
    };
  }, [config.zoneSize, config.zoneXOffset, config.zoneYOffset]);

  return {
    config,
    currentTuning,
    updateConfig,
    setMode,
    setGuitarType,
    updateTuning,
    resetDefaults,
    getZoneBounds
  };
}
