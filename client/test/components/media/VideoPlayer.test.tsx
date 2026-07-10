//* test/components/media/VideoPlayer.test.tsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const mockUsePlayback = vi.fn();
vi.mock("@/hooks/useMedia", () => ({
	useLessonPlaybackUrl: (lessonId: string) => mockUsePlayback(lessonId),
}));

import VideoPlayer from "@/components/media/VideoPlayer";

describe("VideoPlayer", () => {
	beforeEach(() => vi.clearAllMocks());

	it("shows a loader while fetching", () => {
		mockUsePlayback.mockReturnValue({ isLoading: true });
		render(<VideoPlayer lessonId="l1" />);
		expect(screen.getByRole("status")).toBeInTheDocument();
	});

	it("renders a <video> with the signed src on success", () => {
		mockUsePlayback.mockReturnValue({
			isLoading: false,
			isError: false,
			data: { data: { url: "https://r2/get?sig=1" } },
		});
		const { container } = render(<VideoPlayer lessonId="l1" />);
		const video = container.querySelector("video");
		expect(video).toBeTruthy();
		expect(video).toHaveAttribute("src", "https://r2/get?sig=1");
	});

	it("shows a friendly message when there is no video", () => {
		mockUsePlayback.mockReturnValue({
			isLoading: false,
			isError: true,
			error: { code: "VIDEO_NOT_FOUND", message: "no video" },
		});
		render(<VideoPlayer lessonId="l1" />);
		expect(screen.getByText(/no video yet/i)).toBeInTheDocument();
		// A missing video is not retryable, so there is no retry affordance.
		expect(
			screen.queryByRole("button", { name: /try again/i }),
		).not.toBeInTheDocument();
	});

	it("offers a retry that refetches on a retryable load error", () => {
		const refetch = vi.fn();
		mockUsePlayback.mockReturnValue({
			isLoading: false,
			isError: true,
			error: { code: "PLAYBACK_URL_FAILED", message: "boom" },
			refetch,
			data: undefined,
		});
		render(<VideoPlayer lessonId="l1" />);

		fireEvent.click(screen.getByRole("button", { name: /try again/i }));

		expect(refetch).toHaveBeenCalledTimes(1);
	});
});
