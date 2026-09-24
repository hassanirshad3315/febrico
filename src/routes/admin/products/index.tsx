import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  Loader2,
  Package,
  Eye,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PRODUCT_FIELDS, formatPKR, STOCK_LABEL, type Product } from "@/lib/catalog";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { mergeProducts, safeDbMutation, deleteStoredProduct } from "@/lib/studio-persistence";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/products/")({
  head: () => ({
    meta: [{ title: "Products Inventory — FABRICO Admin" }],
  }),
  component: AdminProductsPage,
});

function AdminProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin", "products-list"],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select(PRODUCT_FIELDS)
        .order("created_at", { ascending: false });

      return mergeProducts((data as unknown as Product[]) || []);
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      await safeDbMutation(
        () => supabase.from("products").delete().eq("id", id),
        () => deleteStoredProduct(id)
      );
    },
    onSuccess: () => {
      toast.success("Product removed from studio catalog.");
      queryClient.invalidateQueries({ queryKey: ["admin", "products-list"] });
      queryClient.invalidateQueries({ queryKey: ["layout"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete product.");
    },
  });

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.fabric && p.fabric.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <AdminLayout title="Products Inventory">
      <div className="space-y-6">
        {/* Top Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, SKU, or fabric..."
              className="w-full bg-card border border-border pl-9 pr-4 py-2 text-xs outline-none focus:border-foreground transition-colors"
            />
          </div>

          <Link
            to="/admin/products/new"
            className="btn-lux text-xs flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Product</span>
          </Link>
        </div>

        {/* Products Table */}
        <div className="bg-card border border-border overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="eyebrow text-xs">Loading studio catalog...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center space-y-2">
              <p className="font-serif text-2xl text-foreground">No products found</p>
              <p className="text-xs text-muted-foreground">Try adjusting your search criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted text-muted-foreground uppercase tracking-wider text-[0.65rem] border-b border-border">
                  <tr>
                    <th className="px-4 py-3">Piece</th>
                    <th className="px-4 py-3">SKU</th>
                    <th className="px-4 py-3">Category / Collection</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Stock Status</th>
                    <th className="px-4 py-3">Attributes</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filtered.map((p) => (
                    <tr key={p.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images[0] || "/images/look-1.jpg"}
                            alt={p.name}
                            className="h-12 w-9 object-cover bg-muted border border-border shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="font-semibold text-foreground truncate block max-w-xs">
                              {p.name}
                            </span>
                            <span className="text-[0.68rem] text-muted-foreground">
                              {p.fabric || "Luxury fabric"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-[0.7rem]">{p.sku}</td>
                      <td className="px-4 py-3">
                        <span className="block text-foreground">{p.category?.name || "Uncategorized"}</span>
                        <span className="text-[0.68rem] text-muted-foreground">
                          {p.collection?.name || "No collection"}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-sans">
                        {p.sale_price ? (
                          <>
                            <span className="font-semibold text-destructive">{formatPKR(p.sale_price)}</span>
                            <s className="text-[0.65rem] text-muted-foreground ml-1.5">{formatPKR(p.price)}</s>
                          </>
                        ) : (
                          <span className="font-semibold">{formatPKR(p.price)}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-block px-2 py-0.5 text-[0.6rem] bg-muted border border-border text-foreground uppercase font-medium">
                          {STOCK_LABEL[p.stock_status]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {p.is_new && <span className="text-[0.55rem] bg-emerald-500/10 text-emerald-700 px-1 border border-emerald-500/20">NEW</span>}
                          {p.is_featured && <span className="text-[0.55rem] bg-gold/10 text-gold px-1 border border-gold/20">FEATURED</span>}
                          {p.on_sale && <span className="text-[0.55rem] bg-destructive/10 text-destructive px-1 border border-destructive/20">SALE</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to="/product/$slug"
                            params={{ slug: p.slug }}
                            target="_blank"
                            className="p-1 text-muted-foreground hover:text-foreground"
                            aria-label="View on storefront"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                          <Link
                            to="/admin/products/$id"
                            params={{ id: p.id }}
                            className="p-1 text-muted-foreground hover:text-foreground"
                            aria-label="Edit product"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Remove "${p.name}" from catalog?`)) {
                                deleteProductMutation.mutate(p.id);
                              }
                            }}
                            className="p-1 text-muted-foreground hover:text-destructive"
                            aria-label="Delete product"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
