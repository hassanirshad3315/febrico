import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import type { Category, Collection } from "@/lib/catalog";

export function ShopMegaMenu({
  categories,
  onClose,
}: {
  categories: Category[];
  onClose: () => void;
}) {
  const mainCategories = categories.filter((c) => !c.parent_id);

  return (
    <div className="absolute top-full left-0 w-full bg-card/95 backdrop-blur-md border-b border-border shadow-2xl py-10 px-8 transition-all duration-300 animate-in fade-in-0 slide-in-from-top-2">
      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-8">
        {/* Category Columns */}
        <div className="col-span-8 grid grid-cols-3 gap-8 border-r border-border/60 pr-8">
          <div>
            <p className="eyebrow text-xs text-foreground font-semibold mb-4 tracking-[0.2em]">
              Clothing
            </p>
            <ul className="space-y-2.5 text-xs text-muted-foreground">
              {mainCategories
                .filter((c) =>
                  ["ready-to-wear", "unstitched", "suits", "dresses", "co-ords"].includes(c.slug)
                )
                .map((cat) => (
                  <li key={cat.id}>
                    <Link
                      to="/category/$slug"
                      params={{ slug: cat.slug }}
                      onClick={onClose}
                      className="hover:text-foreground hover:translate-x-1 inline-block transition-all duration-200"
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>

          <div>
            <p className="eyebrow text-xs text-foreground font-semibold mb-4 tracking-[0.2em]">
              Separates & Accents
            </p>
            <ul className="space-y-2.5 text-xs text-muted-foreground">
              {mainCategories
                .filter((c) =>
                  ["tops", "bottoms", "shawls-dupattas", "accessories"].includes(c.slug)
                )
                .map((cat) => (
                  <li key={cat.id}>
                    <Link
                      to="/category/$slug"
                      params={{ slug: cat.slug }}
                      onClick={onClose}
                      className="hover:text-foreground hover:translate-x-1 inline-block transition-all duration-200"
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>

          <div>
            <p className="eyebrow text-xs text-foreground font-semibold mb-4 tracking-[0.2em]">
              Featured Edits
            </p>
            <ul className="space-y-2.5 text-xs text-muted-foreground">
              <li>
                <Link
                  to="/new-in"
                  onClick={onClose}
                  className="hover:text-foreground flex items-center gap-1.5 transition-colors"
                >
                  <Sparkles className="h-3 w-3 text-gold" />
                  <span>New Arrivals</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/collections/$slug"
                  params={{ slug: "sale" }}
                  onClick={onClose}
                  className="text-destructive hover:underline"
                >
                  Special Reductions
                </Link>
              </li>
              <li>
                <Link
                  to="/shop"
                  onClick={onClose}
                  className="text-foreground font-medium underline underline-offset-4 flex items-center gap-1 pt-2"
                >
                  Shop All Pieces <ArrowRight className="h-3 w-3" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Visual Promo Banner */}
        <div className="col-span-4 pl-4 flex flex-col justify-between">
          <Link
            to="/campaign/$slug"
            params={{ slug: "festive-moments" }}
            onClick={onClose}
            className="group relative block aspect-[16/10] overflow-hidden bg-muted"
          >
            <img
              src="/images/look-5.jpg"
              alt="Festive Moments"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/20 to-transparent flex flex-col justify-end p-5 text-ivory">
              <span className="eyebrow text-[0.6rem] text-gold mb-1">Campaign</span>
              <h4 className="font-serif text-xl">Festive Moments Edit</h4>
              <p className="text-[0.7rem] text-ivory/80 mt-1">
                Handcrafted raw silks & embellished organza.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export function CollectionsMegaMenu({
  collections,
  onClose,
}: {
  collections: Collection[];
  onClose: () => void;
}) {
  return (
    <div className="absolute top-full left-0 w-full bg-card/95 backdrop-blur-md border-b border-border shadow-2xl py-10 px-8 transition-all duration-300 animate-in fade-in-0 slide-in-from-top-2">
      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-8">
        {/* Collections List */}
        <div className="col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-6 border-r border-border/60 pr-8">
          {collections.map((col) => (
            <Link
              key={col.id}
              to="/collections/$slug"
              params={{ slug: col.slug }}
              onClick={onClose}
              className="group space-y-2 block"
            >
              <div className="aspect-[4/5] overflow-hidden bg-muted relative">
                <img
                  src={col.thumbnail || col.banner || "/images/look-1.jpg"}
                  alt={col.name}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {col.featured && (
                  <span className="eyebrow absolute top-2 left-2 bg-background/90 text-foreground px-1.5 py-0.5 text-[0.55rem]">
                    Featured
                  </span>
                )}
              </div>
              <div>
                <h4 className="text-xs font-medium text-foreground group-hover:text-gold transition-colors">
                  {col.name}
                </h4>
                <p className="text-[0.65rem] text-muted-foreground line-clamp-1">
                  {col.description || "Explore collection"}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Featured Story */}
        <div className="col-span-4 pl-4 flex flex-col justify-between">
          <Link
            to="/lookbook"
            onClick={onClose}
            className="group relative block aspect-[16/10] overflow-hidden bg-muted"
          >
            <img
              src="/images/hero-1.jpg"
              alt="The Lookbook"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/20 to-transparent flex flex-col justify-end p-5 text-ivory">
              <span className="eyebrow text-[0.6rem] text-gold mb-1">Editorial</span>
              <h4 className="font-serif text-xl">The Editorial Lookbook</h4>
              <p className="text-[0.7rem] text-ivory/80 mt-1">
                Explore curated styling stories & shop the looks.
              </p>
            </div>
          </Link>
          <div className="pt-4 flex justify-between items-center text-xs">
            <Link
              to="/collections"
              onClick={onClose}
              className="text-foreground underline underline-offset-4 hover:text-gold transition-colors font-medium"
            >
              View All Collections →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
