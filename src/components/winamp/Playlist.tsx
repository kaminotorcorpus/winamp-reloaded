import React, { useState } from 'react';
import { useAudioStore } from '@/stores/audioStore';
import { Trash2, GripVertical } from 'lucide-react';

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

  if (!showPlaylist) return null;

  return (
    <div className="winamp-window">
      {/* Title Bar */}
      <div className="winamp-titlebar h-5 flex items-center justify-between px-2">
        <span className="pixel-font text-foreground/80 text-[10px]">PLAYLIST</span>
        <button 
          onClick={togglePlaylist}
          className="winamp-button w-4 h-3 pixel-font text-[8px] hover:bg-destructive/80"
        >
          ×
        </button>
      </div>

      <div className="w-[300px] p-2">
        {/* Playlist header */}
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="pixel-font text-[10px] text-muted-foreground">
            {playlist.length} tracks
          </span>
        </div>

        {/* Track list */}
        <div className="winamp-lcd h-[150px] overflow-y-auto scrollbar-winamp">
          {playlist.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <span className="lcd-text-dim text-xs">
                Click 📁 to load music folder
              </span>
            </div>
          ) : (
            <div className="p-1 space-y-0.5">
              {playlist.map((track, index) => (
                <div
                  key={track.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  onDoubleClick={() => handleDoubleClick(index)}
                  className={`
                    flex items-center gap-1 px-1 py-0.5 cursor-pointer rounded-sm
                    transition-colors group
                    ${index === currentTrackIndex 
                      ? 'bg-accent/40 lcd-text' 
                      : 'lcd-text-dim hover:bg-accent/20 hover:text-[hsl(var(--winamp-lcd-text))]'
                    }
                    ${dragOverIndex === index ? 'bg-accent/60' : ''}
                    ${draggedIndex === index ? 'opacity-50' : ''}
                  `}
                >
                  <GripVertical 
                    size={10} 
                    className="opacity-0 group-hover:opacity-50 cursor-grab flex-shrink-0" 
                  />
                  <span className="text-[10px] w-4 flex-shrink-0">
                    {(index + 1).toString().padStart(2, '0')}
                  </span>
                  <span className="text-xs truncate flex-1">
                    {track.name}
                  </span>
                  <span className="text-[10px] flex-shrink-0 opacity-60">
                    {formatDuration(track.duration)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTrack(track.id);
                    }}
                    className="opacity-0 group-hover:opacity-70 hover:opacity-100 p-0.5"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Playlist controls */}
        <div className="flex gap-1 mt-2">
          <button className="winamp-button flex-1 py-1 pixel-font text-[8px]">
            + ADD
          </button>
          <button className="winamp-button flex-1 py-1 pixel-font text-[8px]">
            - REM
          </button>
          <button className="winamp-button flex-1 py-1 pixel-font text-[8px]">
            SEL
          </button>
          <button className="winamp-button flex-1 py-1 pixel-font text-[8px]">
            MISC
          </button>
        </div>
      </div>
    </div>
  );
};
