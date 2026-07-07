//* test/pages/admin/CourseFormPage.test.tsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route, useNavigate } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockCreate = vi.fn();
const mockUpdate = vi.fn();
const mockGetCourse = vi.fn();

vi.mock("@/hooks/useCourses", () => ({
	useCreateCourse: () => ({ mutate: mockCreate, isPending: false }),
	useUpdateCourse: () => ({ mutate: mockUpdate, isPending: false }),
	useGetCourse: (id: string) => mockGetCourse(id),
}));

vi.mock("sonner", () => ({
	toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@/hooks/useVideoUpload", () => ({
	useVideoUpload: () => ({
		status: "idle",
		progress: 0,
		fileName: "",
		error: null,
		start: vi.fn(),
		submitManualDuration: vi.fn(),
		cancel: vi.fn(),
		reset: vi.fn(),
	}),
}));

import { toast } from "sonner";
import CourseFormPage from "@/pages/admin/CourseFormPage";

const renderAt = (entry: string, client = new QueryClient()) =>
	render(
		<QueryClientProvider client={client}>
			<MemoryRouter initialEntries={[entry]}>
				<Routes>
					<Route path="/admin/courses/new" element={<CourseFormPage />} />
					<Route path="/admin/courses/:id/edit" element={<CourseFormPage />} />
					<Route path="/admin/courses" element={<div>courses list</div>} />
				</Routes>
			</MemoryRouter>
		</QueryClientProvider>,
	);

const fillCreateForm = async (user: ReturnType<typeof userEvent.setup>) => {
	await user.type(screen.getByLabelText(/title/i), "React from Scratch");
	await user.type(screen.getByLabelText(/description/i), "Hooks and state.");
	await user.type(screen.getByLabelText(/instructor/i), "Asha Rai");
	await user.type(
		screen.getByLabelText(/thumbnail/i),
		"https://cdn.coursely.app/r.png",
	);
	await user.type(screen.getByLabelText(/price/i), "999");
};

const loadedCourse = {
	data: {
		data: {
			_id: "c1",
			title: "Old Title",
			slug: "old-title",
			description: "Old description.",
			instructorName: "Asha Rai",
			thumbnailUrl: "https://cdn.coursely.app/o.png",
			price: 49900,
			currency: "INR",
			isPublished: true,
			category: "Frontend",
			learningOutcomes: ["Understand JSX", "Use hooks"],
			createdAt: "",
			updatedAt: "",
		},
	},
	isLoading: false,
	isError: false,
	refetch: vi.fn(),
};

describe("CourseFormPage (create)", () => {
	beforeEach(() => {
		vi.resetAllMocks();
		mockGetCourse.mockReturnValue({
			data: undefined,
			isLoading: false,
			isError: false,
			refetch: vi.fn(),
		});
	});

	it("previews the slug derived from the title", async () => {
		const user = userEvent.setup();
		renderAt("/admin/courses/new");
		await user.type(screen.getByLabelText(/title/i), "React From Scratch!");
		expect(screen.getByText(/react-from-scratch/i)).toBeInTheDocument();
	});

	it("disables the submit until the form is valid", async () => {
		const user = userEvent.setup();
		renderAt("/admin/courses/new");
		expect(
			screen.getByRole("button", { name: /create course/i }),
		).toBeDisabled();

		await fillCreateForm(user);
		expect(
			screen.getByRole("button", { name: /create course/i }),
		).toBeEnabled();
	});

	it("submits a create payload in paise without slug or currency", async () => {
		const user = userEvent.setup();
		renderAt("/admin/courses/new");
		await fillCreateForm(user);
		await user.click(screen.getByRole("button", { name: /create course/i }));

		await waitFor(() =>
			expect(mockCreate).toHaveBeenCalledWith(
				expect.objectContaining({
					title: "React from Scratch",
					price: 99900,
					isPublished: false,
				}),
				expect.any(Object),
			),
		);
		const payload = mockCreate.mock.calls[0][0];
		expect(payload).not.toHaveProperty("slug");
		expect(payload).not.toHaveProperty("currency");
	});

	it("submits category and parsed learning outcomes in the create payload", async () => {
		const user = userEvent.setup();
		renderAt("/admin/courses/new");
		await fillCreateForm(user);
		await user.type(screen.getByLabelText(/category/i), "Web Development");
		await user.type(
			screen.getByLabelText(/learning outcomes/i),
			"Build components{enter}Manage state",
		);
		await user.click(screen.getByRole("button", { name: /create course/i }));

		await waitFor(() =>
			expect(mockCreate).toHaveBeenCalledWith(
				expect.objectContaining({
					category: "Web Development",
					learningOutcomes: ["Build components", "Manage state"],
				}),
				expect.any(Object),
			),
		);
	});

	it("always sends a learningOutcomes array (empty) and omits an empty category", async () => {
		const user = userEvent.setup();
		renderAt("/admin/courses/new");
		await fillCreateForm(user);
		await user.click(screen.getByRole("button", { name: /create course/i }));

		await waitFor(() => expect(mockCreate).toHaveBeenCalled());
		const payload = mockCreate.mock.calls[0][0];
		expect(payload.learningOutcomes).toEqual([]);
		expect(payload).not.toHaveProperty("category");
	});

	it("invalidates the courses list and toasts on a successful create", async () => {
		const user = userEvent.setup();
		const client = new QueryClient();
		const invalidate = vi.spyOn(client, "invalidateQueries");
		mockCreate.mockImplementation((_payload, { onSuccess }) =>
			onSuccess({ data: { _id: "new1" } }),
		);
		renderAt("/admin/courses/new", client);
		await fillCreateForm(user);
		await user.click(screen.getByRole("button", { name: /create course/i }));

		await waitFor(() =>
			expect(invalidate).toHaveBeenCalledWith({ queryKey: ["courses"] }),
		);
		expect(vi.mocked(toast.success)).toHaveBeenCalledWith("Course created");
	});
});

describe("CourseFormPage (edit)", () => {
	beforeEach(() => {
		vi.resetAllMocks();
		mockGetCourse.mockReturnValue(loadedCourse);
	});

	it("shows a loader while the course is loading", () => {
		mockGetCourse.mockReturnValue({
			data: undefined,
			isLoading: true,
			isError: false,
			refetch: vi.fn(),
		});
		renderAt("/admin/courses/c1/edit");
		expect(screen.getByRole("status")).toBeInTheDocument();
	});

	it("shows an error state when the course fails to load", () => {
		mockGetCourse.mockReturnValue({
			data: undefined,
			isLoading: false,
			isError: true,
			refetch: vi.fn(),
		});
		renderAt("/admin/courses/c1/edit");
		expect(screen.getByRole("alert")).toBeInTheDocument();
		expect(screen.getByText(/couldn't load this course/i)).toBeInTheDocument();
		expect(
			screen.getByRole("link", { name: /back to courses/i }),
		).toBeInTheDocument();
	});

	it("prefills the loaded course and submits an update payload in paise", async () => {
		const user = userEvent.setup();
		renderAt("/admin/courses/c1/edit");

		expect(await screen.findByDisplayValue("Old Title")).toBeInTheDocument();

		const price = screen.getByLabelText(/price/i);
		await user.clear(price);
		await user.type(price, "599");
		await user.click(screen.getByRole("button", { name: /save changes/i }));

		await waitFor(() =>
			expect(mockUpdate).toHaveBeenCalledWith(
				{
					id: "c1",
					payload: expect.objectContaining({
						title: "Old Title",
						price: 59900,
					}),
				},
				expect.any(Object),
			),
		);
	});

	it("prefills category and learning outcomes in edit mode", async () => {
		renderAt("/admin/courses/c1/edit");

		expect(await screen.findByDisplayValue("Frontend")).toBeInTheDocument();
		// The outcomes textarea joins the array one-per-line; assert its exact
		// value (getByDisplayValue would collapse the newline via normalization).
		expect(screen.getByLabelText(/learning outcomes/i)).toHaveValue(
			"Understand JSX\nUse hooks",
		);
	});

	it("clears learning outcomes to an empty array on update", async () => {
		const user = userEvent.setup();
		renderAt("/admin/courses/c1/edit");

		const outcomes = await screen.findByLabelText(/learning outcomes/i);
		await user.clear(outcomes);
		await user.click(screen.getByRole("button", { name: /save changes/i }));

		await waitFor(() => expect(mockUpdate).toHaveBeenCalled());
		const { payload } = mockUpdate.mock.calls[0][0];
		expect(payload.learningOutcomes).toEqual([]);
	});

	it("invalidates the course detail and list and toasts on a successful update", async () => {
		const user = userEvent.setup();
		const client = new QueryClient();
		const invalidate = vi.spyOn(client, "invalidateQueries");
		mockUpdate.mockImplementation((_args, { onSuccess }) => onSuccess());
		renderAt("/admin/courses/c1/edit", client);

		await screen.findByDisplayValue("Old Title");
		await user.click(screen.getByRole("button", { name: /save changes/i }));

		await waitFor(() =>
			expect(invalidate).toHaveBeenCalledWith({ queryKey: ["courses", "c1"] }),
		);
		expect(invalidate).toHaveBeenCalledWith({ queryKey: ["courses"] });
		expect(vi.mocked(toast.success)).toHaveBeenCalledWith("Course updated");
	});

	it("re-prefills when navigating between two course edit routes", async () => {
		const user = userEvent.setup();
		const result = (id: string, title: string) => ({
			data: { data: { ...loadedCourse.data.data, _id: id, title } },
			isLoading: false,
			isError: false,
			refetch: vi.fn(),
		});
		mockGetCourse.mockImplementation((id: string) =>
			id === "a" ? result("a", "Course A") : result("b", "Course B"),
		);

		const Harness = () => {
			const navigate = useNavigate();
			return (
				<>
					<button
						type="button"
						onClick={() => navigate("/admin/courses/b/edit")}
					>
						go b
					</button>
					<Routes>
						<Route
							path="/admin/courses/:id/edit"
							element={<CourseFormPage />}
						/>
					</Routes>
				</>
			);
		};

		render(
			<QueryClientProvider client={new QueryClient()}>
				<MemoryRouter initialEntries={["/admin/courses/a/edit"]}>
					<Harness />
				</MemoryRouter>
			</QueryClientProvider>,
		);

		expect(await screen.findByDisplayValue("Course A")).toBeInTheDocument();
		await user.click(screen.getByRole("button", { name: /go b/i }));
		expect(await screen.findByDisplayValue("Course B")).toBeInTheDocument();
	});

	it("shows the trailer upload field in edit mode", async () => {
		renderAt("/admin/courses/c1/edit");
		expect(await screen.findByLabelText(/upload trailer/i)).toBeInTheDocument();
	});
});
