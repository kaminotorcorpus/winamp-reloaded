import React from 'react';
import { useAudioStore, Theme } from '@/stores/audioStore';
import { Palette } from 'lucide-react';

const THEMES: { id: Theme; name: string; preview: string }[] = [
  { id: 'classic-blue', name: 'Classic Blue', preview: 'bg-blue-600' },
  { id: 'dark-metal', name: 'Dark Metal', preview: 'bg-zinc-800' },
  { id: 'neon', name: 'Neon', preview: 'bg-fuchsia-600' },
  { id: 'gold', name: 'Gold', preview: 'bg-amber-500' },
  { id: 'minimal-grey', name: 'Minimal Grey', preview: 'bg-gray-400' },
  { id: 'cyber-blue', name: 'Cyber Blue', preview: 'bg-cyan-500' },
  { id: 'classic-green', name: 'Classic Green', preview: 'bg-green-500' },
  { id: 'charcoal', name: 'Charcoal', preview: 'bg-slate-700' },
];

export const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useAudioStore();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="winamp-button p-3 rounded-lg"
          title="Change theme"
        >
          <Palette size={20} />
        </button>

        {isOpen && (
          <div className="absolute bottom-full right-0 mb-2 winamp-window p-2 min-w-[160px]">
            <div className="pixel-font text-[10px] text-muted-foreground mb-2 px-1">
              COLOR THEMES
            </div>
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTheme(t.id);
                  setIsOpen(false);
                }}
                className={`
                  flex items-center gap-2 w-full px-2 py-1.5 rounded-sm
                  hover:bg-accent/30 transition-colors
                  ${theme === t.id ? 'bg-accent/50' : ''}
                `}
              >
                <div className={`w-4 h-4 rounded-sm ${t.preview}`} />
                <span className="pixel-font text-[10px]">{t.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
