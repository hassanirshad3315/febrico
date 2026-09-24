import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PRODUCT_FIELDS, type Product, type Collection } from "@/lib/catalog";
import { ProductCard } from "@/components/store/ProductCard";

export const Route = createFileRoute("/collections/$slug")({
  loader: async ({ params }) => {
    const { data } = await supabase
      .from("collections")
      .select("*")
      .eq("slug", params.slug)
      .maybeSingle();

    if (!data) throw notFound();
    return { collection: data as Collection };
  },
  head: ({ loaderData }) => {
    if (!loaderData?.collection) return { meta: [{ title: "Collection Not Found" }] };
    const col = loaderData.collection;
    return {
      meta: [
        { title: `${col.seo_title || col.name} Collection — FABRICO` },
        {
          name: "description",
          content: col.seo_description || col.description || `Shop the ${col.name} collection at FABRICO.`,
        },
        { property: "og:title", content: `${col.name} Collection | FABRICO` },
        { property: "og:image", content: col.banner || "/images/hero-1.jpg" },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="py-24 text-center px-4 space-y-4">
      <p className="eyebrow text-muted-foreground">Studio Archive</p>
      <h1 className="font-serif text-4xl text-foreground font-normal">Collection Not Found</h1>
      <p className="text-xs text-muted-foreground max-w-sm mx-auto">
        The collection you are looking for does not exist or has concluded.
      </p>
      <div className="pt-4">
        <Link to="/collections" className="btn-lux">
          Browse All Collections
        </Link>
      </div>
    </div>
  ),
  component: CollectionDetailPage,
});

function CollectionDetailPage() {
  const { collection } = Route.useLoaderData();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products", "collection", collection.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select(PRODUCT_FIELDS)
        .eq("collection_id", collection.id)
        .order("created_at", { ascending: false });

      return (data as unknown as Product[]) || [];
    },
  });

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[0.65rem] tracking-wider uppercase text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/collections" className="hover:text-foreground">Collections</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">{collection.name}</span>
      </nav>

      {/* Collection Hero Header */}
      <div className="relative aspect-[21/9] sm:aspect-[24/8] bg-ink overflow-hidden flex items-center p-8 sm:p-14 text-ivory">
        <img
          src={collection.banner || collection.thumbnail || "/images/hero-1.jpg"}
          alt={collection.name}
          className="anim-ken-burns absolute inset-0 h-full w-full object-cover opacity-60"
        />
        <div className="relative z-10 max-w-xl space-y-3">
          <p className="eyebrow text-gold text-[0.65rem]">Curated Collection</p>
          <h1 className="font-serif text-3xl sm:text-5xl font-normal leading-tight">
            {collection.name}
          </h1>
          <p className="text-xs sm:text-sm text-ivory/80 max-w-md leading-relaxed">
            {collection.description ||
              "Artisanal craftsmanship, refined Pakistani fabrics, and modern design."}
          </p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <p className="eyebrow text-muted-foreground">{products.length} Designs in this Edit</p>
          <Link to="/shop" className="text-xs underline underline-offset-4 hover:text-gold flex items-center gap-1 font-medium">
            Explore All Studio <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="eyebrow text-xs">Loading Pieces...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center space-y-3 border border-dashed border-border p-8">
            <p className="font-serif text-2xl text-foreground">No pieces in this collection yet</p>
            <p className="text-xs text-muted-foreground">Explore our other curated seasonal edits.</p>
            <div className="pt-2">
              <Link to="/shop" className="btn-lux text-xs">
                Browse Full Catalog
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-10 md:gap-x-6">
            {products.map((p, i) => (
              <ProductCard key={p.id} p={p} priority={i < 4} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
