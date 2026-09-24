# FABRICO Roadmap

- [x] **Database Schema & Data Pipeline**:
  - [x] Complete Supabase schema migrations for products, categories, collections, hero slides, campaigns, lookbooks, lookbook items, site settings, announcements, inquiries/orders, order items, and analytics events.
  - [x] 24 luxury Pakistani fashion seed products across 4 collections and 4 categories with high-res editorial imagery, fabrics, dimensions, and realistic prices.
  - [x] Merchandising ranking algorithms in SQL and TypeScript (`ranked_products`, `ranked_collections`).

- [x] **Storefront Architecture & Components**:
  - [x] Editorial luxury typography and bespoke dark/light-luxury theme (Playfair Display, Cormorant Garamond, Inter).
  - [x] Dynamic Announcement Bar with rotating notices and customizable admin CMS control.
  - [x] Sticky Header Navigation with luxury hover Mega Menus for Shop & Collections, live badge counts, and slide-out Mobile Drawer.
  - [x] Slide-over Shopping Bag Drawer with quantity adjustment, free-shipping threshold calculator, and unified WhatsApp multi-item checkout.
  - [x] Interactive Quick View modal with size/color pickers, stock indicators, and instant WhatsApp inquiry.
  - [x] Instant Search Dialog modal with trending keyword pills and live query results.
  - [x] Interactive Size Guide modal with inches/cm toggle and direct WhatsApp stylist consultation link.
  - [x] Persistent Floating WhatsApp Concierge widget.
  - [x] 4-column luxury Footer with newsletter subscription, trust commitments, and legal links.

- [x] **Storefront Routes & Customer Journeys**:
  - [x] `/` Homepage: dynamic hero slider, trust assurance strip, featured categories, data-driven curated rails (Trending, Best Sellers, Most Inquired, High-Converting), occasion edits, lookbook spotlight, and WhatsApp banner.
  - [x] `/shop` & `/new-in`: catalog browsing with category, collection, fabric, size, price range filters, and sort options.
  - [x] `/collections` & `/collections/$slug`: editorial collection index & detailed collection lookbook views.
  - [x] `/category/$slug`: category pages with subcategory filtering.
  - [x] `/product/$slug`: comprehensive product detail page with image gallery, variant selection, size chart modal trigger, accordion specifications, "Complete The Look", and dynamic recommendations.
  - [x] `/search`: dedicated search page with query parameter binding and filter capabilities.
  - [x] `/wishlist`: persistent client-side wishlist with one-click "Add All to Bag" and WhatsApp order dispatch.
  - [x] `/lookbook`: interactive editorial photoshoot lookbook with clickable product hotspot pins.
  - [x] `/campaign/$slug`: high-fashion campaign showcase with live countdown timer and curated capsule pieces.
  - [x] Client Services: `/about`, `/contact`, `/size-guide`, `/shipping`, `/returns`, `/faqs`, `/privacy`, `/terms`.

- [x] **Admin CMS & Commerce Intelligence Dashboard**:
  - [x] `/admin/login`: secure admin gate with developer workspace bypass.
  - [x] `/admin`: operations cockpit with live revenue KPIs, pending inquiries counter, orders pipeline, and instant order status updater.
  - [x] `/admin/products`, `/admin/products/new`, `/admin/products/$id`: full inventory manager (create, edit, delete, stock status, fabric, tags, images).
  - [x] `/admin/collections`: collection manager with hero banner upload and active toggles.
  - [x] `/admin/categories`: category hierarchy and slug management.
  - [x] `/admin/orders`: WhatsApp inquiry tracking, conversion to confirmed order, customer notes, and item breakdown.
  - [x] `/admin/customers`: Customer CRM with VIP directory, lifetime value, inquiry history slideout, and WhatsApp concierge.
  - [x] `/admin/analytics`: merchandising telemetry cockpit with algorithm score breakdown and store event counters.
  - [x] `/admin/analytics/products`: per-product performance analytics (views, wishlist, bag, inquiries, conversion rate).
  - [x] `/admin/analytics/collections`: per-collection performance analytics with algorithm ranking scores.
  - [x] `/admin/analytics/traffic`: traffic & engagement analytics with conversion funnel, top pages, and 7-day daily breakdown.
  - [x] `/admin/hero`: interactive hero carousel manager with slide ordering, CTAs, and images.
  - [x] `/admin/campaigns`: seasonal campaign manager with start/end countdowns and featured capsules.
  - [x] `/admin/lookbook`: lookbook manager with hotspot pin configuration.
  - [x] `/admin/promotions`: rotating announcement banner manager.
  - [x] `/admin/media`: media asset library aggregating images from products, hero slides, lookbooks, campaigns with lightbox and URL copy.
  - [x] `/admin/navigation`: navigation menu architecture CMS with header mega menu tree editor and footer link preview.
  - [x] `/admin/pages`: content pages & policies CMS for About, Shipping, Returns, Size Guide, Contact, FAQs, Privacy.
  - [x] `/admin/seo`: SEO & social graph management with live Google SERP preview, WhatsApp card preview, and sitemap XML generator.
  - [x] `/admin/settings`: studio WhatsApp number, support label, SEO metadata, and trust commitments.

- [ ] **Future & Optional Enhancements**:
  - [ ] Cloudflare R2 / Supabase Storage direct file binary dropzone integration in admin forms.
  - [ ] Automated WhatsApp Webhook integration for inbound message order status reconciliation.

