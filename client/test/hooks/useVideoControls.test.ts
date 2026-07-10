//* test/hooks/useVideoControls.test.ts

import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";

import useVideoControls from "@/hooks/useVideoControls";

// A stand-in for the HTMLVideoElement jsdom can't drive; spies stand in for the
// playback methods and plain fields stand in for the media properties.
const fakeVideo = (overrides: Record<string, unknown> = {}) => ({
	paused: true,
	currentTime: 0,
	duration: 100,
	volume: 1,
	muted: false,
	playbackRate: 1,
	play: vi.fn().mockResolvedValue(undefined),
	pause: vi.fn(),
	...overrides,
});

const mountWithVideo = (video: ReturnType<typeof fakeVideo>) => {
	const rendered = renderHook(() => useVideoControls());
	act(() => {
		rendered.result.current.videoRef.current =
			video as unknown as HTMLVideoElement;
	});
	return rendered;
};

describe("useVideoControls", () => {
	it("plays when paused and pauses when playing", () => {
		const paused = fakeVideo({ paused: true });
		const { result } = mountWithVideo(paused);
		act(() => result.current.togglePlay());
		expect(paused.play).toHaveBeenCalled();

		const playing = fakeVideo({ paused: false });
		const second = mountWithVideo(playing);
		act(() => second.result.current.togglePlay());
		expect(playing.pause).toHaveBeenCalled();
	});

	it("seekBy moves the play head and clamps to [0, duration]", () => {
		const video = fakeVideo({ currentTime: 0, duration: 100 });
		const { result } = mountWithVideo(video);

		act(() => result.current.seekBy(5));
		expect(video.currentTime).toBe(5);

		act(() => result.current.seekBy(-999));
		expect(video.currentTime).toBe(0);

		act(() => result.current.seekBy(999));
		expect(video.currentTime).toBe(100);
	});

	it("seekTo jumps to an absolute, clamped position", () => {
		const video = fakeVideo({ duration: 100 });
		const { result } = mountWithVideo(video);
		act(() => result.current.seekTo(42));
		expect(video.currentTime).toBe(42);
		act(() => result.current.seekTo(500));
		expect(video.currentTime).toBe(100);
	});

	it("setVolume clamps to [0, 1] and unmutes when audible", () => {
		const video = fakeVideo({ volume: 0, muted: true });
		const { result } = mountWithVideo(video);
		act(() => result.current.setVolume(0.5));
		expect(video.volume).toBe(0.5);
		expect(video.muted).toBe(false);
		act(() => result.current.setVolume(2));
		expect(video.volume).toBe(1);
	});

	it("toggleMute flips the muted flag", () => {
		const video = fakeVideo({ muted: false });
		const { result } = mountWithVideo(video);
		act(() => result.current.toggleMute());
		expect(video.muted).toBe(true);
		act(() => result.current.toggleMute());
		expect(video.muted).toBe(false);
	});

	it("setRate applies the rate to the element and to state", () => {
		const video = fakeVideo();
		const { result } = mountWithVideo(video);
		act(() => result.current.setRate(1.5));
		expect(video.playbackRate).toBe(1.5);
		expect(result.current.rate).toBe(1.5);
	});

	it("handleKeyDown maps Space/arrows/m to playback actions", () => {
		const video = fakeVideo({ currentTime: 50, duration: 100, volume: 0.5 });
		const { result } = mountWithVideo(video);
		const press = (key: string, tagName = "DIV") => {
			const preventDefault = vi.fn();
			act(() =>
				result.current.handleKeyDown({
					key,
					target: { tagName },
					preventDefault,
				} as unknown as React.KeyboardEvent),
			);
			return preventDefault;
		};

		const spacePrevent = press(" ");
		expect(video.play).toHaveBeenCalled();
		expect(spacePrevent).toHaveBeenCalled();

		press("ArrowRight");
		expect(video.currentTime).toBe(55);
		press("ArrowLeft");
		expect(video.currentTime).toBe(50);

		press("ArrowUp");
		expect(video.volume).toBeCloseTo(0.6);
		press("ArrowDown");
		expect(video.volume).toBeCloseTo(0.5);

		press("m");
		expect(video.muted).toBe(true);
	});

	it("handleKeyDown ignores Space while a button is focused", () => {
		const video = fakeVideo();
		const { result } = mountWithVideo(video);
		act(() =>
			result.current.handleKeyDown({
				key: " ",
				target: { tagName: "BUTTON" },
				preventDefault: vi.fn(),
			} as unknown as React.KeyboardEvent),
		);
		expect(video.play).not.toHaveBeenCalled();
	});

	it("toggleFullscreen requests fullscreen on the container when not in it", () => {
		const requestFullscreen = vi.fn();
		const { result } = renderHook(() => useVideoControls());
		act(() => {
			result.current.containerRef.current = {
				requestFullscreen,
			} as unknown as HTMLDivElement;
		});
		act(() => result.current.toggleFullscreen());
		expect(requestFullscreen).toHaveBeenCalled();
	});
});
