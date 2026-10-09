"use client";

import { CheckCircle2, Loader2, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { authErrorMessage } from "@/lib/auth-errors";
import { OtpStep } from "./otp-step";

/** Sends a code to the account's email and confirms it. */
export function VerifyEmailForm({ email }: { email: string }) {
  const router = useRouter();
  const [step, setStep] = useState<"send" | "otp" | "done">("send");
  const [error, setError] = useState<string>();
  const [sending, setSending] = useState(false);

  const sendCode = async () => {
    const { error } = await authClient.emailOtp.sendVerificationOtp({ email, type: "email-verification" });
    if (error) throw new Error(authErrorMessage(error));
  };

  if (step === "otp") {
    return (
      <OtpStep
        sentTo={email}
        via="email"
        changeLabel="Go back"
        title="Check your email"
        onSubmit={async (otp) => {
          const { error } = await authClient.emailOtp.verifyEmail({ email, otp });
          if (error) throw new Error(authErrorMessage(error));
          setStep("done");
          router.refresh();
        }}
        onResend={sendCode}
        onBack={() => setStep("send")}
      />
    );
  }

  if (step === "done") {
    return (
      <div className="text-center">
        <CheckCircle2 aria-hidden className="mx-auto h-16 w-16 animate-scale-in text-brand" />
        <h1 className="mt-4 text-2xl font-extrabold">Email verified</h1>
        <p className="mt-1 text-muted">You can now reset your password by email too.</p>
        <ButtonLink href="/settings" size="lg" className="mt-6 w-full">
          Back to settings
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft">
          <Mail aria-hidden className="h-7 w-7 text-brand" />
        </span>
        <h1 className="text-2xl font-extrabold tracking-tight">Verify your email</h1>
        <p className="mt-1 text-muted">
          We&apos;ll send a 6-digit code to <strong className="text-foreground">{email}</strong>.
        </p>
      </div>
      {error && (
        <p role="alert" className="rounded-xl bg-danger-soft p-3 text-sm font-medium text-danger">
          {error}
        </p>
      )}
      <Button
        size="lg"
        className="w-full"
        disabled={sending}
        onClick={async () => {
          setSending(true);
          setError(undefined);
          try {
            await sendCode();
            setStep("otp");
          } catch (err) {
            setError((err as Error).message);
          } finally {
            setSending(false);
          }
        }}
      >
        {sending && <Loader2 aria-hidden className="h-5 w-5 animate-spin" />}
        Send code
      </Button>
    </div>
  );
}
