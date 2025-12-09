import React, { useState } from 'react';
import { useAudioStore, Theme } from '@/stores/audioStore';
import { Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const themes: { id: Theme; name: string; color: string }[] = [
  { id: 'classic-blue', name: 'Purple Glow', color: 'hsl(280, 100%, 60%)' },
  { id: 'neon', name: 'Neon Cyber', color: 'hsl(180, 100%, 50%)' },
  { id: 'gold', name: 'Gold Luxe', color: 'hsl(40, 85%, 55%)' },
  { id: 'dark-metal', name: 'Dark Steel', color: 'hsl(200, 80%, 50%)' },
  { id: 'minimal-grey', name: 'Minimal', color: 'hsl(220, 60%, 55%)' },
];

export const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useAudioStore();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="absolute bottom-full right-0 mb-3 glass-panel rounded-2xl p-3 shadow-xl min-w-[180px]"
          >
            <p className="text-xs text-muted-foreground mb-2 px-2">Theme</p>
            <div className="space-y-1">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all ${
                    theme === t.id 
                      ? 'bg-primary/20 text-foreground' 
                      : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                  }`}
                >
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ background: t.color, boxShadow: `0 0 10px ${t.color}` }}
                  />
                  <span>{t.name}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="modern-btn rounded-full p-3 shadow-lg"
      >
        <Palette size={20} />
      </motion.button>
    </div>
  );
};
