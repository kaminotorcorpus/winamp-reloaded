import React from 'react';
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
    setIsPlaying,
  } = useAudioStore();

  const handleOpenFiles = async () => {
    try {
      // Try directory picker first
      if ('showDirectoryPicker' in window) {
        const dirHandle = await (window as any).showDirectoryPicker();
        const tracks: Track[] = [];
        
        for await (const entry of dirHandle.values()) {
          if (entry.kind === 'file') {
            const file = await entry.getFile();
            const ext = file.name.split('.').pop()?.toLowerCase();
            
            if (['mp3', 'wav', 'flac', 'ogg', 'm4a', 'aac'].includes(ext || '')) {
              tracks.push({
                id: crypto.randomUUID(),
                name: file.name.replace(/\.[^/.]+$/, ''),
                file,
                duration: 0,
              });
            }
          }
        }
        
        if (tracks.length > 0) {
          setPlaylist(tracks);
          onPlay();
        }
      } else {
        // Fallback to file input
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = 'audio/*';
        
        input.onchange = (e) => {
          const files = (e.target as HTMLInputElement).files;
          if (!files) return;
          
          const tracks: Track[] = Array.from(files).map((file) => ({
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
        
        input.click();
      }
    } catch (error) {
      console.error('Error loading files:', error);
    }
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
