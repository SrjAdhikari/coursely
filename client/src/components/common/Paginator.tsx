//* src/components/common/Paginator.tsx

import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import {
	Pagination,
	PaginationContent,
	PaginationItem,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";

// Page buttons shown at once; the window advances in chunks (1–5, 6–10, …).
const PAGE_WINDOW = 5;

interface PaginatorProps {
	page: number;
	pageSize: number;
	total: number;
	totalPages: number;
	onPageChange: (page: number) => void;
}

/** Reusable pager for tabular data: a "Showing X–Y of Z" summary plus a
 *  windowed set of up to five page buttons that advance in chunks. */
const Paginator = ({
	page,
	pageSize,
	total,
	totalPages,
	onPageChange,
}: PaginatorProps) => {
	const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
	const rangeEnd = Math.min(page * pageSize, total);

	const windowPages = useMemo(() => {
		const chunkStart = Math.floor((page - 1) / PAGE_WINDOW) * PAGE_WINDOW + 1;
		const pages: number[] = [];
		for (
			let candidate = chunkStart;
			candidate < chunkStart + PAGE_WINDOW && candidate <= totalPages;
			candidate++
		) {
			pages.push(candidate);
		}
		return pages;
	}, [page, totalPages]);

	const goToPage = (target: number) => {
		const clamped = Math.min(Math.max(1, target), totalPages);
		if (clamped !== page) onPageChange(clamped);
	};

	return (
		<div className="flex items-center justify-between gap-4 border-t border-border p-4 text-xs text-muted-foreground">
			<span>
				Showing {rangeStart}–{rangeEnd} of {total}
			</span>

			<Pagination className="mx-0 w-auto justify-end">
				<PaginationContent>
					<PaginationItem>
						<Button
							variant="outline"
							size="icon"
							className="rounded-sm"
							aria-label="Go to previous page"
							disabled={page <= 1}
							onClick={() => goToPage(page - 1)}
						>
							<ChevronLeft />
						</Button>
					</PaginationItem>

					{windowPages.map((pageNumber) => (
						<PaginationItem key={pageNumber}>
							<Button
								variant={pageNumber === page ? "default" : "outline"}
								size="icon"
								className="rounded-sm"
								aria-label={`Go to page ${pageNumber}`}
								aria-current={pageNumber === page ? "page" : undefined}
								onClick={() => goToPage(pageNumber)}
							>
								{pageNumber}
							</Button>
						</PaginationItem>
					))}

					<PaginationItem>
						<Button
							variant="outline"
							size="icon"
							className="rounded-sm"
							aria-label="Go to next page"
							disabled={page >= totalPages}
							onClick={() => goToPage(page + 1)}
						>
							<ChevronRight />
						</Button>
					</PaginationItem>
				</PaginationContent>
			</Pagination>
		</div>
	);
};

export default Paginator;
