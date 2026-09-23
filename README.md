# VETRA marketplace

A dependency-free, Vercel-ready multi-store fashion marketplace.

## Deploy
1. Extract this folder and push it to GitHub.
2. Import the repository in Vercel.
3. Choose framework preset **Other** and deploy.
4. Add `admin.your-domain.com` to the same Vercel project if desired.

## Admin
- Route: `/0`
- Demo username: `Admin`
- Demo password: `2009`

Change the demo authentication before accepting real orders. The included version stores catalog edits, themes, cart, and order drafts in browser storage. For a real production launch, replace the demo login and browser storage with a server-side database/auth provider such as Supabase, Neon, or Vercel Postgres.

## Before launch
- Replace all sample WhatsApp numbers, addresses, emails, and policies.
- Test each store's WhatsApp order flow.
- Add a privacy policy, delivery policy, and return policy.
- Set your custom domain in Vercel.

## Included
Store directory and pages, product color galleries, size/SKU/stock variants, slide-out cart, grouped multi-store cart, checkout review, structured WhatsApp messages, order confirmation, responsive admin panel, content controls, store/product editing, and nine color themes.

## Version 2 admin updates

- **Catalog hierarchy:** Store → products in that store → product information → color pictures + size/SKU/stock/price variants.
- **Media:** replace, upload, or delete the homepage hero, marketplace logo, store covers/logos, and every product image.
- **Homepage:** edit the announcement, hero headline, introduction, and hero picture.
- **Website identity:** edit the marketplace name, logo URL/upload, logo alternative text, currency, WhatsApp number, and delivery fee.
- **Languages:** visitors and admins can switch between English, French, and Arabic; Arabic activates an RTL layout.
- **Mobile admin:** the navigation scrolls within its own bar, cards stack, action buttons wrap, image grids collapse, and variant tables scroll inside their container rather than overflowing the page.

Uploaded images are saved in browser storage in this demo build. Connect a production database/object-storage service before accepting real marketplace content from multiple devices.

## Important deployment fix — v2.1

This archive is deliberately **flat**: `index.html`, `vercel.json`, and `assets/` are directly at the ZIP root. The language/admin enhancements are inlined into `index.html`, so Vercel cannot omit a separate enhancement script or stylesheet. Read `DEPLOY-NOW.txt` and redeploy without the old build cache.

## VETRA v3.0

This release implements the complete admin/content prompt:

- media manager for hero, logo, store, category and product images
- product create/edit/delete controls inside Media and the nested Catalog
- homepage hero, featured-product and reorderable layout-block editor
- website name, logo preview, browser title and SEO description settings
- persisted EN/FR/AR switcher with structured files in `i18n/` and Arabic RTL
- responsive admin layouts for phones and tablets
- drillable Store → Products → Product Detail → Information/Pictures/Variants workflow
- timestamped raw `view` and `lead` analytics, store/product aggregation, sorting and CSV export
- optional shared Supabase analytics through `api/analytics.js`

Review `MIGRATION-NOTES.md` before enabling cloud analytics. The SQL migration is additive and non-breaking.

## VETRA v4.0 admin order

The admin navigation is now exactly:
Dashboard → Orders → Markets → Products → Homepage → Analytics → Themes → Settings → Sign out.

- Dashboard counts all markets, active markets, 7-day unique visitors and 7-day orders.
- Orders sort by date, market or product and can reopen the order as a WhatsApp message.
- Markets support add/delete/hide plus editable logo, cover, name, contact, email, Instagram, Facebook and website.
- Products are organized under their market, with add/delete/hide, description, regular/promo price, variants and up to 10 images/videos.
- Homepage combines website name/logo, hero media/text and section media/text controls.
- Image controls accept uploads from PC or mobile and optimize images before browser storage.
- Short video uploads are supported up to 3 MB in this browser edition. Use cloud object storage for larger production videos.

## VETRA v4.1 instant-save fix

- Admin changes render immediately after Save.
- Full content and uploaded media are persisted in IndexedDB instead of depending on the much smaller localStorage limit.
- A visible Saving… / Saved / Not saved indicator confirms each operation.
- BroadcastChannel plus a storage-event fallback refresh other open storefront tabs automatically.
- Existing localStorage content is migrated automatically on first load.
- Product videos can now be up to 15 MB in this browser-persistence edition.

This improves same-browser reliability. Shared edits across different devices still require a connected production database and object storage.
