import { useState, useEffect } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Search, X, Loader2, Sparkles, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PRODUCT_FIELDS, type Product } from "@/lib/catalog";
import { ProductCard } from "@/components/store/ProductCard";

const searchParamsSchema = z
  .object({
    q: z.string().optional(),
  })
  .default({});

export const Route = createFileRoute("/search")({
  validateSearch: (s: Record<string, unknown>) => searchParamsSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Search Catalog | FABRICO Style Studio" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SearchResultsPage,
});

const SUGGESTIONS = [
  "Raw Silk",
  "Velvet",
  "Festive Suit",
  "Lawn Co-Ord",
  "Khaddar",
  "Organza",
  "Unstitched",
  "Dresses",
];

function SearchResultsPage() {
  const searchParams = Route.useSearch();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState(searchParams.q || "");

  useEffect(() => {
    setSearchTerm(searchParams.q || "");
  }, [searchParams.q]);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["search-results", searchParams.q],
    queryFn: async () => {
      const q = searchParams.q?.trim();
      if (!q) return [];
      const term = q.replace(/[%,()]/g, " ");
      const { data } = await supabase
        .from("products")
        .select(PRODUCT_FIELDS)
        .or(`name.ilike.%${term}%,sku.ilike.%${term}%,fabric.ilike.%${term}%,tags.cs.{${term.toLowerCase()}}`)
        .order("created_at", { ascending: false });

      return (data as unknown as Product[]) || [];
    },
    enabled: !!searchParams.q?.trim(),
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    router.navigate({
      to: "/search",
      search: { q: searchTerm.trim() },
    });
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-8 py-12 space-y-12">
      {/* Header & Search Bar */}
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <div className="space-y-1">
          <p className="eyebrow text-muted-foreground">Studio Discovery</p>
          <h1 className="font-serif text-3xl sm:text-4xl text-foreground font-normal">
            Search The Collection
          </h1>
        </div>

        <form onSubmit={handleSearchSubmit} className="relative">
          <div className="flex items-center border border-foreground/30 focus-within:border-foreground bg-card transition-colors">
            <Search className="h-5 w-5 text-muted-foreground ml-4 shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by fabric, silhouette, color, or style code..."
              className="w-full bg-transparent px-4 py-3.5 text-sm outline-none placeholder:text-muted-foreground font-sans"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="p-2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <button
              type="submit"
              className="btn-lux bg-foreground text-background hover:bg-gold hover:text-ink text-xs px-6 py-3.5 h-full rounded-none"
            >
              Search
            </button>
          </div>
        </form>

        {/* Suggested Searches */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="text-muted-foreground text-[0.65rem] uppercase tracking-wider">
            Popular Searches:
          </span>
          {SUGGESTIONS.map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => {
                setSearchTerm(term);
                router.navigate({ to: "/search", search: { q: term } });
              }}
              className="px-2.5 py-1 bg-muted/60 hover:bg-foreground hover:text-background border border-border/50 text-[0.7rem] transition-colors"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="space-y-6 pt-6 border-t border-border">
        {searchParams.q && (
          <div className="flex items-center justify-between">
            <p className="eyebrow text-muted-foreground">
              {products.length} Results for "{searchParams.q}"
            </p>
            <Link to="/shop" className="text-xs underline underline-offset-4 hover:text-gold">
              Explore All Studio Pieces
            </Link>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="eyebrow text-xs">Searching the studio...</span>
          </div>
        ) : searchParams.q && products.length === 0 ? (
          <div className="py-20 text-center space-y-4 border border-dashed border-border p-8">
            <p className="font-serif text-3xl text-foreground font-normal">
              No pieces match "{searchParams.q}"
            </p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Try searching with broader terms like "silk", "suit", "lawn", or explore our latest seasonal edits.
            </p>
            <div className="pt-2">
              <Link to="/shop" className="btn-lux text-xs">
                Browse Full Studio Catalog
              </Link>
            </div>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-10 md:gap-x-6">
            {products.map((p, i) => (
              <ProductCard key={p.id} p={p} priority={i < 4} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-muted-foreground">
            Enter a search term above to find handcrafted pieces.
          </div>
        )}
      </div>
    </main>
  );
}
