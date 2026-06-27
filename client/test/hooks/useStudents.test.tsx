//* test/hooks/useStudents.test.tsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

vi.mock("@/api/students.api", () => ({
	listStudents: vi.fn(),
	getStudent: vi.fn(),
	updateStudent: vi.fn(),
}));

import { listStudents, updateStudent } from "@/api/students.api";
import { useListStudents, useUpdateStudent } from "@/hooks/useStudents";

const wrapper = ({ children }: { children: ReactNode }) => {
	const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
	return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
};

describe("useStudents", () => {
	beforeEach(() => vi.clearAllMocks());

	it("returns the students list", async () => {
		vi.mocked(listStudents).mockResolvedValue({
			success: true,
			message: "ok",
			data: [{ _id: "1", name: "Rahul" }] as never,
		});
		const { result } = renderHook(() => useListStudents(), { wrapper });
		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(result.current.data?.data[0].name).toBe("Rahul");
	});

	it("calls updateStudent with role/isActive on mutate", async () => {
		vi.mocked(updateStudent).mockResolvedValue({
			success: true,
			message: "ok",
			data: {} as never,
		});
		const { result } = renderHook(() => useUpdateStudent(), { wrapper });
		result.current.mutate({ id: "1", payload: { isActive: false } });
		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(updateStudent).toHaveBeenCalledWith(
			{ id: "1", payload: { isActive: false } },
			expect.any(Object),
		);
	});
});
