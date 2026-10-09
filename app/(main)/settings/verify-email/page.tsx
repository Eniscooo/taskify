import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { VerifyEmailForm } from "@/components/forms/verify-email-form";
import { PageHeader } from "@/components/layout/page-header";
import { ProfileSkeleton } from "@/components/ui/skeleton";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Verify email" };

async function VerifyEmail() {
  const user = await requireUser("/settings/verify-email");
  if (user.emailVerified) redirect("/settings");
  return <VerifyEmailForm email={user.email} />;
}

export default function VerifyEmailPage() {
  return (
    <div className="mx-auto max-w-md space-y-6">
      <PageHeader title="Verify email" backHref="/settings" />
      <Suspense fallback={<ProfileSkeleton />}>
        <VerifyEmail />
      </Suspense>
    </div>
  );
}
