/**
 * Cursor-paginated list response. `nextCursor` is the id of the last item;
 * pass it back as `?cursor=` to get the next page. Null on the last page.
 */
export interface Page<T> {
  items: T[];
  nextCursor: string | null;
}

/** Takes `limit + 1` rows and splits off the extra one to detect another page. */
export function toPage<T extends { id: string }, R>(rows: T[], limit: number, map: (row: T) => R): Page<R> {
  const hasMore = rows.length > limit;
  const pageRows = hasMore ? rows.slice(0, limit) : rows;
  return {
    items: pageRows.map(map),
    nextCursor: hasMore ? pageRows[pageRows.length - 1]!.id : null,
  };
}
