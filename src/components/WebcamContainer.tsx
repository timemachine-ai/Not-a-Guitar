import { useRef, forwardRef, useImperativeHandle } from 'react';
import './WebcamContainer.css';

interface WebcamContainerProps {
  mirrored: boolean;
}

export interface WebcamContainerRef {
  getVideo: () => HTMLVideoElement | null;
  getCanvas: () => HTMLCanvasElement | null;
}

export const WebcamContainer = forwardRef<WebcamContainerRef, WebcamContainerProps>(
  ({ mirrored }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useImperativeHandle(ref, () => ({
      getVideo: () => videoRef.current,
      getCanvas: () => canvasRef.current
    }));

    return (
      <div className={`webcam-container glass ${mirrored ? 'mirrored' : ''}`}>
        <span className="webcam-label">Tracking</span>
        <video ref={videoRef} autoPlay playsInline></video>
        <canvas ref={canvasRef} className="debug-canvas"></canvas>
      </div>
    );
  }
);

WebcamContainer.displayName = 'WebcamContainer';
