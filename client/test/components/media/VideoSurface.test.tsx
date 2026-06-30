//* test/components/media/VideoSurface.test.tsx

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

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

	it("toggles the buffering spinner on waiting then playing", () => {
		const { container } = render(<VideoSurface src="https://r2/v" />);
		const video = getVideo(container);

		fireEvent.waiting(video);
		expect(screen.getByRole("status", { name: /buffering/i })).toBeInTheDocument();

		fireEvent.playing(video);
		expect(
			screen.queryByRole("status", { name: /buffering/i }),
		).not.toBeInTheDocument();
	});

	it("hides the centered play overlay once playback starts", () => {
		const { container } = render(<VideoSurface src="https://r2/v" />);
		expect(
			screen.getByRole("button", { name: "Play video" }),
		).toBeInTheDocument();

		fireEvent.play(getVideo(container));
		expect(
			screen.queryByRole("button", { name: "Play video" }),
		).not.toBeInTheDocument();
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
});
