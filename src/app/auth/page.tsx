"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AuthPage() {
  return (
    <main className="flex-1 min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden">
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-accent/5 to-transparent pointer-events-none" />

      <div className="w-full max-w-md space-y-8 z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-foreground/50 hover:text-foreground text-sm font-display uppercase tracking-widest transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-display font-bold uppercase tracking-tight">Access Node</h1>
          <p className="text-foreground/50 text-sm font-display tracking-widest uppercase">Select Authentication Protocol</p>
        </div>

        <form className="space-y-6 pt-8">
          <div className="space-y-4">
            <input 
               type="email" 
               placeholder="IDENTIFIER (EMAIL)" 
               className="w-full bg-foreground/5 border border-foreground/10 px-4 py-4 focus:outline-none focus:border-accent font-display uppercase tracking-widest text-sm transition-colors"
               required
            />
            <input 
               type="password" 
               placeholder="SECURITY KEY (PASSWORD)" 
               className="w-full bg-foreground/5 border border-foreground/10 px-4 py-4 focus:outline-none focus:border-accent font-display uppercase tracking-widest text-sm transition-colors"
               required
            />
          </div>

          <button 
             type="button"
             className="w-full bg-foreground text-background py-4 font-display font-bold uppercase tracking-widest hover:bg-accent hover:text-white transition-colors"
          >
             Initialize Session
          </button>

          <div className="relative py-4">
             <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-foreground/10"></div></div>
             <div className="relative flex justify-center text-xs uppercase font-display tracking-widest"><span className="bg-background px-4 text-foreground/40">Or</span></div>
          </div>

          <button 
             type="button"
             className="w-full border border-foreground/20 text-foreground py-4 font-display font-bold uppercase tracking-widest hover:border-foreground transition-colors"
          >
             SSO OAuth Logon
          </button>
        </form>
      </div>
    </main>
  );
}
