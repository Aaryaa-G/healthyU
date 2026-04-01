"use client";

import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from "recharts";

const populationData = [
  { group: "18-24", hr: 75, sleep: 7.2 },
  { group: "25-34", hr: 72, sleep: 7.5 },
  { group: "35-44", hr: 68, sleep: 7.0 },
  { group: "45-54", hr: 70, sleep: 6.8 },
  { group: "55+", hr: 74, sleep: 6.5 },
];

export default function Analytics() {
  return (
    <main className="flex-1 p-6 lg:p-12 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-display font-bold uppercase tracking-widest">Population Analytics</h1>
        <p className="text-sm text-foreground/50 tracking-wider">COHORT-BASED COMPARATIVE TRENDS</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="border border-foreground/10 bg-foreground/[0.02] p-8 flex flex-col gap-6"
      >
         <h3 className="font-display uppercase tracking-widest text-sm font-bold flex items-center gap-2">
            <Users className="w-4 h-4 text-accent" />
            Demographic Sleep & Heart Rate
          </h3>
          <div className="h-80 w-full text-xs font-display">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={populationData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-foreground)" opacity={0.1} vertical={false} />
                <XAxis dataKey="group" stroke="var(--color-foreground)" opacity={0.5} tickMargin={10} axisLine={false} />
                <YAxis stroke="var(--color-foreground)" opacity={0.5} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: 'var(--color-foreground)', opacity: 0.05}} contentStyle={{ backgroundColor: 'var(--color-background)', border: '1px solid var(--color-foreground)', borderRadius: 0 }} />
                <Bar dataKey="hr" fill="var(--color-foreground)" radius={[2, 2, 0, 0]} />
                <Bar dataKey="sleep" fill="var(--color-accent)" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
      </motion.div>
    </main>
  );
}
