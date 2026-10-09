"use client";

import { CheckCircle2, KeyRound, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { authClient, type AuthError } from "@/lib/auth-client";
import { authErrorMessage } from "@/lib/auth-errors";
import { formatNigerianPhone, toE164, validateEmail, validateNigerianPhone } from "@/lib/validation";
import { OtpStep } from "./otp-step";
import { PasswordInput } from "./password-input";

/** Codes that mean the reset code, not the new password, was the problem. */
const CODE_ERRORS = new Set(["INVALID_OTP", "OTP_EXPIRED", "OTP_NOT_FOUND", "TOO_MANY_ATTEMPTS"]);

/**
 * Password reset by a code sent to the phone (SMS) or email: target → code →
 * new password. The code is checked when the new password is submitted; if
 * it's wrong, the user goes back to the code step with the error.
 */
export function ForgotPasswordForm() {
  const [step, setStep] = useState<"request" | "otp" | "reset" | "done">("request");
  const [target, setTarget] = useState("");
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string>();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const isEmail = target.includes("@");
  const email = target.trim().toLowerCase();
  const phoneNumber = toE164(target);

  const sendCode = async () => {
    const { error } = isEmail
      ? await authClient.emailOtp.requestPasswordReset({ email })
      : await authClient.phoneNumber.requestPasswordReset({ phoneNumber });
    if (error) throw new Error(authErrorMessage(error));
  };

  const resetPassword = async (): Promise<AuthError | null> => {
    const { error } = isEmail
      ? await authClient.emailOtp.resetPassword({ email, otp: code, password })
      : await authClient.phoneNumber.resetPassword({ phoneNumber, otp: code, newPassword: password });
    return error;
  };

  if (step === "otp") {
    return (
      <OtpStep
        key={codeError}
        sentTo={isEmail ? email : formatNigerianPhone(phoneNumber)}
        via={isEmail ? "email" : "SMS"}
        changeLabel={isEmail ? "Change email" : "Change number"}
        title="Enter your reset code"
        initialError={codeError}
        onSubmit={async (value) => {
          setCode(value);
          setCodeError(undefined);
          setStep("reset");
        }}
        onResend={sendCode}
        onBack={() => setStep("request")}
      />
    );
  }

  if (step === "done") {
    return (
      <div className="text-center">
        <CheckCircle2 aria-hidden className="mx-auto h-16 w-16 animate-scale-in text-brand" />
        <h1 className="mt-4 text-2xl font-extrabold">Password updated</h1>
        <p className="mt-1 text-muted">You&apos;ve been logged out everywhere. Log in with your new password.</p>
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
          {isReset
            ? "Choose something you haven't used before."
            : "Enter your phone number or email and we'll send you a reset code."}
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
            const error = await resetPassword();
            setLoading(false);
            if (error?.code && CODE_ERRORS.has(error.code)) {
              setCodeError(authErrorMessage(error));
              return setStep("otp");
            }
            if (error) return setError(authErrorMessage(error));
            return setStep("done");
          }
          if (isEmail ? !validateEmail(email) : !validateNigerianPhone(target)) {
            return setError("Enter a valid Nigerian phone number or email.");
          }
          setLoading(true);
          try {
            await sendCode();
            setStep("otp");
          } catch (err) {
            setError((err as Error).message);
          } finally {
            setLoading(false);
          }
        }}
        className="space-y-5"
      >
        {isReset ? (
          <Field label="New password" htmlFor="new-password" error={error}>
            <PasswordInput id="new-password" autoComplete="new-password" value={password} invalid={!!error} onChange={(e) => setPassword(e.target.value)} />
          </Field>
        ) : (
          <Field label="Phone number or email" htmlFor="target" error={error}>
            <Input
              id="target"
              autoComplete="username"
              placeholder="0803 000 0000 or you@email.com"
              value={target}
              invalid={!!error}
              onChange={(e) => setTarget(e.target.value)}
            />
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
