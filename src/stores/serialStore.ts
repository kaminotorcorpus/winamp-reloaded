import { create } from 'zustand';

interface SerialState {
  // Connection
  isConnected: boolean;
  port: any | null;
  
  // Fader state
  faderPosition: number;
  targetPosition: number;
  isTouching: boolean;
  
  // Volume from Arduino
  arduinoVolume: number;
  
  // Actions
  setIsConnected: (connected: boolean) => void;
  setPort: (port: any | null) => void;
  setFaderPosition: (position: number) => void;
  setTargetPosition: (position: number) => void;
  setIsTouching: (touching: boolean) => void;
  setArduinoVolume: (volume: number) => void;
}

export const useSerialStore = create<SerialState>((set) => ({
  isConnected: false,
  port: null,
  faderPosition: 0,
  targetPosition: 0,
  isTouching: false,
  arduinoVolume: 0,
  
  setIsConnected: (connected) => set({ isConnected: connected }),
  setPort: (port) => set({ port }),
  setFaderPosition: (position) => set({ faderPosition: position }),
  setTargetPosition: (position) => set({ targetPosition: position }),
  setIsTouching: (touching) => set({ isTouching: touching }),
  setArduinoVolume: (volume) => set({ arduinoVolume: volume }),
}));
