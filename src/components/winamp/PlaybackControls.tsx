import React, { useRef } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Repeat1, 
  FolderOpen 
} from 'lucide-react';
import { useAudioStore, Track } from '@/stores/audioStore';

interface PlaybackControlsProps {
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
}

// Extend HTMLInputElement to include webkitdirectory
declare module 'react' {
  interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
    webkitdirectory?: string;
    directory?: string;
  }
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  onPlay,
  onPause,
  onStop,
}) => {
  const {
    isPlaying,
    isShuffle,
    repeatMode,
    toggleShuffle,
    toggleRepeat,
    nextTrack,
    prevTrack,
    setPlaylist,
  } = useAudioStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if we're in an iframe/wrapper (showDirectoryPicker won't work)
  const isEmbedded = (): boolean => {
    try {
      return window.self !== window.top;
    } catch {
      return true; // If we can't access window.top, we're probably embedded
    }
  };

  const processFiles = (files: File[]) => {
    const tracks: Track[] = files
      .filter((file) => {
        const ext = file.name.split('.').pop()?.toLowerCase();
        return ['mp3', 'wav', 'flac', 'ogg', 'm4a', 'aac'].includes(ext || '');
      })
      .map((file) => ({
        id: crypto.randomUUID(),
        name: file.name.replace(/\.[^/.]+$/, ''),
        file,
        duration: 0,
      }));

    if (tracks.length > 0) {
      setPlaylist(tracks);
      onPlay();
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    processFiles(Array.from(files));
    // Reset input so the same folder can be selected again
    e.target.value = '';
  };

  const handleOpenFiles = async () => {
    // Always use file input fallback if embedded (showDirectoryPicker is blocked in iframes)
    if (isEmbedded()) {
      fileInputRef.current?.click();
      return;
    }

    // Try showDirectoryPicker for non-embedded contexts
    if ('showDirectoryPicker' in window) {
      try {
        const dirHandle = await (window as any).showDirectoryPicker();
        const files: File[] = [];
        
        for await (const entry of dirHandle.values()) {
          if (entry.kind === 'file') {
            const file = await entry.getFile();
            files.push(file);
          }
        }
        
        processFiles(files);
        return;
      } catch (error: any) {
        // User cancelled or permission denied - try fallback
        if (error?.name !== 'AbortError') {
          console.warn('showDirectoryPicker failed, using fallback:', error);
          fileInputRef.current?.click();
        }
        return;
      }
    }

    // Fallback for browsers without showDirectoryPicker
    fileInputRef.current?.click();
  };

  return (
    <div className="flex items-center justify-center gap-1 p-2">
      {/* Previous */}
      <button
        onClick={prevTrack}
        className="winamp-button p-2 hover:opacity-90"
        title="Previous"
      >
        <SkipBack size={14} />
      </button>

      {/* Play */}
      <button
        onClick={isPlaying ? onPause : onPlay}
        className={`winamp-button p-2 hover:opacity-90 ${isPlaying ? 'winamp-button-active' : ''}`}
        title={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? <Pause size={14} /> : <Play size={14} />}
      </button>

      {/* Stop */}
      <button
        onClick={onStop}
        className="winamp-button p-2 hover:opacity-90"
        title="Stop"
      >
        <Square size={14} />
      </button>

      {/* Next */}
      <button
        onClick={nextTrack}
        className="winamp-button p-2 hover:opacity-90"
        title="Next"
      >
        <SkipForward size={14} />
      </button>

      {/* Open */}
      <button
        onClick={handleOpenFiles}
        className="winamp-button p-2 hover:opacity-90 ml-2"
        title="Open folder"
      >
        <FolderOpen size={14} />
      </button>

      {/* Hidden file input for fallback (works in iframes/wrappers) */}
      <input
        ref={fileInputRef}
        type="file"
        webkitdirectory=""
        directory=""
        multiple
        accept="audio/*"
        style={{ display: 'none' }}
        onChange={handleFileInputChange}
      />
      {/* Shuffle */}
      <button
        onClick={toggleShuffle}
        className={`winamp-button p-2 hover:opacity-90 ml-2 ${isShuffle ? 'winamp-button-active' : ''}`}
        title="Shuffle"
      >
        <Shuffle size={14} />
      </button>

      {/* Repeat */}
      <button
        onClick={toggleRepeat}
        className={`winamp-button p-2 hover:opacity-90 ${repeatMode !== 'none' ? 'winamp-button-active' : ''}`}
        title={`Repeat: ${repeatMode}`}
      >
        {repeatMode === 'one' ? <Repeat1 size={14} /> : <Repeat size={14} />}
      </button>
    </div>
  );
};
