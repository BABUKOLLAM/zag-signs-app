"use client";
import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ManualContent from "./ManualContent";

export default function ManualPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // ?print=1 → redirect to the bare print page instead of printing here (sidebar would appear)
  useEffect(() => {
    if (searchParams.get("print") === "1") {
      router.replace("/manual-print");
    }
  }, [searchParams, router]);

  return <ManualContent printTo="/manual-print" />;
}
