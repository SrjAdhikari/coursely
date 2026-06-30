//* src/hooks/useVideoControls.ts

import {
	useCallback,
	useEffect,
	useRef,
	useState,
	type KeyboardEvent,
} from "react";

import { clamp } from "@/lib/playerHelpers";

const SEEK_STEP_SECONDS = 5;
const VOLUME_STEP = 0.1;
const CONTROLS_IDLE_MS = 2500;

/**
 * Owns the imperative bridge to a native `<video>`: it holds the element/container
 * refs, mirrors media state into React via element events, and exposes plain
 * actions (play, seek, volume, rate, fullscreen, keyboard). Keeping it here makes
 * the surface component thin and lets the logic be unit-tested without a query.
 */
export const useVideoControls = () => {
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const containerRef = useRef<HTMLDivElement | null>(null);
	const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const [playing, setPlaying] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [bufferedEnd, setBufferedEnd] = useState(0);
	const [volume, setVolumeState] = useState(1);
	const [muted, setMuted] = useState(false);
	const [rate, setRateState] = useState(1);
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [isBuffering, setIsBuffering] = useState(false);
	const [controlsVisible, setControlsVisible] = useState(true);

	// --- Auto-hide: reveal on activity, fade out after idle while playing. ---
	const hideControls = useCallback(() => {
		if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
		setControlsVisible(false);
	}, []);

	const revealControls = useCallback(() => {
		if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
		setControlsVisible(true);
		// Only schedule a hide while actually playing — paused keeps controls up.
		if (videoRef.current && !videoRef.current.paused) {
			hideTimerRef.current = setTimeout(
				() => setControlsVisible(false),
				CONTROLS_IDLE_MS,
			);
		}
	}, []);

	// --- Imperative actions (operate on the live element, read at call time). ---
	const togglePlay = useCallback(() => {
		const video = videoRef.current;
		if (!video) return;
		if (video.paused) void video.play();
		else video.pause();
	}, []);

	const seekTo = useCallback((seconds: number) => {
		const video = videoRef.current;
		if (!video) return;
		video.currentTime = clamp(seconds, 0, video.duration || 0);
	}, []);

	const seekBy = useCallback(
		(delta: number) => {
			const video = videoRef.current;
			if (!video) return;
			seekTo(video.currentTime + delta);
		},
		[seekTo],
	);

	const setVolume = useCallback((value: number) => {
		const video = videoRef.current;
		if (!video) return;
		const next = clamp(value, 0, 1);
		video.volume = next;
		video.muted = next === 0;
	}, []);

	const toggleMute = useCallback(() => {
		const video = videoRef.current;
		if (!video) return;
		video.muted = !video.muted;
	}, []);

	const setRate = useCallback((value: number) => {
		const video = videoRef.current;
		if (video) video.playbackRate = value;
		setRateState(value);
	}, []);

	const toggleFullscreen = useCallback(() => {
		const container = containerRef.current;
		if (!container) return;
		if (document.fullscreenElement) void document.exitFullscreen?.();
		else void container.requestFullscreen?.();
	}, []);

	const handleKeyDown = useCallback(
		(event: KeyboardEvent) => {
			const target = event.target as HTMLElement | null;
			const onButton = target?.tagName === "BUTTON";
			const video = videoRef.current;

			switch (event.key) {
				case " ":
				case "k":
					if (onButton) return; // let a focused control activate itself
					event.preventDefault();
					togglePlay();
					break;
				case "ArrowRight":
					event.preventDefault();
					seekBy(SEEK_STEP_SECONDS);
					break;
				case "ArrowLeft":
					event.preventDefault();
					seekBy(-SEEK_STEP_SECONDS);
					break;
				case "ArrowUp":
					event.preventDefault();
					setVolume((video?.volume ?? 0) + VOLUME_STEP);
					break;
				case "ArrowDown":
					event.preventDefault();
					setVolume((video?.volume ?? 0) - VOLUME_STEP);
					break;
				case "m":
					toggleMute();
					break;
				case "f":
					toggleFullscreen();
					break;
			}
		},
		[togglePlay, seekBy, setVolume, toggleMute, toggleFullscreen],
	);

	// --- Mirror media element state into React via its events. ---
	useEffect(() => {
		const video = videoRef.current;
		if (!video) return;

		const onPlay = () => {
			setPlaying(true);
			revealControls();
		};
		const onPause = () => {
			setPlaying(false);
			revealControls();
		};
		const onTimeUpdate = () => setCurrentTime(video.currentTime);
		const onDurationChange = () =>
			setDuration(Number.isFinite(video.duration) ? video.duration : 0);
		const onProgress = () => {
			const ranges = video.buffered;
			setBufferedEnd(ranges.length ? ranges.end(ranges.length - 1) : 0);
		};
		const onVolumeChange = () => {
			setVolumeState(video.volume);
			setMuted(video.muted);
		};
		const onRateChange = () => setRateState(video.playbackRate);
		const onWaiting = () => setIsBuffering(true);
		const onPlaying = () => {
			setIsBuffering(false);
			setPlaying(true);
		};
		const onSeeking = () => setIsBuffering(true);
		const onSeeked = () => setIsBuffering(false);

		video.addEventListener("play", onPlay);
		video.addEventListener("pause", onPause);
		video.addEventListener("timeupdate", onTimeUpdate);
		video.addEventListener("durationchange", onDurationChange);
		video.addEventListener("loadedmetadata", onDurationChange);
		video.addEventListener("progress", onProgress);
		video.addEventListener("volumechange", onVolumeChange);
		video.addEventListener("ratechange", onRateChange);
		video.addEventListener("waiting", onWaiting);
		video.addEventListener("playing", onPlaying);
		video.addEventListener("seeking", onSeeking);
		video.addEventListener("seeked", onSeeked);

		return () => {
			video.removeEventListener("play", onPlay);
			video.removeEventListener("pause", onPause);
			video.removeEventListener("timeupdate", onTimeUpdate);
			video.removeEventListener("durationchange", onDurationChange);
			video.removeEventListener("loadedmetadata", onDurationChange);
			video.removeEventListener("progress", onProgress);
			video.removeEventListener("volumechange", onVolumeChange);
			video.removeEventListener("ratechange", onRateChange);
			video.removeEventListener("waiting", onWaiting);
			video.removeEventListener("playing", onPlaying);
			video.removeEventListener("seeking", onSeeking);
			video.removeEventListener("seeked", onSeeked);
		};
	}, [revealControls]);

	// Track fullscreen changes scoped to this player's container.
	useEffect(() => {
		const onFullscreenChange = () =>
			setIsFullscreen(document.fullscreenElement === containerRef.current);
		document.addEventListener("fullscreenchange", onFullscreenChange);
		return () =>
			document.removeEventListener("fullscreenchange", onFullscreenChange);
	}, []);

	// Clear any pending auto-hide timer on unmount.
	useEffect(
		() => () => {
			if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
		},
		[],
	);

	return {
		videoRef,
		containerRef,
		playing,
		currentTime,
		duration,
		bufferedEnd,
		volume,
		muted,
		rate,
		isFullscreen,
		isBuffering,
		controlsVisible,
		togglePlay,
		seekTo,
		seekBy,
		setVolume,
		toggleMute,
		setRate,
		toggleFullscreen,
		handleKeyDown,
		revealControls,
		hideControls,
	};
};
