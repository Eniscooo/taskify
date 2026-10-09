-- AlterTable
ALTER TABLE "listings" ALTER COLUMN "category_id" DROP NOT NULL,
ALTER COLUMN "description" SET DEFAULT '',
ALTER COLUMN "price_kobo" SET DEFAULT 0,
ALTER COLUMN "condition" DROP NOT NULL,
ALTER COLUMN "delivery" DROP NOT NULL,
ALTER COLUMN "area" SET DEFAULT '';


-- Only drafts may be incomplete.
ALTER TABLE "listings" ADD CONSTRAINT "listings_complete_unless_draft" CHECK (
  "status" = 'draft' OR ("category_id" IS NOT NULL AND "condition" IS NOT NULL AND "delivery" IS NOT NULL)
);
