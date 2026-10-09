"use client";

import { Camera, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormSection } from "@/components/forms/form-section";
import { Avatar } from "@/components/ui/avatar";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { VerificationBadge } from "@/components/ui/verification-badge";
import { updateProfile } from "@/lib/api";
import { AREAS } from "@/lib/constants";
import type { Area, User } from "@/lib/types";
import { validateEmail, validateNigerianPhone } from "@/lib/validation";

type FormErrors = Partial<Record<"name" | "email" | "phone", string>>;

export function ProfileEditForm({ user }: { user: User }) {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone,
    area: user.area,
    bio: user.bio ?? "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: FormErrors = {};
    if (form.name.trim().length < 2) next.name = "Enter your full name.";
    if (!validateEmail(form.email)) next.email = "Enter a valid email address.";
    if (!validateNigerianPhone(form.phone)) next.phone = "Enter a valid Nigerian number, e.g. 0803 412 7790.";
    setErrors(next);
    if (Object.keys(next).length) return;
    setSaving(true);
    await updateProfile({ ...form, area: form.area as Area });
    setSaving(false);
    toast("Profile updated");
    router.push("/profile");
  };

  return (
    <form noValidate onSubmit={save} className="mx-auto max-w-2xl space-y-4">
      <FormSection title="Profile photo">
        <div className="flex items-center gap-4">
          <Avatar name={form.name || user.name} size="xl" />
          <label className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-border px-4 text-sm font-semibold hover:bg-background has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand">
            <Camera aria-hidden className="h-4 w-4" />
            Change photo
            <input type="file" accept="image/*" className="sr-only" onChange={() => toast("Photo uploaded")} />
          </label>
        </div>
      </FormSection>
      <FormSection title="Your details">
        <Field label="Full name" htmlFor="name" error={errors.name}>
          <Input id="name" autoComplete="name" value={form.name} invalid={!!errors.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>
        <Field label="Phone number" htmlFor="phone" error={errors.phone}>
          <Input id="phone" type="tel" autoComplete="tel" value={form.phone} invalid={!!errors.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </Field>
        <VerificationBadge verified={user.phoneVerified} label="Phone verified" />
        <Field label="Email" htmlFor="email" error={errors.email}>
          <Input id="email" type="email" autoComplete="email" value={form.email} invalid={!!errors.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </Field>
        <Field label="Area" htmlFor="area">
          <Select id="area" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value as Area })}>
            {AREAS.map((a) => (
              <option key={a} value={a}>
                {a}, Lagos
              </option>
            ))}
          </Select>
        </Field>
        <Field label="About you" htmlFor="bio" optional hint="Buyers trust sellers who say a little about themselves.">
          <Textarea id="bio" maxLength={240} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        </Field>
      </FormSection>
      <div className="flex gap-3">
        <ButtonLink href="/profile" variant="outline" size="lg" className="flex-1 md:flex-none">
          Cancel
        </ButtonLink>
        <Button type="submit" size="lg" className="flex-1" disabled={saving}>
          {saving && <Loader2 aria-hidden className="h-5 w-5 animate-spin" />}
          Save changes
        </Button>
      </div>
    </form>
  );
}
