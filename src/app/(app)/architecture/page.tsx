"use client";

import { motion } from "framer-motion";
import { Server, Cloud, AppWindow } from "lucide-react";

export default function Architecture() {
  return (
    <main className="flex-1 p-6 lg:p-12 space-y-8 max-w-4xl">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-display font-bold uppercase tracking-widest">Tech Architecture</h1>
        <p className="text-sm text-foreground/50 tracking-wider">PLATFORM LAYERS VISUALIZATION</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6"
      >
        <div className="p-8 border border-foreground/10 bg-foreground/5 relative overflow-hidden group">
           <AppWindow className="absolute right-[-2rem] top-[-2rem] w-32 h-32 text-foreground/5 group-hover:text-accent/20 transition-colors" />
           <h2 className="text-xl font-display font-bold tracking-widest uppercase mb-2">SaaS Layer</h2>
           <p className="text-foreground/60 text-sm">Next.js Frontend, Dashboard Visualization, Recharts, Framer Motion</p>
        </div>
        
        <div className="w-px h-8 bg-accent mx-auto" />

        <div className="p-8 border border-foreground/10 bg-foreground/5 relative overflow-hidden group">
           <Cloud className="absolute left-[-2rem] top-[-2rem] w-32 h-32 text-foreground/5 group-hover:text-accent/20 transition-colors" />
           <h2 className="text-xl font-display font-bold tracking-widest uppercase mb-2">PaaS Layer</h2>
           <p className="text-foreground/60 text-sm">Node.js API, Real-time Analytics Engine, ML Anomaly Detection</p>
        </div>

        <div className="w-px h-8 bg-accent mx-auto" />

        <div className="p-8 border border-foreground/10 bg-foreground/5 relative overflow-hidden group">
           <Server className="absolute right-[-2rem] top-[-2rem] w-32 h-32 text-foreground/5 group-hover:text-accent/20 transition-colors" />
           <h2 className="text-xl font-display font-bold tracking-widest uppercase mb-2">IaaS Layer</h2>
           <p className="text-foreground/60 text-sm">Cloud Storage, Virtual Machines, Secure Long-Term Datastores</p>
        </div>
      </motion.div>
    </main>
  );
}
