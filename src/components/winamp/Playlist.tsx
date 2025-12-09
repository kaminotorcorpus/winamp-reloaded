import React, { useState } from 'react';
import { useAudioStore } from '@/stores/audioStore';
import { Trash2, GripVertical, Music, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Playlist: React.FC = () => {
  const {
    showPlaylist,
    togglePlaylist,
    playlist,
    currentTrackIndex,
    setCurrentTrackIndex,
    removeTrack,
    reorderPlaylist,
    setIsPlaying,
  } = useAudioStore();

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      reorderPlaylist(draggedIndex, dragOverIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDoubleClick = (index: number) => {
    setCurrentTrackIndex(index);
    setIsPlaying(true);
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      {showPlaylist && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="glass-panel rounded-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
            <div className="flex items-center gap-2">
              <Music size={18} className="text-primary" />
              <span className="font-medium">Playlist</span>
              <span className="text-xs text-muted-foreground">
                {playlist.length} tracks
              </span>
            </div>
            <button 
              onClick={togglePlaylist}
              className="p-1 rounded-full hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Track list */}
          <div className="max-h-[200px] overflow-y-auto scrollbar-modern p-2">
            {playlist.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Music size={32} className="text-muted-foreground/30 mb-2" />
                <p className="text-muted-foreground text-sm">
                  No tracks loaded
                </p>
                <p className="text-muted-foreground/60 text-xs mt-1">
                  Click the folder icon to add music
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {playlist.map((track, index) => (
                  <motion.div
                    key={track.id}
                    layout
                    draggable
                    onDragStart={(e) => handleDragStart(e as any, index)}
                    onDragOver={(e) => handleDragOver(e as any, index)}
                    onDragEnd={handleDragEnd}
                    onDoubleClick={() => handleDoubleClick(index)}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer
                      transition-all group
                      ${index === currentTrackIndex 
                        ? 'bg-primary/20 text-foreground' 
                        : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                      }
                      ${dragOverIndex === index ? 'bg-primary/30' : ''}
                      ${draggedIndex === index ? 'opacity-50' : ''}
                    `}
                  >
                    <GripVertical 
                      size={14} 
                      className="opacity-0 group-hover:opacity-50 cursor-grab flex-shrink-0" 
                    />
                    
                    {/* Track number or playing indicator */}
                    <span className={`text-xs w-6 flex-shrink-0 font-mono ${
                      index === currentTrackIndex ? 'text-primary' : ''
                    }`}>
                      {index === currentTrackIndex ? '▶' : (index + 1).toString().padStart(2, '0')}
                    </span>
                    
                    <span className="text-sm truncate flex-1">
                      {track.name}
                    </span>
                    
                    <span className="text-xs flex-shrink-0 opacity-60 font-mono">
                      {formatDuration(track.duration)}
                    </span>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeTrack(track.id);
                      }}
                      className="opacity-0 group-hover:opacity-70 hover:opacity-100 p-1 hover:text-destructive transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
