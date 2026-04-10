"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { DatasetOverview } from "@/lib/health-data";

type ActivityComparisonChartProps = {
  data: DatasetOverview["activityGroups"];
};

function formatActivityLabel(label: string) {
  return label.replace("highly ", "high-");
}

export function ActivityComparisonChart({ data }: ActivityComparisonChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-foreground)" opacity={0.1} vertical={false} />
        <XAxis
          dataKey="activityLevel"
          tickFormatter={formatActivityLabel}
          stroke="var(--color-foreground)"
          opacity={0.5}
          tickMargin={10}
          axisLine={false}
        />
        <YAxis stroke="var(--color-foreground)" opacity={0.5} axisLine={false} tickLine={false} />
        <Tooltip
          cursor={{ fill: "var(--color-foreground)", opacity: 0.05 }}
          contentStyle={{ backgroundColor: "var(--color-background)", border: "1px solid var(--color-foreground)", borderRadius: 0 }}
        />
        <Bar dataKey="avgStepCount" name="Avg Steps" fill="var(--color-foreground)" radius={[2, 2, 0, 0]} />
        <Bar dataKey="avgSleepDuration" name="Avg Sleep" fill="var(--color-accent)" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
