import React, { useRef, useEffect, useCallback } from 'react';
import { useAudioStore } from '@/stores/audioStore';
import { Activity, BarChart3, Radio, Waves } from 'lucide-react';

interface VisualizerProps {
  getAnalyserData: () => Uint8Array;
}

const VISUALIZER_STYLES = [
  { id: 'radial', icon: Radio, label: 'Radial' },
  { id: 'bars', icon: BarChart3, label: 'Bars' },
  { id: 'oscilloscope', icon: Activity, label: 'Scope' },
  { id: 'spectrum', icon: Waves, label: 'Spectrum' },
] as const;

export const Visualizer: React.FC<VisualizerProps> = ({ getAnalyserData }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const { isPlaying, visualizerStyle, setVisualizerStyle } = useAudioStore();

  // Radial visualization
  const drawRadial = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, dataArray: Uint8Array) => {
    const centerX = width / 2;
    const centerY = height / 2;

    if (!isPlaying || dataArray.length === 0) {
      for (let i = 0; i < 3; i++) {
        const radius = 40 + i * 30;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(var(--player-glow), ${0.2 - i * 0.05})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      return;
    }

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

      const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
      gradient.addColorStop(0, 'hsl(var(--player-glow))');
      gradient.addColorStop(1, 'hsl(var(--primary))');

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = barWidth;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    const avgValue = dataArray.reduce((a, b) => a + b, 0) / dataArray.length / 255;
    const pulseRadius = 40 + avgValue * 15;

    ctx.beginPath();
    ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
    const innerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, pulseRadius);
    innerGradient.addColorStop(0, 'hsla(var(--player-glow), 0.3)');
    innerGradient.addColorStop(0.7, 'hsla(var(--player-glow), 0.1)');
    innerGradient.addColorStop(1, 'hsla(var(--player-glow), 0)');
    ctx.fillStyle = innerGradient;
    ctx.fill();
  }, [isPlaying]);

  // Classic Winamp bars
  const drawBars = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, dataArray: Uint8Array) => {
    const barCount = 32;
    const barWidth = (width - barCount * 2) / barCount;
    const maxHeight = height * 0.85;

    if (!isPlaying || dataArray.length === 0) {
      for (let i = 0; i < barCount; i++) {
        const x = i * (barWidth + 2) + 1;
        const barHeight = 4;
        ctx.fillStyle = 'hsla(var(--player-glow), 0.2)';
        ctx.fillRect(x, height - barHeight - 10, barWidth, barHeight);
      }
      return;
    }

    for (let i = 0; i < barCount; i++) {
      const dataIndex = Math.floor((i / barCount) * dataArray.length);
      const value = dataArray[dataIndex] / 255;
      const barHeight = value * maxHeight;
      const x = i * (barWidth + 2) + 1;

      // Draw segmented bars like classic Winamp
      const segmentHeight = 4;
      const segmentGap = 2;
      const segments = Math.floor(barHeight / (segmentHeight + segmentGap));

      for (let j = 0; j < segments; j++) {
        const y = height - (j + 1) * (segmentHeight + segmentGap) - 10;
        const ratio = j / (maxHeight / (segmentHeight + segmentGap));

        // Color gradient from green to yellow to red
        let color: string;
        if (ratio < 0.5) {
          color = `hsl(${120 - ratio * 120}, 100%, 50%)`;
        } else if (ratio < 0.8) {
          color = `hsl(${60 - (ratio - 0.5) * 120}, 100%, 50%)`;
        } else {
          color = 'hsl(0, 100%, 50%)';
        }

        ctx.fillStyle = color;
        ctx.fillRect(x, y, barWidth, segmentHeight);
      }
    }
  }, [isPlaying]);

  // Oscilloscope waveform
  const drawOscilloscope = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, dataArray: Uint8Array) => {
    const centerY = height / 2;

    if (!isPlaying || dataArray.length === 0) {
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.strokeStyle = 'hsla(var(--player-glow), 0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();
      return;
    }

    ctx.beginPath();
    ctx.strokeStyle = 'hsl(var(--player-glow))';
    ctx.lineWidth = 2;
    ctx.shadowColor = 'hsl(var(--player-glow))';
    ctx.shadowBlur = 10;

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

    // Draw a subtle center line
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.strokeStyle = 'hsla(var(--player-glow), 0.1)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }, [isPlaying]);

  // Spectrum analyzer with mirror effect
  const drawSpectrum = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, dataArray: Uint8Array) => {
    const centerY = height / 2;
    const barCount = 48;
    const barWidth = (width - barCount) / barCount;
    const maxHeight = height * 0.4;

    if (!isPlaying || dataArray.length === 0) {
      for (let i = 0; i < barCount; i++) {
        const x = i * (barWidth + 1);
        ctx.fillStyle = 'hsla(var(--player-glow), 0.15)';
        ctx.fillRect(x, centerY - 2, barWidth, 4);
      }
      return;
    }

    for (let i = 0; i < barCount; i++) {
      const dataIndex = Math.floor((i / barCount) * (dataArray.length / 2));
      const value = dataArray[dataIndex] / 255;
      const barHeight = value * maxHeight;
      const x = i * (barWidth + 1);

      // Create gradient for each bar
      const gradient = ctx.createLinearGradient(0, centerY - barHeight, 0, centerY + barHeight);
      gradient.addColorStop(0, 'hsl(var(--primary))');
      gradient.addColorStop(0.5, 'hsl(var(--player-glow))');
      gradient.addColorStop(1, 'hsl(var(--primary))');

      ctx.fillStyle = gradient;
      
      // Top bars (going up)
      ctx.fillRect(x, centerY - barHeight, barWidth, barHeight);
      
      // Bottom bars (mirror, going down)
      ctx.fillRect(x, centerY, barWidth, barHeight);
    }

    // Center line glow
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.strokeStyle = 'hsla(var(--player-glow), 0.5)';
    ctx.lineWidth = 2;
    ctx.shadowColor = 'hsl(var(--player-glow))';
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }, [isPlaying]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const dataArray = getAnalyserData();

    switch (visualizerStyle) {
      case 'bars':
        drawBars(ctx, width, height, dataArray);
        break;
      case 'oscilloscope':
        drawOscilloscope(ctx, width, height, dataArray);
        break;
      case 'spectrum':
        drawSpectrum(ctx, width, height, dataArray);
        break;
      case 'radial':
      default:
        drawRadial(ctx, width, height, dataArray);
        break;
    }

    animationRef.current = requestAnimationFrame(draw);
  }, [getAnalyserData, visualizerStyle, drawRadial, drawBars, drawOscilloscope, drawSpectrum]);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [draw]);

  const cycleStyle = () => {
    const styles: Array<'radial' | 'bars' | 'oscilloscope' | 'spectrum'> = ['radial', 'bars', 'oscilloscope', 'spectrum'];
    const currentIndex = styles.indexOf(visualizerStyle);
    const nextIndex = (currentIndex + 1) % styles.length;
    setVisualizerStyle(styles[nextIndex]);
  };

  const currentStyle = VISUALIZER_STYLES.find(s => s.id === visualizerStyle);
  const IconComponent = currentStyle?.icon || Radio;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      <canvas
        ref={canvasRef}
        width={280}
        height={280}
        className="w-full h-full"
      />
      
      {/* Style switcher button */}
      <button
        onClick={cycleStyle}
        className="absolute bottom-2 right-2 modern-btn rounded-full p-2 opacity-60 hover:opacity-100 transition-opacity"
        title={`Style: ${currentStyle?.label}`}
      >
        <IconComponent size={16} />
      </button>
    </div>
  );
};
