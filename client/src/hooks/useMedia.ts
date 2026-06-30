//* src/hooks/useMedia.ts

import { useQuery } from "@tanstack/react-query";

import { getLessonPlaybackUrl } from "@/api/media.api";
import { lessonPlaybackKey } from "@/lib/queryKeys";

/**
 * Fetch a fresh signed playback URL for a lesson. The signed URL is short-lived
 * (~1h) and meant per-open, so we never cache it (gcTime 0) and always refetch
 * on mount — a stale cached URL would 403 once it expires.
 */
const useLessonPlaybackUrl = (lessonId: string) =>
	useQuery({
		queryKey: lessonPlaybackKey(lessonId),
		queryFn: () => getLessonPlaybackUrl(lessonId),
		enabled: !!lessonId,
		gcTime: 0,
		staleTime: 0,
		refetchOnMount: "always",
	});

export { useLessonPlaybackUrl };
