//* src/components/media/player/PlayerOverlays.tsx

import {
	Loader2,
	TriangleAlert,
	ChevronsLeft,
	ChevronsRight,
	Play,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	SEEK_STEP_SECONDS,
	type VideoControls,
} from "@/hooks/useVideoControls";
import { cn } from "@/lib/utils";

interface PlayerOverlaysProps {
	player: VideoControls;
	onRetry?: () => void;
	onTogglePlay: () => void;
}

/** Transient status overlays: buffering, media error, skip hint, center play. */
const PlayerOverlays = ({
	player,
	onRetry,
	onTogglePlay,
}: PlayerOverlaysProps) => {
	const { isReady, isBuffering, mediaError, skipHint, playing } = player;

	return (
		<>
			{(!isReady || isBuffering) && !skipHint && !mediaError && (
				<div
					role="status"
					aria-label="Buffering"
					className="pointer-events-none absolute inset-0 grid place-items-center"
				>
					<Loader2 className="size-8 animate-spin text-white/90" aria-hidden />
				</div>
			)}

			{mediaError && (
				<div
					role="alert"
					className="pointer-events-none absolute inset-0 z-10 grid place-items-center bg-black/70 px-4 text-center"
				>
					<div className="pointer-events-auto flex flex-col items-center gap-3 text-white">
						<TriangleAlert className="size-8 text-white/90" aria-hidden />
						<p className="text-sm text-white/90">Couldn't load the video.</p>

						{onRetry && (
							<Button
								type="button"
								variant="secondary"
								size="sm"
								onClick={onRetry}
							>
								Try again
							</Button>
						)}
					</div>
				</div>
			)}

			{skipHint && !mediaError && (
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

			{isReady && !playing && !isBuffering && !skipHint && !mediaError && (
				<button
					type="button"
					aria-label="Play video"
					onClick={onTogglePlay}
					className="absolute top-1/2 left-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-black/55 text-white backdrop-blur-sm transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:outline-none"
				>
					<Play className="size-7 translate-x-0.5 fill-current" aria-hidden />
				</button>
			)}
		</>
	);
};

export default PlayerOverlays;
