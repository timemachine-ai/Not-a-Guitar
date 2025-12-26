import { useRef, useCallback } from 'react';
import * as THREE from 'three';
import type { Config, NormalizedLandmark, ZoneBounds } from '../types';
import { GUITAR_TYPES, FINGER_TIPS } from '../config';

export function useThreeJS() {
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const strings3DRef = useRef<THREE.Mesh[]>([]);
  const stringGlowsRef = useRef<THREE.Mesh[]>([]);
  const frets3DRef = useRef<THREE.Mesh[]>([]);
  const ghostLeftRef = useRef<THREE.Mesh[]>([]);
  const ghostRightRef = useRef<THREE.Mesh[]>([]);
  const fretboardRef = useRef<THREE.Mesh | null>(null);
  const guitarBodyRef = useRef<THREE.Mesh | null>(null);
  const soundHoleRef = useRef<THREE.Mesh | null>(null);
  const animFrameRef = useRef<number>(0);

  const initThree = useCallback((container: HTMLElement) => {
    sceneRef.current = new THREE.Scene();
    sceneRef.current.background = new THREE.Color(0x08080c);
    sceneRef.current.fog = new THREE.Fog(0x08080c, 20, 50);

    cameraRef.current = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );

    rendererRef.current = new THREE.WebGLRenderer({ antialias: true });
    rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    rendererRef.current.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(rendererRef.current.domElement);

    // Lighting
    sceneRef.current.add(new THREE.AmbientLight(0x404060, 0.8));

    const light1 = new THREE.PointLight(0x00d4ff, 0.5, 30);
    light1.position.set(-12, 8, 15);
    sceneRef.current.add(light1);

    const light2 = new THREE.PointLight(0xff0080, 0.5, 30);
    light2.position.set(12, -8, 15);
    sceneRef.current.add(light2);

    const light3 = new THREE.DirectionalLight(0xffffff, 0.3);
    light3.position.set(0, 10, 10);
    sceneRef.current.add(light3);

    // Background grid
    const grid = new THREE.GridHelper(60, 60, 0x1a1a2e, 0x0a0a12);
    grid.rotation.x = Math.PI / 2;
    grid.position.z = -3;
    sceneRef.current.add(grid);

    // Handle resize
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animFrameRef.current);
      rendererRef.current?.dispose();
    };
  }, []);

  const setCameraForMode = useCallback((mode: 'normal' | 'pro') => {
    if (!cameraRef.current) return;
    if (mode === 'pro') {
      cameraRef.current.position.set(0, 0, 18);
      cameraRef.current.lookAt(0, 0, 0);
    } else {
      cameraRef.current.position.set(0, -2, 16);
      cameraRef.current.lookAt(0, 2, 0);
    }
  }, []);

  const createVerticalGuitar = useCallback((numStrings: number, stringColors: number[], frets: number) => {
    if (!sceneRef.current) return;

    const fbWidth = 6, fbLength = 14;

    const fbGeom = new THREE.BoxGeometry(fbWidth, fbLength, 0.25);
    const fbMat = new THREE.MeshPhongMaterial({ color: 0x1a1a1a, emissive: 0x080808 });
    fretboardRef.current = new THREE.Mesh(fbGeom, fbMat);
    fretboardRef.current.position.set(0, 0, -0.15);
    sceneRef.current.add(fretboardRef.current);

    const stringSpacing = fbWidth / (numStrings + 1);

    for (let i = 0; i < numStrings; i++) {
      const x = -fbWidth / 2 + stringSpacing * (i + 1);
      const color = stringColors[i];
      const thickness = 0.022 - i * 0.002;

      const sGeom = new THREE.CylinderGeometry(thickness, thickness, fbLength, 8);
      const sMat = new THREE.MeshPhongMaterial({ color, emissive: color, emissiveIntensity: 0.3 });
      const string = new THREE.Mesh(sGeom, sMat);
      string.position.set(x, 0, 0.1);
      sceneRef.current.add(string);
      strings3DRef.current.push(string);

      const gGeom = new THREE.CylinderGeometry(0.08, 0.08, fbLength, 8);
      const gMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0 });
      const glow = new THREE.Mesh(gGeom, gMat);
      glow.position.copy(string.position);
      sceneRef.current.add(glow);
      stringGlowsRef.current.push(glow);
    }

    const fretSpacing = fbLength / (frets + 1);
    for (let i = 0; i < frets; i++) {
      const y = -fbLength / 2 + fretSpacing * (i + 1);
      const fGeom = new THREE.BoxGeometry(fbWidth - 0.4, 0.06, 0.08);
      const fMat = new THREE.MeshPhongMaterial({ color: 0x888888, emissive: 0x222222 });
      const fret = new THREE.Mesh(fGeom, fMat);
      fret.position.set(0, y, 0.1);
      sceneRef.current.add(fret);
      frets3DRef.current.push(fret);
    }
  }, []);

  const createHorizontalGuitar = useCallback((numStrings: number, stringColors: number[], frets: number) => {
    if (!sceneRef.current) return;

    const neckLength = 16, neckWidth = 5;

    const neckGeom = new THREE.BoxGeometry(neckLength, neckWidth, 0.2);
    const neckMat = new THREE.MeshPhongMaterial({ color: 0x1a1a1a, emissive: 0x080808 });
    fretboardRef.current = new THREE.Mesh(neckGeom, neckMat);
    fretboardRef.current.position.set(-2, 0, -0.12);
    sceneRef.current.add(fretboardRef.current);

    const bodyGeom = new THREE.CircleGeometry(4, 48);
    const bodyMat = new THREE.MeshPhongMaterial({ color: 0x2a2a2a, emissive: 0x0a0a0a });
    guitarBodyRef.current = new THREE.Mesh(bodyGeom, bodyMat);
    guitarBodyRef.current.position.set(neckLength / 2 + 1.5, 0, -0.08);
    sceneRef.current.add(guitarBodyRef.current);

    const holeGeom = new THREE.RingGeometry(1.0, 1.3, 48);
    const holeMat = new THREE.MeshBasicMaterial({ color: 0x050505, side: THREE.DoubleSide });
    soundHoleRef.current = new THREE.Mesh(holeGeom, holeMat);
    soundHoleRef.current.position.set(neckLength / 2 + 1.5, 0, 0.01);
    sceneRef.current.add(soundHoleRef.current);

    const stringSpacing = neckWidth / (numStrings + 1);
    const stringLength = neckLength + 8;

    for (let i = 0; i < numStrings; i++) {
      const y = neckWidth / 2 - stringSpacing * (i + 1);
      const color = stringColors[i];
      const thickness = 0.022 - i * 0.002;

      const sGeom = new THREE.CylinderGeometry(thickness, thickness, stringLength, 8);
      const sMat = new THREE.MeshPhongMaterial({ color, emissive: color, emissiveIntensity: 0.3 });
      const string = new THREE.Mesh(sGeom, sMat);
      string.rotation.z = Math.PI / 2;
      string.position.set(2, y, 0.1);
      sceneRef.current.add(string);
      strings3DRef.current.push(string);

      const gGeom = new THREE.CylinderGeometry(0.08, 0.08, stringLength, 8);
      const gMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0 });
      const glow = new THREE.Mesh(gGeom, gMat);
      glow.rotation.z = Math.PI / 2;
      glow.position.copy(string.position);
      sceneRef.current.add(glow);
      stringGlowsRef.current.push(glow);
    }

    const fretSpacing = neckLength / (frets + 1);
    for (let i = 0; i < frets; i++) {
      const x = -neckLength / 2 - 2 + fretSpacing * (i + 1);
      const fGeom = new THREE.BoxGeometry(0.06, neckWidth - 0.3, 0.08);
      const fMat = new THREE.MeshPhongMaterial({ color: 0x888888, emissive: 0x222222 });
      const fret = new THREE.Mesh(fGeom, fMat);
      fret.position.set(x, 0, 0.1);
      sceneRef.current.add(fret);
      frets3DRef.current.push(fret);
    }
  }, []);

  const createGuitar = useCallback((config: Config, _currentTuning?: unknown) => {
    if (!sceneRef.current) return;

    // Clean up existing
    [fretboardRef.current, guitarBodyRef.current, soundHoleRef.current].forEach(obj => {
      if (obj) sceneRef.current?.remove(obj);
    });
    strings3DRef.current.forEach(s => sceneRef.current?.remove(s));
    stringGlowsRef.current.forEach(g => sceneRef.current?.remove(g));
    frets3DRef.current.forEach(f => sceneRef.current?.remove(f));

    strings3DRef.current = [];
    stringGlowsRef.current = [];
    frets3DRef.current = [];
    fretboardRef.current = null;
    guitarBodyRef.current = null;
    soundHoleRef.current = null;

    const gc = GUITAR_TYPES[config.guitarType];
    const numStrings = gc.strings;

    if (config.mode === 'pro') {
      createHorizontalGuitar(numStrings, config.stringColors, config.frets);
    } else {
      createVerticalGuitar(numStrings, config.stringColors, config.frets);
    }

    setCameraForMode(config.mode);
  }, [createVerticalGuitar, createHorizontalGuitar, setCameraForMode]);

  const createGhostHands = useCallback(() => {
    if (!sceneRef.current) return;

    ghostLeftRef.current.forEach(s => sceneRef.current?.remove(s));
    ghostRightRef.current.forEach(s => sceneRef.current?.remove(s));
    ghostLeftRef.current = [];
    ghostRightRef.current = [];

    for (let i = 0; i < 21; i++) {
      const isTip = FINGER_TIPS.includes(i);
      const size = isTip ? 0.14 : 0.07;

      const leftGeom = new THREE.SphereGeometry(size, 12, 12);
      const leftMat = new THREE.MeshBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.7 });
      const left = new THREE.Mesh(leftGeom, leftMat);
      left.visible = false;
      sceneRef.current.add(left);
      ghostLeftRef.current.push(left);

      const rightGeom = new THREE.SphereGeometry(size, 12, 12);
      const rightMat = new THREE.MeshBasicMaterial({ color: 0xff0080, transparent: true, opacity: 0.7 });
      const right = new THREE.Mesh(rightGeom, rightMat);
      right.visible = false;
      sceneRef.current.add(right);
      ghostRightRef.current.push(right);
    }
  }, []);

  const updateGhostHands = useCallback((
    landmarks: NormalizedLandmark[],
    isLeft: boolean,
    config: Config,
    bounds: ZoneBounds
  ) => {
    const ghosts = isLeft ? ghostLeftRef.current : ghostRightRef.current;

    landmarks.forEach((lm, i) => {
      let nx = (lm.x - bounds.left) / (bounds.right - bounds.left);
      let ny = (lm.y - bounds.top) / (bounds.bottom - bounds.top);
      nx = Math.max(0, Math.min(1, nx));
      ny = Math.max(0, Math.min(1, ny));

      let x: number, y: number, z: number;

      if (config.mode === 'pro') {
        x = (nx - 0.5) * 22;
        y = (0.5 - ny) * 8;
        z = (0.3 - lm.z) * 6 + 2;
      } else {
        x = (nx - 0.5) * 12;
        y = (0.5 - ny) * 16;
        z = (0.3 - lm.z) * 6 + 2;
      }

      if (config.mirrorCamera) x = -x;

      ghosts[i].position.set(x, y, Math.max(0.5, z));
      ghosts[i].visible = config.showGhostHands;
    });
  }, []);

  const hideGhostHands = useCallback(() => {
    ghostLeftRef.current.forEach(s => s.visible = false);
    ghostRightRef.current.forEach(s => s.visible = false);
  }, []);

  const triggerStringGlow = useCallback((idx: number) => {
    if (stringGlowsRef.current[idx]) {
      (stringGlowsRef.current[idx].material as THREE.MeshBasicMaterial).opacity = 1;
      (strings3DRef.current[idx].material as THREE.MeshPhongMaterial).emissiveIntensity = 1;
    }
  }, []);

  const animate = useCallback(() => {
    if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;

    // Fade string glows
    stringGlowsRef.current.forEach((g, i) => {
      const mat = g.material as THREE.MeshBasicMaterial;
      if (mat.opacity > 0) {
        mat.opacity -= 0.03;
        (strings3DRef.current[i].material as THREE.MeshPhongMaterial).emissiveIntensity =
          0.3 + mat.opacity * 0.7;
      }
    });

    // Subtle camera sway
    const t = Date.now() * 0.0002;
    cameraRef.current.position.x += Math.sin(t) * 0.0008;

    rendererRef.current.render(sceneRef.current, cameraRef.current);
    animFrameRef.current = requestAnimationFrame(animate);
  }, []);

  const getNumStrings = useCallback(() => strings3DRef.current.length, []);

  return {
    initThree,
    createGuitar,
    createGhostHands,
    updateGhostHands,
    hideGhostHands,
    triggerStringGlow,
    animate,
    getNumStrings,
    setCameraForMode
  };
}
