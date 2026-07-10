//* src/components/media/VideoSurface.tsx

import PlayerControls from "@/components/media/player/PlayerControls";
import PlayerOverlays from "@/components/media/player/PlayerOverlays";

import useVideoControls, {
	type ReportPositionHandler,
} from "@/hooks/useVideoControls";

interface VideoSurfaceProps {
	src: string;
	poster?: string;
	resumePositionSeconds?: number;
	onReportPosition?: ReportPositionHandler;
	onRetry?: () => void;
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
	onRetry,
}: VideoSurfaceProps) => {
	const player = useVideoControls({ resumePositionSeconds, onReportPosition });
	const { videoRef, containerRef } = player;

	// Refocus the container after toggling so keyboard shortcuts keep working.
	const handleSurfaceToggle = () => {
		player.togglePlay();
		containerRef.current?.focus();
	};

	return (
		<div
			ref={containerRef}
			tabIndex={0}
			role="region"
			aria-label="Video player"
			onKeyDown={player.handleKeyDown}
			onMouseMove={player.revealControls}
			onMouseLeave={() => player.playing && player.hideControls()}
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

			<PlayerOverlays
				player={player}
				onRetry={onRetry}
				onTogglePlay={handleSurfaceToggle}
			/>

			<PlayerControls player={player} />
		</div>
	);
};

export default VideoSurface;
