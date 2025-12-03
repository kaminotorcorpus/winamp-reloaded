import React, { useRef, useEffect, useCallback } from 'react';
import { useAudioStore } from '@/stores/audioStore';

interface OscilloscopeProps {
  getAnalyserData: () => Uint8Array;
}

export const Oscilloscope: React.FC<OscilloscopeProps> = ({ getAnalyserData }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const { isPlaying } = useAudioStore();

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = 'hsl(200, 80%, 8%)';
    ctx.fillRect(0, 0, width, height);

    // Draw grid lines
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
    
    if (dataArray.length === 0 || !isPlaying) {
      // Draw flat line when not playing
      ctx.strokeStyle = 'hsl(180, 100%, 50%)';
      ctx.lineWidth = 2;
      ctx.shadowColor = 'hsl(180, 100%, 50%)';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
      
      animationRef.current = requestAnimationFrame(draw);
      return;
    }

    // Draw waveform
    ctx.strokeStyle = 'hsl(180, 100%, 50%)';
    ctx.lineWidth = 2;
    ctx.shadowColor = 'hsl(180, 100%, 50%)';
    ctx.shadowBlur = 8;
    ctx.beginPath();

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

    ctx.stroke();
    ctx.shadowBlur = 0;

    animationRef.current = requestAnimationFrame(draw);
  }, [getAnalyserData, isPlaying]);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      width={150}
      height={32}
      className="winamp-lcd rounded-sm"
    />
  );
};
