import React from 'react';
import { Volume2, VolumeX, Volume1 } from 'lucide-react';
import { useAudioStore } from '@/stores/audioStore';

export const VolumeSlider: React.FC = () => {
  const { volume, setVolume } = useAudioStore();

  const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div className="flex items-center gap-2 px-2">
      <VolumeIcon size={14} className="text-foreground/70 flex-shrink-0" />
      <div className="relative flex-1 h-3">
        <div className="winamp-slider-track absolute inset-0 rounded-sm" />
        <div
          className="absolute top-0 left-0 h-full rounded-sm"
          style={{
            width: `${volume * 100}%`,
            background: 'linear-gradient(90deg, hsl(var(--accent)) 0%, hsl(var(--winamp-slider-thumb)) 100%)',
          }}
        />
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
        />
        <div
          className="winamp-slider-thumb absolute top-1/2 -translate-y-1/2 w-3 h-4 rounded-sm pointer-events-none"
          style={{ left: `calc(${volume * 100}% - 6px)` }}
        />
      </div>
      <span className="lcd-text text-xs w-8 text-right">{Math.round(volume * 100)}%</span>
    </div>
  );
};
