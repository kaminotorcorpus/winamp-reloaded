import React from 'react';
import { useAudioStore } from '@/stores/audioStore';
import { Oscilloscope } from './Oscilloscope';
import { Activity, ActivitySquare } from 'lucide-react';

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
  const { currentTime, duration, playlist, currentTrackIndex, isPlaying, showVisualizer, toggleVisualizer } = useAudioStore();

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

      {/* Middle row - Time display + Oscilloscope + Toggle */}
      <div className="flex items-center gap-3">
        <div className="lcd-text text-3xl font-bold tracking-wider min-w-[80px]">
          {formatTime(currentTime)}
        </div>
        
        {/* Oscilloscope or placeholder */}
        {showVisualizer ? (
          <Oscilloscope getAnalyserData={getAnalyserData} />
        ) : (
          <div 
            className="winamp-lcd rounded-sm flex items-center justify-center"
            style={{ width: 150, height: 32 }}
          >
            <span className="lcd-text-dim text-xs">VIS OFF</span>
          </div>
        )}
        
        {/* Toggle button */}
        <button
          onClick={toggleVisualizer}
          className="p-1 rounded hover:bg-foreground/10 transition-colors"
          title={showVisualizer ? 'Désactiver visualisation' : 'Activer visualisation'}
        >
          {showVisualizer ? (
            <Activity className="w-4 h-4 lcd-text" />
          ) : (
            <ActivitySquare className="w-4 h-4 lcd-text-dim" />
          )}
        </button>
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
