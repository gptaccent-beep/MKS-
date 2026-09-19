# VETRA v3 migration notes

## Confirmed current stack

- Frontend: dependency-free vanilla JavaScript single-page application
- Hosting/runtime: static Vercel deployment plus optional Vercel Functions
- Preview persistence: browser `localStorage`
- Production database: not configured by default

## Database impact

The analytics feature adds one optional Supabase table: `analytics_events`.

This is a **non-breaking additive migration**: it creates a new table and three indexes and does not alter existing data. Run `supabase/analytics.sql` only after reviewing it in your Supabase project.

Without Supabase variables, analytics still works as a per-browser preview using timestamped raw events in `localStorage`. For shared production totals across all visitors, configure the three variables in `.env.example`, run the SQL migration, and redeploy.

## Event model

Every event keeps:
- event ID
- timestamp
- event type (`view` or `lead`)
- product ID
- store ID
- anonymous session ID
- page path

The backend additionally records a truncated user-agent and referrer. It does not intentionally store customer names, phone numbers, or delivery addresses.
