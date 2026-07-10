//* src/components/media/VideoSurface.tsx

import {
	Play,
	Pause,
	Volume2,
	VolumeX,
	Maximize,
	Minimize,
	Gauge,
	Loader2,
	ChevronsLeft,
	ChevronsRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";

import {
	useVideoControls,
	type ReportPositionHandler,
	SEEK_STEP_SECONDS,
} from "@/hooks/useVideoControls";
import { formatTime, clamp } from "@/lib/playerHelpers";
import { cn } from "@/lib/utils";

const PLAYBACK_RATES = [0.5, 1, 1.25, 1.5, 2] as const;

interface VideoSurfaceProps {
	src: string;
	poster?: string;
	resumePositionSeconds?: number;
	onReportPosition?: ReportPositionHandler;
}

/**
 * Presentational rich player: a native `<video>` under a custom YouTube-style
 * control layer. Takes a plain `src`, so it renders without the playback query —
 * all imperative wiring lives in `useVideoControls`.
 */
const VideoSurface = ({
	src,
	poster,
	resumePositionSeconds,
	onReportPosition,
}: VideoSurfaceProps) => {
	const {
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
		isReady,
		skipHint,
		controlsVisible,
		togglePlay,
		seekTo,
		setVolume,
		toggleMute,
		setRate,
		toggleFullscreen,
		handleKeyDown,
		revealControls,
		hideControls,
	} = useVideoControls({ resumePositionSeconds, onReportPosition });

	const playedPercent =
		duration > 0 ? clamp((currentTime / duration) * 100, 0, 100) : 0;
	const bufferedPercent =
		duration > 0 ? clamp((bufferedEnd / duration) * 100, 0, 100) : 0;
	const isSilent = muted || volume === 0;

	// Refocus the container after toggling so keyboard shortcuts keep working.
	const handleSurfaceToggle = () => {
		togglePlay();
		containerRef.current?.focus();
	};

	return (
		<div
			ref={containerRef}
			tabIndex={0}
			role="region"
			aria-label="Video player"
			onKeyDown={handleKeyDown}
			onMouseMove={revealControls}
			onMouseLeave={() => playing && hideControls()}
			className="group/player relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-black outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
		>
			<video
				ref={videoRef}
				src={src}
				poster={poster}
				onClick={handleSurfaceToggle}
				playsInline
				className="h-full w-full cursor-pointer"
			/>

			{(!isReady || isBuffering) && !skipHint && (
				<div
					role="status"
					aria-label="Buffering"
					className="pointer-events-none absolute inset-0 grid place-items-center"
				>
					<Loader2 className="size-8 animate-spin text-white/90" aria-hidden />
				</div>
			)}

			{skipHint && (
				<div
					key={skipHint.nonce}
					role="status"
					aria-label={
						skipHint.direction === "forward"
							? `Forward ${SEEK_STEP_SECONDS} seconds`
							: `Rewind ${SEEK_STEP_SECONDS} seconds`
					}
					className={cn(
						"pointer-events-none absolute inset-y-0 grid w-2/5 place-items-center",
						skipHint.direction === "forward" ? "right-0" : "left-0",
					)}
				>
					<div className="grid size-15 animate-in fade-in zoom-in-95 place-items-center rounded-full bg-black/55 text-white backdrop-blur-sm duration-200">
						{skipHint.direction === "forward" ? (
							<ChevronsRight className="size-8" aria-hidden />
						) : (
							<ChevronsLeft className="size-8" aria-hidden />
						)}
					</div>
				</div>
			)}

			{isReady && !playing && !isBuffering && !skipHint && (
				<button
					type="button"
					aria-label="Play video"
					onClick={handleSurfaceToggle}
					className="absolute top-1/2 left-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-black/55 text-white backdrop-blur-sm transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:outline-none"
				>
					<Play className="size-7 translate-x-0.5 fill-current" aria-hidden />
				</button>
			)}

			<div
				className={cn(
					"absolute inset-x-0 bottom-0 flex flex-col gap-2 bg-linear-to-t from-black/80 via-black/40 to-transparent px-3 pt-10 pb-2.5 text-white transition-opacity duration-200",
					controlsVisible || !playing
						? "opacity-100"
						: "pointer-events-none invisible opacity-0",
				)}
			>
				{/* Scrub bar: buffered + played track with a thumb under a transparent range. */}
				<div className="relative flex h-3 items-center">
					<div className="absolute h-1.5 w-full rounded-full bg-white/25" />
					<div
						className="absolute h-1.5 rounded-full bg-white/40"
						style={{ width: `${bufferedPercent}%` }}
					/>

					<div
						className="absolute h-1.5 rounded-full bg-primary"
						style={{ width: `${playedPercent}%` }}
					/>

					<div
						className="pointer-events-none absolute size-3 -translate-x-1/2 rounded-full bg-primary shadow"
						style={{ left: `${playedPercent}%` }}
					/>

					<input
						type="range"
						aria-label="Seek"
						min={0}
						max={duration || 0}
						step="any"
						value={currentTime}
						onChange={(event) => seekTo(Number(event.target.value))}
						className="absolute inset-0 m-0 w-full cursor-pointer appearance-none bg-transparent opacity-0"
					/>
				</div>

				<div className="flex items-center gap-2">
					<Button
						type="button"
						variant="ghost"
						size="icon-sm"
						aria-label={playing ? "Pause" : "Play"}
						onClick={togglePlay}
						className="text-white hover:bg-white/15 hover:text-white"
					>
						{playing ? <Pause /> : <Play />}
					</Button>

					<Button
						type="button"
						variant="ghost"
						size="icon-sm"
						aria-label={isSilent ? "Unmute" : "Mute"}
						onClick={toggleMute}
						className="text-white hover:bg-white/15 hover:text-white"
					>
						{isSilent ? <VolumeX /> : <Volume2 />}
					</Button>

					<input
						type="range"
						aria-label="Volume"
						min={0}
						max={1}
						step={0.05}
						value={isSilent ? 0 : volume}
						onChange={(event) => setVolume(Number(event.target.value))}
						className="h-1 w-16 cursor-pointer accent-primary"
					/>

					<span className="ml-1 text-xs tabular-nums text-white/90">
						{`${formatTime(currentTime)} / ${formatTime(duration)}`}
					</span>

					<div className="ml-auto flex items-center gap-1">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									type="button"
									variant="ghost"
									size="icon-sm"
									aria-label="Playback speed"
									className="gap-1 px-1.5 text-xs text-white hover:bg-white/15 hover:text-white"
								>
									<Gauge />
									<span className="tabular-nums">{rate}×</span>
								</Button>
							</DropdownMenuTrigger>

							<DropdownMenuContent align="end" className="min-w-28">
								<DropdownMenuLabel>Playback speed</DropdownMenuLabel>
								<DropdownMenuRadioGroup
									value={String(rate)}
									onValueChange={(value) => setRate(Number(value))}
								>
									{PLAYBACK_RATES.map((option) => (
										<DropdownMenuRadioItem key={option} value={String(option)}>
											{option === 1 ? "Normal" : `${option}×`}
										</DropdownMenuRadioItem>
									))}
								</DropdownMenuRadioGroup>
							</DropdownMenuContent>
						</DropdownMenu>

						<Button
							type="button"
							variant="ghost"
							size="icon-sm"
							aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
							onClick={toggleFullscreen}
							className="text-white hover:bg-white/15 hover:text-white"
						>
							{isFullscreen ? <Minimize /> : <Maximize />}
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default VideoSurface;
