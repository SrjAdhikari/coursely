//* test/pages/admin/CurriculumPage.test.tsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockGetCourse = vi.fn();
const mockCreateSection = vi.fn();
const mockCreateLesson = vi.fn();
const mockDeleteSection = vi.fn();
const mockDeleteLesson = vi.fn();

vi.mock("@/hooks/useCourses", () => ({
	useGetCourse: (id: string) => mockGetCourse(id),
}));

vi.mock("@/hooks/useCurriculum", () => ({
	useCreateSection: () => ({ mutate: mockCreateSection, isPending: false }),
	useUpdateSection: () => ({ mutate: vi.fn(), isPending: false }),
	useDeleteSection: () => ({ mutate: mockDeleteSection, isPending: false }),
	useCreateLesson: () => ({ mutate: mockCreateLesson, isPending: false }),
	useUpdateLesson: () => ({ mutate: vi.fn(), isPending: false }),
	useDeleteLesson: () => ({ mutate: mockDeleteLesson, isPending: false }),
}));

vi.mock("sonner", () => ({
	toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@/hooks/useCourseTrailerUpload", () => ({
	default: () => ({
		status: "idle",
		progress: 0,
		fileName: "",
		totalBytes: 0,
		error: null,
		start: vi.fn(),
		submitManualDuration: vi.fn(),
		cancel: vi.fn(),
		reset: vi.fn(),
	}),
}));

import { toast } from "sonner";
import CurriculumPage from "@/pages/admin/CurriculumPage";

const loaded = {
	data: {
		data: {
			_id: "c1",
			title: "React from Scratch",
			sections: [
				{
					_id: "s1",
					courseId: "c1",
					title: "Getting Started",
					order: 0,
					lessons: [
						{
							_id: "l1",
							sectionId: "s1",
							courseId: "c1",
							title: "Welcome",
							order: 0,
							isPreview: true,
							duration: 252,
							videoKey: "lessons/x/source.mp4",
						},
					],
				},
			],
		},
	},
	isLoading: false,
	isError: false,
	refetch: vi.fn(),
};

const renderPage = (client = new QueryClient()) =>
	render(
		<QueryClientProvider client={client}>
			<MemoryRouter initialEntries={["/admin/courses/c1/curriculum"]}>
				<Routes>
					<Route
						path="/admin/courses/:id/curriculum"
						element={<CurriculumPage />}
					/>
				</Routes>
			</MemoryRouter>
		</QueryClientProvider>,
	);

describe("CurriculumPage", () => {
	beforeEach(() => {
		vi.resetAllMocks();
		mockGetCourse.mockReturnValue(loaded);
	});

	it("renders sections and their lessons", () => {
		renderPage();
		expect(screen.getByText("Getting Started")).toBeInTheDocument();
		expect(screen.getByText("Welcome")).toBeInTheDocument();
		expect(screen.getByText("Preview")).toBeInTheDocument();
	});

	it("renders the course trailer upload control", () => {
		renderPage();
		expect(screen.getByLabelText(/upload trailer/i)).toBeInTheDocument();
	});

	it("opens the add-section dialog and submits a new section", async () => {
		const user = userEvent.setup();
		renderPage();
		await user.click(screen.getByRole("button", { name: /^add section$/i }));
		const dialog = screen.getByRole("dialog");
		await user.type(
			within(dialog).getByLabelText(/section title/i),
			"State & Hooks",
		);
		await user.click(
			within(dialog).getByRole("button", { name: /^add section$/i }),
		);
		await waitFor(() =>
			expect(mockCreateSection).toHaveBeenCalledWith(
				expect.objectContaining({
					courseId: "c1",
					payload: expect.objectContaining({ title: "State & Hooks" }),
				}),
				expect.any(Object),
			),
		);
	});

	it("opens the add-lesson dialog for a section and submits a new lesson", async () => {
		const user = userEvent.setup();
		renderPage();
		await user.click(screen.getByRole("button", { name: /^add lesson$/i }));
		const dialog = screen.getByRole("dialog");
		await user.type(
			within(dialog).getByLabelText(/lesson title/i),
			"Hooks intro",
		);
		await user.click(
			within(dialog).getByRole("button", { name: /^add lesson$/i }),
		);
		await waitFor(() =>
			expect(mockCreateLesson).toHaveBeenCalledWith(
				expect.objectContaining({
					sectionId: "s1",
					payload: expect.objectContaining({ title: "Hooks intro" }),
				}),
				expect.any(Object),
			),
		);
	});

	it("confirms then deletes a section", async () => {
		const user = userEvent.setup();
		renderPage();
		await user.click(
			screen.getByRole("button", { name: /delete section getting started/i }),
		);
		expect(await screen.findByText(/delete section\?/i)).toBeInTheDocument();
		await user.click(screen.getByRole("button", { name: /^delete$/i }));
		expect(mockDeleteSection).toHaveBeenCalledWith("s1", expect.any(Object));
	});

	it("toasts the server error when a delete fails", async () => {
		const user = userEvent.setup();
		mockDeleteSection.mockImplementation((_id, { onError }) =>
			onError(new Error("Section not found")),
		);
		renderPage();
		await user.click(
			screen.getByRole("button", { name: /delete section getting started/i }),
		);
		await user.click(screen.getByRole("button", { name: /^delete$/i }));
		expect(vi.mocked(toast.error)).toHaveBeenCalledWith("Section not found");
	});

	it("shows the loader while the curriculum is loading", () => {
		mockGetCourse.mockReturnValue({
			data: undefined,
			isLoading: true,
			isError: false,
			refetch: vi.fn(),
		});
		renderPage();
		expect(screen.getByRole("status")).toBeInTheDocument();
	});

	it("marks lessons that already have a video", () => {
		renderPage();
		expect(screen.getByLabelText(/has video/i)).toBeInTheDocument();
	});

	it("shows singular section/lesson counts in the summary and section header", () => {
		renderPage();
		expect(screen.getByText("1 section · 1 lesson")).toBeInTheDocument();
		expect(screen.getByText("1 lesson")).toBeInTheDocument();
	});

	it("shows the load-failed state when the course fails to load", () => {
		mockGetCourse.mockReturnValue({
			data: undefined,
			isLoading: false,
			isError: true,
			refetch: vi.fn(),
		});
		renderPage();
		expect(screen.getByRole("alert")).toBeInTheDocument();
		expect(screen.getByText(/couldn't load this course/i)).toBeInTheDocument();
		expect(
			screen.getByRole("link", { name: /back to courses/i }),
		).toBeInTheDocument();
	});
});
