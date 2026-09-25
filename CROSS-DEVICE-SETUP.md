# Cross-device publishing setup

VETRA 4.2 publishes storefront content to Supabase through protected Vercel functions. Orders and analytics events are deliberately excluded from the public content response.

## 1. Create or open a Supabase project

Open **SQL Editor**, paste the full contents of `supabase/content.sql`, and run it. This creates:

- `site_content` — one shared JSON storefront record
- `marketplace-media` — a public bucket for storefront pictures and short videos

This migration is additive; it does not modify existing tables.

## 2. Configure Vercel environment variables

In **Vercel → Project → Settings → Environment Variables**, add these to Production:

- `SUPABASE_URL` — project URL from Supabase API settings
- `SUPABASE_SERVICE_ROLE_KEY` — service-role key from Supabase API settings; never put it in website code
- `SUPABASE_STORAGE_BUCKET` — `marketplace-media`
- `CONTENT_ADMIN_KEY` — create a long private password, for example a 32+ character random value

Redeploy after adding the variables.

## 3. Publish the current admin content

1. Open `/0` and sign in.
2. Select **Connect publishing** in the yellow cross-device panel.
3. Enter exactly the same `CONTENT_ADMIN_KEY` configured in Vercel.
4. Select **Publish now**.
5. Wait for the green **Published** badge.

After connection, every Save automatically publishes safe storefront content and uploaded media. Other devices load the shared content at startup and refresh it every 10 seconds while open.

## Limits and security

- Images are compressed in the browser before upload.
- Cross-device product videos are limited to 2 MB in the UI and 3 MB at the server.
- Orders, customer details, and raw analytics events are not returned by the public content endpoint.
- Keep `SUPABASE_SERVICE_ROLE_KEY` and `CONTENT_ADMIN_KEY` private.
