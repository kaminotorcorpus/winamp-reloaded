import React, { useState } from 'react';
import { useAudioStore, EQ_PRESETS } from '@/stores/audioStore';

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

  if (!showEqualizer) return null;

  const frequencyLabels = ['31', '62', '125', '250', '500', '1K', '2K', '4K', '8K', '16K'];

  return (
    <div className="winamp-window">
      {/* Title Bar */}
      <div className="winamp-titlebar h-5 flex items-center justify-between px-2">
        <span className="pixel-font text-foreground/80 text-[10px]">EQUALIZER</span>
        <button 
          onClick={toggleEqualizer}
          className="winamp-button w-4 h-3 pixel-font text-[8px] hover:bg-destructive/80"
        >
          ×
        </button>
      </div>

      <div className="w-[300px] p-2 space-y-2">
        {/* Control buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEqEnabled(!eqEnabled)}
            className={`winamp-button px-2 py-1 pixel-font text-[8px] ${eqEnabled ? 'winamp-button-active' : ''}`}
          >
            ON
          </button>
          <button
            onClick={() => setEqPreset(EQ_PRESETS[0])}
            className="winamp-button px-2 py-1 pixel-font text-[8px]"
          >
            AUTO
          </button>
          <div className="relative">
            <button
              onClick={() => setShowPresets(!showPresets)}
              className="winamp-button px-2 py-1 pixel-font text-[8px]"
            >
              PRESETS
            </button>
            {showPresets && (
              <div className="absolute top-full left-0 mt-1 z-50 winamp-window p-1 min-w-[100px]">
                {EQ_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => {
                      setEqPreset(preset);
                      setShowPresets(false);
                    }}
                    className={`block w-full text-left px-2 py-1 pixel-font text-[8px] hover:bg-accent/30 ${
                      currentPreset === preset.name ? 'bg-accent/50' : ''
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <span className="pixel-font text-[10px] text-accent ml-auto">{currentPreset}</span>
        </div>

        {/* EQ Sliders */}
        <div className="flex gap-1 justify-between px-2">
          {eqValues.map((value, index) => (
            <div key={index} className="flex flex-col items-center">
              <span className="pixel-font text-muted-foreground mb-1 text-[6px]">
                {frequencyLabels[index]}
              </span>
              <div className="relative h-[60px] w-3 winamp-slider-track rounded-sm">
                <div
                  className="absolute bottom-0 left-0 right-0 rounded-sm transition-all"
                  style={{
                    height: `${((value + 12) / 24) * 100}%`,
                    background: `linear-gradient(0deg, 
                      hsl(var(--winamp-eq-green)) 0%, 
                      hsl(var(--winamp-eq-yellow)) 70%, 
                      hsl(var(--winamp-eq-red)) 100%)`,
                    opacity: eqEnabled ? 1 : 0.3,
                  }}
                />
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
                <div
                  className="winamp-slider-thumb absolute left-1/2 -translate-x-1/2 w-3 h-2 rounded-sm pointer-events-none"
                  style={{ bottom: `calc(${((value + 12) / 24) * 100}% - 4px)` }}
                />
              </div>
              <span className="pixel-font text-[6px] text-accent mt-1">
                {value > 0 ? '+' : ''}{value}
              </span>
            </div>
          ))}
        </div>

        {/* dB Scale */}
        <div className="flex justify-between px-4 text-[6px] text-muted-foreground pixel-font">
          <span>+12dB</span>
          <span>0dB</span>
          <span>-12dB</span>
        </div>
      </div>
    </div>
  );
};
