import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { ProfileEditForm } from "@/components/profile/profile-edit-form";
import { getCurrentUser } from "@/lib/api";

export const metadata: Metadata = { title: "Edit profile" };

export default async function EditProfilePage() {
  const user = await getCurrentUser();
  return (
    <>
      <PageHeader title="Edit profile" backHref="/profile" className="md:mx-auto md:max-w-2xl" />
      <ProfileEditForm user={user} />
    </>
  );
}
