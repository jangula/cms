"use client";

import { useState, useEffect } from "react";
import { Card, CardTitle } from "@angulacms/ui";
import { apiFetch } from "@/lib/api";

interface DashboardStats {
  pages: number;
  media: number;
  articles: number;
  subscribers: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    pages: 0,
    media: 0,
    articles: 0,
    subscribers: 0,
  });

  useEffect(() => {
    apiFetch<DashboardStats>("/analytics/stats")
      .then(setStats)
      .catch(() => {});
  }, []);

  const cards = [
    { label: "Pages", value: stats.pages, color: "bg-blue-500" },
    { label: "Media Files", value: stats.media, color: "bg-green-500" },
    { label: "Articles", value: stats.articles, color: "bg-purple-500" },
    { label: "Subscribers", value: stats.subscribers, color: "bg-orange-500" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card) => (
          <Card key={card.label}>
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center`}
              >
                <span className="text-white text-xl font-bold">
                  {card.value}
                </span>
              </div>
              <div>
                <CardTitle className="text-sm text-gray-500 font-normal">
                  {card.label}
                </CardTitle>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <CardTitle>Welcome to AngulaCMS</CardTitle>
        <p className="text-gray-600 mt-2">
          Use the sidebar to manage your content. Start by creating pages,
          uploading media, and publishing articles.
        </p>
      </Card>
    </div>
  );
}
