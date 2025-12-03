import React from 'react';
import { useAudioStore } from '@/stores/audioStore';

interface SeekBarProps {
  onSeek: (time: number) => void;
}

export const SeekBar: React.FC<SeekBarProps> = ({ onSeek }) => {
  const { currentTime, duration } = useAudioStore();

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    onSeek(time);
  };

  return (
    <div className="relative h-3 mx-2 my-1">
      <div className="winamp-slider-track absolute inset-0 rounded-sm" />
      <div
        className="absolute top-0 left-0 h-full rounded-sm"
        style={{
          width: `${progress}%`,
          background: 'linear-gradient(90deg, hsl(var(--accent)) 0%, hsl(var(--winamp-slider-thumb)) 100%)',
        }}
      />
      <input
        type="range"
        min="0"
        max={duration || 100}
        step="0.1"
        value={currentTime}
        onChange={handleSeek}
        className="absolute inset-0 w-full opacity-0 cursor-pointer"
      />
      <div
        className="winamp-slider-thumb absolute top-1/2 -translate-y-1/2 w-4 h-3 rounded-sm pointer-events-none"
        style={{ left: `calc(${progress}% - 8px)` }}
      />
    </div>
  );
};
