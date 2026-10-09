import { Ban, KeyRound, Landmark, LogOut, MapPin, Phone, ShieldCheck, Smartphone, User } from "lucide-react";
import type { Metadata } from "next";
import { ToggleRow } from "@/components/forms/toggle-row";
import { PageHeader } from "@/components/layout/page-header";
import { SettingsLink, SettingsSection } from "@/components/profile/settings-section";
import { ButtonLink } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/api";
import { AUTO_RELEASE_DAYS } from "@/lib/constants";

export const metadata: Metadata = { title: "Settings" };

const FAQ = [
  {
    q: "How does Naija Market protect my money?",
    a: "When you pay, the money is held by Naija Market — not the seller. We only release it after you confirm you got the item or the job is done.",
  },
  {
    q: "What if I don't confirm?",
    a: `If you don't confirm or report a problem within ${AUTO_RELEASE_DAYS} days of hand-over, the money is released to the seller automatically.`,
  },
  {
    q: "How do I report a problem?",
    a: "Open the order and tap “Report a problem”. The money stays held while our team reviews the case, usually within 2–3 working days.",
  },
  {
    q: "When do sellers get paid?",
    a: "Payouts go to your bank account as soon as the buyer confirms, minus our 5% fee. Most banks receive it within minutes.",
  },
  {
    q: "Someone asked me to pay outside the app. What do I do?",
    a: "Don't. Payments outside Naija Market are not protected. Report the user from the chat menu so we can investigate.",
  },
];

export default async function SettingsPage() {
  const user = await getCurrentUser();
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Settings" backHref="/profile" />

      <SettingsSection id="account" title="Account">
        <SettingsLink href="/profile/edit" icon={User} label="Personal details" value={user.name} />
        <SettingsLink href="/profile/edit" icon={Phone} label="Phone number" value={user.phoneVerified ? "Verified" : "Verify now"} />
        <SettingsLink href="/profile/edit" icon={MapPin} label="Default location" value={user.area} />
      </SettingsSection>

      <SettingsSection id="payments" title="Payments & payouts">
        <SettingsLink href="/settings#payments" icon={Landmark} label="Payout bank account" value="GTBank ••4821" />
        <div className="px-4 py-3 text-sm text-muted">
          Sales are paid to this account after buyers confirm. Naija Market will never ask for your card PIN, OTP or
          password.
        </div>
      </SettingsSection>

      <SettingsSection id="notifications" title="Notifications">
        <ToggleRow label="Payment updates" description="Payments, hand-overs and payouts" defaultChecked />
        <ToggleRow label="Messages" description="New chats from buyers and sellers" defaultChecked />
        <ToggleRow label="Offers on my tasks" defaultChecked />
        <ToggleRow label="SMS alerts" description="For payments when you're offline" defaultChecked />
        <ToggleRow label="Deals & recommendations" />
      </SettingsSection>

      <SettingsSection id="security" title="Security & privacy">
        <SettingsLink href="/auth/forgot-password" icon={KeyRound} label="Change password" />
        <ToggleRow label="Two-step verification" description="Code by SMS when you log in on a new device" defaultChecked />
        <SettingsLink href="/settings#security" icon={Smartphone} label="Logged-in devices" value="2" />
        <SettingsLink href="/settings#security" icon={Ban} label="Blocked users" value="0" />
      </SettingsSection>

      <SettingsSection id="help" title="Help & safety">
        <div className="flex items-start gap-3 bg-brand-soft p-4 text-sm text-brand-dark">
          <ShieldCheck aria-hidden className="mt-0.5 h-5 w-5 shrink-0" />
          <p>
            Keep payments on Naija Market. Never send money directly to a seller&apos;s personal account. Report
            suspicious users or listings.
          </p>
        </div>
        {FAQ.map((item) => (
          <details key={item.q} className="group">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-medium focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand [&::-webkit-details-marker]:hidden">
              {item.q}
              <span aria-hidden className="text-xl text-muted transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="px-4 pb-4 text-sm text-muted">{item.a}</p>
          </details>
        ))}
      </SettingsSection>

      <div className="space-y-2">
        <ButtonLink href="/auth/login" variant="outline" size="lg" className="w-full text-danger">
          <LogOut aria-hidden className="h-5 w-5" />
          Log out
        </ButtonLink>
        <p className="text-center text-xs text-muted">Naija Market v1.0 · Made in Lagos</p>
      </div>
    </div>
  );
}
