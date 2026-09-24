import { createFileRoute, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { productQuery, STOCK_LABEL } from "@/lib/catalog";
import { Price } from "@/components/store/ProductCard";

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ context, params }) => {
    const d = await context.queryClient.ensureQueryData(productQuery(params.slug));
    if (!d) throw notFound();
    return d;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: loaderData.product.seo_title ?? loaderData.product.name },
          { name: "description", content: loaderData.product.seo_description ?? "" },
          { property: "og:title", content: loaderData.product.name },
          { property: "og:description", content: loaderData.product.seo_description ?? "" },
        ]
      : [{ title: "Not found" }, { name: "robots", content: "noindex" }],
  }),
  notFoundComponent: () => <p className="p-20 text-center font-serif text-3xl">This piece is no longer available.</p>,
  errorComponent: () => <p className="p-20 text-center">Something went wrong.</p>,
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(productQuery(slug));
  if (!data) return null;
  const p = data.product;
  return (
    <main className="grid gap-10 px-5 py-10 md:grid-cols-2 md:px-10">
      <div className="grid gap-2">{p.images.map((src, i) => <img key={src} src={src} alt={p.image_alts[i] ?? p.name} className="w-full" />)}</div>
      <div className="space-y-4 md:sticky md:top-10 md:self-start">
        <p className="eyebrow text-muted-foreground">{p.collection?.name}</p>
        <h1 className="text-4xl md:text-5xl">{p.name}</h1>
        <Price p={p} />
        <p className="eyebrow">{STOCK_LABEL[p.stock_status]} · SKU {p.sku}</p>
        <p className="text-sm text-muted-foreground">{p.description}</p>
      </div>
    </main>
  );
}
