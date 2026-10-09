import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ProfileEditForm } from "@/components/profile/profile-edit-form";
import { ProfileSkeleton } from "@/components/ui/skeleton";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Edit profile" };

async function EditForm() {
  const user = await requireUser("/profile/edit");
  return <ProfileEditForm user={user} />;
}

export default function EditProfilePage() {
  return (
    <>
      <PageHeader title="Edit profile" backHref="/profile" className="md:mx-auto md:max-w-2xl" />
      <Suspense fallback={<ProfileSkeleton />}>
        <EditForm />
      </Suspense>
    </>
  );
}
