"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { authClient, type AuthError } from "@/lib/auth-client";
import { authErrorMessage } from "@/lib/auth-errors";
import { toE164, validateNigerianPhone } from "@/lib/validation";
import { OtpStep } from "./otp-step";
import { PasswordInput } from "./password-input";

/** Only follow same-site paths after login, never "//evil.com" or full URLs. */
function safeNext(next: string | null) {
  return next?.startsWith("/") && !next.startsWith("//") ? next : "/";
}

export function LoginForm() {
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ identifier?: string; password?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);
  // Set when the account's phone still needs verifying; the API has texted a code.
  const [unverifiedPhone, setUnverifiedPhone] = useState<string>();

  const finish = () => {
    router.replace(next);
    router.refresh();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEmail = identifier.includes("@");
    const found: typeof errors = {};
    if (!identifier.trim()) found.identifier = "Enter your phone number or email.";
    else if (!isEmail && !validateNigerianPhone(identifier)) found.identifier = "Enter a valid phone number or email.";
    if (!password) found.password = "Enter your password.";
    setErrors(found);
    if (Object.keys(found).length) return;

    setLoading(true);
    const { error } = isEmail
      ? await authClient.signIn.email({ email: identifier.trim(), password })
      : await authClient.signIn.phoneNumber({ phoneNumber: toE164(identifier), password });
    setLoading(false);

    const phoneToVerify = (error as AuthError | null)?.phoneNumber;
    if (error?.code === "PHONE_NOT_VERIFIED" && phoneToVerify) return setUnverifiedPhone(phoneToVerify);
    if (error) return setErrors({ form: authErrorMessage(error) });
    finish();
  };

  if (unverifiedPhone) {
    return (
      <OtpStep
        phone={unverifiedPhone}
        title="Verify your phone to continue"
        onSubmit={async (code) => {
          const { error } = await authClient.phoneNumber.verify({ phoneNumber: unverifiedPhone, code });
          if (error) throw new Error(authErrorMessage(error));
          finish();
        }}
        onResend={async () => {
          const { error } = await authClient.phoneNumber.sendOtp({ phoneNumber: unverifiedPhone });
          if (error) throw new Error(authErrorMessage(error));
        }}
        onBack={() => setUnverifiedPhone(undefined)}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Welcome back</h1>
        <p className="mt-1 text-muted">Log in to buy, sell and hire help safely.</p>
      </div>
      <form noValidate onSubmit={submit} className="space-y-5">
        {errors.form && (
          <p role="alert" className="rounded-xl bg-danger-soft p-3 text-sm font-medium text-danger">
            {errors.form}
          </p>
        )}
        <Field label="Phone number or email" htmlFor="identifier" error={errors.identifier}>
          <Input
            id="identifier"
            autoComplete="username"
            inputMode="email"
            placeholder="0803 000 0000 or you@email.com"
            value={identifier}
            invalid={!!errors.identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
        </Field>
        <Field label="Password" htmlFor="password" error={errors.password}>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            value={password}
            invalid={!!errors.password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        <div className="text-right">
          <Link href="/auth/forgot-password" className="text-sm font-semibold text-brand hover:underline">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading && <Loader2 aria-hidden className="h-5 w-5 animate-spin" />}
          Log in
        </Button>
      </form>
      <p className="text-center text-sm text-muted">
        New to Naija Market?{" "}
        <Link href="/auth/register" className="font-semibold text-brand hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
