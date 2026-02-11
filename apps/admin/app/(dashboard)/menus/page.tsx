"use client";

import { useState, useEffect, useCallback } from "react";
import { Button, Card, CardTitle, Input, Select, Modal } from "@angulacms/ui";
import { MultilingualInput } from "@/components/pages/multilingual-input";
import { apiFetch } from "@/lib/api";

interface MenuItem {
  id: string;
  label: Record<string, string>;
  url: string | null;
  pageId: string | null;
  target: string;
  sortOrder: number;
  children: MenuItem[];
}

interface Menu {
  id: string;
  name: string;
  items: MenuItem[];
}

interface PageOption {
  id: string;
  slug: string;
  title: Record<string, string>;
}

export default function MenusPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pages, setPages] = useState<PageOption[]>([]);

  // Local editable items state
  const [items, setItems] = useState<MenuItem[]>([]);

  // Add item modal
  const [addOpen, setAddOpen] = useState(false);
  const [newLabel, setNewLabel] = useState<Record<string, string>>({ en: "", pt: "" });
  const [newUrl, setNewUrl] = useState("");
  const [newPageId, setNewPageId] = useState("");
  const [newTarget, setNewTarget] = useState("_self");
  const [addParentIdx, setAddParentIdx] = useState<number | null>(null);

  const fetchMenus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch<Menu[]>("/menus");
      setMenus(res);
      if (res.length > 0 && !selectedMenu) {
        setSelectedMenu(res[0]);
        setItems(res[0].items);
      }
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  }, [selectedMenu]);

  useEffect(() => {
    fetchMenus();
    apiFetch<{ data: PageOption[] }>("/pages?pageSize=100")
      .then((res) => setPages(res.data))
      .catch(() => {});
  }, [fetchMenus]);

  function selectMenu(menu: Menu) {
    // Re-fetch individual menu for fresh items
    apiFetch<Menu>(`/menus/${menu.id}`).then((m) => {
      setSelectedMenu(m);
      setItems(m.items);
    });
  }

  function moveItem(index: number, direction: "up" | "down") {
    const newItems = [...items];
    const swapIdx = direction === "up" ? index - 1 : index + 1;
    if (swapIdx < 0 || swapIdx >= newItems.length) return;
    [newItems[index], newItems[swapIdx]] = [newItems[swapIdx], newItems[index]];
    setItems(newItems);
  }

  function moveChild(parentIdx: number, childIdx: number, direction: "up" | "down") {
    const newItems = [...items];
    const children = [...newItems[parentIdx].children];
    const swapIdx = direction === "up" ? childIdx - 1 : childIdx + 1;
    if (swapIdx < 0 || swapIdx >= children.length) return;
    [children[childIdx], children[swapIdx]] = [children[swapIdx], children[childIdx]];
    newItems[parentIdx] = { ...newItems[parentIdx], children };
    setItems(newItems);
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  function removeChild(parentIdx: number, childIdx: number) {
    const newItems = [...items];
    newItems[parentIdx] = {
      ...newItems[parentIdx],
      children: newItems[parentIdx].children.filter((_, i) => i !== childIdx),
    };
    setItems(newItems);
  }

  function handleAddItem() {
    if (!newLabel.en) return;

    const newItem: MenuItem = {
      id: `new-${Date.now()}`,
      label: newLabel,
      url: newUrl || null,
      pageId: newPageId || null,
      target: newTarget,
      sortOrder: 0,
      children: [],
    };

    if (addParentIdx !== null) {
      const newItems = [...items];
      newItems[addParentIdx] = {
        ...newItems[addParentIdx],
        children: [...newItems[addParentIdx].children, newItem],
      };
      setItems(newItems);
    } else {
      setItems([...items, newItem]);
    }

    setAddOpen(false);
    setNewLabel({ en: "", pt: "" });
    setNewUrl("");
    setNewPageId("");
    setNewTarget("_self");
    setAddParentIdx(null);
  }

  async function handleSave() {
    if (!selectedMenu) return;
    setSaving(true);
    try {
      const menu = await apiFetch<Menu>(`/menus/${selectedMenu.id}`, {
        method: "PUT",
        body: JSON.stringify({ items }),
      });
      setSelectedMenu(menu);
      setItems(menu.items);
      fetchMenus();
    } catch {
      alert("Failed to save menu");
    } finally {
      setSaving(false);
    }
  }

  function openAddItem(parentIdx: number | null) {
    setAddParentIdx(parentIdx);
    setAddOpen(true);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Menu Manager</h1>
      </div>

      {loading ? (
        <p className="text-center text-gray-500 py-8">Loading...</p>
      ) : (
        <div className="grid grid-cols-4 gap-6">
          {/* Menu list sidebar */}
          <div className="col-span-1">
            <Card>
              <CardTitle>Menus</CardTitle>
              <div className="space-y-2 mt-4">
                {menus.map((menu) => (
                  <button
                    key={menu.id}
                    onClick={() => selectMenu(menu)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedMenu?.id === menu.id
                        ? "bg-primary-50 text-primary-700"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {menu.name}
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Menu items editor */}
          <div className="col-span-3">
            {selectedMenu ? (
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <CardTitle>
                    {selectedMenu.name} menu
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openAddItem(null)}>
                      Add Item
                    </Button>
                    <Button size="sm" disabled={saving} onClick={handleSave}>
                      {saving ? "Saving..." : "Save Menu"}
                    </Button>
                  </div>
                </div>

                {items.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    No items yet. Add your first menu item.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {items.map((item, idx) => (
                      <div key={item.id} className="border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col gap-0.5">
                              <button onClick={() => moveItem(idx, "up")} disabled={idx === 0} className="text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs">
                                ▲
                              </button>
                              <button onClick={() => moveItem(idx, "down")} disabled={idx === items.length - 1} className="text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs">
                                ▼
                              </button>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{item.label.en}</p>
                              <p className="text-xs text-gray-500">
                                {item.url || (item.pageId ? `Page: ${pages.find((p) => p.id === item.pageId)?.slug || item.pageId}` : "No link")}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => openAddItem(idx)}>+ Sub</Button>
                            <Button variant="ghost" size="sm" onClick={() => removeItem(idx)}>Remove</Button>
                          </div>
                        </div>

                        {item.children.length > 0 && (
                          <div className="border-t border-gray-100 bg-gray-50 px-4 py-2 space-y-1">
                            {item.children.map((child, childIdx) => (
                              <div key={child.id} className="flex items-center justify-between pl-8 py-1">
                                <div className="flex items-center gap-3">
                                  <div className="flex flex-col gap-0.5">
                                    <button onClick={() => moveChild(idx, childIdx, "up")} disabled={childIdx === 0} className="text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs">▲</button>
                                    <button onClick={() => moveChild(idx, childIdx, "down")} disabled={childIdx === item.children.length - 1} className="text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs">▼</button>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-700">{child.label.en}</p>
                                    <p className="text-xs text-gray-400">{child.url || "No link"}</p>
                                  </div>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => removeChild(idx, childIdx)}>Remove</Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ) : (
              <Card>
                <p className="text-center text-gray-500 py-8">Select a menu to edit.</p>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title={addParentIdx !== null ? "Add Sub-Item" : "Add Menu Item"} size="md">
        <div className="space-y-4">
          <MultilingualInput label="Label" value={newLabel} onChange={setNewLabel} />
          <Select label="Link Type" value={newPageId ? "page" : "url"}
            onChange={(e) => {
              if (e.target.value === "page") { setNewUrl(""); }
              else { setNewPageId(""); }
            }}
            options={[
              { value: "url", label: "Custom URL" },
              { value: "page", label: "Internal Page" },
            ]}
          />
          {newPageId || (!newUrl && pages.length > 0) ? (
            <Select label="Page" value={newPageId}
              onChange={(e) => setNewPageId(e.target.value)}
              options={[
                { value: "", label: "Select a page..." },
                ...pages.map((p) => ({ value: p.id, label: `${p.title.en} (/${p.slug})` })),
              ]}
            />
          ) : (
            <Input label="URL" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="https://..." />
          )}
          <Select label="Target" value={newTarget} onChange={(e) => setNewTarget(e.target.value)}
            options={[
              { value: "_self", label: "Same Window" },
              { value: "_blank", label: "New Window" },
            ]}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAddItem}>Add</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
