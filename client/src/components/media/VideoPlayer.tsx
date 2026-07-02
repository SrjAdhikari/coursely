//* src/components/media/VideoPlayer.tsx

import { useLessonPlaybackUrl } from "@/hooks/useMedia";
import Loader from "@/components/Loader";
import VideoSurface from "@/components/media/VideoSurface";
import type { ReportPositionHandler } from "@/hooks/useVideoControls";

interface VideoPlayerProps {
	lessonId: string;
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
	resumePositionSeconds,
	onReportPosition,
}: VideoPlayerProps) => {
	const { data, isLoading, isError, error } = useLessonPlaybackUrl(lessonId);

	if (isLoading) return <Loader className="aspect-video" />;

	if (isError || !data) {
		const message =
			error?.code === "VIDEO_NOT_FOUND"
				? "This lesson has no video yet."
				: "Couldn't load the video. Please try again.";
		return (
			<div className="flex aspect-video items-center justify-center rounded-lg border border-border bg-muted/40 p-4 text-center text-sm text-muted-foreground">
				{message}
			</div>
		);
	}

	return (
		<VideoSurface
			src={data.data.url}
			resumePositionSeconds={resumePositionSeconds}
			onReportPosition={onReportPosition}
		/>
	);
};

export default VideoPlayer;
