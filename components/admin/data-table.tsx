"use client";

import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { Select } from "@/components/ui/field";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  /** Provide to make the column sortable. */
  sortValue?: (row: T) => string | number;
  className?: string;
}

export interface TableFilter<T> {
  label: string;
  options: { value: string; label: string }[];
  predicate: (row: T, value: string) => boolean;
}

/**
 * Client-side table with search, one filter, sorting and pagination.
 * When the dataset grows these map 1:1 to `?q=&status=&sort=&page=` query
 * params on the admin API.
 */
export function DataTable<T>({
  rows,
  columns,
  getRowId,
  searchText,
  searchPlaceholder = "Search",
  filter,
  rowActions,
  pageSize = 8,
  label,
}: {
  rows: T[];
  columns: Column<T>[];
  getRowId: (row: T) => string;
  searchText: (row: T) => string;
  searchPlaceholder?: string;
  filter?: TableFilter<T>;
  rowActions?: (row: T) => ReactNode;
  pageSize?: number;
  label: string;
}) {
  const [q, setQ] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);
  const [page, setPage] = useState(0);

  const processed = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let out = rows.filter((r) => !needle || searchText(r).toLowerCase().includes(needle));
    if (filter && filterValue) out = out.filter((r) => filter.predicate(r, filterValue));
    const col = sort && columns.find((c) => c.key === sort.key);
    if (col?.sortValue) {
      const dir = sort!.dir === "asc" ? 1 : -1;
      out = [...out].sort((a, b) => {
        const va = col.sortValue!(a);
        const vb = col.sortValue!(b);
        return (va < vb ? -1 : va > vb ? 1 : 0) * dir;
      });
    }
    return out;
  }, [rows, q, filter, filterValue, sort, columns, searchText]);

  const pageCount = Math.max(1, Math.ceil(processed.length / pageSize));
  const current = Math.min(page, pageCount - 1);
  const visible = processed.slice(current * pageSize, current * pageSize + pageSize);

  const toggleSort = (key: string) =>
    setSort((s) => (s?.key !== key ? { key, dir: "asc" } : s.dir === "asc" ? { key, dir: "desc" } : null));

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="flex flex-col gap-3 border-b border-border p-3 sm:flex-row">
        <div className="relative flex-1">
          <label htmlFor={`${label}-search`} className="sr-only">
            {searchPlaceholder}
          </label>
          <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            id={`${label}-search`}
            type="search"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(0);
            }}
            placeholder={searchPlaceholder}
            className="h-11 w-full rounded-xl border border-border bg-background pr-3 pl-9 text-sm focus:border-brand focus:ring-2 focus:ring-brand/30 focus:outline-none"
          />
        </div>
        {filter && (
          <div className="sm:w-52">
            <label htmlFor={`${label}-filter`} className="sr-only">
              {filter.label}
            </label>
            <Select
              id={`${label}-filter`}
              value={filterValue}
              onChange={(e) => {
                setFilterValue(e.target.value);
                setPage(0);
              }}
              className="h-11 text-sm"
            >
              <option value="">All {filter.label.toLowerCase()}</option>
              {filter.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <caption className="sr-only">{label}</caption>
          <thead className="bg-background text-xs tracking-wide text-muted uppercase">
            <tr>
              {columns.map((c) => {
                const sorted = sort?.key === c.key ? sort.dir : null;
                return (
                  <th
                    key={c.key}
                    scope="col"
                    aria-sort={sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : undefined}
                    className={cn("px-4 py-3 font-semibold", c.className)}
                  >
                    {c.sortValue ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(c.key)}
                        className="inline-flex items-center gap-1 uppercase hover:text-foreground focus-visible:outline-2 focus-visible:outline-brand"
                      >
                        {c.header}
                        {sorted === "asc" ? (
                          <ArrowUp aria-hidden className="h-3.5 w-3.5" />
                        ) : sorted === "desc" ? (
                          <ArrowDown aria-hidden className="h-3.5 w-3.5" />
                        ) : (
                          <ArrowUpDown aria-hidden className="h-3.5 w-3.5 opacity-40" />
                        )}
                      </button>
                    ) : (
                      c.header
                    )}
                  </th>
                );
              })}
              {rowActions && (
                <th scope="col" className="px-4 py-3 text-right font-semibold">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {visible.map((row) => (
              <tr key={getRowId(row)} className="hover:bg-background/60">
                {columns.map((c) => (
                  <td key={c.key} className={cn("px-4 py-3 align-middle", c.className)}>
                    {c.render(row)}
                  </td>
                ))}
                {rowActions && <td className="px-4 py-3 text-right whitespace-nowrap">{rowActions(row)}</td>}
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={columns.length + (rowActions ? 1 : 0)} className="px-4 py-12 text-center text-muted">
                  Nothing matches your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm">
        <p className="text-muted">
          {processed.length === 0
            ? "0 results"
            : `${current * pageSize + 1}–${Math.min(processed.length, (current + 1) * pageSize)} of ${processed.length}`}
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setPage(current - 1)}
            disabled={current === 0}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border disabled:opacity-40"
          >
            <ChevronLeft aria-hidden className="h-4 w-4" />
            <span className="sr-only">Previous page</span>
          </button>
          <span className="px-2 text-muted">
            {current + 1} / {pageCount}
          </span>
          <button
            type="button"
            onClick={() => setPage(current + 1)}
            disabled={current >= pageCount - 1}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border disabled:opacity-40"
          >
            <ChevronRight aria-hidden className="h-4 w-4" />
            <span className="sr-only">Next page</span>
          </button>
        </div>
      </div>
    </div>
  );
}
