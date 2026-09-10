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
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6EBE8" />
          <XAxis
            dataKey="district"
            tick={{ fontSize: 11, fill: "#526661" }}
            axisLine={{ stroke: "#E6EBE8" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#526661" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#FFFFFF",
              borderRadius: "12px",
              border: "1px solid #E6EBE8",
              fontSize: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
          <Bar name="Trained" dataKey="totalCount" fill="#92B1A0" radius={[4, 4, 0, 0]} maxBarSize={28} />
          <Bar name="Certified" dataKey="certifiedCount" fill="#0D7A48" radius={[4, 4, 0, 0]} maxBarSize={28} />
          <Bar name="Placed / Working" dataKey="employedCount" fill="#063A22" radius={[4, 4, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
