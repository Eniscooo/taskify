-- Removed drafts stay incomplete, so removal must be allowed for them too.
ALTER TABLE "listings" DROP CONSTRAINT "listings_complete_unless_draft";
ALTER TABLE "listings" ADD CONSTRAINT "listings_complete_unless_draft" CHECK (
  "status" IN ('draft', 'removed') OR ("category_id" IS NOT NULL AND "condition" IS NOT NULL AND "delivery" IS NOT NULL)
);
