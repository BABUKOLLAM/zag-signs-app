import React from "react";

/**
 * Print-friendly UI illustrations for the user manual ("screenshots").
 * These are vector/HTML mockups that resemble the live ZAG SIGNS screens so the
 * PDF can show each action. They render reliably in print (no external images).
 * Real captures from the live app can be dropped in later to replace them.
 */

const INK = "#1F2937";
const MUTED = "#9CA3AF";
const BORDER = "#E5E7EB";
const BG = "#F8FAFC";
const INDIGO = "#4F46E5";

const NAV = ["Dashboard", "Leads", "Quotations", "Invoices", "Work Orders", "HR"];

// ── Window chrome with mini sidebar ──────────────────────────────────────────
export function AppWindow({
  title, url, active, children,
}: { title: string; url: string; active: string; children: React.ReactNode }) {
  return (
    <div className="avoid-break" style={{ border: `1px solid ${BORDER}`, borderRadius: "10px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", background: "#fff", margin: "4px 0" }}>
      {/* Title bar */}
      <div style={{ background: INK, padding: "6px 10px", display: "flex", alignItems: "center", gap: "5px" }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#F87171", display: "inline-block" }} />
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#FBBF24", display: "inline-block" }} />
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#34D399", display: "inline-block" }} />
        <div style={{ marginLeft: "8px", flex: 1, background: "#374151", borderRadius: "5px", padding: "2px 8px", fontSize: "7pt", color: "#9CA3AF" }}>
          🔒 {url}
        </div>
      </div>
      {/* Body */}
      <div style={{ display: "flex", minHeight: "120px" }}>
        {/* Mini sidebar */}
        <div style={{ width: "78px", background: "linear-gradient(180deg,#0F1629,#111827)", padding: "8px 6px", flexShrink: 0 }}>
          <div style={{ color: "#fff", fontWeight: 800, fontSize: "8pt", marginBottom: "8px", letterSpacing: "0.5px" }}>ZAG</div>
          {NAV.map((n) => {
            const on = n === active;
            return (
              <div key={n} style={{ fontSize: "6.5pt", color: on ? "#fff" : "#94A3B8", background: on ? INDIGO : "transparent", borderRadius: "4px", padding: "3px 5px", marginBottom: "2px", fontWeight: on ? 700 : 400 }}>
                {n}
              </div>
            );
          })}
        </div>
        {/* Content */}
        <div style={{ flex: 1, padding: "10px", background: BG }}>
          <div style={{ fontSize: "9.5pt", fontWeight: 800, color: INK, marginBottom: "8px" }}>{title}</div>
          {children}
        </div>
      </div>
    </div>
  );
}

export function Toolbar({ buttons }: { buttons: { label: string; primary?: boolean }[] }) {
  return (
    <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end", marginBottom: "8px", flexWrap: "wrap" }}>
      {buttons.map((b) => (
        <span key={b.label} style={{
          fontSize: "7pt", fontWeight: 600, padding: "3px 9px", borderRadius: "6px",
          color: b.primary ? "#fff" : "#475569",
          background: b.primary ? INDIGO : "#fff",
          border: b.primary ? "none" : `1px solid ${BORDER}`,
        }}>{b.label}</span>
      ))}
    </div>
  );
}

type Cell = string | { pill: string; color: PillColor };
export function MTable({ cols, rows }: { cols: string[]; rows: Cell[][] }) {
  return (
    <div style={{ border: `1px solid ${BORDER}`, borderRadius: "8px", overflow: "hidden", background: "#fff" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "7pt" }}>
        <thead>
          <tr style={{ background: "#F1F5F9" }}>
            {cols.map((c) => <th key={c} style={{ textAlign: "left", padding: "5px 7px", color: "#64748B", fontWeight: 700, whiteSpace: "nowrap" }}>{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={{ borderTop: `1px solid ${BORDER}` }}>
              {r.map((cell, j) => (
                <td key={j} style={{ padding: "5px 7px", color: "#334155", whiteSpace: "nowrap" }}>
                  {typeof cell === "string" ? cell : <Pill color={cell.color}>{cell.pill}</Pill>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type PillColor = "green" | "amber" | "blue" | "red" | "indigo" | "gray";
const PILL: Record<PillColor, { bg: string; fg: string }> = {
  green:  { bg: "#DCFCE7", fg: "#15803D" },
  amber:  { bg: "#FEF3C7", fg: "#B45309" },
  blue:   { bg: "#DBEAFE", fg: "#1D4ED8" },
  red:    { bg: "#FEE2E2", fg: "#DC2626" },
  indigo: { bg: "#E0E7FF", fg: "#4338CA" },
  gray:   { bg: "#F1F5F9", fg: "#475569" },
};
export function Pill({ children, color }: { children: React.ReactNode; color: PillColor }) {
  const c = PILL[color];
  return <span style={{ fontSize: "6.5pt", fontWeight: 700, padding: "1px 6px", borderRadius: "999px", background: c.bg, color: c.fg, whiteSpace: "nowrap" }}>{children}</span>;
}

export function MForm({ fields }: { fields: { label: string; value: string; req?: boolean }[] }) {
  return (
    <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: "8px", padding: "10px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
      {fields.map((f) => (
        <div key={f.label}>
          <div style={{ fontSize: "6.5pt", color: "#64748B", fontWeight: 600, marginBottom: "2px" }}>
            {f.label}{f.req && <span style={{ color: "#EF4444" }}> *</span>}
          </div>
          <div style={{ fontSize: "7.5pt", color: f.value ? "#1F2937" : MUTED, border: `1px solid ${BORDER}`, borderRadius: "5px", padding: "4px 7px", background: BG }}>
            {f.value || "—"}
          </div>
        </div>
      ))}
    </div>
  );
}

export function Caption({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: "8pt", color: MUTED, fontStyle: "italic", margin: "4px 0 0", textAlign: "center" }}>{children}</p>;
}

// ── SCREEN MOCKUPS keyed by manual section number ─────────────────────────────
export const SCREENS: Record<string, { caption: string; node: React.ReactNode }> = {
  // 2 — Login & Dashboard
  "2": {
    caption: "The Dashboard — your home screen after signing in.",
    node: (
      <AppWindow title="Dashboard" url="bprozagcrm.xyz/dashboard" active="Dashboard">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "6px", marginBottom: "8px" }}>
          {[["Revenue", "₹42.8L", "#16A34A"], ["Open Leads", "126", "#F0563F"], ["Work Orders", "38", "#C2298A"], ["Collections", "₹6.1L", "#4F46E5"]].map(([k, v, c]) => (
            <div key={k} style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: "7px", padding: "7px" }}>
              <div style={{ fontSize: "6.5pt", color: "#64748B" }}>{k}</div>
              <div style={{ fontSize: "10pt", fontWeight: 800, color: INK, marginTop: "2px" }}>{v}</div>
              <div style={{ height: "3px", borderRadius: "2px", background: c as string, marginTop: "4px", opacity: 0.8 }} />
            </div>
          ))}
        </div>
        <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: "7px", padding: "8px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "5px", height: "44px" }}>
            {[45, 62, 50, 78, 60, 90, 70].map((h, i) => (
              <div key={i} style={{ flex: 1, height: `${h}%`, borderRadius: "3px 3px 0 0", background: "linear-gradient(180deg,#C2298A,#4F46E5)" }} />
            ))}
          </div>
          <div style={{ fontSize: "6.5pt", color: MUTED, marginTop: "4px" }}>Monthly sales · all branches</div>
        </div>
      </AppWindow>
    ),
  },

  // 4 — Leads & CRM
  "4": {
    caption: "Leads list with the New Lead, Import and Excel actions, and per-row convert buttons.",
    node: (
      <AppWindow title="Leads & CRM" url="bprozagcrm.xyz/leads" active="Leads">
        <Toolbar buttons={[{ label: "Import" }, { label: "Excel" }, { label: "+ New Lead", primary: true }]} />
        <MTable
          cols={["Lead No", "Name", "Phone", "Status", "Actions"]}
          rows={[
            ["L007", "Anil Menon", "98470 12345", { pill: "QUALIFIED", color: "blue" }, "Opp · Customer · Quote"],
            ["L006", "Priya Nair", "94952 33110", { pill: "NEW", color: "gray" }, "Opp · Customer · Quote"],
            ["L005", "Hotel Leela", "90487 55621", { pill: "WON", color: "green" }, "Quote"],
          ]}
        />
      </AppWindow>
    ),
  },

  // 7 — Quotations
  "7": {
    caption: "The quotation builder — line items with unit, rate and GST, then Create Quotation.",
    node: (
      <AppWindow title="New Quotation" url="bprozagcrm.xyz/quotations" active="Quotations">
        <MForm fields={[
          { label: "Customer", value: "M/s Hotel Leela", req: true },
          { label: "Kind Attn", value: "Mr. Rajesh (Manager)" },
        ]} />
        <div style={{ height: "6px" }} />
        <MTable
          cols={["Description", "Qty", "Unit", "Rate", "Amount"]}
          rows={[
            ["Acrylic LED Sign Board", "1", "Nos", "85,000", "85,000"],
            ["Vinyl Branding — Glass", "240", "Sqft", "85", "20,400"],
          ]}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "6px", fontSize: "7pt", color: "#334155" }}>
          <span>GST 18%: <b>₹18,972</b></span>
          <span>Total: <b style={{ color: INDIGO }}>₹1,24,372</b></span>
          <Pill color="indigo">Create Quotation</Pill>
        </div>
      </AppWindow>
    ),
  },

  // 8 — Invoices & Tally
  "8": {
    caption: "Invoice list — Tally XML export and the green 'Tally synced' badge after export.",
    node: (
      <AppWindow title="Invoices" url="bprozagcrm.xyz/invoices" active="Invoices">
        <Toolbar buttons={[{ label: "Excel" }]} />
        <MTable
          cols={["Invoice No", "Customer", "Amount", "Status", "Tally", "Actions"]}
          rows={[
            ["ZAG/INV/HO/012", "Hotel Leela", "₹1,24,372", { pill: "PAID", color: "green" }, { pill: "Synced", color: "green" }, "Print · Tally XML"],
            ["ZAG/INV/HO/011", "City Mall", "₹68,500", { pill: "PARTIAL", color: "amber" }, { pill: "—", color: "gray" }, "Print · Tally XML"],
          ]}
        />
        <div style={{ marginTop: "6px", fontSize: "6.8pt", color: "#475569", background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: "6px", padding: "6px 8px" }}>
          Tally import: Gateway of Tally → Import Data → Vouchers → select the downloaded .xml → Enter.
        </div>
      </AppWindow>
    ),
  },

  // 9 — Work Order Tickets
  "9": {
    caption: "Front-office work-order ticket and the designer's queue board.",
    node: (
      <AppWindow title="New Work Order Ticket" url="bprozagcrm.xyz/work-order-tickets" active="Work Orders">
        <MForm fields={[
          { label: "Customer", value: "Walk-in — City Cafe", req: true },
          { label: "Source", value: "WhatsApp", req: true },
          { label: "Nature of Work", value: "Glow sign 6x4", req: true },
          { label: "Est. Cost", value: "₹18,500" },
          { label: "Assign Designer", value: "Sneha P." },
          { label: "ETA", value: "24 Jun 2026" },
        ]} />
        <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
          {[["Assigned", "blue"], ["In Progress", "amber"], ["Half-Done", "red"], ["Done", "green"]].map(([s, c]) => (
            <div key={s} style={{ flex: 1, background: "#fff", border: `1px solid ${BORDER}`, borderRadius: "6px", padding: "5px" }}>
              <div style={{ marginBottom: "3px" }}><Pill color={c as PillColor}>{s}</Pill></div>
              <div style={{ fontSize: "6.2pt", color: "#475569", border: `1px solid ${BORDER}`, borderRadius: "4px", padding: "3px" }}>ZAG/WO/HO/03{s === "Done" ? "1" : "4"}</div>
            </div>
          ))}
        </div>
      </AppWindow>
    ),
  },

  // 13/16 — Batch Import modal (number assigned where used)
  "BATCH": {
    caption: "Batch import — download template, upload, preview with validation, then import.",
    node: (
      <div className="avoid-break" style={{ border: `1px solid ${BORDER}`, borderRadius: "10px", background: "#fff", padding: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", margin: "4px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <span style={{ fontSize: "9pt", fontWeight: 800, color: INK }}>Import Customers</span>
          <span style={{ fontSize: "8pt", color: MUTED }}>✕</span>
        </div>
        <div style={{ display: "flex", gap: "6px", marginBottom: "8px" }}>
          <Pill color="indigo">⬇ Download Template (.xlsx)</Pill>
        </div>
        <div style={{ border: `2px dashed ${BORDER}`, borderRadius: "8px", padding: "12px", textAlign: "center", fontSize: "7pt", color: "#64748B", marginBottom: "8px" }}>
          Drag a file here, or click to choose · .xlsx / .csv
        </div>
        <div style={{ display: "flex", gap: "6px", marginBottom: "6px" }}>
          <Pill color="green">86 ready</Pill><Pill color="amber">2 need fixing</Pill>
        </div>
        <MTable
          cols={["#", "Name", "Phone", "Branch"]}
          rows={[
            ["2", "Rajesh Kumar", "98765 43210", "TVM"],
            ["3", "Kumar Traders", "—", { pill: "missing", color: "red" }],
          ]}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "6px" }}>
          <Pill color="indigo">⬆ Import 86 records</Pill>
        </div>
      </div>
    ),
  },

  // 14 (Finance) — Collections
  "COLLECTION": {
    caption: "Record Payment against an invoice — mode, reference and amount.",
    node: (
      <AppWindow title="Record Payment" url="bprozagcrm.xyz/collections" active="Invoices">
        <MForm fields={[
          { label: "Customer", value: "Hotel Leela", req: true },
          { label: "Against Invoice", value: "ZAG/INV/HO/012" },
          { label: "Amount", value: "₹62,000", req: true },
          { label: "Mode", value: "NEFT", req: true },
          { label: "Reference / UTR", value: "SBIN0921championreferrer" },
          { label: "Date", value: "20 Jun 2026" },
        ]} />
      </AppWindow>
    ),
  },

  // 15 (HR)
  "HR": {
    caption: "Employees list with Import / Excel, and one-tap attendance marking.",
    node: (
      <AppWindow title="HR & Attendance" url="bprozagcrm.xyz/hr" active="HR">
        <Toolbar buttons={[{ label: "Import" }, { label: "Excel" }, { label: "+ Add Employee", primary: true }]} />
        <MTable
          cols={["Emp No", "Name", "Department", "Branch", "Status"]}
          rows={[
            ["EMP-014", "Sneha Pillai", "Design", "KTYM", { pill: "Active", color: "green" }],
            ["EMP-013", "Rahul Das", "Production", "EKM", { pill: "Active", color: "green" }],
          ]}
        />
      </AppWindow>
    ),
  },
};
