import React from "react";

interface StatChartProps {
  heights: number[]; // 0-8 (for h-1 to h-8)
  color?: string;
}

const StatChart: React.FC<StatChartProps> = ({
  heights,
  color = "bg-blue-500",
}) => (
  <div className="w-full h-8 bg-blue-100 rounded flex items-end">
    {heights.map((h, i) => (
      <div
        key={i}
        className={`flex-1 mx-0.5 rounded ${color}`}
        style={{ height: `${h * 0.5}rem` }}
      />
    ))}
  </div>
);

export default StatChart;
