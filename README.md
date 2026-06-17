# ZAG SIGNS — Enterprise ERP

**Live URL → https://bprozagcrm.xyz**

A complete business management system for signage companies.
Covers the full workflow — from first lead to final payment — across multiple branches.

---

## Table of Contents

1. [What This App Does](#1-what-this-app-does)
2. [Modules at a Glance](#2-modules-at-a-glance)
3. [Run on Your Own Computer](#3-run-on-your-own-computer)
4. [Deploy to the Internet — Vercel (Free)](#4-deploy-to-the-internet--vercel-free)
5. [Connect Your Domain bprozagcrm.xyz](#5-connect-your-domain-bprozagcrmxyz)
6. [White-Label for Your Client](#6-white-label-for-your-client)
7. [Share with Your Client](#7-share-with-your-client)
8. [Troubleshooting](#8-troubleshooting)
9. [Tech Stack & Project Structure](#9-tech-stack--project-structure)

---

## 1. What This App Does

This ERP (Enterprise Resource Planning) system lets a signage business manage its entire
operation from a single web app — accessible from any browser, any device, anywhere.

- **Sales team** tracks leads, creates quotations, converts them to sales orders
- **Production team** monitors work orders and fabrication progress
- **Accounts team** raises invoices and tracks collections
- **Management** gets a real-time dashboard — revenue, pipeline, branch performance

---

## 2. Modules at a Glance

| Module | Route | What it does |
|---|---|---|
| **Dashboard** | `/dashboard` | KPI cards, revenue trend, branch performance charts |
| **Leads & CRM** | `/leads` | Track enquiries, add leads, filter by branch/status |
| **Customers** | `/customers` | Master customer list with GST, contact, outstanding |
| **Quotations** | `/quotations` | Itemised quotes — view full line-item breakdown |
| **Sales Orders** | `/sales-orders` | Confirmed orders with delivery date and gross margin |
| **Work Orders** | `/work-orders` | Step-by-step production workflow |
| **Production** | `/production` | Live status of active print/fabrication jobs |
| **Inventory** | `/inventory` | Raw material stock with reorder alerts |
| **Accounts & Billing** | `/accounts` | Invoice register — paid, pending, overdue |
| **Collections** | `/collections` | Overdue receivables with risk flag |
| **Complaints** | `/complaints` | Customer complaints with priority and resolution |
| **HR & Attendance** | `/hr` | Employee list, today's attendance, leave balance |
| **Reports & MIS** | `/reports` | YTD revenue vs target, branch share, conversion charts |

---

## 3. Run on Your Own Computer

### Step 1 — Install Node.js (one-time only)

1. Go to **https://nodejs.org**
2. Click the green **LTS** button and install it like any normal app
3. Verify by opening Terminal and typing:
   ```
   node --version
   ```
   You should see `v20.x.x` or higher.

### Step 2 — Get the code

```bash
git clone https://github.com/BABUKOLLAM/zag-signs-app.git
cd zag-signs-app
```

Or download as ZIP from **https://github.com/BABUKOLLAM/zag-signs-app** → Code → Download ZIP.

### Step 3 — Install libraries

```bash
npm install
```

Wait for it to finish (about 30 seconds).

### Step 4 — Start the app

```bash
npm run dev
```

### Step 5 — Open in browser

Go to **http://localhost:3000** — you'll land on the Dashboard.

> Press **Ctrl + C** in Terminal to stop the app.

---

## 4. Deploy to the Internet — Vercel (Free)

Vercel is the hosting platform built for Next.js apps. Free tier is enough.

### Step 1 — Create a Vercel account

1. Go to **https://vercel.com**
2. Click **Sign Up**
3. Choose **Continue with GitHub**
4. Authorise Vercel to access your GitHub account

### Step 2 — Import your project

1. On the Vercel dashboard, click **Add New Project**
2. You will see a list of your GitHub repos
3. Find **zag-signs-app** and click **Import**
4. Leave all settings as default — Vercel detects Next.js automatically
5. Click **Deploy**

Vercel builds the app (about 60 seconds). When it finishes, you get a temporary URL:

```
https://zag-signs-app-xxxx.vercel.app
```

The app is now live on the internet. Next, point your domain to it.

---

## 5. Connect Your Domain bprozagcrm.xyz

### Step A — Add the domain in Vercel

1. In Vercel, open your **zag-signs-app** project
2. Click **Settings** (top menu)
3. Click **Domains** (left menu)
4. In the input box, type: `bprozagcrm.xyz`
5. Click **Add**
6. Also add `www.bprozagcrm.xyz` and click **Add**

Vercel will show you the DNS records you need to add. They will look like this:

| Type | Name | Value |
|---|---|---|
| `A` | `@` | `76.76.21.21` |
| `CNAME` | `www` | `cname.vercel-dns.com` |

Keep this page open — you will copy these values in the next step.

### Step B — Log in to your domain registrar

Your domain `bprozagcrm.xyz` is registered somewhere — GoDaddy, Namecheap, Porkbun,
Google Domains, Cloudflare, or another provider. Log in to whichever one you used when
you bought `bprozagcrm.xyz`.

**Not sure which registrar?** Go to **https://lookup.icann.org**, type `bprozagcrm.xyz`,
and it will show you where the domain is registered.

### Step C — Add DNS records

In your domain registrar's control panel, find the **DNS** or **DNS Management** section.
Add these two records (copy the exact values Vercel showed you):

**Record 1 — makes `bprozagcrm.xyz` work:**
```
Type:  A
Name:  @
Value: 76.76.21.21
TTL:   Automatic (or 3600)
```

**Record 2 — makes `www.bprozagcrm.xyz` work:**
```
Type:  CNAME
Name:  www
Value: cname.vercel-dns.com
TTL:   Automatic (or 3600)
```

Save both records.

### Step D — Wait for DNS to propagate

DNS changes take **5 to 30 minutes** to take effect globally (sometimes up to 24 hours,
but usually much faster).

To check: go back to Vercel → Settings → Domains. When the domain shows a **green tick ✓**,
it is live.

### Step E — HTTPS is automatic

Vercel automatically issues a free SSL certificate (the padlock in the browser).
You do not need to do anything. Within a few minutes of the domain going green, your
app will be accessible at:

```
https://bprozagcrm.xyz
https://www.bprozagcrm.xyz
```

Both addresses will work and redirect to the same app.

---

## 6. White-Label for Your Client

Four files control the entire brand identity:

### 6a — Company name and tagline

**File:** `components/Sidebar.tsx` (lines 37–38)

```tsx
// Change these two lines:
<p className="font-bold text-gray-900 text-sm leading-tight">ZAG SIGNS</p>
<p className="text-xs text-gray-500">Enterprise ERP</p>
```

### 6b — Browser tab title and SEO

**File:** `app/layout.tsx` (lines 15–27)

```typescript
title: "ZAG SIGNS — Enterprise ERP",         // ← change this
description: "ZAG SIGNS Enterprise ERP...",   // ← and this
url: "https://bprozagcrm.xyz",                // ← keep as is (your domain)
```

### 6c — Colour theme

The app uses **blue** throughout. To switch to another colour, do a project-wide
find-and-replace in your code editor:

| Replace | With | Result |
|---|---|---|
| `blue-600` | `emerald-600` | Green |
| `blue-600` | `violet-600` | Purple |
| `blue-600` | `rose-600` | Red |
| `blue-600` | `amber-600` | Amber |

Also replace the lighter shades: `blue-50` → `emerald-50`, `blue-100` → `emerald-100`,
`blue-500` → `emerald-500`, `blue-700` → `emerald-700`.

**In VS Code:** Press `Cmd+Shift+H` → find `blue-600` → replace with your colour → Replace All.

### 6d — Real data

**File:** `lib/data.ts`

Replace the sample records at the bottom of the file with your client's real leads,
customers, quotations, and orders. The structure of each record is clearly shown in
the file as a TypeScript interface.

### 6e — Logo (optional)

1. Save your client's logo as `public/logo.png` (PNG, ~80×80 px)
2. In `components/Sidebar.tsx`, replace the `Building2` icon block with:
   ```tsx
   <Image src="/logo.png" alt="Logo" width={32} height={32} className="rounded-lg" />
   ```
3. Add `import Image from "next/image";` at the top of that file

---

## 7. Share with Your Client

Once `https://bprozagcrm.xyz` is live:

### On a computer
Share the URL. It opens in any browser — Chrome, Safari, Edge, Firefox.

### On an iPhone (add to home screen like an app)
1. Open `https://bprozagcrm.xyz` in **Safari**
2. Tap the **Share** button (box with upward arrow)
3. Scroll down → tap **Add to Home Screen**
4. Tap **Add**
5. The app now appears on the home screen and opens like a native app

### On an Android phone
1. Open `https://bprozagcrm.xyz` in **Chrome**
2. Tap the three-dot menu (top right)
3. Tap **Add to Home Screen** → **Add**

### Auto-updates
Every time you push a code change to GitHub, Vercel rebuilds and re-deploys in about
60 seconds — your client always sees the latest version without doing anything.

---

## 8. Troubleshooting

### The domain shows "Invalid Configuration" in Vercel
The DNS records have not propagated yet. Wait 15–30 minutes and check again.
You can verify at **https://dnschecker.org** — search for `bprozagcrm.xyz` and check
if the A record shows `76.76.21.21`.

### "command not found: npm"
Node.js is not installed. Follow Step 1 in Section 3.

### "Port 3000 is already in use" (when running locally)
```bash
npm run dev -- -p 3001
```
Then open `http://localhost:3001`.

### Vercel deployment failed
1. Go to your Vercel project → **Deployments** tab
2. Click the failed deployment → read the error log
3. Run `npx tsc --noEmit` locally to catch TypeScript errors before pushing

### App shows error page after deploying
Check that all environment variables (if any) are set in Vercel:
Project Settings → Environment Variables.

---

## 9. Tech Stack & Project Structure

### Tech Stack

| Technology | Purpose |
|---|---|
| **Next.js 16** (App Router) | Web framework — routing and server rendering |
| **React 19** | UI components |
| **TypeScript** | Type-safe JavaScript |
| **Tailwind CSS 4** | Utility-first styling |
| **Recharts** | Dashboard charts |
| **Lucide React** | Icon library |
| **Vercel** | Hosting and deployment |

### Project Structure

```
app/
  dashboard/page.tsx      Executive dashboard with charts
  leads/page.tsx          Leads & CRM with Add Lead form
  customers/page.tsx      Customer master with Add Customer form
  quotations/page.tsx     Quotation list with line-item view
  sales-orders/page.tsx   Sales orders with margin tracking
  work-orders/page.tsx    Work order workflow stages
  production/page.tsx     Active production jobs board
  inventory/page.tsx      Stock level monitor with alerts
  accounts/page.tsx       Invoice register
  collections/page.tsx    Overdue receivables tracker
  complaints/page.tsx     Complaint management
  hr/page.tsx             HR and attendance
  reports/page.tsx        MIS reports and charts
  layout.tsx              App shell — metadata, fonts, security headers
  page.tsx                Root route → redirects to /dashboard

components/
  Sidebar.tsx             Left navigation — change brand name here
  TopBar.tsx              Top header with search and date

lib/
  data.ts                 All mock data and TypeScript type definitions
  utils.ts                Shared helpers: fmt, fmtShort, fmtL, safeAvg

public/                   Static files (add logo.png here)
next.config.ts            Security headers and Next.js settings
```

---

**Live:** https://bprozagcrm.xyz  
**Repository:** https://github.com/BABUKOLLAM/zag-signs-app  
*Built with [Claude Code](https://claude.com/claude-code)*
