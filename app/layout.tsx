import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SidebarProvider } from "@/lib/sidebar-context";
import { ThemeProvider } from "@/lib/theme-context";
import AppShell from "@/components/AppShell";
import { ToastProvider } from "@/components/Toaster";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#4F46E5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? "https://bprozagcrm.xyz"),
  title: "ZAG SIGNS — Enterprise ERP",
  description: "ZAG SIGNS Enterprise ERP for managing leads, orders, production, inventory, billing and HR.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ZAG ERP",
  },
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
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      {/* Inline script prevents flash of wrong theme before React hydrates */}
      <Script id="theme-init" strategy="beforeInteractive">{`
        try {
          var t = localStorage.getItem('zag-theme');
          var dark = t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches);
          if (dark) document.documentElement.classList.add('dark');
        } catch(e){}
      `}</Script>
      <body className="min-h-screen bg-slate-50 overflow-x-hidden">
        <ThemeProvider>
          <SidebarProvider>
            <ToastProvider>
              <AppShell>
                {children}
              </AppShell>
            </ToastProvider>
          </SidebarProvider>
        </ThemeProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
