import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  mergeSettings,
  mergeAnnouncements,
  mergeCategories,
  mergeCollections,
  mergeProducts,
  mergeHeroSlides,
  getStoredProducts,
  getDeletedProductIds,
} from "./studio-persistence";

export const PRODUCT_FIELDS =
  "id,name,slug,sku,subtitle,short_description,description,price,sale_price,fabric,fit,season,care,sizes,colors,tags,images,image_alts,focal,stock_status,is_new,is_featured,is_trending,is_best_seller,on_sale,seo_title,seo_description,created_at,category_id,collection_id,collection:collections(name,slug),category:categories(name,slug)";

export type Product = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  subtitle: string | null;
  short_description: string | null;
  description: string | null;
  price: number;
  sale_price: number | null;
  fabric: string | null;
  fit: string | null;
  season: string | null;
  care: string | null;
  sizes: string[];
  colors: string[];
  tags: string[];
  images: string[];
  image_alts: string[];
  focal: string;
  stock_status: "in_stock" | "low_stock" | "sold_out" | "coming_soon" | "pre_order";
  is_new: boolean;
  is_featured: boolean;
  is_trending: boolean;
  is_best_seller: boolean;
  on_sale: boolean;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  category_id: string | null;
  collection_id: string | null;
  collection: { name: string; slug: string } | null;
  category: { name: string; slug: string } | null;
};

export type Collection = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  banner: string | null;
  thumbnail: string | null;
  featured: boolean;
  seo_title: string | null;
  seo_description: string | null;
};
export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parent_id: string | null;
  sort_order: number;
};

export const formatPKR = (n: number) => "PKR " + n.toLocaleString("en-PK");

export const STOCK_LABEL: Record<Product["stock_status"], string> = {
  in_stock: "In Stock",
  low_stock: "Low Stock",
  sold_out: "Sold Out",
  coming_soon: "Coming Soon",
  pre_order: "Pre-Order",
};

async function fetchLayout() {
  const [ann, cats, cols, settings] = await Promise.all([
    supabase.from("announcements").select("*").order("priority", { ascending: false }),
    supabase.from("categories").select("*").order("sort_order"),
    supabase.from("collections").select("*").order("sort_order"),
    supabase.from("site_settings").select("key,value"),
  ]);
  const s: Record<string, any> = {};
  (settings.data ?? []).forEach((r) => (s[r.key] = r.value));
  const mergedSettings = mergeSettings(s);

  return {
    announcements: mergeAnnouncements(ann.data ?? []),
    categories: mergeCategories((cats.data ?? []) as Category[]),
    collections: mergeCollections((cols.data ?? []) as Collection[]),
    settings: mergedSettings,
  };
}
export const layoutQuery = queryOptions({ queryKey: ["layout"], queryFn: fetchLayout, staleTime: 60_000 });

async function productsByIds(ids: string[]) {
  if (!ids.length) return [];
  const { data } = await supabase.from("products").select(PRODUCT_FIELDS).in("id", ids);
  const allProds = mergeProducts((data as unknown as Product[] ?? []));
  const map = new Map(allProds.map((p) => [p.id, p]));
  return ids.map((id) => map.get(id)).filter(Boolean) as Product[];
}

export async function productsBySource(source: string, limit = 10): Promise<Product[]> {
  if (["trending", "best_sellers", "top_week", "most_loved"].includes(source)) {
    const { data } = await supabase.rpc("ranked_products", { _metric: source, _limit: limit });
    const ranked = await productsByIds((data ?? []).map((r: any) => r.product_id));
    if (ranked.length >= 4) return ranked;
    // graceful fallback when there is not enough data yet
    const { data: fb } = await supabase.from("products").select(PRODUCT_FIELDS).eq("is_featured", true).limit(limit);
    const mergedFb = mergeProducts((fb as unknown as Product[]) ?? []);
    return [...ranked, ...mergedFb.filter((p) => !ranked.find((r) => r.id === p.id))].slice(0, limit);
  }
  let q = supabase.from("products").select(PRODUCT_FIELDS).order("created_at", { ascending: false }).limit(limit);
  if (source === "new") q = q.eq("is_new", true);
  if (source === "sale") q = q.eq("on_sale", true);
  if (source === "featured") q = q.eq("is_featured", true);
  const { data } = await q;
  return mergeProducts((data as unknown as Product[]) ?? []);
}

async function fetchHome() {
  const [sections, hero] = await Promise.all([
    supabase.from("homepage_sections").select("*").eq("enabled", true).order("sort_order"),
    supabase.from("hero_slides").select("*").order("sort_order"),
  ]);
  const secs = sections.data ?? [];
  const productSections = await Promise.all(
    secs.map(async (s: any) =>
      s.type === "product_carousel" ? productsBySource(s.config?.source ?? "new", s.config?.limit ?? 10) : null,
    ),
  );
  const topCols: Record<string, Collection[]> = {};
  for (const period of ["week", "month"]) {
    const { data } = await supabase.rpc("ranked_collections", { _period: period, _limit: 2 });
    const ids = (data ?? []).map((r: any) => r.collection_id);
    if (ids.length) {
      const { data: cs } = await supabase.from("collections").select("*").in("id", ids);
      const mergedCols = mergeCollections((cs ?? []) as Collection[]);
      topCols[period] = ids.map((id: string) => mergedCols.find((c: any) => c.id === id)).filter(Boolean) as Collection[];
    } else topCols[period] = [];
  }
  const { data: lookbooks } = await supabase
    .from("lookbooks")
    .select("*, items:lookbook_items(*)")
    .order("sort_order");
  return {
    sections: secs.map((s: any, i: number) => ({ ...s, products: productSections[i] })),
    hero: mergeHeroSlides(hero.data ?? []),
    topCollections: topCols,
    lookbooks: lookbooks ?? [],
  };
}
export const homeQuery = queryOptions({ queryKey: ["home"], queryFn: fetchHome, staleTime: 30_000 });

export type ListFilters = {
  category?: string | undefined;
  collection?: string | undefined;
  sizes?: string[] | undefined;
  colors?: string[] | undefined;
  fabrics?: string[] | undefined;
  season?: string | undefined;
  availability?: string | undefined;
  min?: number | undefined;
  max?: number | undefined;
  sort?: string | undefined;
  page?: number | undefined;
  newOnly?: boolean | undefined;
  sale?: boolean | undefined;
  q?: string | undefined;
};
export const PAGE_SIZE = 12;

export async function listProducts(f: ListFilters, ids: { categoryIds?: string[] | undefined; collectionId?: string | undefined } = {}) {
  let q = supabase.from("products").select(PRODUCT_FIELDS, { count: "exact" });
  if (ids.categoryIds) q = q.in("category_id", ids.categoryIds);
  if (ids.collectionId) q = q.eq("collection_id", ids.collectionId);
  if (f.newOnly) q = q.eq("is_new", true);
  if (f.sale) q = q.eq("on_sale", true);
  if (f.sizes?.length) q = q.overlaps("sizes", f.sizes);
  if (f.colors?.length) q = q.overlaps("colors", f.colors);
  if (f.fabrics?.length) q = q.in("fabric", f.fabrics);
  if (f.season) q = q.eq("season", f.season);
  if (f.availability) q = q.eq("stock_status", f.availability);
  if (f.min) q = q.gte("price", f.min);
  if (f.max) q = q.lte("price", f.max);
  if (f.q) {
    const term = f.q.replace(/[%,()]/g, " ").trim();
    q = q.or(`name.ilike.%${term}%,sku.ilike.%${term}%,fabric.ilike.%${term}%,tags.cs.{${term.toLowerCase()}}`);
  }
  switch (f.sort) {
    case "price_asc":
      q = q.order("price", { ascending: true });
      break;
    case "price_desc":
      q = q.order("price", { ascending: false });
      break;
    case "newest":
      q = q.order("created_at", { ascending: false });
      break;
    default:
      q = q.order("is_featured", { ascending: false }).order("created_at", { ascending: false });
  }
  const page = Math.max(1, f.page ?? 1);
  q = q.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  const { data, count, error } = await q;
  if (error) throw new Error("Could not load products");
  let products = mergeProducts((data as unknown as Product[]) ?? []);
  if (f.sort === "best_sellers" || f.sort === "trending") {
    const { data: r } = await supabase.rpc("ranked_products", { _metric: f.sort, _limit: 100 });
    const rank = new Map((r ?? []).map((x: any, i: number) => [x.product_id, i]));
    products = [...products].sort((a, b) => (rank.get(a.id) ?? 999) - (rank.get(b.id) ?? 999));
  }
  return { products, count: count ?? 0 };
}

export async function getProduct(slug: string) {
  // Check local override first by slug
  const localList = getStoredProducts();
  const localMatch = localList.find((p) => p.slug === slug);

  const { data } = await supabase.from("products").select(PRODUCT_FIELDS).eq("slug", slug).maybeSingle();
  const baseProduct = (data as unknown as Product) || null;
  const p = localMatch ? { ...baseProduct, ...localMatch } : baseProduct;
  if (!p) return null;

  const [{ data: sameCol }, { data: sameCat }] = await Promise.all([
    supabase.from("products").select(PRODUCT_FIELDS).eq("collection_id", p.collection_id ?? "").neq("id", p.id).limit(8),
    supabase.from("products").select(PRODUCT_FIELDS).eq("category_id", p.category_id ?? "").neq("id", p.id).limit(8),
  ]);
  const mergedCol = mergeProducts((sameCol as unknown as Product[]) ?? []);
  const mergedCat = mergeProducts((sameCat as unknown as Product[]) ?? []);
  const complete = mergedCol.filter((x) => x.category_id !== p.category_id).slice(0, 4);
  const like = mergedCat.slice(0, 8);
  return { product: p, completeTheLook: complete, youMayLike: like.length ? like : mergedCol };
}
export const productQuery = (slug: string) =>
  queryOptions({ queryKey: ["product", slug], queryFn: () => getProduct(slug) });
