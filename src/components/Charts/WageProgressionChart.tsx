"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface WageProgressionChartProps {
  data: {
    stage: string;
    avgSalary: number;
  }[];
}

export default function WageProgressionChart({ data }: WageProgressionChartProps) {
  if (!data || data.length === 0 || data.every((d) => d.avgSalary === 0)) {
    return (
      <div className="h-64 w-full flex items-center justify-center bg-sage-50/50 rounded-xl border border-dashed border-border text-xs text-muted text-center p-4">
        No wage progression data available yet. Tracked after 90-day & 180-day wage updates.
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5DCCD" />
          <XAxis
            dataKey="stage"
            tick={{ fontSize: 11, fill: "#786153" }}
            axisLine={{ stroke: "#E5DCCD" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#786153" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(val) => `₹${val / 1000}k`}
          />
          <Tooltip
            formatter={(val: any) => [formatCurrency(val), "Avg Monthly Wage"]}
            contentStyle={{
              backgroundColor: "#FDFCF9",
              borderRadius: "12px",
              border: "1px solid #E5DCCD",
              fontSize: "12px",
              boxShadow: "0 4px 12px rgba(42,28,21,0.06)",
            }}
          />
          <Bar
            dataKey="avgSalary"
            fill="#5D3723"
            radius={[6, 6, 0, 0]}
            maxBarSize={48}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
