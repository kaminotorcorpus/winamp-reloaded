import React from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Repeat1, 
  FolderOpen 
} from 'lucide-react';
import { useAudioStore, Track } from '@/stores/audioStore';
import { motion } from 'framer-motion';

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

  const handleOpenFiles = async () => {
    try {
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
    <div className="flex items-center justify-center gap-2">
      {/* Shuffle */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={toggleShuffle}
        className={`modern-btn rounded-full p-2.5 ${isShuffle ? 'text-primary' : 'text-muted-foreground'}`}
        title="Shuffle"
      >
        <Shuffle size={18} />
      </motion.button>

      {/* Previous */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={prevTrack}
        className="modern-btn rounded-full p-3"
        title="Previous"
      >
        <SkipBack size={22} fill="currentColor" />
      </motion.button>

      {/* Play/Pause - Large center button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
        onClick={isPlaying ? onPause : onPlay}
        className={`modern-btn-primary rounded-full p-5 ${isPlaying ? 'pulse-ring' : ''}`}
        title={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
      </motion.button>

      {/* Next */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={nextTrack}
        className="modern-btn rounded-full p-3"
        title="Next"
      >
        <SkipForward size={22} fill="currentColor" />
      </motion.button>

      {/* Repeat */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={toggleRepeat}
        className={`modern-btn rounded-full p-2.5 ${repeatMode !== 'none' ? 'text-primary' : 'text-muted-foreground'}`}
        title={`Repeat: ${repeatMode}`}
      >
        {repeatMode === 'one' ? <Repeat1 size={18} /> : <Repeat size={18} />}
      </motion.button>

      {/* Open folder - smaller, off to the side */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={handleOpenFiles}
        className="modern-btn rounded-full p-2.5 ml-4 text-muted-foreground"
        title="Open folder"
      >
        <FolderOpen size={18} />
      </motion.button>
    </div>
  );
};
