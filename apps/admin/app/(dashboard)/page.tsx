"use client";

import { useState, useEffect } from "react";
import { Card, CardTitle } from "@angulacms/ui";
import { apiFetch } from "@/lib/api";

interface DashboardStats {
  pages: number;
  media: number;
  articles: number;
  subscribers: number;
  totalViews: number;
  last7DaysViews: number;
  last30DaysViews: number;
  topPages: { path: string; count: number }[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    pages: 0,
    media: 0,
    articles: 0,
    subscribers: 0,
    totalViews: 0,
    last7DaysViews: 0,
    last30DaysViews: 0,
    topPages: [],
  });

  useEffect(() => {
    apiFetch<DashboardStats>("/analytics/stats")
      .then(setStats)
      .catch(() => {});
  }, []);

  const cards = [
    { label: "Pages", value: stats.pages, color: "bg-blue-500", href: "/pages" },
    { label: "Articles", value: stats.articles, color: "bg-purple-500", href: "/news" },
    { label: "Media Files", value: stats.media, color: "bg-green-500", href: "/media" },
    { label: "Subscribers", value: stats.subscribers, color: "bg-orange-500", href: "/newsletter" },
  ];

  const viewCards = [
    { label: "Total Views", value: stats.totalViews },
    { label: "Last 7 Days", value: stats.last7DaysViews },
    { label: "Last 30 Days", value: stats.last30DaysViews },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Content stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card) => (
          <a key={card.label} href={card.href}>
            <Card>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center`}>
                  <span className="text-white text-xl font-bold">{card.value}</span>
                </div>
                <p className="text-sm text-gray-500">{card.label}</p>
              </div>
            </Card>
          </a>
        ))}
      </div>

      {/* Analytics preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <CardTitle>Page Views</CardTitle>
            <a href="/analytics" className="text-sm text-primary-600 hover:text-primary-700">
              View details &rarr;
            </a>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {viewCards.map((vc) => (
              <div key={vc.label} className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{vc.value.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">{vc.label}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <CardTitle>Top Pages</CardTitle>
            <a href="/analytics" className="text-sm text-primary-600 hover:text-primary-700">
              View all &rarr;
            </a>
          </div>
          {stats.topPages.length > 0 ? (
            <div className="space-y-2">
              {stats.topPages.slice(0, 5).map((page, i) => (
                <div key={page.path} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 truncate max-w-[200px]">
                    <span className="text-gray-400 mr-2">{i + 1}.</span>
                    {page.path}
                  </span>
                  <span className="text-gray-500 font-medium">{page.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              No page view data yet. Views will appear once visitors browse the public site.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
