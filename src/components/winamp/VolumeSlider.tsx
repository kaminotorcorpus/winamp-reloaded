import React from 'react';
import { Volume2, VolumeX, Volume1 } from 'lucide-react';
import { useAudioStore } from '@/stores/audioStore';

export const VolumeSlider: React.FC = () => {
  const { volume, setVolume } = useAudioStore();

  const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  const handleVolumeClick = () => {
    setVolume(volume === 0 ? 0.5 : 0);
  };

  return (
    <div className="flex items-center gap-3 px-4">
      <button 
        onClick={handleVolumeClick}
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        <VolumeIcon size={20} />
      </button>
      
      <div className="relative flex-1 h-1.5 rounded-full bg-muted/50 group cursor-pointer">
        {/* Fill */}
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${volume * 100}%`,
            background: 'linear-gradient(90deg, hsl(var(--player-glow)) 0%, hsl(var(--player-glow-secondary)) 100%)',
            boxShadow: '0 0 8px hsl(var(--player-glow) / 0.4)',
          }}
        />
        
        {/* Thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-foreground shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ 
            left: `calc(${volume * 100}% - 6px)`,
            boxShadow: '0 0 8px hsl(var(--player-glow) / 0.6)'
          }}
        />
        
        {/* Hidden input */}
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
      
      <span className="text-xs font-mono text-muted-foreground w-10 text-right">
        {Math.round(volume * 100)}%
      </span>
    </div>
  );
};
