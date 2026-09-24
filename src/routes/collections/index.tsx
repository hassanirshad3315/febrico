import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Collection } from "@/lib/catalog";

export const Route = createFileRoute("/collections/")({
  head: () => ({
    meta: [
      { title: "Collections — FABRICO Style Studio" },
      {
        name: "description",
        content:
          "Explore all seasonal, festive, and signature edits curated by the FABRICO studio.",
      },
      { property: "og:title", content: "Collections | FABRICO" },
    ],
  }),
  component: CollectionsIndexPage,
});

function CollectionsIndexPage() {
  const { data: collections = [], isLoading } = useQuery({
    queryKey: ["collections", "all"],
    queryFn: async () => {
      const { data } = await supabase
        .from("collections")
        .select("*")
        .order("sort_order");
      return (data as unknown as Collection[]) || [];
    },
  });

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-8 py-12 space-y-12">
      <div className="border-b border-border pb-6">
        <p className="eyebrow text-muted-foreground mb-1">Curated Edits</p>
        <h1 className="font-serif text-3xl sm:text-5xl text-foreground font-normal">
          All Collections
        </h1>
        <p className="text-xs text-muted-foreground mt-2 max-w-lg">
          Each FABRICO collection tells a story through tactile textures, bespoke prints, and timeless silhouettes.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="eyebrow text-xs">Loading Collections...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {collections.map((col) => (
            <Link
              key={col.id}
              to="/collections/$slug"
              params={{ slug: col.slug }}
              className="group block space-y-3"
            >
              <div className="aspect-[4/5] bg-muted overflow-hidden relative border border-border">
                <img
                  src={col.banner || col.thumbnail || "/images/hero-1.jpg"}
                  alt={col.name}
                  className="h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-lux)] group-hover:scale-105"
                />
                {col.featured && (
                  <span className="eyebrow absolute top-3 left-3 bg-background/90 text-foreground px-2 py-1 text-[0.6rem]">
                    Featured Edit
                  </span>
                )}
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-2xl text-foreground group-hover:text-gold transition-colors">
                    {col.name}
                  </h3>
                  <span className="text-xs text-muted-foreground group-hover:text-foreground inline-flex items-center gap-1">
                    Explore <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                  {col.description || "Discover handcrafted pieces from this collection."}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
