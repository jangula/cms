"use client";

import { useState, useEffect, useCallback } from "react";
import { Button, Card, Badge, Input, Select, Modal } from "@angulacms/ui";
import { apiFetch } from "@/lib/api";
import { getToken } from "@/lib/auth";

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  isVerified: boolean;
  subscribedAt: string;
  unsubscribedAt: string | null;
}

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterVerified, setFilterVerified] = useState("");

  // Add modal
  const [addOpen, setAddOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);

  const fetchSubscribers = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        page: String(page),
        pageSize: "30",
      };
      if (search) params.search = search;
      if (filterVerified) params.verified = filterVerified;

      const res = await apiFetch<{ data: Subscriber[]; total: number }>(
        "/newsletter",
        { params }
      );
      setSubscribers(res.data);
      setTotal(res.total);
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  }, [page, search, filterVerified]);

  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  async function handleAdd() {
    if (!newEmail) return;
    setAdding(true);
    try {
      await apiFetch("/newsletter", {
        method: "POST",
        body: JSON.stringify({ email: newEmail, name: newName }),
      });
      setAddOpen(false);
      setNewEmail("");
      setNewName("");
      fetchSubscribers();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to add subscriber");
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this subscriber?")) return;
    await apiFetch(`/newsletter/${id}`, { method: "DELETE" });
    fetchSubscribers();
  }

  async function handleToggleVerify(id: string, isVerified: boolean) {
    await apiFetch(`/newsletter/${id}`, {
      method: "PUT",
      body: JSON.stringify({ isVerified: !isVerified }),
    });
    fetchSubscribers();
  }

  function handleExport() {
    const token = getToken();
    window.open(`/api/newsletter/export?token=${token}`, "_blank");
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Newsletter Subscribers</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            Export CSV
          </Button>
          <Button onClick={() => setAddOpen(true)}>Add Subscriber</Button>
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <Input
            placeholder="Search by email or name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Select
          value={filterVerified}
          onChange={(e) => {
            setFilterVerified(e.target.value);
            setPage(1);
          }}
          options={[
            { value: "", label: "All" },
            { value: "true", label: "Verified" },
            { value: "false", label: "Unverified" },
          ]}
        />
      </div>

      <Card padding={false}>
        {loading ? (
          <p className="p-8 text-center text-gray-500">Loading...</p>
        ) : subscribers.length === 0 ? (
          <p className="p-8 text-center text-gray-500">No subscribers found.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subscribed</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {subscribers.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {sub.email}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {sub.name || "-"}
                  </td>
                  <td className="px-4 py-3">
                    {sub.unsubscribedAt ? (
                      <Badge variant="default">Unsubscribed</Badge>
                    ) : sub.isVerified ? (
                      <Badge variant="success">Verified</Badge>
                    ) : (
                      <Badge variant="warning">Unverified</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(sub.subscribedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleVerify(sub.id, sub.isVerified)}
                    >
                      {sub.isVerified ? "Unverify" : "Verify"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(sub.id)}
                    >
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {total > 30 && (
          <div className="flex justify-between items-center p-4 border-t">
            <p className="text-sm text-gray-500">{total} subscribers total</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled={page * 30 >= total} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Add Subscriber Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Subscriber" size="sm">
        <div className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="subscriber@example.com"
            required
          />
          <Input
            label="Name (optional)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Full name"
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button disabled={adding} onClick={handleAdd}>
              {adding ? "Adding..." : "Add"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
