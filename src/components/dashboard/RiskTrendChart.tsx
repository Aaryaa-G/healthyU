"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { DatasetOverview } from "@/lib/health-data";

type RiskTrendChartProps = {
  data: DatasetOverview["patientRiskTrend"];
};

export function RiskTrendChart({ data }: RiskTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-foreground)" opacity={0.08} vertical={false} />
        <XAxis dataKey="patient" stroke="var(--color-foreground)" opacity={0.5} tickMargin={10} axisLine={false} />
        <YAxis yAxisId="left" stroke="var(--color-foreground)" opacity={0.5} axisLine={false} tickLine={false} />
        <YAxis yAxisId="right" orientation="right" stroke="var(--color-foreground)" opacity={0.5} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--color-background)",
            border: "1px solid var(--color-foreground)",
            borderRadius: 0,
          }}
        />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="riskScore"
          name="Risk Score"
          stroke="var(--color-foreground)"
          strokeWidth={2}
          dot={{ fill: "var(--color-foreground)", strokeWidth: 2, r: 3 }}
          activeDot={{ r: 5 }}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="stressLevel"
          name="Stress"
          stroke="var(--color-accent)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
