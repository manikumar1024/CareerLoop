"use client";

import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface OutcomeRetentionChartProps {
  data: {
    milestone: string;
    rate: number;
    count?: number;
  }[];
}

export default function OutcomeRetentionChart({ data }: OutcomeRetentionChartProps) {
  if (!data || data.length === 0 || data.every((d) => d.rate === 0)) {
    return (
      <div className="h-64 w-full flex items-center justify-center bg-sage-50/50 rounded-xl border border-dashed border-border text-xs text-muted text-center p-4">
        Insufficient longitudinal retention records. Retention milestones populate automatically as follow-up surveys are completed.
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="retentionGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#442718" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#442718" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5DCCD" />
          <XAxis
            dataKey="milestone"
            tick={{ fontSize: 11, fill: "#786153" }}
            axisLine={{ stroke: "#E5DCCD" }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            unit="%"
            tick={{ fontSize: 11, fill: "#786153" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(val: any) => [`${val}% Retained`, "Retention Rate"]}
            contentStyle={{
              backgroundColor: "#FDFCF9",
              borderRadius: "12px",
              border: "1px solid #E5DCCD",
              fontSize: "12px",
              boxShadow: "0 4px 12px rgba(42,28,21,0.06)",
            }}
          />
          <Area
            type="monotone"
            dataKey="rate"
            stroke="#442718"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#retentionGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
