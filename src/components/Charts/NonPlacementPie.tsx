"use client";

import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

interface NonPlacementPieProps {
  data: {
    reason: string;
    count: number;
    percentage: number;
  }[];
}

const COLORS = ["#442718", "#78472E", "#B86B30", "#965C3D", "#C4792C", "#BAA78E", "#5D3723"];

export default function NonPlacementPie({ data }: NonPlacementPieProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 w-full flex items-center justify-center bg-sage-50/50 rounded-xl border border-dashed border-border text-xs text-muted text-center p-4">
        No non-placement friction points recorded in current cohort.
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={3}
            dataKey="count"
            nameKey="reason"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(val: any, name: any, item: any) => [
              `${val} candidates (${item.payload.percentage}%)`,
              name,
            ]}
            contentStyle={{
              backgroundColor: "#FDFCF9",
              borderRadius: "12px",
              border: "1px solid #E5DCCD",
              fontSize: "12px",
              boxShadow: "0 4px 12px rgba(42,28,21,0.06)",
            }}
          />
          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ fontSize: "10px", paddingTop: "12px" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
