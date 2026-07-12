import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";

import useClientPagination from "@/hooks/useClientPagination";

const makeItems = (count: number) =>
	Array.from({ length: count }, (_, index) => index + 1);

describe("useClientPagination", () => {
	it("returns the first page slice with correct totals", () => {
		const { result } = renderHook(() => useClientPagination(makeItems(25), 10));

		expect(result.current.pageItems).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
		expect(result.current.page).toBe(1);
		expect(result.current.total).toBe(25);
		expect(result.current.totalPages).toBe(3);
	});

	it("moves to the next slice when the page changes", () => {
		const { result } = renderHook(() => useClientPagination(makeItems(25), 10));

		act(() => result.current.setPage(2));

		expect(result.current.page).toBe(2);
		expect(result.current.pageItems).toEqual([
			11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
		]);
	});

	it("clamps the page down when the items shrink below it", () => {
		const { result, rerender } = renderHook(
			({ items }) => useClientPagination(items, 10),
			{ initialProps: { items: makeItems(25) } },
		);

		act(() => result.current.setPage(3));
		expect(result.current.page).toBe(3);

		rerender({ items: makeItems(5) }); // only one page now
		expect(result.current.page).toBe(1);
		expect(result.current.totalPages).toBe(1);
		expect(result.current.pageItems).toEqual([1, 2, 3, 4, 5]);
	});

	it("reports one page and an empty slice for an empty array", () => {
		const { result } = renderHook(() => useClientPagination([], 10));

		expect(result.current.totalPages).toBe(1);
		expect(result.current.pageItems).toEqual([]);
		expect(result.current.total).toBe(0);
	});
});
