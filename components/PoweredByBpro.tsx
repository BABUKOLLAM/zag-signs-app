"use client";
import { useState } from "react";

/**
 * "Powered by Team bpro" credit line, used in the footer of the landing page,
 * login screen and sidebar.
 *
 * Looks for the bpro logo at public/bpro-logo.png. Until that file is added it
 * falls back to a styled "Team bpro" wordmark, so the credit always renders.
 * (Google Drive share links can't be used as <img src> — save the logo file
 * into the public/ folder as bpro-logo.png.)
 */
export default function PoweredByBpro({
  variant = "dark",
  logoHeight = 18,
  className = "",
}: {
  variant?: "dark" | "light";
  logoHeight?: number;
  className?: string;
}) {
  const [ok, setOk] = useState(true);

  const muted = variant === "dark" ? "text-slate-400" : "text-slate-500";
  const strong = variant === "dark" ? "text-slate-100" : "text-slate-800";

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <span className={`text-xs font-medium ${muted}`}>Powered by</span>
      {ok ? (
        <span className="inline-flex items-center gap-1.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/bpro-logo.png"
            alt="Team bpro"
            style={{ height: logoHeight, width: "auto" }}
            className="object-contain block"
            onError={() => setOk(false)}
          />
          <span className={`text-xs font-semibold ${strong}`}>Team bpro</span>
        </span>
      ) : (
        <span className="inline-flex items-center gap-1">
          <span
            className="font-extrabold tracking-tight text-transparent bg-clip-text"
            style={{ backgroundImage: "linear-gradient(135deg,#6366F1,#EC4899)", fontSize: logoHeight * 0.9 }}
          >
            Team&nbsp;bpro
          </span>
        </span>
      )}
    </div>
  );
}
