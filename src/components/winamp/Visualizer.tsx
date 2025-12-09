import React, { useRef, useEffect, useCallback } from 'react';
import { useAudioStore } from '@/stores/audioStore';

interface VisualizerProps {
  getAnalyserData: () => Uint8Array;
}

export const Visualizer: React.FC<VisualizerProps> = ({ getAnalyserData }) => {
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
    const centerX = width / 2;
    const centerY = height / 2;

    // Clear with transparency
    ctx.clearRect(0, 0, width, height);

    // Get audio data
    const dataArray = getAnalyserData();
    
    if (!isPlaying || dataArray.length === 0) {
      // Draw idle state - subtle rings
      for (let i = 0; i < 3; i++) {
        const radius = 40 + i * 30;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(280, 100%, 60%, ${0.1 - i * 0.03})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      
      animationRef.current = requestAnimationFrame(draw);
      return;
    }

    // Create radial visualization
    const bars = 64;
    const barWidth = 3;
    const minRadius = 50;
    const maxBarHeight = 80;

    for (let i = 0; i < bars; i++) {
      const dataIndex = Math.floor((i / bars) * dataArray.length);
      const value = dataArray[dataIndex] / 255;
      const barHeight = value * maxBarHeight + 5;

      const angle = (i / bars) * Math.PI * 2 - Math.PI / 2;
      
      const x1 = centerX + Math.cos(angle) * minRadius;
      const y1 = centerY + Math.sin(angle) * minRadius;
      const x2 = centerX + Math.cos(angle) * (minRadius + barHeight);
      const y2 = centerY + Math.sin(angle) * (minRadius + barHeight);

      // Create gradient for each bar
      const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
      gradient.addColorStop(0, 'hsl(180, 100%, 50%)');
      gradient.addColorStop(0.5, 'hsl(280, 100%, 60%)');
      gradient.addColorStop(1, 'hsl(320, 100%, 55%)');

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = barWidth;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Add glow effect
      ctx.shadowColor = 'hsl(280, 100%, 60%)';
      ctx.shadowBlur = 10;
    }

    // Inner circle
    const avgValue = dataArray.reduce((a, b) => a + b, 0) / dataArray.length / 255;
    const pulseRadius = 40 + avgValue * 15;

    ctx.beginPath();
    ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
    const innerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, pulseRadius);
    innerGradient.addColorStop(0, 'hsla(280, 100%, 60%, 0.3)');
    innerGradient.addColorStop(0.7, 'hsla(280, 100%, 50%, 0.1)');
    innerGradient.addColorStop(1, 'hsla(280, 100%, 40%, 0)');
    ctx.fillStyle = innerGradient;
    ctx.fill();

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
      width={280}
      height={280}
      className="w-full h-full"
    />
  );
};
