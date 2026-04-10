"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Users, BarChart3 } from "lucide-react";

import type { DatasetOverview } from "@/lib/health-data";

type AnalyticsClientProps = {
  overview: DatasetOverview;
};

const ActivityComparisonChart = dynamic(
  () =>
    import("@/components/dashboard/ActivityComparisonChart").then((mod) => mod.ActivityComparisonChart),
  {
    ssr: false,
    loading: () => <div className="h-full w-full bg-foreground/5 animate-pulse" />,
  },
);

export function AnalyticsClient({ overview }: AnalyticsClientProps) {
  return (
    <main className="flex-1 p-6 lg:p-12 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-display font-bold uppercase tracking-widest">Population Analytics</h1>
        <p className="text-sm text-foreground/50 tracking-wider">COHORT TRENDS GENERATED FROM SMARTWATCH PATIENT DATA</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="border border-foreground/10 bg-foreground/[0.02] p-8 flex flex-col gap-6"
      >
        <h3 className="font-display uppercase tracking-widest text-sm font-bold flex items-center gap-2">
          <Users className="w-4 h-4 text-accent" />
          Activity Cohort Comparison
        </h3>
        <div className="h-80 w-full min-w-0 text-xs font-display">
          <ActivityComparisonChart data={overview.activityGroups} />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="border border-foreground/10 bg-foreground/[0.02] p-6 space-y-5"
        >
          <h3 className="font-display uppercase tracking-widest text-sm font-bold flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-accent" />
            Activity Segment Breakdown
          </h3>
          <div className="grid gap-4">
            {overview.activityGroups.map((group) => (
              <div key={group.activityLevel} className="border border-foreground/10 p-4 bg-foreground/5 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="font-display uppercase tracking-widest text-sm">{group.activityLevel}</h4>
                  <span className="text-xs text-foreground/50 uppercase tracking-[0.24em]">
                    {group.patients.toLocaleString()} patients
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-foreground/50 uppercase tracking-[0.18em] text-[11px]">Avg HR</p>
                    <p className="text-2xl font-display font-bold">{group.avgHeartRate.toFixed(1)}</p>
                  </div>
                  <div>
                    <p className="text-foreground/50 uppercase tracking-[0.18em] text-[11px]">Wellness</p>
                    <p className="text-2xl font-display font-bold">{group.wellnessScore}/100</p>
                  </div>
                  <div>
                    <p className="text-foreground/50 uppercase tracking-[0.18em] text-[11px]">Avg Sleep</p>
                    <p className="text-xl font-display font-bold">{group.avgSleepDuration.toFixed(1)}h</p>
                  </div>
                  <div>
                    <p className="text-foreground/50 uppercase tracking-[0.18em] text-[11px]">Avg Stress</p>
                    <p className="text-xl font-display font-bold">{group.avgStressLevel.toFixed(1)}/10</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="border border-foreground/10 bg-foreground/[0.02] p-6 space-y-5"
        >
          <h3 className="font-display uppercase tracking-widest text-sm font-bold">Risk Distribution</h3>
          <div className="grid gap-4">
            {overview.stressDistribution.map((segment) => {
              const width = Math.max(6, (segment.patients / overview.totalPatients) * 100);
              return (
                <div key={segment.band} className="space-y-2">
                  <div className="flex items-center justify-between text-sm uppercase tracking-[0.2em] text-foreground/60">
                    <span>{segment.band}</span>
                    <span>{segment.patients.toLocaleString()} patients</span>
                  </div>
                  <div className="h-3 bg-foreground/10 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${width}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full bg-accent"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-foreground/10">
            <div>
              <p className="text-foreground/50 uppercase tracking-[0.18em] text-[11px]">Avg Blood Oxygen</p>
              <p className="text-3xl font-display font-bold">{overview.averageBloodOxygen.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-foreground/50 uppercase tracking-[0.18em] text-[11px]">Avg Stress</p>
              <p className="text-3xl font-display font-bold">{overview.averageStressLevel.toFixed(1)}/10</p>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
