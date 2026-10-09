"use client";

import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { RatingInput } from "@/components/forms/rating-input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Textarea } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { createReview } from "@/lib/api";

const CATEGORIES = {
  item: [
    { id: "accuracy", label: "Item as described" },
    { id: "communication", label: "Communication" },
    { id: "handover", label: "Pickup / delivery" },
  ],
  service: [
    { id: "quality", label: "Quality of work" },
    { id: "punctuality", label: "Punctuality" },
    { id: "value", label: "Value for money" },
  ],
};

export function ReviewForm({
  targetId,
  targetName,
  context,
  kind,
}: {
  targetId: string;
  targetName: string;
  context: string;
  kind: "item" | "service";
}) {
  const toast = useToast();
  const [overall, setOverall] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [body, setBody] = useState("");
  const [error, setError] = useState<string>();
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <Card className="flex items-center gap-3 p-5">
        <CheckCircle2 aria-hidden className="h-8 w-8 shrink-0 text-brand" />
        <div>
          <p className="font-bold">Thanks for your review!</p>
          <p className="text-sm text-muted">It helps other people in Lagos trade safely.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <form
        noValidate
        onSubmit={async (e) => {
          e.preventDefault();
          if (!overall) return setError("Tap a star to rate your experience.");
          await createReview({ targetId, rating: overall, body, context });
          setSubmitted(true);
          toast("Review submitted");
        }}
        className="space-y-5"
      >
        <div className="text-center">
          <h2 className="text-lg font-bold">How was your experience?</h2>
          <p className="text-sm text-muted">Rate {targetName}</p>
          <div className="mt-3 flex justify-center">
            <RatingInput name="overall" label="Overall rating" value={overall} onChange={(v) => { setOverall(v); setError(undefined); }} />
          </div>
          {error && (
            <p role="alert" className="mt-1 text-sm font-medium text-danger">
              {error}
            </p>
          )}
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {CATEGORIES[kind].map((c) => (
            <RatingInput
              key={c.id}
              name={c.id}
              label={c.label}
              size="md"
              value={scores[c.id] ?? 0}
              onChange={(v) => setScores((s) => ({ ...s, [c.id]: v }))}
            />
          ))}
        </div>
        <Field label="Leave a review" htmlFor="review-body" optional hint="What went well? What could be better?">
          <Textarea
            id="review-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your review"
            maxLength={500}
          />
        </Field>
        <Button type="submit" size="lg" className="w-full">
          Submit Review
        </Button>
      </form>
    </Card>
  );
}
