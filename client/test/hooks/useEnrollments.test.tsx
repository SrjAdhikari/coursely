//* test/hooks/useEnrollments.test.tsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

vi.mock("@/api/enrollments.api", () => ({
	getMyEnrollments: vi.fn(),
	listEnrollments: vi.fn(),
}));

import { getMyEnrollments, listEnrollments } from "@/api/enrollments.api";
import { useMyEnrollments, useListEnrollments } from "@/hooks/useEnrollments";

const wrapper = ({ children }: { children: ReactNode }) => {
	const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
	return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
};

describe("enrollment hooks", () => {
	beforeEach(() => vi.clearAllMocks());

	it("returns my enrollments", async () => {
		vi.mocked(getMyEnrollments).mockResolvedValue({
			success: true,
			message: "ok",
			data: [
				{
					_id: "e1",
					courseId: { _id: "c1", title: "React", slug: "react" },
					createdAt: "2026-06-28T00:00:00.000Z",
				},
			] as never,
		});
		const { result } = renderHook(() => useMyEnrollments(), { wrapper });
		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(result.current.data?.data[0].courseId.title).toBe("React");
	});

	it("does not fetch my enrollments when disabled", () => {
		const { result } = renderHook(() => useMyEnrollments({ enabled: false }), {
			wrapper,
		});
		expect(result.current.fetchStatus).toBe("idle");
		expect(getMyEnrollments).not.toHaveBeenCalled();
	});

	it("returns a page of admin enrollments", async () => {
		vi.mocked(listEnrollments).mockResolvedValue({
			success: true,
			message: "ok",
			data: {
				items: [],
				pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
			},
		});
		const { result } = renderHook(() => useListEnrollments(1, 10), { wrapper });
		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(listEnrollments).toHaveBeenCalledWith({ page: 1, limit: 10 });
	});

	it("keeps the previous page's data while the next page loads", async () => {
		const pageResponse = (page: number) =>
			({
				success: true,
				message: "ok",
				data: {
					items: [{ _id: `e-p${page}` }],
					pagination: { page, limit: 10, total: 23, totalPages: 3 },
				},
			}) as never;

		let resolvePage2!: (value: unknown) => void;
		const page2Pending = new Promise((resolve) => {
			resolvePage2 = resolve;
		});
		vi.mocked(listEnrollments).mockImplementation((params: {
			page: number;
			limit: number;
		}) =>
			params.page === 1
				? (Promise.resolve(pageResponse(1)) as never)
				: (page2Pending as never),
		);

		const { result, rerender } = renderHook(
			({ page }) => useListEnrollments(page, 10),
			{ wrapper, initialProps: { page: 1 } },
		);
		await waitFor(() =>
			expect(result.current.data?.data.pagination.page).toBe(1),
		);

		// Switch to page 2 while it is still in flight.
		rerender({ page: 2 });
		expect(result.current.data?.data.pagination.page).toBe(1);
		expect(result.current.isPlaceholderData).toBe(true);

		resolvePage2(pageResponse(2));
		await waitFor(() =>
			expect(result.current.data?.data.pagination.page).toBe(2),
		);
		expect(result.current.isPlaceholderData).toBe(false);
	});
});
