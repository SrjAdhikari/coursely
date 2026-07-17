//* test/pages/admin/EnrollmentsPage.test.tsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockRefetch = vi.fn();
const mockUseListEnrollments = vi.fn();

vi.mock("@/hooks/useEnrollments", () => ({
	useListEnrollments: (...args: unknown[]) => mockUseListEnrollments(...args),
}));

import EnrollmentsPage from "@/pages/admin/EnrollmentsPage";

const page1 = {
	data: {
		data: {
			items: [
				{
					_id: "e1",
					userId: {
						_id: "u1",
						name: "Suraj Adhikari",
						email: "suraj@example.com",
					},
					courseId: { _id: "c1", title: "React Basics" },
					amountPaid: 149900,
					currency: "INR",
					createdAt: "2026-06-28T00:00:00.000Z",
				},
			],
			pagination: { page: 1, limit: 10, total: 23, totalPages: 3 },
		},
	},
	isLoading: false,
	isError: false,
	refetch: mockRefetch,
};

describe("admin EnrollmentsPage", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockUseListEnrollments.mockReturnValue(page1);
	});

	it("requests the first page with the fixed page size on mount", () => {
		render(<EnrollmentsPage />);
		expect(mockUseListEnrollments).toHaveBeenCalledWith(1, 10);
	});

	it("renders an enrollment row with student, course, amount and date", () => {
		render(<EnrollmentsPage />);
		expect(screen.getByText("Suraj Adhikari")).toBeInTheDocument();
		expect(screen.getByText("suraj@example.com")).toBeInTheDocument();
		expect(screen.getByText("React Basics")).toBeInTheDocument();
		expect(screen.getByText("₹1,499")).toBeInTheDocument();
		expect(screen.getByText("28 Jun 2026")).toBeInTheDocument();
	});

	it("shows the descriptive subtitle and a total-count chip", () => {
		render(<EnrollmentsPage />);
		expect(screen.getByText(/newest first/i)).toBeInTheDocument();
		expect(screen.getByText(/23 total/i)).toBeInTheDocument();
	});

	it("shows a dash when the amount paid is missing", () => {
		mockUseListEnrollments.mockReturnValue({
			data: {
				data: {
					items: [
						{
							_id: "e2",
							userId: { _id: "u2", name: "Free Learner", email: "free@example.com" },
							courseId: { _id: "c2", title: "Intro Course" },
							createdAt: "2026-06-28T00:00:00.000Z",
						},
					],
					pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
				},
			},
			isLoading: false,
			isError: false,
			refetch: mockRefetch,
		});
		render(<EnrollmentsPage />);
		expect(screen.getByText("—")).toBeInTheDocument();
	});

	it("shows the page indicator and disables Previous on page 1", () => {
		render(<EnrollmentsPage />);
		expect(screen.getByText("Showing 1–10 of 23")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /previous/i })).toBeDisabled();
		expect(screen.getByRole("button", { name: /next/i })).toBeEnabled();
	});

	it("advances the page on Next", async () => {
		render(<EnrollmentsPage />);
		await userEvent.click(screen.getByRole("button", { name: /next/i }));
		expect(screen.getByText("Showing 11–20 of 23")).toBeInTheDocument();
		expect(mockUseListEnrollments).toHaveBeenLastCalledWith(2, 10);
	});

	it("disables both pagers when there is only one page", () => {
		mockUseListEnrollments.mockReturnValue({
			data: {
				data: {
					items: page1.data.data.items,
					pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
				},
			},
			isLoading: false,
			isError: false,
			refetch: mockRefetch,
		});
		render(<EnrollmentsPage />);
		expect(screen.getByRole("button", { name: /previous/i })).toBeDisabled();
		expect(screen.getByRole("button", { name: /next/i })).toBeDisabled();
	});

	it("shows the loader while loading", () => {
		mockUseListEnrollments.mockReturnValue({
			data: undefined,
			isLoading: true,
			isError: false,
			refetch: mockRefetch,
		});
		render(<EnrollmentsPage />);
		expect(screen.getByRole("status")).toBeInTheDocument();
	});

	it("shows the load-failed state and retries on click", async () => {
		mockUseListEnrollments.mockReturnValue({
			data: undefined,
			isLoading: false,
			isError: true,
			refetch: mockRefetch,
		});
		render(<EnrollmentsPage />);
		expect(screen.getByRole("alert")).toBeInTheDocument();
		expect(screen.getByText(/couldn't load enrollments/i)).toBeInTheDocument();

		await userEvent.click(screen.getByRole("button", { name: /try again/i }));
		expect(mockRefetch).toHaveBeenCalledOnce();
	});

	it("keeps the paginator (not the empty state) when a page is empty but enrollments exist", () => {
		mockUseListEnrollments.mockReturnValue({
			data: {
				data: {
					items: [],
					pagination: { page: 3, limit: 10, total: 23, totalPages: 3 },
				},
			},
			isLoading: false,
			isError: false,
			refetch: mockRefetch,
		});
		render(<EnrollmentsPage />);
		expect(screen.queryByText(/no enrollments yet/i)).not.toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /previous/i }),
		).toBeInTheDocument();
	});

	it("shows the empty state when there are no enrollments", () => {
		mockUseListEnrollments.mockReturnValue({
			data: {
				data: {
					items: [],
					pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
				},
			},
			isLoading: false,
			isError: false,
			refetch: mockRefetch,
		});
		render(<EnrollmentsPage />);
		expect(screen.getByText(/no enrollments yet/i)).toBeInTheDocument();
	});
});
