//* src/components/media/VideoLoading.tsx

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Full-frame video loading state. Uses the same spinner as the in-player
 * buffering overlay so fetching the signed URL and buffering the video read as
 * one continuous loader — not two different spinners before playback.
 */
const VideoLoading = ({ className }: { className?: string }) => (
	<div
		role="status"
		aria-label="Loading"
		className={cn(
			"grid aspect-video place-items-center rounded-lg bg-black",
			className,
		)}
	>
		<Loader2 className="size-8 animate-spin text-white/90" aria-hidden />
	</div>
);

export default VideoLoading;
