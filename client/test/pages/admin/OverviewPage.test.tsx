//* test/pages/admin/OverviewPage.test.tsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router";

const mockRefetchCourses = vi.fn();
const mockRefetchStudents = vi.fn();
const mockUseListCourses = vi.fn();
const mockUseListStudents = vi.fn();

vi.mock("@/hooks/useCourses", () => ({
	useListCourses: () => mockUseListCourses(),
}));
vi.mock("@/hooks/useStudents", () => ({
	useListStudents: () => mockUseListStudents(),
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
	});

	it("shows derived student and course counts with the live/draft split", () => {
		renderPage();
		expect(screen.getByText("3")).toBeInTheDocument(); // students
		expect(screen.getByText("2")).toBeInTheDocument(); // courses
		expect(screen.getByText(/1 live · 1 draft/i)).toBeInTheDocument();
	});

	it("shows the enrollments count and revenue derived from enrollment data", () => {
		renderPage();
		expect(screen.getByText("5")).toBeInTheDocument(); // enrollments count
		expect(screen.getByText("₹4,395")).toBeInTheDocument(); // summed revenue
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

	it("lists recent enrollments", () => {
		renderPage();
		const enrollmentsTable = screen.getByRole("table", {
			name: /recent enrollments/i,
		});
		expect(
			within(enrollmentsTable).getByText("Rahul Verma"),
		).toBeInTheDocument();
		// header row + at least one enrollment row
		expect(
			within(enrollmentsTable).getAllByRole("row").length,
		).toBeGreaterThan(1);
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

	it("shows the load-failed state and retries both queries on click", async () => {
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
	});
});
