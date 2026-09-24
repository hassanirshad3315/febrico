import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { homeQuery } from "@/lib/catalog";
import { ProductRail } from "@/components/store/ProductCard";
import { QuickView } from "@/components/store/QuickView";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FABRICO — Modern Pakistani Fashion" },
      { name: "description", content: "Contemporary Pakistani women's fashion: ready to wear, unstitched, festive and formal." },
      { property: "og:title", content: "FABRICO — Modern Pakistani Fashion" },
      { property: "og:description", content: "Contemporary Pakistani women's fashion, ordered easily on WhatsApp." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(homeQuery),
  component: Home,
});

function Home() {
  const { data } = useSuspenseQuery(homeQuery);
  const hero = data.hero[0];
  return (
    <main>
      {hero && (
        <section className="relative h-[92svh] overflow-hidden bg-ink">
          <img src={hero.image} alt="" className="anim-ken-burns absolute inset-0 h-full w-full object-cover" style={{ objectPosition: hero.focal }} />
          <div className="absolute inset-0 bg-ink/30" />
          <div className="anim-fade-up relative flex h-full max-w-xl flex-col justify-end p-6 pb-20 text-ivory md:p-16">
            <p className="eyebrow mb-4">FABRICO</p>
            <h1 className="text-5xl leading-[0.95] md:text-7xl">{hero.title}</h1>
            <p className="mt-4 text-sm">{hero.subtitle}</p>
            {hero.cta_url && <a href={hero.cta_url} className="btn-outline mt-8 self-start">{hero.cta_label}</a>}
          </div>
        </section>
      )}
      {data.sections
        .filter((s: any) => s.type === "product_carousel" && s.products?.length)
        .map((s: any) => (
          <section key={s.id} className="px-5 py-16 md:px-10">
            <h2 className="mb-8 text-3xl md:text-5xl">{s.title}</h2>
            <ProductRail products={s.products} badge={s.config?.badge} />
          </section>
        ))}
      <QuickView />
      <p className="sr-only"><Link to="/">Home</Link></p>
    </main>
  );
}
