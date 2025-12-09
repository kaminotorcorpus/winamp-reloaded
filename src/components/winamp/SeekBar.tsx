import React from 'react';
import { useAudioStore } from '@/stores/audioStore';

interface SeekBarProps {
  onSeek: (time: number) => void;
}

const formatTime = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const SeekBar: React.FC<SeekBarProps> = ({ onSeek }) => {
  const { currentTime, duration } = useAudioStore();

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    onSeek(time);
  };

  return (
    <div className="space-y-2 px-2">
      {/* Progress bar */}
      <div className="relative h-1.5 rounded-full bg-muted/50 overflow-hidden group cursor-pointer">
        {/* Fill */}
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-100"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, hsl(var(--player-glow)) 0%, hsl(var(--player-glow-secondary)) 100%)',
            boxShadow: '0 0 12px hsl(var(--player-glow) / 0.6)',
          }}
        />
        
        {/* Thumb - visible on hover */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-foreground opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
          style={{ 
            left: `calc(${progress}% - 8px)`,
            boxShadow: '0 0 10px hsl(var(--player-glow) / 0.8)'
          }}
        />
        
        {/* Hidden input for interaction */}
        <input
          type="range"
          min="0"
          max={duration || 100}
          step="0.1"
          value={currentTime}
          onChange={handleSeek}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>

      {/* Time display */}
      <div className="flex justify-between text-xs font-mono text-muted-foreground">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
};
