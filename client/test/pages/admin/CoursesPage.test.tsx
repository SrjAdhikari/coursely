//* test/pages/admin/CoursesPage.test.tsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockDelete = vi.fn();
const mockRefetch = vi.fn();
const mockUseListCourses = vi.fn();

vi.mock("@/hooks/useCourses", () => ({
	useListCourses: () => mockUseListCourses(),
	useDeleteCourse: () => ({ mutate: mockDelete, isPending: false }),
}));

vi.mock("sonner", () => ({
	toast: { success: vi.fn(), error: vi.fn() },
}));

import { toast } from "sonner";
import CoursesPage from "@/pages/admin/CoursesPage";

const successResult = {
	data: {
		data: [
			{
				_id: "1",
				title: "React from Scratch",
				slug: "react-from-scratch",
				instructorName: "Asha Rai",
				price: 99900,
				isPublished: true,
			},
			{
				_id: "2",
				title: "TS Deep Dive",
				slug: "ts-deep-dive",
				instructorName: "Vikram Shah",
				price: 129900,
				isPublished: false,
			},
		],
	},
	isLoading: false,
	isError: false,
	refetch: mockRefetch,
};

const renderPage = (client = new QueryClient()) =>
	render(
		<QueryClientProvider client={client}>
			<MemoryRouter>
				<CoursesPage />
			</MemoryRouter>
		</QueryClientProvider>,
	);

describe("CoursesPage", () => {
	beforeEach(() => {
		vi.resetAllMocks();
		mockUseListCourses.mockReturnValue(successResult);
	});

	it("renders a row per course with formatted price and status", () => {
		renderPage();
		expect(screen.getByText("React from Scratch")).toBeInTheDocument();
		expect(screen.getByText("TS Deep Dive")).toBeInTheDocument();
		expect(screen.getByText("₹999")).toBeInTheDocument();
		expect(screen.getByText("Draft")).toBeInTheDocument();
	});

	it("filters courses by the search box", async () => {
		renderPage();
		await userEvent.type(
			screen.getByPlaceholderText(/search courses/i),
			"deep",
		);
		expect(screen.queryByText("React from Scratch")).not.toBeInTheDocument();
		expect(screen.getByText("TS Deep Dive")).toBeInTheDocument();
	});

	it("shows the empty placeholder when there are no courses", () => {
		mockUseListCourses.mockReturnValue({
			data: { data: [] },
			isLoading: false,
			isError: false,
			refetch: mockRefetch,
		});
		renderPage();
		expect(screen.getByText("No courses yet")).toBeInTheDocument();
	});

	it("shows a no-results placeholder when the search matches nothing", async () => {
		renderPage();
		await userEvent.type(
			screen.getByPlaceholderText(/search courses/i),
			"zzz",
		);
		expect(screen.getByText("No matching courses")).toBeInTheDocument();
	});

	it("shows the loader while courses are loading", () => {
		mockUseListCourses.mockReturnValue({
			data: undefined,
			isLoading: true,
			isError: false,
			refetch: mockRefetch,
		});
		renderPage();
		expect(screen.getByRole("status")).toBeInTheDocument();
	});

	it("shows the load-failed state and retries on click", async () => {
		const user = userEvent.setup();
		mockUseListCourses.mockReturnValue({
			data: undefined,
			isLoading: false,
			isError: true,
			refetch: mockRefetch,
		});
		renderPage();

		expect(screen.getByRole("alert")).toBeInTheDocument();
		expect(screen.getByText(/couldn't load courses/i)).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: /try again/i }));
		expect(mockRefetch).toHaveBeenCalledOnce();
	});

	it("confirms then deletes the chosen course", async () => {
		const user = userEvent.setup();
		renderPage();

		await user.click(
			screen.getByRole("button", { name: /delete ts deep dive/i }),
		);
		expect(await screen.findByText(/delete course\?/i)).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: /^delete$/i }));
		expect(mockDelete).toHaveBeenCalledWith("2", expect.any(Object));
	});

	it("invalidates the courses list and toasts on a successful delete", async () => {
		const user = userEvent.setup();
		const client = new QueryClient();
		const invalidate = vi.spyOn(client, "invalidateQueries");
		mockDelete.mockImplementation((_id, { onSuccess }) => onSuccess());
		renderPage(client);

		await user.click(
			screen.getByRole("button", { name: /delete react from scratch/i }),
		);
		await user.click(screen.getByRole("button", { name: /^delete$/i }));

		expect(invalidate).toHaveBeenCalledWith({ queryKey: ["courses"] });
		expect(vi.mocked(toast.success)).toHaveBeenCalledWith("Course deleted");
	});

	it("surfaces the server error message when a delete fails", async () => {
		const user = userEvent.setup();
		mockDelete.mockImplementation((_id, { onError }) =>
			onError({
				code: "COURSE_HAS_ENROLLMENTS",
				message: "Course has active enrollments — unpublish it instead.",
			}),
		);
		renderPage();

		await user.click(
			screen.getByRole("button", { name: /delete ts deep dive/i }),
		);
		await user.click(screen.getByRole("button", { name: /^delete$/i }));

		expect(vi.mocked(toast.error)).toHaveBeenCalledWith(
			"Course has active enrollments — unpublish it instead.",
		);
	});
});
