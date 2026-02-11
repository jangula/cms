"use client";

import { useState, useEffect } from "react";
import { Card, CardTitle } from "@angulacms/ui";
import { apiFetch } from "@/lib/api";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

interface AnalyticsData {
  pages: number;
  media: number;
  articles: number;
  subscribers: number;
  totalViews: number;
  last7DaysViews: number;
  last30DaysViews: number;
  viewsByDay: { date: string; count: number }[];
  topPages: { path: string; count: number }[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<AnalyticsData>("/analytics/stats")
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-center text-gray-500 py-8">Loading analytics...</p>;
  }

  if (!data) {
    return <p className="text-center text-red-500 py-8">Failed to load analytics.</p>;
  }

  const statCards = [
    { label: "Total Page Views", value: data.totalViews.toLocaleString(), color: "bg-blue-500" },
    { label: "Last 7 Days", value: data.last7DaysViews.toLocaleString(), color: "bg-green-500" },
    { label: "Last 30 Days", value: data.last30DaysViews.toLocaleString(), color: "bg-purple-500" },
    { label: "Subscribers", value: data.subscribers.toLocaleString(), color: "bg-orange-500" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => (
          <Card key={card.label}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center`}>
                <span className="text-white text-lg font-bold">{card.value}</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Page views over time chart */}
      <Card className="mb-8">
        <CardTitle>Page Views (Last 30 Days)</CardTitle>
        <div className="mt-4" style={{ height: 300 }}>
          {data.viewsByDay.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.viewsByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(val) => {
                    const d = new Date(val);
                    return `${d.getDate()}/${d.getMonth() + 1}`;
                  }}
                  fontSize={12}
                  stroke="#9ca3af"
                />
                <YAxis fontSize={12} stroke="#9ca3af" />
                <Tooltip
                  labelFormatter={(val) => new Date(val).toLocaleDateString()}
                  formatter={(value) => [String(value), "Views"]}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  fill="#93c5fd"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-sm text-center py-12">
              No page view data yet. Views will appear here as visitors browse the public site.
            </p>
          )}
        </div>
      </Card>

      {/* Top pages chart */}
      <Card>
        <CardTitle>Top Pages (Last 30 Days)</CardTitle>
        <div className="mt-4" style={{ height: 300 }}>
          {data.topPages.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.topPages}
                layout="vertical"
                margin={{ left: 120 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" fontSize={12} stroke="#9ca3af" />
                <YAxis
                  dataKey="path"
                  type="category"
                  fontSize={12}
                  stroke="#9ca3af"
                  width={120}
                  tickFormatter={(val) =>
                    val.length > 25 ? val.substring(0, 25) + "..." : val
                  }
                />
                <Tooltip formatter={(value) => [String(value), "Views"]} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-sm text-center py-12">
              No page view data yet.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
