import React, { useRef, useEffect, useCallback } from 'react';
import { useAudioStore } from '@/stores/audioStore';

interface VisualizerProps {
  getAnalyserData: () => Uint8Array;
}

export const Visualizer: React.FC<VisualizerProps> = ({ getAnalyserData }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const peaksRef = useRef<number[]>([]);
  const { isPlaying } = useAudioStore();

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear with transparency
    ctx.clearRect(0, 0, width, height);

    // Get audio data
    const dataArray = getAnalyserData();
    
    // Number of bars
    const bars = 64;
    const barWidth = (width / bars) - 2;
    const barSpacing = 2;

    // Initialize peaks array
    if (peaksRef.current.length !== bars) {
      peaksRef.current = new Array(bars).fill(0);
    }

    if (!isPlaying || dataArray.length === 0) {
      // Draw idle state - subtle bars
      for (let i = 0; i < bars; i++) {
        const x = i * (barWidth + barSpacing);
        const idleHeight = 3 + Math.sin(Date.now() / 1000 + i * 0.2) * 2;
        
        ctx.fillStyle = 'hsla(280, 100%, 60%, 0.2)';
        ctx.fillRect(x, height - idleHeight, barWidth, idleHeight);
      }
      
      animationRef.current = requestAnimationFrame(draw);
      return;
    }

    // Draw spectrum bars
    for (let i = 0; i < bars; i++) {
      // Sample from frequency data with logarithmic scaling for better bass representation
      const dataIndex = Math.floor(Math.pow(i / bars, 1.5) * dataArray.length * 0.8);
      const value = dataArray[dataIndex] / 255;
      const barHeight = value * height * 0.9 + 3;

      const x = i * (barWidth + barSpacing);

      // Create gradient for each bar
      const gradient = ctx.createLinearGradient(x, height, x, height - barHeight);
      gradient.addColorStop(0, 'hsl(180, 100%, 50%)');
      gradient.addColorStop(0.3, 'hsl(220, 100%, 55%)');
      gradient.addColorStop(0.6, 'hsl(280, 100%, 60%)');
      gradient.addColorStop(1, 'hsl(320, 100%, 55%)');

      // Draw bar with rounded top
      ctx.beginPath();
      ctx.roundRect(x, height - barHeight, barWidth, barHeight, [3, 3, 0, 0]);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Add glow effect
      ctx.shadowColor = 'hsl(280, 100%, 60%)';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Update and draw peak indicators
      if (barHeight > peaksRef.current[i]) {
        peaksRef.current[i] = barHeight;
      } else {
        peaksRef.current[i] = Math.max(0, peaksRef.current[i] - 1.5);
      }

      // Draw peak line
      const peakY = height - peaksRef.current[i];
      ctx.beginPath();
      ctx.moveTo(x, peakY);
      ctx.lineTo(x + barWidth, peakY);
      ctx.strokeStyle = 'hsla(320, 100%, 70%, 0.8)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Add reflection effect at bottom
      const reflectionGradient = ctx.createLinearGradient(x, height, x, height + barHeight * 0.3);
      reflectionGradient.addColorStop(0, 'hsla(280, 100%, 60%, 0.3)');
      reflectionGradient.addColorStop(1, 'hsla(280, 100%, 60%, 0)');
      
      ctx.fillStyle = reflectionGradient;
      ctx.fillRect(x, height, barWidth, barHeight * 0.3);
    }

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
      width={400}
      height={200}
      className="w-full h-full"
    />
  );
};
