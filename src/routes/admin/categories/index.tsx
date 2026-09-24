import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit2, Trash2, FolderTree, Loader2, Save, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { mergeCategories, saveStoredCategory, safeDbMutation } from "@/lib/studio-persistence";
import { toast } from "sonner";
import type { Category } from "@/lib/catalog";

export const Route = createFileRoute("/admin/categories/")({
  head: () => ({
    meta: [{ title: "Categories CMS — FABRICO Admin" }],
  }),
  component: AdminCategoriesPage,
});

function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [editingCat, setEditingCat] = useState<Partial<Category> | null>(null);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["admin", "categories-all"],
    queryFn: async () => {
      const { data } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order");
      return mergeCategories((data as unknown as Category[]) || []);
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (cat: Partial<Category>) => {
      if (!cat.name || !cat.slug) throw new Error("Name and slug are required.");
      const payload = {
        id: cat.id || crypto.randomUUID(),
        name: cat.name,
        slug: cat.slug,
        description: cat.description || null,
        image: cat.image || null,
        parent_id: cat.parent_id || null,
        sort_order: cat.id ? undefined : categories.length + 1,
      };

      if (cat.id) {
        await safeDbMutation(
          () =>
            supabase
              .from("categories")
              .update({
                name: cat.name,
                slug: cat.slug,
                description: cat.description || null,
                image: cat.image || null,
                parent_id: cat.parent_id || null,
              })
              .eq("id", cat.id),
          () => saveStoredCategory(payload)
        );
      } else {
        await safeDbMutation(
          () =>
            supabase.from("categories").insert({
              id: payload.id,
              name: cat.name,
              slug: cat.slug,
              description: cat.description || null,
              image: cat.image || null,
              parent_id: cat.parent_id || null,
              sort_order: categories.length + 1,
            }),
          () => saveStoredCategory(payload)
        );
      }
    },
    onSuccess: () => {
      toast.success("Category saved.");
      setEditingCat(null);
      queryClient.invalidateQueries({ queryKey: ["admin", "categories-all"] });
      queryClient.invalidateQueries({ queryKey: ["layout"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to save category.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await safeDbMutation(
        () => supabase.from("categories").delete().eq("id", id),
        () => {}
      );
    },
    onSuccess: () => {
      toast.success("Category deleted.");
      queryClient.invalidateQueries({ queryKey: ["admin", "categories-all"] });
      queryClient.invalidateQueries({ queryKey: ["layout"] });
    },
  });

  return (
    <AdminLayout title="Categories Management">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-serif text-2xl text-foreground">Studio Categories</h3>
            <p className="text-xs text-muted-foreground">Manage catalog hierarchies, subcategories, and category images</p>
          </div>
          <button
            type="button"
            onClick={() =>
              setEditingCat({
                name: "",
                slug: "",
                description: "",
                image: "/images/look-4.jpg",
                parent_id: null,
              })
            }
            className="btn-lux text-xs flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>New Category</span>
          </button>
        </div>

        {/* Modal for Create/Edit */}
        {editingCat && (
          <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-card border border-border w-full max-w-lg p-6 space-y-4 shadow-2xl">
              <div className="flex justify-between items-center border-b border-border pb-3">
                <h3 className="font-serif text-xl text-foreground">
                  {editingCat.id ? "Edit Category" : "New Category"}
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingCat(null)}
                  className="p-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  saveMutation.mutate(editingCat);
                }}
                className="space-y-4 text-xs"
              >
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Category Name *</label>
                  <input
                    type="text"
                    required
                    value={editingCat.name || ""}
                    onChange={(e) => {
                      const name = e.target.value;
                      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                      setEditingCat({ ...editingCat, name, slug });
                    }}
                    className="w-full bg-muted/40 border border-border p-2.5 outline-none focus:border-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Slug *</label>
                  <input
                    type="text"
                    required
                    value={editingCat.slug || ""}
                    onChange={(e) => setEditingCat({ ...editingCat, slug: e.target.value })}
                    className="w-full bg-muted/40 border border-border p-2.5 outline-none font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Parent Category (Optional)</label>
                  <select
                    value={editingCat.parent_id || ""}
                    onChange={(e) =>
                      setEditingCat({ ...editingCat, parent_id: e.target.value || null })
                    }
                    className="w-full bg-muted/40 border border-border p-2.5 outline-none"
                  >
                    <option value="">No parent (Top Level Category)</option>
                    {categories
                      .filter((c) => !c.parent_id && c.id !== editingCat.id)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Description</label>
                  <input
                    type="text"
                    value={editingCat.description || ""}
                    onChange={(e) => setEditingCat({ ...editingCat, description: e.target.value })}
                    className="w-full bg-muted/40 border border-border p-2.5 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Cover Image URL</label>
                  <input
                    type="text"
                    value={editingCat.image || ""}
                    onChange={(e) => setEditingCat({ ...editingCat, image: e.target.value })}
                    className="w-full bg-muted/40 border border-border p-2.5 outline-none font-mono text-xs"
                  />
                </div>

                <div className="pt-4 border-t border-border flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingCat(null)}
                    className="btn-outline text-xs py-2 px-3"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saveMutation.isPending}
                    className="btn-lux text-xs py-2 px-4"
                  >
                    Save Category
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Categories Table */}
        <div className="bg-card border border-border overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="eyebrow text-xs">Loading Categories...</span>
            </div>
          ) : (
            <table className="w-full text-xs text-left">
              <thead className="bg-muted text-muted-foreground uppercase tracking-wider text-[0.65rem] border-b border-border">
                <tr>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Slug</th>
                  <th className="px-4 py-3">Hierarchy</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {categories.map((cat) => {
                  const parent = categories.find((c) => c.id === cat.parent_id);
                  return (
                    <tr key={cat.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-semibold text-foreground">{cat.name}</td>
                      <td className="px-4 py-3 font-mono text-[0.7rem]">{cat.slug}</td>
                      <td className="px-4 py-3">
                        {parent ? (
                          <span className="text-muted-foreground">Subcategory of {parent.name}</span>
                        ) : (
                          <span className="text-foreground font-medium">Top Level</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">
                        {cat.description || "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingCat(cat)}
                            className="p-1 text-muted-foreground hover:text-foreground"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Delete category "${cat.name}"?`)) {
                                deleteMutation.mutate(cat.id);
                              }
                            }}
                            className="p-1 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
