"use client";

import { Loader2, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <Button
      variant="outline"
      size="lg"
      className="w-full text-danger"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        await authClient.signOut();
        router.replace("/");
        router.refresh();
      }}
    >
      {loading ? <Loader2 aria-hidden className="h-5 w-5 animate-spin" /> : <LogOut aria-hidden className="h-5 w-5" />}
      Log out
    </Button>
  );
}
