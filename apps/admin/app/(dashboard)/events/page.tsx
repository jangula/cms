"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Badge, Card } from "@angulacms/ui";
import { apiFetch } from "@/lib/api";

interface EventItem {
  id: string;
  slug: string;
  title: Record<string, string>;
  startDate: string;
  endDate: string | null;
  status: string;
  registrationEnabled: boolean;
}

const statusVariant: Record<string, "success" | "warning" | "default" | "info"> = {
  PUBLISHED: "success",
  DRAFT: "warning",
  SCHEDULED: "info",
  ARCHIVED: "default",
};

export default function EventsListPage() {
  const router = useRouter();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch<{ data: EventItem[]; total: number }>(
        `/events?page=${page}&pageSize=20`
      );
      setEvents(res.data);
      setTotal(res.total);
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this event?")) return;
    await apiFetch(`/events/${id}`, { method: "DELETE" });
    fetchEvents();
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Events</h1>
        <Link href="/events/new">
          <Button>New Event</Button>
        </Link>
      </div>

      <Card padding={false}>
        {loading ? (
          <p className="p-8 text-center text-gray-500">Loading...</p>
        ) : events.length === 0 ? (
          <p className="p-8 text-center text-gray-500">No events yet. Create your first event.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registration</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{event.title.en}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {formatDate(event.startDate)}
                    {event.endDate && ` - ${formatDate(event.endDate)}`}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant[event.status] || "default"}>{event.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={event.registrationEnabled ? "success" : "default"}>
                      {event.registrationEnabled ? "Open" : "Closed"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => router.push(`/events/${event.id}/edit`)}>Edit</Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(event.id)}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {total > 20 && (
          <div className="flex justify-between items-center p-4 border-t">
            <p className="text-sm text-gray-500">{total} events total</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <Button variant="outline" size="sm" disabled={page * 20 >= total} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
