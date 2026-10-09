import { ShieldCheck } from "lucide-react";
import { Logo } from "@/components/layout/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <aside className="relative hidden w-[44%] flex-col justify-between overflow-hidden bg-gradient-to-br from-brand to-brand-dark p-10 text-white lg:flex">
        <Logo inverted />
        <div>
          <p className="text-4xl leading-tight font-extrabold tracking-tight">
            Buy, sell and hire help — <span className="text-accent">without the wahala.</span>
          </p>
          <p className="mt-4 max-w-md text-white/85">
            Every payment is held safely by Naija Market until you confirm you got what you paid for.
          </p>
        </div>
        <p className="flex items-center gap-2 text-sm text-white/80">
          <ShieldCheck aria-hidden className="h-5 w-5" />
          Trusted by 48,000+ people across Lagos
        </p>
        <div aria-hidden className="absolute -right-24 -bottom-24 h-80 w-80 rounded-full bg-white/5" />
      </aside>
      <main className="flex flex-1 flex-col px-5 py-6 sm:px-10">
        <div className="lg:hidden">
          <Logo />
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-8">{children}</div>
      </main>
    </div>
  );
}
