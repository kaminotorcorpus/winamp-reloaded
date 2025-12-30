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

  const handleFiles = (files: FileList) => {
    const tracks: Track[] = Array.from(files)
      .filter((file) =>
        ['mp3', 'wav', 'flac', 'ogg', 'm4a', 'aac'].includes(
          file.name.split('.').pop()?.toLowerCase() || ''
        )
      )
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

  const handleOpenFiles = async () => {
    const isEmbedded = window.top !== window.self; // detect iframe/wrapper
    const supportsDirPicker = 'showDirectoryPicker' in window;

    try {
      // ✅ Use showDirectoryPicker only if allowed (not embedded)
      if (!isEmbedded && supportsDirPicker) {
        const dirHandle = await (window as any).showDirectoryPicker();
        const files: File[] = [];

        for await (const entry of dirHandle.values()) {
          if (entry.kind === 'file') {
            const file = await entry.getFile();
            files.push(file);
          }
        }

        handleFiles({
          length: files.length,
          item: (i: number) => files[i],
        } as FileList);
      } else {
        // 🧩 Fallback: input type="file" webkitdirectory
        fileInputRef.current?.click();
      }
    } catch (error) {
      console.warn('Error loading files:', error);
      // Fallback if picker failed unexpectedly
      fileInputRef.current?.click();
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
        className={`winamp-button p-2 hover:opacity-90 ${
          isPlaying ? 'winamp-button-active' : ''
        }`}
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

      {/* Open Folder */}
      <button
        onClick={handleOpenFiles}
        className="winamp-button p-2 hover:opacity-90 ml-2"
        title="Open folder"
      >
        <FolderOpen size={14} />
      </button>

      {/* Hidden fallback input */}
      <input
        ref={fileInputRef}
        type="file"
        webkitdirectory=""
        multiple
        accept="audio/*"
        style={{ display: 'none' }}
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />

      {/* Shuffle */}
      <button
        onClick={toggleShuffle}
        className={`winamp-button p-2 hover:opacity-90 ml-2 ${
          isShuffle ? 'winamp-button-active' : ''
        }`}
        title="Shuffle"
      >
        <Shuffle size={14} />
      </button>

      {/* Repeat */}
      <button
        onClick={toggleRepeat}
        className={`winamp-button p-2 hover:opacity-90 ${
          repeatMode !== 'none' ? 'winamp-button-active' : ''
        }`}
        title={`Repeat: ${repeatMode}`}
      >
        {repeatMode === 'one' ? <Repeat1 size={14} /> : <Repeat size={14} />}
      </button>
    </div>
  );
};
