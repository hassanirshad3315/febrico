import { useState, useEffect } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import {
  Filter,
  X,
  ChevronDown,
  ArrowUpDown,
  Sparkles,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import {
  listProducts,
  layoutQuery,
  formatPKR,
  PAGE_SIZE,
  type Product,
  type ListFilters,
} from "@/lib/catalog";
import { ProductCard } from "@/components/store/ProductCard";

const searchSchema = z
  .object({
    category: z.string().optional(),
    collection: z.string().optional(),
    sort: z.string().optional(),
    page: z.number().int().optional(),
    fabric: z.string().optional(),
    size: z.string().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
    q: z.string().optional(),
    newOnly: z.boolean().optional(),
    sale: z.boolean().optional(),
  })
  .default({});

export const Route = createFileRoute("/shop")({
  validateSearch: (s: Record<string, unknown>) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Shop All Collections — FABRICO Style Studio" },
      {
        name: "description",
        content:
          "Browse the complete FABRICO women's fashion studio: ready-to-wear kurtas, luxury unstitched fabrics, festive raw silks, and coordinates.",
      },
      { property: "og:title", content: "Shop All Pieces | FABRICO" },
    ],
  }),
  component: ShopPage,
});

const FABRIC_OPTIONS = [
  "Raw Silk",
  "Lawn",
  "Velvet",
  "Cambric",
  "Organza",
  "Khaddar",
  "Karandi",
  "Chiffon",
  "Cotton",
  "Net",
  "Jamawar",
];

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "One Size"];

const SORT_OPTIONS = [
  { label: "Featured & Curated", value: "featured" },
  { label: "Newest Arrivals", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Best Sellers", value: "best_sellers" },
  { label: "Trending Now", value: "trending" },
];

function ShopPage() {
  const searchParams = Route.useSearch();
  const router = useRouter();
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Layout query for category and collection options
  const { data: layoutData } = useQuery(layoutQuery);
  const categories = layoutData?.categories || [];
  const collections = layoutData?.collections || [];

  // Match category slug to ID if present
  const categoryIds = searchParams.category
    ? categories
        .filter(
          (c) =>
            c.slug === searchParams.category ||
            categories.find((p) => p.slug === searchParams.category && c.parent_id === p.id)
        )
        .map((c) => c.id)
    : undefined;

  const collectionId = searchParams.collection
    ? collections.find((c) => c.slug === searchParams.collection)?.id
    : undefined;

  const filters: ListFilters = {
    sizes: searchParams.size ? [searchParams.size] : undefined,
    fabrics: searchParams.fabric ? [searchParams.fabric] : undefined,
    min: searchParams.min,
    max: searchParams.max,
    sort: searchParams.sort,
    page: searchParams.page || 1,
    newOnly: searchParams.newOnly,
    sale: searchParams.sale,
    q: searchParams.q,
  };

  const { data: productsData, isLoading } = useQuery({
    queryKey: ["products", searchParams, categoryIds, collectionId],
    queryFn: () => listProducts(filters, { categoryIds, collectionId }),
  });

  const products = productsData?.products || [];
  const totalCount = productsData?.count || 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE) || 1;
  const currentPage = searchParams.page || 1;

  const updateSearch = (patch: Partial<z.infer<typeof searchSchema>>) => {
    router.navigate({
      to: "/shop",
      search: {
        ...searchParams,
        page: 1, // reset page on filter change
        ...patch,
      } as any,
    });
  };

  const clearAllFilters = () => {
    router.navigate({
      to: "/shop",
      search: {} as any,
    });
  };

  const hasActiveFilters =
    !!searchParams.category ||
    !!searchParams.collection ||
    !!searchParams.fabric ||
    !!searchParams.size ||
    !!searchParams.sale ||
    !!searchParams.newOnly ||
    !!searchParams.q;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      {/* Studio Header */}
      <div className="border-b border-border pb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-muted-foreground mb-1">Studio Catalog</p>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-foreground font-normal">
            All Pieces ({totalCount})
          </h1>
          <p className="text-xs text-muted-foreground mt-2 max-w-xl">
            Explore our full selection of artisanal ready-to-wear, unstitched luxury fabrics, and festive separates.
          </p>
        </div>

        {/* Filter / Sort Control Bar */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* Mobile Filter Toggle */}
          <button
            type="button"
            onClick={() => setFilterDrawerOpen(true)}
            className="lg:hidden btn-outline flex items-center gap-2 text-xs py-2 px-3 h-10"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Filters {hasActiveFilters && "•"}</span>
          </button>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={searchParams.sort || "featured"}
              onChange={(e) => updateSearch({ sort: e.target.value })}
              className="appearance-none bg-card border border-border text-xs px-3 pr-8 py-2.5 h-10 outline-none focus:border-foreground transition-colors font-sans cursor-pointer uppercase tracking-wider"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Main Content Layout: Sidebar + Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Desktop Filter Sidebar (3 cols) */}
        <aside className="hidden lg:block lg:col-span-3 space-y-6 sticky top-24 pr-4 border-r border-border/60 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h3 className="eyebrow text-foreground font-semibold">Refine Studio</h3>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-[0.65rem] uppercase text-muted-foreground hover:text-foreground underline underline-offset-4"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <h4 className="eyebrow text-[0.62rem] text-muted-foreground">Category</h4>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => updateSearch({ category: undefined })}
                className={`block w-full text-left py-1 transition-colors ${
                  !searchParams.category ? "font-semibold text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All Categories
              </button>
              {categories
                .filter((c) => !c.parent_id)
                .map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() =>
                      updateSearch({
                        category: searchParams.category === c.slug ? undefined : c.slug,
                      })
                    }
                    className={`block w-full text-left py-1 transition-colors ${
                      searchParams.category === c.slug
                        ? "font-semibold text-foreground underline underline-offset-4"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
            </div>
          </div>

          {/* Collections */}
          <div className="space-y-2 pt-4 border-t border-border/60">
            <h4 className="eyebrow text-[0.62rem] text-muted-foreground">Collection</h4>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => updateSearch({ collection: undefined })}
                className={`block w-full text-left py-1 transition-colors ${
                  !searchParams.collection ? "font-semibold text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All Collections
              </button>
              {collections.map((col) => (
                <button
                  key={col.id}
                  type="button"
                  onClick={() =>
                    updateSearch({
                      collection: searchParams.collection === col.slug ? undefined : col.slug,
                    })
                  }
                  className={`block w-full text-left py-1 transition-colors ${
                    searchParams.collection === col.slug
                      ? "font-semibold text-foreground underline underline-offset-4"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {col.name}
                </button>
              ))}
            </div>
          </div>

          {/* Fabric */}
          <div className="space-y-2 pt-4 border-t border-border/60">
            <h4 className="eyebrow text-[0.62rem] text-muted-foreground">Fabric</h4>
            <div className="flex flex-wrap gap-1.5">
              {FABRIC_OPTIONS.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() =>
                    updateSearch({
                      fabric: searchParams.fabric === f ? undefined : f,
                    })
                  }
                  className={`px-2 py-1 text-[0.65rem] border transition-colors ${
                    searchParams.fabric === f
                      ? "border-foreground bg-foreground text-background font-medium"
                      : "border-border text-muted-foreground hover:border-foreground"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Sizes */}
          <div className="space-y-2 pt-4 border-t border-border/60">
            <h4 className="eyebrow text-[0.62rem] text-muted-foreground">Size</h4>
            <div className="flex flex-wrap gap-1.5">
              {SIZE_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() =>
                    updateSearch({
                      size: searchParams.size === s ? undefined : s,
                    })
                  }
                  className={`h-7 min-w-7 px-2 text-[0.65rem] border uppercase transition-colors ${
                    searchParams.size === s
                      ? "border-foreground bg-foreground text-background font-medium"
                      : "border-border text-muted-foreground hover:border-foreground"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Special Tags */}
          <div className="space-y-2 pt-4 border-t border-border/60">
            <h4 className="eyebrow text-[0.62rem] text-muted-foreground">Special</h4>
            <div className="space-y-1">
              <label className="flex items-center gap-2 cursor-pointer py-1">
                <input
                  type="checkbox"
                  checked={!!searchParams.sale}
                  onChange={(e) => updateSearch({ sale: e.target.checked || undefined })}
                  className="rounded-none text-foreground focus:ring-0"
                />
                <span className="text-muted-foreground hover:text-foreground">
                  Sale & Reductions Only
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer py-1">
                <input
                  type="checkbox"
                  checked={!!searchParams.newOnly}
                  onChange={(e) => updateSearch({ newOnly: e.target.checked || undefined })}
                  className="rounded-none text-foreground focus:ring-0"
                />
                <span className="text-muted-foreground hover:text-foreground">
                  New Season Arrivals
                </span>
              </label>
            </div>
          </div>
        </aside>

        {/* Product Grid (9 cols) */}
        <div className="lg:col-span-9 space-y-10">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
              <p className="eyebrow text-[0.65rem]">Loading studio pieces...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="py-24 text-center space-y-4 border border-dashed border-border p-8">
              <p className="font-serif text-3xl text-foreground font-normal">No pieces found</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                No designs matched your active filter combination. Try clearing some filters to view more of the studio.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="btn-lux text-xs"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-x-3 gap-y-10 md:gap-x-6">
                {products.map((p, i) => (
                  <ProductCard key={p.id} p={p} priority={i < 4} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-8 border-t border-border">
                  <button
                    type="button"
                    onClick={() => router.navigate({ to: "/shop", search: { ...searchParams, page: Math.max(1, currentPage - 1) } as any })}
                    disabled={currentPage <= 1}
                    className="p-2 border border-border disabled:opacity-30 hover:border-foreground transition-colors"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }).map((_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => router.navigate({ to: "/shop", search: { ...searchParams, page: pageNum } as any })}
                          className={`h-9 w-9 text-xs font-medium border transition-colors ${
                            currentPage === pageNum
                              ? "border-foreground bg-foreground text-background"
                              : "border-border text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => router.navigate({ to: "/shop", search: { ...searchParams, page: Math.min(totalPages, currentPage + 1) } as any })}
                    disabled={currentPage >= totalPages}
                    className="p-2 border border-border disabled:opacity-30 hover:border-foreground transition-colors"
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {filterDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-ink/60 backdrop-blur-xs"
            onClick={() => setFilterDrawerOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-xs bg-card border-l border-border h-full flex flex-col z-10 shadow-2xl p-6 overflow-y-auto space-y-6 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="eyebrow text-foreground font-semibold">Refine Studio</h3>
              <button
                type="button"
                onClick={() => setFilterDrawerOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Categories */}
            <div className="space-y-2">
              <h4 className="eyebrow text-[0.62rem] text-muted-foreground">Category</h4>
              <div className="space-y-1">
                {categories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      updateSearch({
                        category: searchParams.category === c.slug ? undefined : c.slug,
                      });
                      setFilterDrawerOpen(false);
                    }}
                    className={`block w-full text-left py-1 ${
                      searchParams.category === c.slug
                        ? "font-semibold text-foreground underline"
                        : "text-muted-foreground"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Fabrics */}
            <div className="space-y-2 pt-4 border-t border-border">
              <h4 className="eyebrow text-[0.62rem] text-muted-foreground">Fabric</h4>
              <div className="flex flex-wrap gap-1.5">
                {FABRIC_OPTIONS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => {
                      updateSearch({ fabric: searchParams.fabric === f ? undefined : f });
                      setFilterDrawerOpen(false);
                    }}
                    className={`px-2 py-1 text-[0.65rem] border ${
                      searchParams.fabric === f
                        ? "border-foreground bg-foreground text-background"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear button */}
            <div className="pt-6 border-t border-border">
              <button
                type="button"
                onClick={() => {
                  clearAllFilters();
                  setFilterDrawerOpen(false);
                }}
                className="btn-outline w-full text-xs"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
