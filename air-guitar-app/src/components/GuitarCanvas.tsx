import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import './GuitarCanvas.css';

interface GuitarCanvasProps {
  onMount: (container: HTMLElement) => void;
}

export interface GuitarCanvasRef {
  getContainer: () => HTMLDivElement | null;
}

export const GuitarCanvas = forwardRef<GuitarCanvasRef, GuitarCanvasProps>(
  ({ onMount }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      getContainer: () => containerRef.current
    }));

    useEffect(() => {
      if (containerRef.current) {
        onMount(containerRef.current);
      }
    }, [onMount]);

    return <div ref={containerRef} className="canvas-container"></div>;
  }
);

GuitarCanvas.displayName = 'GuitarCanvas';
