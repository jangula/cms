"use client";

import { useState, useEffect, use } from "react";
import { EventForm } from "@/components/events/event-form";
import { apiFetch } from "@/lib/api";

export default function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [event, setEvent] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`/events/${id}`)
      .then((data) => setEvent(data as Record<string, unknown>))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-center text-gray-500 py-8">Loading...</p>;
  if (!event) return <p className="text-center text-red-500 py-8">Event not found.</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Event</h1>
      <EventForm
        mode="edit"
        initialData={event as unknown as Parameters<typeof EventForm>[0]["initialData"]}
      />
    </div>
  );
}
