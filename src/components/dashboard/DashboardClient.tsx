"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { ShieldAlert, Activity, HeartPulse, MoonStar } from "lucide-react";

import type { DatasetOverview } from "@/lib/health-data";

type DashboardClientProps = {
  overview: DatasetOverview;
};

const severityClass = {
  medium: "border-yellow-500/70",
  high: "border-orange-500/70",
  critical: "border-red-500/70",
};

const RiskTrendChart = dynamic(
  () => import("@/components/dashboard/RiskTrendChart").then((mod) => mod.RiskTrendChart),
  {
    ssr: false,
    loading: () => <div className="h-full w-full bg-foreground/5 animate-pulse" />,
  },
);

export function DashboardClient({ overview }: DashboardClientProps) {
  return (
    <main className="flex-1 p-6 lg:p-12 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-display font-bold uppercase tracking-widest">Patient Dashboard</h1>
        <p className="text-sm text-foreground/50 tracking-wider">
          DATASET-DRIVEN SMARTWATCH INSIGHTS FOR {overview.totalPatients.toLocaleString()} PATIENTS
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {overview.summaryCards.map((insight) => (
          <div key={insight.title} className="p-6 border border-foreground/10 bg-foreground/[0.02] backdrop-blur-md">
            <h3 className="text-xs uppercase font-display tracking-widest text-foreground/50">{insight.title}</h3>
            <div className="mt-4 flex items-end justify-between gap-3">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-display font-bold">{insight.value}</span>
                <span className="text-sm text-foreground/40">{insight.unit}</span>
              </div>
            </div>
            <p className="mt-3 text-xs uppercase tracking-[0.24em] text-foreground/40">{insight.context}</p>
          </div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 border border-foreground/10 bg-foreground/[0.02] p-6 flex flex-col gap-6"
        >
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h3 className="font-display uppercase tracking-widest text-sm font-bold flex items-center gap-2">
              <Activity className="w-4 h-4 text-accent" />
              Highest-Risk Patient Trend
            </h3>
            <p className="text-xs uppercase tracking-[0.24em] text-foreground/40">
              Ranked by composite smartwatch risk score
            </p>
          </div>
          <div className="h-72 sm:h-80 w-full min-w-0 text-xs font-display">
            <RiskTrendChart data={overview.patientRiskTrend} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col gap-6"
        >
          <div className="border border-foreground/10 bg-foreground/[0.02] p-6 flex flex-col items-center justify-center text-center gap-4 relative overflow-hidden h-48">
            <div className="absolute inset-x-0 bottom-0 h-1 bg-foreground/10" />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${overview.wellnessScore}%` }}
              transition={{ delay: 1, duration: 1.2, ease: "easeOut" }}
              className="absolute left-0 bottom-0 h-1 bg-accent"
            />
            <h3 className="font-display uppercase tracking-widest text-sm text-foreground/50">Dataset Wellness Score</h3>
            <div className="text-7xl font-display font-bold flex items-baseline gap-1">
              {overview.wellnessScore}
              <span className="text-xl text-foreground/30">/100</span>
            </div>
            <p className="text-xs uppercase tracking-[0.24em] text-foreground/40">
              Avg stress {overview.averageStressLevel.toFixed(1)} / 10
            </p>
          </div>

          <div className="border border-foreground/10 bg-foreground/[0.02] p-6 grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-foreground/60 uppercase tracking-[0.2em] text-xs">
                <HeartPulse className="w-4 h-4 text-accent" /> Oxygen
              </div>
              <p className="text-3xl font-display font-bold">{overview.averageBloodOxygen.toFixed(1)}%</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-foreground/60 uppercase tracking-[0.2em] text-xs">
                <MoonStar className="w-4 h-4 text-accent" /> Sleep
              </div>
              <p className="text-3xl font-display font-bold">{overview.averageSleepDuration.toFixed(1)}h</p>
            </div>
          </div>

          <div className="border border-foreground/10 bg-foreground/[0.02] flex-1 p-6 flex flex-col gap-4">
            <h3 className="font-display uppercase tracking-widest text-sm font-bold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-accent" />
              Cohort Alerts
            </h3>
            <div className="flex flex-col gap-3 mt-2">
              {overview.anomalyAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 border-l-2 bg-foreground/5 flex flex-col gap-1 ${severityClass[alert.severity]}`}
                >
                  <div className="flex justify-between items-center text-xs text-foreground/50 tracking-wide font-display gap-3">
                    <span className="uppercase">{alert.label}</span>
                    <span>
                      {alert.value.toLocaleString()} {alert.unit}
                    </span>
                  </div>
                  <p className="text-sm border-t border-foreground/5 pt-2">{alert.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
