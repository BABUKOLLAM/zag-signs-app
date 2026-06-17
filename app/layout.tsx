import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Sidebar from "@/components/Sidebar";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? "https://bprozagcrm.xyz"),
  title: "ZAG SIGNS — Enterprise ERP",
  description: "ZAG SIGNS Enterprise ERP for managing leads, orders, production, inventory, billing and HR.",
  openGraph: {
    title: "ZAG SIGNS — Enterprise ERP",
    description: "ZAG SIGNS Enterprise ERP for managing leads, orders, production, inventory, billing and HR.",
    url: "https://bprozagcrm.xyz",
    siteName: "ZAG SIGNS ERP",
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-screen bg-slate-50">
        <Sidebar />
        <div className="ml-64 min-h-screen flex flex-col">
          {children}
        </div>
        <SpeedInsights />
      </body>
    </html>
  );
}
