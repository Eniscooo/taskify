"use client";

import { CheckCircle2, KeyRound, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { requestOtp, resetPassword } from "@/lib/api";
import { validateEmail, validateNigerianPhone } from "@/lib/validation";
import { OtpStep } from "./otp-step";
import { PasswordInput } from "./password-input";

export function ForgotPasswordForm() {
  const [step, setStep] = useState<"request" | "otp" | "reset" | "done">("request");
  const [target, setTarget] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  if (step === "otp") return <OtpStep phone={target} onVerified={() => setStep("reset")} onBack={() => setStep("request")} />;

  if (step === "done") {
    return (
      <div className="text-center">
        <CheckCircle2 aria-hidden className="mx-auto h-16 w-16 animate-scale-in text-brand" />
        <h1 className="mt-4 text-2xl font-extrabold">Password updated</h1>
        <p className="mt-1 text-muted">You can now log in with your new password.</p>
        <ButtonLink href="/auth/login" size="lg" className="mt-6 w-full">
          Log in
        </ButtonLink>
      </div>
    );
  }

  const isReset = step === "reset";

  return (
    <div className="space-y-8">
      <div>
        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft">
          <KeyRound aria-hidden className="h-7 w-7 text-brand" />
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight">{isReset ? "Set a new password" : "Forgot password?"}</h1>
        <p className="mt-1 text-muted">
          {isReset ? "Choose something you haven't used before." : "Enter your phone number or email and we'll send you a reset code."}
        </p>
      </div>
      <form
        noValidate
        onSubmit={async (e) => {
          e.preventDefault();
          setError(undefined);
          if (isReset) {
            if (password.length < 8) return setError("Use at least 8 characters.");
            setLoading(true);
            await resetPassword(target, password);
            setLoading(false);
            return setStep("done");
          }
          if (!validateNigerianPhone(target) && !validateEmail(target)) {
            return setError("Enter a valid Nigerian phone number or email.");
          }
          setLoading(true);
          await requestOtp(target);
          setLoading(false);
          setStep("otp");
        }}
        className="space-y-5"
      >
        {isReset ? (
          <Field label="New password" htmlFor="new-password" error={error}>
            <PasswordInput id="new-password" autoComplete="new-password" value={password} invalid={!!error} onChange={(e) => setPassword(e.target.value)} />
          </Field>
        ) : (
          <Field label="Phone number or email" htmlFor="target" error={error}>
            <Input id="target" autoComplete="username" placeholder="0803 000 0000 or you@email.com" value={target} invalid={!!error} onChange={(e) => setTarget(e.target.value)} />
          </Field>
        )}
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading && <Loader2 aria-hidden className="h-5 w-5 animate-spin" />}
          {isReset ? "Update password" : "Send reset code"}
        </Button>
      </form>
      <p className="text-center text-sm text-muted">
        Remembered it?{" "}
        <Link href="/auth/login" className="font-semibold text-brand hover:underline">
          Back to log in
        </Link>
      </p>
    </div>
  );
}
