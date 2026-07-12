//* test/hooks/useCourseForm.test.tsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

const mockCreate = vi.fn();
const mockUpdate = vi.fn();
const mockNavigate = vi.fn();

vi.mock("@/hooks/useCourses", () => ({
	useCreateCourse: () => ({ mutate: mockCreate, isPending: false }),
	useUpdateCourse: () => ({ mutate: mockUpdate, isPending: false }),
	useGetCourse: () => ({
		data: undefined,
		isLoading: false,
		isError: false,
		refetch: vi.fn(),
	}),
}));

vi.mock("react-router", () => ({
	useNavigate: () => mockNavigate,
}));

vi.mock("sonner", () => ({
	toast: { success: vi.fn(), error: vi.fn() },
}));

// Bypass zod validation so submit reaches the create branch with valid values.
vi.mock("@hookform/resolvers/zod", () => ({
	zodResolver: () => async () => ({
		values: {
			title: "React from Scratch",
			description: "Hooks and state.",
			instructorName: "Asha Rai",
			thumbnailUrl: "https://cdn.coursely.app/r.png",
			priceRupees: "999",
			isPublished: false,
			category: "Web Development",
			learningOutcomesText: "",
		},
		errors: {},
	}),
}));

import useCourseForm from "@/hooks/useCourseForm";

const wrapper = ({ children }: { children: ReactNode }) => {
	const client = new QueryClient();
	return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

describe("useCourseForm (create)", () => {
	beforeEach(() => vi.clearAllMocks());

	it("navigates to the curriculum page after creating a course", async () => {
		mockCreate.mockImplementation((_payload, { onSuccess }) =>
			onSuccess({ data: { _id: "new1" } }),
		);

		const { result } = renderHook(() => useCourseForm(), { wrapper });
		await act(async () => {
			await result.current.submitForm();
		});

		await waitFor(() => expect(mockCreate).toHaveBeenCalled());
		expect(mockNavigate).toHaveBeenCalledWith("/admin/courses/new1/curriculum");
		expect(mockNavigate).not.toHaveBeenCalledWith("/admin/courses/new1/edit");
	});
});
