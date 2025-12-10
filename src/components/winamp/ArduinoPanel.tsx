import React, { useState } from 'react';
import { useSerialStore } from '@/stores/serialStore';
import { Usb, ChevronDown, ChevronUp, Gauge, Hand, Volume2, RotateCw } from 'lucide-react';
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
  const { faderPosition, isTouching, arduinoVolume, lastEncoderDirection } = useSerialStore();
  const [isExpanded, setIsExpanded] = useState(true);

  const volumePercent = Math.round((arduinoVolume / 1023) * 100);
  const faderPercent = Math.round((faderPosition / 1023) * 100);

  return (
    <div className="glass-panel rounded-2xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-secondary/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full transition-colors ${isConnected ? 'bg-eq-green/20' : 'bg-secondary/50'}`}>
            <Usb size={18} className={isConnected ? 'text-eq-green' : 'text-muted-foreground'} />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium">Arduino Controller</p>
            <p className={`text-xs ${isConnected ? 'text-eq-green' : 'text-muted-foreground'}`}>
              {isConnected ? 'Connected • Serial 115200' : 'Disconnected'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isConnected && (
            <div className="flex items-center gap-1.5 mr-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${isTouching ? 'bg-eq-yellow' : 'bg-eq-green'}`} />
            </div>
          )}
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4">
              {/* Connect/Disconnect button */}
              <button
                onClick={isConnected ? onDisconnect : onConnect}
                className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isConnected 
                    ? 'bg-destructive/20 text-destructive hover:bg-destructive/30 border border-destructive/30' 
                    : 'modern-btn-primary'
                }`}
              >
                {isConnected ? 'Disconnect Arduino' : 'Connect Arduino'}
              </button>

              {/* Data display when connected */}
              {isConnected && (
                <div className="space-y-3">
                  {/* Fader Position */}
                  <div className="p-3 rounded-xl bg-secondary/30 border border-border/30">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Gauge size={14} className="text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Fader Position</span>
                      </div>
                      <span className="font-mono text-sm">{faderPosition} <span className="text-muted-foreground text-xs">({faderPercent}%)</span></span>
                    </div>
                    <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        initial={false}
                        animate={{ width: `${faderPercent}%` }}
                        transition={{ duration: 0.1, ease: 'linear' }}
                        style={{
                          background: isTouching 
                            ? 'linear-gradient(90deg, hsl(var(--eq-yellow)), hsl(var(--eq-yellow) / 0.7))' 
                            : 'linear-gradient(90deg, hsl(var(--player-glow)), hsl(var(--player-glow-secondary)))',
                        }}
                      />
                    </div>
                  </div>

                  {/* Volume & Touch Status Row */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Volume */}
                    <div className="p-3 rounded-xl bg-secondary/30 border border-border/30">
                      <div className="flex items-center gap-2 mb-1">
                        <Volume2 size={14} className="text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Volume</span>
                      </div>
                      <span className="font-mono text-lg font-semibold">{volumePercent}%</span>
                    </div>

                    {/* Touch Status */}
                    <div className="p-3 rounded-xl bg-secondary/30 border border-border/30">
                      <div className="flex items-center gap-2 mb-1">
                        <Hand size={14} className="text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Touch</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full transition-colors ${isTouching ? 'bg-eq-yellow shadow-[0_0_8px_hsl(var(--eq-yellow))]' : 'bg-muted-foreground/30'}`} />
                        <span className={`text-sm font-medium ${isTouching ? 'text-eq-yellow' : 'text-muted-foreground'}`}>
                          {isTouching ? 'Active' : 'Idle'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Encoder Status */}
                  <div className="p-3 rounded-xl bg-secondary/30 border border-border/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <RotateCw size={14} className="text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Encoder</span>
                      </div>
                      <span className={`text-sm font-mono ${lastEncoderDirection ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {lastEncoderDirection || 'Waiting...'}
                      </span>
                    </div>
                  </div>

                  {/* Raw Data */}
                  <div className="pt-2 border-t border-border/20">
                    <p className="text-[10px] text-muted-foreground/60 font-mono">
                      RAW: Fader={faderPosition} | Vol={arduinoVolume} | Touch={isTouching ? '1' : '0'}
                    </p>
                  </div>
                </div>
              )}

              {/* Help text when not connected */}
              {!isConnected && (
                <p className="text-xs text-muted-foreground text-center">
                  Connect your Arduino via USB to control the player with a motorized fader
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};