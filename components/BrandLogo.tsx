"use client";
import { useState } from "react";

/**
 * Renders the official ZAG SIGNS logo (public/zagsigns-logo.png).
 * The PNG already contains the "Zag signs" wordmark, so no extra text is added.
 *
 * On dark backgrounds set `pill` so the colourful mark sits on a clean white
 * chip regardless of the source image's transparency. Falls back to a coral→
 * magenta "ZAG" tile if the asset is ever missing.
 */
export default function BrandLogo({
  height = 40,
  pill = false,
  className = "",
}: {
  height?: number;
  pill?: boolean;
  className?: string;
}) {
  const [ok, setOk] = useState(true);

  const img = ok ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/zagsigns-logo.png"
      alt="ZAG SIGNS"
      style={{ height, width: "auto" }}
      className="object-contain block"
      onError={() => setOk(false)}
    />
  ) : (
    <div
      className="rounded-xl flex items-center justify-center"
      style={{ height, width: height * 1.1, background: "linear-gradient(135deg,#F0563F,#C2298A)" }}
    >
      <span className="text-white font-black tracking-tight" style={{ fontSize: height * 0.34 }}>ZAG</span>
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
