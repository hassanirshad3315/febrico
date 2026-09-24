/**
 * FABRICO Studio Persistence & RLS Fallback Layer
 * Allows full local studio operation even when remote Supabase RLS restricts anon writes.
 */

const STORAGE_KEYS = {
  settings: "fabrico_settings_overrides",
  products: "fabrico_products_overrides",
  deletedProducts: "fabrico_deleted_products",
  collections: "fabrico_collections_overrides",
  deletedCollections: "fabrico_deleted_collections",
  categories: "fabrico_categories_overrides",
  deletedCategories: "fabrico_deleted_categories",
  orders: "fabrico_orders_overrides",
  hero: "fabrico_hero_overrides",
  deletedHero: "fabrico_deleted_hero",
  announcements: "fabrico_announcements_overrides",
  deletedAnnouncements: "fabrico_deleted_announcements",
  campaigns: "fabrico_campaigns_overrides",
  lookbooks: "fabrico_lookbooks_overrides",
  pages: "fabrico_pages_overrides",
  navigation: "fabrico_navigation_overrides",
  seo: "fabrico_seo_overrides",
};

function getLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to save ${key} to localStorage:`, e);
  }
}

// ================= SETTINGS =================
export function getStoredSettings(): Record<string, any> {
  return getLocal<Record<string, any>>(STORAGE_KEYS.settings, {});
}

export function saveStoredSetting(key: string, value: any): void {
  const current = getStoredSettings();
  current[key] = value;
  setLocal(STORAGE_KEYS.settings, current);
}

export function mergeSettings(remoteSettings: Record<string, any>): Record<string, any> {
  const local = getStoredSettings();
  return { ...remoteSettings, ...local };
}

// ================= PRODUCTS =================
export function getStoredProducts(): any[] {
  return getLocal<any[]>(STORAGE_KEYS.products, []);
}

export function getDeletedProductIds(): string[] {
  return getLocal<string[]>(STORAGE_KEYS.deletedProducts, []);
}

export function saveStoredProduct(product: any): void {
  const current = getStoredProducts();
  const deleted = getDeletedProductIds().filter((id) => id !== product.id);
  setLocal(STORAGE_KEYS.deletedProducts, deleted);

  const idx = current.findIndex((p) => p.id === product.id);
  if (idx >= 0) {
    current[idx] = { ...current[idx], ...product, updated_at: new Date().toISOString() };
  } else {
    current.unshift({ ...product, created_at: product.created_at || new Date().toISOString() });
  }
  setLocal(STORAGE_KEYS.products, current);
}

export function deleteStoredProduct(id: string): void {
  const current = getStoredProducts().filter((p) => p.id !== id);
  setLocal(STORAGE_KEYS.products, current);
  const deleted = getDeletedProductIds();
  if (!deleted.includes(id)) {
    deleted.push(id);
    setLocal(STORAGE_KEYS.deletedProducts, deleted);
  }
}

export function mergeProducts(remoteProducts: any[]): any[] {
  const local = getStoredProducts();
  const deleted = getDeletedProductIds();

  // Filter out deleted
  const filteredRemote = remoteProducts.filter((p) => !deleted.includes(p.id));

  // Merge updated & newly created
  const map = new Map<string, any>();
  for (const p of filteredRemote) {
    map.set(p.id, p);
  }
  for (const p of local) {
    map.set(p.id, { ...map.get(p.id), ...p });
  }

  return Array.from(map.values());
}

// ================= COLLECTIONS =================
export function getStoredCollections(): any[] {
  return getLocal<any[]>(STORAGE_KEYS.collections, []);
}

export function saveStoredCollection(collection: any): void {
  const current = getStoredCollections();
  const idx = current.findIndex((c) => c.id === collection.id);
  if (idx >= 0) {
    current[idx] = { ...current[idx], ...collection };
  } else {
    current.unshift(collection);
  }
  setLocal(STORAGE_KEYS.collections, current);
}

export function mergeCollections(remoteCollections: any[]): any[] {
  const local = getStoredCollections();
  const map = new Map<string, any>();
  for (const c of remoteCollections) map.set(c.id, c);
  for (const c of local) map.set(c.id, { ...map.get(c.id), ...c });
  return Array.from(map.values());
}

// ================= CATEGORIES =================
export function getStoredCategories(): any[] {
  return getLocal<any[]>(STORAGE_KEYS.categories, []);
}

export function saveStoredCategory(category: any): void {
  const current = getStoredCategories();
  const idx = current.findIndex((c) => c.id === category.id);
  if (idx >= 0) {
    current[idx] = { ...current[idx], ...category };
  } else {
    current.unshift(category);
  }
  setLocal(STORAGE_KEYS.categories, current);
}

export function mergeCategories(remoteCategories: any[]): any[] {
  const local = getStoredCategories();
  const map = new Map<string, any>();
  for (const c of remoteCategories) map.set(c.id, c);
  for (const c of local) map.set(c.id, { ...map.get(c.id), ...c });
  return Array.from(map.values());
}

// ================= ORDERS / INQUIRIES =================
export function getStoredOrders(): any[] {
  return getLocal<any[]>(STORAGE_KEYS.orders, []);
}

export function saveStoredOrder(order: any): void {
  const current = getStoredOrders();
  const idx = current.findIndex((o) => o.id === order.id);
  if (idx >= 0) {
    current[idx] = { ...current[idx], ...order, updated_at: new Date().toISOString() };
  } else {
    current.unshift(order);
  }
  setLocal(STORAGE_KEYS.orders, current);
}

export function mergeOrders(remoteOrders: any[]): any[] {
  const local = getStoredOrders();
  const map = new Map<string, any>();
  for (const o of remoteOrders) map.set(o.id, o);
  for (const o of local) map.set(o.id, { ...map.get(o.id), ...o });
  return Array.from(map.values());
}

// ================= HERO SLIDES =================
export function getStoredHeroSlides(): any[] {
  return getLocal<any[]>(STORAGE_KEYS.hero, []);
}

export function saveStoredHeroSlide(slide: any): void {
  const current = getStoredHeroSlides();
  const idx = current.findIndex((s) => s.id === slide.id);
  if (idx >= 0) {
    current[idx] = { ...current[idx], ...slide };
  } else {
    current.unshift(slide);
  }
  setLocal(STORAGE_KEYS.hero, current);
}

export function deleteStoredHeroSlide(id: string): void {
  const current = getStoredHeroSlides().filter((s) => s.id !== id);
  setLocal(STORAGE_KEYS.hero, current);
}

export function mergeHeroSlides(remoteSlides: any[]): any[] {
  const local = getStoredHeroSlides();
  const map = new Map<string, any>();
  for (const s of remoteSlides) map.set(s.id, s);
  for (const s of local) map.set(s.id, { ...map.get(s.id), ...s });
  return Array.from(map.values());
}

// ================= ANNOUNCEMENTS =================
export function getStoredAnnouncements(): any[] {
  return getLocal<any[]>(STORAGE_KEYS.announcements, []);
}

export function saveStoredAnnouncement(ann: any): void {
  const current = getStoredAnnouncements();
  const idx = current.findIndex((a) => a.id === ann.id);
  if (idx >= 0) {
    current[idx] = { ...current[idx], ...ann };
  } else {
    current.unshift(ann);
  }
  setLocal(STORAGE_KEYS.announcements, current);
}

export function deleteStoredAnnouncement(id: string): void {
  const current = getStoredAnnouncements().filter((a) => a.id !== id);
  setLocal(STORAGE_KEYS.announcements, current);
}

export function mergeAnnouncements(remoteAnn: any[]): any[] {
  const local = getStoredAnnouncements();
  const map = new Map<string, any>();
  for (const a of remoteAnn) map.set(a.id, a);
  for (const a of local) map.set(a.id, { ...map.get(a.id), ...a });
  return Array.from(map.values());
}

// ================= SAFE WRITE HELPER =================
/**
 * Safely executes a Supabase database write. If Supabase returns an RLS error
 * (e.g. anonymous user in local/studio mode), gracefully executes fallbackAction
 * to save data in localStorage and continues without crashing.
 */
export async function safeDbMutation(
  dbAction: () => Promise<{ data?: any; error: any }>,
  fallbackAction: () => void
): Promise<{ success: boolean; isLocalFallback: boolean }> {
  try {
    const res = await dbAction();
    if (res.error) {
      console.warn("[Studio Persistence] Database write restricted by RLS. Saved to local storage:", res.error.message);
      fallbackAction();
      return { success: true, isLocalFallback: true };
    }
    // Also keep local copy updated
    fallbackAction();
    return { success: true, isLocalFallback: false };
  } catch (err: any) {
    console.warn("[Studio Persistence] Database write failed. Saved to local storage:", err.message);
    fallbackAction();
    return { success: true, isLocalFallback: true };
  }
}
