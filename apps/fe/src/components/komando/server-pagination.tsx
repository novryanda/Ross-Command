import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import type { PaginationMeta } from "@/lib/api/types";

function pageHref(page: number, searchParams: Record<string, string | string[] | undefined>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, item));
    } else if (value) {
      params.set(key, value);
    }
  }
  params.set("page", String(page));
  return `?${params.toString()}`;
}

export function ServerPagination({
  meta,
  searchParams,
}: {
  meta?: PaginationMeta;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  if (!meta || meta.totalPages <= 1) return null;

  const pages = Array.from({ length: meta.totalPages }, (_, index) => index + 1)
    .filter((page) => Math.abs(page - meta.page) <= 2 || page === 1 || page === meta.totalPages);

  return (
    <Pagination className="justify-end">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={pageHref(Math.max(1, meta.page - 1), searchParams)}
            aria-disabled={meta.page <= 1}
            className={meta.page <= 1 ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>
        {pages.map((page) => (
          <PaginationItem key={page}>
            <PaginationLink href={pageHref(page, searchParams)} isActive={page === meta.page}>
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            href={pageHref(Math.min(meta.totalPages, meta.page + 1), searchParams)}
            aria-disabled={meta.page >= meta.totalPages}
            className={meta.page >= meta.totalPages ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
