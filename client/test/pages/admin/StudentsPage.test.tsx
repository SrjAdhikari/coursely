//* test/pages/admin/StudentsPage.test.tsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockRefetch = vi.fn();
const mockUseListStudents = vi.fn();

vi.mock("@/hooks/useStudents", () => ({
	useListStudents: () => mockUseListStudents(),
}));

import StudentsPage from "@/pages/admin/StudentsPage";

const successResult = {
	data: {
		data: [
			{
				_id: "1",
				name: "Rahul Verma",
				email: "rahul@example.com",
				role: "student",
				isActive: true,
				createdAt: "2026-06-12T00:00:00.000Z",
			},
			{
				_id: "2",
				name: "Karan Mehta",
				email: "karan@example.com",
				role: "student",
				isActive: false,
				createdAt: "2026-06-08T00:00:00.000Z",
			},
		],
	},
	isLoading: false,
	isError: false,
	refetch: mockRefetch,
};

const manyStudents = Array.from({ length: 12 }, (_unused, index) => ({
	_id: String(index + 1),
	name: `Student ${index + 1}`,
	email: `student${index + 1}@example.com`,
	role: "student",
	isActive: true,
	createdAt: "2026-06-01T00:00:00.000Z",
}));

const renderPage = (client = new QueryClient()) =>
	render(
		<QueryClientProvider client={client}>
			<MemoryRouter initialEntries={["/admin/students"]}>
				<Routes>
					<Route path="/admin/students" element={<StudentsPage />} />
					<Route
						path="/admin/students/:id"
						element={<div>Manage student page</div>}
					/>
				</Routes>
			</MemoryRouter>
		</QueryClientProvider>,
	);

describe("StudentsPage", () => {
	beforeEach(() => {
		vi.resetAllMocks();
		mockUseListStudents.mockReturnValue(successResult);
	});

	it("renders a row per student with status", () => {
		renderPage();
		expect(screen.getByText("Rahul Verma")).toBeInTheDocument();
		expect(screen.getByText("Karan Mehta")).toBeInTheDocument();
		expect(screen.getByText("Active")).toBeInTheDocument();
		expect(screen.getByText("Deactivated")).toBeInTheDocument();
	});

	it("renders the admin role badge for an admin user", () => {
		mockUseListStudents.mockReturnValue({
			data: {
				data: [
					{
						_id: "9",
						name: "Priya Nair",
						email: "priya@example.com",
						role: "admin",
						isActive: true,
						createdAt: "2026-06-01T00:00:00.000Z",
					},
				],
			},
			isLoading: false,
			isError: false,
			refetch: mockRefetch,
		});
		renderPage();
		expect(screen.getByText("Admin")).toBeInTheDocument();
	});

	it("filters the list by name", async () => {
		renderPage();
		await userEvent.type(
			screen.getByPlaceholderText(/search by name or email/i),
			"karan",
		);
		expect(screen.queryByText("Rahul Verma")).not.toBeInTheDocument();
		expect(screen.getByText("Karan Mehta")).toBeInTheDocument();
	});

	it("filters the list by email", async () => {
		renderPage();
		await userEvent.type(
			screen.getByPlaceholderText(/search by name or email/i),
			"rahul@example",
		);
		expect(screen.getByText("Rahul Verma")).toBeInTheDocument();
		expect(screen.queryByText("Karan Mehta")).not.toBeInTheDocument();
	});

	it("shows the loader while students are loading", () => {
		mockUseListStudents.mockReturnValue({
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
		mockUseListStudents.mockReturnValue({
			data: undefined,
			isLoading: false,
			isError: true,
			refetch: mockRefetch,
		});
		renderPage();

		expect(screen.getByRole("alert")).toBeInTheDocument();
		expect(screen.getByText(/couldn't load students/i)).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: /try again/i }));
		expect(mockRefetch).toHaveBeenCalledOnce();
	});

	it("shows the empty placeholder when there are no students", () => {
		mockUseListStudents.mockReturnValue({
			data: { data: [] },
			isLoading: false,
			isError: false,
			refetch: mockRefetch,
		});
		renderPage();
		expect(screen.getByText("No students yet")).toBeInTheDocument();
	});

	it("shows a no-results placeholder when the search matches nothing", async () => {
		renderPage();
		await userEvent.type(
			screen.getByPlaceholderText(/search by name or email/i),
			"zzz",
		);
		expect(screen.getByText("No matching students")).toBeInTheDocument();
	});

	it("paginates when there are more than a page of students", async () => {
		const user = userEvent.setup();
		mockUseListStudents.mockReturnValue({
			data: { data: manyStudents },
			isLoading: false,
			isError: false,
			refetch: mockRefetch,
		});
		renderPage();

		expect(screen.getByText("Student 1")).toBeInTheDocument();
		expect(screen.queryByText("Student 11")).not.toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: /go to page 2/i }));

		expect(screen.getByText("Student 11")).toBeInTheDocument();
		expect(screen.queryByText("Student 1")).not.toBeInTheDocument();
	});

	it("navigates to the manage page for the chosen student", async () => {
		const user = userEvent.setup();
		renderPage();

		await user.click(
			screen.getByRole("button", { name: /manage rahul verma/i }),
		);
		expect(screen.getByText("Manage student page")).toBeInTheDocument();
	});
});
