import { useState, useEffect, useTransition } from "react";
import { useRouter, Link } from "@tanstack/react-router";
import { Search, X, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { PRODUCT_FIELDS, type Product, formatPKR } from "@/lib/catalog";
import { track } from "@/lib/analytics";

let searchOpen = false;
const searchListeners = new Set<() => void>();

export function openSearchDialog(open: boolean = true) {
  searchOpen = open;
  searchListeners.forEach((l) => l());
}

export function useSearchDialogOpen() {
  const [open, setOpen] = useState(searchOpen);
  useEffect(() => {
    const listener = () => setOpen(searchOpen);
    searchListeners.add(listener);
    return () => {
      searchListeners.delete(listener);
    };
  }, []);
  return open;
}

const POPULAR_SEARCHES = [
  "Raw Silk",
  "Velvet",
  "Festive Suit",
  "Lawn Co-Ord",
  "Khaddar",
  "Organza Dupatta",
  "Unstitched 3 Piece",
  "Ready To Wear",
];

export function SearchDialog() {
  const open = useSearchDialogOpen();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const timeout = setTimeout(async () => {
      const term = query.replace(/[%,()]/g, " ").trim();
      const { data } = await supabase
        .from("products")
        .select(PRODUCT_FIELDS)
        .or(`name.ilike.%${term}%,sku.ilike.%${term}%,fabric.ilike.%${term}%,tags.cs.{${term.toLowerCase()}}`)
        .limit(6);

      setResults((data as unknown as Product[]) ?? []);
      setLoading(false);
      track("search", { query: term });
    }, 250);

    return () => clearTimeout(timeout);
  }, [query]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    openSearchDialog(false);
    startTransition(() => {
      router.navigate({
        to: "/search",
        search: { q: query.trim() } as any,
      });
    });
  };

  const handleSelectTerm = (term: string) => {
    setQuery(term);
    openSearchDialog(false);
    startTransition(() => {
      router.navigate({
        to: "/search",
        search: { q: term } as any,
      });
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => openSearchDialog(o)}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden rounded-none border border-border bg-card shadow-2xl">
        <DialogTitle className="sr-only">Search FABRICO Catalog</DialogTitle>
        <form onSubmit={handleSearchSubmit} className="relative border-b border-border">
          <div className="flex items-center px-6 py-4">
            <Search className="h-5 w-5 text-muted-foreground mr-3 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by piece name, fabric, color, SKU, or category..."
              className="w-full bg-transparent text-base outline-none placeholder:text-muted-foreground font-sans"
              autoFocus
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </form>

        <div className="max-h-[60vh] overflow-y-auto p-6 space-y-6">
          {!query ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-medium text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-gold" />
                <span>Trending Searches</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SEARCHES.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => handleSelectTerm(term)}
                    className="px-3 py-1.5 text-xs bg-muted/60 hover:bg-foreground hover:text-background transition-colors duration-200 border border-border/50 text-foreground"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-xs uppercase tracking-widest">Searching the studio...</span>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground uppercase tracking-widest">
                <span>{results.length} Pieces Found</span>
                <button
                  type="button"
                  onClick={handleSearchSubmit}
                  className="text-foreground hover:text-gold inline-flex items-center gap-1 text-[0.65rem] font-medium transition-colors"
                >
                  View all results <ArrowRight className="h-3 w-3" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {results.map((p) => (
                  <Link
                    key={p.id}
                    to="/product/$slug"
                    params={{ slug: p.slug }}
                    onClick={() => openSearchDialog(false)}
                    className="group flex gap-3 p-2 bg-muted/30 hover:bg-muted transition-colors border border-transparent hover:border-border"
                  >
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="h-20 w-16 object-cover bg-muted shrink-0"
                    />
                    <div className="min-w-0 flex flex-col justify-center">
                      <p className="eyebrow text-[0.55rem] text-muted-foreground truncate">
                        {p.collection?.name || p.fabric}
                      </p>
                      <h4 className="text-xs font-medium text-foreground truncate group-hover:text-gold transition-colors">
                        {p.name}
                      </h4>
                      <p className="text-xs mt-1 font-sans">
                        {p.sale_price ? (
                          <span className="text-destructive font-medium">
                            {formatPKR(p.sale_price)}
                          </span>
                        ) : (
                          formatPKR(p.price)
                        )}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center space-y-2">
              <p className="font-serif text-2xl text-foreground">No pieces match "{query}"</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Try searching for broader keywords such as "silk", "kurta", "festive", or explore our latest collections.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
