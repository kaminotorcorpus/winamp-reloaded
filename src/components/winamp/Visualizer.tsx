import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useAudioStore, VisualizerStyle } from '@/stores/audioStore';
import { Activity, BarChart3, Radio, Waves } from 'lucide-react';

interface VisualizerProps {
  getAnalyserData: () => Uint8Array;
}

interface ThemeColors {
  glow: string;
  glowSecondary: string;
  primary: string;
  accent: string;
  muted: string;
  eqGreen: string;
  eqYellow: string;
  eqRed: string;
  eqCyan: string;
}

const VISUALIZER_STYLES: { id: VisualizerStyle; icon: typeof Radio; label: string }[] = [
  { id: 'radial', icon: Radio, label: 'Radial' },
  { id: 'bars', icon: BarChart3, label: 'Bars' },
  { id: 'oscilloscope', icon: Activity, label: 'Scope' },
  { id: 'spectrum', icon: Waves, label: 'Spectrum' },
];

// Convert CSS HSL variable to usable color string
const getComputedColor = (varName: string): string => {
  const root = document.documentElement;
  const value = getComputedStyle(root).getPropertyValue(varName).trim();
  if (value) {
    return `hsl(${value})`;
  }
  return '#a855f7'; // Fallback purple
};

const getThemeColors = (): ThemeColors => ({
  glow: getComputedColor('--player-glow'),
  glowSecondary: getComputedColor('--player-glow-secondary'),
  primary: getComputedColor('--primary'),
  accent: getComputedColor('--accent'),
  muted: getComputedColor('--muted'),
  eqGreen: getComputedColor('--eq-green'),
  eqYellow: getComputedColor('--eq-yellow'),
  eqRed: getComputedColor('--eq-red'),
  eqCyan: getComputedColor('--eq-cyan'),
});

// Get alpha version of color
const withAlpha = (hslColor: string, alpha: number): string => {
  return hslColor.replace('hsl(', 'hsla(').replace(')', `, ${alpha})`);
};

export const Visualizer: React.FC<VisualizerProps> = ({ getAnalyserData }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const { isPlaying, visualizerStyle, setVisualizerStyle, theme } = useAudioStore();
  const [colors, setColors] = useState<ThemeColors>(getThemeColors());

  // Update colors when theme changes
  useEffect(() => {
    // Small delay to ensure CSS variables are updated
    const timer = setTimeout(() => {
      setColors(getThemeColors());
    }, 50);
    return () => clearTimeout(timer);
  }, [theme]);

  // Radial visualization
  const drawRadial = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, dataArray: Uint8Array) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const minDim = Math.min(width, height);

    // Always draw something - idle state
    if (!isPlaying || dataArray.length === 0 || dataArray.every(v => v === 0)) {
      // Idle state - subtle pulsing rings
      for (let i = 0; i < 3; i++) {
        const radius = minDim * 0.15 + i * (minDim * 0.08);
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = withAlpha(colors.glow, 0.2 - i * 0.05);
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      
      // Center dot
      ctx.beginPath();
      ctx.arc(centerX, centerY, minDim * 0.08, 0, Math.PI * 2);
      ctx.fillStyle = withAlpha(colors.primary, 0.3);
      ctx.fill();
      return;
    }

    const bars = 64;
    const barWidth = 3;
    const minRadius = minDim * 0.18;
    const maxBarHeight = minDim * 0.28;

    // Outer glow ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, minRadius + maxBarHeight + 10, 0, Math.PI * 2);
    ctx.strokeStyle = withAlpha(colors.glow, 0.1);
    ctx.lineWidth = 1;
    ctx.stroke();

    // Draw bars radiating outward
    for (let i = 0; i < bars; i++) {
      const dataIndex = Math.floor((i / bars) * dataArray.length);
      const value = dataArray[dataIndex] / 255;
      const barHeight = value * maxBarHeight + 3;
      const angle = (i / bars) * Math.PI * 2 - Math.PI / 2;

      const x1 = centerX + Math.cos(angle) * minRadius;
      const y1 = centerY + Math.sin(angle) * minRadius;
      const x2 = centerX + Math.cos(angle) * (minRadius + barHeight);
      const y2 = centerY + Math.sin(angle) * (minRadius + barHeight);

      // Use theme gradient colors
      const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
      gradient.addColorStop(0, colors.primary);
      gradient.addColorStop(0.6, colors.glow);
      gradient.addColorStop(1, colors.glowSecondary);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = barWidth;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    // Inner pulsing circle
    const avgValue = dataArray.reduce((a, b) => a + b, 0) / dataArray.length / 255;
    const pulseRadius = minDim * 0.12 + avgValue * (minDim * 0.06);

    ctx.beginPath();
    ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
    const innerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, pulseRadius);
    innerGradient.addColorStop(0, withAlpha(colors.glow, 0.5));
    innerGradient.addColorStop(0.5, withAlpha(colors.primary, 0.25));
    innerGradient.addColorStop(1, withAlpha(colors.glow, 0));
    ctx.fillStyle = innerGradient;
    ctx.fill();
  }, [isPlaying, colors]);

  // Classic Winamp bars
  const drawBars = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, dataArray: Uint8Array) => {
    const barCount = 28;
    const gap = 3;
    const barWidth = (width - (barCount + 1) * gap) / barCount;
    const maxHeight = height * 0.92;

    if (!isPlaying || dataArray.length === 0) {
      // Idle state - minimal bars
      for (let i = 0; i < barCount; i++) {
        const x = gap + i * (barWidth + gap);
        ctx.fillStyle = withAlpha(colors.glow, 0.15);
        ctx.fillRect(x, height - 4, barWidth, 4);
      }
      return;
    }

    for (let i = 0; i < barCount; i++) {
      const dataIndex = Math.floor((i / barCount) * (dataArray.length * 0.6));
      const value = dataArray[dataIndex] / 255;
      const barHeight = value * maxHeight;
      const x = gap + i * (barWidth + gap);

      // Segmented bars like classic Winamp
      const segmentHeight = 5;
      const segmentGap = 2;
      const totalSegmentHeight = segmentHeight + segmentGap;
      const segments = Math.floor(barHeight / totalSegmentHeight);
      const maxSegments = Math.floor(maxHeight / totalSegmentHeight);

      for (let j = 0; j < segments; j++) {
        const y = height - (j + 1) * totalSegmentHeight;
        const ratio = j / maxSegments;

        // Color gradient using theme colors: primary -> glow -> glowSecondary
        let segmentColor: string;
        if (ratio < 0.5) {
          segmentColor = colors.primary;
        } else if (ratio < 0.75) {
          segmentColor = colors.glow;
        } else {
          segmentColor = colors.glowSecondary;
        }

        ctx.fillStyle = segmentColor;
        ctx.shadowColor = segmentColor;
        ctx.shadowBlur = 4;
        ctx.fillRect(x, y, barWidth, segmentHeight);
      }

      // Peak indicator using accent color
      if (segments > 0) {
        const peakY = height - segments * totalSegmentHeight - totalSegmentHeight;
        ctx.fillStyle = colors.accent;
        ctx.shadowColor = colors.accent;
        ctx.shadowBlur = 8;
        ctx.fillRect(x, peakY, barWidth, 2);
      }
    }
    ctx.shadowBlur = 0;
  }, [isPlaying, colors]);

  // Oscilloscope waveform
  const drawOscilloscope = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, dataArray: Uint8Array) => {
    const centerY = height / 2;
    const padding = 20;

    // Draw grid lines
    ctx.strokeStyle = withAlpha(colors.muted, 0.15);
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      const y = (height / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    if (!isPlaying || dataArray.length === 0) {
      // Idle state - flat line
      ctx.beginPath();
      ctx.moveTo(padding, centerY);
      ctx.lineTo(width - padding, centerY);
      ctx.strokeStyle = withAlpha(colors.glow, 0.4);
      ctx.lineWidth = 2;
      ctx.stroke();
      return;
    }

    // Glow effect
    ctx.shadowColor = colors.eqCyan;
    ctx.shadowBlur = 15;
    ctx.strokeStyle = colors.eqCyan;
    ctx.lineWidth = 2;
    ctx.beginPath();

    const usableWidth = width - padding * 2;
    const sliceWidth = usableWidth / dataArray.length;

    for (let i = 0; i < dataArray.length; i++) {
      const x = padding + i * sliceWidth;
      const v = dataArray[i] / 128.0;
      const y = (v * height) / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.stroke();

    // Second pass for brighter center
    ctx.shadowBlur = 0;
    ctx.strokeStyle = withAlpha(colors.eqCyan, 0.6);
    ctx.lineWidth = 1;
    ctx.beginPath();

    for (let i = 0; i < dataArray.length; i++) {
      const x = padding + i * sliceWidth;
      const v = dataArray[i] / 128.0;
      const y = (v * height) / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
  }, [isPlaying, colors]);

  // Spectrum analyzer with mirror effect
  const drawSpectrum = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, dataArray: Uint8Array) => {
    const centerY = height / 2;
    const barCount = 40;
    const gap = 2;
    const barWidth = (width - (barCount + 1) * gap) / barCount;
    const maxHeight = height * 0.42;

    if (!isPlaying || dataArray.length === 0) {
      // Idle state - center line
      const gradient = ctx.createLinearGradient(0, centerY, width, centerY);
      gradient.addColorStop(0, withAlpha(colors.glow, 0));
      gradient.addColorStop(0.5, withAlpha(colors.glow, 0.3));
      gradient.addColorStop(1, withAlpha(colors.glow, 0));
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, centerY - 1, width, 2);
      return;
    }

    for (let i = 0; i < barCount; i++) {
      const dataIndex = Math.floor((i / barCount) * (dataArray.length * 0.5));
      const value = dataArray[dataIndex] / 255;
      const barHeight = value * maxHeight + 2;
      const x = gap + i * (barWidth + gap);

      // Create vertical gradient for each bar
      const topGradient = ctx.createLinearGradient(0, centerY - barHeight, 0, centerY);
      topGradient.addColorStop(0, colors.glowSecondary);
      topGradient.addColorStop(0.5, colors.glow);
      topGradient.addColorStop(1, colors.primary);

      const bottomGradient = ctx.createLinearGradient(0, centerY, 0, centerY + barHeight);
      bottomGradient.addColorStop(0, colors.primary);
      bottomGradient.addColorStop(0.5, colors.glow);
      bottomGradient.addColorStop(1, colors.glowSecondary);

      // Glow effect
      ctx.shadowColor = colors.glow;
      ctx.shadowBlur = 8;

      // Top bars (going up from center)
      ctx.fillStyle = topGradient;
      ctx.fillRect(x, centerY - barHeight, barWidth, barHeight);

      // Bottom bars (mirror, going down from center)
      ctx.fillStyle = bottomGradient;
      ctx.fillRect(x, centerY, barWidth, barHeight);
    }

    // Center line glow
    ctx.shadowBlur = 15;
    ctx.shadowColor = colors.glow;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.strokeStyle = withAlpha(colors.glow, 0.8);
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }, [isPlaying, colors]);

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
    const styles: VisualizerStyle[] = ['radial', 'bars', 'oscilloscope', 'spectrum'];
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
        className="absolute bottom-3 right-3 modern-btn rounded-full p-2.5 opacity-70 hover:opacity-100 transition-all duration-200"
        title={`Style: ${currentStyle?.label} — Click to change`}
      >
        <IconComponent size={16} />
      </button>
      
      {/* Style label */}
      <span className="absolute bottom-3 left-3 text-xs font-medium text-muted-foreground opacity-50">
        {currentStyle?.label}
      </span>
    </div>
  );
};
