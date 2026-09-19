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
