import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Heart, ShoppingBag, Trash2, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { store, useStore } from "@/lib/store";
import { PRODUCT_FIELDS, formatPKR, type Product, STOCK_LABEL } from "@/lib/catalog";
import { toast } from "sonner";
import { track } from "@/lib/analytics";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "Saved Pieces & Wishlist | FABRICO" },
      { name: "description", content: "Review your saved luxury Pakistani fashion pieces." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const wishlistIds = useStore((s) => s.wishlist);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["wishlist-products", wishlistIds],
    queryFn: async () => {
      if (!wishlistIds.length) return [];
      const { data } = await supabase
        .from("products")
        .select(PRODUCT_FIELDS)
        .in("id", wishlistIds);

      return (data as unknown as Product[]) || [];
    },
    enabled: wishlistIds.length > 0,
  });

  const handleAddAllToBag = () => {
    let addedCount = 0;
    products.forEach((p) => {
      if (p.stock_status !== "sold_out") {
        store.addToBag({
          productId: p.id,
          slug: p.slug,
          name: p.name,
          sku: p.sku,
          image: p.images[0] || "/images/look-1.jpg",
          price: p.sale_price ?? p.price,
          size: p.sizes[0] || "Standard",
          color: p.colors[0] || "Standard",
          qty: 1,
        });
        addedCount++;
      }
    });

    if (addedCount > 0) {
      toast.success(`${addedCount} piece(s) added to your shopping bag.`);
      store.setBagOpen(true);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-8 py-12 space-y-10">
      <div className="border-b border-border pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-muted-foreground mb-1">Personal Collection</p>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-foreground font-normal">
            Your Saved Pieces ({wishlistIds.length})
          </h1>
        </div>

        {products.length > 0 && (
          <button
            type="button"
            onClick={handleAddAllToBag}
            className="btn-lux text-xs flex items-center gap-2 self-start sm:self-auto"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Add All To Bag</span>
          </button>
        )}
      </div>

      {wishlistIds.length === 0 ? (
        <div className="py-24 text-center space-y-4 border border-dashed border-border p-8 max-w-lg mx-auto">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
            <Heart className="h-7 w-7 stroke-1" />
          </div>
          <div className="space-y-1">
            <p className="font-serif text-2xl text-foreground">Your wishlist is empty</p>
            <p className="text-xs text-muted-foreground">
              Save your favorite silhouettes and festive pieces while browsing the studio.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
            <Link to="/new-in" className="btn-lux text-xs">
              Explore New Arrivals
            </Link>
            <Link to="/shop" className="btn-outline text-xs">
              Shop All Pieces
            </Link>
          </div>
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="eyebrow text-xs">Loading saved pieces...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <article key={p.id} className="group border border-border bg-card p-4 space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <Link to="/product/$slug" params={{ slug: p.slug }} className="block aspect-[3/4] overflow-hidden bg-muted relative">
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="eyebrow absolute top-2 left-2 bg-background/90 text-foreground px-1.5 py-0.5 text-[0.55rem]">
                    {STOCK_LABEL[p.stock_status]}
                  </span>
                </Link>

                <div className="space-y-1">
                  {p.collection && (
                    <p className="eyebrow text-[0.55rem] text-muted-foreground">
                      {p.collection.name}
                    </p>
                  )}
                  <Link
                    to="/product/$slug"
                    params={{ slug: p.slug }}
                    className="text-xs font-medium text-foreground hover:text-gold transition-colors line-clamp-1"
                  >
                    {p.name}
                  </Link>
                  <p className="text-xs font-semibold text-foreground font-sans">
                    {formatPKR(p.sale_price ?? p.price)}
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => {
                    store.addToBag({
                      productId: p.id,
                      slug: p.slug,
                      name: p.name,
                      sku: p.sku,
                      image: p.images[0] || "/images/look-1.jpg",
                      price: p.sale_price ?? p.price,
                      size: p.sizes[0] || "Standard",
                      color: p.colors[0] || "Standard",
                      qty: 1,
                    });
                    track("bag_add", { product_id: p.id, collection_id: p.collection_id });
                    toast.success(`${p.name} added to bag.`);
                  }}
                  disabled={p.stock_status === "sold_out"}
                  className="btn-lux w-full text-[0.65rem] py-2.5 min-h-9 flex items-center justify-center gap-1.5"
                >
                  <ShoppingBag className="h-3.5 w-3.5" />
                  <span>Add To Bag</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    store.toggleWishlist(p.id);
                    track("wishlist_remove", { product_id: p.id });
                  }}
                  className="w-full text-center text-[0.65rem] text-muted-foreground hover:text-destructive py-1 flex items-center justify-center gap-1 transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Remove</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
