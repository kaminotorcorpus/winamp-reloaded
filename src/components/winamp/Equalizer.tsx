import React, { useState } from 'react';
import { useAudioStore, EQ_PRESETS } from '@/stores/audioStore';
import { Settings2, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Equalizer: React.FC = () => {
  const {
    showEqualizer,
    toggleEqualizer,
    eqEnabled,
    setEqEnabled,
    eqValues,
    setEqValue,
    setEqPreset,
    currentPreset,
  } = useAudioStore();

  const [showPresets, setShowPresets] = useState(false);

  const frequencyLabels = ['31', '62', '125', '250', '500', '1K', '2K', '4K', '8K', '16K'];

  return (
    <AnimatePresence>
      {showEqualizer && (
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
              <Settings2 size={18} className="text-primary" />
              <span className="font-medium">Equalizer</span>
            </div>
            <div className="flex items-center gap-2">
              {/* EQ Toggle */}
              <button
                onClick={() => setEqEnabled(!eqEnabled)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  eqEnabled 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary text-muted-foreground'
                }`}
              >
                {eqEnabled ? 'ON' : 'OFF'}
              </button>
              
              <button 
                onClick={toggleEqualizer}
                className="p-1 rounded-full hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* Presets dropdown */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <button
                  onClick={() => setShowPresets(!showPresets)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-secondary/50 hover:bg-secondary/70 transition-colors text-sm"
                >
                  <span className="text-muted-foreground">Preset:</span>
                  <span className="font-medium">{currentPreset}</span>
                  <ChevronDown size={16} className={`text-muted-foreground transition-transform ${showPresets ? 'rotate-180' : ''}`} />
                </button>
                
                <AnimatePresence>
                  {showPresets && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-1 z-50 glass-panel rounded-xl p-1 shadow-xl"
                    >
                      {EQ_PRESETS.map((preset) => (
                        <button
                          key={preset.name}
                          onClick={() => {
                            setEqPreset(preset);
                            setShowPresets(false);
                          }}
                          className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                            currentPreset === preset.name 
                              ? 'bg-primary/20 text-primary' 
                              : 'hover:bg-secondary/50'
                          }`}
                        >
                          {preset.name}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <button
                onClick={() => setEqPreset(EQ_PRESETS[0])}
                className="px-3 py-2 rounded-xl bg-secondary/50 hover:bg-secondary/70 transition-colors text-sm text-muted-foreground"
              >
                Reset
              </button>
            </div>

            {/* EQ Sliders */}
            <div className="flex gap-2 justify-between px-1">
              {eqValues.map((value, index) => (
                <div key={index} className="flex flex-col items-center gap-2">
                  {/* Frequency label */}
                  <span className="text-[10px] text-muted-foreground">
                    {frequencyLabels[index]}
                  </span>
                  
                  {/* Vertical slider container */}
                  <div className="relative h-20 w-2 rounded-full bg-muted/30">
                    {/* Fill - from center */}
                    <div
                      className="absolute left-0 right-0 rounded-full transition-all"
                      style={{
                        background: `linear-gradient(0deg, 
                          hsl(var(--eq-green)) 0%, 
                          hsl(var(--eq-yellow)) 50%, 
                          hsl(var(--eq-red)) 100%)`,
                        opacity: eqEnabled ? 1 : 0.3,
                        top: value >= 0 ? `${50 - (value / 12) * 50}%` : '50%',
                        bottom: value >= 0 ? '50%' : `${50 - (Math.abs(value) / 12) * 50}%`,
                        boxShadow: eqEnabled ? '0 0 8px hsl(var(--eq-yellow) / 0.5)' : 'none',
                      }}
                    />
                    
                    {/* Thumb */}
                    <div
                      className="absolute left-1/2 -translate-x-1/2 w-4 h-2 rounded-full bg-foreground pointer-events-none transition-all"
                      style={{ 
                        top: `calc(${50 - (value / 12) * 50}% - 4px)`,
                        boxShadow: '0 0 6px hsl(var(--player-glow) / 0.5)'
                      }}
                    />
                    
                    {/* Hidden input */}
                    <input
                      type="range"
                      min="-12"
                      max="12"
                      step="1"
                      value={value}
                      onChange={(e) => setEqValue(index, parseInt(e.target.value))}
                      disabled={!eqEnabled}
                      className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
                      style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
                    />
                  </div>
                  
                  {/* Value */}
                  <span className={`text-[10px] font-mono ${
                    value > 0 ? 'text-eq-green' : value < 0 ? 'text-eq-red' : 'text-muted-foreground'
                  }`}>
                    {value > 0 ? '+' : ''}{value}
                  </span>
                </div>
              ))}
            </div>

            {/* dB Scale */}
            <div className="flex justify-between px-4 text-[10px] text-muted-foreground">
              <span>+12 dB</span>
              <span>0 dB</span>
              <span>-12 dB</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
