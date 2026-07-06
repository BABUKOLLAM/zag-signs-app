"use client";
import { useState } from "react";

/**
 * Renders the company logo. Pass `logoUrl`/`name` from CompanySettings so
 * this works for any customer's own branding, not just ZAG SIGNS — falls
 * back to the ZAG SIGNS default asset when no logoUrl is configured yet.
 *
 * On dark backgrounds set `pill` so the mark sits on a clean white chip
 * regardless of the source image's transparency. Falls back to a coral→
 * magenta tile with the company's initials if no image loads.
 */
export default function BrandLogo({
  height = 40,
  pill = false,
  className = "",
  logoUrl,
  name = "ZAG SIGNS",
}: {
  height?: number;
  pill?: boolean;
  className?: string;
  logoUrl?: string | null;
  name?: string;
}) {
  const [ok, setOk] = useState(true);
  const src = logoUrl || "/zagsigns-logo.png";
  const initials = name.trim().slice(0, 3).toUpperCase() || "ZAG";

  const img = ok ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name}
      style={{ height, width: "auto" }}
      className="object-contain block"
      onError={() => setOk(false)}
    />
  ) : (
    <div
      className="rounded-xl flex items-center justify-center"
      style={{ height, width: height * 1.1, background: "linear-gradient(135deg,#F0563F,#C2298A)" }}
    >
      <span className="text-white font-black tracking-tight" style={{ fontSize: height * 0.34 }}>{initials}</span>
    </div>
  );

  if (!pill) return <span className={className}>{img}</span>;

  return (
    <span
      className={`inline-flex items-center justify-center bg-white rounded-2xl shadow-sm ${className}`}
      style={{ padding: `${Math.round(height * 0.28)}px ${Math.round(height * 0.45)}px` }}
    >
      {img}
    </span>
  );
}
