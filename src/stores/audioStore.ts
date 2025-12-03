import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Track {
  id: string;
  name: string;
  file: File;
  duration: number;
}

export type Theme = 'classic-blue' | 'dark-metal' | 'neon' | 'gold' | 'minimal-grey';

export interface EQPreset {
  name: string;
  values: number[];
}

export const EQ_PRESETS: EQPreset[] = [
  { name: 'Flat', values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { name: 'Rock', values: [5, 4, 3, 1, -1, -1, 0, 2, 3, 4] },
  { name: 'Pop', values: [-2, -1, 0, 2, 4, 4, 2, 0, -1, -2] },
  { name: 'Jazz', values: [4, 3, 1, 2, -2, -2, 0, 1, 3, 4] },
  { name: 'Classical', values: [5, 4, 3, 2, -1, -1, 0, 2, 3, 5] },
  { name: 'Bass Boost', values: [6, 5, 4, 2, 0, 0, 0, 0, 0, 0] },
  { name: 'Treble', values: [0, 0, 0, 0, 0, 1, 2, 4, 5, 6] },
  { name: 'Vocal', values: [-2, -3, -3, 1, 4, 4, 3, 1, 0, -2] },
];

export const EQ_FREQUENCIES = [31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

interface AudioState {
  // Playback
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isShuffle: boolean;
  repeatMode: 'none' | 'one' | 'all';
  
  // Playlist
  playlist: Track[];
  currentTrackIndex: number;
  
  // Equalizer
  eqEnabled: boolean;
  eqValues: number[];
  currentPreset: string;
  
  // UI
  theme: Theme;
  showEqualizer: boolean;
  showPlaylist: boolean;
  
  // Actions
  setIsPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  
  setPlaylist: (tracks: Track[]) => void;
  addTracks: (tracks: Track[]) => void;
  removeTrack: (id: string) => void;
  reorderPlaylist: (fromIndex: number, toIndex: number) => void;
  setCurrentTrackIndex: (index: number) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  
  setEqEnabled: (enabled: boolean) => void;
  setEqValue: (index: number, value: number) => void;
  setEqPreset: (preset: EQPreset) => void;
  
  setTheme: (theme: Theme) => void;
  toggleEqualizer: () => void;
  togglePlaylist: () => void;
}

export const useAudioStore = create<AudioState>()(
  persist(
    (set, get) => ({
      // Initial state
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: 0.7,
      isShuffle: false,
      repeatMode: 'none',
      
      playlist: [],
      currentTrackIndex: 0,
      
      eqEnabled: true,
      eqValues: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      currentPreset: 'Flat',
      
      theme: 'classic-blue',
      showEqualizer: true,
      showPlaylist: true,
      
      // Actions
      setIsPlaying: (playing) => set({ isPlaying: playing }),
      setCurrentTime: (time) => set({ currentTime: time }),
      setDuration: (duration) => set({ duration: duration }),
      setVolume: (volume) => set({ volume: volume }),
      toggleShuffle: () => set((state) => ({ isShuffle: !state.isShuffle })),
      toggleRepeat: () => set((state) => ({
        repeatMode: state.repeatMode === 'none' ? 'all' : state.repeatMode === 'all' ? 'one' : 'none'
      })),
      
      setPlaylist: (tracks) => set({ playlist: tracks, currentTrackIndex: 0 }),
      addTracks: (tracks) => set((state) => ({ playlist: [...state.playlist, ...tracks] })),
      removeTrack: (id) => set((state) => ({
        playlist: state.playlist.filter((t) => t.id !== id),
        currentTrackIndex: Math.min(state.currentTrackIndex, state.playlist.length - 2)
      })),
      reorderPlaylist: (fromIndex, toIndex) => set((state) => {
        const newPlaylist = [...state.playlist];
        const [removed] = newPlaylist.splice(fromIndex, 1);
        newPlaylist.splice(toIndex, 0, removed);
        
        let newCurrentIndex = state.currentTrackIndex;
        if (fromIndex === state.currentTrackIndex) {
          newCurrentIndex = toIndex;
        } else if (fromIndex < state.currentTrackIndex && toIndex >= state.currentTrackIndex) {
          newCurrentIndex--;
        } else if (fromIndex > state.currentTrackIndex && toIndex <= state.currentTrackIndex) {
          newCurrentIndex++;
        }
        
        return { playlist: newPlaylist, currentTrackIndex: newCurrentIndex };
      }),
      setCurrentTrackIndex: (index) => set({ currentTrackIndex: index }),
      nextTrack: () => set((state) => {
        if (state.playlist.length === 0) return state;
        
        if (state.isShuffle) {
          const randomIndex = Math.floor(Math.random() * state.playlist.length);
          return { currentTrackIndex: randomIndex };
        }
        
        const nextIndex = (state.currentTrackIndex + 1) % state.playlist.length;
        return { currentTrackIndex: nextIndex };
      }),
      prevTrack: () => set((state) => {
        if (state.playlist.length === 0) return state;
        
        const prevIndex = state.currentTrackIndex === 0 
          ? state.playlist.length - 1 
          : state.currentTrackIndex - 1;
        return { currentTrackIndex: prevIndex };
      }),
      
      setEqEnabled: (enabled) => set({ eqEnabled: enabled }),
      setEqValue: (index, value) => set((state) => {
        const newValues = [...state.eqValues];
        newValues[index] = value;
        return { eqValues: newValues, currentPreset: 'Custom' };
      }),
      setEqPreset: (preset) => set({ eqValues: [...preset.values], currentPreset: preset.name }),
      
      setTheme: (theme) => set({ theme: theme }),
      toggleEqualizer: () => set((state) => ({ showEqualizer: !state.showEqualizer })),
      togglePlaylist: () => set((state) => ({ showPlaylist: !state.showPlaylist })),
    }),
    {
      name: 'winamp-storage',
      partialize: (state) => ({
        volume: state.volume,
        eqEnabled: state.eqEnabled,
        eqValues: state.eqValues,
        currentPreset: state.currentPreset,
        theme: state.theme,
        showEqualizer: state.showEqualizer,
        showPlaylist: state.showPlaylist,
        isShuffle: state.isShuffle,
        repeatMode: state.repeatMode,
      }),
    }
  )
);
