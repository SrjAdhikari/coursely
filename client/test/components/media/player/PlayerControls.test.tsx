//* test/components/media/player/PlayerControls.test.tsx

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import PlayerControls from "@/components/media/player/PlayerControls";
import type { VideoControls } from "@/hooks/useVideoControls";

// jsdom doesn't back the DOM APIs Radix menus reach for while opening/focusing.
beforeEach(() => {
	Element.prototype.scrollIntoView = vi.fn();
	Element.prototype.hasPointerCapture = vi.fn(() => false);
	Element.prototype.setPointerCapture = vi.fn();
	Element.prototype.releasePointerCapture = vi.fn();
});

// Custom portal-target hosts we attach ourselves — RTL's auto-cleanup only removes
// containers it created, so tear these down between tests to avoid stale matches.
let hosts: HTMLElement[] = [];

afterEach(() => {
	hosts.forEach((host) => host.remove());
	hosts = [];
});

// A complete VideoControls stand-in: callbacks are spies, state is inert.
const makePlayer = (overrides: Partial<VideoControls> = {}): VideoControls => ({
	videoRef: { current: null },
	containerRef: { current: null },
	playing: false,
	currentTime: 0,
	duration: 0,
	bufferedEnd: 0,
	volume: 1,
	muted: false,
	rate: 1,
	isFullscreen: false,
	isBuffering: false,
	isReady: true,
	mediaError: false,
	skipHint: null,
	controlsVisible: true,
	togglePlay: vi.fn(),
	seekTo: vi.fn(),
	seekBy: vi.fn(),
	setVolume: vi.fn(),
	toggleMute: vi.fn(),
	setRate: vi.fn(),
	toggleFullscreen: vi.fn(),
	handleKeyDown: vi.fn(),
	revealControls: vi.fn(),
	hideControls: vi.fn(),
	...overrides,
});

// Point the player's containerRef at an attached node — standing in for the real
// player region that wraps the controls and serves as the fullscreen portal target.
const renderWithContainer = (player: VideoControls) => {
	const host = document.createElement("div");
	document.body.appendChild(host);
	hosts.push(host);
	player.containerRef.current = host;
	render(<PlayerControls player={player} />);
	return host;
};

describe("PlayerControls fullscreen menu placement", () => {
	it("portals the shortcuts popover into the player container while fullscreen", async () => {
		// Fullscreen shows only the container's subtree, so the menu must render
		// inside it or it lands off-screen and appears to vanish.
		const host = renderWithContainer(makePlayer({ isFullscreen: true }));

		await userEvent.click(
			screen.getByRole("button", { name: /keyboard shortcuts/i }),
		);
		const content = await screen.findByText(/play \/ pause/i);

		expect(host.contains(content)).toBe(true);
	});

	it("portals the playback-speed menu into the player container while fullscreen", async () => {
		const host = renderWithContainer(makePlayer({ isFullscreen: true }));

		await userEvent.click(
			screen.getByRole("button", { name: /playback speed/i }),
		);
		const label = await screen.findByText("Playback speed");

		expect(host.contains(label)).toBe(true);
	});

	it("keeps menus in the document body, not the container, when not fullscreen", async () => {
		// Windowed mode portals to body so the container's overflow can't clip the menu.
		const host = renderWithContainer(makePlayer({ isFullscreen: false }));

		await userEvent.click(
			screen.getByRole("button", { name: /keyboard shortcuts/i }),
		);
		const content = await screen.findByText(/play \/ pause/i);

		expect(host.contains(content)).toBe(false);
		expect(document.body.contains(content)).toBe(true);
	});
});
