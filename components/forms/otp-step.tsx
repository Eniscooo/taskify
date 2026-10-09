"use client";

import { Loader2, MessageSquareText } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatNigerianPhone } from "@/lib/validation";
import { OtpInput } from "./otp-input";

const RESEND_SECONDS = 30;

/**
 * SMS code step shared by sign-up, sign-in and password reset. `onSubmit`
 * throws an Error whose message is shown under the code boxes.
 */
export function OtpStep({
  phone,
  title = "Verify your phone",
  initialError,
  onSubmit,
  onResend,
  onBack,
}: {
  /** E.164, e.g. +2348034127790. */
  phone: string;
  title?: string;
  initialError?: string;
  onSubmit: (code: string) => Promise<void>;
  onResend: () => Promise<void>;
  onBack: () => void;
}) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(initialError);
  const [verifying, setVerifying] = useState(false);
  const [resendIn, setResendIn] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(code)) return setError("Enter the 6-digit code we sent you.");
    setVerifying(true);
    try {
      await onSubmit(code);
    } catch (err) {
      setError(err instanceof Error ? err.message : "That code didn't work. Check the SMS and try again.");
    } finally {
      setVerifying(false);
    }
  };

  const resend = async () => {
    setResendIn(RESEND_SECONDS);
    setError(undefined);
    setCode("");
    try {
      await onResend();
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't send a new code. Try again shortly.");
    }
  };

  return (
    <form noValidate onSubmit={verify} className="space-y-6">
      <div>
        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft">
          <MessageSquareText aria-hidden className="h-7 w-7 text-brand" />
        </span>
        <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
        <p className="mt-1 text-muted">
          We sent a 6-digit code by SMS to <strong className="text-foreground">{formatNigerianPhone(phone)}</strong>.{" "}
          <button type="button" onClick={onBack} className="font-semibold text-brand hover:underline">
            Change number
          </button>
        </p>
      </div>
      <div>
        <OtpInput value={code} onChange={(v) => { setCode(v); setError(undefined); }} invalid={!!error} />
        {error && (
          <p role="alert" className="mt-2 text-sm font-medium text-danger">
            {error}
          </p>
        )}
      </div>
      <Button type="submit" size="lg" className="w-full" disabled={verifying}>
        {verifying && <Loader2 aria-hidden className="h-5 w-5 animate-spin" />}
        Verify
      </Button>
      <p className="text-center text-sm text-muted">
        Didn&apos;t get it?{" "}
        {resendIn > 0 ? (
          <span>Resend in {resendIn}s</span>
        ) : (
          <button type="button" onClick={resend} className="font-semibold text-brand hover:underline">
            Resend code
          </button>
        )}
      </p>
    </form>
  );
}
