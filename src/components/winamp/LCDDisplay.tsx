import React from 'react';
import { useAudioStore } from '@/stores/audioStore';
import { motion } from 'framer-motion';

interface LCDDisplayProps {
  getAnalyserData: () => Uint8Array;
}

const formatTime = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const LCDDisplay: React.FC<LCDDisplayProps> = ({ getAnalyserData }) => {
  const { currentTime, duration, playlist, currentTrackIndex, isPlaying } = useAudioStore();

  const currentTrack = playlist[currentTrackIndex];
  const trackName = currentTrack?.name || 'No track loaded';

  return (
    <div className="text-center space-y-2">
      {/* Track name with scroll if needed */}
      <motion.div 
        className="overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        key={currentTrackIndex}
      >
        <h2 className="text-xl font-semibold text-foreground truncate px-4">
          {trackName}
        </h2>
      </motion.div>

      {/* Artist / Album placeholder */}
      <p className="text-sm text-muted-foreground">
        {currentTrack ? 'Unknown Artist' : 'Select a track to play'}
      </p>

      {/* Audio info badges */}
      <div className="flex items-center justify-center gap-3 pt-2">
        <span className="px-2 py-0.5 rounded-full bg-secondary/50 text-xs text-muted-foreground font-mono">
          320 kbps
        </span>
        <span className="px-2 py-0.5 rounded-full bg-secondary/50 text-xs text-muted-foreground font-mono">
          44.1 kHz
        </span>
        <span className={`px-2 py-0.5 rounded-full text-xs font-mono ${
          isPlaying 
            ? 'bg-primary/20 text-primary glow-text-accent' 
            : 'bg-secondary/50 text-muted-foreground'
        }`}>
          STEREO
        </span>
      </div>
    </div>
  );
};
