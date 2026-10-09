"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { login } from "@/lib/api";
import { PasswordInput } from "./password-input";

export function LoginForm() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ identifier?: string; password?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!identifier.trim()) next.identifier = "Enter your phone number or email.";
    if (!password) next.password = "Enter your password.";
    setErrors(next);
    if (Object.keys(next).length) return;
    setLoading(true);
    try {
      await login({ identifier, password });
      router.push("/");
    } catch {
      setErrors({ form: "That phone/email and password don't match. Try again or reset your password." });
    } finally {
      setLoading(false);
    }
  };

  return (
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
  );
}
