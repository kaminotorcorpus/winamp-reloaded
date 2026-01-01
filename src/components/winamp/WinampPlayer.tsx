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
    <div className="min-h-screen bg-background flex flex-col items-center justify-start pt-4 p-4 relative overflow-hidden">
      {/* Background pattern */}
      <div 
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px),
            linear-gradient(hsl(var(--foreground)) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
        }}
      />

      {/* Main layout with Arduino panel on the side */}
      <div className="flex gap-4 relative z-10">
        {/* Player stack - vertical layout like classic Winamp */}
        <div className="flex flex-col gap-0">
          <MainPlayer
            onPlay={play}
            onPause={pause}
            onStop={stop}
            onSeek={seek}
            getAnalyserData={getAnalyserData}
          />
          <Equalizer />
          <Playlist />
        </div>

        {/* Arduino panel temporarily hidden */}
        {/* <div className="flex flex-col gap-0">
          <ArduinoPanel
            isConnected={isConnected}
            onConnect={connect}
            onDisconnect={disconnect}
          />
        </div> */}
      </div>

      {/* Theme switcher */}
      <ThemeSwitcher />
    </div>
  );
};
