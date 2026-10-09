-- Full-text search over listing title + description.
-- Queried with: to_tsvector('english', title || ' ' || description) @@ websearch_to_tsquery('english', $1)
-- (expression must match exactly for the planner to use this index).
CREATE INDEX "listings_search_idx" ON "listings"
  USING GIN (to_tsvector('english', "title" || ' ' || "description"));
