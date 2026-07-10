//* test/pages/admin/StudentManagePage.test.tsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockUpdate = vi.fn();
const mockRefetch = vi.fn();
const mockUseGetStudent = vi.fn();

vi.mock("@/hooks/useStudents", () => ({
	useGetStudent: () => mockUseGetStudent(),
	useUpdateStudent: () => ({ mutate: mockUpdate, isPending: false }),
}));

vi.mock("sonner", () => ({
	toast: { success: vi.fn(), error: vi.fn() },
}));

import { toast } from "sonner";
import StudentManagePage from "@/pages/admin/StudentManagePage";

const activeStudent = {
	data: {
		data: {
			_id: "1",
			name: "Rahul Verma",
			email: "rahul@example.com",
			role: "student",
			isActive: true,
			createdAt: "2026-06-12T00:00:00.000Z",
			enrollments: [
				{
					courseId: "c1",
					course: "CSS Fundamentals",
					purchased: "2026-07-09T00:00:00.000Z",
					amount: 59900,
					progress: 50,
				},
				{
					courseId: "c2",
					course: "HTML Fundamentals",
					purchased: "2026-07-08T00:00:00.000Z",
					amount: 49900,
					progress: 100,
				},
			],
		},
	},
	isLoading: false,
	isError: false,
	refetch: mockRefetch,
};

const renderPage = (client = new QueryClient()) =>
	render(
		<QueryClientProvider client={client}>
			<MemoryRouter initialEntries={["/admin/students/1"]}>
				<Routes>
					<Route
						path="/admin/students/:id"
						element={<StudentManagePage />}
					/>
					<Route
						path="/admin/students"
						element={<div>Students list page</div>}
					/>
				</Routes>
			</MemoryRouter>
		</QueryClientProvider>,
	);

describe("StudentManagePage", () => {
	beforeEach(() => {
		vi.resetAllMocks();
		mockUseGetStudent.mockReturnValue(activeStudent);
	});

	it("shows the student identity", () => {
		renderPage();
		expect(
			screen.getByRole("heading", { name: "Rahul Verma" }),
		).toBeInTheDocument();
		expect(screen.getByText(/rahul@example\.com/)).toBeInTheDocument();
	});

	it("shows the enrollments section with the student's real enrollments", () => {
		renderPage();
		expect(
			screen.getByRole("heading", { name: /their enrollments/i }),
		).toBeInTheDocument();
		expect(screen.getByText("CSS Fundamentals")).toBeInTheDocument();
		expect(screen.getByText("HTML Fundamentals")).toBeInTheDocument();
		expect(screen.getByText("₹599")).toBeInTheDocument();
		expect(screen.queryByText("React from Scratch")).not.toBeInTheDocument();
	});

	it("promotes to admin: drops the cached detail, refreshes the list, toasts and returns to the list", async () => {
		const user = userEvent.setup();
		const client = new QueryClient();
		const removeQueries = vi.spyOn(client, "removeQueries");
		const invalidateQueries = vi.spyOn(client, "invalidateQueries");
		mockUpdate.mockImplementation((_vars, { onSuccess }) => onSuccess());
		renderPage(client);

		await user.click(screen.getByRole("button", { name: /promote to admin/i }));

		expect(mockUpdate).toHaveBeenCalledWith(
			{ id: "1", payload: { role: "admin" } },
			expect.any(Object),
		);
		expect(removeQueries).toHaveBeenCalledWith({ queryKey: ["students", "1"] });
		expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ["students"] });
		expect(vi.mocked(toast.success)).toHaveBeenCalledWith(
			"Rahul Verma promoted to admin",
		);
		expect(await screen.findByText("Students list page")).toBeInTheDocument();
	});

	it("deactivates the account after confirming", async () => {
		const user = userEvent.setup();
		renderPage();

		await user.click(
			screen.getByRole("button", { name: /deactivate account/i }),
		);
		await user.click(screen.getByRole("button", { name: /^deactivate$/i }));

		expect(mockUpdate).toHaveBeenCalledWith(
			{ id: "1", payload: { isActive: false } },
			expect.any(Object),
		);
	});

	it("reactivates a deactivated account", async () => {
		const user = userEvent.setup();
		mockUseGetStudent.mockReturnValue({
			...activeStudent,
			data: { data: { ...activeStudent.data.data, isActive: false } },
		});
		renderPage();

		await user.click(
			screen.getByRole("button", { name: /reactivate account/i }),
		);

		expect(mockUpdate).toHaveBeenCalledWith(
			{ id: "1", payload: { isActive: true } },
			expect.any(Object),
		);
	});

	it("shows the loader while the student is loading", () => {
		mockUseGetStudent.mockReturnValue({
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
		mockUseGetStudent.mockReturnValue({
			data: undefined,
			isLoading: false,
			isError: true,
			refetch: mockRefetch,
		});
		renderPage();

		expect(screen.getByRole("alert")).toBeInTheDocument();
		expect(
			screen.getByText(/couldn't load this student/i),
		).toBeInTheDocument();
		expect(
			screen.getByRole("link", { name: /back to students/i }),
		).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: /try again/i }));
		expect(mockRefetch).toHaveBeenCalledOnce();
	});

	it("invalidates both the list and the student detail, and toasts, after deactivating", async () => {
		const user = userEvent.setup();
		const client = new QueryClient();
		const invalidateQueries = vi.spyOn(client, "invalidateQueries");
		mockUpdate.mockImplementation((_vars, { onSuccess }) => onSuccess());
		renderPage(client);

		await user.click(
			screen.getByRole("button", { name: /deactivate account/i }),
		);
		await user.click(screen.getByRole("button", { name: /^deactivate$/i }));

		expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ["students"] });
		expect(invalidateQueries).toHaveBeenCalledWith({
			queryKey: ["students", "1"],
		});
		expect(vi.mocked(toast.success)).toHaveBeenCalledWith("Account deactivated");
	});

	it("surfaces the server error message when a deactivate fails", async () => {
		const user = userEvent.setup();
		mockUpdate.mockImplementation((_vars, { onError }) =>
			onError({ code: "STUDENT_NOT_FOUND", message: "Student not found" }),
		);
		renderPage();

		await user.click(
			screen.getByRole("button", { name: /deactivate account/i }),
		);
		await user.click(screen.getByRole("button", { name: /^deactivate$/i }));

		expect(vi.mocked(toast.error)).toHaveBeenCalledWith("Student not found");
	});
});
