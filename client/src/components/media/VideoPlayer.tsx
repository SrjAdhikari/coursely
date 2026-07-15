//* src/components/media/VideoPlayer.tsx

import { useLessonPlaybackUrl } from "@/hooks/useMedia";
import VideoLoading from "@/components/media/VideoLoading";
import VideoSurface from "@/components/media/VideoSurface";
import { Button } from "@/components/ui/button";
import type { ReportPositionHandler } from "@/hooks/useVideoControls";

interface VideoPlayerProps {
	lessonId: string;
	poster?: string;
	resumePositionSeconds?: number;
	onReportPosition?: ReportPositionHandler;
}

/**
 * Plays a lesson video from a freshly-minted signed URL. Gating is enforced
 * server-side (preview = ungated, paid = enrollment, admin bypasses). Fetches a
 * new URL per mount because the signed URL is short-lived.
 */
const VideoPlayer = ({
	lessonId,
	poster,
	resumePositionSeconds,
	onReportPosition,
}: VideoPlayerProps) => {
	const { data, isLoading, isError, error, refetch } =
		useLessonPlaybackUrl(lessonId);

	if (isLoading) return <VideoLoading />;

	if (isError || !data) {
		// A missing video isn't retryable; only offer retry for transient failures.
		const isMissing = error?.code === "VIDEO_NOT_FOUND";
		const message = isMissing
			? "This lesson has no video yet."
			: "Couldn't load the video. Please try again.";

		return (
			<div className="flex aspect-video flex-col items-center justify-center gap-3 rounded-lg border border-border bg-muted/40 p-4 text-center text-sm text-muted-foreground">
				<p>{message}</p>
				{!isMissing && (
					<Button
						type="button"
						variant="secondary"
						size="sm"
						onClick={() => refetch()}
					>
						Try again
					</Button>
				)}
			</div>
		);
	}

	return (
		<VideoSurface
			src={data.data.url}
			poster={poster}
			resumePositionSeconds={resumePositionSeconds}
			onReportPosition={onReportPosition}
			onRetry={() => refetch()}
		/>
	);
};

export default VideoPlayer;
