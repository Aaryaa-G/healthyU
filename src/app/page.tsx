"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Activity, Cloud, Shield, Database } from "lucide-react";

const features = [
  { icon: Cloud, title: "Cloud Analytics Engine", desc: "Real-time Processing" },
  { icon: Database, title: "Multi-Source Ingestion", desc: "Steps, HR, Sleep, Calories" },
  { icon: Activity, title: "Anomaly Detection", desc: "AI-Powered Alerts" },
  { icon: Shield, title: "Secure & Compliant", desc: "Enterprise Data Protection" },
];

export default function LandingPage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 lg:p-24 overflow-hidden relative">
      {/* Background Dots */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-foreground/5 to-transparent pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-5xl w-full text-center space-y-12 z-10"
      >
        <div className="space-y-6">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 border border-foreground/10 bg-foreground/5 backdrop-blur-sm rounded-full text-sm font-medium"
          >
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            System Online
          </motion.div>
          
          <h1 className="text-6xl md:text-8xl font-display font-bold tracking-tighter uppercase leading-[0.9]">
            Cloud-Powered <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/50">Health Intelligence</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-foreground/60 max-w-2xl mx-auto font-light">
            Advanced multi-source data aggregation. Predictive analytics. Population-scale insights.
          </p>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8"
        >
          <Link href="/dashboard" className="w-full sm:w-auto px-8 py-4 bg-foreground text-background font-display uppercase tracking-widest text-sm font-bold hover:bg-accent hover:text-white transition-all duration-300 flex items-center justify-center gap-2 group">
            Launch Platform
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/architecture" className="w-full sm:w-auto px-8 py-4 border border-foreground/20 bg-background/50 backdrop-blur-sm font-display uppercase tracking-widest text-sm font-bold hover:border-foreground transition-all duration-300">
            View Architecture
          </Link>
        </motion.div>

        {/* Feature Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-24"
        >
          {features.map((feature, idx) => (
            <div key={idx} className="p-6 border border-foreground/10 bg-foreground/[0.02] backdrop-blur-md flex flex-col items-center text-center space-y-4 hover:border-foreground/30 transition-colors group">
              <feature.icon className="w-8 h-8 text-foreground/50 group-hover:text-accent transition-colors" />
              <div>
                <h3 className="font-display font-bold uppercase tracking-wider text-sm">{feature.title}</h3>
                <p className="text-xs text-foreground/50 mt-1">{feature.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </main>
  );
}
