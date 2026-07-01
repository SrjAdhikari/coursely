//* test/pages/CatalogPage.test.tsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";

const mockUseListPublishedCourses = vi.fn();
vi.mock("@/hooks/useCourses", () => ({
	useListPublishedCourses: () => mockUseListPublishedCourses(),
}));

import CatalogPage from "@/pages/CatalogPage";

const course = (id: string, title: string, instructorName: string) => ({
	_id: id,
	title,
	slug: title.toLowerCase().replace(/\s+/g, "-"),
	description: "desc",
	instructorName,
	thumbnailUrl: "https://img.test/x.png",
	price: 149900,
	currency: "INR",
	isPublished: true,
	createdAt: "2026-06-01T00:00:00.000Z",
});

const ok = (data: unknown[]) => ({
	data: { data },
	isLoading: false,
	isError: false,
	refetch: vi.fn(),
});

const renderPage = () =>
	render(
		<MemoryRouter>
			<CatalogPage />
		</MemoryRouter>,
	);

describe("CatalogPage", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockUseListPublishedCourses.mockReturnValue(
			ok([
				course("1", "React Basics", "Aarav"),
				course("2", "Node APIs", "Rohan"),
			]),
		);
	});

	it("renders a card per course", () => {
		renderPage();
		expect(screen.getByText("React Basics")).toBeInTheDocument();
		expect(screen.getByText("Node APIs")).toBeInTheDocument();
	});

	it("filters client-side by title/instructor", async () => {
		renderPage();
		await userEvent.type(screen.getByLabelText(/search courses/i), "node");
		expect(screen.queryByText("React Basics")).not.toBeInTheDocument();
		expect(screen.getByText("Node APIs")).toBeInTheDocument();
	});

	it("shows a no-results placeholder when nothing matches", async () => {
		renderPage();
		await userEvent.type(screen.getByLabelText(/search courses/i), "zzz");
		expect(screen.getByText(/no courses match/i)).toBeInTheDocument();
	});

	it("shows the empty state when there are no courses", () => {
		mockUseListPublishedCourses.mockReturnValue(ok([]));
		renderPage();
		expect(screen.getByText(/no courses yet/i)).toBeInTheDocument();
	});

	it("shows the loader while loading", () => {
		mockUseListPublishedCourses.mockReturnValue({
			data: undefined,
			isLoading: true,
			isError: false,
			refetch: vi.fn(),
		});
		renderPage();
		expect(screen.getByRole("status")).toBeInTheDocument();
	});

	it("shows the load-failed state on error", () => {
		mockUseListPublishedCourses.mockReturnValue({
			data: undefined,
			isLoading: false,
			isError: true,
			refetch: vi.fn(),
		});
		renderPage();
		expect(screen.getByRole("alert")).toBeInTheDocument();
		expect(screen.getByText(/couldn't load courses/i)).toBeInTheDocument();
	});
});
