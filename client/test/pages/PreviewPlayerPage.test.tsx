//* test/pages/PreviewPlayerPage.test.tsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router";

const mockUseGetCourseBySlug = vi.fn();
const mockUseCurrentUser = vi.fn();
const mockUsePlayback = vi.fn();

vi.mock("@/hooks/useCourses", () => ({
	useGetCourseBySlug: () => mockUseGetCourseBySlug(),
}));
vi.mock("@/hooks/useAuth", () => ({
	useCurrentUser: () => mockUseCurrentUser(),
}));
vi.mock("@/hooks/useMedia", () => ({
	useLessonPlaybackUrl: (lessonId: string) => mockUsePlayback(lessonId),
}));

import PreviewPlayerPage from "@/pages/PreviewPlayerPage";

const courseWith = (isPreview: boolean) => ({
	data: {
		data: {
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
			learningOutcomes: [],
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
							isPreview,
							duration: 300,
						},
					],
				},
			],
		},
	},
	isLoading: false,
	isError: false,
	refetch: vi.fn(),
});

const renderAt = (path: string) =>
	render(
		<MemoryRouter initialEntries={[path]}>
			<Routes>
				<Route
					path="/courses/:slug/preview/:lessonId"
					element={<PreviewPlayerPage />}
				/>
				<Route path="/courses/:slug" element={<p>course detail page</p>} />
			</Routes>
		</MemoryRouter>,
	);

describe("PreviewPlayerPage", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockUseCurrentUser.mockReturnValue({ data: undefined });
		mockUsePlayback.mockReturnValue({
			isLoading: false,
			isError: false,
			data: { data: { url: "https://r2/preview.mp4" } },
		});
	});

	it("mounts the player and shows the enroll banner for a preview lesson", () => {
		mockUseGetCourseBySlug.mockReturnValue(courseWith(true));
		const { container } = renderAt("/courses/react-basics/preview/l1");

		expect(container.querySelector("video")).toHaveAttribute(
			"src",
			"https://r2/preview.mp4",
		);
		expect(
			screen.getByText(/enroll for lifetime access/i),
		).toBeInTheDocument();
	});

	it("sends a guest's Enroll CTA to signup with a redirect back to the course", () => {
		mockUseGetCourseBySlug.mockReturnValue(courseWith(true));
		renderAt("/courses/react-basics/preview/l1");
		expect(screen.getByRole("link", { name: /enroll now/i })).toHaveAttribute(
			"href",
			"/signup?redirect=%2Fcourses%2Freact-basics",
		);
	});

	it("redirects a non-preview lesson to the course detail page", () => {
		mockUseGetCourseBySlug.mockReturnValue(courseWith(false));
		renderAt("/courses/react-basics/preview/l1");
		expect(screen.getByText("course detail page")).toBeInTheDocument();
		expect(
			screen.queryByText(/enroll for lifetime access/i),
		).not.toBeInTheDocument();
	});

	it("redirects an unknown lesson id to the course detail page", () => {
		mockUseGetCourseBySlug.mockReturnValue(courseWith(true));
		renderAt("/courses/react-basics/preview/does-not-exist");
		expect(screen.getByText("course detail page")).toBeInTheDocument();
	});
});
