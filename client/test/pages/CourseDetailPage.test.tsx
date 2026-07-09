//* test/pages/CourseDetailPage.test.tsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockUseGetCourseBySlug = vi.fn();
const mockUseCurrentUser = vi.fn();
const mockUseMyEnrollments = vi.fn();
const mockMutate = vi.fn();
// vi.hoisted so the (hoisted) navigation mock factory can reference the spy
// eagerly without hitting its temporal dead zone.
const { mockRedirectTo } = vi.hoisted(() => ({ mockRedirectTo: vi.fn() }));

vi.mock("@/hooks/useCourses", () => ({
	useGetCourseBySlug: () => mockUseGetCourseBySlug(),
}));
vi.mock("@/hooks/useAuth", () => ({
	useCurrentUser: () => mockUseCurrentUser(),
}));
vi.mock("@/hooks/useEnrollments", () => ({
	useMyEnrollments: () => mockUseMyEnrollments(),
}));
vi.mock("@/hooks/usePayments", () => ({
	useCreateCheckout: () => ({ mutate: mockMutate, isPending: false }),
}));
vi.mock("@/lib/navigation", () => ({ redirectTo: mockRedirectTo }));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

import CourseDetailPage from "@/pages/CourseDetailPage";
import { toast } from "sonner";

const courseData = {
	_id: "c1",
	title: "React Basics",
	slug: "react-basics",
	description: "Learn React",
	instructorName: "Aarav",
	thumbnailUrl: "https://img.test/x.png",
	price: 149900,
	currency: "INR",
	isPublished: true,
	createdAt: "2026-06-01T00:00:00.000Z",
	category: "Frontend",
	lessonCount: 1,
	totalDuration: 300,
	learningOutcomes: ["Build components", "Manage state"],
	sections: [
		{
			_id: "s1",
			courseId: "c1",
			title: "Intro",
			order: 0,
			lessons: [
				{
					_id: "l1",
					sectionId: "s1",
					courseId: "c1",
					title: "Welcome",
					order: 0,
					isPreview: true,
					duration: 300,
				},
			],
		},
	],
};

const okCourse = {
	data: { data: courseData },
	isLoading: false,
	isError: false,
	refetch: vi.fn(),
};

const renderPage = () =>
	render(
		<QueryClientProvider client={new QueryClient()}>
			<MemoryRouter initialEntries={["/courses/react-basics"]}>
				<Routes>
					<Route path="/courses/:slug" element={<CourseDetailPage />} />
				</Routes>
			</MemoryRouter>
		</QueryClientProvider>,
	);

describe("CourseDetailPage", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockUseGetCourseBySlug.mockReturnValue(okCourse);
		mockUseCurrentUser.mockReturnValue({ data: undefined });
		mockUseMyEnrollments.mockReturnValue({ data: undefined });
	});

	it("renders the title and curriculum", () => {
		renderPage();
		expect(
			screen.getByRole("heading", { name: "React Basics" }),
		).toBeInTheDocument();
		expect(screen.getByText("Welcome")).toBeInTheDocument();
	});

	it("guest sees a login-to-enroll CTA", () => {
		renderPage();
		expect(
			screen.getByRole("link", { name: /log in to enroll/i }),
		).toBeInTheDocument();
	});

	it("logged-in & not enrolled: Buy starts checkout and redirects on success", async () => {
		mockUseCurrentUser.mockReturnValue({
			data: { data: { name: "S", role: "student" } },
		});
		mockUseMyEnrollments.mockReturnValue({ data: { data: [] } });
		mockMutate.mockImplementation((_id, opts) =>
			opts.onSuccess({ data: { url: "https://stripe.test/go" } }),
		);
		renderPage();
		await userEvent.click(
			screen.getByRole("button", { name: /buy this course/i }),
		);
		expect(mockMutate).toHaveBeenCalledWith("c1", expect.any(Object));
		expect(mockRedirectTo).toHaveBeenCalledWith("https://stripe.test/go");
	});

	it("shows an error when checkout returns no redirect URL", async () => {
		mockUseCurrentUser.mockReturnValue({
			data: { data: { name: "S", role: "student" } },
		});
		mockUseMyEnrollments.mockReturnValue({ data: { data: [] } });
		mockMutate.mockImplementation((_id, opts) =>
			opts.onSuccess({ data: { url: null } }),
		);
		renderPage();
		await userEvent.click(
			screen.getByRole("button", { name: /buy this course/i }),
		);
		expect(mockRedirectTo).not.toHaveBeenCalled();
		expect(vi.mocked(toast.error)).toHaveBeenCalled();
	});

	it("disables Buy while ownership is still loading", () => {
		mockUseCurrentUser.mockReturnValue({
			data: { data: { name: "S", role: "student" } },
		});
		mockUseMyEnrollments.mockReturnValue({ data: undefined, isLoading: true });
		renderPage();
		expect(
			screen.getByRole("button", { name: /buy this course/i }),
		).toBeDisabled();
	});

	it("already enrolled: shows ownership", () => {
		mockUseCurrentUser.mockReturnValue({
			data: { data: { name: "S", role: "student" } },
		});
		mockUseMyEnrollments.mockReturnValue({
			data: { data: [{ _id: "e1", courseId: { _id: "c1" }, createdAt: "x" }] },
		});
		renderPage();
		expect(screen.getByText(/enrolled · full access/i)).toBeInTheDocument();
	});

	it("renders the What you'll learn outcomes", () => {
		renderPage();
		expect(screen.getByText(/what you'll learn/i)).toBeInTheDocument();
		expect(screen.getByText("Build components")).toBeInTheDocument();
		expect(screen.getByText("Manage state")).toBeInTheDocument();
	});

	it("links a Watch free preview entry to the preview route", () => {
		renderPage();
		expect(
			screen.getByRole("link", { name: /watch free preview/i }),
		).toHaveAttribute("href", "/courses/react-basics/preview/l1");
	});

	it("hides the runtime line when the total duration is 0", () => {
		mockUseGetCourseBySlug.mockReturnValue({
			data: {
				data: {
					...courseData,
					totalDuration: 0,
					sections: [
						{
							...courseData.sections[0],
							lessons: [
								{ ...courseData.sections[0].lessons[0], duration: 0 },
							],
						},
					],
				},
			},
			isLoading: false,
			isError: false,
			refetch: vi.fn(),
		});
		renderPage();
		expect(screen.queryByText(/of content/i)).not.toBeInTheDocument();
	});

	it("shows singular section/lesson labels when there is exactly one of each", () => {
		renderPage();
		expect(screen.getByText("1 section · 1 lesson")).toBeInTheDocument();
	});

	it("shows plural section/lesson labels when there is more than one of each", () => {
		mockUseGetCourseBySlug.mockReturnValue({
			data: {
				data: {
					...courseData,
					sections: [
						courseData.sections[0],
						{
							...courseData.sections[0],
							_id: "s2",
							title: "Advanced",
							lessons: [
								{ ...courseData.sections[0].lessons[0], _id: "l2", sectionId: "s2" },
							],
						},
					],
				},
			},
			isLoading: false,
			isError: false,
			refetch: vi.fn(),
		});
		renderPage();
		expect(screen.getByText("2 sections · 2 lessons")).toBeInTheDocument();
	});

	it("shows not-found on error", () => {
		mockUseGetCourseBySlug.mockReturnValue({
			data: undefined,
			isLoading: false,
			isError: true,
			refetch: vi.fn(),
		});
		renderPage();
		expect(screen.getByText(/course not found/i)).toBeInTheDocument();
	});
});
