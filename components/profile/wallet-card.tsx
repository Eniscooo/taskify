import { ArrowDownToLine, Landmark, Lock } from "lucide-react";
import { formatNaira } from "@/lib/formatters";

/**
 * Seller-side money overview. Mirrors the ledger: money held in escrow for
 * open sales, and money already paid out to the linked bank account.
 */
export function WalletCard({ held, paidOut, bank }: { held: number; paidOut: number; bank: string }) {
  return (
    <section id="wallet" aria-labelledby="wallet-title" className="scroll-mt-24 rounded-3xl bg-foreground p-5 text-white">
      <h2 id="wallet-title" className="text-sm font-semibold text-white/70">
        Wallet
      </h2>
      <div className="mt-3 grid grid-cols-2 gap-4">
        <div>
          <p className="flex items-center gap-1.5 text-xs text-white/70">
            <Lock aria-hidden className="h-3.5 w-3.5" />
            Held for your sales
          </p>
          <p className="text-2xl font-extrabold">{formatNaira(held)}</p>
        </div>
        <div>
          <p className="flex items-center gap-1.5 text-xs text-white/70">
            <ArrowDownToLine aria-hidden className="h-3.5 w-3.5" />
            Paid out this month
          </p>
          <p className="text-2xl font-extrabold">{formatNaira(paidOut)}</p>
        </div>
      </div>
      <p className="mt-4 flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm">
        <Landmark aria-hidden className="h-4 w-4" />
        Payouts go to {bank}
      </p>
      <p className="mt-2 text-xs text-white/60">
        Money is released automatically when buyers confirm. Naija Market never asks for your PIN or OTP.
      </p>
    </section>
  );
}
