//* test/components/media/VideoSurface.test.tsx

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";

import VideoSurface from "@/components/media/VideoSurface";

// Define a media property jsdom doesn't back, then let the caller dispatch the
// event that makes the hook read it.
const setMediaProp = (element: HTMLElement, name: string, value: unknown) =>
	Object.defineProperty(element, name, { configurable: true, value });

const getVideo = (container: HTMLElement) =>
	container.querySelector("video") as HTMLVideoElement;

let playSpy: ReturnType<typeof vi.spyOn>;
let pauseSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
	playSpy = vi
		.spyOn(HTMLMediaElement.prototype, "play")
		.mockResolvedValue(undefined);
	pauseSpy = vi
		.spyOn(HTMLMediaElement.prototype, "pause")
		.mockImplementation(() => {});
});

afterEach(() => {
	playSpy.mockRestore();
	pauseSpy.mockRestore();
});

describe("VideoSurface", () => {
	it("renders a <video> with the given src", () => {
		const { container } = render(<VideoSurface src="https://r2/get?sig=1" />);
		expect(getVideo(container)).toHaveAttribute("src", "https://r2/get?sig=1");
	});

	it("exposes the core controls with accessible names", () => {
		render(<VideoSurface src="https://r2/v" />);
		expect(screen.getByRole("button", { name: "Play" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Mute" })).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /enter fullscreen/i }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /playback speed/i }),
		).toBeInTheDocument();
		expect(screen.getByLabelText("Seek")).toBeInTheDocument();
		expect(screen.getByLabelText("Volume")).toBeInTheDocument();
	});

	it("starts playback when the video is clicked", () => {
		const { container } = render(<VideoSurface src="https://r2/v" />);
		fireEvent.click(getVideo(container));
		expect(playSpy).toHaveBeenCalled();
	});

	it("shows current and total time driven by media events", () => {
		const { container } = render(<VideoSurface src="https://r2/v" />);
		const video = getVideo(container);

		setMediaProp(video, "duration", 125);
		fireEvent.durationChange(video);
		setMediaProp(video, "currentTime", 65);
		fireEvent.timeUpdate(video);

		expect(screen.getByText("1:05 / 2:05")).toBeInTheDocument();
	});

	it("shows a loading spinner until the first frame is ready, then reveals the play overlay", () => {
		const { container } = render(<VideoSurface src="https://r2/v" />);
		const video = getVideo(container);

		// Before frame 0 decodes: spinner up, play overlay withheld.
		expect(
			screen.getByRole("status", { name: /buffering/i }),
		).toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: "Play video" }),
		).not.toBeInTheDocument();

		fireEvent.loadedData(video);
		expect(
			screen.queryByRole("status", { name: /buffering/i }),
		).not.toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Play video" }),
		).toBeInTheDocument();

		// A fresh src on the same element (e.g. preview→preview) resets readiness.
		fireEvent.loadStart(video);
		expect(
			screen.getByRole("status", { name: /buffering/i }),
		).toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: "Play video" }),
		).not.toBeInTheDocument();
	});

	it("toggles the buffering spinner on waiting then playing", () => {
		const { container } = render(<VideoSurface src="https://r2/v" />);
		const video = getVideo(container);

		// Reach the ready state first so the spinner reflects buffering, not load.
		fireEvent.loadedData(video);

		fireEvent.waiting(video);
		expect(screen.getByRole("status", { name: /buffering/i })).toBeInTheDocument();

		fireEvent.playing(video);
		expect(
			screen.queryByRole("status", { name: /buffering/i }),
		).not.toBeInTheDocument();
	});

	it("hides the centered play overlay once playback starts", () => {
		const { container } = render(<VideoSurface src="https://r2/v" />);
		const video = getVideo(container);
		fireEvent.loadedData(video); // overlay only shows once the frame is ready
		expect(
			screen.getByRole("button", { name: "Play video" }),
		).toBeInTheDocument();

		fireEvent.play(video);
		expect(
			screen.queryByRole("button", { name: "Play video" }),
		).not.toBeInTheDocument();
	});

	it("returns focus to the player after the center play button is clicked", () => {
		// The overlay button unmounts on play; focus must fall back to the player
		// container so keyboard shortcuts keep working.
		const { container } = render(<VideoSurface src="https://r2/v" />);
		fireEvent.loadedData(getVideo(container)); // reveal the overlay first
		const playerRegion = screen.getByRole("region", { name: "Video player" });

		fireEvent.click(screen.getByRole("button", { name: "Play video" }));

		expect(playerRegion).toHaveFocus();
	});

	it("returns focus to the player when the video body is clicked", () => {
		// Clicking the video itself (not the center overlay) also toggles play, so
		// it must return focus to the container too or shortcuts go dead.
		const { container } = render(<VideoSurface src="https://r2/v" />);
		const playerRegion = screen.getByRole("region", { name: "Video player" });

		fireEvent.click(getVideo(container));

		expect(playerRegion).toHaveFocus();
	});

	it("seeks the element when the scrub bar is dragged", () => {
		const { container } = render(<VideoSurface src="https://r2/v" />);
		const video = getVideo(container);
		setMediaProp(video, "duration", 100);
		fireEvent.durationChange(video);

		fireEvent.change(screen.getByLabelText("Seek"), { target: { value: "30" } });
		expect(video.currentTime).toBe(30);
	});

	it("mutes the element when the mute button is clicked", () => {
		const { container } = render(<VideoSurface src="https://r2/v" />);
		fireEvent.click(screen.getByRole("button", { name: "Mute" }));
		expect(getVideo(container).muted).toBe(true);
	});

	it("shows a forward skip indicator on ArrowRight without the buffering spinner", () => {
		const { container } = render(<VideoSurface src="https://r2/v" />);
		fireEvent.loadedData(getVideo(container)); // clear the initial-load spinner

		fireEvent.keyDown(screen.getByRole("region", { name: "Video player" }), {
			key: "ArrowRight",
		});

		expect(
			screen.getByRole("status", { name: /forward/i }),
		).toBeInTheDocument();
		expect(
			screen.queryByRole("status", { name: /buffering/i }),
		).not.toBeInTheDocument();
	});

	it("shows a rewind skip indicator on ArrowLeft", () => {
		const { container } = render(<VideoSurface src="https://r2/v" />);
		fireEvent.loadedData(getVideo(container));

		fireEvent.keyDown(screen.getByRole("region", { name: "Video player" }), {
			key: "ArrowLeft",
		});

		expect(screen.getByRole("status", { name: /rewind/i })).toBeInTheDocument();
	});

	it("suppresses the buffering spinner while a skip hint is active", () => {
		render(<VideoSurface src="https://r2/v" />);

		// Before the first frame decodes, the buffering spinner is up.
		expect(
			screen.getByRole("status", { name: /buffering/i }),
		).toBeInTheDocument();

		fireEvent.keyDown(screen.getByRole("region", { name: "Video player" }), {
			key: "ArrowRight",
		});

		expect(
			screen.queryByRole("status", { name: /buffering/i }),
		).not.toBeInTheDocument();
		expect(
			screen.getByRole("status", { name: /forward/i }),
		).toBeInTheDocument();
	});

	it("auto-dismisses the skip indicator after the timeout", () => {
		vi.useFakeTimers();
		try {
			const { container } = render(<VideoSurface src="https://r2/v" />);
			fireEvent.loadedData(getVideo(container));

			fireEvent.keyDown(screen.getByRole("region", { name: "Video player" }), {
				key: "ArrowRight",
			});
			expect(
				screen.getByRole("status", { name: /forward/i }),
			).toBeInTheDocument();

			act(() => {
				vi.advanceTimersByTime(600);
			});

			expect(
				screen.queryByRole("status", { name: /forward/i }),
			).not.toBeInTheDocument();
		} finally {
			vi.useRealTimers();
		}
	});
});

describe("VideoSurface progress reporting", () => {
	it("resumes to the saved position once metadata is ready", () => {
		const { container } = render(
			<VideoSurface src="https://r2/v" resumePositionSeconds={30} />,
		);
		const video = getVideo(container);
		setMediaProp(video, "duration", 100);
		Object.defineProperty(video, "currentTime", {
			configurable: true,
			writable: true,
			value: 0,
		});

		fireEvent.loadedMetadata(video);

		expect(video.currentTime).toBe(30);
	});

	it("reports position at most once per interval during playback", () => {
		const onReportPosition = vi.fn();
		const { container } = render(
			<VideoSurface src="https://r2/v" onReportPosition={onReportPosition} />,
		);
		const video = getVideo(container);
		setMediaProp(video, "duration", 600);
		fireEvent.durationChange(video);
		setMediaProp(video, "paused", false);

		setMediaProp(video, "currentTime", 12); // +12s from 0 → fires
		fireEvent.timeUpdate(video);
		setMediaProp(video, "currentTime", 20); // +8s → below interval, no fire
		fireEvent.timeUpdate(video);
		setMediaProp(video, "currentTime", 24); // +12s from last report → fires
		fireEvent.timeUpdate(video);

		expect(onReportPosition).toHaveBeenCalledTimes(2);
		expect(onReportPosition).toHaveBeenNthCalledWith(1, 12, { reason: "interval" });
		expect(onReportPosition).toHaveBeenNthCalledWith(2, 24, { reason: "interval" });
	});

	it("flushes the latest position on pause", () => {
		const onReportPosition = vi.fn();
		const { container } = render(
			<VideoSurface src="https://r2/v" onReportPosition={onReportPosition} />,
		);
		const video = getVideo(container);
		setMediaProp(video, "currentTime", 40);
		fireEvent.pause(video);
		expect(onReportPosition).toHaveBeenLastCalledWith(40, { reason: "pause" });
	});

	it("flushes on ended", () => {
		const onReportPosition = vi.fn();
		const { container } = render(
			<VideoSurface src="https://r2/v" onReportPosition={onReportPosition} />,
		);
		const video = getVideo(container);
		setMediaProp(video, "currentTime", 599);
		fireEvent.ended(video);
		expect(onReportPosition).toHaveBeenLastCalledWith(599, { reason: "ended" });
	});

	it("flushes on unmount", () => {
		const onReportPosition = vi.fn();
		const { container, unmount } = render(
			<VideoSurface src="https://r2/v" onReportPosition={onReportPosition} />,
		);
		const video = getVideo(container);
		setMediaProp(video, "currentTime", 55);
		unmount();
		expect(onReportPosition).toHaveBeenLastCalledWith(55, { reason: "unmount" });
	});

	it("does not flush a 0 position on unmount before playback advances", () => {
		const onReportPosition = vi.fn();
		const { container, unmount } = render(
			<VideoSurface src="https://r2/v" onReportPosition={onReportPosition} />,
		);
		const video = getVideo(container);
		setMediaProp(video, "currentTime", 0);
		unmount();
		expect(onReportPosition).not.toHaveBeenCalled();
	});
});
