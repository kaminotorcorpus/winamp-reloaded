import React, { useEffect } from 'react';
import { MainPlayer } from './MainPlayer';
import { Equalizer } from './Equalizer';
import { Playlist } from './Playlist';
import { ThemeSwitcher } from './ThemeSwitcher';
import { ArduinoPanel } from './ArduinoPanel';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import { useSerialConnection } from '@/hooks/useSerialConnection';
import { useAudioStore } from '@/stores/audioStore';

export const WinampPlayer: React.FC = () => {
  const { theme } = useAudioStore();
  const { play, pause, stop, seek, getAnalyserData, initAudioContext } = useAudioEngine();
  const { isConnected, connect, disconnect } = useSerialConnection(seek);

  // Apply theme class to document
  useEffect(() => {
    const themeClasses = ['theme-dark-metal', 'theme-neon', 'theme-gold', 'theme-minimal-grey'];
    document.documentElement.classList.remove(...themeClasses);
    
    if (theme !== 'classic-blue') {
      document.documentElement.classList.add(`theme-${theme}`);
    }
  }, [theme]);

  // Initialize audio context on first interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      initAudioContext();
      document.removeEventListener('click', handleFirstInteraction);
    };
    document.addEventListener('click', handleFirstInteraction);
    return () => document.removeEventListener('click', handleFirstInteraction);
  }, [initAudioContext]);

  return (
    <div className="min-h-screen animated-gradient flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient glow effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[120px] opacity-30"
          style={{ background: 'hsl(var(--player-glow))' }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-[100px] opacity-20"
          style={{ background: 'hsl(var(--player-glow-secondary))' }}
        />
      </div>

      {/* Main container */}
      <div className="relative z-10 w-full max-w-md mx-auto">
        {/* Arduino Panel - at top */}
        <div className="mb-4">
          <ArduinoPanel
            isConnected={isConnected}
            onConnect={connect}
            onDisconnect={disconnect}
          />
        </div>

        {/* Main Player */}
        <MainPlayer
          onPlay={play}
          onPause={pause}
          onStop={stop}
          onSeek={seek}
          getAnalyserData={getAnalyserData}
        />

        {/* Secondary panels - Equalizer and Playlist */}
        <div className="mt-4 space-y-4">
          <Equalizer />
          <Playlist />
        </div>
      </div>

      {/* Theme switcher - floating */}
      <ThemeSwitcher />
    </div>
  );
};
