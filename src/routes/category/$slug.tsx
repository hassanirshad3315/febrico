import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PRODUCT_FIELDS, type Product, type Category } from "@/lib/catalog";
import { ProductCard } from "@/components/store/ProductCard";

export const Route = createFileRoute("/category/$slug")({
  loader: async ({ params }) => {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .eq("slug", params.slug)
      .maybeSingle();

    if (!data) throw notFound();

    // Check for child subcategories
    const { data: subcats } = await supabase
      .from("categories")
      .select("*")
      .eq("parent_id", data.id)
      .order("sort_order");

    return { category: data as Category, subcategories: (subcats as Category[]) || [] };
  },
  head: ({ loaderData }) => {
    if (!loaderData?.category) return { meta: [{ title: "Category Not Found" }] };
    const cat = loaderData.category;
    return {
      meta: [
        { title: `${cat.name} — Pakistani Women's Fashion | FABRICO` },
        {
          name: "description",
          content: cat.description || `Shop the latest ${cat.name} styles from FABRICO.`,
        },
        { property: "og:title", content: `${cat.name} | FABRICO` },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="py-24 text-center px-4 space-y-4">
      <p className="eyebrow text-muted-foreground">Category Unavailable</p>
      <h1 className="font-serif text-4xl text-foreground font-normal">Category Not Found</h1>
      <div className="pt-4">
        <Link to="/shop" className="btn-lux">
          Browse All Pieces
        </Link>
      </div>
    </div>
  ),
  component: CategoryDetailPage,
});

function CategoryDetailPage() {
  const { category, subcategories } = Route.useLoaderData();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products", "category", category.id, subcategories.map((s) => s.id)],
    queryFn: async () => {
      const allCategoryIds = [category.id, ...subcategories.map((s) => s.id)];
      const { data } = await supabase
        .from("products")
        .select(PRODUCT_FIELDS)
        .in("category_id", allCategoryIds)
        .order("created_at", { ascending: false });

      return (data as unknown as Product[]) || [];
    },
  });

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-10">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-[0.65rem] tracking-wider uppercase text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/shop" className="hover:text-foreground">Shop</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">{category.name}</span>
      </nav>

      {/* Header */}
      <div className="border-b border-border pb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <p className="eyebrow text-muted-foreground mb-1">Category Edit</p>
          <h1 className="font-serif text-3xl sm:text-5xl text-foreground font-normal">
            {category.name} ({products.length})
          </h1>
          <p className="text-xs text-muted-foreground mt-2 max-w-lg leading-relaxed">
            {category.description ||
              "Carefully crafted garments with artisanal finish and modern silhouettes."}
          </p>
        </div>

        {/* Subcategories tags if any */}
        {subcategories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {subcategories.map((sub) => (
              <span
                key={sub.id}
                className="px-3 py-1.5 text-xs bg-muted/60 border border-border text-foreground font-medium"
              >
                {sub.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Grid */}
      <div>
        {isLoading ? (
          <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="eyebrow text-xs">Loading Category Pieces...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center space-y-3 border border-dashed border-border p-8">
            <p className="font-serif text-2xl text-foreground">
              No pieces currently in this category
            </p>
            <p className="text-xs text-muted-foreground">Explore other studio categories or collections.</p>
            <div className="pt-2">
              <Link to="/shop" className="btn-lux text-xs">
                Browse Studio Catalog
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
