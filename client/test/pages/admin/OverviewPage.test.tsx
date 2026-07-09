//* test/pages/admin/OverviewPage.test.tsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router";

const mockRefetchCourses = vi.fn();
const mockRefetchStudents = vi.fn();
const mockRefetchEnrollments = vi.fn();
const mockUseListCourses = vi.fn();
const mockUseListStudents = vi.fn();
const mockUseListEnrollments = vi.fn();

vi.mock("@/hooks/useCourses", () => ({
	useListCourses: () => mockUseListCourses(),
}));
vi.mock("@/hooks/useStudents", () => ({
	useListStudents: () => mockUseListStudents(),
}));
vi.mock("@/hooks/useEnrollments", () => ({
	useListEnrollments: () => mockUseListEnrollments(),
}));

import OverviewPage from "@/pages/admin/OverviewPage";

// Listed oldest-first on purpose, so the page's newest-first sort is observable.
const coursesResult = {
	data: {
		data: [
			{
				_id: "2",
				title: "TS Deep Dive",
				slug: "ts-deep-dive",
				instructorName: "Vikram Shah",
				price: 129900,
				isPublished: false,
				createdAt: "2026-06-18T00:00:00.000Z",
			},
			{
				_id: "1",
				title: "React from Scratch",
				slug: "react-from-scratch",
				instructorName: "Asha Rai",
				price: 99900,
				isPublished: true,
				createdAt: "2026-06-20T00:00:00.000Z",
			},
		],
	},
	isLoading: false,
	isError: false,
	refetch: mockRefetchCourses,
};

const studentsResult = {
	data: { data: [{ _id: "1" }, { _id: "2" }, { _id: "3" }] },
	isLoading: false,
	isError: false,
	refetch: mockRefetchStudents,
};

// `total` (7) intentionally exceeds the 3 fetched items, so the Enrollments tile
// asserts on pagination.total rather than items.length. One item omits
// `amountPaid` to exercise the "treat missing as 0" path in the revenue sum.
const enrollmentsResult = {
	data: {
		data: {
			items: [
				{
					_id: "en1",
					userId: {
						_id: "u1",
						name: "Meera Krishnan",
						email: "meera@example.com",
					},
					courseId: { _id: "1", title: "React from Scratch" },
					amountPaid: 49900,
					currency: "INR",
					createdAt: "2026-06-25T00:00:00.000Z",
				},
				{
					_id: "en2",
					userId: {
						_id: "u2",
						name: "Arjun Reddy",
						email: "arjun@example.com",
					},
					courseId: { _id: "2", title: "TS Deep Dive" },
					amountPaid: 79900,
					currency: "INR",
					createdAt: "2026-06-22T00:00:00.000Z",
				},
				{
					_id: "en3",
					userId: {
						_id: "u3",
						name: "Nisha Rao",
						email: "nisha@example.com",
					},
					courseId: { _id: "3", title: "Node Basics" },
					createdAt: "2026-06-20T00:00:00.000Z",
				},
			],
			pagination: { page: 1, limit: 100, total: 7, totalPages: 1 },
		},
	},
	isLoading: false,
	isError: false,
	refetch: mockRefetchEnrollments,
};

const renderPage = () =>
	render(
		<MemoryRouter initialEntries={["/admin"]}>
			<Routes>
				<Route path="/admin" element={<OverviewPage />} />
				<Route path="/admin/courses" element={<div>Courses list page</div>} />
				<Route
					path="/admin/enrollments"
					element={<div>Enrollments page</div>}
				/>
			</Routes>
		</MemoryRouter>,
	);

describe("OverviewPage", () => {
	beforeEach(() => {
		vi.resetAllMocks();
		mockUseListCourses.mockReturnValue(coursesResult);
		mockUseListStudents.mockReturnValue(studentsResult);
		mockUseListEnrollments.mockReturnValue(enrollmentsResult);
	});

	it("shows derived student and course counts with the live/draft split", () => {
		renderPage();
		expect(screen.getByText("3")).toBeInTheDocument(); // students
		expect(screen.getByText("2")).toBeInTheDocument(); // courses
		expect(screen.getByText(/1 live · 1 draft/i)).toBeInTheDocument();
	});

	it("shows the enrollments total and revenue derived from the real API", () => {
		renderPage();
		// pagination.total, independent of the fetched page size
		expect(screen.getByText("7")).toBeInTheDocument();
		// 49900 + 79900 + 0 (missing) = 129800 paise → ₹1,298
		expect(screen.getByText("₹1,298")).toBeInTheDocument();
	});

	it("lists recently added courses, newest first", () => {
		renderPage();
		const coursesTable = screen.getByRole("table", {
			name: /recently added courses/i,
		});
		const rows = within(coursesTable).getAllByRole("row");
		// header row + 2 course rows
		expect(rows).toHaveLength(3);
		expect(rows[1]).toHaveTextContent("React from Scratch");
		expect(rows[2]).toHaveTextContent("TS Deep Dive");
	});

	it("lists real recent enrollments and drops the placeholder sample data", () => {
		renderPage();
		const enrollmentsTable = screen.getByRole("table", {
			name: /recent enrollments/i,
		});
		expect(
			within(enrollmentsTable).getByText("Meera Krishnan"),
		).toBeInTheDocument();
		expect(
			within(enrollmentsTable).getByText("meera@example.com"),
		).toBeInTheDocument();
		// The old hardcoded sample name must be gone.
		expect(screen.queryByText("Rahul Verma")).not.toBeInTheDocument();
	});

	it("shows an empty state when there are no enrollments", () => {
		mockUseListEnrollments.mockReturnValue({
			...enrollmentsResult,
			data: {
				data: {
					items: [],
					pagination: { page: 1, limit: 100, total: 0, totalPages: 1 },
				},
			},
		});
		renderPage();
		expect(screen.getByText("No enrollments yet.")).toBeInTheDocument();
	});

	it("navigates to the full courses list", async () => {
		const user = userEvent.setup();
		renderPage();
		await user.click(screen.getByRole("button", { name: /view all courses/i }));
		expect(screen.getByText("Courses list page")).toBeInTheDocument();
	});

	it("navigates to the full enrollments page", async () => {
		const user = userEvent.setup();
		renderPage();
		await user.click(
			screen.getByRole("button", { name: /view all enrollments/i }),
		);
		expect(screen.getByText("Enrollments page")).toBeInTheDocument();
	});

	it("shows the loader while data is loading", () => {
		mockUseListCourses.mockReturnValue({
			...coursesResult,
			data: undefined,
			isLoading: true,
		});
		renderPage();
		expect(screen.getByRole("status")).toBeInTheDocument();
	});

	it("shows the load-failed state and retries every query on click", async () => {
		const user = userEvent.setup();
		mockUseListCourses.mockReturnValue({
			...coursesResult,
			data: undefined,
			isError: true,
		});
		renderPage();

		expect(screen.getByRole("alert")).toBeInTheDocument();
		await user.click(screen.getByRole("button", { name: /try again/i }));
		expect(mockRefetchCourses).toHaveBeenCalledOnce();
		expect(mockRefetchStudents).toHaveBeenCalledOnce();
		expect(mockRefetchEnrollments).toHaveBeenCalledOnce();
	});
});
