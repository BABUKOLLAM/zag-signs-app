# ZAG SIGNS — Enterprise ERP

A complete business management system for signage companies.  
Covers the full workflow — from first lead to final payment — across multiple branches.

---

## Table of Contents

1. [What This App Does](#1-what-this-app-does)
2. [Modules at a Glance](#2-modules-at-a-glance)
3. [Run on Your Own Computer](#3-run-on-your-own-computer)
4. [White-Label for Your Client](#4-white-label-for-your-client)
5. [Deploy to the Internet (Free)](#5-deploy-to-the-internet-free)
6. [Share the Live Link with Your Client](#6-share-the-live-link-with-your-client)
7. [Connect a Custom Domain](#7-connect-a-custom-domain)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. What This App Does

This ERP (Enterprise Resource Planning) system lets a signage business manage its entire
operation from a single web app:

- **Sales team** tracks leads, creates quotations, converts them to sales orders
- **Production team** monitors work orders and job progress
- **Accounts team** raises invoices and tracks collections
- **Management** sees a real-time dashboard with revenue, pipeline, and branch performance

Works on any device with a web browser — desktop, laptop, or tablet.

---

## 2. Modules at a Glance

| Module | What it does |
|---|---|
| **Dashboard** | Live KPI cards — leads, revenue, collections, open complaints. Charts for monthly trend and branch performance |
| **Leads & CRM** | Track every sales enquiry. Add new leads, filter by branch/status, see pipeline value |
| **Customers** | Master list of all customers with GST, contact, outstanding balance |
| **Quotations** | Create and view itemised quotes. Click a quote to see the full line-item breakdown |
| **Sales Orders** | Confirmed orders with delivery dates, job cost, and gross margin |
| **Work Orders** | Step-by-step production workflow from order to installation |
| **Production** | Live status of active print/fabrication jobs |
| **Inventory** | Raw material stock levels with reorder alerts |
| **Accounts & Billing** | Invoice register with paid/pending/overdue status |
| **Collections** | Overdue receivables by customer with risk flag |
| **Complaints** | Log and track customer complaints with priority and resolution |
| **HR & Attendance** | Employee list with today's attendance and leave balance |
| **Reports & MIS** | YTD revenue vs target, branch share, lead conversion pie chart |

---

## 3. Run on Your Own Computer

Follow these steps exactly — you do not need to know coding.

### Step 1 — Install Node.js (one-time)

Node.js is the engine that runs this app.

1. Go to **https://nodejs.org**
2. Click the big green button that says **"LTS"** (Long Term Support)
3. Download and install it like any normal Mac/Windows application
4. To verify it installed: open **Terminal** (Mac) or **Command Prompt** (Windows) and type:
   ```
   node --version
   ```
   You should see something like `v20.x.x`. That means it worked.

### Step 2 — Download the code

Option A — if you have Git installed:
```bash
git clone https://github.com/BABUKOLLAM/zag-signs-app.git
cd zag-signs-app
```

Option B — download as a ZIP:
1. Go to **https://github.com/BABUKOLLAM/zag-signs-app**
2. Click the green **"Code"** button → **"Download ZIP"**
3. Unzip the file on your computer
4. Open Terminal and navigate into the folder:
   ```bash
   cd path/to/zag-signs-app
   ```

### Step 3 — Install dependencies

This downloads all the libraries the app needs. Run this once:

```bash
npm install
```

You will see a lot of text scroll by. Wait for it to finish. It ends with something like
`added 300 packages`.

### Step 4 — Start the app

```bash
npm run dev
```

You will see:
```
  ▲ Next.js
  - Local: http://localhost:3000
```

### Step 5 — Open in browser

Open your web browser and go to:

```
http://localhost:3000
```

You will be taken straight to the **Executive Dashboard**.

> To stop the app, go back to Terminal and press **Ctrl + C**.

### Step 6 — Navigate the app

Use the left sidebar to switch between modules.
All data shown is sample/demo data — it is safe to click anything.

---

## 4. White-Label for Your Client

White-labelling means replacing "ZAG SIGNS" with your client's company name,
colours, and branding. Here is exactly what to change:

### 4a — Change the company name and tagline

Open the file: `components/Sidebar.tsx`

Find these two lines (around line 37–38):
```
<p className="font-bold text-gray-900 text-sm leading-tight">ZAG SIGNS</p>
<p className="text-xs text-gray-500">Enterprise ERP</p>
```

Replace `ZAG SIGNS` with your client's company name, e.g. `ACME SIGNS`.  
Replace `Enterprise ERP` with any tagline you want, e.g. `Business Suite`.

### 4b — Change the browser tab title

Open the file: `app/layout.tsx`

Find:
```
title: "ZAG SIGNS — Enterprise ERP",
description: "ZAG SIGNS Enterprise ERP for managing leads, orders...",
```

Replace both lines with your client's details:
```
title: "ACME SIGNS — Business Suite",
description: "ACME SIGNS management system for leads, orders, billing and HR.",
```

### 4c — Change the primary colour

The app uses **blue** (`blue-600` in Tailwind CSS) throughout.
To change the colour, do a project-wide find-and-replace:

| Replace this | With this | Result |
|---|---|---|
| `blue-600` | `green-600` | Green theme |
| `blue-600` | `purple-600` | Purple theme |
| `blue-600` | `red-600` | Red theme |
| `blue-600` | `orange-600` | Orange theme |

Also replace `blue-100`, `blue-50`, `blue-500`, `blue-700` with the matching shade of
your chosen colour.

**How to do find-and-replace in VS Code:**
1. Press **Cmd+Shift+H** (Mac) or **Ctrl+Shift+H** (Windows)
2. Type `blue-600` in the first box
3. Type your new colour in the second box
4. Click **Replace All**
5. Repeat for `blue-100`, `blue-50`, `blue-500`, `blue-700`

### 4d — Change the module names in the sidebar

Open the file: `components/Sidebar.tsx`

Find the `navItems` array (around line 9). Each item has a `label` — just change the
text to whatever your client prefers:

```typescript
{ href: "/leads",  label: "Leads & CRM",       icon: Users },
// change to:
{ href: "/leads",  label: "Sales Pipeline",     icon: Users },
```

### 4e — Change sample data to real data

All data lives in one file: `lib/data.ts`

Open it and replace:
- `branches` — your client's branch/office names
- `leads`, `customers`, `quotations`, `salesOrders`, `complaints` — real records

The structure of each record is shown clearly in the file.

### 4f — Add your client's logo (optional)

1. Save the logo file as `public/logo.png` (PNG works best, ideally 80×80 px)
2. Open `components/Sidebar.tsx`
3. Replace the `Building2` icon block (lines 33–35) with:
   ```tsx
   <Image src="/logo.png" alt="Logo" width={32} height={32} className="rounded-lg" />
   ```
4. Add this import at the top of the file:
   ```typescript
   import Image from "next/image";
   ```

---

## 5. Deploy to the Internet (Free)

**Vercel** is the recommended platform — it was built by the same team who made Next.js.
Free tier is enough for most clients.

### Step 1 — Create a free Vercel account

Go to **https://vercel.com** → click **Sign Up** → choose **Continue with GitHub**.
This links Vercel to the GitHub account where your code lives.

### Step 2 — Import the project

1. After signing up, you land on the Vercel dashboard
2. Click **"Add New Project"**
3. Find `zag-signs-app` in the list and click **"Import"**
4. Leave all settings as they are — Vercel detects Next.js automatically
5. Click **"Deploy"**

Vercel will build and deploy the app. This takes about 60 seconds.

### Step 3 — Your app is live

When it finishes, Vercel gives you a URL like:

```
https://zag-signs-app.vercel.app
```

Share this URL with your client — they can open it on any device without installing anything.

### Step 4 — Automatic updates

Every time you push a code change to GitHub, Vercel automatically rebuilds and
re-deploys the app within about 60 seconds. No manual action needed.

---

## 6. Share the Live Link with Your Client

Once deployed, your client can:

- Open the app on any browser (Chrome, Safari, Edge, Firefox)
- Bookmark it on their desktop or phone home screen
- Use it on a tablet like a native app

**To add to iPhone home screen:**
1. Open the URL in Safari
2. Tap the Share button (square with arrow)
3. Scroll down → tap **"Add to Home Screen"**
4. It now opens like an app

**To add to Android home screen:**
1. Open the URL in Chrome
2. Tap the three-dot menu
3. Tap **"Add to Home Screen"**

---

## 7. Connect a Custom Domain

If your client wants their own domain (e.g. `erp.acmesigns.com`):

### Option A — Buy a new domain through Vercel

1. In Vercel project settings → **Domains** → **Buy Domain**
2. Search and purchase (starts at ~$10/year)
3. Vercel configures everything automatically

### Option B — Use an existing domain

1. Go to your domain registrar (GoDaddy, Namecheap, etc.)
2. Add a **CNAME record**: `erp` → `cname.vercel-dns.com`
3. In Vercel project settings → **Domains** → **Add** → enter `erp.acmesigns.com`
4. Vercel verifies the DNS and enables HTTPS automatically (free SSL certificate)

---

## 8. Troubleshooting

### "command not found: npm"
Node.js is not installed. Go back to Step 1 in Section 3.

### "ENOENT: no such file or directory"
You are in the wrong folder in Terminal.  
Type `ls` and press Enter. You should see files like `package.json`, `app/`, etc.  
If not, navigate to the correct folder with `cd path/to/zag-signs-app`.

### "Port 3000 is already in use"
Another app is using port 3000. Run on a different port:
```bash
npm run dev -- -p 3001
```
Then open `http://localhost:3001` in your browser.

### App shows an error page
1. Look at the Terminal where you ran `npm run dev` — the error message is there
2. The most common cause is a missing `npm install` — run it again

### Changes are not showing after editing a file
The app hot-reloads automatically. Wait 2–3 seconds and refresh the browser.
If it still does not update, stop the app (Ctrl+C) and run `npm run dev` again.

### Vercel deployment failed
1. Go to your Vercel project → **Deployments** tab
2. Click the failed deployment to see the error log
3. The most common cause is a TypeScript error — run `npx tsc --noEmit` locally first

---

## Tech Stack

| Technology | Purpose |
|---|---|
| **Next.js 16** (App Router) | Web framework — handles routing and rendering |
| **React 19** | UI component library |
| **TypeScript** | Adds type safety to JavaScript |
| **Tailwind CSS** | Utility-first styling — controls all colours and layout |
| **Recharts** | Dashboard charts (bar, line, pie) |
| **Lucide React** | Icon library |

## Project Structure

```
app/                    Page routes — one folder per module
  dashboard/page.tsx    Executive dashboard with charts
  leads/page.tsx        Leads & CRM
  customers/page.tsx    Customer master
  quotations/page.tsx   Quotation management
  sales-orders/page.tsx Sales order tracking
  work-orders/page.tsx  Work order workflow
  production/page.tsx   Production job board
  inventory/page.tsx    Stock level monitor
  accounts/page.tsx     Invoice and billing register
  collections/page.tsx  Outstanding receivables
  complaints/page.tsx   Customer complaint tracker
  hr/page.tsx           HR and attendance
  reports/page.tsx      MIS reports and charts
  layout.tsx            App shell — metadata and fonts
  page.tsx              Root redirect to /dashboard

components/
  Sidebar.tsx           Left navigation panel
  TopBar.tsx            Top header with search and date

lib/
  data.ts               All sample data and TypeScript types
  utils.ts              Shared helpers (currency format, safe average)

public/                 Static files (images, icons)
```

---

*Built with [Claude Code](https://claude.com/claude-code)*
