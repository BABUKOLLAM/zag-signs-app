# ZAG SIGNS — Enterprise ERP

A Next.js web application that manages the full operations lifecycle of ZAG SIGNS: from lead capture and quotations through production, inventory, billing, and HR.

## Modules

| Module | Route |
|---|---|
| Dashboard | `/dashboard` |
| Leads & CRM | `/leads` |
| Customers | `/customers` |
| Quotations | `/quotations` |
| Sales Orders | `/sales-orders` |
| Work Orders | `/work-orders` |
| Production | `/production` |
| Inventory | `/inventory` |
| Accounts & Billing | `/accounts` |
| Collections | `/collections` |
| Complaints | `/complaints` |
| HR & Attendance | `/hr` |
| Reports & MIS | `/reports` |

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Language:** TypeScript

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
app/            # Page routes (one folder per module)
components/     # Shared UI — Sidebar, TopBar
lib/            # Utility helpers
public/         # Static assets
```
