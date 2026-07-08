//* test/components/course/CourseTrailerMedia.test.tsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockUseTrailer = vi.fn();
vi.mock("@/hooks/useMedia", () => ({
	useCourseTrailerUrl: (slug: string, enabled: boolean) =>
		mockUseTrailer(slug, enabled),
}));

import CourseTrailerMedia from "@/components/course/CourseTrailerMedia";

const props = {
	thumbnailUrl: "https://cdn/thumb.jpg",
	slug: "react",
	title: "Mastering React",
};

describe("CourseTrailerMedia", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockUseTrailer.mockReturnValue({
			isLoading: false,
			isFetching: false,
			isError: false,
			data: undefined,
			refetch: vi.fn(),
		});
	});

	it("always renders the thumbnail as the poster (no trailer)", () => {
		render(<CourseTrailerMedia {...props} hasTrailer={false} />);
		const poster = screen.getByAltText("Mastering React");
		expect(poster).toHaveAttribute("src", "https://cdn/thumb.jpg");
	});

	it("always renders the thumbnail as the poster (with trailer)", () => {
		render(<CourseTrailerMedia {...props} hasTrailer />);
		expect(screen.getByAltText("Mastering React")).toHaveAttribute(
			"src",
			"https://cdn/thumb.jpg",
		);
	});

	it("shows no play control when there is no trailer", () => {
		render(<CourseTrailerMedia {...props} hasTrailer={false} />);
		expect(
			screen.queryByRole("button", { name: /play trailer/i }),
		).not.toBeInTheDocument();
	});

	it("shows the play control when a trailer exists", () => {
		render(<CourseTrailerMedia {...props} hasTrailer />);
		expect(
			screen.getByRole("button", { name: /play trailer/i }),
		).toBeInTheDocument();
	});

	it("opens the trailer in a dialog when the play control is clicked", async () => {
		mockUseTrailer.mockReturnValue({
			isLoading: false,
			isFetching: false,
			isError: false,
			data: { data: { url: "https://r2/trailer?sig=1" } },
			refetch: vi.fn(),
		});
		render(<CourseTrailerMedia {...props} hasTrailer />);

		// Lazy contract: the URL query stays disabled until the dialog opens, so
		// no signed URL is minted for the majority of visitors who never watch.
		expect(mockUseTrailer).toHaveBeenLastCalledWith("react", false);
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

		await userEvent.click(
			screen.getByRole("button", { name: /play trailer/i }),
		);

		expect(mockUseTrailer).toHaveBeenLastCalledWith("react", true);

		const dialog = screen.getByRole("dialog");
		const video = dialog.querySelector("video");
		expect(video).toBeTruthy();
		expect(video).toHaveAttribute("src", "https://r2/trailer?sig=1");
	});

	it("shows a loader in the dialog while the trailer URL is fetching", async () => {
		mockUseTrailer.mockReturnValue({
			isLoading: true,
			isFetching: true,
			isError: false,
			refetch: vi.fn(),
		});
		render(<CourseTrailerMedia {...props} hasTrailer />);
		await userEvent.click(
			screen.getByRole("button", { name: /play trailer/i }),
		);
		expect(screen.getByRole("status")).toBeInTheDocument();
	});

	it("shows a loader (not the previous URL) while re-minting a fresh URL on reopen", async () => {
		// Reopen: the observer never unmounted, so a stale signed URL is still
		// cached while the forced refetch is in flight. It must not reach <video>.
		mockUseTrailer.mockReturnValue({
			isLoading: false,
			isFetching: true,
			isError: false,
			data: { data: { url: "https://r2/stale?sig=expired" } },
			refetch: vi.fn(),
		});
		render(<CourseTrailerMedia {...props} hasTrailer />);
		await userEvent.click(
			screen.getByRole("button", { name: /play trailer/i }),
		);
		expect(screen.getByRole("status")).toBeInTheDocument();
		expect(screen.getByRole("dialog").querySelector("video")).toBeNull();
	});

	it("shows a fallback in the dialog when the trailer URL fails", async () => {
		mockUseTrailer.mockReturnValue({
			isLoading: false,
			isFetching: false,
			isError: true,
			refetch: vi.fn(),
		});
		render(<CourseTrailerMedia {...props} hasTrailer />);
		await userEvent.click(
			screen.getByRole("button", { name: /play trailer/i }),
		);
		expect(screen.getByText(/couldn't load the trailer/i)).toBeInTheDocument();
	});

	it("retries fetching the trailer when Try again is clicked", async () => {
		const refetch = vi.fn();
		mockUseTrailer.mockReturnValue({
			isLoading: false,
			isFetching: false,
			isError: true,
			refetch,
		});
		render(<CourseTrailerMedia {...props} hasTrailer />);
		await userEvent.click(
			screen.getByRole("button", { name: /play trailer/i }),
		);
		await userEvent.click(screen.getByRole("button", { name: /try again/i }));
		expect(refetch).toHaveBeenCalled();
	});
});
