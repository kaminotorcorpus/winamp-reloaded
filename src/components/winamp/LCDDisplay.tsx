import React from 'react';
import { useAudioStore } from '@/stores/audioStore';
import { Oscilloscope } from './Oscilloscope';

interface LCDDisplayProps {
  getAnalyserData: () => Uint8Array;
}

const formatTime = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const LCDDisplay: React.FC<LCDDisplayProps> = ({ getAnalyserData }) => {
  const { currentTime, duration, playlist, currentTrackIndex, isPlaying } = useAudioStore();

  const currentTrack = playlist[currentTrackIndex];
  const trackName = currentTrack?.name || 'No track loaded';

  return (
    <div className="winamp-lcd p-2 space-y-1">
      {/* Top row - Bitrate, Stereo indicator */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="lcd-text text-xs">KBPS</span>
          <span className="lcd-text text-sm font-bold">320</span>
          <span className="lcd-text text-xs">kHz</span>
          <span className="lcd-text text-sm font-bold">44</span>
        </div>
        <div className="flex items-center gap-1">
          <span className={`text-xs ${isPlaying ? 'lcd-text' : 'lcd-text-dim'}`}>STEREO</span>
        </div>
      </div>

      {/* Middle row - Time display + Oscilloscope */}
      <div className="flex items-center gap-3">
        <div className="lcd-text text-3xl font-bold tracking-wider min-w-[80px]">
          {formatTime(currentTime)}
        </div>
        <Oscilloscope getAnalyserData={getAnalyserData} />
      </div>

      {/* Bottom row - Track name (scrolling) */}
      <div className="overflow-hidden">
        <div className="lcd-text text-sm whitespace-nowrap animate-marquee">
          {trackName.length > 30 ? (
            <span className="inline-block animate-scroll-text">
              {trackName} ★★★ {trackName} ★★★
            </span>
          ) : (
            trackName
          )}
        </div>
      </div>

      {/* Duration display */}
      <div className="flex justify-end">
        <span className="lcd-text-dim text-xs">
          / {formatTime(duration)}
        </span>
      </div>
    </div>
  );
};
