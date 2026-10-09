"use client";

import { CheckCircle2, CreditCard, Landmark, Loader2, Smartphone } from "lucide-react";
import { useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { BottomSheet } from "@/components/ui/dialog";
import { formatNaira } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { PaymentSummary } from "./payment-summary";
import { BuyerProtection } from "./safety-notice";

const METHODS = [
  { id: "card", label: "Card", icon: CreditCard },
  { id: "transfer", label: "Bank transfer", icon: Landmark },
  { id: "ussd", label: "USSD", icon: Smartphone },
] as const;

/**
 * Checkout flow. In production `onPay` initialises a Paystack transaction
 * and we redirect to its authorization URL; the webhook flips the order
 * to "paid" → "held".
 */
export function CheckoutSheet({
  open,
  onClose,
  title,
  counterparty,
  amount,
  orderHref,
  onPay,
  kind = "item",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  counterparty: string;
  amount: number;
  orderHref: string;
  onPay?: () => Promise<unknown>;
  kind?: "item" | "service";
}) {
  const [method, setMethod] = useState<(typeof METHODS)[number]["id"]>("card");
  const [step, setStep] = useState<"review" | "paying" | "done">("review");

  const close = () => {
    onClose();
    setTimeout(() => setStep("review"), 200);
  };

  const pay = async () => {
    setStep("paying");
    await Promise.all([onPay?.(), new Promise((r) => setTimeout(r, 1400))]);
    setStep("done");
  };

  if (step === "done") {
    return (
      <BottomSheet open={open} onClose={close} title="Payment confirmed">
        <div className="flex flex-col items-center py-4 text-center">
          <CheckCircle2 aria-hidden className="h-16 w-16 animate-scale-in text-brand" />
          <p className="mt-3 text-2xl font-extrabold">{formatNaira(amount)}</p>
          <p className="font-semibold">is held safely by Naija Market</p>
          <p className="mt-2 max-w-xs text-sm text-muted">
            {counterparty} has been notified. They get paid only after you confirm{" "}
            {kind === "item" ? "you got the item" : "the job is done"}.
          </p>
          <ButtonLink href={orderHref} size="lg" className="mt-6 w-full">
            Track your order
          </ButtonLink>
        </div>
      </BottomSheet>
    );
  }

  return (
    <BottomSheet
      open={open}
      onClose={close}
      title="Checkout"
      description={title}
      footer={
        <Button size="lg" className="w-full" onClick={pay} disabled={step === "paying"}>
          {step === "paying" ? (
            <>
              <Loader2 aria-hidden className="h-5 w-5 animate-spin" />
              Confirming with Paystack…
            </>
          ) : (
            `Pay ${formatNaira(amount)} securely`
          )}
        </Button>
      }
    >
      <div className="space-y-5">
        <PaymentSummary amount={amount} fee={0} perspective="buyer" />
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">Pay with</legend>
          <div className="grid grid-cols-3 gap-2">
            {METHODS.map(({ id, label, icon: Icon }) => (
              <label
                key={id}
                className={cn(
                  "flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-semibold transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand",
                  method === id ? "border-brand bg-brand-soft text-brand-dark" : "border-border",
                )}
              >
                <input
                  type="radio"
                  name="method"
                  value={id}
                  checked={method === id}
                  onChange={() => setMethod(id)}
                  className="sr-only"
                />
                <Icon aria-hidden className="h-5 w-5" />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
        <BuyerProtection title="Your money is protected">
          {counterparty} won&apos;t receive this money until you confirm{" "}
          {kind === "item" ? "you got the item" : "the job is done"}. If something goes wrong, you can report a
          problem and get a refund.
        </BuyerProtection>
        <p className="text-center text-xs text-muted">Payments processed securely by Paystack.</p>
      </div>
    </BottomSheet>
  );
}
