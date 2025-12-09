import React from 'react';
import { LCDDisplay } from './LCDDisplay';
import { PlaybackControls } from './PlaybackControls';
import { VolumeSlider } from './VolumeSlider';
import { SeekBar } from './SeekBar';
import { Visualizer } from './Visualizer';
import { useAudioStore } from '@/stores/audioStore';
import { Settings2, ListMusic } from 'lucide-react';
import { motion } from 'framer-motion';

interface MainPlayerProps {
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onSeek: (time: number) => void;
  getAnalyserData: () => Uint8Array;
}

export const MainPlayer: React.FC<MainPlayerProps> = ({
  onPlay,
  onPause,
  onStop,
  onSeek,
  getAnalyserData,
}) => {
  const { toggleEqualizer, togglePlaylist, showEqualizer, showPlaylist, isPlaying, playlist, currentTrackIndex } = useAudioStore();

  const currentTrack = playlist[currentTrackIndex];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glow-card rounded-3xl p-6 space-y-6"
    >
      {/* Album Art / Visualizer */}
      <div className="relative">
        <div className={`album-art aspect-square w-full max-w-xs mx-auto flex items-center justify-center ${isPlaying ? 'spin-slow' : ''}`}>
          <Visualizer getAnalyserData={getAnalyserData} />
        </div>
        
        {/* Floating glow behind */}
        <div 
          className="absolute inset-0 -z-10 blur-3xl opacity-40"
          style={{
            background: `radial-gradient(circle, hsl(var(--player-glow)) 0%, transparent 70%)`
          }}
        />
      </div>

      {/* Track Info */}
      <LCDDisplay getAnalyserData={getAnalyserData} />

      {/* Seek Bar */}
      <SeekBar onSeek={onSeek} />

      {/* Playback Controls */}
      <PlaybackControls onPlay={onPlay} onPause={onPause} onStop={onStop} />

      {/* Volume */}
      <VolumeSlider />

      {/* Toggle buttons */}
      <div className="flex justify-center gap-3 pt-2">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={toggleEqualizer}
          className={`modern-btn rounded-full p-3 ${showEqualizer ? 'modern-btn-primary' : ''}`}
        >
          <Settings2 size={20} />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={togglePlaylist}
          className={`modern-btn rounded-full p-3 ${showPlaylist ? 'modern-btn-primary' : ''}`}
        >
          <ListMusic size={20} />
        </motion.button>
      </div>
    </motion.div>
  );
};
