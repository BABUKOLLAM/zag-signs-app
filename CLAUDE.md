# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

ZAG SIGNS is a multi-branch ERP for a signage business (leads → quotations → sales
orders → production → invoicing → collections, plus HR, fleet, procurement, and
~40 other modules). Next.js 16 App Router + React 19 + TypeScript, Prisma/PostgreSQL
(Neon) for persistence, NextAuth (credentials + JWT) for auth. Deployed on Vercel at
`bprozagcrm.xyz`, auto-deploying on push to `main`.

`README.md` documents a simpler, mock-data version of this app aimed at non-technical
users doing a white-label deploy (rebranding, DNS setup, etc.) — useful for that
purpose, but out of date on architecture: the app now runs on Prisma/Postgres with
real auth and RBAC, not the `lib/data.ts` mock data it describes.

## Commands

```bash
npm run dev          # start dev server (localhost:3000)
npm run build         # prisma generate && next build
npm run lint          # eslint
npx tsc --noEmit      # typecheck (no test suite exists — this + lint are the CI gate)

npm run db:push       # push schema.prisma changes to the DB (no migration file)
npm run db:seed       # run prisma/seed.ts
npm run db:studio     # Prisma Studio
npm run db:reset       # DESTRUCTIVE: force-resets DB then reseeds — requires CONFIRM_RESET=yes
```

There is no automated test suite (no `*.test.*` files, no test script). Verify changes
with `npx tsc --noEmit`, `npm run lint`, and manual testing in the browser.

Root-level `AUDIT_RESULTS.md`, `GO_LIVE_CHECKLIST.md`, `DEPLOYMENT_REPORT.md`,
`BRANCH_BANK_TESTING.md`, `LIVE_STATUS.txt` are point-in-time status reports from past
work sessions, not living documentation — don't treat them as current specs.

## Architecture

### Route + API pairing

Every module follows the same two-sided pattern:
- `app/<module>/page.tsx` — `"use client"` page, fetches via `useApi()`/`api.*` (below)
- `app/api/<module>/route.ts` (+ `[id]/route.ts`, `bulk/route.ts` where needed) —
  Prisma-backed REST-ish handlers

A single API route sometimes backs more than one page (e.g. `/api/sales-orders` also
serves `/installation`) — see `requireAnyPathAccess` below.

API route convention (see `app/api/leads/route.ts` for the canonical example):
- A local `shape()` function serializes the Prisma row into API JSON, adding
  human-readable `xLabel` fields via `toLabel()` (`lib/api-helpers.ts`) for enum values
- `toDate()` formats dates to `YYYY-MM-DD`; `autoNo(prefix, count)` generates
  sequential doc numbers (`L006`, etc.)
- `ok(data, status)` / `err(message, status)` wrap `NextResponse.json`
- Every handler starts with a session/role guard (see below) before touching Prisma

### Auth and access control (three layers, all must be kept in sync)

1. **`proxy.ts`** (Next.js 16's replacement for `middleware.ts`, Edge runtime) — coarse
   gate: redirects to `/login` if no NextAuth session cookie is present. Does not
   validate the JWT or check role/permissions — just "is anyone logged in". Its
   `matcher` config is the source of truth for which paths are public
   (login/signup/password-reset, `/portal`, WhatsApp webhook, static assets).
2. **`RouteGuard.tsx`** (client, wraps pages via `AppShell`) — for guarded paths
   (`isGuardedPath()` in `lib/permissions.ts`), checks `usePermissions().canUse(pathname)`
   and shows an "Access restricted" screen if the role/override doesn't allow it.
3. **`lib/api-helpers.ts`** (server, per API route) — `requireSession()` (any logged-in
   user), `requireRole(allowed[])` (explicit role allowlist), or
   `requirePathAccess(path)` / `requireAnyPathAccess(paths[])` (mirrors the RouteGuard
   check server-side, so an API route's data-access rule matches what the UI already
   shows). API-level checks are defense in depth — always add one even though the UI
   already gates navigation.

RBAC data lives in `lib/permissions.ts`:
- `ROLE_PATHS`: role → allowed path prefixes. `FULL_ACCESS` roles (`AVP`, `IT Admin`,
  `Consultant`) get everything. `BASE_PATHS` are allowed for every authenticated role.
- Per-user overrides are stored in the `UserPermission` DB table (`modules: string[]`)
  and take priority over role defaults — checked via `canAccessModules()`. The
  `/admin/privileges` page edits these.
- `MODULE_INTRODUCED`: records when each module path was added, so the privileges UI
  can warn an admin when a saved per-user override predates a newer module (a custom
  override is a hard whitelist and never auto-picks-up new modules).
- Adding a new module page requires updating `ALL_MODULE_PATHS`, `ROLE_PATHS` for
  relevant roles, and usually `MODULE_GROUPS` (drives the `/admin/privileges` UI).

`lib/auth.ts`: NextAuth credentials provider, authenticates against the `User` table
(bcrypt), JWT session (8h maxAge), maps DB `UserRole` enum values to display labels
(e.g. `BUSINESS_MANAGER` → `"Business Manager"`) used everywhere else as the `Role` type.

### Data layer

`prisma/schema.prisma` (~70 models) on Postgres (Neon), via `lib/prisma.ts`'s
singleton client (prevents connection exhaustion from dev hot-reload). No migration
files are used day-to-day — `npm run db:push` syncs schema directly; the
`prisma/migrations/` folder has only a few historical entries.

`Branch` is deliberately a plain `String`, not an enum — branch names/count are
per-deployment (this is white-labeled per client), so a new branch never needs a
schema migration. Don't add a `Branch` enum.

### Frontend data fetching

`lib/api-client.ts` (`api.get/post/put/delete`) + `lib/use-api.ts`'s `useApi<T>(path, params)`
hook — returns `{ data, loading, error, refetch }`, used by nearly every page instead of
raw `fetch`.

`app/layout.tsx` nests `ThemeProvider` → `SidebarProvider` → `ToastProvider` → `AppShell`
(which renders `Sidebar`/`TopBar`/`MobileBottomNav` + `RouteGuard`). Dark mode is set
pre-hydration via an inline `<Script>` reading `localStorage['zag-theme']` to avoid a
flash of the wrong theme.

### White-labeling

The app is deployed per-client with different branding. Build-time brand name is
`NEXT_PUBLIC_COMPANY_NAME` (used in `app/layout.tsx` metadata, since metadata can't hit
the DB at build time); runtime UI reads the live name from the `CompanySettings` DB
table instead (via `lib/company.ts`) so it can be changed without a redeploy. See
`README.md` §6 for the full white-label checklist (Sidebar branding, logo, color
find-and-replace on `blue-*` Tailwind classes, `lib/data.ts` sample records).

### Integrations

- **Email** — `lib/email.ts` / `lib/email-service.ts` (nodemailer), `EMAIL_HOST/PORT/USER/PASS/FROM`
- **WhatsApp** — `lib/whatsapp.ts` / `lib/whatsapp-service.ts`, supports both Meta
  WhatsApp Business API (`WHATSAPP_TOKEN`/`WHATSAPP_PHONE_ID`/`WHATSAPP_API_VERSION`/
  `WHATSAPP_WEBHOOK_TOKEN`) and Twilio (`TWILIO_ACCOUNT_SID`/`TWILIO_AUTH_TOKEN`/
  `TWILIO_WHATSAPP_FROM`); webhook at `app/api/whatsapp/webhook` is public (see `proxy.ts`)
- **Google Drive** — `lib/google-drive.ts`, `DriveButton.tsx`, `GOOGLE_CLIENT_ID` /
  `GOOGLE_DRIVE_FOLDER_ID` (and `NEXT_PUBLIC_` client-side equivalents)
- **PDF/export** — `@react-pdf/renderer`, `jspdf`, `html2canvas`, `html2pdf.js`, and
  `xlsx` (SheetJS, installed from its own CDN tarball, not npm, in `package.json`).
  Print templates: `InvoicePrintTemplate.tsx`, `QuotationPrintTemplate.tsx`,
  `WorkOrderSlipTemplate.tsx`. The `scripts/*.js` one-off scripts generate the static
  user manual PDF (`app/help/manual/`) — not part of the app's runtime build.

### Security headers

`next.config.ts` sets HSTS, `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options`,
and a restrictive `Permissions-Policy` (geolocation kept enabled, for field visits)
on every response.

## Note on AGENTS.md

`AGENTS.md` in this repo (previously `@`-imported by `CLAUDE.md`) claims this is a
non-standard Next.js requiring docs to be read from `node_modules/next/dist/docs/`.
That path does not exist in the installed `next` package (nor in any real Next.js
release), so this instruction was not carried into this file. The actual Next.js
version is `16.2.9` (see `package.json`); its one genuinely non-default convention
observed in this repo is `proxy.ts` replacing `middleware.ts` (documented above), not
anything requiring undocumented APIs.
