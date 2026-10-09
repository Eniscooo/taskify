"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { authClient, type AuthError } from "@/lib/auth-client";
import { authErrorMessage } from "@/lib/auth-errors";
import { toE164, validateEmail, validateNigerianPhone } from "@/lib/validation";
import { OtpStep } from "./otp-step";
import { PasswordInput } from "./password-input";

type Fields = { name: string; phone: string; email: string; password: string };
type FieldErrors = Partial<Record<keyof Fields | "terms" | "form", string>>;

/** Puts a sign-up error next to the field it's about. */
function signUpErrors(error: AuthError): FieldErrors {
  const message = authErrorMessage(error);
  switch (error.code) {
    case "PHONE_NUMBER_EXISTS":
    case "INVALID_PHONE_NUMBER":
      return { phone: message };
    case "USER_ALREADY_EXISTS":
    case "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL":
      return { email: message };
    case "PASSWORD_TOO_SHORT":
      return { password: message };
    default:
      return { form: message };
  }
}

export function RegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState<"details" | "otp" | "done">("details");
  const [form, setForm] = useState<Fields>({ name: "", phone: "", email: "", password: "" });
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  const update = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [k]: e.target.value });
    setErrors({ ...errors, [k]: undefined });
  };

  const phoneNumber = toE164(form.phone);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: FieldErrors = {};
    if (form.name.trim().split(/\s+/).length < 2) next.name = "Enter your first and last name.";
    if (!validateNigerianPhone(form.phone)) next.phone = "Enter a valid Nigerian number, e.g. 0803 412 7790.";
    if (!validateEmail(form.email)) next.email = "Enter a valid email address.";
    if (form.password.length < 8) next.password = "Use at least 8 characters.";
    if (!terms) next.terms = "Please accept the terms to continue.";
    setErrors(next);
    if (Object.keys(next).length) return;
    setLoading(true);
    // Creates the account without a session; verifying the phone signs them in.
    const { error } = await authClient.signUp.email({
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      phoneNumber,
    });
    if (error) {
      setLoading(false);
      return setErrors(signUpErrors(error));
    }
    await authClient.phoneNumber.sendOtp({ phoneNumber });
    setLoading(false);
    setStep("otp");
  };

  if (step === "otp") {
    return (
      <OtpStep
        phone={phoneNumber}
        onSubmit={async (code) => {
          const { error } = await authClient.phoneNumber.verify({ phoneNumber, code });
          if (error) throw new Error(authErrorMessage(error));
          setStep("done");
          router.refresh();
        }}
        onResend={async () => {
          const { error } = await authClient.phoneNumber.sendOtp({ phoneNumber });
          if (error) throw new Error(authErrorMessage(error));
        }}
        onBack={() => setStep("details")}
      />
    );
  }

  if (step === "done") {
    return (
      <div className="text-center">
        <CheckCircle2 aria-hidden className="mx-auto h-16 w-16 animate-scale-in text-brand" />
        <h1 className="mt-4 text-2xl font-extrabold">You&apos;re in, {form.name.split(" ")[0]}!</h1>
        <p className="mt-1 text-muted">Your phone is verified. Verify your ID later to get the ✓ badge and sell faster.</p>
        <ButtonLink href="/" size="lg" className="mt-6 w-full">
          Start exploring
        </ButtonLink>
      </div>
    );
  }

  const strength = Math.min(4, [/.{8,}/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((re) => re.test(form.password)).length);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Create your account</h1>
        <p className="mt-1 text-muted">It takes less than a minute.</p>
      </div>
      <form noValidate onSubmit={submit} className="space-y-5">
        {errors.form && (
          <p role="alert" className="rounded-xl bg-danger-soft p-3 text-sm font-medium text-danger">
            {errors.form}
          </p>
        )}
        <Field label="Full name" htmlFor="name" error={errors.name}>
          <Input id="name" autoComplete="name" placeholder="e.g. Adaeze Okafor" value={form.name} invalid={!!errors.name} onChange={update("name")} />
        </Field>
        <Field label="Phone number" htmlFor="phone" error={errors.phone} hint="We'll text you a code to verify it.">
          <div className="flex gap-2">
            <span className="flex h-12 shrink-0 items-center rounded-xl border border-border bg-background px-3 text-sm font-semibold">
              🇳🇬 +234
            </span>
            <Input
              id="phone"
              type="tel"
              autoComplete="tel-national"
              inputMode="tel"
              placeholder="0803 000 0000"
              value={form.phone}
              invalid={!!errors.phone}
              aria-describedby={errors.phone ? "phone-error" : "phone-hint"}
              onChange={update("phone")}
            />
          </div>
        </Field>
        <Field label="Email" htmlFor="email" error={errors.email}>
          <Input id="email" type="email" autoComplete="email" placeholder="you@email.com" value={form.email} invalid={!!errors.email} onChange={update("email")} />
        </Field>
        <Field label="Password" htmlFor="password" error={errors.password}>
          <PasswordInput id="password" autoComplete="new-password" value={form.password} invalid={!!errors.password} onChange={update("password")} />
        </Field>
        {form.password && (
          <div aria-live="polite">
            <div className="flex gap-1" aria-hidden>
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={`h-1.5 flex-1 rounded-full ${i < strength ? (strength < 2 ? "bg-danger" : strength < 4 ? "bg-accent" : "bg-brand") : "bg-border"}`}
                />
              ))}
            </div>
            <p className="mt-1 text-xs text-muted">
              Password strength: {["Too weak", "Weak", "Okay", "Good", "Strong"][strength]}
            </p>
          </div>
        )}
        <div>
          <label className="flex cursor-pointer items-start gap-3 text-sm">
            <input
              type="checkbox"
              checked={terms}
              onChange={(e) => {
                setTerms(e.target.checked);
                setErrors({ ...errors, terms: undefined });
              }}
              className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--brand)]"
            />
            <span>
              I agree to the <Link href="/settings#help" className="font-semibold text-brand hover:underline">Terms</Link> and{" "}
              <Link href="/settings#help" className="font-semibold text-brand hover:underline">Privacy Policy</Link>, and to keep all
              payments on Naija Market.
            </span>
          </label>
          {errors.terms && (
            <p role="alert" className="mt-1 text-sm font-medium text-danger">
              {errors.terms}
            </p>
          )}
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading && <Loader2 aria-hidden className="h-5 w-5 animate-spin" />}
          Create account
        </Button>
      </form>
      <p className="text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/auth/login" className="font-semibold text-brand hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
