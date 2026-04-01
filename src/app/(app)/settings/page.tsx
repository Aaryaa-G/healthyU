"use client";

import { useTheme } from "next-themes";
import { motion } from "framer-motion";

export default function Settings() {
  const { theme, setTheme } = useTheme();

  return (
    <main className="flex-1 p-6 lg:p-12 space-y-8 max-w-4xl">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-display font-bold uppercase tracking-widest">Settings</h1>
        <p className="text-sm text-foreground/50 tracking-wider">SYSTEM CONFIGURATION & PREFERENCES</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Theme Settings */}
        <section className="p-6 border border-foreground/10 bg-foreground/[0.02] space-y-4">
          <h2 className="font-display font-bold tracking-widest uppercase border-b border-foreground/10 pb-4">Appearance</h2>
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground/60 uppercase">System Theme Mode</span>
            <div className="flex border border-foreground/20 font-display text-xs tracking-widest uppercase">
              <button 
                onClick={() => setTheme("dark")} 
                className={`py-2 px-4 transition-colors ${theme === 'dark' ? 'bg-foreground text-background' : 'hover:bg-foreground/10'}`}
              >
                Dark
              </button>
              <button 
                onClick={() => setTheme("light")} 
                className={`py-2 px-4 border-l border-foreground/20 transition-colors ${theme === 'light' ? 'bg-foreground text-background' : 'hover:bg-foreground/10'}`}
              >
                Light
              </button>
            </div>
          </div>
        </section>

        {/* Profile Settings */}
        <section className="p-6 border border-foreground/10 bg-foreground/[0.02] space-y-4">
          <h2 className="font-display font-bold tracking-widest uppercase border-b border-foreground/10 pb-4">Data Permissions</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground/60 uppercase">Apple Health Sync</span>
              <div className="w-12 h-6 bg-accent relative rounded-full cursor-pointer">
                 <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground/60 uppercase">Cloud Analytics Telemetry</span>
              <div className="w-12 h-6 bg-accent relative rounded-full cursor-pointer">
                 <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
              </div>
            </div>
          </div>
        </section>
      </motion.div>
    </main>
  );
}
