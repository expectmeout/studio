
"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ChartConfig } from "@/components/ui/chart"; // Assuming ChartConfig is available or define simply

interface CallVolumeChartProps {
  data: { date: string; calls: number }[];
}

const chartConfig = {
  calls: {
    label: "Calls",
    color: "hsl(var(--chart-bar-main-color))", // Updated to use the consistent blue color
  },
} satisfies ChartConfig;


export function CallVolumeChart({ data }: CallVolumeChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Call Volume (Last 7 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis
              dataKey="date"
              stroke="hsl(var(--foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: "hsl(var(--chart-tooltip-cursor-fill))" }}
              contentStyle={{
                backgroundColor: "hsl(var(--card))", // Use card background for tooltip
                borderColor: "hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Bar dataKey="calls" fill={chartConfig.calls.color} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
