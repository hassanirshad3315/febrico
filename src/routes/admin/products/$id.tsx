import { useState, useEffect } from "react";
import { createFileRoute, notFound, useRouter, Link } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, Save, Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PRODUCT_FIELDS, type Product } from "@/lib/catalog";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { safeDbMutation, saveStoredProduct, getStoredProducts } from "@/lib/studio-persistence";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/products/$id")({
  loader: async ({ params }) => {
    const localList = getStoredProducts();
    const localMatch = localList.find((p) => p.id === params.id);

    const { data } = await supabase
      .from("products")
      .select(PRODUCT_FIELDS)
      .eq("id", params.id)
      .maybeSingle();

    const merged = localMatch ? { ...(data || {}), ...localMatch } : data;
    if (!merged) throw notFound();
    return { product: merged as unknown as Product };
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `Edit: ${loaderData?.product?.name || "Product"} — FABRICO Admin` }],
  }),
  notFoundComponent: () => (
    <div className="py-24 text-center space-y-4">
      <h1 className="font-serif text-3xl">Product Not Found</h1>
      <Link to="/admin/products" className="btn-outline">
        Return to Products
      </Link>
    </div>
  ),
  component: AdminEditProductPage,
});

const ALL_SIZES = ["XS", "S", "M", "L", "XL", "One Size"];

function AdminEditProductPage() {
  const { product } = Route.useLoaderData();
  const router = useRouter();

  const { data: categories = [] } = useQuery({
    queryKey: ["admin", "categories-select"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("id, name, slug").order("name");
      return data || [];
    },
  });

  const { data: collections = [] } = useQuery({
    queryKey: ["admin", "collections-select"],
    queryFn: async () => {
      const { data } = await supabase.from("collections").select("id, name, slug").order("name");
      return data || [];
    },
  });

  const [formData, setFormData] = useState({
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    price: product.price,
    sale_price: product.sale_price ?? undefined,
    category_id: product.category_id || "",
    collection_id: product.collection_id || "",
    fabric: product.fabric || "",
    fit: product.fit || "",
    season: product.season || "",
    care: product.care || "",
    short_description: product.short_description || "",
    description: product.description || "",
    sizes: product.sizes || ["XS", "S", "M", "L", "XL"],
    colors: (product.colors || []).join(", "),
    tags: (product.tags || []).join(", "),
    images: (product.images || []).join("\n"),
    stock_status: product.stock_status,
    is_new: product.is_new,
    is_featured: product.is_featured,
    is_trending: product.is_trending,
    on_sale: product.on_sale,
    seo_title: product.seo_title || "",
    seo_description: product.seo_description || "",
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      const imagesArray = formData.images
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

      const colorsArray = formData.colors
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const tagsArray = formData.tags
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        id: product.id,
        name: formData.name,
        slug: formData.slug,
        sku: formData.sku,
        price: Number(formData.price),
        sale_price: formData.sale_price ? Number(formData.sale_price) : null,
        category_id: formData.category_id || null,
        collection_id: formData.collection_id || null,
        fabric: formData.fabric || null,
        fit: formData.fit || null,
        season: formData.season || null,
        care: formData.care || null,
        short_description: formData.short_description || null,
        description: formData.description || null,
        sizes: formData.sizes,
        colors: colorsArray,
        tags: tagsArray,
        images: imagesArray.length ? imagesArray : ["/images/look-1.jpg"],
        stock_status: formData.stock_status,
        is_new: formData.is_new,
        is_featured: formData.is_featured,
        is_trending: formData.is_trending,
        on_sale: !!formData.sale_price || formData.on_sale,
        seo_title: formData.seo_title || formData.name,
        seo_description: formData.seo_description || formData.short_description,
      };

      await safeDbMutation(
        () => supabase.from("products").update(payload as any).eq("id", product.id),
        () => saveStoredProduct(payload)
      );
    },
    onSuccess: () => {
      toast.success("Product updated successfully.");
      router.navigate({ to: "/admin/products" as any });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update product.");
    },
  });

  return (
    <AdminLayout title={`Edit Product: ${product.name}`}>
      <div className="max-w-4xl space-y-6">
        <Link
          to="/admin/products"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Products Inventory</span>
        </Link>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateMutation.mutate();
          }}
          className="bg-card border border-border p-6 sm:p-8 space-y-8 text-xs"
        >
          {/* General */}
          <div className="space-y-4">
            <h3 className="eyebrow text-foreground font-semibold border-b border-border pb-2">
              1. General Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-semibold text-foreground">Product Title *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-muted/40 border border-border p-2.5 outline-none focus:border-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Slug *</label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full bg-muted/40 border border-border p-2.5 outline-none focus:border-foreground font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">SKU Code *</label>
                <input
                  type="text"
                  required
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="w-full bg-muted/40 border border-border p-2.5 outline-none focus:border-foreground font-mono"
                />
              </div>
            </div>
          </div>

          {/* Pricing & Categories */}
          <div className="space-y-4">
            <h3 className="eyebrow text-foreground font-semibold border-b border-border pb-2">
              2. Merchandising & Pricing
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Price (PKR) *</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full bg-muted/40 border border-border p-2.5 outline-none focus:border-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Sale Price (PKR)</label>
                <input
                  type="number"
                  min={0}
                  value={formData.sale_price || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sale_price: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  placeholder="Optional sale price"
                  className="w-full bg-muted/40 border border-border p-2.5 outline-none focus:border-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Category</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full bg-muted/40 border border-border p-2.5 outline-none focus:border-foreground"
                >
                  <option value="">Select category...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Collection</label>
                <select
                  value={formData.collection_id}
                  onChange={(e) => setFormData({ ...formData, collection_id: e.target.value })}
                  className="w-full bg-muted/40 border border-border p-2.5 outline-none focus:border-foreground"
                >
                  <option value="">Select collection...</option>
                  {collections.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Textile Details */}
          <div className="space-y-4">
            <h3 className="eyebrow text-foreground font-semibold border-b border-border pb-2">
              3. Fabric & Specifications
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Fabric</label>
                <input
                  type="text"
                  value={formData.fabric}
                  onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
                  className="w-full bg-muted/40 border border-border p-2.5 outline-none focus:border-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Fit</label>
                <input
                  type="text"
                  value={formData.fit}
                  onChange={(e) => setFormData({ ...formData, fit: e.target.value })}
                  className="w-full bg-muted/40 border border-border p-2.5 outline-none focus:border-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Season</label>
                <input
                  type="text"
                  value={formData.season}
                  onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                  className="w-full bg-muted/40 border border-border p-2.5 outline-none focus:border-foreground"
                />
              </div>
            </div>
          </div>

          {/* Sizes & Colors */}
          <div className="space-y-4">
            <h3 className="eyebrow text-foreground font-semibold border-b border-border pb-2">
              4. Variants & Status
            </h3>
            <div className="space-y-3">
              <div>
                <label className="font-semibold text-foreground block mb-1.5">Sizes Available</label>
                <div className="flex flex-wrap gap-2">
                  {ALL_SIZES.map((sz) => {
                    const isChecked = formData.sizes.includes(sz);
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            sizes: isChecked
                              ? formData.sizes.filter((s) => s !== sz)
                              : [...formData.sizes, sz],
                          });
                        }}
                        className={`px-3 py-1.5 border text-xs ${
                          isChecked
                            ? "bg-foreground text-background border-foreground font-semibold"
                            : "border-border text-muted-foreground"
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Colors (comma separated)</label>
                  <input
                    type="text"
                    value={formData.colors}
                    onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                    className="w-full bg-muted/40 border border-border p-2.5 outline-none focus:border-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Stock Status</label>
                  <select
                    value={formData.stock_status}
                    onChange={(e) => setFormData({ ...formData, stock_status: e.target.value as any })}
                    className="w-full bg-muted/40 border border-border p-2.5 outline-none focus:border-foreground"
                  >
                    <option value="in_stock">In Stock</option>
                    <option value="low_stock">Low Stock</option>
                    <option value="sold_out">Sold Out</option>
                    <option value="coming_soon">Coming Soon</option>
                    <option value="pre_order">Pre-Order</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Media */}
          <div className="space-y-4">
            <h3 className="eyebrow text-foreground font-semibold border-b border-border pb-2">
              5. Photography URLs
            </h3>
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Image URLs (one per line)</label>
              <textarea
                rows={3}
                value={formData.images}
                onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                className="w-full bg-muted/40 border border-border p-2.5 outline-none focus:border-foreground font-mono text-xs"
              />
            </div>
          </div>

          {/* Badges */}
          <div className="space-y-4">
            <h3 className="eyebrow text-foreground font-semibold border-b border-border pb-2">
              6. Badges & Visibility
            </h3>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_new}
                  onChange={(e) => setFormData({ ...formData, is_new: e.target.checked })}
                />
                <span className="font-medium">New Arrival Badge</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                />
                <span className="font-medium">Featured on Homepage</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_trending}
                  onChange={(e) => setFormData({ ...formData, is_trending: e.target.checked })}
                />
                <span className="font-medium">Trending Badge</span>
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-border flex justify-end gap-3">
            <Link to="/admin/products" className="btn-outline">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="btn-lux flex items-center gap-2"
            >
              {updateMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
