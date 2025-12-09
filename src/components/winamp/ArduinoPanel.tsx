import React, { useState } from 'react';
import { useSerialStore } from '@/stores/serialStore';
import { Usb, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const { faderPosition, isTouching, arduinoVolume } = useSerialStore();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="glass-panel rounded-2xl overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-secondary/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${isConnected ? 'bg-eq-green/20' : 'bg-secondary/50'}`}>
            <Usb size={18} className={isConnected ? 'text-eq-green' : 'text-muted-foreground'} />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium">Arduino Controller</p>
            <p className={`text-xs ${isConnected ? 'text-eq-green' : 'text-muted-foreground'}`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </p>
          </div>
        </div>
        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4">
              <button
                onClick={isConnected ? onDisconnect : onConnect}
                className={`w-full py-2 rounded-xl text-sm font-medium transition-all ${
                  isConnected 
                    ? 'bg-destructive/20 text-destructive hover:bg-destructive/30' 
                    : 'modern-btn-primary'
                }`}
              >
                {isConnected ? 'Disconnect' : 'Connect Arduino'}
              </button>

              {isConnected && (
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fader</span>
                    <span className="font-mono">{faderPosition}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted/30">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(faderPosition / 1023) * 100}%`,
                        background: isTouching ? 'hsl(var(--eq-yellow))' : 'hsl(var(--player-glow))',
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isTouching ? 'bg-eq-yellow' : 'bg-muted-foreground/30'}`} />
                    <span className="text-muted-foreground">{isTouching ? 'Touched' : 'Idle'}</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
