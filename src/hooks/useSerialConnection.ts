import { useEffect, useRef, useCallback } from 'react';
import { useSerialStore } from '@/stores/serialStore';
import { useAudioStore } from '@/stores/audioStore';

// Get fresh state from stores (avoid stale closures)
const getAudioState = () => useAudioStore.getState();
const getSerialState = () => useSerialStore.getState();

// Web Serial API type declarations
declare global {
  interface Navigator {
    serial: {
      requestPort: () => Promise<SerialPortType>;
      getPorts: () => Promise<SerialPortType[]>;
    };
  }
}

interface SerialPortType {
  open: (options: { baudRate: number }) => Promise<void>;
  close: () => Promise<void>;
  readable: ReadableStream<Uint8Array> | null;
  writable: WritableStream<Uint8Array> | null;
}

export const useSerialConnection = (seek: (time: number) => void) => {
  const writerRef = useRef<WritableStreamDefaultWriter<Uint8Array> | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const lastSentTargetRef = useRef<number>(-1);
  const lastSendTimeRef = useRef<number>(0);
  const lastTouchUpdateRef = useRef<number>(0);
  const lastFaderPositionRef = useRef<number>(-1);
  const lastSetTimeRef = useRef<number>(-1);
  
  const {
    isConnected,
    port,
    setIsConnected,
    setPort,
    setFaderPosition,
    setTargetPosition,
    setIsTouching,
    setArduinoVolume,
  } = useSerialStore();
  
  const {
    duration,
    currentTime,
    isPlaying,
    setIsPlaying,
    setVolume,
    nextTrack,
    prevTrack,
  } = useAudioStore();

  // Send TARGET command to Arduino (only during SYNC mode)
  const sendTarget = useCallback((value: number) => {
    if (!writerRef.current) return;
    
    const now = Date.now();
    // Rate limit: minimum 100ms between sends
    if (now - lastSendTimeRef.current < 100) return;
    // Don't send if same value
    if (value === lastSentTargetRef.current) return;
    
    const command = `TARGET:${Math.round(value)}\n`;
    const encoder = new TextEncoder();
    writerRef.current.write(encoder.encode(command)).catch(console.error);
    
    lastSentTargetRef.current = value;
    lastSendTimeRef.current = now;
    setTargetPosition(value);
  }, [setTargetPosition]);

  // Process incoming serial data
  const processMessage = useCallback((message: string) => {
    const trimmed = message.trim();
    if (!trimmed) return;
    
    console.log('Arduino:', trimmed);
    
    if (trimmed.startsWith('TOUCH:')) {
      // Fader touched - user is scrubbing manually
      const position = parseInt(trimmed.split(':')[1], 10);
      if (isNaN(position)) return;
      
      setIsTouching(true);
      setFaderPosition(position);
      
      const now = Date.now();
      // Rate limit touch updates to 100ms
      if (now - lastTouchUpdateRef.current < 100) return;
      
      // First touch initialization
      if (lastFaderPositionRef.current === -1) {
        lastFaderPositionRef.current = position;
        return;
      }
      
      // Only update if significant movement (>5 units)
      if (Math.abs(position - lastFaderPositionRef.current) > 5) {
        if (duration > 0) {
          // Convert fader 0-1023 to audio time in seconds
          const newTime = (position / 1023) * duration;
          const newTimeMs = newTime * 1000;
          
          // Only update if significant time difference (>500ms)
          if (Math.abs(newTimeMs - lastSetTimeRef.current) > 500) {
            console.log(`Seeking to ${newTime.toFixed(2)}s (TOUCH)`);
            seek(newTime);
            lastSetTimeRef.current = newTimeMs;
            lastFaderPositionRef.current = position;
          }
        }
      }
      
      lastTouchUpdateRef.current = now;
      
      // Keep playback active during touch
      if (!isPlaying) {
        setIsPlaying(true);
      }
      
    } else if (trimmed.startsWith('SYNC:')) {
      // Fader not touched - sync mode, send TARGET to Arduino
      const position = parseInt(trimmed.split(':')[1], 10);
      if (isNaN(position)) return;
      
      setIsTouching(false);
      setFaderPosition(position);
      lastFaderPositionRef.current = -1; // Reset for next touch
      
      // Calculate target position from current audio time using FRESH state
      const { currentTime: freshTime, duration: freshDuration } = getAudioState();
      if (freshDuration > 0) {
        const targetPosition = Math.round((freshTime / freshDuration) * 1023);
        console.log(`SYNC: sending TARGET:${targetPosition} (time: ${freshTime.toFixed(2)}s / ${freshDuration.toFixed(2)}s)`);
        sendTarget(targetPosition);
      }
      
    } else if (trimmed.startsWith('VOLUME:')) {
      // Volume control from Arduino potentiometer
      const value = parseInt(trimmed.split(':')[1], 10);
      if (isNaN(value)) return;
      
      setArduinoVolume(value);
      // Convert 0-1023 to 0-1 volume
      const normalizedVolume = value / 1023;
      setVolume(normalizedVolume);
      
    } else if (trimmed.startsWith('ENCODER:')) {
      // Rotary encoder navigation - check CCW FIRST (more specific)
      if (trimmed.includes('CCW')) {
        console.log('Previous track (encoder CCW)');
        getAudioState().prevTrack();
      } else if (trimmed.includes('CW')) {
        console.log('Next track (encoder CW)');
        getAudioState().nextTrack();
      }
      
    } else if (trimmed.startsWith('ENCODER_BTN')) {
      // Encoder button - toggle play/pause using fresh state
      const currentlyPlaying = getAudioState().isPlaying;
      console.log(`Toggle play/pause (encoder button) - was: ${currentlyPlaying}`);
      getAudioState().setIsPlaying(!currentlyPlaying);
    }
  }, [duration, setVolume, seek, sendTarget, setFaderPosition, setIsTouching, setArduinoVolume]);

  // Read serial data continuously
  const readLoop = useCallback(async (reader: ReadableStreamDefaultReader<Uint8Array>) => {
    const decoder = new TextDecoder();
    let buffer = '';
    
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        // Process complete lines
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer
        
        for (const line of lines) {
          processMessage(line);
        }
      }
    } catch (error) {
      console.error('Serial read error:', error);
    }
  }, [processMessage]);

  // Connect to serial port
  const connect = useCallback(async () => {
    if (!('serial' in navigator)) {
      alert('Web Serial API not supported in this browser. Use Chrome or Edge.');
      return;
    }
    
    try {
      // Request port selection
      const selectedPort = await (navigator as any).serial.requestPort();
      
      // Open with 115200 baud
      await selectedPort.open({ baudRate: 115200 });
      
      setPort(selectedPort);
      setIsConnected(true);
      
      // Setup writer
      if (selectedPort.writable) {
        writerRef.current = selectedPort.writable.getWriter();
      }
      
      // Setup reader and start reading
      if (selectedPort.readable) {
        readerRef.current = selectedPort.readable.getReader();
        readLoop(readerRef.current);
      }
      
      console.log('Serial connected at 115200 baud');
      
    } catch (error) {
      console.error('Serial connection error:', error);
      setIsConnected(false);
    }
  }, [setPort, setIsConnected, readLoop]);

  // Disconnect from serial port
  const disconnect = useCallback(async () => {
    try {
      if (readerRef.current) {
        await readerRef.current.cancel();
        readerRef.current.releaseLock();
        readerRef.current = null;
      }
      
      if (writerRef.current) {
        writerRef.current.releaseLock();
        writerRef.current = null;
      }
      
      if (port) {
        await port.close();
      }
      
      setPort(null);
      setIsConnected(false);
      lastSentTargetRef.current = -1;
      
      console.log('Serial disconnected');
      
    } catch (error) {
      console.error('Serial disconnect error:', error);
    }
  }, [port, setPort, setIsConnected]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isConnected) {
        disconnect();
      }
    };
  }, []);

  return {
    isConnected,
    connect,
    disconnect,
    sendTarget,
  };
};
