"use client";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Landing from "@/components/Landing";
import BrandLogo from "@/components/BrandLogo";

export default function Home() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") router.replace("/dashboard");
  }, [status, router]);

  // Branded opening splash while the session resolves / before redirecting in.
  if (status === "loading" || status === "authenticated") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6"
        style={{ background: "linear-gradient(160deg,#0B1120,#171436,#0F1629)" }}>
        <BrandLogo height={44} pill />
        <Loader2 size={22} className="animate-spin text-pink-400" />
      </div>
    );
  }

  return <Landing />;
}
