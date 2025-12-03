import { useEffect, useRef, useCallback } from 'react';
import { useAudioStore, EQ_FREQUENCIES, Track } from '@/stores/audioStore';

export const useAudioEngine = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const analyserNodeRef = useRef<AnalyserNode | null>(null);
  const eqFiltersRef = useRef<BiquadFilterNode[]>([]);
  const objectUrlRef = useRef<string | null>(null);

  const {
    isPlaying,
    setIsPlaying,
    volume,
    currentTime,
    setCurrentTime,
    setDuration,
    playlist,
    currentTrackIndex,
    setCurrentTrackIndex,
    eqEnabled,
    eqValues,
    repeatMode,
    nextTrack,
  } = useAudioStore();

  // Initialize audio context and nodes
  const initAudioContext = useCallback(() => {
    if (audioContextRef.current) return;

    const audioContext = new AudioContext();
    audioContextRef.current = audioContext;

    // Create audio element
    const audioElement = new Audio();
    audioElement.crossOrigin = 'anonymous';
    audioElementRef.current = audioElement;

    // Create nodes
    const sourceNode = audioContext.createMediaElementSource(audioElement);
    sourceNodeRef.current = sourceNode;

    const gainNode = audioContext.createGain();
    gainNodeRef.current = gainNode;
    gainNode.gain.value = volume;

    const analyserNode = audioContext.createAnalyser();
    analyserNode.fftSize = 256;
    analyserNodeRef.current = analyserNode;

    // Create EQ filters
    const filters = EQ_FREQUENCIES.map((freq, index) => {
      const filter = audioContext.createBiquadFilter();
      filter.type = index === 0 ? 'lowshelf' : index === EQ_FREQUENCIES.length - 1 ? 'highshelf' : 'peaking';
      filter.frequency.value = freq;
      filter.Q.value = 1;
      filter.gain.value = eqValues[index];
      return filter;
    });
    eqFiltersRef.current = filters;

    // Connect nodes: source -> filters -> gain -> analyser -> destination
    let lastNode: AudioNode = sourceNode;
    filters.forEach((filter) => {
      lastNode.connect(filter);
      lastNode = filter;
    });
    lastNode.connect(gainNode);
    gainNode.connect(analyserNode);
    analyserNode.connect(audioContext.destination);

    // Event listeners
    audioElement.addEventListener('timeupdate', () => {
      setCurrentTime(audioElement.currentTime);
    });

    audioElement.addEventListener('loadedmetadata', () => {
      setDuration(audioElement.duration);
    });

    audioElement.addEventListener('ended', () => {
      if (repeatMode === 'one') {
        audioElement.currentTime = 0;
        audioElement.play();
      } else if (repeatMode === 'all' || currentTrackIndex < playlist.length - 1) {
        nextTrack();
      } else {
        setIsPlaying(false);
      }
    });
  }, []);

  // Update volume
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume;
    }
  }, [volume]);

  // Update EQ values
  useEffect(() => {
    eqFiltersRef.current.forEach((filter, index) => {
      if (eqEnabled) {
        filter.gain.value = eqValues[index];
      } else {
        filter.gain.value = 0;
      }
    });
  }, [eqValues, eqEnabled]);

  // Load and play track
  useEffect(() => {
    if (!audioElementRef.current || playlist.length === 0) return;
    if (currentTrackIndex < 0 || currentTrackIndex >= playlist.length) return;

    const track = playlist[currentTrackIndex];
    if (!track) return;

    // Clean up previous object URL
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }

    const url = URL.createObjectURL(track.file);
    objectUrlRef.current = url;
    audioElementRef.current.src = url;
    audioElementRef.current.load();

    if (isPlaying) {
      audioElementRef.current.play().catch(console.error);
    }
  }, [currentTrackIndex, playlist]);

  // Play/Pause control
  useEffect(() => {
    if (!audioElementRef.current) return;

    if (isPlaying) {
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }
      audioElementRef.current.play().catch(() => {
        setIsPlaying(false);
      });
    } else {
      audioElementRef.current.pause();
    }
  }, [isPlaying, setIsPlaying]);

  const play = useCallback(() => {
    initAudioContext();
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }
    setIsPlaying(true);
  }, [initAudioContext, setIsPlaying]);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, [setIsPlaying]);

  const stop = useCallback(() => {
    setIsPlaying(false);
    if (audioElementRef.current) {
      audioElementRef.current.currentTime = 0;
    }
    setCurrentTime(0);
  }, [setIsPlaying, setCurrentTime]);

  const seek = useCallback((time: number) => {
    if (audioElementRef.current) {
      audioElementRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, [setCurrentTime]);

  const getAnalyserData = useCallback(() => {
    if (!analyserNodeRef.current) return new Uint8Array(0);
    const dataArray = new Uint8Array(analyserNodeRef.current.frequencyBinCount);
    analyserNodeRef.current.getByteTimeDomainData(dataArray);
    return dataArray;
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    play,
    pause,
    stop,
    seek,
    getAnalyserData,
    initAudioContext,
  };
};
