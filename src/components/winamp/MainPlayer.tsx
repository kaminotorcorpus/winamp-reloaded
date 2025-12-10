import React from 'react';
import { LCDDisplay } from './LCDDisplay';
import { PlaybackControls } from './PlaybackControls';
import { VolumeSlider } from './VolumeSlider';
import { SeekBar } from './SeekBar';
import { useAudioStore } from '@/stores/audioStore';

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
  const { toggleEqualizer, togglePlaylist, showEqualizer, showPlaylist } = useAudioStore();

  return (
    <div className="winamp-window">
      {/* Title Bar */}
      <div className="winamp-titlebar h-5 flex items-center justify-between px-2 cursor-grab">
        <span className="pixel-font text-foreground/80 text-[10px]">RETRO PLAYER</span>
        <div className="flex gap-1">
          <button className="winamp-button w-4 h-3 pixel-font text-[8px]">_</button>
          <button className="winamp-button w-4 h-3 pixel-font text-[8px]">□</button>
          <button className="winamp-button w-4 h-3 pixel-font text-[8px] hover:bg-destructive/80">×</button>
        </div>
      </div>
      
      <div className="w-[300px] p-1 space-y-1">
        {/* LCD Display */}
        <LCDDisplay getAnalyserData={getAnalyserData} />

        {/* Seek Bar */}
        <SeekBar onSeek={onSeek} />

        {/* Playback Controls */}
        <PlaybackControls onPlay={onPlay} onPause={onPause} onStop={onStop} />

        {/* Volume */}
        <VolumeSlider />

        {/* Toggle buttons */}
        <div className="flex justify-center gap-2 pt-1 pb-1">
          <button
            onClick={toggleEqualizer}
            className={`winamp-button px-3 py-1 pixel-font text-[10px] ${showEqualizer ? 'winamp-button-active' : ''}`}
          >
            EQ
          </button>
          <button
            onClick={togglePlaylist}
            className={`winamp-button px-3 py-1 pixel-font text-[10px] ${showPlaylist ? 'winamp-button-active' : ''}`}
          >
            PL
          </button>
        </div>
      </div>
    </div>
  );
};
