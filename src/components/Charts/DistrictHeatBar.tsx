"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

interface DistrictHeatBarProps {
  data: {
    district: string;
    totalCount: number;
    certifiedCount: number;
    employedCount: number;
    employmentRate: number;
  }[];
}

export default function DistrictHeatBar({ data }: DistrictHeatBarProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-72 w-full flex items-center justify-center bg-sage-50/50 rounded-xl border border-dashed border-border text-xs text-muted text-center p-4">
        Insufficient outcome records across districts.
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5DCCD" />
          <XAxis
            dataKey="district"
            tick={{ fontSize: 11, fill: "#786153" }}
            axisLine={{ stroke: "#E5DCCD" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#786153" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#FDFCF9",
              borderRadius: "12px",
              border: "1px solid #E5DCCD",
              fontSize: "12px",
              boxShadow: "0 4px 12px rgba(42,28,21,0.06)",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
          <Bar name="Trained" dataKey="totalCount" fill="#D8C9B3" radius={[4, 4, 0, 0]} maxBarSize={28} />
          <Bar name="Certified" dataKey="certifiedCount" fill="#78472E" radius={[4, 4, 0, 0]} maxBarSize={28} />
          <Bar name="Placed / Working" dataKey="employedCount" fill="#442718" radius={[4, 4, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
