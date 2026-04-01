"use client";

import { motion } from "framer-motion";
import { summaryInsights, activityData, anomalyAlerts } from "@/lib/mock-data";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { ShieldAlert, Activity, ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function Dashboard() {
  return (
    <main className="flex-1 p-6 lg:p-12 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-display font-bold uppercase tracking-widest">Dashboard</h1>
        <p className="text-sm text-foreground/50 tracking-wider">REAL-TIME HEALTH METRICS & ANALYTICS</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {summaryInsights.map((insight, i) => (
          <div key={i} className="p-6 border border-foreground/10 bg-foreground/[0.02] backdrop-blur-md">
            <h3 className="text-xs uppercase font-display tracking-widest text-foreground/50">{insight.title}</h3>
            <div className="mt-4 flex items-end justify-between">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-display font-bold">{insight.value}</span>
                <span className="text-sm text-foreground/40">{insight.unit}</span>
              </div>
              <div className={`flex items-center text-sm font-bold ${insight.isPositive ? 'text-green-500' : 'text-accent'}`}>
                {insight.isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {insight.trend}
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 border border-foreground/10 bg-foreground/[0.02] p-6 flex flex-col gap-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-display uppercase tracking-widest text-sm font-bold flex items-center gap-2">
              <Activity className="w-4 h-4 text-accent" />
              Activity Trends
            </h3>
          </div>
          <div className="h-64 sm:h-80 w-full text-xs font-display">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-foreground)" opacity={0.1} vertical={false} />
                <XAxis dataKey="time" stroke="var(--color-foreground)" opacity={0.5} tickMargin={10} axisLine={false} />
                <YAxis yAxisId="left" stroke="var(--color-foreground)" opacity={0.5} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" stroke="var(--color-foreground)" opacity={0.5} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-background)', border: '1px solid var(--color-foreground)', borderRadius: 0 }}
                />
                <Line yAxisId="left" type="monotone" dataKey="Steps" stroke="var(--color-foreground)" strokeWidth={2} dot={{ fill: 'var(--color-foreground)', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                <Line yAxisId="right" type="step" dataKey="HR" stroke="var(--color-accent)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Side Panel */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col gap-6"
        >
          {/* Health Score Gauge (Simplified for Mockup) */}
          <div className="border border-foreground/10 bg-foreground/[0.02] p-6 flex flex-col items-center justify-center text-center gap-4 relative overflow-hidden h-48">
             <div className="absolute inset-x-0 bottom-0 h-1 bg-foreground/10" />
             <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "82%" }}
              transition={{ delay: 1, duration: 1.5, ease: "easeOut" }}
              className="absolute left-0 bottom-0 h-1 bg-accent" 
             />
             <h3 className="font-display uppercase tracking-widest text-sm text-foreground/50">Cumulative Health Score</h3>
             <div className="text-7xl font-display font-bold flex items-baseline gap-1">
               82<span className="text-xl text-foreground/30">/100</span>
             </div>
          </div>

          {/* Anomaly Alerts */}
          <div className="border border-foreground/10 bg-foreground/[0.02] flex-1 p-6 flex flex-col gap-4">
             <h3 className="font-display uppercase tracking-widest text-sm font-bold flex items-center gap-2">
               <ShieldAlert className="w-4 h-4 text-accent" />
               Anomaly Detection
             </h3>
             <div className="flex flex-col gap-3 mt-2">
               {anomalyAlerts.map((alert) => (
                 <div key={alert.id} className="p-3 border-l-2 border-accent bg-foreground/5 flex flex-col gap-1">
                   <div className="flex justify-between items-center text-xs text-foreground/50 tracking-wide font-display">
                     <span className="uppercase">{alert.type}</span>
                     <span>{alert.time}</span>
                   </div>
                   <p className="text-sm border-t border-foreground/5 pt-2">{alert.message}</p>
                 </div>
               ))}
             </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
