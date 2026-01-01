import React, { useRef, useEffect, useCallback } from 'react';
import { useAudioStore } from '@/stores/audioStore';

interface OscilloscopeProps {
  getAnalyserData: () => Uint8Array;
}

export const Oscilloscope: React.FC<OscilloscopeProps> = ({ getAnalyserData }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const lastFrameTime = useRef<number>(0);
  const { isPlaying, showVisualizer } = useAudioStore();

  const draw = useCallback((timestamp: number) => {
    // Throttle to ~30 FPS (33ms between frames)
    if (timestamp - lastFrameTime.current < 33) {
      animationRef.current = requestAnimationFrame(draw);
      return;
    }
    lastFrameTime.current = timestamp;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas with LCD background
    ctx.fillStyle = 'hsl(200, 80%, 8%)';
    ctx.fillRect(0, 0, width, height);

    // Draw subtle grid lines
    ctx.strokeStyle = 'hsl(180, 60%, 15%)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const y = (height / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Get audio data
    const dataArray = getAnalyserData();
    
    // Draw waveform line
    ctx.strokeStyle = 'hsl(180, 100%, 50%)';
    ctx.lineWidth = 2;
    ctx.beginPath();

    if (dataArray.length === 0 || !isPlaying) {
      // Flat line when not playing
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
    } else {
      // Draw waveform
      const sliceWidth = width / dataArray.length;
      let x = 0;

      for (let i = 0; i < dataArray.length; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }
    }

    ctx.stroke();

    animationRef.current = requestAnimationFrame(draw);
  }, [getAnalyserData, isPlaying]);

  useEffect(() => {
    if (!showVisualizer) {
      // Don't animate when hidden
      cancelAnimationFrame(animationRef.current);
      return;
    }

    animationRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [draw, showVisualizer]);

  // Don't render if visualization is disabled
  if (!showVisualizer) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      width={150}
      height={32}
      className="winamp-lcd rounded-sm"
    />
  );
};
