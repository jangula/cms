"use client";

import { useState, useEffect, useCallback } from "react";
import { Button, Card, Badge, Input, Select, Modal } from "@angulacms/ui";
import { apiFetch } from "@/lib/api";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  lastLogin: string | null;
  createdAt: string;
}

const roleVariant: Record<string, "danger" | "info" | "default"> = {
  ADMIN: "danger",
  EDITOR: "info",
  VIEWER: "default",
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Create/Edit modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState("EDITOR");
  const [saving, setSaving] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        page: String(page),
        pageSize: "20",
      };
      if (search) params.search = search;

      const res = await apiFetch<{ data: User[]; total: number }>(
        "/users",
        { params }
      );
      setUsers(res.data);
      setTotal(res.total);
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  function openCreate() {
    setEditingUser(null);
    setFormName("");
    setFormEmail("");
    setFormPassword("");
    setFormRole("EDITOR");
    setModalOpen(true);
  }

  function openEdit(user: User) {
    setEditingUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormPassword("");
    setFormRole(user.role);
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (editingUser) {
        const data: Record<string, string> = {
          name: formName,
          email: formEmail,
          role: formRole,
        };
        if (formPassword) data.password = formPassword;
        await apiFetch(`/users/${editingUser.id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        });
      } else {
        await apiFetch("/users", {
          method: "POST",
          body: JSON.stringify({
            name: formName,
            email: formEmail,
            password: formPassword,
            role: formRole,
          }),
        });
      }
      setModalOpen(false);
      fetchUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save user");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this user? This action cannot be undone.")) return;
    try {
      await apiFetch(`/users/${id}`, { method: "DELETE" });
      fetchUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete user");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <Button onClick={openCreate}>New User</Button>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <Card padding={false}>
        {loading ? (
          <p className="p-8 text-center text-gray-500">Loading...</p>
        ) : users.length === 0 ? (
          <p className="p-8 text-center text-gray-500">No users found.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-medium">
                        {user.name.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{user.email}</td>
                  <td className="px-4 py-3">
                    <Badge variant={roleVariant[user.role] || "default"}>{user.role}</Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {user.lastLogin
                      ? new Date(user.lastLogin).toLocaleDateString()
                      : "Never"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(user)}>
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(user.id)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {total > 20 && (
          <div className="flex justify-between items-center p-4 border-t">
            <p className="text-sm text-gray-500">{total} users total</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <Button variant="outline" size="sm" disabled={page * 20 >= total} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </Card>

      {/* Create/Edit User Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingUser ? "Edit User" : "Create User"}
        size="md"
      >
        <div className="space-y-4">
          <Input label="Name" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Full name" required />
          <Input label="Email" type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="user@example.com" required />
          <Input
            label={editingUser ? "Password (leave blank to keep current)" : "Password"}
            type="password"
            value={formPassword}
            onChange={(e) => setFormPassword(e.target.value)}
            placeholder={editingUser ? "Leave blank to keep current" : "Min 6 characters"}
            required={!editingUser}
          />
          <Select
            label="Role"
            value={formRole}
            onChange={(e) => setFormRole(e.target.value)}
            options={[
              { value: "ADMIN", label: "Admin - Full access" },
              { value: "EDITOR", label: "Editor - Content management" },
              { value: "VIEWER", label: "Viewer - Read only" },
            ]}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button disabled={saving} onClick={handleSave}>
              {saving ? "Saving..." : editingUser ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
