"use client";
import Link from "next/link";
import BrandLogo from "./BrandLogo";
import PoweredByBpro from "./PoweredByBpro";
import {
  Users, FileText, Receipt, Wrench, Package, BarChart3,
  ArrowRight, ShieldCheck, Smartphone, Zap, CheckCircle2,
} from "lucide-react";

const FEATURES = [
  { icon: Users,     title: "CRM & Leads",            desc: "Capture leads from calls, walk-ins and campaigns, then track them through a visual pipeline to won deals." },
  { icon: FileText,  title: "Quotations",             desc: "GST-ready quotations with revisions, branch-wise numbering and one-click professional PDF output." },
  { icon: Receipt,   title: "Invoicing + Tally",      desc: "Convert quotes to tax invoices and export Tally-ready XML — no double entry in your accounts." },
  { icon: Wrench,    title: "Work Orders & Production",desc: "Front-office tickets flow to designers and the shop floor with live status, costing and turnaround." },
  { icon: Package,   title: "Inventory",              desc: "Stock catalogue, opening balances and movement tracking with automatic low-stock alerts." },
  { icon: BarChart3, title: "Reports & MIS",          desc: "Daily, weekly and monthly reports, GST summaries and KPI dashboards across every branch." },
];

const WORKFLOW = ["Lead", "Quotation", "Work Order", "Production", "Invoice", "Tally"];

const HIGHLIGHTS = [
  { icon: ShieldCheck, label: "Role-based access for 9 teams" },
  { icon: Smartphone,  label: "Installable on any phone (PWA)" },
  { icon: Zap,         label: "Branch-wise, real-time data" },
];

export default function Landing() {
  return (
    <div className="min-h-screen w-full relative overflow-x-hidden"
      style={{ background: "linear-gradient(160deg,#0B1120 0%,#171436 45%,#0F1629 100%)" }}>

      {/* Ambient brand glows */}
      <div className="pointer-events-none absolute -top-40 -right-40 w-[28rem] h-[28rem] rounded-full blur-3xl"
        style={{ background: "rgba(236,72,153,0.18)" }} />
      <div className="pointer-events-none absolute top-1/3 -left-40 w-[26rem] h-[26rem] rounded-full blur-3xl"
        style={{ background: "rgba(99,102,241,0.18)" }} />
      <div className="pointer-events-none absolute bottom-0 right-1/4 w-[22rem] h-[22rem] rounded-full blur-3xl"
        style={{ background: "rgba(240,86,63,0.12)" }} />

      {/* ── NAV ── */}
      <header className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 py-5 flex items-center justify-between">
        <BrandLogo height={34} pill />
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/signup"
            className="hidden sm:inline-flex text-sm font-medium text-slate-300 hover:text-white px-4 py-2 rounded-xl transition-colors">
            Request Access
          </Link>
          <Link href="/login"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-white px-4 py-2 rounded-xl shadow-lg transition-transform hover:scale-[1.03]"
            style={{ background: "linear-gradient(135deg,#6366F1,#EC4899)" }}>
            Sign In <ArrowRight size={15} />
          </Link>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 pt-10 sm:pt-16 pb-14 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-pink-200 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#EC4899" }} />
            Enterprise ERP for the signage business
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-extrabold text-white leading-[1.08] tracking-tight">
            Run all of ZAG SIGNS<br />
            <span className="text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(120deg,#F0563F,#EC4899,#8B5CF6)" }}>
              from one platform
            </span>
          </h1>
          <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
            From the first enquiry to the final tax invoice — leads, quotations, work orders,
            production, inventory, billing, HR and reports, connected across every branch.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/login"
              className="inline-flex items-center gap-2 text-sm font-semibold text-white px-6 py-3 rounded-2xl shadow-xl transition-transform hover:scale-[1.03]"
              style={{ background: "linear-gradient(135deg,#6366F1,#EC4899)" }}>
              Open the ERP <ArrowRight size={16} />
            </Link>
            <Link href="/signup"
              className="inline-flex items-center gap-2 text-sm font-semibold text-white px-6 py-3 rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10 transition-colors">
              Request Access
            </Link>
          </div>

          <div className="mt-8 flex flex-col gap-2.5">
            {HIGHLIGHTS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2.5 text-sm text-slate-300">
                <Icon size={16} className="text-pink-300 flex-shrink-0" />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Stylised dashboard preview */}
        <div className="relative">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-5 shadow-2xl">
            <div className="flex items-center gap-1.5 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
              <span className="ml-3 text-xs text-slate-400">ZAG SIGNS · Dashboard</span>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-3">
              {[
                { k: "Revenue", v: "₹42.8L", c: "#34D399" },
                { k: "Open Leads", v: "126", c: "#F0563F" },
                { k: "Work Orders", v: "38", c: "#EC4899" },
              ].map((s) => (
                <div key={s.k} className="rounded-2xl bg-white/5 border border-white/10 p-3">
                  <p className="text-[10px] text-slate-400">{s.k}</p>
                  <p className="text-lg font-bold text-white mt-0.5">{s.v}</p>
                  <div className="mt-2 h-1 rounded-full" style={{ background: s.c, opacity: 0.8 }} />
                </div>
              ))}
            </div>
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
              <div className="flex items-end gap-2 h-24">
                {[40, 65, 50, 80, 60, 92, 70].map((h, i) => (
                  <div key={i} className="flex-1 rounded-t-md"
                    style={{ height: `${h}%`, background: "linear-gradient(180deg,#EC4899,#6366F1)" }} />
                ))}
              </div>
              <p className="text-[10px] text-slate-400 mt-2">Monthly sales · all branches</p>
            </div>
          </div>
          {/* Floating chip */}
          <div className="absolute -bottom-4 -left-4 hidden sm:flex items-center gap-2 rounded-2xl bg-white shadow-xl px-3.5 py-2.5">
            <CheckCircle2 size={18} className="text-emerald-500" />
            <span className="text-xs font-semibold text-slate-800">Invoice synced to Tally</span>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 py-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Everything the business needs</h2>
          <p className="text-slate-400 mt-2 text-sm sm:text-base">One connected system — no spreadsheets, no double entry.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title}
              className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:bg-white/[0.06] transition-colors">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 shadow-lg"
                style={{ background: "linear-gradient(135deg,#6366F1,#EC4899)" }}>
                <Icon size={20} className="text-white" />
              </div>
              <h3 className="text-base font-semibold text-white">{title}</h3>
              <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── WORKFLOW ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 py-12">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] px-5 sm:px-8 py-8">
          <p className="text-center text-xs font-semibold tracking-widest text-pink-300 mb-6">END-TO-END WORKFLOW</p>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {WORKFLOW.map((step, i) => (
              <div key={step} className="flex items-center gap-2 sm:gap-3">
                <span className="text-sm font-semibold text-white px-3.5 py-2 rounded-xl border border-white/10 bg-white/5 whitespace-nowrap">
                  {step}
                </span>
                {i < WORKFLOW.length - 1 && <ArrowRight size={16} className="text-pink-400/70 flex-shrink-0" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 py-12">
        <div className="rounded-3xl px-6 sm:px-12 py-12 text-center shadow-2xl"
          style={{ background: "linear-gradient(120deg,#4F46E5,#9333EA,#EC4899)" }}>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Ready to get to work?</h2>
          <p className="text-white/85 mt-2 text-sm sm:text-base">Sign in to your branch and pick up where the team left off.</p>
          <Link href="/login"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-900 bg-white px-7 py-3 rounded-2xl shadow-lg transition-transform hover:scale-[1.03]">
            Sign In <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 border-t border-white/10 mt-8">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-5">
          <BrandLogo height={28} pill />
          <PoweredByBpro variant="dark" logoHeight={28} />
          <p className="text-xs text-slate-500">© {new Date().getFullYear()} ZAG SIGNS · All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
