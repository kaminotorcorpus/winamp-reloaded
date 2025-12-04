import React from 'react';
import { Plug, Unplug, Activity } from 'lucide-react';
import { useSerialStore } from '@/stores/serialStore';

interface ArduinoPanelProps {
  isConnected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

export const ArduinoPanel: React.FC<ArduinoPanelProps> = ({
  isConnected,
  onConnect,
  onDisconnect,
}) => {
  const { faderPosition, targetPosition, isTouching, arduinoVolume } = useSerialStore();

  return (
    <div className="winamp-window">
      {/* Title bar */}
      <div className="winamp-title-bar flex items-center justify-between px-2 py-1">
        <div className="flex items-center gap-2">
          <Activity size={10} />
          <span className="text-[10px] font-bold tracking-wider">ARDUINO CONTROL</span>
        </div>
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
      </div>

      <div className="p-3 space-y-3">
        {/* Connection button */}
        <button
          onClick={isConnected ? onDisconnect : onConnect}
          className={`winamp-button w-full py-2 px-3 flex items-center justify-center gap-2 ${
            isConnected ? 'winamp-button-active' : ''
          }`}
        >
          {isConnected ? (
            <>
              <Unplug size={14} />
              <span className="text-xs">Disconnect</span>
            </>
          ) : (
            <>
              <Plug size={14} />
              <span className="text-xs">Connect Arduino</span>
            </>
          )}
        </button>

        {/* Status display */}
        <div className="winamp-display p-2 space-y-2 text-[10px] font-mono">
          {/* Connection status */}
          <div className="flex justify-between items-center">
            <span className="opacity-70">Status:</span>
            <span className={isConnected ? 'text-green-400' : 'text-red-400'}>
              {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
            </span>
          </div>

          {isConnected && (
            <>
              {/* Touch state */}
              <div className="flex justify-between items-center">
                <span className="opacity-70">Touch:</span>
                <span className={isTouching ? 'text-yellow-400' : 'text-gray-400'}>
                  {isTouching ? 'ACTIVE' : 'IDLE'}
                </span>
              </div>

              {/* Fader position */}
              <div className="flex justify-between items-center">
                <span className="opacity-70">Fader Pos:</span>
                <span className="text-winamp-text">{faderPosition}</span>
              </div>

              {/* Target position */}
              <div className="flex justify-between items-center">
                <span className="opacity-70">Target Pos:</span>
                <span className="text-winamp-text">{targetPosition}</span>
              </div>

              {/* Arduino volume */}
              <div className="flex justify-between items-center">
                <span className="opacity-70">Volume:</span>
                <span className="text-winamp-text">{Math.round((arduinoVolume / 1023) * 100)}%</span>
              </div>

              {/* Visual fader indicator */}
              <div className="pt-2">
                <div className="text-[8px] opacity-70 mb-1">FADER POSITION</div>
                <div className="relative h-2 bg-black/50 rounded overflow-hidden">
                  <div
                    className="absolute h-full bg-winamp-accent transition-all duration-75"
                    style={{ width: `${(faderPosition / 1023) * 100}%` }}
                  />
                  {/* Target indicator */}
                  <div
                    className="absolute h-full w-0.5 bg-yellow-400 transition-all duration-75"
                    style={{ left: `${(targetPosition / 1023) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-[8px] opacity-50 mt-0.5">
                  <span>0</span>
                  <span>1023</span>
                </div>
              </div>
            </>
          )}

          {!isConnected && (
            <div className="text-center py-2 opacity-50">
              Click "Connect Arduino" to select serial port
            </div>
          )}
        </div>

        {/* Instructions */}
        {isConnected && (
          <div className="text-[8px] opacity-50 space-y-1">
            <div>• Touch fader to scrub audio</div>
            <div>• Rotate encoder: Next/Prev track</div>
            <div>• Press encoder: Play/Pause</div>
            <div>• Volume pot: Adjust volume</div>
          </div>
        )}
      </div>
    </div>
  );
};
